import React, { useState } from 'react';
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { useCompany } from '../context/CompanyContext';
import { getApiUrl } from '../config/api';
import {
  ClockIcon,
  Cog6ToothIcon,
  // ChatBubbleLeftEllipsisIcon, // COMMENTED OUT - Buyer Interactions hidden
  Squares2X2Icon,
  Bars3Icon,
  XMarkIcon,
  UserIcon,
  UsersIcon,
  PlusIcon,
  PlayIcon,
  ServerIcon,
  BeakerIcon,
  LockClosedIcon,
  UserGroupIcon,
  DocumentArrowUpIcon,
  CreditCardIcon,
  HomeIcon,
} from '@heroicons/react/24/outline';

// Base menu items (available to all users)
const baseMenuItems = [
    { name: 'Overview', icon: Squares2X2Icon, path: '/overview' },
    { name: 'Create Qudemo', icon: PlusIcon, path: '/create' },
    { name: 'Qudemos', icon: PlayIcon, path: '/qudemos' },
    { name: 'Interactions', icon: UserGroupIcon, path: '/customer-interactions', requiresPro: true },
];

const Sidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { company } = useCompany();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  // Check subscription status
  const subscriptionPlan = company?.subscription_plan || 'free';
  const subscriptionStatus = company?.subscription_status || 'active';
  const isActive = ['active', 'trialing', 'on_trial'].includes(subscriptionStatus);
  const isPro = ['pro', 'enterprise'].includes(subscriptionPlan) && isActive;
  const isEnterprise = subscriptionPlan === 'enterprise' && isActive;

  const handleLogout = async () => {
    const { clearAuthTokens } = await import('../utils/tokenRefresh');
    await clearAuthTokens();
    window.location.href = '/login';
  };

  const confirmLogout = () => {
    setShowLogoutModal(true);
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  const handlePlanClick = async (e) => {
    e.preventDefault();
    setIsOpen(false);

    // For Pro users, open billing portal
    if (subscriptionPlan === 'pro' || subscriptionPlan === 'enterprise') {
      try {
        const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
        const baseUrl = getApiUrl('node');
        const response = await fetch(`${baseUrl}/api/subscription/${company.id}/billing-portal`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (data.success && data.portalUrl) {
          window.open(data.portalUrl, '_blank');
        } else {
          console.error('Failed to get billing portal:', data.error);
          // Fallback to profile page
          navigate('/profile');
        }
      } catch (error) {
        console.error('Failed to open billing portal:', error);
        // Fallback to profile page
        navigate('/profile');
      }
    } else {
      // For Free users, redirect to checkout
      try {
        const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }
        const baseUrl = getApiUrl('node');
        const checkoutUrl = `${baseUrl}/api/subscription/checkout`;
        const response = await fetch(checkoutUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            plan: 'pro',
            billingCycle: 'monthly'
          })
        });
        const data = await response.json();
        if (data.success && data.checkoutUrl) {
          window.location.href = data.checkoutUrl;
        } else {
          alert(`Failed to start checkout: ${data.error || 'Unknown error'}`);
        }
      } catch (error) {
        alert(`Failed to start checkout: ${error.message}`);
      }
    }
  };

  return (
    <>
      {/* Sidebar Overlay for mobile */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-40 md:hidden" onClick={() => setIsOpen(false)}></div>
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-50 transform
          transition-transform duration-300 ease-in-out
          overflow-y-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:static md:block
        `}
      >
        {/* Close button (mobile only) */}
        <div className="flex items-center justify-between md:hidden p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">Menu</h2>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Menu Links */}
        <nav className="flex flex-col mt-16 md:mt-24 space-y-6 px-4 text-gray-600">
          {/* Base menu items (available to all users) */}
          {baseMenuItems.map(({ name, icon: Icon, path, requiresEnterprise, requiresPro }) => {
            const showLock = (requiresEnterprise && !isEnterprise) || (requiresPro && !isPro);
            const isAnalytics = name === 'Analytics';
            const isBulkShare = name === 'Bulk Share';
            
            return (
              <NavLink
                key={name}
                to={path}
                onClick={() => setIsOpen(false)} // Close menu on mobile after click
                className={({ isActive }) => {
                  const baseClasses = "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200";
                  
                  if (isActive) {
                    if ((isAnalytics || isBulkShare) && isPro) {
                      return `${baseClasses} bg-blue-50 font-semibold text-blue-700 border-l-4 border-blue-600`;
                    } else {
                      return `${baseClasses} bg-blue-50 font-semibold text-blue-700 border-l-4 border-blue-600`;
                    }
                  } else {
                    if (showLock) {
                      return `${baseClasses} text-gray-400 hover:bg-gray-100`;
                    } else {
                      return `${baseClasses} hover:bg-gray-100 text-gray-700 hover:text-gray-900`;
                    }
                  }
                }}
              >
                {Icon && <Icon className="h-5 w-5" />}
                {showLock && <LockClosedIcon className="h-3 w-3" />}
                <span>{name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom section with profile and settings */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
          {/* Current Plan Container */}
          <div className="mb-4">
            <div 
              className="block bg-gray-50 rounded-lg p-4 border border-gray-200 hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
              onClick={handlePlanClick}
            >
              <div className="flex items-center justify-between">
                <div className="flex flex-col space-y-1 text-left">
                  <p className="text-sm font-medium text-gray-900 text-left">
                    {subscriptionPlan === 'pro' ? 'Pro Plan' : 'Free Plan'}
                  </p>
                  <p className="text-xs text-blue-600 font-medium text-left">
                    {subscriptionPlan === 'pro' ? 'Manage Plan' : 'Upgrade'}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Link
              to="/profile"
              className={`group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                location.pathname === '/profile'
                  ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`}
              onClick={() => setIsOpen(false)}
            >
              <svg
                className={`mr-3 h-5 w-5 flex-shrink-0 ${
                  location.pathname === '/profile' ? 'text-indigo-700' : 'text-gray-400 group-hover:text-gray-500'
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Profile
            </Link>
            
            <Link
              to="/bulk-uploads"
              className={`group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                location.pathname === '/bulk-uploads'
                  ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                  : !isPro 
                    ? 'text-gray-400'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`}
              onClick={() => setIsOpen(false)}
            >
              {!isPro ? (
                <LockClosedIcon className={`mr-3 h-5 w-5 flex-shrink-0 ${
                  location.pathname === '/bulk-uploads' ? 'text-indigo-700' : 'text-gray-400'
                }`} />
              ) : (
                <DocumentArrowUpIcon className={`mr-3 h-5 w-5 flex-shrink-0 ${
                  location.pathname === '/bulk-uploads' ? 'text-indigo-700' : 'text-gray-400 group-hover:text-gray-500'
                }`} />
              )}
              Bulk Upload
            </Link>
            
            {/* SETTINGS MENU - TEMPORARILY COMMENTED OUT */}
            {/* <Link
              to="/settings"
              className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                location.pathname === '/settings'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
              onClick={() => setIsOpen(false)}
            >
              <svg
                className={`mr-3 h-5 w-5 flex-shrink-0 ${
                  location.pathname === '/settings' ? 'text-indigo-700' : 'text-gray-400 group-hover:text-gray-500'
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Settings
            </Link> */}
            
            <button
              onClick={confirmLogout}
              className="group flex items-center w-full px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors duration-200"
            >
              <svg
                className="mr-3 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <svg className="h-8 w-8 text-orange-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900">Confirm Logout</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              Are you sure you want to logout? You will need to sign in again to access your account.
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={cancelLogout}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
