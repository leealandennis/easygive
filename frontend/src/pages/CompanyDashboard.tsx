import React from 'react';
import { Card, CardBody } from '../components/ui/Card';
import { TrendingUp, Users, Heart } from 'lucide-react';

export const CompanyDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardBody>
          <h1 className="text-xl font-bold text-gray-900">Company Dashboard</h1>
          <p className="text-gray-600 mt-1">Overview of your company's donation activity</p>
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Donations</p>
                <p className="text-3xl font-bold mt-1">$0.00</p>
              </div>
              <Heart className="h-8 w-8 text-primary-400" />
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Company Matching</p>
                <p className="text-3xl font-bold mt-1">$0.00</p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary-400" />
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Participating Employees</p>
                <p className="text-3xl font-bold mt-1">0</p>
              </div>
              <Users className="h-8 w-8 text-primary-400" />
            </div>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardBody>
          <p className="text-gray-500">Company dashboard functionality coming soon...</p>
        </CardBody>
      </Card>
    </div>
  );
};
