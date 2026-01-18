import { useState } from 'react'
import { FoodicsIcon } from './ui/FoodicsIcon'

interface QueryClarificationModalProps {
  sessionId: string
  toolName: string
  message: string
  suggestedFilters: Array<{name: string; description: string}>
  onProceed: () => void
  onRefine: (refinement: string) => void
  onCancel: () => void
}

export const QueryClarificationModal: React.FC<QueryClarificationModalProps> = ({
  toolName,
  message,
  suggestedFilters,
  onProceed,
  onRefine,
  onCancel,
}) => {
  const [refinement, setRefinement] = useState('')

  const formatToolName = (name: string) => {
    return name.replace('Foodics___', '').replace(/_/g, ' ')
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 shadow-xl animate-in zoom-in-95 duration-200">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <span className="text-xl">📊</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Quick Question
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {formatToolName(toolName)}
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <FoodicsIcon name="close" size={20} />
          </button>
        </div>

        <p className="text-gray-700 dark:text-gray-300 mb-4">
          {message}
        </p>

        {suggestedFilters.length > 0 && (
          <div className="mb-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              You can filter by:
            </p>
            <ul className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
              {suggestedFilters.map((f) => (
                <li key={f.name} className="flex gap-2">
                  <span className="text-amber-500">•</span>
                  <span><strong>{f.name}:</strong> {f.description}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Refine your query (optional):
          </label>
          <textarea
            value={refinement}
            onChange={(e) => setRefinement(e.target.value)}
            placeholder="e.g., only active products, limit to 50, in the burgers category"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       placeholder:text-gray-400 dark:placeholder:text-gray-500
                       resize-none"
            rows={3}
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 text-gray-700 dark:text-gray-300
                       bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200
                       dark:hover:bg-gray-600 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onProceed}
            className="flex-1 px-4 py-2.5 text-white bg-gray-600 rounded-lg
                       hover:bg-gray-700 transition-colors font-medium"
          >
            Get All
          </button>
          <button
            onClick={() => onRefine(refinement)}
            disabled={!refinement.trim()}
            className="flex-1 px-4 py-2.5 text-white bg-blue-600 rounded-lg
                       hover:bg-blue-700 transition-colors disabled:opacity-50
                       disabled:cursor-not-allowed font-medium"
          >
            Refine
          </button>
        </div>
      </div>
    </div>
  )
}
