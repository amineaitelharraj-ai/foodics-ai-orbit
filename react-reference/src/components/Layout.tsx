import { ReactNode, useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import { useAuth } from '../contexts/AuthContext'
import { AIOrbitTabBar } from './AIOrbitTabBar'
import { FoodicsIcon } from './ui/FoodicsIcon'

const SIDEBAR_COLLAPSED_KEY = 'sidebar_collapsed'

interface LayoutProps {
  children: ReactNode
}

const navItems = [
  { icon: 'dashboard-icon', label: 'Dashboard', path: '/dashboard' },
  { icon: 'shopping-cart', label: 'Orders', path: '/orders' },
  { icon: 'people', label: 'Customers', path: '/customers' },
  { icon: 'bar-chart', label: 'Reports', path: '/reports' },
  { icon: 'inventory', label: 'Inventory', path: '/inventory' },
  { icon: 'menu-book', label: 'Menu', path: '/menu' },
  { icon: 'sell', label: 'Marketing', path: '/marketing' },
]

const bottomNavItems = [
  { icon: 'store', label: 'Marketplace', path: '/marketplace' },
]

function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isAuthenticated, signOut } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_COLLAPSED_KEY)
    return saved === 'true'
  })

  useEffect(() => {
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(isSidebarCollapsed))
  }, [isSidebarCollapsed])

  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed)

  const handleSignOut = () => {
    signOut()
    navigate('/login')
  }

  const isActive = (path: string) => location.pathname === path
  const isAiOrbitActive = location.pathname.startsWith('/ai-orbit')

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <aside className={clsx(
        'bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300 ease-in-out',
        'fixed lg:static inset-y-0 left-0 z-50',
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        isSidebarCollapsed ? 'lg:w-20' : 'lg:w-64',
        'w-64'
      )}>
        {/* Logo */}
        <div className={clsx(
          "flex items-center border-b border-gray-200 dark:border-gray-700 transition-all duration-300",
          isSidebarCollapsed ? "justify-center px-2 py-4" : "justify-between px-4 py-4"
        )}>
          {!isSidebarCollapsed && (
            <div className="text-2xl font-bold text-primary-500">FOODICS</div>
          )}
          {isSidebarCollapsed && (
            <div className="text-xl font-bold text-primary-500">F</div>
          )}
          <div className="flex items-center gap-1">
            <button
              onClick={toggleSidebar}
              className="hidden lg:flex p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <FoodicsIcon name={isSidebarCollapsed ? "chevron-right" : "chevron-left"} size={20} />
            </button>
            <button
              onClick={closeMobileMenu}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <FoodicsIcon name="close" size={20} />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className={clsx(
          "flex-1 py-4 space-y-1 overflow-y-auto overflow-x-hidden transition-all duration-300",
          isSidebarCollapsed ? "px-2" : "px-4"
        )}>
          {/* Main navigation items */}
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={closeMobileMenu}
              title={isSidebarCollapsed ? item.label : undefined}
              className={clsx(
                'flex items-center rounded-lg font-medium text-sm transition-all duration-200',
                isSidebarCollapsed ? 'justify-center p-3' : 'px-3 py-2',
                isActive(item.path) 
                  ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
              )}
            >
              <span className={clsx("flex-shrink-0", !isSidebarCollapsed && "mr-3")}>
                <FoodicsIcon name={item.icon} size={20} />
              </span>
              {!isSidebarCollapsed && (
                <span className="truncate">{item.label}</span>
              )}
            </Link>
          ))}

          {/* AI Orbit Link */}
          <div className="pt-4">
            <Link
              to="/ai-orbit/assistant"
              onClick={closeMobileMenu}
              title={isSidebarCollapsed ? "AI Orbit" : undefined}
              className={clsx(
                'flex items-center rounded-lg font-medium text-sm transition-all duration-200',
                isSidebarCollapsed ? 'justify-center p-3' : 'px-3 py-2',
                isAiOrbitActive 
                  ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
              )}
            >
              <span className={clsx("flex-shrink-0", !isSidebarCollapsed && "mr-3")}>
                <FoodicsIcon name="rocket-launch" size={20} />
              </span>
              {!isSidebarCollapsed && (
                <span className="truncate">AI Orbit</span>
              )}
            </Link>
          </div>

          {/* Bottom navigation items */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            {bottomNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={closeMobileMenu}
                title={isSidebarCollapsed ? item.label : undefined}
                className={clsx(
                  'flex items-center rounded-lg font-medium text-sm transition-all duration-200',
                  isSidebarCollapsed ? 'justify-center p-3' : 'px-3 py-2',
                  isActive(item.path) 
                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                )}
              >
                <span className={clsx("flex-shrink-0", !isSidebarCollapsed && "mr-3")}>
                  <FoodicsIcon name={item.icon} size={20} />
                </span>
                {!isSidebarCollapsed && (
                  <span className="truncate">{item.label}</span>
                )}
              </Link>
            ))}
          </div>
        </nav>

        {/* User section */}
        <div className={clsx(
          "border-t border-gray-200 dark:border-gray-700 transition-all duration-300",
          isSidebarCollapsed ? "p-2" : "p-4"
        )}>
          {isAuthenticated && user ? (
            <div className={clsx(
              "flex items-center",
              isSidebarCollapsed ? "justify-center" : "justify-between"
            )}>
              {isSidebarCollapsed ? (
                <button
                  onClick={handleSignOut}
                  className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm font-medium hover:bg-primary-600 transition-colors"
                  title={`${user.name || user.email} - Sign out`}
                >
                  {user.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                </button>
              ) : (
                <>
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {user.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[120px]">
                        {user.name || user.email.split('@')[0]}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[120px]">{user.email}</div>
                    </div>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    title="Sign out"
                  >
                    <FoodicsIcon name="logout" size={16} />
                  </button>
                </>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              title={isSidebarCollapsed ? "Sign In" : undefined}
              className={clsx(
                "flex items-center rounded-lg text-sm font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors",
                isSidebarCollapsed ? "justify-center p-3" : "gap-2 px-3 py-2"
              )}
            >
              <FoodicsIcon name="login" size={16} />
              {!isSidebarCollapsed && <span>Sign In</span>}
            </Link>
          )}
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0 lg:ml-0">
        {/* Header bar for AI Orbit */}
        {isAiOrbitActive && (
          <>
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 lg:px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <button
                    onClick={toggleMobileMenu}
                    className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 mr-3"
                  >
                    <FoodicsIcon name="menu" size={20} />
                  </button>
                  <span className="text-primary-500 mr-3"><FoodicsIcon name="rocket-launch" size={24} /></span>
                  <h1 className="text-xl lg:text-2xl font-semibold text-gray-900 dark:text-white">AI Orbit</h1>
                </div>
              </div>
            </div>
            <AIOrbitTabBar />
          </>
        )}

        {/* Non-AI Orbit header */}
        {!isAiOrbitActive && (
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 lg:px-6 py-4 lg:hidden">
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <FoodicsIcon name="menu" size={20} />
            </button>
          </div>
        )}

        {/* Page content */}
        <div className={clsx(
          "flex-1 overflow-auto",
          isAiOrbitActive && "p-4 lg:p-6"
        )}>
          {children}
        </div>
      </main>
    </div>
  )
}

export default Layout 