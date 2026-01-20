'use client';

import { ButtonProps } from '@/types/ui';
import React from 'react';
import { Loader2 } from 'lucide-react';
import { getThemeColor, COLORS } from '@/constants/colors'; // Import COLORS here

// Extend the ButtonProps to include the destructive variant
type ButtonVariant = 'primary' | 'success' | 'danger' | 'warning' | 'info' | 'ghost' | 'text' | 'destructive';

interface ExtendedButtonProps extends ButtonProps {
  isLoading?: boolean;
  loadingText?: string;
  variant?: ButtonVariant;
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
  
  // Get current theme (you can also pass theme as prop or use context)
  // For now, we'll assume light theme as default
  const theme = 'light'; // Replace with your theme detection logic
  const colors = getThemeColor(theme);

  const variantStyles = {
    primary: {
      backgroundColor: 'var(--primary)',
      color: '#ffffff',
    },
    success: {
      backgroundColor: 'var(--accent)', // Using your accent color
      color: '#ffffff',
    },
    danger: {
      backgroundColor: 'var(--error)',
      color: '#ffffff',
    },
    destructive: {
      backgroundColor: 'var(--error)',
      color: '#ffffff',
    },
    warning: {
      backgroundColor: COLORS.common.yellow[500], // Now COLORS is available
      color: '#ffffff',
    },
    info: {
      backgroundColor: COLORS.common.blue[500], // Now COLORS is available
      color: '#ffffff',
    },
    ghost: {
      backgroundColor: 'transparent',
      border: `1px solid ${colors.gray[300]}`,
      color: colors.text.primary,
    },
    text: {
      backgroundColor: 'transparent',
      color: 'var(--primary)',
    },
  };

  const variantClasses = {
    primary: `bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)]`,
    success: `bg-[var(--accent)] text-white hover:bg-green-600`,
    danger: `bg-[var(--error)] text-white hover:bg-red-700`,
    destructive: `bg-[var(--error)] text-white hover:bg-red-700`,
    warning: `bg-yellow-500 text-white hover:bg-yellow-600`,
    info: `bg-blue-500 text-white hover:bg-blue-600`,
    ghost: `bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-100`,
    text: 'bg-transparent text-[var(--primary)] hover:underline p-0',
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