'use client';

import { Colors } from '@/constants/colors';
import { ButtonProps } from '@/types/ui';
import React from 'react';
import { Loader2 } from 'lucide-react';

// Extend the ButtonProps to include the destructive variant
type ButtonVariant = 'primary' | 'success' | 'danger' | 'warning' | 'info' | 'ghost' | 'text' | 'destructive';

interface ExtendedButtonProps extends ButtonProps {
  isLoading?: boolean;
  loadingText?: string;
  variant?: ButtonVariant; // Add this to override the parent type
}

const Button: React.FC<ExtendedButtonProps> = ({
  children,
  isLoading = false,
  loadingText = 'Loading...',
  className = '',
  style = {},
  variant = 'primary',
  disabled,
  ...props
}) => {
  const baseStyle = 'px-4 py-2 font-medium rounded-lg transition-all duration-200 flex items-center justify-center';

  // Add destructive variant to both classes and styles
  const variantClasses = {
    primary: `bg-[var(--primary)] text-[var(--text-light)] hover:bg-[var(--primary-hover)]`,
    success: `bg-green-600 text-white hover:bg-green-700`,
    danger: `bg-red-600 text-white hover:bg-red-700`,
    destructive: `bg-red-600 text-white hover:bg-red-700`, // Same as danger for consistency
    warning: `bg-yellow-500 text-white hover:bg-yellow-600`,
    info: `bg-blue-500 text-white hover:bg-blue-600`,
    ghost: `bg-transparent border border-[var(--gray-300)] text-gray-700 hover:bg-gray-100`,
    text: 'bg-transparent text-[var(--primary)] hover:underline p-0',
  };
  
  const variantStyles = {
    primary: {
      backgroundColor: 'var(--primary)',
      color: 'var(--text-light)',
    },
    success: {
      backgroundColor: '#16a34a',
      color: '#ffffff',
    },
    danger: {
      backgroundColor: '#dc2626',
      color: '#ffffff',
    },
    destructive: {
      backgroundColor: '#dc2626',
      color: '#ffffff',
    },
    warning: {
      backgroundColor: '#eab308',
      color: '#ffffff',
    },
    info: {
      backgroundColor: '#3b82f6',
      color: '#ffffff',
    },
    ghost: {
      backgroundColor: 'transparent',
      border: `1px solid ${Colors.gray[300]}`,
      color: '#374151',
    },
    text: {
      backgroundColor: 'transparent',
      color: 'var(--primary)',
      textDecoration: 'underline',
    },
  };

  return (
    <button
      {...props}
      disabled={disabled || isLoading}
      style={{
        ...variantStyles[variant],
        ...style,
        opacity: disabled || isLoading ? 0.6 : 1,
        cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
      }}
      className={`${baseStyle} ${variantClasses[variant]} ${className}`}
    >
      {isLoading ? (
        <>
          <Loader2 className="animate-spin h-5 w-5 mr-2" />
          {loadingText}
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;