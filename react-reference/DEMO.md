# 🛡️ Fraud Detection System Demo

## Live Demo URLs
- **Frontend**: Your Vercel deployment
- **Backend API**: https://orbit-production-a351.up.railway.app
- **Health Check**: https://orbit-production-a351.up.railway.app/health

## Demo Flow

### 1. View Active Fraud Rules
```bash
curl https://orbit-production-a351.up.railway.app/api/fraud/rules
```
**Expected**: Shows 2 fraud rules (High Discount >30%, Excessive Voids >3)

### 2. Trigger High Discount Fraud
```bash
curl -X POST https://orbit-production-a351.up.railway.app/api/fraud/events \
  -H "Content-Type: application/json" \
  -d '{
    "eventId": "demo_001",
    "eventType": "discount_applied",
    "posId": "POS001",
    "merchantId": "merchant_demo",
    "storeId": "store_demo", 
    "cashierId": "cashier_demo",
    "transactionId": "txn_demo_001",
    "timestamp": "2025-07-17T12:00:00.000Z",
    "orderTotal": 100,
    "discountAmount": 60,
    "metadata": {"discountPercent": 60}
  }'
```
**Expected**: Returns `"triggeredRules": 1` and fraud detection success

### 3. View Generated Fraud Alert
```bash
curl https://orbit-production-a351.up.railway.app/api/fraud/flags
```
**Expected**: Shows fraud flag with status "PENDING", high severity

### 4. Investigate the Alert (Copy the fraud flag ID from step 3)
```bash
curl -X PATCH https://orbit-production-a351.up.railway.app/api/fraud/flags/{FRAUD_FLAG_ID} \
  -H "Content-Type: application/json" \
  -d '{
    "status": "INVESTIGATING",
    "investigatedBy": "security_analyst", 
    "investigationNotes": "Reviewing suspicious 60% discount"
  }'
```
**Expected**: Updates status to "INVESTIGATING" with audit trail

### 5. Resolve the Investigation
```bash
curl -X PATCH https://orbit-production-a351.up.railway.app/api/fraud/flags/{FRAUD_FLAG_ID} \
  -H "Content-Type: application/json" \
  -d '{
    "status": "RESOLVED",
    "resolution": "Manager approved - legitimate promotional discount"
  }'
```
**Expected**: Final status "RESOLVED" with resolution notes

## Frontend Demo (InventoryGuru Page)
1. Visit your Vercel deployment
2. Navigate to **InventoryGuru**
3. Check **Fraud Detection Dashboard**
4. Click investigation buttons:
   - **No Fraud Detected**
   - **Training Required** 
   - **Fraud Confirmed**
   - **Complete Investigation**
5. Verify status updates in real-time

## Key Features Demonstrated
- ✅ Real-time fraud detection (>30% discount triggers alert)
- ✅ Automatic fraud flag creation with evidence
- ✅ Investigation workflow with audit trail
- ✅ Status management (PENDING → INVESTIGATING → RESOLVED)
- ✅ Risk scoring and severity assessment
- ✅ Complete REST API for fraud management

## Architecture Highlights
- **Frontend**: React + Vite (Vercel)
- **Backend**: Node.js + Express + Prisma (Railway)
- **Database**: SQLite (temporary for demo)
- **API**: RESTful with JSON responses
- **Real-time**: WebSocket-ready for live alerts 