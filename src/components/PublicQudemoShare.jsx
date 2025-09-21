import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import HybridVideoPlayer from './HybridVideoPlayer';
import { 
  XMarkIcon, 
  PaperAirplaneIcon, 
  PlayIcon, 
  PauseIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  ChatBubbleLeftIcon,
  UserIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import { getNodeApiUrl } from '../config/api';
import axios from 'axios';

const TypingIndicator = () => (
  <div className="typing-indicator flex space-x-1">
    <span className="dot animate-bounce delay-150"></span>
    <span className="dot animate-bounce delay-300"></span>
    <span className="dot animate-bounce delay-450"></span>

    <style>{`
      .typing-indicator {
        align-items: center;
      }
      .dot {
        width: 8px;
        height: 8px;
        background-color: #2563eb;
        border-radius: 50%;
        display: inline-block;
        animation-duration: 1s;
        animation-iteration-count: infinite;
        animation-timing-function: ease-in-out;
      }
      .animate-bounce {
        animation-name: bounce-dot;
      }
      .delay-150 {
        animation-delay: 0.15s;
      }
      .delay-300 {
        animation-delay: 0.3s;
      }
      .delay-450 {
        animation-delay: 0.45s;
      }

      @keyframes bounce-dot {
        0%,
        80%,
        100% {
          transform: translateY(0);
          opacity: 0.3;
        }
        40% {
          transform: translateY(-8px);
          opacity: 1;
        }
      }
    `}</style>
  </div>
);

const cleanMessageText = (text) => {
  console.log('🔍 cleanMessageText input:', text);
  
  // Remove unwanted patterns
  let cleaned = text
    .replace(/\*\*/g, "")
    .replace(/\(.*?page.*?\)/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();

  console.log('🔍 After removing patterns:', cleaned);

  // Ensure bullet points and numbers are on new lines
  cleaned = cleaned
    // New line before bullets (•, -, *) if not already at line start
    .replace(/\s*([•\-*])\s+/g, "<br/>$1 ")
    // New line before numbered lists (1., 2., etc.) if not already at line start
    .replace(/\s*(\d+\.)\s+/g, "<br/>$1 ");

  console.log('🔍 After bullet/number formatting:', cleaned);

  // Convert URLs to clickable links
  cleaned = cleaned.replace(
    /(https?:\/\/[^\s]+)/g,
    (url) =>
      `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-600 underline">${url}</a>`
  );

  console.log('🔍 After URL conversion:', cleaned);

  // Split at each '– ' and wrap each in <p> tags, preserving the intro as its own paragraph
  const parts = cleaned.split(/(?=– )/g);
  console.log('🔍 Parts after splitting:', parts);
  
  const result = parts.map(part => `<p>${part.trim()}</p>`).join("");
  console.log('🔍 Final result:', result);
  
  return result;
};

// Extract video ID from various URL formats
const extractVideoId = (url) => {
  if (!url) return null;
  
  try {
    // YouTube URLs
    if (url.includes('youtube.com/watch')) {
      const urlParams = new URLSearchParams(url.split('?')[1]);
      return urlParams.get('v');
    } else if (url.includes('youtu.be/')) {
      return url.split('youtu.be/')[1].split('?')[0];
    } else if (url.includes('youtube.com/embed/')) {
      return url.split('youtube.com/embed/')[1].split('?')[0];
    }
    
    // Loom URLs
    if (url.includes('loom.com/share/')) {
      return url.split('loom.com/share/')[1].split('?')[0];
    } else if (url.includes('loom.com/embed/')) {
      return url.split('loom.com/embed/')[1].split('?')[0];
    }
    
    // Vimeo URLs
    if (url.includes('vimeo.com/')) {
      return url.split('vimeo.com/')[1].split('?')[0];
    } else if (url.includes('player.vimeo.com/video/')) {
      return url.split('player.vimeo.com/video/')[1].split('?')[0];
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting video ID:', error);
    return null;
  }
};

const PublicQudemoShare = () => {
  const { shareToken } = useParams();
  const [qudemo, setQudemo] = useState(null);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTimestamp, setCurrentTimestamp] = useState(0);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [showLoomTimestamp, setShowLoomTimestamp] = useState(false);
  const [loomTimestampMessage, setLoomTimestampMessage] = useState('');
  const [videoRefreshKey, setVideoRefreshKey] = useState(0);
  const messagesEndRef = useRef(null);
  const loomIframeRef = useRef();
  const videoPlayerRef = useRef(null);

  // Load shared qudemo data
  useEffect(() => {
    const loadSharedQudemo = async () => {
      try {
        setLoading(true);
        const response = await fetch(getNodeApiUrl(`/api/qudemos/share/${shareToken}`));
        
        if (response.ok) {
          const data = await response.json();
          setQudemo(data.data);
          setCompany(data.data.company);
          
          // Initialize with welcome message
          const welcomeMessage = {
            sender: "AI",
            text: `Welcome to the ${data.data.title}! I'm your AI assistant for this shared qudemo. I can help you understand the content from the videos and knowledge sources. What would you like to know?`,
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          };
          setMessages([welcomeMessage]);
        } else {
          const errorData = await response.json();
          setError(errorData.error || 'Failed to load shared qudemo');
        }
      } catch (err) {
        console.error('Error loading shared qudemo:', err);
        setError('Failed to load shared qudemo');
      } finally {
        setLoading(false);
      }
    };

    if (shareToken) {
      loadSharedQudemo();
    }
  }, [shareToken]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Function to enable audio after user interaction
  const enableAudio = () => {
    setAudioEnabled(true);
    // Enable audio on all video elements
    setTimeout(() => {
      const videoElements = document.querySelectorAll('video');
      videoElements.forEach(video => {
        video.muted = false;
        video.volume = 1.0;
        video.play().catch(e => console.log('Autoplay prevented:', e));
      });
      
      // Also handle ReactPlayer instances
      const iframes = document.querySelectorAll('iframe');
      iframes.forEach(iframe => {
        if (iframe.src.includes('loom.com')) {
          // For Loom videos, try to unmute via postMessage
          try {
            iframe.contentWindow.postMessage({ type: 'unmute' }, '*');
          } catch (e) {
            console.log('Could not unmute Loom video:', e);
          }
        }
      });
    }, 100);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isTyping || !qudemo) return;

    const userQuestion = inputMessage;
    setMessages(prev => [...prev, {
      sender: "You",
      text: userQuestion,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }]);
    setInputMessage('');
    setIsTyping(true);

    try {
      console.log('🔍 Sending Q&A request for shared qudemo:', qudemo.id);
      console.log('🔍 Question:', userQuestion);
      
      // Call the public chat endpoint for shared QuDemos
      const askUrl = getNodeApiUrl(`/api/qudemos/share/${shareToken}/chat`);
      console.log('🔍 Calling public chat API URL:', askUrl);
      console.log('🔍 Request payload:', { question: userQuestion });
      
      const response = await axios.post(askUrl, {
        question: userQuestion
      }, {
        headers: { 
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });
      
      console.log('✅ Q&A response:', response.data);
      console.log('🎬 Video fields in response:', {
        video_url: response.data?.video_url,
        start: response.data?.start,
        end: response.data?.end,
        video_title: response.data?.video_title
      });
      
      // Process the response and handle video switching
      try {
        const aiAnswer = response.data?.answer || 'Sorry, I could not find an answer.';
        console.log('🔍 Extracted answer:', aiAnswer);
        
        // Check for video navigation data in the response
        let targetVideoUrl = null;
        let timestamp = 0;
        
        // First check direct video fields (this is how the Python backend sends video data)
        if (response.data && response.data.video_url) {
          targetVideoUrl = response.data.video_url;
          timestamp = response.data.start || 0;
          console.log('🎬 Using direct video fields:', { url: targetVideoUrl, timestamp });
          console.log('🎬 Raw response data:', response.data);
          console.log('🎬 Start time value:', response.data.start, 'Type:', typeof response.data.start);
          
          // Ensure timestamp is a number and convert to seconds if needed
          if (typeof timestamp === 'string') {
            timestamp = parseFloat(timestamp);
          }
          if (isNaN(timestamp)) {
            timestamp = 0;
          }
          
          // Additional validation - ensure timestamp is reasonable
          if (timestamp < 0 || timestamp > 36000) { // Max 10 hours
            console.log('⚠️ Timestamp out of reasonable range, resetting to 0');
            timestamp = 0;
          }
          
          console.log('🎬 Processed timestamp:', timestamp, 'Type:', typeof timestamp);
          console.log('🎬 Final timestamp value for video player:', timestamp);
        }
        // Fallback: check sources array for video sources
        else if (response.data && response.data.sources && response.data.sources.length > 0) {
          // Find the first video source with a timestamp
          const videoSource = response.data.sources.find(source => 
            source.source_type === 'video' && source.start_timestamp
          );
          
          if (videoSource) {
            targetVideoUrl = videoSource.url;
            timestamp = videoSource.start_timestamp;
            console.log('🎬 Found video source in sources:', { url: targetVideoUrl, timestamp });
          }
        }
        
        // Add message with video switching
        setMessages(msgs => [...msgs, {
          sender: "AI",
          text: cleanMessageText(aiAnswer),
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }]);
        
        // Switch video if we have a valid video URL
        if (targetVideoUrl) {
          console.log('🎬 Switching to video:', targetVideoUrl, 'at timestamp:', timestamp);
          console.log('🎬 About to set currentTimestamp to:', timestamp);
          console.log('🔍 DEBUG: Qudemo videos array:', qudemo.videos);
          console.log('🔍 DEBUG: Looking for video URL:', targetVideoUrl);
          
          // First, pause the current video to ensure clean transition
          setIsPlaying(false);
          
          // Find if this video is in our qudemo's videos (flexible URL matching)
          const videoIndex = qudemo.videos?.findIndex(v => {
            if (!v.video_url || !targetVideoUrl) return false;
            // Extract video IDs for comparison
            const vId = extractVideoId(v.video_url);
            const targetId = extractVideoId(targetVideoUrl);
            return vId && targetId && vId === targetId;
          });
          console.log('🔍 DEBUG: Video index found:', videoIndex);
          
          if (videoIndex !== -1) {
            console.log('🎬 Found video at index:', videoIndex);
            setCurrentVideoIndex(videoIndex);
            setCurrentTimestamp(timestamp);
            console.log('🎬 currentTimestamp set to:', timestamp);
          } else {
            console.log('⚠️ Video not found in qudemo videos array');
            console.log('🔍 DEBUG: Available video URLs:', qudemo.videos?.map(v => v.video_url));
            // Try to set timestamp anyway if we have a valid timestamp
            if (timestamp !== undefined) {
              console.log('🎬 Setting timestamp anyway since we have a valid timestamp');
              setCurrentTimestamp(timestamp);
            }
          }
          
          // Force video to seek to new timestamp after a brief delay
          // This ensures the video player responds to the new timestamp
          setTimeout(() => {
            if (timestamp !== undefined) {
              console.log('🎬 Force seeking to timestamp:', timestamp);
              // Update timestamp and start playing
              setCurrentTimestamp(timestamp);
              setIsPlaying(true);
              
              // Increment refresh key to force video player re-render
              setVideoRefreshKey(prev => prev + 1);
              
              // Try to seek directly using the player ref if available
              if (videoPlayerRef.current) {
                try {
                  if (videoPlayerRef.current.seekTo) {
                    videoPlayerRef.current.seekTo(timestamp);
                    console.log('🎬 Direct seek successful');
                  }
                } catch (error) {
                  console.log('🎬 Direct seek failed, using state update:', error);
                }
              }
            }
          }, 200); // Increased delay to ensure video player is ready
        }
        
        setIsTyping(false);
        console.log('🔍 Message added successfully');
        
      } catch (processingError) {
        console.error('❌ Processing failed:', processingError);
        
        // Fallback - just add the answer
        setMessages(msgs => [...msgs, {
          sender: "AI",
          text: cleanMessageText(response.data?.answer || "I found an answer but there was an error displaying it. Please try again."),
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }]);
        setIsTyping(false);
      }

    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        sender: "AI",
        text: 'Sorry, I encountered an error while processing your request. Please try again.',
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setMessages(prev => [...prev, errorMessage]);
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const currentVideo = qudemo?.videos?.[currentVideoIndex];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading shared QuDemo...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Share Link Not Found</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">The share link may have expired or been removed.</p>
        </div>
      </div>
    );
  }

  if (!qudemo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-600 text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">QuDemo Not Found</h1>
          <p className="text-gray-600">This QuDemo is no longer available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              {company?.logo_url && (
                <img 
                  src={company.logo_url} 
                  alt={company.name} 
                  className="h-8 w-8 rounded"
                />
              )}
              <div>
                <h1 className="text-lg font-semibold text-gray-900">{qudemo.title}</h1>
                <p className="text-sm text-gray-500 flex items-center">
                  <BuildingOfficeIcon className="h-4 w-4 mr-1" />
                  {company?.name || 'Unknown Company'}
                </p>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              Shared QuDemo
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="flex flex-col lg:flex-row h-[80vh]">
            {/* Video Section */}
            <div 
              className="w-full lg:w-2/3 relative flex flex-col items-center justify-center bg-black"
              onClick={enableAudio}
            >
              {currentVideo ? (
                <div className="relative w-full h-full">
                  <HybridVideoPlayer
                    ref={videoPlayerRef}
                    key={`${currentVideo.video_url}-${currentTimestamp}-${videoRefreshKey}`}
                    url={currentVideo.video_url}
                    width="100%"
                    height="100%"
                    controls={true}
                    playing={isPlaying}
                    startTime={currentTimestamp}
                    style={{ width: '100%', height: '100%', background: 'black' }}
                    onReady={() => {
                      console.log('Video ready for chat');
                      console.log('🎬 Video ready - currentTimestamp:', currentTimestamp, 'Type:', typeof currentTimestamp);
                      console.log('🎬 Video ready - startTime prop passed:', currentTimestamp);
                    }}
                    onPlay={() => {
                      console.log('Video playing in chat');
                    }}
                    iframeRef={loomIframeRef}
                  />
                  
                  {/* Loom Timestamp Indicator */}
                  {showLoomTimestamp && currentVideo.video_url.includes('loom.com') && currentTimestamp > 0 && (
                    <div className="absolute top-4 right-4 bg-yellow-500 text-black px-4 py-3 rounded-lg text-sm font-medium z-20 shadow-lg max-w-xs">
                      <div className="flex items-center space-x-2">
                        <span>⏰</span>
                        <div>
                          <div className="font-bold">Seek to:</div>
                          <div>{loomTimestampMessage}</div>
                        </div>
                        <button 
                          onClick={() => setShowLoomTimestamp(false)}
                          className="text-black hover:text-gray-700 ml-2"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* YouTube Timestamp Indicator */}
                  {currentTimestamp > 0 && currentVideo.video_url.includes('youtube.com') && (
                    <div className="absolute top-4 right-4 bg-blue-500 text-white px-4 py-3 rounded-lg text-sm font-medium z-20 shadow-lg max-w-xs">
                      <div className="flex items-center space-x-2">
                        <span>⏰</span>
                        <div>
                          <div className="font-bold">Jump to:</div>
                          <div>{Math.floor(currentTimestamp / 60)}:{(currentTimestamp % 60).toString().padStart(2, '0')}</div>
                        </div>
                        <button 
                          onClick={() => setCurrentTimestamp(0)}
                          className="text-white hover:text-gray-200 ml-2"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full w-full text-white text-lg">
                  <div className="text-center">
                    <PlayIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>No videos available for this qudemo</p>
                  </div>
                </div>
              )}

              {/* Video Controls */}
              {qudemo?.videos && qudemo.videos.length > 1 && (
                <div className="p-4 bg-gray-900">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-white text-sm">
                        Video {currentVideoIndex + 1} of {qudemo.videos.length}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setCurrentVideoIndex(Math.max(0, currentVideoIndex - 1))}
                        disabled={currentVideoIndex === 0}
                        className="px-3 py-1 bg-gray-700 text-white rounded text-sm disabled:opacity-50"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setCurrentVideoIndex(Math.min(qudemo.videos.length - 1, currentVideoIndex + 1))}
                        disabled={currentVideoIndex === qudemo.videos.length - 1}
                        className="px-3 py-1 bg-gray-700 text-white rounded text-sm disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Section */}
            <div className="w-full lg:w-1/3 flex flex-col bg-white border-l">
              {/* Header */}
              <div className="bg-blue-600 text-white px-4 py-3 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="font-semibold text-sm sm:text-base">
                    Ask questions about this qudemo
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to clear the chat history?')) {
                        setMessages([]);
                      }
                    }}
                    className="text-white hover:text-gray-200 text-xs px-2 py-1 rounded border border-white/30 hover:bg-white/10"
                    title="Clear chat history"
                  >
                    Clear Chat
                  </button>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 p-3 overflow-y-auto space-y-3 bg-gray-50 text-sm">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.sender === "AI" ? "justify-start" : "justify-end"}`}
                  >
                    <div
                      className={`rounded-xl px-4 py-2 max-w-[80%] ${
                        msg.sender === "AI"
                          ? "bg-white border text-gray-800 text-left"
                          : "bg-blue-600 text-white text-right"
                      }`}
                    >
                      <span
                        dangerouslySetInnerHTML={{
                          __html: msg.text, // already cleaned before storing
                        }}
                      />
                    </div>
                  </div>
                ))}
                
                {/* Typing indicator */}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="rounded-xl px-4 py-2 max-w-[80%] bg-white border text-gray-800 select-none">
                      <TypingIndicator />
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-3 border-t flex items-center gap-2">
                <input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  type="text"
                  placeholder="Ask a question about this qudemo..."
                  className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isTyping}
                  className="text-blue-600 hover:text-blue-800 disabled:opacity-50"
                >
                  <PaperAirplaneIcon className="h-7 w-8" />
                </button>
              </div>

              {/* Footer */}
              <div className="p-4 flex justify-center items-center text-xs bg-white border-t">
                <span className="text-gray-500">
                  Powered by <span 
                    onClick={() => window.location.href = '/'}
                    className="text-blue-600 hover:text-blue-800 cursor-pointer font-semibold"
                  >
                    Qudemo
                  </span> AI
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicQudemoShare;
