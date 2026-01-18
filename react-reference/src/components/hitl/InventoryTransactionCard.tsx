import { InventoryTransactionPreview } from '../../types/hitl-previews'
import { HITLCardProps, HITLCardWrapper } from './HITLCard'
import { FoodicsIcon } from '../ui/FoodicsIcon'

export function InventoryTransactionCard({ preview, status, onApprove, onReject }: HITLCardProps) {
  const txPreview = preview as InventoryTransactionPreview
  const { transaction, item, quantity, branch } = txPreview

  const isIn = quantity.direction === 'in'

  return (
    <HITLCardWrapper preview={preview} status={status} onApprove={onApprove} onReject={onReject}>
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          isIn 
            ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
            : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
        }`}>
          <FoodicsIcon name={isIn ? 'arrow-downward' : 'arrow-upward'} size={20} />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 dark:text-white text-lg">
            {item.name || item.sku || 'Item'}
          </h4>
          {branch && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Branch: {branch.name || branch.id}
            </p>
          )}
        </div>
      </div>

      <div className={`mt-3 text-2xl font-bold ${
        isIn ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
      }`}>
        {isIn ? '+' : '-'}{quantity.amount} {item.unit || 'units'}
      </div>

      {(quantity.current_stock !== undefined || quantity.new_stock !== undefined) && (
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
          Stock: {quantity.current_stock?.toLocaleString()} → {quantity.new_stock?.toLocaleString()}
        </p>
      )}

      {transaction.reason && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Reason: {transaction.reason}
        </p>
      )}

      {transaction.reference && (
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          Ref: {transaction.reference}
        </p>
      )}

      <div className="mt-2">
        <span className={`text-xs px-2 py-1 rounded-full uppercase font-medium ${
          transaction.type === 'in' 
            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
            : transaction.type === 'out'
            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
        }`}>
          {transaction.type}
        </span>
      </div>
    </HITLCardWrapper>
  )
}
