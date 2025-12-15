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
import { checkForDemoTrigger } from '../../mobile/utils/videoTriggerMatcher';
import videoTriggersConfig from '../config/video-triggers.json';
import bookingConfig from '../config/booking-config.json';
import TavusSessionManager from '../utils/TavusSessionManager';
import DailyEventManager from '../utils/DailyEventManager';

/**
 * TavusAvatarWidget - Tavus CVI avatar widget using Daily.co
 *
 * Adapted from MobileAvatarWidget for Tavus/Daily.co instead of HeyGen/LiveKit
 */
export const TavusAvatarWidget = ({ onDisconnect, autoExpand = true, onExpand } = {}) => {
  console.log('[TAVUS-WIDGET] TavusAvatarWidget rendering - autoExpand:', autoExpand, 'hasOnExpand:', !!onExpand);

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

  const mountedRef = useRef(true);
  const lastAvatarSpeechRef = useRef('');
  const preDemoWidgetStateRef = useRef(null);
  const preCalendlyWidgetStateRef = useRef(null);
  const preCalendlyMutedRef = useRef(false);
  const preCalendlyAudioEnabledRef = useRef(true);
  const pendingCalendlyRef = useRef(false);
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
  const { isDemoPlaying, currentVideoUrl, demoVideoRef, playDemoVideo, stopDemoVideo } = useDemoVideo({
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

        // Check for demo triggers when replica stops speaking
        if (lastSpeech && !interrupted) {
          setTimeout(() => {
            log('DEMO', 'Checking for demo trigger after replica speech', { lastSpeech });
            const demoTrigger = checkForDemoTrigger(lastSpeech, videoTriggersConfig, log);
            if (demoTrigger && demoTrigger.matched && !isDemoPlaying) {
              log('DEMO', 'Demo trigger detected from replica speech', demoTrigger);

              preDemoWidgetStateRef.current = state;

              if (state !== "maximized") {
                setState("maximized");
                setTimeout(() => {
                  playDemoVideo(demoTrigger.videoUrl);
                }, 500);
              } else {
                playDemoVideo(demoTrigger.videoUrl);
              }
            }
          }, 100);
        }
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
        // Handle tool calls here (e.g., booking, navigation)
        handleToolCall(name, args);
      },
      onReplicaJoined: (replicaId) => {
        log('SYSTEM', 'Replica joined the call', { replicaId });
      },
      onUnhandledMessage: (msg) => {
        log('DATA_CHANNEL', 'Unhandled message', msg);
      }
    });
  }, [isDemoPlaying, state, log]); // eslint-disable-line react-hooks/exhaustive-deps

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
        log('TOOL_CALL', 'Scheduling meeting via tool call');
        pendingCalendlyRef.current = true;
        break;
      case 'show_demo':
        if (args.videoUrl) {
          playDemoVideo(args.videoUrl);
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
      if (sessionManagerRef.current?.isInitialized) {
        log('DEMO', 'Returning to small state after demo closed');
        setState("small");
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
        log('CALENDLY', 'Returning to small state after calendly closed');
        setState("small");
      } else {
        log('CALENDLY', 'No active session - keeping minimized');
        setState("minimized");
      }
      preCalendlyWidgetStateRef.current = null;
    }
  }, [showCalendly, log]);

  // Wait for avatar to finish speaking before opening Calendly
  useEffect(() => {
    if (pendingCalendlyRef.current && !isAvatarSpeaking) {
      log('CALENDLY', 'Replica finished speaking - opening Calendly now');
      preCalendlyWidgetStateRef.current = state;
      if (state !== "maximized") {
        setState("maximized");
      }
      setShowCalendly(true);
      pendingCalendlyRef.current = false;
    }
  }, [isAvatarSpeaking, state, log]);

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
    hasAutoExpandedRef.current = false;

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
        body: JSON.stringify({}),
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

      // Setup callbacks
      dailyEventManagerRef.current.setCallbacks({
        onReplicaStartSpeaking: () => {
          setIsAvatarSpeaking(true);
          setAvatarState("speaking");
        },
        onReplicaStopSpeaking: (lastSpeech, interrupted) => {
          setIsAvatarSpeaking(false);
          setAvatarState("listening");

          if (lastSpeech && !interrupted) {
            setTimeout(() => {
              const demoTrigger = checkForDemoTrigger(lastSpeech, videoTriggersConfig, log);
              if (demoTrigger && demoTrigger.matched && !isDemoPlaying) {
                log('DEMO', 'Demo trigger detected', demoTrigger);
                preDemoWidgetStateRef.current = state;
                if (state !== "maximized") {
                  setState("maximized");
                  setTimeout(() => playDemoVideo(demoTrigger.videoUrl), 500);
                } else {
                  playDemoVideo(demoTrigger.videoUrl);
                }
              }
            }, 100);
          }
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

    // Check demo triggers first
    const demoTrigger = checkForDemoTrigger(transcript, videoTriggersConfig, log);
    if (demoTrigger && demoTrigger.matched && !isDemoPlaying) {
      log('DEMO', 'Demo video trigger detected', demoTrigger);
      if (state !== "maximized") {
        setState("maximized");
      }
      playDemoVideo(demoTrigger.videoUrl);
      setDetectedIntents((prev) => [...prev, 'show_demo'].slice(-5));
      return;
    }

    // Process other intents
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
        return "bg-green-500";
      case "listening":
        return "bg-blue-500";
      case "thinking":
        return "bg-yellow-500";
      default:
        return "bg-gray-400";
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
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white p-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
      <p className="text-sm mb-4">Connecting to Tavus...</p>

      {/* Debug logs */}
      <div className="w-full max-h-40 overflow-y-auto text-xs font-mono bg-black/50 rounded p-2">
        {debugLogs.map((log, i) => (
          <div key={i} className="text-green-400">{log}</div>
        ))}
      </div>
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
        <div className="absolute inset-0 z-10">
          <video
            ref={demoVideoRef}
            className="w-full h-full object-cover"
            playsInline
            muted
            onClick={() => stopDemoVideo()}
          />
          {/* PIP container for avatar during demo */}
          <div
            id="avatar-pip"
            className="absolute bottom-20 right-4 w-24 h-24 rounded-lg overflow-hidden shadow-lg border-2 border-white/20"
          />
          {/* Close demo button */}
          <button
            onClick={() => stopDemoVideo()}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Calendly overlay */}
      {showCalendly && (
        <div className="absolute inset-0 z-20 bg-white">
          <div className="relative w-full h-full">
            {/* PIP container for avatar during calendly */}
            <div
              id="calendly-avatar-pip"
              className="absolute top-4 right-4 w-24 h-24 rounded-lg overflow-hidden shadow-lg border-2 border-gray-200 z-30"
            />
            {/* Calendly iframe */}
            <iframe
              src={bookingConfig.calendlyUrl}
              className="w-full h-full"
              frameBorder="0"
              title="Schedule Meeting"
            />
            {/* Close calendly button */}
            <button
              onClick={() => setShowCalendly(false)}
              className="absolute top-4 left-4 p-2 rounded-full bg-black/50 text-white z-30"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </>
  );

  const renderControlBar = () => (
    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent z-30">
      <div className="flex items-center justify-between">
        {/* Left: State indicator */}
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${getStateColor()} text-white text-xs`}>
            {getStateIcon()}
            <span className="capitalize">{avatarState}</span>
          </div>
          {isUserSpeaking && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-purple-500 text-white text-xs">
              <User className="w-3 h-3" />
              <span>Speaking</span>
            </div>
          )}
        </div>

        {/* Right: Control buttons */}
        <div className="flex items-center gap-2">
          {/* Mic toggle */}
          <button
            onClick={toggleMicrophone}
            className={`p-3 rounded-full ${isMuted ? 'bg-red-500' : 'bg-gray-700'} text-white`}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Speaker toggle */}
          <button
            onClick={toggleAudio}
            className={`p-3 rounded-full ${!audioEnabled ? 'bg-red-500' : 'bg-gray-700'} text-white`}
          >
            {audioEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>

          {/* Expand/minimize */}
          <button
            onClick={handleExpand}
            className="p-3 rounded-full bg-gray-700 text-white"
          >
            {state === "maximized" ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>

          {/* Disconnect */}
          <button
            onClick={handleDisconnect}
            className="p-3 rounded-full bg-red-600 text-white"
          >
            <PhoneOff className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Transcripts */}
      {transcripts.length > 0 && (
        <div className="mt-2 max-h-24 overflow-y-auto">
          {transcripts.slice(-3).map((t, i) => (
            <div
              key={i}
              className={`text-xs py-1 px-2 rounded mb-1 ${
                t.type === 'user_speech'
                  ? 'bg-purple-500/30 text-purple-100'
                  : 'bg-green-500/30 text-green-100'
              }`}
            >
              {t.type === 'user_speech' ? '👤 ' : '🤖 '}
              {t.text}
            </div>
          ))}
        </div>
      )}
    </div>
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

        {/* Control bar - only show when connected */}
        {!isConnecting && !connectionError && renderControlBar()}
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
