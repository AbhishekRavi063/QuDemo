import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_NODE_BACKEND_URL || 'http://localhost:5000';

/**
 * VideoGenerationProgress Component
 * Displays real-time progress of HeyGen avatar video generation
 */
const VideoGenerationProgress = ({ qudemoId, status, onComplete }) => {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isPolling, setIsPolling] = useState(false);

  // Fetch progress from backend
  const fetchProgress = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('accessToken'); // Fixed: use 'accessToken' not 'token'
      const response = await axios.get(
        `${API_URL}/api/qudemos/video-progress/${qudemoId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setProgress(response.data.data);
        
        // If completed, notify parent and stop polling
        if (response.data.data.status === 'completed') {
          setIsPolling(false);
          if (onComplete) {
            onComplete();
          }
        }
      }
    } catch (err) {
      // Silently ignore 404 errors (demo QuDemos or unauthorized access)
      if (err.response?.status === 404) {
        console.log('⚠️ QuDemo not found or unauthorized - likely a demo QuDemo');
        setIsPolling(false); // Stop polling
        return;
      }
      console.error('Error fetching video generation progress:', err);
      setError(err.response?.data?.error || 'Failed to fetch progress');
    } finally {
      setLoading(false);
    }
  };

  // Poll for progress updates
  useEffect(() => {
    if (status === 'processing' || status === 'pending') {
      setIsPolling(true);
      fetchProgress();
      
      // Poll every 10 seconds
      const interval = setInterval(() => {
        fetchProgress();
      }, 10000);

      return () => clearInterval(interval);
    } else if (status === 'completed') {
      fetchProgress(); // Fetch once to get final data
    }
  }, [qudemoId, status]);

  // Don't render anything if not started
  if (!status || status === 'not_started') {
    return null;
  }

  // Render error state
  if (error) {
    return (
      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-600">
        ⚠️ {error}
      </div>
    );
  }

  // Render loading state
  if (loading && !progress) {
    return (
      <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500"></div>
          <span className="text-xs text-blue-600">Loading progress...</span>
        </div>
      </div>
    );
  }

  // Calculate progress percentage
  const progressPercentage = progress?.progress?.percentage || 0;
  const completed = progress?.progress?.completed || 0;
  const total = progress?.progress?.total || 0;
  const estimatedTime = progress?.progress?.estimated_time_remaining || 0;

  // Format estimated time
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
      message: 'Queued for processing'
    },
    processing: {
      color: 'blue',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-700',
      progressColor: 'bg-blue-500',
      icon: '🎬',
      message: 'Generating avatar videos'
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

  const config = statusConfig[status] || statusConfig.processing;

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
        {status === 'processing' && (
          <div className="flex items-center space-x-1">
            <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {status !== 'completed' && status !== 'failed' && (
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
          {estimatedTime > 0 && (
            <div className={`mt-1 text-xs ${config.textColor} opacity-75`}>
              ⏱️ Est. time remaining: {formatTime(estimatedTime)}
            </div>
          )}
        </>
      )}

      {/* Completed State */}
      {status === 'completed' && (
        <div className="text-xs text-green-600 font-medium">
          🎉 {total} avatar videos are ready to use
        </div>
      )}

      {/* Failed State */}
      {status === 'failed' && (
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

