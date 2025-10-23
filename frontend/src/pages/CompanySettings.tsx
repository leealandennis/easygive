import React from 'react';
import { Card, CardBody } from '../components/ui/Card';

export const CompanySettings: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardBody>
          <h1 className="text-xl font-bold text-gray-900">Company Settings</h1>
          <p className="text-gray-600 mt-1">Configure your company's donation matching and preferences</p>
        </CardBody>
      </Card>
      <Card>
        <CardBody>
          <p className="text-gray-500">Company settings functionality coming soon...</p>
        </CardBody>
      </Card>
    </div>
  );
};
