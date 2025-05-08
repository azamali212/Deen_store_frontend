"use client";
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar/Navbar';
import Sidebar from '@/components/layout/Sidebar/Sidebar';
import { DashboardLayoutProps } from '@/types/ui';
import { applySavedTheme } from '@/utility/theme';
import Breadcrumb from '@/components/ui/breadcrumb/Breadcrumb';

const SIDEBAR_WIDTH = 250;
const NAVBAR_HEIGHT = 64;

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => setCollapsed(!collapsed);

  useEffect(() => {
    applySavedTheme();
  }, []);

  return (
    <div className="flex h-full bg-[rgb(var(--background-light))]">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <div
        className="flex-1 transition-all duration-500 ease-in-out"
        style={{
          marginLeft: collapsed ? '80px' : `${SIDEBAR_WIDTH}px`,
          paddingTop: `${NAVBAR_HEIGHT}px`,
        }}
      >
        <Navbar collapsed={collapsed} toggleSidebar={toggleSidebar} />

        {/* Sticky Header with Breadcrumb */}
        <div className="sticky top-[64px] w-full z-1 shadow-lg bg-[rgb(var(--breadcrumb--color))]">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between p-4">
            <div className="flex items-center space-x-4">
              <Breadcrumb
                items={[
                  { label: 'Home', href: '/' },
                  { label: 'Dashboard', href: '/dashboard', active: true },
                ]}
              />
            </div>
          </div>
        </div>

        <main
          className="px-6 py-4"
          style={{
            minHeight: `calc(100vh - ${NAVBAR_HEIGHT}px - 68px)`, // Account for navbar and header height
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;