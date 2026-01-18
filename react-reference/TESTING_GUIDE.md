# 🛡️ Fraud Detection Backend Testing Guide

## Overview
This guide provides multiple ways to test the fraud detection backend, with and without Docker.

## 🚀 Quick Start (Recommended)

### Option 1: Full Docker Setup (Recommended)
```bash
# 1. Install Docker Desktop
# Download from: https://docs.docker.com/desktop/install/mac-install/

# 2. Start infrastructure
cd backend
docker-compose up -d

# 3. Install dependencies and start backend
npm install
npm run dev

# 4. Run tests
cd ..
chmod +x test-fraud-backend.sh
./test-fraud-backend.sh
```

### Option 2: Local Development Setup (No Docker)
```bash
# 1. Install PostgreSQL locally
brew install postgresql
brew services start postgresql

# 2. Install Redis locally  
brew install redis
brew services start redis

# 3. Setup backend
cd backend
npm install

# 4. Configure database
createdb fraud_detection
npx prisma migrate deploy
npx prisma db seed # (if seed file exists)

# 5. Start backend (in development mode without Kafka)
npm run dev:local  # This would skip Kafka requirements

# 6. Run tests
cd ..
./test-fraud-backend.sh
```

### Option 3: In-Memory Testing (Fastest)
```bash
# Use SQLite instead of PostgreSQL for quick testing
cd backend

# Modify Prisma schema to use SQLite
# Update DATABASE_URL in .env to: "file:./dev.db"

npm install
npx prisma migrate dev --name init
npm run dev

# Run tests
cd ..
./test-fraud-backend.sh
```

## 🧪 Testing Methods

### 1. Automated Test Suite
```bash
# Run comprehensive automated tests
./test-fraud-backend.sh

# This will test:
# ✅ Health check endpoint
# ✅ Fraud rules API
# ✅ POS event submission
# ✅ Fraud flags retrieval
# ✅ WebSocket connections
# ✅ Fraud detection scenarios
```

### 2. Manual API Testing

#### Health Check
```bash
curl http://localhost:3001/health
```

#### Get Fraud Rules
```bash
curl http://localhost:3001/api/fraud/rules | jq
```

#### Submit POS Event
```bash
curl -X POST http://localhost:3001/api/fraud/events \
  -H "Content-Type: application/json" \
  -d '{
    "eventId": "test-001",
    "posId": "POS-001",
    "merchantId": "merchant-123",
    "storeId": "store-456", 
    "cashierId": "cashier-789",
    "eventType": "void",
    "timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")'",
    "transactionId": "txn-001",
    "orderTotal": 25.99,
    "metadata": {"voidReason": "customer_request"}
  }'
```

#### Check Fraud Flags
```bash
curl http://localhost:3001/api/fraud/flags | jq
```

### 3. WebSocket Testing
```bash
# Install wscat if not available
npm install -g wscat

# Test WebSocket connection
wscat -c ws://localhost:3001/ws

# You should see real-time fraud alerts when events trigger rules
```

## 🎯 Fraud Detection Test Scenarios

### Scenario 1: Excessive Voids
Submit 3+ void events within 1 hour to trigger the excessive voids rule:

```bash
# Submit multiple void events
for i in {1..3}; do
  curl -X POST http://localhost:3001/api/fraud/events \
    -H "Content-Type: application/json" \
    -d '{
      "eventId": "void-test-'$i'",
      "posId": "POS-001",
      "merchantId": "merchant-123",
      "storeId": "store-456",
      "cashierId": "cashier-suspicious", 
      "eventType": "void",
      "timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")'",
      "transactionId": "txn-void-'$i'",
      "orderTotal": 15.99,
      "metadata": {"voidReason": "error"}
    }'
  sleep 1
done

# Check for fraud flag
curl http://localhost:3001/api/fraud/flags | jq '.data[] | select(.ruleName == "excessive_voids")'
```

