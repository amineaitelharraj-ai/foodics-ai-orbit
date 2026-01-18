import { useState, useRef, useEffect, useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import { 
  Send, 
  Mic, 
  Paperclip, 
  MoreHorizontal, 
  Zap, 
  X,
  TrendingUp,
  Package,
  DollarSign,
  Users,
  CheckCircle,
  Smile,
  Camera,
  Image,
  Sparkles,
  Wifi,
  WifiOff,
  Menu
} from 'lucide-react'
import { Dialog } from '@headlessui/react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'
import { useLabeeb } from '../hooks/useLabeeb'
import { useAuth } from '../contexts/AuthContext'
import { ApprovalModal } from '../components/ApprovalModal'
import { ChatSidebar } from '../components/ChatSidebar'
import { CopyButton } from '../components/ui/CopyButton'
import { CodeBlock } from '../components/ui/CodeBlock'
import { MessageFeedback } from '../components/ui/MessageFeedback'
import { RegenerateButton } from '../components/ui/RegenerateButton'
import { StructuredResponse } from '../components/StructuredResponse'
import { QueryClarificationModal } from '../components/QueryClarificationModal'
import { isStructuredResponse } from '../utils/message-utils'
import { HITLCard } from '../components/hitl'
import { HITLPreview, HITLStatus } from '../types/hitl-previews'
import { generateProductImage } from '../services/image-generation'

interface LocalMessage {
  id: string
  type: 'user' | 'assistant' | 'ui' | 'hitl'
  content?: string
  timestamp: Date
  uiType?: string
  uiData?: any
  hitlData?: {
    preview: unknown
    session_id: string
    tool_name: string
    status: HITLStatus
    generatedImageUrl?: string
  }
}

interface SmartAction {
  id: string
  title: string
  description: string
  icon: any
  action: () => void
}

const waitingMessages = {
  general: [
    "Brewing your Qahwa with extra cardamom...",
    "Slow-cooking your Kabsa to perfection...",
    "Rolling the Sambusas with care...",
    "Layering the Kunafa just right...",
    "Preparing your Mandi underground style...",
    "Selecting the finest Medjool dates...",
    "Spinning the Shawarma spit...",
    "Perfecting the tahini drizzle...",
    "Letting the saffron infuse...",
    "Garnishing with fresh parsley and sumac...",
    "Fluffing the rice grain by grain...",
    "Adding a pinch of bezar spice...",
    "💡 Did you know? Save up to 5% with Foodics Pay Capital!",
    "💡 Tip: Foodics Marketplace has 100+ integrations ready for you!",
    "💡 Pro tip: Automate your inventory with Foodics smart reordering!",
    "💡 Fun fact: Foodics powers 40,000+ restaurants across MENA!",
    "💡 Did you know? Foodics Kitchen Display speeds up orders by 30%!",
    "💡 Tip: Use Foodics Loyalty to boost repeat customers by 25%!",
    "💡 Pro tip: Foodics Analytics can predict your busiest hours!",
    "💡 Did you know? Foodics supports 15+ payment methods!"
  ]
}

const suggestionQuestions = [
  { label: "List my products", query: "List my products" },
  { label: "Show categories", query: "Show me all my categories" },
  { label: "View branches", query: "What branches do I have?" },
  { label: "Top customers", query: "Who are my top 5 customers by spending?" },
  { label: "Sales this week", query: "Show me my sales trend for the last 7 days" },
  { label: "Recent orders", query: "Show me my recent orders" }
]

const getRandomWaitingMessage = () => {
  const messages = waitingMessages.general
  return messages[Math.floor(Math.random() * messages.length)]
}

function OrbitAssistant() {
  const [inputMessage, setInputMessage] = useState('')
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const { tokens, signOut } = useAuth()
  
  const accessToken = tokens?.accessToken || ''
  const idToken = tokens?.idToken || ''
  
  const isLoadingSessionRef = useRef(false)
  const lastLoadedSessionRef = useRef<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const handleTokenExpired = useCallback(() => {
    signOut()
    navigate('/login', { replace: true })
  }, [signOut, navigate])
  
  const {
    messages: labeebMessages,
    isLoading: labeebLoading,
    isConnected,
    streamingContent,
    pendingApproval,
    sendMessage: sendToLabeeb,
    handleApproval,
    error: labeebError,
    clearError,
    sessions,
    currentSessionId,
    startNewSession: originalStartNewSession,
    loadSession: originalLoadSession,
    deleteSession,
    toolStatus,
    complexQueryNotice,
    clearComplexQueryNotice,
    largeDataNotice,
    queryClarification,
    handleClarificationProceed,
    handleClarificationRefine,
    handleClarificationCancel,
    updateHitlImageUrl
  } = useLabeeb({ token: accessToken, idToken, onTokenExpired: handleTokenExpired })

  useEffect(() => {
    if (currentSessionId) {
      setSearchParams({ session_id: currentSessionId }, { replace: true })
    } else {
      setSearchParams({}, { replace: true })
    }
  }, [currentSessionId, setSearchParams])

  useEffect(() => {
    const urlSessionId = searchParams.get('session_id')
    if (
      urlSessionId && 
      urlSessionId !== currentSessionId && 
      urlSessionId !== lastLoadedSessionRef.current &&
      sessions.length > 0 &&
      !isLoadingSessionRef.current
    ) {
      const sessionExists = sessions.find(s => s.id === urlSessionId)
      if (sessionExists) {
        isLoadingSessionRef.current = true
        lastLoadedSessionRef.current = urlSessionId
        originalLoadSession(urlSessionId)
        setTimeout(() => { isLoadingSessionRef.current = false }, 100)
      }
    }
  }, [searchParams, sessions, currentSessionId, originalLoadSession])

  const startNewSession = () => {
    lastLoadedSessionRef.current = null
    originalStartNewSession()
    setSearchParams({}, { replace: true })
  }

  const loadSession = (sessionId: string) => {
    if (isLoadingSessionRef.current || sessionId === lastLoadedSessionRef.current) return
    isLoadingSessionRef.current = true
    lastLoadedSessionRef.current = sessionId
    originalLoadSession(sessionId)
    setSearchParams({ session_id: sessionId }, { replace: true })
    setTimeout(() => { isLoadingSessionRef.current = false }, 100)
  }

  const approveAction = () => handleApproval('approve')
  const rejectAction = (reason?: string) => handleApproval('reject', reason)

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [localMessages, setLocalMessages] = useState<LocalMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Hello! I\'m your AI assistant for Foodics Orbit. I can help you with sales analysis, inventory management, staff scheduling, and much more. What would you like to explore today?',
      timestamp: new Date()
    }
  ])
  const [isContextOpen, setIsContextOpen] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [activeActionModal, setActiveActionModal] = useState<string | null>(null)
  const [waitingMessage, setWaitingMessage] = useState(getRandomWaitingMessage())
  const [foodEmoji, setFoodEmoji] = useState('🍽️')
  
  const foodEmojis = ['🍽️', '🥘', '☕', '🧆', '🍚', '🥙', '🍲', '🫖', '🥗', '🧇']
  
  const allMessages: LocalMessage[] = [
    ...(labeebMessages.length === 0 ? localMessages : []),
    ...labeebMessages.map(m => {
      if (m.role === 'hitl' && m.hitlData) {
        return {
          id: m.id,
          type: 'hitl' as const,
          content: m.content,
          timestamp: m.timestamp,
          hitlData: m.hitlData
        }
      }
      return {
        id: m.id,
        type: m.role === 'user' ? 'user' as const : 'assistant' as const,
        content: m.content,
        timestamp: m.timestamp
      }
    })
  ].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
  
  const isLoading = labeebLoading
  const showSuggestions = labeebMessages.length === 0

  useEffect(() => {
    if (isLoading && !streamingContent && !toolStatus) {
      setWaitingMessage(getRandomWaitingMessage())
      setFoodEmoji(foodEmojis[Math.floor(Math.random() * foodEmojis.length)])
      const interval = setInterval(() => {
        setWaitingMessage(getRandomWaitingMessage())
        setFoodEmoji(foodEmojis[Math.floor(Math.random() * foodEmojis.length)])
      }, 2500)
      return () => clearInterval(interval)
    }
  }, [isLoading, streamingContent, toolStatus])

  const initialLowStock = [
    { id: 1, name: 'Chicken Breast', current: 15, safety: 30, vendor: 'Premium Poultry Co.' },
    { id: 2, name: 'Fresh Lettuce', current: 8, safety: 20, vendor: 'Green Fields Farms' },
    { id: 3, name: 'Ground Beef', current: 12, safety: 25, vendor: 'Quality Meats Ltd.' },
  ]
  const [lowStock, setLowStock] = useState(initialLowStock)
  const [addStockId, setAddStockId] = useState<number | null>(null)
  const [addQty, setAddQty] = useState('')

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }, [inputMessage])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [allMessages, streamingContent, isLoading, toolStatus])

  const addLocalMessage = (content: string, type: 'user' | 'assistant') => {
    const newMessage: LocalMessage = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date()
    }
    setLocalMessages(prev => [...prev, newMessage])
  }

  const smartActions: SmartAction[] = [
    {
      id: 'sales-analysis',
      title: 'Analyze Sales',
      description: 'Get detailed sales performance insights',
      icon: TrendingUp,
      action: () => {
        addLocalMessage('Analyze my sales performance for this week', 'user')
        setTimeout(() => {
          setLocalMessages(prev => [
            ...prev,
            {
              id: Date.now().toString() + '-ui',
              type: 'ui',
              timestamp: new Date(),
              uiType: 'sales-analysis',
              uiData: null
            }
          ])
        }, 500)
      }
    },
    {
      id: 'inventory-alerts',
      title: 'Inventory Alerts',
      description: 'Check stock levels and reorder suggestions',
      icon: Package,
      action: () => {
        addLocalMessage('Check my current inventory alerts', 'user')
        setTimeout(() => {
          setLocalMessages(prev => [
            ...prev,
            {
              id: Date.now().toString() + '-ui',
              type: 'ui',
              timestamp: new Date(),
              uiType: 'inventory-alerts',
              uiData: null
            }
          ])
        }, 500)
      }
    },
    {
      id: 'create-purchase-order',
      title: 'Create Purchase Order',
      description: 'Guided workflow to create a new PO',
      icon: Package,
      action: () => {
        addLocalMessage('I want to create a new purchase order', 'user')
        setTimeout(() => {
          setLocalMessages(prev => [
            ...prev,
            {
              id: Date.now().toString() + '-ui',
              type: 'ui',
              timestamp: new Date(),
              uiType: 'guided-po-creation',
              uiData: { step: 1 }
            }
          ])
        }, 500)
      }
    },
    {
      id: 'add-menu-item',
      title: 'Add Menu Item',
      description: 'Guided workflow to add a new menu item',
      icon: Users,
      action: () => {
        addLocalMessage('I want to add a new menu item', 'user')
        setTimeout(() => {
          setLocalMessages(prev => [
            ...prev,
            {
              id: Date.now().toString() + '-ui',
              type: 'ui',
              timestamp: new Date(),
              uiType: 'guided-menu-item',
              uiData: { step: 1 }
            }
          ])
        }, 500)
      }
    },
    {
      id: 'optimize-staffing',
      title: 'Optimize Staffing',
      description: 'Get AI-powered staff scheduling recommendations',
      icon: Users,
      action: () => {
        addLocalMessage('Optimize my staff schedule for this week', 'user')
        setTimeout(() => {
          setLocalMessages(prev => [
            ...prev,
            {
              id: Date.now().toString() + '-ui',
              type: 'ui',
              timestamp: new Date(),
              uiType: 'optimize-staffing',
              uiData: null
            }
          ])
        }, 500)
      }
    },
    {
      id: 'customer-insights',
      title: 'Customer Insights',
      description: 'Analyze customer feedback and sentiment',
      icon: Smile,
      action: () => {
        addLocalMessage('Show me customer insights and sentiment', 'user')
        setTimeout(() => {
          setLocalMessages(prev => [
            ...prev,
            {
              id: Date.now().toString() + '-ui',
              type: 'ui',
              timestamp: new Date(),
              uiType: 'customer-insights',
              uiData: null
            }
          ])
        }, 500)
      }
    },
    {
      id: 'my-tasks',
      title: 'My Tasks',
      description: 'View and manage your current tasks',
      icon: CheckCircle,
      action: () => {
        addLocalMessage('Show my current tasks', 'user')
        setTimeout(() => {
          setLocalMessages(prev => [
            ...prev,
            {
              id: Date.now().toString() + '-ui',
              type: 'ui',
              timestamp: new Date(),
              uiType: 'my-tasks',
              uiData: null
            }
          ])
        }, 500)
      }
    },
    {
      id: 'financial-summary',
      title: 'Financial Summary',
      description: 'See revenue, cost, and profit breakdowns',
      icon: DollarSign,
      action: () => {
        addLocalMessage('Show me a financial summary', 'user')
        setTimeout(() => {
          setLocalMessages(prev => [
            ...prev,
            {
              id: Date.now().toString() + '-ui',
              type: 'ui',
              timestamp: new Date(),
              uiType: 'financial-summary',
              uiData: null
            }
          ])
        }, 500)
      }
    },
    {
      id: 'generate-food-photos',
      title: 'Generate Food Photos',
      description: 'AI-powered food photography for menu items',
      icon: Camera,
      action: () => {
        addLocalMessage('I want to generate professional food photos for my menu items', 'user')
        setTimeout(() => {
          setLocalMessages(prev => [
            ...prev,
            {
              id: Date.now().toString() + '-ui',
              type: 'ui',
              timestamp: new Date(),
              uiType: 'platstudio-generator',
              uiData: null
            }
          ])
        }, 500)
      }
    },
    {
      id: 'menu-photo-audit',
      title: 'Menu Photo Audit',
      description: 'Check which items need photos and estimated uplift',
      icon: Image,
      action: () => {
        addLocalMessage('Audit my menu for missing photos and show potential sales uplift', 'user')
        setTimeout(() => {
          setLocalMessages(prev => [
            ...prev,
            {
              id: Date.now().toString() + '-ui',
              type: 'ui',
              timestamp: new Date(),
              uiType: 'menu-photo-audit',
              uiData: null
            }
          ])
        }, 500)
      }
    },
  ]

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage = inputMessage
    setInputMessage('')
    
    sendToLabeeb(userMessage)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const salesData = [
    { date: 'Mon', revenue: 2200, orders: 42 },
    { date: 'Tue', revenue: 2600, orders: 51 },
    { date: 'Wed', revenue: 2100, orders: 39 },
    { date: 'Thu', revenue: 3200, orders: 62 },
    { date: 'Fri', revenue: 4100, orders: 77 },
    { date: 'Sat', revenue: 3700, orders: 68 },
    { date: 'Sun', revenue: 1550, orders: 28 },
  ]
  const kpis = [
    { label: 'Total Revenue', value: '$18,450', change: '+12%' },
    { label: 'Orders', value: '342', change: '+8%' },
    { label: 'Avg Order Value', value: '$53.95', change: '+3%' },
  ]
  const topProducts = [
    { name: 'Grilled Chicken Combo', revenue: 2340, orders: 127 },
    { name: 'Beef Burger Deluxe', revenue: 1890, orders: 95 },
    { name: 'Caesar Salad', revenue: 1250, orders: 83 },
  ]

  // Demo data for new actions
  const staffDemand = [
    { day: 'Mon', demand: 6 },
    { day: 'Tue', demand: 7 },
    { day: 'Wed', demand: 5 },
    { day: 'Thu', demand: 8 },
    { day: 'Fri', demand: 10 },
    { day: 'Sat', demand: 12 },
    { day: 'Sun', demand: 7 },
  ]
  const staffSchedule = [
    { name: 'Ali', role: 'Chef', shifts: 5 },
    { name: 'Sara', role: 'Waiter', shifts: 6 },
    { name: 'Omar', role: 'Cashier', shifts: 4 },
    { name: 'Lina', role: 'Waiter', shifts: 5 },
  ]
  const sentimentData = [
    { name: 'Positive', value: 68, color: '#22c55e' },
    { name: 'Neutral', value: 22, color: '#fbbf24' },
    { name: 'Negative', value: 10, color: '#ef4444' },
  ]
  const reviews = [
    { name: 'Mohammed', rating: 5, comment: 'Great food and fast service!' },
    { name: 'Fatima', rating: 4, comment: 'Loved the burger, will come again.' },
    { name: 'Khalid', rating: 2, comment: 'Waited too long for my order.' },
    { name: 'Aisha', rating: 3, comment: 'Food was okay, but staff were friendly.' },
  ]
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Review inventory count for Branch 1', done: false },
    { id: 2, text: 'Approve purchase order #PO-0032', done: false },
    { id: 3, text: 'Check staff schedule for next week', done: false },
    { id: 4, text: 'Analyze sales trends', done: false },
  ])
  const financialData = [
    { month: 'Jan', revenue: 12000, cost: 8000, profit: 4000 },
    { month: 'Feb', revenue: 13500, cost: 9000, profit: 4500 },
    { month: 'Mar', revenue: 14200, cost: 9500, profit: 4700 },
    { month: 'Apr', revenue: 15500, cost: 10200, profit: 5300 },
    { month: 'May', revenue: 16200, cost: 11000, profit: 5200 },
  ]
  const financialKPIs = [
    { label: 'Total Revenue', value: '$71,400', change: '+9%' },
    { label: 'Total Cost', value: '$47,700', change: '+7%' },
    { label: 'Total Profit', value: '$23,700', change: '+13%' },
  ]

  const renderActionModal = () => {
    switch (activeActionModal) {
      case 'sales-analysis':
        return (
          <Dialog open={true} onClose={() => setActiveActionModal(null)} className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/40" />
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full p-8 z-10">
              <Dialog.Title className="text-xl font-bold mb-4">Sales Analysis</Dialog.Title>
              {/* KPIs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                {kpis.map((kpi) => (
                  <div key={kpi.label} className="bg-primary-50 dark:bg-primary-900/20 rounded-xl p-4 text-center">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{kpi.label}</div>
                    <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">{kpi.value}</div>
                    <div className="text-xs text-success-600 mt-1">{kpi.change}</div>
                  </div>
                ))}
              </div>
              {/* Sales Chart */}
              <div className="mb-8">
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={salesData} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip />
                    <Line type="monotone" dataKey="revenue" stroke="#5D34FF" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              {/* Top Products Table */}
              <div className="mb-6">
                <div className="font-semibold mb-2">Top Products</div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-1">Product</th>
                      <th className="text-right py-1">Revenue</th>
                      <th className="text-right py-1">Orders</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topProducts.map((p) => (
                      <tr key={p.name} className="border-b last:border-0">
                        <td className="py-1">{p.name}</td>
                        <td className="py-1 text-right">${p.revenue.toLocaleString()}</td>
                        <td className="py-1 text-right">{p.orders}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button className="btn btn-primary mt-4" onClick={() => setActiveActionModal(null)}>Close</button>
            </div>
          </Dialog>
        )
      case 'inventory-alerts':
        return (
          <Dialog open={true} onClose={() => setActiveActionModal(null)} className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/40" />
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full p-8 z-10">
              <Dialog.Title className="text-xl font-bold mb-4">Inventory Alerts</Dialog.Title>
              <div className="mb-6">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Item</th>
                      <th className="text-right py-2">Current</th>
                      <th className="text-right py-2">Safety</th>
                      <th className="text-left py-2">Vendor</th>
                      <th className="text-center py-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lowStock.map((item) => (
                      <tr key={item.id} className="border-b last:border-0">
                        <td className="py-2">{item.name}</td>
                        <td className="py-2 text-right font-semibold text-error-600">{item.current}</td>
                        <td className="py-2 text-right">{item.safety}</td>
                        <td className="py-2">{item.vendor}</td>
                        <td className="py-2 text-center">
                          {addStockId === item.id ? (
                            <form className="flex items-center gap-2 justify-center" onSubmit={e => {
                              e.preventDefault()
                              const qty = parseInt(addQty)
                              if (!isNaN(qty) && qty > 0) {
                                setLowStock(prev => prev.map(i => i.id === item.id ? { ...i, current: i.current + qty } : i))
                                setAddStockId(null)
                                setAddQty('')
                              }
                            }}>
                              <input
                                type="number"
                                min="1"
                                value={addQty}
                                onChange={e => setAddQty(e.target.value)}
                                className="w-16 px-2 py-1 border rounded"
                                placeholder="Qty"
                                autoFocus
                              />
                              <button type="submit" className="btn btn-primary btn-sm">Add</button>
                              <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setAddStockId(null); setAddQty('') }}>Cancel</button>
                            </form>
                          ) : (
                            <button className="btn btn-secondary btn-sm" onClick={() => setAddStockId(item.id)}>Add Stock</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button className="btn btn-primary mt-4" onClick={() => setActiveActionModal(null)}>Close</button>
            </div>
          </Dialog>
        )
      case 'optimize-staffing':
        return (
          <Dialog open={true} onClose={() => setActiveActionModal(null)} className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/40" />
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full p-8 z-10">
              <Dialog.Title className="text-xl font-bold mb-4">Staff Optimization</Dialog.Title>
              <div className="mb-6">
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={staffDemand} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip />
                    <Bar dataKey="demand" fill="#5D34FF" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mb-6">
                <div className="font-semibold mb-2">Recommended Schedule</div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-1">Name</th>
                      <th className="text-left py-1">Role</th>
                      <th className="text-right py-1">Shifts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staffSchedule.map((s) => (
                      <tr key={s.name} className="border-b last:border-0">
                        <td className="py-1">{s.name}</td>
                        <td className="py-1">{s.role}</td>
                        <td className="py-1 text-right">{s.shifts}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button className="btn btn-primary mt-4" onClick={() => setActiveActionModal(null)}>Close</button>
            </div>
          </Dialog>
        )
      case 'customer-insights':
        return (
          <Dialog open={true} onClose={() => setActiveActionModal(null)} className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/40" />
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full p-8 z-10">
              <Dialog.Title className="text-xl font-bold mb-4">Customer Insights</Dialog.Title>
              <div className="flex flex-col sm:flex-row gap-8 mb-6 items-center">
                <div className="w-full sm:w-1/2">
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie
                        data={sentimentData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={60}
                        label
                      >
                        {sentimentData.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full sm:w-1/2 space-y-2">
                  {sentimentData.map((s) => (
                    <div key={s.name} className="flex items-center gap-2">
                      <span className="inline-block w-3 h-3 rounded-full" style={{ background: s.color }} />
                      <span className="text-sm font-medium">{s.name}</span>
                      <span className="ml-auto text-xs text-gray-500">{s.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mb-6">
                <div className="font-semibold mb-2">Recent Reviews</div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-1">Name</th>
                      <th className="text-left py-1">Rating</th>
                      <th className="text-left py-1">Comment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reviews.map((r) => (
                      <tr key={r.name} className="border-b last:border-0">
                        <td className="py-1">{r.name}</td>
                        <td className="py-1">
                          {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                        </td>
                        <td className="py-1">{r.comment}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button className="btn btn-primary mt-4" onClick={() => setActiveActionModal(null)}>Close</button>
            </div>
          </Dialog>
        )
      case 'my-tasks':
        return (
          <Dialog open={true} onClose={() => setActiveActionModal(null)} className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/40" />
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full p-8 z-10">
              <Dialog.Title className="text-xl font-bold mb-4">My Tasks</Dialog.Title>
              <div className="space-y-6">
                <div className="font-bold text-lg mb-2">My Tasks</div>
                <ul className="space-y-2">
                  {tasks.map((task) => (
                    <li key={task.id} className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={task.done}
                        onChange={() => setTasks(ts => ts.map(t => t.id === task.id ? { ...t, done: !t.done } : t))}
                        className="accent-primary-500 w-5 h-5 rounded"
                      />
                      <span className={task.done ? 'line-through text-gray-400' : ''}>{task.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <button className="btn btn-primary mt-4" onClick={() => setActiveActionModal(null)}>Close</button>
            </div>
          </Dialog>
        )
      case 'financial-summary':
        return (
          <Dialog open={true} onClose={() => setActiveActionModal(null)} className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/40" />
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full p-8 z-10">
              <Dialog.Title className="text-xl font-bold mb-4">Financial Summary</Dialog.Title>
              <div className="space-y-6">
                <div className="font-bold text-lg mb-2">Financial Summary</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  {financialKPIs.map((kpi) => (
                    <div key={kpi.label} className="bg-primary-50 dark:bg-primary-900/20 rounded-xl p-4 text-center">
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{kpi.label}</div>
                      <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">{kpi.value}</div>
                      <div className="text-xs text-success-600 mt-1">{kpi.change}</div>
                    </div>
                  ))}
                </div>
                <div className="mb-8">
                  <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={financialData} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip />
                      <Line type="monotone" dataKey="revenue" stroke="#5D34FF" strokeWidth={2} dot={{ r: 3 }} name="Revenue" />
                      <Line type="monotone" dataKey="cost" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} name="Cost" />
                      <Line type="monotone" dataKey="profit" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} name="Profit" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <button className="btn btn-primary mt-4" onClick={() => setActiveActionModal(null)}>Close</button>
            </div>
          </Dialog>
        )
      default:
        return null
    }
  }

  const renderMessageContent = (msg: LocalMessage) => {
    if (msg.type === 'ui') {
      if (msg.uiType === 'sales-analysis') {
        return (
          <div className="space-y-6">
            <div className="font-bold text-lg mb-2">Sales Analysis</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {kpis.map((kpi) => (
                <div key={kpi.label} className="bg-primary-50 dark:bg-primary-900/20 rounded-xl p-4 text-center">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{kpi.label}</div>
                  <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">{kpi.value}</div>
                  <div className="text-xs text-success-600 mt-1">{kpi.change}</div>
                </div>
              ))}
            </div>
            <div className="mb-8">
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={salesData} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Line type="monotone" dataKey="revenue" stroke="#5D34FF" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mb-6">
              <div className="font-semibold mb-2">Top Products</div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-1">Product</th>
                    <th className="text-right py-1">Revenue</th>
                    <th className="text-right py-1">Orders</th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.map((p) => (
                    <tr key={p.name} className="border-b last:border-0">
                      <td className="py-1">{p.name}</td>
                      <td className="py-1 text-right">${p.revenue.toLocaleString()}</td>
                      <td className="py-1 text-right">{p.orders}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      }
      if (msg.uiType === 'inventory-alerts') {
        return (
          <div className="space-y-6">
            <div className="font-bold text-lg mb-2">Inventory Alerts</div>
            <table className="w-full text-sm mb-4">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Item</th>
                  <th className="text-right py-2">Current</th>
                  <th className="text-right py-2">Safety</th>
                  <th className="text-left py-2">Vendor</th>
                  <th className="text-center py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {lowStock.map((item) => (
                  <tr key={item.id} className="border-b last:border-0">
                    <td className="py-2">{item.name}</td>
                    <td className="py-2 text-right font-semibold text-error-600">{item.current}</td>
                    <td className="py-2 text-right">{item.safety}</td>
                    <td className="py-2">{item.vendor}</td>
                    <td className="py-2 text-center">
                      {addStockId === item.id ? (
                        <form className="flex items-center gap-2 justify-center" onSubmit={e => {
                          e.preventDefault()
                          const qty = parseInt(addQty)
                          if (!isNaN(qty) && qty > 0) {
                            setLowStock(prev => prev.map(i => i.id === item.id ? { ...i, current: i.current + qty } : i))
                            setAddStockId(null)
                            setAddQty('')
                          }
                        }}>
                          <input
                            type="number"
                            min="1"
                            value={addQty}
                            onChange={e => setAddQty(e.target.value)}
                            className="w-16 px-2 py-1 border rounded"
                            placeholder="Qty"
                            autoFocus
                          />
                          <button type="submit" className="btn btn-primary btn-sm">Add</button>
                          <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setAddStockId(null); setAddQty('') }}>Cancel</button>
                        </form>
                      ) : (
                        <button className="btn btn-secondary btn-sm" onClick={() => setAddStockId(item.id)}>Add Stock</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      }
      if (msg.uiType === 'optimize-staffing') {
        return (
          <div className="space-y-6">
            <div className="font-bold text-lg mb-2">Staffing Optimization</div>
            <div className="mb-6">
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={staffDemand} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Bar dataKey="demand" fill="#5D34FF" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mb-6">
              <div className="font-semibold mb-2">Recommended Schedule</div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-1">Name</th>
                    <th className="text-left py-1">Role</th>
                    <th className="text-right py-1">Shifts</th>
                  </tr>
                </thead>
                <tbody>
                  {staffSchedule.map((s) => (
                    <tr key={s.name} className="border-b last:border-0">
                      <td className="py-1">{s.name}</td>
                      <td className="py-1">{s.role}</td>
                      <td className="py-1 text-right">{s.shifts}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      }
      if (msg.uiType === 'customer-insights') {
        return (
          <div className="space-y-6">
            <div className="font-bold text-lg mb-2">Customer Insights</div>
            <div className="flex flex-col sm:flex-row gap-8 mb-6 items-center">
              <div className="w-full sm:w-1/2">
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie
                      data={sentimentData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={60}
                      label
                    >
                      {sentimentData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-full sm:w-1/2 space-y-2">
                {sentimentData.map((s) => (
                  <div key={s.name} className="flex items-center gap-2">
                    <span className="inline-block w-3 h-3 rounded-full" style={{ background: s.color }} />
                    <span className="text-sm font-medium">{s.name}</span>
                    <span className="ml-auto text-xs text-gray-500">{s.value}%</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="mb-6">
              <div className="font-semibold mb-2">Recent Reviews</div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-1">Name</th>
                    <th className="text-left py-1">Rating</th>
                    <th className="text-left py-1">Comment</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.map((r) => (
                    <tr key={r.name} className="border-b last:border-0">
                      <td className="py-1">{r.name}</td>
                      <td className="py-1">
                        {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                      </td>
                      <td className="py-1">{r.comment}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      }
      if (msg.uiType === 'my-tasks') {
        return (
          <div className="space-y-6">
            <div className="font-bold text-lg mb-2">My Tasks</div>
            <ul className="space-y-2">
              {tasks.map((task) => (
                <li key={task.id} className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={task.done}
                    onChange={() => setTasks(ts => ts.map(t => t.id === task.id ? { ...t, done: !t.done } : t))}
                    className="accent-primary-500 w-5 h-5 rounded"
                  />
                  <span className={task.done ? 'line-through text-gray-400' : ''}>{task.text}</span>
                </li>
              ))}
            </ul>
          </div>
        )
      }
      if (msg.uiType === 'financial-summary') {
        return (
          <div className="space-y-6">
            <div className="font-bold text-lg mb-2">Financial Summary</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {financialKPIs.map((kpi) => (
                <div key={kpi.label} className="bg-primary-50 dark:bg-primary-900/20 rounded-xl p-4 text-center">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{kpi.label}</div>
                  <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">{kpi.value}</div>
                  <div className="text-xs text-success-600 mt-1">{kpi.change}</div>
                </div>
              ))}
            </div>
            <div className="mb-8">
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={financialData} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Line type="monotone" dataKey="revenue" stroke="#5D34FF" strokeWidth={2} dot={{ r: 3 }} name="Revenue" />
                  <Line type="monotone" dataKey="cost" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} name="Cost" />
                  <Line type="monotone" dataKey="profit" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} name="Profit" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )
      }
      if (msg.uiType === 'guided-po-creation') {
        const step = msg.uiData?.step || 1
        
        if (step === 1) {
          return (
            <div className="space-y-6">
              <div className="font-bold text-lg mb-2">🛒 Purchase Order Creation - Step 1/3</div>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <p className="mb-4">Let's create a new purchase order. First, select your supplier:</p>
                <div className="space-y-2">
                  {['Premium Poultry Co.', 'Green Fields Farms', 'Quality Meats Ltd.', 'Fresh Produce Inc.'].map((supplier) => (
                    <button
                      key={supplier}
                      className="w-full text-left p-3 border rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800/20"
                      onClick={() => {
                        setLocalMessages(prev => [
                          ...prev,
                          {
                            id: Date.now().toString(),
                            type: 'assistant',
                            content: `Great! You've selected ${supplier}. Now let's add items to your purchase order.`,
                            timestamp: new Date()
                          },
                          {
                            id: Date.now().toString() + '-ui',
                            type: 'ui',
                            timestamp: new Date(),
                            uiType: 'guided-po-creation',
                            uiData: { step: 2, supplier }
                          }
                        ])
                      }}
                    >
                      <div className="font-medium">{supplier}</div>
                      <div className="text-sm text-gray-500">Click to select</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )
        }
        
        if (step === 2) {
          const supplier = msg.uiData?.supplier || 'Selected Supplier'
          return (
            <div className="space-y-6">
              <div className="font-bold text-lg mb-2">🛒 Purchase Order Creation - Step 2/3</div>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <p className="mb-4">Supplier: <strong>{supplier}</strong></p>
                <p className="mb-4">Select items to add to your purchase order:</p>
                <div className="space-y-3">
                  {[
                    { name: 'Chicken Breast', currentStock: 15, unit: 'kg', price: 12.50 },
                    { name: 'Fresh Lettuce', currentStock: 8, unit: 'kg', price: 3.20 },
                    { name: 'Ground Beef', currentStock: 12, unit: 'kg', price: 18.00 }
                  ].map((item) => (
                    <div key={item.name} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-gray-500">Current: {item.currentStock} {item.unit} | ${item.price}/{item.unit}</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="number" className="w-16 px-2 py-1 border rounded" placeholder="Qty" min="1" />
                        <button className="btn btn-sm btn-primary">Add</button>
                      </div>
                    </div>
                  ))}
                </div>
                <button 
                  className="btn btn-primary mt-4 w-full"
                  onClick={() => {
                    setLocalMessages(prev => [
                      ...prev,
                      {
                        id: Date.now().toString(),
                        type: 'assistant',
                        content: `Perfect! I've added the selected items. Let's review your purchase order before submitting.`,
                        timestamp: new Date()
                      },
                      {
                        id: Date.now().toString() + '-ui',
                        type: 'ui',
                        timestamp: new Date(),
                        uiType: 'guided-po-creation',
                        uiData: { step: 3, supplier }
                      }
                    ])
                  }}
                >
                  Continue to Review
                </button>
              </div>
            </div>
          )
        }
        
        if (step === 3) {
          const supplier = msg.uiData?.supplier || 'Selected Supplier'
          return (
            <div className="space-y-6">
              <div className="font-bold text-lg mb-2">🛒 Purchase Order Creation - Step 3/3</div>
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <h4 className="font-semibold mb-3">Purchase Order Summary</h4>
                <div className="space-y-2 mb-4">
                  <div><strong>Supplier:</strong> {supplier}</div>
                  <div><strong>Items:</strong> 3 selected</div>
                  <div><strong>Total Estimated Cost:</strong> $450.00</div>
                  <div><strong>Delivery Date:</strong> {new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString()}</div>
                </div>
                <div className="flex space-x-3">
                  <button 
                    className="btn btn-primary flex-1"
                    onClick={() => {
                      setLocalMessages(prev => [
                        ...prev,
                        {
                          id: Date.now().toString(),
                          type: 'assistant',
                          content: `🎉 Success! Your purchase order #PO-${Date.now().toString().slice(-6)} has been created and sent to ${supplier}. You'll receive a confirmation email shortly.`,
                          timestamp: new Date()
                        }
                      ])
                    }}
                  >
                    Submit Purchase Order
                  </button>
                  <button className="btn btn-secondary">Save as Draft</button>
                </div>
              </div>
            </div>
          )
        }
      }
      
      if (msg.uiType === 'guided-menu-item') {
        const step = msg.uiData?.step || 1
        
        return (
          <div className="space-y-6">
            <div className="font-bold text-lg mb-2">🍽️ Add Menu Item - Step {step}/2</div>
            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
              {step === 1 ? (
                <div>
                  <p className="mb-4">Let's add a new item to your menu. Please provide the basic information:</p>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Item Name</label>
                      <input type="text" className="w-full border rounded-lg px-3 py-2" placeholder="e.g., Grilled Salmon" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Category</label>
                      <select className="w-full border rounded-lg px-3 py-2">
                        <option>Main Dishes</option>
                        <option>Appetizers</option>
                        <option>Desserts</option>
                        <option>Beverages</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Price ($)</label>
                      <input type="number" className="w-full border rounded-lg px-3 py-2" placeholder="24.99" min="0" step="0.01" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Description</label>
                      <textarea className="w-full border rounded-lg px-3 py-2" rows={3} placeholder="Describe your menu item..."></textarea>
                    </div>
                    <button 
                      className="btn btn-primary w-full"
                      onClick={() => {
                        setLocalMessages(prev => [
                          ...prev,
                          {
                            id: Date.now().toString(),
                            type: 'assistant',
                            content: `Great! Now let's set up the ingredients and nutritional information for your new menu item.`,
                            timestamp: new Date()
                          },
                          {
                            id: Date.now().toString() + '-ui',
                            type: 'ui',
                            timestamp: new Date(),
                            uiType: 'guided-menu-item',
                            uiData: { step: 2 }
                          }
                        ])
                      }}
                    >
                      Continue to Ingredients
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="mb-4">Now let's add the ingredients and set dietary options:</p>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Ingredients</label>
                      <div className="space-y-2">
                        {['Salmon Fillet (200g)', 'Olive Oil (1 tbsp)', 'Lemon (1/2)', 'Herbs & Spices'].map((ingredient, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 border rounded">
                            <span>{ingredient}</span>
                            <button className="text-red-500 hover:text-red-700">Remove</button>
                          </div>
                        ))}
                        <button className="btn btn-sm btn-secondary w-full">+ Add Ingredient</button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Dietary Options</label>
                      <div className="flex flex-wrap gap-2">
                        {['Gluten-Free', 'Dairy-Free', 'Vegetarian', 'Vegan', 'Keto'].map((option) => (
                          <label key={option} className="flex items-center">
                            <input type="checkbox" className="mr-2" />
                            <span className="text-sm">{option}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <button 
                      className="btn btn-primary w-full"
                      onClick={() => {
                        setLocalMessages(prev => [
                          ...prev,
                          {
                            id: Date.now().toString(),
                            type: 'assistant',
                            content: `🎉 Perfect! Your new menu item "Grilled Salmon" has been added to your menu under Main Dishes. It will be available for ordering starting tomorrow.`,
                            timestamp: new Date()
                          }
                        ])
                      }}
                    >
                      Add to Menu
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )
      }

      if (msg.uiType === 'platstudio-generator') {
        const menuItems = [
          { name: 'Chicken Majboos', nameAr: 'مجبوس دجاج', estimatedUplift: 35, hasPhoto: false },
          { name: 'Grilled Lamb Chops', nameAr: 'ريش خروف مشوي', estimatedUplift: 42, hasPhoto: false },
          { name: 'Knafeh', nameAr: 'كنافة', estimatedUplift: 55, hasPhoto: false }
        ]

        return (
          <div className="space-y-6">
            <div className="font-bold text-lg mb-2 flex items-center gap-2">
              <Camera className="w-5 h-5 text-primary-500" />
              PlatStudio AI Food Photography
            </div>
            
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-4 rounded-xl">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                📸 Transform Your Menu with AI Photos
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                High-quality food photos boost online orders by 35-70%. Let's generate professional images for your menu items.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg text-center">
                  <div className="text-lg font-bold text-green-600">+35%</div>
                  <div className="text-xs text-gray-500">Order Increase</div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg text-center">
                  <div className="text-lg font-bold text-blue-600">4-7s</div>
                  <div className="text-xs text-gray-500">Generation Time</div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg text-center">
                  <div className="text-lg font-bold text-purple-600">15</div>
                  <div className="text-xs text-gray-500">Items Missing Photos</div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 dark:text-white">
                Items Ready for AI Photography:
              </h4>
              {menuItems.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">{item.name}</div>
                    <div className="text-sm text-gray-500">{item.nameAr} • Est. +{item.estimatedUplift}% orders</div>
                  </div>
                  <div className="flex gap-2">
                    <button className="btn btn-sm btn-primary">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Generate
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <button className="btn btn-primary flex-1">
                <Camera className="w-4 h-4 mr-2" />
                Open PlatStudio
              </button>
              <button className="btn btn-secondary">
                Batch Generate All
              </button>
            </div>
          </div>
        )
      }

      if (msg.uiType === 'menu-photo-audit') {
        const auditData = {
          totalItems: 42,
          withPhotos: 27,
          missingPhotos: 15,
          coverage: 64,
          estimatedMonthlyUplift: 2850,
          topOpportunities: [
            { name: 'Knafeh', uplift: 55, orders: 45 },
            { name: 'Grilled Lamb Chops', uplift: 42, orders: 38 },
            { name: 'Chicken Majboos', uplift: 35, orders: 52 }
          ]
        }

        return (
          <div className="space-y-6">
            <div className="font-bold text-lg mb-2 flex items-center gap-2">
              <Image className="w-5 h-5 text-primary-500" />
              Menu Photo Audit Report
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">{auditData.coverage}%</div>
                <div className="text-sm text-blue-500">Photo Coverage</div>
                <div className="text-xs text-gray-500 mt-1">{auditData.withPhotos}/{auditData.totalItems} items</div>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">${auditData.estimatedMonthlyUplift.toLocaleString()}</div>
                <div className="text-sm text-green-500">Est. Monthly Uplift</div>
                <div className="text-xs text-gray-500 mt-1">from missing photos</div>
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
              <h4 className="font-semibold text-amber-800 dark:text-amber-300 mb-2">
                ⚠️ Priority Alert: {auditData.missingPhotos} Items Need Photos
              </h4>
              <p className="text-sm text-amber-700 dark:text-amber-400">
                You're missing photos for {Math.round((auditData.missingPhotos/auditData.totalItems)*100)}% of your menu. 
                Industry data shows this could be costing you significant revenue.
              </p>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                🎯 Top Revenue Opportunities:
              </h4>
              <div className="space-y-2">
                {auditData.topOpportunities.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{item.name}</div>
                      <div className="text-sm text-gray-500">{item.orders} monthly orders</div>
                    </div>
                    <div className="text-right">
                      <div className="text-green-600 font-bold">+{item.uplift}%</div>
                      <div className="text-xs text-gray-500">potential uplift</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
                💡 Quick Win Recommendation
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-400 mb-3">
                Start with your top 5 items to see immediate impact. PlatStudio can generate all photos in under 10 minutes.
              </p>
              <button className="btn btn-primary btn-sm">
                <Sparkles className="w-3 h-3 mr-1" />
                Generate Top 5 Photos
              </button>
            </div>
          </div>
        )
      }
    }
    // Check if this is a structured JSON response from an agent
    if (msg.content && isStructuredResponse(msg.content)) {
      try {
        const data = JSON.parse(msg.content)
        return <StructuredResponse data={data} />
      } catch (e) {
        console.warn('Failed to parse structured response:', e)
      }
    }
    // Default: text message with markdown support
    return (
      <div className="text-sm leading-relaxed prose prose-sm dark:prose-invert max-w-none">
        <ReactMarkdown
          components={{
            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
            ul: ({ children }) => <ul className="list-disc pl-4 mb-2">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal pl-4 mb-2">{children}</ol>,
            li: ({ children }) => <li className="mb-1">{children}</li>,
            strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
            em: ({ children }) => <em className="italic">{children}</em>,
            code: ({ node, inline, className, children, ...props }: any) => {
              const match = /language-(\w+)/.exec(className || '')
              const code = String(children).replace(/\n$/, '')
              
              if (!inline && match) {
                return <CodeBlock language={match[1]} code={code} />
              }
              
              return (
                <code className="bg-gray-200 dark:bg-gray-600 px-1 py-0.5 rounded text-xs" {...props}>
                  {children}
                </code>
              )
            },
            pre: ({ children }) => <>{children}</>,
          }}
        >
          {msg.content || ''}
        </ReactMarkdown>
      </div>
    )
  }

  const lastUserMessage = [...allMessages].reverse().find(m => m.type === 'user')?.content || ''
  const lastAssistantMessageId = [...allMessages].reverse().find(m => m.type === 'assistant')?.id

  const handleRegenerate = () => {
    if (lastUserMessage && !isLoading) {
      sendToLabeeb(lastUserMessage)
    }
  }

  const handleFeedback = (messageId: string, type: 'positive' | 'negative') => {
    console.log(`Feedback submitted: ${type} for message ${messageId}`)
  }

  return (
    <div className="flex h-full">
      {/* Chat Sidebar */}
      <ChatSidebar
        sessions={sessions}
        currentSessionId={currentSessionId}
        onNewSession={startNewSession}
        onSelectSession={loadSession}
        onDeleteSession={deleteSession}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4 bg-white dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 md:hidden"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                <Zap className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  AI Assistant
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Your intelligent business companion
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsContextOpen(!isContextOpen)}
              className="btn btn-secondary"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {allMessages.map((msg) => {
            if (msg.type === 'hitl' && msg.hitlData) {
              const sessionId = msg.hitlData.session_id
              return (
                <div key={msg.id} className="flex justify-start">
                  <div className="max-w-2xl w-full">
                    <HITLCard
                      preview={msg.hitlData.preview as HITLPreview}
                      status={msg.hitlData.status}
                      onApprove={() => handleApproval('approve', undefined, sessionId)}
                      onReject={(reason) => handleApproval('reject', reason, sessionId)}
                      onGenerateImage={async () => {
                        const preview = msg.hitlData?.preview as HITLPreview
                        if (preview?.type === 'product_preview') {
                          const imageUrl = await generateProductImage(
                            preview.product.name,
                            preview.product.description || '',
                            'food_photography'
                          )
                          updateHitlImageUrl(sessionId, imageUrl)
                        }
                      }}
                      generatedImageUrl={msg.hitlData.generatedImageUrl}
                    />
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      {msg.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              )
            }
            
            return (
              <div
                key={msg.id}
                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`group relative max-w-3xl ${msg.type === 'user' ? '' : ''}`}>
                  <div
                    className={`px-4 py-3 rounded-2xl ${
                      msg.type === 'user'
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                    }`}
                  >
                    {renderMessageContent(msg)}
                    <div className={`text-xs mt-2 ${
                      msg.type === 'user' 
                        ? 'text-primary-100' 
                        : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {msg.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                  {msg.type !== 'user' && msg.content && (
                  <>
                    <div className="absolute top-2 right-2">
                      <CopyButton text={msg.content} />
                    </div>
                    <div className="flex items-center gap-3">
                      <MessageFeedback 
                        messageId={msg.id} 
                        sessionId={currentSessionId}
                        token={accessToken}
                        onFeedback={handleFeedback}
                      />
                      {msg.id === lastAssistantMessageId && (
                        <RegenerateButton 
                          onRegenerate={handleRegenerate}
                          disabled={isLoading || !!pendingApproval}
                        />
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          )})}
          
          {/* Complex Query Notice */}
          {complexQueryNotice && (
            <div className="flex justify-start animate-in slide-in-from-top-2 duration-300">
              <div className="flex items-start gap-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-l-4 border-blue-500 px-4 py-3 rounded-r-lg max-w-lg">
                <span className="text-lg flex-shrink-0">ℹ️</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed mb-2">
                    {complexQueryNotice}
                  </p>
                  <a 
                    href="/ai-orbit/insights" 
                    className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline"
                  >
                    Explore BI Tools
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                </div>
                <button 
                  onClick={clearComplexQueryNotice}
                  className="text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
          
          
          {/* Streaming content */}
          {streamingContent && (
            <div className="flex justify-start">
              <div className="max-w-3xl px-4 py-3 rounded-2xl bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white">
                <div className="text-sm leading-relaxed prose prose-sm dark:prose-invert max-w-none">
                  {isStructuredResponse(streamingContent) ? (
                    <div className="flex items-center gap-2">
                      <span className="animate-pulse">Processing response...</span>
                    </div>
                  ) : (
                    <ReactMarkdown>{streamingContent}</ReactMarkdown>
                  )}
                </div>
                <div className="flex items-center mt-2 text-xs text-gray-500">
                  <span className="inline-block w-2 h-2 bg-primary-500 rounded-full animate-pulse mr-2"></span>
                  Streaming...
                </div>
              </div>
            </div>
          )}
          
          {toolStatus && (
            <div className="flex justify-start">
              <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded-lg px-4 py-3">
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span className="font-medium">{toolStatus.message}</span>
              </div>
            </div>
          )}
          
          {/* Large Data Notice */}
          {largeDataNotice && !complexQueryNotice && (
            <div className="flex justify-start animate-in slide-in-from-top-2 duration-300">
              <div className="flex items-start gap-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-l-4 border-purple-500 px-4 py-3 rounded-r-lg max-w-lg">
                <span className="text-lg flex-shrink-0">📊</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-purple-800 dark:text-purple-200 leading-relaxed mb-2">
                    {largeDataNotice}
                  </p>
                  <a 
                    href="/ai-orbit/insights" 
                    className="inline-flex items-center gap-1 text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 hover:underline"
                  >
                    Explore BI Tools
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          )}
          
          {isLoading && !streamingContent && !toolStatus && (
            <div className="flex justify-start">
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200/50 dark:border-amber-700/30 px-5 py-4 rounded-2xl shadow-sm max-w-md">
                <div className="flex items-center gap-4">
                  <div className="relative w-12 h-12 flex-shrink-0">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full border-2 border-amber-300 dark:border-amber-600 border-t-amber-500 dark:border-t-amber-400 animate-spin"></div>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center animate-pulse">
                      <span className="text-2xl">{foodEmoji}</span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-amber-600 dark:text-amber-400">Preparing your answer</span>
                      <span className="flex gap-0.5">
                        <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></span>
                        <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></span>
                        <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></span>
                      </span>
                    </div>
                    <p className="text-sm text-amber-700 dark:text-amber-300">{waitingMessage}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-white dark:bg-gray-800">
          <div className="flex items-center gap-2 mb-2">
            {isConnected ? (
              <span className="flex items-center text-xs text-green-600 dark:text-green-400">
                <Wifi className="w-3 h-3 mr-1" />
                Connected
              </span>
            ) : (
              <span className="flex items-center text-xs text-gray-400">
                <WifiOff className="w-3 h-3 mr-1" />
                Disconnected
              </span>
            )}
          </div>
          
          {/* Error message display */}
          {labeebError && (
            <div className="mb-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center justify-between">
              <span className="text-sm text-red-700 dark:text-red-400">{labeebError}</span>
              <button
                onClick={clearError}
                className="text-red-500 hover:text-red-700 dark:hover:text-red-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          
          {/* Pending approval notice */}
          {pendingApproval && (
            <div className="mb-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <span className="text-sm text-amber-700 dark:text-amber-400">
                Please approve or reject the pending action before sending new messages.
              </span>
            </div>
          )}
          
          {/* Suggestion chips for new chats */}
          {showSuggestions && !pendingApproval && (
            <div className="mb-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Try asking:</p>
              <div className="flex flex-wrap gap-2">
                {suggestionQuestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      sendToLabeeb(suggestion.query)
                    }}
                    className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-primary-100 dark:hover:bg-primary-900/30 text-gray-700 dark:text-gray-300 hover:text-primary-700 dark:hover:text-primary-300 rounded-full border border-gray-200 dark:border-gray-600 hover:border-primary-300 dark:hover:border-primary-700 transition-colors"
                  >
                    {suggestion.label}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex space-x-4">
            <div className="flex-1">
              <div className="relative">
                <textarea
                  ref={textareaRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={pendingApproval ? "Please resolve the pending action first..." : "Ask me anything about your restaurant operations..."}
                  className={`w-full px-4 py-3 pr-28 border border-gray-300 dark:border-gray-600 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${pendingApproval ? 'opacity-50 cursor-not-allowed' : ''}`}
                  rows={1}
                  style={{ minHeight: '48px', maxHeight: '120px' }}
                  disabled={!!pendingApproval}
                />
                {!inputMessage && !pendingApproval && (
                  <div className="absolute bottom-3.5 right-20 text-xs text-gray-400 dark:text-gray-500 pointer-events-none hidden sm:block">
                    <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-600 rounded text-[10px]">Enter</kbd> to send
                  </div>
                )}
                <div className="absolute right-3 bottom-3 flex space-x-2">
                  <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" disabled={!!pendingApproval}>
                    <Paperclip className="w-4 h-4" />
                  </button>
                  <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" disabled={!!pendingApproval}>
                    <Mic className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading || !!pendingApproval}
              className="btn btn-primary px-6"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
        {renderActionModal()}
        
        {/* Approval Modal for HITL */}
        {pendingApproval && (
          <ApprovalModal
            isOpen={true}
            action={pendingApproval.action}
            toolName={pendingApproval.tool_name}
            preview={pendingApproval.preview}
            arguments={pendingApproval.arguments}
            onApprove={approveAction}
            onReject={rejectAction}
          />
        )}

        {/* Query Clarification Modal */}
        {queryClarification && (
          <QueryClarificationModal
            sessionId={queryClarification.sessionId}
            toolName={queryClarification.toolName}
            message={queryClarification.message}
            suggestedFilters={queryClarification.suggestedFilters}
            onProceed={handleClarificationProceed}
            onRefine={handleClarificationRefine}
            onCancel={handleClarificationCancel}
          />
        )}
      </div>

      {/* Context Drawer */}
      {isContextOpen && (
        <div className="w-80 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Smart Actions
              </h3>
              <button
                onClick={() => setIsContextOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {smartActions.map((action) => {
                const IconComponent = action.icon
                return (
                  <div
                    key={action.id}
                    className="relative w-full p-4 text-left border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50 opacity-60 cursor-not-allowed overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 bg-gray-500 text-white text-[10px] font-bold px-6 py-0.5 transform rotate-45 translate-x-4 -translate-y-1 origin-bottom-left">
                      Coming Soon
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-gray-200 dark:bg-gray-600 rounded-lg">
                        <IconComponent className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-500 dark:text-gray-400">
                          {action.title}
                        </div>
                        <div className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                          {action.description}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Context Info */}
            <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                Current Context
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Branch:</span>
                  <span className="text-gray-900 dark:text-white">Downtown</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Time:</span>
                  <span className="text-gray-900 dark:text-white">10:45 AM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Status:</span>
                  <span className="flex items-center text-success-600">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Online
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OrbitAssistant 