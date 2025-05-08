"use client";
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
      <div
        className="flex items-center space-x-2 cursor-pointer hover:bg-gray-700 px-4 py-2 rounded-md transition duration-300"
        onClick={onClick}
      >
        <div className="text-white">{icon}</div>
        {/* Only show label if no children are passed (like DropDown) */}
        {!children && label && <span className="text-white">{label}</span>}
      </div>
      {children}
    </div>
  );
};

export default NavbarItem;