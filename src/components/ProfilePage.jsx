import React, { useState, useEffect } from "react";
import axios from "axios";
import { getNodeApiUrl } from "../config/api";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("personal");
  
  // User profile state
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Form fields state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [jobTitle, setJobTitle] = useState("");

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

              {/* Company Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block font-medium mb-2">Company</label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-2">Job Title</label>
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <button
                type="button"
                className="bg-blue-600 hover:bg-blue-700 transition text-white px-6 py-2 rounded font-medium"
              >
                Save Changes
              </button>
            </form>
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
    </div>
  );
} 