import { useState, useRef, useEffect } from 'react';

export function useDemoVideo({ room, localAudioRef, log }) {
  const [isDemoPlaying, setIsDemoPlaying] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState('');
  const demoVideoRef = useRef(null);

  // Effect to handle video loading when demo starts playing
  useEffect(() => {
    if (isDemoPlaying && currentVideoUrl && demoVideoRef.current) {
      const demoVideo = demoVideoRef.current;
      log('DEMO', '📹 Setting video source', { videoUrl: currentVideoUrl });

      demoVideo.src = currentVideoUrl;
      demoVideo.load();

      // Wait for video to be ready before playing
      demoVideo.addEventListener('loadeddata', () => {
        log('DEMO', '✅ Video loaded - attempting play');
      }, { once: true });

      const playPromise = demoVideo.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            log('DEMO', '▶️ Demo video playing');
          })
          .catch((error) => {
            log('ERROR', 'Video play failed', { error: error.message, videoUrl: currentVideoUrl });
            setIsDemoPlaying(false);
          });
      }
    }
  }, [isDemoPlaying, currentVideoUrl, log]);

  const playDemoVideo = (videoUrl) => {
    if (isDemoPlaying) {
      log('DEMO', 'Demo already playing');
      return;
    }

    try {
      log('DEMO', '🎬 Starting demo video playback', { videoUrl });

      // Pause microphone
      if (room && localAudioRef.current) {
        log('DEMO', '🎤 Pausing microphone during demo');
        room.localParticipant.setMicrophoneEnabled(false);
      }

      // Shrink avatar video to small overlay in bottom-right corner
      const container = document.getElementById('live-video-container');
      if (container) {
        const videoElements = container.querySelectorAll('video');
        videoElements.forEach(video => {
          video.style.position = 'absolute';
          video.style.bottom = '80px';
          video.style.right = '20px';
          video.style.width = '200px';
          video.style.height = 'auto';
          video.style.maxWidth = '200px';
          video.style.borderRadius = '8px';
          video.style.objectFit = 'contain';
          video.style.border = '2px solid rgba(255, 255, 255, 0.8)';
          video.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.6)';
          video.style.zIndex = '10';
          video.style.transition = 'all 0.5s ease';
        });
      }

      // Set state to trigger video loading in useEffect
      setCurrentVideoUrl(videoUrl);
      setIsDemoPlaying(true);

    } catch (e) {
      log('ERROR', 'Failed to start demo video', e);
      setIsDemoPlaying(false);
    }
  };

  const stopDemoVideo = () => {
    try {
      log('DEMO', '⏹️ Stopping demo video');
      setIsDemoPlaying(false);
      setCurrentVideoUrl('');

      // Resume microphone
      if (room && localAudioRef.current) {
        log('DEMO', '🎤 Resuming microphone after demo');
        room.localParticipant.setMicrophoneEnabled(true);
      }

      // Restore avatar video to normal size
      const container = document.getElementById('live-video-container');
      if (container) {
        const videoElements = container.querySelectorAll('video');
        videoElements.forEach(video => {
          video.style.position = 'static';
          video.style.width = '100%';
          video.style.height = '100%';
          video.style.maxWidth = '100%';
          video.style.border = 'none';
          video.style.borderRadius = '0';
          video.style.objectFit = 'contain';
          video.style.background = '#000';
          video.style.zIndex = 'auto';
        });
      }

      // Reset demo video
      const demoVideo = demoVideoRef.current;
      if (demoVideo) {
        demoVideo.pause();
        demoVideo.currentTime = 0;
        demoVideo.src = '';
      }

      log('DEMO', '✅ Demo video stopped - avatar restored');

    } catch (e) {
      log('ERROR', 'Failed to stop demo video', e);
    }
  };

  return {
    isDemoPlaying,
    currentVideoUrl,
    demoVideoRef,
    playDemoVideo,
    stopDemoVideo,
  };
}

