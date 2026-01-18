#!/bin/bash

# 🛡️ Fraud Detection Backend Testing Script
# ==========================================

echo "🛡️  Testing Fraud Detection Backend"
echo "===================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKEND_URL="http://localhost:3001"
API_BASE="$BACKEND_URL/api/fraud"

# Test functions
test_health_check() {
    echo -e "\n${BLUE}🔍 Testing Health Check...${NC}"
    response=$(curl -s -w "%{http_code}" -o /tmp/health_response "$BACKEND_URL/health")
    if [ "$response" = "200" ]; then
        echo -e "${GREEN}✅ Health check passed${NC}"
        cat /tmp/health_response | jq . 2>/dev/null || cat /tmp/health_response
    else
        echo -e "${RED}❌ Health check failed (HTTP $response)${NC}"
        return 1
    fi
}

test_fraud_rules() {
    echo -e "\n${BLUE}🔍 Testing Fraud Rules API...${NC}"
    response=$(curl -s -w "%{http_code}" -o /tmp/rules_response "$API_BASE/rules")
    if [ "$response" = "200" ]; then
        echo -e "${GREEN}✅ Fraud rules API working${NC}"
        echo "Available rules:"
        cat /tmp/rules_response | jq '.data[] | {id: .id, name: .name, severity: .severity, enabled: .enabled}' 2>/dev/null || cat /tmp/rules_response
    else
        echo -e "${RED}❌ Fraud rules API failed (HTTP $response)${NC}"
    fi
}

test_pos_event_submission() {
    echo -e "\n${BLUE}🔍 Testing POS Event Submission...${NC}"
    
    # Sample POS event that should trigger excessive voids rule
    sample_event='{
        "eventId": "test-event-001",
        "posId": "POS-001", 
        "merchantId": "merchant-123",
        "storeId": "store-456",
        "cashierId": "cashier-789",
        "eventType": "void",
        "timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")'",
        "transactionId": "txn-001",
        "orderTotal": 25.99,
        "metadata": {
            "voidReason": "customer_request"
        }
    }'
    
    response=$(curl -s -w "%{http_code}" -o /tmp/event_response \
        -X POST \
        -H "Content-Type: application/json" \
        -d "$sample_event" \
        "$API_BASE/events")
    
    if [ "$response" = "200" ] || [ "$response" = "201" ]; then
        echo -e "${GREEN}✅ POS event submission working${NC}"
        echo "Response:"
        cat /tmp/event_response | jq . 2>/dev/null || cat /tmp/event_response
    else
        echo -e "${RED}❌ POS event submission failed (HTTP $response)${NC}"
        cat /tmp/event_response
    fi
}

test_fraud_flags() {
    echo -e "\n${BLUE}🔍 Testing Fraud Flags API...${NC}"
    response=$(curl -s -w "%{http_code}" -o /tmp/flags_response "$API_BASE/flags?limit=5")
    if [ "$response" = "200" ]; then
        echo -e "${GREEN}✅ Fraud flags API working${NC}"
        cat /tmp/flags_response | jq . 2>/dev/null || cat /tmp/flags_response
    else
        echo -e "${RED}❌ Fraud flags API failed (HTTP $response)${NC}"
    fi
}

test_websocket() {
    echo -e "\n${BLUE}🔍 Testing WebSocket Connection...${NC}"
    if command -v wscat >/dev/null 2>&1; then
        echo "Connecting to WebSocket (will timeout after 5 seconds)..."
        timeout 5s wscat -c "ws://localhost:3001/ws" 2>/dev/null && echo -e "${GREEN}✅ WebSocket connection successful${NC}" || echo -e "${YELLOW}⚠️  WebSocket test completed (timeout expected)${NC}"
    else
        echo -e "${YELLOW}⚠️  wscat not available. Install with: npm install -g wscat${NC}"
    fi
}

# Test scenarios for fraud detection
test_fraud_scenarios() {
    echo -e "\n${BLUE}🔍 Testing Fraud Detection Scenarios...${NC}"
    
    # Scenario 1: Multiple voids (should trigger excessive voids rule)
    echo -e "\n${YELLOW}Scenario 1: Testing Excessive Voids Rule${NC}"
    for i in {1..3}; do
        void_event='{
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
        
        response=$(curl -s -w "%{http_code}" -o /dev/null \
            -X POST \
            -H "Content-Type: application/json" \
            -d "$void_event" \
            "$API_BASE/events")
        
        echo "Void event $i: HTTP $response"
        sleep 1
    done
    
    # Scenario 2: High discount (should trigger high discount rule)
    echo -e "\n${YELLOW}Scenario 2: Testing High Discount Rule${NC}"
    discount_event='{
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
    
    response=$(curl -s -w "%{http_code}" -o /dev/null \
        -X POST \
        -H "Content-Type: application/json" \
        -d "$discount_event" \
        "$API_BASE/events")
    
    echo "High discount event: HTTP $response"
    
    # Check for new fraud flags
    echo -e "\n${YELLOW}Checking for new fraud flags...${NC}"
    sleep 2
    curl -s "$API_BASE/flags?limit=10" | jq '.data[] | {id: .id, rule: .ruleName, severity: .severity, timestamp: .createdAt}' 2>/dev/null || curl -s "$API_BASE/flags?limit=10"
}

# Main test execution
main() {
    echo -e "${BLUE}Starting comprehensive fraud detection backend tests...${NC}"
    
    # Check if backend is running
    if ! curl -s "$BACKEND_URL/health" >/dev/null 2>&1; then
        echo -e "${RED}❌ Backend server is not running at $BACKEND_URL${NC}"
        echo -e "${YELLOW}💡 Start the backend server first:${NC}"
        echo -e "   cd backend && npm install && npm run dev"
        exit 1
    fi
    
    # Run tests
    test_health_check
    test_fraud_rules  
    test_pos_event_submission
    test_fraud_flags
    test_websocket
    test_fraud_scenarios
    
    echo -e "\n${GREEN}🎉 Testing completed!${NC}"
    echo -e "${YELLOW}💡 Check the fraud flags API to see detected fraud attempts${NC}"
    echo -e "${YELLOW}💡 Monitor WebSocket connection for real-time alerts${NC}"
}

# Check dependencies
check_dependencies() {
    if ! command -v curl >/dev/null 2>&1; then
        echo -e "${RED}❌ curl is required but not installed${NC}"
        exit 1
    fi
    
    if ! command -v jq >/dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  jq not found. Install for better JSON formatting: brew install jq${NC}"
    fi
}

# Run the tests
check_dependencies
main 