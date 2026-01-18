#!/usr/bin/env node

/**
 * Test script to verify the backend fraud detection API is working
 * Usage: node test-backend-fix.js [url]
 * 
 * Default URL: https://orbit-production-a351.up.railway.app
 */

const https = require('https');

const BASE_URL = process.argv[2] || 'https://orbit-production-a351.up.railway.app';

console.log(`🔍 Testing fraud detection backend at: ${BASE_URL}`);
console.log('=' * 60);

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
            headers: res.headers,
            data: parsed
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
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

async function runTests() {
  console.log('\n1. Testing Health Check...');
  try {
    const health = await testEndpoint('/health');
    console.log(`   Status: ${health.status}`);
    console.log(`   Response:`, health.data);
    
    if (health.status === 200 && health.data.status === 'healthy') {
      console.log('   ✅ Health check passed');
    } else {
      console.log('   ❌ Health check failed');
      return;
    }
  } catch (error) {
    console.log('   ❌ Health check error:', error.message);
    return;
  }

  console.log('\n2. Testing Fraud Rules API...');
  try {
    const rules = await testEndpoint('/api/fraud/rules');
    console.log(`   Status: ${rules.status}`);
    
    if (rules.status === 200) {
      console.log(`   ✅ Fraud rules API working`);
      console.log(`   Rules count: ${rules.data?.data?.length || 0}`);
      if (rules.data?.data?.length > 0) {
        console.log(`   Sample rule: ${rules.data.data[0].name}`);
      }
    } else {
      console.log('   ❌ Fraud rules API failed');
      console.log('   Response:', rules.data);
      return;
    }
  } catch (error) {
    console.log('   ❌ Fraud rules API error:', error.message);
    return;
  }

  console.log('\n3. Testing Fraud Flags API...');
  try {
    const flags = await testEndpoint('/api/fraud/flags');
    console.log(`   Status: ${flags.status}`);
    
    if (flags.status === 200) {
      console.log(`   ✅ Fraud flags API working`);
      console.log(`   Flags count: ${flags.data?.data?.length || 0}`);
    } else {
      console.log('   ❌ Fraud flags API failed');
      console.log('   Response:', flags.data);
      return;
    }
  } catch (error) {
    console.log('   ❌ Fraud flags API error:', error.message);
    return;
  }

  console.log('\n4. Testing POS Event Submission...');
  try {
    const testEvent = {
      eventId: `test_${Date.now()}`,
      posId: 'POS001',
      merchantId: 'merchant_test',
      storeId: 'store_test',
      cashierId: 'cashier_test',
      eventType: 'DISCOUNT',
      timestamp: new Date().toISOString(),
      transactionId: `trans_${Date.now()}`,
      orderTotal: 100,
      discountAmount: 40 // 40% discount - should trigger high discount rule
    };
    
    const event = await testEndpoint('/api/fraud/events', 'POST', testEvent);
    console.log(`   Status: ${event.status}`);
    
    if (event.status === 200 || event.status === 201) {
      console.log(`   ✅ POS event submission working`);
      console.log(`   Event processed: ${event.data?.data?.processed}`);
      console.log(`   Rules triggered: ${event.data?.data?.evaluation?.triggeredRules || 0}`);
    } else {
      console.log('   ❌ POS event submission failed');
      console.log('   Response:', event.data);
      return;
    }
  } catch (error) {
    console.log('   ❌ POS event submission error:', error.message);
    return;
  }

  console.log('\n🎉 All tests passed! Backend is working correctly.');
  console.log('\n📋 Summary:');
  console.log('   ✅ Health check');
  console.log('   ✅ Fraud rules API');
  console.log('   ✅ Fraud flags API');
  console.log('   ✅ POS event submission');
  console.log('\nThe backend should now work with the POS simulator and Inventory Guru fraud detection tab.');
}

// Run the tests
runTests().catch(error => {
  console.error('\n💥 Test suite failed:', error.message);
  process.exit(1);
});