'use client';
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { DropDownProps } from '@/types/ui';
import { motion } from 'framer-motion';

const DropDown: React.FC<DropDownProps> = ({
  icon,
  label,
  collapsed,
  items,
  variant = 'sidebar',
  align = 'start',
  trigger,
  children
}) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (variant !== 'navbar') return;

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [variant]);

  const toggleDropdown = () => {
    if (variant === 'navbar' || !collapsed) {
      setOpen((prev) => !prev);
    }
  };

  if (variant === 'navbar') {
    return (
      <div ref={dropdownRef} className="relative inline-block text-left">
        {trigger ? (
          <div onClick={toggleDropdown}>{trigger}</div>
        ) : (
          <button
            onClick={toggleDropdown}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white hover:text-gray-200 transition-all duration-200 hover:bg-white/10 rounded-lg"
          >
            {icon}
            {label && <span className="font-medium">{label}</span>}
          </button>
        )}

        <div
          className={`absolute ${align === 'end' ? 'right-0' : 'left-0'} mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-100 dark:border-gray-700 z-50 transition-all duration-200 origin-top-right ${
            open ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
          }`}
        >
          {children || (
            <div className="py-1">
              {items?.map((item, idx) =>
                item.onClick ? (
                  <button
                    key={idx}
                    onClick={item.onClick}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150 flex items-center"
                  >
                    {item.label}
                  </button>
                ) : (
                  <Link
                    key={idx}
                    href={item.href || '#'}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150 flex items-center"
                  >
                    {item.label}
                  </Link>
                )
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Sidebar variant
  return (
    <div className="transition-all duration-200 ease-linear">
      <div
        className={`flex items-center p-3 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors duration-200 ${
          collapsed ? 'w-12 justify-center' : 'justify-between'
        }`}
        onClick={toggleDropdown}
      >
        <div className="flex items-center">
          <span className="text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200">
            {React.isValidElement(icon)
              ? React.cloneElement(icon, {
                  size: 20,
                  strokeWidth: 1.75,
                  className: "transition-transform group-hover:scale-110"
                })
              : icon}
          </span>

          {!collapsed && <span className="ml-3 whitespace-nowrap">{label}</span>}
        </div>

        {!collapsed && (
          <motion.span
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-gray-400 dark:text-gray-500"
          >
            <ChevronDown size={16} strokeWidth={2} />
          </motion.span>
        )}
      </div>

      {!collapsed && open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="ml-8 overflow-hidden"
        >
          {children || (
            <div className="py-1 space-y-1">
              {items?.map((item, idx) =>
                item.onClick ? (
                  <button
                    key={idx}
                    onClick={item.onClick}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 rounded-md transition-colors duration-150"
                  >
                    {item.label}
                  </button>
                ) : (
                  <Link
                    key={idx}
                    href={item.href || '#'}
                    className="block px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 rounded-md transition-colors duration-150"
                  >
                    {item.label}
                  </Link>
                )
              )}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default DropDown;