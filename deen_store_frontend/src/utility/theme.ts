// utility/theme.ts
import { applyThemeVariables } from '@/constants/colors';

export const applySavedTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light';
  
  const storedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  let theme: 'light' | 'dark' = 'light';
  
  // Validate and set theme
  if (storedTheme === 'dark' || storedTheme === 'light') {
    theme = storedTheme;
  } else {
    theme = prefersDark ? 'dark' : 'light';
    localStorage.setItem('theme', theme);
  }
  
  // Apply CSS variables
  applyThemeVariables(theme);
  
  // Apply dark class to html
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  
  return theme;
};

export const setTheme = (theme: 'light' | 'dark') => {
  if (typeof window === 'undefined') return theme;
  
  localStorage.setItem('theme', theme);
  applySavedTheme();
  
  // Dispatch event for other tabs/windows
  window.dispatchEvent(new StorageEvent('storage', {
    key: 'theme',
    newValue: theme,
    storageArea: localStorage
  }));
  
  return theme;
};

export const toggleTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light';
  
  const currentTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = currentTheme || (prefersDark ? 'dark' : 'light');
  
  const newTheme = theme === 'dark' ? 'light' : 'dark';
  return setTheme(newTheme);
};