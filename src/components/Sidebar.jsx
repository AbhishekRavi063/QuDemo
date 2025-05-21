import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  ClockIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ChatBubbleLeftEllipsisIcon,
  Squares2X2Icon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

const menuItems = [
  { name: 'Overview', icon: ClockIcon, path: '/' },
  { name: 'Qudemo Library', icon: Squares2X2Icon, path: '/qudemo-library' },
  { name: 'Buyer Interactions', icon: ChatBubbleLeftEllipsisIcon, path: '/buyer-interactions' },
  { name: 'Insights & Analytics', icon: ChartBarIcon, path: '/insights-analytics' },
  { name: 'Settings', icon: Cog6ToothIcon, path: '/settings' },
];

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Hamburger toggle button - visible on mobile */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="text-gray-700 p-2 rounded focus:outline-none focus:ring"
        >
          <Bars3Icon className="h-6 w-6" />
        </button>
      </div>

      {/* Sidebar Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-50 transform
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:static md:block
        `}
      >
        {/* Close button (mobile only) */}
        <div className="flex items-center justify-between md:hidden p-4 border-b">
          <h2 className="text-lg font-semibold">Menu</h2>
          <button onClick={() => setIsOpen(false)}>
            <XMarkIcon className="h-6 w-6 text-gray-700" />
          </button>
        </div>

        {/* Menu Links */}
        <nav className="flex flex-col mt-4 space-y-6 px-4 text-gray-600">
          {menuItems.map(({ name, icon: Icon, path }) => (
            <NavLink
              key={name}
              to={path}
              onClick={() => setIsOpen(false)} // Close menu on mobile after click
              className={({ isActive }) =>
                `flex items-center space-x-2 px-3 py-2 rounded ${
                  isActive
                    ? 'bg-gray-200 font-semibold text-blue-600'
                    : 'hover:bg-gray-100 text-gray-600'
                }`
              }
            >
              <Icon className="h-5 w-5" />
              <span>{name}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
