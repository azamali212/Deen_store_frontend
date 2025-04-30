'use client';

import React, { useEffect, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/solid';
import classNames from 'classnames';
import { ModelProps } from '@/types/ui';
import { Colors } from '@/constants/colors';
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
        'fixed inset-0 z-50 flex items-start justify-center bg-black/10 backdrop-blur-[2px] transition-opacity duration-300 p-4 sm:p-8 pt-16',
        isVisible ? 'opacity-100' : 'opacity-0'
      )}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={classNames(
          'bg-white rounded-xl shadow-xl w-full border border-gray-200 transform transition-all duration-300 ease-in-out',
          'max-h-[90vh] overflow-y-auto',
          sizeClasses[size],
          className,
          isVisible
            ? 'translate-y-0 scale-100 opacity-100'
            : '-translate-y-4 scale-95 opacity-0'
        )}
      >
        {showHeader && (
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-500">{title}</h3>
            <button
              onClick={handleClose}
              className="p-1 rounded-full hover:bg-gray-100 transition"
            >
              <XMarkIcon className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        )}

        <div className="p-6">{children}</div>

        {showFooter && (
          <div className="px-6 py-4 bg-gray-50 rounded-b-xl border-t">
            {footerContent || (
              <div className="flex justify-end space-x-3">
                <Button
                  variant="text"
                  onClick={handleClose}
                  className="text-gray-600"
                >
                  Cancel
                </Button>
                <Button style={{ backgroundColor: Colors.PRIMARY }}>
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