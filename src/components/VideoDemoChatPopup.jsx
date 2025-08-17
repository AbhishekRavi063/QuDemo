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
    // Convert share URL to embed URL with enhanced parameters for better API support
    const embedUrl = url.replace('/share/', '/embed/').split('?')[0];
    
    // Extract existing query parameters (like timestamp)
    const urlParams = new URLSearchParams(url.split('?')[1] || '');
    const timestamp = urlParams.get('t');
    
    // Build base embed URL with parameters
    let embedUrlWithParams = `${embedUrl}?autoplay=1&hide_share=1&hide_title=1&muted=0&enablejsapi=1&allowfullscreen=1&showinfo=0&controls=1&rel=0`;
    
    // Add timestamp back if it exists
    if (timestamp) {
      embedUrlWithParams += `&t=${timestamp}`;
    }
    
    return embedUrlWithParams;
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
    const [loomSeekAttempts, setLoomSeekAttempts] = useState(0);
    const [showLoomTimestamp, setShowLoomTimestamp] = useState(false);
    const [loomTimestampMessage, setLoomTimestampMessage] = useState('');
    const playerRef = useRef();
    const loomIframeRef = useRef();
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

    // Add message listener for Loom iframe responses
    useEffect(() => {
      const handleMessage = (event) => {
        // Only handle messages from Loom domains
        if (event.origin.includes('loom.com')) {
          console.log('🎬 Received message from Loom:', event.data);
          
          // Handle different types of responses
          if (event.data.type === 'ready') {
            console.log('🎬 Loom video is ready');
            // Try to seek to timestamp when video is ready
            if (currentTimestamp > 0 && ytVideoUrl.includes('loom.com')) {
              const videoId = extractLoomVideoId(ytVideoUrl);
              if (videoId) {
                setTimeout(() => {
                  seekLoomVideoToTimestamp(videoId, currentTimestamp);
                }, 1000);
              }
            }
          } else if (event.data.type === 'seeked') {
            console.log('🎬 Loom video seeked successfully');
          } else if (event.data.type === 'error') {
            console.log('🎬 Loom video error:', event.data.message);
          }
        }
      };

      window.addEventListener('message', handleMessage);
      return () => window.removeEventListener('message', handleMessage);
    }, [currentTimestamp, ytVideoUrl]);

    // Handle timestamp changes for Loom videos with URL-based approach
    useEffect(() => {
      if (currentTimestamp > 0 && ytVideoUrl.includes('loom.com')) {
        const videoId = extractLoomVideoId(ytVideoUrl);
        if (videoId) {
          console.log(`🎬 Timestamp changed for Loom video ${videoId}: ${currentTimestamp}s`);
          
          // Use URL-based approach - reload iframe with timestamp (only once)
        setTimeout(() => {
            seekLoomVideoToTimestamp(videoId, currentTimestamp);
          }, 1000);
        }
      }
    }, [currentTimestamp, ytVideoUrl]);

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
        console.log('🔍 Calling API URL:', askUrl);
        console.log('🔍 Request payload:', { question: userQuestion });
        
        const response = await axios.post(askUrl, {
          question: userQuestion
        }, {
          headers: { 'Content-Type': 'application/json' },
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
            text: aiAnswer,
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          }]);
          
          // Switch video if we have a valid video URL
          if (targetVideoUrl) {
            console.log('🎬 Switching to video:', targetVideoUrl, 'at timestamp:', timestamp);
            setYtVideoUrl(targetVideoUrl);
            setCurrentTimestamp(timestamp);
            setPlayingYt(true);
          }
          
          setIsTyping(false);
          console.log('🔍 Message added successfully');
          
        } catch (processingError) {
          console.error('❌ Processing failed:', processingError);
          
          // Fallback - just add the answer
          setMessages(msgs => [...msgs, {
            sender: "AI",
            text: response.data?.answer || "I found an answer but there was an error displaying it. Please try again.",
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          }]);
          setIsTyping(false);
        }
        
        // COMMENTED OUT COMPLEX PROCESSING FOR NOW
        /*
        // Log sources information
        if (response.data && response.data.sources) {
          console.log('🔍 Sources count:', response.data.sources.length);
          response.data.sources.forEach((source, index) => {
            console.log(`🔍 Source ${index + 1}:`, {
              type: source.type || 'unknown',
              title: source.title || 'unknown',
              url: source.url || 'unknown',
              timestamp: source.timestamp || 'none',
              metadata: source.metadata || 'none'
            });
          });
        }
        
        try {
          console.log('🔍 Starting answer extraction...');
          let aiAnswer = 'Sorry, I could not find an answer.';
          if (response.data && response.data.answer) {
            aiAnswer = response.data.answer;
            console.log('🔍 Answer extracted successfully');
          } else {
            console.log('🔍 No answer found in response');
          }
        */
          
                      /*
            console.log('🔍 AI Answer extracted:', aiAnswer);
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
            console.log('🔍 Is fallback answer:', isFallback);
            */
        
        // COMMENTED OUT ALL VIDEO PROCESSING
        /*
        // A helper function to build the correct URL
      const buildVideoUrlWithTimestamp = (url, timestamp) => {
        if (!url) {
          return null;
        }
        // Check if the URL already has a query string
        const separator = url.includes('?') ? '&' : '?';
        return `${url}${separator}t=${Math.floor(timestamp)}`;
      };

        console.log('🔍 Starting video switching logic...');
        
        try {
          // Video switching logic
          let targetVideoUrl = response.data && response.data.video_url;
          let timestamp = typeof response.data.start === 'number' ? response.data.start : 0;
        */
        
        /*
        console.log('🔍 About to parse timestamp...');
        if ((!timestamp || isNaN(timestamp)) && response.data && response.data.sources && response.data.sources.length > 0) {
          try {
            timestamp = parseTimestamp(response.data.sources[0]);
            console.log('🔍 Timestamp parsed successfully:', timestamp);
          } catch (timestampError) {
            console.error('❌ Timestamp parsing error:', timestampError);
            timestamp = 0;
          }
        }
        
        console.log('🔍 Video URL:', targetVideoUrl);
        console.log('🔍 Timestamp:', timestamp);
        
        console.log('🎬 Video URL from response:', targetVideoUrl);
        console.log('🎬 Timestamp from response:', timestamp);
      
      // Add timestamp to the original URL first
      let finalVideoUrl = targetVideoUrl;
      if (timestamp > 0) {
        // Only append timestamp if it's a valid number and greater than 0
        finalVideoUrl = buildVideoUrlWithTimestamp(targetVideoUrl, timestamp);
        console.log('🎬 Added timestamp to original URL:', finalVideoUrl);
      }
      
      // Convert Loom URLs to embed format (preserving timestamp)
      if (finalVideoUrl && finalVideoUrl.includes('loom.com')) {
        finalVideoUrl = convertLoomToEmbedUrl(finalVideoUrl);
        console.log('🎬 Converted Loom URL to embed format:', finalVideoUrl);
      }
        
      // Convert Vimeo URLs to embed format if needed
      if (finalVideoUrl && finalVideoUrl.includes('vimeo.com')) {
        finalVideoUrl = convertVimeoToEmbedUrl(finalVideoUrl);
        console.log('🎬 Converted Vimeo URL to embed format:', finalVideoUrl);
      }
      
      // Update video URL and timestamp
      console.log('🎬 Current video URL:', ytVideoUrl);
      console.log('🎬 Final video URL:', finalVideoUrl);
      console.log('🎬 URLs are different:', finalVideoUrl !== ytVideoUrl);
      
      if (finalVideoUrl) {
        setYtVideoUrl(finalVideoUrl);
        console.log('🎬 Updated video URL to:', finalVideoUrl);
      }
      
      // Set timestamp for seeking (works for YouTube, Loom, and Vimeo)
      if (timestamp > 0) {
        setCurrentTimestamp(timestamp);
        console.log('🎬 Set timestamp for seeking:', timestamp);
      }
      
      // Handle video playback
      if (!isFallback && finalVideoUrl) {
        console.log('🎬 Setting video to play:', finalVideoUrl);
        setPlayingYt(true);
          
          // For Loom videos, attempt automatic seeking
          if (timestamp > 0 && finalVideoUrl.includes('loom.com')) {
            // Extract video ID and trigger seeking
            const videoId = extractLoomVideoId(finalVideoUrl);
            if (videoId) {
              console.log(`🎬 Triggering Loom seeking for video ${videoId} to ${timestamp}s`);
              
              // Wait for iframe to load, then seek
              setTimeout(() => {
                seekLoomVideoToTimestamp(videoId, timestamp);
              }, 2000);
            }
            
            // Also show timestamp indicator as fallback
            setShowLoomTimestamp(true);
            const minutes = Math.floor(timestamp / 60);
            const seconds = Math.floor(timestamp % 60);
            setLoomTimestampMessage(`${minutes}:${seconds.toString().padStart(2, '0')}`);
            
            // Hide indicator after 15 seconds
            setTimeout(() => {
              setShowLoomTimestamp(false);
            }, 15000);
          }
        } else if (isFallback) {
          console.log('🎬 Fallback detected, clearing video');
          setYtVideoUrl("");
          setPlayingYt(false);
        } else if (!targetVideoUrl) {
          console.log('🎬 No video URL in response, keeping current video');
        }
        } catch (videoError) {
          console.error('❌ Video switching error:', videoError);
          console.error('❌ Video error details:', videoError.message);
          console.error('❌ Video error stack:', videoError.stack);
        }
        try {
          const cleanedAnswer = cleanMessageText(aiAnswer);
          console.log('🔍 Original answer:', aiAnswer);
          console.log('🔍 Cleaned answer:', cleanedAnswer);
          
          setMessages(msgs => [...msgs, {
            sender: "AI",
            text: cleanedAnswer,
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          }]);
          setIsTyping(false);
          console.log('🔍 Message added to UI successfully');
        } catch (messageError) {
          console.error('❌ Message setting error:', messageError);
          console.error('❌ Message error details:', messageError.message);
          console.error('❌ Message error stack:', messageError.stack);
          
          // Fallback: add a simple text message
          setMessages(msgs => [...msgs, {
            sender: "AI",
            text: aiAnswer,
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          }]);
          setIsTyping(false);
        }
        */
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
                answer: response.data?.answer || 'No answer available'
              })
            });
          } catch (err) {
            // Optionally handle error
          }
        }
              } catch (err) {
          console.error('❌ Q&A API Error:', err);
          console.error('❌ Error details:', err.response?.data || err.message);
          console.error('❌ Error status:', err.response?.status);
          
          let errorMessage = "Sorry, I couldn't process your question right now. Please try again.";
          setMessages(msgs => [...msgs, {
            sender: "AI",
            text: cleanMessageText(errorMessage),
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          }]);
          setIsTyping(false);
        }
              /*
        } catch (processingError) {
          console.error('❌ Response processing error:', processingError);
          console.error('❌ Processing error details:', processingError.message);
          console.error('❌ Processing error stack:', processingError.stack);
          
          let errorMessage = "Sorry, I couldn't process your question right now. Please try again.";
          setMessages(msgs => [...msgs, {
            sender: "AI",
            text: cleanMessageText(errorMessage),
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          }]);
          setIsTyping(false);
        }
        */
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
        console.log('🎬 Loom video ID:', videoId);
        
        // If we have a timestamp, reload the iframe with the timestamp (only once)
        if (currentTimestamp > 0) {
          console.log(`🎬 Reloading Loom video with timestamp ${currentTimestamp}s`);
          setTimeout(() => {
            seekLoomVideoToTimestamp(videoId, currentTimestamp);
          }, 2000);
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

    // Function to seek Loom video to timestamp - non-destructive methods only
    const seekLoomVideoToTimestamp = (videoId, timestamp) => {
      try {
        console.log(`🎬 Attempting to seek Loom video ${videoId} to ${timestamp}s`);
        
        if (!loomIframeRef.current) {
          console.log('🎬 Loom iframe ref not available');
          return;
        }

        const iframe = loomIframeRef.current;
        
        // Method 1: Try direct postMessage to existing iframe (non-destructive)
        setTimeout(() => {
          try {
            console.log('🎬 Method 1: Trying postMessage to existing iframe');
            iframe.contentWindow.postMessage({
              type: 'seekTo',
              time: timestamp
            }, '*');
            
            // Also try alternative postMessage formats
            iframe.contentWindow.postMessage({
              type: 'setCurrentTime',
              time: timestamp
            }, '*');
            
            iframe.contentWindow.postMessage({
              type: 'seek',
              seconds: timestamp
            }, '*');
            
            // Try Loom-specific commands
            iframe.contentWindow.postMessage({
              type: 'loom-seek',
              timestamp: timestamp
            }, '*');
            
            console.log('🎬 Sent postMessage commands to iframe');
          } catch (e) {
            console.log('🎬 PostMessage failed:', e.message);
          }
        }, 1000);

        // Method 2: Try direct video element access through iframe (non-destructive)
        setTimeout(() => {
          try {
            console.log('🎬 Method 2: Trying direct video element access');
            const iframeWindow = iframe.contentWindow;
            if (iframeWindow) {
              // Try to find and control the video element directly
              const videoElement = iframeWindow.document.querySelector('video');
              if (videoElement) {
                console.log('🎬 Found video element, seeking directly');
                videoElement.currentTime = timestamp;
                videoElement.play().then(() => {
                  console.log('🎬 Video started playing at timestamp');
                }).catch(e => {
                  console.log('🎬 Direct play failed:', e.message);
                });
              } else {
                console.log('🎬 Video element not found in iframe');
              }
            }
          } catch (e) {
            console.log('🎬 Direct video access failed:', e.message);
          }
        }, 2000);

        // Method 3: Try script injection into existing iframe (non-destructive)
        setTimeout(() => {
          try {
            console.log('🎬 Method 3: Trying script injection into existing iframe');
            const iframeWindow = iframe.contentWindow;
            if (iframeWindow) {
              // Try to inject a script that will seek the video
              const script = iframeWindow.document.createElement('script');
              script.textContent = `
                (function() {
                  function seekVideo() {
                    const video = document.querySelector('video');
                    if (video && video.readyState >= 2) {
                      console.log('🎬 Found video, seeking to ${timestamp}s');
                      video.currentTime = ${timestamp};
                      video.play().then(() => {
                        console.log('🎬 Video started playing at timestamp');
                      }).catch(e => {
                        console.log('🎬 Play failed:', e.message);
                      });
                    } else if (video) {
                      console.log('🎬 Video not ready, retrying...');
                      setTimeout(seekVideo, 500);
                    } else {
                      console.log('🎬 Video not found, retrying...');
                      setTimeout(seekVideo, 500);
                    }
                  }
                  seekVideo();
                })();
              `;
              iframeWindow.document.head.appendChild(script);
              console.log('🎬 Injected seek script into existing iframe');
            }
          } catch (e) {
            console.log('🎬 Script injection failed:', e.message);
          }
        }, 3000);

        // Method 4: Show user-friendly message about manual seeking
        setTimeout(() => {
          console.log('🎬 All automatic seeking methods failed for Loom video');
          const minutes = Math.floor(timestamp / 60);
          const seconds = Math.floor(timestamp % 60);
          const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
          
          console.log(`🎬 Manual seeking required: Jump to ${timeString}`);
          
          // Show user-friendly message
          setLoomTimestampMessage(`Please manually seek to ${timeString} in the video`);
          setShowLoomTimestamp(true);
        }, 5000);

      } catch (error) {
        console.warn('🎬 All Loom seek methods failed:', error);
      }
    };

    // Custom Loom Video Player Component
    const CustomLoomPlayer = ({ videoId, timestamp, onReady }) => {
      const [isLoading, setIsLoading] = useState(true);
      const [error, setError] = useState(null);
      
      useEffect(() => {
        if (videoId) {
          setIsLoading(true);
          setError(null);
          
          // Create a custom iframe with enhanced parameters
          const iframe = document.createElement('iframe');
          iframe.src = `https://www.loom.com/embed/${videoId}?autoplay=1&hide_share=1&hide_title=1&muted=0&enablejsapi=1&allowfullscreen=1&showinfo=0&controls=1&rel=0&loop=0&modestbranding=1`;
          iframe.style.width = '100%';
          iframe.style.height = '100%';
          iframe.frameBorder = '0';
          iframe.allowFullScreen = true;
          iframe.allow = 'autoplay; encrypted-media; fullscreen';
          
          // Replace the current iframe content
          const container = loomIframeRef.current?.parentNode;
          if (container && loomIframeRef.current) {
            container.replaceChild(iframe, loomIframeRef.current);
            loomIframeRef.current = iframe;
            
            iframe.onload = () => {
              setIsLoading(false);
              if (onReady) onReady();
              
              // Try to seek after load
              setTimeout(() => {
                try {
                  const iframeWindow = iframe.contentWindow;
                  if (iframeWindow) {
                    // Inject a script to seek the video
                    const script = iframeWindow.document.createElement('script');
                    script.textContent = `
                      (function() {
                        function seekToTimestamp() {
                          const video = document.querySelector('video');
                          if (video && video.readyState >= 2) {
                            console.log('🎬 Seeking to ${timestamp}s');
                            video.currentTime = ${timestamp};
                            video.play().then(() => {
                              console.log('🎬 Video playing at timestamp');
                            }).catch(e => {
                              console.log('🎬 Play failed, trying muted:', e.message);
                              video.muted = true;
                              video.play().then(() => {
                                setTimeout(() => { video.muted = false; }, 1000);
                              });
                            });
              } else {
                            setTimeout(seekToTimestamp, 100);
                          }
                        }
                        seekToTimestamp();
                      })();
                    `;
                    iframeWindow.document.head.appendChild(script);
                  }
                } catch (e) {
                  console.log('🎬 Custom seek failed:', e.message);
                  setError('Could not seek to timestamp');
                }
              }, 2000);
            };
            
            iframe.onerror = () => {
              setIsLoading(false);
              setError('Failed to load video');
            };
          }
        }
      }, [videoId, timestamp]);
      
      if (isLoading) {
        return (
          <div className="flex items-center justify-center h-full bg-black">
            <div className="text-white">Loading Loom video...</div>
          </div>
        );
      }
      
      if (error) {
        return (
          <div className="flex items-center justify-center h-full bg-black">
            <div className="text-red-500">{error}</div>
          </div>
        );
      }
      
      return null; // The iframe is already in the DOM
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
              <div className="relative w-full h-full">
              <HybridVideoPlayer
                key={ytVideoUrl} // Force re-render when URL changes
                url={ytVideoUrl}
                width="100%"
                height="100%"
                controls={true}
                playing={playingYt}
                startTime={currentTimestamp}
                style={{ width: '100%', height: '100%', background: 'black' }}
                onReady={() => {
                  handleVideoReady();
                  console.log('Video ready for chat');
                }}
                onPlay={() => {
                  console.log('Video playing in chat');
                }}
                iframeRef={loomIframeRef}
              />
                
                {/* Loom Timestamp Indicator */}
                {showLoomTimestamp && ytVideoUrl.includes('loom.com') && currentTimestamp > 0 && (
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