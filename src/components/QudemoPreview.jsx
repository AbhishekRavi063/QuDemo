import React, { useState, useEffect, useRef } from 'react';
import ReactPlayer from 'react-player';
import HybridVideoPlayer from './HybridVideoPlayer';
import { 
  XMarkIcon, 
  PaperAirplaneIcon, 
  PlayIcon, 
  PauseIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  ChatBubbleLeftIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { getVideoApiUrl, getNodeApiUrl } from '../config/api';
import { useBackend } from '../context/BackendContext';
import { refreshAccessToken, clearAuthTokens } from '../utils/tokenRefresh';
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
  
  // Remove unwanted patterns
  let cleaned = text
    .replace(/\*\*/g, "")
    .replace(/\(.*?page.*?\)/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();

  // Ensure bullet points and numbers are on new lines
  cleaned = cleaned
    // New line before bullets (•, -, *) if not already at line start
    .replace(/\s*([•\-*])\s+/g, "<br/>$1 ")
    // New line before numbered lists (1., 2., etc.) if not already at line start
    .replace(/\s*(\d+\.)\s+/g, "<br/>$1 ");

  // Convert URLs to clickable links
  cleaned = cleaned.replace(
    /(https?:\/\/[^\s]+)/g,
    (url) =>
      `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-600 underline">${url}</a>`
  );

  // Split at each '– ' and wrap each in <p> tags, preserving the intro as its own paragraph
  const parts = cleaned.split(/(?=– )/g);

  const result = parts.map(part => `<p>${part.trim()}</p>`).join("");

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

const QudemoPreview = ({ qudemo, onClose }) => {
  // Generate a unique key for this qudemo's chat
  const chatKey = `qudemo-chat-${qudemo?.id}`;
  
  // Load messages from localStorage or initialize with empty array
  // Clear messages on page refresh by not loading from localStorage
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
  const [videoRefreshKey, setVideoRefreshKey] = useState(0); // Force video player refresh
  const [suggestedQuestions, setSuggestedQuestions] = useState([]);
  const [loadingSuggestedQuestions, setLoadingSuggestedQuestions] = useState(false);
  const [showAllQuestions, setShowAllQuestions] = useState(false);
  const [pythonData, setPythonData] = useState(null);
  const [loadingPythonData, setLoadingPythonData] = useState(false);
  const messagesEndRef = useRef(null);
  const loomIframeRef = useRef();
  const videoPlayerRef = useRef(null);

  // Initialize with welcome message and clear previous messages on page refresh
  useEffect(() => {
    if (qudemo) {
      // Clear any existing messages from localStorage
      localStorage.removeItem(chatKey);
      
      // Always start with a fresh welcome message
      const welcomeMessage = {
        sender: "AI",
        text: `Welcome to the ${qudemo.title}! I'm your AI assistant for this qudemo. I can help you understand the content from the videos and knowledge sources. What would you like to know?`,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setMessages([welcomeMessage]);
    }
  }, [qudemo, chatKey]);

  // Auto-scroll to bottom when new messages arriveh
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(chatKey, JSON.stringify(messages));
    }
  }, [messages, chatKey]);

  // Clear suggested questions and fetch new ones when QuDemo changes
  useEffect(() => {
    if (qudemo?.id) {
      // Clear old suggested questions immediately
      setSuggestedQuestions([]);
      setLoadingSuggestedQuestions(true);
      setShowAllQuestions(false); // Reset show all state
      fetchSuggestedQuestions();
    } else {
      // Clear suggested questions when no QuDemo
      setSuggestedQuestions([]);
      setLoadingSuggestedQuestions(false);
      setShowAllQuestions(false);
    }
  }, [qudemo?.id]);

  // Cleanup suggested questions when component unmounts
  useEffect(() => {
    return () => {
      setSuggestedQuestions([]);
      setLoadingSuggestedQuestions(false);
      setShowAllQuestions(false);
    };
  }, []);

  // Fetch Python backend data when QuDemo changes
  useEffect(() => {
    if (qudemo?.id) {
      fetchPythonData();
    }
  }, [qudemo?.id]);

  const fetchPythonData = async () => {
    try {
      setLoadingPythonData(true);
      const token = localStorage.getItem('accessToken');
      
      const apiUrl = getNodeApiUrl(`/api/qudemos/${qudemo.id}/python-data`);
      
      const response = await axios.get(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setPythonData(response.data.data);
      }
    } catch (error) {
      console.error('❌ Error fetching Python data:', error);
      // Don't show error to user, just silently fail
    } finally {
      setLoadingPythonData(false);
    }
  };

  const fetchSuggestedQuestions = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      
      const apiUrl = getNodeApiUrl(`/api/qudemos/${qudemo.id}/suggested-questions`);
      
      const response = await axios.get(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        const questions = response.data.suggested_questions || [];
        setSuggestedQuestions(questions);
      }
    } catch (error) {
      console.error('❌ Error fetching suggested questions:', error);
      // Don't show error to user, just silently fail
    } finally {
      setLoadingSuggestedQuestions(false);
    }
  };

  const handleSuggestedQuestionClick = (question) => {
    setInputMessage(question);
    // Auto-send the suggested question
    setTimeout(() => {
      handleSendMessage(question);
    }, 100);
  };
  
  // Debug: Monitor currentTimestamp state changes
  useEffect(() => {

  }, [currentTimestamp]);

  // Cleanup function to ensure messages are saved when component unmounts
  useEffect(() => {
    return () => {
      if (messages.length > 0) {
        localStorage.setItem(chatKey, JSON.stringify(messages));
      }
    };
  }, [messages, chatKey]);

  // Function to enable audio after user interaction
  const enableAudio = () => {
    setAudioEnabled(true);
    // Enable audio on all video elements
    setTimeout(() => {
      const videoElements = document.querySelectorAll('video');
      videoElements.forEach(video => {
        video.muted = false;
        video.volume = 1.0;
        video.play().catch(e => {});
      });
      
      // Also handle ReactPlayer instances
      const iframes = document.querySelectorAll('iframe');
      iframes.forEach(iframe => {
        if (iframe.src.includes('loom.com')) {
          // For Loom videos, try to unmute via postMessage
          try {
            iframe.contentWindow.postMessage({ type: 'unmute' }, '*');
          } catch (e) {

          }
        }
      });
    }, 100);
  };

  const handleSendMessage = async (messageText = null) => {
    const messageToSend = messageText || inputMessage.trim();
    if (!messageToSend || isTyping) return;

    const userQuestion = messageToSend;
    setMessages(prev => [...prev, {
      sender: "You",
      text: userQuestion,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }]);
    setInputMessage('');
    setIsTyping(true);

    try {

      const token = localStorage.getItem('accessToken');
      if (!token) {

        setMessages(prev => [...prev, {
          sender: "AI",
          text: "Please log in to ask questions.",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }]);
        setIsTyping(false);
        return;
      }
      
      // Call the Node.js backend Q&A endpoint which will forward to Python backend
      const askUrl = getNodeApiUrl(`/api/qa/qudemo/${qudemo.id}`);

      let response;
      try {
        response = await axios.post(askUrl, {
          question: userQuestion
        }, {
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          timeout: 30000
        });
      } catch (error) {
        // Handle token expiration
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {

          const refreshResult = await refreshAccessToken();
          
          if (refreshResult.success) {

            // Retry the request with the new token
            response = await axios.post(askUrl, {
              question: userQuestion
            }, {
              headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${refreshResult.accessToken}`
              },
              timeout: 30000
            });
          } else {

            clearAuthTokens();
            throw error; // Re-throw to be handled by the catch block
          }
        } else {
          throw error; // Re-throw non-auth errors
        }
      }

      // Process the response and handle video switching
      try {
        const aiAnswer = response.data?.answer || 'Sorry, I could not find an answer.';

        // Check for video navigation data in the response
        let targetVideoUrl = null;
        let timestamp = 0;
        
        // First check direct video fields (this is how the Python backend sends video data)
        if (response.data && response.data.video_url) {
          targetVideoUrl = response.data.video_url;
          timestamp = response.data.start || 0;

          // Ensure timestamp is a number and convert to seconds if needed
          if (typeof timestamp === 'string') {
            timestamp = parseFloat(timestamp);
          }
          if (isNaN(timestamp)) {
            timestamp = 0;
          }
          
          // Additional validation - ensure timestamp is reasonable
          if (timestamp < 0 || timestamp > 36000) { // Max 10 hours

            timestamp = 0;
          }

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

          if (videoIndex !== -1) {

            setCurrentVideoIndex(videoIndex);
            setCurrentTimestamp(timestamp);

          } else {

            // Try to set timestamp anyway if we have a valid timestamp
            if (timestamp !== undefined) {

              setCurrentTimestamp(timestamp);
            }
          }
          
          // Force video to seek to new timestamp after a brief delay
          // This ensures the video player responds to the new timestamp
          setTimeout(() => {
            if (timestamp !== undefined) {

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

                  }
                } catch (error) {

                }
              }
            }
          }, 200); // Increased delay to ensure video player is ready
        }
        
        setIsTyping(false);

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
      console.error('Chat error:', error.message || error);
      
      // Handle authentication errors specifically
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {

        clearAuthTokens();
        
        const errorMessage = {
          sender: "AI",
          text: 'Your session has expired. Please refresh the page and log in again.',
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        };
        setMessages(prev => [...prev, errorMessage]);
      } else {
        const errorMessage = {
          sender: "AI",
          text: 'Sorry, I encountered an error while processing your request. Please try again.',
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        };
        setMessages(prev => [...prev, errorMessage]);
      }
      
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-7xl h-full max-h-[85vh] bg-white rounded-lg shadow-2xl flex flex-col md:flex-row overflow-hidden relative">
        {/* Video Section */}
        <div 
          className="w-full md:w-2/3 relative flex flex-col items-center justify-center bg-black"
          onClick={enableAudio}
        >
          {currentVideo ? (
            <div className="relative w-full h-full">
              <HybridVideoPlayer
                ref={videoPlayerRef}
                key={`${currentVideo.video_url}-${currentTimestamp}-${videoRefreshKey}`} // Force re-render when URL, timestamp, or refresh key changes
                url={currentVideo.video_url}
                width="100%"
                height="100%"
                controls={true}
                playing={isPlaying}
                startTime={currentTimestamp}
                style={{ width: '100%', height: '100%', background: 'black' }}
                onReady={() => {

                }}
                onPlay={() => {

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
        <div className="w-full md:w-1/3 flex flex-col bg-white border-l">
          {/* Header */}
          <div className="bg-blue-600 text-white px-4 py-3">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-4">
                <div className="font-semibold text-sm sm:text-base">
                  {qudemo?.title || 'QuDemo Preview'}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <XMarkIcon
                  className="h-5 w-5 cursor-pointer"
                  onClick={onClose}
                />
              </div>
            </div>
            
            {/* QuDemo Stats */}
            <div className="flex items-center gap-4 text-xs text-blue-100">
              <div className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>{qudemo?.videos?.length || 0} videos</span>
              </div>
              
              {qudemo?.documents?.length > 0 && (
                <div className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>{qudemo.documents.length} docs</span>
                </div>
              )}
              
              {pythonData?.website_count > 0 && (
                <div className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                  </svg>
                  <span>{pythonData.website_count} websites</span>
                </div>
              )}
              
              {loadingPythonData && (
                <div className="flex items-center gap-1">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-100"></div>
                  <span>Loading...</span>
                </div>
              )}
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 px-3 py-1 overflow-y-auto space-y-3 bg-gray-50 text-sm">
            {/* Suggested Questions as Chat Messages */}
            {(() => {
              return null;
            })()}
            
            {messages.map((msg, idx) => (
              <div key={idx}>
                <div
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
                
                {/* Show suggested questions after the first AI message (welcome message) or greeting responses */}
                {msg.sender === "AI" && (idx === 0 || msg.text.includes("Hi! I am an AI assistant for this demo")) && (
                  <div className="flex justify-start px-3 py-2">
                    <div className="max-w-[95%]">
                      <div className="text-xs text-gray-600 mb-2 font-medium text-left">Suggested questions:</div>
                    <div className="flex flex-wrap gap-2">
                      {(() => {
                        // Only show suggested questions if they are actually loaded
                        if (suggestedQuestions.length === 0) {
                          return null; // Don't show any questions if none are loaded
                        }
                        
                        const displayQuestions = showAllQuestions ? suggestedQuestions : suggestedQuestions.slice(0, 4);
                        
                        return displayQuestions.map((question, questionIndex) => (
                          <button
                            key={questionIndex}
                            onClick={() => handleSuggestedQuestionClick(question)}
                            className="text-xs bg-blue-50 border border-blue-200 rounded-full px-4 py-2 hover:bg-blue-100 hover:border-blue-300 transition-colors duration-200 text-blue-700 text-left max-w-sm whitespace-normal"
                            disabled={isTyping}
                          >
                            {question}
                          </button>
                        ));
                      })()}
                      
                      {/* Show "More..." button if there are more than 4 questions and not showing all */}
                      {suggestedQuestions.length > 4 && !showAllQuestions && (
                        <button
                          onClick={() => setShowAllQuestions(true)}
                          className="text-xs bg-gray-100 border border-gray-300 rounded-full px-4 py-2 hover:bg-gray-200 hover:border-gray-400 transition-colors duration-200 text-gray-700 text-left"
                          disabled={isTyping}
                        >
                          More...
                        </button>
                      )}
                    </div>
                    </div>
                  </div>
                )}
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
          <div className="px-3 py-1 border-t flex items-center gap-2">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask a question about this qudemo..."
              rows={1}
              className="flex-1 px-3 py-1 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none overflow-hidden"
              style={{ minHeight: '2.5rem', maxHeight: '7.5rem' }}
              onInput={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 7.5 * 16) + 'px';
              }}
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
          <div className="px-2 py-2 flex justify-center items-center text-xs bg-white border-t">
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
  );
};

export default QudemoPreview;
