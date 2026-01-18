import { useState } from 'react'
import { Modal } from './ui/Modal'
import { Button } from './ui/Button'
import { AlertTriangle, Check, X } from 'lucide-react'

interface ApprovalModalProps {
  isOpen: boolean
  onApprove: () => void
  onReject: (reason?: string) => void
  action: string
  toolName: string
  preview: unknown
  arguments: Record<string, unknown>
}

export function ApprovalModal({
  isOpen,
  onApprove,
  onReject,
  action,
  toolName,
  preview,
  arguments: args
}: ApprovalModalProps) {
  const [rejectReason, setRejectReason] = useState('')
  const [showRejectForm, setShowRejectForm] = useState(false)

  const handleReject = () => {
    onReject(rejectReason || undefined)
    setRejectReason('')
    setShowRejectForm(false)
  }

  const handleApprove = () => {
    onApprove()
    setRejectReason('')
    setShowRejectForm(false)
  }

  const handleBack = () => {
    setShowRejectForm(false)
    setRejectReason('')
  }

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={() => {}}
      title="Confirm Action"
      className="max-w-lg"
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
          <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
          <p className="text-sm text-amber-800 dark:text-amber-200">
            The assistant wants to perform an action that requires your approval.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium">
            {toolName}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {action}
          </span>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 font-mono">
            {typeof preview === 'string' ? preview : JSON.stringify(preview, null, 2)}
          </pre>
        </div>

        <details className="text-sm">
          <summary className="cursor-pointer text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
            View raw arguments
          </summary>
          <pre className="mt-2 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-auto text-xs font-mono text-gray-600 dark:text-gray-400">
            {JSON.stringify(args, null, 2)}
          </pre>
        </details>

        {showRejectForm && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Rejection reason (optional)
            </label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              rows={2}
              placeholder="Why are you rejecting this action?"
            />
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          {!showRejectForm ? (
            <>
              <Button 
                variant="outline" 
                onClick={() => setShowRejectForm(true)}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Reject
              </Button>
              <Button 
                variant="primary" 
                onClick={handleApprove}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              >
                <Check className="h-4 w-4" />
                Approve
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={handleBack}>
                Back
              </Button>
              <Button 
                variant="danger" 
                onClick={handleReject}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Confirm Rejection
              </Button>
            </>
          )}
        </div>
      </div>
    </Modal>
  )
}
