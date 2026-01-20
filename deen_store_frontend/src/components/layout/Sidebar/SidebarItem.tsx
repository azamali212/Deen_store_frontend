'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { SidebarItemProps } from '@/types/ui';
import clsx from 'clsx';
import Link from 'next/link';

const SidebarItem: React.FC<SidebarItemProps & {
  onClick?: (e: React.MouseEvent) => void;
  onMouseEnter?: (e: React.MouseEvent) => void;
  isActive?: boolean;
}> = ({
  icon,
  label,
  href = '/',
  collapsed = false,
  onClick,
  onMouseEnter,
  isActive = false
}) => {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={clsx(
        'flex items-center rounded-xl h-12',
        collapsed ? 'w-12 justify-center mx-auto' : 'w-full px-3'
      )} />
    );
  }

  const isLinkActive = pathname === href || pathname?.startsWith(href);
  const showAsActive = isLinkActive || isActive;

  const baseStyles = 'flex items-center rounded-xl transition-all duration-200 h-12 w-full cursor-pointer group relative';
  const collapsedStyles = collapsed ? 'w-12 justify-center mx-auto' : 'w-full px-4';
  
  const activeStyles = 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-600 dark:text-blue-400 font-semibold border-l-4 border-blue-500 shadow-sm';
  const inactiveStyles = 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white hover:shadow-sm';

  const content = (
    <div
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      className={clsx(
        baseStyles,
        collapsedStyles,
        showAsActive ? activeStyles : inactiveStyles
      )}
    >
      <div className={clsx(
        'flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200',
        showAsActive 
          ? 'bg-gradient-to-br from-blue-500 to-purple-500 text-white' 
          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 group-hover:text-blue-600 dark:group-hover:text-blue-400'
      )}>
        {React.isValidElement(icon)
          ? React.cloneElement(icon as React.ReactElement<any>, {
              size: 18,
              strokeWidth: showAsActive ? 2.5 : 2,
              className: showAsActive 
                ? 'text-white' 
                : 'currentColor',
            })
          : icon}
      </div>
      
      {!collapsed && (
        <div className="ml-3 flex-1 flex items-center justify-between">
          <span className="text-sm font-medium truncate">
            {label}
          </span>
          {showAsActive && (
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
          )}
        </div>  
      )}
    </div>
  );

  if (onClick) {
    return (
      <button className="w-full outline-none focus:outline-none">
        {content}
      </button>
    );
  }

  return (
    <Link 
      href={href} 
      className="w-full no-underline focus:outline-none"
      onClick={(e) => {
        if (onClick) {
          e.preventDefault();
          onClick(e);
        }
      }}
    >
      {content}
    </Link>
  );
};

export default SidebarItem;