<script setup lang="ts">
import { ref, computed, defineAsyncComponent } from 'vue';
import {
  AlertTriangle,
  Package,
  Target,
  RefreshCw,
  Settings,
  Download,
  Shield,
  DollarSign,
  Eye,
  Plus,
  Home,
  TrendingUp,
  ShoppingCart,
  Trash2,
  Factory,
} from 'lucide-vue-next';

// Lazy-load ECharts - only downloaded when user visits this page
const VChart = defineAsyncComponent({
  loader: async () => {
    const [{ use }, { CanvasRenderer }, { BarChart }, { GridComponent, TooltipComponent, LegendComponent }, VueECharts] = await Promise.all([
      import('echarts/core'),
      import('echarts/renderers'),
      import('echarts/charts'),
      import('echarts/components'),
      import('vue-echarts'),
    ]);
    use([CanvasRenderer, BarChart, GridComponent, TooltipComponent, LegendComponent]);
    return VueECharts;
  },
  loadingComponent: {
    template: `<div class="flex items-center justify-center h-[300px] bg-gray-50 dark:bg-gray-900 rounded-lg">
      <div class="flex items-center space-x-2 text-gray-500">
        <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>Loading chart...</span>
      </div>
    </div>`,
  },
  delay: 200,
});

type TabType = 'dashboard' | 'forecast' | 'orders' | 'waste' | 'production' | 'settings' | 'fraud';

interface FraudAlert {
  id: string;
  type: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  orderId: string;
  cashier: string;
  amount: string;
  branch: string;
  ruleTriggered: string;
  timestamp: string;
  status: 'PENDING' | 'INVESTIGATING' | 'RESOLVED';
}

interface FraudRule {
  id: string;
  name: string;
  threshold: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  enabled: boolean;
}

const activeTab = ref<TabType>('dashboard');
const selectedBranch = ref('main-branch');
const isRefreshing = ref(false);
const alertsFilter = ref<'all' | 'pending' | 'investigating' | 'resolved'>('all');
const autoDraftEnabled = ref(false);

const fraudStats = ref({
  securityScore: 85,
  totalTransactions: 1247,
  flaggedTransactions: 12,
  potentialLoss: 2340,
  preventedLoss: 8750,
  falsePositives: 2,
  accuracyRate: 94.2,
});

const fraudRules = ref<FraudRule[]>([
  { id: '1', name: 'High Void Rate', threshold: '>5 voids per shift', severity: 'HIGH', enabled: true },
  { id: '2', name: 'Excessive Discounts', threshold: '>20% discount frequency', severity: 'MEDIUM', enabled: true },
  { id: '3', name: 'Cash Drawer Variance', threshold: '>$50 variance', severity: 'HIGH', enabled: true },
  { id: '4', name: 'Unusual Hours Activity', threshold: 'Transactions outside business hours', severity: 'LOW', enabled: false },
  { id: '5', name: 'Duplicate Transactions', threshold: 'Same amount within 5 min', severity: 'MEDIUM', enabled: true },
  { id: '6', name: 'No-Sale Opens', threshold: '>3 no-sale opens per hour', severity: 'MEDIUM', enabled: true },
]);

const fraudAlerts = ref<FraudAlert[]>([
  { id: '1', type: 'High Void Rate', severity: 'HIGH', description: 'Cashier Ahmed has voided 8 transactions this shift, exceeding the 5 void threshold.', orderId: 'ORD-1234', cashier: 'Ahmed Hassan', amount: '$156.50', branch: 'Downtown', ruleTriggered: 'High Void Rate', timestamp: '2024-01-15 14:30', status: 'PENDING' },
  { id: '2', type: 'Cash Drawer Variance', severity: 'HIGH', description: 'End-of-shift cash count shows $78.25 shortage.', orderId: 'N/A', cashier: 'Sara Ali', amount: '$78.25', branch: 'Mall Branch', ruleTriggered: 'Cash Drawer Variance', timestamp: '2024-01-15 22:00', status: 'INVESTIGATING' },
  { id: '3', type: 'Excessive Discounts', severity: 'MEDIUM', description: '35% of transactions include manual discounts.', orderId: 'Multiple', cashier: 'Mohammed Ibrahim', amount: '$245.00', branch: 'Airport', ruleTriggered: 'Excessive Discounts', timestamp: '2024-01-15 18:45', status: 'PENDING' },
]);

