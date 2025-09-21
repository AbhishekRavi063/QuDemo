// Domain enforcer to prevent Vercel domain redirects
export const enforceCustomDomain = () => {
  const currentDomain = window.location.origin;
  const currentHost = window.location.host;
  const currentUrl = window.location.href;
  
  console.log('🔍 DomainEnforcer: Current domain:', currentDomain);
  console.log('🔍 DomainEnforcer: Current host:', currentHost);
  console.log('🔍 DomainEnforcer: Current URL:', currentUrl);
  console.log('🔍 DomainEnforcer: User agent:', navigator.userAgent);
  
  // If we're on any Vercel domain, force redirect to custom domain
  if (currentHost.includes('vercel.app') || currentHost.includes('vercel.com')) {
    console.log('🚨 DomainEnforcer: DETECTED VERCEL DOMAIN - FORCING REDIRECT');
    console.log('🚨 DomainEnforcer: This should not happen if Vercel is configured correctly');
    
    // Preserve the current path and query parameters
    const currentPath = window.location.pathname;
    const currentSearch = window.location.search;
    const currentHash = window.location.hash;
    
    // Use environment-based redirect
    const isProduction = window.location.hostname === 'qudemo.com';
    const redirectUrl = isProduction 
      ? `https://qudemo.com${currentPath}${currentSearch}${currentHash}`
      : `${window.location.origin}${currentPath}${currentSearch}${currentHash}`;
    
    console.log('🔍 DomainEnforcer: Redirecting to:', redirectUrl);
    
    // Use replace instead of href to prevent back button issues
    window.location.replace(redirectUrl);
    return true; // Indicates redirect was triggered
  }
  
  console.log('✅ DomainEnforcer: On correct domain, no redirect needed');
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
