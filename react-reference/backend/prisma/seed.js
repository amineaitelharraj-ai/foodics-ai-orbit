const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding fraud detection database...');

  // Default fraud rules
  const fraudRules = [
    {
      name: 'Excessive Voids',
      description: 'Detects when a cashier performs too many void transactions within a time window',
      ruleFamily: 'VOIDS_RETURNS',
      severity: 'HIGH',
      enabled: true,
      thresholdJson: JSON.stringify({
        type: 'count',
        value: 3,
        operator: '>='
      }),
      timeWindowJson: JSON.stringify({
        duration: 3600,
        unit: 'seconds'
      }),
      conditionsJson: JSON.stringify([
        {
          field: 'eventType',
          operator: 'equals',
          value: 'void'
        }
      ]),
      actionsJson: JSON.stringify([
        { type: 'TOAST', message: 'Excessive voids detected' },
        { type: 'LOG', level: 'warn' }
      ])
    },
    {
      name: 'High Discount',
      description: 'Detects discount percentages above the allowed threshold',
      ruleFamily: 'DISCOUNTS',
      severity: 'HIGH',
      enabled: true,
      thresholdJson: JSON.stringify({
        type: 'percentage',
        value: 30,
        operator: '>'
      }),
      timeWindowJson: null,
      conditionsJson: JSON.stringify([
        {
          field: 'eventType',
          operator: 'equals',
          value: 'discount_applied'
        }
      ]),
      actionsJson: JSON.stringify([
        { type: 'TOAST', message: 'High discount detected' },
        { type: 'MANAGER_PIN', required: true }
      ])
    },
    {
      name: 'Excessive Returns',
      description: 'Detects excessive return transactions within a short time window',
      ruleFamily: 'VOIDS_RETURNS',
      severity: 'MEDIUM',
      enabled: true,
      thresholdJson: JSON.stringify({
        type: 'count',
        value: 2,
        operator: '>='
      }),
      timeWindowJson: JSON.stringify({
        duration: 1800,
        unit: 'seconds'
      }),
      conditionsJson: JSON.stringify([
        {
          field: 'eventType',
          operator: 'equals',
          value: 'return'
        }
      ]),
      actionsJson: JSON.stringify([
        { type: 'TOAST', message: 'Excessive returns detected' },
        { type: 'LOG', level: 'info' }
      ])
    },
    {
      name: 'Receipt Reprints',
      description: 'Detects multiple receipt reprints for the same transaction',
      ruleFamily: 'REPRINTS',
      severity: 'MEDIUM',
      enabled: true,
      thresholdJson: JSON.stringify({
        type: 'count',
        value: 3,
        operator: '>='
      }),
      timeWindowJson: JSON.stringify({
        duration: 900,
        unit: 'seconds'
      }),
      conditionsJson: JSON.stringify([
        {
          field: 'eventType',
          operator: 'equals',
          value: 'reprint'
        }
      ]),
      actionsJson: JSON.stringify([
        { type: 'TOAST', message: 'Multiple receipt reprints detected' },
        { type: 'LOG', level: 'warn' }
      ])
    },
    {
      name: 'Off-hours Activity',
      description: 'Detects POS activity outside normal business hours',
      ruleFamily: 'TIMING_OFF_PEAK',
      severity: 'LOW',
      enabled: true,
      thresholdJson: JSON.stringify({
        type: 'time_range',
        value: { start: 22, end: 6 },
        operator: 'outside'
      }),
      timeWindowJson: null,
      conditionsJson: JSON.stringify([
        {
          field: 'timestamp',
          operator: 'outside_hours',
          value: { start: 6, end: 22 }
        }
      ]),
      actionsJson: JSON.stringify([
        { type: 'LOG', level: 'info', message: 'Off-hours activity detected' }
      ])
    },
    {
      name: 'Large Cash Transactions',
      description: 'Detects large cash transactions that may indicate money laundering',
      ruleFamily: 'CASH_HANDLING',
      severity: 'MEDIUM',
      enabled: false, // Disabled by default
      thresholdJson: JSON.stringify({
        type: 'amount',
        value: 500,
        operator: '>'
      }),
      timeWindowJson: null,
      conditionsJson: JSON.stringify([
        {
          field: 'eventType',
          operator: 'equals',
          value: 'cash_payment'
        },
        {
          field: 'orderTotal',
          operator: '>',
          value: 500
        }
      ]),
      actionsJson: JSON.stringify([
        { type: 'LOG', level: 'warn', message: 'Large cash transaction detected' },
        { type: 'MANAGER_PIN', required: true }
      ])
    }
  ];

  // Create fraud rules
  for (const rule of fraudRules) {
    const created = await prisma.fraudRule.upsert({
      where: { name: rule.name },
      update: rule,
      create: rule
    });
    console.log(`  ✅ Created rule: ${created.name} (${created.severity})`);
  }

  // Create a test branch
  const branch = await prisma.branch.upsert({
    where: { id: 'branch-test-001' },
    update: {},
    create: {
      id: 'branch-test-001',
      name: 'Test Branch - Downtown',
      timezone: 'America/New_York',
      operatingHoursJson: JSON.stringify({ open: 9, close: 22 }),
      address: '123 Main St, Downtown',
      phone: '+1-555-0123',
      email: 'downtown@test.com',
      averageTransactionValue: 25.50
    }
  });
  console.log(`  ✅ Created branch: ${branch.name}`);

  // Create test employees
  const employees = [
    {
      employeeId: 'EMP001',
      firstName: 'John',
      lastName: 'Cashier',
      email: 'john.cashier@test.com',
      role: 'CASHIER',
      hireDate: new Date('2024-01-15'),
      branchId: 'branch-test-001'
    },
    {
      employeeId: 'EMP002', 
      firstName: 'Jane',
      lastName: 'Manager',
      email: 'jane.manager@test.com',
      role: 'MANAGER',
      hireDate: new Date('2023-06-01'),
      branchId: 'branch-test-001'
    }
  ];

  for (const emp of employees) {
    const created = await prisma.employee.upsert({
      where: { employeeId: emp.employeeId },
      update: emp,
      create: emp
    });
    console.log(`  ✅ Created employee: ${created.firstName} ${created.lastName} (${created.role})`);
  }

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@frauddetection.test' },
    update: {},
    create: {
      email: 'admin@frauddetection.test',
      firstName: 'Fraud',
      lastName: 'Admin',
      role: 'ADMIN',
      passwordHash: 'test-hash-for-development', // In production, use proper hashing
      active: true
    }
  });
  console.log(`  ✅ Created admin user: ${adminUser.email}`);

  // Create system configuration
  const configs = [
    {
      key: 'fraud_detection_enabled',
      valueJson: JSON.stringify(true),
      description: 'Global fraud detection enable/disable flag',
      category: 'system'
    },
    {
      key: 'rule_engine_timeout',
      valueJson: JSON.stringify(5000),
      description: 'Maximum time for rule evaluation in milliseconds',
      category: 'performance'
    },
    {
      key: 'sliding_window_size',
      valueJson: JSON.stringify(1000),
      description: 'Maximum number of events in sliding window cache',
      category: 'performance'
    }
  ];

  for (const config of configs) {
    const created = await prisma.systemConfig.upsert({
      where: { key: config.key },
      update: config,
      create: config
    });
    console.log(`  ✅ Created config: ${created.key}`);
  }

  console.log('\n🎉 Database seeded successfully!');
  console.log('\n📊 Summary:');
  console.log(`  - ${fraudRules.length} fraud rules created`);
  console.log(`  - 1 test branch created`);
  console.log(`  - ${employees.length} test employees created`);
  console.log(`  - 1 admin user created`);
  console.log(`  - ${configs.length} system configurations created`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error seeding database:', e);
    await prisma.$disconnect();
    process.exit(1);
  }); 