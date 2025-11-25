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
import { useCurrentUserRole } from '@/hooks/currentUserRole/useCurrentUserRole';
import { hasSidebarPermission } from '@/utility/sidebarPermissions';


const Sidebar: React.FC<SidebarProps & {
  toggleSecondarySidebar: (item: string | null) => void;
  activeSidebarItem: string | null;
}> = ({ collapsed, setCollapsed, toggleSecondarySidebar, activeSidebarItem }) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const { userRole, loading } = useCurrentUserRole();

  useEffect(() => {
    applySavedTheme();
  }, []);

  const toggleDropdown = (label: string) => {
    setOpenDropdown(prev => (prev === label ? null : label));
  };

  const isDropdownOpen = (label: string) => openDropdown === label;

  // Filter sidebar items based on user role
  const shouldShowItem = (itemKey: string) => {
    if (loading) return false;
    return hasSidebarPermission(itemKey, userRole);
  };

  // Show loading state
  if (loading) {
    return (
      <aside
        className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 pt-16 text-[rgb(var(--sidebar-text))] bg-[rgb(var(--sidebar-bg))] ${collapsed ? 'w-24' : 'w-64'}`}
      >
        <nav className={`h-full p-2 px-3 pb-4 pt-4 overflow-y-auto scrollbar-hidden ${collapsed ? 'pt-15' : 'pt-2'}`}>
          <div className="flex flex-col space-y-2">
            {/* Loading skeleton */}
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className={`flex items-center rounded-lg h-10 animate-pulse bg-gray-300 ${collapsed ? 'w-10 mx-auto' : 'w-full px-3'}`}
              />
            ))}
          </div>
        </nav>
      </aside>
    );
  }

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

          {/* Dashboard */}
          {shouldShowItem('dashboard') && (
            <SidebarDropdown
              icon={<LayoutDashboard />}
              label="Dashboard"
              activeClass="bg-gray-500 dark:bg-gray-700 dark:text-white"
              href={ROUTES.DASHBOARD}
              collapsed={collapsed}
              items={[
                { label: 'Ecommerce', href: '/dashboard' },
                { label: 'CRM', href: '/dashboard/crm' },
                { label: 'Management', href: '/dashboard/management' },
              ]}
            />
          )}

          {/* App Section Divider - Only show if there are app items to display */}
          {(shouldShowItem('ecommerce') || shouldShowItem('users') || shouldShowItem('customer') || shouldShowItem('vendor_management')) && (
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
          )}

          {/* Ecommerce */}
          {shouldShowItem('ecommerce') && (
            <SidebarItem
              icon={<ShoppingBag />}
              label="Ecommerce"
              collapsed={collapsed}
              onMouseEnter={() => toggleSecondarySidebar('Ecommerce')}
              isActive={activeSidebarItem === 'Ecommerce'}
            />
          )}

          {/* Users */}
          {shouldShowItem('users') && (
            <SidebarDropdown
              icon={<Users />}
              label="Users"
              collapsed={collapsed}
              items={[
                { label: 'Users Management', href: ROUTES.USER },
                { label: 'User Logs', href: '/dashboard/roles' },
              ]}
            />
          )}

          {/* Customer */}
          {shouldShowItem('customer') && (
            <SidebarDropdown
              icon={<Cuboid />}
              label="Customer"
              collapsed={collapsed}
              items={[
                { label: 'All Customers', href: '/dashboard/customers' },
                { label: 'Groups', href: '/dashboard/groups' },
              ]}
            />
          )}

          {/* Vendor Management */}
          {shouldShowItem('vendor_management') && (
            <SidebarDropdown
              icon={<VenusAndMarsIcon />}
              label="Vendor Management"
              collapsed={collapsed}
              items={[
                { label: 'Vendors', href: '/dashboard/vendors' },
                { label: 'Categories', href: '/dashboard/vendor-categories' },
              ]}
            />
          )}

          {/* Inventory Management */}
          {shouldShowItem('inventory_management') && (
            <SidebarDropdown
              icon={<PanelTopInactive />}
              label="Inventory Management"
              collapsed={collapsed}
              items={[
                { label: 'Products', href: '/dashboard/products' },
                { label: 'Stock', href: '/dashboard/stock' },
              ]}
            />
          )}

          {/* Analytics & Reports */}
          {shouldShowItem('analytics_reports') && (
            <SidebarDropdown
              icon={<ReceiptPoundSterlingIcon />}
              label="Analytics & Reports"
              collapsed={collapsed}
              items={[
                { label: 'Sales Reports', href: '/dashboard/reports/sales' },
                { label: 'User Analytics', href: '/dashboard/reports/users' },
              ]}
            />
          )}

          {/* Customization */}
          {shouldShowItem('customization') && (
            <SidebarDropdown
              icon={<ColumnsSettingsIcon />}
              label="Customization"
              collapsed={collapsed}
              items={[
                { label: 'Themes', href: '/dashboard/themes' },
                { label: 'Layout', href: '/dashboard/layout' },
              ]}
            />
          )}

          {/* Profile Settings */}
          {shouldShowItem('profile_settings') && (
            <SidebarDropdown
              icon={<UserCircleIcon />}
              label="Profile Settings"
              collapsed={collapsed}
              items={[
                { label: 'My Profile', href: '/dashboard/profile' },
                { label: 'Security', href: '/dashboard/security' },
              ]}
            />
          )}

          {/* Roles & Permissions */}
          {shouldShowItem('roles_permissions') && (
            <SidebarDropdown
              icon={<PercentDiamondIcon />}
              label="Roles & Permissions"
              collapsed={collapsed}
              items={[
                { label: 'Roles', href: ROUTES.ROLE },
                { label: 'Permissions', href: ROUTES.PERMISSIONS },
              ]}
            />
          )}

          {/* Multi Support */}
          {shouldShowItem('multi_support') && (
            <SidebarDropdown
              icon={<Cuboid />}
              label="Multi Support"
              collapsed={collapsed}
              items={[
                { label: 'Languages', href: '/dashboard/multi-language' },
                { label: 'Locales', href: '/dashboard/locales' },
              ]}
            />
          )}

          {/* Setting Section Divider - Only show if there are setting items to display */}
          {(shouldShowItem('language_settings') || shouldShowItem('logistics') || shouldShowItem('salary_management') || shouldShowItem('payment_management')) && (
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
          )}

          {/* Language Settings */}
          {shouldShowItem('language_settings') && (
            <SidebarDropdown
              icon={<Cuboid />}
              label="Language Settings"
              collapsed={collapsed}
              items={[
                { label: 'Languages', href: '/dashboard/languages' },
                { label: 'Text Translations', href: '/dashboard/translations' },
              ]}
            />
          )}

          {/* Logistics */}
          {shouldShowItem('logistics') && (
            <SidebarDropdown
              icon={<Cuboid />}
              label="Logistics"
              collapsed={collapsed}
              items={[
                { label: 'Shipping Zones', href: '/dashboard/shipping' },
                { label: 'Carriers', href: '/dashboard/carriers' },
              ]}
            />
          )}

          {/* Salary Management */}
          {shouldShowItem('salary_management') && (
            <SidebarDropdown
              icon={<Cuboid />}
              label="Salary Management"
              collapsed={collapsed}
              items={[
                { label: 'Payroll', href: '/dashboard/payroll' },
                { label: 'Bonuses', href: '/dashboard/bonuses' },
              ]}
            />
          )}

          {/* Payment Management */}
          {shouldShowItem('payment_management') && (
            <SidebarDropdown
              icon={<Cuboid />}
              label="Payment Management"
              collapsed={collapsed}
              items={[
                { label: 'Invoices', href: '/dashboard/invoices' },
                { label: 'Gateways', href: '/dashboard/payment-gateways' },
              ]}
            />
          )}

          {/* Marketing & Promotions */}
          {shouldShowItem('marketing_promotions') && (
            <SidebarDropdown
              icon={<Cuboid />}
              label="Marketing & Promotions"
              collapsed={collapsed}
              items={[
                { label: 'Campaigns', href: '/dashboard/campaigns' },
                { label: 'Coupons', href: '/dashboard/coupons' },
              ]}
            />
          )}

          {/* Content Management */}
          {shouldShowItem('content_management') && (
            <SidebarDropdown
              icon={<Cuboid />}
              label="Content Management"
              collapsed={collapsed}
              items={[
                { label: 'Pages', href: '/dashboard/pages' },
                { label: 'Banners', href: '/dashboard/banners' },
              ]}
            />
          )}

          {/* Email */}
          {shouldShowItem('email') && (
            <SidebarDropdown
              icon={<Mail />}
              label="Email"
              collapsed={collapsed}
              items={[
                { label: 'Inbox', href: '/dashboard/inbox' },
                { label: 'Sent', href: '/dashboard/sent' },
              ]}
            />
          )}
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;