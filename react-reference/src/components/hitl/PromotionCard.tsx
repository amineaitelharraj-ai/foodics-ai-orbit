import { PromotionPreview } from '../../types/hitl-previews'
import { HITLCardProps, HITLCardWrapper, formatPrice } from './HITLCard'
import { FoodicsIcon } from '../ui/FoodicsIcon'

export function PromotionCard({ preview, status, onApprove, onReject }: HITLCardProps) {
  const promotionPreview = preview as PromotionPreview
  const { promotion, product, category, schedule, operation } = promotionPreview

  return (
    <HITLCardWrapper preview={preview} status={status} onApprove={onApprove} onReject={onReject}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center text-pink-600 dark:text-pink-400">
          <FoodicsIcon name="sell" size={20} />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 dark:text-white text-lg">
            {promotion.name || 'Promotion'}
          </h4>
          {promotion.description && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {promotion.description}
            </p>
          )}
        </div>
      </div>

      {promotion.discount_value && (
        <div className="mt-3">
          <span className="text-lg font-bold text-pink-600 dark:text-pink-400">
            {promotion.discount_value} {promotion.discount_type === 'percentage' ? 'off' : ''}
          </span>
        </div>
      )}

      {product && (
        <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          <span className={operation === 'add_product' ? 'text-green-600' : 'text-red-600'}>
            {operation === 'add_product' ? 'Adding' : 'Removing'} product:
          </span>{' '}
          {product.name || product.id}
          {product.price && ` (${formatPrice(product.price)})`}
        </div>
      )}

      {category && (
        <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          <span className={operation === 'add_category' ? 'text-green-600' : 'text-red-600'}>
            {operation === 'add_category' ? 'Adding' : 'Removing'} category:
          </span>{' '}
          {category.name || category.id}
        </div>
      )}

      {schedule && (
        <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          <FoodicsIcon name="schedule" size={14} className="inline mr-1" />
          {schedule.current_end_date && `Current: ${schedule.current_end_date}`}
          {schedule.new_end_date && ` → New: ${schedule.new_end_date}`}
          {schedule.extension_days && ` (+${schedule.extension_days} days)`}
        </div>
      )}

      <div className="mt-2">
        <span className={`text-xs px-2 py-1 rounded-full ${
          promotion.is_active 
            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
            : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
        }`}>
          {promotion.is_active ? 'Active' : 'Inactive'}
        </span>
      </div>
    </HITLCardWrapper>
  )
}
