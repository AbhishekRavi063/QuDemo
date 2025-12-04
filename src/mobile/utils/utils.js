/**
 * Mobile Detection Utility
 *
 * Determines if the current device is a mobile device based on:
 * 1. User agent string (iOS/Android devices)
 * 2. Screen width (<=768px)
 */
export function isMobileDevice() {
  // Check user agent for mobile devices
  const isMobileUserAgent = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  // Check screen width
  const isMobileWidth = window.innerWidth <= 768;

  // Device is mobile if BOTH conditions are true
  return isMobileUserAgent && isMobileWidth;
}

/**
 * Get current device type for debugging
 */
export function getDeviceInfo() {
  return {
    userAgent: navigator.userAgent,
    width: window.innerWidth,
    height: window.innerHeight,
    isMobile: isMobileDevice(),
  };
}
