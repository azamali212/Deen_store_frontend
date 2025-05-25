'use client';

import React from 'react';
import { BreadcrumbProps } from '@/types/ui';

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  return (
    <nav className=" text-lg">
      <ol className="flex space-x-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {/* Only display the active page label */}
            {item.active ? (
              <span className="font-semibold  text-[rgb(var(--foreground))]">
                {item.label}
              </span>
            ) : null}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;