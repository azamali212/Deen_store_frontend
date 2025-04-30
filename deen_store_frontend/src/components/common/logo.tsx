'use client';

import React from 'react';
import Image from 'next/image';
import { LogoProps } from '@/types/ui';

const Logo: React.FC<LogoProps> = ({
   // default path
  variant = 'customer',
  alt = 'Shopinity Logo',
  height = 48,
  width = 150,
  className = '',
}) => {
  const logoSrc =
    variant === 'admin' ? '/dashboard_logo/main.png' : '/logo/main.png';
  return (
    <Image
      src={logoSrc}
      alt={alt}
      height={height}
      width={width}
      className={className}
      priority
    />
  );
};

export default Logo;