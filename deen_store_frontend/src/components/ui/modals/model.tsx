'use client';
import React, { useEffect, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/solid';
import classNames from 'classnames';
import { ModelProps } from '@/types/ui';
import Button from '../buttons/button';

const Model: React.FC<ModelProps> = ({
  isOpen,
  onClose,
  title,
  children,
  className,
  showHeader = true,
  showFooter = false,
  footerContent,
  size = 'md'
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl'
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={handleBackdropClick}
      className={classNames(
        'fixed inset-0 z-50 flex items-start justify-center bg-[rgb(var(--muted))]/30 backdrop-blur-sm transition-opacity duration-300 p-4 sm:p-8 pt-16',
        isVisible ? 'opacity-100' : 'opacity-0'
      )}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={classNames(
          'bg-[rgb(var(--model--color))] rounded-xl shadow-xl w-full border border-[rgb(var(--muted))]/20 transform transition-all duration-300 ease-in-out',
          'max-h-[90vh] overflow-y-auto',
          sizeClasses[size],
          className,
          isVisible
            ? 'translate-y-0 scale-100 opacity-100'
            : '-translate-y-4 scale-95 opacity-0'
        )}
      >
        {showHeader && (
          <div className="px-6 py-4 border-b border-[rgb(var(--muted))]/20 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-[rgb(var(--text-color))] dark:text-[rgb(var(--foreground))]">
              {title}
            </h3>
            <button
              onClick={handleClose}
              className="p-1 rounded-full hover:bg-[rgb(var(--muted))]/10 transition"
            >
              <XMarkIcon className="w-5 h-5 text-[rgb(var(--text-color))] dark:text-[rgb(var(--foreground))]" />
            </button>
          </div>
        )}

        <div className="p-6">{children}</div>

        {showFooter && (
          <div className="px-6 py-4 bg-[rgb(var(--card))] dark:bg-[rgb(var(--card))] rounded-b-xl border-t border-[rgb(var(--muted))]/20">
            {footerContent || (
              <div className="flex justify-end space-x-3">
                <Button
                  variant="text"
                  onClick={handleClose}
                  className="text-[rgb(var(--text-color))] dark:text-[rgb(var(--foreground))]"
                >
                  Cancel
                </Button>
                <Button style={{ backgroundColor: 'rgb(var(--progress-admin))' }}>
                  Confirm
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Model;