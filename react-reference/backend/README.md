# Fraud Detection Backend

A comprehensive fraud detection system for InventoryGuru with real-time event processing, rule-based detection, and ML capabilities.

## 🏗️ Architecture Overview

```
POS Device → Event Proxy → Kafka → Fraud Decision Service → Actions
                                  ↘ Snowflake ↘ Looker Dashboards
```

### Components

- **Event Proxy**: Lightweight gRPC sidecar for fraud event ingestion
- **Fraud Decision Service**: Stateless REST pod with Marble-inspired rule engine
- **Kafka**: Event streaming for real-time processing
- **PostgreSQL**: Primary database for fraud flags and audit trail
- **Redis**: Caching and session management
- **WebSocket**: Real-time alerts to POS and dashboard

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 15+
- Redis 7+

### 1. Environment Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your configuration
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Infrastructure

```bash
# Start Kafka, Redis, PostgreSQL
docker-compose up -d

# Wait for services to be ready
npm run kafka:start
```

### 4. Database Setup

```bash
# Run Prisma migrations
npm run db:migrate

# Seed initial data
npm run db:seed
```

### 5. Start Development Server

```bash
npm run dev
```

The server will start on http://localhost:3001 with:
- REST API: http://localhost:3001/api/fraud
- WebSocket: ws://localhost:3002
- Health Check: http://localhost:3001/health

## 📋 Environment Variables

### Server Configuration
```env
NODE_ENV=development
PORT=3001
HOST=localhost
```

### Database
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/inventory_guru_fraud?schema=public"
REDIS_URL="redis://localhost:6379"
```

### Kafka
```env
KAFKA_BROKERS=localhost:9092
KAFKA_CLIENT_ID=fraud-detection-service
KAFKA_CONSUMER_GROUP_ID=fraud-consumers
KAFKA_TOPIC_FRAUD_EVENTS=fraud_events_raw
KAFKA_TOPIC_FRAUD_FLAGS=fraud_flags
```

### Fraud Detection
```env
FRAUD_LATENCY_THRESHOLD_MS=50
FRAUD_BATCH_SIZE=100
ML_ENABLED=false
```

## 🛡️ Fraud Detection Rules

The system ships with default rules for common fraud patterns:

### Rule Families

1. **Voids & Returns** - Excessive voids/returns by cashier
2. **Discounts** - High percentage discounts
3. **Reprints** - Multiple receipt reprints
4. **Cash Handling** - Large cash transactions
5. **Timing** - Off-peak activity

### Example Rule Configuration

```json
{
  "name": "Excessive Voids",
  "description": "3 voids in 1 hour by same cashier",
  "ruleFamily": "VOIDS_RETURNS",
  "threshold": {
    "type": "count",
    "value": 3,
    "operator": "gte"
  },
  "timeWindow": {
    "duration": 1,
    "unit": "hours"
  },
  "severity": "HIGH",
  "enabled": true,
  "conditions": [
    {
      "field": "eventType",
      "operator": "eq",
      "value": "VOID"
    }
  ],
  "actions": [
    {
      "type": "flag",
      "priority": 1
    },
    {
      "type": "alert",
      "target": "manager",
      "priority": 2
    }
  ]
}
```

## 📡 API Documentation

### Event Ingestion

**POST** `/api/fraud/events`

Submit POS events for fraud detection:

```json
{
  "eventType": "VOID",
  "posDeviceId": "pos-001",
  "branchId": "branch-001",
  "cashierId": "cashier-001",
  "orderId": "order-123",
  "amount": 25.50,
  "reason": "Customer request",
  "createdAt": "2024-01-15T10:30:00Z",
  "businessTime": "2024-01-15T10:30:00Z"
}
```

### Fraud Flag Management

**GET** `/api/fraud/flags` - List fraud flags with filtering
**GET** `/api/fraud/flags/:id` - Get specific fraud flag
**PATCH** `/api/fraud/flags/:id` - Update fraud flag investigation

### Rule Management

**GET** `/api/fraud/rules` - List all fraud rules
**POST** `/api/fraud/rules` - Create new rule
**PUT** `/api/fraud/rules/:id` - Update rule
**DELETE** `/api/fraud/rules/:id` - Delete rule

### Analytics

**GET** `/api/fraud/metrics` - Fraud detection metrics
**GET** `/api/fraud/dashboard` - Dashboard summary data
**GET** `/api/fraud/health` - System health check

## 🔄 Real-time Communication

### WebSocket Events

Connect to `ws://localhost:3002` for real-time updates:

#### Incoming Events
- `fraud_alert` - New fraud flag created
- `event_processed` - POS event processed
- `system_status` - System status updates

#### Outgoing Events
- `auth` - Authenticate connection
- `subscribe` - Subscribe to specific events
- `manager_response` - Manager action on fraud alert

### Example WebSocket Usage

```javascript
const ws = new WebSocket('ws://localhost:3002');

ws.onopen = () => {
  // Authenticate
  ws.send(JSON.stringify({
    type: 'auth',
    payload: {
      type: 'dashboard',
      token: 'your-auth-token'
    }
  }));
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  
  if (message.type === 'fraud_alert') {
    console.log('Fraud detected:', message.payload.flag);
    // Handle fraud alert in UI
  }
};
```

## 🎯 Performance Specifications

- **Rule Engine Latency**: < 50ms p99
- **Event Processing**: 200 req/s per pod
- **Sliding Window Updates**: Sub-millisecond
- **WebSocket Alerts**: < 100ms delivery

## 📊 Monitoring & Metrics

### Key Metrics Tracked

- Fraud prevented value (AED) per branch
- False positive rate per thousand transactions
- Mean alert response time by managers
- Rule engine p99 latency
- Model drift (when ML enabled)

### Health Checks

- Database connectivity
- Kafka producer/consumer health
- Rule engine status
- WebSocket connection count

## 🔧 Development

### Running Tests

```bash
npm test
npm run test:watch
```

### Code Quality

```bash
npm run lint
npm run build
```

### Database Operations

```bash
# Reset database
npx prisma migrate reset

# Generate Prisma client
npx prisma generate

# View database in browser
npx prisma studio
```

## 🐳 Production Deployment

### Docker Build

```bash
npm run build
docker build -t fraud-detection-backend .
```

### Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: fraud-detection-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: fraud-detection-backend
  template:
    metadata:
      labels:
        app: fraud-detection-backend
    spec:
      containers:
      - name: fraud-detection-backend
        image: fraud-detection-backend:latest
        ports:
        - containerPort: 3001
        - containerPort: 3002
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: fraud-secrets
              key: database-url
```

## 🔒 Security Considerations

- JWT authentication for API access
- Rate limiting on all endpoints
- Input validation with Joi schemas
- SQL injection prevention with Prisma
- CORS configuration for allowed origins
- Helmet.js for security headers

## 🚨 Troubleshooting

### Common Issues

1. **Kafka Connection Failed**
   ```bash
   # Check Kafka status
   docker-compose logs kafka
   
   # Restart Kafka services
   docker-compose restart kafka zookeeper
   ```

2. **Database Migration Errors**
   ```bash
   # Reset and remigrate
   npx prisma migrate reset
   npx prisma migrate dev
   ```

3. **High Memory Usage**
   - Check sliding window cleanup interval
   - Monitor rule counter retention
   - Review batch processing size

### Debug Mode

```bash
DEBUG=fraud:* npm run dev
```

## 🛣️ Roadmap

### Phase 1 (Complete)
- ✅ Rule engine with sliding windows
- ✅ Real-time event processing
- ✅ WebSocket alerts
- ✅ REST API
- ✅ Database schema

### Phase 2 (Future)
- 🔄 ML anomaly detection
- 🔄 Graph-based fraud rings
- 🔄 Advanced time series analysis
- 🔄 Auto-tuning thresholds

### Phase 3 (Future)
- 🔄 Cross-merchant analytics
- 🔄 Behavioral biometrics
- 🔄 Federated learning
- 🔄 Advanced visualization

## 📝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-rule`
3. Commit changes: `git commit -am 'Add new fraud rule'`
4. Push to branch: `git push origin feature/new-rule`
5. Submit pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the troubleshooting guide above 