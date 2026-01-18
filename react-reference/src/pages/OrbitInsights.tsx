import { 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  ExternalLink,
  Activity,
  Brain,
  Zap
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, BarChart, Bar } from 'recharts'

interface KPICardProps {
  title: string
  value: string
  change: string
  trend: 'up' | 'down'
  icon: any
}

function KPICard({ title, value, change, trend, icon: Icon }: KPICardProps) {
  return (
    <div className="card card-hover">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
          <div className={`flex items-center mt-2 text-sm ${
            trend === 'up' ? 'text-success-600' : 'text-error-600'
          }`}>
            {trend === 'up' ? (
              <ArrowUpRight className="w-4 h-4 mr-1" />
            ) : (
              <ArrowDownRight className="w-4 h-4 mr-1" />
            )}
            {change}
          </div>
        </div>
        <div className={`p-3 rounded-lg ${
          trend === 'up' ? 'bg-success-50 dark:bg-success-900/20' : 'bg-error-50 dark:bg-error-900/20'
        }`}>
          <Icon className={`w-6 h-6 ${
            trend === 'up' ? 'text-success-600 dark:text-success-400' : 'text-error-600 dark:text-error-400'
          }`} />
        </div>
      </div>
    </div>
  )
}

interface Alert {
  id: string
  title: string
  description: string
  severity: 'high' | 'medium' | 'low'
  timestamp: Date
  status: 'active' | 'resolved'
}

interface ModelStatus {
  id: string
  name: string
  enabled: boolean
  accuracy: string
  lastUpdated: string
}

const alerts: Alert[] = [
  {
    id: '1',
    title: 'Low Stock Warning',
    description: 'Chicken breast inventory below safety stock in Branch 2',
    severity: 'high',
    timestamp: new Date('2024-01-15T10:30:00'),
    status: 'active'
  },
  {
    id: '2',
    title: 'Sales Spike Detected',
    description: 'Unusual increase in burger sales - consider increasing prep',
    severity: 'medium',
    timestamp: new Date('2024-01-15T09:15:00'),
    status: 'resolved'
  },
  {
    id: '3',
    title: 'Waste Alert',
    description: 'Lettuce waste above normal threshold yesterday',
    severity: 'medium',
    timestamp: new Date('2024-01-14T16:45:00'),
    status: 'resolved'
  }
]

const modelStatuses: ModelStatus[] = [
  {
    id: 'predictive-pantry',
            name: 'InventoryGuru',
    enabled: true,
    accuracy: '94.2%',
    lastUpdated: '2 hours ago'
  },
  {
    id: 'demand-forecasting',
    name: 'Demand Forecasting',
    enabled: true,
    accuracy: '89.7%',
    lastUpdated: '1 hour ago'
  },
  {
    id: 'waste-optimization',
    name: 'Waste Optimization',
    enabled: true,
    accuracy: '91.3%',
    lastUpdated: '30 minutes ago'
  },
  {
    id: 'menu-optimizer',
    name: 'Menu Optimizer',
    enabled: false,
    accuracy: '—',
    lastUpdated: 'Coming soon'
  }
]

const salesData = [
  { name: 'Mon', forecast: 4000, actual: 4200 },
  { name: 'Tue', forecast: 3000, actual: 3100 },
  { name: 'Wed', forecast: 2000, actual: 1800 },
  { name: 'Thu', forecast: 2780, actual: 2900 },
  { name: 'Fri', forecast: 1890, actual: 2100 },
  { name: 'Sat', forecast: 2390, actual: 2300 },
  { name: 'Sun', forecast: 3490, actual: 3600 },
]

const wasteData = [
  { name: 'Morning', value: 15, color: '#22c55e' },
  { name: 'Afternoon', value: 25, color: '#f59e0b' },
  { name: 'Evening', value: 35, color: '#ef4444' },
  { name: 'Night', value: 25, color: '#8b5cf6' },
]

const inventoryData = [
  { name: 'Chicken', current: 45, safety: 30, optimal: 60 },
  { name: 'Beef', current: 32, safety: 25, optimal: 50 },
  { name: 'Lettuce', current: 18, safety: 20, optimal: 40 },
  { name: 'Tomatoes', current: 28, safety: 15, optimal: 35 },
  { name: 'Cheese', current: 55, safety: 40, optimal: 70 },
]

function ChartCard({ title, children, modelId }: { title: string, children: React.ReactNode, modelId: string }) {
  const handleGoToModel = () => {
    if (modelId === 'predictive-pantry') {
      // Navigate to InventoryGuru instead of the removed PredictivePantry page
      window.alert('Redirecting to InventoryGuru - the comprehensive inventory management solution!')
    } else {
      alert(`${title} model page coming soon!`)
    }
  }

  return (
    <div className="card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>
        <button 
          onClick={handleGoToModel}
          className="btn btn-primary btn-sm"
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Go to Model Page
        </button>
      </div>
      {children}
    </div>
  )
}

