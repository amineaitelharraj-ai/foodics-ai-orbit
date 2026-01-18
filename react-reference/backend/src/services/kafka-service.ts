/**
 * Kafka Service for Fraud Detection
 * 
 * Handles event streaming between POS devices and the fraud detection engine.
 * Implements the architecture: POS → Event Proxy → Kafka → Fraud Decision Service
 */

import { Kafka, Producer, Consumer, KafkaMessage, EachMessagePayload } from 'kafkajs';
import { EventEmitter } from 'events';
import { POSEvent, ValidatedPOSEvent, FraudFlag, APIResponse } from '../types/fraud-events';
import { Logger } from '../utils/logger';
import { FraudDetectionService } from './fraud-detection-service';

export interface KafkaConfig {
  brokers: string[];
  clientId: string;
  consumerGroupId: string;
  topics: {
    fraudEventsRaw: string;
    fraudFlags: string;
  };
  retries?: number;
  retryDelayMs?: number;
  batchSize?: number;
  sessionTimeoutMs?: number;
  heartbeatIntervalMs?: number;
}

export interface EventProcessingStats {
  totalProcessed: number;
  totalFailed: number;
  averageProcessingTimeMs: number;
  lastProcessedAt?: Date;
  currentBacklog: number;
}

/**
 * Kafka Service for handling fraud event streaming
 * Provides both producer and consumer functionality with proper error handling
 */
export class KafkaService extends EventEmitter {
  private kafka: Kafka;
  private producer: Producer | null = null;
  private consumer: Consumer | null = null;
  private logger: Logger;
  private fraudDetectionService: FraudDetectionService;
  private config: KafkaConfig;
  private isConnected: boolean = false;
  private stats: EventProcessingStats;
  private processingTimes: number[] = [];
  private maxProcessingTimes: number = 100; // Keep last 100 processing times for average

  constructor(
    config: KafkaConfig,
    fraudDetectionService: FraudDetectionService,
    logger: Logger
  ) {
    super();
    this.config = config;
    this.fraudDetectionService = fraudDetectionService;
    this.logger = logger;
    
    // Initialize Kafka client
    this.kafka = new Kafka({
      clientId: config.clientId,
      brokers: config.brokers,
      retry: {
        retries: config.retries || 5,
        initialRetryTime: config.retryDelayMs || 1000,
        maxRetryTime: 30000,
      },
      connectionTimeout: 10000,
      requestTimeout: 30000,
    });

    // Initialize processing stats
    this.stats = {
      totalProcessed: 0,
      totalFailed: 0,
      averageProcessingTimeMs: 0,
      currentBacklog: 0
    };

    this.setupEventHandlers();
  }

