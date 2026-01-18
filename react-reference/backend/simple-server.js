const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

// Set DATABASE_URL if not already set (for Railway deployment)
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'file:/tmp/fraud_detection.db';
}

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// Seed comprehensive fraud rules based on requirements
async function seedBasicFraudRules() {
  const fraudRules = [
    // Voids & Returns Rules
    {
      id: 'rule_excessive_voids',
      name: 'Excessive Voids by One User',
      description: 'More than 3 voids within 1 hour by the same cashier',
      ruleFamily: 'VOIDS_RETURNS',
      severity: 'HIGH',
      enabled: true,
      thresholdJson: JSON.stringify({ type: 'count', value: 3, operator: '>' }),
      timeWindowJson: JSON.stringify({ duration: 3600, unit: 'seconds' }),
      conditionsJson: JSON.stringify([{ field: 'eventType', operator: 'equals', value: 'void' }]),
      actionsJson: JSON.stringify([{ type: 'EMAIL_MANAGER', message: 'Alert manager via email' }, { type: 'FRAUD_REPORT', message: 'Flag in fraud report' }])
    },
    {
      id: 'rule_delayed_voids',
      name: 'Voids After Long Delay',
      description: 'Order voided more than 30 minutes after it was placed',
      ruleFamily: 'VOIDS_RETURNS',
      severity: 'MEDIUM',
      enabled: true,
      thresholdJson: JSON.stringify({ type: 'time_delay', value: 1800, operator: '>' }),
      timeWindowJson: null,
      conditionsJson: JSON.stringify([{ field: 'eventType', operator: 'equals', value: 'void' }]),
      actionsJson: JSON.stringify([{ type: 'MANAGER_PIN', message: 'Require manager PIN' }, { type: 'LOG_REASON', message: 'Log reason' }])
    },
    {
      id: 'rule_high_value_voids',
      name: 'High-Value Voided Orders',
      description: 'Void amount exceeds AED 500',
      ruleFamily: 'VOIDS_RETURNS',
      severity: 'HIGH',
      enabled: true,
      thresholdJson: JSON.stringify({ type: 'amount', value: 500, operator: '>' }),
      timeWindowJson: null,
      conditionsJson: JSON.stringify([{ field: 'eventType', operator: 'equals', value: 'void' }]),
      actionsJson: JSON.stringify([{ type: 'POS_WARNING', message: 'Prompt POS warning' }, { type: 'REALTIME_ALERT', message: 'Send real-time alert' }])
    },
    {
      id: 'rule_shift_end_voids',
      name: 'Multiple Voids Close to Shift End',
      description: '2+ voids in last 15 minutes of shift',
      ruleFamily: 'VOIDS_RETURNS',
      severity: 'HIGH',
      enabled: true,
      thresholdJson: JSON.stringify({ type: 'count', value: 2, operator: '>=' }),
      timeWindowJson: JSON.stringify({ duration: 900, unit: 'seconds' }),
      conditionsJson: JSON.stringify([{ field: 'eventType', operator: 'equals', value: 'void' }, { field: 'shift_end_proximity', operator: '<', value: 900 }]),
      actionsJson: JSON.stringify([{ type: 'MANAGER_ALERT', message: 'Alert manager' }, { type: 'EOD_REPORT', message: 'Log in end-of-day fraud report' }])
    },
    
    // Reprints Rules
    {
      id: 'rule_frequent_reprints',
      name: 'Frequent Bill Reprints by Same Cashier',
      description: 'More than 3 reprints within 30 minutes',
      ruleFamily: 'REPRINTS',
      severity: 'MEDIUM',
      enabled: true,
      thresholdJson: JSON.stringify({ type: 'count', value: 3, operator: '>' }),
      timeWindowJson: JSON.stringify({ duration: 1800, unit: 'seconds' }),
      conditionsJson: JSON.stringify([{ field: 'eventType', operator: 'equals', value: 'reprint' }]),
      actionsJson: JSON.stringify([{ type: 'LOG_EVENT', message: 'Log event' }, { type: 'NOTIFY_SUPERVISOR', message: 'Notify supervisor' }])
    },
    {
      id: 'rule_delayed_reprints',
      name: 'Reprint After Payment Completion',
      description: 'Bill reprinted 10+ minutes after payment',
      ruleFamily: 'REPRINTS',
      severity: 'MEDIUM',
      enabled: true,
      thresholdJson: JSON.stringify({ type: 'time_delay', value: 600, operator: '>' }),
      timeWindowJson: null,
      conditionsJson: JSON.stringify([{ field: 'eventType', operator: 'equals', value: 'reprint' }]),
      actionsJson: JSON.stringify([{ type: 'REASON_ENTRY', message: 'Require reason entry' }, { type: 'AUDIT_FLAG', message: 'Flag in audit report' }])
    },
    
    // Discounts Rules
    {
      id: 'rule_high_discount',
      name: 'High Discount Percentage Applied',
      description: 'Discount >30% on any item or bill',
      ruleFamily: 'DISCOUNTS', 
      severity: 'HIGH',
      enabled: true,
      thresholdJson: JSON.stringify({ type: 'percentage', value: 30, operator: '>' }),
      timeWindowJson: null,
      conditionsJson: JSON.stringify([{ field: 'eventType', operator: 'equals', value: 'discount_applied' }]),
      actionsJson: JSON.stringify([{ type: 'MANAGER_APPROVAL', message: 'Require manager approval' }])
    },
    {
      id: 'rule_frequent_discounts',
      name: 'Frequent Discounts by One Cashier',
      description: 'More than 5 discounted orders within 1 hour',
      ruleFamily: 'DISCOUNTS',
      severity: 'MEDIUM',
      enabled: true,
      thresholdJson: JSON.stringify({ type: 'count', value: 5, operator: '>' }),
      timeWindowJson: JSON.stringify({ duration: 3600, unit: 'seconds' }),
      conditionsJson: JSON.stringify([{ field: 'eventType', operator: 'equals', value: 'discount_applied' }]),
      actionsJson: JSON.stringify([{ type: 'FRAUD_DASHBOARD', message: 'Alert in fraud dashboard' }])
    },
    
    // Cash Handling Rules
    {
      id: 'rule_multiple_cash_refunds',
      name: 'Multiple Cash Refunds in a Short Span',
      description: 'More than 2 cash refunds within 15 minutes',
      ruleFamily: 'CASH_HANDLING',
      severity: 'HIGH',
      enabled: true,
      thresholdJson: JSON.stringify({ type: 'count', value: 2, operator: '>' }),
      timeWindowJson: JSON.stringify({ duration: 900, unit: 'seconds' }),
      conditionsJson: JSON.stringify([{ field: 'eventType', operator: 'equals', value: 'cash_refund' }]),
      actionsJson: JSON.stringify([{ type: 'BLOCK_REFUND', message: 'Block refund' }, { type: 'MANAGER_ALERT', message: 'Send alert to manager' }])
    },
    {
      id: 'rule_cash_drawer_mismatch',
      name: 'Mismatch in Cash Drawer vs. POS Logs',
      description: 'Declared cash short by >5% during shift close',
      ruleFamily: 'CASH_HANDLING',
      severity: 'CRITICAL',
      enabled: true,
      thresholdJson: JSON.stringify({ type: 'percentage', value: 5, operator: '>' }),
      timeWindowJson: null,
      conditionsJson: JSON.stringify([{ field: 'eventType', operator: 'equals', value: 'shift_close' }]),
      actionsJson: JSON.stringify([{ type: 'LOCK_TILL', message: 'Lock till' }, { type: 'REQUIRE_AUDIT', message: 'Require audit' }])
    },
    
    // Custom Timing Rules
    {
      id: 'rule_offpeak_suspicious',
      name: 'Suspicious Activity During Off-Peak Hours',
      description: 'Void or refund between 1 AM – 5 AM',
      ruleFamily: 'TIMING',
      severity: 'HIGH',
      enabled: true,
      thresholdJson: JSON.stringify({ type: 'time_range', start: '01:00', end: '05:00' }),
      timeWindowJson: null,
      conditionsJson: JSON.stringify([{ field: 'eventType', operator: 'in', value: ['void', 'return', 'cash_refund'] }]),
      actionsJson: JSON.stringify([{ type: 'AUTO_FLAG', message: 'Auto-flag transaction' }, { type: 'OWNER_ALERT', message: 'Alert business owner' }])
    }
  ];

  for (const rule of fraudRules) {
    await prisma.fraudRule.upsert({
      where: { id: rule.id },
      update: { ...rule, version: '1.0' },
      create: { ...rule, version: '1.0' }
    });
  }
  console.log('🌱 Comprehensive fraud rules seeded (12 rules)');
}

