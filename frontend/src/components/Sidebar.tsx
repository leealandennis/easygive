import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, 
  Heart, 
  CreditCard, 
  FileText, 
  Users, 
  BarChart3, 
  Settings, 
  Shield,
  X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import clsx from 'clsx';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed?: boolean;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: ('employee' | 'hr_admin' | 'super_admin')[];
}

const navigation: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/app/dashboard',
    icon: Home,
    roles: ['employee', 'hr_admin', 'super_admin']
  },
  {
    name: 'Charities',
    href: '/app/charities',
    icon: Heart,
    roles: ['employee', 'hr_admin', 'super_admin']
  },
  {
    name: 'My Donations',
    href: '/app/donations',
    icon: CreditCard,
    roles: ['employee', 'hr_admin', 'super_admin']
  },
  {
    name: 'Tax Records',
    href: '/app/tax-records',
    icon: FileText,
    roles: ['employee', 'hr_admin', 'super_admin']
  },
  {
    name: 'Company Dashboard',
    href: '/app/company',
    icon: BarChart3,
    roles: ['hr_admin', 'super_admin']
  },
  {
    name: 'Employees',
    href: '/app/company/employees',
    icon: Users,
    roles: ['hr_admin', 'super_admin']
  },
  {
    name: 'Reports',
    href: '/app/company/reports',
    icon: BarChart3,
    roles: ['hr_admin', 'super_admin']
  },
  {
    name: 'Company Settings',
    href: '/app/company/settings',
    icon: Settings,
    roles: ['hr_admin', 'super_admin']
  },
  {
    name: 'Admin Panel',
    href: '/app/admin',
    icon: Shield,
    roles: ['super_admin']
  }
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, isCollapsed = false }) => {
  const { user } = useAuth();
  const location = useLocation();
  const [isHovered, setIsHovered] = useState(false);

  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(user?.role as any)
  );

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={onClose} />
        </div>
      )}

      {/* Sidebar */}
      <div
        className={clsx(
          'fixed inset-y-0 left-0 z-50 bg-white shadow-lg transform transition-all duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          (isCollapsed && !isHovered) ? 'w-20' : 'w-64'
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className={clsx('flex items-center justify-between h-16 px-6 border-b border-gray-200 bg-white', isCollapsed && 'px-4')}>
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-md bg-primary-600 flex items-center justify-center">
                <Heart className="h-5 w-5 text-white" />
              </div>
              {(!(isCollapsed && !isHovered)) && (
                <span className="ml-2 text-base font-semibold text-gray-900">
                  EasyGive
                </span>
              )}
            </div>
            <button
              type="button"
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-white transition-colors"
              onClick={onClose}
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className={clsx('flex-1 py-4 space-y-1 overflow-y-auto', (isCollapsed && !isHovered) ? 'px-2' : 'px-3')}>
            {filteredNavigation.map((item) => {
              const isActive = location.pathname === item.href;
              const showText = !(isCollapsed && !isHovered);
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={clsx(
                    'group flex items-center px-2.5 py-2 text-sm font-medium rounded-md transition-all duration-150',
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                    (isCollapsed && !isHovered) && 'justify-center'
                  )}
                  title={item.name}
                  aria-label={item.name}
                  onClick={() => {
                    // Close mobile sidebar when navigating
                    if (window.innerWidth < 1024) {
                      onClose();
                    }
                  }}
                >
                  <item.icon
                    className={clsx(
                      'h-5 w-5 flex-shrink-0',
                      isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-600',
                      showText && 'mr-2.5'
                    )}
                  />
                  {showText && item.name}
                </NavLink>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-3 border-t border-gray-200 bg-white">
            <div className={clsx('flex items-center rounded-md', (isCollapsed && !isHovered) ? 'justify-center p-1.5' : 'p-1.5')}> 
              <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center">
                <span className="text-sm font-semibold text-white">
                  {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                </span>
              </div>
              {(!(isCollapsed && !isHovered)) && (
                <div className="ml-3 flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500 capitalize truncate">
                    {user?.role?.replace('_', ' ')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
