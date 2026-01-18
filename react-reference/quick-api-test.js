#!/usr/bin/env node

/**
 * Quick Fraud Detection API Test
 * Tests the API design and logic without dependencies
 */

// Mock fraud detection rules
const fraudRules = [
  {
    id: 'excessive_voids',
    name: 'Excessive Voids',
    description: 'Detects excessive void transactions',
    severity: 'HIGH',
    enabled: true,
    threshold: 3,
    timeWindow: 3600, // 1 hour in seconds
    conditions: {
      eventType: 'void',
      timeWindow: '1h',
      threshold: 3
    }
  },
  {
    id: 'high_discount',
    name: 'High Discount',
    description: 'Detects high discount percentages',
    severity: 'HIGH', 
    enabled: true,
    threshold: 30, // 30% discount
    conditions: {
      eventType: 'discount_applied',
      discountPercent: '>30'
    }
  },
  {
    id: 'excessive_returns',
    name: 'Excessive Returns',
    description: 'Detects excessive return transactions',
    severity: 'MEDIUM',
    enabled: true,
    threshold: 2,
    timeWindow: 1800, // 30 minutes
    conditions: {
      eventType: 'return',
      timeWindow: '30m',
      threshold: 2
    }
  }
];

// Mock sliding window storage
const slidingWindows = new Map();

// Mock fraud flags storage
const fraudFlags = [];

// Fraud detection engine
class FraudDetectionEngine {
  constructor() {
    this.rules = fraudRules;
  }

  // Evaluate a POS event against fraud rules
  evaluateEvent(event) {
    console.log(`🔍 Evaluating event: ${event.eventType} from ${event.posId}`);
    
    const triggeredRules = [];
    
    for (const rule of this.rules) {
      if (!rule.enabled) continue;
      
      const isTriggered = this.evaluateRule(rule, event);
      if (isTriggered) {
        triggeredRules.push(rule);
        this.createFraudFlag(rule, event);
      }
    }
    
    return {
      eventId: event.eventId,
      triggeredRules: triggeredRules.length,
      rules: triggeredRules.map(r => r.name),
      riskScore: this.calculateRiskScore(triggeredRules),
      timestamp: new Date().toISOString()
    };
  }

  // Evaluate a specific rule against an event
  evaluateRule(rule, event) {
    switch (rule.id) {
      case 'excessive_voids':
        return this.evaluateExcessiveVoids(rule, event);
      case 'high_discount':
        return this.evaluateHighDiscount(rule, event);
      case 'excessive_returns':
        return this.evaluateExcessiveReturns(rule, event);
      default:
        return false;
    }
  }

  // Check excessive voids rule
  evaluateExcessiveVoids(rule, event) {
    if (event.eventType !== 'void') return false;
    
    const key = `${event.cashierId}_voids`;
    const now = Date.now();
    const windowMs = rule.timeWindow * 1000;
    
    if (!slidingWindows.has(key)) {
      slidingWindows.set(key, []);
    }
    
    const window = slidingWindows.get(key);
    
    // Add current event
    window.push(now);
    
    // Clean old events outside time window
    const cutoff = now - windowMs;
    const validEvents = window.filter(timestamp => timestamp > cutoff);
    slidingWindows.set(key, validEvents);
    
    console.log(`  📊 Voids by ${event.cashierId}: ${validEvents.length}/${rule.threshold}`);
    
    return validEvents.length >= rule.threshold;
  }

  // Check high discount rule
  evaluateHighDiscount(rule, event) {
    if (event.eventType !== 'discount_applied') return false;
    
    const discountPercent = (event.discountAmount / event.orderTotal) * 100;
    console.log(`  📊 Discount: ${discountPercent.toFixed(1)}% (threshold: ${rule.threshold}%)`);
    
    return discountPercent > rule.threshold;
  }

  // Check excessive returns rule
  evaluateExcessiveReturns(rule, event) {
    if (event.eventType !== 'return') return false;
    
    const key = `${event.cashierId}_returns`;
    const now = Date.now();
    const windowMs = rule.timeWindow * 1000;
    
    if (!slidingWindows.has(key)) {
      slidingWindows.set(key, []);
    }
    
    const window = slidingWindows.get(key);
    window.push(now);
    
    const cutoff = now - windowMs;
    const validEvents = window.filter(timestamp => timestamp > cutoff);
    slidingWindows.set(key, validEvents);
    
    console.log(`  📊 Returns by ${event.cashierId}: ${validEvents.length}/${rule.threshold}`);
    
    return validEvents.length >= rule.threshold;
  }

