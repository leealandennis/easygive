import React from 'react';
import clsx from 'clsx';

interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  density?: 'comfortable' | 'compact';
}

export const Table: React.FC<TableProps> = ({ density = 'comfortable', className, children, ...props }) => (
  <div className={clsx('overflow-x-auto', density === 'compact' && 'text-sm')}>
    <table className={clsx('min-w-full divide-y divide-gray-200 table-slim', className)} {...props}>
      {children}
    </table>
  </div>
);

export const Thead: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ className, children, ...props }) => (
  <thead className={clsx('bg-gray-50', className)} {...props}>{children}</thead>
);

export const Tbody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ className, children, ...props }) => (
  <tbody className={clsx('bg-white divide-y divide-gray-200', className)} {...props}>{children}</tbody>
);

export const Th: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({ className, children, ...props }) => (
  <th className={clsx('px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider', className)} {...props}>{children}</th>
);

export const Td: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({ className, children, ...props }) => (
  <td className={clsx('px-6 py-4 whitespace-nowrap text-sm text-gray-700', className)} {...props}>{children}</td>
);

export default Table;


