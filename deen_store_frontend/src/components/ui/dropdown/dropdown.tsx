import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { DropDownProps } from '@/types/ui';
import { Colors } from '@/constants/colors'; 

const DropDown: React.FC<DropDownProps> = ({ icon, label, collapsed, items }) => {
    const [open, setOpen] = useState(false);
  
    const toggleDropdown = () => {
      if (!collapsed) setOpen(!open);
    };
  
    return (
      <div className={`transition-all duration-200 ease-linear ${collapsed ? 'mx-auto ' : 'w-full'}`}>
        <div
          className={`flex items-center p-3 rounded-lg cursor-pointer ${
            collapsed ? 'justify-center' : 'justify-between'
          }`}
          onClick={toggleDropdown}
        >
          <div className="flex items-center">
            <div className="text-gray-600 dark:text-gray-300">
              {React.cloneElement(icon, {
                size: 20,
                strokeWidth: 1.75,
                className: "transition-all duration-200 ease-linear"
              })}
            </div>
  
            <div className={`ml-3 transition-all duration-300 whitespace-nowrap overflow-hidden ${
              collapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'
            }`}>
              <span className="text-gray-800 dark:text-gray-200 font-medium hover:text-[${Colors.SIDEBAR_TEXT}] transition-colors duration-200">
                {label}
              </span>
            </div>
          </div>
  
          {/* Dropdown toggle icon */}
          {!collapsed && (
            <div className="ml-2 flex items-center">
              {open ? (
                <ChevronDown size={16} strokeWidth={1.75} />
              ) : (
                <ChevronRight size={16} strokeWidth={1.75} />
              )}
            </div>
          )}
        </div>
  
        {/* Dropdown items */}
        {!collapsed && (
          <div className={`ml-10 space-y-1 transition-all duration-300 ease-linear overflow-hidden ${
            open ? 'max-h-[500px] mt-2' : 'max-h-0'
          }`}>
            {items.map((item, idx) => (
              <a
                key={idx}
                href={item.href}
                className="block text-sm text-gray-600 dark:text-gray-400 hover:text-[${Colors.SIDEBAR_TEXT}] transition-colors duration-200 py-1 leading-[.9]"
              >
                {item.label}
              </a>
            ))}
          </div>
        )}
      </div>
    );
  };

export default DropDown;