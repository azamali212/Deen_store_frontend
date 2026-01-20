'use client';

import React, { useState, useEffect } from 'react';
import { Bell, UserCircle, Moon, Sun, Search, LogOut, Menu, X, ChevronDown, Settings, User2Icon } from 'lucide-react';
import SearchBar from '@/components/ui/search/SearchBar';
import Model from '@/components/ui/modals/model';
import { useAppDispatch } from '@/store';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/auth/useAuth';
import { AuthStorage } from '@/core/auth/auth.storage';
import { AuthSession } from '@/core/auth/auth.machine';
import { applySavedTheme, toggleTheme } from '@/utility/theme'; // Add this import
import { COLORS } from '@/constants/colors'; // Add this import
import { useTheme } from '@/hooks/theme/useTheme';

// Define searchable pages and their routes
const SEARCHABLE_PAGES = [
  {
    name: 'Dashboard',
    path: '/dashboard',
    icon: '📊'
  },
  {
    name: 'Products',
    path: '/dashboard/products',
    icon: '🛍️'
  },
  {
    name: 'Orders',
    path: '/dashboard/orders',
    icon: '📦'
  },
  {
    name: 'Settings',
    path: '/dashboard/settings',
    icon: '⚙️'
  },
  {
    name: 'User Management',
    path: '/dashboard/users',
    icon: '👥'
  },
  {
    name: 'Analytics',
    path: '/dashboard/analytics',
    icon: '📈'
  },
  {
    name: 'Inventory',
    path: '/dashboard/inventory',
    icon: '📦'
  },
  {
    name: 'Permissions',
    path: '/dashboard/permissions',
    icon: '🔐'
  },
  {
    name: 'Roles',
    path: '/dashboard/roles',
    icon: '🔖'
  },
];

const Navbar = ({
  collapsed,
  toggleSidebar,
  portal = "admin"
}: {
  collapsed: boolean;
  toggleSidebar: () => void;
  portal?: "admin" | "customer";
}) => {
  const themeContext = useTheme();
  const dispatch = useAppDispatch();
  const { logout: authLogout, auth } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [currentUser, setCurrentUser] = useState({
    name: 'Loading...',
    email: 'loading@example.com',
    role: 'Loading...'
  });
  const [notifications] = useState([
    { id: 1, title: 'New order received', time: '2 min ago', read: false },
    { id: 2, title: 'Server backup completed', time: '1 hour ago', read: true },
    { id: 3, title: 'New user registered', time: '3 hours ago', read: false },
    { id: 4, title: 'Payment processed', time: '5 hours ago', read: true },
  ]);

  const { theme, toggleTheme, setTheme } = themeContext || {};
  // Get current colors based on theme
  const colors = theme === 'dark' ? COLORS.dark : COLORS.light;

   // Simplified theme toggle
   const handleToggleTheme = () => {
    if (toggleTheme) {
      toggleTheme();
    }
  };

  // ==============================
  // Navbar user types
  // ==============================
  type NavbarUser = {
    name: string;
    email: string;
    role: string;
  };

  // ==============================
  // Fallback user (safe default)
  // ==============================
  const getFallbackUser = (): NavbarUser => {
    return {
      name: "User",
      email: "user@example.com",
      role: "User",
    };
  };
  const getCurrentUser = async (): Promise<NavbarUser> => {
    try {
      console.log('🔍 Getting current user for portal:', portal);
      
      // 1. First, try to get user from Redux auth state
      if (auth?.sessions) {
        const sessions = auth.sessions as Record<string, any>;
        
        const session = Object.values(sessions).find(
          (s: any) => s.phase === "authenticated" && s.portal === portal
        ) || Object.values(sessions).find((s: any) => s.phase === "authenticated");
        
        if (session?.user) {
          console.log('✅ Found user in Redux session:', session.user);
          return {
            name: session.user.name || session.user.username || session.user.email || 'User',
            email: session.user.email || session.email || 'user@example.com',
            role: session.user.role?.[0] || session.user.active_role || (portal === 'admin' ? 'Administrator' : 'Customer')
          };
        }
      }
      
      // 2. If no user in Redux, try to fetch from backend API
      console.log('📡 No user in Redux, fetching from backend...');
      
      // Get token from storage
      const token = AuthStorage.getAccessToken(portal);
      console.log('🔑 Token available:', !!token);
      
      if (token) {
        try {
          // Fetch user data from backend API
          // Note: You need to adjust this endpoint to match your actual API
          const response = await fetch('http://127.0.0.1:8000/api/v1/current-profile', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            credentials: 'include' // Include cookies if needed
          });
          
          console.log('📡 Backend response status:', response.status);
          
          if (response.ok) {
            const data = await response.json();
            console.log('✅ Backend user data:', data);
            
            // Extract user from response (adjust based on your API response structure)
            const user = data.data?.user || data.user || data.data || data;
            
            if (user && (user.name || user.email)) {
              // Store user in localStorage for future use
              if (typeof window !== 'undefined') {
                localStorage.setItem('current_user', JSON.stringify(user));
              }
              
              return {
                name: user.name || user.username || user.email || 'User',
                email: user.email || 'user@example.com',
                role: user.role?.[0] || user.active_role || (portal === 'admin' ? 'Administrator' : 'Customer')
              };
            }
          } else {
            console.error('❌ Backend fetch failed:', response.status, response.statusText);
          }
        } catch (apiError) {
          console.error('❌ API fetch error:', apiError);
        }
      }
      
      // 3. Try localStorage as fallback
      if (typeof window !== 'undefined') {
        console.log('🔍 Checking localStorage for user data...');
        
        // Check for stored user data
        const storedUser = localStorage.getItem('current_user');
        if (storedUser) {
          try {
            const userData = JSON.parse(storedUser);
            console.log('📦 Found user in localStorage:', userData);
            
            if (userData.name || userData.email) {
              return {
                name: userData.name || userData.username || userData.email || 'User',
                email: userData.email || 'user@example.com',
                role: userData.role?.[0] || userData.active_role || (portal === 'admin' ? 'Administrator' : 'Customer')
              };
            }
          } catch (e) {
            console.error('❌ Error parsing localStorage user:', e);
          }
        }
        
        // Also check for stored login/otp response
        const storedKeys = ['otp_response', 'login_response', 'auth_response'];
        for (const key of storedKeys) {
          const stored = localStorage.getItem(key);
          if (stored) {
            try {
              const response = JSON.parse(stored);
              if (response.user) {
                console.log(`✅ Found user in localStorage.${key}:`, response.user);
                
                // Store for future use
                localStorage.setItem('current_user', JSON.stringify(response.user));
                
                return {
                  name: response.user.name || response.user.username || response.user.email || 'User',
                  email: response.user.email || 'user@example.com',
                  role: response.user.role?.[0] || response.user.active_role || (portal === 'admin' ? 'Administrator' : 'Customer')
                };
              }
            } catch (e) {
              console.log(`❌ Error parsing ${key}:`, e);
            }
          }
        }
      }
      
      console.log('❌ No user data found anywhere, using fallback');
      return getFallbackUser();
      
    } catch (error) {
      console.error('❌ Error getting user data:', error);
      return getFallbackUser();
    }
  };

  // Load user data on mount and when auth changes
  useEffect(() => {
    const loadUserData = async () => {
      const user = await getCurrentUser();
      setCurrentUser(user);
    };

    loadUserData();
  }, [auth, portal]);

  // Handle search functionality
  const handleSearch = (query: string) => {
    setSearchQuery(query);

    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    const results = SEARCHABLE_PAGES.filter(page =>
      page.name.toLowerCase().includes(query.toLowerCase())
    ).map(page => ({
      ...page,
      onClick: () => {
        router.push(page.path);
        setIsSearchModalOpen(false);
        setSearchQuery('');
      }
    }));

    setSearchResults(results);
  };

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Read theme from localStorage on mount
  useEffect(() => {
    const savedTheme = applySavedTheme();
    setTheme(savedTheme || 'light');
  }, []);

  // Apply theme to document and save to localStorage on change
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [theme]);


  // Fixed logout function
  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    try {
      // Determine which portal we're in (admin or customer)
      const currentPath = window.location.pathname;
      let currentPortal: "admin" | "customer" = portal; // Use prop as default

      // Auto-detect if portal prop not provided
      if (!portal) {
        if (currentPath.includes('/customer/') || currentPath === '/userInterface') {
          currentPortal = 'customer';
        } else if (currentPath.includes('/admin/') || currentPath === '/dashboard') {
          currentPortal = 'admin';
        }
      }

      console.log(`Logging out from portal: ${currentPortal}`);

      // Call the logout function from auth hook
      await authLogout(currentPortal);

      // The redirect will happen in the authSlice logout reducer
    } catch (error) {
      console.error('Logout error:', error);
      // Force redirect even if logout fails
      const currentPath = window.location.pathname;
      const loginPage = currentPath.includes('/admin') ? '/admin/login' : '/customer/login';
      window.location.href = loginPage;
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleToggle = () => {
    if (window.innerWidth < 768) {
      setMobileMenuOpen(!mobileMenuOpen);
    } else {
      toggleSidebar();
    }
  };

  const handleSearchClick = () => {
    setIsSearchModalOpen(true);
  };

  const unreadNotifications = notifications.filter(n => !n.read).length;

  return (
    <nav
      className="fixed top-0 z-50 transition-all duration-300 border-b"
      style={{
        left: 0,
        width: '100%',
        height: '64px',
        backgroundColor: `rgb(${colors.sidebar.bg})`,
        backdropFilter: 'blur(10px)',
        borderBottom: `1px solid ${colors.border}`,
        boxShadow: isScrolled ? '0 4px 20px rgba(0, 0, 0, 0.08)' : 'none',
      }}
    >
      <div className="flex justify-between items-center h-full px-4 lg:px-6">
        {/* Left Section */}
        <div className="flex items-center space-x-3">
          <button
            onClick={handleToggle}
            className="flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 group"
            style={{
              background: `linear-gradient(135deg, ${colors.primary.light}20, ${colors.primary.dark}20)`,
            }}
            aria-label="Toggle Sidebar"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" style={{ color: colors.primary.main }} />
            ) : (
              <Menu className="w-5 h-5" style={{ color: colors.primary.main }} />
            )}
          </button>

          {/* Logo/Brand */}
          <div className="flex items-center space-x-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${colors.primary.main}, ${colors.primary.dark})`,
              }}
            >
              <span className="text-white font-bold text-lg">D</span>
            </div>
            {!collapsed && (
              <div className="hidden md:block">
                <h1 className="text-lg font-bold" style={{ color: colors.text.primary }}>Dashboard</h1>
                <p className="text-xs" style={{ color: colors.text.secondary }}>Admin Panel</p>
              </div>
            )}
          </div>
        </div>

        {/* Search Bar - Desktop */}
        <div className="hidden md:block flex-1 max-w-md mx-6">
          <div onClick={handleSearchClick} className="relative cursor-pointer w-full">
            <div 
              className="flex items-center rounded-xl px-4 py-2.5 shadow-sm hover:shadow-md transition-all duration-200 backdrop-blur-sm border"
              style={{
                backgroundColor: theme === 'dark' ? 'rgba(31, 41, 55, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                color: colors.text.secondary,
                borderColor: colors.border,
              }}
            >
              <Search className="w-4 h-4 mr-3" style={{ color: colors.text.secondary }} />
              <span style={{ color: colors.text.secondary }}>Search dashboard...</span>
              <div className="ml-auto flex items-center space-x-1">
                <kbd className="px-2 py-1 text-xs rounded" style={{ 
                  backgroundColor: theme === 'dark' ? colors.surface : '#F3F4F6',
                  color: colors.text.secondary
                }}>⌘</kbd>
                <kbd className="px-2 py-1 text-xs rounded" style={{ 
                  backgroundColor: theme === 'dark' ? colors.surface : '#F3F4F6',
                  color: colors.text.secondary
                }}>K</kbd>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section - COMPACT VERSION */}
        <div className="flex items-center space-x-1">
          {/* Search Icon - Mobile */}
          <button
            onClick={handleSearchClick}
            className="md:hidden flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200"
            style={{
              background: `linear-gradient(135deg, ${colors.primary.light}10, ${colors.primary.dark}10)`,
            }}
            aria-label="Search"
          >
            <Search className="w-4 h-4" style={{ color: colors.primary.main }} />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={handleToggleTheme}
            className="flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200 group relative"
            style={{
              background: `linear-gradient(135deg, ${colors.primary.light}10, ${colors.primary.dark}10)`,
            }}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-yellow-500 group-hover:rotate-45 transition-transform duration-300" />
            ) : (
              <Moon className="w-4 h-4" style={{ color: colors.primary.main }} />
            )}
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200 relative"
              style={{
                background: `linear-gradient(135deg, ${colors.primary.light}10, ${colors.primary.dark}10)`,
              }}
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" style={{ color: colors.primary.main }} />
              {unreadNotifications > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center animate-pulse">
                  {unreadNotifications}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 top-11 w-80 rounded-xl shadow-2xl z-50 overflow-hidden"
                style={{
                  backgroundColor: colors.surface,
                  border: `1px solid ${colors.border}`,
                }}
              >
                <div className="p-4 border-b" style={{ borderColor: colors.border }}>
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold" style={{ color: colors.text.primary }}>Notifications</h3>
                    <span 
                      className="text-xs cursor-pointer hover:underline"
                      style={{ color: colors.primary.main }}
                    >
                      Mark all as read
                    </span>
                  </div>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 border-b transition-colors ${!notification.read ? '' : ''}`}
                      style={{
                        borderColor: colors.border,
                        backgroundColor: !notification.read 
                          ? (theme === 'dark' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(79, 70, 229, 0.05)')
                          : 'transparent',
                      }}
                    >
                      <div className="flex items-start space-x-2">
                        <div 
                          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{
                            background: `linear-gradient(135deg, ${colors.primary.main}, ${colors.primary.dark})`,
                          }}
                        >
                          <Bell className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium" style={{ color: colors.text.primary }}>
                            {notification.title}
                          </p>
                          <p className="text-xs mt-0.5" style={{ color: colors.text.secondary }}>
                            {notification.time}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: colors.primary.main }}></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 border-t" style={{ borderColor: colors.border }}>
                  <button 
                    className="w-full py-2 text-sm font-medium rounded-lg transition-colors"
                    style={{ 
                      color: colors.primary.main,
                      backgroundColor: theme === 'dark' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(79, 70, 229, 0.1)',
                    }}
                  >
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Profile Menu - COMPACT VERSION */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center space-x-2 px-2.5 py-1.5 rounded-xl transition-all duration-200 group"
              style={{
                background: `linear-gradient(135deg, ${colors.primary.light}10, ${colors.primary.dark}10)`,
              }}
            >
              <div 
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${colors.primary.main}, ${colors.primary.dark})`,
                }}
              >
                <User2Icon className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-semibold truncate max-w-[120px]" style={{ color: colors.text.primary }}>
                  {currentUser.name}
                </p>
                <p className="text-[10px] truncate max-w-[120px]" style={{ color: colors.text.secondary }}>
                  {currentUser.role}
                </p>
              </div>
              <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${showProfileMenu ? 'rotate-180' : ''}`} 
                style={{ color: colors.text.secondary }}
              />
            </button>

            {/* Profile Dropdown */}
            {showProfileMenu && (
              <div className="absolute right-0 top-10 w-56 rounded-xl shadow-2xl z-50 overflow-hidden"
                style={{
                  backgroundColor: colors.surface,
                  border: `1px solid ${colors.border}`,
                }}
              >
                <div className="p-3 border-b" style={{ borderColor: colors.border }}>
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{
                        background: `linear-gradient(135deg, ${colors.primary.main}, ${colors.primary.dark})`,
                      }}
                    >
                      <User2Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold truncate" style={{ color: colors.text.primary }}>
                        {currentUser.name}
                      </h3>
                      <p className="text-xs truncate" style={{ color: colors.text.secondary }}>
                        {currentUser.email}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="py-1">
                  <a
                    href="/dashboard/profile"
                    className="flex items-center px-3 py-2 text-sm transition-colors"
                    style={{ 
                      color: colors.text.primary,
                      backgroundColor: 'transparent',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(55, 65, 81, 0.5)' : 'rgba(243, 244, 246, 1)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <UserCircle className="w-4 h-4 mr-2" style={{ color: colors.text.secondary }} />
                    <span>My Profile</span>
                  </a>
                  <a
                    href="/dashboard/settings"
                    className="flex items-center px-3 py-2 text-sm transition-colors"
                    style={{ 
                      color: colors.text.primary,
                      backgroundColor: 'transparent',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(55, 65, 81, 0.5)' : 'rgba(243, 244, 246, 1)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <Settings className="w-4 h-4 mr-2" style={{ color: colors.text.secondary }} />
                    <span>Settings</span>
                  </a>
                  <div className="mx-3 my-1 border-t" style={{ borderColor: colors.border }}></div>
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="flex items-center w-full px-3 py-2 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ 
                      color: colors.error,
                      backgroundColor: 'transparent',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(254, 226, 226, 1)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden fixed top-16 left-0 right-0 shadow-xl border-t transform transition-transform duration-300 ease-out ${mobileMenuOpen ? 'translate-y-0' : '-translate-y-full'}`}
        style={{
          backgroundColor: colors.surface,
          borderColor: colors.border,
        }}
      >
        <div className="p-4 space-y-2">
          <div className="flex items-center justify-between p-2 rounded-lg"
            style={{
              backgroundColor: theme === 'dark' ? colors.background : '#F9FAFB',
            }}
          >
            <div className="flex items-center space-x-2">
              <div 
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${colors.primary.main}, ${colors.primary.dark})`,
                }}
              >
                <User2Icon className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: colors.text.primary }}>
                  {currentUser.name}
                </p>
                <p className="text-xs truncate" style={{ color: colors.text.secondary }}>
                  {currentUser.role}
                </p>
              </div>
            </div>
          </div>

          <a href="/dashboard/profile" className="flex items-center p-2 rounded-lg transition-colors"
            style={{ 
              color: colors.text.primary,
              backgroundColor: 'transparent',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(55, 65, 81, 0.5)' : 'rgba(243, 244, 246, 1)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <UserCircle className="w-4 h-4 mr-2" style={{ color: colors.text.secondary }} />
            <span className="text-sm">Profile</span>
          </a>

          <a href="/dashboard/settings" className="flex items-center p-2 rounded-lg transition-colors"
            style={{ 
              color: colors.text.primary,
              backgroundColor: 'transparent',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(55, 65, 81, 0.5)' : 'rgba(243, 244, 246, 1)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <Settings className="w-4 h-4 mr-2" style={{ color: colors.text.secondary }} />
            <span className="text-sm">Settings</span>
          </a>

          <div className="border-t my-1" style={{ borderColor: colors.border }}></div>

          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className={`flex items-center w-full p-2 rounded-lg transition-colors ${isLoggingOut ? 'opacity-50' : ''}`}
            style={{ 
              color: colors.error,
              backgroundColor: 'transparent',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(254, 226, 226, 1)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <LogOut className="w-4 h-4 mr-2" />
            <span className="text-sm">{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
          </button>
        </div>
      </div>

      {/* Click outside handlers */}
      {showNotifications && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowNotifications(false)}
        />
      )}

      {showProfileMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowProfileMenu(false)}
        />
      )}

      {/* Search Modal */}
      <Model
        isOpen={isSearchModalOpen}
        onClose={() => {
          setIsSearchModalOpen(false);
          setSearchQuery('');
          setSearchResults([]);
        }}
        title="Search Dashboard"
        size="lg"
      >
        <div className="p-6" style={{ backgroundColor: colors.surface }}>
          <SearchBar
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search pages, settings, users..."
            autoFocus
            className="mb-6"
          />

          {searchResults.length > 0 ? (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold mb-3" style={{ color: colors.text.secondary }}>Search Results</h4>
              {searchResults.map((result, index) => (
                <button
                  key={index}
                  onClick={result.onClick}
                  className="flex items-center w-full p-3 rounded-xl transition-all duration-200 group"
                  style={{
                    backgroundColor: 'transparent',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(55, 65, 81, 0.5)' : 'rgba(243, 244, 246, 1)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <div 
                    className="w-9 h-9 rounded-lg flex items-center justify-center mr-3"
                    style={{
                      background: `linear-gradient(135deg, ${colors.primary.light}20, ${colors.primary.dark}20)`,
                    }}
                  >
                    <span className="text-base">{result.icon}</span>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium" style={{ color: colors.text.primary }}>{result.name}</p>
                    <p className="text-xs" style={{ color: colors.text.secondary }}>{result.path}</p>
                  </div>
                </button>
              ))}
            </div>
          ) : searchQuery ? (
            <div className="text-center py-6">
              <div 
                className="w-14 h-14 mx-auto mb-3 rounded-full flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${colors.primary.light}20, ${colors.primary.dark}20)`,
                }}
              >
                <Search className="w-6 h-6" style={{ color: colors.text.secondary }} />
              </div>
              <h3 className="text-base font-semibold mb-1" style={{ color: colors.text.primary }}>No results found</h3>
              <p className="text-sm" style={{ color: colors.text.secondary }}>Try searching for something else</p>
            </div>
          ) : (
            <div className="text-center py-6">
              <div 
                className="w-14 h-14 mx-auto mb-3 rounded-full flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${colors.primary.light}20, ${colors.primary.dark}20)`,
                }}
              >
                <Search className="w-6 h-6" style={{ color: colors.primary.main }} />
              </div>
              <h3 className="text-base font-semibold mb-1" style={{ color: colors.text.primary }}>Search Dashboard</h3>
              <p className="text-sm mb-3" style={{ color: colors.text.secondary }}>Type to search pages, settings, and features</p>
              <div className="grid grid-cols-2 gap-2 max-w-md mx-auto">
                <div className="p-2 rounded-lg" style={{ backgroundColor: theme === 'dark' ? colors.background : '#F9FAFB' }}>
                  <p className="text-xs font-medium" style={{ color: colors.text.primary }}>Quick Tips</p>
                  <p className="text-[10px]" style={{ color: colors.text.secondary }}>Press ⌘K anytime</p>
                </div>
                <div className="p-2 rounded-lg" style={{ backgroundColor: theme === 'dark' ? colors.background : '#F9FAFB' }}>
                  <p className="text-xs font-medium" style={{ color: colors.text.primary }}>Recent</p>
                  <p className="text-[10px]" style={{ color: colors.text.secondary }}>Check your history</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </Model>
    </nav>
  );
};

export default Navbar;