// Color system constants
export const COLORS = {
  // Light Theme
  light: {
    background: '#F7F9FB',
    surface: '#FFFFFF',
    text: {
      primary: '#111827',
      secondary: '#6B7280',
      tertiary: '#9CA3AF'
    },
    primary: {
      main: '#4F46E5',
      hover: '#4338CA',
      light: '#6366F1',
      dark: '#3730A3'
    },
    accent: '#10B981',
    error: '#EF4444',
    border: '#E5E7EB',
    sidebar: {
      bg: '247, 249, 251', // RGB values for --sidebar-bg
      surface: '#FFFFFF',
      border: '#E5E7EB',
      text: {
        primary: '#111827',
        secondary: '#6B7280'
      }
    },
    // Add these missing properties
    gray: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827'
    }
  },
  
  // Dark Theme
  dark: {
    background: '#0a0a0a',
    surface: '#1F2937',
    text: {
      primary: '#F9FAFB',
      secondary: '#9CA3AF',
      tertiary: '#6B7280'
    },
    primary: {
      main: '#6366F1',
      hover: '#818CF8',
      light: '#818CF8',
      dark: '#4F46E5'
    },
    accent: '#10B981',
    error: '#EF4444',
    border: '#374151',
    sidebar: {
      bg: '10, 10, 10', // RGB values for --sidebar-bg
      surface: '#1F2937',
      border: '#374151',
      text: {
        primary: '#F9FAFB',
        secondary: '#9CA3AF'
      }
    },
    // Add these missing properties for dark theme
    gray: {
      50: '#0a0a0a',
      100: '#1F2937',
      200: '#374151',
      300: '#4B5563',
      400: '#6B7280',
      500: '#9CA3AF',
      600: '#D1D5DB',
      700: '#E5E7EB',
      800: '#F3F4F6',
      900: '#F9FAFB'
    }
  },
  
  // Common colors (not theme-dependent)
  common: {
    white: '#FFFFFF',
    black: '#000000',
    red: {
      50: '#FEF2F2',
      100: '#FEE2E2',
      200: '#FECACA',
      300: '#FCA5A5',
      400: '#F87171',
      500: '#EF4444',
      600: '#DC2626',
      700: '#B91C1C',
      800: '#991B1B',
      900: '#7F1D1D'
    },
    green: {
      50: '#F0FDF4',
      100: '#DCFCE7',
      200: '#BBF7D0',
      300: '#86EFAC',
      400: '#4ADE80',
      500: '#22C55E',
      600: '#16A34A',
      700: '#15803D',
      800: '#166534',
      900: '#14532D'
    },
    yellow: {
      50: '#FEFCE8',
      100: '#FEF9C3',
      200: '#FEF08A',
      300: '#FDE047',
      400: '#FACC15',
      500: '#EAB308',
      600: '#CA8A04',
      700: '#A16207',
      800: '#854D0E',
      900: '#713F12'
    },
    blue: {
      50: '#EFF6FF',
      100: '#DBEAFE',
      200: '#BFDBFE',
      300: '#93C5FD',
      400: '#60A5FA',
      500: '#3B82F6',
      600: '#2563EB',
      700: '#1D4ED8',
      800: '#1E40AF',
      900: '#1E3A8A'
    }
  }
} as const;

// CSS Variables for global styles
export const CSS_VARIABLES = {
  light: {
    '--background': COLORS.light.background,
    '--surface': COLORS.light.surface,
    '--text-primary': COLORS.light.text.primary,
    '--text-secondary': COLORS.light.text.secondary,
    '--primary': COLORS.light.primary.main,
    '--primary-hover': COLORS.light.primary.hover,
    '--accent': COLORS.light.accent,
    '--error': COLORS.light.error,
    '--border': COLORS.light.border,
    '--sidebar-bg': COLORS.light.sidebar.bg,
    // Add gray scale variables
    '--gray-50': COLORS.light.gray[50],
    '--gray-100': COLORS.light.gray[100],
    '--gray-200': COLORS.light.gray[200],
    '--gray-300': COLORS.light.gray[300],
    '--gray-400': COLORS.light.gray[400],
    '--gray-500': COLORS.light.gray[500],
    '--gray-600': COLORS.light.gray[600],
    '--gray-700': COLORS.light.gray[700],
    '--gray-800': COLORS.light.gray[800],
    '--gray-900': COLORS.light.gray[900],
  },
  dark: {
    '--background': COLORS.dark.background,
    '--surface': COLORS.dark.surface,
    '--text-primary': COLORS.dark.text.primary,
    '--text-secondary': COLORS.dark.text.secondary,
    '--primary': COLORS.dark.primary.main,
    '--primary-hover': COLORS.dark.primary.hover,
    '--accent': COLORS.dark.accent,
    '--error': COLORS.dark.error,
    '--border': COLORS.dark.border,
    '--sidebar-bg': COLORS.dark.sidebar.bg,
    // Add gray scale variables for dark mode
    '--gray-50': COLORS.dark.gray[50],
    '--gray-100': COLORS.dark.gray[100],
    '--gray-200': COLORS.dark.gray[200],
    '--gray-300': COLORS.dark.gray[300],
    '--gray-400': COLORS.dark.gray[400],
    '--gray-500': COLORS.dark.gray[500],
    '--gray-600': COLORS.dark.gray[600],
    '--gray-700': COLORS.dark.gray[700],
    '--gray-800': COLORS.dark.gray[800],
    '--gray-900': COLORS.dark.gray[900],
  }
} as const;

// Utility functions
export const getColorScheme = (theme: 'light' | 'dark') => {
  return COLORS[theme];
};

export const applyThemeVariables = (theme: 'light' | 'dark') => {
  const variables = CSS_VARIABLES[theme];
  const root = document.documentElement;
  
  Object.entries(variables).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
};

// Tailwind color classes mapping
export const TAILWIND_CLASSES = {
  text: {
    primary: 'text-gray-900 dark:text-gray-100',
    secondary: 'text-gray-600 dark:text-gray-400',
  },
  bg: {
    primary: 'bg-indigo-600 dark:bg-indigo-500',
    surface: 'bg-white dark:bg-gray-800',
    background: 'bg-gray-50 dark:bg-gray-900'
  },
  border: {
    default: 'border-gray-200 dark:border-gray-700'
  }
} as const;

// Helper function to get theme-aware color
export const getThemeColor = (theme: 'light' | 'dark') => {
  const scheme = getColorScheme(theme);
  return {
    ...scheme,
    // Additional helper properties
    bg: {
      gray300: scheme.gray[300],
      gray200: scheme.gray[200],
      gray100: scheme.gray[100],
    }
  };
};

export type ColorTheme = 'light' | 'dark';