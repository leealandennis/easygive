import React from 'react';
import clsx from 'clsx';

interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ icon, title, subtitle, className, ...props }) => {
  return (
    <div className={clsx('card', className)} {...props}>
      <div className="px-5 py-4">
        <div className="flex items-center space-x-4">
          {icon && (
            <div className="h-10 w-10 rounded-md bg-primary-100 flex items-center justify-center">
              {icon}
            </div>
          )}
          <div>
            <h1 className="text-xl font-bold text-gray-900">{title}</h1>
            {subtitle && <p className="text-gray-600 mt-1">{subtitle}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageHeader;





