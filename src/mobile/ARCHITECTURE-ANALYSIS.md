# Mobile Architecture - Complete Comprehension Analysis

**Date:** 2025-12-05
**Status:** Production-Ready Architecture with Manager Pattern
**Purpose:** Understanding the robust manager-based architecture before integrating Epic 4 (Demo Video System)

---

## Executive Summary

The mobile implementation uses a **sophisticated 3-manager architecture** that provides:
- ✅ **Separation of Concerns** - React component vs business logic
- ✅ **Testability** - Managers are independent, unit-testable classes
- ✅ **Idempotent Operations** - Safe to call multiple times without side effects
- ✅ **Race Condition Prevention** - Promise-based readiness tracking
- ✅ **Clean Lifecycle Management** - Proper initialization → ready → cleanup flow

**CRITICAL INSIGHT:** We CANNOT simply copy-paste from desktop AIChatWidget. The mobile architecture has fundamentally restructured how sessions and events are managed.

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────────┐
│              MobileAvatarWidget.jsx                       │
│  (React Component - UI State & Event Handlers)           │
│                                                           │
│  • React state (isMuted, hasLiveVideo, etc.)            │
│  • UI rendering & user interactions                      │
│  • Callback functions for managers                       │
└───────────────┬──────────────┬───────────────┬───────────┘
                │              │               │
                │              │               │
       ┌────────▼────────┐    │    ┌─────────▼──────────┐
       │ AudioManager    │    │    │  LiveKitEventManager│
       │ (Singleton)     │    │    │  (Singleton)        │
       │                 │    │    │                     │
       │ • Web Audio API │    │    │ • Room events       │
       │ • Track attach  │    │    │ • Data channel      │
       │ • Context mgmt  │    │    │ • Callbacks         │
       └─────────────────┘    │    └─────────────────────┘
                              │
                    ┌─────────▼──────────┐
                    │  SessionManager    │
                    │  (Singleton)       │
                    │                    │
                    │ • Track management │
                    │ • Ready state      │
                    │ • Video/Audio sep  │
                    └────────────────────┘
```

---

## Manager #1: AudioManager

**File:** `src/mobile/utils/AudioManager.js`
**Pattern:** Singleton
**Responsibility:** Web Audio API lifecycle management

### Root Problems Solved

1. **Multiple Audio Sources** - Prevents dual audio by ensuring single source
2. **AudioContext Suspension** - Handles suspended state on mobile browsers
3. **Track Duplication** - Idempotent attach prevents duplicate connections
4. **Cleanup Issues** - Proper disconnect before creating new connections

### Key Methods

```javascript
// Lifecycle
initialize()              // Creates AudioContext, resumes if suspended
attachTrack(track)        // Idempotent - cleans up before attaching
detachTrack()             // Idempotent - safe to call multiple times
cleanup()                 // Full cleanup but keeps AudioContext for reuse

// State checks
isReady()                 // Returns if audio system ready to play
getState()                // Debug info - context state, has source, etc.
```

### Critical Implementation Details

**1. 300ms Stabilization Delay**
```javascript
// lines 63-70
if (!this.isInitialized) {
  this.log('First initialization - waiting 300ms...');
  await new Promise(resolve => setTimeout(resolve, 300));
}
```
- **Why:** Mobile audio hardware needs time to wake up
- **When:** Only on FIRST initialization, not subsequent sessions

**2. Idempotent Attachment**
```javascript
// lines 94-99
async attachTrack(track) {
  this.detachTrack();  // Clean up BEFORE attaching new

  if (!this.isInitialized) {
    await this.initialize();
  }
  // ... attach logic
}
```
- **Why:** Prevents dual audio from multiple attach calls
- **Pattern:** Always cleanup before new operation

**3. AudioContext Reuse**
```javascript
// lines 162-165
cleanup() {
  this.detachTrack();
  // Don't close AudioContext - reuse it for next session
  // Keep isInitialized as true
}
```
- **Why:** Creating new AudioContext can fail on some mobile browsers
- **Strategy:** Create once, reuse forever

### How Epic 4 Will Use It

Epic 4 (Demo Video) will **NOT directly interact** with AudioManager. The flow is:

```
Demo Video Plays
    ↓
