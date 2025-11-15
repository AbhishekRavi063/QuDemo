import React, { useState, useEffect } from 'react';

/**
 * VideoGenerationProgress Component
 * Displays a 10-minute timer-based progress bar for video generation
 * Progress is calculated from qudemo creation time, not component mount time
 */
const VideoGenerationProgress = ({ qudemoId, status, createdAt, onComplete, onProgressUpdate }) => {
  const [timerProgress, setTimerProgress] = useState(0);
  const [hasCalledComplete, setHasCalledComplete] = useState(false);

  const TOTAL_DURATION_MS = 10 * 60 * 1000; // 10 minutes in milliseconds

  // Calculate start time from createdAt prop (qudemo creation time)
  const startTime = createdAt ? new Date(createdAt).getTime() : Date.now();

  // Update timer based on qudemo creation time
  useEffect(() => {
    if (status === 'processing' || status === 'pending') {
      // Update progress every 100ms for smooth animation
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const percentage = Math.min((elapsed / TOTAL_DURATION_MS) * 100, 100);
        
        setTimerProgress(percentage);
        
        // Notify parent of progress update
        if (onProgressUpdate) {
          onProgressUpdate({
            status: percentage >= 100 ? 'completed' : 'processing',
            progress: {
              percentage: percentage,
              completed: Math.floor((percentage / 100) * 10),
              total: 10
            }
          });
        }
        
        // If 10 minutes passed, mark as completed (only once)
        if (percentage >= 100 && onComplete && !hasCalledComplete) {
          setHasCalledComplete(true);
          onComplete();
        }
      }, 100); // Update every 100ms

      return () => clearInterval(interval);
    } else if (status === 'completed') {
      setTimerProgress(100);
    }
  }, [status, startTime, onProgressUpdate, onComplete, hasCalledComplete]);

  // Reset progress and completion flag when qudemoId changes
  useEffect(() => {
    setTimerProgress(0);
    setHasCalledComplete(false);
  }, [qudemoId]);

  // Don't render anything if not started
  if (!status || status === 'not_started') {
    return null;
  }

  // Calculate progress values based on timer
  const progressPercentage = timerProgress;
  
  // Calculate remaining time based on qudemo creation time
  const elapsedMs = Date.now() - startTime;
  const remainingMs = Math.max(0, TOTAL_DURATION_MS - elapsedMs);
  const remainingSeconds = Math.floor(remainingMs / 1000);

  // Format time remaining
  const formatTime = (seconds) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center px-8 bg-black bg-opacity-30 z-30">
      <div className="w-full max-w-sm">
        {/* Simple Progress Bar */}
        <div className="relative w-full h-3 bg-white rounded-full overflow-hidden shadow-lg border-2 border-white">
          <div
            className="absolute top-0 left-0 h-full bg-blue-500 transition-all duration-300 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {/* Time Below */}
        <div className="mt-4 text-center text-base text-white font-semibold drop-shadow-lg">
          {remainingSeconds > 0 ? formatTime(remainingSeconds) : 'Almost ready...'}
        </div>
      </div>
    </div>
  );
};

export default VideoGenerationProgress;

