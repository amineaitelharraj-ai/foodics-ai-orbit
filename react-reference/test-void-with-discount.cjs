#!/usr/bin/env node

/**
 * Test the exact scenario from the POS Simulator: VOID event with 45% discount
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

async function testVoidWithDiscount() {
  console.log('🧪 Testing VOID event with 45% discount (matches POS Simulator)...');
  
  // This matches exactly what the POS Simulator sends
  const voidEvent = {
    eventId: `evt_sim_${Date.now()}_test`,
    posId: 'POS001',
    posDeviceId: 'POS001',
    branchId: 'branch_sim',
    merchantId: 'merchant_sim',
    storeId: 'store_sim',
    cashierId: 'cashier_void_test',
    eventType: 'VOID', // Uppercase as POS Simulator sends
    timestamp: new Date().toISOString(),
    createdAt: new Date(),
    transactionId: `txn_sim_${Date.now()}`,
    orderTotal: 45.99,     // Matches screenshot
    discountAmount: 45,    // $45 discount on $45.99 = ~98% discount!
    discountPct: 98,
    itemId: undefined,
    reason: 'Customer changed mind',
    metadata: {
      discountType: 'manual',
      discountPercent: 98,
      paymentMethod: undefined,
      simulator: true
    }
  };
  
  console.log('\n📤 Event Details:');
  console.log(`   Event Type: ${voidEvent.eventType}`);
  console.log(`   Order Total: $${voidEvent.orderTotal}`);
  console.log(`   Discount: $${voidEvent.discountAmount} (${voidEvent.discountPct}%)`);
  console.log(`   Cashier: ${voidEvent.cashierId}`);
  
  try {
    const response = await testEndpoint('/api/fraud/events', 'POST', voidEvent);
    
    console.log('\n📥 Response:', {
      status: response.status,
      success: response.data?.success,
      processed: response.data?.data?.processed,
      rulesTriggered: response.data?.data?.evaluation?.triggeredRules,
      ruleNames: response.data?.data?.evaluation?.rules
    });
    
    if (response.status === 200) {
      if (response.data?.data?.evaluation?.triggeredRules > 0) {
        console.log('\n🚨 SUCCESS! Fraud rules triggered:');
        response.data.data.evaluation.rules.forEach(rule => {
          console.log(`   - ${rule}`);
        });
        
        // Check fraud flags
        await new Promise(resolve => setTimeout(resolve, 1000));
        const flagsResponse = await testEndpoint('/api/fraud/flags?limit=3');
        console.log('\n🏴 Latest Fraud Flags:', {
          count: flagsResponse.data?.data?.length || 0,
          flags: flagsResponse.data?.data?.slice(0, 3).map(f => ({
            ruleName: f.ruleName,
            severity: f.severity,
            cashierId: f.cashierId,
            flaggedAt: f.flaggedAt
          })) || []
        });
        
      } else {
        console.log('\n❌ No fraud rules triggered - this should have triggered the High Discount rule!');
      }
    } else {
      console.log('\n❌ API Error:', response.data);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testVoidWithDiscount();