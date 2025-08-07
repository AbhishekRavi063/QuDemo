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
  return parts.map(part => `<p>${part.trim()}</p>`).join("");
};

// Helper function to convert Loom share URL to embed URL
const convertLoomToEmbedUrl = (url) => {
  if (url && url.includes('loom.com/share/')) {
    // Convert share URL to embed URL and add autoplay parameters
    const embedUrl = url.replace('/share/', '/embed/').split('?')[0];
    return `${embedUrl}?autoplay=1&hide_share=1&hide_title=1&muted=0`;
  }
  return url;
};

// Helper function to convert Vimeo share URL to embed URL
const convertVimeoToEmbedUrl = (url) => {
  if (url && url.includes('vimeo.com/')) {
    // Extract video ID from various Vimeo URL formats
    const videoId = url.split('vimeo.com/')[1].split('?')[0].split('/')[0];
    if (videoId) {
      // Convert to embed URL and add autoplay parameters
      return `https://player.vimeo.com/video/${videoId}?autoplay=1&muted=0&controls=1`;
    }
  }
  return url;
};

// Helper function to parse timestamp from source string
const parseTimestamp = (sourceString) => {
  // Look for timestamp pattern like [00:01:23,456 - 00:01:45,789]
  const timestampMatch = sourceString.match(/\[(\d{2}):(\d{2}):(\d{2}),(\d{3})\s*-\s*(\d{2}):(\d{2}):(\d{2}),(\d{3})\]/);
  if (timestampMatch) {
    // Convert to seconds (use start time)
    const hours = parseInt(timestampMatch[1]);
    const minutes = parseInt(timestampMatch[2]);
    const seconds = parseInt(timestampMatch[3]);
    const milliseconds = parseInt(timestampMatch[4]);
    const totalSeconds = hours * 3600 + minutes * 60 + seconds + milliseconds / 1000;
    console.log(`Parsed timestamp: ${hours}:${minutes}:${seconds},${milliseconds} = ${totalSeconds} seconds`);
    return totalSeconds;
  }
  
  // Alternative pattern: [00:01:23 - 00:01:45]
  const simpleTimestampMatch = sourceString.match(/\[(\d{2}):(\d{2}):(\d{2})\s*-\s*(\d{2}):(\d{2}):(\d{2})\]/);
  if (simpleTimestampMatch) {
    const hours = parseInt(simpleTimestampMatch[1]);
    const minutes = parseInt(simpleTimestampMatch[2]);
    const seconds = parseInt(simpleTimestampMatch[3]);
    const totalSeconds = hours * 3600 + minutes * 60 + seconds;
    console.log(`Parsed simple timestamp: ${hours}:${minutes}:${seconds} = ${totalSeconds} seconds`);
    return totalSeconds;
  }
  
  console.log('No timestamp found in:', sourceString);
  return 0;
};

// Helper function to extract video URL from sources
const extractVideoUrl = (sources, companyVideos) => {
  if (!sources || sources.length === 0) return null;
  
  // First, try to find a direct video URL in the sources
  for (const source of sources) {
    if (source.includes('http') && (
      source.includes('youtube.com') || 
      source.includes('youtu.be') ||
      source.includes('loom.com') ||
      source.includes('vimeo.com')
    )) {
      return source;
    }
  }
  
  // If no direct URL found, try to match with company videos
  if (companyVideos && companyVideos.length > 0) {
    // For now, return a random video from company videos
    // In a more sophisticated implementation, you could match based on source filename
    return companyVideos[Math.floor(Math.random() * companyVideos.length)].video_url;
  }
  
  return null;
};