const inventoryData = ref({
  criticalItems: 2,
  projectedStockouts: 5,
  wastePercentage: 3.2,
  forecastAccuracy: 87,
  lowStockItems: [
    { id: '1', name: 'Chicken Breast', daysLeft: 1, suggestedQty: 25, supplier: 'Fresh Co', unit: 'kg', status: 'critical' as const },
    { id: '2', name: 'Tomatoes', daysLeft: 2, suggestedQty: 15, supplier: 'Farm Direct', unit: 'kg', status: 'warning' as const },
    { id: '3', name: 'Milk', daysLeft: 3, suggestedQty: 20, supplier: 'Dairy Plus', unit: 'L', status: 'warning' as const },
  ],
  overstockItems: [
    { id: '4', name: 'Lettuce', daysLeft: 7, currentQty: 45, optimalQty: 20, supplier: 'Green Valley', expiryWarning: false },
    { id: '5', name: 'Bell Peppers', daysLeft: 2, currentQty: 30, optimalQty: 15, supplier: 'Farm Direct', expiryWarning: true },
  ],
  draftPO: [
    { id: '1', name: 'Chicken Breast', qty: 25, unit: 'kg', supplier: 'Fresh Co', deliveryDays: 'Mon Wed Fri' },
    { id: '2', name: 'Tomatoes', qty: 15, unit: 'kg', supplier: 'Farm Direct', deliveryDays: 'Tue Thu Sat' },
  ],
});

const notificationSettings = ref({
  dashboardAlerts: true,
  emailNotifications: true,
  smsAlerts: false,
  weeklyReports: true,
});

const tabs = [
  { id: 'dashboard' as TabType, label: 'Dashboard', icon: Home },
  { id: 'forecast' as TabType, label: 'Forecast', icon: TrendingUp },
  { id: 'orders' as TabType, label: 'Orders', icon: ShoppingCart },
  { id: 'waste' as TabType, label: 'Waste', icon: Trash2 },
  { id: 'production' as TabType, label: 'Production', icon: Factory },
  { id: 'fraud' as TabType, label: 'Fraud Detection', icon: Shield },
  { id: 'settings' as TabType, label: 'Settings', icon: Settings },
];

const chartOption = computed(() => ({
  tooltip: { trigger: 'axis' },
  xAxis: {
    type: 'category',
    data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  },
  yAxis: { type: 'value' },
  series: [
    {
      name: 'Actual',
      type: 'bar',
      data: [120, 200, 150, 80, 70, 110, 130],
      itemStyle: { color: '#7C3AED' },
    },
    {
      name: 'Forecast',
      type: 'bar',
      data: [110, 180, 160, 90, 75, 100, 140],
      itemStyle: { color: '#3B82F6' },
    },
  ],
}));

const filteredFraudAlerts = computed(() => {
  if (alertsFilter.value === 'all') return fraudAlerts.value;
  return fraudAlerts.value.filter((alert) => {
    if (alertsFilter.value === 'pending') return alert.status === 'PENDING';
    if (alertsFilter.value === 'investigating') return alert.status === 'INVESTIGATING';
    if (alertsFilter.value === 'resolved') return alert.status === 'RESOLVED';
    return true;
  });
});

const handleRefreshData = async () => {
  isRefreshing.value = true;
  await new Promise((resolve) => setTimeout(resolve, 1500));
  isRefreshing.value = false;
  alert('Data refreshed successfully!');
};

