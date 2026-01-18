import { CustomerPreview } from '../../types/hitl-previews'
import { HITLCardProps, HITLCardWrapper, formatPrice } from './HITLCard'
import { FoodicsIcon } from '../ui/FoodicsIcon'

export function CustomerCard({ preview, status, onApprove, onReject }: HITLCardProps) {
  const customerPreview = preview as CustomerPreview
  const { customer, tag, house_account, operation } = customerPreview

  const isBlacklistOperation = operation === 'blacklist' || operation === 'unblacklist'

  return (
    <HITLCardWrapper preview={preview} status={status} onApprove={onApprove} onReject={onReject}>
      <div className={`${isBlacklistOperation && operation === 'blacklist' ? 'border-l-4 border-red-500 pl-3' : ''}`}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400">
            <FoodicsIcon name="person" size={24} />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 dark:text-white text-lg">
              {customer.name}
            </h4>
            {customer.email && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {customer.email}
              </p>
            )}
          </div>
        </div>

        {customer.phone && (
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
            Phone: {customer.phone}
          </p>
        )}

        {customer.loyalty_number && (
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Loyalty #: {customer.loyalty_number}
          </p>
        )}

        {tag && (
          <div className="mt-2">
            <span className={`text-xs px-2 py-1 rounded-full ${
              operation === 'add_tag' 
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            }`}>
              {operation === 'add_tag' ? 'Adding tag: ' : 'Removing tag: '}
              {tag.name}
            </span>
          </div>
        )}

        {house_account && (
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            {house_account.balance && (
              <p>Balance: {formatPrice(house_account.balance)}</p>
            )}
            {house_account.credit_limit && (
              <p>Credit Limit: {formatPrice(house_account.credit_limit)}</p>
            )}
          </div>
        )}

        {customer.is_blacklisted !== undefined && (
          <p className={`text-sm mt-2 ${customer.is_blacklisted ? 'text-red-600' : 'text-green-600'}`}>
            {customer.is_blacklisted ? '⚠️ Currently blacklisted' : '✓ Not blacklisted'}
          </p>
        )}
      </div>
    </HITLCardWrapper>
  )
}
