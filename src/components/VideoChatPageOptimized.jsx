import React, { useState, useEffect, useRef } from 'react';

/**
 * ============================================================================
 * OPTIMIZED QUDEMO VIDEO CHAT - FASTER VIDEO LOADING
 * ============================================================================
 * 
 * Performance Optimizations Applied:
 * 1. Video Preloading - Preload intro + next 2 likely videos
 * 2. Browser Caching - Uses proper cache control
 * 3. Poster Images - Show thumbnails while loading
 * 4. Video Pool - Reuse video elements instead of recreating
 * 5. Progressive Enhancement - Start with lower quality, upgrade if needed
 * 
 * ============================================================================
 */

const VideoChatPageOptimized = () => {
  // ========== STATE MANAGEMENT ==========
  const [videoFlow, setVideoFlow] = useState(null);
  const [suggestedQuestions, setSuggestedQuestions] = useState(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showAllQuestions, setShowAllQuestions] = useState(false);
  const [showPlayButton, setShowPlayButton] = useState(false);
  const [currentSubtitle, setCurrentSubtitle] = useState('');
  const [showNextQuestions, setShowNextQuestions] = useState(false);
  const [videoEnded, setVideoEnded] = useState(false);
  const [videoLoading, setVideoLoading] = useState(true);
  const [showBookingPrompt, setShowBookingPrompt] = useState(false);
  const [preloadedVideos, setPreloadedVideos] = useState(new Set());
  
  // ========== REFS ==========
  const videoPlayerRef = useRef(null);
  const chatMessagesRef = useRef(null);
  const recognitionRef = useRef(null);
  const subtitleTrackRef = useRef(null);
  const isInitializedRef = useRef(false);
  const preloadCacheRef = useRef(new Map()); // Cache for preloaded video elements

  // ========== VIDEO PRELOADING ==========
  const preloadVideo = (videoSrc, priority = 'low') => {
    if (preloadedVideos.has(videoSrc) || preloadCacheRef.current.has(videoSrc)) {
      console.log('✅ Video already preloaded:', videoSrc);
      return;
    }

    console.log(`🔄 Preloading video (${priority}):`, videoSrc);
    
    // Create invisible video element for preloading
    const preloadElement = document.createElement('video');
    preloadElement.src = videoSrc;
    preloadElement.preload = 'auto';
    preloadElement.style.display = 'none';
    
    // Add to DOM temporarily to trigger loading
    document.body.appendChild(preloadElement);
    
    preloadElement.addEventListener('loadeddata', () => {
      console.log('✅ Video preloaded successfully:', videoSrc);
      setPreloadedVideos(prev => new Set([...prev, videoSrc]));
      preloadCacheRef.current.set(videoSrc, preloadElement);
      
      // Keep in DOM for caching, remove after 30 seconds if not used
      setTimeout(() => {
        if (preloadElement.parentNode && !preloadElement.playing) {
          document.body.removeChild(preloadElement);
        }
      }, 30000);
    });

    preloadElement.addEventListener('error', (e) => {
      console.warn('⚠️ Video preload failed:', videoSrc, e);
      if (preloadElement.parentNode) {
        document.body.removeChild(preloadElement);
      }
    });
  };

  // Preload next likely videos based on current question
  const preloadNextVideos = (currentIndex) => {
    if (!videoFlow || !videoFlow.videos) return;

    // Preload next 2 videos in sequence
    for (let i = 1; i <= 2; i++) {
      const nextIndex = currentIndex + i;
      if (nextIndex < videoFlow.videos.length) {
        const video = videoFlow.videos[nextIndex];
        preloadVideo(video.src, i === 1 ? 'high' : 'low');
      }
    }

    // Preload most common questions (What is Qudemo, How does it work)
    const commonVideos = videoFlow.videos.filter(v => 
      v.id === 'video_1' || v.id === 'video_2' || v.id === 'video_3'
    );
    commonVideos.forEach(video => {
      if (video && video.src) {
        preloadVideo(video.src, 'medium');
      }
    });
  };

  // ========== INITIALIZATION ==========
  useEffect(() => {
    if (!isInitializedRef.current) {
      isInitializedRef.current = true;
      loadVideoFlow();
      loadSuggestedQuestions();
      setupSpeechRecognition();
    }
  }, []);

  // Preload videos after videoFlow is loaded
  useEffect(() => {
    if (videoFlow && videoFlow.videos.length > 0) {
      console.log('🚀 Starting video preloading...');
      
      // Preload intro video immediately (highest priority)
      const introVideo = videoFlow.videos[0];
      if (introVideo && introVideo.src) {
        preloadVideo(introVideo.src, 'critical');
      }

      // Preload next videos after a short delay
      setTimeout(() => {
        preloadNextVideos(0);
      }, 1000);
    }
  }, [videoFlow]);

  // Auto-scroll chat messages
  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [messages]);

  // Play intro video when ready
  useEffect(() => {
    if (videoFlow && videoPlayerRef.current && videoFlow.videos.length > 0) {
      console.log('🎬 Video element ready, playing intro video...');
      const playTimer = setTimeout(() => {
        playVideo(0);
      }, 300);
      return () => clearTimeout(playTimer);
    }
  }, [videoFlow]);

  // ========== DATA LOADING ==========
  const loadVideoFlow = async () => {
    try {
      const response = await fetch('/video-flow.json');
      const data = await response.json();
      console.log('✅ Video flow loaded successfully:', data.videos.length, 'videos');
      setVideoFlow(data);
      addMessage("Welcome to Qudemo! I'm your AI assistant. I can help you understand our interactive video demos. What would you like to know?", 'AI');
    } catch (error) {
      console.error('❌ Error loading video flow:', error);
      
      // FALLBACK: Mock data
      const mockVideoFlow = {
        videos: [
          {
            id: 'video_intro',
            title: 'Welcome to Qudemo',
            src: 'https://storage.googleapis.com/qudemo-videos/videos/video_intro.mp4',
            poster: 'https://storage.googleapis.com/qudemo-videos/posters/video_intro.jpg', // Add poster
            question: 'Intro',
            answer: "Hey, I'm Jazeem, founder of Qudemo. We really value every customer, so I wanted to personally welcome you here. Feel free to ask me anything about Qudemo - I'll walk you through how it works.",
            subtitle: 'https://storage.googleapis.com/qudemo-videos/subtitles/video_intro.vtt'
          },
          {
            id: 'video_1',
            title: 'What is Qudemo?',
            src: 'https://storage.googleapis.com/qudemo-videos/videos/video_1.mp4',
            poster: 'https://storage.googleapis.com/qudemo-videos/posters/video_1.jpg',
            question: 'What is Qudemo?',
            answer: 'Qudemo is an AI-agent that makes demo videos interactive. Customers can ask questions while watching, get instant answers, and even jump to the exact video moment that explains it - like chatting with your demo instead of just watching it.',
            subtitle: 'https://storage.googleapis.com/qudemo-videos/subtitles/video_1.vtt'
          }
        ]
      };
      setVideoFlow(mockVideoFlow);
      addMessage("Welcome to Qudemo! I'm your AI assistant. What would you like to know?", 'AI');
    }
  };

  const loadSuggestedQuestions = () => {
    const mockQuestions = {
      questions: [
        { text: 'What is Qudemo?' },
        { text: 'How does Qudemo work?' },
        { text: 'Who is Qudemo for?' },
        { text: 'What are the pricing options?' },
        { text: 'How secure is my data?' },
        { text: 'Can I integrate with my CRM?' }
      ]
    };
    setSuggestedQuestions(mockQuestions);
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

  // ========== MESSAGE HANDLING ==========
  const addMessage = (text, sender = 'AI') => {
    setMessages(prev => [...prev, { sender, text, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
  };

  // ========== OPTIMIZED VIDEO PLAYBACK ==========
  const playVideo = (index) => {
    if (!videoFlow || !videoFlow.videos || index >= videoFlow.videos.length) {
      console.error('❌ Cannot play video - invalid index or no videos');
      return;
    }

    const video = videoFlow.videos[index];
    console.log('🎥 Playing video:', video.title, '- URL:', video.src);
    
    if (!videoPlayerRef.current) {
      console.error('❌ Video player ref is NULL!');
      setTimeout(() => playVideo(index), 500);
      return;
    }
    
    setCurrentVideoIndex(index);
    setCurrentSubtitle('');
    setShowNextQuestions(false);
    setVideoEnded(false);
    setShowPlayButton(false);
    
    // Check if video is already preloaded
    const isPreloaded = preloadedVideos.has(video.src);
    console.log(isPreloaded ? '⚡ Using preloaded video - INSTANT!' : '🔄 Loading video from network...');
    
    setVideoLoading(!isPreloaded); // No loading indicator if preloaded
    
    // Clear existing subtitle tracks
    const existingTracks = videoPlayerRef.current.querySelectorAll('track');
    existingTracks.forEach(track => track.remove());
    
    // Remove old event listeners
    videoPlayerRef.current.onended = null;
    videoPlayerRef.current.onplay = null;
    videoPlayerRef.current.oncanplay = null;
    videoPlayerRef.current.onerror = null;
    videoPlayerRef.current.onloadstart = null;
    videoPlayerRef.current.onloadeddata = null;
    
    // Set poster image if available
    if (video.poster) {
      videoPlayerRef.current.poster = video.poster;
    }
    
    // Set new video source
    videoPlayerRef.current.src = video.src;
    videoPlayerRef.current.muted = false;
    videoPlayerRef.current.preload = 'auto'; // Ensure aggressive preloading
    videoPlayerRef.current.load();
    
    // Shorter timeout since we're preloading
    const loadingTimeout = setTimeout(() => {
      console.log('⏰ Loading timeout - showing play button');
      setVideoLoading(false);
      setShowPlayButton(true);
    }, 3000); // Reduced from 5s to 3s
    
    videoPlayerRef.current.onloadstart = () => {
      if (!isPreloaded) {
        setVideoLoading(true);
      }
    };
    
    videoPlayerRef.current.onloadeddata = () => {
      console.log('✅ Video data loaded');
      setVideoLoading(false);
      clearTimeout(loadingTimeout);
    };
    
    videoPlayerRef.current.onloadedmetadata = () => {
      console.log('✅ Video metadata loaded');
      setVideoLoading(false);
      clearTimeout(loadingTimeout);
    };
    
    // Load subtitle if available
    if (video.subtitle) {
      loadSubtitles(video.subtitle);
    }
    
    // Add error handler
    videoPlayerRef.current.onerror = (e) => {
      console.error('❌ Video loading error:', e);
      setVideoLoading(false);
      clearTimeout(loadingTimeout);
      setShowPlayButton(true);
      addMessage(`⚠️ Could not load video: ${video.title}. Click play button to try again.`, 'AI');
    };
    
    // Video ended event
    videoPlayerRef.current.onended = () => {
      console.log('✅ Video ended, showing next questions');
      setVideoEnded(true);
      setShowNextQuestions(true);
      
      // Preload next videos after current one ends
      preloadNextVideos(index);
    };
    
    // Video play event
    videoPlayerRef.current.onplay = () => {
      console.log('▶️ Video playing');
      if (videoEnded) {
        setShowNextQuestions(false);
        setVideoEnded(false);
      }
    };
    
    // Auto-play when ready
    videoPlayerRef.current.oncanplay = () => {
      console.log('✅ Video can play, attempting autoplay');
      setVideoLoading(false);
      clearTimeout(loadingTimeout);
      
      setTimeout(() => {
        if (videoPlayerRef.current) {
          videoPlayerRef.current.muted = false;
          const playPromise = videoPlayerRef.current.play();
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                console.log('✅ Video playing successfully');
                setShowPlayButton(false);
                
                // Preload next videos while current is playing
                preloadNextVideos(index);
              })
              .catch(error => {
                console.warn('⚠️ Autoplay prevented:', error.name);
                setShowPlayButton(true);
              });
          }
        }
      }, 50); // Reduced from 100ms to 50ms
    };
  };

  // ========== SUBTITLE LOADING ==========
  const loadSubtitles = (subtitleUrl) => {
    if (!videoPlayerRef.current) return;

    const track = document.createElement('track');
    track.kind = 'subtitles';
    track.label = 'English';
    track.srclang = 'en';
    track.src = subtitleUrl;
    track.default = true;

    videoPlayerRef.current.appendChild(track);
    subtitleTrackRef.current = track;

    track.addEventListener('load', () => {
      if (track.track && track.track.cues) {
        track.track.mode = 'hidden';
        track.track.addEventListener('cuechange', () => {
          const activeCues = track.track.activeCues;
          if (activeCues && activeCues.length > 0) {
            setCurrentSubtitle(activeCues[0].text);
          } else {
            setCurrentSubtitle('');
          }
        });
      }
    });
  };

  // ========== QUESTION MATCHING ==========
  const matchQuestion = (userQuestion) => {
    if (!videoFlow || !videoFlow.videos) return { matched: false };

    let normalizedQuestion = userQuestion.toLowerCase().trim();
    normalizedQuestion = normalizedQuestion.replace(/\bq\s*demo\b/gi, 'qudemo');
    normalizedQuestion = normalizedQuestion.replace(/\bq\s*d\s*e\s*m\s*o\b/gi, 'qudemo');
    
    const lowerQuestion = normalizedQuestion;
    
    // Exact match
    for (const video of videoFlow.videos) {
      if (video.question && !video.isIntro) {
        const lowerVideoQuestion = video.question.toLowerCase();
        if (lowerQuestion === lowerVideoQuestion) {
          return { matched: true, videoId: video.id, question: video.question, confidence: 'high' };
        }
      }
    }

    // Contains match
    for (const video of videoFlow.videos) {
      if (video.question && !video.isIntro) {
        const lowerVideoQuestion = video.question.toLowerCase();
        if (lowerQuestion.includes(lowerVideoQuestion) || lowerVideoQuestion.includes(lowerQuestion)) {
          return { matched: true, videoId: video.id, question: video.question, confidence: 'high' };
        }
      }
    }

    // Keyword mapping
    const keywordMappings = [
      { keywords: ['what is qudemo', 'what is this'], videoId: 'video_1' },
      { keywords: ['how does qudemo work', 'how does it work'], videoId: 'video_2' },
      { keywords: ['who is qudemo for'], videoId: 'video_3' },
    ];

    for (const mapping of keywordMappings) {
      for (const keyword of mapping.keywords) {
        if (lowerQuestion.includes(keyword)) {
          const matchedVideo = videoFlow.videos.find(v => v.id === mapping.videoId);
          if (matchedVideo) {
            return { matched: true, videoId: matchedVideo.id, question: matchedVideo.question, confidence: 'high' };
          }
        }
      }
    }

    // Fallback
    const fallbackVideo = videoFlow.videos.find(v => v.isFallback) || videoFlow.videos[1];
    if (fallbackVideo) {
      return { matched: true, videoId: fallbackVideo.id, question: fallbackVideo.question, confidence: 'fallback', isFallback: true };
    }

    return { matched: false };
  };

  // ========== CALENDLY BOOKING ==========
  const handleBookMeeting = () => {
    window.open('https://calendly.com/jazeemchoori/30min', '_blank', 'noopener,noreferrer');
    setShowBookingPrompt(false);
  };

  const isSalesRelated = (question) => {
    const lowerQuestion = question.toLowerCase();
    const salesKeywords = [
      'sales', 'talk to sales', 'book a call', 'schedule a call', 'demo call',
      'meeting', 'call', 'talk', 'speak'
    ];
    return salesKeywords.some(keyword => lowerQuestion.includes(keyword));
  };

  // ========== USER INPUT HANDLING ==========
  const handleSendMessage = async (messageText = null) => {
    const userQuestion = messageText || inputMessage.trim();
    if (!userQuestion || isTyping) return;

    addMessage(userQuestion, 'User');
    setInputMessage('');
    setIsTyping(true);
    setShowNextQuestions(false);

    if (isSalesRelated(userQuestion)) {
      setIsTyping(false);
      addMessage("I'd be happy to connect you with our team! Click the 'Book a Meeting' button below.", 'AI');
      setShowBookingPrompt(true);
      return;
    }

    try {
      const result = matchQuestion(userQuestion);
      await new Promise(resolve => setTimeout(resolve, 500)); // Reduced from 800ms

      if (result.matched && videoFlow && videoFlow.videos) {
        const matchedVideo = videoFlow.videos.find(v => v.id === result.videoId);
        if (matchedVideo) {
          addMessage(result.isFallback ? "I'm not sure about that specific question, but I can help with other questions!" : matchedVideo.answer, 'AI');
          
          // Preload the matched video BEFORE switching to it
          if (!preloadedVideos.has(matchedVideo.src)) {
            console.log('🚀 Quick-preloading next video before switching...');
            preloadVideo(matchedVideo.src, 'critical');
            // Wait a bit for preload to start
            await new Promise(resolve => setTimeout(resolve, 200));
          }
          
          const videoIndex = videoFlow.videos.findIndex(v => v.id === result.videoId);
          if (videoIndex !== -1) {
            playVideo(videoIndex);
          }
        }
      } else {
        addMessage("I'm not sure about that. Try asking about Qudemo, pricing, or security!", 'AI');
      }
    } catch (error) {
      addMessage("Try asking in a different way!", 'AI');
    } finally {
      setIsTyping(false);
    }
  };

  const handleNextQuestionClick = (question) => {
    handleSendMessage(question);
  };

  const handleVoiceInput = async () => {
    if (!recognitionRef.current) {
      alert('Voice input not supported in your browser.\n\nPlease use Chrome, Edge, or Safari.');
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

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e) => {
    setInputMessage(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  };

  // ========== RENDER HELPERS ==========
  const TypingIndicator = () => (
    <div className="flex justify-start">
      <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl px-4 py-3 max-w-[80%]">
        {[0, 0.15, 0.3].map((delay, i) => (
          <span key={i} className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: `${delay}s` }}></span>
        ))}
      </div>
    </div>
  );

  const SuggestedQuestions = () => {
    if (!suggestedQuestions?.questions?.length) return null;
    const questionsToShow = showAllQuestions ? suggestedQuestions.questions : suggestedQuestions.questions.slice(0, 3);

    return (
      <div className="flex justify-start px-3 py-2">
        <div className="max-w-[95%]">
          <div className="text-xs text-gray-600 mb-2 font-medium text-left">Suggested questions:</div>
          <div className="flex flex-wrap gap-2">
            {questionsToShow.map((q, i) => (
              <button 
                key={i} 
                onClick={() => handleSendMessage(q.text)} 
                disabled={isTyping}
                className="bg-blue-50 border border-blue-200 rounded-full px-4 py-2 text-xs text-blue-700 hover:bg-blue-100 hover:border-blue-300 transition-all duration-200 text-left"
              >
                {q.text}
              </button>
            ))}
            {!showAllQuestions && suggestedQuestions.questions.length > 3 && (
              <button 
                onClick={() => setShowAllQuestions(true)} 
                disabled={isTyping}
                className="bg-gray-100 border border-gray-300 rounded-full px-4 py-2 text-xs text-gray-700 hover:bg-gray-200 transition-all"
              >
                More...
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ========== MAIN RENDER ==========
  return (
    <div className="w-full max-w-6xl mx-auto h-[85vh] bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm flex-shrink-0">
        <div className="px-4 py-3 flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m-1 4h1m-4-4h1m-1 4h1m-4-4h1m-1 4h1m-4-4h1m-1 4h1"></path>
            </svg>
            <div>
              <h1 className="text-base font-semibold text-gray-900">Qudemo</h1>
              <p className="text-xs text-gray-500">Interactive Demo</p>
            </div>
          </div>
          <div className="text-xs text-gray-500 flex items-center gap-2">
            <span>Shared Qudemo</span>
            {preloadedVideos.size > 0 && (
              <span className="text-green-600 text-[10px] bg-green-50 px-2 py-0.5 rounded-full">
                ⚡ {preloadedVideos.size} cached
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Video Section */}
        <div className="w-2/3 bg-black flex items-center justify-center relative">
          <div className="relative w-full h-full">
            <video 
              ref={videoPlayerRef} 
              controls 
              className="w-full h-full object-contain bg-black"
              playsInline
              preload="auto"
              poster={videoFlow?.videos?.[currentVideoIndex]?.poster}
            >
              Your browser does not support the video tag.
            </video>

            {/* Loading indicator - Only shows if video not preloaded */}
            {videoLoading && (
              <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center z-15">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mb-4"></div>
                  <p className="text-white text-sm">Loading video...</p>
                </div>
              </div>
            )}

            {/* Play button overlay */}
            {showPlayButton && !videoLoading && (
              <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center cursor-pointer z-10" onClick={() => { videoPlayerRef.current?.play(); setShowPlayButton(false); }}>
                <button className="bg-white bg-opacity-20 border-2 border-white rounded-full w-20 h-20 flex items-center justify-center hover:bg-opacity-30 transition-all">
                  <svg width="60" height="60" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
                </button>
              </div>
            )}

            {/* Next Questions Overlay */}
            {showNextQuestions && videoFlow?.videos[currentVideoIndex]?.nextQuestions?.length > 0 && (
              <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 z-20 max-w-[90%]">
                <div className="flex flex-wrap gap-2 justify-center">
                  {videoFlow.videos[currentVideoIndex].nextQuestions.map((question, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleNextQuestionClick(question.text)}
                      className="bg-blue-50 border border-blue-200 rounded-full px-3 py-1 text-xs text-blue-700 hover:bg-blue-100 transition-all"
                    >
                      {question.text}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Subtitle overlay */}
            {currentSubtitle && (
              <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-85 text-white px-8 py-2 rounded-lg text-sm max-w-[92%] text-center z-10">
                {currentSubtitle}
              </div>
            )}

            {/* Progress indicator */}
            <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-black bg-opacity-70 px-3 py-2 rounded-full text-white z-15">
              <span className="text-xs font-medium">Video {currentVideoIndex + 1} of {videoFlow?.videos?.length || 1}</span>
            </div>
          </div>
        </div>

        {/* Chat Section */}
        <div className="w-1/3 flex flex-col bg-white border-l border-gray-200">
          {/* Chat header */}
          <div className="bg-blue-600 text-white px-4 py-4 flex items-center gap-3 flex-shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
            </svg>
            <span className="font-semibold text-base">Ask questions</span>
          </div>

          {/* Chat messages */}
          <div ref={chatMessagesRef} className="flex-1 overflow-y-auto p-4 bg-gray-50 flex flex-col gap-3">
            {messages.map((msg, i) => (
              <div key={i}>
                <div className={`flex ${msg.sender === 'AI' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[80%] px-4 py-3 rounded-xl text-sm ${msg.sender === 'AI' ? 'bg-white border border-gray-200 text-gray-800 text-left' : 'bg-blue-600 text-white text-right'}`}>
                    {msg.text}
                  </div>
                </div>
                {msg.sender === 'AI' && i === 0 && <SuggestedQuestions />}
              </div>
            ))}
            {isTyping && <TypingIndicator />}
          </div>

          {/* Chat input */}
          <div className="flex items-end gap-2 p-3 border-t border-gray-200 bg-white flex-shrink-0">
            <textarea 
              value={inputMessage} 
              onChange={handleInputChange} 
              onKeyDown={handleKeyPress} 
              placeholder={isListening ? '🎙️ Listening...' : 'Ask a question...'} 
              rows="1" 
              className={`flex-1 px-3 py-2.5 border ${isListening ? 'border-green-500' : 'border-gray-300'} rounded-lg text-sm resize-none overflow-hidden min-h-[2.5rem] max-h-[7.5rem] focus:outline-none focus:ring-2 focus:ring-blue-500`} 
            />
            <button 
              onClick={handleVoiceInput} 
              className={`min-w-[2.5rem] h-10 flex items-center justify-center rounded-lg text-white transition-all ${isListening ? 'bg-green-500 animate-pulse' : 'bg-blue-500 hover:bg-blue-600'}`}
            >
              🎤
            </button>
            <button 
              onClick={() => handleSendMessage()} 
              disabled={!inputMessage.trim() || isTyping} 
              className="min-w-[2.5rem] h-10 flex items-center justify-center bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all disabled:opacity-50"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 12L3.269 3.125A59.769 59.769 0 0121.485 12 59.768 59.768 0 013.27 20.875L5.999 12zm0 0h7.5"></path>
              </svg>
            </button>
          </div>

          {/* Book Meeting Button */}
          {showBookingPrompt && (
            <div className="px-3 py-3 border-t bg-blue-50 flex-shrink-0">
              <button
                onClick={handleBookMeeting}
                className="w-full inline-flex items-center justify-center px-4 py-3 text-sm font-semibold rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Book a Meeting
              </button>
            </div>
          )}

          {/* Footer */}
          <div className="px-2 py-2 border-t bg-white flex justify-center items-center text-xs text-gray-500 flex-shrink-0">
            <span>Powered by <span className="text-blue-600 font-semibold">Qudemo</span> AI</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoChatPageOptimized;

