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
        'flex items-center rounded-lg h-10',
        collapsed ? 'w-10 justify-center mx-auto' : 'w-full px-3'
      )} />
    );
  }

  const isLinkActive = pathname === href;
  const showAsActive = isLinkActive || isActive;

  const activeStyles = 'bg-[rgb(var(--sidebar-active-bg))] text-[rgb(var(--sidebar-active-text))] font-semibold';
  const inactiveStyles = 'text-[rgb(var(--sidebar-text))] hover:bg-[rgb(var(--sidebar-hover-bg))]';

  const content = (
    <div
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      className={clsx(
        'flex items-center rounded-lg transition-colors duration-200 h-10 w-full cursor-pointer text-sm',
        collapsed ? 'w-10 justify-center mx-auto' : 'w-full px-3',
        showAsActive ? activeStyles : inactiveStyles
      )}
    >
      <div className="flex items-center justify-center w-6 h-6">
        {React.isValidElement(icon)
          ? React.cloneElement(icon, {
              size: 20,
              strokeWidth: showAsActive ? 2 : 1.75,
              className: showAsActive 
                ? 'text-[rgb(var(--sidebar-active-text))]' 
                : 'text-[rgb(var(--sidebar-text))]',
            })
          : icon}
      </div>
      {!collapsed && (
        <span className="ml-3 truncate">
          {label}
        </span>
      )}
    </div>
  );

  if (onClick) {
    return <button className="w-full">{content}</button>;
  }

  return (
    <Link href={href} className="w-full">
      {content}
    </Link>
  );
};

export default SidebarItem;