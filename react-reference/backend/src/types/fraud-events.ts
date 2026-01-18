/**
 * Fraud Detection Event Types and Schemas
 * 
 * This module defines the data contracts between POS devices and the Fraud Service
 * as specified in the fraud detection requirements.
 */

// Core Event Types Enum
export enum EventType {
  VOID = 'VOID',
  RETURN = 'RETURN',
  DISCOUNT = 'DISCOUNT',
  REPRINT = 'REPRINT',
  CASH_REFUND = 'CASH_REFUND',
  CASH_DRAWER_CLOSE = 'CASH_DRAWER_CLOSE'
}

// Fraud Alert Severity Levels
export enum FraudSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Fraud Flag Status
export enum FraudFlagStatus {
  PENDING = 'pending',
  INVESTIGATING = 'investigating',
  RESOLVED = 'resolved',
  FALSE_POSITIVE = 'false_positive',
  CONFIRMED_FRAUD = 'confirmed_fraud'
}

// Rule Execution Result
export enum RuleResult {
  PASS = 'pass',
  FAIL = 'fail',
  ERROR = 'error'
}

/**
 * Core POS Event Interface
 * This represents the raw event data sent from POS devices to the fraud service
 */
export interface POSEvent {
  // Required fields as per data contract
  eventType: EventType;
  eventId: string; // UUID for idempotency
  posDeviceId: string; // Identifies terminal
  branchId: string;
  cashierId: string; // staff UUID
  createdAt: Date; // event creation timestamp
  businessTime: Date; // server canonical time
  
  // Optional fields depending on event type
  orderId?: string; // present for order-level events
  itemId?: string; // for line-item voids or discounts
  amount?: number; // signed: positive for voids, negative for refunds
  discountPct?: number; // nullable
  reason?: string; // free text reason
  shiftId?: string;
  
  // Computed server-side
  latencySeconds?: number; // computed server side
  
  // Additional metadata
  metadata?: Record<string, any>;
}

/**
 * Validated POS Event with computed fields
 */
export interface ValidatedPOSEvent extends POSEvent {
  latencySeconds: number;
  processedAt: Date;
  validationErrors?: string[];
}

/**
 * Fraud Rule Definition Interface
 */
export interface FraudRule {
  id: string;
  name: string;
  description: string;
  ruleFamily: RuleFamily;
  threshold: RuleThreshold;
  timeWindow?: TimeWindow;
  severity: FraudSeverity;
  enabled: boolean;
  version: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  
  // Rule-specific configuration
  conditions: RuleCondition[];
  actions: RuleAction[];
  
  // Performance tracking
  executionCount: number;
  lastExecuted?: Date;
  averageExecutionTimeMs: number;
}

/**
 * Rule Families as specified in requirements
 */
export enum RuleFamily {
  VOIDS_RETURNS = 'voids_returns',
  REPRINTS = 'reprints',
  DISCOUNTS = 'discounts',
  CASH_HANDLING = 'cash_handling',
  TIMING_OFF_PEAK = 'timing_off_peak'
}

/**
 * Rule Threshold Configuration
 */
export interface RuleThreshold {
  type: 'count' | 'percentage' | 'amount' | 'time';
  value: number;
  operator: 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'neq';
  unit?: 'minutes' | 'hours' | 'days' | 'transactions' | 'currency';
}

/**
 * Time Window for sliding window rules
 */
export interface TimeWindow {
  duration: number;
  unit: 'minutes' | 'hours' | 'days';
  bucketSize?: number; // for memory optimization
}

/**
 * Rule Condition Interface
 */
export interface RuleCondition {
  field: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'contains' | 'regex';
  value: any;
  logicalOperator?: 'AND' | 'OR';
}

/**
 * Rule Action Interface
 */
export interface RuleAction {
  type: 'flag' | 'alert' | 'block' | 'log' | 'notify';
  target?: string; // WebSocket topic, email, etc.
  payload?: Record<string, any>;
  priority: number;
}

/**
 * Fraud Flag Record
 */
export interface FraudFlag {
  id: string;
  eventId: string; // Reference to original POS event
  ruleId: string;
  ruleName: string;
  ruleVersion: string;
  
  // Event context
  branchId: string;
  cashierId: string;
  posDeviceId: string;
  orderId?: string;
  
  // Flag details
  severity: FraudSeverity;
  status: FraudFlagStatus;
  description: string;
  evidence: Record<string, any>; // Rule evaluation results
  
  // Timestamps
  flaggedAt: Date;
  resolvedAt?: Date;
  
  // Investigation
  investigatedBy?: string;
  investigationNotes?: string;
  resolution?: string;
  
  // Actions taken
  actionsTaken: FraudAction[];
  
  // Risk assessment
  riskScore: number; // 0-100
  falsePositiveProbability?: number; // ML-derived when available
}

/**
 * Fraud Action Record
 */
export interface FraudAction {
  type: 'toast' | 'email' | 'sms' | 'block_till' | 'manager_pin' | 'log';
  timestamp: Date;
  target: string; // POS device, email, phone, etc.
  payload: Record<string, any>;
  success: boolean;
  error?: string;
  responseTime?: number;
}

