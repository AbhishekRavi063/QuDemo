/**
 * QuDemo Service Worker - Video Caching Strategy
 * Caches avatar videos for instant playback
 */

const CACHE_VERSION = 'qudemo-v1';
const VIDEO_CACHE = `qudemo-videos-${CACHE_VERSION}`;
const API_CACHE = `qudemo-api-${CACHE_VERSION}`;

// Maximum cache size (100MB)
const MAX_CACHE_SIZE = 100 * 1024 * 1024;

// Install event - setup cache
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Installing...');
  event.waitUntil(
    Promise.all([
      caches.open(VIDEO_CACHE),
      caches.open(API_CACHE)
    ]).then(() => {
      console.log('✅ Service Worker: Caches created');
      self.skipWaiting(); // Activate immediately
    })
  );
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  console.log('🔧 Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name.startsWith('qudemo-') && !name.includes(CACHE_VERSION))
          .map(name => {
            console.log('🗑️ Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => {
      console.log('✅ Service Worker: Activated');
      return self.clients.claim(); // Take control immediately
    })
  );
});

// Fetch event - intercept network requests
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Strategy 1: Cache avatar videos from GCS (Cache First)
  if (url.hostname.includes('googleapis.com') || url.hostname.includes('storage.googleapis.com')) {
    event.respondWith(
      caches.open(VIDEO_CACHE).then(cache => {
        return cache.match(event.request).then(response => {
          if (response) {
            console.log('✅ Cache HIT (video):', url.pathname.substring(0, 50));
            return response;
          }
          
          console.log('⏳ Cache MISS (video) - Downloading:', url.pathname.substring(0, 50));
          return fetch(event.request).then(fetchResponse => {
            // Only cache successful responses
            if (fetchResponse && fetchResponse.status === 200) {
              cache.put(event.request, fetchResponse.clone());
              console.log('📥 Cached video:', url.pathname.substring(0, 50));
              
              // Check cache size and cleanup if needed
              checkCacheSizeAndCleanup(cache);
            }
            return fetchResponse;
          });
        });
      })
    );
    return;
  }
  
  // Strategy 2: Cache Q&A API responses (Network First with Cache Fallback)
  if (url.pathname.includes('/ask/')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Cache successful API responses
          if (response && response.status === 200) {
            caches.open(API_CACHE).then(cache => {
              cache.put(event.request, response.clone());
            });
          }
          return response;
        })
        .catch(() => {
          // Network failed, try cache
          return caches.match(event.request).then(cachedResponse => {
            if (cachedResponse) {
              console.log('✅ Using cached API response (offline)');
              return cachedResponse;
            }
            return new Response(
              JSON.stringify({ error: 'Network unavailable and no cached response' }),
              { status: 503, headers: { 'Content-Type': 'application/json' } }
            );
          });
        })
    );
    return;
  }
  
  // Default: Network only for other requests
  event.respondWith(fetch(event.request));
});

// Cleanup old cached videos when cache size exceeds limit
async function checkCacheSizeAndCleanup(cache) {
  const requests = await cache.keys();
  let totalSize = 0;
  const entries = [];
  
  // Calculate total cache size
  for (const request of requests) {
    const response = await cache.match(request);
    const blob = await response.blob();
    totalSize += blob.size;
    entries.push({
      request,
      size: blob.size,
      url: request.url
    });
  }
  
  console.log(`📊 Video cache size: ${(totalSize / 1024 / 1024).toFixed(2)}MB`);
  
  // If over limit, remove oldest entries
  if (totalSize > MAX_CACHE_SIZE) {
    console.log('⚠️ Cache size exceeded, cleaning up...');
    
    // Sort by URL (oldest first - simple heuristic)
    entries.sort((a, b) => a.url.localeCompare(b.url));
    
    // Remove 20% of oldest entries
    const toRemove = Math.ceil(entries.length * 0.2);
    for (let i = 0; i < toRemove; i++) {
      await cache.delete(entries[i].request);
      console.log('🗑️ Removed old video from cache');
    }
  }
}

// Message event - handle commands from main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      Promise.all([
        caches.delete(VIDEO_CACHE),
        caches.delete(API_CACHE)
      ]).then(() => {
        console.log('🗑️ All caches cleared');
        event.ports[0].postMessage({ success: true });
      })
    );
  }
  
  if (event.data && event.data.type === 'GET_CACHE_SIZE') {
    event.waitUntil(
      caches.open(VIDEO_CACHE).then(async (cache) => {
        const requests = await cache.keys();
        let totalSize = 0;
        
        for (const request of requests) {
          const response = await cache.match(request);
          const blob = await response.blob();
          totalSize += blob.size;
        }
        
        event.ports[0].postMessage({
          size: totalSize,
          count: requests.length,
          sizeMB: (totalSize / 1024 / 1024).toFixed(2)
        });
      })
    );
  }
});

console.log('🚀 QuDemo Service Worker loaded');

