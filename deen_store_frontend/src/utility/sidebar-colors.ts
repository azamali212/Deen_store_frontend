// utility/sidebar-colors.ts
export const SidebarColors = {
    getCurrentColor: () => {
      if (typeof window === 'undefined') return '1';
      return localStorage.getItem('sidebar-color') || '1';
    },
  
    applyColor: (colorId: string) => {
      if (typeof window === 'undefined') return;
      document.documentElement.style.setProperty(
        '--sidebar-bg', 
        `var(--sidebar-color-${colorId})`
      );
      localStorage.setItem('sidebar-color', colorId);
    },
  
    getAvailableColors: () => {
      return [
        { id: '1', name: 'Default', light: 'rgb(212 187 169)', dark: 'rgb(192 167 149)' },
        { id: '2', name: 'Blue', light: 'rgb(59 130 246)', dark: 'rgb(39 110 226)' },
        { id: '3', name: 'Emerald', light: 'rgb(16 185 129)', dark: 'rgb(6 155 119)' },
        { id: '4', name: 'Purple', light: 'rgb(139 92 246)', dark: 'rgb(119 72 216)' },
        { id: '5', name: 'Rose', light: 'rgb(244 63 94)', dark: 'rgb(224 43 74)' },
        { id: '6', name: 'Amber', light: 'rgb(234 179 8)', dark: 'rgb(214 159 0)' },
        { id: '7', name: 'Cyan', light: 'rgb(6 182 212)', dark: 'rgb(0 162 192)' }
      ];
    }
  };