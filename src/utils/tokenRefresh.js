import { getNodeApiUrl } from '../config/api';

/**
 * Attempts to refresh the access token using the refresh token
 * @returns {Promise<{success: boolean, accessToken?: string, error?: string}>}
 */
export const refreshAccessToken = async () => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (!refreshToken) {
      console.log('❌ TokenRefresh: No refresh token found');
      return { success: false, error: 'No refresh token found' };
    }

    console.log('🔄 TokenRefresh: Attempting to refresh access token');
    
    const response = await fetch(getNodeApiUrl('/api/auth/refresh'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ refreshToken })
    });

    const data = await response.json();

    if (response.ok && data.success) {
      console.log('✅ TokenRefresh: Access token refreshed successfully');
      localStorage.setItem('accessToken', data.data.accessToken);
      return { success: true, accessToken: data.data.accessToken };
    } else {
      console.log('❌ TokenRefresh: Failed to refresh token:', data.error);
      return { success: false, error: data.error || 'Failed to refresh token' };
    }
  } catch (error) {
    console.error('❌ TokenRefresh: Network error:', error);
    return { success: false, error: 'Network error during token refresh' };
  }
};

/**
 * Makes an authenticated request with automatic token refresh on failure
 * @param {string} url - The URL to make the request to
 * @param {Object} options - Fetch options (headers, body, etc.)
 * @returns {Promise<Response>}
 */
export const authenticatedFetch = async (url, options = {}) => {
  const token = localStorage.getItem('accessToken');
  
  if (!token) {
    throw new Error('No access token found');
  }

  // Add authorization header
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers
  };

  const requestOptions = {
    ...options,
    headers
  };

  // Make the initial request
  let response = await fetch(url, requestOptions);

  // If the request fails with 401/403, try to refresh the token
  if ((response.status === 401 || response.status === 403) && response.status !== 429) {
    console.log('🔄 AuthenticatedFetch: Token expired, attempting refresh');
    
    const refreshResult = await refreshAccessToken();
    
    if (refreshResult.success) {
      console.log('✅ AuthenticatedFetch: Token refreshed, retrying request');
      
      // Retry the request with the new token
      const newHeaders = {
        ...headers,
        'Authorization': `Bearer ${refreshResult.accessToken}`
      };
      
      const retryOptions = {
        ...requestOptions,
        headers: newHeaders
      };
      
      response = await fetch(url, retryOptions);
    } else {
      console.log('❌ AuthenticatedFetch: Token refresh failed, clearing tokens');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  }

  return response;
};

/**
 * Clears all authentication tokens and Supabase session
 */
export const clearAuthTokens = async () => {
  try {
    // Clear Supabase session first
    const { supabase } = await import('../config/supabase');
    await supabase.auth.signOut();
  } catch (error) {
    console.log('Supabase signout error (non-critical):', error);
  }
  
  // Clear localStorage tokens
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  console.log('🧹 Auth tokens and session cleared');
};
