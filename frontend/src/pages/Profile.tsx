import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { User, Mail, Building, Shield, Award, Star, TrendingUp, Heart, Edit2, Save, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';

interface ProfileForm {
  firstName: string;
  lastName: string;
  email: string;
}

export const Profile: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty }
  } = useForm<ProfileForm>({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || ''
    }
  });

  const onSubmit = async (data: ProfileForm) => {
    // This would typically call an API endpoint to update user profile
    console.log('Updating profile:', data);
    alert('Profile update functionality will be implemented with backend support');
    setIsEditing(false);
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
  };

  const gamificationLevel = user?.gamification?.level || 1;
  const gamificationPoints = user?.gamification?.totalPoints || 0;
  const nextLevelPoints = gamificationLevel * 1000;
  const progress = (gamificationPoints / nextLevelPoints) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardBody className="flex flex-col md:flex-row items-start md:items-center justify-between">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <Avatar initials={`${user?.firstName?.charAt(0)}${user?.lastName?.charAt(0)}`} size="lg" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">{user?.firstName} {user?.lastName}</h1>
              <p className="text-gray-600 mt-1 capitalize">{user?.role?.replace('_', ' ')}</p>
            </div>
          </div>

          {!isEditing && (
            <Button variant="outline" onClick={() => setIsEditing(true)} leftIcon={<Edit2 className="h-4 w-4" />}>Edit Profile</Button>
          )}
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card>
            <CardBody>
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Personal Information
            </h2>

            {isEditing ? (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">First Name</label>
                    <input
                      type="text"
                      className={`input ${errors.firstName ? 'input-error' : ''}`}
                      {...register('firstName', { required: 'First name is required' })}
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-sm text-accent-600">{errors.firstName.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="label">Last Name</label>
                    <input
                      type="text"
                      className={`input ${errors.lastName ? 'input-error' : ''}`}
                      {...register('lastName', { required: 'Last name is required' })}
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-sm text-accent-600">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="label">Email Address</label>
                  <input
                    type="email"
                    className="input bg-gray-50"
                    {...register('email')}
                    disabled
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Email address cannot be changed
                  </p>
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button type="submit" disabled={!isDirty} leftIcon={<Save className="h-4 w-4" />}>Save Changes</Button>
                  <Button type="button" variant="outline" onClick={handleCancel} leftIcon={<X className="h-4 w-4" />}>Cancel</Button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <User className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Full Name</p>
                    <p className="text-sm font-medium text-gray-900">
                      {user?.firstName} {user?.lastName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Email Address</p>
                    <p className="text-sm font-medium text-gray-900">{user?.email}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Building className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Company</p>
                    <p className="text-sm font-medium text-gray-900">
                      {user?.company?.name || 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Shield className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Role</p>
                    <p className="text-sm font-medium text-gray-900 capitalize">
                      {user?.role?.replace('_', ' ')}
                    </p>
                  </div>
                </div>
              </div>
            )}
            </CardBody>
          </Card>

          {/* Company Benefits */}
          <Card>
            <CardBody>
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Company Benefits
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gradient-to-br from-secondary-50 to-green-50 rounded-lg border border-secondary-200">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-lg bg-secondary-600 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Donation Matching</p>
                    <p className="text-sm text-gray-600">100% match on all donations</p>
                  </div>
                </div>
                <span className="badge badge-success">Active</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-lg bg-gray-400 flex items-center justify-center">
                    <Heart className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Monthly Allowance</p>
                    <p className="text-sm text-gray-600">$100 per month for donations</p>
                  </div>
                </div>
                <span className="badge badge-gray">Available</span>
              </div>
            </div>
            </CardBody>
          </Card>
        </div>

        {/* Right Column - Gamification */}
        <div className="space-y-6">
          {/* Level Card */}
          <Card>
            <CardBody>
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 mb-4">
                <Award className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Level {gamificationLevel}
              </h2>
              <p className="text-sm text-gray-600 mt-1">Impact Maker</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Progress to Level {gamificationLevel + 1}</span>
                <span className="font-semibold text-gray-900">
                  {gamificationPoints} / {nextLevelPoints}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-center space-x-2 text-primary-600">
                <Star className="h-5 w-5" />
                <span className="font-semibold">{gamificationPoints} Total Points</span>
              </div>
            </div>
            </CardBody>
          </Card>

          {/* Badges */}
          <Card>
            <CardBody>
            <h3 className="font-semibold text-gray-900 mb-4">Achievements</h3>
            <div className="grid grid-cols-3 gap-3">
              {gamificationPoints > 0 && (
                <div className="flex flex-col items-center p-3 bg-gradient-to-br from-primary-50 to-blue-50 rounded-lg border border-primary-200">
                  <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center mb-2">
                    <Heart className="h-5 w-5 text-white" />
                  </div>
                  <p className="text-xs text-center text-gray-600 font-medium">First Donation</p>
                </div>
              )}
              {gamificationLevel >= 3 && (
                <div className="flex flex-col items-center p-3 bg-gradient-to-br from-secondary-50 to-green-50 rounded-lg border border-secondary-200">
                  <div className="h-10 w-10 rounded-full bg-secondary-600 flex items-center justify-center mb-2">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  <p className="text-xs text-center text-gray-600 font-medium">Rising Star</p>
                </div>
              )}
              {gamificationLevel >= 5 && (
                <div className="flex flex-col items-center p-3 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center mb-2">
                    <Award className="h-5 w-5 text-white" />
                  </div>
                  <p className="text-xs text-center text-gray-600 font-medium">Champion</p>
                </div>
              )}
              
              {/* Locked badges */}
              {gamificationLevel < 10 && (
                <>
                  <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg border border-gray-200 opacity-50">
                    <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center mb-2">
                      <Star className="h-5 w-5 text-gray-500" />
                    </div>
                    <p className="text-xs text-center text-gray-500 font-medium">Locked</p>
                  </div>
                  <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg border border-gray-200 opacity-50">
                    <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center mb-2">
                      <Award className="h-5 w-5 text-gray-500" />
                    </div>
                    <p className="text-xs text-center text-gray-500 font-medium">Locked</p>
                  </div>
                </>
              )}
            </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};
