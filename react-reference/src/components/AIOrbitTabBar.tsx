import { NavLink } from 'react-router-dom';
import clsx from 'clsx';
import { FoodicsIcon } from './ui/FoodicsIcon';

const aiOrbitTabs = [
  { name: 'Assistant', path: '/ai-orbit/assistant', icon: 'chat' },
  { name: 'Insights', path: '/ai-orbit/insights', icon: 'lightbulb' },
  { name: 'InventoryGuru', path: '/ai-orbit/inventory-guru', icon: 'inventory' },
  { name: 'Say and Serve', path: '/ai-orbit/say-and-serve', icon: 'mic' },
  { name: 'PlatStudio', path: '/ai-orbit/plat-studio', icon: 'layers' },
];

export function AIOrbitTabBar() {
  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="px-4">
        <nav className="flex space-x-1 overflow-x-auto scrollbar-hide" aria-label="AI Orbit tabs">
          {aiOrbitTabs.map((tab) => (
            <NavLink
              key={tab.path}
              to={tab.path}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors',
                  isActive
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                )
              }
            >
              <FoodicsIcon name={tab.icon} size={16} />
              <span className="hidden sm:inline">{tab.name}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
