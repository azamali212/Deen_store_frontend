"use client";
import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  className?: string;
}

const colorMap: Record<string, string> = {
  primary: 'bg-blue-100 text-blue-800 ring-blue-300',
  success: 'bg-green-100 text-green-800 ring-green-300',
  warning: 'bg-yellow-100 text-yellow-800 ring-yellow-300',
  danger: 'bg-red-100 text-red-800 ring-red-300',
  info: 'bg-cyan-100 text-cyan-800 ring-cyan-300',
  neutral: 'bg-gray-100 text-gray-800 ring-gray-300',
};

const Badge: React.FC<BadgeProps> = ({ children, variant = 'neutral', className = '' }) => {
  const baseClasses =
    'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset';
  const colorClasses = colorMap[variant] || colorMap.neutral;

  return (
    <span className={`${baseClasses} ${colorClasses} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;