import { ComboPreview } from '../../types/hitl-previews'
import { HITLCardProps, HITLCardWrapper, formatPrice } from './HITLCard'
import { FoodicsIcon } from '../ui/FoodicsIcon'

export function ComboCard({ preview, status, onApprove, onReject }: HITLCardProps) {
  const comboPreview = preview as ComboPreview
  const { combo, product, modifier, operation } = comboPreview

  return (
    <HITLCardWrapper preview={preview} status={status} onApprove={onApprove} onReject={onReject}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
          <FoodicsIcon name="layers" size={20} />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 dark:text-white text-lg">
            {combo.name || 'Combo'}
          </h4>
          {combo.description && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {combo.description}
            </p>
          )}
          {combo.price && (
            <p className="text-lg font-bold text-primary-600 dark:text-primary-400 mt-1">
              {formatPrice(combo.price)}
            </p>
          )}
        </div>
      </div>

      {product && (
        <div className="mt-3 p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
            {operation === 'add_product' ? 'Adding' : operation === 'remove_product' ? 'Removing' : 'Updating'}:
          </p>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {product.name || product.id}
            </span>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              {product.quantity !== undefined && (
                <span>qty: {product.quantity}</span>
              )}
              {product.price && (
                <span>{formatPrice(product.price)}</span>
              )}
            </div>
          </div>
        </div>
      )}

      {modifier && (
        <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          <span className={operation === 'add_modifier' ? 'text-green-600' : 'text-red-600'}>
            {operation === 'add_modifier' ? 'Adding modifier:' : 'Removing modifier:'}
          </span>{' '}
          {modifier.name || modifier.id}
          {modifier.price && ` (${formatPrice(modifier.price)})`}
        </div>
      )}

      <div className="mt-2">
        <span className={`text-xs px-2 py-1 rounded-full ${
          combo.is_active 
            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
            : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
        }`}>
          {combo.is_active ? 'Active' : 'Inactive'}
        </span>
      </div>
    </HITLCardWrapper>
  )
}
