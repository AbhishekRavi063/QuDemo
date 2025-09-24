import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabase';
import { getNodeApiUrl } from '../config/api';
// import { navigateToOverview } from '../utils/navigation'; // Not used anymore

const AuthCallback = () => {
  const navigate = useNavigate();
  // const [isProcessing, setIsProcessing] = useState(true); // Not used
  const [error, setError] = useState('');

  useEffect(() => {
    const handleAuthCallback = async () => {
      // IMMEDIATE DOMAIN CHECK - Force redirect if on Vercel domain
      const currentHost = window.location.host;
      if (currentHost.includes('vercel.app') || currentHost.includes('vercel.com')) {
        
              // Always redirect to home instead of preserving the hash
              const redirectUrl = `${window.location.origin}/`;
        
        window.location.replace(redirectUrl);
        return;
      }
      
      // Additional check for URL hash
      if (!window.location.hash.includes('access_token')) {
        navigate('/login');
        return;
      }
      
      try {
        
        // Parse tokens from URL hash FIRST, before clearing tokens
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        const expiresAt = params.get('expires_at');
        const tokenType = params.get('token_type');
        if (accessToken && refreshToken) {
          // Clear any existing tokens to ensure fresh authentication
          const { clearAuthTokens } = await import('../utils/tokenRefresh');
          await clearAuthTokens();
          // Parse the JWT token to extract user data directly
          // Decode the JWT payload (without verification since we trust Supabase)
          const tokenParts = accessToken.split('.');
          if (tokenParts.length !== 3) {
            console.error('Invalid JWT token format');
            setError('Invalid authentication token');
            setTimeout(() => navigate('/login'), 3000);
            return;
          }
          
          const payload = JSON.parse(atob(tokenParts[1]));
          // Extract user data from the JWT payload
          const user = {
            id: payload.sub,
            email: payload.email,
            user_metadata: payload.user_metadata || {}
          };
          // Store user data (but not tokens yet - wait for backend tokens)
          localStorage.setItem('user', JSON.stringify({
            id: user.id,
            email: user.email,
            firstName: user.user_metadata?.full_name?.split(' ')[0] || user.user_metadata?.first_name || '',
            lastName: user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || user.user_metadata?.last_name || '',
            profile_picture: user.user_metadata?.avatar_url || user.user_metadata?.picture || ''
          }));
          // Check if user exists in our backend, if not create them
          try {
            let response;
            try {
              response = await fetch(getNodeApiUrl('/api/auth/profile'), {
                headers: {
                  'Authorization': `Bearer ${accessToken}` // Use Supabase token temporarily for profile check
                }
              });
            } catch (profileError) {
              console.error('Profile check failed:', profileError);
              // If profile check fails, redirect to login instead of using fallback tokens
              setError('Authentication failed. Please try again.');
              setTimeout(() => navigate('/login'), 3000);
              return;
            }
            if (!response.ok) {
              // User doesn't exist in our backend, create them
              const createUserResponse = await fetch(getNodeApiUrl('/api/auth/register'), {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${accessToken}` // ✅ Add the token for auth middleware
                },
                body: JSON.stringify({
                  email: user.email,
                  authProvider: 'google',
                  firstName: user.user_metadata?.first_name || user.user_metadata?.full_name?.split(' ')[0] || '',
                  lastName: user.user_metadata?.last_name || user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || null,
                  isGoogleUser: true
                  // No password field for Google OAuth users
                })
              });
              if (!createUserResponse.ok) {
                const errorData = await createUserResponse.json();
                console.error('Failed to create user in backend:', errorData);
                setError('Failed to create user account. Please try again.');
                return;
              } else {
                // Get the backend tokens if available
                const backendData = await createUserResponse.json();
                if (backendData.success && backendData.data.tokens) {
                  localStorage.setItem('accessToken', backendData.data.tokens.accessToken);
                  localStorage.setItem('refreshToken', backendData.data.tokens.refreshToken);
                } else {
                  localStorage.setItem('accessToken', accessToken);
                  localStorage.setItem('refreshToken', refreshToken);
                }
              }
            } else {
              // User exists, get fresh tokens by calling login endpoint
              try {
                const loginResponse = await fetch(getNodeApiUrl('/api/auth/login'), {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    email: user.email,
                    password: null, // No password for OAuth users
                    isGoogleUser: true
                  })
                });
                
                if (loginResponse.ok) {
                  const loginData = await loginResponse.json();
                  if (loginData.success && loginData.data.tokens) {
                    localStorage.setItem('accessToken', loginData.data.tokens.accessToken);
                    localStorage.setItem('refreshToken', loginData.data.tokens.refreshToken);
                  }
                }
              } catch (loginError) {
                console.error('Failed to get fresh tokens for existing user:', loginError);
                // If login fails, redirect to login instead of using fallback tokens
                setError('Failed to authenticate existing user. Please try again.');
                setTimeout(() => navigate('/login'), 3000);
                return;
              }
            }
          } catch (backendError) {
            console.error('Backend user creation error:', backendError);
            // If backend fails completely, redirect to login instead of using fallback tokens
            setError('Failed to sync user account. Please try again.');
            setTimeout(() => navigate('/login'), 3000);
            return;
          }

          // Small delay to ensure user is fully created before navigation
          // Check if user has a company to determine redirect destination
          try {
            const companyResponse = await fetch(getNodeApiUrl('/api/companies'), {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
              }
            });
            
            const companyData = await companyResponse.json();
            // Dispatch custom event to trigger company refresh
            window.dispatchEvent(new CustomEvent('authCompleted'));
            
            setTimeout(() => {
              const currentOrigin = window.location.origin;
              
              if (companyData.success && companyData.data && companyData.data.length > 0) {
                // User has a company - redirect to qudemos page
                window.location.href = `${currentOrigin}/qudemos`;
              } else {
                // User has no company - redirect to create page
                window.location.href = `${currentOrigin}/create`;
              }
            }, 500);
          } catch (companyError) {
            console.error('Failed to check company status:', companyError);
            // Fallback to create page if company check fails
            // Dispatch custom event to trigger company refresh
            window.dispatchEvent(new CustomEvent('authCompleted'));
            
            setTimeout(() => {
              const currentOrigin = window.location.origin;
              window.location.href = `${currentOrigin}/create`;
            }, 500);
          }
        } else {
          navigate('/login');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        setError('Authentication failed. Please try again.');
        setTimeout(() => navigate('/login'), 3000);
      } finally {
        // setIsProcessing(false); // Not used
      }
    };

    handleAuthCallback();
  }, [navigate]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-lg font-semibold mb-2">Authentication Error</div>
          <div className="text-gray-600 mb-4">{error}</div>
          <div className="text-sm text-gray-500">Redirecting to login page...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <div className="text-lg font-semibold text-gray-900">Signing you in...</div>
        <div className="text-sm text-gray-500">Please wait while we complete your authentication.</div>
      </div>
    </div>
  );
};

export default AuthCallback; 