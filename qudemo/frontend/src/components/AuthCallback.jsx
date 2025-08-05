import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Supabase returns tokens in the URL hash
    const hash = window.location.hash.substr(1);
    const params = new URLSearchParams(hash);
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');
    const expiresIn = params.get('expires_in');
    const tokenType = params.get('token_type');

    console.log('AuthCallback: hash:', hash);
    console.log('AuthCallback: accessToken:', accessToken);
    console.log('AuthCallback: refreshToken:', refreshToken);
    console.log('AuthCallback: expiresIn:', expiresIn);
    console.log('AuthCallback: tokenType:', tokenType);

    if (accessToken && refreshToken) {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('tokenType', tokenType);
      localStorage.setItem('expiresIn', expiresIn);
      console.log('AuthCallback: Tokens stored, navigating to /');
      navigate('/'); // or wherever your home page is
    } else {
      console.log('AuthCallback: Tokens missing, navigating to /login');
      navigate('/login');
    }
  }, [navigate]);

  return <div>Signing you in...</div>;
};

export default AuthCallback; 