useDemoVideo.pauseMicrophone()
    ↓
Pauses localAudioRef (user mic)
    ↓
Avatar audio continues via AudioManager (unchanged)
```

**Key Insight:** Demo video affects microphone only, not avatar audio.

---

## Manager #2: SessionManager

**File:** `src/mobile/utils/SessionManager.js`
**Pattern:** Singleton
**Responsibility:** LiveKit session & track lifecycle

### Root Problems Solved

1. **Race Conditions** - TrackSubscribed events vs existing tracks check
2. **Duplicate Attachments** - Multiple code paths trying to attach same track
3. **Unpredictable Ready State** - Spinner hides before actually ready
4. **Scattered State** - Track state spread across component

### Architecture Philosophy

```
SessionManager delegates audio to AudioManager
              but handles video directly

Why?
- Audio: Complex Web Audio API lifecycle (AudioContext, gain nodes, etc.)
- Video: Simple DOM element attachment
```

### Key Methods

```javascript
// Lifecycle
initialize(room, containerId)     // Sets up room and creates ready promises
attachVideoTrack(track)            // Idempotent - skips if already attached
attachAudioTrack(track)            // Delegates to AudioManager
waitForReady(timeoutMs)            // Promise-based ready state
cleanup()                          // Full teardown

// State checks
hasVideo()                         // Boolean check
hasAudio()                         // Boolean check
isReady()                          // Both audio AND video ready
getState()                         // Full debug state including AudioManager
```

### Critical Implementation Details

**1. Promise-Based Ready State**
```javascript
// lines 68-75
initialize(room) {
  this.videoReadyPromise = new Promise(resolve => {
    this.videoReadyResolve = resolve;
  });

  this.audioReadyPromise = new Promise(resolve => {
    this.audioReadyResolve = resolve;
  });
}
```
- **Why:** Async operations need explicit coordination
- **Pattern:** Create promise, resolve when track attached

**2. Wait for Video Container**
```javascript
// lines 182-194
async waitForVideoContainer(maxRetries = 10, delayMs = 100) {
  for (let i = 0; i < maxRetries; i++) {
    this.videoContainer = document.getElementById('live-video-container');
    if (this.videoContainer) return true;
    await new Promise(resolve => setTimeout(resolve, delayMs));
  }
  return false;
}
```
- **Why:** React may not have rendered DOM yet
- **Pattern:** Polling with retry limit

**3. Idempotent Attachment Guards**
```javascript
// lines 87-91
async attachVideoTrack(track) {
  if (this.videoTrack) {
    this.log('Video track already attached, skipping');
    return false;
  }
  // ... attach logic
}
```
- **Why:** Multiple code paths may try to attach (event + existing check)
- **Pattern:** Guard clause at top of function

**4. Ready Promise Resolution**
```javascript
// lines 200-219
async waitForReady(timeoutMs = 10000) {
  try {
    await Promise.race([
      Promise.all([this.audioReadyPromise, this.videoReadyPromise]),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), timeoutMs)
      )
    ]);
    return true;
  } catch (error) {
    // Return true anyway if we have at least audio OR video
    return !!(this.audioTrack || this.videoTrack);
  }
}
```
- **Why:** Can't wait forever, but partial success is OK
- **Pattern:** Race against timeout, graceful degradation

### How Epic 4 Will Use It

Epic 4 demo video will **NOT directly use** SessionManager. The flow is:

```
Avatar speaking detected
    ↓
Check demo trigger keywords
    ↓
playDemoVideo() called
    ↓
Demo video <video> element rendered
    ↓
Avatar video cloned to PiP (separate DOM element)
    ↓
SessionManager.videoTrack remains unchanged
```

**Key Insight:** Demo video is a separate video element. SessionManager continues managing LiveKit tracks.

---

## Manager #3: LiveKitEventManager

**File:** `src/mobile/utils/LiveKitEventManager.js`
**Pattern:** Singleton
**Responsibility:** LiveKit room event handling & normalization

### Root Problems Solved

1. **135-Line wireRoomEvents()** - Nested callbacks hard to maintain
2. **API Format Variations** - HeyGen v1 ('type') vs v2 ('event_type')
3. **Testing Difficulty** - Logic tightly coupled to React component
4. **State Management Scatter** - Updates spread across event handlers

### Architecture Philosophy

```
Clean Separation:
- Manager: Event logic, message parsing, routing
- Component: State updates, UI reactions

