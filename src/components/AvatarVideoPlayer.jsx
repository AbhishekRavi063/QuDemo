import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";

/**
 * AvatarVideoPlayer Component
 *
 * Displays HeyGen-generated AI avatar videos for document-based answers.
 * Provides a modern video player with playback controls.
 */
const AvatarVideoPlayer = forwardRef(({ avatarVideoUrl, answer, isVisible, faqId, avatarVideoCache, isMaximized = false, onVideoEnd }, ref) => {
  const [isPlaying, setIsPlaying] = useState(false);
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

    // Auto-play when visible
    if (isVisible && video.paused) {
      video
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((err) => {
          console.error("Autoplay failed:", err);
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
          className={`w-full h-full ${isMaximized ? 'object-contain' : 'object-cover'}`}
          src={avatarVideoUrl.replace(/ /g, "%20")}
          autoPlay
          muted={false}
          preload="auto"
          playsInline
          crossOrigin="anonymous"
        >
          Your browser does not support the video tag.
        </video>


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
