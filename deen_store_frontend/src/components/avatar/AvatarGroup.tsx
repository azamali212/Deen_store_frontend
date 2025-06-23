import React from 'react';
import Avatar from './Avatar';

interface AvatarGroupProps {
  avatars?: string[];
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  max?: number;
  children?: React.ReactNode;
  className?: string;
}

const AvatarGroup: React.FC<AvatarGroupProps> = ({ 
  avatars = [], 
  size = 'sm', 
  max = 3,
  children,
  className = ''
}) => {
  const items = children 
    ? React.Children.toArray(children).slice(0, max)
    : avatars.slice(0, max).map((src, index) => (
        <Avatar key={index} src={src} name="" size={size} />
      ));

  const excess = children 
    ? React.Children.count(children) - max
    : avatars.length - max;

  return (
    <div className={`flex items-center ${className}`}>
      <div className="flex -space-x-2">
        {items}
      </div>
      {excess > 0 && (
        <div className="ml-2 text-xs text-gray-500 dark:text-gray-400">
          +{excess}
        </div>
      )}
    </div>
  );
};

export default AvatarGroup;