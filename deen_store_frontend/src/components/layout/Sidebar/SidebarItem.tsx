'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation'; // Updated import
import { SidebarItemProps } from '@/types/ui';
import clsx from 'clsx';
import { Colors } from '@/constants/colors';
import Link from 'next/link';

const SidebarItem: React.FC<SidebarItemProps> = ({ 
  icon, 
  label, 
  href = '/', 
  collapsed = false, 
  activeClass 
}) => {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname(); // Using usePathname instead of useRouter

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={clsx(
        'flex items-center rounded-lg h-10',
        collapsed ? 'w-10 justify-center mx-auto' : 'w-full px-3'
      )} />
    );
  }

  const isActive = pathname === href;
  const activeColor = Colors.ACTIVE;
  const activeTextColor = Colors.ACTIVETEXT;

  return (
    <Link
      href={href}
      className={clsx(
        'flex items-center rounded-lg transition-colors duration-200',
        'h-10',
        'a-sidebar', // Added the a-sidebar class
        {
          'w-10 justify-center mx-auto': collapsed,
          'w-full px-3': !collapsed,
          [`text-[${activeTextColor}]`]: isActive,
          [`bg-[${activeColor}]`]: isActive,
          'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700': !isActive,
        }
      )}
      style={{ backgroundColor: isActive ? activeColor : undefined }}
    >
      {/* Icon container */}
      <div
        className={clsx(
          'flex items-center justify-center',
          'w-6 h-6',
          {
            'text-white dark:text-white': isActive,
            'text-gray-500 dark:text-gray-400': !isActive,
          }
        )}
        style={{ color: isActive ? activeTextColor : undefined }}
      >
        {React.isValidElement(icon) ? 
          React.cloneElement(icon, {
            size: 20,
            strokeWidth: isActive ? 2 : 1.75,
          }) : 
          icon
        }
      </div>

      {/* Label - only shown when not collapsed */}
      {!collapsed && (
        <span
          className={clsx(
            'ml-3 whitespace-nowrap',
            {
              'font-medium': isActive,
              'font-normal': !isActive,
            }
          )}
          style={{ color: isActive ? activeTextColor : undefined }}
        >
          {label}
        </span>
      )}
    </Link>
  );
};

export default SidebarItem;