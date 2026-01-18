import { LoyaltyProgramPreview } from '../../types/hitl-previews'
import { HITLCardProps, HITLCardWrapper, formatPrice } from './HITLCard'
import { FoodicsIcon } from '../ui/FoodicsIcon'

export function LoyaltyProgramCard({ preview, status, onApprove, onReject }: HITLCardProps) {
  const loyaltyPreview = preview as LoyaltyProgramPreview
  const { program, points_config, expiration } = loyaltyPreview

  return (
    <HITLCardWrapper preview={preview} status={status} onApprove={onApprove} onReject={onReject}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
          <FoodicsIcon name="loyalty" size={20} />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 dark:text-white text-lg">
            {program.name}
          </h4>
          {program.description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {program.description}
            </p>
          )}
        </div>
      </div>

      {points_config && (
        <ul className="mt-3 space-y-1 text-sm text-gray-600 dark:text-gray-300">
          {points_config.points_per_currency !== undefined && points_config.min_spend && (
            <li>• {points_config.points_per_currency} point per {formatPrice(points_config.min_spend)} spent</li>
          )}
          {points_config.currency_per_point !== undefined && (
            <li>• 1 point = {points_config.currency_per_point} in value</li>
          )}
        </ul>
      )}

      {expiration && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          {expiration.days && `Points expire in ${expiration.days} days`}
          {expiration.date && `Expires: ${expiration.date}`}
        </p>
      )}

      <div className="mt-2">
        <span className={`text-xs px-2 py-1 rounded-full ${
          program.is_active 
            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
            : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
        }`}>
          {program.is_active ? 'Active' : 'Inactive'}
        </span>
      </div>
    </HITLCardWrapper>
  )
}
