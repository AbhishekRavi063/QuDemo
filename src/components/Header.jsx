import { Link } from 'react-router-dom';
import {
  BellIcon,
  Cog6ToothIcon,
  QuestionMarkCircleIcon,
} from '@heroicons/react/24/outline';

export default function Header() {
  return (
    <div className="flex items-center justify-between px-4 md:px-6 py-3 bg-white border-b shadow-sm">
      {/* Left - Logo */}
      <div className="flex items-center space-x-2">
        <div className="bg-blue-600 text-white font-bold rounded-full w-8 h-8 flex items-center justify-center text-sm">
          Q
        </div>
        <span className="text-lg md:text-xl font-semibold text-gray-800">
          QuDemo
        </span>
      </div>

      {/* Right - Icons */}
      <div className="flex items-center gap-4 md:gap-6">
        {/* Mobile: Dropdown for icons */}
        <div className="sm:hidden relative group">
          <button className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center focus:outline-none">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity duration-200 z-50">
            <Link to="/help" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Help</Link>
            <Link to="/notifications" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Notifications</Link>
            <Link to="/settings" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Settings</Link>
            <Link to="/profile" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Profile</Link>
          </div>
        </div>
        {/* Desktop: Icons as before */}
        <Link to="/help" className="hidden sm:block">
          <QuestionMarkCircleIcon className="w-5 h-5 md:w-6 md:h-6 text-gray-500 cursor-pointer hover:text-gray-700 transition-colors duration-200" />
        </Link>
        <Link to="/notifications">
          <BellIcon className="w-5 h-5 md:w-6 md:h-6 text-gray-500 cursor-pointer hover:text-gray-700 transition-colors duration-200" />
        </Link>
        <Link to="/settings" className="hidden sm:block">
          <Cog6ToothIcon className="w-5 h-5 md:w-6 md:h-6 text-gray-500 cursor-pointer hover:text-gray-700 transition-colors duration-200" />
        </Link>
        <Link to="/profile">
          <div className="w-8 h-8 bg-gray-300 rounded-full cursor-pointer hover:ring-2 ring-blue-500 flex items-center justify-center text-white font-semibold text-sm transition-all duration-200 hover:bg-gray-400">
            A
          </div>
        </Link>
      </div>
    </div>
  );
}
