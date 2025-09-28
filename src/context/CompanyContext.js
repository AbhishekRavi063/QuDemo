import React, { createContext, useState, useEffect, useContext, useCallback, useRef } from 'react';
import { getNodeApiUrl } from '../config/api';
import { authenticatedFetch, clearAuthTokens } from '../utils/tokenRefresh';

const CompanyContext = createContext();

export const useCompany = () => useContext(CompanyContext);

export const CompanyProvider = ({ children }) => {
  const [company, setCompany] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const isFetchingRef = useRef(false);

  const fetchCompany = useCallback(async () => {
    const token = localStorage.getItem('accessToken');

    if (!token) {

      setIsLoading(false);
      return;
    }
    
    // Prevent multiple simultaneous fetches
    if (isFetchingRef.current) {

      return;
    }
    
    isFetchingRef.current = true;

    setIsLoading(true);
    setError(null);
    
    try {
      const apiUrl = getNodeApiUrl('/api/companies');

      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success && data.data.length > 0) {
        setCompany(data.data[0]); // Assume one company per user for now

      } else if (!data.success) {
        setError(data.error || 'Failed to fetch company data.');

        setCompany(null); // Clear company on error
      } else {

        // Check if this might be a timing issue (user just created)
        // If we have a valid token but no companies, wait a bit and try once more
        const token = localStorage.getItem('accessToken');
        if (token) {

          setTimeout(async () => {

            try {
              const retryResponse = await fetch(getNodeApiUrl('/api/companies'), {
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              });
              
              const retryData = await retryResponse.json();
              if (retryData.success && retryData.data.length > 0) {

                setCompany(retryData.data[0]);
              } else {

                setCompany(null);
              }
            } catch (error) {
              console.error('❌ Retry failed:', error);
              setCompany(null);
            }
          }, 1000);
        } else {

          setCompany(null);
        }
      }
    } catch (err) {
      setError('An error occurred while fetching company data.');
      console.error('Fetch company error:', err.message || err);
      setCompany(null);
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, [isFetchingRef]);

  useEffect(() => {
    // Fetch company data on initial load

    const initializeCompany = async () => {
      const token = localStorage.getItem('accessToken');
      
      if (!token) {

        setIsLoading(false);
        return;
      }

            // First verify the token is valid by checking profile
            try {

              const profileResponse = await fetch(getNodeApiUrl('/api/auth/profile'), {
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              });

              if (profileResponse.ok) {

                await fetchCompany();
              } else {

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

        setTimeout(() => {
          initializeCompany();
        }, 200); // Slightly longer delay for login completion
      }
    };

    // Listen for custom auth completion event
    const handleAuthCompleted = () => {

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
