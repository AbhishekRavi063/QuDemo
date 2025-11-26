import { useState, useRef, useEffect } from 'react';

export function useDemoVideo({ room, localAudioRef, log, setState }) {
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
      const onCanPlay = () => {
        log('DEMO', '✅ Video ready - attempting play', {
          videoWidth: demoVideo.videoWidth,
          videoHeight: demoVideo.videoHeight,
          clientWidth: demoVideo.clientWidth,
          clientHeight: demoVideo.clientHeight,
          offsetWidth: demoVideo.offsetWidth,
          offsetHeight: demoVideo.offsetHeight,
          readyState: demoVideo.readyState,
          duration: demoVideo.duration,
        });
        const playPromise = demoVideo.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              log('DEMO', '▶️ Demo video playing', {
                currentTime: demoVideo.currentTime,
                paused: demoVideo.paused,
                videoWidth: demoVideo.videoWidth,
                videoHeight: demoVideo.videoHeight,
              });
            })
            .catch((error) => {
              log('ERROR', 'Video play failed', {
                error: error.message,
                videoUrl: currentVideoUrl,
                readyState: demoVideo.readyState,
                networkState: demoVideo.networkState,
              });
              setIsDemoPlaying(false);
            });
        }
      };

      demoVideo.addEventListener('canplay', onCanPlay, { once: true });

      return () => {
        demoVideo.removeEventListener('canplay', onCanPlay);
      };
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

      // Clone avatar video to PIP container
      setTimeout(() => {
        const avatarContainer = document.getElementById('live-video-container');
        const pipContainer = document.getElementById('avatar-pip');

        if (avatarContainer && pipContainer) {
          const avatarVideos = avatarContainer.querySelectorAll('video');

          // Clone each video track
          avatarVideos.forEach((originalVideo) => {
            const clonedVideo = originalVideo.cloneNode(true);
            clonedVideo.style.width = '100%';
            clonedVideo.style.height = '100%';
            clonedVideo.style.objectFit = 'cover';
            clonedVideo.style.position = 'static';
            clonedVideo.style.border = 'none';
            clonedVideo.style.borderRadius = '0';

            // Copy the srcObject (MediaStream) from original to clone
            if (originalVideo.srcObject) {
              clonedVideo.srcObject = originalVideo.srcObject;
              clonedVideo.play().catch(e => {
                log('ERROR', 'Failed to play cloned avatar video', e);
              });
            }

            pipContainer.appendChild(clonedVideo);
          });

          log('DEMO', '✅ Avatar cloned to PIP');
        }
      }, 100);

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

      // Clear PIP container
      const pipContainer = document.getElementById('avatar-pip');
      if (pipContainer) {
        while (pipContainer.firstChild) {
          pipContainer.removeChild(pipContainer.firstChild);
        }
        log('DEMO', '🧹 PIP container cleared');
      }

      // Reset demo video
      const demoVideo = demoVideoRef.current;
      if (demoVideo) {
        demoVideo.pause();
        demoVideo.currentTime = 0;
        demoVideo.src = '';
      }

      log('DEMO', '✅ Demo video stopped');

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

