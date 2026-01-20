// app/providers/ThemeProvider.tsx
'use client';

import React, { createContext, useEffect, useState } from 'react';
import { applySavedTheme, toggleTheme as toggleThemeUtil, setTheme as setThemeUtil } from '@/utility/theme';
import { COLORS, ColorTheme } from '@/constants/colors';

export interface ThemeContextType {
  theme: ColorTheme;
  toggleTheme: () => void;
  setTheme: (theme: ColorTheme) => void;
  colors: (typeof COLORS.light | typeof COLORS.dark) & { common: typeof COLORS.common };
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setThemeState] = useState<ColorTheme>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Apply saved theme and set state
    const savedTheme = applySavedTheme();
    setThemeState(savedTheme);
    setMounted(true);
    
    // Listen for storage changes to sync theme across tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'theme') {
        const newTheme = applySavedTheme();
        setThemeState(newTheme);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleSetTheme = (newTheme: ColorTheme) => {
    const result = setThemeUtil(newTheme);
    setThemeState(result);
  };

  const handleToggleTheme = () => {
    const newTheme = toggleThemeUtil();
    setThemeState(newTheme);
  };

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return null;
  }

  // Get theme-specific colors and merge with common colors
  const themeColors = theme === 'dark' ? COLORS.dark : COLORS.light;
  const colorsWithCommon = {
    ...themeColors,
    common: COLORS.common,
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        colors: colorsWithCommon,
        toggleTheme: handleToggleTheme,
        setTheme: handleSetTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook for using theme
export const useTheme = () => {
  const context = React.useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};