import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useCompany } from "../context/CompanyContext";
import {
  Bars3Icon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  Bars3CenterLeftIcon,
} from "@heroicons/react/24/outline";
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
  const [userInitials, setUserInitials] = useState("A");
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
        const userData = localStorage.getItem("user");
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
            setUserInitials(
              `${user.firstName[0]}${user.lastName[0]}`.toUpperCase(),
            );
          } else if (user.email) {
            setUserInitials(user.email[0].toUpperCase());
          }
        }
      } catch (error) {}
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
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    navigate("/login");
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
    <div className="sticky top-0 z-20 flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4 bg-white border-b border-strokedark/10">
      {/* Left - Sidebar Toggle Button + Search Bar */}
      <div className="flex items-center gap-4 flex-1">
        {/* Sidebar Toggle Button */}
        <button
          onClick={onMenuClick}
          className="flex items-center justify-center w-10 h-10 rounded-md text-bodydark hover:text-graydark hover:bg-whiten focus:outline-none focus:ring-2 focus:ring-primary transition-colors border border-strokedark/10"
          title="Toggle sidebar"
        >
          <Bars3CenterLeftIcon className="h-6 w-6" />
        </button>

        {/* Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search or type command..."
              className="w-full pl-10 h-10 pr-16 text-sm border border-strokedark/10 rounded-lg bg-whiter focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-bodydark2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 text-xs font-semibold text-bodydark2 bg-white border border-strokedark/10 rounded">
              ⌘ K
            </kbd>
          </div>
        </div>
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
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <button
          className="relative flex border border-strokedark/10 items-center justify-center w-10 h-10 rounded-full hover:bg-whiten transition-colors"
          title="Notifications"
        >
          <svg
            className="w-5 h-5 text-bodydark"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          {/* Notification Badge */}
          <span className="absolute top-0 right-0 w-2 h-2 bg-danger rounded-full"></span>
        </button>

        {/* Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
            className="flex items-center gap-3 h-10 px-3 rounded-lg transition-colors"
            title="User Profile"
          >
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border border-strokedark/10">
              {userProfileImage ? (
                <img
                  src={userProfileImage}
                  alt={company?.logo_url ? "Company Logo" : "Profile Picture"}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                  }}
                />
              ) : null}
              <div
                className={`w-full h-full bg-whiten flex items-center justify-center text-graydark font-semibold text-lg ${userProfileImage ? "hidden" : "flex"}`}
              >
                {userInitials}
              </div>
            </div>

            {/* Name and Dropdown Arrow - Hidden on mobile */}
            <div className="hidden lg:flex items-center gap-2">
              <span className="text-sm font-medium text-graydark">
                {company?.name || "User"}
              </span>
              <svg
                className="w-4 h-4 text-bodydark2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </button>
          {/* Dropdown Menu */}
          {isProfileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-default border border-strokedark/10 z-50">
              <div className="py-1">
                <button
                  onClick={() => {
                    navigate("/profile");
                    setIsProfileDropdownOpen(false);
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm text-bodydark hover:bg-whiten hover:text-primary flex items-center gap-2 transition-colors"
                >
                  <UserIcon className="w-4 h-4" />
                  <span>Profile</span>
                </button>
                <hr className="my-1 border-strokedark/10" />
                <button
                  onClick={confirmLogout}
                  className="w-full px-4 py-2.5 text-left text-sm text-danger hover:bg-danger/5 flex items-center gap-2 transition-colors"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-default">
            <div className="flex items-center mb-4">
              <svg
                className="h-8 w-8 text-warning mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
              <h3 className="text-lg font-semibold text-graydark">
                Confirm Logout
              </h3>
            </div>

            <p className="text-bodydark mb-6">
              Are you sure you want to logout? You will need to sign in again to
              access your account.
            </p>

            <div className="flex gap-3">
              <button
                onClick={cancelLogout}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-bodydark bg-whiten hover:bg-bodydark1 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-danger hover:bg-danger/90 rounded-md transition-colors"
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
