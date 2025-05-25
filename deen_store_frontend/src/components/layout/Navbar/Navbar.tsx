'use client';

import React, { useState, useEffect } from 'react';
import {
  Bell,
  User2Icon,
  UserCircle,
  Moon,
  Sun,
} from 'lucide-react';
import Button from '@/components/ui/buttons/button';
import DropDown from '@/components/ui/dropdown/dropdown';
import Image from 'next/image';
import SearchBar from '@/components/ui/search/SearchBar';
import Model from '@/components/ui/modals/model';
import { logout } from '@/features/auth/authSlice';
import { useAppDispatch } from '@/store';

const Navbar = ({
  collapsed,
  toggleSidebar,
}: {
  collapsed: boolean;
  toggleSidebar: () => void;
}) => {
  const dispatch = useAppDispatch();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Read theme from localStorage on mount
  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'dark' || storedTheme === 'light') {
      setTheme(storedTheme);
    } else {
      // If no theme stored, detect system preference
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
    // Redirect after logout
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
      className="fixed top-0 z-50 bg-[rgb(var(--nav))] border-b border-gray-200 dark:border-gray-700 transition-all duration-300"
      style={{
        left: 0,
        width: '100%',
        height: '64px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.15)',
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
              <span className="mr-2">🔍</span>
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
            🔍
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
          <DropDown
            icon={<UserCircle color="#d5bdab" />}
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
        onClose={() => setIsSearchModalOpen(false)}
        title="Search"
        size="md"
      >
        <SearchBar />
      </Model>
    </nav>
  );
};

export default Navbar;