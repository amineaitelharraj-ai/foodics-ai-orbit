import React, { useState } from 'react'
import { useFraudDetection } from '../hooks/useFraudDetection'
import POSSimulator from '../components/POSSimulator'
import {
  AlertTriangle,
  Package,
  Target,
  RefreshCw,
  Settings,
  Download,
  Shield,
  BarChart3,
  Activity,
  DollarSign,
  Eye,
  Filter,
  Plus,
  Home,
  TrendingUp,
  ShoppingCart,
  Trash2,
  Factory
} from 'lucide-react'
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { Button, Badge, Tabs, TabsList, TabsTrigger, TabsContent, Modal, Input } from '../components/ui'

interface NotificationSettings {
  dashboardAlerts: boolean
  emailNotifications: boolean
  smsAlerts: boolean
  weeklyReports: boolean
}

interface AutoScheduleItem {
  name: string
  currentStock: number
  reorderPoint: number
  nextDelivery: string
  supplier: string
  status: 'on-track' | 'urgent' | 'healthy'
  costPerUnit: number
}

interface Branch {
  id: string
  name: string
}

// interface Supplier { // Unused
//   id: string
//   name: string
// }

/**
 * InventoryGuru Component
 * 
 * A comprehensive inventory management dashboard with fraud detection capabilities.
 * Features include:
 * - Auto-scheduling for inventory items
 * - Seasonality analysis and predictions
 * - Real-time POS fraud detection with configurable rules
 * - Analytics and performance tracking
 * - Investigation workflow for fraud alerts
 * 
 * @component
 * @returns {JSX.Element} The InventoryGuru component
 */
