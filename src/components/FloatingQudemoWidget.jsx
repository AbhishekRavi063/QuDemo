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
  const [inputMessage, setInputMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const videoPlayerRef = useRef(null);
  const chatMessagesRef = useRef(null);
  const videoPreloadCacheRef = useRef({}); // Cache of preloaded video elements
  const recognitionRef = useRef(null);

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
    setupSpeechRecognition();
  }, []);

  // Load full data when expanded
  useEffect(() => {
    if (isExpanded && !videoFlow && !loading) {
      loadBetaVersionData();
    }
  }, [isExpanded]);

  // Auto-scroll chat messages
  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Aggressive video preloading - actually load videos into memory for instant playback
  useEffect(() => {
    if (!videoFlow || currentVideoIndex === null || currentVideoIndex === undefined) return;
    
    const videosToPreload = [];
    
    // Preload next video in sequence (highest priority)
    if (currentVideoIndex + 1 < videoFlow.videos.length) {
      videosToPreload.push(videoFlow.videos[currentVideoIndex + 1]);
    }
    
    // Preload videos from current video's nextQuestions
    const currentVideo = videoFlow.videos[currentVideoIndex];
    if (currentVideo?.nextQuestions) {
      currentVideo.nextQuestions.forEach(question => {
        const result = matchQuestion(question.text);
        if (result.matched) {
          const matchedVideo = videoFlow.videos.find(v => v.id === result.videoId);
          if (matchedVideo && !videosToPreload.includes(matchedVideo)) {
            videosToPreload.push(matchedVideo);
          }
        }
      });
    }
    
    // Actually preload videos (limit to 3 to avoid bandwidth waste)
    videosToPreload.slice(0, 3).forEach((video, index) => {
      // Skip if already preloaded
      if (videoPreloadCacheRef.current[video.id]) {
        console.log('✅ Widget - Already cached:', video.id);
        return;
      }
      
      // Create hidden video element for preloading
      const preloadVideo = document.createElement('video');
      preloadVideo.src = video.url || video.src;
      preloadVideo.preload = 'auto'; // Aggressively preload
      preloadVideo.muted = true;
      preloadVideo.style.display = 'none';
      
      // Add to DOM to trigger loading
      document.body.appendChild(preloadVideo);
      
      // Track loading progress
      preloadVideo.addEventListener('loadeddata', () => {
        console.log('✅ Widget - Video cached and ready:', video.id, `(${index + 1}/${videosToPreload.slice(0, 3).length})`);
        videoPreloadCacheRef.current[video.id] = {
          element: preloadVideo,
          ready: true,
          src: video.url || video.src
        };
      });
      
      preloadVideo.addEventListener('error', () => {
        console.error('❌ Widget - Failed to preload:', video.id);
        if (preloadVideo.parentNode) {
          preloadVideo.parentNode.removeChild(preloadVideo);
        }
      });
      
      // Store reference immediately (even before loaded)
      videoPreloadCacheRef.current[video.id] = {
        element: preloadVideo,
        ready: false,
        src: video.url || video.src
      };
      
      console.log('🔄 Widget - Preloading video:', video.id, `(${index + 1}/${videosToPreload.slice(0, 3).length})`);
    });
    
    // Cleanup old cached videos (keep only last 5)
    const cachedIds = Object.keys(videoPreloadCacheRef.current);
    if (cachedIds.length > 5) {
      cachedIds.slice(0, cachedIds.length - 5).forEach(id => {
        const cached = videoPreloadCacheRef.current[id];
        if (cached?.element?.parentNode) {
          cached.element.parentNode.removeChild(cached.element);
        }
        delete videoPreloadCacheRef.current[id];
        console.log('🗑️ Widget - Removed old cache:', id);
      });
    }
  }, [currentVideoIndex, videoFlow]);

  // Update video when currentVideoIndex changes
  useEffect(() => {
    if (videoPlayerRef.current && videoFlow?.videos[currentVideoIndex]) {
      const video = videoFlow.videos[currentVideoIndex];
      
      console.log('📹 Widget - Loading video:', video.title);
      console.log('📝 Widget - Video ID:', video.id);
      console.log('📝 Widget - Subtitle URL:', video.subtitle);
      
      // Check if video is cached
      const cachedVideo = videoPreloadCacheRef.current[video.id];
      if (cachedVideo && cachedVideo.ready) {
        console.log('⚡ Widget - Using cached video:', video.id);
      }
      
      // Reset video ended state
      setVideoEnded(false);
      
      // Set video source
      const videoUrl = video.url || video.src;
      if (videoPlayerRef.current.src !== videoUrl) {
        videoPlayerRef.current.src = videoUrl;
      }
      videoPlayerRef.current.currentTime = currentTimestamp;
      videoPlayerRef.current.load();
      
      // Load subtitles after video is ready
      const handleMetadataLoaded = () => {
        if (video.subtitle) {
          console.log('✅ Loading subtitles:', video.subtitle);
          loadSubtitles(video.subtitle);
        }
      };
      videoPlayerRef.current.addEventListener('loadedmetadata', handleMetadataLoaded, { once: true });
      
      // Auto-play when ready
      const handleCanPlay = () => {
        videoPlayerRef.current.play().catch((err) => {
          console.log('Autoplay prevented:', err);
        });
      };
      videoPlayerRef.current.addEventListener('canplay', handleCanPlay, { once: true });

      // Handle video ended - hide subtitles and show questions
      const handleVideoEnded = () => {
        console.log('🎬 Video ended - showing questions');
        setVideoEnded(true);
        
        // Hide subtitles when video ends
        if (videoPlayerRef.current && videoPlayerRef.current.textTracks) {
          for (let i = 0; i < videoPlayerRef.current.textTracks.length; i++) {
            videoPlayerRef.current.textTracks[i].mode = 'disabled';
          }
        }
      };
      videoPlayerRef.current.addEventListener('ended', handleVideoEnded, { once: true });

      // Cleanup function
      return () => {
        if (videoPlayerRef.current) {
          videoPlayerRef.current.removeEventListener('loadedmetadata', handleMetadataLoaded);
          videoPlayerRef.current.removeEventListener('canplay', handleCanPlay);
          videoPlayerRef.current.removeEventListener('ended', handleVideoEnded);
        }
      };
    }
  }, [currentVideoIndex, videoFlow, currentTimestamp]);

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

  // ========== SPEECH RECOGNITION ==========
  const setupSpeechRecognition = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setInputMessage(finalTranscript);
          recognition.stop();
        }
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
    }
  };

  // Check if question is about sales/meeting
  const isSalesRelated = (question) => {
    const lowerQuestion = question.toLowerCase();
    const salesKeywords = [
      'sales', 'talk to sales', 'connect with sales', 'speak to sales',
      'book a call', 'schedule a call', 'book meeting', 'schedule meeting',
      'demo call', 'sales team', 'talk to someone', 'speak to someone',
      'contact sales', 'get in touch', 'arrange a call', 'setup a call',
      'meeting', 'call', 'talk', 'speak', 'connect me', 'reach out'
    ];
    return salesKeywords.some(keyword => lowerQuestion.includes(keyword));
  };

  const handleBookMeeting = () => {
    window.open('https://calendly.com/jazeemchoori/30min', '_blank', 'noopener,noreferrer');
  };

  // ========== USER INPUT HANDLING ==========
  const handleInputChange = (e) => {
    setInputMessage(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleVoiceInput = async () => {
    if (!recognitionRef.current) {
      alert('Voice input is not supported in your browser.\n\nPlease use Chrome, Edge, or Safari.');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        recognitionRef.current.start();
      } catch (error) {
        alert('Could not access microphone. Please check permissions.');
      }
    }
  };

  const handleSendMessage = async (messageText = null) => {
    const userQuestion = messageText || inputMessage.trim();
    if (!userQuestion || isTyping) return;

    // Add user message
    setChatMessages(prev => [...prev, { type: 'user', text: userQuestion }]);
    setInputMessage('');
    setIsTyping(true);
    setVideoEnded(false); // Hide video ended overlay when new question is asked

    // Check if user wants to book a meeting
    if (isSalesRelated(userQuestion)) {
      setIsTyping(false);
      setChatMessages(prev => [...prev, { 
        type: 'bot', 
        text: "I'd be happy to connect you with our team! Please click the 'Book a Meeting' button below to schedule a call with our sales team."
      }]);
      return;
    }

    // Find matching video in video flow
    const matchResult = matchQuestion(userQuestion);
    
    setTimeout(() => {
      if (matchResult.matched && matchResult.videoIndex !== null && matchResult.videoIndex !== -1) {
        // Add bot response with the matched video's answer
        setChatMessages(prev => [...prev, { 
          type: 'bot', 
          text: matchResult.isFallback 
            ? matchResult.answer 
            : (matchResult.answer || "Let me show you a video that answers your question!")
        }]);

        // Play the matched video (this will trigger the useEffect which resets videoEnded)
        setCurrentVideoIndex(matchResult.videoIndex);
        setCurrentTimestamp(0);
        
        // Auto-play video
        setTimeout(() => {
          if (videoPlayerRef.current) {
            videoPlayerRef.current.play().catch(err => {
              console.log('Autoplay prevented:', err);
            });
          }
        }, 100);
        
      } else {
        // No match found - generic response
        setChatMessages(prev => [...prev, { 
          type: 'bot', 
          text: "I'm not sure about that. You can ask me about Qudemo, pricing, security, or other features!"
        }]);
      }
      
      setIsTyping(false);
    }, 300); // Reduced delay for faster response
  };

  const handleSuggestedQuestionClick = (question) => {
    handleSendMessage(question);
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

  const matchQuestion = (userQuestion) => {
    if (!videoFlow || !videoFlow.videos) return { matched: false };

    // Normalize voice recognition variations
    let normalizedQuestion = userQuestion.toLowerCase().trim();
    
    // Handle voice recognition variations of "Qudemo"
    normalizedQuestion = normalizedQuestion.replace(/\bq\s*demo\b/gi, 'qudemo');
    normalizedQuestion = normalizedQuestion.replace(/\bq\s*d\s*e\s*m\s*o\b/gi, 'qudemo');
    normalizedQuestion = normalizedQuestion.replace(/\bque\s*demo\b/gi, 'qudemo');
    normalizedQuestion = normalizedQuestion.replace(/\bcue\s*demo\b/gi, 'qudemo');
    
    // Handle voice recognition variations of "Chatwoot"
    normalizedQuestion = normalizedQuestion.replace(/\bchat\s*wood\b/gi, 'chatwoot');
    normalizedQuestion = normalizedQuestion.replace(/\bchatwood\b/gi, 'chatwoot');
    normalizedQuestion = normalizedQuestion.replace(/\bchat\s*woot\b/gi, 'chatwoot');
    normalizedQuestion = normalizedQuestion.replace(/\bchat\s*wot\b/gi, 'chatwoot');
    normalizedQuestion = normalizedQuestion.replace(/\bchatwot\b/gi, 'chatwoot');
    
    const lowerQuestion = normalizedQuestion;
    
    console.log('🔍 Widget - Original question:', userQuestion);
    if (normalizedQuestion !== userQuestion.toLowerCase().trim()) {
      console.log('🔄 Widget - Normalized to:', normalizedQuestion);
    }
    
    // First pass: Exact match with video questions (skip intro)
    for (const video of videoFlow.videos) {
      if (video.question && !video.isIntro) {
        const lowerVideoQuestion = video.question.toLowerCase();
        if (lowerQuestion === lowerVideoQuestion) {
          console.log('✅ Exact match found:', video.question, '(video:', video.id + ')');
          const videoIndex = videoFlow.videos.findIndex(v => v.id === video.id);
          return { 
            matched: true, 
            videoId: video.id, 
            videoIndex: videoIndex,
            question: video.question,
            answer: video.answer,
            confidence: 'high'
          };
        }
      }
    }

    // Second pass: Contains match (skip intro)
    for (const video of videoFlow.videos) {
      if (video.question && !video.isIntro) {
        const lowerVideoQuestion = video.question.toLowerCase();
        if (lowerQuestion.includes(lowerVideoQuestion) || lowerVideoQuestion.includes(lowerQuestion)) {
          console.log('✅ Substring match found:', video.question, '(video:', video.id + ')');
          const videoIndex = videoFlow.videos.findIndex(v => v.id === video.id);
          return { 
            matched: true, 
            videoId: video.id, 
            videoIndex: videoIndex,
            question: video.question,
            answer: video.answer,
            confidence: 'high' 
          };
        }
      }
    }

    // Third pass: Keyword-based matching for key questions
    const keywordMappings = [
      { keywords: ['what is qudemo', 'what is this', 'what is demo', 'tell me about'], videoId: 'video_1', videoQuestion: 'What is Qudemo?' },
      { keywords: ['how does qudemo work', 'how qudemo works', 'how does it work', 'how does demo work', 'how demo works'], videoId: 'video_2', videoQuestion: 'How does Qudemo work?' },
      { keywords: ['who is qudemo for', 'who can use', 'who should use', 'who is demo for'], videoId: 'video_3', videoQuestion: 'Who is Qudemo for?' },
      { keywords: ['pricing', 'how much', 'cost', "what's the pricing"], videoId: 'video_12', videoQuestion: "What's the pricing?" },
      { keywords: ['secure', 'security', 'how secure'], videoId: 'video_11', videoQuestion: 'How secure is my data?' },
      { keywords: ['integrate', 'integration'], videoId: 'video_14', videoQuestion: 'Can I integrate Qudemo with other tools?' },
      { keywords: ['embed', 'share'], videoId: 'video_7', videoQuestion: 'Can I embed Qudemo or share it?' },
      { keywords: ['insights', 'what insights'], videoId: 'video_9', videoQuestion: 'What insights can I see?' },
      { keywords: ['onboarding', 'training'], videoId: 'video_10', videoQuestion: 'Can I use Qudemo for onboarding or training?' },
    ];

    for (const mapping of keywordMappings) {
      for (const keyword of mapping.keywords) {
        if (lowerQuestion.includes(keyword)) {
          const matchedVideo = videoFlow.videos.find(v => v.id === mapping.videoId);
          if (matchedVideo) {
            console.log('✅ Keyword match found:', matchedVideo.question, '(video:', matchedVideo.id + ')');
            const videoIndex = videoFlow.videos.findIndex(v => v.id === matchedVideo.id);
            return { 
              matched: true, 
              videoId: matchedVideo.id, 
              videoIndex: videoIndex,
              question: matchedVideo.question,
              answer: matchedVideo.answer,
              confidence: 'high' 
            };
          }
        }
      }
    }

    // Fourth pass: Word-based fuzzy matching (skip intro, more conservative)
    for (const video of videoFlow.videos) {
      if (video.question && !video.isIntro && video.question !== 'Fallback Response') {
        const lowerVideoQuestion = video.question.toLowerCase();
        const videoWords = lowerVideoQuestion.split(/\W+/).filter(w => w.length > 3);
        const questionWords = lowerQuestion.split(/\W+/).filter(w => w.length > 3);
        
        // Need at least 3 matching words for fuzzy match
        const matchingWords = videoWords.filter(word => questionWords.includes(word));
        
        if (matchingWords.length >= 3) {
          console.log('✅ Fuzzy match found:', video.question, '(video:', video.id + ')');
          const videoIndex = videoFlow.videos.findIndex(v => v.id === video.id);
          return { 
            matched: true, 
            videoId: video.id, 
            videoIndex: videoIndex,
            question: video.question,
            answer: video.answer,
            confidence: 'medium' 
          };
        }
      }
    }

    // Fallback video (use designated fallback or second video, never intro)
    console.log('⚠️ No match found, using fallback');
    const fallbackVideo = videoFlow.videos.find(v => v.isFallback) || videoFlow.videos[1];
    if (fallbackVideo) {
      const videoIndex = videoFlow.videos.findIndex(v => v.id === fallbackVideo.id);
      return { 
        matched: true, 
        videoId: fallbackVideo.id, 
        videoIndex: videoIndex,
        question: fallbackVideo.question,
        answer: fallbackVideo.answer,
        confidence: 'fallback', 
        isFallback: true 
      };
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
    
    // Clean up preloaded videos when widget is closed
    Object.keys(videoPreloadCacheRef.current).forEach(id => {
      const cached = videoPreloadCacheRef.current[id];
      if (cached?.element?.parentNode) {
        cached.element.parentNode.removeChild(cached.element);
      }
    });
    videoPreloadCacheRef.current = {};
    console.log('🧹 Widget - Cleared video cache on close');
  };

  // ========== RENDER HELPERS ==========
  const TypingIndicator = () => (
    <div className="flex justify-start">
      <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl px-4 py-3 max-w-[80%]">
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );

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
            {videoFlow && videoFlow.videos && videoFlow.videos[0] && videoFlow.videos[0].src ? (
              <video 
                src={videoFlow.videos[0].src || videoFlow.videos[0].url}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (videoThumbnail || previewImage) ? (
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
         // Full expanded widget - horizontal layout with video left and chat right
         <div className="bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-row" style={{ width: '950px', height: '500px' }}>
           {loading ? (
             <div className="w-full p-8 flex flex-col items-center justify-center bg-white">
               <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
               <p className="mt-4 text-gray-600">Loading demo...</p>
             </div>
           ) : videoFlow && videoFlow.videos && videoFlow.videos.length > 0 ? (
             <>
               {/* Close button - absolute positioned */}
               <button
                 onClick={handleClose}
                 className="absolute top-4 right-4 z-30 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-2 transition-all"
               >
                 <XMarkIcon className="w-5 h-5" />
               </button>

               {/* Video Section (Left - 2/3) */}
               <div className="w-2/3 relative bg-black flex items-center justify-center">
                 <style>{`
                   video::cue {
                     font-size: 12px;
                     line-height: 1.0;
                     background-color: rgba(0, 0, 0, 0.8);
                   }
                 `}</style>
                 <video 
                   ref={videoPlayerRef}
                   controls 
                   muted
                   className="w-full h-full object-contain bg-black"
                   playsInline
                   preload="auto"
                   crossOrigin="anonymous"
                 >
                   Your browser does not support the video tag.
                 </video>

                 {/* Suggested Questions Overlay - Only show after video ends */}
                 {videoEnded && videoFlow?.videos[currentVideoIndex]?.nextQuestions && videoFlow.videos[currentVideoIndex].nextQuestions.length > 0 && (
                   <div className="absolute bottom-16 left-0 right-0 px-6 pb-4 pointer-events-none">
                     <div className="flex flex-wrap gap-2 justify-center pointer-events-auto">
                       {videoFlow.videos[currentVideoIndex].nextQuestions.slice(0, 3).map((question, index) => (
                         <button
                           key={index}
                           onClick={() => handleSuggestedQuestionClick(question.text)}
                           disabled={isTyping}
                           className="bg-gray-900 bg-opacity-80 hover:bg-opacity-95 text-white px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm border border-gray-700 hover:border-gray-500"
                         >
                           {question.text}
                         </button>
                       ))}
                     </div>
                   </div>
                 )}
               </div>

               {/* Chat Section (Right - 1/3) */}
               <div className="w-1/3 flex flex-col bg-white border-l border-gray-200">
                 {/* Chat header */}
                 <div className="bg-blue-600 text-white px-4 py-3 flex items-center gap-2 flex-shrink-0">
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
                   </svg>
                   <span className="font-semibold text-sm">Ask questions</span>
                 </div>

                 {/* Chat messages */}
                 <div ref={chatMessagesRef} className="flex-1 overflow-y-auto p-3 bg-gray-50 flex flex-col gap-2">
                   {chatMessages.length === 0 ? (
                     <div className="text-center text-gray-500 text-sm py-4">
                       👋 Hi! Ask me anything about this demo
                     </div>
                   ) : (
                     <>
                       {chatMessages.map((msg, i) => (
                         <div key={i} className={`flex ${msg.type === 'bot' ? 'justify-start' : 'justify-end'}`}>
                           <div className={`max-w-[85%] px-3 py-2 rounded-xl text-sm leading-relaxed text-left ${msg.type === 'bot' ? 'bg-white border border-gray-200 text-gray-800' : 'bg-blue-600 text-white'}`}>
                             {msg.text}
                           </div>
                         </div>
                       ))}
                       {isTyping && <TypingIndicator />}
                     </>
                   )}
                 </div>

                 {/* Chat input */}
                 <div className="flex items-end gap-2 p-3 border-t border-gray-200 bg-white flex-shrink-0">
                   <textarea 
                     value={inputMessage} 
                     onChange={handleInputChange} 
                     onKeyDown={handleKeyPress} 
                     placeholder={isListening ? '🎙️ Listening...' : 'Ask a question...'} 
                     rows="1" 
                     className={`flex-1 px-3 py-2.5 border ${isListening ? 'border-green-500' : 'border-gray-300'} rounded-lg text-sm resize-none overflow-hidden min-h-[2.5rem] max-h-[7.5rem] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm`}
                   />
                   <button 
                     onClick={handleVoiceInput} 
                     className={`min-w-[2.5rem] h-10 flex items-center justify-center rounded-lg text-white transition-all duration-200 ${isListening ? 'bg-gradient-to-br from-green-500 to-green-600 animate-pulse' : 'bg-gradient-to-br from-blue-500 to-blue-600 hover:shadow-lg hover:-translate-y-0.5'}`}
                   >
                     🎤
                   </button>
                   <button 
                     onClick={() => handleSendMessage()} 
                     disabled={!inputMessage.trim() || isTyping} 
                     className="min-w-[2.5rem] h-10 flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 12L3.269 3.125A59.769 59.769 0 0121.485 12 59.768 59.768 0 013.27 20.875L5.999 12zm0 0h7.5"></path>
                     </svg>
                   </button>
                 </div>

                 {/* Book Meeting Button - Always Visible */}
                 <div className="px-3 py-2 border-t bg-gray-50 flex-shrink-0">
                   <button
                     onClick={handleBookMeeting}
                     className="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md bg-blue-600 text-white hover:bg-blue-700"
                   >
                     <svg
                       className="w-4 h-4 mr-2"
                       fill="none"
                       stroke="currentColor"
                       viewBox="0 0 24 24"
                       xmlns="http://www.w3.org/2000/svg"
                     >
                       <path
                         strokeLinecap="round"
                         strokeLinejoin="round"
                         strokeWidth={2}
                         d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                       />
                     </svg>
                     Book a Meeting
                   </button>
                 </div>
               </div>
             </>
           ) : (
             <div className="w-full p-8 text-center text-gray-500 bg-white">
               <p>No demo available</p>
             </div>
           )}
         </div>
      )}
    </div>
  );
};

export default FloatingQudemoWidget;

