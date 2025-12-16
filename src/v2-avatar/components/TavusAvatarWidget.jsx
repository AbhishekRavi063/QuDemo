import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  PhoneOff,
  Calendar,
  Mic,
  MicOff,
  MessageSquare,
  Ear,
  Brain,
  Smile,
  User,
  Bot,
  Video,
} from "lucide-react";
import { getApiUrl, getCreateConversationUrl, getEndConversationUrl } from '../config/api';
import { useEventLogger } from '../hooks/useEventLogger';
import { useDemoVideo } from '../hooks/useDemoVideo';
import TavusSessionManager from '../utils/TavusSessionManager';
import DailyEventManager from '../utils/DailyEventManager';

/**
 * TavusAvatarWidget - Tavus CVI avatar widget using Daily.co
 *
 * Adapted from MobileAvatarWidget for Tavus/Daily.co instead of HeyGen/LiveKit
 */
export const TavusAvatarWidget = ({ onDisconnect, autoExpand = true, onExpand, personaId } = {}) => {
  console.log('[TAVUS-WIDGET] TavusAvatarWidget rendering - autoExpand:', autoExpand, 'personaId:', personaId, 'hasOnExpand:', !!onExpand);

  const [state, setState] = useState(autoExpand ? "maximized" : "minimized");
  const [isMuted, setIsMuted] = useState(true);
  const [isVoiceMode, setIsVoiceMode] = useState(true);
  const [showBookingPopup, setShowBookingPopup] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [email, setEmail] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  // Tavus/Daily states
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [debugLogs, setDebugLogs] = useState([]);
  const [sessionInfo, setSessionInfo] = useState(null);
  const [hasLiveVideo, setHasLiveVideo] = useState(false);
  const [hasAudio, setHasAudio] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [avatarState, setAvatarState] = useState("idle");
  const [isAvatarSpeaking, setIsAvatarSpeaking] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [transcripts, setTranscripts] = useState([]);
  const [detectedIntents, setDetectedIntents] = useState([]);
  const [showCalendly, setShowCalendly] = useState(false);
  const [calendlyUrl, setCalendlyUrl] = useState('');
  const [showPdf, setShowPdf] = useState(false);
  const [pdfUrl, setPdfUrl] = useState('');
  const [pendingPdfUrl, setPendingPdfUrl] = useState(null);

  const mountedRef = useRef(true);
  const lastAvatarSpeechRef = useRef('');
  const preDemoWidgetStateRef = useRef(null);
  const preCalendlyWidgetStateRef = useRef(null);
  const preCalendlyMutedRef = useRef(false);
  const preCalendlyAudioEnabledRef = useRef(true);
  const pendingCalendlyRef = useRef(false);
  const pendingDemoVideoRef = useRef(null); // Store pending video URL
  const prePdfWidgetStateRef = useRef(null);
  const hasAutoExpandedRef = useRef(false);

  // Session manager and event manager refs
  const sessionManagerRef = useRef(null);
  const dailyEventManagerRef = useRef(null);
  const sessionInfoRef = useRef(null);

  // Event logging hook
  const { logs, log, clearLogs } = useEventLogger();

  // Add debug log and send to backend
  const addDebugLog = (message) => {
    const timestampedMsg = `${new Date().toLocaleTimeString()}: ${message}`;
    setDebugLogs(prev => [...prev, timestampedMsg].slice(-10));
    console.log('[TAVUS-DEBUG]', message);

    // Send to backend for logging
    try {
      fetch(`${getApiUrl()}/api/mobile-logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          log: `[TAVUS] ${timestampedMsg}`,
          userAgent: navigator.userAgent
        })
      }).catch(() => {});
    } catch (e) {}
  };

  // Demo video hook
  const { isDemoPlaying, currentVideoUrl, isYouTube, youTubeEmbedUrl, demoVideoRef, playDemoVideo, stopDemoVideo } = useDemoVideo({
    sessionManager: sessionManagerRef.current,
    log,
    setState,
  });

  // Setup DailyEventManager callbacks
  useEffect(() => {
    if (!dailyEventManagerRef.current) {
      return;
    }

    dailyEventManagerRef.current.setCallbacks({
      onReplicaStartSpeaking: () => {
        setIsAvatarSpeaking(true);
        setAvatarState("speaking");
      },
      onReplicaStopSpeaking: (lastSpeech, interrupted) => {
        setIsAvatarSpeaking(false);
        setAvatarState("listening");
        // Demo triggers are handled via tool calls in Tavus, no speech detection needed
      },
      onUserStartSpeaking: () => {
        setIsUserSpeaking(true);
      },
      onUserStopSpeaking: () => {
        setIsUserSpeaking(false);
      },
      onUserTranscript: (text, source) => {
        handleUserSpeech(text, source);
      },
      onReplicaTranscript: (text, source) => {
        handleReplicaSpeech(text, source);
      },
      onToolCall: (name, args, properties) => {
        log('TOOL_CALL', `Tool called: ${name}`, { args });
        handleToolCall(name, args);
      },
      onReplicaJoined: (replicaId) => {
        log('SYSTEM', 'Replica joined the call', { replicaId });
      },
      onUnhandledMessage: (msg) => {
        log('DATA_CHANNEL', 'Unhandled message', msg);
      }
    });
  }, [log]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle user speech
  const handleUserSpeech = (text, source) => {
    if (!text) return;
    log('USER_SPEECH', `User said (${source})`, { text });
    setTranscripts((prev) =>
      [
        ...prev,
        {
          type: "user_speech",
          text: text,
          timestamp: Date.now(),
        },
      ].slice(-10)
    );
    detectIntent(text, { text }, "user");
  };

  // Handle replica speech
  const handleReplicaSpeech = (text, source) => {
    if (!text) return;
    log('REPLICA_SPEECH', `Replica said (${source})`, { text });
    setTranscripts((prev) =>
      [
        ...prev,
        {
          type: "avatar_speech",
          text: text,
          timestamp: Date.now(),
        },
      ].slice(-10)
    );
    lastAvatarSpeechRef.current = text;
    detectIntent(text, { text }, "avatar");
  };

  // Handle tool calls from Tavus
  const handleToolCall = (name, args) => {
    switch (name) {
      case 'schedule_meeting':
      case 'book_call':
        log('TOOL_CALL', 'Scheduling meeting via tool call', { calendly_url: args.calendly_url });

        // Send echo message to acknowledge the request
        if (dailyEventManagerRef.current) {
          dailyEventManagerRef.current.sendEchoMessage("Opening the calendar for you now.");
        }

        // Use URL from tool args
        if (args.calendly_url) {
          setCalendlyUrl(args.calendly_url);
        }

        pendingCalendlyRef.current = true;
        break;
      case 'show_demo':
        if (args.videoUrl) {
          playDemoVideo(args.videoUrl);
        }
        break;
      case 'show_demo_video':
        // Handle show_demo_video tool call from Tavus persona
        log('TOOL_CALL', 'show_demo_video triggered', { url: args.url, title: args.title });

        // Send echo message to announce the video
        if (dailyEventManagerRef.current) {
          dailyEventManagerRef.current.sendEchoMessage("Absolutely, here's the video you requested.");
        }

        // Store the video URL and wait for avatar to finish speaking
        if (args.url) {
          pendingDemoVideoRef.current = args.url;
          log('DEMO', 'Video pending - waiting for user and avatar to finish speaking');
        }
        break;
      case 'show_pdf':
        // Handle show_pdf tool call from Tavus persona
        log('TOOL_CALL', 'show_pdf triggered', { url: args.url, title: args.title });

        // Send echo message to announce the PDF
        if (dailyEventManagerRef.current) {
          dailyEventManagerRef.current.sendEchoMessage("Sure, here's the document you requested.");
        }

        // Store the PDF URL and wait for avatar to finish speaking
        if (args.url) {
          setPendingPdfUrl(args.url);
          log('PDF', 'PDF pending - waiting for avatar to finish speaking');
        }
        break;
      default:
        log('TOOL_CALL', `Unhandled tool: ${name}`);
    }
  };

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Restore widget state after demo ends
  useEffect(() => {
    if (!isDemoPlaying && preDemoWidgetStateRef.current !== null) {
      // Restore avatar audio
      setAudioEnabled(true);
      log('DEMO', 'Demo ended - restoring avatar audio');

      if (sessionManagerRef.current?.isInitialized) {
        log('DEMO', 'Returning to maximized state after demo closed');
        setState("maximized");
      } else {
        log('DEMO', 'No active session - keeping minimized');
        setState("minimized");
      }
      preDemoWidgetStateRef.current = null;
    }
  }, [isDemoPlaying, log]);

  // Restore widget state after calendly closes
  useEffect(() => {
    if (!showCalendly && preCalendlyWidgetStateRef.current !== null) {
      if (sessionManagerRef.current?.isInitialized) {
        log('CALENDLY', 'Returning to maximized state after calendly closed');
        setState("maximized");
      } else {
        log('CALENDLY', 'No active session - keeping minimized');
        setState("minimized");
      }
      preCalendlyWidgetStateRef.current = null;
    }
  }, [showCalendly, log]);

  // Wait for both user and avatar to finish speaking before opening Calendly
  useEffect(() => {
    if (pendingCalendlyRef.current && !isAvatarSpeaking && !isUserSpeaking) {
      log('CALENDLY', 'Both user and replica finished speaking - opening Calendly now');
      preCalendlyWidgetStateRef.current = state;
      if (state !== "maximized") {
        setState("maximized");
      }
      setShowCalendly(true);
      pendingCalendlyRef.current = false;
    }
  }, [isAvatarSpeaking, isUserSpeaking, state, log]);

  // Wait for both user and avatar to finish speaking before playing demo video
  useEffect(() => {
    if (pendingDemoVideoRef.current && !isAvatarSpeaking && !isUserSpeaking) {
      const videoUrl = pendingDemoVideoRef.current;
      log('DEMO', 'Both user and replica finished speaking - playing video now');

      // Mute avatar audio before playing video
      setAudioEnabled(false);

      // Save current state for restoration later
      preDemoWidgetStateRef.current = state;

      // Maximize if not already, then play
      if (state !== "maximized") {
        setState("maximized");
        setTimeout(() => {
          playDemoVideo(videoUrl);
        }, 300);
      } else {
        playDemoVideo(videoUrl);
      }

      pendingDemoVideoRef.current = null;
    }
  }, [isAvatarSpeaking, isUserSpeaking, state, log, playDemoVideo]);

  // Wait for both user and avatar to finish speaking before showing PDF
  useEffect(() => {
    if (pendingPdfUrl && !isAvatarSpeaking && !isUserSpeaking) {
      log('PDF', 'Both user and replica finished speaking - showing PDF now');

      // Save current state for restoration later
      prePdfWidgetStateRef.current = state;

      // Maximize if not already, then show PDF
      if (state !== "maximized") {
        setState("maximized");
        setTimeout(() => {
          setPdfUrl(pendingPdfUrl);
          setShowPdf(true);
          setPendingPdfUrl(null);
        }, 300);
      } else {
        setPdfUrl(pendingPdfUrl);
        setShowPdf(true);
        setPendingPdfUrl(null);
      }
    }
  }, [isAvatarSpeaking, isUserSpeaking, pendingPdfUrl, state, log]);

  // Restore widget state after PDF closes
  useEffect(() => {
    if (!showPdf && prePdfWidgetStateRef.current !== null) {
      if (sessionManagerRef.current?.isInitialized) {
        log('PDF', 'Returning to maximized state after PDF closed');
        setState("maximized");
      } else {
        log('PDF', 'No active session - keeping minimized');
        setState("minimized");
      }
      prePdfWidgetStateRef.current = null;
    }
  }, [showPdf, log]);

  // Clone avatar video to PDF PIP
  useEffect(() => {
    if (showPdf && hasLiveVideo) {
      const sourceVideo = document.querySelector('#tavus-video-container video');
      const pipContainer = document.getElementById('pdf-avatar-pip');

      if (sourceVideo && pipContainer) {
        const pipVideo = sourceVideo.cloneNode(true);
        pipVideo.style.width = '100%';
        pipVideo.style.height = '100%';
        pipVideo.style.objectFit = 'cover';
        pipVideo.muted = false;

        if (sourceVideo.srcObject) {
          pipVideo.srcObject = sourceVideo.srcObject;
        }

        pipContainer.innerHTML = '';
        pipContainer.appendChild(pipVideo);
        pipVideo.play().catch(e => console.log('PDF PIP video play failed:', e));
      }
    }
  }, [showPdf, hasLiveVideo]);

  // Clone avatar video to calendly PIP
  useEffect(() => {
    if (showCalendly && hasLiveVideo) {
      const sourceVideo = document.querySelector('#tavus-video-container video');
      const pipContainer = document.getElementById('calendly-avatar-pip');

      if (sourceVideo && pipContainer) {
        const pipVideo = sourceVideo.cloneNode(true);
        pipVideo.style.width = '100%';
        pipVideo.style.height = '100%';
        pipVideo.style.objectFit = 'cover';
        pipVideo.muted = false;

        if (sourceVideo.srcObject) {
          pipVideo.srcObject = sourceVideo.srcObject;
        }

        pipContainer.innerHTML = '';
        pipContainer.appendChild(pipVideo);
        pipVideo.play().catch(e => console.log('PIP video play failed:', e));
      }
    }
  }, [showCalendly, hasLiveVideo]);

  // Mute mic and avatar audio when calendly opens
  useEffect(() => {
    if (showCalendly) {
      preCalendlyMutedRef.current = isMuted;
      preCalendlyAudioEnabledRef.current = audioEnabled;

      if (!isMuted && sessionManagerRef.current) {
        sessionManagerRef.current.setMicrophoneMuted(true);
        setIsMuted(true);
      }

      if (audioEnabled) {
        setAudioEnabled(false);
      }
    } else {
      // Restore audio when calendly closes
      if (sessionManagerRef.current?.isInitialized) {
        sessionManagerRef.current.setMicrophoneMuted(false);
        setIsMuted(false);
      }

      if (!audioEnabled) {
        setAudioEnabled(true);
      }
    }
  }, [showCalendly]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync audio enabled state with session manager
  useEffect(() => {
    addDebugLog(`[SYNC-EFFECT] audioEnabled=${audioEnabled}, hasAudio=${hasAudio}`);

    const hasAudioElement = sessionManagerRef.current?.audioElement;

    if (hasAudioElement) {
      addDebugLog(`[SYNC-EFFECT] Calling setAudioMuted(${!audioEnabled})`);
      sessionManagerRef.current.setAudioMuted(!audioEnabled);
    }
  }, [audioEnabled, hasAudio]);

  // Auto-expand effect
  useEffect(() => {
    if (autoExpand && state === "minimized") {
      console.log('[TAVUS-AUTO-EXPAND] Setting state to small');
      setState("small");
    }
  }, [autoExpand, state]);

  // Auto-start session
  useEffect(() => {
    const debugInfo = {
      autoExpand,
      isConnecting,
      hasSession: sessionManagerRef.current?.isInitialized,
      hasAutoExpanded: hasAutoExpandedRef.current,
      state,
    };
    console.log('[TAVUS-AUTO-EXPAND] Effect triggered', debugInfo);

    if (autoExpand && !isConnecting && !sessionManagerRef.current?.isInitialized && !hasAutoExpandedRef.current) {
      console.log('[TAVUS-AUTO-EXPAND] Starting Tavus session...');
      addDebugLog('[AUTO-EXPAND] Starting Tavus session');
      hasAutoExpandedRef.current = true;
      startTavusSession();
    }
  }, [autoExpand]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keep refs in sync
  useEffect(() => {
    sessionInfoRef.current = sessionInfo;
  }, [sessionInfo]);

  // Component lifecycle
  useEffect(() => {
    console.log('[TAVUS-LIFECYCLE] Component mounted');
    mountedRef.current = true;
    addDebugLog('[LIFECYCLE] Component MOUNTED');

    const handlePageUnload = () => {
      addDebugLog('[PAGE-UNLOAD] handlePageUnload triggered');

      // End conversation via sendBeacon
      const currentSessionInfo = sessionInfoRef.current;
      if (currentSessionInfo?.conversationId) {
        const payload = JSON.stringify({
          conversationId: currentSessionInfo.conversationId,
        });
        navigator.sendBeacon(
          getEndConversationUrl(),
          new Blob([payload], { type: 'application/json' })
        );
      }

      // Cleanup session manager
      if (sessionManagerRef.current) {
        sessionManagerRef.current.cleanup();
      }

      // Cleanup event manager
      if (dailyEventManagerRef.current) {
        dailyEventManagerRef.current.detachFromDaily();
      }
    };

    window.addEventListener('beforeunload', handlePageUnload);
    window.addEventListener('pagehide', handlePageUnload);

    return () => {
      addDebugLog('[LIFECYCLE] Component UNMOUNTING');
      mountedRef.current = false;

      window.removeEventListener('beforeunload', handlePageUnload);
      window.removeEventListener('pagehide', handlePageUnload);

      // Cleanup
      if (sessionInfoRef.current?.conversationId) {
        endConversation(sessionInfoRef.current.conversationId);
      }

      if (sessionManagerRef.current) {
        sessionManagerRef.current.cleanup();
      }

      if (dailyEventManagerRef.current) {
        dailyEventManagerRef.current.detachFromDaily();
      }
    };
  }, []);

  // End Tavus conversation
  const endConversation = async (conversationId) => {
    if (!conversationId) return;

    try {
      addDebugLog(`[END-CONVERSATION] Ending conversation: ${conversationId}`);
      const response = await fetch(getEndConversationUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId }),
      });

      if (response.ok) {
        addDebugLog('[END-CONVERSATION] Conversation ended successfully');
      } else {
        addDebugLog(`[END-CONVERSATION] Failed: ${response.status}`);
      }
    } catch (error) {
      addDebugLog(`[END-CONVERSATION] Error: ${error.message}`);
    }
  };

  // Handle disconnect
  const handleDisconnect = async () => {
    addDebugLog('[DISCONNECT] handleDisconnect called');

    // End Tavus conversation
    if (sessionInfo?.conversationId) {
      await endConversation(sessionInfo.conversationId);
    }

    // Stop overlays
    if (isDemoPlaying) {
      stopDemoVideo();
    }
    if (showCalendly) {
      setShowCalendly(false);
    }
    if (showPdf) {
      setShowPdf(false);
    }

    // Cleanup session manager
    if (sessionManagerRef.current) {
      addDebugLog('[DISCONNECT] Cleaning up TavusSessionManager');
      await sessionManagerRef.current.cleanup();
    }

    // Cleanup event manager
    if (dailyEventManagerRef.current) {
      dailyEventManagerRef.current.detachFromDaily();
    }

    // Reset state
    setSessionInfo(null);
    setHasLiveVideo(false);
    setHasAudio(false);
    setIsMuted(true);
    setAudioEnabled(true);
    setState("minimized");
    setIsConnecting(false);
    setConnectionError(null);
    setDebugLogs([]);
    setTranscripts([]);
    setDetectedIntents([]);
    setAvatarState("idle");
    setIsAvatarSpeaking(false);
    setIsUserSpeaking(false);

    // Clear refs
    lastAvatarSpeechRef.current = '';
    preDemoWidgetStateRef.current = null;
    preCalendlyWidgetStateRef.current = null;
    preCalendlyMutedRef.current = false;
    preCalendlyAudioEnabledRef.current = true;
    pendingCalendlyRef.current = false;
    pendingDemoVideoRef.current = null;
    prePdfWidgetStateRef.current = null;
    hasAutoExpandedRef.current = false;

    // Clear dynamic URLs and pending states
    setCalendlyUrl('');
    setPdfUrl('');
    setPendingPdfUrl(null);

    if (onDisconnect) {
      onDisconnect();
    }
  };

  // Start Tavus session
  const startTavusSession = async () => {
    console.log('[START-SESSION] Called - isConnecting:', isConnecting);

    if (isConnecting || sessionManagerRef.current?.isInitialized) {
      console.log('[START-SESSION] Aborting - already connecting or session exists');
      return;
    }

    addDebugLog('Setting isConnecting=true');
    setIsConnecting(true);

    try {
      // Step 1: Create Tavus conversation via API
      const apiUrl = getCreateConversationUrl();
      addDebugLog(`Calling API: ${apiUrl}`);

      const resp = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personaId }),
      });

      addDebugLog(`API Status: ${resp.status}`);

      if (!resp.ok) {
        const errorText = await resp.text();
        addDebugLog(`API Error: ${errorText.substring(0, 50)}`);
        throw new Error(`API returned ${resp.status}: ${errorText.substring(0, 100)}`);
      }

      const response = await resp.json();
      addDebugLog('API Success, got credentials');

      const { conversationId, conversationUrl } = response;

      if (!conversationUrl) {
        throw new Error('Missing conversation URL in response');
      }

      setSessionInfo({ conversationId, conversationUrl });

      // Step 2: Create and initialize TavusSessionManager
      addDebugLog('Initializing TavusSessionManager...');
      sessionManagerRef.current = new TavusSessionManager();
      sessionManagerRef.current.setLogger(addDebugLog);

      const daily = await sessionManagerRef.current.initialize(
        conversationUrl,
        conversationId,
        'tavus-video-container'
      );

      // Safety check
      if (!mountedRef.current) {
        console.log('[START-SESSION] Component unmounted, aborting');
        sessionManagerRef.current.cleanup();
        setIsConnecting(false);
        return;
      }

      // Step 3: Create and attach DailyEventManager
      addDebugLog('Creating DailyEventManager...');
      dailyEventManagerRef.current = new DailyEventManager();
      dailyEventManagerRef.current.setLogger(log);

      // Setup callbacks - demo triggers handled via tool calls, no speech detection needed
      dailyEventManagerRef.current.setCallbacks({
        onReplicaStartSpeaking: () => {
          setIsAvatarSpeaking(true);
          setAvatarState("speaking");
        },
        onReplicaStopSpeaking: () => {
          setIsAvatarSpeaking(false);
          setAvatarState("listening");
        },
        onUserStartSpeaking: () => setIsUserSpeaking(true),
        onUserStopSpeaking: () => setIsUserSpeaking(false),
        onUserTranscript: handleUserSpeech,
        onReplicaTranscript: handleReplicaSpeech,
        onToolCall: handleToolCall,
        onReplicaJoined: (replicaId) => log('SYSTEM', 'Replica joined', { replicaId }),
        onUnhandledMessage: (msg) => log('DATA_CHANNEL', 'Unhandled message', msg)
      });

      // Attach to Daily
      dailyEventManagerRef.current.attachToDaily(daily, conversationId);

      // Step 4: Wait for session to be ready
      addDebugLog('Waiting for session to be ready...');
      await sessionManagerRef.current.waitForReady();

      setHasLiveVideo(sessionManagerRef.current.hasVideoTrack());
      setHasAudio(sessionManagerRef.current.hasAudioTrack());
      setIsConnecting(false);
      addDebugLog('Session fully ready!');

      // Step 5: Auto-enable microphone
      setTimeout(async () => {
        if (mountedRef.current && sessionManagerRef.current?.isInitialized) {
          addDebugLog('Auto-enabling microphone...');
          try {
            await sessionManagerRef.current.enableMicrophone();
            setIsMuted(false);
            addDebugLog('Microphone enabled!');
          } catch (e) {
            addDebugLog(`Mic failed: ${e.message}`);
            setIsMuted(true);
          }
        }
      }, 1500);

    } catch (err) {
      const errorMsg = err.message || 'Failed to connect. Please try again.';
      addDebugLog(`ERROR: ${errorMsg}`);
      setConnectionError(errorMsg);
      setIsConnecting(false);
    }
  };

  // Retry connection
  const retryConnection = () => {
    addDebugLog('Retrying connection...');
    setConnectionError(null);
    setDebugLogs([]);
    hasAutoExpandedRef.current = false;
    startTavusSession();
  };

  // Toggle audio output
  const toggleAudio = () => {
    addDebugLog('Speaker button clicked!');
    const newState = !audioEnabled;
    setAudioEnabled(newState);
    addDebugLog(`Speaker ${newState ? 'enabled' : 'muted'}`);
  };

  // Toggle microphone
  const toggleMicrophone = async () => {
    addDebugLog('Mic button clicked!');
    if (!sessionManagerRef.current?.isInitialized) {
      addDebugLog('No session, mic toggle ignored');
      return;
    }

    const newMuted = !isMuted;
    await sessionManagerRef.current.setMicrophoneMuted(newMuted);
    setIsMuted(newMuted);
    addDebugLog(`Microphone ${newMuted ? 'muted' : 'unmuted'}`);
  };

  // Intent detection
  const intentActions = [
    {
      keywords: [
        "set up a meet",
        "schedule a meeting",
        "book a call",
        "arrange a meeting",
        "schedule a call",
        "book a meeting",
      ],
      action: () => {
        log('CALENDLY', 'Schedule meeting intent detected');
        pendingCalendlyRef.current = true;
        setDetectedIntents((prev) => [...prev, "schedule_meeting"].slice(-5));
      },
      description: "Schedule meeting",
    },
  ];

  const detectIntent = (transcript, fullData, source) => {
    const lowerTranscript = transcript.toLowerCase();

    // Demo triggers are handled via Tavus tool calls (show_demo_video)
    // Only process scheduling intents here as fallback for speech-based detection
    intentActions.forEach((intent) => {
      const matched = intent.keywords.some((keyword) =>
        lowerTranscript.includes(keyword.toLowerCase())
      );
      if (matched) {
        log('INTENT_DETECTED', `${intent.description}`, { transcript, source });
        intent.action();
      }
    });
  };

  // Send message to replica
  const sendMessageToReplica = (message, type = 'respond') => {
    if (!dailyEventManagerRef.current) return;

    if (type === 'echo') {
      dailyEventManagerRef.current.sendEchoMessage(message);
    } else {
      dailyEventManagerRef.current.sendRespondMessage(message);
    }
  };

  // Interrupt replica
  const interruptReplica = () => {
    if (dailyEventManagerRef.current) {
      dailyEventManagerRef.current.interruptReplica();
    }
  };

  // Handle activity
  const handleActivity = () => {
    // Placeholder for activity tracking
  };

  // Handle expand
  const handleExpand = () => {
    handleActivity();
    setState((prev) => {
      if (prev === "minimized") {
        if (!sessionManagerRef.current?.isInitialized && !isConnecting) {
          startTavusSession();
        }
        return "small";
      }
      return prev === "small" ? "maximized" : "small";
    });
    if (onExpand) onExpand();
  };

  // Close widget
  const handleClose = () => {
    if (sessionManagerRef.current?.isInitialized) {
      handleDisconnect();
    } else {
      setState("minimized");
    }
  };

  // Get state indicator color
  const getStateColor = () => {
    switch (avatarState) {
      case "speaking":
        return "bg-emerald-500/80 border border-emerald-400/30";
      case "listening":
        return "bg-sky-500/80 border border-sky-400/30";
      case "thinking":
        return "bg-amber-500/80 border border-amber-400/30";
      default:
        return "bg-white/10 border border-white/20";
    }
  };

  // Get state icon
  const getStateIcon = () => {
    switch (avatarState) {
      case "speaking":
        return <Volume2 className="w-3 h-3" />;
      case "listening":
        return <Ear className="w-3 h-3" />;
      case "thinking":
        return <Brain className="w-3 h-3" />;
      default:
        return <Smile className="w-3 h-3" />;
    }
  };

  // Render functions for different states
  const renderMinimizedState = () => (
    <motion.div
      className="fixed bottom-4 right-4 z-50 cursor-pointer"
      onClick={handleExpand}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
        <Video className="w-8 h-8 text-white" />
      </div>
    </motion.div>
  );

  const renderConnectingState = () => (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-900 text-white p-4 overflow-hidden">
      {/* Animated background rings */}
      <div className="absolute inset-0 flex items-center justify-center">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full border border-blue-500/20"
            style={{
              width: `${150 + i * 80}px`,
              height: `${150 + i * 80}px`,
              animation: `pulse-ring ${2 + i * 0.5}s ease-in-out infinite`,
              animationDelay: `${i * 0.3}s`,
              opacity: 0.3 - i * 0.05,
            }}
          />
        ))}
      </div>

      {/* Central animated element */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Outer glow ring */}
        <div className="relative">
          <div
            className="absolute inset-0 rounded-full bg-blue-500/30 blur-xl"
            style={{ animation: 'glow-pulse 2s ease-in-out infinite' }}
          />

          {/* Avatar silhouette / icon container */}
          <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-2xl">
            {/* Inner spinning ring */}
            <div
              className="absolute inset-0 rounded-full border-2 border-transparent border-t-white/50 border-r-white/30"
              style={{ animation: 'spin 1.5s linear infinite' }}
            />

            {/* Pulsing dots */}
            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2.5 h-2.5 rounded-full bg-white"
                  style={{
                    animation: 'bounce-dot 1.4s ease-in-out infinite',
                    animationDelay: `${i * 0.16}s`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Text with fade animation */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 text-lg font-medium text-white/90"
        >
          Connecting
          <span className="inline-flex ml-1">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="opacity-0"
                style={{
                  animation: 'dot-fade 1.5s ease-in-out infinite',
                  animationDelay: `${i * 0.3}s`,
                }}
              >
                .
              </span>
            ))}
          </span>
        </motion.p>

      </div>

      {/* CSS animations */}
      <style>{`
        @keyframes pulse-ring {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.05); opacity: 0.1; }
        }
        @keyframes glow-pulse {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.2); opacity: 0.8; }
        }
        @keyframes bounce-dot {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-8px); }
        }
        @keyframes dot-fade {
          0%, 20% { opacity: 0; }
          40%, 100% { opacity: 1; }
        }
      `}</style>
    </div>
  );

  const renderErrorState = () => (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white p-4">
      <div className="text-red-500 text-4xl mb-4">!</div>
      <p className="text-sm mb-2">Connection Error</p>
      <p className="text-xs text-gray-400 mb-4 text-center">{connectionError}</p>
      <button
        onClick={retryConnection}
        className="px-4 py-2 bg-blue-500 rounded hover:bg-blue-600 text-sm"
      >
        Retry
      </button>

      {/* Debug logs */}
      <div className="w-full max-h-32 overflow-y-auto text-xs font-mono bg-black/50 rounded p-2 mt-4">
        {debugLogs.map((log, i) => (
          <div key={i} className="text-red-400">{log}</div>
        ))}
      </div>
    </div>
  );

  const renderVideoContainer = () => (
    <>
      {/* Main video container */}
      <div
        id="tavus-video-container"
        className="absolute inset-0 bg-black"
        style={{ zIndex: 0 }}
      />

      {/* Demo video overlay */}
      {isDemoPlaying && (
        <div className="absolute inset-0 z-10 bg-black">
          {/* Main Video - centered, landscape */}
          <div className="absolute inset-6 right-[420px] rounded-2xl overflow-hidden border border-white/30 shadow-[0_0_60px_rgba(255,255,255,0.25)]">
            {/* YouTube iframe or regular video element */}
            {isYouTube && youTubeEmbedUrl ? (
              <iframe
                src={youTubeEmbedUrl}
                className="w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Demo Video"
              />
            ) : (
              <video
                ref={demoVideoRef}
                className="w-full h-full object-cover"
                playsInline
                muted
                onClick={() => stopDemoVideo()}
              />
            )}
            {/* Close demo button */}
            <button
              onClick={() => stopDemoVideo()}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white z-20 border border-white/30 hover:bg-black/70 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          {/* Avatar PIP - bottom right, exact same position as "small" widget state */}
          <div
            id="avatar-pip"
            className={`absolute bottom-4 right-4 overflow-hidden rounded-2xl border border-white/30 shadow-[0_0_50px_rgba(255,255,255,0.2)] bg-black ${
              isMobile ? 'w-80 h-96' : 'w-96 h-[500px]'
            }`}
          >
            {/* PIP controls inside avatar */}
            {renderPipControlBar()}
          </div>
        </div>
      )}

      {/* Calendly overlay */}
      {showCalendly && (
        <div className="absolute inset-0 z-20 bg-black">
          {/* Calendly - main area, landscape */}
          <div className="absolute inset-6 right-[420px] rounded-2xl overflow-hidden border border-white/30 shadow-[0_0_60px_rgba(255,255,255,0.25)] bg-white">
            {/* Calendly iframe */}
            <iframe
              src={calendlyUrl}
              className="w-full h-full"
              style={{ border: 'none' }}
              title="Schedule Meeting"
            />
            {/* Close calendly button */}
            <button
              onClick={() => setShowCalendly(false)}
              className="absolute top-4 left-4 p-2 rounded-full bg-black/50 text-white z-30 border border-white/30 hover:bg-black/70 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          {/* Avatar PIP - bottom right, exact same position as "small" widget state */}
          <div
            id="calendly-avatar-pip"
            className={`absolute bottom-4 right-4 overflow-hidden rounded-2xl border border-white/30 shadow-[0_0_50px_rgba(255,255,255,0.2)] bg-black ${
              isMobile ? 'w-80 h-96' : 'w-96 h-[500px]'
            }`}
          >
            {/* PIP controls inside avatar */}
            {renderPipControlBar()}
          </div>
        </div>
      )}

      {/* PDF overlay */}
      {showPdf && (
        <div className="absolute inset-0 z-20 bg-black">
          {/* PDF - main area, landscape */}
          <div className="absolute inset-6 right-[420px] rounded-2xl overflow-hidden border border-white/30 shadow-[0_0_60px_rgba(255,255,255,0.25)] bg-white">
            {/* PDF iframe using Google Docs viewer for better compatibility */}
            <iframe
              src={`https://docs.google.com/viewer?url=${encodeURIComponent(pdfUrl)}&embedded=true`}
              className="w-full h-full"
              style={{ border: 'none' }}
              title="PDF Document"
            />
            {/* Close PDF button */}
            <button
              onClick={() => setShowPdf(false)}
              className="absolute top-4 left-4 p-2 rounded-full bg-black/50 text-white z-30 border border-white/30 hover:bg-black/70 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          {/* Avatar PIP - bottom right, exact same position as "small" widget state */}
          <div
            id="pdf-avatar-pip"
            className={`absolute bottom-4 right-4 overflow-hidden rounded-2xl border border-white/30 shadow-[0_0_50px_rgba(255,255,255,0.2)] bg-black ${
              isMobile ? 'w-80 h-96' : 'w-96 h-[500px]'
            }`}
          >
            {/* PIP controls inside avatar */}
            {renderPipControlBar()}
          </div>
        </div>
      )}
    </>
  );

  // Compact control bar for PIP mode (inside avatar during video/calendly)
  const renderPipControlBar = () => (
    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent z-30">
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={toggleMicrophone}
          className={`p-2.5 rounded-full backdrop-blur-md transition-all ${
            isMuted
              ? 'bg-red-500/80 border border-red-400/30 text-white'
              : 'bg-white/10 border border-white/20 text-white hover:bg-white/20'
          }`}
        >
          {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>
        <button
          onClick={toggleAudio}
          className={`p-2.5 rounded-full backdrop-blur-md transition-all ${
            !audioEnabled
              ? 'bg-red-500/80 border border-red-400/30 text-white'
              : 'bg-white/10 border border-white/20 text-white hover:bg-white/20'
          }`}
        >
          {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
        <button
          onClick={handleDisconnect}
          className="p-2.5 rounded-full backdrop-blur-md bg-red-500/80 border border-red-400/30 text-white hover:bg-red-600/80 transition-all"
        >
          <PhoneOff className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  const renderControlBar = () => (
    <>
      {/* State indicators - top left */}
      <div className="absolute top-4 left-4 z-30 flex flex-col gap-2">
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md ${getStateColor()} text-white text-xs font-medium shadow-lg`}>
          {getStateIcon()}
          <span className="capitalize">{avatarState}</span>
        </div>
        {isUserSpeaking && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md bg-white/10 border border-white/20 text-white text-xs font-medium shadow-lg">
            <User className="w-3 h-3" />
            <span>You're speaking</span>
          </div>
        )}
      </div>

      {/* Control buttons - bottom center */}
      <div className="absolute bottom-0 left-0 right-0 p-4 pb-8 bg-gradient-to-t from-black/60 to-transparent z-30">
        <div className="flex items-center justify-center gap-3">
          {/* Mic toggle */}
          <button
            onClick={toggleMicrophone}
            className={`p-3.5 rounded-full backdrop-blur-md transition-all ${
              isMuted
                ? 'bg-red-500/80 border border-red-400/30 text-white'
                : 'bg-white/10 border border-white/20 text-white hover:bg-white/20'
            }`}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Speaker toggle */}
          <button
            onClick={toggleAudio}
            className={`p-3.5 rounded-full backdrop-blur-md transition-all ${
              !audioEnabled
                ? 'bg-red-500/80 border border-red-400/30 text-white'
                : 'bg-white/10 border border-white/20 text-white hover:bg-white/20'
            }`}
          >
            {audioEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>

          {/* Disconnect */}
          <button
            onClick={handleDisconnect}
            className="p-3.5 rounded-full backdrop-blur-md bg-red-500/80 border border-red-400/30 text-white hover:bg-red-600/80 transition-all"
          >
            <PhoneOff className="w-5 h-5" />
          </button>

          {/* Expand/minimize */}
          <button
            onClick={handleExpand}
            className="p-3.5 rounded-full backdrop-blur-md bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all"
          >
            {state === "maximized" ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
        </div>

        {/* Transcripts */}
        {transcripts.length > 0 && (
          <div className="mt-4 max-h-24 overflow-y-auto max-w-md mx-auto">
            {transcripts.slice(-3).map((t, i) => (
              <div
                key={i}
                className={`text-xs py-1 px-2 rounded mb-1 ${
                  t.type === 'user_speech'
                    ? 'bg-white/10 text-white/80'
                    : 'bg-white/5 text-white/70'
                }`}
              >
                {t.type === 'user_speech' ? '👤 ' : '🤖 '}
                {t.text}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );

  // Render expanded state (small or maximized)
  const renderExpandedState = () => {
    const isMaximized = state === "maximized";

    return (
      <motion.div
        className={`fixed z-50 bg-gray-900 overflow-hidden ${
          isMaximized
            ? 'inset-0'
            : isMobile
            ? 'bottom-4 right-4 w-80 h-96 rounded-2xl shadow-2xl'
            : 'bottom-4 right-4 w-96 h-[500px] rounded-2xl shadow-2xl'
        }`}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
      >
        {/* Close button for small state */}
        {!isMaximized && (
          <button
            onClick={handleClose}
            className="absolute top-2 right-2 z-40 p-2 rounded-full bg-black/50 text-white hover:bg-black/70"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Content */}
        {/* Always render video container so it's in DOM for TavusSessionManager */}
        {renderVideoContainer()}

        {/* Overlay states on top of video container */}
        {isConnecting && renderConnectingState()}
        {connectionError && renderErrorState()}

        {/* Control bar - only show when connected and NOT in PIP mode (demo/calendly/pdf) */}
        {!isConnecting && !connectionError && !isDemoPlaying && !showCalendly && !showPdf && renderControlBar()}
      </motion.div>
    );
  };

  return (
    <AnimatePresence mode="wait">
      {state === "minimized" ? renderMinimizedState() : renderExpandedState()}
    </AnimatePresence>
  );
};

export default TavusAvatarWidget;
