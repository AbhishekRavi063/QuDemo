import React, { useState, useRef, useEffect } from 'react';
import { XMarkIcon, ChevronDownIcon, ChatBubbleLeftRightIcon, ArrowsPointingOutIcon, ArrowsPointingInIcon } from '@heroicons/react/24/outline';
import { getNodeApiUrl, getVideoApiUrl } from '../config/api';
import HybridVideoPlayer from './HybridVideoPlayer';
import AvatarVideoPlayer from './AvatarVideoPlayer';

const FloatingQudemoWidget = ({ 
  position = 'bottom-right',
  previewImage = null,
  previewText = "Watch Demo",
  qudemoId = null,
  companyName = null,
  isPreview = false
}) => {
  // Debug: Log props on component mount (commented out to prevent spam)
  // console.log('🔍 FloatingQudemoWidget PROPS:', { qudemoId, companyName, isPreview, position });

  const [isExpanded, setIsExpanded] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [videoFlow, setVideoFlow] = useState(null);
  const [qudemoData, setQudemoData] = useState(null); // Universal Demo Qudemo data
  const [loading, setLoading] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [currentTimestamp, setCurrentTimestamp] = useState(0);
  const [suggestedQuestions, setSuggestedQuestions] = useState([]);
  const videoPreloadRef = useRef({}); // For preloading videos
  const [overlayQuestions, setOverlayQuestions] = useState([]); // 3 questions for video overlay
  const [overlayQuestionOffset, setOverlayQuestionOffset] = useState(0); // Track which set of 3 questions to show
  const [showAllQuestions, setShowAllQuestions] = useState(false); // State for "More..." button
  const [chatMessages, setChatMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [videoThumbnail, setVideoThumbnail] = useState(null);
  const [previewVideoUrl, setPreviewVideoUrl] = useState(null);
  const [inputMessage, setInputMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [showBookingPrompt, setShowBookingPrompt] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoRefreshKey, setVideoRefreshKey] = useState(0);
  const [currentAvatarVideo, setCurrentAvatarVideo] = useState(null); // State for avatar video
  const [introVideoPreview, setIntroVideoPreview] = useState(null); // State for intro video preview URL
  const [isLoadingPreview, setIsLoadingPreview] = useState(false); // Loading state for preview (start false, only true when fetching)
  const videoPlayerRef = useRef(null);
  const previewVideoRef = useRef(null);
  const chatMessagesRef = useRef(null);
  const videoPreloadCacheRef = useRef({}); // Cache of preloaded video elements
  const avatarVideoCacheRef = useRef({}); // Cache for avatar videos
  const recognitionRef = useRef(null);
  const loomIframeRef = useRef(null);
  const hasLoadedDataRef = useRef(false); // Track if we've already loaded data
  const hasShownIntroRef = useRef(false); // Track if intro video has been shown
  const hasCachedVideosRef = useRef(false); // Track if we've already cached videos
  
  // User data collection states
  const [collectionPhase, setCollectionPhase] = useState(null); // 'name', 'email', 'company', or null
  const collectionPhaseRef = useRef(null); // Ref to track phase without re-renders
  const collectionHasStartedRef = useRef(false); // CRITICAL: Track if collection has EVER started
  
  // Debug: Log when collectionPhase changes and update ref
  useEffect(() => {
    console.log('🔄 Collection phase changed to:', collectionPhase);
    collectionPhaseRef.current = collectionPhase; // Always keep ref in sync
  }, [collectionPhase]);
  const [collectedUserData, setCollectedUserData] = useState({
    name: null,
    email: null,
    company: null
  });
  const [collectionSettings, setCollectionSettings] = useState({
    enabled: false,
    collectName: false,
    collectEmail: false,
    collectCompany: false
  });
  const [collectionVideos, setCollectionVideos] = useState({
    name: null,
    email: null,
    company: null,
    complete: null
  });
  const [isCollectionComplete, setIsCollectionComplete] = useState(false);
  
  // Generate a unique session ID for each widget instance (each visitor)
  const [sessionId] = useState(() => {
    // Always generate a fresh UUID - don't reuse from sessionStorage
    // This ensures each visitor gets their own unique session
    const id = crypto.randomUUID();
    console.log('🆔 Generated new session ID for this visitor:', id);
    return id;
  });
  
  // Track session start time for calculating time spent
  const sessionStartTime = useRef(Date.now());
  
  const introPreviewRef = useRef(null); // Ref for intro video preview element
  
  // Universal Demo share token
  const UNIVERSAL_DEMO_TOKEN = 'ca6b5a1b-0764-4e1c-bf6c-3e3c5bc93d1d';

  // Position classes
  const positionClasses = {
    'bottom-right': 'bottom-4 right-4 md:bottom-6 md:right-6',
    'bottom-left': 'bottom-4 left-4 md:bottom-6 md:left-6',
    'top-right': 'top-4 right-4 md:top-6 md:right-6',
    'top-left': 'top-4 left-4 md:top-6 md:left-6'
  };

  // Load video thumbnail on mount (for preview)
  useEffect(() => {
    console.log('🚀 FloatingQudemoWidget MOUNTED', { qudemoId, companyName, isPreview });
    
    // Only load static video thumbnail if NOT in playground mode (no qudemoId)
    if (!qudemoId) {
      loadVideoThumbnail();
    }
    
    setupSpeechRecognition();
    
    return () => {
      console.log('💀 FloatingQudemoWidget UNMOUNTED', { qudemoId, companyName });
    };
  }, []);

  // Load specific QuDemo data immediately if qudemoId is provided (for playground/embed)
  useEffect(() => {
    if (qudemoId && companyName && !hasLoadedDataRef.current) {
      console.log('🚀 Widget: Auto-loading QuDemo data (qudemoId provided)');
      hasLoadedDataRef.current = true; // Mark as loaded immediately to prevent re-runs
      loadBetaVersionData();
    }
  }, [qudemoId, companyName]);

  // Preload static demo data immediately on mount (for instant widget opening)
  useEffect(() => {
    // Skip if this is a specific QuDemo (playground/embed mode)
    if (qudemoId) {
      return; // Data already loaded by the immediate effect above
    }
    
    // For universal widget: preload data immediately on page load (not when expanded)
    if (!hasLoadedDataRef.current) {
      console.log('🚀 Widget: Preloading static demo data on page load for instant access');
      hasLoadedDataRef.current = true; // Prevent re-loading
      loadBetaVersionData();
    }
  }, [qudemoId]); // Run once on mount (qudemoId doesn't change)
  
  // Trigger initial video load when videoFlow becomes available
  useEffect(() => {
    if (isExpanded && videoFlow && videoFlow.videos && videoFlow.videos.length > 0 && !loading) {
      // Start playing the initial video
      setIsPlaying(true);
    }
  }, [videoFlow, isExpanded, loading]);

  // Auto-scroll chat messages
  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Auto-play intro video when widget is first expanded
  useEffect(() => {
    if (isExpanded && !hasShownIntroRef.current && qudemoData && qudemoData.id) {
      console.log('🎬 Widget expanded - loading intro video...');
      loadIntroVideo();
      hasShownIntroRef.current = true; // Mark as shown
      
      // Unmute the intro preview video if it's playing
      if (introPreviewRef.current) {
        introPreviewRef.current.muted = false;
      }
    }
  }, [isExpanded, qudemoData]);

  // Fetch intro video preview for collapsed state (only for specific QuDemos, not static demo)
  useEffect(() => {
    // Only fetch intro video if this is a specific QuDemo (qudemoId prop provided)
    // For static demo (no qudemoId), preview is already in videoFlow
    if (qudemoId && qudemoData && qudemoData.id && !introVideoPreview) {
      console.log('🎬 Triggering intro video preview fetch for specific QuDemo...');
      fetchIntroVideoPreview();
    } else if (qudemoId && qudemoData && qudemoData.id && introVideoPreview === null && isLoadingPreview) {
      // If we have qudemoData but still loading, give it a timeout
      const timeout = setTimeout(() => {
        if (isLoadingPreview && !introVideoPreview) {
          console.log('⏱️ Intro video fetch timeout - clearing loading state');
          setIsLoadingPreview(false);
        }
      }, 3000); // 3 second timeout
      return () => clearTimeout(timeout);
    }
  }, [qudemoData, introVideoPreview, isLoadingPreview]);
  
  // Debug: Log preview state changes
  useEffect(() => {
    console.log('🖼️ Preview state:', {
      isLoadingPreview,
      hasIntroVideo: !!introVideoPreview,
      hasQudemoId: !!qudemoId,
      hasVideoFlow: !!videoFlow,
      hasVideoThumbnail: !!videoThumbnail,
      hasPreviewImage: !!previewImage
    });
  }, [isLoadingPreview, introVideoPreview, qudemoId, videoFlow, videoThumbnail, previewImage]);

  // Ensure preview videos are muted and play (for both intro and static)
  useEffect(() => {
    if (introVideoPreview && introPreviewRef.current && !isExpanded) {
      const videoElement = introPreviewRef.current;
      videoElement.muted = true;
      // Force play after a tiny delay to ensure video is ready
      setTimeout(() => {
        videoElement.play().catch(err => console.log('Preview play prevented:', err));
      }, 50);
    }
  }, [introVideoPreview, isExpanded]);
  
  // Also handle static preview video (for demo on home page)
  const staticVideoRef = useRef(null);
  useEffect(() => {
    if (!qudemoId && videoFlow && videoFlow.videos && videoFlow.videos[0] && staticVideoRef.current && !isExpanded) {
      console.log('🎬 Static preview video ready - attempting to play');
      const videoElement = staticVideoRef.current;
      videoElement.muted = true;
      
      // Try multiple times to ensure it plays
      const attemptPlay = () => {
        videoElement.play()
          .then(() => console.log('✅ Static preview playing'))
          .catch(err => console.log('⚠️ Static preview play prevented:', err));
      };
      
      attemptPlay();
      setTimeout(attemptPlay, 100);
      setTimeout(attemptPlay, 500);
    }
  }, [qudemoId, videoFlow, isExpanded]);

  // Also try to fetch intro video preview directly when qudemoId/companyName are provided as props
  const hasAttemptedDirectFetchRef = useRef(false);
  
  useEffect(() => {
    // Only fetch once, with proper validation
    if (qudemoId && companyName && !introVideoPreview && !qudemoData && !hasAttemptedDirectFetchRef.current) {
      // Validate that companyName and qudemoId are valid strings
      if (typeof companyName !== 'string' || typeof qudemoId !== 'string' || !companyName.trim() || !qudemoId.trim()) {
        console.warn('⚠️ Invalid companyName or qudemoId, skipping intro video fetch');
        return;
      }
      
      console.log('🎬 Fetching intro video preview with props (before qudemoData)...');
      hasAttemptedDirectFetchRef.current = true; // Mark as attempted
      
      // Fetch intro video directly
      const fetchDirectIntroVideo = async () => {
        try {
          setIsLoadingPreview(true);
          const response = await fetch(
            getVideoApiUrl(`/ask/${encodeURIComponent(companyName)}/${qudemoId}`),
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ question: "INTRO_VIDEO" })
            }
          );
          const data = await response.json();
          if (data && data.has_avatar_video && data.avatar_video_url) {
            console.log('✅ Setting intro video preview URL (from props)');
            setIntroVideoPreview(data.avatar_video_url);
          }
        } catch (error) {
          console.error('❌ Error fetching intro video preview (from props):', error);
        } finally {
          setIsLoadingPreview(false);
        }
      };
      fetchDirectIntroVideo();
    }
  }, [qudemoId, companyName, qudemoData, introVideoPreview]);

  // Select 3 questions for video overlay based on offset - triggers on suggestedQuestions change and offset change
  useEffect(() => {
    if (!suggestedQuestions || suggestedQuestions.length === 0) return;
    
    // Calculate which 3 questions to show based on offset
    const startIndex = overlayQuestionOffset % suggestedQuestions.length;
    const selected = [];
    
    for (let i = 0; i < 3 && i < suggestedQuestions.length; i++) {
      const index = (startIndex + i) % suggestedQuestions.length;
      selected.push(suggestedQuestions[index]);
    }
    
    setOverlayQuestions(selected);
  }, [suggestedQuestions, overlayQuestionOffset]);

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
        videoPreloadCacheRef.current[video.id] = {
          element: preloadVideo,
          ready: true,
          src: video.url || video.src
        };
      });
      
      preloadVideo.addEventListener('error', () => {
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
      });
    }
  }, [currentVideoIndex, videoFlow]);

  // Update video state when currentVideoIndex changes
  useEffect(() => {
    if (isExpanded && videoFlow?.videos[currentVideoIndex]) {
      // Video index changed - no need to reset ended state anymore
    }
  }, [currentVideoIndex, videoFlow, isExpanded]);

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
      // Use default preview image
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
        // Use previewImage fallback
      }
    });
    
    video.addEventListener('error', () => {
      video.remove();
    });
  };

  // Proactively cache ALL videos when page loads (only for specific QuDemos)
  const preloadAllVideos = async () => {
    try {
      // Only preload for specific QuDemos, not static demo
      if (!qudemoId || !companyName) {
        console.log('ℹ️ Skipping video preload for static demo (uses video-flow.json)');
        return;
      }
      
      // Check if videos are already cached for this session
      if (hasCachedVideosRef.current) {
        console.log('✅ Videos already cached for this session, skipping');
        return;
      }
      
      console.log('🎬 Starting proactive video caching for specific QuDemo:', qudemoId);
      
      // Mark as cached immediately to prevent duplicate calls
      hasCachedVideosRef.current = true;
      
      // Get FAQ version/timestamp to check if cache is valid
      const cacheKey = `qudemo_${companyName}_${qudemoId}`;
      const cachedVersion = localStorage.getItem(`${cacheKey}_version`);
      
      // Fetch all FAQs to get video URLs directly
      const apiUrl = getVideoApiUrl(
        `/faqs/${encodeURIComponent(companyName)}/${qudemoId}`
      );
      
      const response = await fetch(apiUrl);
      const data = await response.json();
      
      if (data && data.faqs) {
        const currentVersion = data.version || data.updated_at || Date.now();
        
        // Check if we need to refresh cache
        if (cachedVersion !== String(currentVersion)) {
          console.log('🔄 FAQ version changed, refreshing video cache...');
          localStorage.setItem(`${cacheKey}_version`, String(currentVersion));
        }
        
        console.log(`📦 Found ${data.faqs.length} FAQs, caching videos...`);
        
        // Preload ALL videos in background
        let cachedCount = 0;
        for (const faq of data.faqs) {
          if (faq.video_url && faq.video_status === 'completed') {
            try {
              // Create hidden video element to trigger browser cache
              const video = document.createElement('video');
              video.preload = 'auto';
              video.src = faq.video_url.replace(/ /g, '%20');
              video.style.display = 'none';
              document.body.appendChild(video);
              
              // Store in memory cache
              videoPreloadRef.current[faq.question] = faq.video_url;
              
              // Remove from DOM after loaded
              video.addEventListener('loadeddata', () => {
                document.body.removeChild(video);
              });
              
              video.addEventListener('error', () => {
                document.body.removeChild(video);
              });
              
              cachedCount++;
              console.log(`✅ Cached ${cachedCount}/${data.faqs.length}: ${faq.question.substring(0, 40)}...`);
            } catch (err) {
              console.log('⚠️ Could not cache video for:', faq.question);
            }
          }
        }
        
        console.log(`✅ Video caching complete! ${cachedCount} videos cached.`);
        console.log('⚡ All questions will now play INSTANTLY!');
      }
    } catch (error) {
      console.error('❌ Error in proactive video caching:', error);
    }
  };
  
  // Legacy function for backward compatibility
  const preloadVideosForQuestions = async (questions) => {
    // This is now handled by preloadAllVideos()
    // Kept for backward compatibility
    console.log('ℹ️ Using new proactive caching strategy...');
  };

  const loadBetaVersionData = async () => {
    try {
      console.log('🔄 Loading QuDemo data...');
      setLoading(true);
      
      let videoFlowData = null;
      
      // Only load static video flow if no specific qudemoId is provided
      if (!qudemoId) {
        // Try to get from sessionStorage first
        const cachedVideoFlow = sessionStorage.getItem('static_video_flow');
        if (cachedVideoFlow) {
          console.log('⚡ Using cached static video flow');
          videoFlowData = JSON.parse(cachedVideoFlow);
        } else {
          console.log('📹 Widget: Loading static video flow from API');
          const videoFlowResponse = await fetch('/video-flow.json');
          videoFlowData = await videoFlowResponse.json();
          // Cache it for future toggles
          sessionStorage.setItem('static_video_flow', JSON.stringify(videoFlowData));
        }
        setVideoFlow(videoFlowData);
      } else {
        console.log('🎯 Widget: Skipping static video flow (qudemoId provided)');
      }
      
      // Load QuDemo data (either specific QuDemo or Universal Demo)
      let loadedQudemo = null;
      try {
        let qudemoResponse;
        
        // If qudemoId is provided, fetch that specific QuDemo
        if (qudemoId && companyName) {
          console.log('🎯 Widget: Loading specific QuDemo:', qudemoId, companyName);
          
          // Try with authentication first (for logged-in users)
          const token = localStorage.getItem('accessToken');
          if (token) {
            try {
              qudemoResponse = await fetch(getNodeApiUrl(`/api/qudemos/${qudemoId}`), {
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              });
              
              // If auth fails, fall through to public endpoint
              if (!qudemoResponse.ok) {
                console.log('⚠️ Auth fetch failed, trying public endpoint');
                throw new Error('Auth failed');
              }
            } catch (authError) {
              console.log('⚠️ Trying public endpoint without auth');
              // Try public endpoint without auth
              qudemoResponse = await fetch(getNodeApiUrl(`/api/qudemos/public/${qudemoId}`));
            }
          } else {
            // No token, use public endpoint
            console.log('🌐 No auth token, using public endpoint');
            qudemoResponse = await fetch(getNodeApiUrl(`/api/qudemos/public/${qudemoId}`));
          }
        } else {
          // Otherwise, load Universal Demo - try cache first
          const cachedUniversalDemo = sessionStorage.getItem('universal_demo');
          if (cachedUniversalDemo) {
            console.log('⚡ Using cached Universal Demo');
            qudemoResponse = { json: () => Promise.resolve(JSON.parse(cachedUniversalDemo)) };
          } else {
            console.log('🌐 Widget: Loading Universal Demo from API');
            qudemoResponse = await fetch(getNodeApiUrl(`/api/qudemos/share/${UNIVERSAL_DEMO_TOKEN}`));
          }
        }
        
        const qudemoResponseData = await qudemoResponse.json();
        
        // Cache Universal Demo if it's not a specific QuDemo
        if (!qudemoId) {
          sessionStorage.setItem('universal_demo', JSON.stringify(qudemoResponseData));
        }
        
        if (qudemoResponseData.success && (qudemoResponseData.data || qudemoResponseData.qudemo)) {
          const qudemo = qudemoResponseData.data || qudemoResponseData.qudemo;
          
          // Extract company name from nested company object or use passed-in companyName
          let extractedCompanyName = companyName || qudemo.company?.name || qudemo.company_name;
          
          // If still no company name, use fallback
          if (!extractedCompanyName) {
            extractedCompanyName = 'Qudemo';
          }
          
          // Add company_name to root level for easier access
          qudemo.company_name = extractedCompanyName;
          
          setQudemoData(qudemo);
          loadedQudemo = qudemo; // Store for later use
          console.log('✅ Widget: QuDemo loaded:', qudemo.title || qudemo.name, '- Company:', extractedCompanyName);
          console.log('📦 Widget: Full QuDemo data:', {
            id: qudemo.id,
            title: qudemo.title,
            company_name: qudemo.company_name,
            videos: qudemo.videos?.length || 0,
            knowledge_sources: qudemo.knowledge_sources?.length || 0
          });
          
          // Extract user data collection settings
          if (qudemo.collect_user_info) {
            console.log('👤 User data collection enabled for this QuDemo');
            setCollectionSettings({
              enabled: qudemo.collect_user_info || false,
              collectName: qudemo.collect_name || false,
              collectEmail: qudemo.collect_email || false,
              collectCompany: qudemo.collect_company || false
            });
          }
        }
      } catch (qudemoError) {
        console.error('❌ Widget: Failed to load qudemo:', qudemoError);
      }
      
      // Extract suggested questions from video flow (static videos)
      const staticQuestions = [];
      if (videoFlowData && videoFlowData.videos && videoFlowData.videos.length > 0) {
        // Get questions from the intro video (first video)
        const introVideo = videoFlowData.videos[0];
        if (introVideo.nextQuestions) {
          introVideo.nextQuestions.forEach(q => {
            if (q.text && !staticQuestions.includes(q.text)) {
              staticQuestions.push(q.text);
            }
          });
        }
        
        // If we need more questions, get from other videos
        if (staticQuestions.length < 6) {
          videoFlowData.videos.forEach(video => {
            if (video.nextQuestions && staticQuestions.length < 6) {
              video.nextQuestions.forEach(q => {
                if (q.text && !staticQuestions.includes(q.text) && staticQuestions.length < 6) {
                  staticQuestions.push(q.text);
                }
              });
            }
          });
        }
      }
      
      // Set static questions immediately
      console.log('📋 Setting static questions immediately:', staticQuestions);
      setSuggestedQuestions(staticQuestions);
      
      // Fetch suggested questions from Python API ONLY for specific QuDemos (not static demo)
      // Static demo uses questions from video-flow.json only
      if (qudemoId && loadedQudemo && loadedQudemo.id && loadedQudemo.company_name) {
        console.log('🎯 Fetching Python API questions for specific QuDemo:', qudemoId);
        
        // Check cache first
        const cachedQuestions = sessionStorage.getItem(`suggested_questions_${qudemoId}`);
        
        if (cachedQuestions) {
          // Use cached questions immediately
          console.log('⚡ Using cached suggested questions');
          try {
            const suggestedQuestionsData = JSON.parse(cachedQuestions);
            const questionsArray = suggestedQuestionsData.questions || suggestedQuestionsData.suggested_questions || [];
            
            if (questionsArray && questionsArray.length > 0) {
              const qudemoQuestions = questionsArray.map(q => {
                if (typeof q === 'string') return q;
                return q.question || q.text || q.title || '';
              }).filter(q => q.trim() !== '');
              
              const allQuestions = qudemoId && qudemoQuestions.length > 0 
                ? qudemoQuestions 
                : [...staticQuestions, ...qudemoQuestions];
              
              setSuggestedQuestions(allQuestions.slice(0, 15));
              console.log('✅ Updated with cached questions:', allQuestions.length);
            }
          } catch (err) {
            console.error('❌ Error parsing cached questions:', err);
          }
        } else {
          // Fetch in background with timeout - don't block widget loading
          console.log('🔍 Fetching suggested questions in background (non-blocking)...');
          
          const suggestedQuestionsUrl = getVideoApiUrl(`/suggested-questions/${encodeURIComponent(loadedQudemo.company_name)}/${loadedQudemo.id}`);
          
          // Fetch with 5 second timeout
          const fetchWithTimeout = (url, timeout = 5000) => {
            return Promise.race([
              fetch(url),
              new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Timeout')), timeout)
              )
            ]);
          };
          
          fetchWithTimeout(suggestedQuestionsUrl, 5000)
            .then(response => response.json())
            .then(suggestedQuestionsData => {
              console.log('📊 Background fetch complete - updating questions');
              
              // Cache for this specific QuDemo
              sessionStorage.setItem(`suggested_questions_${qudemoId}`, JSON.stringify(suggestedQuestionsData));
              
              const questionsArray = suggestedQuestionsData.questions || suggestedQuestionsData.suggested_questions || [];
              
              if (questionsArray && questionsArray.length > 0) {
                const qudemoQuestions = questionsArray.map(q => {
                  if (typeof q === 'string') return q;
                  return q.question || q.text || q.title || '';
                }).filter(q => q.trim() !== '');
                
                const allQuestions = qudemoId && qudemoQuestions.length > 0 
                  ? qudemoQuestions 
                  : [...staticQuestions, ...qudemoQuestions];
                
                setSuggestedQuestions(allQuestions.slice(0, 15));
                console.log('✅ Updated with API questions:', allQuestions.length);
              }
            })
            .catch(error => {
              console.warn('⚠️ Background fetch failed (non-critical):', error.message);
              // Keep using static questions - widget still works
            });
        }
      }
      
      // Identify collection videos from FAQs (if collection is enabled) - non-blocking with timeout
      // Only fetch for specific QuDemos, not static demo
      if (qudemoId && loadedQudemo && loadedQudemo.id && loadedQudemo.company_name && loadedQudemo.collect_user_info) {
        console.log('🎯 Fetching collection videos for specific QuDemo:', qudemoId);
        
        const cachedFaqs = sessionStorage.getItem(`collection_faqs_${qudemoId}`);
        
        if (cachedFaqs) {
          // Use cached FAQs immediately
          console.log('⚡ Using cached collection FAQs');
          try {
            const faqsData = JSON.parse(cachedFaqs);
            
            if (faqsData && faqsData.faqs) {
              const nameVideo = faqsData.faqs.find(f => f.question === 'NAME_REQUEST');
              const emailVideo = faqsData.faqs.find(f => f.question === 'EMAIL_REQUEST');
              const companyVideo = faqsData.faqs.find(f => f.question === 'COMPANY_REQUEST');
              const completeVideo = faqsData.faqs.find(f => f.question === 'COLLECTION_COMPLETE');
              
              setCollectionVideos({
                name: nameVideo,
                email: emailVideo,
                company: companyVideo,
                complete: completeVideo
              });
              
              console.log('✅ Collection videos identified from cache');
            }
          } catch (err) {
            console.error('❌ Error parsing cached FAQs:', err);
          }
        } else {
          // Fetch in background with timeout - don't block widget loading
          console.log('👤 Fetching collection videos in background (non-blocking)...');
          
          const faqsUrl = getVideoApiUrl(`/faqs/${encodeURIComponent(loadedQudemo.company_name)}/${loadedQudemo.id}`);
          
          const fetchWithTimeout = (url, timeout = 5000) => {
            return Promise.race([
              fetch(url),
              new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Timeout')), timeout)
              )
            ]);
          };
          
          fetchWithTimeout(faqsUrl, 5000)
            .then(response => response.json())
            .then(faqsData => {
              console.log('📊 Background FAQs fetch complete');
              
              // Cache for this specific QuDemo
              sessionStorage.setItem(`collection_faqs_${qudemoId}`, JSON.stringify(faqsData));
              
              if (faqsData && faqsData.faqs) {
                const nameVideo = faqsData.faqs.find(f => f.question === 'NAME_REQUEST');
                const emailVideo = faqsData.faqs.find(f => f.question === 'EMAIL_REQUEST');
                const companyVideo = faqsData.faqs.find(f => f.question === 'COMPANY_REQUEST');
                const completeVideo = faqsData.faqs.find(f => f.question === 'COLLECTION_COMPLETE');
                
                setCollectionVideos({
                  name: nameVideo,
                  email: emailVideo,
                  company: companyVideo,
                  complete: completeVideo
                });
                
                console.log('✅ Collection videos identified:', {
                  name: !!nameVideo,
                  email: !!emailVideo,
                  company: !!companyVideo,
                  complete: !!completeVideo
                });
              }
            })
            .catch(error => {
              console.warn('⚠️ Background FAQs fetch failed (non-critical):', error.message);
              // Widget still works without collection videos
            });
        }
      }
      
      // Proactively cache ALL videos in background
      preloadAllVideos();
      
    } catch (error) {
      console.error('❌❌❌ CRITICAL ERROR in loadBetaVersionData:', error);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error stack:', error.stack);
      
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
      
      // For static demo (no qudemoId), ensure loading preview is false
      // since preview video is already in videoFlow
      if (!qudemoId) {
        console.log('✅ Static demo loaded - clearing preview loading state');
        setIsLoadingPreview(false);
      }
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
    
    // INTERCEPT: If collection phase is active, capture this as user data
    if (collectionPhase) {
      console.log(`✅ CAPTURED ${collectionPhase} via chat:`, userQuestion);
      
      // Add user message to chat
      setChatMessages(prev => [...prev, { type: 'user', text: userQuestion }]);
      setInputMessage('');
      
      // Store the collected data
      handleUserDataSubmit(collectionPhase, userQuestion);
      return; // Don't send to /ask endpoint
    }
    
    // Add user message
    setChatMessages(prev => [...prev, { type: 'user', text: userQuestion }]);
    setInputMessage('');
    setIsTyping(true);

    // Check if user wants to book a meeting
    if (isSalesRelated(userQuestion)) {
      // Try to get sales avatar video first
      try {
        const companyName = qudemoData.company_name || qudemoData.company?.name || 'unknown';
        const response = await fetch(
          getVideoApiUrl(`/ask/${encodeURIComponent(companyName)}/${qudemoData.id}`),
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question: "SALES_INQUIRY" })
          }
        );
        
        const data = await response.json();
        
        // If we got an avatar video for sales inquiry, use it
        if (data && data.has_avatar_video && data.avatar_video_url) {
        setChatMessages(prev => [...prev, { 
          type: 'bot', 
            text: data.answer
          }]);
          
          setCurrentAvatarVideo({
            videoUrl: data.avatar_video_url,
            answer: data.answer,
            faqId: 'faq_fallback_sales'
          });
          
          // Submit interaction to backend
          submitInteraction(userQuestion, data.answer, 'faq_fallback_sales');
          
          setIsPlaying(false);
          setShowBookingPrompt(true);
          setIsTyping(false);
          return;
        }
      } catch (error) {
        console.error('Error fetching sales avatar:', error);
      }
      
      // Fallback to text-only if no avatar video
      setIsTyping(false);
      setChatMessages(prev => [...prev, { 
        type: 'bot', 
        text: "I'd be happy to connect you with our team! Please click the 'Book a Meeting' button below to schedule a call with our sales team."
      }]);
      setShowBookingPrompt(true);
      return;
    }

    // STEP 1: Check if question matches static video-flow questions (but skip fallback matches)
    const matchResult = matchQuestion(userQuestion);
    
    // Only use static video if it's a STRONG match (not fallback)
    if (matchResult.matched && matchResult.videoIndex !== null && matchResult.videoIndex !== -1 && !matchResult.isFallback) {
      // Use static video response
    setTimeout(() => {
        setChatMessages(prev => [...prev, { 
          type: 'bot', 
          text: matchResult.answer || "Let me show you a video that answers your question!"
        }]);

        // Pause current video first
        setIsPlaying(false);
        
        // Switch to the matched static video
        setCurrentVideoIndex(matchResult.videoIndex);
        setCurrentTimestamp(0);
        
        // Force refresh and auto-play
        setTimeout(() => {
          setVideoRefreshKey(prev => prev + 1);
          setIsPlaying(true);
        }, 200);
        
        setIsTyping(false);
      }, 300);
      return;
    }
    
    // STEP 2: If no static match, call Universal Demo Qudemo API
    if (!qudemoData || !qudemoData.id) {
      setTimeout(() => {
        setChatMessages(prev => [...prev, { 
          type: 'bot', 
          text: "I'm not sure about that. You can ask me about Qudemo, pricing, security, or other features!"
        }]);
        setIsTyping(false);
      }, 300);
      return;
    }
    
    // Get company name from qudemoData (might be nested)
    const companyName = qudemoData.company_name || qudemoData.company?.name || 'unknown';

    try {
      
      const response = await fetch(
        getVideoApiUrl(`/ask/${encodeURIComponent(companyName)}/${qudemoData.id}`),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            question: userQuestion
          })
        }
      );

      const data = await response.json();

      if (data && data.answer) {
        // Add bot response
        setChatMessages(prev => [...prev, { 
          type: 'bot', 
          text: data.answer
        }]);

        // Check if there's an avatar video (for document-based answers)
        console.log('🎬 Avatar Video Check:', {
          has_avatar_video: data.has_avatar_video,
          avatar_video_url: data.avatar_video_url,
          faq_id: data.faq_id,
          full_response: data
        });
        
        if (data.has_avatar_video && data.avatar_video_url) {
          console.log('✅ Setting avatar video state:', {
            videoUrl: data.avatar_video_url,
            answer: data.answer,
            faqId: data.faq_id
          });
          
          // Display avatar video
          setCurrentAvatarVideo({
            videoUrl: data.avatar_video_url,
            answer: data.answer,
            faqId: data.faq_id
          });
          
          console.log('✅ Avatar video state set, pausing regular video');
          
          // Submit interaction to backend
          submitInteraction(userQuestion, data.answer, data.faq_id);
          
          // Pause any playing video
          setIsPlaying(false);
          setIsTyping(false);
          return;
      } else {
          console.log('❌ No avatar video, clearing avatar state');
          // Clear avatar video if switching back to regular video
          setCurrentAvatarVideo(null);
        }

        // Check for video navigation data in the response
        let targetVideoUrl = null;
        let timestamp = 0;
        
        // First check direct video fields (this is how the Python backend sends video data)
        if (data && data.video_url) {
          targetVideoUrl = data.video_url;
          timestamp = data.start || data.timestamp || 0;
          
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

        // Switch video if we have a valid video URL
        if (targetVideoUrl && qudemoData.videos) {
          // First, pause the current video to ensure clean transition
          setIsPlaying(false);
          
          // Find if this video is in our qudemo's videos
          const videoIndex = qudemoData.videos.findIndex(v => 
            v.video_url === targetVideoUrl || v.video_url.includes(targetVideoUrl)
          );

          if (videoIndex !== -1) {
            const qudemoVideo = qudemoData.videos[videoIndex];
            
            // Update the video flow to use the Qudemo video
            const tempVideo = {
              id: `qudemo-${qudemoVideo.id}`,
              url: qudemoVideo.video_url,
              src: qudemoVideo.video_url,
              title: qudemoVideo.video_title || 'Qudemo Video',
              subtitle: null,
              nextQuestions: []
            };

            // Add to videoFlow temporarily (only if not already there)
            setVideoFlow(prev => {
              const exists = prev.videos.some(v => 
                v.url === tempVideo.url || v.src === tempVideo.url
              );
              if (!exists) {
                return {
                  ...prev,
                  videos: [...prev.videos, tempVideo]
                };
              }
              return prev;
            });
            
            // Set the video index and timestamp
            setTimeout(() => {
              // Find the index in videoFlow
              const targetIndex = videoFlow.videos.findIndex(v => 
                (v.url || v.src) === tempVideo.url
              );
              
              if (targetIndex !== -1) {
                setCurrentVideoIndex(targetIndex);
              } else {
                setCurrentVideoIndex(videoFlow.videos.length);
              }
              
              setCurrentTimestamp(timestamp);
              
              // Force video to seek to new timestamp after a brief delay
              setTimeout(() => {
                // Update timestamp
                setCurrentTimestamp(timestamp);
                // Set playing to true BEFORE incrementing refresh key
                setIsPlaying(true);
                // Increment refresh key to force video player re-render with playing=true
                setVideoRefreshKey(prev => prev + 1);
                
                // Try to seek directly using the player ref if available
                setTimeout(() => {
                  if (videoPlayerRef.current && videoPlayerRef.current.seekTo) {
                    try {
                      videoPlayerRef.current.seekTo(timestamp);
                    } catch (error) {
                      // Seek failed
                    }
                  }
                }, 500); // Wait for player to be ready
              }, 200);
            }, 100);
          }
        }
        
        // Submit interaction for video-based answers
        if (data && data.answer) {
          submitInteraction(userQuestion, data.answer, data.faq_id || null);
        }
      } else {
        const noAnswerText = "I couldn't find a relevant answer. You can ask me about Qudemo, pricing, security, or other features!";
        setChatMessages(prev => [...prev, { 
          type: 'bot', 
          text: noAnswerText
        }]);
        
        // Submit interaction for no-answer case
        submitInteraction(userQuestion, noAnswerText, null);
      }
      
      setIsTyping(false);
    } catch (error) {
      setTimeout(() => {
        setChatMessages(prev => [...prev, { 
          type: 'bot', 
          text: "Sorry, I encountered an error. Please try asking your question again."
        }]);
        setIsTyping(false);
      }, 300);
    }
  };

  // Submit visitor interaction to backend
  const submitInteraction = async (question, answer, faqId) => {
    if (!qudemoData || !qudemoData.id) {
      console.log('⚠️ Cannot submit interaction - no qudemoData');
      return;
    }
    
    // Simple rule: If we have user's name OR email, save the interaction
    const hasUserData = collectedUserData.name || collectedUserData.email;
    
    // If collection is enabled but user hasn't provided data yet, skip
    if (!hasUserData && collectionSettings.enabled) {
      console.log('⚠️ Skipping interaction - user data collection enabled but not completed yet');
      return;
    }
    
    // Calculate time spent (in seconds)
    const timeSpentSeconds = Math.floor((Date.now() - sessionStartTime.current) / 1000);
    
    // Determine if this is anonymous or identified
    const isAnonymous = !collectionSettings.enabled;
    
    console.log('💾 Saving interaction to database...', {
      mode: isAnonymous ? 'ANONYMOUS' : 'IDENTIFIED',
      collection_enabled: collectionSettings.enabled,
      question,
      visitor_name: collectedUserData.name || null,
      visitor_email: collectedUserData.email || null,
      time_spent: timeSpentSeconds
    });
    
    try {
      const pythonApiUrl = getVideoApiUrl('');
      const response = await fetch(`${pythonApiUrl}/visitor-interaction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qudemo_id: qudemoData.id,
          session_id: sessionId,
          visitor_name: collectedUserData.name,
          visitor_email: collectedUserData.email,
          visitor_company: collectedUserData.company,
          question,
          answer,
          faq_id: faqId,
          source: 'widget',
          time_spent: timeSpentSeconds
        })
      });
      
      if (response.ok) {
        console.log('✅ Interaction saved to database successfully');
      } else {
        console.error('❌ Failed to save interaction:', response.status);
      }
    } catch (error) {
      console.error('❌ Error submitting interaction:', error);
    }
  };

  // Submit initial user profile data when collection completes
  const submitUserProfile = async (userData) => {
    if (!qudemoData || !qudemoData.id) {
      console.error('❌ Cannot submit user profile - missing qudemoData or id');
      return;
    }
    
    console.log('💾 Submitting user profile to database...');
    console.log('   QuDemo ID:', qudemoData.id);
    console.log('   Session ID:', sessionId);
    console.log('   Name:', userData.name);
    console.log('   Email:', userData.email);
    console.log('   Company:', userData.company);
    
    try {
      const pythonApiUrl = getVideoApiUrl('');
      console.log('   API URL:', `${pythonApiUrl}/visitor-interaction`);
      
      const payload = {
        qudemo_id: qudemoData.id,
        session_id: sessionId,
        visitor_name: userData.name,
        visitor_email: userData.email,
        visitor_company: userData.company,
        question: '👤 User profile created',
        answer: 'Welcome! Feel free to ask me any questions.',
        faq_id: 'faq_user_collection_complete',
        source: 'widget'
      };
      
      console.log('   Payload:', payload);
      
      const response = await fetch(`${pythonApiUrl}/visitor-interaction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const responseData = await response.json();
      console.log('   Response:', responseData);
      
      if (response.ok) {
        console.log('✅ User profile saved to database successfully');
        console.log('   Interaction ID:', responseData.interaction_id);
      } else {
        console.error('❌ Failed to save user profile:', response.statusText);
        console.error('   Error details:', responseData);
      }
    } catch (error) {
      console.error('❌ Error submitting user profile:', error);
    }
  };

  // Handle user data form submission
  const handleUserDataSubmit = (field, value) => {
    console.log(`✅ USER DATA SUBMITTED!`);
    console.log(`   Field: ${field}`);
    console.log(`   Value: ${value}`);
    console.log(`   Current collectionPhase: ${collectionPhase}`);
    console.log(`   Collected data so far:`, collectedUserData);
    
    // Build complete user data with the new value
    const updatedUserData = { ...collectedUserData, [field]: value };
    
    // Store the data
    setCollectedUserData(updatedUserData);
    
    // Check if this is the last field - if so, save to database
    const isLastField = 
      (field === 'company') || 
      (field === 'email' && !collectionSettings.collectCompany) ||
      (field === 'name' && !collectionSettings.collectEmail && !collectionSettings.collectCompany);
    
    if (isLastField) {
      console.log('🎯 This is the last collection field - saving to database');
      // Wait a bit for state to update, then submit to database
      setTimeout(() => {
        submitUserProfile(updatedUserData);
      }, 500);
    }
    
    // Move to next phase
    proceedToNextCollectionPhase();
  };

  // Handle user data form skip
  const handleUserDataSkip = () => {
    console.log('⏭️ User skipped data collection');
    proceedToNextCollectionPhase();
  };

  // Proceed to next phase of collection  
  const proceedToNextCollectionPhase = () => {
    console.log('╔═══════════════════════════════════════════════════╗');
    console.log('║ proceedToNextCollectionPhase CALLED               ║');
    console.log('╚═══════════════════════════════════════════════════╝');
    console.log('   Current phase (state):', collectionPhase);
    console.log('   Current phase (ref):', collectionPhaseRef.current);
    console.log('   Collected data:', collectedUserData);
    console.log('   Settings:', { 
      collectEmail: collectionSettings.collectEmail, 
      collectCompany: collectionSettings.collectCompany 
    });
    
    // CRITICAL GUARD: Prevent duplicate execution (React Strict Mode causes double calls)
    if (collectionPhaseRef.current === null) {
      console.log('⚠️⚠️⚠️ DUPLICATE CALL DETECTED - REF ALREADY NULL ⚠️⚠️⚠️');
      console.log('   This function was already executed, skipping duplicate');
      console.log('   EXITING to prevent restart');
      console.log('╚═══════════════════════════════════════════════════╝');
      return;
    }
    
    // Use functional updates to avoid stale state
    setCollectionPhase(currentPhase => {
      console.log('   Phase transition from:', currentPhase);
      console.log('   Phase from ref:', collectionPhaseRef.current);
      
      // Update ref immediately
      let nextPhase = null;
      
      // Determine what comes next based on CURRENT phase
      if (currentPhase === 'name') {
        // Coming from NAME - check if EMAIL is next
        if (collectionSettings.collectEmail && collectionVideos.email) {
          console.log('   ➡️ NAME → EMAIL');
          nextPhase = 'email';
          collectionPhaseRef.current = 'email'; // Update ref immediately!
          setTimeout(() => {
            console.log('   🎬 Setting EMAIL video');
            setCurrentAvatarVideo({
              videoUrl: collectionVideos.email.video_url,
              answer: collectionVideos.email.answer,
              faqId: collectionVideos.email.id
            });
          }, 200);
          return nextPhase;
        } else if (collectionSettings.collectCompany && collectionVideos.company) {
          console.log('   ➡️ NAME → COMPANY (skipped email)');
          nextPhase = 'company';
          collectionPhaseRef.current = 'company'; // Update ref immediately!
          setTimeout(() => {
            console.log('   🎬 Setting COMPANY video');
            setCurrentAvatarVideo({
              videoUrl: collectionVideos.company.video_url,
              answer: collectionVideos.company.answer,
              faqId: collectionVideos.company.id
            });
          }, 200);
          return nextPhase;
        }
      } else if (currentPhase === 'email') {
        // Coming from EMAIL - check if COMPANY is next
        if (collectionSettings.collectCompany && collectionVideos.company) {
          console.log('   ➡️ EMAIL → COMPANY');
          nextPhase = 'company';
          collectionPhaseRef.current = 'company'; // Update ref immediately!
          setTimeout(() => {
            console.log('   🎬 Setting COMPANY video');
            setCurrentAvatarVideo({
              videoUrl: collectionVideos.company.video_url,
              answer: collectionVideos.company.answer,
              faqId: collectionVideos.company.id
            });
          }, 200);
          return nextPhase;
        }
      } else if (currentPhase === 'company') {
        // Coming from COMPANY - go to completion
        console.log('   ➡️ COMPANY → COMPLETION');
      }
      
      // If we got here, no more fields to collect - go to completion
      if (collectionVideos.complete) {
        console.log('   ➡️ Going to COMPLETION video');
        collectionPhaseRef.current = null; // Clear ref immediately!
        
        // Mark collection as complete IMMEDIATELY - don't wait for video to end
        // This allows users to ask questions while completion video is playing
        console.log('   ✅ Marking collection as COMPLETE (before video ends)');
        setIsCollectionComplete(true);
        
        setTimeout(() => {
          console.log('   🎬 Setting COMPLETION video');
          setCurrentAvatarVideo({
            videoUrl: collectionVideos.complete.video_url,
            answer: collectionVideos.complete.answer,
            faqId: collectionVideos.complete.id
          });
        }, 200);
        return null; // Clear phase
      } else {
        console.log('   ✅ Collection complete (no completion video)');
        collectionPhaseRef.current = null; // Clear ref immediately!
        setIsCollectionComplete(true);
        return null;
      }
    });
    
    console.log('╚═══════════════════════════════════════════════════╝');
  };

  // Handle avatar video end - triggers collection flow
  const handleAvatarVideoEnd = (faqId) => {
    console.log('═══════════════════════════════════════════════════');
    console.log('🎬 handleAvatarVideoEnd CALLED');
    console.log('   Video that ended:', faqId);
    console.log('   Current collection phase (state):', collectionPhase);
    console.log('   Current collection phase (ref):', collectionPhaseRef.current);
    console.log('   Collection complete?:', isCollectionComplete);
    console.log('   Collection settings:', collectionSettings);
    console.log('═══════════════════════════════════════════════════');
    
    // CRITICAL GUARD: Use REF to check phase (more reliable than state)
    const currentPhase = collectionPhaseRef.current;
    
    if (currentPhase === 'name' || currentPhase === 'email' || currentPhase === 'company') {
      console.log('🛑🛑🛑 GUARD TRIGGERED 🛑🛑🛑');
      console.log('   Already collecting data for:', currentPhase);
      console.log('   Form is visible, waiting for user to submit');
      console.log('   Video that ended:', faqId);
      console.log('   ⚠️ IGNORING this video end event');
      console.log('   EXITING handleAvatarVideoEnd immediately');
      console.log('═══════════════════════════════════════════════════');
      return; // ABSOLUTELY DO NOT PROCEED
    }
    
    // Additional guard: Check if this is a collection video
    if (faqId === 'faq_user_name_request' || 
        faqId === 'faq_user_email_request' || 
        faqId === 'faq_user_company_request') {
      console.log('⚠️ Collection video ended but phase is:', currentPhase);
      console.log('   This should not happen - phase should be active');
      console.log('   EXITING as safety measure');
      console.log('═══════════════════════════════════════════════════');
      return;
    }
    
    // If completion video ended, mark collection as complete
    if (faqId === 'faq_user_collection_complete') {
      console.log('🎯 Completion video ended - setting isCollectionComplete to TRUE');
      setIsCollectionComplete(true);
      console.log('✅ User data collection flow complete');
      console.log('   Future questions will now be saved to database');
      return;
    }
    
    // CRITICAL: If intro video ended but collection has EVER been started, ignore it!
    // This prevents late intro video endings from restarting the flow
    // Using REF not state because state updates are async and unreliable here
    if (faqId === 'faq_intro' && collectionHasStartedRef.current) {
      console.log('⚠️⚠️⚠️ IGNORING LATE INTRO VIDEO END ⚠️⚠️⚠️');
      console.log('   Collection has already started (ref confirms)');
      console.log('   collectionHasStartedRef:', collectionHasStartedRef.current);
      console.log('   Current phase:', currentPhase);
      console.log('   This is likely a stale video element');
      console.log('   EXITING to prevent restart');
      console.log('═══════════════════════════════════════════════════');
      return;
    }
    
    // Only start collection if intro ended AND collection has never started
    if (faqId === 'faq_intro' && collectionSettings.enabled && !collectionHasStartedRef.current) {
      console.log('🎯 INTRO ENDED - Starting collection flow');
      console.log('   Setting collectionHasStartedRef to TRUE');
      collectionHasStartedRef.current = true; // Mark that collection has started
      
      // Start collection sequence
      if (collectionSettings.collectName && collectionVideos.name) {
        console.log('   → Starting with NAME collection');
        collectionPhaseRef.current = 'name'; // Set ref first!
        setCollectionPhase('name');
        setCurrentAvatarVideo({
          videoUrl: collectionVideos.name.video_url,
          answer: collectionVideos.name.answer,
          faqId: collectionVideos.name.id
        });
      } else if (collectionSettings.collectEmail && collectionVideos.email) {
        console.log('   → Starting with EMAIL collection');
        collectionPhaseRef.current = 'email'; // Set ref first!
        setCollectionPhase('email');
        setCurrentAvatarVideo({
          videoUrl: collectionVideos.email.video_url,
          answer: collectionVideos.email.answer,
          faqId: collectionVideos.email.id
        });
      } else if (collectionSettings.collectCompany && collectionVideos.company) {
        console.log('   → Starting with COMPANY collection');
        collectionPhaseRef.current = 'company'; // Set ref first!
        setCollectionPhase('company');
        setCurrentAvatarVideo({
          videoUrl: collectionVideos.company.video_url,
          answer: collectionVideos.company.answer,
          faqId: collectionVideos.company.id
        });
      } else if (collectionVideos.complete) {
        console.log('   → No collection needed, playing completion');
        setCurrentAvatarVideo({
          videoUrl: collectionVideos.complete.video_url,
          answer: collectionVideos.complete.answer,
          faqId: collectionVideos.complete.id
        });
      }
      console.log('═══════════════════════════════════════════════════');
      return;
    }
    
    console.log('ℹ️ No action taken in handleAvatarVideoEnd');
    console.log('═══════════════════════════════════════════════════');
  };

  const loadIntroVideo = async () => {
    try {
      console.log('🎥 Loading intro video for QuDemo...');
      
      if (!qudemoData || !qudemoData.id) {
        console.log('❌ No QuDemo data available');
        return;
      }
      
      const companyName = qudemoData.company_name || qudemoData.company?.name;
      
      if (!companyName) {
        console.log('❌ No company name available');
        return;
      }
      
      // Make a special request to get the intro video
      const response = await fetch(
        getVideoApiUrl(`/ask/${encodeURIComponent(companyName)}/${qudemoData.id}`),
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: "INTRO_VIDEO" })
        }
      );
      
      const data = await response.json();
      
      console.log('🎥 Intro video response:', data);
      
      if (data && data.has_avatar_video && data.avatar_video_url) {
        console.log('✅ Intro video found, auto-playing...');
        
        // Set the intro avatar video
        setCurrentAvatarVideo({
          videoUrl: data.avatar_video_url,
          answer: data.answer,
          faqId: 'faq_intro'
        });
        
        // Pause any regular video
        setIsPlaying(false);
      } else {
        console.log('ℹ️ No intro video available yet');
      }
    } catch (error) {
      console.error('❌ Error loading intro video:', error);
    }
  };

  const fetchIntroVideoPreview = async () => {
    try {
      console.log('🎬 Fetching intro video for collapsed preview...');
      setIsLoadingPreview(true);
      
      if (!qudemoData || !qudemoData.id) {
        console.log('❌ No QuDemo data available for preview');
        setIsLoadingPreview(false);
        return;
      }
      
      const companyName = qudemoData.company_name || qudemoData.company?.name;
      
      if (!companyName) {
        console.log('❌ No company name available for preview');
        setIsLoadingPreview(false);
        return;
      }
      
      // Fetch intro video URL
      const response = await fetch(
        getVideoApiUrl(`/ask/${encodeURIComponent(companyName)}/${qudemoData.id}`),
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: "INTRO_VIDEO" })
        }
      );
      
      const data = await response.json();
      
      console.log('🎬 Intro video preview response:', data);
      
      if (data && data.has_avatar_video && data.avatar_video_url) {
        console.log('✅ Setting intro video preview URL');
        setIntroVideoPreview(data.avatar_video_url);
      } else {
        console.log('ℹ️ No intro video available for preview');
      }
    } catch (error) {
      console.error('❌ Error fetching intro video preview:', error);
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const handleSuggestedQuestionClick = (question) => {
    handleSendMessage(question);
  };

  const loadSubtitles = (subtitleUrl) => {
    if (!videoPlayerRef.current) {
      return;
    }

    // Clear existing subtitle tracks
    const existingTracks = videoPlayerRef.current.querySelectorAll('track');
    existingTracks.forEach(track => {
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
      const textTrack = track.track;
      
      if (textTrack && textTrack.cues) {
        // Set mode to 'showing' to display browser's native subtitles
        textTrack.mode = 'showing';
        
        // Enable all text tracks (show browser's native subtitles)
        if (videoPlayerRef.current && videoPlayerRef.current.textTracks) {
          for (let i = 0; i < videoPlayerRef.current.textTracks.length; i++) {
            videoPlayerRef.current.textTracks[i].mode = 'showing';
          }
        }
      }
    });

    track.addEventListener('error', (e) => {
      // Subtitle loading failed
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
    
    // First pass: Exact match with video questions (skip intro)
    for (const video of videoFlow.videos) {
      if (video.question && !video.isIntro) {
        const lowerVideoQuestion = video.question.toLowerCase();
        if (lowerQuestion === lowerVideoQuestion) {
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
    
    // Unmute the video when widget is expanded
    setTimeout(() => {
      if (videoPlayerRef.current) {
        videoPlayerRef.current.muted = false;
      }
    }, 100);
  };

  const handleMinimize = () => {
    setIsMinimized(true);
  };

  const handleClose = () => {
    setIsExpanded(false);
    setIsMinimized(false);
    setIsMaximized(false); // Reset maximized state when closing
    
    // Mute the video when closing
    if (videoPlayerRef.current) {
      videoPlayerRef.current.muted = true;
    }
    
    // Clean up preloaded videos when widget is closed
    Object.keys(videoPreloadCacheRef.current).forEach(id => {
      const cached = videoPreloadCacheRef.current[id];
      if (cached?.element?.parentNode) {
        cached.element.parentNode.removeChild(cached.element);
      }
    });
    videoPreloadCacheRef.current = {};
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
        {/* Text above widget */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Top text */}
          <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-3 py-1 rounded-lg text-sm font-medium whitespace-nowrap shadow-lg">
            Ask me questions
          </div>
        </div>
        
        <button
          onClick={handleExpand}
          className="group relative"
        >
          {/* Circular video preview with pulse animation */}
          <div className="relative w-20 h-20 md:w-36 md:h-36 rounded-full overflow-hidden shadow-2xl border-4 border-white hover:border-blue-500 transition-all duration-300">
            {isLoadingPreview && introVideoPreview === null && qudemoId ? (
              <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-white"></div>
              </div>
            ) : introVideoPreview ? (
              <video 
                ref={introPreviewRef}
                src={introVideoPreview.replace(/ /g, '%20')}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
                style={{ objectPosition: 'center 0%' }}
              />
            ) : qudemoData && qudemoData.presenter_photo_url ? (
              <img 
                src={qudemoData.presenter_photo_url} 
                alt="Presenter" 
                className="w-full h-full object-cover"
                style={{ objectPosition: 'center center' }}
              />
            ) : !qudemoId && videoFlow && videoFlow.videos && videoFlow.videos[0] && videoFlow.videos[0].src ? (
              <video 
                ref={staticVideoRef}
                src={videoFlow.videos[0].src || videoFlow.videos[0].url}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
                style={{ objectPosition: 'center 0%' }}
              />
            ) : !qudemoId && (videoThumbnail || previewImage) ? (
              <img 
                src={videoThumbnail || previewImage} 
                alt="Demo" 
                className="w-full h-full object-cover"
                style={{ objectPosition: 'center 0%' }}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <ChatBubbleLeftRightIcon className="w-16 h-16 text-white" />
              </div>
            )}

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
    <>
      {/* Mobile overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={handleClose}></div>
      
      <div className={`fixed inset-0 md:inset-auto md:${positionClasses[position]} z-50 transition-all duration-300 p-4 md:p-0 flex items-center justify-center md:block`}>
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
         // Full expanded widget - shows only video in normal view, adds chat when maximized
         <div 
          className={`bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-row w-full md:w-auto transition-all duration-300 ${
            isMaximized ? 'fixed inset-4' : ''
          }`}
          style={{ 
            width: isMaximized ? 'auto' : (window.innerWidth >= 768 ? '313px' : '100%'),
            height: isMaximized ? 'auto' : (window.innerWidth >= 768 ? '700px' : 'auto'),
            border:'none', 
            outline:'none',
          }}
         >
           {loading ? (
            <div className="w-full p-8 flex flex-col items-center justify-center bg-white">
               <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
               <p className="mt-4 text-gray-600">Loading demo...</p>
             </div>
          ) : (videoFlow && videoFlow.videos && videoFlow.videos.length > 0) || qudemoData ? (
             <>
               {/* Action buttons - absolute positioned */}
               <div className="absolute top-4 right-4 z-30 flex gap-2">
                 {/* Maximize/Restore button */}
                 <button
                   onClick={() => setIsMaximized(!isMaximized)}
                   className="bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-2 transition-all"
                   title={isMaximized ? "Restore" : "Maximize"}
                 >
                   {isMaximized ? (
                     <ArrowsPointingInIcon className="w-5 h-5" />
                   ) : (
                     <ArrowsPointingOutIcon className="w-5 h-5" />
                   )}
                 </button>
                 
                 {/* Close button */}
               <button
                 onClick={handleClose}
                   className="bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-2 transition-all"
                   title="Close"
               >
                 <XMarkIcon className="w-5 h-5" />
               </button>
               </div>

               {/* Left Column: Video + Book a Meeting Button */}
               <div className={`w-full ${isMaximized ? 'md:w-[60%]' : 'md:w-full'} flex flex-col`}>
                 {/* Video Section - Optimized for Portrait Videos */}
                 <div 
                   className="relative flex items-center justify-center flex-1" 
                   style={{ 
                     height: window.innerWidth >= 768 ? 'auto' : '300px',
                     minHeight: window.innerWidth >= 768 ? '550px' : '300px',
                     overflow: 'visible'
                   }}
                 >
                {/* Show avatar video if available */}
                {currentAvatarVideo ? (
                   <div className="w-full h-full flex items-center justify-center bg-black">
                     <AvatarVideoPlayer
                       avatarVideoUrl={currentAvatarVideo.videoUrl}
                       answer={currentAvatarVideo.answer}
                       isVisible={isExpanded}
                       faqId={currentAvatarVideo.faqId}
                       avatarVideoCache={avatarVideoCacheRef.current}
                       isMaximized={isMaximized}
                       onVideoEnd={handleAvatarVideoEnd}
                     />
                   </div>
                 ) : videoFlow && videoFlow.videos && videoFlow.videos[currentVideoIndex] ? (
                   <HybridVideoPlayer
                   ref={videoPlayerRef}
                     key={`${videoFlow.videos[currentVideoIndex].url || videoFlow.videos[currentVideoIndex].src}-${currentTimestamp}-${videoRefreshKey}`}
                     url={videoFlow.videos[currentVideoIndex].url || videoFlow.videos[currentVideoIndex].src}
                     width="100%"
                     height="100%"
                     controls={false}
                     playing={isPlaying}
                     startTime={currentTimestamp}
                    style={{ width: '100%', height: '100%', objectFit: isMaximized ? 'contain' : 'cover' }}
                    onReady={() => {
                      if (isExpanded) {
                        setIsPlaying(true);
                      }
                    }}
                     onPlay={() => {
                       setIsPlaying(true);
                     }}
                     iframeRef={loomIframeRef}
                     isMaximized={isMaximized}
                   />
                 ) : null}
                
                {/* 3 Suggested Questions - Overlay on Video (Only show when NOT maximized) */}
                {!isMaximized && overlayQuestions.length > 0 && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-full px-4 z-20 flex flex-col gap-2">
                    {overlayQuestions.map((question, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestedQuestionClick(question)}
                        disabled={isTyping}
                        className="group relative text-left bg-white/90 backdrop-blur-sm hover:bg-blue-600 text-gray-800 hover:text-white px-3 py-2 rounded-xl text-xs font-medium border border-white/40 hover:border-blue-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                      >
                        <span className="flex items-center gap-2">
                          <svg className="w-3 h-3 flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="line-clamp-1">{question}</span>
                        </span>
                      </button>
                    ))}
                    
                    {/* More... button to cycle through questions */}
                    {suggestedQuestions.length > 3 && (
                      <button
                        onClick={() => setOverlayQuestionOffset(prev => prev + 3)}
                        className="text-center bg-white/80 backdrop-blur-sm hover:bg-blue-500 text-gray-700 hover:text-white px-3 py-1.5 rounded-lg text-xs font-medium border border-white/40 hover:border-blue-500 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-1"
                      >
                        More... ({suggestedQuestions.length - 3} more)
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    )}
                  </div>
                )}
                 </div>

                 {/* Chat Input - Below Video, Above Book a Meeting (Only show when NOT maximized) */}
                 {!isMaximized && (
                 <div className="w-full bg-white p-4 border-t border-gray-200">
                   <div className="relative flex items-center gap-2 bg-gray-50 rounded-2xl p-2 border border-gray-200 shadow-sm">
                     <textarea 
                       value={inputMessage} 
                       onChange={handleInputChange} 
                       onKeyDown={handleKeyPress} 
                       placeholder={
                         collectionPhase && collectionPhase !== 'complete' 
                           ? '👆 Please use the form above' 
                           : isListening ? '🎙️ Listening...' : 'Type your message...'
                       } 
                       rows="1" 
                       disabled={collectionPhase && collectionPhase !== 'complete'}
                       className={`flex-1 px-3 py-2 bg-transparent border-0 text-sm resize-none overflow-hidden min-h-[2.5rem] max-h-[5rem] focus:outline-none placeholder:text-gray-400 text-gray-900 ${collectionPhase && collectionPhase !== 'complete' ? 'opacity-50 cursor-not-allowed' : ''}`}
                     />
                     
                     {/* Voice input button */}
                     <button 
                       onClick={handleVoiceInput}
                       disabled={collectionPhase && collectionPhase !== 'complete'}
                       className={`min-w-[2.5rem] h-10 flex items-center justify-center rounded-xl text-white transition-all duration-200 shadow-md ${collectionPhase && collectionPhase !== 'complete' ? 'opacity-50 cursor-not-allowed bg-gray-400' : isListening ? 'bg-gradient-to-br from-green-500 to-emerald-600 animate-pulse ring-2 ring-green-300' : 'bg-gradient-to-br from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700'}`}
                       title={isListening ? "Stop recording" : "Voice input"}
                     >
                       <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                         <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                         <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                       </svg>
                     </button>
                     
                     {/* Send button */}
                     <button 
                       onClick={() => handleSendMessage()} 
                       disabled={!inputMessage.trim() || isTyping || (collectionPhase && collectionPhase !== 'complete')} 
                       className="relative min-w-[2.5rem] h-10 flex items-center justify-center bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group overflow-hidden"
                       title="Send message"
                     >
                       <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                       <svg className="w-4 h-4 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 12L3.269 3.125A59.769 59.769 0 0121.485 12 59.768 59.768 0 013.27 20.875L5.999 12zm0 0h7.5"></path>
                       </svg>
                     </button>
                   </div>
                 </div>
                 )}

                 {/* Book a Meeting Button - Below Chat Input (Only show when NOT maximized) */}
                 {!isMaximized && (
                 <div className="w-full bg-white px-4 pb-4">
                   <button
                     onClick={handleBookMeeting}
                     className="group relative w-full inline-flex items-center justify-center px-5 py-3 text-sm font-semibold rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 transform hover:-translate-y-0.5 overflow-hidden"
                   >
                     {/* Shimmer effect */}
                     <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                     
                     <svg
                       className="relative z-10 w-5 h-5 mr-2"
                       fill="none"
                       stroke="currentColor"
                       viewBox="0 0 24 24"
                       strokeWidth={2.5}
                     >
                       <path
                         strokeLinecap="round"
                         strokeLinejoin="round"
                         d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                       />
                     </svg>
                     <span className="relative z-10 font-semibold">Book a Meeting</span>
                   </button>
                 </div>
                 )}
               </div>

              {/* Chat Section (Right on desktop, Bottom on mobile) - Only show when maximized */}
              {isMaximized && (
              <div 
                className="w-full md:w-[40%] flex flex-col bg-white border-t md:border-t-0 md:border-l border-gray-200" 
                style={{ 
                  minHeight: 'auto'
                }}
               >
                 {/* Chat header - Professional Blue Design */}
                 <div className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 px-4 py-3 flex items-center justify-between flex-shrink-0 overflow-hidden">
                   {/* Animated background effect */}
                   <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-blue-600/20 to-blue-700/20 animate-pulse"></div>
                   
                   <div className="relative flex items-center gap-3">
                     {/* AI Avatar Icon */}
                     <div className="relative">
                       <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center ring-2 ring-white/40">
                         <div className="w-5 h-5 rounded-full bg-gradient-to-br from-white to-white/80 flex items-center justify-center">
                           <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                             <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                           </svg>
                         </div>
                       </div>
                       {/* Online indicator pulse */}
                       <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full ring-2 ring-white animate-pulse"></div>
                     </div>
                     
                     <div className="flex flex-col">
                       <span className="font-semibold text-white text-sm">AI Assistant</span>
                       <span className="text-white/80 text-[10px]">Ready to help</span>
                     </div>
                   </div>
                   
                   {/* Status indicator */}
                   <div className="relative flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full">
                     <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                     <span className="text-white text-[10px] font-medium">Online</span>
                   </div>
                 </div>

                 {/* Chat messages - Modern scrollable area */}
                 <div 
                   ref={chatMessagesRef} 
                   className="flex-1 overflow-y-auto p-3 md:p-4 bg-gradient-to-br from-gray-50 to-gray-100/50 flex flex-col gap-3" 
                   style={{ 
                     maxHeight: window.innerWidth >= 768 ? 'none' : '300px',
                     minHeight: window.innerWidth >= 768 ? 'auto' : '250px'
                   }}
                 >
                   {chatMessages.length === 0 ? (
                     <>
                       {/* Welcome message - Professional Blue design */}
                       <div className="relative bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200/50 rounded-2xl p-4 shadow-sm">
                         <div className="flex items-start gap-3">
                           <div className="flex-shrink-0">
                             <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg">
                               <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                 <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                               </svg>
                             </div>
                           </div>
                           <div className="flex-1">
                             <p className="text-gray-700 text-sm font-medium mb-1">Hi! I'm your AI assistant 👋</p>
                             <p className="text-gray-600 text-xs">Ask me anything about this demo, and I'll help you find what you're looking for.</p>
                           </div>
                         </div>
                       </div>
                       
                       {/* Initial Suggested Questions - Modern chip design */}
                       {suggestedQuestions && suggestedQuestions.length > 0 && (
                         <div className="flex flex-col gap-2">
                           <p className="text-xs text-gray-500 font-semibold px-1 flex items-center gap-1">
                             <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                               <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                             </svg>
                             Try asking:
                           </p>
                           {suggestedQuestions.map((question, index) => (
                         <button
                           key={index}
                               onClick={() => handleSuggestedQuestionClick(question)}
                           disabled={isTyping}
                               className="group relative text-left bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100/50 text-gray-700 hover:text-blue-700 px-4 py-2.5 rounded-xl text-xs border border-gray-200 hover:border-blue-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                             >
                               <span className="flex items-center gap-2">
                                 <svg className="w-3 h-3 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                 </svg>
                                 {question}
                               </span>
                         </button>
                       ))}
                         </div>
                       )}
                     </>
                   ) : (
                     <>
                       {chatMessages.map((msg, i) => (
                         <React.Fragment key={i}>
                           {msg.type === 'bot' ? (
                             /* AI Message - Professional Blue design with avatar */
                             <div className="flex justify-start items-start gap-2">
                               <div className="flex-shrink-0 mt-1">
                                 <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-md">
                                   <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                     <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                                   </svg>
                                 </div>
                               </div>
                               <div className="max-w-[80%] bg-gradient-to-br from-white to-gray-50 border border-gray-200 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm text-sm leading-relaxed text-gray-800 text-left">
                                 {msg.text}
                               </div>
                             </div>
                           ) : (
                             /* User Message - Professional Blue design */
                             <div className="flex justify-end">
                               <div className="max-w-[80%] bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 rounded-2xl rounded-tr-sm shadow-md text-sm leading-relaxed text-white">
                                 {msg.text}
                     </div>
                   </div>
                 )}
                           
                           {/* Show suggested questions after each bot response - Modern chip design */}
                           {msg.type === 'bot' && i === chatMessages.length - 1 && !isTyping && suggestedQuestions && suggestedQuestions.length > 0 && (
                             <div className="flex flex-col gap-2 mt-2 ml-9">
                               <p className="text-xs text-gray-500 font-semibold px-1 flex items-center gap-1">
                                 <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                   <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                 </svg>
                                 Related:
                               </p>
                              {(showAllQuestions ? suggestedQuestions : suggestedQuestions.slice(0, 3)).map((question, qIndex) => (
                                <button
                                  key={qIndex}
                                  onClick={() => handleSuggestedQuestionClick(question)}
                                  disabled={isTyping}
                                  className="group relative text-left bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100/50 text-gray-700 hover:text-blue-700 px-3 py-2 rounded-xl text-xs border border-gray-200 hover:border-blue-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                                >
                                  <span className="flex items-center gap-2">
                                    <svg className="w-3 h-3 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                    {question}
                                  </span>
                                </button>
                              ))}
                              
                              {/* Show More/Less Button - Small and unobtrusive */}
                              {suggestedQuestions.length > 3 && (
                                <button
                                  onClick={() => setShowAllQuestions(!showAllQuestions)}
                                  className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-blue-50 transition-all duration-200 mt-1"
                                >
                                  {showAllQuestions ? (
                                    <>
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                      </svg>
                                      Show less
                                    </>
                                  ) : (
                                    <>
                                      More... ({suggestedQuestions.length - 3} more)
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                      </svg>
                                    </>
                                  )}
                                </button>
                              )}
              </div>
                           )}
                         </React.Fragment>
                       ))}
                       {isTyping && <TypingIndicator />}
                     </>
                   )}
             </div>

                 {/* Chat input - Futuristic design */}
                 <div className="relative p-3 md:p-4 bg-gradient-to-r from-gray-50 to-white border-t border-gray-200 flex-shrink-0">
                   <div className="flex items-center gap-2">
                     {/* Modern input field with glass effect */}
                     <div className="flex-1 relative">
                       <textarea 
                        value={inputMessage} 
                        onChange={handleInputChange} 
                        onKeyDown={handleKeyPress} 
                        placeholder={
                          collectionPhase && collectionPhase !== 'complete' 
                            ? '👆 Please use the form above' 
                            : isListening ? '🎙️ Listening...' : 'Type your message...'
                        } 
                        rows="1"
                        disabled={collectionPhase && collectionPhase !== 'complete'}
                        className={`w-full px-4 py-3 pr-12 bg-white/80 backdrop-blur-sm border-2 ${isListening ? 'border-green-400 shadow-green-100' : 'border-gray-200 focus:border-blue-400'} rounded-2xl text-sm resize-none overflow-hidden min-h-[2.75rem] max-h-[7.5rem] focus:outline-none focus:ring-2 focus:ring-blue-100 shadow-sm placeholder:text-gray-400 transition-all duration-200 text-left ${collectionPhase && collectionPhase !== 'complete' ? 'opacity-50 cursor-not-allowed' : ''}`}
                      />
                       {/* Character/typing indicator */}
                       {inputMessage && (
                         <div className="absolute right-3 top-1/2 -translate-y-1/2">
                           <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                         </div>
                       )}
                     </div>
                     
                     {/* Voice input button - Modern glassmorphism */}
                     <button 
                       onClick={handleVoiceInput}
                       disabled={collectionPhase && collectionPhase !== 'complete'}
                       className={`min-w-[2.75rem] h-11 flex items-center justify-center rounded-2xl text-white transition-all duration-200 shadow-lg ${collectionPhase && collectionPhase !== 'complete' ? 'opacity-50 cursor-not-allowed bg-gray-400' : isListening ? 'bg-gradient-to-br from-green-500 to-emerald-600 animate-pulse ring-4 ring-green-200' : 'bg-gradient-to-br from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 hover:shadow-xl hover:-translate-y-0.5'}`}
                       title={isListening ? "Stop recording" : "Voice input"}
                     >
                       <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                         <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                         <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                       </svg>
                     </button>
                     
                     {/* Send button - Professional Blue gradient */}
                     <button 
                       onClick={() => handleSendMessage()} 
                       disabled={!inputMessage.trim() || isTyping || (collectionPhase && collectionPhase !== 'complete')} 
                       className="relative min-w-[2.75rem] h-11 flex items-center justify-center bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 group overflow-hidden"
                       title="Send message"
                     >
                       {/* Shimmer effect on hover */}
                       <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                       <svg className="w-5 h-5 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 12L3.269 3.125A59.769 59.769 0 0121.485 12 59.768 59.768 0 013.27 20.875L5.999 12zm0 0h7.5"></path>
                       </svg>
                     </button>
                   </div>
                   
                   {/* Helper text */}
                   <div className="mt-2 px-1 text-[10px] text-gray-400 flex items-center justify-between">
                     <span className="flex items-center gap-1">
                       <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                         <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                       </svg>
                       Press Enter to send
                     </span>
                     {isTyping && (
                       <span className="flex items-center gap-1 text-blue-600">
                         <div className="w-1 h-1 bg-blue-600 rounded-full animate-bounce"></div>
                         <div className="w-1 h-1 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                         <div className="w-1 h-1 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                         AI is thinking
                       </span>
                     )}
                   </div>
                 </div>

                 {/* Book Meeting Button - Professional Blue Design */}
                 <div className="relative px-3 py-3 md:py-3 bg-gradient-to-r from-gray-50 to-white border-t border-gray-200 flex-shrink-0">
                   <button
                     onClick={handleBookMeeting}
                     className="group relative w-full inline-flex items-center justify-center px-5 py-3 text-sm font-semibold rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 transform hover:-translate-y-0.5 overflow-hidden"
                   >
                     {/* Shimmer effect on hover */}
                     <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                     
                     {/* Animated background pulse */}
                     <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-blue-600/20 animate-pulse"></div>
                     
                     <svg
                       className="relative z-10 w-5 h-5 mr-2"
                       fill="none"
                       stroke="currentColor"
                       viewBox="0 0 24 24"
                       strokeWidth={2.5}
                     >
                       <path
                         strokeLinecap="round"
                         strokeLinejoin="round"
                         d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                       />
                     </svg>
                     <span className="relative z-10">Book a Meeting</span>
                     
                     {/* Arrow icon that appears on hover */}
                     <svg className="relative z-10 w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                     </svg>
                   </button>
                   
                   {/* Helper text */}
                   <div className="mt-1.5 text-center text-[10px] text-gray-400 flex items-center justify-center gap-1">
                     <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                       <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                     </svg>
                     Schedule a 1-on-1 demo call
                   </div>
                 </div>
               </div>
              )}
             </>
           ) : (
             <div className="w-full p-8 text-center text-gray-500 bg-white">
               <p>No demo available</p>
             </div>
           )}
         </div>
      )}
   </div>

   {/* User Data Collection Form Overlay */}
   {collectionPhase && collectionPhase !== 'complete' && isExpanded && (
     <div 
       className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[10000] p-4"
       onClick={(e) => {
         // Prevent closing by clicking outside
         e.stopPropagation();
         console.log('🚫 Clicked outside form - prevented closing');
       }}
     >
       <div 
         className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform animate-fadeIn"
         onClick={(e) => e.stopPropagation()}
       >
         <div className="text-center mb-6">
           <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
             <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
             </svg>
           </div>
           <h3 className="text-xl font-bold text-gray-900 mb-2">
             {collectionPhase === 'name' && "What's your name?"}
             {collectionPhase === 'email' && "What's your email?"}
             {collectionPhase === 'company' && "Which company are you with?"}
           </h3>
           <p className="text-sm text-gray-600">
             {collectionPhase === 'name' && "Help us personalize your experience"}
             {collectionPhase === 'email' && "We'll send you helpful resources"}
             {collectionPhase === 'company' && "Let us know where you're from"}
           </p>
         </div>

         <div className="mb-6">
           <input
             type={collectionPhase === 'email' ? 'email' : 'text'}
             value={inputMessage}
             onChange={(e) => setInputMessage(e.target.value)}
             onKeyPress={(e) => {
               if (e.key === 'Enter' && inputMessage.trim()) {
                 handleUserDataSubmit(collectionPhase, inputMessage.trim());
                 setInputMessage('');
               }
             }}
             placeholder={
               collectionPhase === 'name' ? 'Enter your name...' :
               collectionPhase === 'email' ? 'Enter your email...' :
               'Enter your company name...'
             }
             className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-gray-900"
             autoFocus
           />
         </div>

         <div className="flex gap-3">
           <button
             onClick={() => {
               handleUserDataSubmit(collectionPhase, inputMessage.trim());
               setInputMessage('');
             }}
             disabled={!inputMessage.trim()}
             className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
           >
             Continue
           </button>
           
           <button
             onClick={handleUserDataSkip}
             className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-all duration-200"
           >
             Skip
           </button>
         </div>

         <p className="text-xs text-gray-500 text-center mt-4">
           <svg className="w-3 h-3 inline-block mr-1" fill="currentColor" viewBox="0 0 20 20">
             <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
           </svg>
           Your information is secure and will not be shared
         </p>
       </div>
     </div>
   )}
   </>
  );
};

export default FloatingQudemoWidget;


