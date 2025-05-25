'use client';

import { Colors } from '@/constants/colors';
import { ButtonProps } from '@/types/ui';
import React from 'react';
import { Loader2 } from 'lucide-react'; // Spinner icon

interface ExtendedButtonProps extends ButtonProps {
  isLoading?: boolean;
  loadingText?: string;
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

  // Update the `variantClasses` and `variantStyles` to include 'ghost'
  const variantClasses = {
    primary: `bg-[var(--primary)] text-[var(--text-light)] hover:bg-[var(--primary-hover)]`,
    text: 'bg-transparent p-0 hover:no-underline',
    ghost: `bg-transparent border-[1px] border-[var(--gray-300)]`
  };

  const variantStyles = {
    primary: {
      backgroundColor: 'var(--primary)',
      color: 'var(--text-light)',
    },
    ghost: {
      backgroundColor: 'transparent',
      border: `1px solid ${Colors.gray[300]}`,
    },
    text: {
      color: 'var(--primary)',
      textDecoration: 'underline',
    }
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

