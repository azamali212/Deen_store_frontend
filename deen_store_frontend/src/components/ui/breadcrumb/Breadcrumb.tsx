"use client";

import React from 'react';
import Link from 'next/link';
import { BreadcrumbProps } from '@/types/ui';

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  return (
    <nav className="sticky text-sm">
      <ol className="flex space-x-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {item.active ? (
              <span className="font-semibold text-[rgb(var(--foreground))]">
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="text-muted-foreground hover:text-primary active:text-primary/80 transition-colors duration-200"
              >
                {item.label}
              </Link>
            )}
            {index < items.length - 1 && (
              <span className="mx-2 text-[rgb(var(--foreground))]">
                {'>'}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;