  /**
   * Initialize and connect Kafka producer and consumer
   */
  async initialize(): Promise<void> {
    try {
      this.logger.info('Initializing Kafka service...', {
        brokers: this.config.brokers,
        clientId: this.config.clientId
      });

      // Initialize producer
      this.producer = this.kafka.producer({
        maxInFlightRequests: 1,
        idempotent: true,
        transactionTimeout: 30000,
        retry: {
          retries: this.config.retries || 5
        }
      });

      // Initialize consumer
      this.consumer = this.kafka.consumer({
        groupId: this.config.consumerGroupId,
        sessionTimeout: this.config.sessionTimeoutMs || 30000,
        heartbeatInterval: this.config.heartbeatIntervalMs || 3000,
        allowAutoTopicCreation: true,
        retry: {
          retries: this.config.retries || 5
        }
      });

      // Connect to Kafka
      await this.connect();
      
      this.logger.info('Kafka service initialized successfully');
      this.emit('initialized');
      
    } catch (error) {
      this.logger.error('Failed to initialize Kafka service', error as Error);
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Connect producer and consumer to Kafka
   */
  private async connect(): Promise<void> {
    try {
      if (this.producer) {
        await this.producer.connect();
        this.logger.info('Kafka producer connected');
      }

      if (this.consumer) {
        await this.consumer.connect();
        
        // Subscribe to fraud events topic
        await this.consumer.subscribe({
          topic: this.config.topics.fraudEventsRaw,
          fromBeginning: false // Only process new events
        });

        this.logger.info('Kafka consumer connected and subscribed', {
          topic: this.config.topics.fraudEventsRaw
        });
      }

      this.isConnected = true;
      this.emit('connected');
      
    } catch (error) {
      this.logger.error('Failed to connect to Kafka', error as Error);
      throw error;
    }
  }

  /**
   * Start consuming fraud events from Kafka
   */
  async startConsuming(): Promise<void> {
    if (!this.consumer || !this.isConnected) {
      throw new Error('Consumer not initialized or not connected');
    }

    try {
      await this.consumer.run({
        eachMessage: this.processMessage.bind(this),
        eachBatch: async ({ batch, heartbeat, isRunning, isStale }) => {
          this.logger.debug('Processing batch', {
            topic: batch.topic,
            partition: batch.partition,
            messageCount: batch.messages.length
          });

          for (const message of batch.messages) {
            if (!isRunning() || isStale()) break;
            
            await this.processMessage({
              topic: batch.topic,
              partition: batch.partition,
              message,
              heartbeat
            } as EachMessagePayload);
          }
        }
      });

      this.logger.info('Started consuming fraud events');
      this.emit('consuming');
      
    } catch (error) {
      this.logger.error('Failed to start consuming', error as Error);
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Process individual fraud event message
   */
  private async processMessage(payload: EachMessagePayload): Promise<void> {
    const { topic, partition, message } = payload;
    const startTime = Date.now();

    try {
      if (!message.value) {
        this.logger.warn('Received empty message', { topic, partition, offset: message.offset });
        return;
      }

      // Parse the POS event
      const eventData = JSON.parse(message.value.toString()) as POSEvent;
      
      this.logger.debug('Processing fraud event', {
        eventId: eventData.eventId,
        eventType: eventData.eventType,
        branchId: eventData.branchId,
        cashierId: eventData.cashierId
      });

      // Validate and enrich the event
      const validatedEvent = await this.validateAndEnrichEvent(eventData);

      // Process through fraud detection engine
      const fraudDetectionResult = await this.fraudDetectionService.processEvent(validatedEvent);

      // If fraud flags are generated, publish them
      if (fraudDetectionResult.flagsGenerated > 0) {
        await this.publishFraudFlags(fraudDetectionResult.results, validatedEvent);
      }

      // Update processing statistics
      this.updateProcessingStats(startTime, true);

      this.logger.debug('Event processed successfully', {
        eventId: eventData.eventId,
        processingTimeMs: Date.now() - startTime,
        flagsGenerated: fraudDetectionResult.flagsGenerated
      });

      this.emit('eventProcessed', {
        event: validatedEvent,
        result: fraudDetectionResult,
        processingTimeMs: Date.now() - startTime
      });

    } catch (error) {
      this.updateProcessingStats(startTime, false);
      
      this.logger.error('Failed to process fraud event', {
        topic,
        partition,
        offset: message.offset,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      this.emit('processingError', {
        message,
        error,
        processingTimeMs: Date.now() - startTime
      });

      // Optionally publish to dead letter queue for failed events
      await this.handleFailedEvent(message, error);
    }
  }

  /**
   * Validate and enrich POS event with computed fields
   */
  private async validateAndEnrichEvent(event: POSEvent): Promise<ValidatedPOSEvent> {
    const now = new Date();
    const latencySeconds = (now.getTime() - new Date(event.createdAt).getTime()) / 1000;

    return {
      ...event,
      latencySeconds,
      processedAt: now,
      // Add validation errors if any
      validationErrors: this.validateEventBusinessRules(event)
    };
  }

  /**
   * Validate event against business rules
   */
  private validateEventBusinessRules(event: POSEvent): string[] | undefined {
    const errors: string[] = [];

    // Check latency threshold
    const latencyMs = Date.now() - new Date(event.createdAt).getTime();
    if (latencyMs > 30000) { // 30 seconds threshold
      errors.push(`High event latency: ${latencyMs}ms`);
    }

    // Validate business time vs created time
    const timeDiff = Math.abs(
      new Date(event.businessTime).getTime() - new Date(event.createdAt).getTime()
    );
    if (timeDiff > 60000) { // 1 minute threshold
      errors.push('Business time and created time differ significantly');
    }

    return errors.length > 0 ? errors : undefined;
  }

  /**
   * Publish fraud flags to Kafka for downstream processing
   */
  private async publishFraudFlags(
    evaluationResults: any[], 
    event: ValidatedPOSEvent
  ): Promise<void> {
    if (!this.producer) {
      throw new Error('Producer not initialized');
    }

    try {
      const messages = evaluationResults
        .filter(result => result.triggered)
        .map(result => ({
          key: event.eventId,
          value: JSON.stringify({
            eventId: event.eventId,
            ruleId: result.ruleId,
            severity: result.severity,
            evidence: result.evidence,
            timestamp: new Date().toISOString(),
            branchId: event.branchId,
            cashierId: event.cashierId,
            posDeviceId: event.posDeviceId
          }),
          headers: {
            'event-type': 'fraud-flag',
            'source-event-type': event.eventType,
            'rule-family': result.ruleFamily || 'unknown'
          }
        }));

      if (messages.length > 0) {
        await this.producer.send({
          topic: this.config.topics.fraudFlags,
          messages
        });

        this.logger.info('Published fraud flags', {
          eventId: event.eventId,
          flagCount: messages.length
        });
      }

    } catch (error) {
      this.logger.error('Failed to publish fraud flags', {
        eventId: event.eventId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Publish a POS event to the fraud events topic
   */
  async publishPOSEvent(event: POSEvent): Promise<APIResponse<{ messageId: string }>> {
    if (!this.producer || !this.isConnected) {
      throw new Error('Producer not initialized or not connected');
    }

    try {
      const message = {
        key: event.eventId,
        value: JSON.stringify(event),
        headers: {
          'event-type': event.eventType,
          'branch-id': event.branchId,
          'cashier-id': event.cashierId,
          'timestamp': new Date().toISOString()
        }
      };

      const result = await this.producer.send({
        topic: this.config.topics.fraudEventsRaw,
        messages: [message]
      });

      const messageId = result && result.length > 0 && result[0] ? `${result[0].topicName || 'unknown'}-${result[0].partition || 0}-${result[0].baseOffset || 0}` : 'unknown';

      this.logger.info('Published POS event', {
        eventId: event.eventId,
        eventType: event.eventType,
        messageId
      });

      return {
        success: true,
        data: { messageId },
        timestamp: new Date(),
        requestId: event.eventId
      };

    } catch (error) {
      this.logger.error('Failed to publish POS event', {
        eventId: event.eventId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to publish event',
        timestamp: new Date(),
        requestId: event.eventId
      };
    }
  }

  /**
   * Handle failed event processing
   */
  private async handleFailedEvent(message: KafkaMessage, error: any): Promise<void> {
    // In production, you might want to publish to a dead letter queue
    // For now, we'll just log the failure
    this.logger.error('Adding failed event to dead letter queue', {
      offset: message.offset,
      error: error instanceof Error ? error.message : 'Unknown error',
      messageValue: message.value?.toString().substring(0, 200) // First 200 chars for debugging
    });

    // Optionally implement retry logic or dead letter queue publishing here
  }

  /**
   * Update processing statistics
   */
  private updateProcessingStats(startTime: number, success: boolean): void {
    const processingTime = Date.now() - startTime;
    
    if (success) {
      this.stats.totalProcessed++;
      this.stats.lastProcessedAt = new Date();
      
      // Update average processing time
      this.processingTimes.push(processingTime);
      if (this.processingTimes.length > this.maxProcessingTimes) {
        this.processingTimes.shift();
      }
      
      this.stats.averageProcessingTimeMs = 
        this.processingTimes.reduce((sum, time) => sum + time, 0) / this.processingTimes.length;
        
    } else {
      this.stats.totalFailed++;
    }
  }

  /**
   * Get current processing statistics
   */
  getProcessingStats(): EventProcessingStats {
    return { ...this.stats };
  }

  /**
   * Check if Kafka service is healthy
   */
  async healthCheck(): Promise<{ status: 'healthy' | 'unhealthy'; details: any }> {
    try {
      if (!this.isConnected) {
        return {
          status: 'unhealthy',
          details: { error: 'Not connected to Kafka' }
        };
      }

      // Try to get metadata to verify connection
      if (this.producer) {
        const admin = this.kafka.admin();
        await admin.connect();
        const metadata = await admin.fetchTopicMetadata({
          topics: [this.config.topics.fraudEventsRaw]
        });
        await admin.disconnect();

        return {
          status: 'healthy',
          details: {
            connected: true,
            stats: this.getProcessingStats(),
            topicMetadata: metadata
          }
        };
      }

      return {
        status: 'unhealthy',
        details: { error: 'Producer not initialized' }
      };

    } catch (error) {
      return {
        status: 'unhealthy',
        details: {
          error: error instanceof Error ? error.message : 'Health check failed'
        }
      };
    }
  }

  /**
   * Setup event handlers for monitoring
   */
  private setupEventHandlers(): void {
    this.on('error', (error) => {
      this.logger.error('Kafka service error', error);
    });

    this.on('connected', () => {
      this.logger.info('Kafka service connected successfully');
    });

    this.on('eventProcessed', (data) => {
      this.logger.debug('Event processed', {
        eventId: data.event.eventId,
        processingTimeMs: data.processingTimeMs
      });
    });
  }

  /**
   * Gracefully shutdown the Kafka service
   */
  async shutdown(): Promise<void> {
    this.logger.info('Shutting down Kafka service...');

    try {
      if (this.consumer) {
        await this.consumer.disconnect();
        this.logger.info('Kafka consumer disconnected');
      }

      if (this.producer) {
        await this.producer.disconnect();
        this.logger.info('Kafka producer disconnected');
      }

      this.isConnected = false;
      this.emit('disconnected');
      
      this.logger.info('Kafka service shutdown complete');
      
    } catch (error) {
      this.logger.error('Error during Kafka service shutdown', error as Error);
      throw error;
    }
  }
}

/**
 * Factory function to create and initialize Kafka service
 */
export async function createKafkaService(
  config: KafkaConfig,
  fraudDetectionService: FraudDetectionService,
  logger: Logger
): Promise<KafkaService> {
  const kafkaService = new KafkaService(config, fraudDetectionService, logger);
  await kafkaService.initialize();
  return kafkaService;
} 