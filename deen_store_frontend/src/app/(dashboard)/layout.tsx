'use client';
import React, { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar/Navbar';
import Sidebar from '@/components/layout/Sidebar/Sidebar';
import { DashboardLayoutProps } from '@/types/ui';
import Breadcrumb from '@/components/ui/breadcrumb/Breadcrumb';
import NestedSidebar from '@/components/layout/Sidebar/NestedSidebar';
import ROUTES from '@/constants/route.constant';
import BREADCRUMB_CONFIG from '@/utility/breadcrumb.config';
import Head from 'next/head';
import FloatingThemeSelector from './FloatingThemeSelector';
import { SidebarColors } from '@/utility/sidebar-colors';
import { useAuth } from '@/hooks/auth/useAuth';

const SIDEBAR_WIDTH = 256;
const COLLAPSED_SIDEBAR_WIDTH = 80;
const SECONDARY_SIDEBAR_WIDTH = 240;
const NAVBAR_HEIGHT = 64;

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { auth, isInitialized } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [secondarySidebarOpen, setSecondarySidebarOpen] = useState(false);
  const [activeSidebarItem, setActiveSidebarItem] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const nestedSidebarRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check mobile screen
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close nested sidebar on route change
  useEffect(() => {
    setSecondarySidebarOpen(false);
    setActiveSidebarItem(null);
  }, [pathname]);

  // Authentication check
  useEffect(() => {
    if (!isInitialized) {
      console.log("🔄 Auth not initialized yet, waiting...");
      return;
    }
    
    const checkAuthentication = () => {
      const adminSession = Object.values(auth.sessions).find(
        (session: any) => session.portal === "admin" && session.phase === "authenticated"
      );
      
      const hasAdminToken = 
        typeof window !== 'undefined' && (
          sessionStorage.getItem("auth:admin:server") || 
          localStorage.getItem("admin_token") ||
          document.cookie.includes("admin_access_token")
        );
      
      if (hasAdminToken && (!adminSession || adminSession.phase !== "authenticated")) {
        setTimeout(() => {
          const updatedSession = Object.values(auth.sessions).find(
            (session: any) => session.portal === "admin" && session.phase === "authenticated"
          );
          
          if (!updatedSession || updatedSession.phase !== "authenticated") {
            router.push("/admin/login");
          } else {
            setIsCheckingAuth(false);
          }
        }, 500);
        return;
      }
      
      if (!adminSession && !hasAdminToken) {
        router.push("/admin/login");
        return;
      }
      
      if (adminSession?.phase === "authenticated") {
        setIsCheckingAuth(false);
        return;
      }
      
      setTimeout(() => {
        if (isCheckingAuth) {
          router.push("/admin/login");
        }
      }, 3000);
    };
    
    checkAuthentication();
    
    const interval = setInterval(checkAuthentication, 60000);
    
    return () => clearInterval(interval);
  }, [auth, router, isInitialized, isCheckingAuth]);

  const toggleSidebar = () => setCollapsed(!collapsed);
  
  // Toggle secondary sidebar with hover delay
  const toggleSecondarySidebar = (item: string | null) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    
    if (item) {
      // Open immediately
      setActiveSidebarItem(item);
      setSecondarySidebarOpen(true);
    } else {
      // Close with delay for better UX
      hoverTimeoutRef.current = setTimeout(() => {
        setSecondarySidebarOpen(false);
        setActiveSidebarItem(null);
      }, 200);
    }
  };

  const handleMouseLeaveNested = () => {
    toggleSecondarySidebar(null);
  };

  // Handle mouse enter on nested sidebar (cancel close)
  const handleMouseEnterNested = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  };

  if (typeof window !== 'undefined') {
    SidebarColors.initializeColor();
  }

  useEffect(() => {
    SidebarColors.initializeColor();
  }, []);

  // Dynamically determine active breadcrumb
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

  // Show loading while checking authentication - REVERTED TO YOUR ORIGINAL
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[rgb(var(--background-light))]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
          <p className="text-sm text-gray-500">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Calculate sidebar widths based on collapsed state
  const mainSidebarWidth = collapsed ? COLLAPSED_SIDEBAR_WIDTH : SIDEBAR_WIDTH;

  return (
    <div className="flex w-full h-full bg-[rgb(var(--background-light))] relative"> {/* REVERTED */}
      <FloatingThemeSelector />
      
      {/* Mobile overlay */}
      {!collapsed && isMobile && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setCollapsed(true)}
        />
      )}

      {/* Main Sidebar */}
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        toggleSecondarySidebar={toggleSecondarySidebar}
        activeSidebarItem={activeSidebarItem}
      />

      {/* Nested Sidebar - OVERLAY STYLE (doesn't affect layout) */}
      {secondarySidebarOpen && activeSidebarItem && (
        <div
          ref={nestedSidebarRef}
          onMouseEnter={handleMouseEnterNested}
          onMouseLeave={handleMouseLeaveNested}
          className="fixed top-0 z-40 h-full transition-all duration-300 ease-out shadow-2xl"
          style={{
            marginTop: `${NAVBAR_HEIGHT}px`,
            left: `${mainSidebarWidth}px`,
            width: `${SECONDARY_SIDEBAR_WIDTH}px`,
            zIndex: 40,
            transform: secondarySidebarOpen ? 'translateX(0)' : 'translateX(-20px)',
            opacity: secondarySidebarOpen ? 1 : 0,
            backdropFilter: 'blur(10px)',
            backgroundColor: 'rgba(var(--sidebar-bg), 0.98)',
            borderRight: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '4px 0 30px rgba(0, 0, 0, 0.15)',
          }}
        >
          <NestedSidebar
            collapsed={collapsed}
            activeItem={activeSidebarItem}
            toggleSecondarySidebar={toggleSecondarySidebar}
          />
        </div>
      )}

      {/* Main Content Area - FIXED: Never shifts */}
      <div
        className="flex-1 transition-all duration-300 min-w-0" 
        style={{
          marginLeft: collapsed ? '80px' : `${SIDEBAR_WIDTH}px`, /* REVERTED: Your original calculation */
          paddingTop: `${NAVBAR_HEIGHT}px`,
        }}
      >
        <Navbar collapsed={collapsed} toggleSidebar={toggleSidebar} portal="admin" />

        <div className="w-full z-1 shadow-sm bg-[rgb(var(--dashboard--background))]"> {/* REVERTED */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between p-4">
            <Breadcrumb items={breadcrumbItems} />
          </div>
        </div>

        <main
          className="px-6 py-4 transition-all duration-300" /* REVERTED: Your original padding */
          style={{
            minHeight: `calc(100vh - ${NAVBAR_HEIGHT}px - 68px)`,
            // NO marginLeft here - content stays in place
          }}
        >
          <Head>
            <link rel="icon" type="image/png" href="/logo/opengraph-image.png" sizes="32x32" />
            <link rel="icon" href="/logo/opengraph-image.png" />
            <link rel="apple-touch-icon" href="/logo/opengraph-image.png" />
          </Head>
          
          {/* Responsive content container */}
          <div className="max-w-full">
            {children}
          </div>
        </main>

        {/* Footer - REMOVED (you didn't have footer in original) */}
      </div>
    </div>
  );
};

export default DashboardLayout;