import { CategoryPreview } from '../../types/hitl-previews'
import { HITLCardProps, HITLCardWrapper } from './HITLCard'

export function CategoryCard({ preview, status, onApprove, onReject }: HITLCardProps) {
  const categoryPreview = preview as CategoryPreview
  const { category } = categoryPreview

  return (
    <HITLCardWrapper preview={preview} status={status} onApprove={onApprove} onReject={onReject}>
      <div className="flex items-start gap-3">
        {category.color && (
          <div 
            className="w-8 h-8 rounded-lg flex-shrink-0"
            style={{ backgroundColor: category.color }}
          />
        )}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 dark:text-white text-lg">
            {category.name}
          </h4>
          {category.name_localized && (
            <p className="text-sm text-gray-500 dark:text-gray-400" dir="rtl">
              {category.name_localized}
            </p>
          )}
          {category.reference && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Reference: {category.reference}
            </p>
          )}
          {category.parent && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Parent: {category.parent.name || category.parent.id}
            </p>
          )}
        </div>
      </div>
    </HITLCardWrapper>
  )
}
