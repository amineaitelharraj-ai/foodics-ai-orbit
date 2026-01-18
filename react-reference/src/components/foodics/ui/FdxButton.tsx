import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface FdxButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Button variant style
   */
  variant?: 'default' | 'primary' | 'secondary' | 'danger' | 'link' | 'text';
  /**
   * Button size
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Loading state
   */
  loading?: boolean;
  /**
   * Icon to display before text
   */
  startIcon?: React.ReactNode;
  /**
   * Icon to display after text
   */
  endIcon?: React.ReactNode;
}

const FdxButton = forwardRef<HTMLButtonElement, FdxButtonProps>(
  ({ 
    className, 
    variant = 'default', 
    size = 'md', 
    loading = false,
    startIcon,
    endIcon,
    children, 
    disabled,
    ...props 
  }, ref) => {
    const baseStyles = `
      inline-flex items-center justify-center gap-2 
      font-medium transition-all duration-200 
      focus:outline-none focus:ring-2 focus:ring-offset-1
      disabled:pointer-events-none disabled:opacity-50
      border relative
    `;

    const variants = {
      default: `
        bg-white text-[var(--fdx-gray-700)] border-[var(--fdx-gray-300)]
        hover:bg-[var(--fdx-gray-50)] hover:border-[var(--fdx-gray-400)]
        focus:ring-[var(--fdx-gray-500)] focus:ring-opacity-50
        shadow-[var(--fdx-shadow-sm)] hover:shadow-[var(--fdx-shadow-md)]
      `,
      primary: `
        bg-[var(--fdx-primary-600)] text-white border-[var(--fdx-primary-600)]
        hover:bg-[var(--fdx-primary-700)] hover:border-[var(--fdx-primary-700)]
        focus:ring-[var(--fdx-primary-500)] focus:ring-opacity-50
        shadow-[var(--fdx-shadow-sm)] hover:shadow-[var(--fdx-shadow-md)]
      `,
      secondary: `
        bg-[var(--fdx-gray-100)] text-[var(--fdx-gray-700)] border-[var(--fdx-gray-200)]
        hover:bg-[var(--fdx-gray-200)] hover:border-[var(--fdx-gray-300)]
        focus:ring-[var(--fdx-gray-500)] focus:ring-opacity-50
        shadow-[var(--fdx-shadow-sm)]
      `,
      danger: `
        bg-[var(--fdx-error-500)] text-white border-[var(--fdx-error-500)]
        hover:bg-[var(--fdx-error-600)] hover:border-[var(--fdx-error-600)]
        focus:ring-[var(--fdx-error-500)] focus:ring-opacity-50
        shadow-[var(--fdx-shadow-sm)] hover:shadow-[var(--fdx-shadow-md)]
      `,
      link: `
        text-[var(--fdx-primary-600)] bg-transparent border-transparent
        hover:text-[var(--fdx-primary-700)] hover:underline
        focus:ring-[var(--fdx-primary-500)] focus:ring-opacity-50
        underline-offset-4
      `,
      text: `
        text-[var(--fdx-gray-700)] bg-transparent border-transparent
        hover:bg-[var(--fdx-gray-100)] hover:text-[var(--fdx-gray-900)]
        focus:ring-[var(--fdx-gray-500)] focus:ring-opacity-50
      `
    };

    const sizes = {
      sm: 'h-8 px-3 text-sm rounded-[var(--fdx-radius-md)]',
      md: 'h-10 px-4 text-sm rounded-[var(--fdx-radius-lg)]',
      lg: 'h-12 px-6 text-base rounded-[var(--fdx-radius-xl)]'
    };

    const LoadingSpinner = () => (
      <svg 
        className="animate-spin h-4 w-4" 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24"
      >
        <circle 
          className="opacity-25" 
          cx="12" 
          cy="12" 
          r="10" 
          stroke="currentColor" 
          strokeWidth="4"
        />
        <path 
          className="opacity-75" 
          fill="currentColor" 
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    );

    return (
      <button
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <LoadingSpinner />
        ) : startIcon ? (
          <span className="w-4 h-4 flex items-center justify-center">
            {startIcon}
          </span>
        ) : null}
        
        {children && <span className="leading-none">{children}</span>}
        
        {!loading && endIcon && (
          <span className="w-4 h-4 flex items-center justify-center">
            {endIcon}
          </span>
        )}
      </button>
    );
  }
);

FdxButton.displayName = 'FdxButton';

export { FdxButton };