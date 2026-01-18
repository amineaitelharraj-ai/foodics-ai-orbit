import { InventoryCountPreview } from '../../types/hitl-previews'
import { HITLCardProps, HITLCardWrapper } from './HITLCard'
import { FoodicsIcon } from '../ui/FoodicsIcon'

export function InventoryCountCard({ preview, status, onApprove, onReject }: HITLCardProps) {
  const countPreview = preview as InventoryCountPreview
  const { count, items, branch } = countPreview

  return (
    <HITLCardWrapper preview={preview} status={status} onApprove={onApprove} onReject={onReject}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 dark:text-violet-400">
          <FoodicsIcon name="inventory" size={20} />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 dark:text-white text-lg">
            {count.reference || 'Stock Count'}
          </h4>
          {branch && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Branch: {branch.name || branch.id}
            </p>
          )}
          {count.date && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Date: {count.date}
            </p>
          )}
        </div>
      </div>

      {count.notes && (
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
          {count.notes}
        </p>
      )}

      {items && items.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
            Items ({items.length})
          </p>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {items.map((item, i) => {
              const diff = (item.counted_quantity ?? 0) - (item.expected_quantity ?? 0)
              const hasDiff = diff !== 0
              return (
                <div key={i} className="flex items-center justify-between text-sm p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <span className="text-gray-900 dark:text-white font-medium truncate">
                    {item.name || item.id}
                  </span>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-gray-500">
                      Exp: {item.expected_quantity}
                    </span>
                    <span className="text-gray-500">
                      Count: {item.counted_quantity}
                    </span>
                    {hasDiff && (
                      <span className={`font-semibold ${diff > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ({diff > 0 ? '+' : ''}{diff})
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </HITLCardWrapper>
  )
}
