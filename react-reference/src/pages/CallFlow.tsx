import React, { useState } from 'react'
import {
  Plus,
  Settings,
  Play,
  Pause,
  Save,
  Upload,
  Download,
  Eye,
  MessageSquare,
  FileText,
  Database,
  BarChart3,
  Users,
  Clock,
  CheckCircle,
  Trash2,
  Copy,
  Edit3,
  GitBranch,
  Zap,
  Target,
  Filter
} from 'lucide-react'

interface FlowNode {
  id: string
  type: 'greeting' | 'menu' | 'order' | 'payment' | 'confirmation' | 'escalation'
  title: string
  content: string
  position: { x: number; y: number }
  connections: string[]
}

interface DataSource {
  id: string
  name: string
  type: 'menu' | 'pricing' | 'policies' | 'faq'
  status: 'active' | 'training' | 'failed'
  accuracy: number
  lastUpdate: string
  size: string
}

const CallFlow: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'designer' | 'sources' | 'analytics' | 'logs'>('designer')
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const flowNodes: FlowNode[] = [
    {
      id: 'greeting',
      type: 'greeting',
      title: 'Welcome Greeting',
      content: 'مرحباً بكم في مطعم الأصالة، كيف يمكنني مساعدتكم اليوم؟',
      position: { x: 100, y: 100 },
      connections: ['menu']
    },
    {
      id: 'menu',
      type: 'menu',
      title: 'Menu Navigation',
      content: 'هل تريدون الاطلاع على قائمة الطعام أم لديكم طلب محدد؟',
      position: { x: 400, y: 100 },
      connections: ['order', 'escalation']
    },
    {
      id: 'order',
      type: 'order',
      title: 'Order Taking',
      content: 'ممتاز! ما هو طلبكم اليوم؟',
      position: { x: 700, y: 100 },
      connections: ['payment']
    },
    {
      id: 'payment',
      type: 'payment',
      title: 'Payment Processing',
      content: 'المجموع ٤٥ ريال. هل تفضلون الدفع نقداً أم بالبطاقة؟',
      position: { x: 1000, y: 100 },
      connections: ['confirmation']
    },
    {
      id: 'confirmation',
      type: 'confirmation',
      title: 'Order Confirmation',
      content: 'شكراً لكم! طلبكم سيكون جاهز خلال ١٥ دقيقة.',
      position: { x: 1300, y: 100 },
      connections: []
    },
    {
      id: 'escalation',
      type: 'escalation',
      title: 'Human Handoff',
      content: 'سأقوم بتحويلكم إلى أحد زملائي للمساعدة.',
      position: { x: 400, y: 300 },
      connections: []
    }
  ]

  const dataSources: DataSource[] = [
    {
      id: 'menu-ar',
      name: 'Arabic Menu (قائمة الطعام)',
      type: 'menu',
      status: 'active',
      accuracy: 96,
      lastUpdate: '2 hours ago',
      size: '847 items'
    },
    {
      id: 'pricing',
      name: 'Current Pricing',
      type: 'pricing',
      status: 'active',
      accuracy: 98,
      lastUpdate: '1 day ago',
      size: '423 prices'
    },
    {
      id: 'policies',
      name: 'Store Policies',
      type: 'policies',
      status: 'training',
      accuracy: 87,
      lastUpdate: '3 days ago',
      size: '24 policies'
    },
    {
      id: 'faq-ar',
      name: 'Arabic FAQ',
      type: 'faq',
      status: 'failed',
      accuracy: 0,
      lastUpdate: 'Failed',
      size: '0 items'
    }
  ]

  const callLogs = [
    {
      id: '1',
      time: '14:35',
      customer: 'أحمد محمد',
      duration: '2:45',
      status: 'completed',
      order: 'شاورما دجاج + مشروب',
      total: '35 SR'
    },
    {
      id: '2',
      time: '14:32',
      customer: 'فاطمة علي',
      duration: '1:23',
      status: 'escalated',
      order: 'استفسار عن الحلويات',
      total: '--'
    },
    {
      id: '3',
      time: '14:28',
      customer: 'خالد أحمد',
      duration: '3:12',
      status: 'completed',
      order: 'مشكل مشترك لـ4 أشخاص',
      total: '125 SR'
    }
  ]

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'greeting': return <MessageSquare className="w-4 h-4" />
      case 'menu': return <FileText className="w-4 h-4" />
      case 'order': return <Plus className="w-4 h-4" />
      case 'payment': return <Target className="w-4 h-4" />
      case 'confirmation': return <CheckCircle className="w-4 h-4" />
      case 'escalation': return <Users className="w-4 h-4" />
      default: return <MessageSquare className="w-4 h-4" />
    }
  }

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'greeting': return 'bg-blue-100 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700'
      case 'menu': return 'bg-green-100 dark:bg-green-900/20 border-green-300 dark:border-green-700'
      case 'order': return 'bg-purple-100 dark:bg-purple-900/20 border-purple-300 dark:border-purple-700'
      case 'payment': return 'bg-yellow-100 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700'
      case 'confirmation': return 'bg-emerald-100 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700'
      case 'escalation': return 'bg-red-100 dark:bg-red-900/20 border-red-300 dark:border-red-700'
      default: return 'bg-gray-100 dark:bg-gray-900/20 border-gray-300 dark:border-gray-700'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 dark:text-green-400'
      case 'training': return 'text-yellow-600 dark:text-yellow-400'
      case 'failed': return 'text-red-600 dark:text-red-400'
      case 'completed': return 'text-green-600 dark:text-green-400'
      case 'escalated': return 'text-red-600 dark:text-red-400'
      default: return 'text-gray-600 dark:text-gray-400'
    }
  }

  const handlePlayFlow = () => {
    setIsPlaying(!isPlaying)
    if (!isPlaying) {
      alert('🎬 Simulating voice flow... Customer calling in Arabic')
      setTimeout(() => {
        alert('✅ Flow simulation complete! Customer successfully placed order for Chicken Shawarma.')
        setIsPlaying(false)
      }, 3000)
    }
  }

  const handleSaveFlow = () => {
    alert('💾 Call flow saved successfully! Changes will be applied to all voice channels.')
  }

  const handleUploadSource = () => {
    alert('📁 File upload dialog would open here. Supported: PDF, DOC, TXT for training data.')
  }

  const handleRetrain = (sourceId: string) => {
    alert(`🔄 Retraining AI model with updated ${sourceId} data. This will take 5-10 minutes.`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Call Flow Designer</h1>
          <p className="text-gray-600 dark:text-gray-400">Design and optimize your voice ordering conversations</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handlePlayFlow}
            className={`btn flex items-center space-x-2 ${
              isPlaying ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isPlaying ? 'Stop Test' : 'Test Flow'}</span>
          </button>
          <button onClick={handleSaveFlow} className="btn bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2">
            <Save className="w-4 h-4" />
            <span>Save</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          {[
            { id: 'designer', label: 'Flow Designer', icon: GitBranch },
            { id: 'sources', label: 'Data Sources', icon: Database },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            { id: 'logs', label: 'Call Logs', icon: Clock }
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'designer' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Flow Canvas */}
          <div className="lg:col-span-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Conversation Flow</h2>
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <Plus className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <Copy className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {/* Flow Visualization */}
            <div className="relative h-96 overflow-auto bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <svg className="absolute inset-0 w-full h-full">
                {/* Connection Lines */}
                {flowNodes.map(node =>
                  node.connections.map(targetId => {
                    const target = flowNodes.find(n => n.id === targetId)
                    if (!target) return null
                    return (
                      <line
                        key={`${node.id}-${targetId}`}
                        x1={node.position.x + 120}
                        y1={node.position.y + 30}
                        x2={target.position.x}
                        y2={target.position.y + 30}
                        stroke="#8B5CF6"
                        strokeWidth="2"
                        markerEnd="url(#arrowhead)"
                      />
                    )
                  })
                )}
                <defs>
                  <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#8B5CF6" />
                  </marker>
                </defs>
              </svg>
              
              {/* Flow Nodes */}
              {flowNodes.map(node => (
                <div
                  key={node.id}
                  className={`absolute w-32 h-16 rounded-lg border-2 cursor-pointer transition-all hover:shadow-lg ${
                    getNodeColor(node.type)
                  } ${selectedNode === node.id ? 'ring-2 ring-purple-500' : ''}`}
                  style={{ left: node.position.x, top: node.position.y }}
                  onClick={() => setSelectedNode(node.id)}
                >
                  <div className="p-2 h-full flex flex-col justify-center">
                    <div className="flex items-center space-x-1 mb-1">
                      {getNodeIcon(node.type)}
                      <span className="text-xs font-medium text-gray-900 dark:text-white truncate">
                        {node.title}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                      {node.content.substring(0, 30)}...
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Node Properties Panel */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {selectedNode ? 'Edit Node' : 'Select a Node'}
            </h3>
            
            {selectedNode ? (
              <div className="space-y-4">
                {(() => {
                  const node = flowNodes.find(n => n.id === selectedNode)
                  if (!node) return null
                  
                  return (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Node Title
                        </label>
                        <input
                          type="text"
                          value={node.title}
                          className="input w-full"
                          placeholder="Enter node title"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Voice Script (Arabic/English)
                        </label>
                        <textarea
                          value={node.content}
                          className="input w-full h-24 resize-none"
                          placeholder="Enter what the AI should say..."
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Node Type
                        </label>
                        <select className="input w-full">
                          <option value="greeting">Greeting</option>
                          <option value="menu">Menu Navigation</option>
                          <option value="order">Order Taking</option>
                          <option value="payment">Payment</option>
                          <option value="confirmation">Confirmation</option>
                          <option value="escalation">Human Handoff</option>
                        </select>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button className="btn btn-primary flex-1">
                          <Save className="w-4 h-4 mr-2" />
                          Save
                        </button>
                        <button className="btn btn-ghost">
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  )
                })()}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Click on a node in the flow to edit its properties and content.
              </p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'sources' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Data Sources List */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Training Data Sources</h2>
              <button
                onClick={handleUploadSource}
                className="btn bg-purple-600 hover:bg-purple-700 text-white flex items-center space-x-2"
              >
                <Upload className="w-4 h-4" />
                <span>Upload</span>
              </button>
            </div>
            
            <div className="space-y-3">
              {dataSources.map(source => (
                <div key={source.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        source.status === 'active' ? 'bg-green-100 dark:bg-green-900/20' :
                        source.status === 'training' ? 'bg-yellow-100 dark:bg-yellow-900/20' :
                        'bg-red-100 dark:bg-red-900/20'
                      }`}>
                        <Database className={`w-4 h-4 ${getStatusColor(source.status)}`} />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">{source.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{source.size}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-medium ${getStatusColor(source.status)}`}>
                        {source.status === 'active' ? `${source.accuracy}% accuracy` :
                         source.status === 'training' ? 'Training...' :
                         'Failed'}
                      </div>
                      <div className="text-xs text-gray-500">{source.lastUpdate}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleRetrain(source.id)}
                      className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                    >
                      Retrain
                    </button>
                    <button className="text-xs bg-gray-600 text-white px-2 py-1 rounded hover:bg-gray-700">
                      Download
                    </button>
                    {source.status === 'failed' && (
                      <button className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700">
                        Fix
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upload Guidelines */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Upload Guidelines</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Supported Formats</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• PDF documents</li>
                  <li>• Word files (.doc, .docx)</li>
                  <li>• Text files (.txt)</li>
                  <li>• Excel spreadsheets</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Best Practices</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Include Arabic and English text</li>
                  <li>• Use clear, conversational language</li>
                  <li>• Add common customer questions</li>
                  <li>• Update pricing regularly</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">File Size Limits</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Maximum: 10MB per file</li>
                  <li>• Total limit: 100MB</li>
                  <li>• Recommended: Under 5MB</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Performance Metrics */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Flow Performance</h2>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">847</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Calls</div>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">94.2%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Success Rate</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">2:34</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Avg Duration</div>
              </div>
              <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">5.8%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Escalation Rate</div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900 dark:text-white">Node Performance</h3>
              {flowNodes.map(node => (
                <div key={node.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getNodeIcon(node.type)}
                    <span className="font-medium text-gray-900 dark:text-white">{node.title}</span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      {Math.floor(Math.random() * 200 + 50)} visits
                    </span>
                    <span className="text-green-600 dark:text-green-400">
                      {Math.floor(Math.random() * 20 + 80)}% success
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
            
            <div className="space-y-3">
              <button className="w-full btn bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center space-x-2">
                <Download className="w-4 h-4" />
                <span>Export Analytics</span>
              </button>
              
              <button className="w-full btn bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center space-x-2">
                <Zap className="w-4 h-4" />
                <span>Optimize Flow</span>
              </button>
              
              <button className="w-full btn bg-green-600 hover:bg-green-700 text-white flex items-center justify-center space-x-2">
                <Filter className="w-4 h-4" />
                <span>A/B Test</span>
              </button>
              
              <button className="w-full btn bg-gray-600 hover:bg-gray-700 text-white flex items-center justify-center space-x-2">
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Real-time Call Logs</h2>
            <div className="flex items-center space-x-2">
              <button className="btn bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
              <button className="btn bg-gray-600 hover:bg-gray-700 text-white">
                <Filter className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Time</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Customer</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Duration</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Order</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Total</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {callLogs.map(log => (
                  <tr key={log.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="py-3 px-4 text-gray-900 dark:text-white">{log.time}</td>
                    <td className="py-3 px-4 text-gray-900 dark:text-white">{log.customer}</td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{log.duration}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 text-xs rounded font-medium ${getStatusColor(log.status)}`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-900 dark:text-white">{log.order}</td>
                    <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">{log.total}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-1">
                        <button className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default CallFlow 