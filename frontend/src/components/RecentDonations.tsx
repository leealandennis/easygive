import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Donation } from '../types';
import { format } from 'date-fns';
import { Heart, Calendar } from 'lucide-react';

interface RecentDonationsProps {
  donations: Donation[];
  loading?: boolean;
}

export const RecentDonations: React.FC<RecentDonationsProps> = ({
  donations,
  loading = false
}) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Donations</h2>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (donations.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Donations</h2>
        <div className="text-center py-8">
          <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No donations yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Start making a difference by donating to your favorite charities
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Recent Donations</h2>
        <button 
          onClick={() => navigate('/app/donations')}
          className="text-sm text-primary-600 hover:text-primary-500 font-medium transition-colors"
        >
          View all
        </button>
      </div>
      
      <div className="space-y-4">
        {donations.map((donation) => (
          <div key={donation.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                <Heart className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {donation.charity.name}
                </p>
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="h-3 w-3 mr-1" />
                  {format(new Date(donation.createdAt), 'MMM d, yyyy')}
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-gray-900">
                ${Number(donation.totalAmount || 0).toFixed(2)}
              </p>
              {Number(donation.matchingAmount || 0) > 0 && (
                <p className="text-xs text-green-600">
                  +${Number(donation.matchingAmount).toFixed(2)} match
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
