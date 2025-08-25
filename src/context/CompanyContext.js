import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { getNodeApiUrl } from '../config/api';

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
      } else {
        console.log('⚠️ No companies found in response');
      }
    } catch (err) {
      setError('An error occurred while fetching company data.');
      console.error('Fetch company error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Fetch company data on initial load
    console.log('🔍 CompanyContext: useEffect triggered');
    console.log('🔍 CompanyContext: Current state - company:', !!company, 'isLoading:', isLoading);
    fetchCompany();
  }, [fetchCompany]);

  const value = { company, isLoading, error, refreshCompany: fetchCompany };

  return (
    <CompanyContext.Provider value={value}>
      {children}
    </CompanyContext.Provider>
  );
};
