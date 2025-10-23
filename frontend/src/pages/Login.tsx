import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Heart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import Input from '../components/ui/Input';
// import toast from 'react-hot-toast';

interface LoginForm {
  email: string;
  password: string;
}

export const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { login, isAuthenticated, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue
  } = useForm<LoginForm>();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = (location.state as any)?.from?.pathname || '/app/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const onSubmit = async (data: LoginForm) => {
    try {
      clearError(); // Clear any previous errors
      await login(data.email, data.password);
      const from = (location.state as any)?.from?.pathname || '/app/dashboard';
      navigate(from, { replace: true });
    } catch (error) {
      // Error is handled by the auth context and will be displayed
      console.error('Login error:', error);
    }
  };

  const fillDemoAccount = (email: string, password: string) => {
    setValue('email', email);
    setValue('password', password);
    clearError();
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
              <h2 className="mt-4 text-2xl font-bold text-gray-900">Sign in to EasyGive</h2>
              <p className="mt-1 text-sm text-gray-600">Access your employee donation platform</p>
            </div>

            <form className="mt-6 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Login Failed
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="label label-required">
                Email address
              </label>
              <Input id="email" type="email" autoComplete="email" className={errors.email ? 'input-error' : ''} placeholder="Enter your email" {...register('email', { required: 'Email is required', pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Invalid email address' } })} />
              {errors.email && (
                <p className="mt-1 text-sm text-accent-600">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="label label-required">
                Password
              </label>
              <div className="relative">
                <Input id="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" className={`pr-10 ${errors.password ? 'input-error' : ''}`} placeholder="Enter your password" {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Password must be at least 6 characters' } })} />
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
          </div>

          {/* Submit button */}
          <div>
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="loading-spinner mr-2"></div>
                  Signing in...
                </div>
              ) : (
                'Sign in'
              )}
            </Button>
          </div>

          {/* Register link */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                Sign up here
              </Link>
            </p>
          </div>
            </form>
          </CardBody>
        </Card>

        {/* Demo accounts */}
        <Card>
          <CardBody>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Quick Login - Demo Accounts</h3>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => fillDemoAccount('hr@techcorp.com', 'password123')}
                className="w-full text-left px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-blue-900">HR Admin</p>
                    <p className="text-xs text-blue-700">hr@techcorp.com</p>
                  </div>
                  <span className="text-xs text-blue-600 font-medium">Click to fill</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => fillDemoAccount('john.doe@techcorp.com', 'password123')}
                className="w-full text-left px-4 py-3 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-green-900">Employee</p>
                    <p className="text-xs text-green-700">john.doe@techcorp.com</p>
                  </div>
                  <span className="text-xs text-green-600 font-medium">Click to fill</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => fillDemoAccount('jane.smith@techcorp.com', 'password123')}
                className="w-full text-left px-4 py-3 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-purple-900">Employee 2</p>
                    <p className="text-xs text-purple-700">jane.smith@techcorp.com</p>
                  </div>
                  <span className="text-xs text-purple-600 font-medium">Click to fill</span>
                </div>
              </button>
            </div>
            <p className="mt-3 text-xs text-gray-500 text-center">
              Click any account to auto-fill credentials, then click "Sign in"
            </p>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};
