import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getNodeApiUrl } from "../config/api";
import { useCompany } from "../context/CompanyContext";
import { useNotification } from "../context/NotificationContext";

export default function ProfilePage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("personal");
  const { company, refreshCompany, setCompany } = useCompany();
  const { showSuccess, showError } = useNotification();
  
  // User profile state
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Form fields state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [jobTitle, setJobTitle] = useState("");

  // Delete company modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const [timezone, setTimezone] = useState("UTC-5");
  const [language, setLanguage] = useState("English");
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: false
  });
  const [privacy, setPrivacy] = useState({
    profileVisibility: "public",
    dataSharing: true,
    analytics: true
  });

  const [profilePicture, setProfilePicture] = useState("");
  const fileInputRef = React.useRef();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setFirstName(parsedUser.firstName || "");
      setLastName(parsedUser.lastName || "");
      setEmail(parsedUser.email || "");
      setProfilePicture(parsedUser.profile_picture || "");
    }
    setIsLoading(false);
  }, []);

  const tabs = [
    { name: "Personal Info", key: "personal" },
    { name: "Company", key: "company" },
    { name: "Preferences", key: "preferences" },
    { name: "Security", key: "security" },
  ];

  // Custom Switch component for better UX
  const Switch = ({ checked, onChange }) => (
    <button
      type="button"
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
        checked ? "bg-blue-600" : "bg-gray-200"
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-5" : "translate-x-1"
        }`}
      />
    </button>
  );

  const handleUploadClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // Optionally: validate file type/size here
    try {
      const userData = localStorage.getItem('user');
      if (!userData) throw new Error("User not logged in");
      const user = JSON.parse(userData);
      const userId = user.id || user.userId || user._id;
      const formData = new FormData();
      formData.append('image', file);
      const token = localStorage.getItem('accessToken');
      const res = await axios.put(
        getNodeApiUrl(`/api/users/${userId}/profile-picture`),
        { imageUrl: await toBase64(file) },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      if (res.data.success && res.data.data.profile_picture) {
        setProfilePicture(res.data.data.profile_picture);
        // Optionally update localStorage user
        const updatedUser = { ...user, profile_picture: res.data.data.profile_picture };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } catch (err) {
      alert('Failed to upload profile picture.');
    }
  };

  // Helper to convert file to base64 (if backend expects base64 string)
  const toBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

  // Delete company function
  const handleDeleteCompany = async () => {
    if (deleteConfirmText !== "DELETE") {
      showError("Please type 'DELETE' to confirm company deletion.");
      return;
    }

    console.log('🗑️ Starting company deletion...');
    setIsDeleting(true);
    try {
      const token = localStorage.getItem('accessToken');
      console.log('🗑️ Making DELETE request to:', getNodeApiUrl('/api/companies'));
      console.log('🗑️ Token exists:', !!token);
      
      const response = await fetch(getNodeApiUrl('/api/companies'), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('🗑️ Delete response status:', response.status);
      console.log('🗑️ Delete response ok:', response.ok);
      
      const data = await response.json();
      console.log('🗑️ Delete response data:', data);

      if (data.success) {
        console.log('✅ Company deletion successful, refreshing context...');
        showSuccess('Company deleted successfully! You will be redirected to create a new company.');
        // Force clear company context immediately
        setCompany(null);
        // Refresh company context to ensure it's cleared
        await refreshCompany();
        console.log('✅ Company context refreshed, navigating to home...');
        // Navigate to home page (which will show CompanySetup due to no company)
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        showError(data.error || 'Failed to delete company. Please try again.');
      }
    } catch (error) {
      console.error('Delete company error:', error);
      showError('Network error. Please try again.');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setDeleteConfirmText("");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-50 flex flex-col py-4">
      <h2 className="text-3xl font-bold mb-10">Profile</h2>

      {/* Tabs */}
      <div className="flex border border-gray-200 mb-8 bg-white rounded-xl shadow-md">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`flex-1 py-3 text-center text-base font-medium transition-colors ${
              activeTab === tab.key
                ? "border-b-2 border-blue-600 bg-gray-50 text-blue-700"
                : "border-b-2 border-transparent text-gray-500 hover:bg-gray-50"
            }`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.name}
          </button>
        ))}
      </div>

      <div className="w-full max-w-8xl bg-white rounded-xl shadow-md p-0 items-center">
        {/* Content */}
        <div className="p-8">
          {activeTab === "personal" && (
            <form>
              <h2 className="text-xl font-semibold mb-2">Personal Information</h2>
              <p className="text-gray-500 mb-6">Update your personal details and contact information</p>
              
              {/* Profile Picture */}
              <div className="mb-8">
                <div className="font-medium mb-4">Profile Picture</div>
                <div className="flex items-center space-x-4">
                  {profilePicture ? (
                    <img
                      src={profilePicture}
                      alt="Profile"
                      className="w-20 h-20 bg-gray-300 rounded-full object-cover border"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center text-white font-semibold text-2xl">
                      {/* Optionally show initials or leave blank */}
                      {firstName.charAt(0)}{lastName.charAt(0)}
                    </div>
                  )}
                  <div>
                    <button
                      type="button"
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm"
                      onClick={handleUploadClick}
                    >
                      Upload Photo
                    </button>
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      style={{ display: 'none' }}
                      onChange={handleFileChange}
                    />
                    <p className="text-gray-500 text-sm mt-1">JPG, PNG or GIF. Max size 2MB.</p>
                  </div>
                </div>
              </div>

              {/* Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block font-medium mb-2">First Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-2">Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="mb-6">
                <label className="block font-medium mb-2">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Phone */}
              <div className="mb-6">
                <label className="block font-medium mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Job Title */}
              <div className="mb-6">
                <label className="block font-medium mb-2">Job Title</label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <button
                type="button"
                className="bg-blue-600 hover:bg-blue-700 transition text-white px-6 py-2 rounded font-medium"
              >
                Save Changes
              </button>
            </form>
          )}

          {activeTab === "company" && (
            <div>
              <h2 className="text-xl font-semibold mb-2">Company Information</h2>
              <p className="text-gray-500 mb-6">View your company details and settings</p>
              
              {company ? (
                <div className="space-y-6">
                  {/* Company Logo */}
                  <div className="flex items-center space-x-4">
                    {company.logo_url ? (
                      <img
                        src={company.logo_url}
                        alt="Company Logo"
                        className="w-20 h-20 bg-gray-300 rounded-lg object-cover border"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-gray-300 rounded-lg flex items-center justify-center text-gray-500 font-semibold text-lg">
                        {company.name?.charAt(0) || 'C'}
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{company.name}</h3>
                      <p className="text-gray-500">Company Logo</p>
                    </div>
                  </div>

                  {/* Company Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block font-medium mb-2 text-gray-700">Company Name</label>
                      <div className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 text-gray-900">
                        {company.name || 'Not provided'}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block font-medium mb-2 text-gray-700">Display Name</label>
                      <div className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 text-gray-900">
                        {company.display_name || company.name || 'Not provided'}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block font-medium mb-2 text-gray-700">Description</label>
                    <div className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 text-gray-900 min-h-[80px]">
                      {company.description || 'No description provided'}
                    </div>
                  </div>

                  <div>
                    <label className="block font-medium mb-2 text-gray-700">Website</label>
                    <div className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 text-gray-900">
                      {company.website ? (
                        <a 
                          href={company.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline"
                        >
                          {company.website}
                        </a>
                      ) : (
                        'Not provided'
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block font-medium mb-2 text-gray-700">Logo URL</label>
                    <div className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 text-gray-900">
                      {company.logo_url ? (
                        <a 
                          href={company.logo_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline"
                        >
                          {company.logo_url}
                        </a>
                      ) : (
                        'Not provided'
                      )}
                    </div>
                  </div>

                  {/* Company Status */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">Company Status</h4>
                      <p className="text-sm text-gray-500">Current status of your company account</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${company.is_active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className={`text-sm font-medium ${company.is_active ? 'text-green-700' : 'text-red-700'}`}>
                        {company.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>

                  {/* Company Created Date */}
                  <div className="text-sm text-gray-500">
                    <strong>Created:</strong> {company.created_at ? new Date(company.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : 'Unknown'}
                  </div>

                  {/* Delete Company Button */}
                  <div className="pt-6 border-t border-gray-200">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3 flex-1">
                          <h3 className="text-sm font-medium text-red-800">
                            Danger Zone
                          </h3>
                          <div className="mt-2 text-sm text-red-700">
                            <p>
                              Deleting your company will permanently remove all data including:
                            </p>
                            <ul className="list-disc list-inside mt-2 space-y-1">
                              <li>All QuDemos and their videos</li>
                              <li>All transcript files and knowledge sources</li>
                              <li>All analytics and interaction data</li>
                              <li>Company settings and configuration</li>
                            </ul>
                            <p className="mt-2 font-medium">
                              This action cannot be undone.
                            </p>
                          </div>
                          <div className="mt-4">
                            <button
                              type="button"
                              onClick={() => setShowDeleteModal(true)}
                              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                            >
                              Delete Company
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-500 mb-4">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Company Found</h3>
                  <p className="text-gray-500">You don't have a company associated with your account.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "preferences" && (
            <form>
              <h2 className="text-xl font-semibold mb-2">Preferences</h2>
              <p className="text-gray-500 mb-6">Customize your experience and notification settings</p>
              
              {/* Timezone and Language */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block font-medium mb-2">Timezone</label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="UTC-8">Pacific Time (UTC-8)</option>
                    <option value="UTC-7">Mountain Time (UTC-7)</option>
                    <option value="UTC-6">Central Time (UTC-6)</option>
                    <option value="UTC-5">Eastern Time (UTC-5)</option>
                    <option value="UTC+0">UTC</option>
                    <option value="UTC+1">Central European Time (UTC+1)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium mb-2">Language</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="English">English</option>
                    <option value="Spanish">Spanish</option>
                    <option value="French">French</option>
                    <option value="German">German</option>
                  </select>
                </div>
              </div>

              {/* Notification Settings */}
              <div className="mb-8">
                <h3 className="text-lg font-medium mb-4">Notification Preferences</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Email Notifications</div>
                      <div className="text-gray-500 text-sm">Receive updates via email</div>
                    </div>
                    <Switch 
                      checked={notifications.email} 
                      onChange={() => setNotifications({...notifications, email: !notifications.email})} 
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Push Notifications</div>
                      <div className="text-gray-500 text-sm">Receive browser notifications</div>
                    </div>
                    <Switch 
                      checked={notifications.push} 
                      onChange={() => setNotifications({...notifications, push: !notifications.push})} 
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">SMS Notifications</div>
                      <div className="text-gray-500 text-sm">Receive text message alerts</div>
                    </div>
                    <Switch 
                      checked={notifications.sms} 
                      onChange={() => setNotifications({...notifications, sms: !notifications.sms})} 
                    />
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="bg-blue-600 hover:bg-blue-700 transition text-white px-6 py-2 rounded font-medium"
              >
                Save Preferences
              </button>
            </form>
          )}

          {activeTab === "security" && (
            <form>
              <h2 className="text-xl font-semibold mb-2">Security & Privacy</h2>
              <p className="text-gray-500 mb-6">Manage your account security and privacy settings</p>
              
              {/* Password Change */}
              <div className="mb-8">
                <h3 className="text-lg font-medium mb-4">Change Password</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block font-medium mb-2">Current Password</label>
                    <input
                      type="password"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-2">New Password</label>
                    <input
                      type="password"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-2">Confirm New Password</label>
                    <input
                      type="password"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <button
                    type="button"
                    className="bg-blue-600 hover:bg-blue-700 transition text-white px-6 py-2 rounded font-medium"
                  >
                    Update Password
                  </button>
                </div>
              </div>

              {/* Privacy Settings */}
              <div className="mb-8">
                <h3 className="text-lg font-medium mb-4">Privacy Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block font-medium mb-2">Profile Visibility</label>
                    <select
                      value={privacy.profileVisibility}
                      onChange={(e) => setPrivacy({...privacy, profileVisibility: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="public">Public</option>
                      <option value="private">Private</option>
                      <option value="team">Team Only</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Data Sharing</div>
                      <div className="text-gray-500 text-sm">Allow sharing of usage data for product improvement</div>
                    </div>
                    <Switch 
                      checked={privacy.dataSharing} 
                      onChange={() => setPrivacy({...privacy, dataSharing: !privacy.dataSharing})} 
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Analytics</div>
                      <div className="text-gray-500 text-sm">Help us improve by sharing analytics data</div>
                    </div>
                    <Switch 
                      checked={privacy.analytics} 
                      onChange={() => setPrivacy({...privacy, analytics: !privacy.analytics})} 
                    />
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="bg-blue-600 hover:bg-blue-700 transition text-white px-6 py-2 rounded font-medium"
              >
                Save Security Settings
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Delete Company Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">
                  Delete Company
                </h3>
              </div>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-4">
                This action will permanently delete your company and all associated data:
              </p>
              <ul className="text-sm text-gray-600 list-disc list-inside space-y-1 mb-4">
                <li>All QuDemos and their videos</li>
                <li>All transcript files and knowledge sources</li>
                <li>All analytics and interaction data</li>
                <li>Company settings and configuration</li>
              </ul>
              <p className="text-sm text-gray-500 mb-4">
                <strong>This action cannot be undone.</strong>
              </p>
              <p className="text-sm text-gray-700 mb-2">
                To confirm deletion, type <strong>DELETE</strong> in the box below:
              </p>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="Type DELETE to confirm"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmText("");
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteCompany}
                disabled={isDeleting || deleteConfirmText !== "DELETE"}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-md transition-colors"
              >
                {isDeleting ? 'Deleting...' : 'Delete Company'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 