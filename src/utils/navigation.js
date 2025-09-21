// Navigation utility to ensure we stay on the correct domain
export const navigateToCreate = (navigate) => {
  const currentDomain = window.location.origin;
  console.log('🔍 Navigation: Current domain:', currentDomain);
  console.log('🔍 Navigation: Current URL:', window.location.href);
  console.log('🔍 Navigation: Current pathname:', window.location.pathname);
  console.log('🔍 Navigation: Current hash:', window.location.hash);
  
  // Use React Router navigation for same-origin requests
  console.log('🔍 Navigation: Using React Router navigation');
  console.log('🔍 Navigation: Calling navigate("/create")');
  navigate('/create');
};

export const navigateToLogin = (navigate) => {
  const currentDomain = window.location.origin;
  console.log('🔍 Navigation: Current domain:', currentDomain);
  
  // Use React Router navigation for same-origin requests
  console.log('🔍 Navigation: Using React Router navigation');
  navigate('/login');
};

export const navigateToRegister = (navigate) => {
  const currentDomain = window.location.origin;
  console.log('🔍 Navigation: Current domain:', currentDomain);
  
  // Use React Router navigation for same-origin requests
  console.log('🔍 Navigation: Using React Router navigation');
  navigate('/register');
};
