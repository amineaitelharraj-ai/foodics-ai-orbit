/**
 * Fraud Detection Service
 * 
 * Implements the core fraud detection logic using a Marble-inspired rule engine
 * with sliding window counters and complex event processing capabilities.
 */

import { EventEmitter } from 'events';
import { 
  ValidatedPOSEvent, 
  FraudRule, 
  RuleEvaluationResult, 
  RuleEngineResponse,
  RuleEvaluationContext,
  FraudFlag,
  FraudSeverity,
  FraudFlagStatus,
  RuleFamily,
  RuleResult,
  CashierStats,
  BranchStats,
  TimeContext,
  ShiftContext
} from '../types/fraud-events';
import { Logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

interface SlidingWindowBucket {
  timestamp: number;
  count: number;
  events: ValidatedPOSEvent[];
}

interface RuleCounter {
  ruleId: string;
  key: string; // cashierId, branchId, etc.
  buckets: SlidingWindowBucket[];
  windowDurationMs: number;
  bucketSizeMs: number;
}

interface FraudDetectionConfig {
  maxRuleExecutionTimeMs: number;
  maxConcurrentEvaluations: number;
  slidingWindowCleanupIntervalMs: number;
  enableMLEnrichment: boolean;
  defaultRiskThreshold: number;
}

/**
 * Core fraud detection service implementing Marble-like rule engine
 */
export class FraudDetectionService extends EventEmitter {
  private rules: Map<string, FraudRule> = new Map();
  private ruleCounters: Map<string, RuleCounter> = new Map();
  private logger: Logger;
  private config: FraudDetectionConfig;
  private cleanupTimer: NodeJS.Timeout | null = null;
  // Queue for managing concurrent evaluations (future use)
  // private evaluationQueue: Array<() => Promise<void>> = [];
  // private currentEvaluations: number = 0;

  constructor(logger: Logger, config?: Partial<FraudDetectionConfig>) {
    super();
    this.logger = logger;
    this.config = {
      maxRuleExecutionTimeMs: 50, // Sub-50ms as per requirements
      maxConcurrentEvaluations: 100,
      slidingWindowCleanupIntervalMs: 300000, // 5 minutes
      enableMLEnrichment: false,
      defaultRiskThreshold: 75,
      ...config
    };

    this.startCleanupTimer();
    this.loadDefaultRules();
  }

  /**
   * Load default fraud detection rules as specified in requirements
   */
  private loadDefaultRules(): void {
    const defaultRules: Omit<FraudRule, 'id' | 'createdAt' | 'updatedAt' | 'executionCount' | 'lastExecuted' | 'averageExecutionTimeMs'>[] = [
      {
        name: 'Excessive Voids',
        description: '3 voids in 1 hour by same cashier',
        ruleFamily: RuleFamily.VOIDS_RETURNS,
        threshold: { type: 'count', value: 3, operator: 'gte' },
        timeWindow: { duration: 1, unit: 'hours' },
        severity: FraudSeverity.HIGH,
        enabled: true,
        version: '1.0.0',
        createdBy: 'system',
        conditions: [
          { field: 'eventType', operator: 'eq', value: 'VOID' }
        ],
        actions: [
          { type: 'flag', priority: 1 },
          { type: 'alert', target: 'manager', priority: 2 }
        ]
      },
      {
        name: 'High Discount Percentage',
        description: 'Discount greater than 30%',
        ruleFamily: RuleFamily.DISCOUNTS,
        threshold: { type: 'percentage', value: 30, operator: 'gt' },
        severity: FraudSeverity.HIGH,
        enabled: true,
        version: '1.0.0',
        createdBy: 'system',
        conditions: [
          { field: 'eventType', operator: 'eq', value: 'DISCOUNT' },
          { field: 'discountPct', operator: 'gt', value: 30 }
        ],
        actions: [
          { type: 'flag', priority: 1 },
          { type: 'alert', target: 'manager', priority: 2 }
        ]
      },
      {
        name: 'Excessive Returns',
        description: '2 returns in 30 minutes by same cashier',
        ruleFamily: RuleFamily.VOIDS_RETURNS,
        threshold: { type: 'count', value: 2, operator: 'gte' },
        timeWindow: { duration: 30, unit: 'minutes' },
        severity: FraudSeverity.MEDIUM,
        enabled: true,
        version: '1.0.0',
        createdBy: 'system',
        conditions: [
          { field: 'eventType', operator: 'eq', value: 'RETURN' }
        ],
        actions: [
          { type: 'flag', priority: 1 },
          { type: 'log', priority: 3 }
        ]
      },
      {
        name: 'Test Discount Trigger',
        description: 'Discount above 30% triggers immediately',
        ruleFamily: RuleFamily.DISCOUNTS,
        threshold: { type: 'percentage', value: 30, operator: 'gt' },
        severity: FraudSeverity.HIGH,
        enabled: true,
        version: '1.0.0',
        createdBy: 'system',
        conditions: [
          { field: 'eventType', operator: 'eq', value: 'DISCOUNT' },
          { field: 'discountPct', operator: 'gt', value: 30 }
        ],
        actions: [
          { type: 'flag', priority: 1 },
          { type: 'alert', target: 'manager', priority: 2 }
        ]
      },
      {
        name: 'Excessive Receipt Reprints',
        description: '3 reprints per order',
        ruleFamily: RuleFamily.REPRINTS,
        threshold: { type: 'count', value: 3, operator: 'gte' },
        severity: FraudSeverity.MEDIUM,
        enabled: true,
        version: '1.0.0',
        createdBy: 'system',
        conditions: [
          { field: 'eventType', operator: 'eq', value: 'REPRINT' }
        ],
        actions: [
          { type: 'flag', priority: 1 }
        ]
      },
      {
        name: 'Off-hours Activity',
        description: 'POS activity outside business hours',
        ruleFamily: RuleFamily.TIMING_OFF_PEAK,
        threshold: { type: 'count', value: 1, operator: 'gte' },
        severity: FraudSeverity.LOW,
        enabled: true,
        version: '1.0.0',
        createdBy: 'system',
        conditions: [
          { field: 'isBusinessHours', operator: 'eq', value: false }
        ],
        actions: [
          { type: 'flag', priority: 1 },
          { type: 'log', priority: 2 }
        ]
      },
      {
        name: 'Large Cash Transactions',
        description: 'Cash transactions over $500',
        ruleFamily: RuleFamily.CASH_HANDLING,
        threshold: { type: 'amount', value: 500, operator: 'gt', unit: 'currency' },
        severity: FraudSeverity.MEDIUM,
        enabled: false, // Disabled by default as per requirements
        version: '1.0.0',
        createdBy: 'system',
        conditions: [
          { field: 'eventType', operator: 'eq', value: 'CASH_REFUND' },
          { field: 'amount', operator: 'gt', value: 500 }
        ],
        actions: [
          { type: 'flag', priority: 1 },
          { type: 'notify', target: 'manager', priority: 2 }
        ]
      }
    ];

    // Add default rules to the system
    defaultRules.forEach(ruleData => {
      const rule: FraudRule = {
        ...ruleData,
        id: uuidv4(),
        createdAt: new Date(),
        updatedAt: new Date(),
        executionCount: 0,
        averageExecutionTimeMs: 0
      };
      this.addRule(rule);
    });

    this.logger.info('Loaded default fraud detection rules', {
      ruleCount: defaultRules.length
    });
  }

  /**
   * Process a POS event through the fraud detection engine
   */
  async processEvent(event: ValidatedPOSEvent): Promise<RuleEngineResponse> {
    const startTime = Date.now();
    const response: RuleEngineResponse = {
      eventId: event.eventId,
      results: [],
      executionTimeMs: 0,
      flagsGenerated: 0,
      actionsTriggered: []
    };

    try {
      // Build evaluation context
      const context = await this.buildEvaluationContext(event);

      // Evaluate all enabled rules
      const enabledRules = Array.from(this.rules.values()).filter(rule => rule.enabled);
      
      for (const rule of enabledRules) {
        try {
          this.logger.debug('Evaluating rule', {
            ruleId: rule.id,
            ruleName: rule.name,
            eventType: event.eventType,
            eventId: event.eventId
          });

          const ruleResult = await this.evaluateRule(rule, context);
          response.results.push(ruleResult);

          this.logger.debug('Rule evaluation result', {
            ruleId: rule.id,
            ruleName: rule.name,
            triggered: ruleResult.triggered,
            result: ruleResult.result,
            evidence: ruleResult.evidence
          });

          // Update rule statistics
          this.updateRuleStats(rule.id, ruleResult.executionTimeMs);

          // If rule triggered, create fraud flag and execute actions
          if (ruleResult.triggered) {
            response.flagsGenerated++;
            this.logger.info('🚨 FRAUD RULE TRIGGERED!', {
              ruleId: rule.id,
              ruleName: rule.name,
              eventId: event.eventId,
              severity: rule.severity
            });
            await this.handleRuleViolation(rule, event, ruleResult, response);
          }

        } catch (error) {
          this.logger.error('Rule evaluation failed', {
            ruleId: rule.id,
            ruleName: rule.name,
            eventId: event.eventId,
            error: error instanceof Error ? error.message : 'Unknown error'
          });

          response.results.push({
            ruleId: rule.id,
            ruleName: rule.name,
            result: RuleResult.ERROR,
            triggered: false,
            confidence: 0,
            evidence: {},
            executionTimeMs: Date.now() - startTime,
            error: error instanceof Error ? error.message : 'Rule evaluation failed'
          });
        }
      }

      response.executionTimeMs = Date.now() - startTime;

      this.logger.debug('Event processing completed', {
        eventId: event.eventId,
        rulesEvaluated: enabledRules.length,
        flagsGenerated: response.flagsGenerated,
        executionTimeMs: response.executionTimeMs
      });

      this.emit('eventProcessed', { event, response });
      return response;

    } catch (error) {
      response.executionTimeMs = Date.now() - startTime;
      response.errors = [error instanceof Error ? error.message : 'Unknown error'];
      
      this.logger.error('Event processing failed', {
        eventId: event.eventId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      throw error;
    }
  }

  /**
   * Build evaluation context for rule processing
   */
  private async buildEvaluationContext(event: ValidatedPOSEvent): Promise<RuleEvaluationContext> {
    // Get historical events for pattern analysis
    const historicalEvents = await this.getHistoricalEvents(event.cashierId, event.branchId);
    
    // Build cashier statistics
    const cashierStats = this.buildCashierStats(event.cashierId, historicalEvents);
    
    // Build branch statistics  
    const branchStats = await this.buildBranchStats(event.branchId);
    
    // Build time context
    const timeContext = this.buildTimeContext(event);
    
    // Get shift context if available
    const shiftContext = event.shiftId ? await this.getShiftContext(event.shiftId) : undefined;

    return {
      event,
      historicalEvents,
      cashierStats,
      branchStats,
      timeContext,
      shiftContext
    };
  }

  /**
   * Evaluate a single rule against the event context
   */
  private async evaluateRule(
    rule: FraudRule, 
    context: RuleEvaluationContext
  ): Promise<RuleEvaluationResult> {
    const startTime = Date.now();
    const result: RuleEvaluationResult = {
      ruleId: rule.id,
      ruleName: rule.name,
      result: RuleResult.PASS,
      triggered: false,
      confidence: 1.0,
      evidence: {},
      executionTimeMs: 0
    };

    try {
      // Check basic conditions first
      const conditionsMet = this.evaluateConditions(rule.conditions, context);
      if (!conditionsMet.passed) {
        result.evidence = conditionsMet.evidence;
        result.executionTimeMs = Date.now() - startTime;
        return result;
      }

      // For sliding window rules, check against counters
      if (rule.timeWindow) {
        const counterResult = await this.evaluateSlidingWindow(rule, context);
        result.triggered = counterResult.triggered;
        result.evidence = { ...result.evidence, ...counterResult.evidence };
        result.thresholdMet = counterResult.thresholdMet ?? false;
        result.currentValue = counterResult.currentValue;
        result.thresholdValue = rule.threshold.value;
      } else {
        // Direct threshold evaluation
        const thresholdResult = this.evaluateThreshold(rule, context);
        result.triggered = thresholdResult.triggered;
        result.evidence = { ...result.evidence, ...thresholdResult.evidence };
        result.thresholdMet = thresholdResult.thresholdMet ?? false;
      }

      result.result = result.triggered ? RuleResult.FAIL : RuleResult.PASS;
      result.executionTimeMs = Date.now() - startTime;

      // Update sliding window counter if needed
      if (rule.timeWindow && conditionsMet.passed) {
        this.updateSlidingWindow(rule, context.event);
      }

      return result;

    } catch (error) {
      result.result = RuleResult.ERROR;
      result.error = error instanceof Error ? error.message : 'Rule evaluation error';
      result.executionTimeMs = Date.now() - startTime;
      return result;
    }
  }

  /**
   * Evaluate rule conditions against event context
   */
  private evaluateConditions(
    conditions: any[], 
    context: RuleEvaluationContext
  ): { passed: boolean; evidence: Record<string, any> } {
    const evidence: Record<string, any> = {};
    let allConditionsMet = true;

    for (const condition of conditions) {
      const fieldValue = this.getFieldValue(condition.field, context);
      const conditionMet = this.evaluateCondition(condition, fieldValue);
      
      this.logger.debug('Condition evaluation', {
        field: condition.field,
        operator: condition.operator,
        expected: condition.value,
        actual: fieldValue,
        met: conditionMet
      });
      
      evidence[condition.field] = {
        expected: condition.value,
        actual: fieldValue,
        operator: condition.operator,
        met: conditionMet
      };

      if (!conditionMet) {
        allConditionsMet = false;
      }
    }

    return { passed: allConditionsMet, evidence };
  }

  /**
   * Evaluate sliding window counters for time-based rules
   */
  private async evaluateSlidingWindow(
    rule: FraudRule, 
    context: RuleEvaluationContext
  ): Promise<{ triggered: boolean; evidence: Record<string, any>; thresholdMet?: boolean; currentValue?: number }> {
    const counterKey = this.getCounterKey(rule, context.event);
    const counter = this.getOrCreateCounter(rule.id, counterKey, rule.timeWindow!);
    
    // Clean old buckets
    this.cleanupOldBuckets(counter);
    
    // Count events in current window
    const currentCount = this.getWindowCount(counter);
    const thresholdMet = this.compareWithThreshold(currentCount, rule.threshold);
    
    return {
      triggered: thresholdMet,
      evidence: {
        windowCount: currentCount,
        threshold: rule.threshold.value,
        operator: rule.threshold.operator,
        windowDuration: `${rule.timeWindow!.duration} ${rule.timeWindow!.unit}`,
        counterKey
      },
      thresholdMet,
      currentValue: currentCount
    };
  }

  /**
   * Evaluate direct thresholds (non-time-window rules)
   */
  private evaluateThreshold(
    rule: FraudRule, 
    context: RuleEvaluationContext
  ): { triggered: boolean; evidence: Record<string, any>; thresholdMet?: boolean } {
    let currentValue: any;
    
    switch (rule.threshold.type) {
      case 'percentage':
        currentValue = context.event.discountPct || 0;
        break;
      case 'amount':
        currentValue = Math.abs(context.event.amount || 0);
        break;
      case 'count':
        currentValue = 1; // Single event
        break;
      default:
        currentValue = 1;
    }

    const thresholdMet = this.compareWithThreshold(currentValue, rule.threshold);

    return {
      triggered: thresholdMet,
      evidence: {
        currentValue,
        threshold: rule.threshold.value,
        operator: rule.threshold.operator,
        type: rule.threshold.type
      },
      thresholdMet
    };
  }

  /**
   * Compare value against threshold with operator
   */
  private compareWithThreshold(value: number, threshold: any): boolean {
    switch (threshold.operator) {
      case 'gt': return value > threshold.value;
      case 'gte': return value >= threshold.value;
      case 'lt': return value < threshold.value;
      case 'lte': return value <= threshold.value;
      case 'eq': return value === threshold.value;
      case 'neq': return value !== threshold.value;
      default: return false;
    }
  }

  /**
   * Handle rule violation by creating fraud flag and executing actions
   */
  private async handleRuleViolation(
    rule: FraudRule,
    event: ValidatedPOSEvent,
    ruleResult: RuleEvaluationResult,
    response: RuleEngineResponse
  ): Promise<void> {
    // Create fraud flag
    const fraudFlag: FraudFlag = {
      id: uuidv4(),
      eventId: event.eventId,
      ruleId: rule.id,
      ruleName: rule.name,
      ruleVersion: rule.version,
      branchId: event.branchId,
      cashierId: event.cashierId,
      posDeviceId: event.posDeviceId,
      orderId: event.orderId || '',
      severity: rule.severity,
      status: FraudFlagStatus.PENDING,
      description: rule.description,
      evidence: ruleResult.evidence,
      flaggedAt: new Date(),
      actionsTaken: [],
      riskScore: this.calculateRiskScore(rule, ruleResult)
    };

    // Execute rule actions
    for (const action of rule.actions) {
      try {
        const actionResult = await this.executeAction(action, fraudFlag, event);
        fraudFlag.actionsTaken.push(actionResult);
        response.actionsTriggered.push(actionResult);
      } catch (error) {
        this.logger.error('Action execution failed', {
          ruleId: rule.id,
          actionType: action.type,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    this.emit('fraudFlagCreated', fraudFlag);
    this.logger.info('Fraud flag created', {
      flagId: fraudFlag.id,
      ruleId: rule.id,
      ruleName: rule.name,
      severity: rule.severity,
      eventId: event.eventId
    });
  }

  /**
   * Calculate risk score based on rule and evaluation result
   */
  private calculateRiskScore(rule: FraudRule, result: RuleEvaluationResult): number {
    let baseScore = 0;
    
    switch (rule.severity) {
      case FraudSeverity.CRITICAL: baseScore = 90; break;
      case FraudSeverity.HIGH: baseScore = 75; break;
      case FraudSeverity.MEDIUM: baseScore = 50; break;
      case FraudSeverity.LOW: baseScore = 25; break;
    }

    // Adjust based on how much threshold was exceeded
    if (result.currentValue && result.thresholdValue) {
      const exceedRatio = result.currentValue / result.thresholdValue;
      if (exceedRatio > 1.5) baseScore = Math.min(100, baseScore + 10);
      if (exceedRatio > 2) baseScore = Math.min(100, baseScore + 15);
    }

    return Math.max(0, Math.min(100, baseScore));
  }

  /**
   * Execute a rule action
   */
  private async executeAction(action: any, flag: FraudFlag, event: ValidatedPOSEvent): Promise<any> {
    const startTime = Date.now();
    
    // Placeholder for action execution - integrate with actual systems
    const actionResult = {
      type: action.type,
      timestamp: new Date(),
      target: action.target || event.posDeviceId,
      payload: {
        flagId: flag.id,
        severity: flag.severity,
        description: flag.description,
        ...action.payload
      },
      success: true,
      responseTime: Date.now() - startTime
    };

    this.logger.debug('Action executed', {
      actionType: action.type,
      flagId: flag.id,
      target: actionResult.target
    });

    return actionResult;
  }

  // Helper methods for sliding window management
  private getCounterKey(rule: FraudRule, event: ValidatedPOSEvent): string {
    // Key format: ruleId:groupingField:value
    return `${rule.id}:cashier:${event.cashierId}`;
  }

  private getOrCreateCounter(ruleId: string, key: string, timeWindow: any): RuleCounter {
    const fullKey = `${ruleId}:${key}`;
    
    if (!this.ruleCounters.has(fullKey)) {
      const windowMs = this.convertTimeWindowToMs(timeWindow);
      this.ruleCounters.set(fullKey, {
        ruleId,
        key,
        buckets: [],
        windowDurationMs: windowMs,
        bucketSizeMs: Math.max(60000, windowMs / 10) // 10 buckets or 1 minute minimum
      });
    }
    
    return this.ruleCounters.get(fullKey)!;
  }

  private convertTimeWindowToMs(timeWindow: any): number {
    const { duration, unit } = timeWindow;
    switch (unit) {
      case 'minutes': return duration * 60 * 1000;
      case 'hours': return duration * 60 * 60 * 1000;
      case 'days': return duration * 24 * 60 * 60 * 1000;
      default: return duration * 60 * 1000; // Default to minutes
    }
  }

  private updateSlidingWindow(rule: FraudRule, event: ValidatedPOSEvent): void {
    const counterKey = this.getCounterKey(rule, event);
    const counter = this.getOrCreateCounter(rule.id, counterKey, rule.timeWindow!);
    
    const now = Date.now();
    const bucketTime = Math.floor(now / counter.bucketSizeMs) * counter.bucketSizeMs;
    
    // Find or create bucket for current time
    let bucket = counter.buckets.find(b => b.timestamp === bucketTime);
    if (!bucket) {
      bucket = { timestamp: bucketTime, count: 0, events: [] };
      counter.buckets.push(bucket);
    }
    
    bucket.count++;
    bucket.events.push(event);
  }

  private cleanupOldBuckets(counter: RuleCounter): void {
    const cutoffTime = Date.now() - counter.windowDurationMs;
    counter.buckets = counter.buckets.filter(bucket => bucket.timestamp >= cutoffTime);
  }

  private getWindowCount(counter: RuleCounter): number {
    return counter.buckets.reduce((sum, bucket) => sum + bucket.count, 0);
  }

  // Stub methods for context building (implement based on your data layer)
  private async getHistoricalEvents(_cashierId: string, _branchId: string): Promise<ValidatedPOSEvent[]> {
    // TODO: Implement database query for historical events
    return [];
  }

  private buildCashierStats(cashierId: string, events: ValidatedPOSEvent[]): CashierStats {
    return {
      cashierId,
      totalTransactions: events.length,
      voidCount: events.filter(e => e.eventType === 'VOID').length,
      returnCount: events.filter(e => e.eventType === 'RETURN').length,
      discountCount: events.filter(e => e.eventType === 'DISCOUNT').length,
      reprintCount: events.filter(e => e.eventType === 'REPRINT').length,
      averageTransactionValue: 0, // Calculate from events
      suspiciousActivityScore: 0, // ML-derived score
      lastActive: new Date()
    };
  }

  private async buildBranchStats(branchId: string): Promise<BranchStats> {
    return {
      branchId,
      dailyTransactionCount: 0,
      averageTransactionValue: 0,
      peakHours: [{ start: 12, end: 14 }, { start: 18, end: 20 }],
      timezone: 'UTC',
      operatingHours: { open: 9, close: 22 }
    };
  }

  private buildTimeContext(event: ValidatedPOSEvent): TimeContext {
    const now = new Date(event.businessTime);
    const hour = now.getHours();
    
    return {
      localTime: now,
      businessTime: now,
      timezone: 'UTC',
      isBusinessHours: hour >= 9 && hour <= 22,
      isPeakHour: (hour >= 12 && hour <= 14) || (hour >= 18 && hour <= 20),
      dayOfWeek: now.getDay(),
      isHoliday: false // Implement holiday detection
    };
  }

  private async getShiftContext(_shiftId: string): Promise<ShiftContext | undefined> {
    // TODO: Implement shift data retrieval
    return undefined;
  }

  private getFieldValue(field: string, context: RuleEvaluationContext): any {
    if (field.startsWith('event.')) {
      const eventField = field.substring(6);
      return (context.event as any)[eventField];
    }
    
    if (field === 'isBusinessHours') {
      return context.timeContext.isBusinessHours;
    }
    
    return (context.event as any)[field];
  }

  private evaluateCondition(condition: any, value: any): boolean {
    switch (condition.operator) {
      case 'eq': return value === condition.value;
      case 'neq': return value !== condition.value;
      case 'gt': return value > condition.value;
      case 'gte': return value >= condition.value;
      case 'lt': return value < condition.value;
      case 'lte': return value <= condition.value;
      case 'in': return Array.isArray(condition.value) && condition.value.includes(value);
      case 'contains': return String(value).includes(condition.value);
      case 'regex': return new RegExp(condition.value).test(String(value));
      default: return false;
    }
  }

  private updateRuleStats(ruleId: string, executionTimeMs: number): void {
    const rule = this.rules.get(ruleId);
    if (rule) {
      rule.executionCount++;
      rule.lastExecuted = new Date();
      
      // Update average execution time
      const totalTime = rule.averageExecutionTimeMs * (rule.executionCount - 1) + executionTimeMs;
      rule.averageExecutionTimeMs = totalTime / rule.executionCount;
    }
  }

  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanupSlidingWindows();
    }, this.config.slidingWindowCleanupIntervalMs);
  }

  private cleanupSlidingWindows(): void {
    for (const counter of this.ruleCounters.values()) {
      this.cleanupOldBuckets(counter);
    }
    
    this.logger.debug('Sliding window cleanup completed', {
      activeCounters: this.ruleCounters.size
    });
  }

  /**
   * Public API methods
   */
  addRule(rule: FraudRule): void {
    this.rules.set(rule.id, rule);
    this.logger.info('Rule added', { ruleId: rule.id, ruleName: rule.name });
  }

  removeRule(ruleId: string): boolean {
    const removed = this.rules.delete(ruleId);
    if (removed) {
      this.logger.info('Rule removed', { ruleId });
    }
    return removed;
  }

  updateRule(ruleId: string, updates: Partial<FraudRule>): boolean {
    const rule = this.rules.get(ruleId);
    if (rule) {
      Object.assign(rule, updates, { updatedAt: new Date() });
      this.logger.info('Rule updated', { ruleId, ruleName: rule.name });
      return true;
    }
    return false;
  }

  getRules(): FraudRule[] {
    return Array.from(this.rules.values());
  }

  getRule(ruleId: string): FraudRule | undefined {
    return this.rules.get(ruleId);
  }

  async shutdown(): Promise<void> {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    this.ruleCounters.clear();
    this.rules.clear();
    this.logger.info('Fraud detection service shut down');
  }
} 