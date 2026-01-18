import React, { useState, useEffect } from 'react'
import {
  Camera,
  Image,
  Zap,
  Grid3X3,
  BarChart3,
  Palette,
  Settings,
  Plus,
  X,
  RefreshCw,
  TrendingUp,
  DollarSign,
  Sparkles,
  Search,
  Star,
  Upload,
  Save,
  Activity,
  Shield,
  Eye,
  Download
} from 'lucide-react'

// TypeScript interfaces
interface MenuItem {
  id: string
  name: string
  nameAr: string
  category: string
  hasImage: boolean
  status: 'complete' | 'missing' | 'draft' | 'generating'
  estimatedUplift?: number
}

interface GeneratedImage {
  id: string
  itemId: string
  url: string
  status: 'approved' | 'draft' | 'rejected' | 'pending'
  prompt: string
  style: string
  createdAt: Date
  isFavorite?: boolean
  downloads?: number
  rating?: number
  upliftData?: {
    ordersBefore: number
    ordersAfter: number
    upliftPercentage: number
  }
}



const PlatStudio: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'items' | 'batch' | 'library' | 'brand' | 'usage' | 'settings'>('dashboard')
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const [onboardingStep, setOnboardingStep] = useState(1)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  
  // Additional state for new functionality
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [filterStatus, setFilterStatus] = useState<'all' | 'with-image' | 'no-image'>('all')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [libraryFilter, setLibraryFilter] = useState<'all' | 'recent' | 'favorites' | 'pending'>('all')
  const [brandSettings, setBrandSettings] = useState({
    style: 'Neutral',
    accentColor: '#5D34FF',
    backgroundType: 'white',
    platingStyle: 'elegant'
  })

  // Sample data
  const [menuItems] = useState<MenuItem[]>([
    { id: '1', name: 'Chicken Majboos', nameAr: 'مجبوس دجاج', category: 'Main Dishes', hasImage: false, status: 'missing', estimatedUplift: 35 },
    { id: '2', name: 'Fattoush Salad', nameAr: 'فتوش', category: 'Salads', hasImage: false, status: 'draft', estimatedUplift: 28 },
    { id: '3', name: 'Grilled Lamb Chops', nameAr: 'ريش خروف مشوي', category: 'Main Dishes', hasImage: false, status: 'missing', estimatedUplift: 42 },
    { id: '4', name: 'Hummus with Pita', nameAr: 'حمص بالخبز', category: 'Appetizers', hasImage: true, status: 'complete' },
    { id: '5', name: 'Knafeh', nameAr: 'كنافة', category: 'Desserts', hasImage: false, status: 'missing', estimatedUplift: 55 },
    { id: '6', name: 'Shawarma Wrap', nameAr: 'شاورما', category: 'Wraps', hasImage: false, status: 'generating' },
  ])

  const [generatedImages] = useState<GeneratedImage[]>([
    {
      id: '1',
      itemId: '4',
      url: '/api/placeholder/400/400',
      status: 'approved',
      prompt: 'Fresh hummus with crispy pita bread, olive oil drizzle, studio lighting',
      style: 'Plain background',
      createdAt: new Date('2024-01-15'),
      upliftData: { ordersBefore: 45, ordersAfter: 67, upliftPercentage: 48.9 }
    },
    {
      id: '2',
      itemId: '2',
      url: '/api/placeholder/400/400',
      status: 'draft',
      prompt: 'Colorful fattoush salad with fresh vegetables and sumac dressing',
      style: 'Colorful background',
      createdAt: new Date('2024-01-16')
    }
  ])



  // Analytics data
  const analytics = {
    coverage: 87,
    todayImages: 84,
    weeklyGrowth: 12,
    itemsWithImages: 173,
    itemsGrowth: 6,
    estimatedUplift: 18,
    totalItems: menuItems.length,
    itemsWithPhotos: menuItems.filter(item => item.hasImage).length,
    missingItems: menuItems.filter(item => !item.hasImage).length
  }



  // Usage data
  const usageData = {
    currentPlan: 'Professional',
    imagesGenerated: 847,
    imagesLimit: 2000,
    creditsUsed: 1690,
    creditsLimit: 4000,
    daysInPeriod: 22,
    daysRemaining: 8,
    avgGenerationTime: 4.2,
    approvalRate: 92
  }

  // Filter functions
  const filteredMenuItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.nameAr?.includes(searchQuery)
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'with-image' && item.hasImage) ||
                         (filterStatus === 'no-image' && !item.hasImage)
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory
    return matchesSearch && matchesStatus && matchesCategory
  })

  const filteredImages = generatedImages.filter(img => {
    switch (libraryFilter) {
      case 'recent': return new Date(img.createdAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
      case 'favorites': return img.isFavorite
      case 'pending': return img.status === 'pending'
      default: return true
    }
  })

  const categories = [...new Set(menuItems.map(item => item.category))]

  // Calculate actual coverage
  const actualCoverage = Math.round((analytics.itemsWithPhotos / analytics.totalItems) * 100)

  useEffect(() => {
    // Check if user needs onboarding
    const hasCompletedOnboarding = localStorage.getItem('platstudio-onboarding')
    if (!hasCompletedOnboarding) {
      setShowOnboarding(true)
    }
  }, [])

  const handleCompleteOnboarding = () => {
    localStorage.setItem('platstudio-onboarding', 'true')
    setShowOnboarding(false)
    setShowGenerateModal(true)
    setSelectedItem(menuItems.find(item => !item.hasImage) || null)
  }

  // Helper functions
  const toggleItemSelection = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  const toggleFavorite = (imageId: string) => {
    // In real app, this would update the backend
    console.log('Toggle favorite for image:', imageId)
  }

  // Render functions for each tab
  const renderItemsTab = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as any)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
        >
          <option value="all">All Items</option>
          <option value="with-image">With Images</option>
          <option value="no-image">No Images</option>
        </select>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
        >
          <option value="all">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Menu Items ({filteredMenuItems.length})
          </h3>
          {selectedItems.length > 0 && (
            <button
              onClick={() => console.log('Batch generation for', selectedItems.length, 'items')}
              className="btn btn-primary"
            >
              Generate Selected ({selectedItems.length})
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  <input 
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedItems(filteredMenuItems.filter(item => !item.hasImage).map(item => item.id))
                      } else {
                        setSelectedItems([])
                      }
                    }}
                    className="rounded"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Item</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Est. Uplift</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredMenuItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={() => toggleItemSelection(item.id)}
                      disabled={item.hasImage}
                      className="rounded"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{item.nameAr}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {item.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      item.hasImage 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : item.status === 'generating'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                      {item.hasImage ? 'Complete' : item.status === 'generating' ? 'Generating...' : 'No Photo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {item.estimatedUplift ? `+${item.estimatedUplift}%` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {!item.hasImage && (
                      <button
                        onClick={() => {
                          setSelectedItem(item)
                          setShowGenerateModal(true)
                        }}
                        className="text-primary-600 hover:text-primary-900 dark:text-primary-400"
                      >
                        Generate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  const handleGenerateImage = async () => {
    setIsGenerating(true)
    setGenerationProgress(0)

    // Simulate AI generation process
    const interval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsGenerating(false)
          return 100
        }
        return prev + Math.random() * 15
      })
    }, 200)

    // Simulate completion after 4-7 seconds
    setTimeout(() => {
      clearInterval(interval)
      setGenerationProgress(100)
      setIsGenerating(false)
      window.alert('🎉 4 variations generated successfully! Ready for review.')
    }, 4000 + Math.random() * 3000)
  }

  const getCoverageColor = (coverage: number) => {
    if (coverage >= 90) return 'text-green-600'
    if (coverage >= 60) return 'text-amber-600'
    return 'text-red-600'
  }



  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Coverage Overview */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20">
              <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  d="m18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="2"
                />
                <path
                  d="m18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeDasharray={`${actualCoverage}, 100`}
                  className={getCoverageColor(actualCoverage)}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-xl font-bold ${getCoverageColor(actualCoverage)}`}>
                  {actualCoverage}%
                </span>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Menu Coverage</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {analytics.itemsWithPhotos} of {analytics.totalItems} items have photos
              </p>
              <button 
                onClick={() => setActiveTab('batch')}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                → Generate missing photos
              </button>
            </div>
          </div>
          <button 
            onClick={() => {
              setShowGenerateModal(true)
              setSelectedItem(menuItems.find(item => !item.hasImage) || null)
            }}
            className="btn btn-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Generate
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Today</p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{analytics.todayImages}</p>
                <p className="text-xs text-blue-500">Images generated</p>
              </div>
              <div className="text-green-600 text-sm font-medium">▲{analytics.weeklyGrowth}%</div>
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 dark:text-green-400 font-medium">This Week</p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">{analytics.itemsWithImages}</p>
                <p className="text-xs text-green-500">Items with images</p>
              </div>
              <div className="text-green-600 text-sm font-medium">▲{analytics.itemsGrowth}%</div>
            </div>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Est. Sales Uplift</p>
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">+{analytics.estimatedUplift}%</p>
                <p className="text-xs text-purple-500">Based on industry data</p>
              </div>
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Missing Items Quick Table */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Missing Items ({analytics.missingItems})
          </h3>
          <button 
            onClick={() => setActiveTab('items')}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            View all →
          </button>
        </div>
        
        <div className="overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Dish</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Est. Uplift</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Quick-Gen</th>
              </tr>
            </thead>
            <tbody>
              {menuItems.filter(item => !item.hasImage).slice(0, 5).map(item => (
                <tr key={item.id} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-3 px-4">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{item.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{item.nameAr}</div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      item.status === 'missing' ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400' :
                      item.status === 'draft' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400' :
                      item.status === 'generating' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' :
                      'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                    }`}>
                      {item.status === 'missing' ? 'No photo' : 
                       item.status === 'draft' ? 'Draft' :
                       item.status === 'generating' ? 'Generating...' : 'Complete'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {item.estimatedUplift && (
                      <span className="text-green-600 font-medium">+{item.estimatedUplift}%</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button 
                      onClick={() => {
                        setSelectedItem(item)
                        setShowGenerateModal(true)
                      }}
                      className="btn btn-sm btn-primary"
                      disabled={item.status === 'generating'}
                    >
                      {item.status === 'generating' ? <RefreshCw className="w-3 h-3 animate-spin" /> : 
                       item.status === 'draft' ? 'Review' : 'Generate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Top Performing Images
          </h3>
          <div className="space-y-3">
            {generatedImages.filter(img => img.upliftData).map(image => {
              const item = menuItems.find(m => m.id === image.itemId)
              return (
                <div key={image.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                      <Image className="w-6 h-6 text-gray-500" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{item?.name}</div>
                      <div className="text-sm text-gray-500">Generated {image.createdAt.toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-green-600 font-bold">+{image.upliftData?.upliftPercentage.toFixed(1)}%</div>
                    <div className="text-xs text-gray-500">{image.upliftData?.ordersAfter} orders</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Weekly Generation Stats
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Images Generated</span>
              <span className="font-semibold text-gray-900 dark:text-white">284</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Approval Rate</span>
              <span className="font-semibold text-green-600">92%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Avg. Generation Time</span>
              <span className="font-semibold text-gray-900 dark:text-white">4.2s</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">First-try Success</span>
              <span className="font-semibold text-blue-600">78%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  // Continue with other render methods...
  const renderOnboardingModal = () => {
    if (!showOnboarding) return null

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Welcome to PlatStudio
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Step {onboardingStep} of 2: Let's get your AI food photography set up
                </p>
              </div>
              <div className="flex gap-2">
                <div className={`w-2 h-2 rounded-full ${onboardingStep >= 1 ? 'bg-primary-500' : 'bg-gray-300'}`}></div>
                <div className={`w-2 h-2 rounded-full ${onboardingStep >= 2 ? 'bg-primary-500' : 'bg-gray-300'}`}></div>
              </div>
            </div>

            {onboardingStep === 1 ? (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Connect Your Menu & Language
                  </h3>
                  <div className="space-y-4">
                    <div className="p-4 border-2 border-dashed border-primary-300 rounded-lg text-center">
                      <Camera className="w-8 h-8 text-primary-500 mx-auto mb-2" />
                      <p className="font-medium text-gray-900 dark:text-white">POS Menu Detected</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Found {menuItems.length} items, {analytics.missingItems} missing photos
                      </p>
                      <div className="mt-3">
                        <span className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 rounded-full text-sm">
                          ✓ Auto-synced
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">Arabic Default Prompts</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Generate prompts in Arabic, auto-translate for AI
                        </p>
                      </div>
                      <button className="w-12 h-6 bg-primary-500 rounded-full relative">
                        <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1"></div>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <button 
                    onClick={() => setShowOnboarding(false)}
                    className="btn btn-ghost"
                  >
                    Skip Setup
                  </button>
                  <button 
                    onClick={() => setOnboardingStep(2)}
                    className="btn btn-primary"
                  >
                    Continue
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Pick Your Brand Style
                  </h3>
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    {[
                      { name: 'Neutral', bg: 'bg-gray-100', desc: 'Clean white background' },
                      { name: 'Rustic Wood', bg: 'bg-amber-100', desc: 'Warm wooden surface' },
                      { name: 'Color Pop', bg: 'bg-blue-100', desc: 'Vibrant backgrounds' }
                    ].map((style, idx) => (
                      <button
                        key={style.name}
                        className={`p-4 border-2 rounded-lg text-center transition-colors ${
                          idx === 0 ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className={`w-16 h-16 ${style.bg} rounded-lg mx-auto mb-2 flex items-center justify-center`}>
                          <Camera className="w-8 h-8 text-gray-600" />
                        </div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{style.name}</h4>
                        <p className="text-xs text-gray-500">{style.desc}</p>
                      </button>
                    ))}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Accent Color (Optional)
                    </label>
                    <div className="flex items-center gap-3">
                      <input 
                        type="color" 
                        defaultValue="#5D34FF"
                        className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Used for plates, napkins, and props
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <button 
                    onClick={() => setOnboardingStep(1)}
                    className="btn btn-ghost"
                  >
                    Back
                  </button>
                  <button 
                    onClick={handleCompleteOnboarding}
                    className="btn btn-primary"
                  >
                    Start Generating!
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  const renderGenerateModal = () => {
    if (!showGenerateModal || !selectedItem) return null

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Generate Image for {selectedItem.name}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {selectedItem.nameAr} • Estimated uplift: +{selectedItem.estimatedUplift}%
                </p>
              </div>
              <button 
                onClick={() => setShowGenerateModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!isGenerating ? (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Item Name
                  </label>
                  <input 
                    type="text" 
                    value={selectedItem.name}
                    className="input w-full"
                    readOnly
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Prompt Tweaks
                  </label>
                  <textarea 
                    className="input w-full h-20"
                    placeholder={`Delicious ${selectedItem.name.toLowerCase()}, professionally plated, studio lighting...`}
                    defaultValue={`Authentic ${selectedItem.name.toLowerCase()}, beautifully presented on white ceramic plate, professional food photography, even lighting, appetizing, high quality`}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Style
                    </label>
                    <select className="input w-full">
                      <option>Plain background</option>
                      <option>Rustic wood</option>
                      <option>Colorful backdrop</option>
                      <option>Restaurant setting</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Angle
                    </label>
                    <select className="input w-full">
                      <option>45° hero shot</option>
                      <option>Top-down view</option>
                      <option>Side profile</option>
                      <option>Close-up detail</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Variations
                    </label>
                    <select className="input w-full">
                      <option>4 variations</option>
                      <option>2 variations</option>
                      <option>6 variations</option>
                      <option>8 variations</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-between">
                  <button 
                    onClick={() => setShowGenerateModal(false)}
                    className="btn btn-ghost"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => handleGenerateImage()}
                    className="btn btn-primary"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Images
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="relative w-24 h-24 mx-auto mb-6">
                  <div className="absolute inset-0 border-4 border-primary-200 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-primary-500 rounded-full border-t-transparent animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-primary-500" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Plating your dish...
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Creating 4 professional variations
                </p>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                  <div 
                    className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${generationProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-500">
                  {Math.round(generationProgress)}% complete
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Camera className="w-8 h-8 text-primary-500" />
            PlatStudio
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            AI-powered food photography for higher conversions
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setActiveTab('batch')}
            className="btn btn-secondary"
          >
            <Zap className="w-4 h-4 mr-2" />
            Batch Generate
          </button>
          <button 
            onClick={() => {
              setShowGenerateModal(true)
              setSelectedItem(menuItems.find(item => !item.hasImage) || null)
            }}
            className="btn btn-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Generate Image
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
            { id: 'items', label: 'Items', icon: Grid3X3 },
            { id: 'batch', label: 'Batch Generate', icon: Zap },
            { id: 'library', label: 'Image Library', icon: Image },
            { id: 'brand', label: 'Brand Style', icon: Palette },
            { id: 'usage', label: 'Usage', icon: DollarSign },
            { id: 'settings', label: 'Settings', icon: Settings }
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
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
      {activeTab === 'dashboard' && renderDashboard()}
      {activeTab === 'items' && renderItemsTab()}
      {activeTab === 'batch' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Batch Generation</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Generate multiple images at once to quickly complete your menu coverage.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.missingItems}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Items without photos</div>
              </div>
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">~12min</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Est. completion time</div>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">+${Math.round(analytics.missingItems * 8.5)}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Potential monthly uplift</div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Generate All Missing Items</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Generate images for all {analytics.missingItems} items without photos</p>
                </div>
                <button className="btn btn-primary"><Zap className="w-4 h-4 mr-2" />Start Batch</button>
              </div>
              <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">High-Impact Items Only</h4>
                                     <p className="text-sm text-gray-600 dark:text-gray-400">Focus on items with estimated uplift &gt;40% (3 items)</p>
                </div>
                <button className="btn btn-secondary"><TrendingUp className="w-4 h-4 mr-2" />Generate Priority</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {activeTab === 'library' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="flex gap-2">
              {['all', 'recent', 'favorites', 'pending'].map((filter) => (
                <button key={filter} onClick={() => setLibraryFilter(filter as any)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${libraryFilter === filter ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'}`}>
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>
            <button className="btn btn-secondary"><Upload className="w-4 h-4 mr-2" />Upload Image</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredImages.map((image) => (
              <div key={image.id} className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden group">
                <div className="aspect-square bg-gray-200 dark:bg-gray-700 relative overflow-hidden">
                  <img src={`https://picsum.photos/300/300?random=${image.id}`} alt={`Generated image for ${image.itemId}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
                      <button onClick={() => toggleFavorite(image.id)} className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:scale-110 transition-transform">
                        <Star className={`w-4 h-4 ${image.isFavorite ? 'text-yellow-500 fill-current' : 'text-gray-600'}`} />
                      </button>
                      <button className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:scale-110 transition-transform">
                        <Download className="w-4 h-4 text-gray-600" />
                      </button>
                      <button className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:scale-110 transition-transform">
                        <Eye className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                  <div className="absolute top-2 right-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${image.status === 'approved' ? 'bg-green-100 text-green-800' : image.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                      {image.status}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-1">
                    {menuItems.find(item => item.id === image.itemId)?.name || 'Unknown Item'}
                  </h4>
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>{new Date(image.createdAt).toLocaleDateString()}</span>
                    {image.downloads && (<span className="flex items-center gap-1"><Download className="w-3 h-3" />{image.downloads}</span>)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {activeTab === 'brand' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Brand Style Settings</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Background Style</label>
                <div className="grid grid-cols-3 gap-4">
                  {[{name: 'Neutral', bg: 'bg-gray-100', desc: 'Clean white background'}, {name: 'Rustic Wood', bg: 'bg-amber-100', desc: 'Warm wooden surface'}, {name: 'Color Pop', bg: 'bg-blue-100', desc: 'Vibrant backgrounds'}].map((style) => (
                    <button key={style.name} onClick={() => setBrandSettings(prev => ({...prev, style: style.name}))} className={`p-4 border-2 rounded-lg text-center transition-colors ${brandSettings.style === style.name ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-200 hover:border-gray-300'}`}>
                      <div className={`w-16 h-16 ${style.bg} rounded-lg mx-auto mb-2 flex items-center justify-center`}>
                        <Camera className="w-8 h-8 text-gray-600" />
                      </div>
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm">{style.name}</h4>
                      <p className="text-xs text-gray-500">{style.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Accent Color</label>
                <div className="flex items-center gap-4">
                  <input type="color" value={brandSettings.accentColor} onChange={(e) => setBrandSettings(prev => ({...prev, accentColor: e.target.value}))} className="w-12 h-10 border border-gray-300 rounded cursor-pointer" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Used for plates, napkins, and props</span>
                </div>
              </div>
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <button className="btn btn-primary"><Save className="w-4 h-4 mr-2" />Save Brand Settings</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {activeTab === 'usage' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-gray-900 dark:text-white">Current Plan</h3>
                <Shield className="w-5 h-5 text-primary-500" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{usageData.currentPlan}</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{usageData.daysRemaining} days remaining</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-gray-900 dark:text-white">Images Generated</h3>
                <Image className="w-5 h-5 text-blue-500" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{usageData.imagesGenerated}</div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{width: `${(usageData.imagesGenerated / usageData.imagesLimit) * 100}%`}}></div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{usageData.imagesLimit - usageData.imagesGenerated} remaining</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-gray-900 dark:text-white">Performance</h3>
                <Activity className="w-5 h-5 text-green-500" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{usageData.approvalRate}%</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Approval rate</p>
            </div>
          </div>
        </div>
      )}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">General Settings</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Arabic Default Prompts</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Generate prompts in Arabic by default</p>
                </div>
                <button className="w-12 h-6 bg-primary-500 rounded-full relative">
                  <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1"></div>
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Auto-approve Generated Images</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Automatically approve images that meet quality standards</p>
                </div>
                <button className="w-12 h-6 bg-gray-300 rounded-full relative">
                  <div className="w-4 h-4 bg-white rounded-full absolute top-1 left-1"></div>
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Email Notifications</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Receive notifications for generation completion</p>
                </div>
                <button className="w-12 h-6 bg-primary-500 rounded-full relative">
                  <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1"></div>
                </button>
              </div>
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <button className="btn btn-primary"><Save className="w-4 h-4 mr-2" />Save All Settings</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {renderOnboardingModal()}
      {renderGenerateModal()}

      {/* Floating Action Button */}
      <button 
        onClick={() => {
          setShowGenerateModal(true)
          setSelectedItem(menuItems.find(item => !item.hasImage) || null)
        }}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary-500 text-white rounded-full shadow-lg hover:bg-primary-600 transition-colors z-40 flex items-center justify-center"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  )
}

export default PlatStudio 