import React, { useState, useRef, useEffect } from 'react';
import { SpeakerWaveIcon, SpeakerXMarkIcon } from '@heroicons/react/24/outline';
import CustomVideoPlayer from './CustomVideoPlayer';
import { getVideoType, canPlayWithCustomPlayer } from '../utils/videoUrlProcessor';

const HybridVideoPlayer = ({ 
  url, 
  width = '100%', 
  height = '100%', 
  controls = true, 
  playing = true,
  startTime = 0,
  onReady,
  onPlay,
  onPause,
  onEnded,
  style = {},
  className = '',
  iframeRef
}) => {
  console.log('🎬 HybridVideoPlayer props:', { url, startTime, playing, controls });
  const [audioEnabled, setAudioEnabled] = useState(true); // Start with audio enabled
  const [hasUserInteracted, setHasUserInteracted] = useState(true); // Assume user has interacted
  const internalIframeRef = useRef(null);
  const videoType = getVideoType(url);
  const canUseCustomPlayer = canPlayWithCustomPlayer(url);
  
  // Use external iframeRef if provided, otherwise use internal one
  const currentIframeRef = iframeRef || internalIframeRef;

  // Function to enable audio after user interaction
  const enableAudio = () => {
    setAudioEnabled(true);
    setHasUserInteracted(true);
    
    // For iframe videos, try to send postMessage to enable audio
    if (currentIframeRef && currentIframeRef.contentWindow) {
      try {
        // Send unmute command to iframe
        currentIframeRef.contentWindow.postMessage({ type: 'unmute' }, '*');
        
        // For Loom videos, try specific commands
        if (videoType === 'loom') {
          currentIframeRef.contentWindow.postMessage({ 
            type: 'setVolume', 
            volume: 1.0 
          }, '*');
        }
        
        // For YouTube videos, try to unmute
        if (videoType === 'youtube') {
          currentIframeRef.contentWindow.postMessage({ 
            type: 'unmute' 
          }, '*');
        }
      } catch (error) {
        console.log('Could not send postMessage to iframe:', error);
      }
    }
  };

  // Handle iframe load
  const handleIframeLoad = () => {
    if (onReady) onReady();
    
    // Enable audio immediately after iframe loads
    setTimeout(() => {
      enableAudio();
    }, 500);

    // For Loom, let the parent component handle seeking to avoid conflicts
    if (videoType === 'loom' && currentIframeRef && startTime > 0) {
      console.log(`🎬 Loom iframe loaded, letting parent component handle seeking to ${startTime}s`);
      // Don't try to seek here - let VideoDemoChatPopup handle it
    }
    
    // Hide YouTube suggestions after iframe loads
    if (videoType === 'youtube') {
      setTimeout(() => {
        hideYouTubeSuggestions();
      }, 1000);
      
      // Set up periodic check to hide suggestions that might appear later
      const interval = setInterval(() => {
        hideYouTubeSuggestions();
      }, 2000);
      
      // Clear interval after 30 seconds
      setTimeout(() => {
        clearInterval(interval);
      }, 30000);
    }
  };

  // Function to hide YouTube suggestions
  const hideYouTubeSuggestions = () => {
    try {
      const iframe = currentIframeRef?.current;
      if (iframe && iframe.contentWindow) {
        // Try to access the iframe's document
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        if (iframeDoc) {
          // Hide all possible YouTube suggestion elements
          const selectors = [
            '.ytp-endscreen',
            '.ytp-endscreen-content',
            '.ytp-endscreen-preview',
            '.ytp-endscreen-element',
            '.ytp-endscreen-video',
            '.ytp-endscreen-playlist',
            '.ytp-endscreen-next',
            '.ytp-endscreen-previous',
            '.ytp-endscreen-close',
            '.ytp-endscreen-close-button',
            '.ytp-endscreen-close-icon',
            '.ytp-endscreen-close-svg',
            '.ytp-endscreen-close-path',
            '.ytp-endscreen-close-circle',
            '.ytp-endscreen-close-rect',
            '.ytp-endscreen-close-polygon',
            '.ytp-endscreen-close-line',
            '.ytp-endscreen-close-ellipse',
            '.ytp-endscreen-close-text',
            '.ytp-endscreen-close-tspan',
            '.ytp-endscreen-close-textpath',
            '.ytp-endscreen-close-clippath',
            '.ytp-endscreen-close-defs',
            '.ytp-endscreen-close-g',
            '.ytp-endscreen-close-svg',
            '.ytp-endscreen-close-use',
            '.ytp-endscreen-close-image',
            '.ytp-endscreen-close-pattern',
            '.ytp-endscreen-close-mask',
            '.ytp-endscreen-close-marker',
            '.ytp-endscreen-close-symbol',
            '.ytp-endscreen-close-view',
            '.ytp-endscreen-close-animate',
            '.ytp-endscreen-close-animateTransform',
            '.ytp-endscreen-close-animateMotion',
            '.ytp-endscreen-close-set',
            '.ytp-endscreen-close-discard',
            '.ytp-endscreen-close-switch',
            '.ytp-endscreen-close-foreignObject',
            '.ytp-endscreen-close-mpath'
          ];
          
          selectors.forEach(selector => {
            const elements = iframeDoc.querySelectorAll(selector);
            elements.forEach(element => {
              element.style.display = 'none';
              element.style.visibility = 'hidden';
              element.style.opacity = '0';
              element.style.height = '0';
              element.style.width = '0';
              element.style.overflow = 'hidden';
            });
          });
          
          console.log('🎬 YouTube suggestions hidden via JavaScript');
        }
      }
    } catch (error) {
      console.log('🎬 Could not access iframe content to hide suggestions:', error);
    }
  };

          // Handle timestamp changes
  useEffect(() => {
    console.log(`🎬 HybridVideoPlayer: startTime prop changed to ${startTime}s (type: ${typeof startTime})`);
    if (startTime > 0 && currentIframeRef) {
      console.log(`🎬 Timestamp changed to ${startTime}s, updating video position`);
      
      // For YouTube videos, we need to reload the iframe with the new timestamp
      if (videoType === 'youtube') {
        const currentSrc = currentIframeRef.src;
        const newSrc = getEmbedUrl(); // This will include the new startTime
        if (currentSrc !== newSrc) {
          console.log(`🎬 Reloading YouTube iframe with new timestamp: ${startTime}s`);
          currentIframeRef.src = newSrc;
          
          // Also try to seek after a short delay to ensure the iframe is loaded
          setTimeout(() => {
            if (currentIframeRef.contentWindow) {
              try {
                currentIframeRef.contentWindow.postMessage({
                  type: 'seekTo',
                  seconds: Math.floor(startTime)
                }, '*');
                console.log(`🎬 Sent seekTo message for YouTube: ${startTime}s`);
              } catch (e) {
                console.log('🎬 Could not send seekTo message to YouTube iframe:', e);
              }
            }
          }, 1000);
        }
        
        // Additional YouTube-specific seeking - try multiple methods
        setTimeout(() => {
          if (currentIframeRef.contentWindow) {
            try {
              // Method 1: postMessage with seekTo
              currentIframeRef.contentWindow.postMessage({
                type: 'seekTo',
                seconds: Math.floor(startTime)
              }, '*');
              
              // Method 2: postMessage with seek
              currentIframeRef.contentWindow.postMessage({
                type: 'seek',
                seconds: Math.floor(startTime)
              }, '*');
              
              // Method 3: postMessage with time
              currentIframeRef.contentWindow.postMessage({
                type: 'time',
                seconds: Math.floor(startTime)
              }, '*');
              
              // Method 4: YouTube Player API commands
              currentIframeRef.contentWindow.postMessage({
                event: 'command',
                func: 'seekTo',
                args: [Math.floor(startTime), true]
              }, '*');
              
              // Method 5: Direct function call
              currentIframeRef.contentWindow.postMessage({
                event: 'command',
                func: 'playVideo'
              }, '*');
              
              console.log(`🎬 Sent multiple seek messages for YouTube: ${startTime}s`);
            } catch (e) {
              console.log('🎬 Could not send seek messages to YouTube iframe:', e);
            }
          }
        }, 2000);
        
        // Method 6: Try to inject YouTube Player API script for direct control
        setTimeout(() => {
          try {
            const iframeWindow = currentIframeRef.contentWindow;
            if (iframeWindow && iframeWindow.document) {
              // Inject YouTube Player API script
              const script = iframeWindow.document.createElement('script');
              script.src = 'https://www.youtube.com/iframe_api';
              script.onload = () => {
                console.log('🎬 YouTube Player API script loaded');
                // Try to seek using the API
                if (iframeWindow.YT && iframeWindow.YT.Player) {
                  console.log('🎬 YouTube Player API available, attempting to seek');
                }
              };
              iframeWindow.document.head.appendChild(script);
            }
          } catch (e) {
            console.log('🎬 Could not inject YouTube Player API script:', e);
          }
        }, 3000);
      }
      
      // For Loom videos, reload the iframe with the new timestamp
      if (videoType === 'loom') {
        const currentSrc = currentIframeRef.src;
        const newSrc = getEmbedUrl(); // This will include the new startTime
        if (currentSrc !== newSrc) {
          console.log(`🎬 Reloading Loom iframe with new timestamp: ${startTime}s`);
          currentIframeRef.src = newSrc;
          
          // Also try to seek after a short delay to ensure the iframe is loaded
          setTimeout(() => {
            if (currentIframeRef.contentWindow) {
              try {
                currentIframeRef.contentWindow.postMessage({
                  method: 'seekTo',
                  value: Math.floor(startTime)
                }, '*');
                console.log(`🎬 Sent seekTo message for Loom: ${startTime}s`);
              } catch (e) {
                console.log('🎬 Could not send seekTo message to Loom iframe:', e);
              }
            }
          }, 1000);
        }
      }
      
      // For Vimeo videos, we need to reload the iframe with the new timestamp
      if (videoType === 'vimeo') {
        const currentSrc = currentIframeRef.src;
        const newSrc = getEmbedUrl(); // This will include the new startTime
        if (currentSrc !== newSrc) {
          console.log(`🎬 Reloading Vimeo iframe with new timestamp: ${startTime}s`);
          currentIframeRef.src = newSrc;
        }
      }
    }
  }, [startTime, videoType, url]);

  // Handle playing prop changes - force play when playing becomes true
  useEffect(() => {
    console.log(`🎬 HybridVideoPlayer: playing prop changed to ${playing}`);
    if (playing && currentIframeRef && currentIframeRef.contentWindow) {
      console.log(`🎬 Forcing video to play due to playing prop change`);
      
      // For YouTube videos, send play command
      if (videoType === 'youtube') {
        try {
          // Method 1: YouTube Player API commands
          currentIframeRef.contentWindow.postMessage({
            event: 'command',
            func: 'playVideo'
          }, '*');
          
          // Method 2: Generic play message
          currentIframeRef.contentWindow.postMessage({
            type: 'play'
          }, '*');
          
          console.log(`🎬 Sent play commands for YouTube`);
        } catch (e) {
          console.log('🎬 Could not send play message to YouTube iframe:', e);
        }
      }
      
      // For Loom videos, send play command
      if (videoType === 'loom') {
        try {
          currentIframeRef.contentWindow.postMessage({
            method: 'play'
          }, '*');
          
          console.log(`🎬 Sent play command for Loom`);
        } catch (e) {
          console.log('🎬 Could not send play message to Loom iframe:', e);
        }
      }
      
      // For Vimeo videos, send play command
      if (videoType === 'vimeo') {
        try {
          currentIframeRef.contentWindow.postMessage({
            method: 'play'
          }, '*');
          
          console.log(`🎬 Sent play command for Vimeo`);
        } catch (e) {
          console.log('🎬 Could not send play message to Vimeo iframe:', e);
        }
      }
    }
  }, [playing, videoType]);

  // Convert URL to embed format with audio parameters
  const getEmbedUrl = () => {
    if (!url) return '';

    switch (videoType) {
      case 'youtube':
        // Extract video ID and create embed URL
        let videoId = '';
        if (url.includes('youtube.com/watch')) {
          const urlParams = new URLSearchParams(url.split('?')[1]);
          videoId = urlParams.get('v');
        } else if (url.includes('youtu.be/')) {
          videoId = url.split('youtu.be/')[1].split('?')[0];
        }
        if (!videoId) return url;
        
        // Ensure startTime is properly formatted for YouTube
        const ytStart = startTime && startTime > 0 ? `&start=${Math.floor(startTime)}` : '';
        const autoplay = playing ? '1' : '0';
        // Use YouTube nocookie domain for better control and no suggestions
        const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=${autoplay}&muted=0&enablejsapi=1&controls=1&rel=0&modestbranding=1&version=3&playerapiid=ytplayer&iv_load_policy=3&fs=0&cc_load_policy=0&disablekb=1&playsinline=1&showinfo=0&loop=0&end=0&start=${Math.floor(startTime) || 0}&wmode=opaque&origin=${window.location.origin}&widget_referrer=${window.location.origin}&html5=1&vq=hd720&disable_polymer=1&no_https=1&hl=en&cc_lang_pref=en&cc_load_policy=0&iv_load_policy=3&fs=0&rel=0&showinfo=0&modestbranding=1&playsinline=1&enablejsapi=1&origin=${window.location.origin}&widget_referrer=${window.location.origin}&html5=1&vq=hd720${ytStart}`;
        
        console.log(`🎬 YouTube embed URL: autoplay=${autoplay}, startTime=${startTime}, playing=${playing}`);
        
        console.log(`🎬 Generated YouTube embed URL with startTime ${startTime}s:`, embedUrl);
        console.log(`🎬 startTime value: ${startTime}, Type: ${typeof startTime}, Truthy: ${!!startTime}, > 0: ${startTime > 0}`);
        return embedUrl;

      case 'loom':
        // Convert Loom share URL to embed URL with enhanced API support
        if (url.includes('loom.com/share/')) {
          const videoId = url.split('loom.com/share/')[1].split('?')[0];
          
          // Extract existing query parameters (like timestamp)
          const urlParams = new URLSearchParams(url.split('?')[1] || '');
          const existingTimestamp = urlParams.get('t');
          
          // Build base embed URL with parameters
          const autoplay = playing ? '1' : '0';
          let embedUrl = `https://www.loom.com/embed/${videoId}?autoplay=${autoplay}&hide_share=1&hide_title=1&muted=0&enablejsapi=1&allowfullscreen=1&showinfo=0&controls=1&rel=0`;
          
          console.log(`🎬 Loom embed URL: autoplay=${autoplay}, startTime=${startTime}, playing=${playing}`);
          
          // Add timestamp - prioritize startTime prop over existing URL timestamp
          const timestampToUse = startTime && startTime > 0 ? Math.floor(startTime) : existingTimestamp;
          if (timestampToUse) {
            embedUrl += `&t=${timestampToUse}`;
            console.log(`🎬 Loom embed URL with timestamp: ${timestampToUse}s`);
          }
          
          return embedUrl;
        }
        return url;

      case 'vimeo':
        // Convert Vimeo URL to embed URL
        if (url.includes('vimeo.com/')) {
          const videoId = url.split('vimeo.com/')[1].split('?')[0];
          const vimeoTime = startTime && startTime > 0 ? `#t=${Math.floor(startTime)}s` : '';
          const autoplay = playing ? '1' : '0';
          const embedUrl = videoId ? `https://player.vimeo.com/video/${videoId}?autoplay=${autoplay}&muted=0&controls=1${vimeoTime}` : url;
          
          console.log(`🎬 Vimeo embed URL: autoplay=${autoplay}, startTime=${startTime}, playing=${playing}`);
          return embedUrl;
        }
        return url;

      default:
        return url;
    }
  };

  // Handle user interaction
  const handleUserInteraction = () => {
    if (!hasUserInteracted) {
      enableAudio();
    }
  };

  // If we can use custom player, use it
  if (canUseCustomPlayer) {
    return (
      <div 
        className={`relative ${className}`}
        style={{ width, height, ...style }}
        onClick={handleUserInteraction}
      >
        <CustomVideoPlayer
          url={url}
          width="100%"
          height="100%"
          controls={controls}
          playing={playing}
          startTime={startTime}
          onReady={onReady}
          onPlay={onPlay}
          onPause={onPause}
          onEnded={onEnded}
        />
        
        {/* Audio Status Indicator */}
        {!hasUserInteracted && (
          <div className="absolute top-4 left-4 bg-yellow-500 text-white px-3 py-1 rounded-lg text-sm font-medium z-20">
            🔊 Click to enable audio
          </div>
        )}
      </div>
    );
  }

  // Otherwise, use iframe with audio controls
  return (
    <div 
      className={`relative ${className}`}
      style={{ width, height, ...style }}
      onClick={videoType === 'loom' ? undefined : handleUserInteraction}
    >
      {/* Audio Toggle Button */}
      <button
        className="absolute top-4 left-4 bg-white text-gray-900 hover:text-blue-500 rounded-full p-2 shadow-lg z-10"
        onClick={(e) => {
          e.stopPropagation();
          enableAudio();
        }}
        title={audioEnabled ? "Audio Enabled" : "Click to Enable Audio"}
      >
        {audioEnabled ? (
          <SpeakerWaveIcon className="h-6 w-6 text-green-600" />
        ) : (
          <SpeakerXMarkIcon className="h-6 w-6 text-red-600" />
        )}
      </button>

      {/* Iframe Video */}
      <iframe
        key={`${url}-${startTime}-${playing}`} // Force re-render when URL, timestamp, or playing state changes
        ref={currentIframeRef}
        src={getEmbedUrl()}
        frameBorder="0"
        webkitallowfullscreen
        mozallowfullscreen
        allowFullScreen
        title={`${videoType} Video Player`}
        style={{ width: '100%', height: '100%', borderRadius: '0.5rem' }}
        onLoad={handleIframeLoad}
        allow="autoplay; encrypted-media"
      />

      {/* Video Type Indicator */}
      <div className="absolute top-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-xs">
        {videoType.toUpperCase()}
      </div>
    </div>
  );
};

export default HybridVideoPlayer; 