function OrbitInsights() {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'border-l-error-500 bg-error-50 dark:bg-error-900/20'
      case 'medium': return 'border-l-warning-500 bg-warning-50 dark:bg-warning-900/20'
      case 'low': return 'border-l-success-500 bg-success-50 dark:bg-success-900/20'
      default: return 'border-l-gray-500 bg-gray-50 dark:bg-gray-900/20'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return AlertTriangle
      case 'medium': return Clock
      case 'low': return CheckCircle
      default: return Clock
    }
  }

  const handleViewAllAlerts = () => {
    alert('Navigate to full alerts dashboard')
  }

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KPICard
          title="Stockouts Prevented"
          value="12"
          change="+8% this week"
          trend="up"
          icon={CheckCircle}
        />
        <KPICard
          title="Avg Sell-Through"
          value="87%"
          change="+3% vs last week"
          trend="up"
          icon={TrendingUp}
        />
        <KPICard
          title="AI Recommendations Applied"
          value="24"
          change="+12 this week"
          trend="up"
          icon={TrendingUp}
        />
      </div>

      {/* Charts Container */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h2>
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <Activity className="w-4 h-4 mr-2" />
            Real-time insights powered by AI models
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Forecast vs Actual Chart */}
          <ChartCard title="Sales Forecasting" modelId="demand-forecasting">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="name" className="text-sm" />
                <YAxis className="text-sm" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgb(17 24 39)',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="forecast" 
                  stroke="#5D34FF" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Forecast"
                />
                <Line 
                  type="monotone" 
                  dataKey="actual" 
                  stroke="#22c55e" 
                  strokeWidth={2}
                  name="Actual"
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Waste by Daypart */}
          <ChartCard title="Waste Optimization" modelId="waste-optimization">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={wasteData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {wasteData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Inventory Levels */}
                        <ChartCard title="InventoryGuru" modelId="predictive-pantry">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={inventoryData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="name" className="text-sm" />
                <YAxis className="text-sm" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgb(17 24 39)',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white'
                  }}
                />
                <Bar dataKey="current" fill="#5D34FF" name="Current Stock" />
                <Bar dataKey="safety" fill="#ef4444" name="Safety Level" />
                <Bar dataKey="optimal" fill="#22c55e" name="Optimal Level" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Menu Performance */}
          <ChartCard title="Menu Optimizer" modelId="menu-optimizer">
            <div className="flex items-center justify-center h-[300px] bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-center">
                <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Menu Optimizer Coming Soon
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Advanced menu performance analytics and optimization recommendations
                </p>
              </div>
            </div>
          </ChartCard>
        </div>
      </div>

      {/* Model Status Indicators */}
      <div className="card">
        <div className="flex items-center mb-6">
          <Zap className="w-5 h-5 text-primary-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            AI Model Status
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {modelStatuses.map((model) => (
            <div key={model.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="font-medium text-gray-900 dark:text-white text-sm">
                  {model.name}
                </div>
                <div className={`w-3 h-3 rounded-full ${
                  model.enabled ? 'bg-success-500' : 'bg-gray-400'
                }`} />
              </div>
              
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Status:</span>
                  <span className={`font-medium ${
                    model.enabled ? 'text-success-600' : 'text-gray-500'
                  }`}>
                    {model.enabled ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Accuracy:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {model.accuracy}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Updated:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {model.lastUpdated}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Insights Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alert Timeline */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Alerts
            </h3>
            <button 
              onClick={handleViewAllAlerts}
              className="btn btn-ghost btn-sm"
            >
              View All
            </button>
          </div>

          <div className="space-y-4">
            {alerts.map((alert) => {
              const Icon = getSeverityIcon(alert.severity)
              return (
                <div key={alert.id} className={`border-l-4 p-4 rounded-r-lg ${getSeverityColor(alert.severity)}`}>
                  <div className="flex items-start">
                    <Icon className="w-5 h-5 mr-3 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                          {alert.title}
                        </h4>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          alert.status === 'active' 
                            ? 'bg-error-100 text-error-800 dark:bg-error-900 dark:text-error-200'
                            : 'bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-200'
                        }`}>
                          {alert.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {alert.description}
                      </p>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-xs text-gray-500">
                          {alert.timestamp.toLocaleString()}
                        </span>
                        {alert.status === 'active' && (
                          <button className="btn btn-ghost btn-sm" onClick={() => window.alert('Action functionality coming soon!')}>
                            Take Action
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Performance Summary
          </h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Total Waste Today</span>
              <span className="font-semibold text-gray-900 dark:text-white">$127</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Active Alerts</span>
              <span className="font-semibold text-gray-900 dark:text-white">3</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Forecast Accuracy</span>
              <span className="font-semibold text-gray-900 dark:text-white">94.2%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Cost Savings (MTD)</span>
              <span className="font-semibold text-success-600">$2,340</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Models Active</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {modelStatuses.filter(m => m.enabled).length} of {modelStatuses.length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Data Freshness</span>
              <span className="font-semibold text-success-600">Real-time</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrbitInsights 