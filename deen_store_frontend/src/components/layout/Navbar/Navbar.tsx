'use client';

import React, { useState, useEffect } from 'react';
import { Bell, User2Icon, UserCircle, Moon, Sun, Search } from 'lucide-react';
import Button from '@/components/ui/buttons/button';
import DropDown from '@/components/ui/dropdown/dropdown';
import Image from 'next/image';
import SearchBar from '@/components/ui/search/SearchBar';
import Model from '@/components/ui/modals/model';
import { logout } from '@/features/auth/authSlice';
import { useAppDispatch } from '@/store';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

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
    name: 'User',
    path: '/user',
    icon: '👤'
  },
  {
    name: 'Permissions',
    path: '/permissions',
    icon: '🔐'
  },
  {
    name: 'Role',
    path: '/role',
    icon: '🔖'
  },
  // Add more pages as needed
];

const Navbar = ({
  collapsed,
  toggleSidebar,
}: {
  collapsed: boolean;
  toggleSidebar: () => void;
}) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

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
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'dark' || storedTheme === 'light') {
      setTheme(storedTheme);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    }
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

  const handleToggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleLogout = async () => {
    await dispatch(logout());
    // Clear any remaining localStorage items
    localStorage.removeItem('multiGuardAuth');
    localStorage.removeItem('token');
    // Set a logout event for other tabs
    localStorage.setItem('logout-event', Date.now().toString());
    localStorage.removeItem('logout-event');
    Cookies.remove('token');
    Cookies.remove('PHPSESSID');
    localStorage.removeItem('multiGuardAuth');
    // Redirect
    window.location.href = '/shopinity_admin_login';
  };

  const handleToggle = () => {
    if (window.innerWidth < 768) {
      setMobileMenuOpen(!mobileMenuOpen);
    } else {
      toggleSidebar();
    }
  };

  const notificationItems = [
    { label: 'New comment on your post', href: '#' },
    { label: 'New follower', href: '#' },
    { label: 'Server maintenance scheduled', href: '#' },
  ];

  const handleSearchClick = () => {
    setIsSearchModalOpen(true);
  };

  return (
    <nav
      className="fixed top-0 z-50 border-b transition-all duration-300"
      style={{
        left: 0,
        width: '100%',
        height: '64px',
        backgroundColor: isScrolled ? 'rgb(var(--nav))' : 'transparent',
        boxShadow: isScrolled ? '0 2px 8px rgba(0, 0, 0, 0.2)' : 'none',
        borderBottom: isScrolled
          ? '1px solid rgba(255, 255, 255, 0.15)'
          : '1px solid transparent',
      }}
    >
      <div className="flex justify-between items-center h-full px-4 text-white">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={handleToggle}
            className="p-2 rounded-full text-gray-500 hover:bg-gray-500 hover:bg-opacity-10"
            aria-label="Toggle Sidebar"
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </Button>
          <div className="text-lg font-semibold">
            <Image src="/dashboard_logo/main.png" alt="logo" width={150} height={150} />
          </div>
        </div>

        {/* Search Bar - Desktop */}
        <div className="hidden md:block flex-1 max-w-sm mx-6">
          <div onClick={handleSearchClick} className="relative cursor-pointer w-full">
            <div className="flex items-center bg-white text-gray-600 rounded-full px-4 py-2 shadow-md hover:shadow-lg transition">
              <Search className="w-4 h-4 mr-2 text-gray-500" />
              <span className="text-gray-500">Search...</span>
            </div>
          </div>
        </div>

        {/* Search Icon - Mobile */}
        <div className="block md:hidden">
          <button
            onClick={handleSearchClick}
            className="p-2 rounded-full text-white hover:bg-white hover:bg-opacity-10"
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </button>
        </div>

        {/* Right Section */}
        <div className="hidden sm:flex items-center">
          <Button
            onClick={handleToggleTheme}
            className="p-2 rounded-full text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun size={20} color="#d5bdab" />
            ) : (
              <Moon size={20} color="#d5bdab" />
            )}
          </Button>

          {/* Notification Dropdown */}
          <DropDown
            icon={<Bell size={20} color="#d5bdab" />}
            variant="navbar"
            collapsed={false}
            items={notificationItems}
          />

          {/* Profile Dropdown */}
          <DropDown
            icon={<User2Icon color="#d5bdab" />}
            variant="navbar"
            collapsed={false}
            items={[
              { label: 'Settings', href: '/settings' },
              { label: 'Logout', onClick: handleLogout },
            ]}
          />
        </div>
      </div>

      {/* Mobile Dropdown */}
      <div
        className={`md:hidden bg-gray-900 text-white px-4 py-2 transform transition-transform duration-300 ease-out ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <a href="#" className="block py-1">Dashboard</a>
        <a href="#" className="block py-1">Settings</a>
        <button onClick={handleLogout} className="block py-1 text-left w-full">Logout</button>
        <div className="border-t border-gray-700 my-2" />
        <button className="relative p-2 hover:text-gray-200 w-full text-left">
          <Bell size={20} className="inline-block mr-2" />
          Notifications
        </button>
        <div className="flex items-center mt-2">
          <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
            <User2Icon size={18} />
          </div>
          <span className="ml-2">John Doe</span>
        </div>
      </div>

      {/* Search Modal */}
      <Model
        isOpen={isSearchModalOpen}
        onClose={() => {
          setIsSearchModalOpen(false);
          setSearchQuery('');
          setSearchResults([]);
        }}
        title="Search"
        size="md"
      >
        <div className="p-4">
          <SearchBar
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search pages..."
            autoFocus
          />

          {searchResults.length > 0 ? (
            <div className="mt-4 space-y-2">
              {searchResults.map((result, index) => (
                <button
                  key={index}
                  onClick={result.onClick}
                  className="flex items-center w-full p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <span className="mr-3 text-lg">{result.icon}</span>
                  <span className="text-gray-700 dark:text-gray-200">{result.name}</span>
                </button>
              ))}
            </div>
          ) : searchQuery ? (
            <div className="mt-4 text-center text-gray-500 dark:text-gray-400">
              No results found for "{searchQuery}"
            </div>
          ) : (
            <div className="mt-4 text-center text-gray-500 dark:text-gray-400">
              Start typing to search pages
            </div>
          )}
        </div>
      </Model>
    </nav>
  );
};

export default Navbar;