import { ModifierPreview } from '../../types/hitl-previews'
import { HITLCardProps, HITLCardWrapper, formatPrice } from './HITLCard'
import { FoodicsIcon } from '../ui/FoodicsIcon'

export function ModifierCard({ preview, status, onApprove, onReject }: HITLCardProps) {
  const modifierPreview = preview as ModifierPreview
  const { modifier, product, operation } = modifierPreview

  const isAttachDetach = operation === 'attach' || operation === 'detach'

  return (
    <HITLCardWrapper preview={preview} status={status} onApprove={onApprove} onReject={onReject}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 dark:text-teal-400">
          <FoodicsIcon name="tune" size={20} />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 dark:text-white text-lg">
            {modifier.name}
          </h4>
          {modifier.name_localized && (
            <p className="text-sm text-gray-500 dark:text-gray-400" dir="rtl">
              {modifier.name_localized}
            </p>
          )}
          {modifier.price && (
            <p className="text-lg font-bold text-green-600 dark:text-green-400 mt-1">
              +{formatPrice(modifier.price)}
            </p>
          )}
        </div>
      </div>

      {modifier.reference && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Reference: {modifier.reference}
        </p>
      )}

      {isAttachDetach && product && (
        <div className="mt-3 p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <p className={`text-sm ${operation === 'attach' ? 'text-blue-600' : 'text-orange-600'}`}>
            {operation === 'attach' ? 'Attaching to:' : 'Detaching from:'}
          </p>
          <p className="font-medium text-gray-900 dark:text-white">
            {product.name || product.id}
          </p>
        </div>
      )}

      <div className="mt-2">
        <span className={`text-xs px-2 py-1 rounded-full ${
          modifier.is_active 
            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
            : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
        }`}>
          {modifier.is_active ? 'Active' : 'Inactive'}
        </span>
      </div>
    </HITLCardWrapper>
  )
}
