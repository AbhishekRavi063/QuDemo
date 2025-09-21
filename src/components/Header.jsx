import { Link } from 'react-router-dom';
// Backend switcher imports - COMMENTED OUT
// import {
//   ChevronDownIcon,
//   ServerIcon,
// } from '@heroicons/react/24/outline';
// import { useBackend } from '../context/BackendContext';
// import { useState, useEffect, useRef } from 'react';

export default function Header() {
  // Backend switcher state and functions - COMMENTED OUT
  // const { selectedBackend, currentBackend, switchBackend, getAvailableBackends } = useBackend();
  // const [isBackendDropdownOpen, setIsBackendDropdownOpen] = useState(false);
  // const dropdownRef = useRef(null);

  // const handleBackendChange = (backendId) => {
  //   switchBackend(backendId);
  //   setIsBackendDropdownOpen(false);
  // };

  // // Close dropdown when clicking outside
  // useEffect(() => {
  //   const handleClickOutside = (event) => {
  //     if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
  //       setIsBackendDropdownOpen(false);
  //     }
  //   };

  //   document.addEventListener('mousedown', handleClickOutside);
  //   return () => {
  //     document.removeEventListener('mousedown', handleClickOutside);
  //   };
  // }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-6 py-3 bg-white border-b shadow-sm">
      {/* Left - Logo */}
      <div className="flex items-center space-x-0">
        <img 
          src="/logo.png" 
          alt="QuDemo Logo" 
          className="w-8 h-8 object-contain"
        />
        <img 
          src="/mainlogo.png" 
          alt="QuDemo Main Logo" 
          className="w-8 h-8 object-contain"
        />
        <span className="text-lg md:text-xl font-semibold text-gray-800">
          QuDemo
        </span>
      </div>

      {/* Center - Backend Switcher - COMMENTED OUT */}
      {/* <div className="flex items-center">
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsBackendDropdownOpen(!isBackendDropdownOpen)}
            className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
          >
            <ServerIcon className="w-4 h-4" />
            <span className="hidden sm:inline">{currentBackend.name}</span>
            <span className="sm:hidden">B1</span>
            <ChevronDownIcon className="w-4 h-4" />
          </button>
          
          {isBackendDropdownOpen && (
            <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              {getAvailableBackends().map((backend) => (
                <button
                  key={backend.id}
                  onClick={() => handleBackendChange(backend.id)}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg ${
                    selectedBackend === backend.id ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{backend.name}</span>
                    {selectedBackend === backend.id && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{backend.description}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div> */}

      {/* Right - Icons */}
      <div className="flex items-center gap-4 md:gap-6">
        {/* Profile Icon Only */}
        <Link to="/profile">
          <div className="w-8 h-8 bg-gray-300 rounded-full cursor-pointer hover:ring-2 ring-blue-500 flex items-center justify-center text-white font-semibold text-sm transition-all duration-200 hover:bg-gray-400">
            A
          </div>
        </Link>
      </div>
    </div>
  );
}
