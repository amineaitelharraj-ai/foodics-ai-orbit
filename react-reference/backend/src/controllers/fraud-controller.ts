/**
 * Fraud Detection API Controllers
 * 
 * Provides REST endpoints for fraud detection management including:
 * - POS event ingestion
 * - Fraud rule management
 * - Fraud flag investigation
 * - Metrics and analytics
 */

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { 
  POSEvent, 
  FraudRule, 
  FraudFlag, 
  APIResponse, 
  PaginatedResponse,
  CreatePOSEventRequest,
  UpdateFraudFlagRequest,
  CreateFraudRuleRequest,
  FraudMetrics
} from '../types/fraud-events';
import { FraudDetectionService } from '../services/fraud-detection-service';
import { KafkaService } from '../services/kafka-service';
import { Logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

export class FraudController {
  constructor(
    private prisma: PrismaClient,
    private fraudDetectionService: FraudDetectionService,
    private kafkaService: KafkaService,
    private logger: Logger
  ) {}

  /**
   * POST /api/fraud/events
   * Ingest POS events for fraud detection
   */
  public ingestPOSEvent = async (req: Request, res: Response): Promise<void> => {
    const requestId = req.requestId || uuidv4();
    
    try {
      const eventData: CreatePOSEventRequest = req.body;
      
      this.logger.info('Processing POS event', {
        requestId,
        eventId: eventData.eventId,
        eventType: eventData.eventType,
        branchId: eventData.branchId
      });

      // Store event in database first
      const savedEvent = await this.prisma.pOSEvent.create({
        data: {
          eventId: eventData.eventId,
          eventType: eventData.eventType,
          posId: eventData.posDeviceId,
          posDeviceId: eventData.posDeviceId,
          branchId: eventData.branchId,
          merchantId: 'default-merchant',
          storeId: eventData.branchId,
          cashierId: eventData.cashierId,
          timestamp: eventData.createdAt,
          transactionId: eventData.eventId,
          createdAt: eventData.createdAt,
          itemId: eventData.itemId,
          reason: eventData.reason,
          metadataJson: JSON.stringify(eventData.metadata || {})
        }
      });

      // Publish to Kafka for async processing
      const kafkaResult = await this.kafkaService.publishPOSEvent(eventData as POSEvent);
      
      if (!kafkaResult.success) {
        this.logger.warn('Failed to publish event to Kafka', {
          requestId,
          eventId: eventData.eventId,
          error: kafkaResult.error
        });
      }

      const response: APIResponse<{ eventId: string; messageId?: string }> = {
        success: true,
        data: {
          eventId: savedEvent.eventId,
          messageId: kafkaResult.data?.messageId
        },
        timestamp: new Date(),
        requestId
      };

      res.status(201).json(response);

    } catch (error) {
      this.logger.error('Failed to ingest POS event', { requestId, error });
      
      const response: APIResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process event',
        timestamp: new Date(),
        requestId
      };

      res.status(500).json(response);
    }
  };

  /**
   * GET /api/fraud/flags
   * Retrieve fraud flags with filtering and pagination
   */
  public getFraudFlags = async (req: Request, res: Response): Promise<void> => {
    const requestId = req.requestId || uuidv4();
    
    try {
      const {
        page = 1,
        pageSize = 20,
        sortBy = 'flaggedAt',
        sortOrder = 'desc',
        branchId,
        cashierId,
        severity,
        status,
        startDate,
        endDate,
        ruleFamily
      } = req.query;

      // Build where clause
      const where: any = {};
      
      if (branchId) where.branchId = branchId;
      if (cashierId) where.cashierId = cashierId;
      if (severity) where.severity = severity;
      if (status) where.status = status;
      
      if (startDate || endDate) {
        where.flaggedAt = {};
        if (startDate) where.flaggedAt.gte = new Date(startDate as string);
        if (endDate) where.flaggedAt.lte = new Date(endDate as string);
      }

      // Get total count
      const total = await this.prisma.fraudFlag.count({ where });

      // Get paginated results
      const flags = await this.prisma.fraudFlag.findMany({
        where,
        include: {
          event: true,
          rule: true,
          branch: true,
        },
        orderBy: { [sortBy as string]: sortOrder },
        skip: (Number(page) - 1) * Number(pageSize),
        take: Number(pageSize)
      });

      const response: PaginatedResponse<(typeof flags)[0]> = {
        success: true,
        data: flags || [],
        pagination: {
          page: Number(page),
          pageSize: Number(pageSize),
          total,
          totalPages: Math.ceil(total / Number(pageSize))
        },
        timestamp: new Date(),
        requestId
      };

      res.json(response);

    } catch (error) {
      this.logger.error('Failed to retrieve fraud flags', { requestId, error });
      
      const response: APIResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to retrieve flags',
        timestamp: new Date(),
        requestId
      };

      res.status(500).json(response);
    }
  };

  /**
   * GET /api/fraud/flags/:id
   * Get specific fraud flag by ID
   */
  public getFraudFlag = async (req: Request, res: Response): Promise<void> => {
    const requestId = req.requestId || uuidv4();
    const flagId = req.params.id;
    
    try {
      const flag = await this.prisma.fraudFlag.findUnique({
        where: { id: flagId },
        include: {
          event: true,
          rule: true,
          branch: true,

          // actions: true, // Removed - not in schema
          // investigator: {
          //   select: { id: true, firstName: true, lastName: true, email: true }
          // } // Not in schema
        }
      });

      if (!flag) {
        const response: APIResponse = {
          success: false,
          error: 'Fraud flag not found',
          timestamp: new Date(),
          requestId
        };
        res.status(404).json(response);
        return;
      }

      const response: APIResponse<typeof flag> = {
        success: true,
        data: flag,
        timestamp: new Date(),
        requestId
      };

      res.json(response);

    } catch (error) {
      this.logger.error('Failed to retrieve fraud flag', { requestId, flagId, error });
      
      const response: APIResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to retrieve flag',
        timestamp: new Date(),
        requestId
      };

      res.status(500).json(response);
    }
  };

  /**
   * PATCH /api/fraud/flags/:id
   * Update fraud flag (investigation)
   */
  public updateFraudFlag = async (req: Request, res: Response): Promise<void> => {
    const requestId = req.requestId || uuidv4();
    const flagId = req.params.id;
    
    try {
      const updates: UpdateFraudFlagRequest = req.body;
      
      const updateData: any = {};
      if (updates.status) updateData.status = updates.status;
      if (updates.investigatedBy) updateData.investigatedBy = updates.investigatedBy;
      if (updates.investigationNotes) updateData.investigationNotes = updates.investigationNotes;
      if (updates.resolution) updateData.resolution = updates.resolution;
      
      // Set resolved timestamp if status is being changed to resolved
      if (updates.status && ['RESOLVED', 'FALSE_POSITIVE', 'CONFIRMED_FRAUD'].includes(updates.status)) {
        updateData.resolvedAt = new Date();
      }

      const updatedFlag = await this.prisma.fraudFlag.update({
        where: { id: flagId },
        data: updateData,
        include: {
          event: true,
          rule: true,
          branch: true,

          // actions: true // Removed - not in schema
        }
      });

      // Log the update for audit trail
      await this.prisma.auditLog.create({
        data: {
          entityType: 'fraud_flag',
          entityId: flagId || 'unknown',
          action: 'UPDATE',
          changes: JSON.stringify(updateData),
          newValues: JSON.stringify(updateData),
          userId: updates.investigatedBy,
          // timestamp: new Date() // Auto-created
        }
      });

      this.logger.info('Fraud flag updated', {
        requestId,
        flagId,
        status: updates.status,
        investigatedBy: updates.investigatedBy
      });

      const response: APIResponse<typeof updatedFlag> = {
        success: true,
        data: updatedFlag,
        timestamp: new Date(),
        requestId
      };

      res.json(response);

    } catch (error) {
      this.logger.error('Failed to update fraud flag', { requestId, flagId, error });
      
      const response: APIResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update flag',
        timestamp: new Date(),
        requestId
      };

      res.status(500).json(response);
    }
  };

  /**
   * GET /api/fraud/rules
   * Get all fraud detection rules
   */
  public getFraudRules = async (req: Request, res: Response): Promise<void> => {
    const requestId = req.requestId || uuidv4();
    
    try {
      const { enabled, ruleFamily } = req.query;
      
      const where: any = {};
      if (enabled !== undefined) where.enabled = enabled === 'true';
      if (ruleFamily) where.ruleFamily = ruleFamily;

      const rules = await this.prisma.fraudRule.findMany({
        where,
        include: {
          ruleMetrics: {
            orderBy: { date: 'desc' },
            take: 1 // Latest metrics
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      const response: APIResponse<typeof rules> = {
        success: true,
        data: rules,
        timestamp: new Date(),
        requestId
      };

      res.json(response);

    } catch (error) {
      this.logger.error('Failed to retrieve fraud rules', { requestId, error });
      
      const response: APIResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to retrieve rules',
        timestamp: new Date(),
        requestId
      };

      res.status(500).json(response);
    }
  };

  /**
   * POST /api/fraud/rules
   * Create new fraud detection rule
   */
  public createFraudRule = async (req: Request, res: Response): Promise<void> => {
    const requestId = req.requestId || uuidv4();
    
    try {
      const ruleData: CreateFraudRuleRequest = req.body;
      
      const newRule = await this.prisma.fraudRule.create({
        data: {
          name: ruleData.name,
          description: ruleData.description,
          ruleFamily: ruleData.ruleFamily,
          severity: ruleData.severity,
          enabled: ruleData.enabled,
          version: ruleData.version,
          threshold: JSON.stringify(ruleData.threshold),
          thresholdJson: JSON.stringify(ruleData.threshold),
          timeWindowJson: JSON.stringify(ruleData.timeWindow),
          conditionsJson: JSON.stringify(ruleData.conditions),
          actionsJson: JSON.stringify(ruleData.actions),
          // createdBy: ruleData.createdBy // Field not in schema
        }
      });

      // Add rule to fraud detection service
      this.fraudDetectionService.addRule(newRule as any);

      // Log creation for audit trail
      await this.prisma.auditLog.create({
        data: {
          entityType: 'fraud_rule',
          entityId: newRule.id,
          action: 'CREATE',
          changes: JSON.stringify(ruleData),
          newValues: JSON.stringify(newRule),
          userId: ruleData.createdBy,
          // timestamp: new Date() // Auto-created
        }
      });

      this.logger.info('Fraud rule created', {
        requestId,
        ruleId: newRule.id,
        ruleName: newRule.name,
        createdBy: ruleData.createdBy
      });

      const response: APIResponse<typeof newRule> = {
        success: true,
        data: newRule,
        timestamp: new Date(),
        requestId
      };

      res.status(201).json(response);

    } catch (error) {
      this.logger.error('Failed to create fraud rule', { requestId, error });
      
      const response: APIResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create rule',
        timestamp: new Date(),
        requestId
      };

      res.status(500).json(response);
    }
  };

  /**
   * PUT /api/fraud/rules/:id
   * Update fraud detection rule
   */
  public updateFraudRule = async (req: Request, res: Response): Promise<void> => {
    const requestId = req.requestId || uuidv4();
    const ruleId = req.params.id;
    
    try {
      const updates = req.body;
      
      const oldRule = await this.prisma.fraudRule.findUnique({
        where: { id: ruleId }
      });

      if (!oldRule) {
        const response: APIResponse = {
          success: false,
          error: 'Fraud rule not found',
          timestamp: new Date(),
          requestId
        };
        res.status(404).json(response);
        return;
      }

      const updatedRule = await this.prisma.fraudRule.update({
        where: { id: ruleId },
        data: {
          ...updates,
          updatedAt: new Date()
        }
      });

      // Update rule in fraud detection service
      this.fraudDetectionService.updateRule(ruleId || 'unknown', updatedRule as any);

      // Log update for audit trail
      await this.prisma.auditLog.create({
        data: {
          entityType: 'fraud_rule',
          entityId: ruleId || 'unknown',
          action: 'UPDATE',
          changes: JSON.stringify({ old: oldRule, new: updatedRule }),
          newValues: JSON.stringify(updatedRule),
          // timestamp: new Date() // Auto-created
        }
      });

      this.logger.info('Fraud rule updated', {
        requestId,
        ruleId,
        ruleName: updatedRule.name
      });

      const response: APIResponse<typeof updatedRule> = {
        success: true,
        data: updatedRule,
        timestamp: new Date(),
        requestId
      };

      res.json(response);

    } catch (error) {
      this.logger.error('Failed to update fraud rule', { requestId, ruleId, error });
      
      const response: APIResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update rule',
        timestamp: new Date(),
        requestId
      };

      res.status(500).json(response);
    }
  };

  /**
   * DELETE /api/fraud/rules/:id
   * Delete fraud detection rule
   */
  public deleteFraudRule = async (req: Request, res: Response): Promise<void> => {
    const requestId = req.requestId || uuidv4();
    const ruleId = req.params.id;
    
    try {
      const rule = await this.prisma.fraudRule.findUnique({
        where: { id: ruleId }
      });

      if (!rule) {
        const response: APIResponse = {
          success: false,
          error: 'Fraud rule not found',
          timestamp: new Date(),
          requestId
        };
        res.status(404).json(response);
        return;
      }

      await this.prisma.fraudRule.delete({
        where: { id: ruleId }
      });

      // Remove rule from fraud detection service
      this.fraudDetectionService.removeRule(ruleId || 'unknown');

      // Log deletion for audit trail
      await this.prisma.auditLog.create({
        data: {
          entityType: 'fraud_rule',
          entityId: ruleId || 'unknown',
          action: 'DELETE',
          changes: JSON.stringify({ action: "rule_deleted" }),
          // timestamp: new Date() // Auto-created
        }
      });

      this.logger.info('Fraud rule deleted', {
        requestId,
        ruleId,
        ruleName: rule.name
      });

      const response: APIResponse = {
        success: true,
        timestamp: new Date(),
        requestId
      };

      res.json(response);

    } catch (error) {
      this.logger.error('Failed to delete fraud rule', { requestId, ruleId, error });
      
      const response: APIResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete rule',
        timestamp: new Date(),
        requestId
      };

      res.status(500).json(response);
    }
  };

  /**
   * GET /api/fraud/metrics
   * Get fraud detection metrics and analytics
   */
  public getFraudMetrics = async (req: Request, res: Response): Promise<void> => {
    const requestId = req.requestId || uuidv4();
    
    try {
      const { startDate, endDate, branchId, interval = 'daily' } = req.query;
      
      const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const end = endDate ? new Date(endDate as string) : new Date();

      const where: any = {
        date: {
          gte: start,
          lte: end
        }
      };
      
      if (branchId) where.branchId = branchId;

      const metrics = await this.prisma.fraudMetric.findMany({
        where,
        include: {
          branch: {
            select: { name: true }
          }
        },
        orderBy: { date: 'asc' }
      });

      // Calculate summary statistics
      const summary = {
        totalTransactions: metrics.reduce((sum, m) => sum + m.totalTransactions, 0),
        totalFlagged: metrics.reduce((sum, m) => sum + m.flaggedTransactions, 0),
        totalFalsePositives: metrics.reduce((sum, m) => sum + m.falsePositives, 0),
        totalConfirmedFraud: metrics.reduce((sum, m) => sum + m.confirmedFraud, 0),
        totalLossPrevented: metrics.reduce((sum, m) => sum + Number(m.potentialLossPrevented), 0),
        averageProcessingTime: metrics.length > 0 ? 
          metrics.reduce((sum, m) => sum + m.averageProcessingTimeMs, 0) / metrics.length : 0,
        flagRate: metrics.reduce((sum, m) => sum + m.totalTransactions, 0) > 0 ?
          (metrics.reduce((sum, m) => sum + m.flaggedTransactions, 0) / 
           metrics.reduce((sum, m) => sum + m.totalTransactions, 0)) * 100 : 0,
        accuracy: metrics.reduce((sum, m) => sum + m.flaggedTransactions, 0) > 0 ?
          ((metrics.reduce((sum, m) => sum + m.confirmedFraud, 0) / 
            metrics.reduce((sum, m) => sum + m.flaggedTransactions, 0)) * 100) : 0
      };

      const response: APIResponse<{ metrics: typeof metrics; summary: typeof summary }> = {
        success: true,
        data: { metrics, summary },
        timestamp: new Date(),
        requestId
      };

      res.json(response);

    } catch (error) {
      this.logger.error('Failed to retrieve fraud metrics', { requestId, error });
      
      const response: APIResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to retrieve metrics',
        timestamp: new Date(),
        requestId
      };

      res.status(500).json(response);
    }
  };

  /**
   * GET /api/fraud/dashboard
   * Get dashboard summary data
   */
  public getDashboard = async (req: Request, res: Response): Promise<void> => {
    const requestId = req.requestId || uuidv4();
    
    try {
      const today = new Date();
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

      // Get today's metrics
      const todayMetrics = await this.prisma.fraudMetric.findFirst({
        where: { 
          date: {
            gte: new Date(today.toDateString()),
            lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
          }
        }
      });

      // Get recent flags
      const recentFlags = await this.prisma.fraudFlag.findMany({
        where: {
          flaggedAt: { gte: lastWeek }
        },
        include: {
          rule: { select: { name: true, severity: true } },
          branch: { select: { name: true } },
          // cashier: { select: { firstName: true, lastName: true } } // Removed - not in schema
        },
        orderBy: { flaggedAt: 'desc' },
        take: 10
      });

      // Get active rules count
      const activeRulesCount = await this.prisma.fraudRule.count({
        where: { enabled: true }
      });

      // Get processing statistics from Kafka service
      const processingStats = this.kafkaService.getProcessingStats();

      const dashboard = {
        today: {
          totalTransactions: todayMetrics?.totalTransactions || 0,
          flaggedTransactions: todayMetrics?.flaggedTransactions || 0,
          confirmedFraud: todayMetrics?.confirmedFraud || 0,
          falsePositives: todayMetrics?.falsePositives || 0,
          lossPrevented: Number(todayMetrics?.potentialLossPrevented || 0)
        },
        recentFlags,
        activeRulesCount,
        processingStats,
        systemHealth: await this.getSystemHealth()
      };

      const response: APIResponse<typeof dashboard> = {
        success: true,
        data: dashboard,
        timestamp: new Date(),
        requestId
      };

      res.json(response);

    } catch (error) {
      this.logger.error('Failed to retrieve dashboard data', { requestId, error });
      
      const response: APIResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to retrieve dashboard',
        timestamp: new Date(),
        requestId
      };

      res.status(500).json(response);
    }
  };

  /**
   * GET /api/fraud/health
   * System health check
   */
  public getHealthCheck = async (req: Request, res: Response): Promise<void> => {
    try {
      const health = await this.getSystemHealth();
      
      const statusCode = health.status === 'healthy' ? 200 : 503;
      res.status(statusCode).json(health);

    } catch (error) {
      res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date(),
        error: error instanceof Error ? error.message : 'Health check failed'
      });
    }
  };

  private async getSystemHealth() {
    try {
      // Check database connectivity
      await this.prisma.$queryRaw`SELECT 1`;
      
      // Check Kafka connectivity
      const kafkaHealth = await this.kafkaService.healthCheck();
      
      // Check fraud detection service
      const rulesCount = this.fraudDetectionService.getRules().length;

      return {
        status: kafkaHealth.status === 'healthy' ? 'healthy' : 'degraded',
        timestamp: new Date(),
        components: {
          database: 'healthy',
          kafka: kafkaHealth.status,
          fraudEngine: rulesCount > 0 ? 'healthy' : 'degraded',
          processingStats: this.kafkaService.getProcessingStats()
        },
        details: {
          activeRules: rulesCount,
          kafka: kafkaHealth.details
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        timestamp: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
} 