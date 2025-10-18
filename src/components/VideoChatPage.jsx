import React, { useState, useEffect, useRef } from 'react';
import videoCache from '../utils/videoCache';

/**
 * ============================================================================
 * QUDEMO VIDEO CHAT COMPONENT - WITH AGGRESSIVE VIDEO CACHING
 * ============================================================================
 * 
 * OPTIMIZED FOR INSTANT VIDEO LOADING:
 * - Videos cached in IndexedDB after first download
 * - Subsequent loads are INSTANT (0.1s instead of 3-5s)
 * - Works offline after first load
 * - Background preloading of common videos
 * 
 * REQUIREMENTS:
 * - React 16.8+ (uses hooks)
 * - Tailwind CSS installed in your project
 * - utils/videoCache.js (IndexedDB video caching)
 * 
 * ============================================================================
 */

const VideoChatPage = () => {
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
  const [preloadedBlobUrls, setPreloadedBlobUrls] = useState(new Map()); // Store preloaded blob URLs
  const [preloadProgress, setPreloadProgress] = useState({ loaded: 0, total: 0 });
  
  // ========== REFS ==========
  const videoPlayerRef = useRef(null);
  const videoPlayer2Ref = useRef(null); // Second video player for instant switching
  const activePlayerRef = useRef(1); // Track which player is active (1 or 2)
  const chatMessagesRef = useRef(null);
  const recognitionRef = useRef(null);
  const subtitleTrackRef = useRef(null);
  const isInitializedRef = useRef(false);
  const blobUrlsRef = useRef(new Map()); // Track blob URLs by video URL

  // ========== INITIALIZATION ==========
  useEffect(() => {
    if (!isInitializedRef.current) {
      isInitializedRef.current = true;
      loadVideoFlow();
      loadSuggestedQuestions();
      setupSpeechRecognition();
    }
  }, []);

  // Auto-scroll chat messages
  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [messages]);

  // Preload ALL videos as blob URLs immediately for instant switching
  useEffect(() => {
    if (videoFlow && videoFlow.videos.length > 0) {
      const preloadAllVideos = async () => {
        console.log('🚀 Preloading ALL videos for instant switching...');
        const totalVideos = videoFlow.videos.length;
        const blobMap = new Map();
        
        for (let i = 0; i < videoFlow.videos.length; i++) {
          const video = videoFlow.videos[i];
          
          try {
            console.log(`📥 [${i + 1}/${totalVideos}] Loading:`, video.title);
            
            // Get video blob from cache
            const videoBlob = await videoCache.getVideo(video.src);
            
            // Create blob URL and store it
            const blobUrl = URL.createObjectURL(videoBlob);
            blobMap.set(video.src, blobUrl);
            blobUrlsRef.current.set(video.src, blobUrl);
            
            // Update progress
            setPreloadProgress({ loaded: i + 1, total: totalVideos });
            console.log(`✅ [${i + 1}/${totalVideos}] Ready:`, video.title);
            
          } catch (error) {
            console.warn(`⚠️  Failed to preload: ${video.title}`, error);
          }
        }
        
        // Store all blob URLs in state
        setPreloadedBlobUrls(blobMap);
        console.log(`🎉 All ${totalVideos} videos preloaded and ready!`);
      };

      preloadAllVideos();
    }
  }, [videoFlow]);

  // Play intro video when videos are preloaded
  useEffect(() => {
    if (videoFlow && videoPlayerRef.current && videoPlayer2Ref.current && 
        preloadProgress.loaded > 0 && preloadProgress.loaded === preloadProgress.total) {
      console.log('🎬 Videos preloaded, playing intro video...');
      // Small delay to ensure blob URLs are ready
      const playTimer = setTimeout(() => {
        playVideo(0);
      }, 500);
      return () => clearTimeout(playTimer);
    }
  }, [preloadProgress, videoFlow]);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      console.log('🧹 Cleaning up blob URLs...');
      blobUrlsRef.current.forEach((url, key) => {
        URL.revokeObjectURL(url);
      });
      blobUrlsRef.current.clear();
    };
  }, []);

  // ========== DATA LOADING ==========
  const loadVideoFlow = async () => {
    // OPTION 1: Load from your video-flow.json file (recommended for production)
    try {
      const response = await fetch('/video-flow.json'); // Make sure this file is in your public folder
      const data = await response.json();
      console.log('✅ Video flow loaded successfully:', data.videos.length, 'videos');
      console.log('📹 First video (intro):', data.videos[0]);
      setVideoFlow(data);
      // Add welcome message only on initial load
      addMessage("Welcome to Qudemo! I'm your AI assistant. I can help you understand our interactive video demos. What would you like to know?", 'AI');
      // Video will auto-play via useEffect when videoFlow is set
    } catch (error) {
      console.error('❌ Error loading video flow:', error);
      
      // FALLBACK: Use mock data if file not found (for testing)
      const mockVideoFlow = {
        videos: [
          {
            id: 'video_intro',
            title: 'Welcome to Qudemo',
            src: 'https://storage.googleapis.com/qudemo-videos/videos/video_intro.mp4',
            question: 'Intro',
            answer: "Hey, I'm Jazeem, founder of Qudemo. We really value every customer, so I wanted to personally welcome you here. Feel free to ask me anything about Qudemo - I'll walk you through how it works.",
            subtitle: 'https://storage.googleapis.com/qudemo-videos/subtitles/video_intro.vtt'
          },
          {
            id: 'video_1',
            title: 'What is Qudemo?',
            src: 'https://storage.googleapis.com/qudemo-videos/videos/video_1.mp4',
            question: 'What is Qudemo?',
            answer: 'Qudemo is an AI-agent that makes demo videos interactive. Customers can ask questions while watching, get instant answers, and even jump to the exact video moment that explains it - like chatting with your demo instead of just watching it.',
            subtitle: 'https://storage.googleapis.com/qudemo-videos/subtitles/video_1.vtt'
          },
          {
            id: 'video_2',
            title: 'How does Qudemo work?',
            src: 'https://storage.googleapis.com/qudemo-videos/videos/video_2.mp4',
            question: 'How does Qudemo work?',
            answer: "It's really simple! You upload a demo or product video, upload your product knowledge or FAQs, and Qudemo instantly creates an interactive version. Customers can chat with the video and get real-time answers from your content.",
            subtitle: 'https://storage.googleapis.com/qudemo-videos/subtitles/video_2.vtt'
          },
          {
            id: 'video_3',
            title: 'Who is Qudemo for?',
            src: 'https://storage.googleapis.com/qudemo-videos/videos/video_3.mp4',
            question: 'Who is Qudemo for?',
            answer: 'Qudemo is perfect for B2B SaaS teams, startups, and educators who share pre-recorded videos for demos, onboarding, training, or support. Basically, anyone using videos to engage customers or learners will find Qudemo useful.',
            subtitle: 'https://storage.googleapis.com/qudemo-videos/subtitles/video_3.vtt'
          }
        ]
      };
      setVideoFlow(mockVideoFlow);
      // Add welcome message only on initial load
      addMessage("Welcome to Qudemo! I'm your AI assistant. What would you like to know?", 'AI');
      // Video will auto-play via useEffect when videoFlow is set
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

  // ========== VIDEO PLAYBACK - INSTANT DUAL PLAYER SWITCHING ==========
  const playVideo = (index) => {
    if (!videoFlow || !videoFlow.videos || index >= videoFlow.videos.length) {
      console.error('❌ Cannot play video - invalid index or no videos');
      return;
    }

    const video = videoFlow.videos[index];
    console.log('⚡ Instant switch to:', video.title);
    
    if (!videoPlayerRef.current || !videoPlayer2Ref.current) {
      console.error('❌ Video players not ready');
      return;
    }
    
    // Update state
    setCurrentVideoIndex(index);
    setCurrentSubtitle('');
    setShowNextQuestions(false);
    setVideoEnded(false);
    setShowPlayButton(false);
    setVideoLoading(false);
    
    // Get preloaded blob URL
    const blobUrl = blobUrlsRef.current.get(video.src);
    
    if (!blobUrl) {
      console.warn('⚠️  Video not preloaded yet, using direct URL:', video.title);
      // Fallback to direct URL if not preloaded
      const player = videoPlayerRef.current;
      player.src = video.src;
      player.style.display = 'block';
      player.muted = false;
      player.load();
      player.play().catch(err => {
        console.log('Autoplay prevented, showing play button');
        setShowPlayButton(true);
      });
      return;
    }
    
    // Determine which player to use next (swap between 1 and 2)
    const currentPlayer = activePlayerRef.current === 1 ? videoPlayerRef.current : videoPlayer2Ref.current;
    const nextPlayer = activePlayerRef.current === 1 ? videoPlayer2Ref.current : videoPlayerRef.current;
    
    // STEP 1: Prepare next player with new video (hidden)
    nextPlayer.src = blobUrl;
    nextPlayer.muted = false;
    nextPlayer.load();
    
    // STEP 2: When ready, instantly swap visibility
    nextPlayer.oncanplay = () => {
      console.log('⚡ Instant swap!');
      
      // Hide current player, show next player
      currentPlayer.style.display = 'none';
      currentPlayer.pause();
      
      nextPlayer.style.display = 'block';
      nextPlayer.play().catch(err => {
        console.log('Autoplay prevented, showing play button');
        setShowPlayButton(true);
      });
      
      // Swap active player reference
      activePlayerRef.current = activePlayerRef.current === 1 ? 2 : 1;
    };
    
    // Fallback: If video doesn't load in 200ms, just show it anyway
    setTimeout(() => {
      if (nextPlayer.style.display === 'none') {
        console.log('⚠️  Fallback: forcing swap after timeout');
        currentPlayer.style.display = 'none';
        currentPlayer.pause();
        nextPlayer.style.display = 'block';
        nextPlayer.play().catch(err => {
          console.log('Autoplay prevented, showing play button');
          setShowPlayButton(true);
        });
        activePlayerRef.current = activePlayerRef.current === 1 ? 2 : 1;
      }
    }, 200);
    
    // Force hide loading after 5 seconds and show play button
    const loadingTimeout = setTimeout(() => {
      console.log('⏰ 5 second loading timeout - showing play button');
      setVideoLoading(false);
      setShowPlayButton(true);
    }, 5000);
    
    // Add loading event listener
    videoPlayerRef.current.onloadstart = () => {
      console.log('⏳ Video loading started');
      setVideoLoading(true);
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
      console.error('Video URL:', video.src);
      console.error('Error code:', videoPlayerRef.current.error?.code);
      console.error('Error message:', videoPlayerRef.current.error?.message);
      setVideoLoading(false);
      clearTimeout(loadingTimeout);
      
      // If intro video fails, try to play the first regular video instead
      if (video.isIntro && index === 0) {
        console.log('⚠️ Intro video failed, playing video_1 instead...');
        setTimeout(() => {
          playVideo(1); // Play first regular video
        }, 500);
      } else {
        setShowPlayButton(true);
        // Show error message in chat
        addMessage(`⚠️ Could not load video: ${video.title}. Click play button to try again.`, 'AI');
      }
    };
    
    // Add video ended event listener
    videoPlayerRef.current.onended = () => {
      console.log('✅ Video ended, showing next questions');
      setVideoEnded(true);
      setShowNextQuestions(true);
    };
    
    // Add play event to hide next questions
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
      
      // Try to play with delay
      setTimeout(() => {
        if (videoPlayerRef.current) {
          // Always play with sound
          videoPlayerRef.current.muted = false;
          const playPromise = videoPlayerRef.current.play();
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                console.log('✅ Video playing successfully with sound');
                setShowPlayButton(false);
              })
              .catch(error => {
                console.warn('⚠️ Autoplay prevented:', error.name);
                if (error.name === 'NotAllowedError') {
                  // Autoplay with sound blocked, show play button
                  console.log('💡 Showing play button - user needs to click to start');
                  setShowPlayButton(true);
                } else {
                  console.error('❌ Play error:', error);
                  setShowPlayButton(true);
                }
              });
          }
        }
      }, 100);
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
        // Enable subtitle display
        track.track.mode = 'hidden'; // Hide browser default, use custom overlay
        
        // Listen for cue changes to update custom subtitle overlay
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

    // Normalize voice recognition variations
    let normalizedQuestion = userQuestion.toLowerCase().trim();
    
    // Handle voice recognition variations of "Qudemo"
    normalizedQuestion = normalizedQuestion.replace(/\bq\s*demo\b/gi, 'qudemo');  // "Q demo" → "qudemo"
    normalizedQuestion = normalizedQuestion.replace(/\bq\s*d\s*e\s*m\s*o\b/gi, 'qudemo');  // "Q D E M O" → "qudemo"
    normalizedQuestion = normalizedQuestion.replace(/\bque\s*demo\b/gi, 'qudemo');  // "que demo" → "qudemo"
    normalizedQuestion = normalizedQuestion.replace(/\bcue\s*demo\b/gi, 'qudemo');  // "cue demo" → "qudemo"
    
    const lowerQuestion = normalizedQuestion;
    
    console.log('🔍 Original question:', userQuestion);
    if (normalizedQuestion !== userQuestion.toLowerCase().trim()) {
      console.log('🔄 Normalized to:', normalizedQuestion);
    }
    
    // First pass: Exact match with video questions (skip intro)
    for (const video of videoFlow.videos) {
      // Skip intro videos when matching questions
      if (video.question && !video.isIntro) {
        const lowerVideoQuestion = video.question.toLowerCase();
        if (lowerQuestion === lowerVideoQuestion) {
          console.log('✅ Exact match found:', video.question, '(video:', video.id + ')');
          return { matched: true, videoId: video.id, question: video.question, confidence: 'high' };
        }
      }
    }

    // Second pass: Contains match (skip intro)
    for (const video of videoFlow.videos) {
      // Skip intro videos when matching questions
      if (video.question && !video.isIntro) {
        const lowerVideoQuestion = video.question.toLowerCase();
        if (lowerQuestion.includes(lowerVideoQuestion) || lowerVideoQuestion.includes(lowerQuestion)) {
          console.log('✅ Substring match found:', video.question, '(video:', video.id + ')');
          return { matched: true, videoId: video.id, question: video.question, confidence: 'high' };
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
            return { matched: true, videoId: matchedVideo.id, question: matchedVideo.question, confidence: 'high' };
          }
        }
      }
    }

    // Fourth pass: Word-based fuzzy matching (skip intro, more conservative)
    for (const video of videoFlow.videos) {
      // Skip intro videos when matching questions
      if (video.question && !video.isIntro && video.question !== 'Fallback Response') {
        const lowerVideoQuestion = video.question.toLowerCase();
        const videoWords = lowerVideoQuestion.split(/\W+/).filter(w => w.length > 3);
        const questionWords = lowerQuestion.split(/\W+/).filter(w => w.length > 3);
        
        // Need at least 3 matching words for fuzzy match
        const matchingWords = videoWords.filter(word => questionWords.includes(word));
        
        if (matchingWords.length >= 3) {
          console.log('✅ Fuzzy match found:', video.question, '(video:', video.id + ')');
          return { matched: true, videoId: video.id, question: video.question, confidence: 'medium' };
        }
      }
    }

    // Fallback video (use designated fallback or second video, never intro)
    console.log('⚠️ No match found, using fallback');
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

  // ========== USER INPUT HANDLING ==========
  const handleSendMessage = async (messageText = null) => {
    const userQuestion = messageText || inputMessage.trim();
    if (!userQuestion || isTyping) return;

    addMessage(userQuestion, 'User');
    setInputMessage('');
    setIsTyping(true);
    setShowNextQuestions(false); // Hide next questions when new question is asked

    // Check if user wants to book a meeting
    if (isSalesRelated(userQuestion)) {
      setIsTyping(false);
      addMessage("I'd be happy to connect you with our team! Click the 'Book a Meeting' button below to schedule a call.", 'AI');
      setShowBookingPrompt(true);
      return;
    }

    try {
      const result = matchQuestion(userQuestion);
      await new Promise(resolve => setTimeout(resolve, 800));

      if (result.matched && videoFlow && videoFlow.videos) {
        const matchedVideo = videoFlow.videos.find(v => v.id === result.videoId);
        if (matchedVideo) {
          addMessage(result.isFallback ? "I'm not sure about that specific question, but I can help you with other questions about Qudemo!" : matchedVideo.answer, 'AI');
          const videoIndex = videoFlow.videos.findIndex(v => v.id === result.videoId);
          if (videoIndex !== -1) {
            playVideo(videoIndex);
            setTimeout(() => {
              if (videoPlayerRef.current) {
                videoPlayerRef.current.play().catch(error => {
                  if (error.name === 'NotAllowedError') setShowPlayButton(true);
                });
              }
            }, 100);
          }
        } else {
          addMessage("I couldn't find a matching video. Try asking another question!", 'AI');
        }
      } else {
        addMessage("I'm not sure about that. You can ask me about Qudemo, pricing, security, or other features!", 'AI');
      }
    } catch (error) {
      addMessage("I'm not sure about that specific question. Try asking in a different way!", 'AI');
    } finally {
      setIsTyping(false);
    }
  };

  // ========== HANDLE NEXT QUESTION CLICK ==========
  const handleNextQuestionClick = (question) => {
    handleSendMessage(question);
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
                className="bg-blue-50 border border-blue-200 rounded-full px-4 py-2 text-xs text-blue-700 hover:bg-blue-100 hover:border-blue-300 transition-all duration-200 text-left max-w-sm whitespace-normal"
              >
                {q.text}
              </button>
            ))}
            {!showAllQuestions && suggestedQuestions.questions.length > 3 && (
              <button 
                onClick={() => setShowAllQuestions(true)} 
                disabled={isTyping}
                className="bg-gray-100 border border-gray-300 rounded-full px-4 py-2 text-xs text-gray-700 hover:bg-gray-200 hover:border-gray-400 transition-all duration-200 font-semibold text-left"
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
      {/* ========== HEADER ========== */}
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
          <div className="flex items-center gap-3">
            <div className="text-xs text-gray-500">Shared Qudemo</div>
          </div>
        </div>
      </header>

      {/* ========== MAIN CONTENT ========== */}
      <div className="flex flex-1 overflow-hidden">
        {/* ========== VIDEO SECTION (2/3) ========== */}
        <div className="w-2/3 bg-black flex items-center justify-center relative">
          <div className="relative w-full h-full">
            {/* Dual video players for instant switching */}
            <video 
              ref={videoPlayerRef} 
              controls 
              className="w-full h-full object-contain bg-black absolute inset-0"
              playsInline
              preload="auto"
              style={{ display: 'block' }}
            >
              Your browser does not support the video tag.
            </video>
            <video 
              ref={videoPlayer2Ref} 
              controls 
              className="w-full h-full object-contain bg-black absolute inset-0"
              playsInline
              preload="auto"
              style={{ display: 'none' }}
            >
              Your browser does not support the video tag.
            </video>

            {/* Loading indicator */}
            {videoLoading && (
              <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center z-15">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mb-4"></div>
                  <p className="text-white text-base font-semibold">Loading video...</p>
                  {videoFlow?.videos?.[currentVideoIndex] && (
                    <p className="text-white text-sm mt-2 opacity-90">{videoFlow.videos[currentVideoIndex].title}</p>
                  )}
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

            {/* Next Questions Overlay (shown at video end) */}
            {showNextQuestions && videoFlow?.videos[currentVideoIndex]?.nextQuestions && videoFlow.videos[currentVideoIndex].nextQuestions.length > 0 && (
              <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 z-20 max-w-[90%]">
                <div className="flex flex-wrap gap-2 justify-center">
                  {videoFlow.videos[currentVideoIndex].nextQuestions.map((question, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleNextQuestionClick(question.text)}
                      className="bg-blue-50 border border-blue-200 rounded-full px-3 py-1 text-xs text-blue-700 hover:bg-blue-100 hover:border-blue-300 transition-all duration-200"
                    >
                      {question.text}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Subtitle overlay */}
            {currentSubtitle && (
              <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-85 text-white px-8 py-2 rounded-lg text-sm leading-relaxed max-w-[92%] text-center pointer-events-none z-10 shadow-lg font-medium tracking-wide transition-opacity duration-300">
                {currentSubtitle}
              </div>
            )}

            {/* Progress indicator */}
            <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-black bg-opacity-70 px-3 py-2 rounded-full text-white z-15">
              <span className="text-xs font-medium">Video {currentVideoIndex + 1} of {videoFlow?.videos?.length || 1}</span>
            </div>
          </div>
        </div>

        {/* ========== CHAT SECTION (1/3) ========== */}
        <div className="w-1/3 flex flex-col bg-white border-l border-gray-200">
          {/* Chat header */}
          <div className="bg-blue-600 text-white px-4 py-4 flex items-center gap-3 flex-shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
            </svg>
            <span className="font-semibold text-base">Ask questions about this demo</span>
          </div>

          {/* Chat messages */}
          <div ref={chatMessagesRef} className="flex-1 overflow-y-auto p-4 bg-gray-50 flex flex-col gap-3">
            {messages.map((msg, i) => (
              <div key={i}>
                <div className={`flex ${msg.sender === 'AI' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[80%] px-4 py-3 rounded-xl text-sm leading-relaxed ${msg.sender === 'AI' ? 'bg-white border border-gray-200 text-gray-800 text-left' : 'bg-blue-600 text-white text-right'}`}>
                    {msg.text}
                  </div>
                </div>
                {/* Show suggested questions after first AI message (welcome message) */}
                {msg.sender === 'AI' && i === 0 && <SuggestedQuestions />}
              </div>
            ))}
            {isTyping && <TypingIndicator />}
          </div>

          {/* Chat input */}
          <div className="flex items-end gap-2 p-3 border-t border-gray-200 bg-white flex-shrink-0">
            <textarea value={inputMessage} onChange={handleInputChange} onKeyDown={handleKeyPress} placeholder={isListening ? '🎙️ Listening...' : 'Ask a question...'} rows="1" className={`flex-1 px-3 py-2.5 border ${isListening ? 'border-green-500' : 'border-gray-300'} rounded-lg text-sm resize-none overflow-hidden min-h-[2.5rem] max-h-[7.5rem] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm`} />
            <button onClick={handleVoiceInput} className={`min-w-[2.5rem] h-10 flex items-center justify-center rounded-lg text-white transition-all duration-200 ${isListening ? 'bg-gradient-to-br from-green-500 to-green-600 animate-pulse' : 'bg-gradient-to-br from-blue-500 to-blue-600 hover:shadow-lg hover:-translate-y-0.5'}`}>
              🎤
            </button>
            <button onClick={() => handleSendMessage()} disabled={!inputMessage.trim() || isTyping} className="min-w-[2.5rem] h-10 flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 12L3.269 3.125A59.769 59.769 0 0121.485 12 59.768 59.768 0 013.27 20.875L5.999 12zm0 0h7.5"></path>
              </svg>
            </button>
          </div>

          {/* Book Meeting Button (shows when user asks about sales) */}
          {showBookingPrompt && (
            <div className="px-3 py-3 border-t bg-blue-50 flex-shrink-0">
              <button
                onClick={handleBookMeeting}
                className="w-full inline-flex items-center justify-center px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
              >
                <svg
                  className="w-5 h-5 mr-2"
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
                Book a Meeting with Sales Team
              </button>
            </div>
          )}

          {/* Footer */}
          <div className="px-2 py-2 border-t border-gray-200 bg-white flex justify-center items-center text-xs text-gray-500 flex-shrink-0">
            <span>Powered by <span className="text-blue-600 font-semibold cursor-pointer">Qudemo</span> AI</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoChatPage;

/**
 * ============================================================================
 * USAGE EXAMPLE:
 * ============================================================================
 * 
 * import VideoChatPage from './VideoChatPage';
 * 
 * function App() {
 *   return (
 *     <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
 *       <VideoChatPage />
 *     </div>
 *   );
 * }
 * 
 * ============================================================================
 */
