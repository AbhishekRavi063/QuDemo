import React, { useState, useEffect } from 'react';

/**
 * VideoGenerationProgress Component
 * Displays a 10-minute timer-based progress bar for video generation
 */
const VideoGenerationProgress = ({ qudemoId, status, onComplete, onProgressUpdate }) => {
  const [timerProgress, setTimerProgress] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [error, setError] = useState(null);

  const TOTAL_DURATION_MS = 10 * 60 * 1000; // 10 minutes in milliseconds

  // Start timer when status is processing or pending
  useEffect(() => {
    if (status === 'processing' || status === 'pending') {
      if (!startTime) {
        setStartTime(Date.now());
      }
      
      // Update progress every 100ms for smooth animation
      const interval = setInterval(() => {
        const elapsed = Date.now() - (startTime || Date.now());
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
        
        // If 10 minutes passed, mark as completed
        if (percentage >= 100 && onComplete) {
          onComplete();
        }
      }, 100); // Update every 100ms

      return () => clearInterval(interval);
    } else if (status === 'completed') {
      setTimerProgress(100);
    }
  }, [status, startTime, onProgressUpdate, onComplete]);

  // Reset timer when qudemoId changes
  useEffect(() => {
    setStartTime(null);
    setTimerProgress(0);
  }, [qudemoId]);
  
  // Use status prop directly
  const currentStatus = status;

  // Don't render anything if not started
  if (!status || status === 'not_started') {
    return null;
  }

  // Calculate progress values based on timer
  const progressPercentage = timerProgress;
  const completed = Math.floor((timerProgress / 100) * 10);
  const total = 10;
  
  // Calculate remaining time based on timer
  const elapsedMs = startTime ? Date.now() - startTime : 0;
  const remainingMs = Math.max(0, TOTAL_DURATION_MS - elapsedMs);
  const remainingSeconds = Math.floor(remainingMs / 1000);

  // Format time remaining
  const formatTime = (seconds) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  // Status colors and messages
  const statusConfig = {
    pending: {
      color: 'yellow',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-700',
      progressColor: 'bg-yellow-500',
      icon: '⏳',
      message: 'Starting video generation...'
    },
    processing: {
      color: 'blue',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-700',
      progressColor: 'bg-blue-500',
      icon: '🎬',
      message: 'Generating avatar videos (Est. ~10 min)'
    },
    completed: {
      color: 'green',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-700',
      progressColor: 'bg-green-500',
      icon: '✅',
      message: 'All videos ready!'
    },
    failed: {
      color: 'red',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-700',
      progressColor: 'bg-red-500',
      icon: '❌',
      message: 'Generation failed'
    }
  };

  const config = statusConfig[currentStatus] || statusConfig.processing;

  return (
    <div className={`p-3 ${config.bgColor} border-b ${config.borderColor} bg-opacity-95`}>
      {/* Status Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className="text-base">{config.icon}</span>
          <span className={`text-xs font-semibold ${config.textColor}`}>
            {config.message}
          </span>
        </div>
        {currentStatus === 'processing' && (
          <div className="flex items-center space-x-1">
            <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {currentStatus !== 'completed' && currentStatus !== 'failed' && (
        <>
          <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
            <div
              className={`absolute top-0 left-0 h-full ${config.progressColor} transition-all duration-500 ease-out`}
              style={{ width: `${progressPercentage}%` }}
            >
              {/* Animated shimmer effect */}
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shimmer"></div>
            </div>
          </div>

          {/* Progress Stats */}
          <div className="flex items-center justify-between text-xs">
            <span className={`${config.textColor} font-medium`}>
              {completed} / {total} videos
            </span>
            <span className={`${config.textColor}`}>
              {progressPercentage.toFixed(0)}%
            </span>
          </div>

          {/* Estimated Time */}
          {remainingSeconds > 0 && currentStatus === 'processing' && (
            <div className={`mt-1 text-xs ${config.textColor} opacity-75`}>
              ⏱️ Est. time remaining: {formatTime(remainingSeconds)}
            </div>
          )}
        </>
      )}

      {/* Completed State */}
      {currentStatus === 'completed' && (
        <div className="text-xs text-green-600 font-medium">
          🎉 {total} avatar videos are ready to use
        </div>
      )}

      {/* Failed State */}
      {currentStatus === 'failed' && (
        <div className="text-xs text-red-600">
          Some videos failed to generate. Please try regenerating.
        </div>
      )}
    </div>
  );
};

export default VideoGenerationProgress;

// Add shimmer animation CSS (add this to your global CSS or index.css)
/*
@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.animate-shimmer {
  animation: shimmer 2s infinite;
}
*/

