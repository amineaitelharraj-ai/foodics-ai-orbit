#!/bin/bash

# Fraud Detection API Testing Script
# This script sends various POS events to test the fraud detection system

API_BASE="http://localhost:3001"
CURRENT_TIME=$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")

echo "🧪 Fraud Detection System Testing Script"
echo "========================================"
echo ""

# Function to send a POS event
send_event() {
    local event_type="$1"
    local description="$2"
    local data="$3"
    
    echo "📡 Testing: $description"
    echo "Event Type: $event_type"
    
    response=$(curl -s -X POST "$API_BASE/api/fraud/events" \
        -H "Content-Type: application/json" \
        -d "$data")
    
    # Check if fraud was detected
    if echo "$response" | grep -q '"triggeredRules":[1-9]'; then
        echo "🚨 FRAUD DETECTED!"
        rules=$(echo "$response" | grep -o '"rules":\[[^]]*\]' | sed 's/"rules":\[//; s/\]//; s/"//g')
        echo "   Triggered Rules: $rules"
    else
        echo "✅ No fraud detected"
    fi
    
    echo "   Response: $response"
    echo ""
    sleep 1
}

# Test 1: Normal Sale (should not trigger fraud)
echo "1. Normal Sale Event"
send_event "sale" "Regular transaction" '{
    "eventId": "evt_test_'$(date +%s)'_001",
    "posId": "POS001",
    "merchantId": "merchant_test",
    "storeId": "store_test",
    "cashierId": "cashier_test",
    "eventType": "sale",
    "timestamp": "'$CURRENT_TIME'",
    "transactionId": "txn_'$(date +%s)'",
    "orderTotal": 25.99,
    "itemId": "item_001"
}'

# Test 2: High Discount (should trigger fraud)
echo "2. High Discount Event (45% discount)"
send_event "discount_applied" "High discount that should trigger fraud alert" '{
    "eventId": "evt_test_'$(date +%s)'_002",
    "posId": "POS001",
    "merchantId": "merchant_test",
    "storeId": "store_test",
    "cashierId": "cashier_discount_test",
    "eventType": "discount_applied",
    "timestamp": "'$CURRENT_TIME'",
    "transactionId": "txn_'$(date +%s)'",
    "orderTotal": 100.00,
    "discountAmount": 45.00,
    "metadata": {
        "discountType": "manual",
        "discountPercent": 45
    }
}'

# Test 3: Large Cash Payment (may trigger fraud)
echo "3. Large Cash Payment Event"
send_event "cash_payment" "Large cash transaction" '{
    "eventId": "evt_test_'$(date +%s)'_003",
    "posId": "POS001",
    "merchantId": "merchant_test",
    "storeId": "store_test",
    "cashierId": "cashier_cash_test",
    "eventType": "cash_payment",
    "timestamp": "'$CURRENT_TIME'",
    "transactionId": "txn_'$(date +%s)'",
    "orderTotal": 750.00,
    "metadata": {
        "paymentMethod": "cash"
    }
}'

# Test 4: Multiple Voids (should trigger fraud after 3)
echo "4. Sending multiple void events to trigger 'Excessive Voids' rule..."
for i in {1..4}; do
    echo "   Sending void #$i"
    send_event "void" "Void transaction #$i" '{
        "eventId": "evt_test_'$(date +%s)'_void_'$i'",
        "posId": "POS001",
        "merchantId": "merchant_test",
        "storeId": "store_test",
        "cashierId": "cashier_void_test",
        "eventType": "void",
        "timestamp": "'$CURRENT_TIME'",
        "transactionId": "txn_'$(date +%s)'_void_'$i'",
        "orderTotal": 45.99,
        "reason": "Customer changed mind"
    }'
    
    if [ $i -eq 3 ]; then
        echo "   🎯 Third void - should trigger fraud alert now!"
    fi
done

# Test 5: Multiple Returns (should trigger fraud after 2)
echo "5. Sending multiple return events to trigger 'Excessive Returns' rule..."
for i in {1..3}; do
    echo "   Sending return #$i"
    send_event "return" "Return transaction #$i" '{
        "eventId": "evt_test_'$(date +%s)'_return_'$i'",
        "posId": "POS001",
        "merchantId": "merchant_test",
        "storeId": "store_test",
        "cashierId": "cashier_return_test",
        "eventType": "return",
        "timestamp": "'$CURRENT_TIME'",
        "transactionId": "txn_'$(date +%s)'_return_'$i'",
        "orderTotal": 89.99,
        "reason": "Defective product"
    }'
    
    if [ $i -eq 2 ]; then
        echo "   🎯 Second return within window - should trigger fraud alert now!"
    fi
done

# Test 6: Multiple Receipt Reprints
echo "6. Testing receipt reprint abuse..."
for i in {1..4}; do
    echo "   Sending reprint #$i"
    send_event "reprint" "Receipt reprint #$i" '{
        "eventId": "evt_test_'$(date +%s)'_reprint_'$i'",
        "posId": "POS001",
        "merchantId": "merchant_test",
        "storeId": "store_test",
        "cashierId": "cashier_reprint_test",
        "eventType": "reprint",
        "timestamp": "'$CURRENT_TIME'",
        "transactionId": "txn_shared_for_reprints",
        "orderTotal": 25.50,
        "reason": "Customer lost receipt"
    }'
    
    if [ $i -eq 3 ]; then
        echo "   🎯 Third reprint for same order - should trigger fraud alert now!"
    fi
done

echo ""
echo "🎉 Testing complete!"
echo ""
echo "📊 Check the fraud detection dashboard at:"
echo "   Frontend: http://localhost:3000 → InventoryGuru → Fraud Detection"
echo "   API: $API_BASE/api/fraud/flags"
echo ""
echo "💡 Tips:"
echo "   - Events are processed in real-time"
echo "   - Fraud flags are stored in the database"
echo "   - Check the backend logs for detailed rule evaluation"
echo "   - Use the POS Simulator in the frontend for interactive testing" 