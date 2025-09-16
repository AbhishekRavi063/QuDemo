import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabase';
import { getNodeApiUrl } from '../config/api';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState('');
  const [hasProcessed, setHasProcessed] = useState(false);

  useEffect(() => {
    const handleAuthCallback = async () => {
      // Prevent duplicate processing
      if (hasProcessed) {
        console.log('🔍 AuthCallback: Already processed, skipping');
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
        
        // Parse tokens from URL hash
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
          
          // Store tokens in localStorage
          localStorage.setItem('accessToken', access_token);
          localStorage.setItem('refreshToken', refresh_token);
          
          // Store user data
          localStorage.setItem('user', JSON.stringify({
            id: user.id,
            email: user.email,
            firstName: user.user_metadata?.full_name?.split(' ')[0] || user.user_metadata?.first_name || '',
            lastName: user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || user.user_metadata?.last_name || '',
            profile_picture: user.user_metadata?.avatar_url || user.user_metadata?.picture || ''
          }));

          console.log('🔍 AuthCallback: User data stored, proceeding with backend sync');

          // Check if user exists in our backend, if not create them
          try {
            console.log('🔍 AuthCallback: Checking if user exists in backend...');
            const response = await fetch(getNodeApiUrl('/api/auth/profile'), {
              headers: {
                'Authorization': `Bearer ${access_token}`
              }
            });

            console.log('🔍 AuthCallback: Backend profile check response:', response.status);

            if (!response.ok) {
              console.log('🔍 AuthCallback: User not found in backend, creating user...');
              // User doesn't exist in our backend, create them
              console.log('🔍 AuthCallback: Sending register request with token:', accessToken ? 'Present' : 'Missing');
              console.log('🔍 AuthCallback: Token length:', accessToken ? accessToken.length : 0);
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

              console.log('🔍 AuthCallback: User creation response:', createUserResponse.status);
              if (!createUserResponse.ok) {
                const errorData = await createUserResponse.json();
                console.error('Failed to create user in backend:', errorData);
                setError('Failed to create user account. Please try again.');
                setIsProcessing(false);
                return;
              } else {
                console.log('🔍 AuthCallback: User created/updated successfully in backend');
              }
            } else {
              console.log('🔍 AuthCallback: User already exists in backend - LOGIN SUCCESS');
            }
          } catch (backendError) {
            console.error('Backend user creation error:', backendError);
            setError('Failed to sync user account. Please try again.');
            setIsProcessing(false);
            return;
          }

          // Small delay to ensure user is fully created before navigation
          console.log('🔍 AuthCallback: User sync complete, navigating to home page...');
          setTimeout(() => {
            navigate('/');
          }, 500);
          } else {
            console.log('🔍 AuthCallback: Session not created from tokens');
            setError('Failed to create session from tokens');
            setTimeout(() => navigate('/login'), 3000);
          }
        } else {
          console.log('🔍 AuthCallback: No tokens found in URL hash');
          
          // Check if we're using placeholder Supabase values
          const isUsingPlaceholders = !process.env.REACT_APP_SUPABASE_URL || 
                                    process.env.REACT_APP_SUPABASE_URL === 'your-supabase-url' ||
                                    !process.env.REACT_APP_SUPABASE_ANON_KEY ||
                                    process.env.REACT_APP_SUPABASE_ANON_KEY === 'your-supabase-anon-key-here';
          
          if (isUsingPlaceholders) {
            console.log('🔍 AuthCallback: Using placeholder Supabase values - OAuth not configured');
            setError('Google OAuth is not configured. Please set up Supabase credentials.');
            setTimeout(() => navigate('/login'), 5000);
          } else {
            console.log('🔍 AuthCallback: Redirecting to login');
            navigate('/login');
          }
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        setError('Authentication failed. Please try again.');
        setTimeout(() => navigate('/login'), 3000);
      } finally {
        setIsProcessing(false);
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