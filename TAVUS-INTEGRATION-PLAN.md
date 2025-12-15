# Tavus V2 Avatar Integration Plan

## Overview

This document outlines the modular plan to create a new `/v2-avatar` page that uses **Tavus CVI (Conversational Video Interface)** with **Daily.co** for real-time video communication, mirroring the functionality of the existing HeyGen-based `/avatar` page.

---

## Architecture Comparison

| Feature | HeyGen (Current) | Tavus (New) |
|---------|------------------|-------------|
| Video Transport | LiveKit | Daily.co |
| API Base | `api.liveavatar.com` | `tavusapi.com/v2` |
| Auth Header | `X-API-KEY` / `Bearer` | `x-api-key` |
| Session Concept | Session Token → LiveKit Room | Conversation → Daily.co Room |
| Track Handling | `track.attach(element)` | Daily.co SDK hooks |
| Events | `RoomEvent.DataReceived` | `app-message` via Daily |

---

## Folder Structure

```
src/
├── v2-avatar/
│   ├── components/
│   │   ├── TavusAvatarWidget.jsx       # Main widget component (mirrors MobileAvatarWidget)
│   │   └── TavusAvatarPage.jsx         # Page wrapper (mirrors ExtendedAvatarPage)
│   │
│   ├── utils/
│   │   ├── TavusSessionManager.js      # Daily.co session management (mirrors SessionManager)
│   │   ├── DailyEventManager.js        # Event handling for Daily (mirrors LiveKitEventManager)
│   │   └── tavusApi.js                 # Tavus API helper functions
│   │
│   ├── hooks/
│   │   ├── useDailyRoom.js             # Custom hook for Daily.co room management
│   │   ├── useTavusEvents.js           # Hook for handling Tavus/Daily events
│   │   └── useEventLogger.js           # Copied/shared event logger
│   │
│   ├── config/
│   │   ├── api.js                      # API configuration for Tavus
│   │   ├── video-triggers.json         # Demo video triggers (shared/copied)
│   │   └── booking-config.json         # Calendly config (shared/copied)
│   │
│   └── index.js                        # Module exports

api/
├── tavus/
│   ├── create-conversation.js          # Serverless: Create Tavus conversation
│   └── end-conversation.js             # Serverless: End Tavus conversation
```

---

## Phase 1: API Layer (Backend)

### 1.1 Create Conversation Endpoint

**File:** `api/tavus/create-conversation.js`

```javascript
// Serverless function to create Tavus conversation
// POST /api/tavus/create-conversation

export default async function handler(req, res) {
  // 1. Get TAVUS_API_KEY from env
  // 2. Get TAVUS_PERSONA_ID from env
  // 3. Call POST https://tavusapi.com/v2/conversations
  // 4. Return { conversationId, conversationUrl, status }
}
```

**Request to Tavus:**
```javascript
{
  persona_id: process.env.TAVUS_PERSONA_ID,
  custom_greeting: "Hello! How can I help you today?",
  conversational_context: "You are a helpful assistant.",
  properties: {
    language: "english"
  }
}
```

**Response to Frontend:**
```javascript
{
  conversationId: "uuid",
  conversationUrl: "https://daily.co/room-url",  // Daily.co room URL
  status: "active"
}
```

### 1.2 End Conversation Endpoint

**File:** `api/tavus/end-conversation.js`

```javascript
// POST /api/tavus/end-conversation
// Body: { conversationId }

export default async function handler(req, res) {
  // 1. Call POST https://tavusapi.com/v2/conversations/{id}/end
  // 2. Return success/error
}
```

### 1.3 Environment Variables

Add to `.env`:
```
TAVUS_API_KEY=your_api_key
TAVUS_PERSONA_ID=your_persona_id
```

---

## Phase 2: Core Utilities

### 2.1 TavusSessionManager.js

**Purpose:** Manages Daily.co room connection and media tracks (equivalent to SessionManager.js for LiveKit)

```javascript
class TavusSessionManager {
  constructor() {
    this.daily = null;           // Daily call object
    this.conversationId = null;
    this.videoElement = null;
    this.audioElement = null;
    this.isInitialized = false;
    this.logger = null;

    // Ready state promises
    this.videoReadyPromise = null;
    this.audioReadyPromise = null;
  }

  // Initialize with Daily.co room URL
  async initialize(conversationUrl, conversationId, videoContainerId) {}

  // Handle participant joined (replica avatar)
  handleParticipantJoined(participant) {}

  // Handle track started
  handleTrackStarted(track, participant) {}

  // Attach video track to element
  attachVideoTrack(track) {}

  // Attach audio track to element
  attachAudioTrack(track) {}

  // Mute/unmute audio
  setAudioMuted(muted) {}

  // Mute/unmute local microphone
  setMicrophoneMuted(muted) {}

  // Wait for session ready
  async waitForReady(timeoutMs = 10000) {}

  // Cleanup
  cleanup() {}
}
```

