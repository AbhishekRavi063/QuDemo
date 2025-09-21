import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { getNodeApiUrl } from './config/api';
import { clearAuthTokens } from './utils/tokenRefresh';
import { checkDomainOnLoad } from './utils/domainEnforcer';

// Import components
import Header from './components/Header';
import Sidebar from './components/Sidebar';
// CUSTOMER PAGE COMPONENT - COMMENTED OUT (NOT IN USE)
// import DemoHomePage from './components/DemoHomePage';
import CreateQuDemo from './components/CreateQuDemo';
import Qudemos from './components/Qudemos';
import EditQudemo from './components/EditQudemo';
import BuyerInteractions from './components/BuyerInteractions';
import InsightsAnalytics from './components/InsightsAnalytics';
import ProfilePage from './components/ProfilePage';
import SettingsPage from './components/SettingsPage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import CompanyManagement from './components/CompanyManagement';
import CompanySetup from './components/CompanySetup';
import AuthCallback from './components/AuthCallback';
import Overview from './components/Overview';
import HomePage from './components/HomePage';
import TestRunner from './components/TestRunner';
import PublicQudemoShare from './components/PublicQudemoShare';
import PrivacyPolicy from './components/PrivacyPolicy';
import { CompanyProvider, useCompany } from './context/CompanyContext';
import { BackendProvider } from './context/BackendContext';
import { NotificationProvider } from './context/NotificationContext';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      try {
        console.log('🔐 Checking authentication with token:', token ? 'exists' : 'missing');
        
        // First try a simple profile check without automatic refresh
        const response = await fetch(getNodeApiUrl('/api/auth/profile'), {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        console.log('🔐 Auth check response status:', response.status);
        console.log('🔐 Auth check response ok:', response.ok);

        if (response.ok) {
          console.log('✅ Authentication successful');
          setIsAuthenticated(true);
        } else if (response.status === 401 || response.status === 403) {
          console.log('🔄 Token expired, attempting refresh...');
          
          // Try to refresh the token
          const refreshToken = localStorage.getItem('refreshToken');
          if (refreshToken) {
            try {
              const refreshResponse = await fetch(getNodeApiUrl('/api/auth/refresh'), {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ refreshToken })
              });

              if (refreshResponse.ok) {
                const refreshData = await refreshResponse.json();
                if (refreshData.success && refreshData.data.accessToken) {
                  console.log('✅ Token refreshed successfully');
                  localStorage.setItem('accessToken', refreshData.data.accessToken);
                  setIsAuthenticated(true);
                  return;
                }
              }
            } catch (refreshError) {
              console.error('Token refresh failed:', refreshError);
            }
          }
          
          console.log('❌ Authentication failed, clearing tokens');
          clearAuthTokens();
          setIsAuthenticated(false);
        } else {
          console.log('❌ Authentication failed with status:', response.status);
          clearAuthTokens();
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        clearAuthTokens();
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    console.log('🔐 Authentication check in progress...');
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('🔐 User not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  console.log('🔐 User authenticated, showing protected content');

  return children;
};

// Company Check Component
const CompanyCheck = ({ children }) => {
  const { company, isLoading } = useCompany();

  console.log('🏢 CompanyCheck: isLoading:', isLoading, 'company:', !!company);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // If no company exists, show company setup
  if (!company) {
    console.log('🏢 CompanyCheck: No company found, showing CompanySetup');
    return <CompanySetup />;
  }

  // If company exists, show the dashboard
  console.log('🏢 CompanyCheck: Company found, showing dashboard');
  return children;
};

// Dashboard Layout Component
const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 mt-16">
          <div className="container mx-auto px-2 sm:px-6 py-4 sm:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

function App() {
  // Removed aggressive refresh prevention to fix UI refresh issues
  
  // Check domain on app load to prevent Vercel redirects
  useEffect(() => {
    const wasRedirected = checkDomainOnLoad();
    if (wasRedirected) {
      console.log('🔍 App: Domain redirect triggered, stopping execution');
      return;
    }
  }, []);

  // Clean up hash from URL if present
  useEffect(() => {
    if (window.location.hash === '#') {
      console.log('🔍 App: Cleaning up empty hash from URL');
      window.history.replaceState(null, null, window.location.pathname + window.location.search);
    }
  }, []);

  // Debug: Monitor token changes globally
  useEffect(() => {
    console.log('🔍 App: Global token monitoring started');
    
    const checkGlobalTokens = () => {
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');
      const user = localStorage.getItem('user');
      
      console.log('🔍 App: Global token check - Access:', !!accessToken, 'Refresh:', !!refreshToken, 'User:', !!user);
    };
    
    // Check tokens on app load
    checkGlobalTokens();
    
    // Listen for storage changes
    const handleStorageChange = (e) => {
      if (e.key === 'accessToken' || e.key === 'refreshToken' || e.key === 'user') {
        console.log('🔍 App: Storage change detected for key:', e.key, 'New value exists:', !!e.newValue);
        checkGlobalTokens();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <Router>
      <BackendProvider>
        <NotificationProvider>
          <div className="App">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/privacypolicy" element={<PrivacyPolicy />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/share/:shareToken" element={<PublicQudemoShare />} />
              
              {/* Protected Routes - Wrapped with CompanyProvider */}
              <Route 
                path="/overview" 
                element={
                  <CompanyProvider>
                    <ProtectedRoute>
                      <CompanyCheck>
                        <DashboardLayout>
                          <Overview />
                        </DashboardLayout>
                      </CompanyCheck>
                    </ProtectedRoute>
                  </CompanyProvider>
                } 
              />
            {/* CUSTOMER PAGE ROUTE - COMMENTED OUT (NOT IN USE)
            <Route 
              path="/customers" 
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <DemoHomePage />
                  </DashboardLayout>
                </ProtectedRoute>
              } 
            />
            */}
            <Route 
              path="/create" 
              element={
                <CompanyProvider>
                  <ProtectedRoute>
                    <CompanyCheck>
                      <DashboardLayout>
                        <CreateQuDemo />
                      </DashboardLayout>
                    </CompanyCheck>
                  </ProtectedRoute>
                </CompanyProvider>
              } 
            />
            <Route 
              path="/qudemos" 
              element={
                <CompanyProvider>
                  <ProtectedRoute>
                    <CompanyCheck>
                      <DashboardLayout>
                        <Qudemos />
                      </DashboardLayout>
                    </CompanyCheck>
                  </ProtectedRoute>
                </CompanyProvider>
              } 
            />
            <Route 
              path="/edit-qudemo/:id" 
              element={
                <CompanyProvider>
                  <ProtectedRoute>
                    <CompanyCheck>
                      <DashboardLayout>
                        <EditQudemo />
                      </DashboardLayout>
                    </CompanyCheck>
                  </ProtectedRoute>
                </CompanyProvider>
              } 
            />
            <Route 
              path="/interactions" 
              element={
                <CompanyProvider>
                  <ProtectedRoute>
                    <CompanyCheck>
                      <DashboardLayout>
                        <BuyerInteractions />
                      </DashboardLayout>
                    </CompanyCheck>
                  </ProtectedRoute>
                </CompanyProvider>
              } 
            />
            <Route 
              path="/analytics" 
              element={
                <CompanyProvider>
                  <ProtectedRoute>
                    <CompanyCheck>
                      <DashboardLayout>
                        <InsightsAnalytics />
                      </DashboardLayout>
                    </CompanyCheck>
                  </ProtectedRoute>
                </CompanyProvider>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <CompanyProvider>
                  <ProtectedRoute>
                    <CompanyCheck>
                      <DashboardLayout>
                        <ProfilePage />
                      </DashboardLayout>
                    </CompanyCheck>
                  </ProtectedRoute>
                </CompanyProvider>
              } 
            />
            <Route 
              path="/settings" 
              element={
                <CompanyProvider>
                  <ProtectedRoute>
                    <CompanyCheck>
                      <DashboardLayout>
                        <SettingsPage />
                      </DashboardLayout>
                    </CompanyCheck>
                  </ProtectedRoute>
                </CompanyProvider>
              } 
            />
            <Route 
              path="/companies" 
              element={
                <CompanyProvider>
                  <ProtectedRoute>
                    <CompanyCheck>
                      <DashboardLayout>
                        <CompanyManagement />
                      </DashboardLayout>
                    </CompanyCheck>
                  </ProtectedRoute>
                </CompanyProvider>
              } 
            />
            <Route 
              path="/test-runner" 
              element={
                <CompanyProvider>
                  <ProtectedRoute>
                    <CompanyCheck>
                      <DashboardLayout>
                        <TestRunner />
                      </DashboardLayout>
                    </CompanyCheck>
                  </ProtectedRoute>
                </CompanyProvider>
              } 
            />
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </div>
        </NotificationProvider>
      </BackendProvider>
    </Router>
  );
}

export default App;
