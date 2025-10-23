import React from 'react';
import clsx from 'clsx';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const Card: React.FC<CardProps> = ({ className, children, ...props }) => (
  <div className={clsx('card', className)} {...props}>{children}</div>
);

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => (
  <div className={clsx('px-5 py-4 border-b border-gray-200', className)} {...props}>
    {children}
  </div>
);

export const CardBody: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => (
  <div className={clsx('px-5 py-4', className)} {...props}>
    {children}
  </div>
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => (
  <div className={clsx('px-5 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg', className)} {...props}>
    {children}
  </div>
);

export default Card;


