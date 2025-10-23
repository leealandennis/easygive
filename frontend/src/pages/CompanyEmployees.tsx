import React from 'react';
import { Card, CardBody } from '../components/ui/Card';
import { Table, Thead, Tbody, Th, Td } from '../components/ui/Table';
import { EmptyState } from '../components/ui/EmptyState';
import { Users } from 'lucide-react';

export const CompanyEmployees: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardBody>
          <h1 className="text-xl font-bold text-gray-900">Employees</h1>
          <p className="text-gray-600 mt-1">Manage your company's employees and their donation activity</p>
        </CardBody>
      </Card>
      <Card>
        <CardBody>
          <Table>
            <Thead>
              <tr>
                <Th>Name</Th>
                <Th>Email</Th>
                <Th>Role</Th>
                <Th className="text-right">Donations</Th>
              </tr>
            </Thead>
            <Tbody>
              {/* No data yet */}
            </Tbody>
          </Table>
          <EmptyState
            icon={<Users className="h-12 w-12 text-gray-300" />}
            title="No employees yet"
            description="Employees will appear here once added to your company"
          />
        </CardBody>
      </Card>
    </div>
  );
};