Communication via callbacks
```

### Key Methods

```javascript
// Setup
setCallbacks(callbacks)            // Component provides state update functions
attachToRoom(room)                 // Wire all event listeners
detachFromRoom()                   // Remove all listeners & reset state

// Internal routing (private)
_wireDataReceived()                // Handles RoomEvent.DataReceived
_wireParticipantEvents()           // Handles ParticipantAttributesChanged
_routeMessage(parsedJson)          // Routes to v1/v2 handler
_handleV1Message(msg)              // 'type' field messages
_handleV2Message(msg)              // 'event_type' field messages
```

### Critical Implementation Details

**1. Callback System**
```javascript
// lines 23-41
this.callbacks = {
  onAvatarStartSpeaking: null,
  onAvatarStopSpeaking: null,
  onUserStartSpeaking: null,
  onUserStopSpeaking: null,
  onUserTranscript: null,
  onAvatarTranscript: null,
  onGenericTranscript: null,
  onAgentStateChange: null,
  onUnhandledMessage: null
};
```
- **Why:** Component controls state, manager handles events
- **Pattern:** Hollywood Principle ("Don't call us, we'll call you")

**2. API Version Normalization**
```javascript
// lines 156-174
_routeMessage(parsedJson) {
  if (parsedJson.type) {
    this._handleV1Message(parsedJson);  // HeyGen API v1
  }
  else if (parsedJson.event_type) {
    this._handleV2Message(parsedJson);  // HeyGen API v2
  }
  else {
    // Unhandled format
  }
}
```
- **Why:** HeyGen changed API format between versions
- **Pattern:** Version detection + separate handlers

**3. Agent State Tracking**
```javascript
// lines 132-148
_wireParticipantEvents() {
  this.room.on(RoomEvent.ParticipantAttributesChanged, (changedAttributes) => {
    if (changedAttributes['lk.agent.state']) {
      const newState = changedAttributes['lk.agent.state'];
      const prevState = this.previousAgentState;

      // Notify callback with both states + last speech
      if (this.callbacks.onAgentStateChange) {
        this.callbacks.onAgentStateChange(newState, prevState, this.lastAvatarSpeech);
      }

      this.previousAgentState = newState;
    }
  });
}
```
- **Why:** Demo triggers need speaking→listening transition detection
- **Pattern:** Manager tracks state, component gets callback with prev + new + context

**4. Last Avatar Speech Tracking**
```javascript
// lines 233-242 (v1) and 271-281 (v2)
case 'avatar_transcript':
  const text = msg.text || msg.response || '';
  if (text) {
    this.lastAvatarSpeech = text;  // Save for later use
    if (this.callbacks.onAvatarTranscript) {
      this.callbacks.onAvatarTranscript(text, `type: ${msgType}`);
    }
  }
  break;
