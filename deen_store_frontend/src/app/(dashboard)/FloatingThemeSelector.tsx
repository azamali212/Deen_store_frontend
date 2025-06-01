'use client';
import React, { useState, useEffect } from 'react';
import { Palette, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SidebarColors } from '@/utility/sidebar-colors';

const FloatingSidebarColorSelector = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentColor, setCurrentColor] = useState('1');

  useEffect(() => {
    setCurrentColor(SidebarColors.getCurrentColor());
  }, []);

  const colors = SidebarColors.getAvailableColors();

  const handleColorChange = (colorId: string) => {
    SidebarColors.applyColor(colorId);
    setCurrentColor(colorId);
    setIsOpen(false);
  };

  return (
    <div className="fixed right-6 bottom-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 20 }}
            className="absolute bottom-16 right-0 w-56 p-3 rounded-lg shadow-xl bg-[rgb(var(--background))] text-[rgb(var(--text-color))] border border-[rgb(var(--muted))]/20"
          >
            <h4 className="px-2 py-1 text-sm font-medium mb-2">Sidebar Color</h4>
            <div className="grid grid-cols-4 gap-2">
              {colors.map((color) => (
                <button
                  key={color.id}
                  onClick={() => handleColorChange(color.id)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    currentColor === color.id ? 'ring-2 ring-offset-2 ring-[rgb(var(--text-color))]' : ''
                  }`}
                  style={{ 
                    backgroundColor: `rgb(var(--sidebar-color-${color.id}))`,
                  }}
                  aria-label={color.name}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={{ rotate: isOpen ? 180 : 0 }}
        transition={{ type: 'spring', stiffness: 300 }}
        className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
        style={{ backgroundColor: `rgb(var(--sidebar-bg))` }}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <Palette className="w-6 h-6 text-white" />
        )}
      </motion.button>
    </div>
  );
};

export default FloatingSidebarColorSelector;