# Mobile Avatar Chat - Technical Specification & Implementation Plan

**Version:** 1.0
**Date:** 2025-12-04
**Status:** Production-Ready
**Target Platforms:** iOS Safari 15.4+, Android Chrome 108+

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Technical Architecture](#2-technical-architecture)
3. [Platform-Specific Considerations](#3-platform-specific-considerations)
4. [Epic Breakdown & Implementation Plan](#4-epic-breakdown--implementation-plan)
5. [Production Concerns](#5-production-concerns)
6. [Quality Assurance](#6-quality-assurance)
7. [Deployment Strategy](#7-deployment-strategy)
8. [Monitoring & Analytics](#8-monitoring--analytics)
9. [Appendix](#9-appendix)

---

## 1. Executive Summary

### 1.1 Project Overview

**Objective:** Port existing desktop HomePage avatar chat functionality to mobile-friendly implementation that works on iOS Safari and Android Chrome browsers.

**Scope:** This is a direct port, NOT a redesign. Copy and adapt existing desktop code with mobile-specific optimizations.

**Key Principle:** 100% feature parity with desktop - no omissions, no redesigns, no new features.

### 1.2 Business Goals

- **Primary:** Enable mobile users to interact with AI avatar agent
- **Secondary:** Capture leads via Calendly booking on mobile
- **Tertiary:** Demonstrate product value via demo videos on mobile

### 1.3 Technical Goals

- Zero breaking changes to desktop functionality
- Complete code isolation (mobile/desktop independence)
- Production-grade error handling for mobile quirks
- Performance optimization for mobile networks and devices

### 1.4 Success Metrics (KPIs)

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Audio Unlock Success Rate** | >95% | % of sessions where audio plays successfully |
| **Session Start Time** | <5s | Time from button click to avatar visible |
| **Connection Success Rate** | >90% | % of sessions that connect successfully |
| **Session Completion Rate** | >70% | % of sessions that don't disconnect due to errors |
| **Demo Video Play Rate** | >80% | % of triggered demos that play successfully |
| **Calendly Conversion Rate** | >5% | % of sessions that open Calendly |
| **Mobile Bundle Size** | <500KB | Initial load size for mobile users |
| **Zero Desktop Regressions** | 100% | No bugs introduced to desktop |

### 1.5 Timeline Estimate

- **Epic 1 (Foundation):** 2-3 days
- **Epic 2 (Core Session):** 3-4 days
- **Epic 3 (Audio/Video):** 2-3 days
- **Epic 4 (Demo Video):** 2-3 days
- **Epic 5 (Calendly):** 2 days
- **Epic 6 (Error Handling):** 2-3 days
- **Epic 7 (Testing & Polish):** 3-4 days
- **Total:** 16-22 days (3-4 weeks)

---

## 2. Technical Architecture

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        User Browser                          │
│  ┌──────────────────┐           ┌──────────────────┐        │
│  │  Mobile Landing  │           │  Desktop Home    │        │
│  │      Page        │           │      Page        │        │
│  └────────┬─────────┘           └────────┬─────────┘        │
│           │                              │                   │
│           │ isMobile=true                │ isMobile=false    │
│           ▼                              ▼                   │
│  ┌──────────────────┐           ┌──────────────────┐        │
│  │ MobileAvatarWidget│          │  AIChatWidget    │        │
│  │  (Complete Copy)  │          │   (Original)     │        │
│  └────────┬─────────┘           └────────┬─────────┘        │
│           │                              │                   │
│           └──────────────┬───────────────┘                   │
│                          ▼                                   │
│              ┌────────────────────┐                          │
│              │   Shared Services  │                          │
│              │  - LiveKit SDK     │                          │
│              │  - HeyGen API      │                          │
│              └────────────────────┘                          │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Component Structure

```
src/
├── mobile/                          # Mobile-specific code (isolated)
│   ├── MobileLandingPage.jsx       # Entry point for mobile users
│   ├── MobileAvatarWidget.jsx      # Complete copy of AIChatWidget
│   ├── hooks/
│   │   ├── useDemoVideo.js         # Demo video player
│   │   └── useEventLogger.js       # Event logging
│   ├── utils/
│   │   ├── utils.js                # Mobile detection
│   │   ├── videoTriggerMatcher.js  # Keyword detection
│   │   └── constants.js            # Keywords
│   └── config/
│       ├── video-triggers.json     # Demo triggers
│       ├── booking-config.json     # Calendly URL
│       └── api.js                  # API helpers
│
├── components/                      # Desktop code (unchanged)
│   ├── HomePage.jsx                # Desktop landing
│   └── AIChatWidget.jsx            # Desktop avatar widget
│
└── App.js                          # Router with mobile detection
```

### 2.3 Data Flow

#### Session Initialization Flow
```
User Clicks "Talk to Agent"
    ↓
Audio Unlock (synchronous in click handler)
    ↓
Create HeyGen Session (API call)
    ↓
Connect to LiveKit Room (WebRTC)
    ↓
Subscribe to Avatar Tracks (audio/video)
    ↓
Auto-enable Microphone (1500ms delay)
    ↓
Check Existing Tracks (1000ms delay)
    ↓
Session Active (user can talk)
```

#### Demo Video Flow
```
Avatar says "show me a rendering demo for nvidia"
    ↓
handleAvatarSpeech() captures transcript
    ↓
detectIntent() checks for keywords
    ↓
checkForDemoTrigger() matches "rendering + demo + nvidia"
    ↓
Maximize widget to fullscreen
    ↓
playDemoVideo(nvidia.mp4)
    ↓
Clone avatar to PiP corner
    ↓
User watches demo (can stop anytime)
    ↓
Return to conversation
```

#### Calendly Flow
```
User/Avatar says "schedule a meeting"
    ↓
detectIntent() detects meeting keywords
    ↓
Set pendingCalendlyRef = true
    ↓
Wait for avatar to finish speaking
    ↓
Save current state (mic/audio/widget state)
    ↓
Maximize widget to fullscreen
    ↓
Show Calendly iframe
    ↓
Clone avatar to PiP corner
    ↓
User books meeting
    ↓
Close Calendly, restore previous state
```

### 2.4 Technology Stack

| Layer | Technology | Version | Notes |
|-------|-----------|---------|-------|
| **Frontend Framework** | React | 18.x | StrictMode compatible |
| **Routing** | React Router | 6.x | Mobile detection in App.js |
| **WebRTC SDK** | LiveKit Client | Latest | Real-time audio/video |
| **Avatar API** | HeyGen | v2 | Session management |
| **Build Tool** | Vite/Webpack | Latest | Code splitting enabled |
| **State Management** | React Hooks | Built-in | No external state library |
| **HTTP Client** | Fetch API | Native | No axios dependency |
| **UI Components** | Lucide React | Latest | Icons only |

### 2.5 Critical Dependencies

```json
{
  "dependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "react-router-dom": "^6.0.0",
    "livekit-client": "latest",
    "lucide-react": "latest"
  }
}
```

### 2.6 Browser Compatibility Matrix

| Platform | Browser | Min Version | Audio Unlock | WebRTC | 100dvh |
|----------|---------|-------------|--------------|--------|--------|
| iOS | Safari | 15.4 | ✅ | ✅ | ✅ |
| iOS | Safari | 14.5-15.3 | ✅ | ✅ | ⚠️ Fallback |
| Android | Chrome | 108+ | ✅ | ✅ | ✅ |
| Android | Chrome | 90-107 | ✅ | ✅ | ⚠️ Fallback |
| Desktop | All | N/A | N/A | ✅ | N/A |

---

## 3. Platform-Specific Considerations

### 3.1 iOS Safari

#### Audio Context Restrictions
- **Requirement:** Audio unlock must happen synchronously in user gesture
- **Solution:** Call `audio.play()` directly in onClick handler (no async)
- **Fallback:** Show error UI if unlock fails, allow retry

#### Silent Mode Detection
- **Issue:** Hardware silent switch mutes all audio without JavaScript error
- **Solution:** Detect NotAllowedError and show user guidance
- **UX:** "Please check your device is not on silent mode"

#### Memory Limits
- **Constraint:** Safari kills tabs at 400-600MB memory usage
- **Mitigation:** Comprehensive cleanup on unmount
- **Monitoring:** Track memory usage in production (if possible)

#### Background Tab Handling
- **Issue:** AudioContext suspends when tab goes to background
- **Solution:** Resume AudioContext on visibilitychange event
- **Code:** Document visibility handler in Section 6

#### ViewportHeight Quirks
- **Issue:** Address bar changes viewport height
- **Solution:** Use `100dvh` with `100vh` fallback
- **CSS:** `height: 100vh; height: 100dvh;` (cascade)

### 3.2 Android Chrome

#### Memory Management
- **Constraint:** Low-end devices (<2GB RAM) aggressively kill tabs
- **Solution:** Same cleanup as iOS + test on low-end devices
- **Target:** Test on devices with 2GB RAM minimum

#### Battery Saver Mode
- **Issue:** Throttles JavaScript and network
- **Detection:** Battery Status API (deprecated, limited)
- **Fallback:** Standard error handling + reconnection overlay

#### WebView Compatibility
- **Scope:** Browser-only implementation (not WebView)
- **Documentation:** Explicitly state browser-only support
- **Future:** If native app needed, separate implementation required

### 3.3 Network Conditions

#### Connection Quality
- **Mobile Networks:** Highly variable (2G to 5G)
- **Solution:** 30-second connection timeout
- **UX:** Show "Reconnecting..." overlay on network switch

#### Bandwidth Optimization
- **Video Quality:** Controlled by HeyGen (adaptiveStream: false)
- **No Client Control:** Mobile uses same quality as desktop
- **Future:** Could implement quality ladder if needed

#### Offline Handling
- **MVP:** No offline support
- **Error:** Connection error UI with retry button
- **Future:** Service worker for app shell caching

### 3.4 Touch Interface

#### Touch Events
- **Support:** Buttons work with both touch and click
- **No Special Handling:** React handles touch events automatically
- **Testing:** Test on actual devices, not just browser DevTools

#### Landscape Mode
- **MVP:** Portrait mode focus
- **Behavior:** Should work in landscape but not optimized
- **Future:** Optimize landscape layout if needed

---

## 4. Epic Breakdown & Implementation Plan

### Epic 1: Foundation & Infrastructure
**Priority:** P0 (Blocking)
**Estimated Effort:** 2-3 days
**Dependencies:** None

#### 4.1.1 Technical Scope

Set up mobile-specific infrastructure with complete code isolation from desktop.

#### 4.1.2 User Stories

- **US-1.1:** As a developer, I need a mobile detection utility so routing works correctly
- **US-1.2:** As a developer, I need the mobile folder structure so code is organized
- **US-1.3:** As a user, I should be routed to mobile or desktop based on my device

#### 4.1.3 Acceptance Criteria

- [ ] Mobile detection utility correctly identifies iOS and Android
- [ ] Desktop users still see desktop HomePage (zero regression)
- [ ] Mobile users see mobile landing page
- [ ] All required folders created (`hooks/`, `utils/`, `config/`)
- [ ] File structure matches PRD Section 5.1 exactly
- [ ] Code splitting works (mobile bundle separate from desktop)

#### 4.1.4 Technical Tasks

**Task 1.1: Create Mobile Detection Utility**
```javascript
// src/mobile/utils/utils.js
export function isMobileDevice() {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    && window.innerWidth <= 768;
}
```
- **Complexity:** Low
- **Time:** 15 minutes
- **Testing:** Test on iOS Safari, Android Chrome, Desktop browsers

**Task 1.2: Set Up Folder Structure**
```
src/mobile/
├── hooks/
├── utils/
│   └── utils.js
└── config/
```
- **Complexity:** Low
- **Time:** 10 minutes

**Task 1.3: Update App.js with Routing**
```javascript
import { lazy, Suspense } from 'react';
import { isMobileDevice } from './mobile/utils/utils';

const HomePage = lazy(() => import('./components/HomePage'));
const MobileLandingPage = lazy(() => import('./mobile/MobileLandingPage'));

function App() {
  const isMobile = isMobileDevice();

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route
          path="/"
          element={isMobile ? <MobileLandingPage /> : <HomePage />}
        />
        {/* Other routes unchanged */}
      </Routes>
    </Suspense>
  );
}
```
- **Complexity:** Low
- **Time:** 30 minutes
- **Testing:** Verify desktop still works, mobile gets placeholder

**Task 1.4: Copy Required Config Files**
- Copy `/src/config/api.js` → `/src/mobile/config/api.js`
- Copy `/src/config/video-triggers.json` → `/src/mobile/config/video-triggers.json`
- Copy `/src/config/booking-config.json` → `/src/mobile/config/booking-config.json`
- **Complexity:** Low
- **Time:** 15 minutes
- **Testing:** Verify files are readable, JSON is valid

#### 4.1.5 System Components Affected

- `src/App.js` - Add mobile routing
- `src/mobile/` - New folder structure

#### 4.1.6 Dependencies & Prerequisites

- React Router 6.x installed
- Project builds successfully

#### 4.1.7 Success Metrics

- Mobile detection accuracy: 100%
- Desktop users unaffected: 100%
- Build time increase: <10%

#### 4.1.8 Rollback Plan

- Remove mobile routing from App.js
- Mobile users see desktop version (may not work perfectly but doesn't break)

---

### Epic 2: Core Session Management
**Priority:** P0 (Blocking)
**Estimated Effort:** 3-4 days
**Dependencies:** Epic 1 complete

#### 4.2.1 Technical Scope

Implement complete session lifecycle: create HeyGen session, connect LiveKit room, disconnect cleanly.

#### 4.2.2 User Stories

- **US-2.1:** As a mobile user, I can click "Talk to Agent" and start a session
- **US-2.2:** As a mobile user, I can disconnect and return to landing page
- **US-2.3:** As a mobile user, I can reconnect after disconnecting (fresh state)
- **US-2.4:** As a mobile user, I see a loading indicator while connecting

#### 4.2.3 Acceptance Criteria

- [ ] HeyGen API creates session successfully
- [ ] LiveKit room connects successfully
- [ ] Avatar video displays fullscreen
- [ ] Disconnect cleans up all resources
- [ ] Fresh widget instance created on each session (session key pattern)
- [ ] Loading state shows "Starting..." during connection
- [ ] 30-second connection timeout with error UI
- [ ] Error UI has retry button
- [ ] Desktop functionality completely unaffected

#### 4.2.4 Technical Tasks

**Task 2.1: Copy MobileAvatarWidget.jsx Skeleton**
- Copy entire `/src/components/AIChatWidget.jsx` → `/src/mobile/MobileAvatarWidget.jsx`
- Rename component to `MobileAvatarWidget`
- Update all imports to use `/src/mobile/` paths
- **Complexity:** Medium
- **Time:** 2 hours
- **Testing:** Component renders without errors

**Task 2.2: Implement startLiveSession()**
```javascript
const startLiveSession = async () => {
  setIsConnecting(true);
  setConnectionError(null);

  // 30-second timeout
  connectionTimeoutRef.current = setTimeout(() => {
    setConnectionTimeout(true);
    setIsConnecting(false);
  }, 30000);

  try {
    // HeyGen API call
    const resp = await fetch(getNodeApiUrl("/api/liveavatar/create-session"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: "widget-user" }),
    });

    if (!resp.ok) throw new Error(`HeyGen API failed: ${resp.status}`);

    const data = (await resp.json()).data || await resp.json();
    if (!data.livekitUrl || !data.livekitClientToken) {
      throw new Error("Missing LiveKit credentials");
    }

    // LiveKit connection
    const r = new Room({ adaptiveStream: false, dynacast: false });
    await r.connect(data.livekitUrl, data.livekitClientToken);

    // Clear timeout
    clearTimeout(connectionTimeoutRef.current);

    // Unmount safety check
    if (!mountedRef.current) {
      r.disconnect();
      return;
    }

    setRoom(r);
    wireRoomEvents(r);
    setIsConnecting(false);

  } catch (err) {
    clearTimeout(connectionTimeoutRef.current);
    setConnectionError(err.message);
    setIsConnecting(false);
  }
};
```
- **Complexity:** High
- **Time:** 4 hours
- **Testing:** Test success case, timeout case, error cases

**Task 2.3: Implement handleDisconnect()**
```javascript
const handleDisconnect = async () => {
  try {
    // Stop HeyGen session
    if (sessionInfo) await stopSession();

    // Disconnect LiveKit room
    if (room) room.disconnect();

    // Stop microphone track
    if (localAudioRef.current) {
      localAudioRef.current.stop();
      localAudioRef.current = null;
    }

    // Remove audio element
    if (remoteAudioRef.current) {
      document.body.removeChild(remoteAudioRef.current);
      remoteAudioRef.current = null;
    }

    // Reset state
    setRoom(null);
    setSessionInfo(null);
    setHasLiveVideo(false);

    // Call parent disconnect handler
    if (onDisconnect) onDisconnect();

  } catch (err) {
    console.error('Disconnect error:', err);
  }
};
```
- **Complexity:** Medium
- **Time:** 2 hours
- **Testing:** Test clean disconnect, rapid disconnect, errors

**Task 2.4: Implement Cleanup on Unmount**
```javascript
useEffect(() => {
  mountedRef.current = true;

  return () => {
    mountedRef.current = false;

    if (connectionTimeoutRef.current) {
      clearTimeout(connectionTimeoutRef.current);
    }

    if (sessionInfo) {
      stopSession().catch(console.error);
    }

    if (room) room.disconnect();

    if (localAudioRef.current) {
      localAudioRef.current.stop();
      localAudioRef.current = null;
    }

    if (remoteAudioRef.current) {
      try {
        document.body.removeChild(remoteAudioRef.current);
      } catch (e) {}
      remoteAudioRef.current = null;
    }
  };
}, []);
```
- **Complexity:** Medium
- **Time:** 2 hours
- **Testing:** Test unmount during connection, after connection, rapid mount/unmount

**Task 2.5: Copy MobileLandingPage.jsx Skeleton**
- Copy entire `/src/components/HomePage.jsx` → `/src/mobile/MobileLandingPage.jsx`
- Remove animation imports (SimpleLightRays, LightRays, RadarScanner, FadeInSection)
- Change import to `MobileAvatarWidget`
- **Complexity:** Medium
- **Time:** 1 hour
- **Testing:** Page renders with "Talk to Agent" button

**Task 2.6: Implement Session Key Pattern**
```javascript
// In MobileLandingPage.jsx
const [sessionKey, setSessionKey] = useState(0);

const handleDisconnect = () => {
  setTriggerAvatarFullscreen(false);
  setSessionKey(prev => prev + 1); // Force fresh instance
};

// In JSX:
{triggerAvatarFullscreen && (
  <MobileAvatarWidget
    key={sessionKey}
    autoExpand={true}
    onDisconnect={handleDisconnect}
  />
)}
```
- **Complexity:** Low
- **Time:** 30 minutes
- **Testing:** Connect → disconnect → reconnect multiple times, verify clean state

**Task 2.7: Implement Loading State**
```javascript
const [loading, setLoading] = useState(false);

const handleTalkToAgent = async () => {
  if (loading) return;
  setLoading(true);

  // ... audio unlock logic ...

  setTimeout(() => {
    setTriggerAvatarFullscreen(true);
    setLoading(false);
  }, 500);
};
```
- **Complexity:** Low
- **Time:** 1 hour
- **Testing:** Verify loading spinner shows, double-click prevented

#### 4.2.5 System Components Affected

- `src/mobile/MobileAvatarWidget.jsx` - New file (copy of AIChatWidget)
- `src/mobile/MobileLandingPage.jsx` - New file (copy of HomePage)
- HeyGen API - Session creation endpoint
- LiveKit - WebRTC connection

#### 4.2.6 Dependencies & Prerequisites

- Epic 1 complete
- HeyGen API accessible
- LiveKit credentials valid

#### 4.2.7 Success Metrics

- Session start success rate: >90%
- Session start time: <5s
- Clean disconnect rate: 100%
- Memory leak: 0 (verify with multiple sessions)

---

### Epic 3: Audio/Video Track Management
**Priority:** P0 (Blocking)
**Estimated Effort:** 2-3 days
**Dependencies:** Epic 2 complete

#### 4.3.1 Technical Scope

Implement complete audio/video track handling: attach tracks, detach tracks, auto-enable microphone, handle race conditions.

#### 4.3.2 User Stories

- **US-3.1:** As a mobile user, I can hear the avatar speaking
- **US-3.2:** As a mobile user, my microphone auto-enables so I can respond
- **US-3.3:** As a mobile user, I can toggle my microphone on/off
- **US-3.4:** As a mobile user, I can toggle avatar audio on/off
- **US-3.5:** As a mobile user, I don't experience "silent avatar" bug

#### 4.3.3 Acceptance Criteria

- [ ] Avatar video displays correctly
- [ ] Avatar audio plays automatically
- [ ] Microphone auto-enables 1500ms after connection
- [ ] Mic toggle button works
- [ ] Speaker toggle button works
- [ ] Existing tracks race condition handled (1000ms check)
- [ ] Explicit audio processing settings used (echo cancellation, etc.)
- [ ] No silent avatar bug
- [ ] Audio unlock works on iOS Safari
- [ ] Audio unlock works on Android Chrome

#### 4.3.4 Technical Tasks

**Task 3.1: Implement Audio Unlock Strategy**
```javascript
// In MobileLandingPage.jsx
let audioUnlocked = false;
let audioUnlockAttempts = 0;
const MAX_AUDIO_UNLOCK_ATTEMPTS = 3;

const unlockAudioContext = async () => {
  audioUnlockAttempts++;
  if (audioUnlockAttempts > MAX_AUDIO_UNLOCK_ATTEMPTS) return false;

  const unlockAudioEl = document.createElement("audio");
  unlockAudioEl.src = "data:audio/mpeg;base64,..."; // Silent audio

  try {
    await unlockAudioEl.play();
    audioUnlocked = true;
    unlockAudioEl.src = '';
    unlockAudioEl.remove();
    return true;
  } catch (error) {
    unlockAudioEl.src = '';
    unlockAudioEl.remove();
    return false;
  }
};

const handleTalkToAgent = async () => {
  if (!audioUnlocked) {
    const success = await unlockAudioContext();
    if (!success) {
      setAudioUnlockError(true);
      return;
    }
  }

  // Check AudioContext state
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  if (audioContext.state === 'suspended') {
    await audioContext.resume();
  }

  setTriggerAvatarFullscreen(true);
};
```
- **Complexity:** High
- **Time:** 4 hours
- **Testing:** Test on iOS Safari, Android Chrome, test retry flow

**Task 3.2: Implement attachAudioTrack()**
```javascript
const attachAudioTrack = (track) => {
  if (remoteAudioRef.current) {
    console.warn('Audio track already attached');
    return;
  }

  const audioEl = track.attach();
  audioEl.autoplay = true;
  audioEl.playsInline = true;
  document.body.appendChild(audioEl);
  remoteAudioRef.current = audioEl;

  log('AUDIO', '✅ Avatar audio track attached');
};
```
- **Complexity:** Medium
- **Time:** 1 hour
- **Testing:** Verify audio plays, check multiple attach attempts

**Task 3.3: Implement attachVideoTrack()**
```javascript
const attachVideoTrack = (track) => {
  const videoContainer = document.getElementById('live-video-container');
  if (!videoContainer) return;

  const videoEl = track.attach();
  videoEl.style.width = '100%';
  videoEl.style.height = '100%';
  videoEl.style.objectFit = 'cover';
  videoEl.playsInline = true;

  videoContainer.appendChild(videoEl);
  setHasLiveVideo(true);

  log('VIDEO', '✅ Avatar video track attached');
};
```
- **Complexity:** Medium
- **Time:** 1 hour
- **Testing:** Verify video displays correctly

**Task 3.4: Implement Auto-Enable Microphone**
```javascript
// In startLiveSession(), after room connects:
setTimeout(() => {
  if (!mountedRef.current) return;

  createLocalAudioTrack({
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
  })
    .then((track) => {
      localAudioRef.current = track;
      room.localParticipant.publishTrack(track);
      setIsMuted(false);
      log('MIC', '🎤 Auto-enabled microphone');
    })
    .catch((error) => {
      log('ERROR', 'Failed to auto-enable microphone', error);
    });
}, 1500);
```
- **Complexity:** Medium
- **Time:** 2 hours
- **Testing:** Verify mic enables, test permission denied case

**Task 3.5: Implement Existing Tracks Race Condition Fix**
```javascript
// In startLiveSession(), after wireRoomEvents():
setTimeout(() => {
  if (!mountedRef.current) return;

  const existingAudioTracks = Array.from(r.remoteParticipants.values())
    .flatMap(p => Array.from(p.audioTrackPublications.values()))
    .map(pub => pub.track)
    .filter(track => track);

  if (existingAudioTracks.length > 0 && !remoteAudioRef.current) {
    log('TRACKS', '🔧 Found existing audio tracks (race condition fix)');
    existingAudioTracks.forEach(track => attachAudioTrack(track));
  }
}, 1000);
```
- **Complexity:** Medium
- **Time:** 2 hours
- **Testing:** Test on slow networks, verify no silent avatar

**Task 3.6: Implement toggleMicrophone()**
```javascript
const toggleMicrophone = async () => {
  if (!room) return;

  if (localAudioRef.current) {
    await room.localParticipant.unpublishTrack(localAudioRef.current);
    localAudioRef.current.stop();
    localAudioRef.current = null;
    setIsMuted(true);
  } else {
    try {
      const track = await createLocalAudioTrack({
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      });
      localAudioRef.current = track;
      await room.localParticipant.publishTrack(track);
      setIsMuted(false);
      setMicPermissionDenied(false);
    } catch (e) {
      setMicPermissionDenied(true);
      setIsMuted(true);
    }
  }
};
```
- **Complexity:** Medium
- **Time:** 2 hours
- **Testing:** Toggle multiple times, test permission denied

**Task 3.7: Implement toggleSpeaker()**
```javascript
const toggleSpeaker = () => {
  setAudioEnabled(prev => !prev);
  if (remoteAudioRef.current) {
    remoteAudioRef.current.muted = audioEnabled;
  }
};
```
- **Complexity:** Low
- **Time:** 30 minutes
- **Testing:** Toggle and verify audio mutes/unmutes

**Task 3.8: Implement Visibility Change Handler**
```javascript
// In MobileLandingPage.jsx
useEffect(() => {
  const handleVisibilityChange = async () => {
    if (document.visibilityState === 'visible' && audioUnlocked) {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }
    }
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);
  return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
}, []);
```
- **Complexity:** Low
- **Time:** 1 hour
- **Testing:** Background tab, return, verify audio works

#### 4.3.5 System Components Affected

- `src/mobile/MobileAvatarWidget.jsx` - Track handling
- `src/mobile/MobileLandingPage.jsx` - Audio unlock
- LiveKit SDK - Track subscriptions

#### 4.3.6 Dependencies & Prerequisites

- Epic 2 complete (session management working)
- Audio unlock permissions granted

#### 4.3.7 Success Metrics

- Audio unlock success rate: >95%
- Auto-enable mic success rate: >90%
- Silent avatar bug occurrence: 0%
- Track attachment success rate: 100%

---

### Epic 4: Demo Video System
**Priority:** P1 (High)
**Estimated Effort:** 2-3 days
**Dependencies:** Epic 3 complete

#### 4.4.1 Technical Scope

Implement complete demo video playback system with keyword detection, video player, and Picture-in-Picture avatar.

#### 4.4.2 User Stories

- **US-4.1:** As a mobile user, when avatar offers a demo, I can watch it fullscreen
- **US-4.2:** As a mobile user, I can see the avatar in PiP while watching demo
- **US-4.3:** As a mobile user, I can stop the demo anytime
- **US-4.4:** As a mobile user, demo auto-plays without requiring interaction

#### 4.4.3 Acceptance Criteria

- [ ] Keywords detected correctly ("rendering + demo + nvidia")
- [ ] Demo video plays fullscreen
- [ ] Avatar clones to PiP corner
- [ ] Stop button works
- [ ] Demo ends naturally (onEnded event)
- [ ] Microphone pauses during demo
- [ ] Microphone stays muted after demo
- [ ] Returns to conversation after demo
- [ ] All 5 demo triggers work (Nvidia, Microsoft, Apple, Google, Generic)

#### 4.4.4 Technical Tasks

**Task 4.1: Copy Custom Hooks**
- Copy `/src/hooks/useDemoVideo.js` → `/src/mobile/hooks/useDemoVideo.js`
- Copy `/src/hooks/useEventLogger.js` → `/src/mobile/hooks/useEventLogger.js`
- **Complexity:** Low
- **Time:** 15 minutes
- **Testing:** Import and verify no errors

**Task 4.2: Copy Utilities**
- Copy `/src/utils/videoTriggerMatcher.js` → `/src/mobile/utils/videoTriggerMatcher.js`
- Copy `/src/utils/constants.js` → `/src/mobile/utils/constants.js`
- **Complexity:** Low
- **Time:** 15 minutes
- **Testing:** Import and verify exports work

**Task 4.3: Implement handleUserSpeech() & handleAvatarSpeech()**
```javascript
const handleUserSpeech = (text, source) => {
  if (!text) return;
  log('USER_SPEECH', `🗣️ User said (${source})`, { text });

  setTranscripts(prev => [
    ...prev,
    { type: "user_speech", text, timestamp: Date.now() }
  ].slice(-10));

  detectIntent(text, { text }, "user");
};

const handleAvatarSpeech = (text, source) => {
  if (!text) return;
  log('AVATAR_SPEECH', `🤖 Avatar said (${source})`, { text });

  setTranscripts(prev => [
    ...prev,
    { type: "avatar_speech", text, timestamp: Date.now() }
  ].slice(-10));

  lastAvatarSpeechRef.current = text;
  detectIntent(text, { text }, "avatar");
};
```
- **Complexity:** Medium
- **Time:** 2 hours
- **Testing:** Log transcripts, verify detectIntent called

**Task 4.4: Implement detectIntent()**
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
    return;
  }

  // Other intents (Calendly, etc.) processed after
};
```
- **Complexity:** Medium
- **Time:** 2 hours
- **Testing:** Test all 5 demo triggers

**Task 4.5: Update wireRoomEvents() with Demo Logic**
```javascript
// In wireRoomEvents():
r.on(RoomEvent.DataReceived, (payload, participant, kind) => {
  // ... existing code ...

  if (parsedJson.type === "avatar_transcript") {
    const text = parsedJson.text || '';
    handleAvatarSpeech(text, 'type: avatar_transcript');
  }
});

r.on(RoomEvent.ParticipantAttributesChanged, (changedAttributes, participant) => {
  if (changedAttributes["lk.agent.state"]) {
    const agentState = changedAttributes["lk.agent.state"];
    setAvatarState(agentState);

    // Demo trigger on speaking→listening transition
    if (previousAgentStateRef.current === 'speaking' && agentState === 'listening') {
      setTimeout(() => {
        const lastSpeech = lastAvatarSpeechRef.current;
        if (lastSpeech) {
          const demoTrigger = checkForDemoTrigger(lastSpeech, videoTriggersConfig, log);
          if (demoTrigger && demoTrigger.matched && !isDemoPlaying) {
            preDemoWidgetStateRef.current = state;

            if (state !== "maximized") {
              setState("maximized");
              setTimeout(() => playDemoVideo(demoTrigger.videoUrl), 500);
            } else {
              playDemoVideo(demoTrigger.videoUrl);
            }
          }
        }
      }, 100);
    }

    previousAgentStateRef.current = agentState;
  }
});
```
- **Complexity:** High
- **Time:** 4 hours
- **Testing:** Test demo triggers from avatar speech

**Task 4.6: Implement Demo Video UI**
```jsx
{isDemoPlaying && (
  <div style={{
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    zIndex: 100,
    backgroundColor: "#000",
  }}>
    <video
      ref={demoVideoRef}
      controls
      autoPlay
      playsInline
      preload="auto"
      style={{
        display: "block",
        width: "100%",
        height: "100%",
        objectFit: "contain",
        background: "#000",
      }}
      onEnded={stopDemoVideo}
      onError={(e) => {
        log('ERROR', 'Demo video failed', e);
        stopDemoVideo();
      }}
    />

    <div id="avatar-pip" style={{
      position: "absolute",
      bottom: "20px",
      right: "20px",
      width: "200px",
      height: "150px",
      borderRadius: "12px",
      overflow: "hidden",
      border: "3px solid rgba(255, 255, 255, 0.9)",
      boxShadow: "0 8px 24px rgba(0, 0, 0, 0.8)",
      zIndex: 101,
      backgroundColor: "#000",
    }} />

    <button
      onClick={stopDemoVideo}
      style={{
        position: "absolute",
        top: "16px",
        right: "16px",
        padding: "8px 16px",
        background: "rgba(239, 68, 68, 0.95)",
        color: "white",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
        fontWeight: "bold",
        fontSize: "14px",
        zIndex: 102,
      }}
    >
      ⏹️ Stop Demo
    </button>
  </div>
)}
```
- **Complexity:** Medium
- **Time:** 2 hours
- **Testing:** Test video playback, PiP, stop button

**Task 4.7: Implement State Restoration After Demo**
```javascript
useEffect(() => {
  if (!isDemoPlaying && preDemoWidgetStateRef.current !== null) {
    if (room && sessionInfo) {
      setState("small");
    } else {
      setState("minimized");
    }
    preDemoWidgetStateRef.current = null;
  }
}, [isDemoPlaying, room, sessionInfo]);
```
- **Complexity:** Low
- **Time:** 1 hour
- **Testing:** Play demo, stop, verify state restored

#### 4.4.5 System Components Affected

- `src/mobile/MobileAvatarWidget.jsx` - Demo video logic
- `src/mobile/hooks/useDemoVideo.js` - New hook
- `src/mobile/hooks/useEventLogger.js` - New hook
- `src/mobile/utils/videoTriggerMatcher.js` - New utility
- GCS bucket - Video files (read-only)

#### 4.4.6 Dependencies & Prerequisites

- Epic 3 complete (audio/video working)
- Video files accessible from GCS bucket
- Keywords configured in video-triggers.json

#### 4.4.7 Success Metrics

- Demo trigger accuracy: >95%
- Demo video play success rate: >90%
- Demo completion rate: >50% (users watch to end)
- PiP avatar visible: 100%

---

### Epic 5: Calendly Booking Integration
**Priority:** P1 (High)
**Estimated Effort:** 2 days
**Dependencies:** Epic 3 complete

#### 4.5.1 Technical Scope

Implement Calendly booking integration with intent detection, iframe display, and state management.

#### 4.5.2 User Stories

- **US-5.1:** As a mobile user, when I/avatar mention scheduling, Calendly opens
- **US-5.2:** As a mobile user, I can book a meeting in the Calendly iframe
- **US-5.3:** As a mobile user, I can see avatar in PiP while booking
- **US-5.4:** As a mobile user, I can close Calendly and return to conversation

#### 4.5.3 Acceptance Criteria

- [ ] Intent keywords detected ("schedule a meeting", "book a call")
- [ ] Calendly waits for avatar to finish speaking
- [ ] Calendly iframe loads and is responsive on mobile
- [ ] Avatar clones to PiP corner
- [ ] Close button works
- [ ] Previous state restored after closing
- [ ] Microphone and audio state preserved and restored

#### 4.5.4 Technical Tasks

**Task 5.1: Add Calendly Intent to detectIntent()**
```javascript
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
      setDetectedIntents(prev => [...prev, "schedule_meeting"].slice(-5));
    },
  },
];

// In detectIntent():
intentActions.forEach(intent => {
  const matched = intent.keywords.some(kw =>
    lowerTranscript.includes(kw.toLowerCase())
  );
  if (matched) {
    intent.action();
  }
});
```
- **Complexity:** Medium
- **Time:** 2 hours
- **Testing:** Test all keywords trigger intent

**Task 5.2: Implement Wait for Avatar to Finish Speaking**
```javascript
useEffect(() => {
  if (pendingCalendlyRef.current && !isAvatarSpeaking) {
    log('CALENDLY', 'Avatar finished speaking - opening Calendly');

    preCalendlyWidgetStateRef.current = state;

    if (state !== "maximized") {
      setState("maximized");
    }

    setShowCalendly(true);
    pendingCalendlyRef.current = false;
  }
}, [isAvatarSpeaking, state]);
```
- **Complexity:** Low
- **Time:** 1 hour
- **Testing:** Verify Calendly opens after avatar finishes

**Task 5.3: Implement State Restoration After Calendly**
```javascript
useEffect(() => {
  if (!showCalendly && preCalendlyWidgetStateRef.current !== null) {
    if (room && sessionInfo) {
      setState("small");
    } else {
      setState("minimized");
    }

    preCalendlyWidgetStateRef.current = null;
  }
}, [showCalendly, room, sessionInfo]);
```
- **Complexity:** Low
- **Time:** 1 hour
- **Testing:** Open Calendly, close, verify state restored

**Task 5.4: Implement Avatar PiP Cloning**
```javascript
useEffect(() => {
  if (showCalendly && hasLiveVideo) {
    const sourceVideo = document.querySelector('#live-video-container video');
    const pipContainer = document.getElementById('calendly-avatar-pip');

    if (sourceVideo && pipContainer) {
      const pipVideo = sourceVideo.cloneNode(true);
      pipVideo.style.width = '100%';
      pipVideo.style.height = '100%';
      pipVideo.style.objectFit = 'cover';

      if (sourceVideo.srcObject) {
        pipVideo.srcObject = sourceVideo.srcObject;
      }

      pipContainer.innerHTML = '';
      pipContainer.appendChild(pipVideo);
      pipVideo.play().catch(e => console.log('PIP play failed:', e));

      log('CALENDLY', '✅ Avatar cloned to PIP');
    }
  }
}, [showCalendly, hasLiveVideo]);
```
- **Complexity:** Medium
- **Time:** 2 hours
- **Testing:** Verify avatar appears in PiP

**Task 5.5: Implement Calendly UI Overlay**
```jsx
{showCalendly && (
  <div style={{
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    zIndex: 100,
    backgroundColor: "#fff",
  }}>
    <iframe
      src={bookingConfig.calendlyUrl}
      width="100%"
      height="100%"
      frameBorder="0"
      style={{ border: "none" }}
      title="Book a Meeting"
    />

    <div style={{
      position: "absolute",
      bottom: "20px",
      right: "20px",
      width: "120px",
      height: "90px",
      borderRadius: "12px",
      overflow: "hidden",
      border: "3px solid rgba(59, 130, 246, 0.9)",
      zIndex: 101,
      backgroundColor: "#000",
    }}>
      {hasLiveVideo ? (
        <div id="calendly-avatar-pip" style={{
          width: "100%",
          height: "100%",
          backgroundColor: "#000",
        }} />
      ) : (
        <div style={{
          width: "100%",
          height: "100%",
          backgroundImage: "url(/ai-avatar.jpg)",
          backgroundSize: "cover",
        }} />
      )}
    </div>

    <button
      onClick={() => setShowCalendly(false)}
      style={{
        position: "absolute",
        top: "16px",
        right: "16px",
        padding: "8px 16px",
        background: "rgba(239, 68, 68, 0.95)",
        color: "white",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
        fontWeight: "bold",
        fontSize: "14px",
        zIndex: 102,
      }}
    >
      Close
    </button>
  </div>
)}
```
- **Complexity:** Medium
- **Time:** 2 hours
- **Testing:** Test iframe loads, PiP works, close button works

#### 4.5.5 System Components Affected

- `src/mobile/MobileAvatarWidget.jsx` - Calendly logic
- `src/mobile/config/booking-config.json` - Calendly URL
- Calendly service - External iframe

#### 4.5.6 Dependencies & Prerequisites

- Epic 3 complete (audio/video working)
- Calendly URL configured in booking-config.json

#### 4.5.7 Success Metrics

- Intent detection accuracy: >90%
- Calendly open rate: >80% of triggered intents
- Booking completion rate: >5% of Calendly opens
- PiP avatar visible: 100%

---

### Epic 6: Error Handling & Resilience
**Priority:** P0 (Blocking)
**Estimated Effort:** 2-3 days
**Dependencies:** Epic 2, 3 complete

#### 4.6.1 Technical Scope

Implement comprehensive error handling for all failure scenarios: connection timeouts, network switches, permission errors, etc.

#### 4.6.2 User Stories

- **US-6.1:** As a mobile user, if connection times out, I see error UI with retry
- **US-6.2:** As a mobile user, if network switches, I see reconnecting overlay
- **US-6.3:** As a mobile user, if mic permission denied, I see warning banner
- **US-6.4:** As a mobile user, if audio unlock fails, I can retry
- **US-6.5:** As a mobile user, errors don't crash the app

#### 4.6.3 Acceptance Criteria

- [ ] Connection timeout (30s) shows error UI
- [ ] Error UI has retry button
- [ ] Network switch shows "Reconnecting..." overlay
- [ ] Mic permission denied shows warning banner
- [ ] Audio unlock failure shows error with retry
- [ ] All errors logged to console
- [ ] No unhandled promise rejections
- [ ] Desktop functionality unaffected

#### 4.6.4 Technical Tasks

**Task 6.1: Implement Connection Timeout**
- **Status:** Already in Epic 2, Task 2.2
- **Verify:** Test 30-second timeout triggers error UI

**Task 6.2: Implement Reconnection Overlay**
```javascript
const [isReconnecting, setIsReconnecting] = useState(false);

useEffect(() => {
  if (!room) return;

  const handleReconnecting = () => {
    setIsReconnecting(true);
  };

  const handleReconnected = () => {
    setIsReconnecting(false);
  };

  room.on(RoomEvent.Reconnecting, handleReconnecting);
  room.on(RoomEvent.Reconnected, handleReconnected);
  room.on(RoomEvent.Disconnected, () => setIsReconnecting(false));

  return () => {
    room.off(RoomEvent.Reconnecting, handleReconnecting);
    room.off(RoomEvent.Reconnected, handleReconnected);
  };
}, [room]);

// UI:
{isReconnecting && (
  <div style={{
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  }}>
    <div style={{ color: 'white', textAlign: 'center' }}>
      <div style={{
        width: '32px',
        height: '32px',
        border: '2px solid white',
        borderTop: '2px solid transparent',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        margin: '0 auto 12px',
      }} />
      <p>Reconnecting...</p>
    </div>
  </div>
)}
```
- **Complexity:** Medium
- **Time:** 2 hours
- **Testing:** Switch WiFi to cellular, verify overlay shows

**Task 6.3: Implement Error UI with Retry**
```jsx
{connectionError && (
  <div style={{
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.95)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
  }}>
    <div style={{ color: 'white', textAlign: 'center', maxWidth: '400px' }}>
      <p style={{ fontSize: '18px', fontWeight: 600, marginBottom: '12px' }}>
        Connection Failed
      </p>
      <p style={{ fontSize: '14px', marginBottom: '24px', color: '#9CA3AF' }}>
        {connectionTimeout
          ? 'Connection timed out. Please check your internet and try again.'
          : connectionError
        }
      </p>
      <button
        onClick={() => {
          setConnectionError(null);
          setConnectionTimeout(false);
          startLiveSession();
        }}
        style={{
          background: 'rgba(59, 130, 246, 1)',
          color: 'white',
          border: 'none',
          padding: '12px 32px',
          borderRadius: '8px',
          fontWeight: 600,
          cursor: 'pointer',
          marginRight: '12px',
        }}
      >
        Retry
      </button>
      <button
        onClick={() => {
          if (onDisconnect) onDisconnect();
        }}
        style={{
          background: 'transparent',
          color: 'white',
          border: '1px solid white',
          padding: '12px 32px',
          borderRadius: '8px',
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        Cancel
      </button>
    </div>
  </div>
)}
```
- **Complexity:** Medium
- **Time:** 2 hours
- **Testing:** Force connection error, verify retry works

**Task 6.4: Implement Mic Permission Error Banner**
```jsx
{micPermissionDenied && (
  <div style={{
    position: 'absolute',
    top: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'rgba(245, 158, 11, 0.95)',
    color: 'white',
    padding: '12px 20px',
    borderRadius: '8px',
    fontSize: '14px',
    zIndex: 100,
    maxWidth: '90%',
    textAlign: 'center',
  }}>
    Microphone access denied - Avatar can't hear you
  </div>
)}
```
- **Complexity:** Low
- **Time:** 1 hour
- **Testing:** Deny mic permission, verify banner shows

**Task 6.5: Implement Audio Unlock Error UI**
```jsx
// In MobileLandingPage.jsx
{audioUnlockError && (
  <div style={{
    position: 'fixed',
    top: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'rgba(220, 38, 38, 0.95)',
    color: 'white',
    padding: '16px 24px',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
    zIndex: 10000,
    maxWidth: '90%',
    textAlign: 'center',
  }}>
    <p style={{ margin: '0 0 12px 0', fontWeight: 500 }}>Audio Blocked</p>
    <p style={{ margin: '0 0 16px 0', fontSize: '14px' }}>
      Please check your device is not on silent mode and allow audio permissions.
    </p>
    <button
      onClick={() => {
        setAudioUnlockError(false);
        audioUnlockAttempts = 0;
        handleTalkToAgent();
      }}
      style={{
        background: 'white',
        color: '#DC2626',
        border: 'none',
        padding: '8px 24px',
        borderRadius: '8px',
        fontWeight: 600,
        cursor: 'pointer',
      }}
    >
      Try Again
    </button>
  </div>
)}
```
- **Complexity:** Low
- **Time:** 1 hour
- **Testing:** Force audio unlock failure, verify error and retry

**Task 6.6: Implement CSS Fallback for 100dvh**
```javascript
// All fullscreen containers:
style={{
  height: '100vh',  // Fallback for older browsers
  height: '100dvh', // Modern mobile browsers - overrides if supported
}}
```
- **Complexity:** Low
- **Time:** 30 minutes
- **Testing:** Test on iOS 14.5, verify fallback works

**Task 6.7: Add Error Logging**
```javascript
// Wrap all async operations in try/catch
try {
  // ... operation ...
} catch (error) {
  console.error('[MOBILE] Operation failed:', error);
  // Handle error appropriately
}

// Add to window.onerror (optional)
window.onerror = (msg, url, lineNo, columnNo, error) => {
  console.error('[MOBILE] Uncaught error:', { msg, url, lineNo, columnNo, error });
  return false;
};

// Add to window.onunhandledrejection
window.onunhandledrejection = (event) => {
  console.error('[MOBILE] Unhandled promise rejection:', event.reason);
};
```
- **Complexity:** Low
- **Time:** 1 hour
- **Testing:** Force various errors, verify all logged

#### 4.6.5 System Components Affected

- `src/mobile/MobileAvatarWidget.jsx` - Error handling
- `src/mobile/MobileLandingPage.jsx` - Audio unlock error handling
- Browser console - Error logging

#### 4.6.6 Dependencies & Prerequisites

- Epic 2 and 3 complete
- All error scenarios identifiable

#### 4.6.7 Success Metrics

- Error recovery rate: >80% (users successfully retry)
- Unhandled errors: 0
- Error visibility: 100% (all errors shown to user)
- Desktop stability: 100% (no regressions)

---

### Epic 7: Testing, Optimization & Launch
**Priority:** P0 (Blocking)
**Estimated Effort:** 3-4 days
**Dependencies:** All previous epics complete

#### 4.7.1 Technical Scope

Comprehensive testing on real devices, performance optimization, and production deployment.

#### 4.7.2 User Stories

- **US-7.1:** As a mobile user, app works on my iPhone
- **US-7.2:** As a mobile user, app works on my Android phone
- **US-7.3:** As a mobile user, app loads quickly
- **US-7.4:** As a desktop user, nothing has changed (zero regression)

#### 4.7.3 Acceptance Criteria

- [ ] All features tested on iOS Safari 15.4+
- [ ] All features tested on Android Chrome 108+
- [ ] All features tested on iOS 14.5 (fallback)
- [ ] All features tested on Android Chrome 90 (fallback)
- [ ] Desktop regression tested (all features work)
- [ ] Bundle size optimized (<500KB for mobile)
- [ ] Initial load time <3s on 3G
- [ ] All test cases from PRD Step 6 passed

#### 4.7.4 Technical Tasks

**Task 7.1: iOS Safari Testing**

**Test Devices:**
- iPhone 13+ (iOS 15.4+) - Primary target
- iPhone 11 (iOS 14.5) - Fallback test

**Test Cases:**
- [ ] Audio unlock success
- [ ] Session connects successfully
- [ ] Avatar video displays
- [ ] Avatar audio plays
- [ ] Microphone auto-enables
- [ ] Mic toggle works
- [ ] Speaker toggle works
- [ ] Demo video plays
- [ ] Demo PiP works
- [ ] Calendly opens
- [ ] Calendly PiP works
- [ ] Disconnect works
- [ ] Reconnect works (fresh state)
- [ ] Network switch (WiFi → Cellular)
- [ ] Background → Foreground
- [ ] Silent mode detection
- [ ] 100dvh works / fallback works
- [ ] No memory leaks (test 10 sessions)

**Complexity:** High
**Time:** 1 day

**Task 7.2: Android Chrome Testing**

**Test Devices:**
- Samsung Galaxy S21+ (Chrome 108+) - Primary target
- Budget phone with 2GB RAM (Chrome 90) - Fallback test

**Test Cases:**
- Same as iOS testing
- [ ] Battery saver mode
- [ ] Low memory handling

**Complexity:** High
**Time:** 1 day

**Task 7.3: Desktop Regression Testing**

**Test Browsers:**
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

**Test Cases:**
- [ ] HomePage unchanged
- [ ] AIChatWidget unchanged
- [ ] All desktop features work
- [ ] No console errors
- [ ] Bundle size not significantly increased

**Complexity:** Medium
**Time:** 4 hours

**Task 7.4: Performance Optimization**

**Bundle Size Analysis:**
```bash
# Analyze bundle
npm run build
npx source-map-explorer 'dist/assets/*.js'

# Check mobile bundle size
ls -lh dist/assets/ | grep mobile
```

**Optimizations:**
- Ensure code splitting works (React.lazy)
- Verify tree shaking removes unused code
- Minimize mobile bundle (<500KB)
- Check for duplicate dependencies

**Complexity:** Medium
**Time:** 4 hours

**Task 7.5: Network Performance Testing**

**Test Conditions:**
- 4G LTE - Expected: <3s load
- 3G - Expected: <5s load
- 2G - Expected: Degrades gracefully

**Tools:**
- Chrome DevTools Network throttling
- Lighthouse Mobile audit

**Metrics:**
- First Contentful Paint: <1.5s
- Time to Interactive: <3s
- Total Bundle Size: <500KB

**Complexity:** Medium
**Time:** 3 hours

**Task 7.6: Error Scenario Testing**

**Test Cases:**
- [ ] HeyGen API down → Error UI shows
- [ ] LiveKit connection fails → Error UI shows
- [ ] Network drops mid-session → Reconnection overlay
- [ ] Mic permission denied → Warning banner
- [ ] Audio unlock fails → Error with retry
- [ ] Demo video fails to load → Falls back gracefully
- [ ] Calendly iframe fails → No crash
- [ ] Rapid connect/disconnect → No leaks
- [ ] 30s connection timeout → Error UI

**Complexity:** High
**Time:** 4 hours

**Task 7.7: Accessibility Testing**

**Basic Tests:**
- [ ] Touch targets >44px
- [ ] Color contrast meets WCAG AA
- [ ] Buttons have visible focus states
- [ ] Text is readable (min 14px)

**Complexity:** Low
**Time:** 2 hours

**Task 7.8: Documentation**

- [ ] Update README with mobile notes
- [ ] Document known limitations
- [ ] Document browser requirements
- [ ] Document testing procedures

**Complexity:** Low
**Time:** 2 hours

#### 4.7.5 System Components Affected

- All mobile components - Testing
- Build configuration - Optimization
- Documentation - Updates

#### 4.7.6 Dependencies & Prerequisites

- All previous epics complete
- Test devices available
- Production-like environment for testing

#### 4.7.7 Success Metrics

- Test pass rate: 100%
- Desktop regression: 0 issues
- Mobile bundle size: <500KB
- Load time (3G): <5s
- User satisfaction: >4/5 (if beta testing)

---

## 5. Production Concerns

### 5.1 Scalability

#### 5.1.1 Client-Side Performance

**Concern:** Mobile devices have limited CPU/memory compared to desktop.

**Mitigation:**
- Code splitting (React.lazy) reduces initial bundle
- Comprehensive cleanup prevents memory leaks
- No heavy animations on mobile (removed LightRays, RadarScanner)
- Single video stream (no adaptive streaming complexity)

**Monitoring:**
- Track bundle size in CI/CD (<500KB threshold)
- Monitor memory usage in production (if possible)
- Track session duration (detect memory issues indirectly)

#### 5.1.2 Network Performance

**Concern:** Mobile networks are highly variable (2G to 5G).

**Mitigation:**
- 30-second connection timeout
- Reconnection overlay for network switches
- Error UI with retry for failed connections
- HeyGen controls video quality (no client-side adaptation needed)

**Monitoring:**
- Track connection success rate by network type
- Track reconnection frequency
- Track average session start time

#### 5.1.3 Server-Side Capacity

**Concern:** Mobile users may increase HeyGen API usage.

**Mitigation:**
- Same HeyGen session limits as desktop
- Aggressive cleanup prevents quota waste
- Session timeout after inactivity (future)

**Monitoring:**
- Track HeyGen API usage (mobile vs desktop)
- Monitor session duration distribution
- Alert on quota approaching limits

### 5.2 Monitoring & Observability

#### 5.2.1 Metrics to Track

**Critical Metrics:**
| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| Audio Unlock Success Rate | >95% | <90% |
| Session Start Success Rate | >90% | <85% |
| Session Completion Rate | >70% | <60% |
| Connection Timeout Rate | <10% | >15% |
| Demo Video Play Rate | >80% | <70% |
| Calendly Open Rate | >5% | <3% |
| Error Rate (all types) | <5% | >10% |

**Performance Metrics:**
| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| Page Load Time (3G) | <5s | >7s |
| Time to Interactive | <3s | >5s |
| Bundle Size (mobile) | <500KB | >600KB |
| Session Start Time | <5s | >8s |

#### 5.2.2 Logging Strategy

**Client-Side Logging:**
```javascript
// Structured logging with categories
const logEvent = (category, event, data) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    category,
    event,
    data,
    userAgent: navigator.userAgent,
    platform: 'mobile',
  };

  console.log(JSON.stringify(logEntry));

  // Send to analytics service (optional)
  if (window.analytics) {
    window.analytics.track(event, logEntry);
  }
};

// Usage:
logEvent('SESSION', 'session_started', { sessionId: data.sessionId });
logEvent('ERROR', 'connection_timeout', { duration: 30000 });
logEvent('DEMO', 'demo_triggered', { videoUrl: trigger.videoUrl });
```

**Log Categories:**
- `SESSION` - Session lifecycle events
- `AUDIO` - Audio unlock, track attachment
- `VIDEO` - Video track attachment, display
- `MIC` - Microphone enable/disable, permission
- `DEMO` - Demo video triggers, playback
- `CALENDLY` - Intent detection, opens, closes
- `ERROR` - All error conditions
- `PERFORMANCE` - Timing metrics

#### 5.2.3 Error Tracking

**Error Categorization:**
- **Fatal Errors:** Session fails to start (HeyGen API down, LiveKit unreachable)
- **Recoverable Errors:** Network switch, connection timeout (with retry)
- **Warning Errors:** Mic permission denied, audio unlock failed (with guidance)
- **Info Errors:** Demo video load failed (graceful fallback)

**Error Alerting:**
- Fatal error rate >5% in 5 minutes → Page team immediately
- Recoverable error rate >15% in 10 minutes → Investigate
- Warning error rate >20% in 15 minutes → Monitor closely

#### 5.2.4 Analytics Events

**User Journey Events:**
```javascript
// Landing
analytics.track('mobile_landing_page_view');

// Session
analytics.track('talk_to_agent_clicked');
analytics.track('audio_unlock_success');
analytics.track('audio_unlock_failed', { reason });
analytics.track('session_started', { sessionId, startTime });
analytics.track('session_connected', { duration });

// Interaction
analytics.track('microphone_toggled', { state: 'on' | 'off' });
analytics.track('speaker_toggled', { state: 'on' | 'off' });

// Demo Video
analytics.track('demo_intent_detected', { keywords });
analytics.track('demo_video_started', { videoUrl, triggerId });
analytics.track('demo_video_stopped', { duration, completion });

// Calendly
analytics.track('calendly_intent_detected', { keywords });
analytics.track('calendly_opened');
analytics.track('calendly_closed', { duration });

// Session End
analytics.track('session_disconnected', { duration, reason });
```

**Conversion Funnel:**
```
Landing Page View
    ↓ (~60%)
Talk to Agent Clicked
    ↓ (~90%)
Audio Unlock Success
    ↓ (~85%)
Session Connected
    ↓ (~70%)
Session Completed (>30s)
    ↓ (~10%)
Demo Video Watched
    ↓ (~5%)
Calendly Opened
    ↓ (~50%)
Meeting Booked
```

### 5.3 Security Considerations

#### 5.3.1 Client-Side Security

**Concerns:**
- Microphone/camera permissions
- XSS in iframe (Calendly)
- Data exposure in console logs

**Mitigations:**
- Explicit permission requests with user guidance
- Calendly iframe sandboxed (default browser behavior)
- No sensitive data logged (session tokens not logged)
- All API calls use HTTPS

**Best Practices:**
- No API keys in client code
- No PII logged to console
- All external resources (Calendly, GCS) use HTTPS

#### 5.3.2 Privacy Considerations

**Concerns:**
- User audio/video transmitted to HeyGen
- Calendly tracking pixels
- Analytics tracking

**Mitigations:**
- Clear privacy policy (not in scope of this PRD)
- User consent for mic/camera (browser-level)
- Calendly privacy policy linked
- Analytics opt-out capability (future)

#### 5.3.3 Compliance

**GDPR/CCPA:**
- Not implemented in MVP (future requirement)
- Would need: Cookie banner, consent management, data deletion

**COPPA:**
- Not applicable (B2B product, not targeting children)

### 5.4 Disaster Recovery

#### 5.4.1 Rollback Strategy

**If mobile deployment fails:**

1. **Immediate Rollback (< 5 minutes):**
   - Remove mobile routing from App.js
   - Redeploy previous version
   - Mobile users see desktop version (may not work perfectly)

2. **Partial Rollback (< 30 minutes):**
   - Fix critical bug
   - Redeploy with fix
   - Monitor metrics

3. **Full Rollback (< 1 hour):**
   - Revert all mobile code
   - Remove mobile folder
   - Restore to pre-mobile state

**Rollback Triggers:**
- Desktop error rate >1% (zero tolerance for desktop regression)
- Mobile fatal error rate >20%
- Page load time >10s
- User complaints >10 in first hour

#### 5.4.2 Incident Response

**Severity Levels:**

**P0 (Critical):**
- Desktop broken (immediate rollback)
- Mobile completely broken (>50% error rate)
- Response time: <5 minutes

**P1 (High):**
- Mobile majorly degraded (20-50% error rate)
- Specific feature broken (demo video, Calendly)
- Response time: <30 minutes

**P2 (Medium):**
- Minor mobile issues (5-20% error rate)
- UX degradation
- Response time: <2 hours

**P3 (Low):**
- Edge case bugs
- Performance issues
- Response time: <1 day

#### 5.4.3 Data Backup

**State Management:**
- No persistent state (all in-memory)
- No data to back up
- Sessions are ephemeral

**Configuration:**
- Config files in git (video-triggers.json, booking-config.json)
- Easy to restore from git

---

## 6. Quality Assurance

### 6.1 Testing Strategy

#### 6.1.1 Test Levels

**Unit Testing:**
- Scope: Individual functions (isMobileDevice, checkForDemoTrigger, etc.)
- Coverage: >80% for utility functions
- Tools: Jest, React Testing Library

**Integration Testing:**
- Scope: Component interactions (MobileLandingPage + MobileAvatarWidget)
- Coverage: All user flows (session start, demo video, Calendly)
- Tools: Jest, React Testing Library, MSW (for API mocking)

**End-to-End Testing:**
- Scope: Full user journey on real browsers
- Coverage: Critical paths (session start, demo, Calendly, disconnect)
- Tools: Playwright, real devices

**Manual Testing:**
- Scope: Real device testing (iOS, Android)
- Coverage: All features, all error scenarios
- Tools: Physical devices, BrowserStack

#### 6.1.2 Test Cases (from PRD Step 6)

**Audio & Connection:**
- [ ] Audio unlock success (iOS Safari, Android Chrome)
- [ ] Audio unlock failure → Error UI → Retry works
- [ ] Connection timeout (30s) → Error UI → Retry works
- [ ] Network switch (WiFi → Cellular) → Reconnection overlay
- [ ] Background → Foreground → Audio resumes
- [ ] Microphone permission denied → Warning banner
- [ ] Rapid clicking → Debounce prevents multiple sessions

**Session Lifecycle:**
- [ ] Session starts successfully
- [ ] Avatar video displays
- [ ] Avatar audio plays
- [ ] Microphone auto-enables (1500ms)
- [ ] Mic toggle works
- [ ] Speaker toggle works
- [ ] Disconnect works
- [ ] Reconnect creates fresh instance (session key)

**Demo Video:**
- [ ] Demo intent detected ("show me a rendering demo for nvidia")
- [ ] Demo video plays fullscreen
- [ ] Avatar appears in PiP
- [ ] Stop button works
- [ ] Video ends naturally (onEnded)
- [ ] Returns to conversation
- [ ] All 5 triggers work (Nvidia, Microsoft, Apple, Google, Generic)

**Calendly:**
- [ ] Calendly intent detected ("schedule a meeting")
- [ ] Calendly waits for avatar to finish speaking
- [ ] Calendly iframe opens
- [ ] Avatar appears in PiP
- [ ] Close button works
- [ ] Previous state restored

**Browser Compatibility:**
- [ ] iOS Safari 15.4+ → 100dvh works
- [ ] iOS Safari 14.5 → 100vh fallback works
- [ ] Android Chrome 108+ → 100dvh works
- [ ] Android Chrome 90 → 100vh fallback works

**Desktop Regression:**
- [ ] Desktop HomePage works
- [ ] Desktop AIChatWidget works
- [ ] No console errors
- [ ] Bundle size acceptable

#### 6.1.3 Performance Testing

**Load Time Testing:**
```javascript
// Measure page load time
performance.mark('mobile-page-start');

// After page fully loaded:
performance.mark('mobile-page-end');
performance.measure('mobile-page-load', 'mobile-page-start', 'mobile-page-end');

const loadTime = performance.getEntriesByName('mobile-page-load')[0].duration;
console.log('Page load time:', loadTime);
```

**Targets:**
- 4G LTE: <2s
- 3G: <5s
- 2G: <10s (degraded but functional)

**Memory Testing:**
```javascript
// Check memory usage (Chrome only)
if (performance.memory) {
  console.log('Used memory:', performance.memory.usedJSHeapSize / 1024 / 1024, 'MB');
  console.log('Total memory:', performance.memory.totalJSHeapSize / 1024 / 1024, 'MB');
}
```

**Target:** <100MB for 10-minute session

**Network Testing:**
- Throttle network in Chrome DevTools
- Test all features on 3G, 4G
- Verify error handling on network loss

### 6.2 Acceptance Criteria (Definition of Done)

**For Each Epic:**
- [ ] All technical tasks completed
- [ ] All acceptance criteria met
- [ ] Code reviewed (if team workflow requires)
- [ ] Manual testing on iOS and Android passed
- [ ] Desktop regression testing passed
- [ ] No console errors or warnings
- [ ] Performance metrics within targets
- [ ] Documentation updated

**For Overall Project:**
- [ ] All 7 epics completed
- [ ] All PRD requirements implemented
- [ ] All 150+ desktop features analyzed and ported/excluded appropriately
- [ ] 100% feature parity for in-scope features
- [ ] Zero desktop regressions
- [ ] Production readiness checklist completed
- [ ] Deployment plan approved

---

## 7. Deployment Strategy

### 7.1 Deployment Phases

#### Phase 1: Development Environment
- Deploy to dev environment
- Test all features
- Fix bugs
- **Duration:** Throughout development (16-22 days)

#### Phase 2: Staging Environment
- Deploy to staging (production-like environment)
- Full regression testing (desktop + mobile)
- Performance testing
- Security scan
- **Duration:** 2 days

#### Phase 3: Production Canary
- Deploy to 5% of mobile users
- Monitor error rates, performance
- Collect user feedback
- **Duration:** 1-2 days

#### Phase 4: Production Full Rollout
- If canary successful (error rate <5%, no critical bugs)
- Deploy to 100% of mobile users
- Monitor for 48 hours
- **Duration:** 2 days

### 7.2 Deployment Checklist

**Pre-Deployment:**
- [ ] All epics completed
- [ ] All tests passed (unit, integration, E2E)
- [ ] Manual testing on real devices passed
- [ ] Desktop regression testing passed
- [ ] Performance benchmarks met
- [ ] Security scan passed (if applicable)
- [ ] Code review completed (if applicable)
- [ ] Documentation updated
- [ ] Rollback plan ready

**Deployment:**
- [ ] Build production bundle (`npm run build`)
- [ ] Verify bundle size (<500KB for mobile)
- [ ] Deploy to CDN/hosting
- [ ] Verify mobile detection works
- [ ] Verify desktop still works
- [ ] Smoke test on iOS Safari
- [ ] Smoke test on Android Chrome

**Post-Deployment:**
- [ ] Monitor error rates (target: <5%)
- [ ] Monitor session start success rate (target: >90%)
- [ ] Monitor audio unlock success rate (target: >95%)
- [ ] Monitor page load time (target: <5s on 3G)
- [ ] Collect user feedback
- [ ] Document any issues

### 7.3 Feature Flags (Optional)

**If feature flags are available:**

```javascript
// Enable mobile for specific users
const MOBILE_ENABLED_USERS = ['user@example.com'];

function shouldShowMobile() {
  if (featureFlags.mobileEnabled === 'all') return isMobileDevice();
  if (featureFlags.mobileEnabled === 'canary') {
    return isMobileDevice() && Math.random() < 0.05; // 5% canary
  }
  if (featureFlags.mobileEnabled === 'users') {
    return isMobileDevice() && MOBILE_ENABLED_USERS.includes(user.email);
  }
  return false; // Disabled
}
```

**Benefits:**
- Gradual rollout
- Easy rollback (toggle flag)
- A/B testing capability

---

## 8. Monitoring & Analytics

### 8.1 Real User Monitoring (RUM)

**Tools:** Google Analytics, Mixpanel, Amplitude, or custom solution

**Events to Track:**

```javascript
// Page Views
analytics.page('Mobile Landing Page');

// Button Clicks
analytics.track('Talk to Agent Clicked', {
  platform: 'mobile',
  device: 'iOS' | 'Android',
});

// Session Events
analytics.track('Session Started', {
  sessionId: string,
  audioUnlockTime: number, // ms
  connectionTime: number, // ms
});

analytics.track('Session Connected', {
  sessionId: string,
  totalStartTime: number, // ms from button click to connected
});

analytics.track('Session Ended', {
  sessionId: string,
  duration: number, // seconds
  reason: 'user_disconnect' | 'error' | 'timeout',
});

// Demo Video Events
analytics.track('Demo Triggered', {
  keywords: string[],
  triggerId: string,
});

analytics.track('Demo Started', {
  videoUrl: string,
  triggerId: string,
});

analytics.track('Demo Stopped', {
  triggerId: string,
  duration: number, // seconds
  completed: boolean,
});

// Calendly Events
analytics.track('Calendly Intent Detected', {
  keywords: string[],
});

analytics.track('Calendly Opened', {
  sessionId: string,
});

analytics.track('Calendly Closed', {
  sessionId: string,
  duration: number, // seconds
});

// Error Events
analytics.track('Error Occurred', {
  category: 'audio_unlock' | 'connection' | 'permission' | 'other',
  errorMessage: string,
  errorCode: string,
});
```

### 8.2 Error Monitoring

**Tools:** Sentry, LogRocket, Bugsnag, or custom solution

**Error Categories:**

```javascript
// Setup Sentry (example)
Sentry.init({
  dsn: 'YOUR_SENTRY_DSN',
  environment: 'production',
  beforeSend(event) {
    // Filter sensitive data
    if (event.request) {
      delete event.request.cookies;
    }
    return event;
  },
});

// Tag errors by platform
Sentry.setTag('platform', isMobileDevice() ? 'mobile' : 'desktop');
Sentry.setTag('device', 'iOS' | 'Android');

// Capture errors
try {
  await startLiveSession();
} catch (error) {
  Sentry.captureException(error, {
    tags: {
      category: 'session_start',
      severity: 'critical',
    },
    extra: {
      sessionInfo: sessionInfo,
    },
  });
  throw error;
}
```

### 8.3 Performance Monitoring

**Metrics to Track:**

```javascript
// Core Web Vitals
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (entry.entryType === 'largest-contentful-paint') {
      analytics.track('LCP', { value: entry.startTime });
    }
    if (entry.entryType === 'first-input') {
      analytics.track('FID', { value: entry.processingStart - entry.startTime });
    }
    if (entry.entryType === 'layout-shift') {
      analytics.track('CLS', { value: entry.value });
    }
  }
});

observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });

// Custom Metrics
performance.mark('session-start');
// ... session starts ...
performance.mark('session-connected');
performance.measure('session-connection-time', 'session-start', 'session-connected');

const measure = performance.getEntriesByName('session-connection-time')[0];
analytics.track('Session Connection Time', { duration: measure.duration });
```

**Targets:**
- LCP (Largest Contentful Paint): <2.5s
- FID (First Input Delay): <100ms
- CLS (Cumulative Layout Shift): <0.1

### 8.4 Business Metrics Dashboard

**Daily Metrics:**
- Mobile users (count, % of total)
- Session starts (count, success rate)
- Audio unlock success rate
- Average session duration
- Demo video plays (count, by trigger type)
- Calendly opens (count, conversion rate)
- Error rate (by category)

**Weekly Metrics:**
- New vs returning mobile users
- Drop-off points in funnel
- Most triggered demos
- Calendly conversion funnel
- Browser/device distribution

**Monthly Metrics:**
- Growth trends (mobile usage over time)
- Feature adoption (demo videos, Calendly)
- User retention (returning users)
- Performance trends

---

## 9. Appendix

### 9.1 Glossary

| Term | Definition |
|------|------------|
| **Audio Unlock** | Process of enabling audio playback on mobile browsers (requires user gesture) |
| **HeyGen** | AI avatar API service that generates video avatars |
| **LiveKit** | WebRTC SDK for real-time audio/video streaming |
| **PiP** | Picture-in-Picture, small video window showing avatar during demo/Calendly |
| **Session Key Pattern** | React pattern using key prop to force component remount |
| **Race Condition** | Timing bug where tracks arrive before event listeners registered |
| **Demo Trigger** | Keywords that trigger demo video playback |
| **Intent Detection** | Keyword matching to detect user/avatar intent (demo, Calendly) |
| **Calendly** | Meeting scheduling service (cal.com) |
| **100dvh** | CSS unit for dynamic viewport height (handles mobile address bar) |

### 9.2 File Reference Map

| PRD Section | Technical Spec Epic | File Affected |
|-------------|---------------------|---------------|
| Section 5.1 | Epic 1 | src/mobile/utils/utils.js |
| Section 5.2 | Epic 1 | src/App.js |
| Section 6 | Epic 3 | src/mobile/MobileLandingPage.jsx |
| Section 6.5 | Epic 4 | src/mobile/hooks/useDemoVideo.js |
| Section 6.6 | Epic 5 | src/mobile/config/booking-config.json |
| Section 7 | Epic 2, 3, 6 | src/mobile/MobileAvatarWidget.jsx |
| Section 8 | All Epics | Implementation steps |

### 9.3 API Reference

#### HeyGen API

**Create Session:**
```javascript
POST /api/liveavatar/create-session
Body: { userId: "widget-user" }
Response: {
  data: {
    sessionId: string,
    sessionToken: string,
    livekitUrl: string,
    livekitClientToken: string
  }
}
```

**Stop Session:**
```javascript
POST /api/liveavatar/stop-session
Body: { sessionId: string, sessionToken: string }
Response: { success: boolean }
```

#### LiveKit SDK

**Room Connection:**
```javascript
import { Room, RoomEvent } from 'livekit-client';