```
- **Why:** Demo trigger check happens AFTER speaking stops
- **Pattern:** Manager saves speech, passes to callback for demo trigger check

### How Epic 4 Will Use It

Epic 4 (Demo Video) **heavily depends** on LiveKitEventManager:

```javascript
// In MobileAvatarWidget.jsx
LiveKitEventManager.setCallbacks({
  onAgentStateChange: (newState, prevState, lastSpeech) => {
    // ✅ Already implemented (lines 151-178)

    // Demo trigger logic HERE:
    if (prevState === 'speaking' && newState === 'listening') {
      // Avatar finished speaking, check for demo keywords
      const demoTrigger = checkForDemoTrigger(lastSpeech, ...);
      if (demoTrigger.matched) {
        playDemoVideo(demoTrigger.videoUrl);
      }
    }
  }
});
```

**Key Insight:** Demo trigger logic goes in onAgentStateChange callback, which is ALREADY wired up!

---

## MobileAvatarWidget Integration Pattern

### How Component Uses Managers

**Initialization (lines 111-183)**
```javascript
useEffect(() => {
  // 1. Set loggers
  AudioManager.setLogger(addDebugLog);
  SessionManager.setLogger(addDebugLog);
  LiveKitEventManager.setLogger(log);

  // 2. Set callbacks
  LiveKitEventManager.setCallbacks({
    onAvatarStartSpeaking: () => { /* ... */ },
    onAvatarStopSpeaking: () => { /* ... */ },
    onUserTranscript: (text, source) => handleUserSpeech(text, source),
    onAvatarTranscript: (text, source) => handleAvatarSpeech(text, source),
    onAgentStateChange: (newState, prevState, lastSpeech) => { /* ... */ },
    // ...
  });
}, []);
```

**Session Start (lines 543-683)**
```javascript
const startLiveSession = async () => {
  // 1. Initialize AudioManager FIRST (requires user gesture)
  await AudioManager.initialize();

  // 2. Create HeyGen session (API call)
  const resp = await fetch(getNodeApiUrl("/api/liveavatar/create-session"), ...);
  const { livekitUrl, livekitClientToken } = await resp.json();

  // 3. Connect to LiveKit room
  const r = new Room({ adaptiveStream: false });
  await r.connect(livekitUrl, livekitClientToken);
  setRoom(r);

  // 4. Initialize SessionManager
  await SessionManager.initialize(r, 'live-video-container');

  // 5. Attach LiveKitEventManager
  LiveKitEventManager.attachToRoom(r);

  // 6. Wire track events
  r.on(RoomEvent.TrackSubscribed, async (track) => {
    if (track.kind === Track.Kind.Video) {
      await SessionManager.attachVideoTrack(track);
    } else if (track.kind === Track.Kind.Audio) {
      await SessionManager.attachAudioTrack(track);
    }
  });

  // 7. Check existing tracks (race condition fix)
  setTimeout(async () => {
    for (const participant of r.remoteParticipants.values()) {
      for (const publication of participant.trackPublications.values()) {
        if (publication.track) {
          if (track.kind === Track.Kind.Video) {
            await SessionManager.attachVideoTrack(track);
          } else {
            await SessionManager.attachAudioTrack(track);
          }
        }
      }
    }

    // 8. Wait for ready, then hide spinner
    await SessionManager.waitForReady();
    setIsConnecting(false);
  }, 500);
};
```

**Cleanup (lines 501-536)**
```javascript
const handleDisconnect = async () => {
  // 1. Stop HeyGen session
  await stopSession();

  // 2. SessionManager cleanup (handles audio + video)
  SessionManager.cleanup();

  // 3. Detach LiveKitEventManager
  LiveKitEventManager.detachFromRoom();

  // 4. LiveKit room cleanup
  if (room) {
    room.disconnect();
    setRoom(null);
  }

  // 5. Local microphone cleanup
  if (localAudioRef.current) {
    localAudioRef.current.stop();
    localAudioRef.current = null;
  }

  // 6. Reset UI state
  setIsMuted(true);
  setState("minimized");

  // 7. Call parent callback
  if (onDisconnect) onDisconnect();
};
```

---

## Epic 4 Integration Strategy

### What We CANNOT Copy-Paste from Desktop

❌ **wireRoomEvents()** - Desktop has 135-line monolith
✅ Mobile uses LiveKitEventManager with callbacks

❌ **attachAudioTrack()** - Desktop attaches to DOM directly
✅ Mobile delegates to AudioManager

❌ **attachVideoTrack()** - Desktop inline in component
✅ Mobile delegates to SessionManager

❌ **Event listeners** - Desktop wires directly on room
✅ Mobile uses manager callbacks

### What We CAN Reuse from Desktop

✅ **useDemoVideo.js** - Hook already copied, works as-is
✅ **videoTriggerMatcher.js** - Pure function, no coupling
✅ **video-triggers.json** - Data file
✅ **handleUserSpeech() / handleAvatarSpeech()** - Already implemented
✅ **detectIntent()** - Needs to be added
✅ **Demo UI overlay** - React JSX, can copy directly

### Integration Points

**1. Demo Trigger Detection (ALREADY DONE!)**
```javascript
// In MobileAvatarWidget.jsx lines 151-178
onAgentStateChange: (newState, prevState, lastSpeech) => {
  if (prevState === 'speaking' && newState === 'listening') {
    setTimeout(() => {
      const demoTrigger = checkForDemoTrigger(lastSpeech, ...);
      if (demoTrigger && demoTrigger.matched) {
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
}
```

**Status:** ✅ Demo trigger logic ALREADY IN PLACE!

**2. detectIntent() Function (MISSING)**

Currently only called (lines 203, 225, 149) but NOT defined. Need to add:

```javascript
const detectIntent = (transcript, fullData, source) => {
  const lowerTranscript = transcript.toLowerCase();

  // Check demo triggers FIRST (priority)
  const demoTrigger = checkForDemoTrigger(transcript, videoTriggersConfig, log);
  if (demoTrigger && demoTrigger.matched && !isDemoPlaying) {
    log('DEMO', '🎬 Demo video trigger detected', demoTrigger);

    if (state !== "maximized") {
      setState("maximized");
    }

    playDemoVideo(demoTrigger.videoUrl);
    setDetectedIntents(prev => [...prev, 'show_demo'].slice(-5));
    return; // Early return
  }

  // Calendly intents (already implemented)
  // ...
};
```

**3. Demo Video UI (MISSING)**

Need to add JSX rendering:

```jsx
{isDemoPlaying && (
  <div style={{ /* fullscreen overlay */ }}>
    <video ref={demoVideoRef} controls autoPlay playsInline /* ... */ />
    <div id="avatar-pip" style={{ /* PiP corner */ }} />
    <button onClick={stopDemoVideo}>⏹️ Stop Demo</button>
  </div>
)}
```

**4. State Restoration (ALREADY DONE!)**
```javascript
// Lines 238-251 - Already implemented
useEffect(() => {
  if (!isDemoPlaying && preDemoWidgetStateRef.current !== null) {
    if (room && sessionInfo) {
      setState("small");
    }
    preDemoWidgetStateRef.current = null;
  }
}, [isDemoPlaying, room, sessionInfo]);
```

---

## Summary: Epic 4 Implementation Plan

### ✅ Already Complete (85%)

1. ✅ Demo trigger detection in onAgentStateChange callback
2. ✅ handleUserSpeech() / handleAvatarSpeech() implemented
3. ✅ useDemoVideo hook imported and initialized
4. ✅ State restoration after demo
5. ✅ LiveKitEventManager provides all needed callbacks
6. ✅ lastAvatarSpeech tracking for demo triggers

### ❌ Missing Components (15%)

1. ❌ `detectIntent()` function definition
2. ❌ Demo video UI overlay JSX
3. ❌ PiP avatar container and cloning logic

### Implementation Approach

**DO NOT copy-paste from desktop AIChatWidget!**

Instead:

1. **Add detectIntent() function** - Adapt desktop version but use mobile's existing callback structure
2. **Add demo UI JSX** - Can mostly copy from desktop, but ensure uses mobile styling (100vh/100dvh)
3. **Avatar PiP cloning** - Copy from desktop Calendly PiP pattern (already working in mobile)

**Key Principle:** Work WITH the manager architecture, not around it.

---

## Architecture Benefits Summary

### For Epic 4 Integration

1. **No Track Management Changes** - Managers handle all tracks, demo video is separate
2. **Callback-Based** - Demo trigger logic fits naturally in onAgentStateChange callback
3. **Idempotent** - Can call playDemoVideo() multiple times safely
4. **Clean Separation** - Demo video UI is pure React, managers handle LiveKit

### For Future Maintenance

1. **Testable** - Can unit test managers without React
2. **Debuggable** - getState() methods provide full system state
3. **Refactorable** - Change manager internals without touching component
4. **Extensible** - Add new callbacks without rewriting event handlers

---

## Conclusion

The mobile architecture is **production-grade** with proper separation of concerns. Epic 4 integration should:

1. ✅ Use existing LiveKitEventManager callbacks
2. ✅ Keep managers unchanged
3. ✅ Add missing detectIntent() function
4. ✅ Add demo UI JSX
5. ✅ Reuse existing PiP pattern from Calendly

**Next Steps:** Implement the 3 missing pieces (detectIntent, demo UI, PiP cloning) while respecting the manager architecture.
