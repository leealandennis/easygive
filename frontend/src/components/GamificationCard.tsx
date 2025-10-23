import React from 'react';
import { User } from '../types';
import { Award, Trophy, Star, Target } from 'lucide-react';

interface GamificationCardProps {
  user: User | null;
}

export const GamificationCard: React.FC<GamificationCardProps> = ({ user }) => {
  if (!user) return null;

  const { gamification } = user;
  const nextLevelAmount = gamification.level * 100;
  const progressToNextLevel = ((gamification.totalDonated % 100) / 100) * 100;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Your Progress</h2>
        <div className="flex items-center space-x-1">
          <Trophy className="h-5 w-5 text-yellow-500" />
          <span className="text-sm font-medium text-gray-700">Level {gamification.level}</span>
        </div>
      </div>

      {/* Level progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Progress to Level {gamification.level + 1}</span>
          <span>${gamification.totalDonated.toFixed(0)} / ${nextLevelAmount}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressToNextLevel}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <Target className="h-4 w-4 text-primary-600 mr-1" />
            <span className="text-lg font-bold text-gray-900">
              ${gamification.totalDonated.toFixed(0)}
            </span>
          </div>
          <p className="text-xs text-gray-500">Total Donated</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <Star className="h-4 w-4 text-yellow-500 mr-1" />
            <span className="text-lg font-bold text-gray-900">
              {gamification.totalPoints}
            </span>
          </div>
          <p className="text-xs text-gray-500">Points Earned</p>
        </div>
      </div>

      {/* Badges */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-3">Badges Earned</h3>
        {gamification.badges.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {gamification.badges.map((badge, index) => (
              <div
                key={index}
                className="flex items-center space-x-1 px-2 py-1 bg-yellow-100 rounded-full"
              >
                <Award className="h-3 w-3 text-yellow-600" />
                <span className="text-xs text-yellow-800">{badge.name.replace('_', ' ')}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No badges earned yet</p>
        )}
      </div>

      {/* Streak */}
      {gamification.streakDays > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-center">
            <span className="text-sm text-gray-600">
              🔥 {gamification.streakDays} day donation streak
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
