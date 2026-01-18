import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface FdxInputTextProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /**
   * Input size
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Input variant
   */
  variant?: 'default' | 'filled' | 'underlined';
  /**
   * Whether the input has an error state
   */
  error?: boolean;
  /**
   * Error message to display
   */
  errorMessage?: string;
  /**
   * Help text to display below input
   */
  helpText?: string;
  /**
   * Label for the input
   */
  label?: string;
  /**
   * Whether the label should be required indicator
   */
  required?: boolean;
  /**
   * Icon to display at the start of input
   */
  startIcon?: React.ReactNode;
  /**
   * Icon to display at the end of input
   */
  endIcon?: React.ReactNode;
  /**
   * Loading state
   */
  loading?: boolean;
}

const FdxInputText = forwardRef<HTMLInputElement, FdxInputTextProps>(
  ({ 
    className,
    size = 'md',
    variant = 'default',
    error = false,
    errorMessage,
    helpText,
    label,
    required = false,
    startIcon,
    endIcon,
    loading = false,
    disabled,
    id,
    ...props 
  }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    const baseInputStyles = `
      w-full transition-all duration-200 
      placeholder:text-[var(--fdx-gray-400)]
      focus:outline-none focus:ring-2 focus:ring-offset-0
      disabled:cursor-not-allowed disabled:opacity-50
      ${startIcon ? 'pl-10' : ''}
      ${endIcon || loading ? 'pr-10' : ''}
    `;

    const sizes = {
      sm: 'h-8 px-3 text-sm',
      md: 'h-10 px-4 text-sm', 
      lg: 'h-12 px-4 text-base'
    };

    const variants = {
      default: `
        border bg-white text-[var(--fdx-gray-900)]
        rounded-[var(--fdx-radius-lg)]
        ${error 
          ? 'border-[var(--fdx-error-500)] focus:ring-[var(--fdx-error-500)] focus:border-[var(--fdx-error-500)]' 
          : 'border-[var(--fdx-gray-300)] focus:ring-[var(--fdx-primary-500)] focus:border-[var(--fdx-primary-500)]'
        }
      `,
      filled: `
        border-0 bg-[var(--fdx-gray-100)] text-[var(--fdx-gray-900)]
        rounded-[var(--fdx-radius-lg)]
        ${error 
          ? 'ring-1 ring-[var(--fdx-error-500)] focus:ring-2 focus:ring-[var(--fdx-error-500)]' 
          : 'focus:ring-2 focus:ring-[var(--fdx-primary-500)]'
        }
      `,
      underlined: `
        border-0 border-b-2 rounded-none bg-transparent px-0
        text-[var(--fdx-gray-900)]
        ${error 
          ? 'border-[var(--fdx-error-500)] focus:ring-0 focus:border-[var(--fdx-error-500)]' 
          : 'border-[var(--fdx-gray-300)] focus:ring-0 focus:border-[var(--fdx-primary-500)]'
        }
      `
    };

    const LoadingSpinner = () => (
      <svg className="animate-spin h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
      </svg>
    );

    return (
      <div className="w-full">
        {/* Label */}
        {label && (
          <label 
            htmlFor={inputId}
            className="block text-sm font-medium text-[var(--fdx-gray-700)] mb-1"
          >
            {label}
            {required && <span className="text-[var(--fdx-error-500)] ml-1">*</span>}
          </label>
        )}

        {/* Input Container */}
        <div className="relative">
          {/* Start Icon */}
          {startIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--fdx-gray-400)]">
              {startIcon}
            </div>
          )}

          {/* Input */}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              baseInputStyles,
              variants[variant],
              sizes[size],
              className
            )}
            disabled={disabled || loading}
            onFocus={props.onFocus}
            onBlur={props.onBlur}
            {...props}
          />

          {/* End Icon or Loading */}
          {(endIcon || loading) && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--fdx-gray-400)]">
              {loading ? <LoadingSpinner /> : endIcon}
            </div>
          )}
        </div>

        {/* Help Text or Error Message */}
        {(helpText || errorMessage) && (
          <p className={cn(
            'mt-1 text-xs',
            error ? 'text-[var(--fdx-error-600)]' : 'text-[var(--fdx-gray-500)]'
          )}>
            {error && errorMessage ? errorMessage : helpText}
          </p>
        )}
      </div>
    );
  }
);

FdxInputText.displayName = 'FdxInputText';

export { FdxInputText };