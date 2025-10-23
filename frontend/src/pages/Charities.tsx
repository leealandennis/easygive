import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Heart, Filter, ExternalLink, TrendingUp } from 'lucide-react';
import { charityService } from '../services/charities';
import { DonationModal } from '../components/DonationModal';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Charity } from '../types';

const categories = [
  { value: 'all', label: 'All Categories' },
  { value: 'education', label: 'Education' },
  { value: 'health', label: 'Health' },
  { value: 'environment', label: 'Environment' },
  { value: 'poverty', label: 'Poverty' },
  { value: 'animals', label: 'Animals' },
  { value: 'arts', label: 'Arts & Culture' },
  { value: 'human_rights', label: 'Human Rights' },
  { value: 'disaster_relief', label: 'Disaster Relief' },
  { value: 'other', label: 'Other' }
];

export const Charities: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCharity, setSelectedCharity] = useState<Charity | null>(null);
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);

  // Backend currently provides /api/charities/featured
  const { data: featuredData, isLoading } = useQuery({
    queryKey: ['charities-featured'],
    queryFn: () => charityService.getFeaturedCharities(100)
  });

  const filteredCharities = (featuredData || []).filter((c) => {
    const matchesSearch = !searchTerm ||
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' ||
      ((c.category || '').toString().replace('_', ' ').toLowerCase() === selectedCategory.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  const handleDonateClick = (charity: Charity) => {
    setSelectedCharity(charity);
    setIsDonationModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardBody>
          <div className="flex items-center space-x-4 mb-4">
          <div className="h-10 w-10 rounded-lg bg-primary-100 flex items-center justify-center">
            <Heart className="h-5 w-5 text-primary-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Discover Charities</h1>
            <p className="text-gray-600 mt-1">Find causes you care about</p>
          </div>
          </div>
        
        {/* Search and Filter Bar */}
        <div className="mt-6 flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <Input type="text" placeholder="Search charities..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
          </div>
          
          {/* Category Filter */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-5 w-5 text-gray-400" />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="block w-full md:w-64 pl-10 pr-10 py-2.5 border border-gray-300 bg-white rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 appearance-none cursor-pointer"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value} className="text-gray-900">
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        </CardBody>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-gray-600">
          {isLoading ? (
            'Loading charities...'
          ) : (
            <>
              Found <span className="font-semibold text-gray-900">{filteredCharities.length}</span> charities
            </>
          )}
        </p>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 animate-pulse">
              <div className="h-12 w-12 bg-gray-200 rounded-full mb-4"></div>
              <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-1"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          ))}
        </div>
      )}

      {/* Charity Cards */}
      {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCharities.length === 0 ? (
            <div className="col-span-full">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
                <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No charities found
                </h3>
                <p className="text-gray-600">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            </div>
          ) : (
            filteredCharities.map((charity) => (
              <Card key={charity.id} className="hover:shadow-md transition-all overflow-hidden">
                <CardBody>
                  {/* Icon and Category */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Heart className="h-6 w-6 text-white" />
                    </div>
                    <Badge variant="primary" className="capitalize">{charity.category.replace('_', ' ')}</Badge>
                  </div>

                  {/* Name */}
                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                    {charity.name}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                    {charity.description || 'Supporting important causes and making a difference in communities.'}
                  </p>

                  {/* Stats */}
                  {charity.totalDonations && (
                    <div className="flex items-center space-x-2 mb-4 text-sm text-gray-500">
                      <TrendingUp className="h-4 w-4 text-secondary-500" />
                      <span>
                        ${charity.totalDonations.toLocaleString()} raised
                      </span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    <Button onClick={() => handleDonateClick(charity)} leftIcon={<Heart className="h-4 w-4" />} className="flex-1">Donate</Button>
                    {charity.website && (
                      <a
                        href={charity.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-outline p-2 hover:bg-gray-100"
                        title="Visit website"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </CardBody>

                {/* Featured Indicator */}
                {charity.isFeatured && (
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-400 px-4 py-2">
                    <p className="text-xs font-semibold text-white text-center">
                      ⭐ Featured Charity
                    </p>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      )}

      {/* Donation Modal */}
      <DonationModal
        charity={selectedCharity}
        isOpen={isDonationModalOpen}
        onClose={() => {
          setIsDonationModalOpen(false);
          setSelectedCharity(null);
        }}
      />
    </div>
  );
};
