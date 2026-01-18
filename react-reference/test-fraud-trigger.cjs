#!/usr/bin/env node

/**
 * Test script to trigger fraud detection with a high discount
 */

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
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };

    if (data) {
      const jsonData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(jsonData);
    }

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({
            status: res.statusCode,
            data: parsed
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            data: responseData,
            parseError: error.message
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function testFraudTrigger() {
  console.log('🔥 Testing Fraud Detection with High Discount (50%)...');
  
  // Create a POS event with 50% discount - should trigger "High Discount Percentage" rule
  const fraudEvent = {
    eventId: `fraud_test_${Date.now()}`,
    posId: 'POS001',
    merchantId: 'merchant_test',
    storeId: 'store_test', 
    cashierId: 'cashier_test',
    eventType: 'discount_applied', // This matches our rule condition
    timestamp: new Date().toISOString(),
    transactionId: `trans_${Date.now()}`,
    orderTotal: 100.00,      // Order total $100
    discountAmount: 50.00    // Discount $50 = 50% (triggers rule at >30%)
  };
  
  console.log('\n📤 Submitting fraud event:', {
    eventType: fraudEvent.eventType,
    orderTotal: fraudEvent.orderTotal,
    discountAmount: fraudEvent.discountAmount,
    discountPercentage: `${(fraudEvent.discountAmount/fraudEvent.orderTotal*100).toFixed(1)}%`
  });
  
  try {
    const response = await testEndpoint('/api/fraud/events', 'POST', fraudEvent);
    
    console.log('\n📥 Response:', {
      status: response.status,
      success: response.data?.success,
      processed: response.data?.data?.processed,
      rulesTriggered: response.data?.data?.evaluation?.triggeredRules,
      ruleNames: response.data?.data?.evaluation?.rules
    });
    
    if (response.status === 200 && response.data?.data?.evaluation?.triggeredRules > 0) {
      console.log('\n🚨 SUCCESS! Fraud rule triggered!');
      console.log('   Rule(s):', response.data.data.evaluation.rules);
      
      // Wait a moment then check fraud flags
      console.log('\n⏱️  Waiting 2 seconds then checking fraud flags...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const flagsResponse = await testEndpoint('/api/fraud/flags?limit=5');
      console.log('\n🏴 Fraud Flags:', {
        status: flagsResponse.status,
        count: flagsResponse.data?.data?.length || 0,
        flags: flagsResponse.data?.data?.map(f => ({
          ruleName: f.ruleName,
          severity: f.severity,
          cashierId: f.cashierId
        })) || []
      });
      
    } else {
      console.log('\n❌ No fraud rules triggered - check rule configuration');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testFraudTrigger();