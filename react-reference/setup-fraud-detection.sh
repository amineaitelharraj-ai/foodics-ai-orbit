#!/bin/bash

# Fraud Detection System Setup Script
# This script sets up the complete fraud detection backend and integrates with the frontend

set -e

echo "🛡️  Setting up Fraud Detection System for InventoryGuru"
echo "=================================================="

# Check prerequisites
check_prerequisites() {
    echo "📋 Checking prerequisites..."
    
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js is required but not installed."
        exit 1
    fi
    
    if ! command -v docker &> /dev/null; then
        echo "❌ Docker is required but not installed."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        echo "❌ Docker Compose is required but not installed."
        exit 1
    fi
    
    echo "✅ All prerequisites met!"
}

# Setup backend
setup_backend() {
    echo "🔧 Setting up fraud detection backend..."
    
    cd backend
    
    # Install dependencies
    echo "📦 Installing backend dependencies..."
    npm install
    
    # Create .env file if it doesn't exist
    if [ ! -f .env ]; then
        echo "📝 Creating environment configuration..."
        cat > .env << 'EOF'
# Server Configuration
NODE_ENV=development
PORT=3001
HOST=localhost

# Database Configuration
DATABASE_URL="postgresql://postgres:password@localhost:5432/inventory_guru_fraud?schema=public"
REDIS_URL="redis://localhost:6379"

# Kafka Configuration
KAFKA_BROKERS=localhost:9092
KAFKA_CLIENT_ID=fraud-detection-service
KAFKA_CONSUMER_GROUP_ID=fraud-consumers
KAFKA_TOPIC_FRAUD_EVENTS=fraud_events_raw
KAFKA_TOPIC_FRAUD_FLAGS=fraud_flags
KAFKA_RETRIES=5
KAFKA_RETRY_DELAY=1000

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# Fraud Detection Configuration
FRAUD_LATENCY_THRESHOLD_MS=50
FRAUD_BATCH_SIZE=100
FRAUD_WINDOW_CLEANUP_INTERVAL=300000

# WebSocket Configuration
WS_PORT=3002
WS_HEARTBEAT_INTERVAL=30000

# Email/SMS Configuration (for alerts)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASSWORD=your-email-password

# Logging Configuration
LOG_LEVEL=info
LOG_FILE_PATH=./logs/fraud-service.log

# POS Integration
POS_WEBHOOK_SECRET=your-pos-webhook-secret

# Security
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
CORS_ORIGINS=http://localhost:3000,http://localhost:5173

# ML Configuration (for future use)
ML_ENABLED=false
EOF
        echo "✅ Environment configuration created!"
    fi
    
    # Start infrastructure
    echo "🐳 Starting infrastructure services..."
    docker-compose up -d
    
    # Wait for services to be ready
    echo "⏳ Waiting for services to be ready..."
    sleep 30
    
    # Setup database
    echo "🗄️  Setting up database..."
    npx prisma generate
    npx prisma migrate dev --name init
    
    echo "✅ Backend setup complete!"
    cd ..
}

# Setup frontend integration
setup_frontend() {
    echo "🎨 Setting up frontend integration..."
    
    # Install axios for API calls
    if ! grep -q "axios" package.json; then
        echo "📦 Installing axios for API integration..."
        npm install axios
    fi
    
    # Create environment file for frontend
    if [ ! -f .env.local ]; then
        echo "📝 Creating frontend environment configuration..."
        cat > .env.local << 'EOF'
# Fraud Detection Backend URLs
REACT_APP_FRAUD_API_URL=http://localhost:3001
REACT_APP_FRAUD_WS_URL=ws://localhost:3002
EOF
        echo "✅ Frontend environment configured!"
    fi
    
    echo "✅ Frontend integration setup complete!"
}

# Start services
start_services() {
    echo "🚀 Starting fraud detection services..."
    
    cd backend
    
    # Start backend in background
    echo "Starting fraud detection backend..."
    npm run dev &
    BACKEND_PID=$!
    
    cd ..
    
    # Start frontend
    echo "Starting frontend with fraud detection integration..."
    npm run dev &
    FRONTEND_PID=$!
    
    echo "📡 Services starting..."
    echo "🔍 Backend API: http://localhost:3001"
    echo "🌐 Frontend: http://localhost:3000 or http://localhost:5173"
    echo "🔗 WebSocket: ws://localhost:3002"
    echo "📊 Kafka UI: http://localhost:8080"
    echo "🔍 Redis Insight: http://localhost:8001"
    
    echo ""
    echo "📋 To stop services:"
    echo "   kill $BACKEND_PID $FRONTEND_PID"
    echo "   cd backend && docker-compose down"
    
    echo ""
    echo "🎯 Fraud detection system is ready!"
    echo "   - Navigate to InventoryGuru -> Fraud Detection tab"
    echo "   - Default rules are already configured"
    echo "   - Real-time alerts will appear for fraud events"
    
    # Keep script running
    wait
}

# Test the setup
test_setup() {
    echo "🧪 Testing fraud detection setup..."
    
    # Wait for backend to be ready
    echo "Waiting for backend to start..."
    until curl -s http://localhost:3001/health > /dev/null; do
        sleep 2
    done
    
    # Test health endpoint
    echo "Testing health endpoint..."
    HEALTH_RESPONSE=$(curl -s http://localhost:3001/health)
    if echo "$HEALTH_RESPONSE" | grep -q '"status":"healthy"'; then
        echo "✅ Backend health check passed!"
    else
        echo "❌ Backend health check failed!"
        echo "$HEALTH_RESPONSE"
        exit 1
    fi
    
    # Test fraud API
    echo "Testing fraud API..."
    RULES_RESPONSE=$(curl -s http://localhost:3001/api/fraud/rules)
    if echo "$RULES_RESPONSE" | grep -q '"success":true'; then
        echo "✅ Fraud API test passed!"
    else
        echo "❌ Fraud API test failed!"
        echo "$RULES_RESPONSE"
        exit 1
    fi
    
    echo "✅ All tests passed!"
}

# Main execution
main() {
    check_prerequisites
    setup_backend
    setup_frontend
    
    echo ""
    echo "🎉 Fraud Detection System Setup Complete!"
    echo "=========================================="
    echo ""
    echo "Next steps:"
    echo "1. Start the services: ./setup-fraud-detection.sh start"
    echo "2. Or start manually:"
    echo "   - Backend: cd backend && npm run dev"
    echo "   - Frontend: npm run dev"
    echo ""
    echo "📚 Documentation:"
    echo "   - Backend API: backend/README.md"
    echo "   - Frontend Integration: src/services/fraud-api.ts"
    echo ""
    echo "🛠️  Development:"
    echo "   - Kafka UI: http://localhost:8080"
    echo "   - Database UI: cd backend && npx prisma studio"
    echo "   - Logs: backend/logs/"
    echo ""
}

# Handle command line arguments
case "${1:-setup}" in
    "start")
        start_services
        ;;
    "test")
        test_setup
        ;;
    "setup")
        main
        ;;
    *)
        echo "Usage: $0 [setup|start|test]"
        echo "  setup - Set up the fraud detection system (default)"
        echo "  start - Start all services"
        echo "  test  - Test the setup"
        exit 1
        ;;
esac 