// Database initialization for SQLite
async function initializeDatabase() {
  try {
    // Connect to database
    await prisma.$connect();
    console.log('🗄️ Database connected successfully');
    
    // Always try to create tables (IF NOT EXISTS ensures no duplicates)
    console.log('🔧 Ensuring database schema exists...');
    
    try {
      // Check if tables exist first
      const ruleCount = await prisma.fraudRule.count();
      console.log(`📋 Database schema exists with ${ruleCount} fraud rules`);
      if (ruleCount === 0) {
        console.log('📋 No rules found, will seed default rules');
        await seedBasicFraudRules();
      }
    } catch (error) {
      console.log('🔧 Creating database schema...', error.message);
      
      // Create tables manually for Railway deployment (matching Prisma schema exactly)
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS "fraud_rules" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "name" TEXT NOT NULL UNIQUE,
          "version" TEXT NOT NULL DEFAULT '1.0',
          "description" TEXT NOT NULL,
          "ruleFamily" TEXT NOT NULL,
          "severity" TEXT NOT NULL,
          "enabled" BOOLEAN NOT NULL DEFAULT true,
          "threshold" TEXT,
          "thresholdJson" TEXT NOT NULL,
          "timeWindowJson" TEXT,
          "conditionsJson" TEXT NOT NULL,
          "actionsJson" TEXT NOT NULL,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        )`;
        
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS "fraud_flags" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "ruleId" TEXT NOT NULL,
          "ruleName" TEXT NOT NULL,
          "eventId" TEXT NOT NULL,
          "posId" TEXT NOT NULL,
          "cashierId" TEXT NOT NULL,
          "merchantId" TEXT NOT NULL,
          "storeId" TEXT NOT NULL,
          "severity" TEXT NOT NULL,
          "status" TEXT NOT NULL DEFAULT 'PENDING',
          "description" TEXT NOT NULL,
          "evidenceJson" TEXT NOT NULL,
          "investigatedAt" DATETIME,
          "investigatedBy" TEXT,
          "investigationNotes" TEXT,
          "resolution" TEXT,
          "riskScore" INTEGER NOT NULL DEFAULT 0,
          "flaggedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        )`;
        
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS "pos_events" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "eventId" TEXT NOT NULL UNIQUE,
          "posId" TEXT NOT NULL,
          "posDeviceId" TEXT NOT NULL,
          "branchId" TEXT NOT NULL,
          "merchantId" TEXT NOT NULL,
          "storeId" TEXT NOT NULL,
          "cashierId" TEXT NOT NULL,
          "eventType" TEXT NOT NULL,
          "timestamp" DATETIME NOT NULL,
          "transactionId" TEXT NOT NULL,
          "orderTotal" REAL NOT NULL DEFAULT 0,
          "discountAmount" REAL,
          "itemId" TEXT,
          "reason" TEXT,
          "metadataJson" TEXT DEFAULT '{}',
          "processed" BOOLEAN NOT NULL DEFAULT false,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        )`;
        
      // Create additional tables required by Prisma schema
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS "branches" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "name" TEXT NOT NULL,
          "timezone" TEXT NOT NULL DEFAULT 'UTC',
          "operatingHoursJson" TEXT NOT NULL,
          "address" TEXT,
          "phone" TEXT,
          "email" TEXT,
          "averageTransactionValue" REAL,
          "peakTransactionHours" TEXT,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        )`;

      // Create a default branch entry
      await prisma.$executeRaw`
        INSERT OR IGNORE INTO "branches" (id, name, operatingHoursJson) 
        VALUES ('default-branch', 'Default Branch', '{"open": 9, "close": 22}')`;
        
      console.log('✅ Database schema created');
      
      // Add missing columns to existing tables if they don't exist
      try {
        console.log('🔧 Adding missing columns to existing tables...');
        await prisma.$executeRaw`ALTER TABLE "fraud_rules" ADD COLUMN "version" TEXT DEFAULT '1.0'`;
        console.log('✅ Added version column to fraud_rules');
      } catch (error) {
        // Column might already exist, ignore error
        console.log('   - version column already exists or error:', error.message);
      }
      
      try {
        await prisma.$executeRaw`ALTER TABLE "fraud_rules" ADD COLUMN "threshold" TEXT`;
        console.log('✅ Added threshold column to fraud_rules');
      } catch (error) {
        // Column might already exist, ignore error
        console.log('   - threshold column already exists or error:', error.message);
      }
      
      try {
        await prisma.$executeRaw`ALTER TABLE "fraud_flags" ADD COLUMN "flaggedAt" DATETIME DEFAULT CURRENT_TIMESTAMP`;
        console.log('✅ Added flaggedAt column to fraud_flags');
      } catch (error) {
        // Column might already exist, ignore error
        console.log('   - flaggedAt column already exists or error:', error.message);
      }
      
      try {
        await prisma.$executeRaw`ALTER TABLE "pos_events" ADD COLUMN "posDeviceId" TEXT DEFAULT ''`;
        console.log('✅ Added posDeviceId column to pos_events');
      } catch (error) {
        console.log('   - posDeviceId column already exists or error:', error.message);
      }
      
      try {
        await prisma.$executeRaw`ALTER TABLE "pos_events" ADD COLUMN "branchId" TEXT DEFAULT ''`;
        console.log('✅ Added branchId column to pos_events');
      } catch (error) {
        console.log('   - branchId column already exists or error:', error.message);
      }
      
      // Seed basic fraud rules
      await seedBasicFraudRules();
    }
  } catch (error) {
    console.error('⚠️ Database initialization failed:', error);
    console.error('Full error details:', error.message);
    // Don't crash the server, but log the error
  }
}

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173', 
    'https://orbit-production-a351.up.railway.app',
    'https://orbit-lake.vercel.app',
    /\.vercel\.app$/,
    /\.railway\.app$/
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID']
}));
app.use(express.json());