const handleToggleFraudRule = (ruleId: string) => {
  const rule = fraudRules.value.find((r) => r.id === ruleId);
  if (rule) {
    rule.enabled = !rule.enabled;
    alert(`${rule.name} rule ${rule.enabled ? 'enabled' : 'disabled'} successfully!`);
  }
};

const handleToggleNotification = (key: keyof typeof notificationSettings.value) => {
  notificationSettings.value[key] = !notificationSettings.value[key];
  const setting = key.replace(/([A-Z])/g, ' $1').toLowerCase();
  const newState = notificationSettings.value[key] ? 'enabled' : 'disabled';
  alert(`${setting} ${newState} successfully!`);
};

const handleInvestigate = (alertId: string) => {
  const alertItem = fraudAlerts.value.find((a) => a.id === alertId);
  if (alertItem) {
    alertItem.status = 'INVESTIGATING';
    alert(`Investigation started for alert ${alertId}`);
  }
};

const handleViewOrder = (alertId: string) => {
  alert(`Viewing order details for alert ${alertId}`);
};
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Inventory Guru</h1>
        <p class="text-gray-600 dark:text-gray-400">AI-Powered Inventory Management & Fraud Detection</p>
      </div>
      <div class="flex items-center space-x-3">
        <select v-model="selectedBranch" class="input">
          <option value="main-branch">Main Branch</option>
          <option value="downtown">Downtown</option>
          <option value="mall">Mall Location</option>
          <option value="airport">Airport</option>
        </select>
        <button :class="['btn flex items-center space-x-2', isRefreshing ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700']" :disabled="isRefreshing" @click="handleRefreshData">
          <RefreshCw :class="['w-4 h-4', isRefreshing ? 'animate-spin' : '']" />
          <span>{{ isRefreshing ? 'Refreshing...' : 'Refresh' }}</span>
        </button>
      </div>
    </div>

    <!-- Tab Navigation -->
    <div class="border-b border-gray-200 dark:border-gray-700">
      <nav class="flex space-x-8 overflow-x-auto">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          :class="['flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap', activeTab === tab.id ? 'border-purple-500 text-purple-600 dark:text-purple-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300']"
          @click="activeTab = tab.id"
        >
          <component :is="tab.icon" class="w-4 h-4" />
          <span>{{ tab.label }}</span>
        </button>
      </nav>
    </div>

    <!-- Dashboard Tab -->
    <div v-if="activeTab === 'dashboard'" class="space-y-6">
      <!-- Health Banner -->
      <div :class="['rounded-lg p-4 border-l-4', inventoryData.criticalItems === 0 ? 'bg-green-50 border-green-400 text-green-800 dark:bg-green-900/20 dark:text-green-300' : inventoryData.criticalItems <= 2 ? 'bg-amber-50 border-amber-400 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300' : 'bg-red-50 border-red-400 text-red-800 dark:bg-red-900/20 dark:text-red-300']">
        <div class="flex items-center">
          <AlertTriangle class="w-5 h-5 mr-2" />
          <span class="font-medium">
            {{ inventoryData.criticalItems === 0 ? 'All good! No critical stock issues' : `${inventoryData.criticalItems} critical items need attention` }}
          </span>
        </div>
      </div>

      <!-- Metric Tiles -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 dark:text-gray-400">Projected Stock-outs</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ inventoryData.projectedStockouts }}</p>
            </div>
            <AlertTriangle class="w-8 h-8 text-red-500" />
          </div>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 dark:text-gray-400">Waste %</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ inventoryData.wastePercentage }}%</p>
            </div>
            <Trash2 class="w-8 h-8 text-amber-500" />
          </div>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 dark:text-gray-400">Forecast Accuracy</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ inventoryData.forecastAccuracy }}%</p>
            </div>
            <Target class="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 dark:text-gray-400">Branch</p>
              <p class="text-lg font-semibold text-gray-900 dark:text-white capitalize">{{ selectedBranch.replace('-', ' ') }}</p>
            </div>
            <Package class="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      <!-- Chart -->
      <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Weekly Inventory Movement</h3>
        <v-chart :option="chartOption" style="height: 300px" autoresize />
      </div>

      <!-- Recent Actions -->
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Actions</h3>
        <div class="space-y-3">
          <div class="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div class="w-2 h-2 bg-green-500 rounded-full"></div>
            <span class="text-sm text-gray-700 dark:text-gray-300">Auto-ordered 25kg Chicken Breast from Fresh Co</span>
            <span class="text-xs text-gray-500 ml-auto">2 hours ago</span>
          </div>
          <div class="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div class="w-2 h-2 bg-amber-500 rounded-full"></div>
            <span class="text-sm text-gray-700 dark:text-gray-300">Marked Bell Peppers for promotion (expiry warning)</span>
            <span class="text-xs text-gray-500 ml-auto">4 hours ago</span>
          </div>
          <div class="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span class="text-sm text-gray-700 dark:text-gray-300">Updated safety stock for Tomatoes</span>
            <span class="text-xs text-gray-500 ml-auto">1 day ago</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Forecast Tab -->
    <div v-if="activeTab === 'forecast'" class="space-y-6">
      <!-- Low Stock Action Cards -->
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Low Stock - Action Required</h3>
          <span class="px-3 py-1 bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300 rounded-full text-sm font-medium">
            {{ inventoryData.lowStockItems.length }} items
          </span>
        </div>
        <div class="space-y-3">
          <div v-for="item in inventoryData.lowStockItems" :key="item.id" class="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div class="flex-1">
              <div class="flex items-center space-x-3">
                <h4 class="font-medium text-gray-900 dark:text-white">{{ item.name }}</h4>
                <span :class="['px-2 py-1 rounded-full text-xs font-medium', item.status === 'critical' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300']">
                  {{ item.daysLeft }} days left
                </span>
              </div>
              <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Suggested: {{ item.suggestedQty }} {{ item.unit }} • Supplier: {{ item.supplier }}
              </p>
            </div>
            <button class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              Add to Cart
            </button>
          </div>
        </div>
      </div>

      <!-- Overstock Items -->
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Potential Waste Prevention</h3>
          <span class="px-3 py-1 bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300 rounded-full text-sm font-medium">
            {{ inventoryData.overstockItems.length }} items
          </span>
        </div>
        <div class="space-y-3">
          <div v-for="item in inventoryData.overstockItems" :key="item.id" class="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div class="flex-1">
              <div class="flex items-center space-x-3">
                <h4 class="font-medium text-gray-900 dark:text-white">{{ item.name }}</h4>
                <span v-if="item.expiryWarning" class="px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300 rounded-full text-xs font-medium">
                  Expires in {{ item.daysLeft }} days
                </span>
              </div>
              <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Current: {{ item.currentQty }} • Optimal: {{ item.optimalQty }} • Supplier: {{ item.supplier }}
              </p>
            </div>
            <button class="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors">
              Mark as Promo
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Orders Tab -->
    <div v-if="activeTab === 'orders'" class="space-y-6">
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Draft Purchase Orders</h3>
          <label class="flex items-center space-x-2">
            <input type="checkbox" v-model="autoDraftEnabled" class="rounded border-gray-300" />
            <span class="text-sm text-gray-600 dark:text-gray-400">Auto-Draft at 02:00</span>
          </label>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th class="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-300">Item</th>
                <th class="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-300">Quantity</th>
                <th class="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-300">Supplier</th>
                <th class="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-300">Delivery Days</th>
                <th class="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="po in inventoryData.draftPO" :key="po.id" class="border-b border-gray-100 dark:border-gray-700">
                <td class="py-3 px-4 font-medium text-gray-900 dark:text-white">{{ po.name }}</td>
                <td class="py-3 px-4 text-gray-600 dark:text-gray-400">{{ po.qty }} {{ po.unit }}</td>
                <td class="py-3 px-4 text-gray-600 dark:text-gray-400">{{ po.supplier }}</td>
                <td class="py-3 px-4 text-gray-600 dark:text-gray-400">{{ po.deliveryDays }}</td>
                <td class="py-3 px-4">
                  <button class="text-blue-600 dark:text-blue-400 hover:underline text-sm mr-2">Edit</button>
                  <button class="text-red-600 dark:text-red-400 hover:underline text-sm">Remove</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="mt-4 flex justify-end">
          <button class="btn bg-purple-600 hover:bg-purple-700 text-white">Submit All Orders</button>
        </div>
      </div>
    </div>

    <!-- Fraud Detection Tab -->
    <div v-if="activeTab === 'fraud'" class="space-y-6">
      <!-- Fraud Overview -->
      <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div class="flex items-center gap-3">
            <Shield class="w-8 h-8 text-green-600" />
            <div>
              <p class="text-sm text-gray-600 dark:text-gray-400">Security Score</p>
              <p :class="['text-2xl font-bold', fraudStats.securityScore >= 85 ? 'text-green-600' : fraudStats.securityScore >= 60 ? 'text-yellow-600' : 'text-red-600']">
                {{ fraudStats.securityScore }}%
              </p>
            </div>
          </div>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div class="flex items-center gap-3">
            <AlertTriangle class="w-8 h-8 text-red-600" />
            <div>
              <p class="text-sm text-gray-600 dark:text-gray-400">Active Alerts</p>
              <p class="text-2xl font-bold text-red-600">{{ fraudStats.flaggedTransactions }}</p>
            </div>
          </div>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div class="flex items-center gap-3">
            <Eye class="w-8 h-8 text-blue-600" />
            <div>
              <p class="text-sm text-gray-600 dark:text-gray-400">Total Transactions</p>
              <p class="text-2xl font-bold text-blue-600">{{ fraudStats.totalTransactions }}</p>
            </div>
          </div>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div class="flex items-center gap-3">
            <DollarSign class="w-8 h-8 text-red-600" />
            <div>
              <p class="text-sm text-gray-600 dark:text-gray-400">Potential Loss</p>
              <p class="text-2xl font-bold text-red-600">${{ fraudStats.potentialLoss }}</p>
            </div>
          </div>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div class="flex items-center gap-3">
            <DollarSign class="w-8 h-8 text-green-600" />
            <div>
              <p class="text-sm text-gray-600 dark:text-gray-400">Prevented Loss</p>
              <p class="text-2xl font-bold text-green-600">${{ fraudStats.preventedLoss }}</p>
            </div>
          </div>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div class="flex items-center gap-3">
            <Target class="w-8 h-8 text-orange-600" />
            <div>
              <p class="text-sm text-gray-600 dark:text-gray-400">Accuracy Rate</p>
              <p class="text-2xl font-bold text-orange-600">{{ fraudStats.accuracyRate }}%</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Fraud Rules -->
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Fraud Detection Rules</h3>
          <button class="btn bg-purple-600 hover:bg-purple-700 text-white flex items-center space-x-2">
            <Plus class="w-4 h-4" />
            <span>Add Rule</span>
          </button>
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div v-for="rule in fraudRules" :key="rule.id" class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div class="flex items-center gap-4">
              <div :class="['w-3 h-3 rounded-full', rule.enabled ? 'bg-green-500' : 'bg-gray-400']"></div>
              <div>
                <h4 class="font-medium text-gray-900 dark:text-white">{{ rule.name }}</h4>
                <p class="text-sm text-gray-600 dark:text-gray-400">{{ rule.threshold }}</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <span :class="['px-2 py-1 text-xs rounded-full', rule.severity === 'HIGH' ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300' : rule.severity === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300']">
                {{ rule.severity }}
              </span>
              <button :class="['w-10 h-6 rounded-full transition-colors relative', rule.enabled ? 'bg-green-500' : 'bg-gray-300']" @click="handleToggleFraudRule(rule.id)">
                <div :class="['w-4 h-4 bg-white rounded-full transition-transform absolute top-1', rule.enabled ? 'translate-x-5' : 'translate-x-1']"></div>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Fraud Alerts -->
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">POS Fraud Detection Alerts</h3>
          <div class="flex gap-2">
            <select v-model="alertsFilter" class="input text-sm">
              <option value="all">All Alerts</option>
              <option value="pending">Pending</option>
              <option value="investigating">Investigating</option>
              <option value="resolved">Resolved</option>
            </select>
            <button class="btn bg-gray-600 hover:bg-gray-700 text-white flex items-center space-x-2">
              <Download class="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
        <div class="space-y-4">
          <div v-for="alert in filteredFraudAlerts" :key="alert.id" class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border-l-4 border-l-red-500">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-4 flex-1">
                <div :class="['w-3 h-3 rounded-full', alert.severity === 'HIGH' ? 'bg-red-500' : alert.severity === 'MEDIUM' ? 'bg-yellow-500' : 'bg-blue-500']"></div>
                <div class="flex-1">
                  <div class="flex items-center gap-3 mb-2">
                    <h4 class="font-semibold text-gray-900 dark:text-white">{{ alert.type }}</h4>
                    <span :class="['px-2 py-1 text-xs rounded-full', alert.severity === 'HIGH' ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300' : alert.severity === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300']">
                      {{ alert.severity }}
                    </span>
                  </div>
                  <p class="text-sm text-gray-700 dark:text-gray-300 mb-2">{{ alert.description }}</p>
                  <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs text-gray-600 dark:text-gray-400">
                    <div><span class="font-medium">Order ID:</span> {{ alert.orderId }}</div>
                    <div><span class="font-medium">Cashier:</span> {{ alert.cashier }}</div>
                    <div><span class="font-medium">Amount:</span> {{ alert.amount }}</div>
                    <div><span class="font-medium">Branch:</span> {{ alert.branch }}</div>
                  </div>
                  <div class="mt-2 text-xs text-gray-500">
                    <span class="font-medium">Rule Triggered:</span> {{ alert.ruleTriggered }} • {{ alert.timestamp }}
                  </div>
                </div>
              </div>
              <div class="flex items-center gap-2 ml-4">
                <span :class="['px-3 py-1 text-xs rounded-full font-medium', alert.status === 'RESOLVED' ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300' : alert.status === 'INVESTIGATING' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300' : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300']">
                  {{ alert.status }}
                </span>
                <div v-if="alert.status !== 'RESOLVED'" class="flex gap-2">
                  <button class="btn bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm flex items-center" @click="handleViewOrder(alert.id)">
                    <Eye class="w-4 h-4 mr-1" />
                    View
                  </button>
                  <button class="btn bg-blue-600 hover:bg-blue-700 text-white text-sm" @click="handleInvestigate(alert.id)">
                    Investigate
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Settings Tab -->
    <div v-if="activeTab === 'settings'" class="space-y-6">
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-6">Notification Settings</h3>
        <div class="space-y-4">
          <div v-for="(value, key) in notificationSettings" :key="key" class="flex items-center justify-between">
            <div>
              <h4 class="font-medium text-gray-900 dark:text-white capitalize">{{ key.replace(/([A-Z])/g, ' $1') }}</h4>
              <p class="text-sm text-gray-600 dark:text-gray-400">Configure {{ key.replace(/([A-Z])/g, ' $1').toLowerCase() }}</p>
            </div>
            <button :class="['w-10 h-6 rounded-full transition-colors relative', value ? 'bg-green-500' : 'bg-gray-300']" @click="handleToggleNotification(key)">
              <div :class="['w-4 h-4 bg-white rounded-full transition-transform absolute top-1', value ? 'translate-x-5' : 'translate-x-1']"></div>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.btn {
  @apply px-4 py-2 rounded-lg font-medium transition-colors text-white;
}

.input {
  @apply px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent;
}
</style>
