import React, { forwardRef, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

export interface FdxModalProps {
  /**
   * Whether the modal is open
   */
  open: boolean;
  /**
   * Callback when modal should be closed
   */
  onClose: () => void;
  /**
   * Modal title
   */
  title?: string;
  /**
   * Modal size
   */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /**
   * Whether clicking backdrop closes modal
   */
  closeOnBackdropClick?: boolean;
  /**
   * Whether pressing escape closes modal
   */
  closeOnEscape?: boolean;
  /**
   * Custom header content
   */
  header?: React.ReactNode;
  /**
   * Modal content
   */
  children: React.ReactNode;
  /**
   * Footer content
   */
  footer?: React.ReactNode;
  /**
   * Custom class for modal content
   */
  className?: string;
  /**
   * Whether to show close button
   */
  showCloseButton?: boolean;
}

export interface FdxModalHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Header title
   */
  title?: string;
  /**
   * Whether to show close button
   */
  showCloseButton?: boolean;
  /**
   * Close callback
   */
  onClose?: () => void;
}

export interface FdxModalContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export interface FdxModalFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

const FdxModal = ({
  open,
  onClose,
  title,
  size = 'md',
  closeOnBackdropClick = true,
  closeOnEscape = true,
  header,
  children,
  footer,
  className,
  showCloseButton = true
}: FdxModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeOnEscape && open) {
        onClose();
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [open, closeOnEscape, onClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && closeOnBackdropClick) {
      onClose();
    }
  };

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[95vw] max-h-[95vh]'
  };

  if (!open) return null;

  const modalContent = (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" />
      
      {/* Modal */}
      <div 
        ref={modalRef}
        className={cn(
          'relative w-full bg-white transition-all',
          'rounded-[var(--fdx-radius-xl)] shadow-[var(--fdx-shadow-lg)]',
          'max-h-[90vh] overflow-hidden flex flex-col',
          sizes[size],
          className
        )}
      >
        {/* Header */}
        {(header || title || showCloseButton) && (
          <FdxModalHeader 
            title={title}
            showCloseButton={showCloseButton}
            onClose={onClose}
          >
            {header}
          </FdxModalHeader>
        )}

        {/* Content */}
        <FdxModalContent className="flex-1 overflow-y-auto">
          {children}
        </FdxModalContent>

        {/* Footer */}
        {footer && (
          <FdxModalFooter>
            {footer}
          </FdxModalFooter>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

const FdxModalHeader = forwardRef<HTMLDivElement, FdxModalHeaderProps>(
  ({ className, title, showCloseButton = true, onClose, children, ...props }, ref) => {
    return (
      <div
        className={cn(
          'flex items-center justify-between p-6 border-b border-[var(--fdx-gray-200)]',
          className
        )}
        ref={ref}
        {...props}
      >
        <div className="flex-1 min-w-0">
          {title && (
            <h2 className="text-lg font-semibold text-[var(--fdx-gray-900)] truncate">
              {title}
            </h2>
          )}
          {children}
        </div>
        
        {showCloseButton && onClose && (
          <button
            onClick={onClose}
            className="ml-4 p-1 rounded-[var(--fdx-radius-md)] text-[var(--fdx-gray-400)] hover:text-[var(--fdx-gray-600)] hover:bg-[var(--fdx-gray-100)] transition-colors"
            aria-label="Close modal"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
    );
  }
);

const FdxModalContent = forwardRef<HTMLDivElement, FdxModalContentProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        className={cn('p-6', className)}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  }
);

const FdxModalFooter = forwardRef<HTMLDivElement, FdxModalFooterProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        className={cn(
          'flex items-center justify-end gap-3 p-6 border-t border-[var(--fdx-gray-200)] bg-[var(--fdx-gray-50)]',
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

FdxModal.displayName = 'FdxModal';
FdxModalHeader.displayName = 'FdxModalHeader';
FdxModalContent.displayName = 'FdxModalContent';
FdxModalFooter.displayName = 'FdxModalFooter';

export { FdxModal, FdxModalHeader, FdxModalContent, FdxModalFooter };