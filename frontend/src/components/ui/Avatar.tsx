import React from 'react';
import clsx from 'clsx';

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  initials: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ initials, size = 'md', className, ...props }) => {
  const sizes = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-9 w-9 text-sm',
    lg: 'h-12 w-12 text-base',
  };
  return (
    <div
      className={clsx('rounded-full bg-primary-600 text-white inline-flex items-center justify-center font-semibold', sizes[size], className)}
      {...props}
    >
      {initials}
    </div>
  );
};

export default Avatar;





