// Test utility for token refresh functionality
import { refreshAccessToken } from './tokenRefresh';

export const testTokenRefresh = async () => {
  try {
    const result = await refreshAccessToken();
    
    if (result.success) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error('❌ Token refresh test ERROR:', error);
    return false;
  }
};

// Export for use in browser console
window.testTokenRefresh = testTokenRefresh;
