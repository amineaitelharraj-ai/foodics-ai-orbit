import { useState } from 'react'

interface RegenerateButtonProps {
  onRegenerate: () => void
  disabled?: boolean
}

export function RegenerateButton({ onRegenerate, disabled }: RegenerateButtonProps) {
  const [isRegenerating, setIsRegenerating] = useState(false)

  const handleClick = async () => {
    if (isRegenerating || disabled) return
    
    setIsRegenerating(true)
    try {
      await onRegenerate()
    } finally {
      setIsRegenerating(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={isRegenerating || disabled}
      className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
      title="Regenerate response"
    >
      <svg 
        className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
        />
      </svg>
      {isRegenerating ? 'Regenerating...' : 'Regenerate'}
    </button>
  )
}
