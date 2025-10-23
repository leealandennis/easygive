import React from 'react';
import { LeaderboardEntry } from '../types';
import { Trophy, Medal, Award } from 'lucide-react';

interface LeaderboardCardProps {
  leaderboard: LeaderboardEntry[];
  loading?: boolean;
}

export const LeaderboardCard: React.FC<LeaderboardCardProps> = ({
  leaderboard,
  loading = false
}) => {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-4 w-4 text-yellow-500" />;
      case 2:
        return <Medal className="h-4 w-4 text-gray-400" />;
      case 3:
        return <Award className="h-4 w-4 text-amber-600" />;
      default:
        return <span className="text-sm font-medium text-gray-500">#{rank}</span>;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Company Leaderboard</h2>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-6 w-6 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Company Leaderboard</h2>
        <div className="text-center py-4">
          <Trophy className="h-8 w-8 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">No leaderboard data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Company Leaderboard</h2>
      
      <div className="space-y-3">
        {leaderboard.slice(0, 5).map((entry) => (
          <div
            key={entry.rank}
            className={`flex items-center justify-between p-3 rounded-lg ${
              entry.rank <= 3 ? 'bg-gradient-to-r from-yellow-50 to-yellow-100' : 'bg-gray-50'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-6">
                {getRankIcon(entry.rank)}
              </div>
              <div>
                <p className="font-medium text-gray-900">{entry.name}</p>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">Level {entry.level}</span>
                  {entry.badges > 0 && (
                    <span className="text-xs text-yellow-600">
                      {entry.badges} badge{entry.badges !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-gray-900">
                ${entry.totalDonated.toFixed(0)}
              </p>
            </div>
          </div>
        ))}
      </div>
      
      {leaderboard.length > 5 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button className="w-full text-sm text-primary-600 hover:text-primary-500 font-medium">
            View full leaderboard
          </button>
        </div>
      )}
    </div>
  );
};
