'use client';

import React, { useEffect, useState } from 'react';
import { SidebarProps } from '@/types/ui';
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  Mail,
  Cuboid,
  VenusAndMarsIcon,
  PanelTopInactive,
  ReceiptPoundSterlingIcon,
  ColumnsSettingsIcon,
  UserCircleIcon,
  PercentDiamondIcon,
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

  useEffect(() => {
    applySavedTheme();
  }, []);

  const toggleDropdown = (label: string) => {
    setOpenDropdown(prev => (prev === label ? null : label));
  };

  const isDropdownOpen = (label: string) => openDropdown === label;

  return (
    <aside
      className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 pt-16 text-[rgb(var(--sidebar-text))] bg-[rgb(var(--sidebar-bg))] ${collapsed ? 'w-24' : 'w-64'}`}
      style={{
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.2)',
        borderRight: '1px solid rgba(0, 0, 0, 0.05)',
      }}
    >
      <nav className={`h-full p-2 px-3 pb-4 pt-4 overflow-y-auto scrollbar-hidden ${collapsed ? 'pt-15' : 'pt-2'}`}>
        <div className="flex flex-col space-y-2">

        {/*change color riminder*/}

          {/* Dashboard */}
          <SidebarDropdown
            icon={<LayoutDashboard />}
            label="Dashboard"
            
            activeClass="bg-gray-500 dark:bg-gray-700 dark:text-white"
            href={'ROUTES.DASHBOARD'}
            collapsed={collapsed}
            items={[
              { label: 'Ecommerce', href: '/dashboard' },
              { label: 'CRM', href: '/dashboard/crm' },
              { label: 'Management', href: '/dashboard/management' },

            ]}
          />
          {/* App Section Divider */}
          <div className={clsx(
            'flex items-center justify-between',
            collapsed ? 'my-3 px-1' : 'my-4 px-3'
          )}>
            <div className="flex-grow h-px bg-gray-300 dark:bg-gray-300"></div>
            {!collapsed && (
              <span className="mx-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                App
              </span>
            )}
            <div className="flex-grow h-px bg-gray-300 dark:bg-gray-300"></div>
          </div>

          {/* Ecommerce */}
          <SidebarItem
            icon={<ShoppingBag />}
            label="Ecommerce"
            collapsed={collapsed}
            onMouseEnter={() => toggleSecondarySidebar('Ecommerce')}
            isActive={activeSidebarItem === 'Ecommerce'}
          />

          {/* App-related Sidebar Items */}
          <SidebarDropdown
            icon={<Users />}
            label="Users"
            collapsed={collapsed}
            items={[
              { label: 'All Users', href: '/dashboard/users' },
              { label: 'Roles', href: '/dashboard/roles' },
            ]}
          />
          <SidebarDropdown
            icon={<Cuboid />}
            label="Customer"
            collapsed={collapsed}
            items={[
              { label: 'All Customers', href: '/dashboard/customers' },
              { label: 'Groups', href: '/dashboard/groups' },
            ]}
          />
          <SidebarDropdown
            icon={<VenusAndMarsIcon />}
            label="Vendor Management"
            collapsed={collapsed}
            items={[
              { label: 'Vendors', href: '/dashboard/vendors' },
              { label: 'Categories', href: '/dashboard/vendor-categories' },
            ]}
          />
          <SidebarDropdown
            icon={<PanelTopInactive />}
            label="Inventory Management"
            collapsed={collapsed}
            items={[
              { label: 'Products', href: '/dashboard/products' },
              { label: 'Stock', href: '/dashboard/stock' },
            ]}
          />
          <SidebarDropdown
            icon={<ReceiptPoundSterlingIcon />}
            label="Analytics & Reports"
            collapsed={collapsed}
            items={[
              { label: 'Sales Reports', href: '/dashboard/reports/sales' },
              { label: 'User Analytics', href: '/dashboard/reports/users' },
            ]}
          />
          <SidebarDropdown
            icon={<ColumnsSettingsIcon />}
            label="Customization"
            collapsed={collapsed}
            items={[
              { label: 'Themes', href: '/dashboard/themes' },
              { label: 'Layout', href: '/dashboard/layout' },
            ]}
          />
          <SidebarDropdown
            icon={<UserCircleIcon />}
            label="Profile Settings"
            collapsed={collapsed}
            items={[
              { label: 'My Profile', href: '/dashboard/profile' },
              { label: 'Security', href: '/dashboard/security' },
            ]}
          />
          <SidebarDropdown
            icon={<PercentDiamondIcon />}
            label="Roles & Permissions"
            collapsed={collapsed}
            items={[
              { label: 'Roles', href: ROUTES.ROLE },
              { label: 'Permissions', href: ROUTES.PERMISSIONS },
            ]}
          />
          <SidebarDropdown
            icon={<Cuboid />}
            label="Multi Support"
            collapsed={collapsed}
            items={[
              { label: 'Languages', href: '/dashboard/multi-language' },
              { label: 'Locales', href: '/dashboard/locales' },
            ]}
          />
          {/* App Section Divider */}
          <div className={clsx(
            'flex items-center justify-between',
            collapsed ? 'my-3 px-1' : 'my-4 px-3'
          )}>
            <div className="flex-grow h-px bg-gray-300 dark:bg-gray-300"></div>
            {!collapsed && (
              <span className="mx-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Setting
              </span>
            )}
            <div className="flex-grow h-px bg-gray-300 dark:bg-gray-300"></div>
          </div>
          <SidebarDropdown
            icon={<Cuboid />}
            label="Language Settings"
            collapsed={collapsed}
            items={[
              { label: 'Languages', href: '/dashboard/languages' },
              { label: 'Text Translations', href: '/dashboard/translations' },
            ]}
          />
          <SidebarDropdown
            icon={<Cuboid />}
            label="Logistics"
            collapsed={collapsed}
            items={[
              { label: 'Shipping Zones', href: '/dashboard/shipping' },
              { label: 'Carriers', href: '/dashboard/carriers' },
            ]}
          />
          <SidebarDropdown
            icon={<Cuboid />}
            label="Salary Management"
            collapsed={collapsed}
            items={[
              { label: 'Payroll', href: '/dashboard/payroll' },
              { label: 'Bonuses', href: '/dashboard/bonuses' },
            ]}
          />
          <SidebarDropdown
            icon={<Cuboid />}
            label="Payment Management"
            collapsed={collapsed}
            items={[
              { label: 'Invoices', href: '/dashboard/invoices' },
              { label: 'Gateways', href: '/dashboard/payment-gateways' },
            ]}
          />
          <SidebarDropdown
            icon={<Cuboid />}
            label="Marketing & Promotions"
            collapsed={collapsed}
            items={[
              { label: 'Campaigns', href: '/dashboard/campaigns' },
              { label: 'Coupons', href: '/dashboard/coupons' },
            ]}
          />
          <SidebarDropdown
            icon={<Cuboid />}
            label="Content Management"
            collapsed={collapsed}
            items={[
              { label: 'Pages', href: '/dashboard/pages' },
              { label: 'Banners', href: '/dashboard/banners' },
            ]}
          />
          <SidebarDropdown
            icon={<Mail />}
            label="Email"
            collapsed={collapsed}
            items={[
              { label: 'Inbox', href: '/dashboard/inbox' },
              { label: 'Sent', href: '/dashboard/sent' },
            ]}
          />
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;