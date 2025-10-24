import React, { useState, useRef, useEffect } from 'react';
import { XMarkIcon, ChevronDownIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

const FloatingQudemoWidget = ({ 
  position = 'bottom-right',
  previewImage = null,
  previewText = "Watch Demo"
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [videoFlow, setVideoFlow] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [currentTimestamp, setCurrentTimestamp] = useState(0);
  const [suggestedQuestions, setSuggestedQuestions] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [videoThumbnail, setVideoThumbnail] = useState(null);
  const [videoEnded, setVideoEnded] = useState(false);
  const videoPlayerRef = useRef(null);

  // Position classes
  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6'
  };

  // Load video thumbnail on mount (for preview)
  useEffect(() => {
    loadVideoThumbnail();
  }, []);

  // Load full data when expanded
  useEffect(() => {
    if (isExpanded && !videoFlow && !loading) {
      loadBetaVersionData();
    }
  }, [isExpanded]);

  // Update video when currentVideoIndex changes
  useEffect(() => {
    if (videoPlayerRef.current && videoFlow?.videos[currentVideoIndex]) {
      const video = videoFlow.videos[currentVideoIndex];
      
      console.log('📹 Loading video:', video.title);
      console.log('📝 Subtitle URL:', video.subtitle);
      
      // Reset video ended state
      setVideoEnded(false);
      
      videoPlayerRef.current.src = video.url || video.src;
      videoPlayerRef.current.currentTime = currentTimestamp;
      videoPlayerRef.current.load();
      
      // Load subtitles after video is ready
      videoPlayerRef.current.addEventListener('loadedmetadata', () => {
        if (video.subtitle) {
          console.log('✅ Loading subtitles:', video.subtitle);
          loadSubtitles(video.subtitle);
        }
      }, { once: true });
      
      // Auto-play
      videoPlayerRef.current.addEventListener('canplay', () => {
        videoPlayerRef.current.play().catch((err) => {
          console.log('Autoplay prevented:', err);
        });
      }, { once: true });

      // Handle video ended - hide subtitles and show questions
      videoPlayerRef.current.addEventListener('ended', () => {
        console.log('🎬 Video ended - showing questions');
        setVideoEnded(true);
        
        // Hide subtitles when video ends
        if (videoPlayerRef.current && videoPlayerRef.current.textTracks) {
          for (let i = 0; i < videoPlayerRef.current.textTracks.length; i++) {
            videoPlayerRef.current.textTracks[i].mode = 'disabled';
          }
        }
      }, { once: true });
    }
  }, [currentVideoIndex, videoFlow]);

  const loadVideoThumbnail = async () => {
    try {
      const response = await fetch('/video-flow.json');
      const data = await response.json();
      
      if (data.videos && data.videos.length > 0) {
        const firstVideo = data.videos[0];
        const videoUrl = firstVideo.src || firstVideo.url;
        
        // Priority: 1. Thumbnail field, 2. YouTube thumbnail, 3. Video element capture
        if (firstVideo.thumbnail || firstVideo.poster || firstVideo.preview) {
          setVideoThumbnail(firstVideo.thumbnail || firstVideo.poster || firstVideo.preview);
        } else if (videoUrl) {
          // Check if it's a YouTube video
          const ytThumbnail = getYouTubeThumbnail(videoUrl);
          if (ytThumbnail) {
            setVideoThumbnail(ytThumbnail);
          } else {
            // For direct video files (MP4), capture a frame
            captureVideoFrame(videoUrl);
          }
        }
      }
    } catch (error) {
      console.log('Could not load video thumbnail, using default');
    }
  };

  const getYouTubeThumbnail = (videoUrl) => {
    if (!videoUrl) return null;
    
    // Extract YouTube video ID and get thumbnail
    const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/;
    const match = videoUrl.match(youtubeRegex);
    
    if (match && match[1]) {
      return `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg`;
    }
    
    return null;
  };

  const captureVideoFrame = (videoUrl) => {
    // Create a hidden video element to capture a frame
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.src = videoUrl;
    video.currentTime = 2; // Capture frame at 2 seconds
    
    video.addEventListener('loadeddata', () => {
      try {
        // Create canvas to draw video frame
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 320;
        canvas.height = video.videoHeight || 180;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert to data URL
        const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.8);
        setVideoThumbnail(thumbnailUrl);
        
        // Clean up
        video.remove();
      } catch (error) {
        console.log('Could not capture video frame:', error);
        // Use previewImage fallback
      }
    });
    
    video.addEventListener('error', () => {
      console.log('Video load error, using fallback');
      video.remove();
    });
  };

  const loadBetaVersionData = async () => {
    try {
      setLoading(true);
      
      // Load video flow from static file
      const videoFlowResponse = await fetch('/video-flow.json');
      const videoFlowData = await videoFlowResponse.json();
      
      console.log('✅ Beta version data loaded:', videoFlowData.videos?.length, 'videos');
      setVideoFlow(videoFlowData);
      
      // Extract suggested questions from video flow
      const questions = [];
      if (videoFlowData.videos && videoFlowData.videos.length > 0) {
        // Get questions from the intro video (first video)
        const introVideo = videoFlowData.videos[0];
        if (introVideo.nextQuestions) {
          introVideo.nextQuestions.forEach(q => {
            if (q.text && !questions.includes(q.text)) {
              questions.push(q.text);
            }
          });
        }
        
        // If we need more questions, get from other videos
        if (questions.length < 6) {
          videoFlowData.videos.forEach(video => {
            if (video.nextQuestions && questions.length < 6) {
              video.nextQuestions.forEach(q => {
                if (q.text && !questions.includes(q.text) && questions.length < 6) {
                  questions.push(q.text);
                }
              });
            }
          });
        }
      }
      
      setSuggestedQuestions(questions.slice(0, 6));
      
    } catch (error) {
      console.error('Failed to load beta version data:', error);
      
      // Fallback mock data if file not found
      setVideoFlow({
        videos: [
          {
            id: 'intro',
            url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            title: 'Product Demo',
            nextQuestions: [
              { text: 'What is QuDemo?' },
              { text: 'How does it work?' },
              { text: 'What are the features?' },
              { text: 'How much does it cost?' }
            ]
          }
        ]
      });
      
      setSuggestedQuestions([
        'What is QuDemo?',
        'How does it work?',
        'What are the features?',
        'How much does it cost?'
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestedQuestionClick = (question) => {
    // Reset video ended state when clicking a question
    setVideoEnded(false);
    
    // Add user message
    setChatMessages(prev => [...prev, { type: 'user', text: question }]);
    setIsTyping(true);

    // Find matching video in video flow
    const matchResult = matchQuestion(question);
    
    setTimeout(() => {
      if (matchResult.matched && matchResult.videoIndex !== null) {
        const video = videoFlow.videos[matchResult.videoIndex];
        
        // Add bot response
        setChatMessages(prev => [...prev, { 
          type: 'bot', 
          text: matchResult.answer || `Let me show you a video about "${question}"`
        }]);

        // Play the matched video (this will trigger the useEffect which resets videoEnded)
        setCurrentVideoIndex(matchResult.videoIndex);
        setCurrentTimestamp(0);
        
      } else {
        // No match found - generic response
        setChatMessages(prev => [...prev, { 
          type: 'bot', 
          text: 'That\'s a great question! Let me show you our product demo.'
        }]);
      }
      
      setIsTyping(false);
    }, 1000); // Simulate typing delay
  };

  const loadSubtitles = (subtitleUrl) => {
    if (!videoPlayerRef.current) {
      console.log('❌ No video player ref for subtitles');
      return;
    }

    console.log('🎬 Loading subtitles from:', subtitleUrl);

    // Clear existing subtitle tracks
    const existingTracks = videoPlayerRef.current.querySelectorAll('track');
    existingTracks.forEach(track => {
      console.log('🗑️ Removing existing track');
      track.remove();
    });

    const track = document.createElement('track');
    track.kind = 'subtitles';
    track.label = 'English';
    track.srclang = 'en';
    track.src = subtitleUrl;
    track.default = true;

    videoPlayerRef.current.appendChild(track);

    track.addEventListener('load', () => {
      console.log('✅ Subtitle track loaded');
      const textTrack = track.track;
      
      if (textTrack && textTrack.cues) {
        console.log('📝 Number of cues:', textTrack.cues.length);
        
        // Set mode to 'showing' to display browser's native subtitles
        textTrack.mode = 'showing';
        
        // Enable all text tracks (show browser's native subtitles)
        if (videoPlayerRef.current && videoPlayerRef.current.textTracks) {
          for (let i = 0; i < videoPlayerRef.current.textTracks.length; i++) {
            videoPlayerRef.current.textTracks[i].mode = 'showing';
          }
        }
        
        console.log('✅ Subtitle track mode set to showing (browser native)');
      } else {
        console.log('⚠️ No cues in track');
      }
    });

    track.addEventListener('error', (e) => {
      console.error('❌ Subtitle loading error:', e);
    });
  };

  const matchQuestion = (question) => {
    if (!videoFlow || !videoFlow.videos) {
      return { matched: false };
    }

    const questionLower = question.toLowerCase();
    
    // Search through all videos for matching questions
    for (let i = 0; i < videoFlow.videos.length; i++) {
      const video = videoFlow.videos[i];
      
      if (video.nextQuestions) {
        for (const q of video.nextQuestions) {
          if (q.text.toLowerCase() === questionLower) {
            // Handle both nextVideo and nextVideoId formats
            const nextVideoRef = q.nextVideo || q.nextVideoId;
            const videoIndex = nextVideoRef ? 
              videoFlow.videos.findIndex(v => v.id === nextVideoRef) : i;
              
            return {
              matched: true,
              videoIndex: videoIndex >= 0 ? videoIndex : i,
              answer: q.answer || video.answer || null,
              videoId: nextVideoRef || video.id
            };
          }
        }
      }
    }

    return { matched: false };
  };

  const handleExpand = () => {
    setIsExpanded(true);
    setIsMinimized(false);
  };

  const handleMinimize = () => {
    setIsMinimized(true);
  };

  const handleClose = () => {
    setIsExpanded(false);
    setIsMinimized(false);
  };

  // Small circular widget (collapsed state)
  if (!isExpanded) {
    return (
      <div className={`fixed ${positionClasses[position]} z-50`}>
        <button
          onClick={handleExpand}
          className="group relative"
        >
          {/* Circular video preview with pulse animation */}
          <div className="relative w-36 h-36 rounded-full overflow-hidden shadow-2xl border-4 border-white hover:border-blue-500 transition-all duration-300">
            {(videoThumbnail || previewImage) ? (
              <img 
                src={videoThumbnail || previewImage} 
                alt="Demo" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <ChatBubbleLeftRightIcon className="w-16 h-16 text-white" />
              </div>
            )}
            
            {/* Play icon overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center group-hover:bg-opacity-50 transition-all">
              <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
              </svg>
            </div>

            {/* Pulse ring animation */}
            <div className="absolute inset-0 rounded-full border-4 border-blue-500 animate-ping opacity-75"></div>
          </div>

          {/* Text label */}
          {previewText && (
            <div className="absolute -top-14 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
              {previewText}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
                <div className="border-8 border-transparent border-t-gray-900"></div>
              </div>
            </div>
          )}
        </button>
      </div>
    );
  }

  // Expanded widget
  return (
    <div className={`fixed ${positionClasses[position]} z-50 transition-all duration-300`}>
      {/* Minimized bar */}
      {isMinimized ? (
        <div className="bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden">
          <button
            onClick={() => setIsMinimized(false)}
            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors w-full"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              <ChatBubbleLeftRightIcon className="w-5 h-5 text-white" />
            </div>
            <span className="font-medium text-gray-900">Demo Video</span>
            <ChevronDownIcon className="w-5 h-5 text-gray-400 ml-auto rotate-180" />
          </button>
        </div>
      ) : (
         // Full expanded widget - clean video only (like Y Combinator)
         <div className="bg-black rounded-2xl shadow-2xl overflow-hidden" style={{ width: '550px' }}>
           {loading ? (
             <div className="p-8 flex flex-col items-center justify-center bg-white">
               <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
               <p className="mt-4 text-gray-600">Loading demo...</p>
             </div>
           ) : videoFlow && videoFlow.videos && videoFlow.videos.length > 0 ? (
             <div className="relative">
               {/* Close button - top right corner */}
               <button
                 onClick={handleClose}
                 className="absolute top-4 right-4 z-30 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-2 transition-all"
               >
                 <XMarkIcon className="w-5 h-5" />
               </button>

               {/* Video Player */}
               <div className="relative bg-black" style={{ height: '450px' }}>
                 <style>{`
                   video::cue {
                     font-size: 12px;
                     line-height: 1.1;
                     background-color: rgba(0, 0, 0, 0.8);
                   }
                 `}</style>
                 <video 
                   ref={videoPlayerRef}
                   controls 
                   className="w-full h-full object-contain bg-black"
                   playsInline
                   preload="metadata"
                   crossOrigin="anonymous"
                 >
                   Your browser does not support the video tag.
                 </video>

                 {/* Suggested Questions Overlay - Only show after video ends (like Y Combinator) */}
                 {videoEnded && videoFlow?.videos[currentVideoIndex]?.nextQuestions && videoFlow.videos[currentVideoIndex].nextQuestions.length > 0 && (
                   <div className="absolute bottom-16 left-0 right-0 px-6 pb-4 pointer-events-none">
                     <div className="flex flex-wrap gap-2 justify-center pointer-events-auto">
                       {videoFlow.videos[currentVideoIndex].nextQuestions.slice(0, 3).map((question, index) => (
                         <button
                           key={index}
                           onClick={() => handleSuggestedQuestionClick(question.text)}
                           disabled={isTyping}
                           className="bg-gray-900 bg-opacity-80 hover:bg-opacity-95 text-white px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm border border-gray-700 hover:border-gray-500"
                         >
                           {question.text}
                         </button>
                       ))}
                     </div>
                   </div>
                 )}
               </div>
             </div>
           ) : (
             <div className="p-8 text-center text-gray-500 bg-white">
               <p>No demo available</p>
             </div>
           )}
         </div>
      )}
    </div>
  );
};

export default FloatingQudemoWidget;

