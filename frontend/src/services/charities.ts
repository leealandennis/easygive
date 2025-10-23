import api from './api';
import { 
  Charity, 
  CharityFilters, 
  PaginatedResponse, 
  ApiResponse 
} from '../types';

export const charityService = {
  // Get all charities with filters
  getCharities: async (filters: CharityFilters = {}): Promise<PaginatedResponse<Charity>> => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await api.get<PaginatedResponse<Charity>>(`/charities?${params.toString()}`);
    return response.data;
  },

  // Get single charity
  getCharity: async (id: string): Promise<Charity> => {
    const response = await api.get<ApiResponse<Charity>>(`/charities/${id}`);
    return response.data.data!;
  },

  // Get featured charities (backend returns array under data)
  getFeaturedCharities: async (limit?: number): Promise<Charity[]> => {
    const params = limit ? `?limit=${limit}` : '';
    const response = await api.get<ApiResponse<Charity[]>>(`/charities/featured${params}`);
    return response.data.data!;
  },

  // Get charities by category
  getCharitiesByCategory: async (category: string, limit?: number): Promise<{ data: Charity[] }> => {
    const params = limit ? `?limit=${limit}` : '';
    const response = await api.get<ApiResponse<{ data: Charity[] }>>(`/charities/category/${category}${params}`);
    return response.data.data!;
  },

  // Search charities
  searchCharities: async (query: string, category?: string, limit?: number): Promise<{ data: Charity[] }> => {
    const params = new URLSearchParams();
    params.append('q', query);
    if (category) params.append('category', category);
    if (limit) params.append('limit', limit.toString());
    
    const response = await api.get<ApiResponse<{ data: Charity[] }>>(`/charities/search?${params.toString()}`);
    return response.data.data!;
  },

  // Get charity categories
  getCategories: async (): Promise<{ data: { value: string; label: string }[] }> => {
    const response = await api.get<ApiResponse<{ data: { value: string; label: string }[] }>>('/charities/categories');
    return response.data.data!;
  },

  // Get charity statistics
  getCharityStats: async (id: string, year?: number): Promise<{
    charity: {
      name: string;
      category: string;
      totalDonations: number;
      totalDonors: number;
    };
    yearlySummary: {
      totalAmount: number;
      donationCount: number;
      uniqueDonorCount: number;
    };
  }> => {
    const params = year ? `?year=${year}` : '';
    const response = await api.get<ApiResponse<{
      charity: {
        name: string;
        category: string;
        totalDonations: number;
        totalDonors: number;
      };
      yearlySummary: {
        totalAmount: number;
        donationCount: number;
        uniqueDonorCount: number;
      };
    }>>(`/charities/${id}/stats${params}`);
    return response.data.data!;
  }
};
