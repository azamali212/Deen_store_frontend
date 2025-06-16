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

  initializeColor: () => {
    if (typeof window === 'undefined') return '1';
    const colorId = localStorage.getItem('sidebar-color') || '1';
    document.documentElement.style.setProperty(
      '--sidebar-bg',
      `var(--sidebar-color-${colorId})`
    );
    return colorId;
  },

  getAvailableColors: () => {
    return [
      { id: '1', name: 'Default', light: 'rgb(255 255 255)', dark: 'rgb(17 24 39)' },
      { id: '2', name: 'Blue', light: 'rgb(59 130 246)', dark: 'rgb(39 110 226)' },
      { id: '3', name: 'Emerald', light: 'rgb(16 185 129)', dark: 'rgb(6 155 119)' },
      { id: '4', name: 'Purple', light: 'rgb(139 92 246)', dark: 'rgb(119 72 216)' },
      { id: '5', name: 'Rose', light: 'rgb(244 63 94)', dark: 'rgb(224 43 74)' },
      { id: '6', name: 'Amber', light: 'rgb(234 179 8)', dark: 'rgb(214 159 0)' },
      { id: '7', name: 'Cyan', light: 'rgb(6 182 212)', dark: 'rgb(0 162 192)' },
      { id: '8', name: 'Golden Yellow', light: 'rgb(251 191 36)', dark: 'rgb(255 215 0)' },
      { id: '9', name: 'Pink', light: 'rgb(236 72 153)', dark: 'rgb(218 112 214)' },
      { id: '10', name: 'Indigo', light: 'rgb(79 70 229)', dark: 'rgb(72 61 139)' },
      { id: '11', name: 'Lime', light: 'rgb(132 204 22)', dark: 'rgb(85 153 0)' },
      { id: '12', name: 'Teal', light: 'rgb(94 234 212)', dark: 'rgb(0 128 128)' }
    ];
  }
};