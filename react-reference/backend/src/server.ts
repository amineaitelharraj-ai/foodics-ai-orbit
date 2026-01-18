/**
 * Main Server for Fraud Detection Backend
 * 
 * Initializes and configures the Express application with all necessary
 * middleware, routes, and services for the fraud detection system.
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

// Import services and utilities
import { getLogger, createLoggingMiddleware } from './utils/logger';
import { FraudDetectionService } from './services/fraud-detection-service';
import { KafkaService, KafkaConfig } from './services/kafka-service';
import { WebSocketService } from './services/websocket-service';
import { FraudController } from './controllers/fraud-controller';

// Import validation middleware
import { 
  createValidationMiddleware, 
  validationSchemas 
} from './validation/fraud-schemas';

// Load environment variables
dotenv.config();

class FraudDetectionServer {
  private app: express.Application;
  private prisma: PrismaClient;
  private logger = getLogger();
  private fraudDetectionService!: FraudDetectionService;
  private kafkaService!: KafkaService;
  private websocketService!: WebSocketService;
  private fraudController!: FraudController;
  private server: any;

  constructor() {
    this.app = express();
    this.prisma = new PrismaClient();
    this.setupMiddleware();
  }

  /**
   * Setup Express middleware
   */
  private setupMiddleware(): void {
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
    }));

    // CORS configuration
    const corsOptions = {
      origin: (process.env.CORS_ORIGINS || 'http://localhost:3000').split(','),
      credentials: true,
      optionsSuccessStatus: 200
    };
    this.app.use(cors(corsOptions));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
      max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
      message: {
        success: false,
        error: 'Too many requests from this IP, please try again later.',
        timestamp: new Date()
      },
      standardHeaders: true,
      legacyHeaders: false,
    });
    this.app.use('/api', limiter);

    // Body parsing and compression
    this.app.use(compression());
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));

    // Request ID middleware
    this.app.use((req: any, res, next) => {
      req.requestId = uuidv4();
      res.setHeader('X-Request-ID', req.requestId);
      next();
    });

    // Logging middleware
    this.app.use(createLoggingMiddleware());

    // Health check endpoint (before authentication)
    this.app.get('/health', (_req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date(),
        service: 'fraud-detection-backend'
      });
    });
  }

  /**
   * Initialize all services
   */
  private async initializeServices(): Promise<void> {
    this.logger.info('Initializing fraud detection services...');

    try {
      // Initialize Prisma
      await this.prisma.$connect();
      this.logger.info('Database connected successfully');

      // Initialize Fraud Detection Service
      this.fraudDetectionService = new FraudDetectionService(this.logger, {
        maxRuleExecutionTimeMs: parseInt(process.env.FRAUD_LATENCY_THRESHOLD_MS || '50'),
        enableMLEnrichment: process.env.ML_ENABLED === 'true'
      });
      this.logger.info('Fraud detection service initialized');

      // Initialize Kafka Service
      const kafkaConfig: KafkaConfig = {
        brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
        clientId: process.env.KAFKA_CLIENT_ID || 'fraud-detection-service',
        consumerGroupId: process.env.KAFKA_CONSUMER_GROUP_ID || 'fraud-consumers',
        topics: {
          fraudEventsRaw: process.env.KAFKA_TOPIC_FRAUD_EVENTS || 'fraud_events_raw',
          fraudFlags: process.env.KAFKA_TOPIC_FRAUD_FLAGS || 'fraud_flags'
        },
        retries: parseInt(process.env.KAFKA_RETRIES || '5'),
        retryDelayMs: parseInt(process.env.KAFKA_RETRY_DELAY || '1000'),
        batchSize: parseInt(process.env.FRAUD_BATCH_SIZE || '100')
      };

      this.kafkaService = new KafkaService(
        kafkaConfig,
        this.fraudDetectionService,
        this.logger
      );
      await this.kafkaService.initialize();
      await this.kafkaService.startConsuming();
      this.logger.info('Kafka service initialized and consuming');

      // Initialize WebSocket Service
      this.websocketService = new WebSocketService(
        parseInt(process.env.WS_PORT || '3002'),
        this.logger
      );
      await this.websocketService.initialize();
      this.logger.info('WebSocket service initialized');

      // Initialize Controllers
      this.fraudController = new FraudController(
        this.prisma,
        this.fraudDetectionService,
        this.kafkaService,
        this.logger
      );

      // Setup event listeners for real-time updates
      this.setupEventListeners();
      
      this.logger.info('All services initialized successfully');

    } catch (error) {
      this.logger.error('Failed to initialize services', error as Error);
      throw error;
    }
  }

  /**
   * Setup event listeners for real-time communication
   */
  private setupEventListeners(): void {
    // Listen for fraud flags from detection service
    this.fraudDetectionService.on('fraudFlagCreated', (flag) => {
      this.websocketService.broadcastFraudAlert(flag);
    });

    // Listen for processing events from Kafka
    this.kafkaService.on('eventProcessed', (data) => {
      this.websocketService.broadcastMessage('event_processed', {
        eventId: data.event.eventId,
        processingTimeMs: data.processingTimeMs,
        flagsGenerated: data.result.flagsGenerated
      });
    });

    // Listen for processing errors
    this.kafkaService.on('processingError', (data) => {
      this.logger.error('Event processing error', data.error);
    });
  }

  /**
   * Setup API routes
   */
  private setupRoutes(): void {
    const router = express.Router();

    // POS Event Ingestion
    router.post('/events', 
      createValidationMiddleware(validationSchemas.posEvent),
      this.fraudController.ingestPOSEvent
    );

    // Fraud Flag Management
    router.get('/flags',
      createValidationMiddleware(validationSchemas.queryParams, 'query'),
      this.fraudController.getFraudFlags
    );
    
    router.get('/flags/:id', this.fraudController.getFraudFlag);
    
    router.patch('/flags/:id',
      createValidationMiddleware(validationSchemas.updateFraudFlag),
      this.fraudController.updateFraudFlag
    );

    // Fraud Rule Management
    router.get('/rules', this.fraudController.getFraudRules);
    
    router.post('/rules',
      createValidationMiddleware(validationSchemas.fraudRule),
      this.fraudController.createFraudRule
    );
    
    router.put('/rules/:id',
      createValidationMiddleware(validationSchemas.fraudRule),
      this.fraudController.updateFraudRule
    );
    
    router.delete('/rules/:id', this.fraudController.deleteFraudRule);

    // Analytics and Metrics
    router.get('/metrics', this.fraudController.getFraudMetrics);
    router.get('/dashboard', this.fraudController.getDashboard);
    router.get('/health', this.fraudController.getHealthCheck);

    // Mount the router
    this.app.use('/api/fraud', router);

    // Catch-all error handler
    this.app.use((err: any, req: any, res: any, _next: any) => {
      this.logger.error('Unhandled error', {
        requestId: req.requestId,
        error: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method
      });

      res.status(500).json({
        success: false,
        error: 'Internal server error',
        requestId: req.requestId,
        timestamp: new Date()
      });
    });

    // 404 handler
    this.app.use('*', (req: any, res) => {
      res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        requestId: req.requestId,
        timestamp: new Date()
      });
    });
  }

  /**
   * Start the server
   */
  async start(): Promise<void> {
    try {
      await this.initializeServices();
      this.setupRoutes();

      const port = parseInt(process.env.PORT || '3001');
      const host = process.env.HOST || 'localhost';

      this.server = this.app.listen(port, host, () => {
        this.logger.info('Fraud detection server started', {
          port,
          host,
          environment: process.env.NODE_ENV || 'development'
        });
      });

      // Graceful shutdown handling
      process.on('SIGTERM', () => this.gracefulShutdown('SIGTERM'));
      process.on('SIGINT', () => this.gracefulShutdown('SIGINT'));

    } catch (error) {
      this.logger.error('Failed to start server', error as Error);
      process.exit(1);
    }
  }

  /**
   * Graceful shutdown
   */
  private async gracefulShutdown(signal: string): Promise<void> {
    this.logger.info(`Received ${signal}, starting graceful shutdown...`);

    try {
      // Stop accepting new connections
      if (this.server) {
        this.server.close();
      }

      // Shutdown services in reverse order
      if (this.websocketService) {
        await this.websocketService.shutdown();
        this.logger.info('WebSocket service shut down');
      }

      if (this.kafkaService) {
        await this.kafkaService.shutdown();
        this.logger.info('Kafka service shut down');
      }

      if (this.fraudDetectionService) {
        await this.fraudDetectionService.shutdown();
        this.logger.info('Fraud detection service shut down');
      }

      if (this.prisma) {
        await this.prisma.$disconnect();
        this.logger.info('Database disconnected');
      }

      this.logger.info('Graceful shutdown completed');
      process.exit(0);

    } catch (error) {
      this.logger.error('Error during graceful shutdown', error as Error);
      process.exit(1);
    }
  }
}

// Create and start the server
const server = new FraudDetectionServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Start the server
if (require.main === module) {
  server.start().catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });
}

export default server; 