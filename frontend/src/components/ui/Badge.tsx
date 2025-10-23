import React from 'react';
import clsx from 'clsx';

type BadgeVariant = 'primary' | 'secondary' | 'gray' | 'success' | 'warning' | 'danger';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'gray', className, children, ...props }) => {
  const variants: Record<BadgeVariant, string> = {
    primary: 'bg-primary-100 text-primary-800',
    secondary: 'bg-secondary-100 text-secondary-800',
    gray: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-accent-100 text-accent-800',
  };
  return (
    <span className={clsx('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', variants[variant], className)} {...props}>
      {children}
    </span>
  );
};

export default Badge;





