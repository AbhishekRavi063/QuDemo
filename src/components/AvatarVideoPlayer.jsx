import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";

/**
 * AvatarVideoPlayer Component
 *
 * Displays HeyGen-generated AI avatar videos for document-based answers.
 * Provides a modern video player with playback controls.
 */
const AvatarVideoPlayer = forwardRef(({ avatarVideoUrl, answer, isVisible, faqId, avatarVideoCache, isMaximized = false, onVideoEnd }, ref) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false); // Try unmuted first, fallback to muted if autoplay fails
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);

  // Expose pause and play methods to parent component
  useImperativeHandle(ref, () => ({
    pause: () => {
      if (videoRef.current && !videoRef.current.paused) {
        videoRef.current.pause();
      }
    },
    play: () => {
      if (videoRef.current && videoRef.current.paused) {
        videoRef.current.play().catch(err => console.log('Play prevented:', err));
      }
    },
    isPlaying: () => videoRef.current && !videoRef.current.paused
  }));

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Try unmuted autoplay first, fallback to muted if blocked
    if (isVisible && video.paused) {
      console.log('🎬 AvatarVideoPlayer: Attempting UNMUTED autoplay');
      video.muted = false; // Try unmuted first
      video
        .play()
        .then(() => {
          console.log('✅ AvatarVideoPlayer: UNMUTED autoplay successful!');
          setIsPlaying(true);
          setIsMuted(false);
        })
        .catch((err) => {
          console.warn("⚠️ Unmuted autoplay blocked, trying MUTED fallback:", err);
          // Fallback: try muted autoplay
          video.muted = true;
          video
            .play()
            .then(() => {
              console.log('✅ AvatarVideoPlayer: MUTED autoplay successful (fallback)');
              setIsPlaying(true);
              setIsMuted(true);
            })
            .catch((err2) => {
              console.error("❌ Both unmuted and muted autoplay failed:", err2);
            });
        });
    }

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setIsLoading(false);
    };

    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      // Call onVideoEnd callback if provided
      if (onVideoEnd && typeof onVideoEnd === 'function') {
        onVideoEnd(faqId);
      }
    };

    const handleError = (e) => {
      console.error("🎬 Avatar Video Error:", {
        error: e,
        videoUrl: avatarVideoUrl,
        encodedUrl: avatarVideoUrl?.replace(/ /g, "%20"),
        videoElement: videoRef.current,
      });
      setError(
        "Failed to load avatar video. Please check if the video is accessible.",
      );
      setIsLoading(false);
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("ended", handleEnded);
    video.addEventListener("error", handleError);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("error", handleError);
    };
  }, [isVisible]);

  const handleSeek = (e) => {
    const video = videoRef.current;
    if (!video) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    video.currentTime = pos * video.duration;
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <p className="text-red-600 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-black">
      {/* Video Player */}
      <div className="relative bg-black w-full h-full">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
              <p className="text-white mt-2 text-sm">Loading video...</p>
            </div>
          </div>
        )}

        <video
          ref={videoRef}
          className="w-full h-full"
          style={{ 
            objectFit: isMaximized ? 'contain' : 'cover',
            objectPosition: 'center'
          }}
          src={avatarVideoUrl.replace(/ /g, "%20")}
          autoPlay
          muted={isMuted}
          preload="auto"
          playsInline
          crossOrigin="anonymous"
        >
          Your browser does not support the video tag.
        </video>

        {/* Unmute Button - Shows when video is muted and playing */}
        {isMuted && isPlaying && !isLoading && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsMuted(false);
              if (videoRef.current) {
                videoRef.current.muted = false;
              }
              console.log('🔊 User unmuted avatar video');
            }}
            className="absolute top-4 right-4 bg-white/90 hover:bg-white text-gray-900 rounded-full p-3 shadow-lg z-30 transition-all hover:scale-110"
            title="Click to unmute"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            </svg>
          </button>
        )}


        {/* Minimal Overlay Controls - Bottom */}
        {!isLoading && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-4 opacity-0 hover:opacity-100 transition-opacity">
            {/* Progress Bar */}
            <div
              className="w-full h-1 bg-gray-600 rounded-full cursor-pointer mb-2"
              onClick={handleSeek}
            >
              <div
                className="h-full bg-white rounded-full"
                style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
              ></div>
            </div>

            {/* Controls Row */}
            <div className="flex items-center justify-between text-white text-sm">
              {/* Time */}
              <span className="font-mono text-xs">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>

              {/* AI Badge */}
              <span className="text-xs opacity-70">AI Avatar</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

AvatarVideoPlayer.displayName = 'AvatarVideoPlayer';

export default AvatarVideoPlayer;
