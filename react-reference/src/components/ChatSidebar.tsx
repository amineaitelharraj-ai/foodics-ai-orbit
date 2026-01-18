import { useState, useMemo } from 'react'
import { Session } from '../services/session-storage'
import { FoodicsIcon } from './ui/FoodicsIcon'

const INITIAL_CHATS_PER_DAY = 3

interface ChatSidebarProps {
  sessions: Session[]
  currentSessionId: string | null
  onNewSession: () => void
  onSelectSession: (sessionId: string) => void
  onDeleteSession: (sessionId: string) => void
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}

interface DateSectionProps {
  dateGroup: string
  sessions: Session[]
  currentSessionId: string | null
  onSelectSession: (sessionId: string) => void
  onDeleteSession: (sessionId: string) => void
}

function DateSection({
  dateGroup,
  sessions,
  currentSessionId,
  onSelectSession,
  onDeleteSession
}: DateSectionProps) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_CHATS_PER_DAY)
  const [hoveredSession, setHoveredSession] = useState<string | null>(null)

  const visibleSessions = sessions.slice(0, visibleCount)
  const hasMore = visibleCount < sessions.length
  const remainingCount = sessions.length - visibleCount
  const isExpanded = visibleCount > INITIAL_CHATS_PER_DAY

  const handleLoadMore = () => {
    setVisibleCount(prev => Math.min(prev + INITIAL_CHATS_PER_DAY, sessions.length))
  }

  const handleShowLess = () => {
    setVisibleCount(INITIAL_CHATS_PER_DAY)
  }

  return (
    <div className="mb-4">
      <div className="flex items-center gap-1.5 px-2 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
        <FoodicsIcon name="schedule" size={12} />
        {dateGroup}
      </div>
      <div className="space-y-1">
        {visibleSessions.map(session => (
          <div
            key={session.id}
            onMouseEnter={() => setHoveredSession(session.id)}
            onMouseLeave={() => setHoveredSession(null)}
            className={`
              group relative flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors
              ${currentSessionId === session.id 
                ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
              }
            `}
            onClick={() => onSelectSession(session.id)}
          >
            <FoodicsIcon name="chat" size={16} className="flex-shrink-0" />
            <span className="flex-1 text-sm truncate">
              {session.title || 'New conversation'}
            </span>
            {(hoveredSession === session.id || currentSessionId === session.id) && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDeleteSession(session.id)
                }}
                className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                title="Delete chat"
              >
                <FoodicsIcon name="delete" size={14} />
              </button>
            )}
          </div>
        ))}
      </div>

      {(hasMore || isExpanded) && (
        <div className="flex gap-2 mt-2">
          {hasMore && (
            <button
              onClick={handleLoadMore}
              className="flex-1 py-1.5 text-xs text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300
                         hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded transition-colors flex items-center justify-center gap-1"
            >
              <FoodicsIcon name="expand-more" size={12} />
              Load More ({remainingCount} more)
            </button>
          )}
          {isExpanded && (
            <button
              onClick={handleShowLess}
              className="flex-1 py-1.5 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300
                         hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors flex items-center justify-center gap-1"
            >
              <FoodicsIcon name="expand-less" size={12} />
              Show Less
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export function ChatSidebar({
  sessions,
  currentSessionId,
  onNewSession,
  onSelectSession,
  onDeleteSession,
  isCollapsed = false,
  onToggleCollapse
}: ChatSidebarProps) {
  const formatDate = (date: Date | string) => {
    const now = new Date()
    const sessionDate = date instanceof Date ? date : new Date(date)
    
    if (isNaN(sessionDate.getTime())) {
      return 'Recent'
    }
    
    const diffDays = Math.floor((now.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) {
      return 'Today'
    } else if (diffDays === 1) {
      return 'Yesterday'
    } else if (diffDays < 7) {
      return `${diffDays} days ago`
    } else {
      return sessionDate.toLocaleDateString()
    }
  }

  const groupedSessions = useMemo(() => {
    const groups: { [key: string]: Session[] } = {}
    
    sessions.forEach(session => {
      const dateKey = formatDate(session.updatedAt)
      if (!groups[dateKey]) {
        groups[dateKey] = []
      }
      groups[dateKey].push(session)
    })
    
    return groups
  }, [sessions])

  if (isCollapsed) {
    return (
      <div className="w-12 h-full bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col items-center py-4">
        <button
          onClick={onToggleCollapse}
          className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 mb-4"
          title="Expand sidebar"
        >
          <FoodicsIcon name="chevron-right" size={20} />
        </button>
        <button
          onClick={onNewSession}
          className="p-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700"
          title="New chat"
        >
          <FoodicsIcon name="add" size={20} />
        </button>
      </div>
    )
  }

  return (
    <div className="w-64 h-full bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h2 className="font-semibold text-gray-900 dark:text-white">Chat History</h2>
        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
          title="Collapse sidebar"
        >
          <FoodicsIcon name="chevron-left" size={16} />
        </button>
      </div>

      <div className="p-3">
        <button
          onClick={onNewSession}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors font-medium"
        >
          <FoodicsIcon name="add" size={16} />
          New Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-4">
        {sessions.length === 0 ? (
          <div className="text-center py-8 px-4">
            <div className="text-gray-400 mb-3 flex justify-center"><FoodicsIcon name="chat" size={40} /></div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No chat history yet. Start a new conversation!
            </p>
          </div>
        ) : (
          Object.entries(groupedSessions).map(([dateGroup, groupSessions]) => (
            <DateSection
              key={dateGroup}
              dateGroup={dateGroup}
              sessions={groupSessions}
              currentSessionId={currentSessionId}
              onSelectSession={onSelectSession}
              onDeleteSession={onDeleteSession}
            />
          ))
        )}
      </div>
    </div>
  )
}
