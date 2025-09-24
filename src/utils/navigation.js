// Navigation utility to ensure we stay on the correct domain
export const navigateToCreate = (navigate) => {
  const currentDomain = window.location.origin;
  // Use React Router navigation for same-origin requests
  navigate('/create');
};

export const navigateToLogin = (navigate) => {
  const currentDomain = window.location.origin;
  // Use React Router navigation for same-origin requests
  navigate('/login');
};

export const navigateToRegister = (navigate) => {
  const currentDomain = window.location.origin;
  // Use React Router navigation for same-origin requests
  navigate('/register');
};
