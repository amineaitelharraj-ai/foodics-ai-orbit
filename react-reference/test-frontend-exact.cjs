#!/usr/bin/env node

/**
 * Test the exact payload the frontend is sending
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

async function testFrontendExact() {
  console.log('🧪 Testing exact frontend payload that\'s causing 500 errors...');
  
  // This is EXACTLY what the frontend sent (from the console log)
  const frontendEvent = {
    eventId: 'evt_sim_1754383421780_93kmn73bq',
    posId: 'POS001',
    posDeviceId: 'POS001',
    branchId: 'branch_sim',
    merchantId: 'merchant_sim',
    storeId: 'store_sim',
    cashierId: 'cashier_void_test',
    eventType: 'VOID',
    timestamp: '2025-08-05T08:43:41.780Z',
    createdAt: new Date('2025-08-05T08:43:41.780Z'),
    transactionId: 'txn_sim_1754383421780',
    orderTotal: 45.99,
    discountAmount: undefined,  // This is undefined in frontend
    discountPct: undefined,     // This is undefined in frontend  
    itemId: 'item_001',
    reason: 'Customer changed mind',
    metadata: {
      discountType: 'manual',
      discountPercent: undefined,  // This is undefined in frontend
      paymentMethod: 'credit_card',
      simulator: true
    }
  };
  
  console.log('\n📤 Frontend Event (with undefined values):');
  console.log(JSON.stringify(frontendEvent, null, 2));
  
  try {
    const response = await testEndpoint('/api/fraud/events', 'POST', frontendEvent);
    
    console.log('\n📥 Response:', {
      status: response.status,
      success: response.data?.success,
      error: response.data?.error,
      processed: response.data?.data?.processed
    });
    
    if (response.status !== 200) {
      console.log('\n❌ Full Error Response:');
      console.log(JSON.stringify(response.data, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testFrontendExact();