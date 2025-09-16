import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { getNodeApiUrl } from './config/api';

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
import TestRunner from './components/TestRunner';
import PublicQudemoShare from './components/PublicQudemoShare';
import { CompanyProvider, useCompany } from './context/CompanyContext';
import { BackendProvider } from './context/BackendContext';

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
        const response = await fetch(getNodeApiUrl('/api/auth/profile'), {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Company Check Component
const CompanyCheck = ({ children }) => {
  const { company, isLoading } = useCompany();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // If no company exists, show company setup
  if (!company) {
    return <CompanySetup />;
  }

  // If company exists, show the dashboard
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
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
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

  return (
    <Router>
      <BackendProvider>
        <CompanyProvider>
          <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/share/:shareToken" element={<PublicQudemoShare />} />
            
            {/* Protected Routes */}
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <CompanyCheck>
                    <DashboardLayout>
                      <Overview />
                    </DashboardLayout>
                  </CompanyCheck>
                </ProtectedRoute>
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
                <ProtectedRoute>
                  <CompanyCheck>
                    <DashboardLayout>
                      <CreateQuDemo />
                    </DashboardLayout>
                  </CompanyCheck>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/qudemos" 
              element={
                <ProtectedRoute>
                  <CompanyCheck>
                    <DashboardLayout>
                      <Qudemos />
                    </DashboardLayout>
                  </CompanyCheck>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/edit-qudemo/:id" 
              element={
                <ProtectedRoute>
                  <CompanyCheck>
                    <DashboardLayout>
                      <EditQudemo />
                    </DashboardLayout>
                  </CompanyCheck>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/interactions" 
              element={
                <ProtectedRoute>
                  <CompanyCheck>
                    <DashboardLayout>
                      <BuyerInteractions />
                    </DashboardLayout>
                  </CompanyCheck>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/analytics" 
              element={
                <ProtectedRoute>
                  <CompanyCheck>
                    <DashboardLayout>
                      <InsightsAnalytics />
                    </DashboardLayout>
                  </CompanyCheck>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <CompanyCheck>
                    <DashboardLayout>
                      <ProfilePage />
                    </DashboardLayout>
                  </CompanyCheck>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute>
                  <CompanyCheck>
                    <DashboardLayout>
                      <SettingsPage />
                    </DashboardLayout>
                  </CompanyCheck>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/companies" 
              element={
                <ProtectedRoute>
                  <CompanyCheck>
                    <DashboardLayout>
                      <CompanyManagement />
                    </DashboardLayout>
                  </CompanyCheck>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/test-runner" 
              element={
                <ProtectedRoute>
                  <CompanyCheck>
                    <DashboardLayout>
                      <TestRunner />
                    </DashboardLayout>
                  </CompanyCheck>
                </ProtectedRoute>
              } 
            />
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </div>
        </CompanyProvider>
      </BackendProvider>
    </Router>
  );
}

export default App;
