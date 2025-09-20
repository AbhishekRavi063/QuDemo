import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabase';
import { getNodeApiUrl } from '../config/api';
// import { navigateToOverview } from '../utils/navigation'; // Not used anymore

const AuthCallback = () => {
  const navigate = useNavigate();
  // const [isProcessing, setIsProcessing] = useState(true); // Not used
  const [error, setError] = useState('');
  const [hasProcessed, setHasProcessed] = useState(false);

  useEffect(() => {
    const handleAuthCallback = async () => {
      // IMMEDIATE DOMAIN CHECK - Force redirect if on Vercel domain
      const currentHost = window.location.host;
      if (currentHost.includes('vercel.app') || currentHost.includes('vercel.com')) {
        console.log('🚨 AuthCallback: IMMEDIATE VERCEL DOMAIN DETECTED - FORCING REDIRECT');
        console.log('🚨 AuthCallback: Current host:', currentHost);
        console.log('🚨 AuthCallback: This indicates Vercel domain configuration issue');
        
        // Always redirect to /overview instead of preserving the hash
        const redirectUrl = `https://qudemo.com/overview`;
        
        console.log('🚨 AuthCallback: Redirecting to:', redirectUrl);
        window.location.replace(redirectUrl);
        return;
      }
      
      // Prevent duplicate processing
      if (hasProcessed) {
        console.log('🔍 AuthCallback: Already processed, skipping');
        return;
      }
      
      // Additional check for URL hash
      if (!window.location.hash.includes('access_token')) {
        console.log('🔍 AuthCallback: No access token in URL, redirecting to login');
        navigate('/login');
        return;
      }
      
      try {
        setHasProcessed(true);
        console.log('🔍 AuthCallback: Starting authentication callback');
        
        console.log('🔍 AuthCallback: Current URL:', window.location.href);
        console.log('🔍 AuthCallback: URL hash:', window.location.hash);
        console.log('🔍 AuthCallback: URL search params:', window.location.search);
        console.log('🔍 AuthCallback: Full URL breakdown:', {
          protocol: window.location.protocol,
          host: window.location.host,
          pathname: window.location.pathname,
          search: window.location.search,
          hash: window.location.hash
        });
        
        // Parse tokens from URL hash FIRST, before clearing tokens
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        const expiresAt = params.get('expires_at');
        const tokenType = params.get('token_type');
        
        console.log('🔍 AuthCallback: Parsed tokens from URL:', {
          accessToken: accessToken ? 'Present' : 'Missing',
          refreshToken: refreshToken ? 'Present' : 'Missing',
          expiresAt,
          tokenType
        });

        if (accessToken && refreshToken) {
          console.log('🔍 AuthCallback: Tokens found in URL, clearing old tokens and setting session');
          
          // Clear any existing tokens to ensure fresh authentication
          console.log('🧹 AuthCallback: Clearing existing tokens for fresh authentication');
          const { clearAuthTokens } = await import('../utils/tokenRefresh');
          await clearAuthTokens();
          
          console.log('🔍 AuthCallback: Tokens found in URL, setting session manually');
          
          // Set the session manually using Supabase's setSession method
          const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });
          
          console.log('🔍 AuthCallback: Manual session set result:', { sessionData, sessionError });
          
          if (sessionError) {
            console.error('Auth callback session error:', sessionError);
            setError(`Session setup failed: ${sessionError.message}`);
            setTimeout(() => navigate('/login'), 3000);
            return;
          }

          if (sessionData.session) {
          const { access_token, refresh_token, user } = sessionData.session;
          
          console.log('🔍 AuthCallback: Session found, processing user:', user);
          
          // Store user data (but not tokens yet - wait for backend tokens)
          localStorage.setItem('user', JSON.stringify({
            id: user.id,
            email: user.email,
            firstName: user.user_metadata?.full_name?.split(' ')[0] || user.user_metadata?.first_name || '',
            lastName: user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || user.user_metadata?.last_name || '',
            profile_picture: user.user_metadata?.avatar_url || user.user_metadata?.picture || ''
          }));

          console.log('🔍 AuthCallback: User data stored, proceeding with backend sync to get proper tokens');

          // Check if user exists in our backend, if not create them
          try {
            console.log('🔍 AuthCallback: Checking if user exists in backend...');
            let response;
            try {
              response = await fetch(getNodeApiUrl('/api/auth/profile'), {
                headers: {
                  'Authorization': `Bearer ${access_token}` // Use Supabase token temporarily for profile check
                }
              });
            } catch (profileError) {
              console.error('Profile check failed:', profileError);
              // If profile check fails, redirect to login instead of using fallback tokens
              console.log('⚠️ AuthCallback: Profile check failed, redirecting to login');
              setError('Authentication failed. Please try again.');
              setTimeout(() => navigate('/login'), 3000);
              return;
            }

            console.log('🔍 AuthCallback: Backend profile check response:', response.status);

            if (!response.ok) {
              console.log('🔍 AuthCallback: User not found in backend, creating user...');
              // User doesn't exist in our backend, create them
              console.log('🔍 AuthCallback: Sending register request with token:', access_token ? 'Present' : 'Missing');
              console.log('🔍 AuthCallback: Token length:', access_token ? access_token.length : 0);
              const createUserResponse = await fetch(getNodeApiUrl('/api/auth/register'), {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${access_token}` // ✅ Add the token for auth middleware
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

              console.log('🔍 AuthCallback: User creation response:', createUserResponse.status);
              if (!createUserResponse.ok) {
                const errorData = await createUserResponse.json();
                console.error('Failed to create user in backend:', errorData);
                setError('Failed to create user account. Please try again.');
                // setIsProcessing(false); // Not used
                return;
              } else {
                console.log('🔍 AuthCallback: User created/updated successfully in backend');
                
                // Get the backend tokens if available
                const backendData = await createUserResponse.json();
                if (backendData.success && backendData.data.tokens) {
                  console.log('🔍 AuthCallback: Using backend tokens for consistency');
                  localStorage.setItem('accessToken', backendData.data.tokens.accessToken);
                  localStorage.setItem('refreshToken', backendData.data.tokens.refreshToken);
                  console.log('✅ AuthCallback: Backend tokens stored for new user');
                } else {
                  console.log('⚠️ AuthCallback: No backend tokens received, using Supabase tokens as fallback');
                  localStorage.setItem('accessToken', access_token);
                  localStorage.setItem('refreshToken', refresh_token);
                }
              }
            } else {
              console.log('🔍 AuthCallback: User already exists in backend - getting fresh tokens');
              
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
                    console.log('🔍 AuthCallback: Got fresh tokens for existing user');
                    localStorage.setItem('accessToken', loginData.data.tokens.accessToken);
                    localStorage.setItem('refreshToken', loginData.data.tokens.refreshToken);
                    console.log('✅ AuthCallback: Fresh tokens stored for existing user');
                  }
                }
              } catch (loginError) {
                console.error('Failed to get fresh tokens for existing user:', loginError);
                // If login fails, redirect to login instead of using fallback tokens
                console.log('⚠️ AuthCallback: Login failed for existing user, redirecting to login');
                setError('Failed to authenticate existing user. Please try again.');
                setTimeout(() => navigate('/login'), 3000);
                return;
              }
            }
          } catch (backendError) {
            console.error('Backend user creation error:', backendError);
            // If backend fails completely, redirect to login instead of using fallback tokens
            console.log('⚠️ AuthCallback: Backend failed completely, redirecting to login');
            setError('Failed to sync user account. Please try again.');
            setTimeout(() => navigate('/login'), 3000);
            return;
          }

          // Small delay to ensure user is fully created before navigation
          console.log('🔍 AuthCallback: User sync complete, triggering company refresh...');
          
          // Dispatch custom event to trigger company refresh
          window.dispatchEvent(new CustomEvent('authCompleted'));
          
          setTimeout(() => {
            console.log('🔍 AuthCallback: Navigating to overview page');
            
            // Always use direct redirect to avoid hash issues
            console.log('🔍 AuthCallback: Using direct redirect to /overview');
            window.location.href = 'https://qudemo.com/overview';
          }, 500);
          } else {
            console.log('🔍 AuthCallback: Session not created from tokens');
            setError('Failed to create session from tokens');
            setTimeout(() => navigate('/login'), 3000);
          }
        } else {
          console.log('🔍 AuthCallback: No tokens found in URL hash, redirecting to login');
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
  }, [navigate, hasProcessed]);

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