### 2.2 DailyEventManager.js

**Purpose:** Handles Daily.co `app-message` events and Tavus-specific events (equivalent to LiveKitEventManager.js)

```javascript
class DailyEventManager {
  constructor() {
    this.daily = null;
    this.conversationId = null;
    this.callbacks = {
      onReplicaStartSpeaking: null,
      onReplicaStopSpeaking: null,
      onUserStartSpeaking: null,
      onUserStopSpeaking: null,
      onUserTranscript: null,
      onReplicaTranscript: null,
      onToolCall: null,
      onUnhandledMessage: null
    };
    this.lastReplicaSpeech = '';
    this.logger = null;
  }

  // Attach to Daily call object
  attachToDaily(daily, conversationId) {}

  // Handle app-message events
  handleAppMessage(event) {
    const { event_type, properties } = event.data;

    switch (event_type) {
      case 'conversation.utterance':
        // Handle transcript
        break;
      case 'conversation.user.started_speaking':
      case 'conversation.user.stopped_speaking':
        // Handle user speaking state
        break;
      case 'conversation.replica.started_speaking':
      case 'conversation.replica.stopped_speaking':
        // Handle replica speaking state
        break;
      case 'conversation.tool_call':
        // Handle tool calls (for demo videos, calendly, etc.)
        break;
    }
  }

  // Send message to replica (echo mode - speak exact text)
  sendEchoMessage(text) {}

  // Send message to replica (respond mode - LLM processes)
  sendRespondMessage(text) {}

  // Interrupt replica
  interruptReplica() {}

  // Detach
  detachFromDaily() {}
}
```

### 2.3 tavusApi.js

**Purpose:** Helper functions for Tavus API calls

```javascript
// API configuration
export const TAVUS_API_BASE = 'https://tavusapi.com/v2';

// Create conversation (called from serverless, but can be used directly with caution)
export const createConversation = async (apiKey, personaId, options = {}) => {};

// End conversation
export const endConversation = async (apiKey, conversationId) => {};

// List personas (for admin/debug)
export const listPersonas = async (apiKey) => {};
```

---

## Phase 3: React Hooks

### 3.1 useDailyRoom.js

**Purpose:** Custom hook for Daily.co room management

```javascript
import DailyIframe from '@daily-co/daily-js';
import { useCallback, useRef, useState } from 'react';

export const useDailyRoom = () => {
  const [daily, setDaily] = useState(null);
  const [participants, setParticipants] = useState({});
  const [isJoined, setIsJoined] = useState(false);
  const dailyRef = useRef(null);

  // Join room
  const joinRoom = useCallback(async (roomUrl, options = {}) => {
    const callObject = DailyIframe.createCallObject({
      startVideoOff: false,
      startAudioOff: true,  // Start with mic off
    });

    await callObject.join({ url: roomUrl });
    dailyRef.current = callObject;
    setDaily(callObject);
    setIsJoined(true);

    return callObject;
  }, []);

  // Leave room
  const leaveRoom = useCallback(async () => {
    if (dailyRef.current) {
      await dailyRef.current.leave();
      dailyRef.current.destroy();
      dailyRef.current = null;
      setDaily(null);
      setIsJoined(false);
    }
  }, []);

  // Toggle microphone
  const toggleMicrophone = useCallback(async (enabled) => {
    if (dailyRef.current) {
      dailyRef.current.setLocalAudio(enabled);
    }
  }, []);

  return {
    daily,
    participants,
    isJoined,
    joinRoom,
    leaveRoom,
    toggleMicrophone
  };
};
```

### 3.2 useTavusEvents.js

**Purpose:** Hook for handling Tavus conversation events

```javascript
import { useCallback, useEffect, useRef } from 'react';

export const useTavusEvents = (daily, conversationId, callbacks) => {
  const eventManagerRef = useRef(null);

  useEffect(() => {
    if (!daily || !conversationId) return;

    // Setup event listeners
    const handleAppMessage = (event) => {
      // Route events to callbacks
    };

    daily.on('app-message', handleAppMessage);

    return () => {
      daily.off('app-message', handleAppMessage);
    };
  }, [daily, conversationId, callbacks]);

  // Send echo message (make replica speak exact text)
  const sendEcho = useCallback((text) => {
    if (daily && conversationId) {
      daily.sendAppMessage({
        message_type: 'conversation',
        event_type: 'conversation.echo',
        conversation_id: conversationId,
        properties: { modality: 'text', text }
      }, '*');
    }
  }, [daily, conversationId]);

  // Send respond message (LLM processes and responds)
  const sendRespond = useCallback((text) => {
    if (daily && conversationId) {
      daily.sendAppMessage({
        message_type: 'conversation',
        event_type: 'conversation.respond',
        conversation_id: conversationId,
        properties: { text }
      }, '*');
    }
  }, [daily, conversationId]);

  // Interrupt replica
  const interrupt = useCallback(() => {
    if (daily && conversationId) {
      daily.sendAppMessage({
        message_type: 'conversation',
        event_type: 'conversation.interrupt',
        conversation_id: conversationId
      }, '*');
    }
  }, [daily, conversationId]);

  return { sendEcho, sendRespond, interrupt };
};
```

