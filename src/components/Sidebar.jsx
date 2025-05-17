// Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  ClockIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ChatBubbleLeftEllipsisIcon,
  Squares2X2Icon,
} from '@heroicons/react/24/outline';

const Sidebar = () => {
  const menuItems = [
    { name: 'Overview', icon: ClockIcon, path: '/' },
    { name: 'Qudemo Library', icon: Squares2X2Icon, path: '/qudemo-library' },
    { name: 'Buyer Interactions', icon: ChatBubbleLeftEllipsisIcon, path: '/buyer-interactions' },
    { name: 'Insights & Analytics', icon: ChartBarIcon, path: '/insights-analytics' },
    { name: 'Settings', icon: Cog6ToothIcon, path: '/settings' },
  ];

  return (
    <div className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col">
      <nav className="flex flex-col mt-4 space-y-6 px-4 text-gray-600">
        {menuItems.map(({ name, icon: Icon, path }) => (
          <NavLink
            key={name}
            to={path}
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
  );
};

export default Sidebar;
