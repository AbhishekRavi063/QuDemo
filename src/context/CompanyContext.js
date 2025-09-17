import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { getNodeApiUrl } from '../config/api';
import { authenticatedFetch, clearAuthTokens } from '../utils/tokenRefresh';

const CompanyContext = createContext();

export const useCompany = () => useContext(CompanyContext);

export const CompanyProvider = ({ children }) => {
  const [company, setCompany] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCompany = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    console.log('🔍 CompanyContext: Starting fetchCompany');
    console.log('🔍 CompanyContext: Token exists:', !!token);
    
    if (!token) {
      console.log('🔍 CompanyContext: No token found, setting loading to false');
      setIsLoading(false);
      return;
    }
    
    console.log('🔍 CompanyContext: Setting loading to true');
    setIsLoading(true);
    setError(null);
    
    try {
      const apiUrl = getNodeApiUrl('/api/companies');
      console.log('🏢 CompanyContext API call details:');
      console.log(`   API URL: ${apiUrl}`);
      console.log(`   Token exists: ${!!token}`);
      console.log(`   Token length: ${token?.length || 0}`);
      
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log(`🏢 Company API Response:`, {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText
      });
      
      const data = await response.json();
      console.log(`🏢 Company API Data:`, {
        success: data.success,
        dataLength: data.data?.length || 0,
        error: data.error,
        company: data.data?.[0]
      });
      
      if (data.success && data.data.length > 0) {
        setCompany(data.data[0]); // Assume one company per user for now
        console.log('✅ Company set successfully:', data.data[0]);
      } else if (!data.success) {
        setError(data.error || 'Failed to fetch company data.');
        console.log('❌ Company fetch failed:', data.error);
        setCompany(null); // Clear company on error
      } else {
        console.log('⚠️ No companies found in response');
        
        // Check if this might be a timing issue (user just created)
        // If we have a valid token but no companies, wait a bit and try once more
        const token = localStorage.getItem('accessToken');
        if (token) {
          console.log('🔄 No companies found but token exists, retrying once in 1 second...');
          setTimeout(async () => {
            console.log('🔄 Retrying company fetch...');
            try {
              const retryResponse = await fetch(getNodeApiUrl('/api/companies'), {
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              });
              
              const retryData = await retryResponse.json();
              if (retryData.success && retryData.data.length > 0) {
                console.log('✅ Company found on retry:', retryData.data[0]);
                setCompany(retryData.data[0]);
              } else {
                console.log('⚠️ Still no companies found after retry, clearing company state');
                setCompany(null);
              }
            } catch (error) {
              console.error('❌ Retry failed:', error);
              setCompany(null);
            }
          }, 1000);
        } else {
          console.log('⚠️ No token, clearing company state');
          setCompany(null);
        }
      }
    } catch (err) {
      setError('An error occurred while fetching company data.');
      console.error('Fetch company error:', err);
      setCompany(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Fetch company data on initial load
    console.log('🔍 CompanyContext: useEffect triggered');
    console.log('🔍 CompanyContext: Current state - company:', !!company, 'isLoading:', isLoading);
    
    const initializeCompany = async () => {
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        console.log('🔍 CompanyContext: No token found');
        setIsLoading(false);
        return;
      }

            // First verify the token is valid by checking profile
            try {
              console.log('🔍 CompanyContext: Verifying authentication token...');
              const profileResponse = await fetch(getNodeApiUrl('/api/auth/profile'), {
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              });

              if (profileResponse.ok) {
                console.log('✅ CompanyContext: Authentication verified, fetching company data');
                await fetchCompany();
              } else {
                console.log('❌ CompanyContext: Authentication failed, skipping company fetch');
                setIsLoading(false);
              }
      } catch (error) {
        console.error('❌ CompanyContext: Authentication check failed:', error);
        setIsLoading(false);
      }
    };

    // Add a small delay to ensure authentication is fully established
    const timer = setTimeout(() => {
      initializeCompany();
    }, 100);

    // Listen for storage changes (when tokens are updated after login)
    const handleStorageChange = (e) => {
      if (e.key === 'accessToken' && e.newValue) {
        console.log('🔍 CompanyContext: Access token updated, reinitializing company data');
        setTimeout(() => {
          initializeCompany();
        }, 200); // Slightly longer delay for login completion
      }
    };

    // Listen for custom auth completion event
    const handleAuthCompleted = () => {
      console.log('🔍 CompanyContext: Auth completed event received, refreshing company data');
      setTimeout(() => {
        initializeCompany();
      }, 300); // Delay to ensure navigation is complete
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('authCompleted', handleAuthCompleted);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authCompleted', handleAuthCompleted);
    };
  }, []); // Empty dependency array to run only once on mount

  const value = { 
    company, 
    isLoading, 
    error, 
    refreshCompany: fetchCompany, 
    setCompany,
    checkAuthAndRefresh: fetchCompany
  };

  return (
    <CompanyContext.Provider value={value}>
      {children}
    </CompanyContext.Provider>
  );
};
