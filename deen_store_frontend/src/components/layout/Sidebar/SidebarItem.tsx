import React from 'react';
import { SidebarItemProps } from '@/types/ui';
import { Colors } from '@/constants/colors';

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, collapsed }) => {
  return (
    <div
      className={`flex items-center p-2.5 rounded-lg cursor-pointer transition-all duration-200 ease-linear ${
        collapsed ? 'justify-center' : 'justify-start'
      }`}
    >
      <div className="text-gray-600 dark:text-gray-300 flex items-center justify-center">
        {React.cloneElement(icon, {
          size: collapsed ? 20 : 24, // Keep icon size larger when not collapsed
          strokeWidth: 1.75,
          className: 'transition-all duration-200 ease-linear',
        })}
      </div>

      {/* Label */}
      <div
        className={`ml-2.5 transition-all duration-300 whitespace-nowrap overflow-hidden ${
          collapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'
        }`}
      >
        <span
          className={`text-gray-800 dark:text-gray-200 font-small hover:text-[${Colors.SIDEBAR_TEXT}] transition-colors duration-200 leading-[.9]`}
        >
          {label}
        </span>
      </div>
    </div>
  );
};

export default SidebarItem;