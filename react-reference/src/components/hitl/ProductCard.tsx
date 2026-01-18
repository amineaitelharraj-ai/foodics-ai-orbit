import { useState } from 'react'
import { ProductPreview } from '../../types/hitl-previews'
import { HITLCardProps, HITLCardWrapper, formatPrice } from './HITLCard'
import { FoodicsIcon } from '../ui/FoodicsIcon'

export function ProductCard({ preview, status, onApprove, onReject, onGenerateImage, generatedImageUrl }: HITLCardProps) {
  const productPreview = preview as ProductPreview
  const { product, combo_options, modifiers } = productPreview
  
  const imageUrl = generatedImageUrl || product.image_url
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGenerateImage = async () => {
    if (!onGenerateImage) return
    setGenerating(true)
    setError(null)
    try {
      await onGenerateImage()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate image')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <HITLCardWrapper 
      preview={preview} 
      status={status} 
      onApprove={onApprove} 
      onReject={onReject}
    >
      <div className="flex gap-4">
        <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-1 p-2">
              {status === 'pending' && onGenerateImage ? (
                <>
                  <button
                    onClick={handleGenerateImage}
                    disabled={generating}
                    className="text-xs px-2 py-1 bg-primary-600 text-white rounded hover:bg-primary-700 
                               disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    {generating ? (
                      <>
                        <span className="animate-spin">⏳</span>
                        <span>...</span>
                      </>
                    ) : (
                      <>
                        <FoodicsIcon name="photo" size={12} />
                        <span>Generate</span>
                      </>
                    )}
                  </button>
                  {error && (
                    <span className="text-xs text-red-500 text-center">{error}</span>
                  )}
                </>
              ) : (
                <div className="text-gray-400 dark:text-gray-500">
                  <FoodicsIcon name="image" size={32} />
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 dark:text-white text-lg truncate">
            {product.name}
          </h4>
          {product.category && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {product.category.name}
            </p>
          )}
          {product.price && (
            <p className="text-lg font-bold text-primary-600 dark:text-primary-400 mt-1">
              {formatPrice(product.price)}
            </p>
          )}
          {product.description && (
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
              {product.description}
            </p>
          )}
        </div>
      </div>

      {combo_options && combo_options.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Combo Options</p>
          <div className="flex flex-wrap gap-1">
            {combo_options.map((option, i) => (
              <span 
                key={i}
                className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full"
              >
                {option.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {modifiers && modifiers.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Modifiers</p>
          <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-0.5">
            {modifiers.map((mod, i) => (
              <li key={i} className="flex items-center gap-1">
                <span className="text-gray-400">•</span>
                <span>{mod.name}</span>
                {mod.price_delta && (
                  <span className="text-green-600 dark:text-green-400">
                    (+{formatPrice(mod.price_delta)})
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {product.sku && (
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          SKU: {product.sku}
        </div>
      )}
    </HITLCardWrapper>
  )
}
