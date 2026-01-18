import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface FdxCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Card variant
   */
  variant?: 'default' | 'bordered' | 'elevated' | 'outline';
  /**
   * Card padding size
   */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /**
   * Whether the card is hoverable
   */
  hoverable?: boolean;
  /**
   * Whether the card is clickable
   */
  clickable?: boolean;
}

export interface FdxCardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Header title
   */
  title?: string;
  /**
   * Header subtitle
   */
  subtitle?: string;
  /**
   * Action buttons or elements
   */
  actions?: React.ReactNode;
}

export interface FdxCardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export interface FdxCardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

const FdxCard = forwardRef<HTMLDivElement, FdxCardProps>(
  ({ 
    className, 
    variant = 'default', 
    padding = 'md',
    hoverable = false,
    clickable = false,
    children, 
    ...props 
  }, ref) => {
    const baseStyles = `
      transition-all duration-200
      ${clickable ? 'cursor-pointer' : ''}
      ${hoverable ? 'hover:shadow-[var(--fdx-shadow-lg)]' : ''}
    `;

    const variants = {
      default: `
        bg-white border border-[var(--fdx-gray-200)]
        shadow-[var(--fdx-shadow-sm)]
        rounded-[var(--fdx-radius-lg)]
      `,
      bordered: `
        bg-white border-2 border-[var(--fdx-gray-300)]
        rounded-[var(--fdx-radius-lg)]
      `,
      elevated: `
        bg-white shadow-[var(--fdx-shadow-lg)] border-0
        rounded-[var(--fdx-radius-lg)]
      `,
      outline: `
        bg-transparent border border-[var(--fdx-gray-300)]
        rounded-[var(--fdx-radius-lg)]
      `
    };

    const paddings = {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8'
    };

    return (
      <div
        className={cn(
          baseStyles,
          variants[variant],
          paddings[padding],
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  }
);

const FdxCardHeader = forwardRef<HTMLDivElement, FdxCardHeaderProps>(
  ({ className, title, subtitle, actions, children, ...props }, ref) => {
    return (
      <div
        className={cn(
          'flex items-center justify-between mb-4',
          className
        )}
        ref={ref}
        {...props}
      >
        <div className="min-w-0 flex-1">
          {title && (
            <h3 className="text-lg font-semibold text-[var(--fdx-gray-900)] truncate leading-tight">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-sm text-[var(--fdx-gray-600)] mt-1 leading-relaxed">
              {subtitle}
            </p>
          )}
          {children}
        </div>
        {actions && (
          <div className="flex items-center gap-2 ml-4">
            {actions}
          </div>
        )}
      </div>
    );
  }
);

const FdxCardContent = forwardRef<HTMLDivElement, FdxCardContentProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        className={cn('text-[var(--fdx-gray-700)] leading-relaxed', className)}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  }
);

const FdxCardFooter = forwardRef<HTMLDivElement, FdxCardFooterProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        className={cn(
          'mt-4 pt-4 border-t border-[var(--fdx-gray-200)]',
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  }
);

FdxCard.displayName = 'FdxCard';
FdxCardHeader.displayName = 'FdxCardHeader';
FdxCardContent.displayName = 'FdxCardContent';
FdxCardFooter.displayName = 'FdxCardFooter';

export { FdxCard, FdxCardHeader, FdxCardContent, FdxCardFooter };