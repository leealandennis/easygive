import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Heart, 
  Filter, 
  Download, 
  DollarSign, 
  TrendingUp,
  X,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Eye,
  Ban
} from 'lucide-react';
import { donationService } from '../services/donations';
import { Donation, DonationFilters as DonationFilterType } from '../types';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { Spinner } from '../components/ui/Spinner';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-blue-100 text-blue-800',
  processing: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-800'
};

const statusIcons = {
  pending: Clock,
  approved: CheckCircle,
  processing: AlertCircle,
  completed: CheckCircle,
  failed: XCircle,
  cancelled: Ban
};

export const Donations: React.FC = () => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<DonationFilterType>({
    page: 1,
    limit: 10
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);

  // Fetch donations
  const { data: donationsData, isLoading, error } = useQuery({
    queryKey: ['donations', filters],
    queryFn: () => donationService.getDonations(filters)
  });

  // Fetch donation summary
  const { data: summaryData } = useQuery({
    queryKey: ['donationSummary', filters.year],
    queryFn: () => donationService.getUserSummary(filters.year)
  });

  // Cancel donation mutation
  const cancelMutation = useMutation({
    mutationFn: donationService.cancelDonation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donations'] });
      queryClient.invalidateQueries({ queryKey: ['donationSummary'] });
      setSelectedDonation(null);
    }
  });

  const handleCancelDonation = (donationId: string) => {
    if (window.confirm('Are you sure you want to cancel this donation?')) {
      cancelMutation.mutate(donationId);
    }
  };

  const handleFilterChange = (key: keyof DonationFilterType, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filters change
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      page: 1,
      limit: 10
    });
  };

  const handleExport = async () => {
    try {
      const allDonations = await donationService.getDonations({ 
        ...filters, 
        limit: 1000 
      });
      
      const csv = [
        ['Date', 'Charity', 'Amount', 'Matching', 'Total', 'Status', 'Type'].join(','),
        ...allDonations.data.map(d => [
          new Date(d.createdAt).toLocaleDateString(),
          `"${d.charity.name}"`,
          d.amount,
          d.matchingAmount,
          d.totalAmount,
          d.status,
          d.type
        ].join(','))
      ].join('\n');
      
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `donations-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export error:', err);
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Donations</h1>
            <p className="text-gray-600 mt-2">
              View and manage your donation history
            </p>
          </div>
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              leftIcon={<Filter className="h-4 w-4" />}
            >
              Filters
            </Button>
            <Button
              variant="outline"
              onClick={handleExport}
              leftIcon={<Download className="h-4 w-4" />}
            >
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      {summaryData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Donated</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${summaryData.summary.totalDonated.toLocaleString()}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                  <Heart className="h-6 w-6 text-primary-600" />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Company Match</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${summaryData.summary.totalMatching.toLocaleString()}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-secondary-100 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-secondary-600" />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Impact</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${summaryData.summary.totalAmount.toLocaleString()}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Donations</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {summaryData.summary.donationCount}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    to {summaryData.summary.uniqueCharityCount} charities
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Filters Panel */}
      {showFilters && (
        <Card>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Status Filter */}
              <div>
                <label className="label">Status</label>
                <select
                  className="input"
                  value={filters.status || ''}
                  onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Type Filter */}
              <div>
                <label className="label">Type</label>
                <select
                  className="input"
                  value={filters.type || ''}
                  onChange={(e) => handleFilterChange('type', e.target.value || undefined)}
                >
                  <option value="">All Types</option>
                  <option value="one_time">One-Time</option>
                  <option value="recurring">Recurring</option>
                </select>
              </div>

              {/* Year Filter */}
              <div>
                <label className="label">Year</label>
                <select
                  className="input"
                  value={filters.year || ''}
                  onChange={(e) => handleFilterChange('year', e.target.value ? parseInt(e.target.value) : undefined)}
                >
                  <option value="">All Years</option>
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              {/* Clear Filters */}
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={handleClearFilters}
                  leftIcon={<X className="h-4 w-4" />}
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Donations Table */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">Donation History</h2>
        </CardHeader>
        <CardBody>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : error ? (
            <EmptyState
              icon={<AlertCircle className="h-12 w-12 text-gray-400 mx-auto" />}
              title="Error loading donations"
              description="There was a problem loading your donations. Please try again."
            />
          ) : !donationsData?.data.length ? (
            <EmptyState
              icon={<Heart className="h-12 w-12 text-gray-400 mx-auto" />}
              title="No donations yet"
              description="Start making a difference by donating to your favorite charities."
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
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
                        Match
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {donationsData.data.map((donation) => {
                      const StatusIcon = statusIcons[donation.status] || Clock;
                      return (
                        <tr key={donation.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(donation.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <div>
                              <div className="font-medium text-gray-900">
                                {donation.charity.name}
                              </div>
                              <div className="text-gray-500 capitalize">
                                {donation.charity.category.replace('_', ' ')}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ${donation.amount.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-600 font-medium">
                            ${donation.matchingAmount.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                            ${donation.totalAmount.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                            {donation.type.replace('_', ' ')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[donation.status] || 'bg-gray-100 text-gray-800'}`}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() => setSelectedDonation(donation)}
                                className="text-primary-600 hover:text-primary-900"
                                title="View details"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              {(donation.status === 'pending' || donation.status === 'approved') && (
                              <button
                                onClick={() => handleCancelDonation(donation.id)}
                                className="text-red-600 hover:text-red-900"
                                title="Cancel donation"
                                disabled={cancelMutation.isLoading}
                              >
                                <Ban className="h-4 w-4" />
                              </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {donationsData.pagination.pages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                  <div className="text-sm text-gray-700">
                    Showing page {donationsData.pagination.current} of {donationsData.pagination.pages}
                    {' '}({donationsData.pagination.total} total donations)
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleFilterChange('page', filters.page! - 1)}
                      disabled={filters.page === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleFilterChange('page', filters.page! + 1)}
                      disabled={filters.page === donationsData.pagination.pages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardBody>
      </Card>

      {/* Donation Details Modal */}
      {selectedDonation && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={() => setSelectedDonation(null)}
          />
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="relative w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
              {/* Header */}
              <div className="bg-gradient-to-br from-primary-600 to-primary-700 px-6 py-8 text-white">
                <button
                  onClick={() => setSelectedDonation(null)}
                  className="absolute right-4 top-4 text-white hover:text-gray-200 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
                <div className="flex items-center space-x-4">
                  <div className="h-16 w-16 rounded-full bg-white bg-opacity-20 flex items-center justify-center backdrop-blur-sm">
                    <Heart className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Donation Details</h2>
                    <p className="text-primary-100 text-sm mt-1">
                      {new Date(selectedDonation.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Charity Info */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Charity</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">{selectedDonation.charity.name}</p>
                        <p className="text-sm text-gray-600 mt-1">{selectedDonation.charity.description}</p>
                        <div className="flex items-center mt-3 space-x-2">
                          <span className="badge badge-primary capitalize">
                            {selectedDonation.charity.category.replace('_', ' ')}
                          </span>
                          {selectedDonation.charity.verification.isVerified && (
                            <span className="badge badge-success">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Verified
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Amounts */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Donation Breakdown</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Your contribution:</span>
                      <span className="text-lg font-semibold text-gray-900">
                        ${selectedDonation.amount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Company matching:</span>
                      <span className="text-lg font-semibold text-secondary-600">
                        ${selectedDonation.matchingAmount.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-px bg-gray-200"></div>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-900">Total impact:</span>
                      <span className="text-2xl font-bold text-green-600">
                        ${selectedDonation.totalAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm text-gray-600">Status</p>
                      <p className="mt-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[selectedDonation.status]}`}>
                          {selectedDonation.status.charAt(0).toUpperCase() + selectedDonation.status.slice(1)}
                        </span>
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm text-gray-600">Type</p>
                      <p className="mt-1 font-medium text-gray-900 capitalize">
                        {selectedDonation.type.replace('_', ' ')}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm text-gray-600">Payment Method</p>
                      <p className="mt-1 font-medium text-gray-900 capitalize">
                        {selectedDonation.paymentMethod.replace('_', ' ')}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm text-gray-600">Tax Deductible</p>
                      <p className="mt-1 font-medium text-gray-900">
                        {selectedDonation.taxInfo.taxDeductible ? 'Yes' : 'No'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {selectedDonation.notes && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Notes</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700">{selectedDonation.notes}</p>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex space-x-3 pt-4 border-t">
                  {(selectedDonation.status === 'pending' || selectedDonation.status === 'approved') && (
                    <Button
                      variant="danger"
                      onClick={() => handleCancelDonation(selectedDonation.id)}
                      leftIcon={<Ban className="h-4 w-4" />}
                      disabled={cancelMutation.isLoading}
                      className="flex-1"
                    >
                      {cancelMutation.isLoading ? 'Cancelling...' : 'Cancel Donation'}
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => setSelectedDonation(null)}
                    className="flex-1"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
