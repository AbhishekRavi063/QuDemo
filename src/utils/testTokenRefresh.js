// Test utility for token refresh functionality
import { refreshAccessToken } from './tokenRefresh';

export const testTokenRefresh = async () => {
  console.log('🧪 Testing token refresh functionality...');
  
  try {
    const result = await refreshAccessToken();
    
    if (result.success) {
      console.log('✅ Token refresh test PASSED');
      console.log('🔄 New access token received:', result.accessToken ? 'Yes' : 'No');
      return true;
    } else {
      console.log('❌ Token refresh test FAILED');
      console.log('📝 Error:', result.error);
      return false;
    }
  } catch (error) {
    console.error('❌ Token refresh test ERROR:', error);
    return false;
  }
};

// Export for use in browser console
window.testTokenRefresh = testTokenRefresh;
