import React from 'react';
import { Card, CardBody } from '../components/ui/Card';
import { Table, Thead, Tbody, Th, Td } from '../components/ui/Table';
import { EmptyState } from '../components/ui/EmptyState';
import { FileText } from 'lucide-react';

export const CompanyReports: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardBody>
          <h1 className="text-xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600 mt-1">Generate and download company donation reports</p>
        </CardBody>
      </Card>
      <Card>
        <CardBody>
          <Table>
            <Thead>
              <tr>
                <Th>Report</Th>
                <Th>Period</Th>
                <Th>Generated</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </Thead>
            <Tbody>
              {/* No reports yet */}
            </Tbody>
          </Table>
          <EmptyState
            icon={<FileText className="h-12 w-12 text-gray-300" />}
            title="No reports yet"
            description="Generate reports to see them listed here"
          />
        </CardBody>
      </Card>
    </div>
  );
};
