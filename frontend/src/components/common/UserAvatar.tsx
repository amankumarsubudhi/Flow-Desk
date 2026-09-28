import React from 'react';

interface UserAvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
};

export const UserAvatar: React.FC<UserAvatarProps> = ({ name, size = 'md', className = '' }) => {
  const initial = (name || '?').charAt(0).toUpperCase();

  return (
    <div
      className={`rounded-full flex items-center justify-center font-bold select-none shrink-0 ${sizeMap[size]} ${className}`}
      style={{ backgroundColor: '#000', color: '#fff' }}
      title={name}
    >
      {initial}
    </div>
  );
};
