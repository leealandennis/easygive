import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md' }) => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  } as const;
  return <div className={`animate-spin rounded-full border-b-2 border-primary-600 ${sizes[size]}`} />;
};

export default Spinner;





