import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface FdxAlertProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Alert variant/type
   */
  variant?: 'info' | 'success' | 'warning' | 'error';
  /**
   * Alert size
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Whether to show border
   */
  bordered?: boolean;
  /**
   * Whether the alert is dismissible
   */
  dismissible?: boolean;
  /**
   * Callback when alert is dismissed
   */
  onDismiss?: () => void;
  /**
   * Alert title
   */
  title?: string;
  /**
   * Custom icon
   */
  icon?: React.ReactNode;
  /**
   * Whether to show default icons
   */
  showIcon?: boolean;
}

const FdxAlert = forwardRef<HTMLDivElement, FdxAlertProps>(
  ({ 
    className,
    variant = 'info',
    size = 'md',
    bordered = false,
    dismissible = false,
    onDismiss,
    title,
    icon,
    showIcon = true,
    children,
    ...props 
  }, ref) => {
    const baseStyles = `
      rounded-[var(--fdx-radius-lg)] transition-all duration-200 flex gap-3
      ${dismissible ? 'pr-12 relative' : ''}
    `;

    const variants = {
      info: `
        bg-[var(--fdx-info-50)] text-[var(--fdx-info-900)] 
        ${bordered ? 'border border-[var(--fdx-info-200)]' : ''}
      `,
      success: `
        bg-[var(--fdx-success-50)] text-[var(--fdx-success-900)]
        ${bordered ? 'border border-[var(--fdx-success-200)]' : ''}
      `,
      warning: `
        bg-[var(--fdx-warning-50)] text-[var(--fdx-warning-900)]
        ${bordered ? 'border border-[var(--fdx-warning-200)]' : ''}
      `,
      error: `
        bg-[var(--fdx-error-50)] text-[var(--fdx-error-900)]
        ${bordered ? 'border border-[var(--fdx-error-200)]' : ''}
      `
    };

    const sizes = {
      sm: 'p-3 text-sm',
      md: 'p-4 text-sm',
      lg: 'p-6 text-base'
    };

    const getDefaultIcon = () => {
      const iconClasses = "h-5 w-5 flex-shrink-0 mt-0.5";
      
      switch (variant) {
        case 'info':
          return (
            <svg className={`${iconClasses} text-[var(--fdx-info-600)]`} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          );
        case 'success':
          return (
            <svg className={`${iconClasses} text-[var(--fdx-success-600)]`} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          );
        case 'warning':
          return (
            <svg className={`${iconClasses} text-[var(--fdx-warning-600)]`} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          );
        case 'error':
          return (
            <svg className={`${iconClasses} text-[var(--fdx-error-600)]`} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          );
        default:
          return null;
      }
    };

    return (
      <div
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        {...props}
      >
        {/* Icon */}
        {showIcon && (icon || getDefaultIcon())}

        {/* Content */}
        <div className="flex-1 min-w-0">
          {title && (
            <h4 className="font-medium mb-1">
              {title}
            </h4>
          )}
          <div>
            {children}
          </div>
        </div>

        {/* Dismiss Button */}
        {dismissible && (
          <button
            onClick={onDismiss}
            className="absolute top-2 right-2 p-1 rounded-[var(--fdx-radius-md)] hover:bg-black/10 transition-colors"
            aria-label="Dismiss alert"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
    );
  }
);

FdxAlert.displayName = 'FdxAlert';

export { FdxAlert };