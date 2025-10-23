import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { 
  FileText, 
  Download, 
  Calendar,
  DollarSign,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { donationService } from '../services/donations';
import { taxService } from '../services/tax';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export const TaxRecords: React.FC = () => {
  const { user } = useAuth();
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);

  // Generate list of available years (current year and 4 previous years)
  const availableYears = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const { data: taxSummary, isLoading } = useQuery({
    queryKey: ['taxSummary', selectedYear],
    queryFn: () => taxService.getSummary(selectedYear),
    enabled: !!user
  });

  const { data: donationsData } = useQuery({
    queryKey: ['userDonations', 'all'],
    queryFn: () => donationService.getUserDonations({ page: 1, limit: 1000 }),
    enabled: !!user
  });

  // Filter donations by selected year
  const yearDonations = donationsData?.data?.filter(donation => {
    const donationYear = new Date(donation.createdAt).getFullYear();
    return donationYear === selectedYear;
  }) || [];

  // Calculate totals for selected year
  const yearTotals = yearDonations.reduce(
    (acc, donation) => ({
      donated: acc.donated + Number(donation.amount || 0),
      matching: acc.matching + Number(donation.matchingAmount || 0),
      total: acc.total + Number(donation.totalAmount || 0)
    }),
    { donated: 0, matching: 0, total: 0 }
  );

  const handleDownloadAnnualSummary = async (year: number) => {
    // Try to generate if we don't already have a record
    if (!taxSummary?.hasRecord) {
      try {
        await taxService.generate(year);
      } catch (err: any) {
        // If backend returns 400 due to no donations, show message and stop
        const status = err?.response?.status;
        if (status === 400) {
          alert('No donations found for this tax year.');
          return;
        }
        // For other errors, continue to attempt fetching existing records
      }
    }

    try {
      // Fetch records to find the correct one by year
      const records = await api.get('/tax/records');
      const record = (records.data.data || []).find((r: any) => r.taxYear === year);
      if (!record) {
        alert('No tax record available to download.');
        return;
      }
      const blob = await taxService.downloadFile(record.id, 'summary');
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `tax-summary-${year}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      alert('Failed to download summary.');
    }
  };

  const handleDownloadReceipt = async (donationId: string) => {
    try {
      console.log('Downloading receipt for donation:', donationId);
      const response = await api.get(`/tax/donations/${donationId}/receipt`, { 
        responseType: 'blob',
        validateStatus: (status) => status < 500 // Accept 4xx responses
      });
      
      // Check if response is actually a blob or an error JSON
      if (response.data instanceof Blob) {
        // Check if it's actually a JSON error response
        if (response.data.type === 'application/json') {
          const text = await response.data.text();
          const error = JSON.parse(text);
          throw new Error(error.message || 'Failed to download receipt');
        }
        
        const url = window.URL.createObjectURL(response.data);
        const link = document.createElement('a');
        link.href = url;
        link.download = `donation-receipt-${donationId}.pdf`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        console.log('Receipt downloaded successfully');
      } else {
        throw new Error('Invalid response format');
      }
    } catch (e: any) {
      console.error('Failed to download receipt:', e);
      const errorMessage = e?.response?.data?.message || e?.message || 'Failed to download receipt. Please try again.';
      alert(errorMessage);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardBody>
        <div className="flex items-center space-x-4 mb-6">
          <div className="h-10 w-10 rounded-lg bg-primary-100 flex items-center justify-center">
            <FileText className="h-5 w-5 text-primary-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Tax Records</h1>
            <p className="text-gray-600 mt-1">Download receipts and annual summaries</p>
          </div>
        </div>

        {/* Year Selector */}
        <div className="flex items-center space-x-4">
          <label className="text-gray-600 font-medium">Tax Year:</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 bg-white rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            {availableYears.map(year => (
              <option key={year} value={year} className="text-gray-900">
                {year}
              </option>
            ))}
          </select>
        </div>
        </CardBody>
      </Card>

      {/* Annual Summary Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-primary-50 to-blue-50 px-6 py-4 border-b border-primary-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {selectedYear} Annual Summary
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Tax-deductible donations summary
              </p>
            </div>
            <button
              onClick={() => handleDownloadAnnualSummary(selectedYear)}
              className="btn-primary"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Summary
            </button>
          </div>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="loading-spinner-lg mx-auto mb-4"></div>
              <p className="text-gray-600">Loading tax records...</p>
            </div>
          ) : yearDonations.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No donations in {selectedYear}
              </h3>
              <p className="text-gray-600">
                You don't have any donation records for this tax year
              </p>
            </div>
          ) : (
            <>
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Your Donations</span>
                    <DollarSign className="h-5 w-5 text-gray-400" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    ${yearTotals.donated.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {yearDonations.length} donation{yearDonations.length !== 1 ? 's' : ''}
                  </p>
                </div>

                <div className="bg-secondary-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-secondary-700">Company Match</span>
                    <CheckCircle className="h-5 w-5 text-secondary-500" />
                  </div>
                  <p className="text-2xl font-bold text-secondary-700">
                    ${yearTotals.matching.toFixed(2)}
                  </p>
                  <p className="text-xs text-secondary-600 mt-1">
                    Matched by employer
                  </p>
                </div>

                <div className="bg-primary-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-primary-700">Total Impact</span>
                    <CheckCircle className="h-5 w-5 text-primary-500" />
                  </div>
                  <p className="text-2xl font-bold text-primary-700">
                    ${yearTotals.total.toFixed(2)}
                  </p>
                  <p className="text-xs text-primary-600 mt-1">
                    Combined contribution
                  </p>
                </div>
              </div>

              {/* Important Tax Information */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-semibold mb-1">Tax Deduction Information</p>
                    <p>
                      Only your personal donations (${yearTotals.donated.toFixed(2)}) are tax-deductible. 
                      Company matching contributions are not included in your personal tax deductions. 
                      Please consult with a tax professional for specific advice.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Individual Receipts */}
      {yearDonations.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Individual Receipts</h2>
            <p className="text-sm text-gray-600 mt-1">
              Download receipts for each donation
            </p>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Charity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tax Deductible
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Receipt
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {yearDonations.map((donation) => (
                  <tr key={donation.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        {format(new Date(donation.createdAt), 'MMM d, yyyy')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {donation.charity.name}
                      </div>
                      <div className="text-xs text-gray-500 capitalize">
                        {(donation.charity?.category || '').toString().replace('_', ' ')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      ${Number(donation.totalAmount || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-secondary-600">
                        ${Number(donation.amount || 0).toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500">
                        Your contribution
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => handleDownloadReceipt(donation.id)}
                        className="btn-outline btn-sm"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-gray-200">
            {yearDonations.map((donation) => (
              <div key={donation.id} className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{donation.charity.name}</p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(donation.createdAt), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-500">Total Amount</p>
                    <p className="font-semibold text-gray-900">
                      ${Number(donation.totalAmount || 0).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Tax Deductible</p>
                    <p className="font-semibold text-secondary-600">
                      ${Number(donation.amount || 0).toFixed(2)}
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => handleDownloadReceipt(donation.id)}
                  className="btn-outline btn-sm w-full"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download Receipt
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
