// components/ui/CustomSwitch.tsx
'use client'

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X } from 'lucide-react';

interface CustomSwitchProps {
  isSelected: boolean;
  onToggle: (isSelected: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const CustomSwitch = ({ 
  isSelected, 
  onToggle, 
  disabled = false,
  size = 'md',
  showLabel = true,
  className = ''
}: CustomSwitchProps) => {
  const [isOn, setIsOn] = useState(isSelected);
  const [isPressed, setIsPressed] = useState(false);

  useEffect(() => {
    setIsOn(isSelected);
  }, [isSelected]);

  const toggleSwitch = () => {
    if (disabled) return;
    const newState = !isOn;
    setIsOn(newState);
    onToggle(newState);
  };

  // Size variants
  const sizeVariants = {
    sm: {
      trackWidth: 'w-10',
      trackHeight: 'h-5',
      thumbSize: 'w-3.5 h-3.5',
      iconSize: 'w-2.5 h-2.5',
      textSize: 'text-xs'
    },
    md: {
      trackWidth: 'w-12',
      trackHeight: 'h-6',
      thumbSize: 'w-4 h-4',
      iconSize: 'w-3 h-3',
      textSize: 'text-xs'
    },
    lg: {
      trackWidth: 'w-14',
      trackHeight: 'h-7',
      thumbSize: 'w-5 h-5',
      iconSize: 'w-3.5 h-3.5',
      textSize: 'text-sm'
    },
  };

  const currentSize = sizeVariants[size];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <motion.button
        type="button"
        className={`
          relative flex items-center rounded-full p-1 transition-all
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/30
          ${disabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}
          ${isOn ? 'bg-emerald-500' : 'bg-rose-500'}
          ${currentSize.trackWidth}
          ${currentSize.trackHeight}
        `}
        onClick={toggleSwitch}
        disabled={disabled}
        whileTap={disabled ? {} : { scale: 0.95 }}
        onMouseDown={() => !disabled && setIsPressed(true)}
        onMouseUp={() => !disabled && setIsPressed(false)}
        onMouseLeave={() => !disabled && setIsPressed(false)}
      >
        <motion.div
          className={`
            absolute bg-white rounded-full flex items-center justify-center shadow-sm
            ring-0 ring-offset-0 transition-all
            ${isPressed ? 'ring-4 ring-primary/20' : ''}
            ${currentSize.thumbSize}
          `}
          animate={{
            x: isOn ? 
              `calc(${currentSize.trackWidth.replace('w-', '')} * 0.25rem - ${currentSize.thumbSize.replace('w-', '')} * 0.25rem - 0.125rem)` : 
              '0.125rem',
          }}
          transition={{ 
            type: 'spring', 
            stiffness: 700, 
            damping: 30,
            bounce: isPressed ? 0.5 : 0.7
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={isOn ? 'on' : 'off'}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.2 }}
              className={`flex items-center justify-center ${currentSize.iconSize}`}
            >
              {isOn ? (
                <Check className={`text-emerald-500 ${currentSize.iconSize}`} />
              ) : (
                <X className={`text-rose-500 ${currentSize.iconSize}`} />
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </motion.button>

      {showLabel && (
        <motion.span 
          className={`
            font-medium capitalize transition-colors
            ${isOn ? 'text-emerald-600' : 'text-rose-600'}
            ${currentSize.textSize}
          `}
          animate={{
            color: isOn ? '#059669' : '#e11d48' // emerald-600 and rose-600
          }}
          transition={{ duration: 0.3 }}
        >
          {isOn ? 'Active' : 'Inactive'}
        </motion.span>
      )}
    </div>
  );
};