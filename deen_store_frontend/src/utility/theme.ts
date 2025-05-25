export type Theme = 'light' | 'dark' | 'neon';

// Themes cycle order
const themeOrder: Theme[] = ['light', 'dark', 'neon'];

export const getCurrentTheme = (): Theme => {
  if (typeof window === 'undefined') return 'light';

  if (document.documentElement.classList.contains('dark')) return 'dark';
  if (document.documentElement.classList.contains('neon')) return 'neon';
  return 'light';
};

export const getNextTheme = (current: Theme): Theme => {
  const currentIndex = themeOrder.indexOf(current);
  return themeOrder[(currentIndex + 1) % themeOrder.length];
};

export const setTheme = (theme: Theme): void => {
  if (typeof window === 'undefined') return;

  const html = document.documentElement;
  html.classList.remove(...themeOrder);
  html.classList.add(theme);
  localStorage.setItem('theme', theme);
};

export const toggleTheme = (): Theme => {
  if (typeof window === 'undefined') return 'light';

  const current = getCurrentTheme();
  const next = getNextTheme(current);
  setTheme(next);
  return next;
};

// Load theme from localStorage or fallback to system preference
export const getInitialTheme = (): Theme => {
  if (typeof window === 'undefined') return 'light';

  const savedTheme = localStorage.getItem('theme') as Theme | null;
  if (savedTheme && themeOrder.includes(savedTheme)) return savedTheme;

  // fallback to system preference
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

// Apply saved or system theme on app start or logout - without resetting or forcing a theme
export const applySavedTheme = (): void => {
  const theme = getInitialTheme();
  setTheme(theme);
};