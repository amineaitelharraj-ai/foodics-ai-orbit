import { HITLCardProps, HITLCardWrapper } from './HITLCard'
import { FoodicsIcon } from '../ui/FoodicsIcon'

export function GenericCard({ preview, status, onApprove, onReject }: HITLCardProps) {
  return (
    <HITLCardWrapper preview={preview} status={status} onApprove={onApprove} onReject={onReject}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-400">
          <FoodicsIcon name="info" size={20} />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 dark:text-white text-lg capitalize">
            {preview.type.replace('_preview', '').replace(/_/g, ' ')}
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
            {preview.operation.replace(/_/g, ' ')}
          </p>
        </div>
      </div>

      <div className="mt-3 p-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-sm font-mono text-gray-600 dark:text-gray-300 overflow-x-auto">
        <pre className="whitespace-pre-wrap">
          {JSON.stringify(preview, null, 2)}
        </pre>
      </div>
    </HITLCardWrapper>
  )
}
