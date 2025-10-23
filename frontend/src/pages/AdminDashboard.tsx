import React from 'react';
import { Card, CardBody } from '../components/ui/Card';

export const AdminDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardBody>
          <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">System-wide administration and management</p>
        </CardBody>
      </Card>
      <Card>
        <CardBody>
          <p className="text-gray-500">Admin functionality coming soon...</p>
        </CardBody>
      </Card>
    </div>
  );
};
