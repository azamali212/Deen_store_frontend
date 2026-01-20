// components/ThemeInitializer.tsx
'use client';

import { useEffect } from 'react';

export default function ThemeInitializer() {
  useEffect(() => {
    // Initialize theme from localStorage
    const initializeTheme = () => {
      try {
        const storedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        let theme = 'light';
        
        if (storedTheme === 'dark' || storedTheme === 'light') {
          theme = storedTheme;
        } else {
          theme = prefersDark ? 'dark' : 'light';
          localStorage.setItem('theme', theme);
        }
        
        // Apply theme class
        if (theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      } catch (error) {
        console.error('Theme initialization error:', error);
      }
    };
    
    initializeTheme();
  }, []);
  
  return null;
}