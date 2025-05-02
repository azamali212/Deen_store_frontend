import React from 'react';
import Link from 'next/link';
import { BreadcrumbProps } from '@/types/ui';

interface BreadcrumbItem {
  label: string;
  href: string;
  active?: boolean;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  return (
    <nav className="text-sm text-gray-500">
      <ol className="flex space-x-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {item.active ? (
              <span className="text-gray-700 font-semibold">{item.label}</span>
            ) : (
              <Link href={item.href} className="hover:underline">
                {item.label}
              </Link>
            )}
            {index < items.length - 1 && <span className="mx-2">{">"}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;