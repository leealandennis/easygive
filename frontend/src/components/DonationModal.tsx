import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, Heart, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import { Charity } from '../types';
import { donationService } from '../services/donations';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface DonationModalProps {
  charity: Charity | null;
  isOpen: boolean;
  onClose: () => void;
}

interface DonationModalForm {
  amount: number;
  anonymous: boolean;
}

export const DonationModal: React.FC<DonationModalProps> = ({
  charity,
  isOpen,
  onClose
}) => {
  const [matchingAmount, setMatchingAmount] = useState(0);
  const queryClient = useQueryClient();
  
  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors }
  } = useForm<DonationModalForm>({
    defaultValues: {
      amount: 25,
      anonymous: false
    }
  });

  const amount = watch('amount');

  // Calculate matching amount (assuming 100% company match for demo)
  React.useEffect(() => {
    if (amount && !isNaN(amount)) {
      setMatchingAmount(amount * 1.0); // 100% match
    } else {
      setMatchingAmount(0);
    }
  }, [amount]);

  const donationMutation = useMutation({
    mutationFn: (payload: import('../types').DonationForm) =>
      donationService.createDonation(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donationSummary'] });
      queryClient.invalidateQueries({ queryKey: ['recentDonations'] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
      reset();
      onClose();
    }
  });

  const onSubmit = async (data: DonationModalForm) => {
    if (!charity) return;
    
    try {
      await donationMutation.mutateAsync({
        charity: charity.id,
        amount: data.amount,
        type: 'one_time',
        paymentMethod: 'direct_payment',
        isAnonymous: data.anonymous
      });
    } catch (error) {
      console.error('Donation error:', error);
    }
  };

  if (!isOpen || !charity) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
          {/* Header */}
          <div className="bg-gradient-to-br from-primary-600 to-primary-700 px-6 py-8 text-white">
            <button
              onClick={onClose}
              className="absolute right-4 top-4 text-white hover:text-gray-200 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
            
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 rounded-full bg-white bg-opacity-20 flex items-center justify-center backdrop-blur-sm">
                <Heart className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Make a Donation</h2>
                <p className="text-primary-100 text-sm mt-1">{charity.name}</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
            {/* Amount Input */}
            <div>
              <label className="label label-required">Donation Amount</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DollarSign className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  className={`input pl-10 text-lg font-semibold ${errors.amount ? 'input-error' : ''}`}
                  placeholder="25.00"
                  {...register('amount', {
                    required: 'Amount is required',
                    min: { value: 1, message: 'Minimum donation is $1' },
                    max: { value: 10000, message: 'Maximum donation is $10,000' }
                  })}
                />
              </div>
              {errors.amount && (
                <p className="mt-1 text-sm text-accent-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.amount.message}
                </p>
              )}
            </div>

            {/* Quick Amount Buttons */}
            <div className="grid grid-cols-4 gap-2">
              {[25, 50, 100, 250].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setValue('amount', value, { shouldValidate: true, shouldDirty: true })}
                  className="btn-outline btn-sm hover:bg-primary-50 hover:border-primary-300 hover:text-primary-700"
                >
                  ${value}
                </button>
              ))}
            </div>

            {/* Company Matching */}
            <div className="bg-gradient-to-br from-secondary-50 to-green-50 rounded-xl p-4 border border-secondary-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center text-secondary-700">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  <span className="font-semibold">Company Match</span>
                </div>
                <span className="text-2xl font-bold text-secondary-700">
                  ${matchingAmount.toFixed(2)}
                </span>
              </div>
              <div className="h-px bg-secondary-200 my-3"></div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 font-medium">Total Impact</span>
                <span className="text-2xl font-bold text-gray-900">
                  ${((amount || 0) + matchingAmount).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Anonymous Option */}
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
              <input
                id="anonymous"
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                {...register('anonymous')}
              />
              <label htmlFor="anonymous" className="text-sm text-gray-700">
                Make this donation anonymously
              </label>
            </div>

            {/* Charity Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">About this charity</h4>
              <p className="text-sm text-gray-600 mb-2">{charity.description}</p>
              <div className="flex items-center text-sm">
                <span className="badge badge-primary mr-2 capitalize">
                  {charity.category.replace('_', ' ')}
                </span>
                {charity.website && (
                  <a
                    href={charity.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:text-primary-700"
                  >
                    Visit website
                  </a>
                )}
              </div>
            </div>

            {/* Error Message */}
            {donationMutation.isError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-600">
                  Failed to process donation. Please try again.
                </p>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="btn-outline flex-1"
                disabled={donationMutation.isPending}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary flex-1"
                disabled={donationMutation.isPending}
              >
                {donationMutation.isPending ? (
                  <div className="flex items-center justify-center">
                    <div className="loading-spinner mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  <>
                    <Heart className="h-4 w-4 mr-2" />
                    Donate ${amount || 0}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