const VideoDemoChatPopup = ({ leadId }) => {
    const { company, isLoading } = useCompany();
    const [messages, setMessages] = useState([
      {
        sender: "AI",
        text: cleanMessageText(`Hello! I'm your AI Assistant for this demo.`),
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);
    const [companyVideos, setCompanyVideos] = useState([]);
    const [ytVideoUrl, setYtVideoUrl] = useState("");
    const [playingYt, setPlayingYt] = useState(true);
    const [isTyping, setIsTyping] = useState(false);
    const [input, setInput] = useState("");
    const [currentTimestamp, setCurrentTimestamp] = useState(0);
    const [audioEnabled, setAudioEnabled] = useState(false);
    const playerRef = useRef();
    const loomIframeRef = useRef(null);
    const [loomVideoId, setLoomVideoId] = useState(null);
    const navigate = useNavigate();

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

    // Fetch company videos on mount or when company changes
    useEffect(() => {
      if (!company || !company.id) return;
      const fetchVideos = async () => {
        try {
          const token = localStorage.getItem('accessToken');
          const res = await fetch(getNodeApiUrl(`/api/qudemos?companyId=${company.id}`), {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          const data = await res.json();
          if (res.ok && data.success && Array.isArray(data.data) && data.data.length > 0) {
            setCompanyVideos(data.data);
            // Pick a random video
            const randomVideo = data.data[Math.floor(Math.random() * data.data.length)];
            setYtVideoUrl(randomVideo.video_url);
          } else {
            setCompanyVideos([]);
            setYtVideoUrl("");
          }
        } catch (err) {
          setCompanyVideos([]);
          setYtVideoUrl("");
        }
      };
      fetchVideos();
      
      // Check if Python backend is running
      const checkPythonBackend = async () => {
        try {
          const healthUrl = getVideoApiUrl('/health');
          const healthRes = await axios.get(healthUrl, { timeout: 5000 });
          console.log('Python backend health check:', healthRes.data);
        } catch (err) {
          console.warn('Python backend health check failed:', err.message);
        }
      };
      checkPythonBackend();
    }, [company]);

    // Handle timestamp changes for Loom videos
    useEffect(() => {
      if (currentTimestamp > 0 && ytVideoUrl.includes('loom.com') && loomVideoId) {
        console.log(`🎬 Timestamp changed for Loom video ${loomVideoId}: ${currentTimestamp}s`);
        // Wait a bit for the iframe to be ready, then seek and autoplay
        setTimeout(() => {
          seekLoomVideoToTimestamp(loomVideoId, currentTimestamp);
        }, 2000);
      }
    }, [currentTimestamp, ytVideoUrl, loomVideoId]);

    const sendMessage = async () => {
      if (!input.trim()) return;
      const userQuestion = input;
      setMessages([...messages, {
        sender: "You",
        text: userQuestion,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }]);
      setInput("");
      setIsTyping(true);
      try {
        // Call the Python backend API for Q&A
        if (!company || !company.name) throw new Error('Company information is not available');
        
        console.log('🔍 Sending Q&A request for company:', company.name);
        console.log('🔍 Question:', userQuestion);
        
        const askUrl = getVideoApiUrl(`/ask/${encodeURIComponent(company.name)}`);
        const response = await axios.post(askUrl, {
          question: userQuestion
        }, {
          headers: { 'Content-Type': 'application/json' },
          timeout: 30000
        });
        
        console.log('✅ Q&A response:', response.data);
        
        let aiAnswer = 'Sorry, I could not find an answer.';
        if (response.data && response.data.answer) {
          aiAnswer = response.data.answer;
        }
        // Fallback answer detection
        const fallbackPhrases = [
          "I do not have that information",
          "I don't have that information",
          "I do not know",
          "I don't know",
          "no information available",
          "I couldn't find any information",
          "Sorry, I couldn't find",
          "Sorry, I do not have",
          "I don't have specific details",
          "not have specific information",
          "not found in the video transcripts",
          "please refer to a different source"
        ];
        const answerLower = aiAnswer.toLowerCase();
        const isGenericFallback = (
          !aiAnswer.trim() ||
          fallbackPhrases.some(phrase => answerLower.includes(phrase.toLowerCase())) ||
          ((answerLower.includes('sorry') || answerLower.includes('apologize')) &&
            (answerLower.includes('not have') || answerLower.includes('do not have') || answerLower.includes('no information'))) ||
          answerLower.includes('i do not know') ||
          answerLower.includes("i don't know")
        );
        const isFallback = isGenericFallback;
        // Video switching logic
        let targetVideoUrl = response.data && response.data.video_url;
        let timestamp = typeof response.data.start === 'number' ? response.data.start : 0;
        if ((!timestamp || isNaN(timestamp)) && response.data && response.data.sources && response.data.sources.length > 0) {
          timestamp = parseTimestamp(response.data.sources[0]);
        }
        
        console.log('🎬 Video URL from response:', targetVideoUrl);
        console.log('🎬 Current video URL:', ytVideoUrl);
        console.log('🎬 Timestamp from response:', timestamp);
        console.log('🎬 Is fallback answer:', isFallback);
        
        // Convert Loom URLs to embed format if needed
        if (targetVideoUrl && targetVideoUrl.includes('loom.com')) {
          targetVideoUrl = convertLoomToEmbedUrl(targetVideoUrl);
          console.log('🎬 Converted Loom URL to embed format:', targetVideoUrl);
        }
        
        // Convert Vimeo URLs to embed format if needed
        if (targetVideoUrl && targetVideoUrl.includes('vimeo.com')) {
          targetVideoUrl = convertVimeoToEmbedUrl(targetVideoUrl);
          console.log('🎬 Converted Vimeo URL to embed format:', targetVideoUrl);
        }
        
        // For Loom videos, we can't seek to timestamps, so we'll show the video
        // and let the user know about the timestamp if available
        if (!isFallback && targetVideoUrl) {
          console.log('🎬 Updating video URL to:', targetVideoUrl);
          setYtVideoUrl(targetVideoUrl);
          setCurrentTimestamp(timestamp);
          setPlayingYt(true);
          
          // If there's a timestamp, add it to the answer for Loom videos
          if (timestamp > 0 && targetVideoUrl.includes('loom.com')) {
            // Extract video ID and trigger autoplay/seeking
            const videoId = extractLoomVideoId(targetVideoUrl);
            if (videoId) {
              setLoomVideoId(videoId);
              // Wait for iframe to load, then seek and autoplay
              setTimeout(() => {
                seekLoomVideoToTimestamp(videoId, timestamp);
              }, 3000);
            }
          }
        } else if (isFallback) {
          console.log('🎬 Fallback detected, clearing video');
          setYtVideoUrl("");
          setPlayingYt(false);
        } else if (!targetVideoUrl) {
          console.log('🎬 No video URL in response, keeping current video');
        }
        setMessages(msgs => [...msgs, {
          sender: "AI",
          text: cleanMessageText(aiAnswer),
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }]);
        setIsTyping(false);
        // Store interaction in backend
        if (leadId && company?.id) {
          try {
            await fetch(getNodeApiUrl(`/api/companies/user-interaction`), {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                lead_id: leadId,
                company_id: company.id,
                question: userQuestion,
                answer: aiAnswer
              })
            });
          } catch (err) {
            // Optionally handle error
          }
        }
      } catch (err) {
        let errorMessage = "Sorry, I couldn't process your question right now. Please try again.";
        setMessages(msgs => [...msgs, {
          sender: "AI",
          text: cleanMessageText(errorMessage),
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }]);
        setIsTyping(false);
      }
    };

    const handleClose = () => navigate("/");

    // Function to seek to timestamp when video is ready
    const handleVideoReady = () => {
      if (currentTimestamp > 0 && playerRef.current && !ytVideoUrl.includes('loom.com') && !ytVideoUrl.includes('vimeo.com')) {
        // Only seek for non-Loom/non-Vimeo videos (YouTube, etc.)
        setTimeout(() => {
          playerRef.current.seekTo(currentTimestamp, 'seconds');
          console.log('Seeking to timestamp:', currentTimestamp);
        }, 1000);
      } else if (currentTimestamp > 0 && ytVideoUrl.includes('loom.com')) {
        // For Loom videos, we can't seek, so just log the timestamp
        const minutes = Math.floor(currentTimestamp / 60);
        const seconds = Math.floor(currentTimestamp % 60);
        console.log(`Loom video loaded. Relevant content at ${minutes}:${seconds.toString().padStart(2, '0')}`);
      } else if (currentTimestamp > 0 && ytVideoUrl.includes('vimeo.com')) {
        // For Vimeo videos, we can't seek, so just log the timestamp
        const minutes = Math.floor(currentTimestamp / 60);
        const seconds = Math.floor(currentTimestamp % 60);
        console.log(`Vimeo video loaded. Relevant content at ${minutes}:${seconds.toString().padStart(2, '0')}`);
      }
    };

    // Function to handle Loom video load and autoplay
    const handleLoomVideoLoad = () => {
      console.log('🎬 Loom video iframe loaded');
      
      // Extract video ID from URL
      const videoId = extractLoomVideoId(ytVideoUrl);
      if (videoId) {
        setLoomVideoId(videoId);
        console.log('🎬 Loom video ID:', videoId);
        
        // Try to autoplay and seek to timestamp
        if (currentTimestamp > 0) {
          setTimeout(() => {
            seekLoomVideoToTimestamp(videoId, currentTimestamp);
          }, 2000); // Wait for video to be ready
        }
      }
    };

    // Extract Loom video ID from URL
    const extractLoomVideoId = (url) => {
      if (!url) return null;
      const cleanUrl = url.split('?')[0];
      const match = cleanUrl.match(/loom\.com\/(?:share|embed|recordings)\/([a-zA-Z0-9-]+)/);
      return match ? match[1] : null;
    };

    // Function to seek Loom video to timestamp using postMessage
    const seekLoomVideoToTimestamp = (videoId, timestamp) => {
      try {
        if (loomIframeRef.current && loomIframeRef.current.contentWindow) {
          // Send postMessage to Loom iframe to seek to timestamp
          const message = {
            type: 'seek',
            timestamp: timestamp
          };
          
          loomIframeRef.current.contentWindow.postMessage(message, '*');
          console.log(`🎬 Sent seek command to Loom video ${videoId} at ${timestamp}s`);
          
          // Also try to autoplay
          const playMessage = {
            type: 'play'
          };
          loomIframeRef.current.contentWindow.postMessage(playMessage, '*');
          console.log(`🎬 Sent play command to Loom video ${videoId}`);
          
          // Alternative approach: try to access Loom's embed API
          setTimeout(() => {
            try {
              // Try to access the video element directly
              const iframe = loomIframeRef.current;
              const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
              const videoElement = iframeDoc.querySelector('video');
              
              if (videoElement) {
                console.log('🎬 Found video element, attempting to seek and play');
                videoElement.currentTime = timestamp;
                videoElement.play();
              } else {
                console.log('🎬 Video element not found, using postMessage fallback');
              }
            } catch (error) {
              console.log('🎬 Could not access iframe content directly:', error.message);
            }
          }, 1000);
        }
      } catch (error) {
        console.warn('🎬 Could not send postMessage to Loom iframe:', error);
      }
    };

    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      );
    }

    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <div
          className="w-full max-w-7xl h-full max-h-[85vh] bg-white rounded-lg shadow-2xl flex flex-col md:flex-row overflow-hidden relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Video Section (YouTube) */}
          <div 
            className="w-full md:w-2/3 relative flex flex-col items-center justify-center bg-black"
            onClick={enableAudio}
          >
            {/* Use HybridVideoPlayer for all video types */}
            {ytVideoUrl ? (
              <HybridVideoPlayer
                url={ytVideoUrl}
                width="100%"
                height="100%"
                controls={true}
                playing={playingYt}
                style={{ maxHeight: 400, background: 'black' }}
                onReady={() => {
                  handleVideoReady();
                  console.log('Video ready for chat');
                }}
                onPlay={() => {
                  console.log('Video playing in chat');
                }}
              />
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
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
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