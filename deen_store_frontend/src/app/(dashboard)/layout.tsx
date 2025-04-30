"use client";
import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar/Navbar';
import Sidebar from '@/components/layout/Sidebar/Sidebar';
import { DashboardLayoutProps } from '@/types/ui';

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false); // Manage the sidebar collapse state
  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div className="flex h-screen overflow-hidden justify-center"> {/* Center the entire layout */}
      {/* Sidebar on the left */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 h-screen overflow-y-auto"> {/* Ensure the content takes up full height and has scrollbar on the right */}
        {/* Navbar */}
        <Navbar collapsed={collapsed} toggleSidebar={toggleSidebar}/>

        {/* Page Content */}
        <div className="p-4-5" >
          {children} {/* Add padding for content */}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;