/**
 * Fraud Detection Validation Schemas
 * 
 * This module provides comprehensive Joi validation schemas for all fraud detection
 * data structures to ensure data integrity and API contract compliance.
 */

import * as Joi from 'joi';
import { v4 as uuidv4 } from 'uuid';
import { EventType, FraudSeverity, FraudFlagStatus, RuleFamily, RuleResult } from '../types/fraud-events';

// Base validation patterns
const uuidSchema = Joi.string().uuid().required();
const timestampSchema = Joi.date().iso().required();
const optionalTimestampSchema = Joi.date().iso().optional();

/**
 * POS Event Validation Schema
 * Validates incoming events from POS devices according to the data contract
 */
export const posEventSchema = Joi.object({
  eventType: Joi.string()
    .valid(...Object.values(EventType))
    .required()
    .description('Type of POS event'),
    
  eventId: uuidSchema
    .description('Unique event identifier for idempotency'),
    
  posDeviceId: Joi.string()
    .min(1)
    .max(100)
    .required()
    .description('POS terminal identifier'),
    
  branchId: Joi.string()
    .min(1)
    .max(100)
    .required()
    .description('Branch identifier'),
    
  cashierId: uuidSchema
    .description('Cashier/staff UUID'),
    
  createdAt: timestampSchema
    .description('Event creation timestamp'),
    
  businessTime: timestampSchema
    .description('Server canonical timestamp'),
    
  // Optional fields based on event type
  orderId: Joi.string()
    .min(1)
    .max(100)
    .optional()
    .description('Order identifier for order-level events'),
    
  itemId: Joi.string()
    .min(1)
    .max(100)
    .optional()
    .description('Item identifier for line-item events'),
    
  amount: Joi.number()
    .precision(2)
    .optional()
    .description('Transaction amount (signed)'),
    
  discountPct: Joi.number()
    .min(0)
    .max(100)
    .precision(2)
    .optional()
    .description('Discount percentage'),
    
  reason: Joi.string()
    .max(500)
    .optional()
    .description('Free text reason'),
    
  shiftId: Joi.string()
    .min(1)
    .max(100)
    .optional()
    .description('Shift identifier'),
    
  metadata: Joi.object()
    .optional()
    .description('Additional event metadata')
}).custom((value: any, helpers: any) => {
  // Custom validation logic based on event type
  const { eventType, orderId, itemId, amount, discountPct } = value;
  
  switch (eventType) {
    case EventType.VOID:
    case EventType.RETURN:
      if (!orderId) {
        return helpers.error('any.custom', {
          message: `${eventType} events require orderId`
        });
      }
      break;
      
    case EventType.DISCOUNT:
      if (!discountPct && !amount) {
        return helpers.error('any.custom', {
          message: 'DISCOUNT events require either discountPct or amount'
        });
      }
      break;
      
    case EventType.CASH_REFUND:
      if (!amount || amount >= 0) {
        return helpers.error('any.custom', {
          message: 'CASH_REFUND events require negative amount'
        });
      }
      break;
  }
  
  return value;
});

/**
 * Fraud Rule Validation Schema
 */
