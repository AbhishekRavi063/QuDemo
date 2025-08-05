// Video URL Processor for Custom Video Player
// This utility converts various video URLs to direct video URLs

export const processVideoUrl = (url) => {
  if (!url) return null;

  // YouTube URLs
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return convertYouTubeToDirectUrl(url);
  }

  // Loom URLs
  if (url.includes('loom.com')) {
    return convertLoomToDirectUrl(url);
  }

  // Vimeo URLs
  if (url.includes('vimeo.com')) {
    return convertVimeoToDirectUrl(url);
  }

  // Direct video URLs (mp4, webm, etc.)
  if (url.match(/\.(mp4|webm|ogg|mov|avi|mkv)$/i)) {
    return url;
  }

  // If we can't process it, return the original URL
  return url;
};

// Convert YouTube URL to direct video URL
const convertYouTubeToDirectUrl = (url) => {
  try {
    // Extract video ID
    let videoId = '';
    
    if (url.includes('youtube.com/watch')) {
      const urlParams = new URLSearchParams(url.split('?')[1]);
      videoId = urlParams.get('v');
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1].split('?')[0];
    } else if (url.includes('youtube.com/embed/')) {
      videoId = url.split('youtube.com/embed/')[1].split('?')[0];
    }

    if (videoId) {
      // Return embed URL with unmuted parameters
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&muted=0&enablejsapi=1&controls=1`;
    }
  } catch (error) {
    console.error('Error converting YouTube URL:', error);
  }
  
  return url;
};

// Convert Loom URL to direct video URL
const convertLoomToDirectUrl = (url) => {
  try {
    if (url.includes('loom.com/share/')) {
      // Extract video ID
      const videoId = url.split('loom.com/share/')[1].split('?')[0];
      if (videoId) {
        // Return Loom's embed URL with unmuted parameters
        return `https://www.loom.com/embed/${videoId}?autoplay=1&muted=0&hide_share=1&hide_title=1`;
      }
    }
  } catch (error) {
    console.error('Error converting Loom URL:', error);
  }
  
  return url;
};

// Convert Vimeo URL to direct video URL
const convertVimeoToDirectUrl = (url) => {
  try {
    if (url.includes('vimeo.com/')) {
      // Extract video ID
      const videoId = url.split('vimeo.com/')[1].split('?')[0];
      if (videoId) {
        // Return Vimeo's embed URL with unmuted parameters
        return `https://player.vimeo.com/video/${videoId}?autoplay=1&muted=0&controls=1`;
      }
    }
  } catch (error) {
    console.error('Error converting Vimeo URL:', error);
  }
  
  return url;
};

// Check if URL can be played by custom video player
export const canPlayWithCustomPlayer = (url) => {
  if (!url) return false;

  // Direct video files
  if (url.match(/\.(mp4|webm|ogg|mov|avi|mkv)$/i)) {
    return true;
  }

  // For now, we'll use iframe fallback for other sources
  return false;
};

// Get video type for appropriate player selection
export const getVideoType = (url) => {
  if (!url) return 'unknown';

  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return 'youtube';
  }

  if (url.includes('loom.com')) {
    return 'loom';
  }

  if (url.includes('vimeo.com')) {
    return 'vimeo';
  }

  if (url.match(/\.(mp4|webm|ogg|mov|avi|mkv)$/i)) {
    return 'direct';
  }

  return 'unknown';
}; 