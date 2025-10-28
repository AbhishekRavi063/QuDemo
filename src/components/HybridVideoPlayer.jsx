import React, { useState, useRef, useEffect } from 'react';
import { SpeakerWaveIcon, SpeakerXMarkIcon } from '@heroicons/react/24/outline';
import ReactPlayer from 'react-player';
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

  const [audioEnabled, setAudioEnabled] = useState(true); // Start with audio enabled
  const [hasUserInteracted, setHasUserInteracted] = useState(true); // Assume user has interacted
  const internalIframeRef = useRef(null);
  const reactPlayerRef = useRef(null); // For ReactPlayer (YouTube)
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

      // Don't try to seek here - let VideoDemoChatPopup handle it
    }
    
    // For YouTube, no need for CSS hiding (using embed parameters instead)
  };



  // Handle timestamp changes for ReactPlayer (YouTube)
  useEffect(() => {
    if (startTime > 0 && videoType === 'youtube' && reactPlayerRef.current) {
      // For YouTube with ReactPlayer, seek directly
      reactPlayerRef.current.seekTo(startTime, 'seconds');
    }
  }, [startTime, videoType]);

  // OLD iframe timestamp handling (for non-YouTube videos)
  useEffect(() => {

    if (startTime > 0 && currentIframeRef && videoType !== 'youtube') {

      // For YouTube videos, skip (handled by ReactPlayer above)
      if (videoType === 'youtube') {
        const currentSrc = currentIframeRef.src;
        const newSrc = getEmbedUrl(); // This will include the new startTime
        if (currentSrc !== newSrc) {

          currentIframeRef.src = newSrc;
          
          // Also try to seek after a short delay to ensure the iframe is loaded
          setTimeout(() => {
            if (currentIframeRef.contentWindow) {
              try {
                currentIframeRef.contentWindow.postMessage({
                  type: 'seekTo',
                  seconds: Math.floor(startTime)
                }, '*');

              } catch (e) {

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

            } catch (e) {

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

                // Try to seek using the API
                if (iframeWindow.YT && iframeWindow.YT.Player) {

                }
              };
              iframeWindow.document.head.appendChild(script);
            }
          } catch (e) {

          }
        }, 3000);
      }
      
      // For Loom videos, reload the iframe with the new timestamp
      if (videoType === 'loom') {
        const currentSrc = currentIframeRef.src;
        const newSrc = getEmbedUrl(); // This will include the new startTime
        if (currentSrc !== newSrc) {

          currentIframeRef.src = newSrc;
          
          // Also try to seek after a short delay to ensure the iframe is loaded
          setTimeout(() => {
            if (currentIframeRef.contentWindow) {
              try {
                currentIframeRef.contentWindow.postMessage({
                  method: 'seekTo',
                  value: Math.floor(startTime)
                }, '*');

              } catch (e) {

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

          currentIframeRef.src = newSrc;
        }
      }
    }
  }, [startTime, videoType, url]);

  // Handle playing prop changes - force play when playing becomes true
  useEffect(() => {

    if (playing && currentIframeRef && currentIframeRef.contentWindow) {

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

        } catch (e) {

        }
      }
      
      // For Loom videos, send play command
      if (videoType === 'loom') {
        try {
          currentIframeRef.contentWindow.postMessage({
            method: 'play'
          }, '*');

        } catch (e) {

        }
      }
      
      // For Vimeo videos, send play command
      if (videoType === 'vimeo') {
        try {
          currentIframeRef.contentWindow.postMessage({
            method: 'play'
          }, '*');

        } catch (e) {

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
        const ytStart = startTime && startTime > 0 ? Math.floor(startTime) : 0;
        const autoplay = playing ? '1' : '0';
        
        // CUSTOM YOUTUBE PLAYER - NO SUGGESTIONS, NO THUMBNAILS
        // Key parameters:
        // - rel=0: Only show related videos from same channel (not perfect but best we can do)
        // - modestbranding=1: Minimal YouTube branding
        // - fs=1: Allow fullscreen
        // - controls: Show/hide player controls based on controls prop
        // - playsinline=1: Play inline on mobile
        // - enablejsapi=1: Enable JavaScript API for seeking
        const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?` +
          `autoplay=${autoplay}&` +
          `start=${ytStart}&` +
          `rel=0&` +              // Don't show related videos from other channels
          `modestbranding=1&` +   // Minimal branding
          `controls=${controls ? 1 : 0}&` +         // Show/hide controls based on prop
          `fs=1&` +               // Allow fullscreen
          `playsinline=1&` +      // Play inline on mobile
          `enablejsapi=1&` +      // Enable JS API
          `origin=${encodeURIComponent(window.location.origin)}&` +
          `widget_referrer=${encodeURIComponent(window.location.origin)}`;

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
          let embedUrl = `https://www.loom.com/embed/${videoId}?autoplay=${autoplay}&hide_share=1&hide_title=1&muted=0&enablejsapi=1&allowfullscreen=1&showinfo=0&controls=${controls ? 1 : 0}&rel=0`;

          // Add timestamp - prioritize startTime prop over existing URL timestamp
          const timestampToUse = startTime && startTime > 0 ? Math.floor(startTime) : existingTimestamp;
          if (timestampToUse) {
            embedUrl += `&t=${timestampToUse}`;

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
          const embedUrl = videoId ? `https://player.vimeo.com/video/${videoId}?autoplay=${autoplay}&muted=0&controls=${controls ? 1 : 0}${vimeoTime}` : url;

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

  // For YouTube, use ReactPlayer with custom end screen overlay
  if (videoType === 'youtube') {
    return (
      <div 
        className={`relative ${className}`}
        style={{ width, height, ...style }}
        onClick={handleUserInteraction}
      >
        <ReactPlayer
          ref={reactPlayerRef}
          url={url}
          width="100%"
          height="100%"
          controls={controls}
          playing={playing}
          volume={1.0}
          muted={false}
          config={{
            youtube: {
              playerVars: {
                autoplay: playing ? 1 : 0,
                controls: controls ? 1 : 0,
                modestbranding: 1,
                rel: 0,
                showinfo: 0,
                fs: 1,
                playsinline: 1,
                start: Math.floor(startTime) || 0
              }
            }
          }}
          onReady={() => {
            if (onReady) onReady();
            // Seek to start time after ready
            if (startTime > 0 && reactPlayerRef.current) {
              reactPlayerRef.current.seekTo(startTime, 'seconds');
            }
          }}
          onPlay={() => {
            if (onPlay) onPlay();
          }}
          onPause={() => {
            if (onPause) onPause();
          }}
          onEnded={() => {
            // For video call experience - just pause on last frame, don't show overlay
            // The video will freeze on the last frame naturally
            if (onEnded) onEnded();
          }}
        />


        {/* Video Type Indicator */}
        <div className="absolute top-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-xs z-10">
          YOUTUBE (Custom Player)
        </div>
      </div>
    );
  }

  // For Loom and other videos, use iframe
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
