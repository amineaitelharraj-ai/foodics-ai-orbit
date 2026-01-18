import { LoyaltyRewardPreview } from '../../types/hitl-previews'
import { HITLCardProps, HITLCardWrapper, formatPrice } from './HITLCard'
import { FoodicsIcon } from '../ui/FoodicsIcon'

export function LoyaltyRewardCard({ preview, status, onApprove, onReject }: HITLCardProps) {
  const rewardPreview = preview as LoyaltyRewardPreview
  const { reward, program } = rewardPreview

  return (
    <HITLCardWrapper preview={preview} status={status} onApprove={onApprove} onReject={onReject}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
          <FoodicsIcon name="card-giftcard" size={20} />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 dark:text-white text-lg">
            {reward.name}
          </h4>
          {program && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Program: {program.name || program.id}
            </p>
          )}
        </div>
      </div>

      {reward.description && (
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
          {reward.description}
        </p>
      )}

      <div className="mt-3 flex flex-wrap gap-3">
        <div className="text-sm">
          <span className="text-gray-500 dark:text-gray-400">Cost: </span>
          <span className="font-semibold text-purple-600 dark:text-purple-400">
            {reward.points_cost.toLocaleString()} points
          </span>
        </div>
        {reward.value && (
          <div className="text-sm">
            <span className="text-gray-500 dark:text-gray-400">Value: </span>
            <span className="font-semibold text-green-600 dark:text-green-400">
              {formatPrice(reward.value)}
            </span>
          </div>
        )}
      </div>

      <div className="mt-2 flex gap-2">
        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
          {reward.reward_type}
        </span>
        <span className={`text-xs px-2 py-1 rounded-full ${
          reward.is_active 
            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
            : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
        }`}>
          {reward.is_active ? 'Active' : 'Inactive'}
        </span>
      </div>
    </HITLCardWrapper>
  )
}