---

## Phase 4: React Components

### 4.1 TavusAvatarWidget.jsx

**Purpose:** Main avatar widget component (equivalent to MobileAvatarWidget.jsx)

**Key Features to Implement:**
- [ ] Connection state management (connecting, connected, disconnected)
- [ ] Video display (Daily.co participant video)
- [ ] Audio management (replica audio, mic toggle)
- [ ] Speaker toggle (mute/unmute replica audio)
- [ ] Microphone toggle (mute/unmute local mic)
- [ ] Disconnect button
- [ ] Transcript display
- [ ] Avatar speaking state indicator
- [ ] User speaking state indicator
- [ ] Demo video triggers (from tool calls)
- [ ] Calendly integration (from tool calls)
- [ ] Error handling and retry

**Component Structure:**
```jsx
const TavusAvatarWidget = ({ onDisconnect, autoExpand = true }) => {
  // State
  const [state, setState] = useState('minimized'); // minimized, small, maximized
  const [isConnecting, setIsConnecting] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [hasVideo, setHasVideo] = useState(false);
  const [hasAudio, setHasAudio] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [avatarState, setAvatarState] = useState('idle');
  const [transcripts, setTranscripts] = useState([]);

  // Hooks
  const { daily, joinRoom, leaveRoom, toggleMicrophone } = useDailyRoom();
  const { sendEcho, sendRespond, interrupt } = useTavusEvents(daily, conversationId, {
    onReplicaTranscript: handleReplicaTranscript,
    onToolCall: handleToolCall,
    // ... other callbacks
  });

  // Refs
  const sessionManagerRef = useRef(null);
  const eventManagerRef = useRef(null);

  // Start session
  const startSession = async () => {
    // 1. Call /api/tavus/create-conversation
    // 2. Get conversationUrl
    // 3. Join Daily.co room
    // 4. Setup event handlers
    // 5. Wait for replica to join
  };

  // Stop session
  const stopSession = async () => {
    // 1. Call /api/tavus/end-conversation
    // 2. Leave Daily.co room
    // 3. Cleanup
  };

  // Handle tool calls (demo videos, calendly)
  const handleToolCall = (toolName, args) => {
    switch (toolName) {
      case 'video_player':
        // Play demo video
        break;
      case 'schedule_meeting':
        // Open Calendly
        break;
    }
  };

  return (
    // UI similar to MobileAvatarWidget
  );
};
```

### 4.2 TavusAvatarPage.jsx

**Purpose:** Page wrapper (equivalent to ExtendedAvatarPage.jsx)

```jsx
const TavusAvatarPage = () => {
  const [isStarted, setIsStarted] = useState(false);
  const [sessionKey, setSessionKey] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const handleStartConversation = () => {
    setIsLoading(true);
    setIsStarted(true);
    setTimeout(() => setIsLoading(false), 500);
  };

  const handleDisconnect = () => {
    setIsStarted(false);
    setIsLoading(false);
    setSessionKey(prev => prev + 1);
  };

  return (
    <div className={styles.container}>
      {!isStarted ? (
        <LandingView onStart={handleStartConversation} isLoading={isLoading} />
      ) : (
        <TavusAvatarWidget
          key={sessionKey}
          onDisconnect={handleDisconnect}
          autoExpand={true}
        />
      )}
    </div>
  );
};
```

---

## Phase 5: Routing & Integration

### 5.1 Add Route to App.js

```javascript
import TavusAvatarPage from './v2-avatar/components/TavusAvatarPage';

// In routes:
<Route path="/v2-avatar" element={<TavusAvatarPage />} />
```

### 5.2 Install Dependencies

```bash
npm install @daily-co/daily-js @daily-co/daily-react
```

---

## Phase 6: Tool Calling (Advanced Features)

### 6.1 Configure Persona Tools

Use Tavus API to add tools to persona:

```bash
curl -X PATCH "https://tavusapi.com/v2/personas/YOUR_PERSONA_ID" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '[{
    "op": "add",
    "path": "/layers/llm/tools",
    "value": [{
      "type": "function",
      "function": {
        "name": "video_player",
        "description": "Play a demo video when user asks about features",
        "parameters": {
          "type": "object",
          "properties": {
            "video_type": { "type": "string", "enum": ["product_demo", "tutorial"] },
            "topic": { "type": "string" }
          }
        }
      }
    }, {
      "type": "function",
      "function": {
        "name": "schedule_meeting",
        "description": "Open calendar booking when user wants to schedule",
        "parameters": {
          "type": "object",
          "properties": {
            "meeting_type": { "type": "string" }
          }
        }
      }
    }]
  }]'
```

