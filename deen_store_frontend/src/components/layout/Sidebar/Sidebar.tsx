import React, { useState } from 'react';
import SidebarItem from './SidebarItem';
import DropDown from '@/components/ui/dropdown/dropdown';
import {
  LayoutDashboard,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import Button from '@/components/ui/buttons/button';
import Card from '@/components/ui/cards/card';
import { Colors } from '@/constants/colors';

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

  const bgColor = Colors.SIERRA;
  const textColor = Colors.TEXT_LIGHT;

  return (
    <div className="relative ml-12 mt-12">
      <Card className="shadow-sm rounded-sm border" variant="sidebar">
        <aside
          className={`h-[calc(80vh)] transition-all duration-300 ease-in-out flex flex-col ${collapsed ? 'w-12' : 'w-48'} rounded-xl text-white overflow-hidden`}
        >
          {/* Profile Section */}
          <div
            className={`flex items-center p-4 border-b ${collapsed ? 'justify-center' : 'justify-start'}`}
            style={{ borderColor: Colors.gray[300] }}
          >
            <div className="relative flex-shrink-0 rounded-full w-10 h-10 bg-gray-200 overflow-hidden border-2 border-white shadow-sm">
              <img
                src="dashboard_logo/logo.png"
                alt="User Avatar"
                className="absolute inset-0 w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = '';
                  target.classList.add('hidden');
                  const fallback = document.createElement('span');
                  fallback.className = 'absolute inset-0 flex items-center justify-center text-sm font-medium text-gray-700';
                  fallback.textContent = 'JD';
                  target.parentNode?.appendChild(fallback);
                }}
              />
            </div>
            {!collapsed && (
              <div className="ml-3 overflow-hidden transition-all duration-300">
                <p className="text-sm font-medium text-white truncate">John Doe</p>
                <p className="text-xs text-gray-200 truncate">Admin</p>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-2 space-y-1 overflow-y-auto scrollbar-hidden">
            <SidebarItem icon={<LayoutDashboard />} label="Dashboard" collapsed={collapsed} />
            <SidebarItem icon={<ShoppingBag />} label="Products" collapsed={collapsed} />
            <DropDown
              icon={<ShoppingBag />}
              label="Products"
              collapsed={collapsed}
              items={[
                { label: 'All Products', href: '#' },
                { label: 'Add Product', href: '#' },
                { label: 'Categories', href: '#' },
                { label: 'Inventory', href: '#' },
              ]}
            />
          </nav>
        </aside>

        {/* Toggle Button */}
        <Button
          variant="ghost"
          onClick={() => setCollapsed(!collapsed)}
          className={`absolute top-4 z-10 h-12 w-12 min-w-0 p-0 rounded-full shadow-md transition-all duration-500 transform ${
            collapsed ? 'left-[4.5rem]' : 'left-[14.5rem]'
          }`}
          style={{
            backgroundColor: bgColor,
            borderColor: Colors.gray[300],
            color: textColor,
          }}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight size={16} strokeWidth={2.5} />
          ) : (
            <ChevronLeft size={16} strokeWidth={2.5} />
          )}
        </Button>
      </Card>
    </div>
  );
};

export default Sidebar;