// User types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'employee' | 'hr_admin' | 'super_admin';
  employeeId?: string;
  department?: string;
  position?: string;
  phone?: string;
  company: Company;
  preferences: UserPreferences;
  gamification: Gamification;
  isVerified: boolean;
  lastLogin?: string;
  createdAt: string;
}

export interface UserPreferences {
  notifications: {
    email: boolean;
    sms: boolean;
    donationConfirmations: boolean;
    taxReminders: boolean;
    matchingUpdates: boolean;
  };
  charityCategories: string[];
  privacy: {
    showOnLeaderboard: boolean;
    shareDonationHistory: boolean;
  };
}

export interface Gamification {
  totalPoints: number;
  badges: Badge[];
  level: number;
  totalDonated: number;
  streakDays: number;
  lastDonationDate?: string;
}

export interface Badge {
  name: string;
  earnedAt: string;
  description: string;
}

// Company types
export interface Company {
  id: string;
  name: string;
  domain: string;
  ein: string;
  address: Address;
  contactInfo: ContactInfo;
  subscription: Subscription;
  matchingProgram: MatchingProgram;
  settings: CompanySettings;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface ContactInfo {
  email: string;
  phone: string;
  website?: string;
}

export interface Subscription {
  plan: 'basic' | 'premium' | 'enterprise';
  status: 'active' | 'inactive' | 'suspended';
  startDate: string;
  endDate?: string;
  maxEmployees: number;
}

export interface MatchingProgram {
  enabled: boolean;
  type: 'percentage' | 'fixed' | 'none';
  percentage: number;
  fixedAmount: number;
  annualLimit: number;
  usedAmount: number;
  preferredCharities: string[];
}

export interface CompanySettings {
  allowEmployeeCharitySelection: boolean;
  requireApprovalForDonations: boolean;
  taxYear: number;
  payrollIntegration: {
    provider: 'adp' | 'gusto' | 'bamboo' | 'none';
    apiKey?: string;
    webhookUrl?: string;
  };
}

// Charity types
export interface Charity {
  id: string;
  name: string;
  ein: string;
  description: string;
  category: CharityCategory;
  subcategory?: string;
  website?: string;
  address: Address;
  contactInfo: ContactInfo;
  verification: CharityVerification;
  images: {
    logo?: string;
    banner?: string;
  };
  impact: {
    description: string;
    metrics: ImpactMetric[];
  };
  donationInfo: {
    minimumAmount: number;
    maximumAmount: number;
    suggestedAmounts: number[];
    acceptsRecurring: boolean;
  };
  isActive: boolean;
  isFeatured: boolean;
  totalDonations: number;
  totalDonors: number;
  createdAt: string;
  updatedAt: string;
}

export type CharityCategory = 
  | 'environment'
  | 'education'
  | 'health'
  | 'animals'
  | 'human_services'
  | 'international'
  | 'arts_culture'
  | 'religion'
  | 'other';

export interface CharityVerification {
  isVerified: boolean;
  verifiedBy: 'charity_navigator' | 'every_org' | 'manual';
  verifiedAt?: string;
  rating?: number;
  financialScore?: number;
  accountabilityScore?: number;
}

export interface ImpactMetric {
  name: string;
  value: string;
  unit: string;
}

// Donation types
export interface Donation {
  id: string;
  user: User;
  company: Company;
  charity: Charity;
  amount: number;
  matchingAmount: number;
  totalAmount: number;
  type: 'one_time' | 'recurring';
  frequency?: 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'annually';
  status: 'pending' | 'approved' | 'processing' | 'completed' | 'failed' | 'cancelled';
  paymentMethod: 'payroll_deduction' | 'direct_payment' | 'company_match';
  payrollInfo?: PayrollInfo;
  processingInfo: ProcessingInfo;
  taxInfo: TaxInfo;
  notes?: string;
  isAnonymous: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PayrollInfo {
  deductionType: 'percentage' | 'fixed_amount';
  deductionValue: number;
  startDate?: string;
  endDate?: string;
  nextDeductionDate?: string;
}

export interface ProcessingInfo {
  stripePaymentIntentId?: string;
  transactionId?: string;
  processedAt?: string;
  failureReason?: string;
}

export interface TaxInfo {
  taxDeductible: boolean;
  receiptGenerated: boolean;
  receiptGeneratedAt?: string;
  taxYear: number;
}

// Tax Record types
export interface TaxRecord {
  id: string;
  user: string;
  company: string;
  taxYear: number;
  donations: TaxRecordDonation[];
  summary: TaxRecordSummary;
  documents: TaxDocuments;
  status: 'draft' | 'generated' | 'sent' | 'downloaded';
  generatedAt?: string;
  sentAt?: string;
  downloadedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaxRecordDonation {
  donation: string;
  charityName: string;
  charityEin: string;
  amount: number;
  date: string;
  isTaxDeductible: boolean;
}

export interface TaxRecordSummary {
  totalDonations: number;
  totalTaxDeductible: number;
  donationCount: number;
  uniqueCharities: number;
}

export interface TaxDocuments {
  scheduleA: {
    generated: boolean;
    generatedAt?: string;
    filePath?: string;
    fileSize?: number;
  };
  receipt: {
    generated: boolean;
    generatedAt?: string;
    filePath?: string;
    fileSize?: number;
  };
  summary: {
    generated: boolean;
    generatedAt?: string;
    filePath?: string;
    fileSize?: number;
  };
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any[];
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  data: T[];
  pagination: {
    current: number;
    pages: number;
    total: number;
  };
}

// Dashboard types
export interface DashboardStats {
  totalDonated: number;
  totalMatching: number;
  totalAmount: number;
  donationCount: number;
  uniqueCharityCount: number;
}

export interface MonthlyTrend {
  month: number;
  totalAmount: number;
  donationCount: number;
}

export interface TopCharity {
  charityName: string;
  charityCategory: string;
  totalAmount: number;
  donationCount: number;
}

export interface CompanyDashboardData {
  company: {
    name: string;
    subscription: Subscription;
    matchingProgram: MatchingProgram;
  };
  summary: {
    totalDonations: number;
    totalMatching: number;
    totalAmount: number;
    donationCount: number;
    uniqueDonorCount: number;
  };
  participation: {
    totalEmployees: number;
    participatingEmployees: number;
    participationRate: number;
  };
  topCharities: TopCharity[];
  monthlyTrends: MonthlyTrend[];
  matchingStatus: {
    enabled: boolean;
    usedAmount: number;
    annualLimit: number;
    remainingAmount: number;
    utilizationPercentage: number;
  };
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  companyDomain: string;
  employeeId?: string;
  role?: 'employee' | 'hr_admin';
}

export interface DonationForm {
  charity: string;
  amount: number;
  type: 'one_time' | 'recurring';
  frequency?: 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'annually';
  paymentMethod: 'payroll_deduction' | 'direct_payment';
  payrollInfo?: {
    deductionType: 'percentage' | 'fixed_amount';
    deductionValue: number;
  };
  notes?: string;
  isAnonymous?: boolean;
}

// Filter types
export interface DonationFilters {
  status?: string;
  type?: string;
  year?: number;
  charity?: string;
  user?: string;
  page?: number;
  limit?: number;
}

export interface CharityFilters {
  search?: string;
  category?: string;
  verified?: boolean;
  featured?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Leaderboard types
export interface LeaderboardEntry {
  rank: number;
  name: string;
  totalDonated: number;
  level: number;
  badges: number;
}

// Error types
export interface ApiError {
  message: string;
  status?: number;
  errors?: any[];
}
