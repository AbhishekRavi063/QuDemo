/**
 * Video Cache Utility
 * Handles caching of video metadata and preloading for better performance
 */

class VideoCache {
  constructor() {
    this.cache = new Map();
    this.preloadedVideos = new Set();
    this.maxCacheSize = 50; // Maximum number of videos to cache
  }

  /**
   * Generate cache key from video URL
   */
  getCacheKey(url, startTime = 0) {
    return `${url}_${startTime}`;
  }

  /**
   * Cache video metadata
   */
  cacheVideo(url, metadata = {}) {
    const key = this.getCacheKey(url);
    this.cache.set(key, {
      url,
      metadata,
      cachedAt: Date.now(),
      ...metadata
    });

    // Remove oldest entries if cache is full
    if (this.cache.size > this.maxCacheSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
  }

  /**
   * Get cached video metadata
   */
  getCachedVideo(url, startTime = 0) {
    const key = this.getCacheKey(url, startTime);
    return this.cache.get(key);
  }

  /**
   * Check if video is cached
   */
  isVideoCached(url, startTime = 0) {
    return this.cache.has(this.getCacheKey(url, startTime));
  }

  /**
   * Preload video by creating a hidden iframe
   */
  preloadVideo(url, startTime = 0) {
    const key = this.getCacheKey(url, startTime);
    
    if (this.preloadedVideos.has(key)) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      try {
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.style.position = 'absolute';
        iframe.style.left = '-9999px';
        iframe.style.width = '1px';
        iframe.style.height = '1px';
        
        // Generate embed URL based on video type
        const embedUrl = this.generateEmbedUrl(url, startTime, false);
        iframe.src = embedUrl;
        
        iframe.onload = () => {
          this.preloadedVideos.add(key);
          this.cacheVideo(url, { preloaded: true, preloadedAt: Date.now() });
          resolve();
        };
        
        iframe.onerror = () => {
          reject(new Error(`Failed to preload video: ${url}`));
        };
        
        document.body.appendChild(iframe);
        
        // Clean up after a delay
        setTimeout(() => {
          if (iframe.parentNode) {
            iframe.parentNode.removeChild(iframe);
          }
        }, 10000); // Remove after 10 seconds
        
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Generate embed URL for different video platforms
   */
  generateEmbedUrl(url, startTime = 0, autoplay = false) {
    if (!url) return '';
    
    const videoType = this.getVideoType(url);
    
    switch (videoType) {
      case 'youtube':
        return this.generateYouTubeEmbedUrl(url, startTime, autoplay);
      case 'loom':
        return this.generateLoomEmbedUrl(url, startTime, autoplay);
      case 'vimeo':
        return this.generateVimeoEmbedUrl(url, startTime, autoplay);
      default:
        return url;
    }
  }

  /**
   * Generate YouTube embed URL
   */
  generateYouTubeEmbedUrl(url, startTime = 0, autoplay = false) {
    let videoId = '';
    if (url.includes('youtube.com/watch')) {
      const urlParams = new URLSearchParams(url.split('?')[1]);
      videoId = urlParams.get('v');
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1].split('?')[0];
    }
    
    if (!videoId) return url;
    
    const autoplayParam = autoplay ? '1' : '0';
    const startParam = startTime > 0 ? `&start=${Math.floor(startTime)}` : '';
    
    return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=${autoplayParam}&muted=0&enablejsapi=1&controls=1&rel=0&modestbranding=1&playsinline=1&showinfo=0${startParam}`;
  }

  /**
   * Generate Loom embed URL
   */
  generateLoomEmbedUrl(url, startTime = 0, autoplay = false) {
    if (url.includes('loom.com/share/')) {
      const videoId = url.split('loom.com/share/')[1].split('?')[0];
      const autoplayParam = autoplay ? '1' : '0';
      const timestampParam = startTime > 0 ? `&t=${Math.floor(startTime)}` : '';
      
      return `https://www.loom.com/embed/${videoId}?autoplay=${autoplayParam}&hide_share=1&hide_title=1&muted=0${timestampParam}`;
    }
    return url;
  }

  /**
   * Generate Vimeo embed URL
   */
  generateVimeoEmbedUrl(url, startTime = 0, autoplay = false) {
    if (url.includes('vimeo.com/')) {
      const videoId = url.split('vimeo.com/')[1].split('?')[0];
      const autoplayParam = autoplay ? '1' : '0';
      const timestampParam = startTime > 0 ? `#t=${Math.floor(startTime)}s` : '';
      
      return `https://player.vimeo.com/video/${videoId}?autoplay=${autoplayParam}&muted=0&controls=1${timestampParam}`;
    }
    return url;
  }

  /**
   * Get video type from URL
   */
  getVideoType(url) {
    if (!url) return 'unknown';
    
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return 'youtube';
    } else if (url.includes('loom.com')) {
      return 'loom';
    } else if (url.includes('vimeo.com')) {
      return 'vimeo';
    }
    
    return 'unknown';
  }

  /**
   * Preload multiple videos
   */
  async preloadVideos(videoUrls, startTimes = []) {
    const preloadPromises = videoUrls.map((url, index) => {
      const startTime = startTimes[index] || 0;
      return this.preloadVideo(url, startTime);
    });

    try {
      await Promise.allSettled(preloadPromises);
    } catch (error) {
      console.warn('Some videos failed to preload:', error);
    }
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
    this.preloadedVideos.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      cachedVideos: this.cache.size,
      preloadedVideos: this.preloadedVideos.size,
      maxCacheSize: this.maxCacheSize
    };
  }
}

// Create singleton instance
const videoCache = new VideoCache();

export default videoCache;
