/**
 * ============================================================================
 * VIDEO CACHE MANAGER - IndexedDB Video Caching
 * ============================================================================
 * 
 * Stores entire video files in browser's IndexedDB for instant playback.
 * Videos load instantly after first download - even works offline!
 * 
 * Features:
 * - Stores videos as Blobs in IndexedDB
 * - Automatic cache management (size limits)
 * - Background downloading
 * - Instant playback from cache
 * 
 * ============================================================================
 */

const DB_NAME = 'QudemoVideoCache';
const DB_VERSION = 1;
const STORE_NAME = 'videos';
const MAX_CACHE_SIZE = 200 * 1024 * 1024; // 200MB cache limit

class VideoCache {
  constructor() {
    this.db = null;
    this.initPromise = this.initDB();
    this.downloadQueue = new Map();
  }

  /**
   * Initialize IndexedDB
   */
  async initDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('❌ IndexedDB failed to open');
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('✅ Video cache initialized');
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'url' });
          objectStore.createIndex('timestamp', 'timestamp', { unique: false });
          objectStore.createIndex('size', 'size', { unique: false });
          console.log('📦 Created video cache store');
        }
      };
    });
  }

  /**
   * Get video from cache or download
   */
  async getVideo(url) {
    try {
      await this.initPromise;
      
      // Try to get from cache first
      const cached = await this.getCachedVideo(url);
      if (cached) {
        console.log('⚡ Video loaded from cache (INSTANT):', url);
        return cached.blob;
      }

      // Not in cache - download and cache it
      console.log('📥 Downloading video to cache:', url);
      const blob = await this.downloadAndCache(url);
      return blob;

    } catch (error) {
      console.error('❌ Video cache error:', error);
      // Fallback to direct URL
      return url;
    }
  }

  /**
   * Get cached video
   */
  async getCachedVideo(url) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(url);

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /**
   * Download video and store in cache
   */
  async downloadAndCache(url) {
    // Check if already downloading
    if (this.downloadQueue.has(url)) {
      console.log('⏳ Video already downloading, waiting...');
      return this.downloadQueue.get(url);
    }

    // Start download
    const downloadPromise = this._performDownload(url);
    this.downloadQueue.set(url, downloadPromise);

    try {
      const blob = await downloadPromise;
      this.downloadQueue.delete(url);
      return blob;
    } catch (error) {
      this.downloadQueue.delete(url);
      throw error;
    }
  }

  /**
   * Perform actual download
   */
  async _performDownload(url) {
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const blob = await response.blob();
      console.log(`✅ Downloaded ${(blob.size / 1024 / 1024).toFixed(2)}MB:`, url);

      // Store in cache
      await this.storeVideo(url, blob);

      return blob;

    } catch (error) {
      console.error('❌ Download failed:', error);
      throw error;
    }
  }

  /**
   * Store video in IndexedDB
   */
  async storeVideo(url, blob) {
    // Check cache size limit
    const currentSize = await this.getCacheSize();
    if (currentSize + blob.size > MAX_CACHE_SIZE) {
      console.log('🗑️  Cache full, removing old videos...');
      await this.cleanOldVideos(blob.size);
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      const data = {
        url: url,
        blob: blob,
        size: blob.size,
        timestamp: Date.now(),
        type: blob.type
      };

      const request = store.put(data);

      request.onsuccess = () => {
        console.log('💾 Video cached successfully:', url);
        resolve();
      };

      request.onerror = () => {
        console.error('❌ Failed to cache video:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Preload video in background
   */
  async preloadVideo(url) {
    try {
      await this.initPromise;
      
      // Check if already cached
      const cached = await this.getCachedVideo(url);
      if (cached) {
        console.log('✅ Video already cached:', url);
        return true;
      }

      // Download in background
      console.log('🔄 Preloading video in background:', url);
      await this.downloadAndCache(url);
      return true;

    } catch (error) {
      console.warn('⚠️  Preload failed:', url, error);
      return false;
    }
  }

  /**
   * Get total cache size
   */
  async getCacheSize() {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const totalSize = request.result.reduce((sum, item) => sum + (item.size || 0), 0);
        resolve(totalSize);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /**
   * Clean old videos to make space
   */
  async cleanOldVideos(neededSpace) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('timestamp');
      const request = index.openCursor();

      let freedSpace = 0;

      request.onsuccess = (event) => {
        const cursor = event.target.result;
        
        if (cursor && freedSpace < neededSpace) {
          console.log('🗑️  Removing old video:', cursor.value.url);
          freedSpace += cursor.value.size || 0;
          cursor.delete();
          cursor.continue();
        } else {
          console.log(`✅ Freed ${(freedSpace / 1024 / 1024).toFixed(2)}MB`);
          resolve();
        }
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /**
   * Check if video is cached
   */
  async isCached(url) {
    try {
      await this.initPromise;
      const cached = await this.getCachedVideo(url);
      return !!cached;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get cache statistics
   */
  async getStats() {
    try {
      await this.initPromise;
      
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onsuccess = () => {
          const videos = request.result;
          const totalSize = videos.reduce((sum, v) => sum + (v.size || 0), 0);
          
          resolve({
            count: videos.length,
            totalSize: totalSize,
            totalSizeMB: (totalSize / 1024 / 1024).toFixed(2),
            maxSize: MAX_CACHE_SIZE,
            maxSizeMB: (MAX_CACHE_SIZE / 1024 / 1024).toFixed(2),
            percentUsed: ((totalSize / MAX_CACHE_SIZE) * 100).toFixed(1),
            videos: videos.map(v => ({
              url: v.url,
              sizeMB: (v.size / 1024 / 1024).toFixed(2),
              cached: new Date(v.timestamp).toLocaleString()
            }))
          });
        };

        request.onerror = () => {
          reject(request.error);
        };
      });
    } catch (error) {
      return null;
    }
  }

  /**
   * Clear all cached videos
   */
  async clearCache() {
    try {
      await this.initPromise;
      
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.clear();

        request.onsuccess = () => {
          console.log('🗑️  Cache cleared');
          resolve();
        };

        request.onerror = () => {
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('❌ Failed to clear cache:', error);
    }
  }

  /**
   * Preload multiple videos
   */
  async preloadMultiple(urls, onProgress) {
    const results = [];
    let completed = 0;

    for (const url of urls) {
      try {
        await this.preloadVideo(url);
        results.push({ url, success: true });
      } catch (error) {
        results.push({ url, success: false, error });
      }
      
      completed++;
      if (onProgress) {
        onProgress(completed, urls.length, url);
      }
    }

    return results;
  }
}

// Export singleton instance
const videoCache = new VideoCache();
export default videoCache;

/**
 * ============================================================================
 * USAGE EXAMPLE:
 * ============================================================================
 * 
 * import videoCache from './utils/videoCache';
 * 
 * // Get video (from cache or download)
 * const videoBlob = await videoCache.getVideo('https://.../video.mp4');
 * const blobUrl = URL.createObjectURL(videoBlob);
 * videoElement.src = blobUrl;
 * 
 * // Preload videos in background
 * await videoCache.preloadVideo('https://.../video_1.mp4');
 * await videoCache.preloadVideo('https://.../video_2.mp4');
 * 
 * // Check if cached
 * const isCached = await videoCache.isCached(videoUrl);
 * 
 * // Get cache stats
 * const stats = await videoCache.getStats();
 * console.log(`Cache: ${stats.totalSizeMB}MB / ${stats.maxSizeMB}MB (${stats.percentUsed}%)`);
 * 
 * ============================================================================
 */

