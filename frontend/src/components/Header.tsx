import React, { useState } from 'react';
import { Menu, Bell, User, LogOut, Settings, Home, Heart, CreditCard, FileText, Users, BarChart3, Shield, Minimize2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, NavLink } from 'react-router-dom';
import { Button } from './ui/Button';
import { Avatar } from './ui/Avatar';

interface HeaderProps {
  onMenuClick: () => void;
  onToggleSidebar?: () => void;
  isSidebarCollapsed?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [compact, setCompact] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('density') === 'compact';
    }
    return false;
  });

  React.useEffect(() => {
    const root = document.documentElement;
    if (compact) {
      root.classList.add('density-compact');
      localStorage.setItem('density', 'compact');
    } else {
      root.classList.remove('density-compact');
      localStorage.setItem('density', 'comfortable');
    }
  }, [compact]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleProfileClick = () => {
    navigate('/app/profile');
    setShowUserMenu(false);
  };

  const handleSettingsClick = () => {
    if (user?.role === 'hr_admin' || user?.role === 'super_admin') {
      navigate('/app/company/settings');
    } else {
      navigate('/app/profile');
    }
    setShowUserMenu(false);
  };

  return (
    <header className="sticky top-0 z-30 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side */}
          <div className="flex items-center">
            {/* Mobile sidebar button */}
            <button
              type="button"
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
              onClick={onMenuClick}
            >
              <Menu className="h-6 w-6" />
            </button>

            {/* Top navigation (desktop) */}
            <nav className="hidden lg:flex items-center space-x-1 ml-2">
              <HeaderLink to="/app/dashboard" icon={Home} label="Dashboard" />
              <HeaderLink to="/app/charities" icon={Heart} label="Charities" />
              <HeaderLink to="/app/donations" icon={CreditCard} label="Donations" />
              <HeaderLink to="/app/tax-records" icon={FileText} label="Tax" />
              {(user?.role === 'hr_admin' || user?.role === 'super_admin') && (
                <>
                  <HeaderLink to="/app/company" icon={BarChart3} label="Company" />
                  <HeaderLink to="/app/company/employees" icon={Users} label="Employees" />
                  <HeaderLink to="/app/company/reports" icon={BarChart3} label="Reports" />
                  <HeaderLink to="/app/company/settings" icon={Settings} label="Settings" />
                </>
              )}
              {user?.role === 'super_admin' && (
                <HeaderLink to="/app/admin" icon={Shield} label="Admin" />
              )}
            </nav>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Density toggle */}
            <button
              type="button"
              onClick={() => setCompact(v => !v)}
              className="hidden lg:inline-flex items-center px-2 py-1 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              title={compact ? 'Switch to comfortable density' : 'Switch to compact density'}
            >
              <Minimize2 className="h-4 w-4" />
            </button>
            {/* Notifications */}
            <button
              type="button"
              className="p-2 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            >
              <Bell className="h-6 w-6" />
            </button>

            {/* User menu */}
            <div className="relative">
              <button
                type="button"
                className="flex items-center space-x-3 p-2 rounded-lg text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <div className="flex-shrink-0">
                  <Avatar initials={`${user?.firstName?.charAt(0)}${user?.lastName?.charAt(0)}`} size="md" />
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {user?.role?.replace('_', ' ')}
                  </p>
                </div>
                <User className="h-4 w-4 text-gray-400" />
              </button>

              {/* Dropdown menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                  <button
                    onClick={handleProfileClick}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <User className="h-4 w-4 mr-3" />
                    Profile
                  </button>
                  <button
                    onClick={handleSettingsClick}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Settings className="h-4 w-4 mr-3" />
                    Settings
                  </button>
                  <hr className="my-1" />
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <LogOut className="h-4 w-4 mr-3" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Click outside to close user menu */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </header>
  );
};

interface HeaderLinkProps {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

const HeaderLink: React.FC<HeaderLinkProps> = ({ to, icon: Icon, label }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          'inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors',
          isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
        ].join(' ')
      }
    >
      <Icon className="h-4 w-4 mr-2" />
      {label}
    </NavLink>
  );
};
