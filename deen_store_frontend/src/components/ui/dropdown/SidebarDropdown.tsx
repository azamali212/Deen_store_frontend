'use client';

import React, { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { SidebarDropdownProps } from '@/types/ui';
import clsx from 'clsx';

const SidebarDropdown: React.FC<SidebarDropdownProps> = ({
    icon,
    label,
    collapsed,
    items,
    onMouseEnter,
    isActive = false,
    activeClass = 'bg-[rgb(var(--sidebar-active-bg))] text-[rgb(var(--sidebar-active-text))] font-semibold',
}) => {
    const inactiveStyles = 'text-[rgb(var(--sidebar-text))] hover:bg-[rgb(var(--sidebar-hover-bg))]';
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    // Check if any item or sub-item href matches the pathname to mark active
    const active = items.some(item =>
        item.href === pathname || (item.items && item.items.some(sub => sub.href === pathname))
    );

    useEffect(() => {
        if (active) setIsOpen(true);
    }, [active]);

    const toggleDropdown = () => setIsOpen(prev => !prev);

    const activeStyles = 'bg-[rgb(var(--sidebar-active-bg))] text-[rgb(var(--sidebar-active-text))] font-semibold';
   // const inactiveStyles = 'text-[rgb(var(--sidebar-text))] hover:bg-[rgb(var(--sidebar-hover-bg))]';

    return (
        <>
            <button
                onClick={toggleDropdown}
                onMouseEnter={onMouseEnter}
                className={clsx(
                    'w-full h-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors duration-200 text-sm',
                    collapsed ? 'justify-center w-10 mx-auto' : 'w-full',
                    isActive || active ? activeClass : inactiveStyles
                )}
            >
                <div className={`flex items-center ${collapsed ? 'justify-center w-full' : ''}`}>
                    <span
                        className={clsx(
                            'flex items-center',
                            isActive || active
                                ? 'text-[rgb(var(--sidebar-active-text))]'
                                : 'text-[rgb(var(--sidebar-text))]'
                        )}
                    >
                        {React.isValidElement(icon)
                            ? React.cloneElement(icon, {
                                size: 20,
                                strokeWidth: (isActive || active) ? 2 : 1.75,
                            })
                            : icon}
                    </span>
                    {!collapsed && <span className="ml-3 truncate">{label}</span>}
                </div>
                {!collapsed && (
                    <ChevronDown
                        size={18}
                        className={clsx(
                            'transition-transform duration-300',
                            isOpen ? 'rotate-180' : 'rotate-0',
                            isActive || active ? 'text-[rgb(var(--sidebar-active-text))]' : 'text-[rgb(var(--sidebar-text))]'
                        )}
                    />
                )}
            </button>

            {!collapsed && isOpen && (
                <div className="overflow-hidden transition-all duration-300 max-h-96 opacity-100">
                    <ul className="ml-10 mt-1 space-y-1 text-sm">
                        {items.map((item) => {
                            const isItemActive = pathname === item.href;

                            if (item.items) {
                                return (
                                    <SidebarDropdown
                                        key={item.label}
                                        icon={item.icon ?? <div className="w-2 h-2 rounded-full bg-gray-400" />}
                                        label={item.label}
                                        collapsed={collapsed}
                                        items={item.items}
                                        onMouseEnter={item.onMouseEnter}
                                    />
                                );
                            }

                            return (
                                <li key={item.label}>
                                    <a
                                        href={item.href}
                                        className={clsx(
                                            'flex items-center gap-2 px-2 py-1 rounded transition-colors',
                                            isItemActive ? activeStyles : inactiveStyles
                                        )}
                                    >
                                        {item.icon && (
                                            <span className={isItemActive
                                                ? 'text-[rgb(var(--sidebar-active-text))]'
                                                : 'text-[rgb(var(--sidebar-text))]'
                                            }>
                                                {item.icon}
                                            </span>
                                        )}
                                        <span>{item.label}</span>
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