### Scenario 2: High Discount
Submit an event with >30% discount:

```bash
curl -X POST http://localhost:3001/api/fraud/events \
  -H "Content-Type: application/json" \
  -d '{
    "eventId": "discount-test-001",
    "posId": "POS-002", 
    "merchantId": "merchant-123",
    "storeId": "store-456",
    "cashierId": "cashier-discount",
    "eventType": "discount_applied",
    "timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")'",
    "transactionId": "txn-discount-001",
    "orderTotal": 100.00,
    "discountAmount": 40.00,
    "metadata": {"discountType": "manual", "discountPercent": 40}
  }'
```

### Scenario 3: Excessive Returns  
Submit 2+ return events within 30 minutes:

```bash
for i in {1..2}; do
  curl -X POST http://localhost:3001/api/fraud/events \
    -H "Content-Type: application/json" \
    -d '{
      "eventId": "return-test-'$i'",
      "posId": "POS-003",
      "merchantId": "merchant-123", 
      "storeId": "store-456",
      "cashierId": "cashier-returns",
      "eventType": "return",
      "timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")'",
      "transactionId": "txn-return-'$i'",
      "orderTotal": 50.00,
      "metadata": {"returnReason": "defective"}
    }'
  sleep 1  
done
```

## 🔍 Verification Steps

### 1. Check Fraud Rules Are Loaded
```bash
curl http://localhost:3001/api/fraud/rules | jq '.data | length'
# Should return 6 (number of default rules)
```

### 2. Verify Database Tables
```bash
cd backend
npx prisma studio
# Opens browser interface to view database tables
```

### 3. Check Logs
```bash
cd backend
tail -f logs/fraud-detection.log
# Monitor real-time logs
```

### 4. Performance Testing
```bash
# Test API response times
time curl http://localhost:3001/api/fraud/rules

# Load testing (if you have Apache Bench)
ab -n 100 -c 10 http://localhost:3001/health
```

## 🐛 Troubleshooting

### Backend Won't Start
```bash
# Check if ports are in use
lsof -i :3001
lsof -i :5432  # PostgreSQL
lsof -i :6379  # Redis
lsof -i :9092  # Kafka

# Check logs
cd backend
npm run dev 2>&1 | tee debug.log
```

### Database Connection Issues
```bash
# Test PostgreSQL connection
psql postgresql://localhost:5432/fraud_detection

# Reset database
cd backend
npx prisma migrate reset
npx prisma migrate deploy
```

### Kafka Issues (if using Docker)
```bash
# Check Kafka containers
docker-compose ps

# Restart Kafka
docker-compose restart kafka zookeeper

# View Kafka logs
docker-compose logs kafka
```

## 📊 Expected Results

### Successful Test Run Should Show:
- ✅ Health check: HTTP 200
- ✅ 6 fraud rules loaded and enabled
- ✅ POS events accepted: HTTP 200/201
- ✅ Fraud flags generated when rules triggered
- ✅ WebSocket connection established
- ✅ Real-time alerts for fraud events

### Performance Targets:
- **API Response Time**: < 50ms for rule evaluation
- **Throughput**: 200+ requests/second
- **Memory Usage**: < 512MB for backend process
- **Database Queries**: < 10ms average

## 🚀 Next Steps

1. **Load Testing**: Use tools like Artillery or k6 for performance testing
2. **Integration Testing**: Connect with actual POS systems
3. **Monitor Setup**: Configure monitoring with Prometheus/Grafana
4. **Alert Testing**: Test email/SMS notifications
5. **ML Integration**: Prepare for Phase 2 ML model integration

## 📞 Support

If you encounter issues:

1. Check this guide's troubleshooting section
2. Review backend logs: `backend/logs/fraud-detection.log`
3. Verify all dependencies are installed
4. Ensure ports 3001, 5432, 6379, 9092 are available
5. Test with the automated testing script first

Happy testing! 🎉 