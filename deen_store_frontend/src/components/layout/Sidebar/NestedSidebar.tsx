'use client';

import React from 'react';
import {
  ListOrdered,
  Tags,
  Package,
  Settings,
  Users,
  Archive,
  UserCog,
  DollarSign,
  TrendingUp,
  Shield,
  Bell,
  MessageSquare,
} from 'lucide-react';
import SidebarItem from './SidebarItem';

interface NestedSidebarProps {
  collapsed: boolean;
  activeItem: string | null;
  toggleSecondarySidebar: (item: string | null) => void;
}

// Define a more specific type for the icon map
const iconMap: Record<string, React.ReactElement> = {
  'Orders': <ListOrdered />,
  'Categories': <Tags />,
  'Products': <Package />,
  'Listings': <Archive />,
  'Settings': <Settings />,
  'Users': <Users />,
  'Roles': <UserCog />,
  'Revenue': <DollarSign />,
  'Analytics': <TrendingUp />,
  'Security': <Shield />,
  'Notifications': <Bell />,
  'Messages': <MessageSquare />,
};

const getIconForLabel = (label: string): React.ReactElement => {
  return iconMap[label] || <Settings />;
};

const NestedSidebar: React.FC<NestedSidebarProps> = ({
  collapsed,
  activeItem,
  toggleSecondarySidebar,
}) => {
  const handleItemClick = () => {
    if (window.innerWidth < 768) {
      toggleSecondarySidebar(null);
    }
  };

  if (!activeItem) return null;

  const getSectionItems = () => {
    switch (activeItem) {
      case 'Ecommerce':
        return [
          { label: 'Orders', href: '/dashboard/orders', badge: '12' },
          { label: 'Products', href: '/dashboard/products', badge: '45' },
          { label: 'Categories', href: '/dashboard/categories' },
          { label: 'Listings', href: '/dashboard/listings' },
          { label: 'Revenue', href: '/dashboard/revenue', badge: '↑ 24%' },
          { label: 'Analytics', href: '/dashboard/analytics' },
        ];
      
      case 'Users':
        return [
          { label: 'All Users', href: '/dashboard/users', badge: '1.2K' },
          { label: 'Roles', href: '/dashboard/roles' },
          { label: 'Permissions', href: '/dashboard/permissions' },
          { label: 'Security', href: '/dashboard/security' },
          { label: 'Notifications', href: '/dashboard/notifications', badge: '3' },
          { label: 'Messages', href: '/dashboard/messages', badge: '5' },
        ];
      
      default:
        return [];
    }
  };

  const items = getSectionItems();

  return (
    <aside
      className="h-full w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-r border-gray-200 dark:border-gray-800"
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">{activeItem}</h2>
          <button
            onClick={() => toggleSecondarySidebar(null)}
            className="w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            ×
          </button>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Manage your {activeItem.toLowerCase()} settings and configurations
        </p>
      </div>

      {/* Quick Stats */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-800">
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
            <p className="text-xs text-blue-600 dark:text-blue-400">Active</p>
            <p className="text-lg font-semibold text-gray-800 dark:text-white">142</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
            <p className="text-xs text-green-600 dark:text-green-400">Total</p>
            <p className="text-lg font-semibold text-gray-800 dark:text-white">1,248</p>
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="p-4">
        <div className="space-y-1">
          {items.map((item) => (
            <div key={item.label} className="group relative">
              <SidebarItem
                icon={getIconForLabel(item.label)}
                label={item.label}
                href={item.href}
                collapsed={false}
                onClick={handleItemClick}
              />
              {item.badge && (
                <span className="absolute right-4 top-1/2 transform -translate-y-1/2 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
                  {item.badge}
                </span>
              )}
            </div>
          ))}
        </div>
      </nav>

      {/* Action Button */}
      <div className="p-4 mt-4">
        <button className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity flex items-center justify-center space-x-2">
          <span>Quick Action</span>
          <span>⚡</span>
        </button>
      </div>
    </aside>
  );
};

export default NestedSidebar;