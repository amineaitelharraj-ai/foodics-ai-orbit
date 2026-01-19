/**
 * Image Generation Service
 * Generates product images using AI image generation APIs
 */

export interface ImageGenerationOptions {
  prompt: string;
  width?: number;
  height?: number;
  style?: 'realistic' | 'product' | 'artistic';
}

export interface ImageGenerationResult {
  url: string;
  prompt: string;
}

/**
 * Generate a product image using AI
 * This connects to a backend proxy that handles the actual image generation
 */
export async function generateProductImage(
  productName: string,
  category?: string,
  description?: string,
  token?: string
): Promise<string> {
  // Build a descriptive prompt for the product image
  const promptParts: string[] = [
    'Professional product photography',
    productName,
  ];

  if (category) {
    promptParts.push(`${category} category`);
  }

  if (description) {
    promptParts.push(description.slice(0, 100));
  }

  promptParts.push(
    'clean white background',
    'studio lighting',
    'high quality',
    'food photography',
    'appetizing',
    'commercial style'
  );

  const prompt = promptParts.join(', ');

  // Get the API URL from environment
  const apiUrl = getImageApiUrl();

  if (!apiUrl) {
    throw new Error('Image generation API URL not configured');
  }

  try {
    const response = await fetch(`${apiUrl}/generate-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        prompt,
        width: 512,
        height: 512,
        style: 'product',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Image generation failed: ${response.status} - ${errorText}`);
    }

    const result = (await response.json()) as { url?: string; imageUrl?: string; error?: string };

    if (result.error) {
      throw new Error(result.error);
    }

    const imageUrl = result.url || result.imageUrl;
    if (!imageUrl) {
      throw new Error('No image URL in response');
    }

    return imageUrl;
  } catch (error) {
    console.error('Image generation error:', error);
    throw error;
  }
}

/**
 * Generate a placeholder image URL for development/fallback
 */
export function getPlaceholderImageUrl(
  productName: string,
  width = 200,
  height = 200
): string {
  // Use a simple placeholder service
  const encodedName = encodeURIComponent(productName.slice(0, 20));
  return `https://via.placeholder.com/${width}x${height}.png?text=${encodedName}`;
}

/**
 * Check if image generation is available
 */
export function isImageGenerationAvailable(): boolean {
  return Boolean(getImageApiUrl());
}

/**
 * Get the image generation API URL from environment
 */
function getImageApiUrl(): string {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return (
      (import.meta.env.VITE_IMAGE_API_URL as string) ||
      (import.meta.env.VITE_LABEEB_API_URL as string) ||
      ''
    );
  }
  return '';
}

export const imageGenerationService = {
  generateProductImage,
  getPlaceholderImageUrl,
  isImageGenerationAvailable,
};