  // Create fraud flag
  createFraudFlag(rule, event) {
    const flag = {
      id: `flag_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ruleName: rule.name,
      ruleId: rule.id,
      severity: rule.severity,
      eventId: event.eventId,
      posId: event.posId,
      cashierId: event.cashierId,
      merchantId: event.merchantId,
      storeId: event.storeId,
      details: {
        eventType: event.eventType,
        orderTotal: event.orderTotal,
        metadata: event.metadata
      },
      createdAt: new Date().toISOString(),
      status: 'PENDING'
    };
    
    fraudFlags.push(flag);
    console.log(`  🚨 FRAUD FLAG: ${rule.name} (${rule.severity})`);
    
    return flag;
  }

  // Calculate risk score
  calculateRiskScore(triggeredRules) {
    let score = 0;
    for (const rule of triggeredRules) {
      switch (rule.severity) {
        case 'HIGH': score += 50; break;
        case 'MEDIUM': score += 25; break;
        case 'LOW': score += 10; break;
      }
    }
    return Math.min(score, 100); // Cap at 100
  }

  // Get all fraud flags
  getFraudFlags() {
    return fraudFlags.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  // Get fraud rules
  getFraudRules() {
    return this.rules;
  }
}

// Test scenarios
function runTests() {
  console.log('🛡️  Fraud Detection Engine Test');
  console.log('================================\n');
  
  const engine = new FraudDetectionEngine();
  
  console.log('📋 Available Fraud Rules:');
  engine.getFraudRules().forEach(rule => {
    console.log(`  ✅ ${rule.name} (${rule.severity}) - ${rule.enabled ? 'ENABLED' : 'DISABLED'}`);
  });
  
  console.log('\n🧪 Test Scenarios:\n');
  
  // Test 1: Excessive Voids
  console.log('Test 1: Excessive Voids');
  console.log('------------------------');
  for (let i = 1; i <= 3; i++) {
    const voidEvent = {
      eventId: `void_test_${i}`,
      posId: 'POS-001',
      merchantId: 'merchant-123',
      storeId: 'store-456',
      cashierId: 'cashier-suspicious',
      eventType: 'void',
      timestamp: new Date().toISOString(),
      transactionId: `txn_void_${i}`,
      orderTotal: 15.99,
      metadata: { voidReason: 'error' }
    };
    
    const result = engine.evaluateEvent(voidEvent);
    console.log(`  Result: ${result.triggeredRules} rules triggered, Risk Score: ${result.riskScore}`);
  }
  
  // Test 2: High Discount
  console.log('\nTest 2: High Discount');
  console.log('---------------------');
  const discountEvent = {
    eventId: 'discount_test_001',
    posId: 'POS-002',
    merchantId: 'merchant-123',
    storeId: 'store-456',
    cashierId: 'cashier-discount',
    eventType: 'discount_applied',
    timestamp: new Date().toISOString(),
    transactionId: 'txn_discount_001',
    orderTotal: 100.00,
    discountAmount: 40.00,
    metadata: { discountType: 'manual' }
  };
  
  const discountResult = engine.evaluateEvent(discountEvent);
  console.log(`  Result: ${discountResult.triggeredRules} rules triggered, Risk Score: ${discountResult.riskScore}`);
  
  // Test 3: Excessive Returns
  console.log('\nTest 3: Excessive Returns');
  console.log('-------------------------');
  for (let i = 1; i <= 2; i++) {
    const returnEvent = {
      eventId: `return_test_${i}`,
      posId: 'POS-003',
      merchantId: 'merchant-123',
      storeId: 'store-456',
      cashierId: 'cashier-returns',
      eventType: 'return',
      timestamp: new Date().toISOString(),
      transactionId: `txn_return_${i}`,
      orderTotal: 50.00,
      metadata: { returnReason: 'defective' }
    };
    
    const result = engine.evaluateEvent(returnEvent);
    console.log(`  Result: ${result.triggeredRules} rules triggered, Risk Score: ${result.riskScore}`);
  }
  
  // Show fraud flags
  console.log('\n🚨 Generated Fraud Flags:');
  console.log('==========================');
  const flags = engine.getFraudFlags();
  if (flags.length === 0) {
    console.log('  No fraud flags generated');
  } else {
    flags.forEach((flag, index) => {
      console.log(`  ${index + 1}. ${flag.ruleName} (${flag.severity}) - ${flag.posId} - ${flag.cashierId}`);
      console.log(`     Event: ${flag.eventId} at ${flag.createdAt}`);
    });
  }
  
  console.log('\n✅ Test completed successfully!');
  console.log('\n💡 This demonstrates the fraud detection logic.');
  console.log('   Next: Install dependencies and test full backend API');
}

// Run the tests
runTests(); 