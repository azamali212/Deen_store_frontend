'use client';
import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/layout/Navbar/Navbar';
import Sidebar from '@/components/layout/Sidebar/Sidebar';
import { DashboardLayoutProps } from '@/types/ui';
import { applySavedTheme } from '@/utility/theme';
import Breadcrumb from '@/components/ui/breadcrumb/Breadcrumb';
import NestedSidebar from '@/components/layout/Sidebar/NestedSidebar';
import ROUTES from '@/constants/route.constant';
import BREADCRUMB_CONFIG from '@/utility/breadcrumb.config';
import Head from 'next/head';
import FloatingThemeSelector from './FloatingThemeSelector';

const SIDEBAR_WIDTH = 250;
const SECONDARY_SIDEBAR_WIDTH = 220;
const NAVBAR_HEIGHT = 64;

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [secondarySidebarOpen, setSecondarySidebarOpen] = useState(false);
  const [activeSidebarItem, setActiveSidebarItem] = useState<string | null>(null);
  const nestedSidebarRef = useRef<HTMLDivElement>(null);

  const toggleSidebar = () => setCollapsed(!collapsed);
  const toggleSecondarySidebar = (item: string | null) => {
    setActiveSidebarItem(item);
    setSecondarySidebarOpen(item !== null);
  };
  const handleMouseLeaveNested = () => toggleSecondarySidebar(null);

  useEffect(() => {
    applySavedTheme();
  }, []);

  // ✅ Dynamically determine active breadcrumb
  const matchedRoute = Object.entries(BREADCRUMB_CONFIG).find(([key]) =>
    pathname.startsWith(key)
  );

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    matchedRoute
      ? {
          label: (
            <>
              Dashboard /{' '}
              <span className="text-gray-500 font-semibold pb-0.5">
                {matchedRoute[1].label}
              </span>
            </>
          ),
          href: matchedRoute[1].href,
          active: true,
        }
      : {
          label: (
            <>
              Dashboard /{' '}
              <span className="text-gray-500 font-semibold pb-0.5">Unknown</span>
            </>
          ),
          href: ROUTES.DASHBOARD,
          active: true,
        }
  ];

  return (
    <div className="flex w-full h-full bg-[rgb(var(--background-light))] relative">
      <FloatingThemeSelector />
      {/* Main Sidebar */}
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        toggleSecondarySidebar={toggleSecondarySidebar}
        activeSidebarItem={activeSidebarItem}
      />

      {/* Nested Sidebar */}
      <div
        ref={nestedSidebarRef}
        onMouseLeave={handleMouseLeaveNested}
        className={`fixed top-0 z-40 h-full transition-all duration-300 ease-out overflow-hidden ${secondarySidebarOpen ? 'opacity-100' : 'opacity-0 w-0'
          }`}
        style={{
          marginTop: `${NAVBAR_HEIGHT}px`,
          left: collapsed ? '80px' : `${SIDEBAR_WIDTH}px`,
          width: secondarySidebarOpen ? `${SECONDARY_SIDEBAR_WIDTH}px` : '0',
          pointerEvents: secondarySidebarOpen ? 'auto' : 'none',
        }}
      >
        {secondarySidebarOpen && (
          <NestedSidebar
            collapsed={collapsed}
            activeItem={activeSidebarItem}
            toggleSecondarySidebar={toggleSecondarySidebar}
          />
        )}
      </div>

      {/* Main Content Area */}
      <div
        className="flex-1 transition-all duration-300 min-w-0"
        style={{
          marginLeft: collapsed ? '80px' : `${SIDEBAR_WIDTH}px`,
          paddingTop: `${NAVBAR_HEIGHT}px`,
        }}
      >
        <Navbar collapsed={collapsed} toggleSidebar={toggleSidebar} />

        <div className="w-full z-1 shadow-sm bg-[rgb(var(--breadcrumb--color))]">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between p-4">
            <Breadcrumb items={breadcrumbItems} />
          </div>
        </div>

        <main
          className="px-6 py-4 transition-opacity duration-300"
          style={{
            minHeight: `calc(100vh - ${NAVBAR_HEIGHT}px - 68px)`,
            opacity: secondarySidebarOpen ? 0.7 : 1,
          }}
        >
           <Head>
                {/* For modern browsers */}
                <link rel="icon" type="image/png" href="/logo/opengraph-image.png" sizes="32x32" />
                {/* For older browsers */}
                <link rel="icon" href="/logo/opengraph-image.png" />
                {/* For Apple devices */}
                <link rel="apple-touch-icon" href="/logo/opengraph-image.png" />
            </Head>
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;