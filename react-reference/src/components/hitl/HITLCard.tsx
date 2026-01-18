import { HITLPreview, HITLStatus, OPERATION_STYLES, STATUS_STYLES, getCompletedStatusText } from '../../types/hitl-previews'
import { ProductCard } from './ProductCard'
import { CategoryCard } from './CategoryCard'
import { CustomerCard } from './CustomerCard'
import { PointsCard } from './PointsCard'
import { LoyaltyProgramCard } from './LoyaltyProgramCard'
import { LoyaltyRewardCard } from './LoyaltyRewardCard'
import { PromotionCard } from './PromotionCard'
import { ComboCard } from './ComboCard'
import { ModifierCard } from './ModifierCard'
import { BranchCard } from './BranchCard'
import { SupplierCard } from './SupplierCard'
import { InventoryTransactionCard } from './InventoryTransactionCard'
import { InventoryCountCard } from './InventoryCountCard'
import { GenericCard } from './GenericCard'

export interface HITLCardProps {
  preview: HITLPreview
  status: HITLStatus
  onApprove: () => void
  onReject: (reason?: string) => void
  onGenerateImage?: () => Promise<void>
  generatedImageUrl?: string
}

const CARD_COMPONENTS: Record<string, React.ComponentType<HITLCardProps>> = {
  'product_preview': ProductCard,
  'category_preview': CategoryCard,
  'customer_preview': CustomerCard,
  'points_preview': PointsCard,
  'loyalty_program_preview': LoyaltyProgramCard,
  'loyalty_reward_preview': LoyaltyRewardCard,
  'promotion_preview': PromotionCard,
  'combo_preview': ComboCard,
  'modifier_preview': ModifierCard,
  'branch_preview': BranchCard,
  'supplier_preview': SupplierCard,
  'inventory_transaction_preview': InventoryTransactionCard,
  'inventory_count_preview': InventoryCountCard,
}

export function HITLCard(props: HITLCardProps) {
  const CardComponent = CARD_COMPONENTS[props.preview.type] || GenericCard
  return <CardComponent {...props} />
}

export function HITLCardWrapper({
  preview,
  status,
  onApprove,
  onReject,
  children,
}: Omit<HITLCardProps, 'onGenerateImage' | 'generatedImageUrl'> & { children: React.ReactNode }) {
  const operationStyle = OPERATION_STYLES[preview.operation] || OPERATION_STYLES.create
  const statusStyle = STATUS_STYLES[status]
  
  const statusBorderColor = {
    pending: 'border-amber-300 dark:border-amber-600',
    approved: 'border-green-300 dark:border-green-600',
    rejected: 'border-red-300 dark:border-red-600',
  }[status]

  const statusBgColor = {
    pending: 'bg-amber-50 dark:bg-amber-900/20',
    approved: 'bg-green-50 dark:bg-green-900/20',
    rejected: 'bg-red-50 dark:bg-red-900/20',
  }[status]

  const operationColorClasses = {
    green: 'text-green-600 dark:text-green-400',
    blue: 'text-blue-600 dark:text-blue-400',
    red: 'text-red-600 dark:text-red-400',
    yellow: 'text-yellow-600 dark:text-yellow-400',
    orange: 'text-orange-600 dark:text-orange-400',
    gray: 'text-gray-600 dark:text-gray-400',
  }[operationStyle.color] || 'text-gray-600'

  return (
    <div className={`rounded-xl border-2 ${statusBorderColor} ${statusBgColor} overflow-hidden transition-all duration-300`}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${operationColorClasses} bg-white dark:bg-gray-800`}>
            {status === 'pending' ? operationStyle.statusText : getCompletedStatusText(preview.operation)}
          </span>
          {status !== 'pending' && (
            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
              status === 'approved' 
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            }`}>
              {statusStyle.text}
            </span>
          )}
        </div>
        
        {children}
        
        {status === 'pending' && (
          <div className="flex gap-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => onReject()}
              className="flex-1 px-4 py-2.5 text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/30 
                         rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors font-medium"
            >
              Reject
            </button>
            <button
              onClick={onApprove}
              className="flex-1 px-4 py-2.5 text-white bg-green-600 
                         rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Approve
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export function formatPrice(price?: { amount: number; currency: string }): string {
  if (!price) return ''
  return `${price.currency} ${price.amount.toLocaleString()}`
}
