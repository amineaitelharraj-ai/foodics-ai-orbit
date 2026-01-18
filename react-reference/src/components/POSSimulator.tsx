import React, { useState } from 'react';
import { AlertTriangle, Check, X, Send, ShoppingCart } from 'lucide-react';

interface POSEvent {
  eventType: string;
  posId: string;
  cashierId: string;
  orderTotal: number;
  discountAmount?: number;
  discountPercent?: number;
  itemId?: string;
  reason?: string;
  paymentMethod?: string;
}

const POSSimulator: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastResponse, setLastResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [event, setEvent] = useState<POSEvent>({
    eventType: 'sale',
    posId: 'POS001',
    cashierId: 'cashier_001',
    orderTotal: 25.99,
    discountAmount: 0,
    discountPercent: 0,
    itemId: 'item_001',
    reason: '',
    paymentMethod: 'credit_card'
  });

  const eventTypes = [
    { value: 'sale', label: '💰 Normal Sale', description: 'Regular transaction' },
    { value: 'void', label: '❌ Void Transaction - Cancel/void a transaction', description: 'Send 3+ quickly to trigger alert' },
    { value: 'return', label: '↩️ Product Return', description: 'Send 2+ quickly to trigger alert' },
    { value: 'discount', label: '💸 Apply Discount', description: 'Manual discount applied (set >30% to trigger)' },
    { value: 'reprint', label: '🧾 Receipt Reprint', description: 'Reprint receipt' },
    { value: 'cash_payment', label: '💵 Cash Payment', description: 'Large cash transaction' },
    { value: 'manager_override', label: '👔 Manager Override', description: 'Manager intervention' }
  ];

  const generateEventId = () => `evt_sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const generateTransactionId = () => `txn_sim_${Date.now()}`;

  const submitEvent = async () => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const eventData = {
        eventId: generateEventId(),
        posId: event.posId,
        posDeviceId: event.posId, // Required field
        branchId: 'branch_sim', // Required field
        merchantId: 'merchant_sim',
        storeId: 'store_sim',
        cashierId: event.cashierId,
        eventType: event.eventType.toUpperCase(), // Convert to uppercase for rule matching
        timestamp: new Date().toISOString(),
        createdAt: new Date(), // Required field
        transactionId: generateTransactionId(),
        orderTotal: event.orderTotal,
        discountAmount: event.discountAmount || undefined,
        discountPct: event.discountPercent || undefined, // Proper field name for rules
        itemId: event.itemId || undefined,
        reason: event.reason || undefined,
        metadata: {
          discountType: 'manual',
          discountPercent: event.discountPercent || undefined,
          paymentMethod: event.paymentMethod,
          simulator: true
        }
      };

      // Dynamically choose backend URL (works for localhost & Railway)
      const baseUrl = window.location.hostname === 'localhost'
        ? 'http://localhost:3001'
        : 'https://orbit-production-a351.up.railway.app';

      console.log('Submitting POS event:', eventData, '→', baseUrl);
      
      const response = await fetch(`${baseUrl}/api/fraud/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventData)
      });
      
      const result = await response.json();
      setLastResponse(result);
      
      // Show success notification
      if (result.data?.evaluation?.triggeredRules > 0) {
        alert(`🚨 FRAUD DETECTED! Triggered ${result.data.evaluation.triggeredRules} rules: ${result.data.evaluation.rules.join(', ')}`);
      } else {
        alert('✅ Event processed successfully - No fraud detected');
      }
      
    } catch (err) {
      console.error('Error submitting event:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit event');
      alert('❌ Error submitting event. Check console for details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const loadPreset = (presetType: string) => {
    const presets: Record<string, Partial<POSEvent>> = {
      excessive_voids: {
        eventType: 'void',
        orderTotal: 45.99,
        reason: 'Customer changed mind',
        cashierId: 'cashier_void_test'
      },
      high_discount: {
        eventType: 'discount_applied',
        orderTotal: 100.00,
        discountAmount: 45.00,
        discountPercent: 45,
        reason: 'Manager approval',
        cashierId: 'cashier_discount_test'
      },
      large_cash: {
        eventType: 'cash_payment',
        orderTotal: 750.00,
        paymentMethod: 'cash',
        cashierId: 'cashier_cash_test'
      },
      excessive_returns: {
        eventType: 'return',
        orderTotal: 89.99,
        reason: 'Defective product',
        cashierId: 'cashier_return_test'
      },
      receipt_reprint: {
        eventType: 'reprint',
        orderTotal: 25.50,
        reason: 'Customer lost receipt',
        cashierId: 'cashier_reprint_test'
      }
    };

    if (presets[presetType]) {
      setEvent(prev => ({ ...prev, ...presets[presetType] }));
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <ShoppingCart className="w-6 h-6 text-blue-500" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">POS Event Simulator</h2>
        <div className="ml-auto px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
          Testing Mode
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Event Configuration */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Event Type
            </label>
            <select
              value={event.eventType}
              onChange={(e) => setEvent(prev => ({ ...prev, eventType: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {eventTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label} - {type.description}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                POS ID
              </label>
              <input
                type="text"
                value={event.posId}
                onChange={(e) => setEvent(prev => ({ ...prev, posId: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Cashier ID
              </label>
              <input
                type="text"
                value={event.cashierId}
                onChange={(e) => setEvent(prev => ({ ...prev, cashierId: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Order Total ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={event.orderTotal}
                onChange={(e) => setEvent(prev => ({ ...prev, orderTotal: parseFloat(e.target.value) || 0 }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Discount Amount ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={event.discountAmount || 0}
                onChange={(e) => {
                  const amount = parseFloat(e.target.value) || 0;
                  const percent = event.orderTotal > 0 ? (amount / event.orderTotal) * 100 : 0;
                  setEvent(prev => ({ 
                    ...prev, 
                    discountAmount: amount,
                    discountPercent: Math.round(percent * 100) / 100
                  }));
                }}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {event.discountAmount! > 0 && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-700">
                <strong>Discount:</strong> ${event.discountAmount} ({event.discountPercent}%)
                {(event.discountPercent! > 30) && (
                  <span className="ml-2 text-red-600 font-medium">⚠️ Will trigger High Discount rule!</span>
                )}
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Reason/Notes
            </label>
            <input
              type="text"
              value={event.reason || ''}
              onChange={(e) => setEvent(prev => ({ ...prev, reason: e.target.value }))}
              placeholder="Optional reason for the event..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Right Column - Quick Presets & Actions */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              🎯 Quick Test Presets
            </h3>
            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={() => loadPreset('high_discount')}
                className="p-3 text-left bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
              >
                <div className="font-medium text-red-700">High Discount (45%)</div>
                <div className="text-sm text-red-600">Will trigger fraud alert</div>
              </button>
              
              <button
                onClick={() => loadPreset('large_cash')}
                className="p-3 text-left bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors"
              >
                <div className="font-medium text-yellow-700">Large Cash Payment ($750)</div>
                <div className="text-sm text-yellow-600">May trigger cash handling rule</div>
              </button>

              <button
                onClick={() => loadPreset('excessive_voids')}
                className="p-3 text-left bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors"
              >
                <div className="font-medium text-orange-700">Void Transaction</div>
                <div className="text-sm text-orange-600">Send 3+ quickly to trigger alert</div>
              </button>

              <button
                onClick={() => loadPreset('excessive_returns')}
                className="p-3 text-left bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <div className="font-medium text-blue-700">Product Return</div>
                <div className="text-sm text-blue-600">Send 2+ quickly to trigger alert</div>
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={submitEvent}
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Sending Event...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send POS Event
              </>
            )}
          </button>

          {/* Last Response */}
          {lastResponse && (
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                {lastResponse.success ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <X className="w-4 h-4 text-red-500" />
                )}
                Last Response
              </h4>
              <div className="text-sm space-y-1">
                <div><strong>Success:</strong> {lastResponse.success ? 'Yes' : 'No'}</div>
                {lastResponse.data?.evaluation && (
                  <>
                    <div><strong>Rules Triggered:</strong> {lastResponse.data.evaluation.triggeredRules}</div>
                    {lastResponse.data.evaluation.rules.length > 0 && (
                      <div><strong>Fraud Rules:</strong> {lastResponse.data.evaluation.rules.join(', ')}</div>
                    )}
                    <div><strong>Risk Score:</strong> {lastResponse.data.evaluation.riskScore}</div>
                  </>
                )}
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <h4 className="font-medium text-red-900 mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Error
              </h4>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">📋 Testing Instructions</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Use presets to quickly test specific fraud scenarios</li>
          <li>• Send multiple void/return events quickly to trigger excessive rules</li>
          <li>• Set discount {'>'}30% to trigger high discount rule</li>
          <li>• Check the InventoryGuru → Fraud Detection tab to see alerts appear</li>
          <li>• All events are marked as simulator=true in metadata</li>
        </ul>
      </div>
    </div>
  );
};

export default POSSimulator; 