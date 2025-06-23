// First, update your Tooltip component (components/ui/tooltip/Tooltip.tsx)
"use client";
import React, { useState, useEffect, useRef } from 'react';
import { TooltipProps } from '@/types/ui';

const Tooltip: React.FC<TooltipProps> = ({ 
  children, 
  content, 
  side = 'top',
  interactive = false,
  delayDuration = 100,
  className = '',
  maxHeight = '200px' // Add maxHeight prop
}) => {
  const [visible, setVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  
  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2'
  };

  const handleMouseEnter = () => {
    if (timeoutId) clearTimeout(timeoutId);
    setTimeoutId(setTimeout(() => setVisible(true), delayDuration));
  };

  const handleMouseLeave = () => {
    if (timeoutId) clearTimeout(timeoutId);
    setTimeoutId(setTimeout(() => setVisible(false), 200));
  };

  // Close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        setVisible(false);
      }
    };

    if (interactive && visible) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [interactive, visible]);

  return (
    <div className="relative inline-block">
      {React.cloneElement(children, {
        onMouseEnter: handleMouseEnter,
        onMouseLeave: handleMouseLeave,
        onFocus: handleMouseEnter,
        onBlur: handleMouseLeave,
      })}
      
      {visible && (
        <div 
          ref={tooltipRef}
          className={`
            absolute z-50 min-w-[200px]
            transition-opacity duration-200 ease-in-out
            ${positionClasses[side]}
            ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
            ${className || 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg rounded-lg'}
          `}
          onMouseEnter={interactive ? handleMouseEnter : undefined}
          onMouseLeave={interactive ? handleMouseLeave : undefined}
        >
          {/* Add maxHeight and overflow to content container */}
          <div style={{ maxHeight }} className="overflow-y-auto">
            {content}
          </div>
          {/* Tooltip arrow */}
          <div className={`
            absolute w-3 h-3 bg-white dark:bg-gray-800 border-t border-l border-gray-200 dark:border-gray-700 transform rotate-45
            ${
              side === 'top' ? '-bottom-1.5 left-1/2 -translate-x-1/2' :
              side === 'right' ? '-left-1.5 top-1/2 -translate-y-1/2' :
              side === 'bottom' ? '-top-1.5 left-1/2 -translate-x-1/2' :
              '-right-1.5 top-1/2 -translate-y-1/2'
            }
          `} />
        </div>
      )}
    </div>
  );
};

export default Tooltip;