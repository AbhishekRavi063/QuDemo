import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getNodeApiUrl } from "../config/api";
import { useCompany } from "../context/CompanyContext";
import { useNotification } from "../context/NotificationContext";
import SubscriptionTab from "./SubscriptionTab";

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
  
  // Company editing state
  const [isEditingCompany, setIsEditingCompany] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [companyLogo, setCompanyLogo] = useState(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

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

  // Populate company editing fields when company data is loaded
  useEffect(() => {
    if (company) {
      setCompanyName(company.name || "");
      setCompanyWebsite(company.website || "");
    }
  }, [company]);

  const tabs = [
    { name: "Personal Info", key: "personal" },
    { name: "Organization", key: "company" },
    { name: "Subscription & Billing", key: "subscription" },
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

  // Company update functions
  const handleCompanyLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCompanyLogo(file);
    }
  };

  const handleUploadCompanyLogo = async () => {
    if (!companyLogo) return;
    
    setIsUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append('logo', companyLogo);
      formData.append('companyId', company.id);
      
      const token = localStorage.getItem('accessToken');
      const response = await axios.post(
        getNodeApiUrl('/api/companies/upload-logo'),
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.success) {
        // Refresh company data
        window.location.reload();
      } else {
        alert('Failed to upload company logo.');
      }
    } catch (error) {
      console.error('Logo upload error:', error);
      alert('Failed to upload company logo.');
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleUpdateCompany = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.put(
        getNodeApiUrl(`/api/companies/${company.id}`),
        {
          name: companyName,
          website: companyWebsite,
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success) {
        // Refresh company data
        window.location.reload();
      } else {
        alert('Failed to update company details.');
      }
    } catch (error) {
      console.error('Company update error:', error);
      alert('Failed to update company details.');
    }
  };

  // Delete company function
  const handleDeleteCompany = async () => {
    if (deleteConfirmText !== "DELETE") {
      showError("Please type 'DELETE' to confirm organization deletion.");
      return;
    }

    setIsDeleting(true);
    try {
      const token = localStorage.getItem('accessToken');

      const response = await fetch(getNodeApiUrl('/api/companies'), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {

        showSuccess('Company deleted successfully! You will be redirected to create a new company.');
        // Force clear company context immediately
        setCompany(null);
        // Refresh company context to ensure it's cleared
        await refreshCompany();

        // Navigate to home page (which will show CompanySetup due to no company)
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        showError(data.error || 'Failed to delete organization. Please try again.');
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

      {/* Tabs */}
      <div className="flex justify-center mb-8">
        <div className="bg-gray-100 p-1.5 rounded-lg max-w-4xl w-full">
          <nav className="flex gap-1.5">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === tab.key
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'bg-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="flex justify-center">
        <div className="w-full max-w-4xl bg-white rounded-lg shadow-sm p-6">
        {/* Content */}
        {activeTab === "personal" && (
          <form>
            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Email */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                type="button"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Save Changes
              </button>
              <button
                type="button"
                className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {activeTab === "company" && (
          <div>
            <div className="flex justify-end items-center mb-6">
              <button
                onClick={() => setIsEditingCompany(!isEditingCompany)}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {isEditingCompany ? 'Cancel' : 'Edit Organization'}
              </button>
            </div>
            
            {company ? (
              <div className="space-y-6">
                 {/* Company Logo */}
                 <div className="text-center">
                   <label className="block text-sm font-medium text-gray-700 mb-2">Organization Logo</label>
                   <div className="flex flex-col items-center space-y-4">
                     {company.logo_url ? (
                       <img
                         src={company.logo_url}
                         alt="Organization Logo"
                         className="w-20 h-20 bg-gray-300 rounded-lg object-cover border"
                       />
                     ) : (
                       <div className="w-20 h-20 bg-gray-300 rounded-lg flex items-center justify-center text-gray-500 font-semibold text-lg">
                         {company.name?.charAt(0) || 'C'}
                       </div>
                     )}
                     {isEditingCompany && (
                       <div className="flex flex-col items-center space-y-2">
                         <input
                           type="file"
                           accept="image/*"
                           onChange={handleCompanyLogoChange}
                           className="text-sm text-gray-500"
                         />
                         {companyLogo && (
                           <button
                             onClick={handleUploadCompanyLogo}
                             disabled={isUploadingLogo}
                             className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:bg-gray-400"
                           >
                             {isUploadingLogo ? 'Uploading...' : 'Upload Logo'}
                           </button>
                         )}
                       </div>
                     )}
                   </div>
                 </div>

                 {/* Company Details */}
                 <div className="text-left">
                   <label className="block text-sm font-medium text-gray-700 mb-2 text-left">Organization Name</label>
                   {isEditingCompany ? (
                     <input
                       type="text"
                       value={companyName}
                       onChange={(e) => setCompanyName(e.target.value)}
                       className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-left"
                     />
                   ) : (
                     <div className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-900 text-left">
                       {company.name || 'Not provided'}
                     </div>
                   )}
                 </div>

                 <div className="text-left">
                   <label className="block text-sm font-medium text-gray-700 mb-2 text-left">Website</label>
                   {isEditingCompany ? (
                     <input
                       type="url"
                       value={companyWebsite}
                       onChange={(e) => setCompanyWebsite(e.target.value)}
                       placeholder="https://example.com"
                       className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-left"
                     />
                   ) : (
                     <div className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-900 text-left">
                       {company.website ? (
                         <a 
                           href={company.website} 
                           target="_blank" 
                           rel="noopener noreferrer"
                           className="text-blue-600 hover:text-blue-800 underline text-left"
                         >
                           {company.website}
                         </a>
                       ) : (
                         'Not provided'
                       )}
                     </div>
                   )}
                 </div>

                 {/* Save Company Changes */}
                 {isEditingCompany && (
                   <div className="flex space-x-3 pt-4 border-t border-gray-200">
                     <button
                       onClick={() => setIsEditingCompany(false)}
                       className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                     >
                       Cancel
                     </button>
                     <button
                       onClick={handleUpdateCompany}
                       className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                     >
                       Save Changes
                     </button>
                   </div>
                 )}

                {/* Delete Company Button */}
                <div className="pt-6 border-t border-gray-200">
                  <div className="flex justify-center">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md w-full">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3 flex-1 text-left">
                          <h3 className="text-sm font-medium text-red-800 text-left">
                            Danger Zone
                          </h3>
                          <div className="mt-2 text-sm text-red-700 text-left">
                            <p className="text-left">
                              Deleting your organization will permanently remove all data including:
                            </p>
                            <ul className="list-disc list-inside mt-2 space-y-1 text-left">
                              <li>All QuDemos and their videos</li>
                              <li>All transcript files and knowledge sources</li>
                              <li>All analytics and interaction data</li>
                              <li>Organization settings and configuration</li>
                            </ul>
                            <p className="mt-2 font-medium text-left">
                              This action cannot be undone.
                            </p>
                          </div>
                          <div className="mt-4 flex justify-center">
                            <button
                              type="button"
                              onClick={() => setShowDeleteModal(true)}
                              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                            >
                              Delete Organization
                            </button>
                          </div>
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
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Organization Found</h3>
                <p className="text-gray-500">You don't have an organization associated with your account.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "subscription" && company && (
          <SubscriptionTab companyId={company.id} />
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
                  Delete Organization
                </h3>
              </div>
            </div>
            
            <div className="mb-4 text-left">
              <p className="text-sm text-gray-500 mb-4 text-left">
                This action will permanently delete your organization and all associated data:
              </p>
              <ul className="text-sm text-gray-600 list-disc list-inside space-y-1 mb-4 text-left">
                <li>All QuDemos and their videos</li>
                <li>All transcript files and knowledge sources</li>
                <li>All analytics and interaction data</li>
                <li>Organization settings and configuration</li>
              </ul>
              <p className="text-sm text-gray-500 mb-4 text-left">
                <strong>This action cannot be undone.</strong>
              </p>
              <p className="text-sm text-gray-700 mb-2 text-left">
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
                {isDeleting ? 'Deleting...' : 'Delete Organization'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}