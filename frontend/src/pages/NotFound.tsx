import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h1 className="text-9xl font-bold text-primary-600">404</h1>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Page not found
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sorry, we couldn't find the page you're looking for.
          </p>
        </div>
        
        <div className="space-y-4">
          <Link to="/app/dashboard">
            <Button leftIcon={<Home className="h-4 w-4" />}>Go to Dashboard</Button>
          </Link>
          <Button variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => window.history.back()} className="ml-2">Go Back</Button>
        </div>
      </div>
    </div>
  );
};
