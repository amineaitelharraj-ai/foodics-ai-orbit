import React, { useState } from 'react'
import {
  Volume2,
  Phone,
  Smartphone,
  CheckCircle,
  CloudRain,
  Car,
  Pause,
  User,
  Users,
  MapPin,
  Languages,
  GitBranch,
  MessageSquare,
  FileText,
  Database,
  BarChart3,
  Plus,
  Target,
  Play,
  Save,
  Monitor,
  Calendar,
  Clock,
  DollarSign
} from 'lucide-react'

const SayAndServe: React.FC = () => {
  const [testingMic, setTestingMic] = useState(false)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'callFlow' | 'voices' | 'analytics'>('dashboard')
  const [editingVoice, setEditingVoice] = useState<string | null>(null)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)

  // Health and monitoring data
  const systemHealth = {
    uptime: 98,
    status: 'healthy', // healthy, warning, critical
    lastIncident: '2 days ago'
  }

  const todayMetrics = {
    voiceOrders: 847,
    accuracy: 94.2,
    avgCallTime: '2:34',
    revenue: 12450
  }

  const [channels, setChannels] = useState([
    {
      id: 'phone',
      name: 'Phone',
      icon: Phone,
      enabled: true,
      accuracy: 94.2,
      orders: 847,
      status: 'active'
    },
    {
      id: 'drivethru',
      name: 'Drive-thru',
      icon: Car,
      enabled: true,
      accuracy: 91.8,
      orders: 623,
      status: 'active'
    },
    {
      id: 'kiosk',
      name: 'Kiosk',
      icon: Monitor,
      enabled: false,
      accuracy: 88.5,
      orders: 0,
      status: 'inactive'
    },
    {
      id: 'app',
      name: 'App',
      icon: Smartphone,
      enabled: false,
      accuracy: 0,
      orders: 0,
      status: 'coming-soon'
    }
  ])

  const contextCards = [
    {
      type: 'weather',
      icon: CloudRain,
      title: 'Rainy Day',
      description: 'Rain expected until 3PM',
      suggestion: 'Suggest soups & hot drinks',
      action: 'Enable soup prompts',
      priority: 'medium'
    },
    {
      type: 'traffic',
      icon: Car,
      title: 'High Traffic',
      description: 'Drive-thru queue: 8 cars',
      suggestion: 'Speed up upsell, offer pickup ETA',
      action: 'Adjust timing',
      priority: 'high'
    },
    {
      type: 'event',
      icon: Calendar,
      title: 'Game Night',
      description: 'Local match starts 7PM',
      suggestion: 'Prepare for dinner rush',
      action: 'Review staffing',
      priority: 'low'
    }
  ]

  const [voicePersonas, setVoicePersonas] = useState([
    { 
      id: 'sarah',
      name: 'Sarah (Arabic)', 
      language: 'Arabic Saudi', 
      accent: 'Riyadh',
      branch: 'Main Branch', 
      status: 'active',
      orders: 542,
      satisfaction: 96,
      voiceType: 'Neural',
      speed: 1.0,
      pitch: 'Medium',
      volume: 85,
      samples: [
        { text: 'مرحباً بكم في مطعم الأصالة', translation: 'Welcome to Al-Asala Restaurant' },
        { text: 'كيف يمكنني مساعدتكم اليوم؟', translation: 'How can I help you today?' },
        { text: 'هل تريدون إضافة أي شيء آخر؟', translation: 'Would you like to add anything else?' }
      ]
    },
    { 
      id: 'ahmed',
      name: 'Ahmed (English)', 
      language: 'English', 
      accent: 'International',
      branch: 'Mall Branch', 
      status: 'active',
      orders: 305,
      satisfaction: 94,
      voiceType: 'Standard',
      speed: 0.9,
      pitch: 'Low',
      volume: 90,
      samples: [
        { text: 'Hello and welcome to our restaurant', translation: 'مرحباً ومرحباً بكم في مطعمنا' },
        { text: 'What would you like to order today?', translation: 'ماذا تريدون أن تطلبوا اليوم؟' },
        { text: 'Thank you for choosing us', translation: 'شكراً لاختياركم لنا' }
      ]
    },
    { 
      id: 'layla',
      name: 'Layla (Arabic)', 
      language: 'Arabic Egyptian', 
      accent: 'Cairo',
      branch: 'Downtown', 
      status: 'training',
      orders: 0,
      satisfaction: 0,
      voiceType: 'Neural',
      speed: 1.1,
      pitch: 'High',
      volume: 80,
      samples: [
        { text: 'أهلاً وسهلاً', translation: 'Welcome' },
        { text: 'إيه اللي عايزينه النهارده؟', translation: 'What do you want today?' },
        { text: 'شكراً ليكم', translation: 'Thank you' }
      ]
    },
    { 
      id: 'omar',
      name: 'Omar (Mixed)', 
      language: 'Arabic/English', 
      accent: 'Bilingual',
      branch: 'Airport', 
      status: 'active',
      orders: 156,
      satisfaction: 91,
      voiceType: 'Neural',
      speed: 0.95,
      pitch: 'Medium',
      volume: 88,
      samples: [
        { text: 'Welcome - مرحباً بكم', translation: 'Welcome to our restaurant' },
        { text: 'How can I help you? - كيف يمكنني مساعدتكم؟', translation: 'Mixed language greeting' },
        { text: 'Thank you - شكراً لكم', translation: 'Bilingual farewell' }
      ]
    }
  ])

  // Call Flow Data
  const flowNodes = [
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

  const handleTestMic = () => {
    setTestingMic(true)
    setTimeout(() => {
      setTestingMic(false)
      alert('Voice test complete! ✅ Microphone is working perfectly.')
    }, 3000)
  }

  const handleActivatePersona = (personaId: string) => {
    const persona = voicePersonas.find(p => p.id === personaId)
    if (persona) {
      setVoicePersonas((prev: any) => prev.map((p: any) => ({
        ...p,
        isActive: p.id === personaId
      })))
      alert(`${persona.name} activated successfully! Voice ordering is now live.`)
    }
  }

  const handleChannelToggle = (channelId: string) => {
    setChannels(prev => prev.map(channel => 
      channel.id === channelId 
        ? { 
            ...channel, 
            enabled: !channel.enabled,
            status: !channel.enabled ? 'active' : 'inactive',
            orders: !channel.enabled ? channel.orders || 0 : 0
          }
        : channel
    ))
    const channel = channels.find(c => c.id === channelId)
    alert(`${channel?.name} channel ${channel?.enabled ? 'disabled' : 'enabled'} successfully!`)
  }

  const handleContextAction = (actionType: string) => {
    switch(actionType) {
      case 'enable_soup_prompts':
        alert('Rainy day soup prompts enabled!')
        break
      case 'adjust_timing':
        alert('Drive-thru timing adjusted for high traffic period!')
        break
      case 'review_staffing':
        alert('Staff review scheduled for game night preparation!')
        break
      default:
        alert(`${actionType} action executed successfully!`)
    }
  }

  const playVoiceSample = (persona: any, sampleIndex: number) => {
    setTestingMic(true)
    alert(`Playing voice sample: ${persona.samples[sampleIndex].text}`)
    setTimeout(() => {
      setTestingMic(false)
    }, 2000)
  }

  const saveVoiceSettings = (personaId: string, settings: any) => {
    setVoicePersonas((prev: any) => prev.map((p: any) => 
      p.id === personaId 
        ? { ...p, voiceSettings: { ...p.voiceSettings, ...settings } }
        : p
    ))
    setEditingVoice(null)
    alert('Voice settings saved successfully!')
  }

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

  // Main Dashboard with Tabs
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Say and Serve</h1>
          <p className="text-gray-600 dark:text-gray-400">AI Voice Ordering System</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-green-100 dark:bg-green-900/20 px-3 py-2 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium text-green-700 dark:text-green-400">{systemHealth.uptime}% Uptime</span>
          </div>
          <button
            onClick={handleTestMic}
            className={`btn flex items-center space-x-2 ${
              testingMic ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-purple-600 hover:bg-purple-700 text-white'
            }`}
          >
            {testingMic ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{testingMic ? 'Stop Test' : 'Test Voice'}</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
            { id: 'voices', label: 'Voice Personas', icon: Users },
            { id: 'callFlow', label: 'Call Flow', icon: GitBranch },
            { id: 'analytics', label: 'Analytics', icon: Database }
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

      {/* Tab Content */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Today's Metrics */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Today at a Glance</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{todayMetrics.voiceOrders}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Orders via voice</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">{todayMetrics.accuracy}%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Avg accuracy</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{todayMetrics.avgCallTime}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Median call time</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">${todayMetrics.revenue.toLocaleString()}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Revenue</div>
              </div>
            </div>
          </div>

          {/* Voice Channels and Smart Context */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Voice Channels */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Volume2 className="w-5 h-5 mr-2 text-blue-600" />
                Voice Channels
              </h2>
              <div className="space-y-3">
                {channels.map((channel) => {
                  const IconComponent = channel.icon
                  return (
                    <div key={channel.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${
                          channel.enabled ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400' :
                          channel.status === 'coming-soon' ? 'bg-gray-100 dark:bg-gray-700 text-gray-400' :
                          'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400'
                        }`}>
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center">
                            <h3 className="font-medium text-gray-900 dark:text-white">{channel.name}</h3>
                            {channel.status === 'coming-soon' && (
                              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">Coming Soon</span>
                            )}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {channel.enabled ? `${channel.accuracy}% accuracy • ${channel.orders} orders` : 
                             channel.status === 'coming-soon' ? 'Notify when ready' : 'Ready to enable'}
                          </div>
                        </div>
                      </div>
                      
                      {channel.status !== 'coming-soon' ? (
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={channel.enabled} 
                            onChange={() => handleChannelToggle(channel.id)}
                            className="sr-only peer" 
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                      ) : (
                        <button 
                          onClick={() => alert('You will be notified when the app is ready!')}
                          className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline"
                        >
                          Notify Me
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Smart Context */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Smart Context</h2>
              <div className="space-y-3">
                {contextCards.map((card, index) => {
                  const IconComponent = card.icon
                  return (
                    <div key={index} className={`border rounded-lg p-3 ${
                      card.priority === 'high' ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20' :
                      card.priority === 'medium' ? 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20' :
                      'border-gray-200 dark:border-gray-700'
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start">
                          <IconComponent className={`w-5 h-5 mr-3 mt-0.5 ${
                            card.priority === 'high' ? 'text-red-600' :
                            card.priority === 'medium' ? 'text-yellow-600' :
                            'text-blue-600'
                          }`} />
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900 dark:text-white text-sm">{card.title}</h3>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{card.description}</p>
                            <p className="text-xs text-blue-800 dark:text-blue-200">{card.suggestion}</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleContextAction(card.action)}
                          className={`text-xs px-2 py-1 rounded font-medium hover:opacity-90 transition-opacity ${
                            card.priority === 'high' ? 'bg-red-600 text-white' :
                            card.priority === 'medium' ? 'bg-yellow-600 text-white' :
                            'bg-blue-600 text-white'
                          }`}
                        >
                          {card.action}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'voices' && (
        <div className="space-y-6">
          {/* Voice Personas Grid */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Voice Agents by Branch</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {voicePersonas.map((persona) => (
                <div key={persona.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                        persona.status === 'active' ? 'bg-green-100 dark:bg-green-900/20' : 'bg-yellow-100 dark:bg-yellow-900/20'
                      }`}>
                        <User className={`w-5 h-5 ${
                          persona.status === 'active' ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'
                        }`} />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white text-sm">{persona.name}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center">
                          <Languages className="w-3 h-3 mr-1" />
                          {persona.language} • {persona.accent}
                        </div>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded font-medium ${
                      persona.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                    }`}>
                      {persona.status}
                    </span>
                  </div>
                  
                  <div className="mb-3">
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">Voice Samples:</div>
                    <div className="space-y-1">
                      {persona.samples.slice(0, 2).map((sample, index) => (
                        <div key={index} className="flex items-center justify-between text-xs">
                          <span className="text-gray-900 dark:text-white truncate mr-2">"{sample.text}"</span>
                          <button
                            onClick={() => playVoiceSample(persona, index)}
                            className="p-1 text-purple-600 hover:text-purple-800 dark:text-purple-400"
                          >
                            <Play className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <MapPin className="w-3 h-3 mr-1" />
                      {persona.branch}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setEditingVoice(persona.id)}
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Edit Voice
                      </button>
                      {persona.status === 'training' && (
                        <button 
                          onClick={() => handleActivatePersona(persona.id)}
                          className="text-green-600 dark:text-green-400 hover:underline"
                        >
                          Activate
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="mt-2 text-xs text-right text-gray-500">
                    {persona.status === 'active' ? (
                      <>
                        <span className="font-medium">{persona.orders} orders</span>
                        <span className="mx-1">•</span>
                        <span>{persona.satisfaction}% satisfaction</span>
                      </>
                    ) : (
                      <span>Ready for activation</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Voice Editor Modal */}
          {editingVoice && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full">
                {(() => {
                  const persona = voicePersonas.find(p => p.id === editingVoice)
                  if (!persona) return null
                  
                  return (
                    <>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Edit {persona.name}
                      </h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Voice Type
                          </label>
                          <select className="input w-full" defaultValue={persona.voiceType}>
                            <option value="Neural">Neural (Premium)</option>
                            <option value="Standard">Standard</option>
                            <option value="Custom">Custom Trained</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Speaking Speed: {persona.speed}x
                          </label>
                          <input 
                            type="range" 
                            min="0.5" 
                            max="2" 
                            step="0.1" 
                            defaultValue={persona.speed}
                            className="w-full"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Pitch
                          </label>
                          <select className="input w-full" defaultValue={persona.pitch}>
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Volume: {persona.volume}%
                          </label>
                          <input 
                            type="range" 
                            min="50" 
                            max="100" 
                            defaultValue={persona.volume}
                            className="w-full"
                          />
                        </div>
                        
                        <div className="flex space-x-3 pt-4">
                          <button
                            onClick={() => saveVoiceSettings(persona.id, {})}
                            className="btn btn-primary flex-1"
                          >
                            Save Changes
                          </button>
                          <button
                            onClick={() => setEditingVoice(null)}
                            className="btn btn-ghost flex-1"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </>
                  )
                })()}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'callFlow' && (
        <div className="space-y-6">
          {/* Call Flow Designer */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Conversation Flow Designer</h2>
              <div className="flex items-center space-x-2">
                <button className="btn bg-green-600 hover:bg-green-700 text-white flex items-center space-x-2">
                  <Play className="w-4 h-4" />
                  <span>Test Flow</span>
                </button>
                <button className="btn bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2">
                  <Save className="w-4 h-4" />
                  <span>Save</span>
                </button>
              </div>
            </div>
            
            {/* Flow Canvas */}
            <div className="relative h-96 bg-gray-50 dark:bg-gray-900 rounded-lg p-4 overflow-auto">
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
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setSelectedNode(node.id)
                  }}
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
          
          {/* Node Properties */}
          {selectedNode && (() => {
            const node = flowNodes.find(n => n.id === selectedNode)
            if (!node) return null
            
            return (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Edit Node</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Node Title
                      </label>
                      <input
                        type="text"
                        key={`title-${selectedNode}`}
                        defaultValue={node.title}
                        className="input w-full"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Voice Script (Arabic/English)
                      </label>
                      <textarea
                        key={`content-${selectedNode}`}
                        defaultValue={node.content}
                        className="input w-full h-24 resize-none"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Node Type
                      </label>
                      <select 
                        key={`type-${selectedNode}`}
                        className="input w-full" 
                        defaultValue={node.type}
                      >
                        <option value="greeting">Greeting</option>
                        <option value="menu">Menu Navigation</option>
                        <option value="order">Order Taking</option>
                        <option value="payment">Payment</option>
                        <option value="confirmation">Confirmation</option>
                        <option value="escalation">Human Handoff</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Expected Customer Responses
                      </label>
                      <textarea
                        key={`responses-${selectedNode}`}
                        placeholder="Enter possible customer responses..."
                        className="input w-full h-20 resize-none"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Fallback Action
                      </label>
                      <select 
                        key={`fallback-${selectedNode}`}
                        className="input w-full"
                      >
                        <option>Repeat message</option>
                        <option>Transfer to human</option>
                        <option>Go to previous step</option>
                        <option>End call politely</option>
                      </select>
                    </div>
                    
                    <div className="flex space-x-2 pt-4">
                      <button className="btn btn-primary flex-1">
                        <Save className="w-4 h-4 mr-2" />
                        Save Node
                      </button>
                      <button 
                        onClick={() => setSelectedNode(null)}
                        className="btn btn-ghost"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })()}
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Performance Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Voice Orders</p>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">2,847</p>
                  <p className="text-sm text-green-600 dark:text-green-400">+12% from last week</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                  <Volume2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Accuracy Rate</p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">94.2%</p>
                  <p className="text-sm text-green-600 dark:text-green-400">+2.1% improvement</p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                  <Target className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Call Time</p>
                  <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">2:34</p>
                  <p className="text-sm text-red-600 dark:text-red-400">+0:12 vs target</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Revenue Generated</p>
                  <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">$67,420</p>
                  <p className="text-sm text-green-600 dark:text-green-400">+18% vs last month</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Channel Performance */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Channel Performance</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left pb-3 text-sm font-medium text-gray-600 dark:text-gray-400">Channel</th>
                    <th className="text-left pb-3 text-sm font-medium text-gray-600 dark:text-gray-400">Orders</th>
                    <th className="text-left pb-3 text-sm font-medium text-gray-600 dark:text-gray-400">Accuracy</th>
                    <th className="text-left pb-3 text-sm font-medium text-gray-600 dark:text-gray-400">Revenue</th>
                    <th className="text-left pb-3 text-sm font-medium text-gray-600 dark:text-gray-400">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {channels.map((channel) => {
                    const IconComponent = channel.icon
                    return (
                      <tr key={channel.id} className="border-b border-gray-100 dark:border-gray-700/50">
                        <td className="py-3">
                          <div className="flex items-center">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${
                              channel.enabled ? 'bg-green-100 dark:bg-green-900/20' : 'bg-gray-100 dark:bg-gray-700'
                            }`}>
                              <IconComponent className={`w-4 h-4 ${
                                channel.enabled ? 'text-green-600 dark:text-green-400' : 'text-gray-400'
                              }`} />
                            </div>
                            <span className="font-medium text-gray-900 dark:text-white">{channel.name}</span>
                          </div>
                        </td>
                        <td className="py-3 text-gray-600 dark:text-gray-400">{channel.orders.toLocaleString()}</td>
                        <td className="py-3">
                          <span className={`font-medium ${
                            channel.accuracy > 90 ? 'text-green-600 dark:text-green-400' :
                            channel.accuracy > 85 ? 'text-yellow-600 dark:text-yellow-400' :
                            'text-red-600 dark:text-red-400'
                          }`}>
                            {channel.enabled ? `${channel.accuracy}%` : '-'}
                          </span>
                        </td>
                        <td className="py-3 text-gray-600 dark:text-gray-400">
                          {channel.enabled ? `$${(channel.orders * 23.5).toLocaleString()}` : '-'}
                        </td>
                        <td className="py-3">
                          <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                            channel.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                            channel.status === 'coming-soon' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                          }`}>
                            {channel.status === 'coming-soon' ? 'Coming Soon' : 
                             channel.enabled ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Voice Persona Performance */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Voice Persona Performance</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {voicePersonas.filter(p => p.status === 'active').map((persona) => (
                <div key={persona.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mr-3">
                        <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">{persona.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{persona.branch}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600 dark:text-green-400">{persona.satisfaction}%</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">satisfaction</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-600 dark:text-gray-400">Orders Handled</div>
                      <div className="font-semibold text-gray-900 dark:text-white">{persona.orders}</div>
                    </div>
                    <div>
                      <div className="text-gray-600 dark:text-gray-400">Revenue</div>
                      <div className="font-semibold text-gray-900 dark:text-white">${(persona.orders * 24.2).toLocaleString()}</div>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600 dark:text-gray-400">Performance</span>
                      <span className="text-gray-900 dark:text-white">{persona.satisfaction}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${persona.satisfaction}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Call Analysis */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Call Analysis</h2>
            <div className="space-y-3">
              {[
                { time: '2:45 PM', duration: '2:12', accuracy: 96, revenue: 45.50, channel: 'Phone', status: 'completed' },
                { time: '2:43 PM', duration: '1:58', accuracy: 91, revenue: 32.75, channel: 'Drive-thru', status: 'completed' },
                { time: '2:41 PM', duration: '3:22', accuracy: 88, revenue: 78.25, channel: 'Phone', status: 'escalated' },
                { time: '2:39 PM', duration: '1:45', accuracy: 97, revenue: 28.50, channel: 'Drive-thru', status: 'completed' },
                { time: '2:37 PM', duration: '2:35', accuracy: 93, revenue: 56.00, channel: 'Phone', status: 'completed' }
              ].map((call, index) => (
                <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700/50 last:border-b-0">
                  <div className="flex items-center space-x-4">
                    <div className="text-sm">
                      <div className="font-medium text-gray-900 dark:text-white">{call.time}</div>
                      <div className="text-gray-600 dark:text-gray-400">{call.channel}</div>
                    </div>
                    <div className="text-sm">
                      <div className="text-gray-600 dark:text-gray-400">Duration</div>
                      <div className="font-medium text-gray-900 dark:text-white">{call.duration}</div>
                    </div>
                    <div className="text-sm">
                      <div className="text-gray-600 dark:text-gray-400">Accuracy</div>
                      <div className={`font-medium ${
                        call.accuracy > 90 ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'
                      }`}>
                        {call.accuracy}%
                      </div>
                    </div>
                    <div className="text-sm">
                      <div className="text-gray-600 dark:text-gray-400">Revenue</div>
                      <div className="font-medium text-gray-900 dark:text-white">${call.revenue}</div>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                    call.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                  }`}>
                    {call.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SayAndServe 