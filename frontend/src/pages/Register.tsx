import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Heart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import Input from '../components/ui/Input';

interface RegisterForm {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  companyDomain: string;
  employeeId?: string;
  role: 'employee' | 'hr_admin';
}

export const Register: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register: registerUser, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<RegisterForm>({
    defaultValues: {
      role: 'employee'
    }
  });

  const password = watch('password');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/app/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data: RegisterForm) => {
    try {
      await registerUser(data);
      navigate('/app/dashboard', { replace: true });
    } catch (error) {
      // Error is handled by the auth context
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner-lg"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        <Card>
          <CardBody>
            <div className="text-center">
              <div className="mx-auto h-12 w-12 rounded-lg bg-primary-600 flex items-center justify-center">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <h2 className="mt-4 text-2xl font-bold text-gray-900">Create your account</h2>
              <p className="mt-1 text-sm text-gray-600">Join your company's donation platform</p>
            </div>

            <form className="mt-6 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            {/* Name fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="label label-required">
                  First name
                </label>
                <Input id="firstName" type="text" autoComplete="given-name" className={errors.firstName ? 'input-error' : ''} placeholder="John" {...register('firstName', { required: 'First name is required', minLength: { value: 1, message: 'First name is required' } })} />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-accent-600">{errors.firstName.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="lastName" className="label label-required">
                  Last name
                </label>
                <Input id="lastName" type="text" autoComplete="family-name" className={errors.lastName ? 'input-error' : ''} placeholder="Doe" {...register('lastName', { required: 'Last name is required', minLength: { value: 1, message: 'Last name is required' } })} />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-accent-600">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="label label-required">
                Email address
              </label>
              <Input id="email" type="email" autoComplete="email" className={errors.email ? 'input-error' : ''} placeholder="john.doe@company.com" {...register('email', { required: 'Email is required', pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Invalid email address' } })} />
              {errors.email && (
                <p className="mt-1 text-sm text-accent-600">{errors.email.message}</p>
              )}
            </div>

            {/* Company domain */}
            <div>
              <label htmlFor="companyDomain" className="label label-required">
                Company domain
              </label>
              <Input id="companyDomain" type="text" className={errors.companyDomain ? 'input-error' : ''} placeholder="company.com" {...register('companyDomain', { required: 'Company domain is required', pattern: { value: /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/, message: 'Invalid domain format' } })} />
              {errors.companyDomain && (
                <p className="mt-1 text-sm text-accent-600">{errors.companyDomain.message}</p>
              )}
            </div>

            {/* Employee ID */}
            <div>
              <label htmlFor="employeeId" className="label">
                Employee ID (optional)
              </label>
              <Input id="employeeId" type="text" className="input" placeholder="EMP001" {...register('employeeId')} />
            </div>

            {/* Role */}
            <div>
              <label htmlFor="role" className="label label-required">
                Role
              </label>
              <select
                id="role"
                className="input"
                {...register('role', { required: 'Role is required' })}
              >
                <option value="employee">Employee</option>
                <option value="hr_admin">HR Administrator</option>
              </select>
              {errors.role && (
                <p className="mt-1 text-sm text-accent-600">{errors.role.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="label label-required">
                Password
              </label>
              <div className="relative">
                <Input id="password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" className={`pr-10 ${errors.password ? 'input-error' : ''}`} placeholder="Create a password" {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Password must be at least 6 characters' } })} />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-accent-600">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="label label-required">
                Confirm password
              </label>
              <div className="relative">
                <Input id="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} autoComplete="new-password" className={`pr-10 ${errors.confirmPassword ? 'input-error' : ''}`} placeholder="Confirm your password" {...register('confirmPassword', { required: 'Please confirm your password', validate: value => value === password || 'Passwords do not match' })} />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-accent-600">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>

          {/* Submit button */}
          <div>
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="loading-spinner mr-2"></div>
                  Creating account...
                </div>
              ) : (
                'Create account'
              )}
            </Button>
          </div>

          {/* Login link */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                Sign in here
              </Link>
            </p>
          </div>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};
