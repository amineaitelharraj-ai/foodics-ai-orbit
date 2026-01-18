const IMAGE_API_URL = 'https://49891xz0p8.execute-api.eu-west-1.amazonaws.com/dev/v1/media/generate-image'

export type ImageStyle = 'food_photography' | 'minimalist' | 'rustic' | 'elegant'

export interface GenerateImageRequest {
  prompt: string
  style?: ImageStyle
}

export interface GenerateImageResponse {
  success: boolean
  data?: {
    image_url: string
    style: ImageStyle
    expires_in: number
  }
  error?: string
  message?: string
}

export async function generateProductImage(
  productName: string,
  token: string,
  style: ImageStyle = 'food_photography'
): Promise<string> {
  const response = await fetch(IMAGE_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: `Professional food photo of ${productName}, appetizing presentation, high quality`,
      style,
    }),
  })

  const data: GenerateImageResponse = await response.json()
  
  if (!data.success || !data.data?.image_url) {
    throw new Error(data.message || 'Failed to generate image')
  }
  
  return data.data.image_url
}

export async function checkImageApiHealth(): Promise<boolean> {
  try {
    const response = await fetch('https://49891xz0p8.execute-api.eu-west-1.amazonaws.com/dev/health')
    const data = await response.json()
    return data.success && data.data?.status === 'healthy'
  } catch {
    return false
  }
}
