import React, { useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { useCompany } from '../context/CompanyContext';
import {
  ClockIcon,
  ChartBarIcon,
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
} from '@heroicons/react/24/outline';

// Base menu items (available to all users)
const baseMenuItems = [
  { name: 'Create Qudemo', icon: PlusIcon, path: '/create' },
  { name: 'Qudemos', icon: PlayIcon, path: '/qudemos' },
  // { name: 'Bulk Share', icon: UserGroupIcon, path: '/bulk-share', requiresEnterprise: true }, // COMMENTED OUT FOR PRODUCTION
  // { name: 'Analytics', icon: ChartBarIcon, path: '/analytics', requiresEnterprise: true }, // COMMENTED OUT FOR PRODUCTION
];

const Sidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const { company } = useCompany();
  
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
        <nav className="flex flex-col mt-20 md:mt-32 space-y-6 px-4 text-gray-600">
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
                    if ((isAnalytics || isBulkShare) && isEnterprise) {
                      return `${baseClasses} bg-purple-50 font-semibold text-purple-700 border-l-4 border-purple-600`;
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
              onClick={handleLogout}
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
    </>
  );
};

export default Sidebar;
