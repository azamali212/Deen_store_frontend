"use client";

import React from 'react';
import {
  ShoppingBag,
  Mail,
  ListOrdered,
  Tags,
  ShoppingCart,
  Package,
  Settings,
  Users,
  Archive,
  UserCog,
} from 'lucide-react';
import SidebarItem from './SidebarItem';
import SidebarDropdown from '@/components/ui/dropdown/SidebarDropdown';

interface NestedSidebarProps {
  collapsed: boolean;
  activeItem: string | null;
  toggleSecondarySidebar: (item: string | null) => void;
  onClick?: () => void;
}

const getIconForLabel = (label: string) => {
  switch (label) {
    case 'Orders':
      return <ListOrdered />;
    case 'Categories':
      return <Tags />;
    case 'Products':
      return <Package />;
    case 'Listings':
      return <Archive />;
    case 'Cart Settings':
      return <ShoppingCart />;
    case 'Inventory Settings':
      return <Settings />;
    case 'Users':
      return <Users />;
    case 'Roles':
      return <UserCog />;
    default:
      return <Tags />;
  }
};

const NestedSidebar: React.FC<NestedSidebarProps> = ({
  collapsed,
  activeItem,
  toggleSecondarySidebar,
}) => {
  const handleItemClick = () => toggleSecondarySidebar(null);

  const getSecondaryItems = () => {
    const items = [
      { label: 'Orders', href: '/dashboard/orders' },
      { label: 'Categories', href: '/dashboard/categories' },
      { label: 'Products', href: '/dashboard/products' },
      { label: 'Listings', href: '/dashboard/listings' },
      { label: 'Cart Settings', href: '/dashboard/cart-settings' },
      { label: 'Inventory Settings', href: '/dashboard/inventory-settings' },
    ];

    const dropdownItems = [
      { label: 'All Users', href: '/dashboard/users' },
      { label: 'User Activity', href: '/dashboard/roles' },
    ];

    switch (activeItem) {
      case 'Ecommerce':
      case 'Users':
        return (
          <div className="space-y-2">
            {items.map(item => (
              <SidebarItem
                key={item.label}
                icon={getIconForLabel(item.label)}
                label={item.label}
                href={item.href}
                collapsed={collapsed}
                onClick={handleItemClick}
              />
            ))}

            <SidebarDropdown
              icon={getIconForLabel('Users')}
              label="Users"
              collapsed={collapsed}
              items={dropdownItems}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <aside
      className={`fixed top-0 z-30 h-screen transition-all duration-300 border-r text-[rgb(var(--text-color))] bg-[rgb(var(--sidebar--background))] pt-16 w-56 ${collapsed ? 'left-20' : 'left-64'
        }`}
      style={{
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
        borderRight: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      <nav className="h-full p-4 overflow-y-auto scrollbar-hidden">
        <div className="flex flex-col space-y-2">
          {getSecondaryItems()}
        </div>
      </nav>
    </aside>
  );
};

export default NestedSidebar;