/**
 * Rule Evaluation Context
 */
export interface RuleEvaluationContext {
  event: ValidatedPOSEvent;
  historicalEvents: POSEvent[];
  cashierStats: CashierStats;
  branchStats: BranchStats;
  shiftContext?: ShiftContext;
  timeContext: TimeContext;
}

/**
 * Cashier Statistics for rule evaluation
 */
export interface CashierStats {
  cashierId: string;
  totalTransactions: number;
  voidCount: number;
  returnCount: number;
  discountCount: number;
  reprintCount: number;
  averageTransactionValue: number;
  suspiciousActivityScore: number;
  lastActive: Date;
  shiftStartTime?: Date;
}

/**
 * Branch Statistics
 */
export interface BranchStats {
  branchId: string;
  dailyTransactionCount: number;
  averageTransactionValue: number;
  peakHours: { start: number; end: number }[];
  timezone: string;
  operatingHours: { open: number; close: number };
}

/**
 * Shift Context
 */
export interface ShiftContext {
  shiftId: string;
  startTime: Date;
  endTime?: Date;
  cashierId: string;
  branchId: string;
  openingCash: number;
  currentCash?: number;
  transactionCount: number;
}

/**
 * Time Context for off-peak detection
 */
export interface TimeContext {
  localTime: Date;
  businessTime: Date;
  timezone: string;
  isBusinessHours: boolean;
  isPeakHour: boolean;
  dayOfWeek: number;
  isHoliday: boolean;
}

/**
 * Rule Engine Response
 */
export interface RuleEngineResponse {
  eventId: string;
  results: RuleEvaluationResult[];
  executionTimeMs: number;
  flagsGenerated: number;
  actionsTriggered: FraudAction[];
  errors?: string[];
}

/**
 * Individual Rule Evaluation Result
 */
export interface RuleEvaluationResult {
  ruleId: string;
  ruleName: string;
  result: RuleResult;
  triggered: boolean;
  confidence: number; // 0-1
  evidence: Record<string, any>;
  executionTimeMs: number;
  thresholdMet?: boolean;
  currentValue?: any;
  thresholdValue?: any;
  error?: string;
}

/**
 * Fraud Detection Metrics
 */
export interface FraudMetrics {
  date: Date;
  branchId?: string;
  
  // Volume metrics
  totalTransactions: number;
  flaggedTransactions: number;
  falsePositives: number;
  confirmedFraud: number;
  
  // Financial metrics
  potentialLossPrevented: number;
  actualLossAmount: number;
  
  // Performance metrics
  averageProcessingTimeMs: number;
  ruleEngineLatencyP99: number;
  alertResponseTimeMs: number;
  
  // Rule performance
  ruleAccuracy: Record<string, number>;
  ruleExecutionCount: Record<string, number>;
  
  // ML metrics (when available)
  modelAccuracy?: number;
  modelPrecision?: number;
  modelRecall?: number;
  featureDrift?: number;
}

/**
 * WebSocket Message Types for real-time communication
 */
export interface WebSocketMessage {
  type: 'fraud_alert' | 'rule_update' | 'system_status' | 'metrics_update' | 'auth_success' | 'pong' | 'error' | 'toast' | 'manager_pin_required';
  payload: any;
  timestamp: Date;
  messageId: string;
}

/**
 * Fraud Alert WebSocket Message
 */
export interface FraudAlertMessage extends WebSocketMessage {
  type: 'fraud_alert';
  payload: {
    flag: FraudFlag;
    event: ValidatedPOSEvent;
    requiredActions: FraudAction[];
  };
}

/**
 * System Configuration
 */
export interface FraudSystemConfig {
  ruleEngine: {
    type: 'marble' | 'drools' | 'opa';
    latencyThresholdMs: number;
    batchSize: number;
    windowCleanupIntervalMs: number;
  };
  
  kafka: {
    brokers: string[];
    topics: {
      fraudEventsRaw: string;
      fraudFlags: string;
    };
    consumerGroupId: string;
    batchSize: number;
  };
  
  websocket: {
    port: number;
    heartbeatInterval: number;
  };
  
  notifications: {
    email: boolean;
    sms: boolean;
    webhook: boolean;
  };
  
  ml: {
    enabled: boolean;
    modelPath?: string;
    predictionThreshold?: number;
    retrainingInterval?: number;
  };
}

/**
 * Export utility types for common patterns
 */
export type EventTypeMap = {
  [K in EventType]: K;
};

export type RuleFamilyMap = {
  [K in RuleFamily]: K;
};

export type CreatePOSEventRequest = Omit<POSEvent, 'latencySeconds' | 'processedAt'>;
export type UpdateFraudFlagRequest = Partial<Pick<FraudFlag, 'status' | 'investigationNotes' | 'resolution' | 'investigatedBy'>>;
export type CreateFraudRuleRequest = Omit<FraudRule, 'id' | 'createdAt' | 'updatedAt' | 'executionCount' | 'lastExecuted' | 'averageExecutionTimeMs'>;

/**
 * API Response wrapper interfaces
 */
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Date;
  requestId: string;
}

export interface PaginatedResponse<T> extends APIResponse<T[]> {
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
} 