export const fraudRuleSchema = Joi.object({
  name: Joi.string()
    .min(3)
    .max(100)
    .required()
    .description('Rule name'),
    
  description: Joi.string()
    .min(10)
    .max(500)
    .required()
    .description('Rule description'),
    
  ruleFamily: Joi.string()
    .valid(...Object.values(RuleFamily))
    .required()
    .description('Rule family category'),
    
  threshold: Joi.object({
    type: Joi.string()
      .valid('count', 'percentage', 'amount', 'time')
      .required(),
    value: Joi.number()
      .positive()
      .required(),
    operator: Joi.string()
      .valid('gt', 'gte', 'lt', 'lte', 'eq', 'neq')
      .required(),
    unit: Joi.string()
      .valid('minutes', 'hours', 'days', 'transactions', 'currency')
      .optional()
  }).required(),
  
  timeWindow: Joi.object({
    duration: Joi.number()
      .positive()
      .required(),
    unit: Joi.string()
      .valid('minutes', 'hours', 'days')
      .required(),
    bucketSize: Joi.number()
      .positive()
      .optional()
  }).optional(),
  
  severity: Joi.string()
    .valid(...Object.values(FraudSeverity))
    .required()
    .description('Rule severity level'),
    
  enabled: Joi.boolean()
    .default(true)
    .description('Whether rule is active'),
    
  version: Joi.string()
    .pattern(/^\d+\.\d+\.\d+$/)
    .default('1.0.0')
    .description('Rule version (semver)'),
    
  createdBy: uuidSchema
    .description('User who created the rule'),
    
  conditions: Joi.array()
    .items(
      Joi.object({
        field: Joi.string().required(),
        operator: Joi.string()
          .valid('eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'in', 'contains', 'regex')
          .required(),
        value: Joi.any().required(),
        logicalOperator: Joi.string()
          .valid('AND', 'OR')
          .optional()
      })
    )
    .min(1)
    .required()
    .description('Rule conditions'),
    
  actions: Joi.array()
    .items(
      Joi.object({
        type: Joi.string()
          .valid('flag', 'alert', 'block', 'log', 'notify')
          .required(),
        target: Joi.string().optional(),
        payload: Joi.object().optional(),
        priority: Joi.number()
          .integer()
          .min(1)
          .max(10)
          .required()
      })
    )
    .min(1)
    .required()
    .description('Rule actions')
});

/**
 * Fraud Flag Validation Schema
 */
export const fraudFlagSchema = Joi.object({
  eventId: uuidSchema
    .description('Reference to original POS event'),
    
  ruleId: uuidSchema
    .description('Rule that triggered the flag'),
    
  ruleName: Joi.string()
    .min(3)
    .max(100)
    .required(),
    
  ruleVersion: Joi.string()
    .pattern(/^\d+\.\d+\.\d+$/)
    .required(),
    
  branchId: Joi.string()
    .min(1)
    .max(100)
    .required(),
    
  cashierId: uuidSchema,
  
  posDeviceId: Joi.string()
    .min(1)
    .max(100)
    .required(),
    
  orderId: Joi.string()
    .min(1)
    .max(100)
    .optional(),
    
  severity: Joi.string()
    .valid(...Object.values(FraudSeverity))
    .required(),
    
  status: Joi.string()
    .valid(...Object.values(FraudFlagStatus))
    .default(FraudFlagStatus.PENDING),
    
  description: Joi.string()
    .min(10)
    .max(500)
    .required(),
    
  evidence: Joi.object()
    .required()
    .description('Rule evaluation evidence'),
    
  flaggedAt: timestampSchema,
  
  resolvedAt: optionalTimestampSchema,
  
  investigatedBy: Joi.string()
    .uuid()
    .optional(),
    
  investigationNotes: Joi.string()
    .max(2000)
    .optional(),
    
  resolution: Joi.string()
    .max(1000)
    .optional(),
    
  actionsTaken: Joi.array()
    .items(
      Joi.object({
        type: Joi.string()
          .valid('toast', 'email', 'sms', 'block_till', 'manager_pin', 'log')
          .required(),
        timestamp: timestampSchema,
        target: Joi.string().required(),
        payload: Joi.object().required(),
        success: Joi.boolean().required(),
        error: Joi.string().optional(),
        responseTime: Joi.number().positive().optional()
      })
    )
    .default([]),
    
  riskScore: Joi.number()
    .min(0)
    .max(100)
    .required()
    .description('Risk score (0-100)'),
    
  falsePositiveProbability: Joi.number()
    .min(0)
    .max(1)
    .optional()
    .description('ML-derived false positive probability')
});

/**
 * Fraud Action Validation Schema
 */
export const fraudActionSchema = Joi.object({
  type: Joi.string()
    .valid('toast', 'email', 'sms', 'block_till', 'manager_pin', 'log')
    .required(),
    
  timestamp: timestampSchema,
  
  target: Joi.string()
    .min(1)
    .max(200)
    .required()
    .description('Action target (device, email, phone, etc.)'),
    
  payload: Joi.object()
    .required()
    .description('Action-specific payload'),
    
  success: Joi.boolean()
    .required(),
    
  error: Joi.string()
    .max(500)
    .optional(),
    
  responseTime: Joi.number()
    .positive()
    .optional()
    .description('Action response time in ms')
});

/**
 * API Query Parameters Validation
 */
export const queryParamsSchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1),
    
  pageSize: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(20),
    
  sortBy: Joi.string()
    .valid('createdAt', 'severity', 'status', 'riskScore')
    .default('createdAt'),
    
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc'),
    
  branchId: Joi.string()
    .min(1)
    .max(100)
    .optional(),
    
  cashierId: Joi.string()
    .uuid()
    .optional(),
    
  severity: Joi.string()
    .valid(...Object.values(FraudSeverity))
    .optional(),
    
  status: Joi.string()
    .valid(...Object.values(FraudFlagStatus))
    .optional(),
    
  startDate: Joi.date()
    .iso()
    .optional(),
    
  endDate: Joi.date()
    .iso()
    .min(Joi.ref('startDate'))
    .optional(),
    
  ruleFamily: Joi.string()
    .valid(...Object.values(RuleFamily))
    .optional()
});

/**
 * Update Fraud Flag Request Schema
 */
export const updateFraudFlagSchema = Joi.object({
  status: Joi.string()
    .valid(...Object.values(FraudFlagStatus))
    .optional(),
    
  investigatedBy: Joi.string()
    .uuid()
    .optional(),
    
  investigationNotes: Joi.string()
    .max(2000)
    .optional(),
    
  resolution: Joi.string()
    .max(1000)
    .optional()
}).min(1); // At least one field must be provided

/**
 * WebSocket Message Schema
 */
