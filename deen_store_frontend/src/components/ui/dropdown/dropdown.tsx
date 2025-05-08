"use client";
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { DropDownProps } from '@/types/ui';

const DropDown: React.FC<DropDownProps> = ({
  icon,
  label,
  collapsed,
  items,
  variant = 'sidebar'
}) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close navbar dropdown when clicked outside
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
      setOpen(prev => !prev);
    }
  };

  if (variant === 'navbar') {
    return (
      <div ref={dropdownRef} className="relative inline-block text-left">
        <button
          onClick={toggleDropdown}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition"
        >
          {icon}
          {label && <span>{label}</span>}
        </button>

        <div
          className={`absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 z-50 transform transition-all duration-200 ${
            open ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
          }`}
        >
          <div className="py-2">
            {items.map((item, idx) => (
              <Link
                key={idx}
                href={item.href}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="transition-all duration-200 ease-linear">
      <div
        className={`flex items-center p-2.5 rounded-md text-sm font-medium text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer ${
          collapsed ? 'w-14' : 'justify-between'
        }`}
        onClick={toggleDropdown}
      >
        <div className="flex items-center">
          <span className="text-gray-500 dark:text-gray-300">
            {React.isValidElement(icon)
              ? React.cloneElement(icon, {
                  size: 20,
                  strokeWidth: 1.75,
                })
              : icon}
          </span>

          {!collapsed && <span className="ml-3 whitespace-nowrap">{label}</span>}
        </div>

        {!collapsed && (
          <span>
            {open ? (
              <ChevronDown size={16} strokeWidth={1.75} />
            ) : (
              <ChevronRight size={16} strokeWidth={1.75} />
            )}
          </span>
        )}
      </div>

      {!collapsed && (
        <div
          className={`ml-8 space-y-1 transition-all duration-300 ease-linear overflow-hidden ${
            open ? 'max-h-[500px] mt-2' : 'max-h-0'
          }`}
        >
          {items.map((item, idx) => (
            <a
              key={idx}
              href={item.href}
              className="block text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors duration-200 py-1"
            >
              {item.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

export default DropDown;