import React from 'react';
import { MonthlyTrend } from '../types';

interface MonthlyChartProps {
  data: MonthlyTrend[];
}

export const MonthlyChart: React.FC<MonthlyChartProps> = ({ data }) => {
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const maxAmount = Math.max(...data.map(d => d.totalAmount), 1);

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">No donation data available</p>
          <p className="text-sm text-gray-400 mt-1">Start making donations to see trends</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-64">
      <div className="flex items-end justify-between h-full space-x-1">
        {months.map((month, index) => {
          const monthData = data.find(d => d.month === index + 1);
          const height = monthData ? (monthData.totalAmount / maxAmount) * 100 : 0;
          
          return (
            <div key={month} className="flex-1 flex flex-col items-center">
              <div className="w-full flex flex-col items-center">
                <div
                  className="w-full bg-primary-500 rounded-t transition-all duration-300 hover:bg-primary-600"
                  style={{ height: `${Math.max(height, 4)}%` }}
                  title={`${month}: $${monthData?.totalAmount.toFixed(2) || '0.00'}`}
                />
                <div className="mt-2 text-xs text-gray-500">{month}</div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-4 flex justify-between text-xs text-gray-500">
        <span>$0</span>
        <span>${maxAmount.toFixed(0)}</span>
      </div>
    </div>
  );
};
