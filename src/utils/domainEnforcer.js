// Domain enforcer to prevent Vercel domain redirects
export const enforceCustomDomain = () => {
  const currentDomain = window.location.origin;
  const currentHost = window.location.host;
  
  console.log('🔍 DomainEnforcer: Current domain:', currentDomain);
  console.log('🔍 DomainEnforcer: Current host:', currentHost);
  
  // If we're on any Vercel domain, force redirect to custom domain
  if (currentHost.includes('vercel.app') || currentHost.includes('vercel.com')) {
    console.log('🔍 DomainEnforcer: Detected Vercel domain, forcing redirect to qudemo.com');
    
    // Preserve the current path and query parameters
    const currentPath = window.location.pathname;
    const currentSearch = window.location.search;
    const currentHash = window.location.hash;
    
    const redirectUrl = `https://qudemo.com${currentPath}${currentSearch}${currentHash}`;
    
    console.log('🔍 DomainEnforcer: Redirecting to:', redirectUrl);
    window.location.href = redirectUrl;
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
