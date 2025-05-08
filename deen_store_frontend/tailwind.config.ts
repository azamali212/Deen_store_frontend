import type { Config } from 'tailwindcss';
import plugin from 'tailwindcss/plugin';

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: {
          light: '#ffffff',
          dark: '#111827',
          neon: '#0f172a',
        },
        foreground: {
          light: '#000000',
          dark: '#f3f4f6',
          neon: '#00ff9d',
        },
        accent: {
          light: '#3b82f6',
          dark: '#60a5fa',
          neon: '#00ff9d',
        },
        neon: {
          text: '#00ff9d',
          active: '#00ffaa',
          link: '#0ff',
          separator: '#88ffee',
        }
      },
    },
  },
  plugins: [
    plugin(function ({ addVariant }) {
      addVariant('theme-neon', '.neon &');
    }),
  ],
};

export default config;