### 6.2 Handle Tool Calls in Widget

```javascript
const handleToolCall = (toolName, args) => {
  switch (toolName) {
    case 'video_player':
      // Use existing demo video logic
      const videoUrl = getVideoUrl(args.video_type, args.topic);
      playDemoVideo(videoUrl);
      break;

    case 'schedule_meeting':
      // Use existing Calendly logic
      setShowCalendly(true);
      break;
  }
};
```

---

## Implementation Order

### Sprint 1: Foundation (Days 1-2)
1. [ ] Create folder structure
2. [ ] Add environment variables
3. [ ] Create `api/tavus/create-conversation.js`
4. [ ] Create `api/tavus/end-conversation.js`
5. [ ] Install Daily.co dependencies

### Sprint 2: Core Utilities (Days 3-4)
6. [ ] Implement `TavusSessionManager.js`
7. [ ] Implement `DailyEventManager.js`
8. [ ] Implement `tavusApi.js`
9. [ ] Create `useDailyRoom.js` hook
10. [ ] Create `useTavusEvents.js` hook

### Sprint 3: Components (Days 5-7)
11. [ ] Create `TavusAvatarPage.jsx` (simple wrapper)
12. [ ] Create `TavusAvatarWidget.jsx` (main component)
13. [ ] Implement connection flow
14. [ ] Implement video/audio display
15. [ ] Implement controls (mic, speaker, disconnect)

### Sprint 4: Features (Days 8-10)
16. [ ] Add transcript display
17. [ ] Add speaking state indicators
18. [ ] Implement tool calling
19. [ ] Add demo video integration
20. [ ] Add Calendly integration

### Sprint 5: Polish & Testing (Days 11-12)
21. [ ] Mobile responsiveness
22. [ ] Error handling
23. [ ] iOS audio fixes (if needed)
24. [ ] Testing on multiple browsers
25. [ ] Documentation

---

## Event Mapping: HeyGen → Tavus

| HeyGen Event | Tavus Event |
|--------------|-------------|
| `avatar_start_talking` | `conversation.replica.started_speaking` |
| `avatar_stop_talking` | `conversation.replica.stopped_speaking` |
| `user_start_talking` | `conversation.user.started_speaking` |
| `user_stop_talking` | `conversation.user.stopped_speaking` |
| `avatar.transcription` | `conversation.utterance` (role: replica) |
| `user.transcription` | `conversation.utterance` (role: user) |
| N/A | `conversation.tool_call` |

---

## Key Differences to Handle

1. **Room Connection:** LiveKit `room.connect()` → Daily `daily.join()`
2. **Track Attachment:** Manual `track.attach(element)` → Daily handles automatically with hooks
3. **Audio Unlock:** `room.startAudio()` → Daily handles internally
4. **Message Format:** HeyGen uses `type`/`event_type` → Tavus uses consistent `event_type`
5. **Tool Calling:** HeyGen doesn't have native tools → Tavus has built-in function calling

---

## Files to Copy/Adapt

| Source File | Target File | Adaptation Needed |
|-------------|-------------|-------------------|
| `mobile/config/api.js` | `v2-avatar/config/api.js` | Update base URLs |
| `mobile/config/video-triggers.json` | `v2-avatar/config/video-triggers.json` | None (copy as-is) |
| `mobile/config/booking-config.json` | `v2-avatar/config/booking-config.json` | None (copy as-is) |
| `mobile/hooks/useEventLogger.js` | `v2-avatar/hooks/useEventLogger.js` | None (copy as-is) |
| `mobile/hooks/useDemoVideo.js` | `v2-avatar/hooks/useDemoVideo.js` | Minor (remove LiveKit refs) |
| `mobile/utils/SessionManager.js` | `v2-avatar/utils/TavusSessionManager.js` | Major (Daily.co API) |
| `mobile/utils/LiveKitEventManager.js` | `v2-avatar/utils/DailyEventManager.js` | Major (Daily.co events) |

---

## Success Criteria

- [ ] User can start conversation on `/v2-avatar`
- [ ] Video displays correctly (replica avatar)
- [ ] Audio plays correctly (replica voice)
- [ ] Microphone works (user can talk)
- [ ] Disconnect works cleanly
- [ ] Demo videos trigger correctly
- [ ] Calendly integration works
- [ ] Works on iOS Safari/Chrome
- [ ] Works on Android Chrome
- [ ] Works on desktop browsers
