import { useState } from 'react'

interface MessageFeedbackProps {
  messageId: string
  sessionId: string | null
  token?: string
  onFeedback?: (messageId: string, type: 'positive' | 'negative') => void
}

const POSITIVE_SUGGESTIONS = [
  "Accurate info",
  "Easy to follow",
  "Very helpful",
  "Saved me time",
  "Great insights",
]

const NEGATIVE_SUGGESTIONS = [
  "Incorrect info",
  "Didn't understand",
  "Too slow",
  "Missing details",
  "Not what I asked",
  "Confusing",
]

export function MessageFeedback({ messageId, sessionId, token, onFeedback }: MessageFeedbackProps) {
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false)
  const [showPopup, setShowPopup] = useState(false)
  const [feedbackType, setFeedbackType] = useState<'positive' | 'negative' | null>(null)
  const [selectedSuggestions, setSelectedSuggestions] = useState<string[]>([])
  const [customComment, setCustomComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleFeedbackClick = (type: 'positive' | 'negative') => {
    setFeedbackType(type)
    setSelectedSuggestions([])
    setCustomComment('')
    setShowPopup(true)
  }

  const toggleSuggestion = (suggestion: string) => {
    setSelectedSuggestions(prev =>
      prev.includes(suggestion)
        ? prev.filter(s => s !== suggestion)
        : [...prev, suggestion]
    )
  }

  const submitFeedback = async () => {
    if (isSubmitting) return
    
    setIsSubmitting(true)
    
    try {
      const commentParts = [...selectedSuggestions]
      if (customComment.trim()) {
        commentParts.push(customComment.trim())
      }
      const comment = commentParts.join('; ')

      const apiUrl = import.meta.env.VITE_CHAT_API_URL
      
      if (apiUrl && token && sessionId) {
        const response = await fetch(`${apiUrl}/feedback`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            session_id: sessionId,
            message_id: messageId,
            rating: feedbackType,
            comment: comment || undefined,
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to submit feedback')
        }

        const data = await response.json()
        console.log('Feedback saved:', data.feedback_id)
      } else {
        console.log(`Feedback: ${feedbackType} for message ${messageId} (API not configured)`)
      }
      
      if (onFeedback && feedbackType) {
        onFeedback(messageId, feedbackType)
      }

      setShowPopup(false)
      setFeedbackSubmitted(true)
    } catch (err) {
      console.error('Failed to submit feedback:', err)
      setShowPopup(false)
      setFeedbackSubmitted(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (feedbackSubmitted) {
    return (
      <div className="flex items-center gap-1 text-xs text-gray-400 mt-2">
        <span>Thanks for your feedback!</span>
      </div>
    )
  }

  return (
    <>
      <div className="flex items-center gap-1 mt-2">
        <span className="text-xs text-gray-400 dark:text-gray-500 mr-1">Helpful?</span>
        <button
          onClick={() => handleFeedbackClick('positive')}
          className="p-1 rounded hover:bg-green-100 dark:hover:bg-green-900/30 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
          title="Good response"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
          </svg>
        </button>
        <button
          onClick={() => handleFeedbackClick('negative')}
          className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
          title="Poor response"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
          </svg>
        </button>
      </div>

      {showPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {feedbackType === 'positive'
                ? 'What did you like about this response?'
                : 'What went wrong?'}
            </h3>

            <div className="flex flex-wrap gap-2 mb-4">
              {(feedbackType === 'positive' ? POSITIVE_SUGGESTIONS : NEGATIVE_SUGGESTIONS).map(
                (suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => toggleSuggestion(suggestion)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      selectedSuggestions.includes(suggestion)
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {suggestion}
                  </button>
                )
              )}
            </div>

            <textarea
              value={customComment}
              onChange={(e) => setCustomComment(e.target.value)}
              placeholder={
                feedbackType === 'positive'
                  ? 'Add more details (optional)...'
                  : 'Tell us more (optional)...'
              }
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              rows={3}
            />

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setShowPopup(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={submitFeedback}
                disabled={isSubmitting}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
