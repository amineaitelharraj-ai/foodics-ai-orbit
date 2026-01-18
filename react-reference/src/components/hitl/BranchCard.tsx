import { BranchPreview } from '../../types/hitl-previews'
import { HITLCardProps, HITLCardWrapper } from './HITLCard'
import { FoodicsIcon } from '../ui/FoodicsIcon'

export function BranchCard({ preview, status, onApprove, onReject }: HITLCardProps) {
  const branchPreview = preview as BranchPreview
  const { branch } = branchPreview

  return (
    <HITLCardWrapper preview={preview} status={status} onApprove={onApprove} onReject={onReject}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
          <FoodicsIcon name="store" size={20} />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 dark:text-white text-lg">
            {branch.name}
          </h4>
          {branch.name_localized && (
            <p className="text-sm text-gray-500 dark:text-gray-400" dir="rtl">
              {branch.name_localized}
            </p>
          )}
        </div>
      </div>

      <div className="mt-3 space-y-1 text-sm text-gray-600 dark:text-gray-300">
        {branch.phone && (
          <p className="flex items-center gap-2">
            <FoodicsIcon name="phone" size={14} />
            {branch.phone}
          </p>
        )}
        {branch.address && (
          <p className="flex items-start gap-2">
            <FoodicsIcon name="location-on" size={14} className="mt-0.5" />
            {branch.address}
          </p>
        )}
        {branch.reference && (
          <p className="text-gray-500 dark:text-gray-400">
            Reference: {branch.reference}
          </p>
        )}
      </div>

      <div className="mt-2">
        <span className={`text-xs px-2 py-1 rounded-full ${
          branch.is_active 
            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
            : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
        }`}>
          {branch.is_active ? 'Active' : 'Inactive'}
        </span>
      </div>
    </HITLCardWrapper>
  )
}