// Simple in-memory sliding window storage
const slidingWindows = new Map();

// Helper functions
function addToSlidingWindow(key, timestamp, windowMs, maxSize = 1000) {
  if (!slidingWindows.has(key)) {
    slidingWindows.set(key, []);
  }
  
  const window = slidingWindows.get(key);
  window.push(timestamp);
  
  // Clean old entries
  const cutoff = timestamp - windowMs;
  const validEntries = window.filter(t => t > cutoff);
  
  // Limit size
  if (validEntries.length > maxSize) {
    validEntries.splice(0, validEntries.length - maxSize);
  }
  
  slidingWindows.set(key, validEntries);
  return validEntries.length;
}

async function evaluateFraudRules(event, posEventId) {
  console.log(`🔍 Evaluating fraud rules for event: ${event.eventType}`);
  
  try {
    // Get enabled fraud rules
    const rules = await prisma.fraudRule.findMany({
      where: { enabled: true }
    });
    
    const triggeredRules = [];
    const now = Date.now();
    
    for (const rule of rules) {
      let isTriggered = false;
      const threshold = JSON.parse(rule.thresholdJson);
      const timeWindow = rule.timeWindowJson ? JSON.parse(rule.timeWindowJson) : null;
      const conditions = JSON.parse(rule.conditionsJson);
      
      // Check if event matches rule conditions
      const matchesConditions = conditions.every(condition => {
        switch (condition.field) {
          case 'eventType':
            // Special handling for discount rules - they can trigger on any event with discount data
            if (rule.id === 'rule_high_discount' && event.discountAmount > 0) {
              return true; // Skip event type check for discount rules if discount present
            }
            // Case-insensitive comparison for event types
            const eventType = String(event.eventType || '').toLowerCase();
            const conditionValue = String(condition.value || '').toLowerCase();
            return eventType === conditionValue;
          default:
            return true;
        }
      });
      
      if (!matchesConditions) continue;
      
      // Evaluate specific rules based on rule ID for stability
      const eventTypeLower = event.eventType.toLowerCase();
      
      switch (rule.id) {
        case 'rule_excessive_voids':
          if (eventTypeLower === 'void') {
            const key = `${event.cashierId}_voids`;
            const windowMs = timeWindow.duration * 1000;
            const count = addToSlidingWindow(key, now, windowMs);
            isTriggered = count >= threshold.value;
            console.log(`  📊 Voids by ${event.cashierId}: ${count}/${threshold.value}`);
          }
          break;
        
        case 'rule_high_discount':
          // Check for discount on ANY event type that has discount data
          if ((eventTypeLower === 'discount' || eventTypeLower === 'discount_applied' || event.discountAmount > 0) 
              && event.orderTotal && event.discountAmount) {
            const discountPercent = (event.discountAmount / event.orderTotal) * 100;
            isTriggered = discountPercent > threshold.value;
            console.log(`  📊 Discount: ${discountPercent.toFixed(1)}% (threshold: ${threshold.value}%) on ${event.eventType}`);
          }
          break;
        
        case 'rule_excessive_returns':
          if (eventTypeLower === 'return') {
            const key = `${event.cashierId}_returns`;
            const windowMs = timeWindow.duration * 1000;
            const count = addToSlidingWindow(key, now, windowMs);
            isTriggered = count >= threshold.value;
            console.log(`  📊 Returns by ${event.cashierId}: ${count}/${threshold.value}`);
          }
          break;
      }
      
      if (isTriggered) {
        triggeredRules.push(rule);
        
        // Create fraud flag
        const fraudFlag = await prisma.fraudFlag.create({
          data: {
            ruleId: rule.id,
            ruleName: rule.name,
            eventId: posEventId,
            posId: event.posId,
            cashierId: event.cashierId,
            merchantId: event.merchantId,
            storeId: event.storeId || 'default-branch', // Ensure branch exists
            severity: rule.severity,
            description: `${rule.name} detected for ${event.eventType} event`,
            evidenceJson: JSON.stringify({
              event: event,
              threshold: threshold,
              timeWindow: timeWindow
            }),
            riskScore: rule.severity === 'HIGH' ? 50 : rule.severity === 'MEDIUM' ? 25 : 10,
            flaggedAt: new Date()
          }
        });
        
        console.log(`  🚨 FRAUD FLAG: ${rule.name} (${rule.severity}) - ID: ${fraudFlag.id}`);
      }
    }
    
    return {
      eventId: event.eventId,
      triggeredRules: triggeredRules.length,
      rules: triggeredRules.map(r => r.name),
      riskScore: triggeredRules.reduce((sum, r) => sum + (r.severity === 'HIGH' ? 50 : r.severity === 'MEDIUM' ? 25 : 10), 0)
    };
    
  } catch (error) {
    console.error('Error evaluating fraud rules:', error);
    throw error;
  }
}

