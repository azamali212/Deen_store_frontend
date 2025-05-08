'use client';

import React, { FC, useEffect, useState } from 'react';
import { ProgressProps } from '@/types/ui';
import clsx from 'clsx';

const Progress: FC<ProgressProps> = ({
  value = 0,
  max = 100,
  showLabel = false,
  color = 'blue',
  className = '',
  title = '',
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const [animatedWidth, setAnimatedWidth] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setAnimatedWidth(percentage);
    }, 100); // slight delay to trigger transition on mount

    return () => clearTimeout(timeout);
  }, [percentage]);

  return (
    <div className={clsx("w-full", className)}>
      {/* Title and percentage */}
      {(title || showLabel) && (
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-semibold text-gray-800">{title}</span>
          {showLabel && (
            <span className="text-sm text-gray-600 font-medium">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}

      <div className="w-full bg-gray-200 rounded-full h-3 dark:bg-gray-700 overflow-hidden shadow-inner">
        <div
          className={clsx(
            `bg-${color}-500`,
            "h-3 rounded-full transition-all duration-1000 ease-in-out"
          )}
          style={{ width: `${animatedWidth}%` }}
        />
      </div>
    </div>
  );
};

export default Progress;