export const webSocketMessageSchema = Joi.object({
  type: Joi.string()
    .valid('fraud_alert', 'rule_update', 'system_status', 'metrics_update')
    .required(),
    
  payload: Joi.any()
    .required(),
    
  timestamp: timestampSchema,
  
  messageId: uuidSchema
});

/**
 * Fraud Metrics Schema
 */
export const fraudMetricsSchema = Joi.object({
  date: Joi.date()
    .iso()
    .required(),
    
  branchId: Joi.string()
    .min(1)
    .max(100)
    .optional(),
    
  totalTransactions: Joi.number()
    .integer()
    .min(0)
    .required(),
    
  flaggedTransactions: Joi.number()
    .integer()
    .min(0)
    .required(),
    
  falsePositives: Joi.number()
    .integer()
    .min(0)
    .required(),
    
  confirmedFraud: Joi.number()
    .integer()
    .min(0)
    .required(),
    
  potentialLossPrevented: Joi.number()
    .precision(2)
    .min(0)
    .required(),
    
  actualLossAmount: Joi.number()
    .precision(2)
    .min(0)
    .required(),
    
  averageProcessingTimeMs: Joi.number()
    .positive()
    .required(),
    
  ruleEngineLatencyP99: Joi.number()
    .positive()
    .required(),
    
  alertResponseTimeMs: Joi.number()
    .positive()
    .required(),
    
  ruleAccuracy: Joi.object()
    .pattern(Joi.string(), Joi.number().min(0).max(1))
    .required(),
    
  ruleExecutionCount: Joi.object()
    .pattern(Joi.string(), Joi.number().integer().min(0))
    .required(),
    
  // ML metrics (optional)
  modelAccuracy: Joi.number()
    .min(0)
    .max(1)
    .optional(),
    
  modelPrecision: Joi.number()
    .min(0)
    .max(1)
    .optional(),
    
  modelRecall: Joi.number()
    .min(0)
    .max(1)
    .optional(),
    
  featureDrift: Joi.number()
    .min(0)
    .optional()
});

/**
 * System Configuration Schema
 */
export const systemConfigSchema = Joi.object({
  ruleEngine: Joi.object({
    type: Joi.string()
      .valid('marble', 'drools', 'opa')
      .required(),
    latencyThresholdMs: Joi.number()
      .positive()
      .required(),
    batchSize: Joi.number()
      .integer()
      .min(1)
      .max(1000)
      .required(),
    windowCleanupIntervalMs: Joi.number()
      .positive()
      .required()
  }).required(),
  
  kafka: Joi.object({
    brokers: Joi.array()
      .items(Joi.string())
      .min(1)
      .required(),
    topics: Joi.object({
      fraudEventsRaw: Joi.string().required(),
      fraudFlags: Joi.string().required()
    }).required(),
    consumerGroupId: Joi.string().required(),
    batchSize: Joi.number()
      .integer()
      .min(1)
      .max(1000)
      .required()
  }).required(),
  
  websocket: Joi.object({
    port: Joi.number()
      .integer()
      .min(1024)
      .max(65535)
      .required(),
    heartbeatInterval: Joi.number()
      .positive()
      .required()
  }).required(),
  
  notifications: Joi.object({
    email: Joi.boolean().required(),
    sms: Joi.boolean().required(),
    webhook: Joi.boolean().required()
  }).required(),
  
  ml: Joi.object({
    enabled: Joi.boolean().required(),
    modelPath: Joi.string().optional(),
    predictionThreshold: Joi.number()
      .min(0)
      .max(1)
      .optional(),
    retrainingInterval: Joi.number()
      .positive()
      .optional()
  }).required()
});

/**
 * Request ID validation middleware helper
 */
export const requestIdSchema = Joi.string()
  .uuid()
  .default(() => uuidv4());

/**
 * Export all validation schemas for use in middleware and controllers
 */
export const validationSchemas = {
  posEvent: posEventSchema,
  fraudRule: fraudRuleSchema,
  fraudFlag: fraudFlagSchema,
  fraudAction: fraudActionSchema,
  queryParams: queryParamsSchema,
  updateFraudFlag: updateFraudFlagSchema,
  webSocketMessage: webSocketMessageSchema,
  fraudMetrics: fraudMetricsSchema,
  systemConfig: systemConfigSchema,
  requestId: requestIdSchema
};

/**
 * Custom validation error formatter
 */
export const formatValidationError = (error: Joi.ValidationError): string => {
  return error.details
    .map((detail: any) => detail.message)
    .join('; ');
};

/**
 * Validation middleware factory
 */
export const createValidationMiddleware = (schema: Joi.ObjectSchema, property: 'body' | 'query' | 'params' = 'body') => {
  return (req: any, res: any, next: any) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
      dateFormat: 'iso'
    });
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: formatValidationError(error),
        timestamp: new Date(),
        requestId: req.requestId
      });
    }
    
    // Replace the request property with validated and cleaned data
    req[property] = value;
    next();
  };
}; 