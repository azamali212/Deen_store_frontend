"use client";
import { TooltipProps } from '@/types/ui';
import React, { useState } from 'react';


const Tooltip: React.FC<TooltipProps> = ({ 
  children, 
  content, 
  side = 'right',
  disabled = false
}) => {
  const [visible, setVisible] = useState(false);
  
  // Position classes based on side prop
  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2'
  };

  return (
    <div className="relative inline-block">
      {React.cloneElement(children, {
        onMouseEnter: () => !disabled && setVisible(true),
        onMouseLeave: () => setVisible(false),
        onFocus: () => !disabled && setVisible(true),
        onBlur: () => setVisible(false),
      })}
      
      {visible && (
        <div 
          className={`
            absolute z-50 px-3 py-1.5 text-xs font-medium rounded-md
            bg-gray-800 text-white dark:bg-gray-700 shadow-lg
            transition-opacity duration-200
            ${positionClasses[side]}
            ${visible ? 'opacity-100' : 'opacity-0'}
          `}
        >
          {content}
          {/* Tooltip arrow */}
          <div className={`
            absolute w-2 h-2 bg-gray-800 dark:bg-gray-700 transform rotate-45
            ${
              side === 'top' ? '-bottom-1 left-1/2 -translate-x-1/2' :
              side === 'right' ? '-left-1 top-1/2 -translate-y-1/2' :
              side === 'bottom' ? '-top-1 left-1/2 -translate-x-1/2' :
              '-right-1 top-1/2 -translate-y-1/2'
            }
          `} />
        </div>
      )}
    </div>
  );
};

export default Tooltip;