import { PointsPreview } from '../../types/hitl-previews'
import { HITLCardProps, HITLCardWrapper } from './HITLCard'
import { FoodicsIcon } from '../ui/FoodicsIcon'

export function PointsCard({ preview, status, onApprove, onReject }: HITLCardProps) {
  const pointsPreview = preview as PointsPreview
  const { customer, points, reason, action } = pointsPreview

  const isAward = action === 'award'

  return (
    <HITLCardWrapper preview={preview} status={status} onApprove={onApprove} onReject={onReject}>
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
          isAward 
            ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
            : 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
        }`}>
          <FoodicsIcon name={isAward ? 'add' : 'remove'} size={24} />
        </div>
        
        <div className="flex-1">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Customer
          </p>
          <h4 className="font-semibold text-gray-900 dark:text-white text-lg">
            {customer.name || customer.email || customer.loyalty_number}
          </h4>

          <div className={`mt-3 text-2xl font-bold ${
            isAward ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'
          }`}>
            {isAward ? '+' : '-'}{points.amount.toLocaleString()} points
          </div>

          {(points.current_balance !== undefined || points.new_balance !== undefined) && (
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              {points.current_balance?.toLocaleString()} → {points.new_balance?.toLocaleString()}
            </p>
          )}

          {reason && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Reason: {reason}
            </p>
          )}
        </div>
      </div>
    </HITLCardWrapper>
  )
}