const room = new Room({
  adaptiveStream: false,
  dynacast: false,
});

await room.connect(livekitUrl, livekitClientToken);
```

**Events:**
- `RoomEvent.TrackSubscribed` - Audio/video track arrives
- `RoomEvent.TrackUnsubscribed` - Track removed
- `RoomEvent.DataReceived` - Data channel message (transcripts)
- `RoomEvent.Reconnecting` - Network issue, reconnecting
- `RoomEvent.Reconnected` - Reconnection successful
- `RoomEvent.Disconnected` - Disconnected from room
- `RoomEvent.ParticipantAttributesChanged` - Avatar state changes

### 9.4 Troubleshooting Guide

#### Audio Unlock Fails

**Symptoms:** No audio plays, error UI shows

**Causes:**
- Silent mode on (iOS)
- Audio permissions denied
- iOS security policy changed

**Debug Steps:**
1. Check `audioUnlocked` flag
2. Check AudioContext.state
3. Try manual play in console
4. Check browser console for errors

**Fix:**
- Guide user to disable silent mode
- Show retry button
- Update audio unlock strategy if iOS policy changed

#### Silent Avatar Bug

**Symptoms:** Video works, no audio

**Causes:**
- Race condition (tracks arrived before listeners)
- Audio element not attached
- Audio muted by browser

**Debug Steps:**
1. Check `remoteAudioRef.current` exists
2. Check audio element in DOM
3. Check audio element muted property
4. Check LiveKit track subscription events

**Fix:**
- Existing tracks race condition fix (1000ms check)
- Verify attachAudioTrack called
- Verify audio element has src

#### Connection Timeout

**Symptoms:** Stuck on "Connecting..." for 30s, then error

**Causes:**
- HeyGen API down
- LiveKit unreachable
- Firewall blocking WebRTC
- Network too slow

**Debug Steps:**
1. Check HeyGen API response in Network tab
2. Check LiveKit connection in console
3. Test network speed
4. Check WebRTC blocked by firewall

**Fix:**
- Retry with error UI
- Check backend services
- Configure TURN servers for firewall bypass

#### Memory Leak

**Symptoms:** App slows down after multiple sessions

**Causes:**
- Tracks not stopped
- Audio element not removed
- Event listeners not removed
- Room not disconnected

**Debug Steps:**
1. Check cleanup code runs on unmount
2. Use Chrome DevTools Memory profiler
3. Test multiple connect/disconnect cycles
4. Check for dangling references

**Fix:**
- Verify all cleanup code in useEffect return
- Ensure refs set to null
- Ensure room.disconnect() called

### 9.5 Code Review Checklist

**Before Merging:**

**Functionality:**
- [ ] All acceptance criteria met
- [ ] Desktop functionality unchanged (zero regression)
- [ ] All test cases passed
- [ ] Error handling comprehensive
- [ ] Mobile detection works correctly

**Code Quality:**
- [ ] No console.log (use proper logging)
- [ ] No hardcoded values (use config files)
- [ ] No magic numbers (use named constants)
- [ ] Comments explain "why" not "what"
- [ ] Functions <50 lines (extract if longer)

**Performance:**
- [ ] No unnecessary re-renders
- [ ] Cleanup code comprehensive
- [ ] No memory leaks (tested with 10 sessions)
- [ ] Bundle size acceptable (<500KB)
- [ ] Code splitting works

**Security:**
- [ ] No API keys in code
- [ ] No PII logged
- [ ] All external resources use HTTPS
- [ ] No XSS vulnerabilities

**Testing:**
- [ ] Unit tests for utilities
- [ ] Integration tests for components
- [ ] Manual testing on iOS Safari
- [ ] Manual testing on Android Chrome
- [ ] Desktop regression testing

### 9.6 Launch Checklist

**1 Week Before Launch:**
- [ ] All epics completed
- [ ] All tests passed
- [ ] Performance benchmarks met
- [ ] Documentation complete
- [ ] Staging environment tested
- [ ] Rollback plan ready

**1 Day Before Launch:**
- [ ] Final regression testing
- [ ] Production build tested
- [ ] Monitoring dashboards ready
- [ ] Team notified of launch
- [ ] Support team briefed

**Launch Day:**
- [ ] Deploy to production
- [ ] Smoke test iOS Safari
- [ ] Smoke test Android Chrome
- [ ] Smoke test desktop (regression)
- [ ] Monitor error rates (first hour)
- [ ] Monitor performance metrics
- [ ] Check analytics events firing

**Post-Launch:**
- [ ] Monitor for 48 hours
- [ ] Collect user feedback
- [ ] Document issues
- [ ] Plan iteration based on feedback

---

## Document Control

**Version History:**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-12-04 | Claude | Initial production-ready specification |

**Approvals:**

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Tech Lead | | | |
| Product Owner | | | |
| QA Lead | | | |

**Distribution:**

- Development Team
- QA Team
- Product Team
- DevOps Team

---

**END OF TECHNICAL SPECIFICATION**
