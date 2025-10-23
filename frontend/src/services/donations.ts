import api from './api';
import { 
  Donation, 
  DonationForm, 
  DonationFilters, 
  DashboardStats, 
  MonthlyTrend, 
  TopCharity,
  LeaderboardEntry,
  PaginatedResponse,
  ApiResponse 
} from '../types';

export const donationService = {
  // Get all donations with filters
  getDonations: async (filters: DonationFilters = {}): Promise<PaginatedResponse<Donation>> => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await api.get<PaginatedResponse<Donation>>(`/donations?${params.toString()}`);
    return response.data;
  },

  // Get single donation
  getDonation: async (id: string): Promise<Donation> => {
    const response = await api.get<ApiResponse<Donation>>(`/donations/${id}`);
    return response.data.data!;
  },

  // Create new donation
  createDonation: async (donationData: DonationForm): Promise<Donation> => {
    const response = await api.post<ApiResponse<Donation>>('/donations', donationData);
    return response.data.data!;
  },

  // Update donation status (HR Admin only)
  updateDonationStatus: async (id: string, status: string, failureReason?: string): Promise<Donation> => {
    const response = await api.put<ApiResponse<Donation>>(`/donations/${id}/status`, {
      status,
      failureReason
    });
    return response.data.data!;
  },

  // Cancel donation
  cancelDonation: async (id: string): Promise<Donation> => {
    const response = await api.put<ApiResponse<Donation>>(`/donations/${id}/cancel`);
    return response.data.data!;
  },

  // Get user's donation summary
  getUserSummary: async (year?: number): Promise<{
    summary: DashboardStats;
    monthlyBreakdown: MonthlyTrend[];
    topCharities: TopCharity[];
  }> => {
    const params = year ? `?year=${year}` : '';
    const response = await api.get<ApiResponse<{
      summary: DashboardStats;
      monthlyBreakdown: MonthlyTrend[];
      topCharities: TopCharity[];
    }>>(`/donations/summary/user${params}`);
    return response.data.data!;
  },

  // Get user's donations
  getUserDonations: async (filters: DonationFilters = {}): Promise<PaginatedResponse<Donation>> => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await api.get<PaginatedResponse<Donation>>(`/donations?${params.toString()}`);
    return response.data;
  },

  // Get company donation summary (HR Admin only)
  getCompanySummary: async (companyId?: string, year?: number): Promise<DashboardStats> => {
    const params = new URLSearchParams();
    if (companyId) params.append('companyId', companyId);
    if (year) params.append('year', year.toString());
    
    const response = await api.get<ApiResponse<DashboardStats>>(`/donations/summary/company?${params.toString()}`);
    return response.data.data!;
  },

  // Get leaderboard
  getLeaderboard: async (companyId: string, year?: number, limit?: number): Promise<{
    data: LeaderboardEntry[];
  }> => {
    const params = new URLSearchParams();
    params.append('companyId', companyId);
    if (year) params.append('year', year.toString());
    if (limit) params.append('limit', limit.toString());
    
    const response = await api.get<ApiResponse<{ data: LeaderboardEntry[] }>>(`/users/leaderboard?${params.toString()}`);
    return response.data.data!;
  }
};
