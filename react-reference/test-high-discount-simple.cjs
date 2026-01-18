#!/usr/bin/env node

const https = require('https');
const BASE_URL = 'https://orbit-production-a351.up.railway.app';

async function testEndpoint(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname + url.search,
      method: method,
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }
    };

    if (data) {
      const jsonData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(jsonData);
    }

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => { responseData += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(responseData) });
        } catch (error) {
          resolve({ status: res.statusCode, data: responseData, parseError: error.message });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function testHighDiscount() {
  console.log('🚨 Testing HIGH DISCOUNT (should trigger fraud rule)...');
  
  const discountEvent = {
    eventId: `evt_test_${Date.now()}`,
    posId: 'POS001',
    posDeviceId: 'POS001',
    branchId: 'branch_sim',
    merchantId: 'merchant_sim',
    storeId: 'store_sim',
    cashierId: 'cashier_test',
    eventType: 'DISCOUNT',  // Changed to DISCOUNT type
    timestamp: new Date().toISOString(),
    createdAt: new Date(),
    transactionId: `txn_${Date.now()}`,
    orderTotal: 100.00,
    discountAmount: 45.00,  // 45% discount
    discountPct: 45,
    itemId: 'item_001',
    reason: 'Customer loyalty',
    metadata: {
      discountType: 'manual',
      discountPercent: 45,
      paymentMethod: 'credit_card',
      simulator: true
    }
  };
  
  console.log(`\n📤 Event: ${discountEvent.eventType}, $${discountEvent.discountAmount} discount (${discountEvent.discountPct}%)`);
  
  try {
    const response = await testEndpoint('/api/fraud/events', 'POST', discountEvent);
    
    console.log(`\n📥 Response Status: ${response.status}`);
    console.log(`   Success: ${response.data?.success}`);
    console.log(`   Processed: ${response.data?.data?.processed}`);
    console.log(`   Rules Triggered: ${response.data?.data?.evaluation?.triggeredRules || 0}`);
    
    if (response.data?.data?.evaluation?.triggeredRules > 0) {
      console.log(`   🚨 FRAUD DETECTED: ${response.data.data.evaluation.rules.join(', ')}`);
    } else {
      console.log(`   ⚠️  No fraud rules triggered (expected HIGH DISCOUNT rule)`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testHighDiscount();