// Routes

// Health check
app.get('/health', async (req, res) => {
  try {
    const ruleCount = await prisma.fraudRule.count().catch(() => 0);
    const flagCount = await prisma.fraudFlag.count().catch(() => 0);
    
    res.json({
      status: 'healthy',
      timestamp: new Date(),
      service: 'fraud-detection-backend',
      database: 'connected',
      fraud_rules: ruleCount,
      fraud_flags: flagCount,
      server: 'simple-server.js'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      timestamp: new Date(),
      error: error.message,
      server: 'simple-server.js'
    });
  }
});

// Get fraud rules
app.get('/api/fraud/rules', async (req, res) => {
  try {
    // Try to get rules, with fallback for missing columns
    let rules;
    try {
      rules = await prisma.fraudRule.findMany({
        orderBy: { name: 'asc' }
      });
    } catch (error) {
      console.warn('Database query error for fraud rules:', error.message);
      // If version column missing, try raw query without it
      if (error.message.includes('version') || error.message.includes('column')) {
        try {
          rules = await prisma.$queryRaw`
            SELECT 
              id, name, description, ruleFamily, severity, enabled,
              thresholdJson, timeWindowJson, conditionsJson, actionsJson,
              createdAt, updatedAt
            FROM fraud_rules 
            ORDER BY name ASC
          `;
          // Add default version for compatibility
          rules = rules.map(rule => ({ ...rule, version: '1.0' }));
        } catch (rawError) {
          console.warn('Raw query also failed:', rawError.message);
          rules = [];
        }
      } else {
        rules = [];
      }
    }
    
    res.json({
      success: true,
      data: rules,
      timestamp: new Date(),
      requestId: req.headers['x-request-id'] || 'unknown'
    });
  } catch (error) {
    console.error('Error fetching rules:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date()
    });
  }
});

