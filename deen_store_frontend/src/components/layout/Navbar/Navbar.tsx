import React from 'react';
import { Colors } from '@/constants/colors';
import { ChevronLeft, ChevronRight, Menu, Bell, User, Search } from 'lucide-react';

const Navbar = ({ collapsed, toggleSidebar }: { collapsed: boolean, toggleSidebar: () => void }) => {
  return (
    <div
      className={`fixed top-0 z-20 transition-all duration-300 shadow-sm`}
      style={{
        left: collapsed ? '80px' : '250px',
        right: 0,
        height: '64px',
        backgroundColor: Colors.SIERRA,
      }}
    >
      <div className="flex items-center justify-between h-full px-6">
        {/* Left side - Mobile menu button */}
        <button
          className="md:hidden text-white p-2 rounded-md hover:bg-opacity-20 hover:bg-white"
          onClick={toggleSidebar}
        >
          <Menu size={24} />
        </button>

        {/* Search bar - Center content */}
        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              className="bg-gray-700 text-white text-sm rounded-lg block w-full pl-10 p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Search..."
            />
          </div>
        </div>

        {/* Right side - Controls */}
        <div className="flex items-center space-x-4">
          {/* Notification */}
          <button className="p-2 text-gray-300 hover:text-white relative">
            <Bell size={20} />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User profile */}
          <div className="flex items-center space-x-2 cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
              <User size={18} className="text-white" />
            </div>
            <span className="hidden md:inline text-white text-sm">John Doe</span>
          </div>

          {/* Desktop toggle button */}
          <button
            className="hidden md:flex items-center justify-center text-white p-1 rounded-full hover:bg-opacity-20 hover:bg-white"
            onClick={toggleSidebar}
          >
            {collapsed ? (
              <ChevronRight size={24} strokeWidth={2} />
            ) : (
              <ChevronLeft size={24} strokeWidth={2} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Navbar;