const InventoryGuru: React.FC = () => {
  // Navigation and view state
  const [activeTab, setActiveTab] = useState<'dashboard' | 'forecast' | 'orders' | 'waste' | 'production' | 'settings' | 'fraud'>('dashboard')
  const [selectedBranch, setSelectedBranch] = useState('main-branch')
  // const [timeRange, setTimeRange] = useState('30d') // Unused
  // const [selectedSupplier, setSelectedSupplier] = useState('all') // Unused
  const [showConfigModal, setShowConfigModal] = useState(false)
  const [showInvestigationModal, setShowInvestigationModal] = useState<string | null>(null)
  const [showPOModal, setShowPOModal] = useState<string | null>(null)
  const [showOrderDetailsModal, setShowOrderDetailsModal] = useState<string | null>(null)
  
  // Error and loading states for better UX
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  // Fraud alerts filtering
  const [alertsFilter, setAlertsFilter] = useState<'all' | 'pending' | 'investigating' | 'resolved'>('all')
  const [showFilterModal, setShowFilterModal] = useState(false)

  // Use the fraud detection hook for real backend data
  const {
    fraudAlerts,
    fraudRules,
    fraudStats,
    toggleRule,
    refreshData,
    isConnected,
    updateAlertStatus
  } = useFraudDetection()

  // Sample data for Auto-Scheduling
  // Unused data arrays commented out

  // Seasonality data
  // @ts-ignore - Unused variable
  const _seasonalData = [
    { month: 'Jan', sales: 2400, forecast: 2200, orderDate: '2024-01-15' },
    { month: 'Feb', sales: 1398, forecast: 1500, orderDate: '2024-02-10' },
    { month: 'Mar', sales: 9800, forecast: 9500, orderDate: '2024-03-05' }, // Ramadan peak
    { month: 'Apr', sales: 3908, forecast: 4000, orderDate: '2024-04-12' },
    { month: 'May', sales: 4800, forecast: 4500, orderDate: '2024-05-08' },
    { month: 'Jun', sales: 3800, forecast: 3600, orderDate: '2024-06-15' },
    { month: 'Jul', sales: 4300, forecast: 4100, orderDate: '2024-07-10' },
    { month: 'Aug', sales: 8500, forecast: 8200, orderDate: '2024-08-05' }, // Hajj season
    { month: 'Sep', sales: 3200, forecast: 3400, orderDate: '2024-09-12' },
    { month: 'Oct', sales: 3000, forecast: 3100, orderDate: '2024-10-15' },
    { month: 'Nov', sales: 4100, forecast: 4000, orderDate: '2024-11-08' },
    { month: 'Dec', sales: 5200, forecast: 5000, orderDate: '2024-12-05' },
  ]

  // POS Fraud detection data is now loaded from the backend via the hook

  // Notification settings state with proper typing
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    dashboardAlerts: true,
    emailNotifications: true,
    smsAlerts: false,
    weeklyReports: true
  })

  // Daily fraud statistics are now loaded from the backend via the hook

  // @ts-ignore - Unused variable
  const _autoScheduleItems: AutoScheduleItem[] = [
    {
      name: 'Chicken Breast',
      currentStock: 45,
      reorderPoint: 30,
      nextDelivery: '2024-01-18',
      supplier: 'Al-Watania Poultry',
      status: 'on-track',
      costPerUnit: 25.5
    },
    {
      name: 'Beef Patties',
      currentStock: 18,
      reorderPoint: 25,
      nextDelivery: 'Order Now',
      supplier: 'National Beef',
      status: 'urgent',
      costPerUnit: 32.0
    },
    {
      name: 'Fresh Tomatoes',
      currentStock: 67,
      reorderPoint: 40,
      nextDelivery: '2024-01-20',
      supplier: 'Green Valley Farms',
      status: 'healthy',
      costPerUnit: 8.5
    },
    {
      name: 'Cheese Slices',
      currentStock: 89,
      reorderPoint: 50,
      nextDelivery: '2024-01-22',
      supplier: 'Dairy Express',
      status: 'healthy',
      costPerUnit: 15.75
    }
  ]

  // @ts-ignore - Unused variable
  const _branches: Branch[] = [
    { id: 'all', name: 'All Branches' },
    { id: 'downtown', name: 'Downtown' },
    { id: 'mall', name: 'Mall Location' },
    { id: 'airport', name: 'Airport' }
  ]

  // const suppliers: Supplier[] = [
  //   { id: 'all', name: 'All Suppliers' },
  //   { id: 'al-watania', name: 'Al-Watania Poultry' },
  //   { id: 'national-beef', name: 'National Beef' },
  //   { id: 'green-valley', name: 'Green Valley Farms' },
  //   { id: 'dairy-express', name: 'Dairy Express' }
  // ] // Unused

  // Analytics data
  // @ts-ignore - Unused variable
  const _analyticsData = {
    totalItems: 847,
    autoScheduledItems: 245,
    costSavings: 15420,
    accuracyRate: 96.8,
    ordersFulfilled: 1247,
    stockouts: 3,
    overstock: 12,
    turnoverRate: 8.4
  }

  // @ts-ignore - Unused variable
  const _performanceData = [
    { month: 'Jan', accuracy: 94.2, costSavings: 12400, stockouts: 5 },
    { month: 'Feb', accuracy: 95.1, costSavings: 13200, stockouts: 4 },
    { month: 'Mar', accuracy: 96.8, costSavings: 15420, stockouts: 3 },
    { month: 'Apr', accuracy: 95.5, costSavings: 14100, stockouts: 6 },
    { month: 'May', accuracy: 97.2, costSavings: 16800, stockouts: 2 },
    { month: 'Jun', accuracy: 96.1, costSavings: 15200, stockouts: 4 }
  ]

  // @ts-ignore - Unused variable
  const _topPerformingItems = [
    { name: 'Chicken Breast', accuracy: 98.5, savings: 3200, orders: 156 },
    { name: 'Beef Patties', accuracy: 96.8, savings: 2800, orders: 134 },
    { name: 'Fresh Tomatoes', accuracy: 94.2, savings: 1600, orders: 89 },
    { name: 'Cheese Slices', accuracy: 97.1, savings: 2100, orders: 112 }
  ]

  // @ts-ignore - Unused function
  const _handleCreatePO = (item: string) => {
    setShowPOModal(item)
  }

  const handleInvestigate = (alertId: string) => {
    setShowInvestigationModal(alertId)
  }

  /**
   * Opens the detailed order view modal for fraud investigation
   * 
   * @param {string} alertId - The ID of the fraud alert to view details for
   */
  const handleViewOrder = (alertId: string) => {
    setShowOrderDetailsModal(alertId)
  }

  // @ts-ignore - Unused function
  const _handleConfigureScheduling = () => {
    setShowConfigModal(true)
  }

  /**
   * Handles toggling notification settings with proper error handling
   * 
   * @param {keyof NotificationSettings} settingKey - The notification setting to toggle
   */
  const handleToggleNotification = (settingKey: keyof typeof notificationSettings) => {
    try {
      setNotificationSettings(prev => ({
        ...prev,
        [settingKey]: !prev[settingKey]
      }))
      
      // Show confirmation feedback
      const setting = settingKey.replace(/([A-Z])/g, ' $1').toLowerCase()
      const newState = !notificationSettings[settingKey] ? 'enabled' : 'disabled'
      window.alert(`${setting} ${newState} successfully!`)
      
      // Clear any previous errors
      setError(null)
    } catch (err) {
      setError('Failed to update notification settings. Please try again.')
      console.error('Notification toggle error:', err)
    }
  }

  /**
   * Handles data refresh with loading state and error handling
   * Uses the real fraud detection data refresh
   */
  const handleRefreshData = async () => {
    setIsRefreshing(true)
    setError(null)
    
    try {
      await refreshData()
      window.alert('Fraud detection data refreshed successfully!')
    } catch (err) {
      setError('Failed to refresh fraud data. Please check your connection and try again.')
      console.error('Data refresh error:', err)
    } finally {
      setIsRefreshing(false)
    }
  }

  /**
   * Handles fraud alerts filtering
   */
  const handleFilterAlerts = (filter: 'all' | 'pending' | 'investigating' | 'resolved') => {
    setAlertsFilter(filter)
    setShowFilterModal(false)
  }

  /**
   * Filter fraud alerts based on current filter
   */
  const filteredFraudAlerts = fraudAlerts.filter(alert => {
    if (alertsFilter === 'all') return true
    if (alertsFilter === 'pending') return alert.status === 'PENDING'
    if (alertsFilter === 'investigating') return alert.status === 'INVESTIGATING'
    if (alertsFilter === 'resolved') return alert.status === 'RESOLVED'
    return true
  })

  /**
   * Handles toggling fraud detection rules with validation
   * Includes error handling and user feedback
   * 
   * @param {string} ruleId - The ID of the fraud rule to toggle
   */
  const handleToggleFraudRule = async (ruleId: string) => {
    try {
      const rule = fraudRules.find(r => r.id === ruleId)
      if (!rule) {
        throw new Error('Fraud rule not found')
      }

      await toggleRule(ruleId)

      const action = rule.enabled ? 'disabled' : 'enabled'
      window.alert(`${rule.name} rule ${action} successfully!`)
      setError(null)
    } catch (err) {
      setError(`Failed to toggle fraud rule. ${err instanceof Error ? err.message : 'Please try again.'}`)
      console.error('Fraud rule toggle error:', err)
    }
  }





  const renderFraudDetection = () => (
    <div className="space-y-6">
      {/* Fraud Overview */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <div className="card">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Security Score</p>
              <p className={`text-2xl font-bold ${fraudStats.securityScore >= 85 ? 'text-green-600' : fraudStats.securityScore >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                {fraudStats.securityScore}%
              </p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-red-600" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Alerts</p>
              <p className="text-2xl font-bold text-red-600">{fraudStats.flaggedTransactions}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3">
            <Eye className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Transactions</p>
              <p className="text-2xl font-bold text-blue-600">{fraudStats.totalTransactions}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-red-600" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Potential Loss</p>
              <p className="text-2xl font-bold text-red-600">${fraudStats.potentialLoss}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Prevented Loss</p>
              <p className="text-2xl font-bold text-green-600">${fraudStats.preventedLoss}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3">
            <Target className="w-8 h-8 text-orange-600" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Accuracy Rate</p>
              <p className="text-2xl font-bold text-orange-600">{Math.round(((fraudStats.flaggedTransactions - fraudStats.falsePositives) / fraudStats.flaggedTransactions) * 100)}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Fraud Rules Configuration */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Fraud Detection Rules & Thresholds
          </h3>
          <div className="flex gap-2">
            <button className="btn btn-secondary btn-sm">
              <Settings className="w-4 h-4 mr-2" />
              Configure Rules
            </button>
            <button className="btn btn-primary btn-sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Rule
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {fraudRules.map((rule) => (
            <div key={rule.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full ${rule.enabled ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">{rule.name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{rule.threshold}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  rule.severity === 'HIGH' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                  rule.severity === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                  'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                }`}>
                  {rule.severity}
                </span>
                <button 
                  onClick={() => handleToggleFraudRule(rule.id)}
                  className={`w-10 h-6 rounded-full transition-colors ${
                    rule.enabled ? 'bg-green-500' : 'bg-gray-300'
                  } relative`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform absolute top-1 ${
                    rule.enabled ? 'translate-x-5' : 'translate-x-1'
                  }`}></div>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Real-time Fraud Alerts */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              POS Fraud Detection Alerts
            </h3>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-xs text-gray-500">
                {isConnected ? 'Live Updates' : 'Disconnected'}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleRefreshData}
              disabled={isRefreshing}
              className="btn btn-secondary btn-sm"
              title="Refresh fraud alerts"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            <button 
              onClick={() => setShowFilterModal(true)}
              className="btn btn-secondary btn-sm relative"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filter by Status
              {alertsFilter !== 'all' && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></span>
              )}
            </button>
            <button className="btn btn-secondary btn-sm">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </button>
          </div>
        </div>
        
        <div className="space-y-4">
          {filteredFraudAlerts.map((alert) => (
            <div key={alert.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border-l-4 border-l-red-500">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${
                    alert.severity === 'HIGH' ? 'bg-red-500' :
                    alert.severity === 'MEDIUM' ? 'bg-yellow-500' : 'bg-blue-500'
                  }`}></div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-gray-900 dark:text-white">{alert.type}</h4>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        alert.severity === 'HIGH' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                        alert.severity === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                        'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                      }`}>
                        {alert.severity.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                      {alert.description}
                    </p>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs text-gray-600 dark:text-gray-400">
                      <div>
                        <span className="font-medium">Order ID:</span> {alert.orderId}
                      </div>
                      <div>
                        <span className="font-medium">Cashier:</span> {alert.cashier}
                      </div>
                      <div>
                        <span className="font-medium">Amount:</span> {alert.amount}
                      </div>
                      <div>
                        <span className="font-medium">Branch:</span> {alert.branch}
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-500">
                      <span className="font-medium">Rule Triggered:</span> {alert.ruleTriggered} • {alert.timestamp}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                    alert.status === 'RESOLVED' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                    alert.status === 'INVESTIGATING' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                    'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                  }`}>
                    {alert.status}
                  </span>
                  {alert.status !== 'RESOLVED' && (
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleViewOrder(alert.id)}
                        className="btn btn-secondary btn-sm"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View Order
                      </button>
                      <button 
                        onClick={() => handleInvestigate(alert.id)}
                        className="btn btn-primary btn-sm"
                      >
                        Investigate
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* POS Audit Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Daily Audit Reports
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Fraud Alerts Today</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {fraudAlerts.filter(alert => {
                    const today = new Date().toDateString()
                    const alertDate = new Date(alert.timestamp).toDateString()
                    return alertDate === today
                  }).length} alerts detected, {fraudAlerts.filter(alert => {
                    const today = new Date().toDateString()
                    const alertDate = new Date(alert.timestamp).toDateString()
                    return alertDate === today && alert.status === 'PENDING'
                  }).length} pending investigation
                </p>
              </div>
              <button 
                onClick={() => window.alert('Downloading today\'s fraud alerts report...')}
                className="btn btn-secondary btn-sm"
              >
                <Download className="w-4 h-4 mr-1" />
                Export
              </button>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Fraud Prevention Report</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  ${fraudStats.preventedLoss.toFixed(2)} saved, {fraudStats.accuracyRate}% accuracy rate
                </p>
              </div>
              <button 
                onClick={() => window.alert('Downloading fraud prevention analytics...')}
                className="btn btn-secondary btn-sm"
              >
                <Download className="w-4 h-4 mr-1" />
                Export
              </button>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Active Rules Status</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {fraudRules.filter(rule => rule.enabled).length} active rules monitoring transactions
                </p>
              </div>
              <button 
                onClick={() => window.alert('Downloading rules configuration report...')}
                className="btn btn-secondary btn-sm"
              >
                <Download className="w-4 h-4 mr-1" />
                Export
              </button>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div>
                <h4 className="font-medium text-red-700 dark:text-red-300">Critical Alerts</h4>
                <p className="text-xs text-red-600 dark:text-red-400">
                  {fraudAlerts.filter(alert => alert.severity === 'HIGH' && alert.status === 'PENDING').length} high-priority alerts require immediate review
                </p>
              </div>
              <button className="btn btn-primary btn-sm">
                <Eye className="w-4 h-4 mr-1" />
                Review
              </button>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Notification Settings
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Real-time Dashboard Alerts</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">Show alerts on manager dashboard</p>
              </div>
              <button 
                onClick={() => handleToggleNotification('dashboardAlerts')}
                className={`w-10 h-6 rounded-full transition-colors ${
                  notificationSettings.dashboardAlerts ? 'bg-green-500' : 'bg-gray-300'
                } relative`}
              >
                <div className={`w-4 h-4 bg-white rounded-full transition-transform absolute top-1 ${
                  notificationSettings.dashboardAlerts ? 'translate-x-5' : 'translate-x-1'
                }`}></div>
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Email Notifications</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">Send fraud alerts via email</p>
              </div>
              <button 
                onClick={() => handleToggleNotification('emailNotifications')}
                className={`w-10 h-6 rounded-full transition-colors ${
                  notificationSettings.emailNotifications ? 'bg-green-500' : 'bg-gray-300'
                } relative`}
              >
                <div className={`w-4 h-4 bg-white rounded-full transition-transform absolute top-1 ${
                  notificationSettings.emailNotifications ? 'translate-x-5' : 'translate-x-1'
                }`}></div>
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">SMS Alerts</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">Critical alerts via SMS</p>
              </div>
              <button 
                onClick={() => handleToggleNotification('smsAlerts')}
                className={`w-10 h-6 rounded-full transition-colors ${
                  notificationSettings.smsAlerts ? 'bg-green-500' : 'bg-gray-300'
                } relative`}
              >
                <div className={`w-4 h-4 bg-white rounded-full transition-transform absolute top-1 ${
                  notificationSettings.smsAlerts ? 'translate-x-5' : 'translate-x-1'
                }`}></div>
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Weekly Summary Reports</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">Comprehensive fraud analysis</p>
              </div>
              <button 
                onClick={() => handleToggleNotification('weeklyReports')}
                className={`w-10 h-6 rounded-full transition-colors ${
                  notificationSettings.weeklyReports ? 'bg-green-500' : 'bg-gray-300'
                } relative`}
              >
                <div className={`w-4 h-4 bg-white rounded-full transition-transform absolute top-1 ${
                  notificationSettings.weeklyReports ? 'translate-x-5' : 'translate-x-1'
                }`}></div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* AI-Powered Fraud Prevention */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          AI-Powered POS Fraud Prevention
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <Activity className="w-6 h-6 text-blue-600 mb-2" />
            <h4 className="font-medium text-gray-900 dark:text-white mb-1">Real-time Monitoring</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Monitor every POS transaction for suspicious patterns in real-time
            </p>
          </div>
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <Shield className="w-6 h-6 text-green-600 mb-2" />
            <h4 className="font-medium text-gray-900 dark:text-white mb-1">Behavioral Analysis</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Track cashier behavior patterns and detect anomalies automatically
            </p>
          </div>
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <BarChart3 className="w-6 h-6 text-purple-600 mb-2" />
            <h4 className="font-medium text-gray-900 dark:text-white mb-1">Smart Reporting</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Generate detailed reports with actionable insights and trends
            </p>
          </div>
          <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-orange-600 mb-2" />
            <h4 className="font-medium text-gray-900 dark:text-white mb-1">Predictive Alerts</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Machine learning predicts potential fraud before revenue loss occurs
            </p>
          </div>
        </div>
      </div>

      {/* POS Event Simulator */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          🧪 POS Event Simulator
        </h3>
        <POSSimulator />
      </div>
    </div>
  )



  // Mock inventory data for the new modules
  const [inventoryData] = useState({
    criticalItems: 2,
    projectedStockouts: 5,
    wastePercentage: 3.2,
    forecastAccuracy: 87,
    lowStockItems: [
      { id: '1', name: 'Chicken Breast', daysLeft: 1, suggestedQty: 25, supplier: 'Fresh Co', unit: 'kg', status: 'critical' },
      { id: '2', name: 'Tomatoes', daysLeft: 2, suggestedQty: 15, supplier: 'Farm Direct', unit: 'kg', status: 'warning' },
      { id: '3', name: 'Milk', daysLeft: 3, suggestedQty: 20, supplier: 'Dairy Plus', unit: 'L', status: 'warning' }
    ],
    overstockItems: [
      { id: '4', name: 'Lettuce', daysLeft: 7, currentQty: 45, optimalQty: 20, supplier: 'Green Valley', expiryWarning: false },
      { id: '5', name: 'Bell Peppers', daysLeft: 2, currentQty: 30, optimalQty: 15, supplier: 'Farm Direct', expiryWarning: true }
    ],
    draftPO: [
      { id: '1', name: 'Chicken Breast', qty: 25, unit: 'kg', supplier: 'Fresh Co', deliveryDays: 'Mon Wed Fri' },
      { id: '2', name: 'Tomatoes', qty: 15, unit: 'kg', supplier: 'Farm Direct', deliveryDays: 'Tue Thu Sat' }
    ],
    wasteLog: [
      { date: '2024-01-15', accounted: 45, unaccounted: 12, total: 57 },
      { date: '2024-01-14', accounted: 32, unaccounted: 8, total: 40 },
      { date: '2024-01-13', accounted: 28, unaccounted: 15, total: 43 }
    ]
  })

  const [autoDraftEnabled, setAutoDraftEnabled] = useState(false)
  const [autopilotLevel, setAutopilotLevel] = useState(1) // 0-3: Advisory, Auto-draft, Auto-order, Full autopilot

  // Component render functions for new modules
  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Health Banner */}
      <div className={`rounded-lg p-4 border-l-4 ${
        inventoryData.criticalItems === 0 
          ? 'bg-green-50 border-green-400 text-green-800' 
          : inventoryData.criticalItems <= 2 
            ? 'bg-amber-50 border-amber-400 text-amber-800'
            : 'bg-red-50 border-red-400 text-red-800'
      }`}>
        <div className="flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2" />
          <span className="font-medium">
            {inventoryData.criticalItems === 0 
              ? "All good! No critical stock issues" 
              : `${inventoryData.criticalItems} critical items need attention`}
          </span>
        </div>
      </div>

      {/* Metric Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Projected Stock-outs</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{inventoryData.projectedStockouts}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Waste %</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{inventoryData.wastePercentage}%</p>
            </div>
            <Trash2 className="w-8 h-8 text-amber-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Forecast Accuracy</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{inventoryData.forecastAccuracy}%</p>
            </div>
            <Target className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Branch</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white capitalize">{selectedBranch.replace('-', ' ')}</p>
            </div>
            <Package className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Recent Actions Timeline */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Actions</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-700 dark:text-gray-300">Auto-ordered 25kg Chicken Breast from Fresh Co</span>
            <span className="text-xs text-gray-500 ml-auto">2 hours ago</span>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
            <span className="text-sm text-gray-700 dark:text-gray-300">Marked Bell Peppers for promotion (expiry warning)</span>
            <span className="text-xs text-gray-500 ml-auto">4 hours ago</span>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-sm text-gray-700 dark:text-gray-300">Updated safety stock for Tomatoes</span>
            <span className="text-xs text-gray-500 ml-auto">1 day ago</span>
          </div>
        </div>
      </div>
    </div>
  )

  const renderForecast = () => (
    <div className="space-y-6">
      {/* Low Stock Action Cards */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Low Stock - Action Required</h3>
          <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
            {inventoryData.lowStockItems.length} items
          </span>
        </div>
        
        <div className="space-y-3">
          {inventoryData.lowStockItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <h4 className="font-medium text-gray-900 dark:text-white">{item.name}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    item.status === 'critical' 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {item.daysLeft} days left
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Suggested: {item.suggestedQty} {item.unit} • Supplier: {item.supplier}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button className="px-3 py-1 text-gray-600 hover:bg-gray-100">-</button>
                  <span className="px-4 py-1 border-x border-gray-300">{item.suggestedQty}</span>
                  <button className="px-3 py-1 text-gray-600 hover:bg-gray-100">+</button>
                </div>
                <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Overstock Items */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Potential Waste Prevention</h3>
          <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
            {inventoryData.overstockItems.length} items
          </span>
        </div>
        
        <div className="space-y-3">
          {inventoryData.overstockItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <h4 className="font-medium text-gray-900 dark:text-white">{item.name}</h4>
                  {item.expiryWarning && (
                    <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                      Expires in {item.daysLeft} days
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Current: {item.currentQty} • Optimal: {item.optimalQty} • Supplier: {item.supplier}
                </p>
              </div>
              <button className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors">
                Mark as Promo
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 7-Day Usage Heatmap */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">7-Day Usage Heatmap</h3>
        <div className="grid grid-cols-7 gap-2">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
            <div key={day} className="text-center">
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">{day}</div>
              <div className={`h-12 rounded-lg flex items-center justify-center text-xs font-medium ${
                [
                  'bg-green-200 text-green-800',
                  'bg-yellow-200 text-yellow-800', 
                  'bg-red-200 text-red-800',
                  'bg-green-200 text-green-800',
                  'bg-red-200 text-red-800',
                  'bg-yellow-200 text-yellow-800',
                  'bg-green-200 text-green-800'
                ][index]
              }`}>
                {[65, 78, 92, 71, 89, 83, 56][index]}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderOrders = () => (
    <div className="space-y-6">
      {/* Draft Purchase Orders */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Draft Purchase Orders</h3>
          <div className="flex items-center space-x-2">
            <label className="flex items-center space-x-2">
              <input 
                type="checkbox" 
                checked={autoDraftEnabled}
                onChange={(e) => setAutoDraftEnabled(e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">Auto-Draft at 02:00</span>
            </label>
          </div>
        </div>
        
        {inventoryData.draftPO.length > 0 ? (
          <div className="space-y-4">
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-purple-900 dark:text-purple-100">Fresh Co</h4>
                <span className="text-sm text-purple-700 dark:text-purple-300">Delivery: Mon Wed Fri</span>
              </div>
              
              <div className="space-y-2">
                {inventoryData.draftPO.filter(item => item.supplier === 'Fresh Co').map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-2">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{item.name}</span>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center border border-gray-300 rounded">
                        <button className="px-2 py-1 text-gray-600 hover:bg-gray-100">-</button>
                        <span className="px-3 py-1 border-x border-gray-300">{item.qty}</span>
                        <button className="px-2 py-1 text-gray-600 hover:bg-gray-100">+</button>
                      </div>
                      <span className="text-sm text-gray-500">{item.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors">
                Save Draft
              </button>
              <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                Send Order
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No draft orders. Items will appear here when stock is low.</p>
          </div>
        )}
      </div>

      {/* Order History */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Orders</h3>
        <div className="space-y-3">
          {[
            { id: 'PO-2024-001', supplier: 'Fresh Co', date: '2024-01-15', status: 'Delivered', total: 'AED 450' },
            { id: 'PO-2024-002', supplier: 'Farm Direct', date: '2024-01-14', status: 'In Transit', total: 'AED 320' },
            { id: 'PO-2024-003', supplier: 'Dairy Plus', date: '2024-01-13', status: 'Pending', total: 'AED 280' }
          ].map((order) => (
            <div key={order.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">{order.id}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{order.supplier} • {order.date}</p>
              </div>
              <div className="text-right">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                  order.status === 'In Transit' ? 'bg-blue-100 text-blue-800' :
                  'bg-amber-100 text-amber-800'
                }`}>
                  {order.status}
                </span>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{order.total}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderWaste = () => (
    <div className="space-y-6">
      {/* Waste Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Daily Waste Tracking</h3>
          <div className="flex space-x-2">
            <button className="px-3 py-1 bg-purple-100 text-purple-800 rounded-lg text-sm">7 days</button>
            <button className="px-3 py-1 bg-gray-100 text-gray-800 rounded-lg text-sm">30 days</button>
          </div>
        </div>
        
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={inventoryData.wasteLog}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="accounted" stackId="a" fill="#9333ea" name="Accounted Waste" />
              <Bar dataKey="unaccounted" stackId="a" fill="#f59e0b" name="Unaccounted Waste" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Waste Log Feed */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Waste Entries</h3>
          <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            Log Waste
          </button>
        </div>
        
        <div className="space-y-3">
          {[
            { item: 'Lettuce', qty: '2 kg', reason: 'Expired', date: '2 hours ago', user: 'Kitchen Staff' },
            { item: 'Bell Peppers', qty: '1.5 kg', reason: 'Damaged', date: '4 hours ago', user: 'Prep Cook' },
            { item: 'Tomatoes', qty: '800g', reason: 'Overripe', date: '1 day ago', user: 'Manager' }
          ].map((entry, index) => (
            <div key={index} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">{entry.item}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{entry.qty} • {entry.reason} • by {entry.user}</p>
              </div>
              <span className="text-xs text-gray-500">{entry.date}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderProduction = () => (
    <div className="space-y-6">
      {/* V2 Badge */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-center">
          <Factory className="w-5 h-5 text-amber-600 mr-2" />
          <span className="text-amber-800 font-medium">Production Module - Version 2</span>
          <span className="ml-2 px-2 py-1 bg-amber-200 text-amber-800 rounded-full text-xs">Coming Soon</span>
        </div>
        <p className="text-sm text-amber-700 mt-2">
          Advanced production planning, prep tables, and variance tracking will be available in the next release.
        </p>
      </div>

      {/* Preview Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 opacity-50">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Production Plan Preview</h3>
        <div className="grid grid-cols-4 gap-4 text-sm">
          <div className="font-medium text-gray-600 dark:text-gray-400">Item</div>
          <div className="font-medium text-gray-600 dark:text-gray-400">Need</div>
          <div className="font-medium text-gray-600 dark:text-gray-400">Has</div>
          <div className="font-medium text-gray-600 dark:text-gray-400">Gap</div>
          
          <div>Bread Rolls</div>
          <div>255</div>
          <div>110</div>
          <div className="flex items-center">
            <span className="w-6 h-6 bg-pink-200 text-pink-800 rounded-full text-xs flex items-center justify-center">145</span>
          </div>
          
          <div>Soup Base</div>
          <div>50L</div>
          <div>35L</div>
          <div className="flex items-center">
            <span className="w-6 h-6 bg-pink-200 text-pink-800 rounded-full text-xs flex items-center justify-center">15L</span>
          </div>
        </div>
      </div>
    </div>
  )

  const renderSettings = () => (
    <div className="space-y-6">
      {/* Safety Stock Buffers */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Safety Stock Buffers</h3>
        <div className="space-y-4">
          {[
            { item: 'Chicken Breast', current: '10 kg', ai: true },
            { item: 'Tomatoes', current: '5 kg', ai: false },
            { item: 'Milk', current: '15 L', ai: true }
          ].map((item, index) => (
            <div key={index} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <span className="font-medium text-gray-900 dark:text-white">{item.item}</span>
                {item.ai && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">AI</span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <input 
                  type="text" 
                  value={item.current}
                  className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                />
                <button className="px-3 py-1 bg-gray-200 text-gray-800 rounded text-sm hover:bg-gray-300">
                  Update
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Supplier Lead Times */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Supplier Lead Times</h3>
        <div className="space-y-3">
          {[
            { supplier: 'Fresh Co', days: '1-2 days', schedule: 'Mon Wed Fri' },
            { supplier: 'Farm Direct', days: '2-3 days', schedule: 'Tue Thu Sat' },
            { supplier: 'Dairy Plus', days: '1 day', schedule: 'Daily' }
          ].map((supplier, index) => (
            <div key={index} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div>
                <span className="font-medium text-gray-900 dark:text-white">{supplier.supplier}</span>
                <p className="text-sm text-gray-600 dark:text-gray-400">{supplier.days} • {supplier.schedule}</p>
              </div>
              <button className="px-3 py-1 bg-gray-200 text-gray-800 rounded text-sm hover:bg-gray-300">
                Edit
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Autopilot Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Autopilot Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Automation Level: {['Advisory', 'Auto-draft', 'Auto-order', 'Full Autopilot'][autopilotLevel]}
            </label>
            <input 
              type="range" 
              min="0" 
              max="3" 
              value={autopilotLevel}
              onChange={(e) => setAutopilotLevel(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Advisory</span>
              <span>Auto-draft</span>
              <span>Auto-order</span>
              <span>Full Autopilot</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="auto-email" className="rounded border-gray-300" />
            <label htmlFor="auto-email" className="text-sm text-gray-700 dark:text-gray-300">
              Auto-email suppliers for orders
            </label>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              InventoryGuru
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              AI-powered inventory management and fraud detection system
            </p>
          </div>
          
          {/* Branch Selector */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <select 
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="main-branch">Main Branch</option>
                <option value="downtown-branch">Downtown Branch</option>
                <option value="mall-branch">Mall Branch</option>
                <option value="airport-branch">Airport Branch</option>
                <option value="all-branches">All Branches</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            
            {selectedBranch !== 'all-branches' && (
              <div className="flex items-center space-x-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="capitalize">{selectedBranch.replace('-', ' ')}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
              <p className="text-red-700 dark:text-red-300 font-medium">Error:</p>
              <p className="text-red-600 dark:text-red-400 ml-2">{error}</p>
            </div>
            <button 
              onClick={() => setError(null)}
              className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Enhanced Navigation Tabs */}
      <Tabs value={activeTab} defaultValue="dashboard" onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-7 bg-white border-b">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: Home },
            { id: 'forecast', label: 'Forecast', icon: TrendingUp },
            { id: 'orders', label: 'Orders', icon: ShoppingCart },
            { id: 'waste', label: 'Waste', icon: Trash2 },
            { id: 'production', label: 'Production', icon: Factory, badge: 'V2' },
            { id: 'settings', label: 'Settings', icon: Settings },
            { id: 'fraud', label: 'Fraud Detection', icon: Shield }
          ].map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {tab.badge && (
                <Badge variant="warning" className="ml-1">
                    {tab.badge}
                </Badge>
                )}
            </TabsTrigger>
          ))}
        </TabsList>

      {/* Tab Content */}
        <TabsContent value="dashboard">{renderDashboard()}</TabsContent>
        <TabsContent value="forecast">{renderForecast()}</TabsContent>
        <TabsContent value="orders">{renderOrders()}</TabsContent>
        <TabsContent value="waste">{renderWaste()}</TabsContent>
        <TabsContent value="production">{renderProduction()}</TabsContent>
        <TabsContent value="settings">{renderSettings()}</TabsContent>
        <TabsContent value="fraud">{renderFraudDetection()}</TabsContent>
      </Tabs>

      {/* Configuration Modal */}
      <Modal 
        isOpen={showConfigModal} 
        onClose={() => setShowConfigModal(false)}
        title="Auto-Scheduling Configuration"
        className="max-w-md"
      >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reorder Threshold (%)
                </label>
                <input type="range" min="10" max="50" defaultValue="25" className="w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Lead Time Buffer (days)
                </label>
            <Input type="number" defaultValue="3" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Auto-approval limit ($)
                </label>
            <Input type="number" defaultValue="5000" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
          <Button 
            variant="outline"
                onClick={() => setShowConfigModal(false)}
            className="flex-1"
              >
                Cancel
          </Button>
          <Button 
            variant="primary"
                onClick={() => setShowConfigModal(false)}
            className="flex-1"
              >
                Save Settings
          </Button>
            </div>
      </Modal>

      {/* Order Details Modal */}
      {showOrderDetailsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {(() => {
              const alert = fraudAlerts.find(a => a.id === showOrderDetailsModal)
              if (!alert) return null
              
              return (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Order Details - {alert.orderId}
                    </h3>
                    <button 
                      onClick={() => setShowOrderDetailsModal(null)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Order Information */}
                    <div className="space-y-4">
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Order Information</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Order ID:</span>
                            <span className="font-medium text-gray-900 dark:text-white">{alert.orderId}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Date & Time:</span>
                            <span className="font-medium text-gray-900 dark:text-white">{alert.timestamp}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Branch:</span>
                            <span className="font-medium text-gray-900 dark:text-white">{alert.branch}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Cashier:</span>
                            <span className="font-medium text-gray-900 dark:text-white">{alert.cashier}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Total Amount:</span>
                            <span className="font-medium text-gray-900 dark:text-white">{alert.amount}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Payment Method:</span>
                            <span className="font-medium text-gray-900 dark:text-white">Credit Card</span>
                          </div>
                        </div>
                      </div>

                      {/* Fraud Alert Details */}
                      <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
                        <h4 className="font-semibold text-red-700 dark:text-red-300 mb-3">Fraud Alert Details</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-red-600 dark:text-red-400">Alert Type:</span>
                            <span className="font-medium text-red-700 dark:text-red-300">{alert.type}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-red-600 dark:text-red-400">Severity:</span>
                            <span className="font-medium text-red-700 dark:text-red-300 capitalize">{alert.severity}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-red-600 dark:text-red-400">Rule Triggered:</span>
                            <span className="font-medium text-red-700 dark:text-red-300">{alert.ruleTriggered}</span>
                          </div>
                          <div className="mt-3">
                            <span className="text-red-600 dark:text-red-400">Description:</span>
                            <p className="font-medium text-red-700 dark:text-red-300 mt-1">{alert.description}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Order Items & Transaction Details */}
                    <div className="space-y-4">
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Order Items</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                            <div>
                              <span className="font-medium text-gray-900 dark:text-white">Chicken Burger</span>
                              <span className="text-sm text-gray-600 dark:text-gray-400 block">Qty: 2</span>
                            </div>
                            <span className="font-medium text-gray-900 dark:text-white">$24.00</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                            <div>
                              <span className="font-medium text-gray-900 dark:text-white">French Fries</span>
                              <span className="text-sm text-gray-600 dark:text-gray-400 block">Qty: 2</span>
                            </div>
                            <span className="font-medium text-gray-900 dark:text-white">$8.00</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                            <div>
                              <span className="font-medium text-gray-900 dark:text-white">Soft Drink</span>
                              <span className="text-sm text-gray-600 dark:text-gray-400 block">Qty: 2</span>
                            </div>
                            <span className="font-medium text-gray-900 dark:text-white">$6.00</span>
                          </div>
                          <div className="flex justify-between items-center pt-2 font-semibold">
                            <span className="text-gray-900 dark:text-white">Subtotal:</span>
                            <span className="text-gray-900 dark:text-white">$38.00</span>
                          </div>
                          <div className="flex justify-between items-center text-red-600 dark:text-red-400 font-semibold">
                            <span>Discount Applied:</span>
                            <span>-$10.50</span>
                          </div>
                          <div className="flex justify-between items-center pt-2 text-lg font-bold border-t border-gray-300 dark:border-gray-600">
                            <span className="text-gray-900 dark:text-white">Total:</span>
                            <span className="text-gray-900 dark:text-white">{alert.amount}</span>
                          </div>
                        </div>
                      </div>

                      {/* Transaction Timeline */}
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Transaction Timeline</h4>
                        <div className="space-y-3 text-sm">
                          <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <div>
                              <span className="font-medium text-gray-900 dark:text-white">Order Started</span>
                              <span className="text-gray-600 dark:text-gray-400 block">14:28:15</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <div>
                              <span className="font-medium text-gray-900 dark:text-white">Items Added</span>
                              <span className="text-gray-600 dark:text-gray-400 block">14:28:45</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            <div>
                              <span className="font-medium text-red-700 dark:text-red-300">Discount Applied</span>
                              <span className="text-red-600 dark:text-red-400 block">14:29:12 - No manager approval</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                            <div>
                              <span className="font-medium text-gray-900 dark:text-white">Payment Processed</span>
                              <span className="text-gray-600 dark:text-gray-400 block">14:30:01</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button 
                      onClick={() => {
                        setShowOrderDetailsModal(null)
                        setShowInvestigationModal(alert.id)
                      }}
                      className="btn btn-primary"
                    >
                      Start Investigation
                    </button>
                    <button 
                      onClick={() => window.alert('Order receipt reprinted successfully!')}
                      className="btn btn-secondary"
                    >
                      Reprint Receipt
                    </button>
                    <button 
                      onClick={() => window.alert('Order flagged for manager review!')}
                      className="btn bg-yellow-600 hover:bg-yellow-700 text-white"
                    >
                      Flag for Review
                    </button>
                    <button 
                      onClick={() => setShowOrderDetailsModal(null)}
                      className="btn btn-ghost"
                    >
                      Close
                    </button>
                  </div>
                </>
              )
            })()}
          </div>
        </div>
      )}

      {/* Investigation Modal */}
      {showInvestigationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              POS Fraud Investigation #{showInvestigationModal}
            </h3>
            <div className="space-y-6">
              {/* Alert Details */}
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <h4 className="font-medium text-red-700 dark:text-red-300 mb-2">Alert Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Type:</span> Excessive Voids
                  </div>
                  <div>
                    <span className="font-medium">Cashier:</span> Sarah K.
                  </div>
                  <div>
                    <span className="font-medium">Order ID:</span> #1547
                  </div>
                  <div>
                    <span className="font-medium">Amount:</span> $127.50
                  </div>
                  <div>
                    <span className="font-medium">Rule Triggered:</span> More than 3 voids in 1 hour
                  </div>
                  <div>
                    <span className="font-medium">Branch:</span> Downtown
                  </div>
                </div>
              </div>

              {/* Investigation Checklist */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Investigation Checklist:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <label className="flex items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded">
                    <input type="checkbox" className="mr-3 h-4 w-4" />
                    <span className="text-sm">Review POS transaction logs</span>
                  </label>
                  <label className="flex items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded">
                    <input type="checkbox" className="mr-3 h-4 w-4" />
                    <span className="text-sm">Check security camera footage</span>
                  </label>
                  <label className="flex items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded">
                    <input type="checkbox" className="mr-3 h-4 w-4" />
                    <span className="text-sm">Interview cashier involved</span>
                  </label>
                  <label className="flex items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded">
                    <input type="checkbox" className="mr-3 h-4 w-4" />
                    <span className="text-sm">Verify customer complaints</span>
                  </label>
                  <label className="flex items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded">
                    <input type="checkbox" className="mr-3 h-4 w-4" />
                    <span className="text-sm">Check manager override logs</span>
                  </label>
                  <label className="flex items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded">
                    <input type="checkbox" className="mr-3 h-4 w-4" />
                    <span className="text-sm">Review shift schedules</span>
                  </label>
                  <label className="flex items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded">
                    <input type="checkbox" className="mr-3 h-4 w-4" />
                    <span className="text-sm">Analyze cashier patterns</span>
                  </label>
                  <label className="flex items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded">
                    <input type="checkbox" className="mr-3 h-4 w-4" />
                    <span className="text-sm">Document all findings</span>
                  </label>
                </div>
              </div>

              {/* Action Required */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Recommended Actions:</h4>
                <div className="space-y-2">
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      📋 Review all void transactions for the past 7 days for this cashier
                    </p>
                  </div>
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      🎯 Schedule additional POS training if pattern continues
                    </p>
                  </div>
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <p className="text-sm text-red-700 dark:text-red-300">
                      ⚠️ Consider temporary manager oversight for this cashier
                    </p>
                  </div>
                </div>
              </div>

              {/* Investigation Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Investigation Notes & Findings
                </label>
                <textarea 
                  className="input" 
                  rows={4} 
                  placeholder="Document your investigation findings, evidence collected, and conclusions..."
                ></textarea>
              </div>

              {/* Investigation Outcome */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Investigation Outcome
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <button 
                    onClick={async () => {
                      console.log('No Fraud Detected button clicked');
                      console.log('updateAlertStatus function:', updateAlertStatus);
                      console.log('showInvestigationModal:', showInvestigationModal);
                      
                      try {
                        if (updateAlertStatus && showInvestigationModal) {
                          console.log('Calling updateAlertStatus with RESOLVED status');
                          const result = await updateAlertStatus(showInvestigationModal, 'RESOLVED');
                          console.log('Update result:', result);
                          setShowInvestigationModal(null)
                          refreshData()
                          window.alert('Alert marked as FALSE POSITIVE and resolved.')
                        } else {
                          console.error('Missing required functions or modal ID:', {
                            updateAlertStatus: !!updateAlertStatus,
                            showInvestigationModal: showInvestigationModal
                          });
                          window.alert('Error: Missing required functions. Please refresh the page.');
                        }
                      } catch (error) {
                        console.error('Error updating status:', error)
                        window.alert(`Error updating status: ${error instanceof Error ? error.message : String(error)}`);
                      }
                    }}
                    className="p-3 border-2 border-green-200 dark:border-green-800 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20"
                  >
                    <div className="text-green-600 font-medium">✓ No Fraud Detected</div>
                    <div className="text-xs text-green-500">False positive</div>
                  </button>
                  <button 
                    onClick={async () => {
                      console.log('Training Required button clicked');
                      try {
                        if (updateAlertStatus && showInvestigationModal) {
                          console.log('Calling updateAlertStatus with INVESTIGATING status');
                          await updateAlertStatus(showInvestigationModal, 'INVESTIGATING');
                          setShowInvestigationModal(null)
                          refreshData()
                          window.alert('Alert marked as TRAINING REQUIRED.')
                        } else {
                          window.alert('Error: Missing required functions. Please refresh the page.');
                        }
                      } catch (error) {
                        console.error('Error updating status:', error)
                        window.alert(`Error updating status: ${error instanceof Error ? error.message : String(error)}`);
                      }
                    }}
                    className="p-3 border-2 border-yellow-200 dark:border-yellow-800 rounded-lg hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                  >
                    <div className="text-yellow-600 font-medium">⚠ Training Required</div>
                    <div className="text-xs text-yellow-500">Process violation</div>
                  </button>
                  <button 
                    onClick={async () => {
                      console.log('Fraud Confirmed button clicked');
                      try {
                        if (updateAlertStatus && showInvestigationModal) {
                          console.log('Calling updateAlertStatus with INVESTIGATING status (fraud confirmed)');
                          await updateAlertStatus(showInvestigationModal, 'INVESTIGATING');
                          setShowInvestigationModal(null)
                          refreshData()
                          window.alert('Alert marked as CONFIRMED FRAUD - disciplinary action required.')
                        } else {
                          window.alert('Error: Missing required functions. Please refresh the page.');
                        }
                      } catch (error) {
                        console.error('Error updating status:', error)
                        window.alert(`Error updating status: ${error instanceof Error ? error.message : String(error)}`);
                      }
                    }}
                    className="p-3 border-2 border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <div className="text-red-600 font-medium">✗ Fraud Confirmed</div>
                    <div className="text-xs text-red-500">Disciplinary action</div>
                  </button>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button 
                onClick={() => setShowInvestigationModal(null)}
                className="btn btn-secondary flex-1"
              >
                Cancel
              </button>
              <button 
                onClick={async () => {
                  try {
                    if (updateAlertStatus && showInvestigationModal) {
                      await updateAlertStatus(showInvestigationModal, 'RESOLVED');
                      setShowInvestigationModal(null)
                      refreshData() // Refresh to show updated status
                      window.alert('Investigation completed! Alert marked as resolved.')
                    } else {
                      setShowInvestigationModal(null)
                      window.alert('Investigation saved successfully!')
                    }
                  } catch (error) {
                    console.error('Error updating alert status:', error)
                    setShowInvestigationModal(null)
                    window.alert('Investigation saved (status update failed)')
                  }
                }}
                className="btn btn-primary flex-1"
              >
                Complete Investigation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Filter Fraud Alerts
            </h3>
            
            <div className="space-y-3">
              {[
                { key: 'all', label: 'All Alerts', count: fraudAlerts.length },
                { key: 'pending', label: 'Pending Investigation', count: fraudAlerts.filter(a => a.status === 'PENDING').length },
                { key: 'investigating', label: 'Under Investigation', count: fraudAlerts.filter(a => a.status === 'INVESTIGATING').length },
                { key: 'resolved', label: 'Resolved', count: fraudAlerts.filter(a => a.status === 'RESOLVED').length }
              ].map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => handleFilterAlerts(filter.key as any)}
                  className={`w-full p-3 text-left rounded-lg border-2 transition-colors ${
                    alertsFilter === filter.key
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {filter.label}
                    </span>
                    <span className="text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                      {filter.count}
                    </span>
                  </div>
                </button>
              ))}
            </div>
            
            <div className="flex gap-3 mt-6">
              <button 
                onClick={() => setShowFilterModal(false)}
                className="btn btn-secondary flex-1"
              >
                Cancel
              </button>
              <button 
                onClick={() => setShowFilterModal(false)}
                className="btn btn-primary flex-1"
              >
                Apply Filter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Purchase Order Modal */}
      {showPOModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Create Purchase Order: {showPOModal}
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Quantity
                  </label>
                  <input type="number" defaultValue="100" className="input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Unit Price
                  </label>
                  <input type="number" step="0.01" defaultValue="25.50" className="input" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Supplier
                </label>
                <select className="input">
                  <option>Al-Watania Poultry</option>
                  <option>National Beef</option>
                  <option>Green Valley Farms</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Delivery Date
                </label>
                <input type="date" className="input" />
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <strong>Total Cost:</strong> $2,550.00 • <strong>Delivery:</strong> 2-3 business days
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button 
                onClick={() => setShowPOModal(null)}
                className="btn btn-secondary flex-1"
              >
                Cancel
              </button>
              <button 
                onClick={() => setShowPOModal(null)}
                className="btn btn-primary flex-1"
              >
                Create Purchase Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default InventoryGuru 