'use client';
import React from 'react';
import { NavbarItemProps } from '@/types/ui';

const NavbarItem: React.FC<NavbarItemProps & { children?: React.ReactNode }> = ({
  label,
  icon,
  onClick,
  children,
}) => {
  return (
    <div className="relative">
      <button
        onClick={onClick}
        className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 hover:from-blue-500/20 hover:to-purple-500/20 transition-all duration-200 group"
      >
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 text-white">
          {icon}
        </div>
        {label && <span className="font-medium text-gray-800 dark:text-white">{label}</span>}
      </button>
      {children}
    </div>
  );
};

export default NavbarItem;