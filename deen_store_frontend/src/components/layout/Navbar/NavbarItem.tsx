import { NavbarItemProps } from '@/types/ui';
import React from 'react';



const NavbarItem: React.FC<NavbarItemProps> = ({ label, icon, onClick }) => {
  return (
    <div
      className="flex items-center space-x-2 cursor-pointer hover:bg-gray-700 px-4 py-2 rounded-md transition duration-300"
      onClick={onClick}
    >
      <div className="text-white">{icon}</div>
      <span className="text-white">{label}</span>
    </div>
  );
};

export default NavbarItem;