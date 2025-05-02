import React, { useState, useEffect } from 'react';
import { Bell, User2Icon, UserCircle, Moon, Sun, Zap } from 'lucide-react';
import Button from '@/components/ui/buttons/button';
import DropDown from '@/components/ui/dropdown/dropdown';
import Image from 'next/image';
import SearchBar from '@/components/ui/search/SearchBar';
import Model from '@/components/ui/modals/model';
import { applySavedTheme, getInitialTheme, Theme, toggleTheme } from '@/utility/theme';

const Navbar = ({
    collapsed,
    toggleSidebar,
}: {
    collapsed: boolean;
    toggleSidebar: () => void;
}) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
    const [theme, setTheme] = useState<Theme>('light');

    const handleToggle = () => {
        if (window.innerWidth < 768) {
            setMobileMenuOpen(!mobileMenuOpen);
        } else {
            toggleSidebar();
        }
    };

    // Initialize theme state based on saved theme (only on the client side)
    useEffect(() => {
        setTheme(getInitialTheme());
        applySavedTheme();
    }, []);

    const handleToggleTheme = () => {
        const newTheme = toggleTheme();
        setTheme(newTheme);
    };

    const notificationItems = [
        { label: 'New comment on your post', href: '#' },
        { label: 'New follower', href: '#' },
        { label: 'Server maintenance scheduled', href: '#' },
    ];

    const handleSearchClick = () => {
        setIsSearchModalOpen(true);  // Open modal on click
    };

    useEffect(() => {
        console.log('Current Theme:', theme); // Debugging
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    return (
        <nav
            className="fixed top-0 z-50 border-b border-gray-200 dark:border-gray-700 transition-all duration-300"
            style={{
                left: 0,
                width: '100%',
                height: '64px',
                boxShadow: '0 4px 30px rgba(0, 0, 0, 0.2)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.15)',
            }}
        >
            <div className="flex justify-between items-center h-full px-4 text-white">
                {/* Left Section */}
                <div className="flex items-center space-x-4">
                    <Button
                        variant="ghost"
                        onClick={handleToggle}
                        className="p-2 rounded-full text-white hover:bg-white hover:bg-opacity-10"
                        aria-label="Toggle Sidebar"
                    >
                        {mobileMenuOpen ? '✕' : '☰'}
                    </Button>
                    <div className="text-lg font-semibold">
                        <Image src="/dashboard_logo/main.png" alt="alt" width={150} height={150} />
                    </div>
                </div>

                {/* Search Bar */}
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
                    <button
                        onClick={handleToggleTheme}
                        className="p-2 rounded-full text-gray-700 dark:text-gray-200 neon:text-neon-500 hover:bg-gray-100 dark:hover:bg-gray-700 neon:hover:bg-neon-800"
                        aria-label="Toggle theme"
                    >
                        {theme === 'dark' ? (
                            <Sun size={20} />
                        ) : theme === 'neon' ? (
                            <Zap size={20} />
                        ) : (
                            <Moon size={20} />
                        )}
                    </button>
                    {/* Notification Dropdown */}
                    <DropDown
                        icon={<Bell size={20} color="#d5bdab" />}
                        variant="navbar"
                        collapsed={false}
                        items={notificationItems}
                    />

                    {/* Profile Dropdown */}
                    <div className="relative">
                        <DropDown
                            icon={<User2Icon color="#d5bdab" />}
                            variant="navbar"
                            collapsed={false}
                            items={[
                                { label: 'Settings', href: '/settings' },
                                { label: 'Logout', href: '/logout' },
                            ]}
                        />
                    </div>
                    <div className="relative">
                        <DropDown
                            icon={<UserCircle color="#d5bdab" />}
                            variant="navbar"
                            collapsed={false}
                            items={[
                                { label: 'Settings', href: '/settings' },
                                { label: 'Logout', href: '/logout' },
                            ]}
                        />
                    </div>
                </div>
            </div>

            {/* Mobile Dropdown */}
            <div
                className={`md:hidden bg-gray-900 text-white px-4 py-2 transform transition-transform duration-300 ease-out ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <a href="#" className="block py-1">Dashboard</a>
                <a href="#" className="block py-1">Settings</a>
                <a href="#" className="block py-1">Logout</a>
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