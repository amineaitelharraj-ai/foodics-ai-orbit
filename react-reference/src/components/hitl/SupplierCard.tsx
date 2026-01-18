import { SupplierPreview } from '../../types/hitl-previews'
import { HITLCardProps, HITLCardWrapper, formatPrice } from './HITLCard'
import { FoodicsIcon } from '../ui/FoodicsIcon'

export function SupplierCard({ preview, status, onApprove, onReject }: HITLCardProps) {
  const supplierPreview = preview as SupplierPreview
  const { supplier, item, operation } = supplierPreview

  const isAttachDetach = operation === 'attach' || operation === 'detach'

  return (
    <HITLCardWrapper preview={preview} status={status} onApprove={onApprove} onReject={onReject}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
          <FoodicsIcon name="local-shipping" size={20} />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 dark:text-white text-lg">
            {supplier.name}
          </h4>
          {supplier.code && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Code: {supplier.code}
            </p>
          )}
        </div>
      </div>

      <div className="mt-3 space-y-1 text-sm text-gray-600 dark:text-gray-300">
        {supplier.email && (
          <p className="flex items-center gap-2">
            <FoodicsIcon name="mail" size={14} />
            {supplier.email}
          </p>
        )}
        {supplier.phone && (
          <p className="flex items-center gap-2">
            <FoodicsIcon name="phone" size={14} />
            {supplier.phone}
          </p>
        )}
        {supplier.address && (
          <p className="flex items-start gap-2">
            <FoodicsIcon name="location-on" size={14} className="mt-0.5" />
            {supplier.address}
          </p>
        )}
      </div>

      {isAttachDetach && item && (
        <div className="mt-3 p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <p className={`text-sm ${operation === 'attach' ? 'text-blue-600' : 'text-orange-600'}`}>
            {operation === 'attach' ? 'Attaching item:' : 'Detaching item:'}
          </p>
          <div className="flex items-center justify-between mt-1">
            <span className="font-medium text-gray-900 dark:text-white">
              {item.name || item.id}
            </span>
            {item.price && (
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {formatPrice(item.price)}
              </span>
            )}
          </div>
        </div>
      )}

      <div className="mt-2">
        <span className={`text-xs px-2 py-1 rounded-full ${
          supplier.is_active 
            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
            : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
        }`}>
          {supplier.is_active ? 'Active' : 'Inactive'}
        </span>
      </div>
    </HITLCardWrapper>
  )
}
