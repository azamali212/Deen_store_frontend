'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation'; // ADD THIS IMPORT
import { SidebarProps } from '@/types/ui';
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  Mail,
  Cuboid,
  VenusAndMarsIcon,
  PanelTopInactive,
  ChevronLeft,
  ChevronRight,
  Settings,
  BarChart3,
  Package,
  ShoppingCart,
  UserCircle,
  FileText,
  Bell,
  HelpCircle,
} from 'lucide-react';
import SidebarItem from './SidebarItem';
import { applySavedTheme } from '@/utility/theme';
import SidebarDropdown from '@/components/ui/dropdown/SidebarDropdown';
import clsx from 'clsx';
import ROUTES from '@/constants/route.constant';

const Sidebar: React.FC<SidebarProps & {
  toggleSecondarySidebar: (item: string | null) => void;
  activeSidebarItem: string | null;
}> = ({ collapsed, setCollapsed, toggleSecondarySidebar, activeSidebarItem }) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [hovered, setHovered] = useState(false);
  const pathname = usePathname(); // ADD THIS LINE

  useEffect(() => {
    applySavedTheme();
  }, []);

  const toggleDropdown = (label: string) => {
    setOpenDropdown(prev => (prev === label ? null : label));
  };

  const isDropdownOpen = (label: string) => openDropdown === label;

  return (
    <aside
      className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 ease-in-out pt-16 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
      style={{
        background: 'linear-gradient(180deg, rgb(var(--sidebar-bg)) 0%, rgba(var(--sidebar-bg), 0.95) 100%)',
        boxShadow: '4px 0 20px rgba(0, 0, 0, 0.08)',
        borderRight: '1px solid rgba(255, 255, 255, 0.05)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Collapse Toggle Button */}
      <div 
        className={`absolute -right-3 top-6 z-50 transition-all duration-300 ${
          hovered ? 'opacity-100' : 'opacity-70'
        }`}
      >
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center w-6 h-6 rounded-full bg-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 border border-gray-200"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4 text-gray-700" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-gray-700" />
          )}
        </button>
      </div>

      <nav className={`h-full p-4 pb-6 overflow-y-auto scrollbar-hidden transition-all duration-300 ${
        collapsed ? 'px-2' : 'px-4'
      }`}>
        

        {/* Main Navigation */}
        <div className="space-y-1 mb-6">
          <p className={`text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 transition-all duration-300 ${
            collapsed ? 'text-center' : 'px-3'
          }`}>
            {collapsed ? '···' : 'MAIN'}
          </p>
          
          <SidebarItem
            icon={<LayoutDashboard />}
            label="Dashboard"
            href="/dashboard"
            collapsed={collapsed}
            isActive={pathname === '/dashboard'}
          />

          <SidebarDropdown
            icon={<ShoppingBag />}
            label="Ecommerce"
            collapsed={collapsed}
            onMouseEnter={() => toggleSecondarySidebar('Ecommerce')}
            isActive={activeSidebarItem === 'Ecommerce'}
            items={[
              { label: 'Products', href: '/dashboard/products' },
              { label: 'Orders', href: '/dashboard/orders' },
              { label: 'Categories', href: '/dashboard/categories' },
              { label: 'Customers', href: '/dashboard/customers' },
            ]}
          />

          <SidebarDropdown
            icon={<Users />}
            label="Users"
            collapsed={collapsed}
            onMouseEnter={() => toggleSecondarySidebar('Users')}
            isActive={activeSidebarItem === 'Users'}
            items={[
              { label: 'All Users', href: ROUTES.USER },
              { label: 'Roles', href: '/role' },
              { label: 'Permissions', href: '/permissions' },
              { label: 'Activity Log', href: '/dashboard/activity' },
            ]}
          />

          <SidebarItem
            icon={<BarChart3 />}
            label="Analytics"
            href="/dashboard/analytics"
            collapsed={collapsed}
            isActive={pathname === '/dashboard/analytics'}
          />

          <SidebarItem
            icon={<Package />}
            label="Inventory"
            href="/dashboard/inventory"
            collapsed={collapsed}
            isActive={pathname === '/dashboard/inventory'}
          />
        </div>

        {/* Business Section */}
        <div className="space-y-1 mb-6">
          <p className={`text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 transition-all duration-300 ${
            collapsed ? 'text-center' : 'px-3'
          }`}>
            {collapsed ? '···' : 'BUSINESS'}
          </p>

          <SidebarItem
            icon={<ShoppingCart />}
            label="Sales"
            href="/dashboard/sales"
            collapsed={collapsed}
            isActive={pathname === '/dashboard/sales'}
          />

          <SidebarItem
            icon={<Cuboid />}
            label="Vendors"
            href="/dashboard/vendors"
            collapsed={collapsed}
            isActive={pathname === '/dashboard/vendors'}
          />

          <SidebarItem
            icon={<VenusAndMarsIcon />}
            label="Partners"
            href="/dashboard/partners"
            collapsed={collapsed}
            isActive={pathname === '/dashboard/partners'}
          />

          <SidebarItem
            icon={<FileText />}
            label="Reports"
            href="/dashboard/reports"
            collapsed={collapsed}
            isActive={pathname === '/dashboard/reports'}
          />
        </div>

        {/* System Section */}
        <div className="space-y-1 mb-6">
          <p className={`text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 transition-all duration-300 ${
            collapsed ? 'text-center' : 'px-3'
          }`}>
            {collapsed ? '···' : 'SYSTEM'}
          </p>

          <SidebarItem
            icon={<Settings />}
            label="Settings"
            href="/dashboard/settings"
            collapsed={collapsed}
            isActive={pathname === '/dashboard/settings'}
          />

          <SidebarItem
            icon={<UserCircle />}
            label="Profile"
            href="/dashboard/profile"
            collapsed={collapsed}
            isActive={pathname === '/dashboard/profile'}
          />

          <SidebarItem
            icon={<Bell />}
            label="Notifications"
            href="/notifications"
            collapsed={collapsed}
            isActive={pathname === '/notifications'}
          />

          <SidebarItem
            icon={<Mail />}
            label="Messages"
            href="/dashboard/messages"
            collapsed={collapsed}
            isActive={pathname === '/dashboard/messages'}
          />
        </div>

        {/* Help Section */}
        {!collapsed && (
          <div className="mt-auto pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-4">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <HelpCircle className="w-5 h-5 text-blue-600 dark:text-blue-300" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-800 dark:text-white">Need Help?</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Check our docs</p>
                </div>
              </div>
              <button className="w-full py-2 text-xs font-medium text-white bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg hover:opacity-90 transition-opacity">
                Get Support
              </button>
            </div>
          </div>
        )}

        {collapsed && (
          <div className="mt-auto pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-center">
              <button className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors">
                <HelpCircle className="w-5 h-5 text-blue-600 dark:text-blue-300" />
              </button>
            </div>
          </div>
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;