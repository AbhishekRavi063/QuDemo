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

  // ========== DATA LOADING ==========
  const loadVideoFlow = async () => {
    // OPTION 1: Load from your video-flow.json file (recommended for production)
    try {
      const response = await fetch('/video-flow.json'); // Make sure this file is in your public folder
      const data = await response.json();
      setVideoFlow(data);
      // Add welcome message only on initial load
      addMessage("Welcome to Qudemo! I'm your AI assistant. I can help you understand our interactive video demos. What would you like to know?", 'AI');
      setTimeout(() => {
        if (data.videos.length > 0) {
          playVideo(0); // Plays intro video
        }
      }, 500);
    } catch (error) {
      console.error('Error loading video flow:', error);
      
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
      setTimeout(() => {
        if (mockVideoFlow.videos.length > 0) {
          playVideo(0);
        }
      }, 500);
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
    if (!videoFlow || !videoFlow.videos || index >= videoFlow.videos.length) return;

    const video = videoFlow.videos[index];
    setCurrentVideoIndex(index);
    setCurrentSubtitle('');
    setShowNextQuestions(false);
    setVideoEnded(false);
    
    if (videoPlayerRef.current) {
      // Clear existing subtitle tracks
      const existingTracks = videoPlayerRef.current.querySelectorAll('track');
      existingTracks.forEach(track => track.remove());
      
      videoPlayerRef.current.src = video.src;
      videoPlayerRef.current.load();
      
      // Load subtitle if available
      if (video.subtitle) {
        loadSubtitles(video.subtitle);
      }
      
      // Add video ended event listener
      videoPlayerRef.current.onended = () => {
        setVideoEnded(true);
        setShowNextQuestions(true);
      };
      
      // Add play event to hide next questions
      videoPlayerRef.current.onplay = () => {
        if (videoEnded) {
          setShowNextQuestions(false);
          setVideoEnded(false);
        }
      };
      
      videoPlayerRef.current.oncanplay = () => {
        videoPlayerRef.current.play().catch(error => {
          if (error.name === 'NotAllowedError') {
            setShowPlayButton(true);
          }
        });
      };
    }
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

    const lowerQuestion = userQuestion.toLowerCase().trim();
    
    // First pass: Exact match with video questions
    for (const video of videoFlow.videos) {
      if (video.question) {
        const lowerVideoQuestion = video.question.toLowerCase();
        // Exact match
        if (lowerQuestion === lowerVideoQuestion) {
          return { matched: true, videoId: video.id, question: video.question, confidence: 'high' };
        }
      }
    }

    // Second pass: Contains match (question contains video question or vice versa)
    for (const video of videoFlow.videos) {
      if (video.question && video.question !== 'Intro' && video.question !== 'Fallback Response') {
        const lowerVideoQuestion = video.question.toLowerCase();
        if (lowerQuestion.includes(lowerVideoQuestion) || lowerVideoQuestion.includes(lowerQuestion)) {
          return { matched: true, videoId: video.id, question: video.question, confidence: 'high' };
        }
      }
    }

    // Third pass: Keyword-based matching for key questions
    const keywordMappings = [
      { keywords: ['what is qudemo', 'what is this', 'what does qudemo', 'tell me about qudemo'], videoQuestion: 'What is Qudemo?' },
      { keywords: ['how does qudemo work', 'how qudemo works', 'how does it work', 'how to use'], videoQuestion: 'How does Qudemo work?' },
      { keywords: ['who is qudemo for', 'who can use', 'who should use', 'target audience'], videoQuestion: 'Who is Qudemo for?' },
      { keywords: ['pricing', 'how much', 'cost', 'price', 'plans'], videoQuestion: "What's the pricing?" },
      { keywords: ['secure', 'security', 'data security', 'safe', 'privacy'], videoQuestion: 'How secure is my data?' },
      { keywords: ['integrate', 'integration', 'crm', 'connect'], videoQuestion: 'Can I integrate Qudemo with other tools?' },
      { keywords: ['embed', 'share'], videoQuestion: 'Can I embed Qudemo or share it?' },
      { keywords: ['insights', 'analytics', 'what can i see'], videoQuestion: 'What insights can I see?' },
      { keywords: ['onboarding', 'training'], videoQuestion: 'Can I use Qudemo for onboarding or training?' },
    ];

    for (const mapping of keywordMappings) {
      for (const keyword of mapping.keywords) {
        if (lowerQuestion.includes(keyword)) {
          const matchedVideo = videoFlow.videos.find(v => v.question === mapping.videoQuestion);
          if (matchedVideo) {
            return { matched: true, videoId: matchedVideo.id, question: matchedVideo.question, confidence: 'high' };
          }
        }
      }
    }

    // Fourth pass: Word-based fuzzy matching (more conservative)
    for (const video of videoFlow.videos) {
      if (video.question && video.question !== 'Intro' && video.question !== 'Fallback Response') {
        const lowerVideoQuestion = video.question.toLowerCase();
        const videoWords = lowerVideoQuestion.split(/\W+/).filter(w => w.length > 3);
        const questionWords = lowerQuestion.split(/\W+/).filter(w => w.length > 3);
        
        // Need at least 3 matching words for fuzzy match
        const matchingWords = videoWords.filter(word => questionWords.includes(word));
        
        if (matchingWords.length >= 3) {
          return { matched: true, videoId: video.id, question: video.question, confidence: 'medium' };
        }
      }
    }

    // Fallback video
    const fallbackVideo = videoFlow.videos.find(v => v.isFallback) || videoFlow.videos[1] || videoFlow.videos[0];
    if (fallbackVideo) {
      return { matched: true, videoId: fallbackVideo.id, question: fallbackVideo.question, confidence: 'fallback', isFallback: true };
    }

    return { matched: false };
  };

  // ========== USER INPUT HANDLING ==========
  const handleSendMessage = async (messageText = null) => {
    const userQuestion = messageText || inputMessage.trim();
    if (!userQuestion || isTyping) return;

    addMessage(userQuestion, 'User');
    setInputMessage('');
    setIsTyping(true);
    setShowNextQuestions(false); // Hide next questions when new question is asked

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
          <div className="text-xs text-gray-500">Shared Qudemo</div>
        </div>
      </header>

      {/* ========== MAIN CONTENT ========== */}
      <div className="flex flex-1 overflow-hidden">
        {/* ========== VIDEO SECTION (2/3) ========== */}
        <div className="w-2/3 bg-black flex items-center justify-center relative">
          <div className="relative w-full h-full">
            <video ref={videoPlayerRef} controls className="w-full h-full object-contain bg-black">
              Your browser does not support the video tag.
            </video>

            {/* Play button overlay */}
            {showPlayButton && (
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
