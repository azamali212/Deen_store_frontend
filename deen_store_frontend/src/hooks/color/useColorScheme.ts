'use client';

import { useTheme } from "../theme/useTheme";

export const useColorScheme = () => {
  const { theme, colors } = useTheme();
  
  return {
    theme,
    colors,
    isDark: theme === 'dark',
    isLight: theme === 'light',
    
    // Helper functions for common patterns
    getGradient: (direction: 'to-r' | 'to-b' | 'to-br' = 'to-br') => {
      return `bg-gradient-${direction} from-${theme === 'dark' ? 'gray-900' : 'gray-50'} via-${theme === 'dark' ? 'gray-800' : 'white'} to-${theme === 'dark' ? 'gray-900' : 'gray-50'}`;
    },
    
    getCardStyle: () => ({
      backgroundColor: colors.surface,
      borderColor: colors.border,
      color: colors.text.primary,
    }),
    
    getButtonStyle: (variant: 'primary' | 'secondary' | 'ghost' = 'primary') => {
      const baseStyle = 'px-4 py-2 rounded-lg transition-all duration-200';
      
      switch (variant) {
        case 'primary':
          return `${baseStyle} bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)]`;
        case 'secondary':
          return `${baseStyle} bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700`;
        case 'ghost':
          return `${baseStyle} border border-[var(--border)] text-[var(--text-primary)] hover:bg-gray-50 dark:hover:bg-gray-800`;
        default:
          return baseStyle;
      }
    },
    
    getTextStyle: (variant: 'primary' | 'secondary' | 'tertiary' = 'primary') => {
      switch (variant) {
        case 'primary':
          return 'text-[var(--text-primary)]';
        case 'secondary':
          return 'text-[var(--text-secondary)]';
        case 'tertiary':
          return 'text-[var(--text-tertiary)]';
        default:
          return 'text-[var(--text-primary)]';
      }
    },
  };
};