// Domain enforcer to prevent Vercel domain redirects
export const enforceCustomDomain = () => {
  const currentDomain = window.location.origin;
  const currentHost = window.location.host;
  const currentUrl = window.location.href;
  // If we're on any Vercel domain, force redirect to custom domain
  if (currentHost.includes('vercel.app') || currentHost.includes('vercel.com')) {
    // Preserve the current path and query parameters
    const currentPath = window.location.pathname;
    const currentSearch = window.location.search;
    const currentHash = window.location.hash;
    
    // Use environment-based redirect
    const isProduction = window.location.hostname === 'qudemo.com';
    const redirectUrl = isProduction 
      ? `https://qudemo.com${currentPath}${currentSearch}${currentHash}`
      : `${window.location.origin}${currentPath}${currentSearch}${currentHash}`;
    // Use replace instead of href to prevent back button issues
    window.location.replace(redirectUrl);
    return true; // Indicates redirect was triggered
  }
  return false; // No redirect needed
};

// Check domain on page load
export const checkDomainOnLoad = () => {
  // Only run on client side
  if (typeof window !== 'undefined') {
    return enforceCustomDomain();
  }
  return false;
};
