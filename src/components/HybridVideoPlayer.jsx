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
      
      // For Loom videos, the parent component handles seeking
      if (videoType === 'loom') {
        console.log(`🎬 Loom timestamp changed to ${startTime}s, parent will handle seeking`);
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
        // Use YouTube Player API v2 for better timestamp control
        const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=${autoplay}&muted=0&enablejsapi=1&controls=1&rel=0&modestbranding=1&version=3&playerapiid=ytplayer${ytStart}`;
        
        console.log(`🎬 Generated YouTube embed URL with startTime ${startTime}s:`, embedUrl);
        console.log(`🎬 startTime value: ${startTime}, Type: ${typeof startTime}, Truthy: ${!!startTime}, > 0: ${startTime > 0}`);
        return embedUrl;

      case 'loom':
        // Convert Loom share URL to embed URL with enhanced API support
        if (url.includes('loom.com/share/')) {
          const videoId = url.split('loom.com/share/')[1].split('?')[0];
          
          // Extract existing query parameters (like timestamp)
          const urlParams = new URLSearchParams(url.split('?')[1] || '');
          const timestamp = urlParams.get('t');
          
          // Build base embed URL with parameters
          const autoplay = playing ? '1' : '0';
          let embedUrl = `https://www.loom.com/embed/${videoId}?autoplay=${autoplay}&hide_share=1&hide_title=1&muted=0&enablejsapi=1&allowfullscreen=1&showinfo=0&controls=1&rel=0`;
          
          // Add timestamp back if it exists
          if (timestamp) {
            embedUrl += `&t=${timestamp}`;
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
          return videoId ? `https://player.vimeo.com/video/${videoId}?autoplay=${autoplay}&muted=0&controls=1${vimeoTime}` : url;
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