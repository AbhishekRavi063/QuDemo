import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useCompany } from '../context/CompanyContext';
// Backend switcher imports - COMMENTED OUT
// import {
//   ChevronDownIcon,
//   ServerIcon,
// } from '@heroicons/react/24/outline';
// import { useBackend } from '../context/BackendContext';
// import { useState, useEffect, useRef } from 'react';

export default function Header() {
  const { company } = useCompany();
  const [userProfileImage, setUserProfileImage] = useState(null);
  const [userInitials, setUserInitials] = useState('A');
  
  // Backend switcher state and functions - COMMENTED OUT
  // const { selectedBackend, currentBackend, switchBackend, getAvailableBackends } = useBackend();
  // const [isBackendDropdownOpen, setIsBackendDropdownOpen] = useState(false);
  // const dropdownRef = useRef(null);

  // Fetch user profile image on component mount
  useEffect(() => {
    const fetchUserProfile = () => {
      try {
        const userData = localStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          
          // Priority: Company logo first, then Google profile picture
          if (company?.logo_url) {
            setUserProfileImage(company.logo_url);
          } else if (user.profile_picture) {
            setUserProfileImage(user.profile_picture);
          } else {
            setUserProfileImage(null);
          }
          
          // Set initials from user data
          if (user.firstName && user.lastName) {
            setUserInitials(`${user.firstName[0]}${user.lastName[0]}`.toUpperCase());
          } else if (user.email) {
            setUserInitials(user.email[0].toUpperCase());
          }
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchUserProfile();
  }, [company?.logo_url]); // Re-run when company logo changes

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
    <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-6 py-0 bg-white border-b shadow-sm">
      {/* Left - Logo */}
      <div className="flex items-center">
        <img 
          src="/Qudemo.svg" 
          alt="Qudemo Logo" 
          className="w-40 h-26 "
        />
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
          <div 
            className="w-12 h-12 rounded-full cursor-pointer hover:ring-2 ring-blue-500 overflow-hidden transition-all duration-200 hover:bg-gray-100"
            title={company?.logo_url ? "Company Logo" : userProfileImage ? "Profile Picture" : "Profile"}
          >
            {userProfileImage ? (
              <img 
                src={userProfileImage} 
                alt={company?.logo_url ? "Company Logo" : "Profile Picture"} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div 
              className={`w-full h-full bg-gray-300 flex items-center justify-center text-gray-700 font-semibold text-lg ${userProfileImage ? 'hidden' : 'flex'}`}
            >
              {userInitials}
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
