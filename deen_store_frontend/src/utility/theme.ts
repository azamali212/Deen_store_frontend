export type Theme = 'light' | 'dark' | 'neon';

export const toggleTheme = (): Theme => {
  if (typeof window === 'undefined') return 'light';

  const html = document.documentElement;
  const current = getCurrentTheme();
  const newTheme = getNextTheme(current);

  html.classList.remove('light', 'dark', 'neon');
  html.classList.add(newTheme);
  localStorage.setItem('theme', newTheme);

  return newTheme;
};

export const getCurrentTheme = (): Theme => {
  if (typeof window === 'undefined') return 'light';

  if (document.documentElement.classList.contains('dark')) return 'dark';
  if (document.documentElement.classList.contains('neon')) return 'neon';
  return 'light';
};

export const getNextTheme = (current: Theme): Theme => {
  const themeOrder: Theme[] = ['light', 'dark', 'neon'];
  const currentIndex = themeOrder.indexOf(current);
  return themeOrder[(currentIndex + 1) % themeOrder.length];
};

export const getInitialTheme = (): Theme => {
  if (typeof window === 'undefined') return 'light';

  const savedTheme = localStorage.getItem('theme');
  if (savedTheme && ['light', 'dark', 'neon'].includes(savedTheme)) {
    return savedTheme as Theme;
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const applySavedTheme = (): void => {
  const theme = getInitialTheme();
  document.documentElement.classList.remove('light', 'dark', 'neon');
  document.documentElement.classList.add(theme);
};