// Submit POS event
app.post('/api/fraud/events', async (req, res) => {
  try {
    const event = req.body;
    
    // Validate required fields
    const required = ['eventId', 'posId', 'merchantId', 'storeId', 'cashierId', 'eventType', 'timestamp'];
    const missing = required.filter(field => !event[field]);
    
    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Missing required fields: ${missing.join(', ')}`,
        timestamp: new Date()
      });
    }

    // Validate timestamp format
    const timestamp = new Date(event.timestamp);
    if (isNaN(timestamp.getTime())) {
      return res.status(400).json({
        success: false,
        error: `Invalid timestamp format: ${event.timestamp}`,
        timestamp: new Date()
      });
    }
    
    // Store event in database
    const posEvent = await prisma.pOSEvent.create({
      data: {
        eventId: event.eventId,
        posId: event.posId,
        posDeviceId: event.posDeviceId || event.posId, // Use posId as fallback
        branchId: event.branchId || event.storeId, // Use storeId as fallback  
        merchantId: event.merchantId,
        storeId: event.storeId,
        cashierId: event.cashierId,
        eventType: event.eventType,
        timestamp: timestamp,
        transactionId: event.transactionId,
        orderTotal: event.orderTotal || 0,
        discountAmount: event.discountAmount,
        itemId: event.itemId,
        reason: event.reason,
        metadataJson: JSON.stringify(event.metadata || {}),
        processed: false
      }
    });
    
    // Evaluate fraud rules
    const evaluation = await evaluateFraudRules(event, posEvent.id);
    
    // Update event as processed
    await prisma.pOSEvent.update({
      where: { id: posEvent.id },
      data: { processed: true }
    });
    
    res.json({
      success: true,
      data: {
        eventId: event.eventId,
        processed: true,
        evaluation: evaluation
      },
      timestamp: new Date(),
      requestId: req.headers['x-request-id'] || 'unknown'
    });
    
  } catch (error) {
    console.error('Error processing event:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date()
    });
  }
});

// Get fraud flags
app.get('/api/fraud/flags', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 10, 100);
    const offset = parseInt(req.query.offset) || 0;
    
    // Try to get flags, with fallback for missing columns
    let flags;
    try {
      flags = await prisma.fraudFlag.findMany({
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
        include: {
          rule: true,
          event: true
        }
      });
    } catch (error) {
      console.warn('Database query error for fraud flags:', error.message);
      // If flaggedAt column missing, try raw query without joins
      if (error.message.includes('flaggedAt') || error.message.includes('column')) {
        try {
          flags = await prisma.$queryRaw`
            SELECT 
              id, ruleId, ruleName, eventId, posId, cashierId, merchantId, storeId,
              severity, status, description, evidenceJson, investigatedAt, 
              investigatedBy, investigationNotes, resolution, riskScore,
              createdAt, updatedAt
            FROM fraud_flags 
            ORDER BY createdAt DESC 
            LIMIT ${limit} OFFSET ${offset}
          `;
          // Add flaggedAt as createdAt for compatibility
          flags = flags.map(flag => ({ ...flag, flaggedAt: flag.createdAt }));
        } catch (rawError) {
          console.warn('Raw query also failed:', rawError.message);
          flags = [];
        }
      } else {
        flags = [];
      }
    }
    
    const total = await prisma.fraudFlag.count().catch(() => 0);
    
    res.json({
      success: true,
      data: flags,
      pagination: {
        limit,
        offset,
        total,
        hasMore: offset + limit < total
      },
      timestamp: new Date(),
      requestId: req.headers['x-request-id'] || 'unknown'
    });
    
  } catch (error) {
    console.error('Error fetching fraud flags:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date()
    });
  }
});

// Update fraud flag status
app.patch('/api/fraud/flags/:flagId', async (req, res) => {
  try {
    const { flagId } = req.params;
    const { status, investigatedBy, investigationNotes, resolution } = req.body;
    
    // Validate status if provided
    const validStatuses = ['PENDING', 'INVESTIGATING', 'RESOLVED'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
        timestamp: new Date()
      });
    }
    
    // Build update object
    const updateData = {};
    if (status) updateData.status = status;
    if (investigatedBy) updateData.investigatedBy = investigatedBy;
    if (investigationNotes) updateData.investigationNotes = investigationNotes;
    if (resolution) updateData.resolution = resolution;
    if (status === 'INVESTIGATING' || status === 'RESOLVED') {
      updateData.investigatedAt = new Date();
    }
    
    // Update the fraud flag
    const updatedFlag = await prisma.fraudFlag.update({
      where: { id: flagId },
      data: updateData,
      include: {
        rule: true,
        event: true
      }
    });
    
    console.log(`🔍 Updated fraud flag ${flagId} - Status: ${status}`);
    
    res.json({
      success: true,
      data: updatedFlag,
      timestamp: new Date(),
      requestId: req.headers['x-request-id'] || 'unknown'
    });
    
  } catch (error) {
    console.error('Error updating fraud flag:', error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: 'Fraud flag not found',
        timestamp: new Date()
      });
    }
    
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date()
    });
  }
});

// Update fraud rule (enable/disable or other fields)
app.patch('/api/fraud/rules/:ruleId', async (req, res) => {
  try {
    const { ruleId } = req.params;
    const updates = req.body;

    // Only allow certain fields to be updated for safety
    const allowedFields = ['enabled', 'thresholdJson', 'timeWindowJson', 'conditionsJson', 'actionsJson', 'description', 'severity'];
    const data = {};
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        data[field] = typeof updates[field] === 'object' ? JSON.stringify(updates[field]) : updates[field];
      }
    }

    const updatedRule = await prisma.fraudRule.update({
      where: { id: ruleId },
      data,
    });

    console.log(`⚙️  Updated fraud rule ${ruleId}`, data);

    res.json({
      success: true,
      data: updatedRule,
      timestamp: new Date(),
      requestId: req.headers['x-request-id'] || 'unknown'
    });
  } catch (error) {
    console.error('Error updating fraud rule:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date()
    });
  }
});

// Start server
app.listen(PORT, async () => {
  console.log(`🛡️  Fraud Detection Backend Server running on port ${PORT}`);
  console.log(`📋 Available endpoints:`);
  console.log(`   GET   /health                  - Health check`);
  console.log(`   GET   /api/fraud/rules         - Get fraud rules`);
  console.log(`   POST  /api/fraud/events        - Submit POS event`);
  console.log(`   GET   /api/fraud/flags         - Get fraud flags`);
  console.log(`   PATCH /api/fraud/flags/:id     - Update fraud flag status`);
  console.log(`   PATCH /api/fraud/rules/:id     - Update fraud rule`);
  console.log(`🔗 Server ready at: http://localhost:${PORT}`);
  
  // Initialize database
  await initializeDatabase();
  console.log(`🚀 Backend restarted at ${new Date().toISOString()}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🔄 Gracefully shutting down...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🔄 Gracefully shutting down...');
  await prisma.$disconnect();
  process.exit(0);
}); 