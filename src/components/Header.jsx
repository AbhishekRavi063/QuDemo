import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useCompany } from '../context/CompanyContext';
import { Bars3Icon, UserIcon, DocumentArrowUpIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
// Backend switcher imports - COMMENTED OUT
// import {
//   ChevronDownIcon,
//   ServerIcon,
// } from '@heroicons/react/24/outline';
// import { useBackend } from '../context/BackendContext';
// import { useState, useEffect, useRef } from 'react';
export default function Header({ onMenuClick }) {
  const { company } = useCompany();
  const navigate = useNavigate();
  const [userProfileImage, setUserProfileImage] = useState(null);
  const [userInitials, setUserInitials] = useState('A');
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const dropdownRef = useRef(null);
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
      }
    };
    fetchUserProfile();
  }, [company?.logo_url]); // Re-run when company logo changes
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    navigate('/login');
    setIsProfileDropdownOpen(false);
    setShowLogoutModal(false);
  };

  const confirmLogout = () => {
    setShowLogoutModal(true);
    setIsProfileDropdownOpen(false);
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };
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
    <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-3 md:px-5 py-1 bg-white border-b shadow-sm h-20">
      {/* Left - Menu Button (Mobile) + Logo */}
      <div className="flex items-center">
        {/* Mobile Menu Button */}
        <button
          onClick={onMenuClick}
          className="md:hidden mr-2 p-1 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <Bars3Icon className="h-6 w-6" />
        </button>
        {/* Logo */}
        <Link to="/overview" className="cursor-pointer">
          <img 
            src="/Qudemo.svg" 
            alt="Qudemo Logo" 
            className="w-44 h-28 hover:opacity-80 transition-opacity"
          />
        </Link>
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
      <div className="flex items-center gap-2 md:gap-3">
        {/* Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
            className="w-10 h-10 rounded-full cursor-pointer hover:ring-2 ring-blue-500 overflow-hidden transition-all duration-200 hover:bg-gray-100"
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
          </button>
          {/* Dropdown Menu */}
          {isProfileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
              <div className="py-1">
                <button
                  onClick={() => {
                    navigate('/profile');
                    setIsProfileDropdownOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                >
                  <UserIcon className="w-4 h-4" />
                  <span>Profile</span>
                </button>
                <button
                  onClick={() => {
                    navigate('/bulk-uploads');
                    setIsProfileDropdownOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                >
                  <DocumentArrowUpIcon className="w-4 h-4" />
                  <span>Bulk Upload</span>
                </button>
                <hr className="my-1" />
                <button
                  onClick={confirmLogout}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                >
                  <ArrowRightOnRectangleIcon className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
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
    </div>
  );
}
