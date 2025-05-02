'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { SidebarDropdownProps } from '@/types/ui';
import { usePathname } from 'next/navigation';

const SidebarDropdown: React.FC<SidebarDropdownProps> = ({ icon, label, collapsed, items }) => {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    // Check if any item in the dropdown is currently active
    const isActive = items.some((item) => item.href === pathname);

    // Auto-open if active
    useEffect(() => {
        if (isActive) {
            setIsOpen(true);
        }
    }, [isActive]);

    const toggleDropdown = () => setIsOpen((prev) => !prev);

    return (
        <>
            <button
                type="button"
                onClick={toggleDropdown}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-all
        ${isActive ? 'bg-gray-100 dark:bg-gray-700 font-semibold' : ''} 
        ${collapsed ? 'justify-center' : ''}`}
            >
                <div className={`flex items-center ${collapsed ? 'justify-center w-full' : ''}`}>
                    <span className="text-gray-500 dark:text-gray-400">
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
                    <ChevronDown
                        size={18}
                        className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`}
                    />
                )}
            </button>

            {/* Dropdown Items */}
            {!collapsed && (
                <div
                    className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                        }`}
                >
                    <ul className="ml-10 mt-1 space-y-1 text-sm">
                        {items.map((item) => {
                            const isItemActive = pathname === item.href;
                            return (
                                <li key={item.label}>
                                    <a
                                        href={item.href}
                                        className={`block px-2 py-1 rounded transition-colors ${isItemActive
                                                ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-white font-semibold'
                                                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                            }`}
                                    >
                                        {item.label}
                                    </a>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}
        </>
    );
};

export default SidebarDropdown;