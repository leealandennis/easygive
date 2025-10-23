import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Charity } from '../types';
import { Heart, ExternalLink } from 'lucide-react';
import { Card, CardBody } from './ui/Card';
import { Badge } from './ui/Badge';
import { EmptyState } from './ui/EmptyState';

interface TopCharitiesProps {
  charities: Charity[];
  loading?: boolean;
}

export const TopCharities: React.FC<TopCharitiesProps> = ({
  charities,
  loading = false
}) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <Card>
        <CardBody>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Featured Charities</h2>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    );
  }

  if (charities.length === 0) {
    return (
      <Card>
        <CardBody>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Featured Charities</h2>
          <EmptyState title="No featured charities available" />
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardBody>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Featured Charities</h2>
        <div className="space-y-3">
          {charities.map((charity) => (
            <div key={charity.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                <Heart className="h-5 w-5 text-primary-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{charity.name}</p>
                <p className="text-sm text-gray-500 capitalize">{charity.category.replace('_', ' ')}</p>
              </div>
              {charity.website && (
                <a href={charity.website} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600 transition-colors">
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button onClick={() => navigate('/app/charities')} className="w-full text-sm text-primary-600 hover:text-primary-500 font-medium transition-colors">
            View all charities
          </button>
        </div>
      </CardBody>
    </Card>
  );
};
