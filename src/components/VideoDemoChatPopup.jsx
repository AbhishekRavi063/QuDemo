// CUSTOMER PAGE COMPONENT - COMMENTED OUT (NOT IN USE)
// This entire component is disabled - all imports and functionality commented out

// DISABLED: This component is not in use
/*
import React, { useState, useRef, useEffect } from "react";
import ReactPlayer from "react-player/youtube";
import HybridVideoPlayer from "./HybridVideoPlayer";
import { PaperAirplaneIcon, XMarkIcon, SpeakerWaveIcon, SpeakerXMarkIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useCompany } from "../context/CompanyContext";
import { getVideoApiUrl, getNodeApiUrl } from "../config/api"; 

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

// Helper function to convert Loom share URL to embed URL
const convertLoomToEmbedUrl = (url) => {
  if (url && url.includes('loom.com/share/')) {
    return url.replace('/share/', '/embed/');
  }
  return url;
};

// Helper function to convert Vimeo share URL to embed URL
const convertVimeoToEmbedUrl = (url) => {
  if (url && url.includes('vimeo.com/')) {
    const videoId = url.split('vimeo.com/')[1];
    if (videoId) {
      return `https://player.vimeo.com/video/${videoId}`;
    }
  }
  return url;
};

const VideoDemoChatPopup = ({ leadId }) => {
  // COMPONENT DISABLED - RETURN NULL
  return null;
  
  /*
  const { company } = useCompany();
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState("");
  const [currentTimestamp, setCurrentTimestamp] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [ytVideoUrl, setYtVideoUrl] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [loomTimestampMessage, setLoomTimestampMessage] = useState("");
  const [timestampRef] = useState(0);
  const videoRef = useRef(null);
  const chatRef = useRef(null);
  const inputRef = useRef(null);
  const iframeRef = useRef(null);
  const playerRef = useRef(null);
*/

  // Get company video URL
  const companyVideoUrl = company?.video_url || "";

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    if (currentTimestamp > 0 && ytVideoUrl) {
      console.log('🎬 VideoDemoChatPopup: currentTimestamp state changed to:', currentTimestamp, 'Type:', typeof currentTimestamp);
    }
  }, [currentTimestamp, ytVideoUrl]);

  useEffect(() => {
    console.log('🔍 DEBUG: useEffect triggered - currentTimestamp:', currentTimestamp, 'ytVideoUrl:', ytVideoUrl);
    if (currentTimestamp > 0 && ytVideoUrl) {
      console.log('🎬 VideoDemoChatPopup: About to seek to timestamp:', currentTimestamp);
      setTimeout(() => {
        if (iframeRef.current) {
          try {
            const iframe = iframeRef.current;
            if (ytVideoUrl.includes('youtube.com')) {
              // YouTube iframe seeking
              iframe.contentWindow.postMessage(JSON.stringify({
                event: 'command',
                func: 'seekTo',
                args: [currentTimestamp, true]
              }), '*');
              
              // Also try the YouTube Player API commands
              iframe.contentWindow.postMessage(JSON.stringify({
                event: 'command',
                func: 'seekTo',
                args: [currentTimestamp]
              }), '*');
              
              iframe.contentWindow.postMessage(JSON.stringify({
                event: 'command',
                func: 'playVideo'
              }), '*');
            } else if (ytVideoUrl.includes('loom.com')) {
              // Loom iframe seeking
              iframe.contentWindow.postMessage({
                method: 'seekTo',
                value: currentTimestamp
              }, '*');
              
              // Force play after seeking for Loom videos
              setTimeout(() => {
                iframe.contentWindow.postMessage({
                  method: 'play'
                }, '*');
              }, 100);
            }
          } catch (error) {
            console.error('Error seeking in iframe:', error);
          }
        }
          }, 1000);
      }
    }, [currentTimestamp, ytVideoUrl]);

  const handleClose = () => {
    navigate('/customers');
  };

    const sendMessage = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage = input.trim();
      setInput("");
    setMessages(prev => [...prev, { sender: "You", text: userMessage }]);
      setIsTyping(true);

    try {
      const response = await axios.post(getVideoApiUrl('/ask'), {
        question: userMessage,
        company_name: company?.name || "default",
        qudemo_id: "demo"
      });

      if (response.data && response.data.answer) {
        const aiMessage = response.data.answer;
          let timestamp = 0;
        let targetVideoUrl = "";
          
        // Extract timestamp and video URL if available
        console.log('🔍 DEBUG: Full response data:', response.data);
        console.log('🔍 DEBUG: response.data.start:', response.data.start);
        console.log('🔍 DEBUG: response.data.video_url:', response.data.video_url);
        
        if (response.data.start !== undefined) {
            timestamp = response.data.start || 0;
            console.log('🔍 DEBUG: Set timestamp to:', timestamp);
        }
        if (response.data.video_url) {
          targetVideoUrl = response.data.video_url;
          console.log('🔍 DEBUG: Set targetVideoUrl to:', targetVideoUrl);
        }

        // Add AI message to chat
        setMessages(prev => [...prev, { 
            sender: "AI",
          text: cleanMessageText(aiMessage) 
        }]);

        // Handle video seeking if timestamp is available
        console.log('🔍 DEBUG: Checking conditions - targetVideoUrl:', targetVideoUrl, 'timestamp:', timestamp);
        if (targetVideoUrl && timestamp > 0) {
          console.log('🎬 Switching to video:', targetVideoUrl, 'at timestamp:', timestamp);
          console.log('🎬 About to set currentTimestamp to:', timestamp);
          
          setCurrentVideoUrl(targetVideoUrl);
          setYtVideoUrl(targetVideoUrl);
          
          // Set timestamp with delay to ensure state updates properly
          setTimeout(() => {
            setCurrentTimestamp(timestamp);
            console.log('🎬 currentTimestamp set to:', timestamp);
          }, 100);
          
          setTimeout(() => {
            setIsPlaying(true);
          }, 200);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { 
        sender: "AI", 
        text: "Sorry, I encountered an error while processing your request. Please try again." 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleAudio = () => {
    setAudioEnabled(!audioEnabled);
  };

  const handleVideoReady = () => {
    console.log('Video ready for chat');
    console.log('🎬 Video ready - currentTimestamp:', currentTimestamp, 'Type:', typeof currentTimestamp);
    console.log('🎬 Video ready - startTime prop passed:', currentTimestamp);
  };

        return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white w-full max-w-6xl h-full max-h-[90vh] rounded-xl shadow-2xl flex overflow-hidden">
        {/* Video Section */}
        <div className="w-full md:w-2/4 flex flex-col bg-black">
          {companyVideoUrl ? (
            <div className="relative flex-1">
              {/* Video Player */}
              <div className="w-full h-full">
                {companyVideoUrl.includes('youtube.com') ? (
                  <div className="w-full h-full">
                    <iframe
                      ref={iframeRef}
                      src={`https://www.youtube.com/embed/${companyVideoUrl.split('v=')[1]}?autoplay=0&muted=0&enablejsapi=1&controls=1&rel=0&modestbranding=1&version=3&playerapiid=ytplayer`}
                      className="w-full h-full"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      onLoad={handleVideoReady}
                    />
          </div>
                ) : companyVideoUrl.includes('loom.com') ? (
                  <div className="w-full h-full">
                    <iframe
                      ref={iframeRef}
                      src={convertLoomToEmbedUrl(companyVideoUrl)}
                      className="w-full h-full"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      onLoad={handleVideoReady}
                    />
          </div>
                ) : (
                  <video
                    ref={videoRef}
                    src={companyVideoUrl}
                    className="w-full h-full object-cover"
                    controls
                    onLoadedMetadata={handleVideoReady}
                  />
                )}
        </div>

              {/* Video Controls Overlay */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between bg-black bg-opacity-50 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={toggleMute}
                    className="text-white hover:text-gray-300 transition"
                  >
                    {isMuted ? <SpeakerXMarkIcon className="h-5 w-5" /> : <SpeakerWaveIcon className="h-5 w-5" />}
                  </button>
                  <button
                    onClick={toggleAudio}
                    className="text-white hover:text-gray-300 transition"
                  >
                    {audioEnabled ? <SpeakerWaveIcon className="h-5 w-5" /> : <SpeakerXMarkIcon className="h-5 w-5" />}
                  </button>
                </div>
              </div>
                
                {/* Loom Timestamp Indicator */}
              {currentTimestamp > 0 && companyVideoUrl.includes('loom.com') && (
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

              {/* YouTube Timestamp Indicator */}
              {currentTimestamp > 0 && companyVideoUrl.includes('youtube.com') && (
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
                No company video found.
              </div>
            )}
          </div>

          {/* Chat Section */}
          <div className="w-full md:w-2/4 flex flex-col bg-white border-l">
            {/* Header */}
            <div className="bg-blue-600 text-white px-4 py-3 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="font-semibold text-sm sm:text-base">
                  Ask questions about this demo
                </div>
              </div>
              <XMarkIcon
                className="h-5 w-5 cursor-pointer"
                onClick={handleClose}
              />
            </div>

            {/* Chat Messages */}
          <div className="flex-1 p-3 overflow-y-auto space-y-3 bg-gray-50 text-sm" ref={chatRef}>
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
            </div>

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="rounded-xl px-4 py-2 max-w-[80%] bg-white border text-gray-800 select-none">
                  <TypingIndicator />
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-3 border-t flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                type="text"
                placeholder="Ask a question about this product..."
                className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              ref={inputRef}
              />
              <button
                onClick={sendMessage}
                className="text-blue-600 hover:text-blue-800"
              >
                <PaperAirplaneIcon className="h-7 w-8" />
              </button>
            </div>

            {/* Footer */}
            <div className="p-4 flex flex-col sm:flex-row sm:justify-between items-center text-xs gap-2 bg-white border-t">
              <span className="text-gray-500">Powered by Qudemo AI</span>
              <div className="flex gap-2">
                <button className="text-blue-600 font-semibold hover:underline border border-gray-300 rounded px-3 py-1.5">
                  FAQs
                </button>
                <button className="text-blue-600 font-semibold hover:underline border border-gray-300 rounded px-3 py-1.5">
                  Schedule Meeting
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
};

export default VideoDemoChatPopup;
*/