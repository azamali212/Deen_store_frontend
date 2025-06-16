'use client';
import React, { useState, useEffect } from 'react';
import { Palette, X } from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';
import { SidebarColors } from '@/utility/sidebar-colors';

const FloatingSidebarColorSelector = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentColor, setCurrentColor] = useState('1'); 
  
  // Advanced motion values for fluid animations
  const rotateValue = useMotionValue(0);
  const glowIntensity = useMotionValue(0);
  const pulseScale = useMotionValue(1);
  
  // Continuous rotation effect
  useEffect(() => {
    let isMounted = true;
    
    const rotate = () => {
      animate(rotateValue, 360, {
        duration: 8,
        ease: "linear",
        repeat: Infinity,
        onComplete: () => {
          if (isMounted) rotateValue.set(0);
        }
      });
    };
    
    // Pulse glow effect
    const pulse = () => {
      animate(glowIntensity, 1, {
        duration: 2,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut"
      });
    };
    
    rotate();
    pulse();
    
    return () => {
      isMounted = false;
    };
  }, []);

  const colors = SidebarColors.getAvailableColors();

  const isLightColor = (colorId: string) => {
    const lightColors = ['1'];
    return lightColors.includes(colorId);
  };

  const handleColorChange = (colorId: string) => {
    SidebarColors.applyColor(colorId);
    setCurrentColor(colorId);
    
    // Bounce animation on color change
    animate(pulseScale, 1.3, {
      duration: 0.6,
      type: 'spring',
      onComplete: () => {
        pulseScale.set(1);
      }
    });
    
    setIsOpen(false);
  };

  return (
    <div className="fixed right-6 top-1/2 transform -translate-y-1/2 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.9 }}
            animate={{ 
              opacity: 1, 
              x: 0, 
              scale: 1,
              transition: { type: 'spring', damping: 20, stiffness: 300 }
            }}
            exit={{ 
              opacity: 0, 
              x: 20, 
              scale: 0.9,
              transition: { duration: 0.2 }
            }}
            className="absolute right-16 -top-1/2 w-56 p-3 rounded-lg shadow-2xl bg-[rgb(var(--accent))] text-[rgb(var(--text-color))] border border-[rgb(var(--muted))]/20 backdrop-blur-sm bg-opacity-90"
          >
            <h4 className="px-2 py-1 text-sm font-medium mb-2">Sidebar Color</h4>
            <div className="grid grid-cols-4 gap-2">
              {colors.map((color) => (
                <motion.button
                  key={color.id}
                  onClick={() => handleColorChange(color.id)}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    currentColor === color.id ? 'ring-2 ring-offset-2 ring-[rgb(var(--text-color))]' : ''
                  }`}
                  style={{ 
                    backgroundColor: `rgb(var(--sidebar-color-${color.id}))`,
                    boxShadow: currentColor === color.id 
                      ? '0 0 15px 5px rgba(var(--text-color), 0.5)' 
                      : 'none'
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
        whileHover={{ 
          scale: 1.2,
        }}
        whileTap={{ 
          scale: 0.9,
        }}
        style={{
          backgroundColor: `rgb(var(--sidebar-bg))`,
          rotate: rotateValue,
          scale: pulseScale,
          boxShadow: useTransform(glowIntensity, 
            [0, 1], 
            ['0 0 0px rgb(var(--sidebar-bg))', '0 0 30px 10px rgb(var(--sidebar-bg))']
          ),
          filter: useTransform(glowIntensity,
            [0, 1],
            ['drop-shadow(0 0 0px rgba(255,255,255,0))', 'drop-shadow(0 0 15px rgba(255,255,255,0.8))']
          )
        }}
        className="w-8 h-8 rounded-full flex items-center justify-center relative overflow-visible"
      >
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle at center, rgb(var(--sidebar-bg)) 0%, transparent 70%)`,
            opacity: useTransform(glowIntensity, [0, 1], [0, 0.7]),
            scale: useTransform(glowIntensity, [0, 1], [1, 1.5])
          }}
        />
        
        <motion.div
          animate={{
            rotate: isOpen ? 180 : 0,
            transition: { type: 'spring', stiffness: 600 }
          }}
          className="z-10"
        >
          {isOpen ? (
            <X className={`w-4 h-4 ${isLightColor(currentColor) ? 'text-gray-800' : 'text-white'}`} />
          ) : (
            <Palette className={`w-7 h-7 ${isLightColor(currentColor) ? 'text-gray-800' : 'text-white'}`} />
          )}
        </motion.div>
      </motion.button>
    </div>
  );
};

export default FloatingSidebarColorSelector;