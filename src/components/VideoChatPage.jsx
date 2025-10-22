import React, { useState, useEffect, useRef } from 'react';

/**
 * ============================================================================
 * QUDEMO VIDEO CHAT COMPONENT - COMPLETE SINGLE FILE
 * ============================================================================
 * 
 * A fully self-contained React component with Tailwind CSS
 * Just copy this ENTIRE file and paste it into your React project!
 * 
 * REQUIREMENTS:
 * - React 16.8+ (uses hooks)
 * - Tailwind CSS installed in your project
 * 
 * SETUP:
 * 1. npm install -D tailwindcss postcss autoprefixer
 * 2. npx tailwindcss init -p
 * 3. Add to your index.css:  @tailwind base; @tailwind components; @tailwind utilities;
 * 4. Copy this file to your project
 * 5. Import and use: <VideoChatPage />
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
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  
  // ========== REFS ==========
  const videoPlayerRef = useRef(null);
  const chatMessagesRef = useRef(null);
  const recognitionRef = useRef(null);
  const subtitleTrackRef = useRef(null);
  const isInitializedRef = useRef(false);

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

  // Play intro video when videoFlow is loaded and video element is ready
  useEffect(() => {
    if (videoFlow && videoPlayerRef.current && videoFlow.videos.length > 0) {
      console.log('🎬 Video element ready, playing intro video...');
      // Small delay to ensure everything is mounted
      const playTimer = setTimeout(() => {
        playVideo(0);
      }, 300);
      return () => clearTimeout(playTimer);
    }
  }, [videoFlow]);

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

  // ========== VIDEO PLAYBACK ==========
  const playVideo = (index) => {
    if (!videoFlow || !videoFlow.videos || index >= videoFlow.videos.length) {
      console.error('❌ Cannot play video - invalid index or no videos');
      return;
    }

    const video = videoFlow.videos[index];
    console.log('🎥 Playing video:', video.title, '- URL:', video.src);
    console.log('📊 Video details:', { id: video.id, isIntro: video.isIntro, hasSubtitle: !!video.subtitle });
    
    if (!videoPlayerRef.current) {
      console.error('❌ Video player ref is NULL!');
      setTimeout(() => playVideo(index), 500); // Retry after 500ms
      return;
    }
    
    console.log('✅ Video player ref exists:', videoPlayerRef.current);
    
    setCurrentVideoIndex(index);
    setCurrentSubtitle('');
    setShowNextQuestions(false);
    setVideoEnded(false);
    setShowPlayButton(false);
    setVideoLoading(true);
    
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
    
    console.log('🔄 Setting video source:', video.src);
    
    // Set new video source
    videoPlayerRef.current.src = video.src;
    // Always play with sound
    videoPlayerRef.current.muted = false;
    console.log('📼 Calling video.load() with sound enabled');
    videoPlayerRef.current.load();
    
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

  // ========== SHARE FUNCTIONALITY ==========
  const handleShare = () => {
    const currentUrl = window.location.href;
    setShareLink(currentUrl);
    setShowShareModal(true);
    setCopySuccess(false);
  };

  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy link');
    }
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
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
              title="Share this demo"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              <span className="hidden sm:inline">Share</span>
            </button>
            <div className="text-xs text-gray-500">Shared Qudemo</div>
          </div>
        </div>
      </header>

      {/* ========== MAIN CONTENT ========== */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* ========== VIDEO SECTION (FULL WIDTH) ========== */}
        <div className="flex-1 bg-black flex items-center justify-center relative">
          <div className="relative w-full h-full">
            <video 
              ref={videoPlayerRef} 
              controls 
              className="w-full h-full object-contain bg-black"
              playsInline
              preload="auto"
            >
              Your browser does not support the video tag.
            </video>

            {/* Loading indicator */}
            {videoLoading && (
              <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center z-15">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mb-4"></div>
                  <p className="text-white text-sm">Loading video...</p>
                  {videoFlow?.videos?.[currentVideoIndex] && (
                    <p className="text-white text-xs mt-2 opacity-75">{videoFlow.videos[currentVideoIndex].title}</p>
                  )}
                  <button 
                    onClick={() => {
                      setVideoLoading(false);
                      setShowPlayButton(true);
                    }}
                    className="mt-4 px-4 py-2 bg-white bg-opacity-20 text-white text-xs rounded-lg hover:bg-opacity-30"
                  >
                    Skip Loading
                  </button>
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

        {/* ========== INPUT SECTION BELOW VIDEO ========== */}
        <div className="bg-white border-t border-gray-200 flex-shrink-0">
          {/* Chat input */}
          <div className="flex items-end gap-2 p-4 max-w-4xl mx-auto">
            <textarea 
              value={inputMessage} 
              onChange={handleInputChange} 
              onKeyDown={handleKeyPress} 
              placeholder={isListening ? '🎙️ Listening...' : 'Ask a question...'} 
              rows="1" 
              className={`flex-1 px-4 py-3 border ${isListening ? 'border-green-500' : 'border-gray-300'} rounded-lg text-sm resize-none overflow-hidden min-h-[2.5rem] max-h-[7.5rem] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm`} 
            />
            <button 
              onClick={handleVoiceInput} 
              className={`min-w-[2.5rem] h-11 flex items-center justify-center rounded-full text-white transition-all duration-200 ${isListening ? 'bg-gradient-to-br from-green-500 to-green-600 animate-pulse' : 'bg-gradient-to-br from-blue-500 to-blue-600 hover:shadow-lg hover:-translate-y-0.5'}`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
              </svg>
            </button>
            <button 
              onClick={() => handleSendMessage()} 
              disabled={!inputMessage.trim() || isTyping} 
              className="min-w-[2.5rem] h-11 flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 12L3.269 3.125A59.769 59.769 0 0121.485 12 59.768 59.768 0 013.27 20.875L5.999 12zm0 0h7.5"></path>
              </svg>
            </button>
          </div>

          {/* Book Meeting Button (shows when user asks about sales) */}
          {showBookingPrompt && (
            <div className="px-4 pb-4 max-w-4xl mx-auto">
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
          <div className="px-2 py-2 border-t border-gray-200 bg-white flex justify-center items-center text-xs text-gray-500">
            <span>Powered by <span className="text-blue-600 font-semibold cursor-pointer">Qudemo</span> AI</span>
          </div>
        </div>
      </div>

      {/* ========== SHARE MODAL ========== */}
      {showShareModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Share This Demo</h3>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-3">
                  Share this interactive demo with anyone using the link below:
                </p>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={shareLink}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50"
                  />
                  <button
                    onClick={copyShareLink}
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                      copySuccess 
                        ? 'bg-green-600 text-white' 
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {copySuccess ? (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Copied!
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Copy
                      </>
                    )}
                  </button>
                </div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <p className="text-sm text-blue-800">
                  <strong>💡 Tip:</strong> Anyone with this link can view and interact with this demo. 
                  They can ask questions and get instant AI-powered answers with video timestamps.
                </p>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => setShowShareModal(false)}
                  className="px-6 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
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
