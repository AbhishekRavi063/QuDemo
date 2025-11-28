// Domain enforcer to prevent Vercel domain redirects
export const enforceCustomDomain = () => {
  const currentHost = window.location.host;

  // Only redirect the main production Vercel domain (qu-demo.vercel.app)
  // Allow preview/branch deployments to work normally
  if (currentHost === 'qu-demo.vercel.app') {
    // Preserve the current path and query parameters
    const currentPath = window.location.pathname;
    const currentSearch = window.location.search;
    const currentHash = window.location.hash;

    // Redirect to custom domain
    const redirectUrl = `https://qudemo.com${currentPath}${currentSearch}${currentHash}`;

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
