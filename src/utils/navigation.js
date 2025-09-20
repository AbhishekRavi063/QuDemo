// Navigation utility to ensure we stay on the correct domain
export const navigateToOverview = (navigate) => {
  const currentDomain = window.location.origin;
  console.log('🔍 Navigation: Current domain:', currentDomain);
  console.log('🔍 Navigation: Current URL:', window.location.href);
  console.log('🔍 Navigation: Current pathname:', window.location.pathname);
  console.log('🔍 Navigation: Current hash:', window.location.hash);
  
  // If we're on the custom domain, use React Router navigation
  if (currentDomain.includes('qudemo.com')) {
    console.log('🔍 Navigation: Using custom domain, navigating with React Router');
    navigate('/overview');
  } else {
    // If we're on Vercel domain, force redirect to custom domain
    console.log('🔍 Navigation: On Vercel domain, redirecting to custom domain');
    console.log('🔍 Navigation: Forcing redirect to https://qudemo.com/overview');
    window.location.href = 'https://qudemo.com/overview';
  }
};

export const navigateToLogin = (navigate) => {
  const currentDomain = window.location.origin;
  console.log('🔍 Navigation: Current domain:', currentDomain);
  
  // If we're on the custom domain, use React Router navigation
  if (currentDomain.includes('qudemo.com')) {
    console.log('🔍 Navigation: Using custom domain, navigating with React Router');
    navigate('/login');
  } else {
    // If we're on Vercel domain, force redirect to custom domain
    console.log('🔍 Navigation: On Vercel domain, redirecting to custom domain');
    window.location.href = 'https://qudemo.com/login';
  }
};

export const navigateToRegister = (navigate) => {
  const currentDomain = window.location.origin;
  console.log('🔍 Navigation: Current domain:', currentDomain);
  
  // If we're on the custom domain, use React Router navigation
  if (currentDomain.includes('qudemo.com')) {
    console.log('🔍 Navigation: Using custom domain, navigating with React Router');
    navigate('/register');
  } else {
    // If we're on Vercel domain, force redirect to custom domain
    console.log('🔍 Navigation: On Vercel domain, redirecting to custom domain');
    window.location.href = 'https://qudemo.com/register';
  }
};
