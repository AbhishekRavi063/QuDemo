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
        const ytStart = startTime && startTime > 0 ? `&start=${Math.floor(startTime)}` : '';
        return `https://www.youtube.com/embed/${videoId}?autoplay=1&muted=0&enablejsapi=1&controls=1${ytStart}`;

      case 'loom':
        // Convert Loom share URL to embed URL with enhanced API support
        if (url.includes('loom.com/share/')) {
          const videoId = url.split('loom.com/share/')[1].split('?')[0];
          
          // Extract existing query parameters (like timestamp)
          const urlParams = new URLSearchParams(url.split('?')[1] || '');
          const timestamp = urlParams.get('t');
          
          // Build base embed URL with parameters
          let embedUrl = `https://www.loom.com/embed/${videoId}?autoplay=1&hide_share=1&hide_title=1&muted=0&enablejsapi=1&allowfullscreen=1&showinfo=0&controls=1&rel=0`;
          
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
          return videoId ? `https://player.vimeo.com/video/${videoId}?autoplay=1&muted=0&controls=1${vimeoTime}` : url;
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