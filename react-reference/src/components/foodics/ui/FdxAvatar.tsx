import React, { forwardRef, useState } from 'react';
import { cn } from '@/lib/utils';

export interface FdxAvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Avatar size
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  /**
   * Image source URL
   */
  src?: string;
  /**
   * Alt text for image
   */
  alt?: string;
  /**
   * Name to generate initials from
   */
  name?: string;
  /**
   * Custom initials (overrides name-based initials)
   */
  initials?: string;
  /**
   * Custom background color
   */
  color?: string;
  /**
   * Avatar shape
   */
  shape?: 'circle' | 'square' | 'rounded';
  /**
   * Whether to show a border
   */
  bordered?: boolean;
  /**
   * Fallback icon when no image or initials
   */
  fallbackIcon?: React.ReactNode;
  /**
   * Loading state
   */
  loading?: boolean;
  /**
   * Callback when image loads
   */
  onLoad?: () => void;
  /**
   * Callback when image fails to load
   */
  onError?: () => void;
}

const FdxAvatar = forwardRef<HTMLDivElement, FdxAvatarProps>(
  ({ 
    className,
    size = 'md',
    src,
    alt,
    name,
    initials,
    color,
    shape = 'circle',
    bordered = false,
    fallbackIcon,
    loading = false,
    onLoad,
    onError,
    ...props 
  }, ref) => {
    const [imageError, setImageError] = useState(false);
    const [imageLoading, setImageLoading] = useState(!!src);

    const sizes = {
      xs: 'h-6 w-6 text-xs',
      sm: 'h-8 w-8 text-sm',
      md: 'h-10 w-10 text-sm',
      lg: 'h-12 w-12 text-base',
      xl: 'h-16 w-16 text-lg',
      '2xl': 'h-20 w-20 text-xl'
    };

    const shapes = {
      circle: 'rounded-full',
      square: 'rounded-none',
      rounded: 'rounded-[var(--fdx-radius-lg)]'
    };

    const getInitials = () => {
      if (initials) return initials;
      if (!name) return '';
      
      return name
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
    };

    const getBackgroundColor = () => {
      if (color) return color;
      
      // Generate color based on name
      if (name) {
        const colors = [
          'bg-[var(--fdx-primary-500)]', 'bg-[var(--fdx-success-500)]', 'bg-[var(--fdx-warning-500)]', 'bg-[var(--fdx-error-500)]',
          'bg-[var(--fdx-gray-500)]', 'bg-[var(--fdx-primary-600)]', 'bg-[var(--fdx-success-600)]', 'bg-[var(--fdx-warning-600)]'
        ];
        
        const hash = name.split('').reduce((acc, char) => {
          return char.charCodeAt(0) + ((acc << 5) - acc);
        }, 0);
        
        return colors[Math.abs(hash) % colors.length];
      }
      
      return 'bg-[var(--fdx-gray-500)]';
    };

    const handleImageLoad = () => {
      setImageLoading(false);
      setImageError(false);
      onLoad?.();
    };

    const handleImageError = () => {
      setImageLoading(false);
      setImageError(true);
      onError?.();
    };

    const baseStyles = `
      relative inline-flex items-center justify-center 
      font-medium text-white overflow-hidden flex-shrink-0
      ${bordered ? 'ring-2 ring-white' : ''}
    `;

    const showImage = src && !imageError && !loading;
    const showInitials = !showImage && (getInitials() || name);
    const showFallback = !showImage && !showInitials;

    const LoadingSpinner = () => (
      <svg className="animate-spin h-1/2 w-1/2 text-white/70" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
      </svg>
    );

    const DefaultFallbackIcon = () => (
      <svg className="h-1/2 w-1/2 text-white/70" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
      </svg>
    );

    return (
      <div
        className={cn(
          baseStyles,
          sizes[size],
          shapes[shape],
          !showImage ? getBackgroundColor() : '',
          className
        )}
        ref={ref}
        {...props}
      >
        {/* Loading State */}
        {loading && <LoadingSpinner />}

        {/* Image */}
        {showImage && (
          <img
            src={src}
            alt={alt || name || 'Avatar'}
            className="h-full w-full object-cover"
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        )}

        {/* Image Loading */}
        {src && imageLoading && !loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-700">
            <LoadingSpinner />
          </div>
        )}

        {/* Initials */}
        {!loading && showInitials && (
          <span className="select-none">
            {getInitials()}
          </span>
        )}

        {/* Fallback Icon */}
        {!loading && showFallback && (
          fallbackIcon || <DefaultFallbackIcon />
        )}
      </div>
    );
  }
);

FdxAvatar.displayName = 'FdxAvatar';

export { FdxAvatar };