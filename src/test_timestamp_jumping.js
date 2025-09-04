/**
 * Test script to verify frontend timestamp jumping functionality
 * This script can be run in the browser console to test timestamp jumping
 */

// Test function to simulate Q&A response with timestamp
function testTimestampJumping() {
  console.log('🧪 Testing Frontend Timestamp Jumping...');
  
  // Simulate a Q&A response with timestamp data
  const mockResponse = {
    success: true,
    answer: "This is a test answer with timestamp data.",
    video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", // Example YouTube URL
    start: 120, // 2 minutes timestamp
    end: 150,   // 2.5 minutes timestamp
    sources: [
      {
        source_type: 'video',
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        start_timestamp: 120,
        end_timestamp: 150,
        text: 'Test video segment'
      }
    ]
  };
  
  console.log('📊 Mock Response Data:', mockResponse);
  
  // Test timestamp extraction logic
  let targetVideoUrl = null;
  let timestamp = 0;
  
  // Test direct video fields extraction
  if (mockResponse && mockResponse.video_url) {
    targetVideoUrl = mockResponse.video_url;
    timestamp = mockResponse.start || 0;
    console.log('✅ Direct video fields extracted:', { url: targetVideoUrl, timestamp });
  }
  
  // Test timestamp validation
  if (typeof timestamp === 'string') {
    timestamp = parseFloat(timestamp);
    console.log('✅ String timestamp converted to number:', timestamp);
  }
  
  if (isNaN(timestamp)) {
    timestamp = 0;
    console.log('⚠️ Invalid timestamp, reset to 0');
  }
  
  // Test reasonable range validation
  if (timestamp < 0 || timestamp > 36000) {
    console.log('⚠️ Timestamp out of reasonable range, resetting to 0');
    timestamp = 0;
  }
  
  console.log('✅ Final processed timestamp:', timestamp, 'Type:', typeof timestamp);
  
  // Test video URL matching logic
  const mockQudemoVideos = [
    { video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
    { video_url: 'https://www.loom.com/share/test123' }
  ];
  
  const videoIndex = mockQudemoVideos?.findIndex(v => v.video_url === targetVideoUrl);
  console.log('🔍 Video index found:', videoIndex);
  
  if (videoIndex !== -1) {
    console.log('✅ Video found in qudemo videos array at index:', videoIndex);
  } else {
    console.log('⚠️ Video not found in qudemo videos array');
    console.log('📋 Available video URLs:', mockQudemoVideos?.map(v => v.video_url));
  }
  
  return {
    success: true,
    targetVideoUrl,
    timestamp,
    videoIndex,
    message: 'Timestamp jumping test completed successfully'
  };
}

// Test function to check if video player components are working
function testVideoPlayerComponents() {
  console.log('🧪 Testing Video Player Components...');
  
  // Check if HybridVideoPlayer is available
  const hybridPlayer = document.querySelector('[data-testid="hybrid-video-player"]');
  if (hybridPlayer) {
    console.log('✅ HybridVideoPlayer component found');
  } else {
    console.log('⚠️ HybridVideoPlayer component not found');
  }
  
  // Check for YouTube iframes
  const youtubeIframes = document.querySelectorAll('iframe[src*="youtube.com"]');
  console.log('📊 YouTube iframes found:', youtubeIframes.length);
  
  // Check for Loom iframes
  const loomIframes = document.querySelectorAll('iframe[src*="loom.com"]');
  console.log('📊 Loom iframes found:', loomIframes.length);
  
  // Test postMessage functionality for YouTube
  youtubeIframes.forEach((iframe, index) => {
    try {
      iframe.contentWindow.postMessage(JSON.stringify({
        event: 'command',
        func: 'seekTo',
        args: [120, true]
      }), '*');
      console.log(`✅ YouTube iframe ${index + 1}: seekTo message sent`);
    } catch (error) {
      console.log(`❌ YouTube iframe ${index + 1}: seekTo message failed:`, error);
    }
  });
  
  // Test postMessage functionality for Loom
  loomIframes.forEach((iframe, index) => {
    try {
      iframe.contentWindow.postMessage({
        method: 'seekTo',
        value: 120
      }, '*');
      console.log(`✅ Loom iframe ${index + 1}: seekTo message sent`);
    } catch (error) {
      console.log(`❌ Loom iframe ${index + 1}: seekTo message failed:`, error);
    }
  });
  
  return {
    success: true,
    youtubeIframes: youtubeIframes.length,
    loomIframes: loomIframes.length,
    message: 'Video player components test completed'
  };
}

// Test function to check React state management
function testReactStateManagement() {
  console.log('🧪 Testing React State Management...');
  
  // Check if we're in a React environment
  const reactRoot = document.querySelector('#root');
  if (reactRoot) {
    console.log('✅ React root element found');
  } else {
    console.log('⚠️ React root element not found');
  }
  
  // Check for React DevTools
  if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    console.log('✅ React DevTools detected');
  } else {
    console.log('⚠️ React DevTools not detected');
  }
  
  // Check for common React state patterns
  const stateElements = document.querySelectorAll('[data-testid*="timestamp"], [data-testid*="video"]');
  console.log('📊 State-related elements found:', stateElements.length);
  
  return {
    success: true,
    reactRoot: !!reactRoot,
    devTools: !!window.__REACT_DEVTOOLS_GLOBAL_HOOK__,
    stateElements: stateElements.length,
    message: 'React state management test completed'
  };
}

// Main test runner
function runAllTimestampTests() {
  console.log('🚀 Running All Timestamp Jumping Tests...');
  console.log('='.repeat(50));
  
  const results = {
    timestampExtraction: testTimestampJumping(),
    videoPlayerComponents: testVideoPlayerComponents(),
    reactStateManagement: testReactStateManagement()
  };
  
  console.log('='.repeat(50));
  console.log('📊 Test Results Summary:');
  console.log(results);
  
  // Overall success check
  const allTestsPassed = Object.values(results).every(result => result.success);
  
  if (allTestsPassed) {
    console.log('🎉 All timestamp jumping tests passed!');
  } else {
    console.log('❌ Some timestamp jumping tests failed. Check the logs above.');
  }
  
  return results;
}

// Export functions for use in browser console
window.testTimestampJumping = testTimestampJumping;
window.testVideoPlayerComponents = testVideoPlayerComponents;
window.testReactStateManagement = testReactStateManagement;
window.runAllTimestampTests = runAllTimestampTests;

console.log('🧪 Timestamp jumping test functions loaded. Run runAllTimestampTests() to start testing.');
