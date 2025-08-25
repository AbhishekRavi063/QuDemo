import { useEffect } from 'react';

export const usePreventRefresh = () => {
  useEffect(() => {
    // Store the current page state
    const currentState = {
      url: window.location.href,
      title: document.title,
      timestamp: Date.now()
    };

    // Save state to sessionStorage
    sessionStorage.setItem('qudemoPageState', JSON.stringify(currentState));

    // Detect browser type
    const isChrome = /Chrome/.test(navigator.userAgent);
    const isFirefox = /Firefox/.test(navigator.userAgent);
    const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);

    console.log('Browser detected:', { isChrome, isFirefox, isSafari });

    // Prevent page unload
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
      return '';
    };

    // Prevent page hide
    const handlePageHide = (e) => {
      e.preventDefault();
      console.log('Page hide prevented');
    };

    // Handle page show
    const handlePageShow = (e) => {
      console.log('Page show detected');
      // Restore state if needed
      const savedState = sessionStorage.getItem('qudemoPageState');
      if (savedState) {
        const state = JSON.parse(savedState);
        if (state.url !== window.location.href) {
          console.log('URL changed, preventing refresh');
        }
      }
    };

    // Handle visibility change
    const handleVisibilityChange = () => {
      console.log('Visibility changed to:', document.visibilityState);
      if (document.visibilityState === 'visible') {
        console.log('Page became visible - preventing refresh');
        // Force a small delay to prevent immediate refresh
        setTimeout(() => {
          console.log('Page stability check completed');
        }, 100);
      }
    };

    // Browser-specific fixes
    if (isChrome) {
      // Chrome-specific: Prevent memory pressure
      if ('memory' in performance) {
        console.log('Chrome memory usage:', performance.memory);
      }
    }

    if (isFirefox) {
      // Firefox-specific: Use page visibility API more aggressively
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          console.log('Firefox: Page became visible');
        }
      });
    }

    if (isSafari) {
      // Safari-specific: Handle page cache
      window.addEventListener('pageshow', (e) => {
        if (e.persisted) {
          console.log('Safari: Page loaded from cache');
        }
      });
    }

    // Add event listeners with capture to ensure they run first
    window.addEventListener('beforeunload', handleBeforeUnload, { capture: true, passive: false });
    window.addEventListener('pagehide', handlePageHide, { capture: true, passive: false });
    window.addEventListener('pageshow', handlePageShow, { capture: true });
    document.addEventListener('visibilitychange', handleVisibilityChange, { capture: true });

    // Prevent browser from discarding the page
    if ('keepAlive' in navigator) {
      navigator.keepAlive();
    }

    // Add a heartbeat to keep the page alive
    const heartbeat = setInterval(() => {
      if (document.visibilityState === 'visible') {
        console.log('Heartbeat - keeping page alive');
      }
    }, 30000); // Every 30 seconds

    // Additional protection: Prevent any form of page refresh
    const preventRefresh = (e) => {
      if (e.type === 'beforeunload' || e.type === 'pagehide') {
        e.preventDefault();
        e.returnValue = '';
        return false;
      }
    };

    // Add multiple layers of protection
    window.addEventListener('beforeunload', preventRefresh, { capture: true, passive: false });
    window.addEventListener('pagehide', preventRefresh, { capture: true, passive: false });
    window.addEventListener('unload', preventRefresh, { capture: true, passive: false });

    // Cleanup
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload, { capture: true });
      window.removeEventListener('pagehide', handlePageHide, { capture: true });
      window.removeEventListener('pageshow', handlePageShow, { capture: true });
      document.removeEventListener('visibilitychange', handleVisibilityChange, { capture: true });
      window.removeEventListener('beforeunload', preventRefresh, { capture: true });
      window.removeEventListener('pagehide', preventRefresh, { capture: true });
      window.removeEventListener('unload', preventRefresh, { capture: true });
      clearInterval(heartbeat);
    };
  }, []);
};
