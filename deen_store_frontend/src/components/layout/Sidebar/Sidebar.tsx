"use client";
import React, { useEffect } from 'react';
import { SidebarProps } from '@/types/ui';
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  Mail,
  Lock,
  ShoppingBasket,
  ListOrdered,
  MailCheck,
} from 'lucide-react';
import SidebarItem from './SidebarItem';
import SidebarDropdown from '@/components/ui/dropdown/SidebarDropdown';
import { applySavedTheme } from '@/utility/theme';


const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  useEffect(() => {
    applySavedTheme();
  }, []);
  return (
    <aside
      className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 bg-white border-r dark:bg-gray-800 dark:border-gray-700 pt-16 ${collapsed ? 'w-20' : 'w-64'
        }`}
      style={{
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.2)',
        borderRight: '1px solid rgba(255, 255, 255, 0.15)',
      }}
    >
      <nav className={`h-full p-2 px-3 pb-4 pt-4 overflow-y-auto scrollbar-hidden ${collapsed ? 'pt-15' : 'pt-2'}`}>
        <div className="flex flex-col space-y-1">
          <SidebarItem
            icon={<LayoutDashboard />}
            label="Dashboard"
            href="/dashboard"
            collapsed={collapsed}
            activeClass="bg-blue-500 text-white dark:bg-blue-700 dark:text-white"
          />

          <SidebarDropdown
            icon={<ShoppingBag />}
            label="Products"
            collapsed={collapsed}
            items={[
              { label: 'All Products', href: '/dashboard/products' },
              { label: 'Add Product', href: '/dashboard/products/add' },
              { label: 'Categories', href: '/dashboard/products/categories' },
              { label: 'Inventory', href: '/dashboard/products/inventory' },
            ]}
          />
          <SidebarItem
            icon={<Users />}
            label="Users"
            href="/dashboard/users"
            collapsed={collapsed}
            activeClass="bg-blue-500 text-white dark:bg-blue-700 dark:text-white"
          />
          <SidebarItem
            icon={<Mail />}
            label="Inbox"
            href="/dashboard/inbox"
            collapsed={collapsed}
            activeClass="bg-blue-500 text-white dark:bg-blue-700 dark:text-white"
          />
          <SidebarItem
            icon={<Lock />}
            label="Sign In"
            href="/login"
            collapsed={collapsed}
            activeClass="bg-blue-500 text-white dark:bg-blue-700 dark:text-white"
          />
          <SidebarItem
            icon={<ShoppingBasket />}
            label="Product"
            href="/dashboard/product"
            collapsed={collapsed}
            activeClass="bg-blue-500 text-white dark:bg-blue-700 dark:text-white"
          />
          <SidebarItem
            icon={<ListOrdered />}
            label="Order"
            href="/dashboard/order"
            collapsed={collapsed}
            activeClass="bg-blue-500 text-white dark:bg-blue-700 dark:text-white"
          />
          <SidebarItem
            icon={<MailCheck />}
            label="Email"
            href="/dashboard/email"
            collapsed={collapsed}
            activeClass="bg-blue-500 text-white dark:bg-blue-700 dark:text-white"
          />
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;