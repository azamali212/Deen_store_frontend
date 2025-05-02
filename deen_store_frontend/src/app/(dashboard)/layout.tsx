'use client';

import React, { useState,useEffect } from 'react';
import Navbar from '@/components/layout/Navbar/Navbar';  // Navbar Component
import Sidebar from '@/components/layout/Sidebar/Sidebar'; // Sidebar Component
import { DashboardLayoutProps } from '@/types/ui';
import { applySavedTheme } from '@/utility/theme';

const SIDEBAR_WIDTH = 250; // Sidebar width
const NAVBAR_HEIGHT = 64; // Navbar height

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => setCollapsed(!collapsed);

  useEffect(() => {
    applySavedTheme();
  }, []);


  return (
    <div className="flex h-screen">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <div
        className="flex-1 transition-all duration-500 ease-in-out"
        style={{
          marginLeft: collapsed ? '80px' : `${SIDEBAR_WIDTH}px`, // Adjust margin for animation
          paddingTop: `${NAVBAR_HEIGHT}px`,
        }}
      >
        <Navbar collapsed={collapsed} toggleSidebar={toggleSidebar} />
        
        <main
          className="p-4"
          style={{
            minHeight: `calc(100vh - ${NAVBAR_HEIGHT}px)`,
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;