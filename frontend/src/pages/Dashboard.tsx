import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { 
  Heart, 
  DollarSign, 
  TrendingUp, 
  Award,
  Calendar,
  Target,
  Users,
  BarChart3
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { donationService } from '../services/donations';
import { charityService } from '../services/charities';
import { StatCard } from '../components/StatCard';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { PageHeader } from '../components/ui/PageHeader';
import { RecentDonations } from '../components/RecentDonations';
import { TopCharities } from '../components/TopCharities';
import { MonthlyChart } from '../components/MonthlyChart';
import { GamificationCard } from '../components/GamificationCard';
import { LeaderboardCard } from '../components/LeaderboardCard';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch dashboard data
  const { data: donationSummary, isLoading: summaryLoading } = useQuery({
    queryKey: ['donationSummary'],
    queryFn: () => donationService.getUserSummary(),
    enabled: !!user
  });

  const { data: recentDonations, isLoading: donationsLoading } = useQuery({
    queryKey: ['recentDonations'],
    queryFn: () => donationService.getUserDonations({ page: 1, limit: 5 }),
    enabled: !!user
  });

  const { data: topCharities, isLoading: charitiesLoading } = useQuery({
    queryKey: ['topCharities'],
    queryFn: () => charityService.getFeaturedCharities(5),
    enabled: !!user
  });

  const { data: leaderboard, isLoading: leaderboardLoading } = useQuery({
    queryKey: ['leaderboard', user?.company.id],
    queryFn: () => donationService.getLeaderboard(user?.company.id || ''),
    enabled: !!user?.company.id
  });

  const isLoading = summaryLoading || donationsLoading || charitiesLoading || leaderboardLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <PageHeader
        icon={<Award className="h-5 w-5 text-primary-600" />}
        title={`Welcome back, ${user?.firstName}!`}
        subtitle="Here's your donation activity overview"
      />

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Donated"
          value={`$${donationSummary?.summary.totalDonated.toFixed(2) || '0.00'}`}
          icon={DollarSign}
          color="primary"
          loading={summaryLoading}
        />
        <StatCard
          title="Company Matching"
          value={`$${donationSummary?.summary.totalMatching.toFixed(2) || '0.00'}`}
          icon={TrendingUp}
          color="secondary"
          loading={summaryLoading}
        />
        <StatCard
          title="Total Impact"
          value={`$${donationSummary?.summary.totalAmount.toFixed(2) || '0.00'}`}
          icon={Heart}
          color="accent"
          loading={summaryLoading}
        />
        <StatCard
          title="Donations Made"
          value={donationSummary?.summary.donationCount.toString() || '0'}
          icon={Target}
          color="gray"
          loading={summaryLoading}
        />
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Monthly chart */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Donation Trends</h2>
              <Calendar className="h-5 w-5 text-gray-400" />
            </CardHeader>
            <CardBody>
              <MonthlyChart data={donationSummary?.monthlyBreakdown || []} />
            </CardBody>
          </Card>

          {/* Recent donations */}
          <RecentDonations 
            donations={recentDonations?.data || []} 
            loading={donationsLoading}
          />
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Gamification */}
          <GamificationCard user={user} />

          {/* Top charities */}
          <TopCharities 
            charities={topCharities || []} 
            loading={charitiesLoading}
          />

          {/* Leaderboard */}
          <div id="leaderboard-section">
            <LeaderboardCard 
              leaderboard={leaderboard?.data || []} 
              loading={leaderboardLoading}
            />
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <Card>
        <CardBody>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button onClick={() => navigate('/app/charities')} leftIcon={<Heart className="h-4 w-4" />}>Make a Donation</Button>
            <Button variant="outline" onClick={() => navigate('/app/charities')} leftIcon={<BarChart3 className="h-4 w-4" />}>View All Charities</Button>
            <Button variant="outline" onClick={() => document.getElementById('leaderboard-section')?.scrollIntoView({ behavior: 'smooth' })} leftIcon={<Users className="h-4 w-4" />}>View Leaderboard</Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
