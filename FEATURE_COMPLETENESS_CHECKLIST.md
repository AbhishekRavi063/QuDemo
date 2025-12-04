# Feature Completeness Checklist

This document maps every feature from the source files to mobile implementation requirements.

---

## AIChatWidget.jsx Features

### Core Session Management

- ✅ **LiveKit Room Connection**
  - 📍 Location: Lines 444-581 (startLiveSession)
  - 🎯 Relevant for mobile: **Yes** - Core functionality
  - 📋 Status in PRD: **CRITICAL** - Must be implemented
  - 📄 PRD Section: Session lifecycle
  - ⚠️ Notes: Mobile needs same WebRTC connection flow

- ✅ **HeyGen Session Creation**
  - 📍 Location: Lines 456-479 (API call in startLiveSession)
  - 🎯 Relevant for mobile: **Yes** - Core functionality
  - 📋 Status in PRD: **CRITICAL** - Must be implemented
  - 📄 PRD Section: Backend API integration
  - ⚠️ Notes: Same API endpoint, mobile-friendly error handling needed

- ✅ **HeyGen Session Termination**
  - 📍 Location: Lines 355-400 (stopSession)
  - 🎯 Relevant for mobile: **Yes** - Prevents quota waste
  - 📋 Status in PRD: **CRITICAL** - Must be implemented
  - 📄 PRD Section: Session cleanup
  - ⚠️ Notes: Important for mobile background/foreground transitions

- ✅ **Component Unmount Cleanup**
  - 📍 Location: Lines 283-299 (useEffect cleanup)
  - 🎯 Relevant for mobile: **Yes** - Memory management
  - 📋 Status in PRD: **CRITICAL** - Must be implemented
  - 📄 PRD Section: Lifecycle management
  - ⚠️ Notes: Mobile needs additional handling for app backgrounding

- ✅ **Auto-expand Session Start**
  - 📍 Location: Lines 272-281 (autoExpand useEffect)
  - 🎯 Relevant for mobile: **Yes** - Direct launch UX
  - 📋 Status in PRD: **CRITICAL** - Primary mobile entry point
  - 📄 PRD Section: Mobile launch flow
  - ⚠️ Notes: ExtendedAvatarPage pattern is ideal for mobile

---

### Audio/Video Track Management

- ✅ **Video Track Attachment**
  - 📍 Location: Lines 587-617 (attachTrackToDom)
  - 🎯 Relevant for mobile: **Yes** - Core video display
  - 📋 Status in PRD: **CRITICAL** - Must be implemented
  - 📄 PRD Section: Video rendering
  - ⚠️ Notes: Mobile needs native video view (not DOM manipulation)

- ✅ **Video Track Detachment**
  - 📍 Location: Lines 623-625 (detachTrackFromDom)
  - 🎯 Relevant for mobile: **Yes** - Memory management
  - 📋 Status in PRD: **CRITICAL** - Must be implemented
  - 📄 PRD Section: Resource cleanup
  - ⚠️ Notes: Mobile needs proper track disposal

- ✅ **Audio Track Attachment**
  - 📍 Location: Lines 631-650 (attachAudioTrack)
  - 🎯 Relevant for mobile: **Yes** - Avatar audio output
  - 📋 Status in PRD: **CRITICAL** - Must be implemented
  - 📄 PRD Section: Audio playback
  - ⚠️ Notes: Mobile uses native audio APIs, not <audio> element

- ✅ **Audio Track Detachment**
  - 📍 Location: Lines 656-664 (detachAudioTrack)
  - 🎯 Relevant for mobile: **Yes** - Resource cleanup
  - 📋 Status in PRD: **CRITICAL** - Must be implemented
  - 📄 PRD Section: Audio cleanup
  - ⚠️ Notes: Mobile needs proper audio session management

- ✅ **Track Subscription Handling**
  - 📍 Location: Lines 509-534 (TrackSubscribed/Unsubscribed events)
  - 🎯 Relevant for mobile: **Yes** - Core functionality
  - 📋 Status in PRD: **CRITICAL** - Must be implemented
  - 📄 PRD Section: LiveKit event handling
  - ⚠️ Notes: Mobile needs same event flow

- ✅ **Existing Tracks Check**
  - 📍 Location: Lines 538-551 (1000ms delay check)
  - 🎯 Relevant for mobile: **Yes** - Race condition handling
  - 📋 Status in PRD: **CRITICAL** - Must be implemented
  - 📄 PRD Section: Connection reliability
  - ⚠️ Notes: Same timing needed for mobile

---

### Microphone (User Input)

- ✅ **Auto-enable Microphone on Start**
  - 📍 Location: Lines 556-574 (1500ms delay in startLiveSession)
  - 🎯 Relevant for mobile: **Yes** - Voice-first UX
  - 📋 Status in PRD: **CRITICAL** - Must be implemented
  - 📄 PRD Section: Initial mic activation
  - ⚠️ Notes: Mobile needs permission handling first

- ✅ **Toggle Microphone**
  - 📍 Location: Lines 681-708 (toggleMicrophone)
  - 🎯 Relevant for mobile: **Yes** - User control
  - 📋 Status in PRD: **CRITICAL** - Must be implemented
  - 📄 PRD Section: Mic mute/unmute
  - ⚠️ Notes: Mobile needs mic button UI

- ✅ **Publish Local Audio**
  - 📍 Location: Lines 714-737 (publishLocalAudio)
  - 🎯 Relevant for mobile: **Yes** - Audio publishing
  - 📋 Status in PRD: **CRITICAL** - Must be implemented
  - 📄 PRD Section: Audio track creation
  - ⚠️ Notes: Mobile uses platform-specific audio APIs

- ✅ **Audio Processing (Echo Cancellation, Noise Suppression, Auto Gain)**
  - 📍 Location: Lines 560-564, 695-698, 723-727
  - 🎯 Relevant for mobile: **Yes** - Audio quality
  - 📋 Status in PRD: **CRITICAL** - Must be implemented
  - 📄 PRD Section: Audio processing
  - ⚠️ Notes: Mobile platforms have native AEC/NS support

- ✅ **Microphone Mute State**
  - 📍 Location: State variable `isMuted` (line 40)
  - 🎯 Relevant for mobile: **Yes** - UI state management
  - 📋 Status in PRD: **CRITICAL** - Must be implemented
  - 📄 PRD Section: State management
  - ⚠️ Notes: Mobile needs persistent state

- ✅ **User Speaking Indicator**
  - 📍 Location: State variable `isUserSpeaking` (line 61), UI lines 1576-1589
  - 🎯 Relevant for mobile: **Yes** - Visual feedback
  - 📋 Status in PRD: **Should Have** - Enhanced UX
  - 📄 PRD Section: Speaking indicators
  - ⚠️ Notes: Mobile can show mic button animation

---

### Speaker (Avatar Audio Output)

- ✅ **Toggle Avatar Audio**
  - 📍 Location: Lines 670-675 (toggleAudio)
  - 🎯 Relevant for mobile: **Yes** - User control
  - 📋 Status in PRD: **CRITICAL** - Must be implemented
  - 📄 PRD Section: Speaker mute/unmute
  - ⚠️ Notes: Mobile needs speaker button UI

- ✅ **Audio Enable State**
  - 📍 Location: State variable `audioEnabled` (line 58)
  - 🎯 Relevant for mobile: **Yes** - UI state management
  - 📋 Status in PRD: **CRITICAL** - Must be implemented
  - 📄 PRD Section: State management
  - ⚠️ Notes: Mobile needs persistent state

- ✅ **Avatar Speaking Indicator**
  - 📍 Location: State variable `isAvatarSpeaking` (line 60), UI lines 1549-1556
  - 🎯 Relevant for mobile: **Yes** - Visual feedback
  - 📋 Status in PRD: **Should Have** - Enhanced UX
  - 📄 PRD Section: Speaking indicators
  - ⚠️ Notes: Mobile can show speaker button animation

---

### Data Channel & Transcripts

- ✅ **Data Channel Message Handling**
  - 📍 Location: Lines 746-831 (DataReceived event)
  - 🎯 Relevant for mobile: **Yes** - Core communication
  - 📋 Status in PRD: **CRITICAL** - Must be implemented
  - 📄 PRD Section: Data channel processing
  - ⚠️ Notes: Same JSON parsing logic for mobile

- ✅ **User Transcript Processing**
  - 📍 Location: Lines 92-107 (handleUserSpeech)
  - 🎯 Relevant for mobile: **Yes** - Speech recognition
  - 📋 Status in PRD: **CRITICAL** - Must be implemented
  - 📄 PRD Section: Transcript handling
  - ⚠️ Notes: Mobile needs same transcript array management

- ✅ **Avatar Transcript Processing**
  - 📍 Location: Lines 113-129 (handleAvatarSpeech)
  - 🎯 Relevant for mobile: **Yes** - Avatar speech tracking
  - 📋 Status in PRD: **CRITICAL** - Must be implemented
  - 📄 PRD Section: Transcript handling
  - ⚠️ Notes: Critical for demo triggers and intent detection

- ✅ **Transcript Array Management (Last 10)**
  - 📍 Location: Lines 96-105, 116-125 (.slice(-10))
  - 🎯 Relevant for mobile: **Yes** - Memory management
  - 📋 Status in PRD: **CRITICAL** - Must be implemented
  - 📄 PRD Section: Memory optimization
  - ⚠️ Notes: Mobile needs efficient array management

- ✅ **Transcript Display Overlay**
  - 📍 Location: Lines 1808-1860 (transcript UI)
  - 🎯 Relevant for mobile: **Maybe** - Debugging feature
  - 📋 Status in PRD: **Could Have** - Optional for production
  - 📄 PRD Section: Debug UI
  - ⚠️ Notes: Useful for development, may hide in production mobile

- ✅ **Send Data to Avatar**
  - 📍 Location: Lines 953-967 (sendDataToAvatar)
  - 🎯 Relevant for mobile: **Maybe** - Quick actions only
  - 📋 Status in PRD: **Could Have** - Not voice-first
  - 📄 PRD Section: Text input (optional)
  - ⚠️ Notes: Mobile is voice-first, may not need quick action buttons

---

### Avatar State Management

- ✅ **Avatar State Tracking (idle/speaking/listening/thinking)**
  - 📍 Location: State variable `avatarState` (line 59), event handling lines 774-779
  - 🎯 Relevant for mobile: **Yes** - Core state management
  - 📋 Status in PRD: **CRITICAL** - Must be implemented
  - 📄 PRD Section: Avatar state
  - ⚠️ Notes: Mobile needs same state values

- ✅ **Participant Attributes Changed Event**
  - 📍 Location: Lines 834-878 (ParticipantAttributesChanged)
  - 🎯 Relevant for mobile: **Yes** - State change detection
  - 📋 Status in PRD: **CRITICAL** - Must be implemented
  - 📄 PRD Section: LiveKit events
  - ⚠️ Notes: Critical for demo trigger timing

- ✅ **Agent State Transition Detection (speaking → listening)**
  - 📍 Location: Lines 842-872 (previousAgentStateRef comparison)
  - 🎯 Relevant for mobile: **Yes** - Demo trigger timing
  - 📋 Status in PRD: **CRITICAL** - Must be implemented
  - 📄 PRD Section: State transitions
  - ⚠️ Notes: Ensures demo plays after avatar finishes speaking

- ✅ **Status Overlay (Speaking/Listening/Thinking/Ready)**
  - 📍 Location: Lines 1519-1591 (live session status UI)
  - 🎯 Relevant for mobile: **Yes** - User feedback
  - 📋 Status in PRD: **Should Have** - Enhanced UX
  - 📄 PRD Section: Status indicators
  - ⚠️ Notes: Mobile needs equivalent UI (badge or overlay)

---

### Demo Video System

- ✅ **Demo Video Triggers Configuration**
  - 📍 Location: video-triggers.json (5 triggers)
  - 🎯 Relevant for mobile: **Yes** - Core feature
  - 📋 Status in PRD: **CRITICAL** - Must be implemented
  - 📄 PRD Section: Demo video configuration
  - ⚠️ Notes: Mobile uses same JSON config

- ✅ **Demo Trigger Detection (checkForDemoTrigger)**
  - 📍 Location: Lines 922-934 (in detectIntent), lines 848-870 (in state change)
  - 🎯 Relevant for mobile: **Yes** - Core feature
  - 📋 Status in PRD: **CRITICAL** - Must be implemented
  - 📄 PRD Section: Keyword matching
  - ⚠️ Notes: Mobile needs same token-based matching algorithm

- ✅ **Play Demo Video**
  - 📍 Location: useDemoVideo.js lines 60-116 (playDemoVideo)
  - 🎯 Relevant for mobile: **Yes** - Core feature
  - 📋 Status in PRD: **CRITICAL** - Must be implemented
  - 📄 PRD Section: Video playback
  - ⚠️ Notes: Mobile uses native video player

- ✅ **Stop Demo Video**
  - 📍 Location: useDemoVideo.js lines 118-154 (stopDemoVideo)
  - 🎯 Relevant for mobile: **Yes** - Core feature
  - 📋 Status in PRD: **CRITICAL** - Must be implemented
  - 📄 PRD Section: Video controls
  - ⚠️ Notes: Mobile needs stop button in player controls

- ✅ **Demo Video State Management**
  - 📍 Location: useDemoVideo.js state `isDemoPlaying`, `currentVideoUrl`
  - 🎯 Relevant for mobile: **Yes** - Core feature
  - 📋 Status in PRD: **CRITICAL** - Must be implemented
  - 📄 PRD Section: State management
  - ⚠️ Notes: Mobile needs same state tracking

- ✅ **Microphone Pause During Demo**
  - 📍 Location: useDemoVideo.js lines 69-73
  - 🎯 Relevant for mobile: **Yes** - User experience
  - 📋 Status in PRD: **CRITICAL** - Must be implemented
  - 📄 PRD Section: Audio management
  - ⚠️ Notes: Prevents interruptions during demo

- ✅ **Avatar Picture-in-Picture During Demo**
  - 📍 Location: Lines 1642-1658 (PIP container), useDemoVideo.js lines 76-106 (clone logic)
  - 🎯 Relevant for mobile: **Yes** - Enhanced UX
  - 📋 Status in PRD: **Should Have** - Premium experience
  - 📄 PRD Section: Picture-in-picture
  - ⚠️ Notes: Mobile native PIP support available on iOS/Android

- ✅ **Demo Playing Indicator**
  - 📍 Location: Lines 1782-1801 (blue banner)
  - 🎯 Relevant for mobile: **Yes** - User feedback
  - 📋 Status in PRD: **Should Have** - Clear status
  - 📄 PRD Section: Status indicators
  - ⚠️ Notes: Mobile can show banner or overlay

- ✅ **Widget State Restoration After Demo**
  - 📍 Location: Lines 141-154 (useEffect), preDemoWidgetStateRef
  - 🎯 Relevant for mobile: **Maybe** - Mobile doesn't resize widget
  - 📋 Status in PRD: **Could Have** - Not applicable to mobile
  - 📄 PRD Section: N/A
  - ⚠️ Notes: Mobile is always fullscreen, no resize needed

- ✅ **Auto-maximize Widget for Demo**
  - 📍 Location: Lines 857-868 (setState maximized before demo)
  - 🎯 Relevant for mobile: **No** - Mobile is always fullscreen
  - 📋 Status in PRD: **Not Applicable**
  - 📄 PRD Section: N/A
  - ⚠️ Notes: Desktop-specific widget resizing

---

### Calendly Integration

- ✅ **Calendly URL Configuration**
  - 📍 Location: booking-config.json
  - 🎯 Relevant for mobile: **Yes** - Core feature
  - 📋 Status in PRD: **CRITICAL** - Must be implemented
  - 📄 PRD Section: Booking configuration
  - ⚠️ Notes: Mobile uses same Calendly URL

- ✅ **Schedule Meeting Intent Detection**
  - 📍 Location: Lines 891-906 (intentActions)
  - 🎯 Relevant for mobile: **Yes** - Voice-triggered booking
  - 📋 Status in PRD: **CRITICAL** - Must be implemented
  - 📄 PRD Section: Intent detection
  - ⚠️ Notes: Mobile needs same keywords

- ✅ **Pending Calendly (Wait for Avatar to Finish)**
  - 📍 Location: Lines 178-193 (useEffect), pendingCalendlyRef
  - 🎯 Relevant for mobile: **Yes** - Polite UX
  - 📋 Status in PRD: **CRITICAL** - Must be implemented
  - 📄 PRD Section: Calendly timing
  - ⚠️ Notes: Same behavior for mobile

- ✅ **Open Calendly Overlay**
  - 📍 Location: Lines 1686-1778 (iframe overlay)
  - 🎯 Relevant for mobile: **Yes** - Core feature
  - 📋 Status in PRD: **CRITICAL** - Must be implemented
  - 📄 PRD Section: Calendly display
  - ⚠️ Notes: Mobile needs native WebView or Safari View Controller

- ✅ **Close Calendly Button**
  - 📍 Location: Lines 1754-1777 (close button)
  - 🎯 Relevant for mobile: **Yes** - User control
  - 📋 Status in PRD: **CRITICAL** - Must be implemented
  - 📄 PRD Section: Calendly controls
  - ⚠️ Notes: Mobile needs back button or close icon

- ✅ **Avatar PIP During Calendly**
  - 📍 Location: Lines 1714-1751 (PIP container), lines 198-221 (clone logic)
  - 🎯 Relevant for mobile: **Yes** - Enhanced UX
  - 📋 Status in PRD: **Should Have** - Premium experience
  - 📄 PRD Section: Picture-in-picture
  - ⚠️ Notes: Mobile native PIP support available

- ✅ **Mute Mic and Avatar During Calendly**
  - 📍 Location: Lines 226-260 (useEffect)
  - 🎯 Relevant for mobile: **Yes** - Prevent interruptions
  - 📋 Status in PRD: **CRITICAL** - Must be implemented
  - 📄 PRD Section: Audio management
  - ⚠️ Notes: Same behavior for mobile

- ✅ **Restore Audio After Calendly Close**
  - 📍 Location: Lines 246-259 (unmute both on close)
  - 🎯 Relevant for mobile: **Yes** - Resume conversation
  - 📋 Status in PRD: **CRITICAL** - Must be implemented
  - 📄 PRD Section: Audio restoration
  - ⚠️ Notes: Same behavior for mobile

- ✅ **Widget State Restoration After Calendly**
  - 📍 Location: Lines 159-173 (useEffect), preCalendlyWidgetStateRef
  - 🎯 Relevant for mobile: **No** - Mobile doesn't resize
  - 📋 Status in PRD: **Not Applicable**
  - 📄 PRD Section: N/A
  - ⚠️ Notes: Desktop-specific widget resizing

- ✅ **Book a Meeting Button**
  - 📍 Location: Lines 1232-1257 (header button)
  - 🎯 Relevant for mobile: **Yes** - Manual trigger
  - 📋 Status in PRD: **Should Have** - Convenient access
  - 📄 PRD Section: UI controls
  - ⚠️ Notes: Mobile needs visible button (top bar or overlay)

---

### Intent Detection System

- ✅ **Intent Actions Array**
  - 📍 Location: Lines 887-907 (intentActions)
  - 🎯 Relevant for mobile: **Yes** - Core feature
  - 📋 Status in PRD: **CRITICAL** - Must be implemented
  - 📄 PRD Section: Intent configuration
  - ⚠️ Notes: Mobile uses same intent definitions

- ✅ **Detect Intent Function**
  - 📍 Location: Lines 913-947 (detectIntent)
  - 🎯 Relevant for mobile: **Yes** - Core feature
  - 📋 Status in PRD: **CRITICAL** - Must be implemented
  - 📄 PRD Section: Intent detection
  - ⚠️ Notes: Same keyword matching logic for mobile

- ✅ **Detected Intents History (Last 5)**
  - 📍 Location: State variable `detectedIntents` (line 63)
  - 🎯 Relevant for mobile: **Maybe** - Debugging feature
  - 📋 Status in PRD: **Could Have** - Optional
  - 📄 PRD Section: Debug data
  - ⚠️ Notes: Useful for development, may not show in production mobile

- ✅ **Demo Triggers Priority (Checked First)**
  - 📍 Location: Lines 920-934 (early return in detectIntent)
  - 🎯 Relevant for mobile: **Yes** - Correct priority
  - 📋 Status in PRD: **CRITICAL** - Must be implemented
  - 📄 PRD Section: Intent priority
  - ⚠️ Notes: Prevents other intents from interrupting demo

---

### Widget Sizing & Positioning (Desktop-Specific)

- ✅ **Widget State (minimized/small/medium/maximized)**
  - 📍 Location: State variable `state` (line 39)
  - 🎯 Relevant for mobile: **No** - Mobile is always fullscreen
  - 📋 Status in PRD: **Not Applicable**
  - 📄 PRD Section: N/A
  - ⚠️ Notes: Desktop-specific widget resizing

- ✅ **Resize Buttons (Maximize/Minimize)**
  - 📍 Location: Lines 1153-1221 (header resize buttons)
  - 🎯 Relevant for mobile: **No** - Mobile is always fullscreen
  - 📋 Status in PRD: **Not Applicable**
  - 📄 PRD Section: N/A
  - ⚠️ Notes: Desktop-specific UI controls

- ✅ **getCurrentWidth / getCurrentHeight**
  - 📍 Location: Lines 993-1031
  - 🎯 Relevant for mobile: **No** - Mobile uses full viewport
  - 📋 Status in PRD: **Not Applicable**
  - 📄 PRD Section: N/A
  - ⚠️ Notes: Desktop-specific calculations

- ✅ **getPosition (bottom-right positioning)**
  - 📍 Location: Lines 1037-1045
  - 🎯 Relevant for mobile: **No** - Mobile uses full viewport
  - 📋 Status in PRD: **Not Applicable**
  - 📄 PRD Section: N/A
  - ⚠️ Notes: Desktop-specific positioning

- ✅ **Framer Motion Animations (resize transitions)**
  - 📍 Location: Lines 1050-1068 (motion.div with animate props)
  - 🎯 Relevant for mobile: **No** - Mobile doesn't resize
  - 📋 Status in PRD: **Not Applicable**
  - 📄 PRD Section: N/A
  - ⚠️ Notes: Desktop-specific animations

- ✅ **Minimized State (avatar thumbnail with pulse)**
  - 📍 Location: Lines 1071-1114
  - 🎯 Relevant for mobile: **No** - Mobile launches directly to fullscreen
  - 📋 Status in PRD: **Not Applicable**
  - 📄 PRD Section: N/A
  - ⚠️ Notes: Desktop-specific widget state

---

### Disconnect & Cleanup

- ✅ **Disconnect Button**
  - 📍 Location: Lines 2037-2063 (PhoneOff button)
  - 🎯 Relevant for mobile: **Yes** - User control
  - 📋 Status in PRD: **CRITICAL** - Must be implemented
  - 📄 PRD Section: Disconnect control
  - ⚠️ Notes: Mobile needs prominent disconnect button

- ✅ **Full Disconnect Flow**
  - 📍 Location: Lines 406-437 (handleDisconnect)
  - 🎯 Relevant for mobile: **Yes** - Proper cleanup
  - 📋 Status in PRD: **CRITICAL** - Must be implemented
  - 📄 PRD Section: Session termination
  - ⚠️ Notes: Mobile needs same cleanup sequence

- ✅ **onDisconnect Callback**
  - 📍 Location: Lines 434-436 (calls prop.onDisconnect)
  - 🎯 Relevant for mobile: **Yes** - Navigation control
  - 📋 Status in PRD: **CRITICAL** - Must be implemented
  - 📄 PRD Section: Navigation callback
  - ⚠️ Notes: Mobile uses for returning to landing or home screen

---

### Mobile Detection

- ✅ **isMobile State (< 768px)**
  - 📍 Location: Lines 131-136 (useEffect)
  - 🎯 Relevant for mobile: **No** - Mobile is always mobile
  - 📋 Status in PRD: **Not Applicable**
  - 📄 PRD Section: N/A
  - ⚠️ Notes: Desktop responsive design, mobile is always mobile

---

### Legacy/Unused Features

- ✅ **isVoiceMode (Always True)**
  - 📍 Location: State variable (line 41)
  - 🎯 Relevant for mobile: **No** - Legacy toggle
  - 📋 Status in PRD: **Not Applicable**
  - 📄 PRD Section: N/A
  - ⚠️ Notes: Desktop removed video/voice mode toggle, mobile is always voice

- ✅ **Screen Share Preview**
  - 📍 Location: Lines 1316-1430, state lines 47-51
  - 🎯 Relevant for mobile: **No** - Legacy feature
  - 📋 Status in PRD: **Not Applicable**
  - 📄 PRD Section: N/A
  - ⚠️ Notes: Desktop removed screen share, not needed for mobile

- ✅ **Booking Popup Modal (Old)**
  - 📍 Location: Lines 2071-2313, state lines 42-47
  - 🎯 Relevant for mobile: **No** - Replaced by Calendly
  - 📋 Status in PRD: **Not Applicable**
  - 📄 PRD Section: N/A
  - ⚠️ Notes: Desktop replaced with Calendly iframe, mobile uses same

- ✅ **Quick Action Buttons**
  - 📍 Location: Lines 1444-1516, quickActions array lines 971-975
  - 🎯 Relevant for mobile: **Maybe** - Voice-first alternative
  - 📋 Status in PRD: **Could Have** - Optional convenience
  - 📄 PRD Section: Quick actions (optional)
  - ⚠️ Notes: Desktop hides when live, mobile may not need (voice-first)

- ✅ **handleActivity Placeholder**
  - 📍 Location: Lines 347-349
  - 🎯 Relevant for mobile: **No** - Empty function
  - 📋 Status in PRD: **Not Applicable**
  - 📄 PRD Section: N/A
  - ⚠️ Notes: Desktop removed inactivity timeout, function is empty

---

### Event Logging (Development)

- ✅ **useEventLogger Hook**
  - 📍 Location: useEventLogger.js (57 lines)
  - 🎯 Relevant for mobile: **Yes** - Development & debugging
  - 📋 Status in PRD: **Should Have** - Essential for development
  - 📄 PRD Section: Logging system
  - ⚠️ Notes: Mobile needs equivalent logging (console or analytics)

- ✅ **Event Log Calls (Throughout Component)**
  - 📍 Location: 50+ log() calls throughout AIChatWidget
  - 🎯 Relevant for mobile: **Yes** - Development & debugging
  - 📋 Status in PRD: **Should Have** - Essential for development
  - 📄 PRD Section: Logging
  - ⚠️ Notes: Mobile should maintain same log points for consistency

---

## HomePage.jsx Features

### Navigation & Header

- ✅ **Navigation Bar**
  - 📍 Location: Lines 241-319
  - 🎯 Relevant for mobile: **No** - Desktop landing page
  - 📋 Status in PRD: **Not Applicable**
  - 📄 PRD Section: N/A
  - ⚠️ Notes: Mobile app doesn't need web landing page

- ✅ **"Talk to Us" Button**
  - 📍 Location: Lines 269-279
  - 🎯 Relevant for mobile: **No** - Desktop marketing
  - 📋 Status in PRD: **Not Applicable**
  - 📄 PRD Section: N/A
  - ⚠️ Notes: Mobile app launches directly to avatar

- ✅ **"Talk to Agent" Button (Hero)**
  - 📍 Location: Lines 440-450
  - 🎯 Relevant for mobile: **No** - Desktop landing page
  - 📋 Status in PRD: **Not Applicable**
  - 📄 PRD Section: N/A
  - ⚠️ Notes: Mobile app launches directly, no marketing page needed

- ✅ **AIChatWidget Integration (Fullscreen Trigger)**
  - 📍 Location: Lines 2338-2344, state line 38
  - 🎯 Relevant for mobile: **Maybe** - Pattern reference
  - 📋 Status in PRD: **Reference Only** - UX pattern
  - 📄 PRD Section: N/A
  - ⚠️ Notes: Mobile uses similar fullscreen pattern but natively

---

### All Other HomePage Features

- ✅ **Hero Section, Testimonials, Use Cases, Footer, etc.**
  - 📍 Location: Throughout HomePage.jsx
  - 🎯 Relevant for mobile: **No** - Desktop marketing website
  - 📋 Status in PRD: **Not Applicable**
  - 📄 PRD Section: N/A
  - ⚠️ Notes: Mobile app doesn't need web landing page components

---

## ExtendedAvatarPage.jsx Features

### Landing Page Pattern

- ✅ **Landing Page (Avatar Preview + Start Button)**
  - 📍 Location: Lines 31-51
  - 🎯 Relevant for mobile: **Yes** - Perfect mobile UX pattern
  - 📋 Status in PRD: **CRITICAL** - Primary mobile entry point
  - 📄 PRD Section: Landing screen
  - ⚠️ Notes: This is the IDEAL pattern for mobile - clean, simple, direct

- ✅ **Start Conversation Button**
  - 📍 Location: Lines 44-50
  - 🎯 Relevant for mobile: **Yes** - Primary CTA
  - 📋 Status in PRD: **CRITICAL** - Must be implemented
  - 📄 PRD Section: Start button
  - ⚠️ Notes: Mobile needs same prominent button

- ✅ **Loading State (Connecting...)**
  - 📍 Location: Line 49 (button text), state line 10
  - 🎯 Relevant for mobile: **Yes** - User feedback
  - 📋 Status in PRD: **CRITICAL** - Must be implemented
  - 📄 PRD Section: Loading indicators
  - ⚠️ Notes: Mobile needs loading spinner or animation

- ✅ **Session Key (Force New Instance)**
  - 📍 Location: Line 9 (state), line 25 (increment), line 58 (key prop)
  - 🎯 Relevant for mobile: **Yes** - Clean state management
  - 📋 Status in PRD: **CRITICAL** - Must be implemented
  - 📄 PRD Section: Session lifecycle
  - ⚠️ Notes: Ensures each session is fresh, prevents state leaks

- ✅ **handleDisconnect (Return to Landing)**
  - 📍 Location: Lines 21-26
  - 🎯 Relevant for mobile: **Yes** - Navigation flow
  - 📋 Status in PRD: **CRITICAL** - Must be implemented
  - 📄 PRD Section: Disconnect flow
  - ⚠️ Notes: Mobile returns to landing screen after disconnect

- ✅ **autoExpand={true} Pattern**
  - 📍 Location: Line 58 (AIChatWidget prop)
  - 🎯 Relevant for mobile: **Yes** - Auto-start session
  - 📋 Status in PRD: **CRITICAL** - Must be implemented
  - 📄 PRD Section: Auto-expand mode
  - ⚠️ Notes: Mobile always uses autoExpand pattern (no widget resize)

- ✅ **onDisconnect Callback**
  - 📍 Location: Line 58 (handleDisconnect)
  - 🎯 Relevant for mobile: **Yes** - Navigation callback
  - 📋 Status in PRD: **CRITICAL** - Must be implemented
  - 📄 PRD Section: Disconnect callback
  - ⚠️ Notes: Mobile uses for navigation back to landing

---

## Configuration Files

### video-triggers.json

- ✅ **Trigger Configuration Structure**
  - 📍 Location: Entire file (41 lines)
  - 🎯 Relevant for mobile: **Yes** - Core feature
  - 📋 Status in PRD: **CRITICAL** - Must be implemented
  - 📄 PRD Section: Demo configuration
  - ⚠️ Notes: Mobile uses identical JSON structure

- ✅ **Primary/Secondary Keywords**
  - 📍 Location: Each trigger object
  - 🎯 Relevant for mobile: **Yes** - Matching algorithm
  - 📋 Status in PRD: **CRITICAL** - Must be implemented
  - 📄 PRD Section: Keyword matching
  - ⚠️ Notes: Mobile uses same keyword logic

- ✅ **Video URLs (Google Cloud Storage)**
  - 📍 Location: Each trigger object
  - 🎯 Relevant for mobile: **Yes** - Video sources
  - 📋 Status in PRD: **CRITICAL** - Must be implemented
  - 📄 PRD Section: Video URLs
  - ⚠️ Notes: Mobile streams same videos from Google Cloud

- ✅ **Fallback Demo (No Secondary Keywords)**
  - 📍 Location: generic-demo trigger (lines 32-37)
  - 🎯 Relevant for mobile: **Yes** - Fallback logic
  - 📋 Status in PRD: **CRITICAL** - Must be implemented
  - 📄 PRD Section: Fallback handling
  - ⚠️ Notes: Mobile needs same fallback behavior

---

### booking-config.json

- ✅ **Calendly URL**
  - 📍 Location: Line 2
  - 🎯 Relevant for mobile: **Yes** - Core feature
  - 📋 Status in PRD: **CRITICAL** - Must be implemented
  - 📄 PRD Section: Booking configuration
  - ⚠️ Notes: Mobile uses same Cal.com URL

---

## Custom Hooks

### useEventLogger.js

- ✅ **Event Logging System**
  - 📍 Location: Entire file (57 lines)
  - 🎯 Relevant for mobile: **Yes** - Development & debugging
  - 📋 Status in PRD: **Should Have** - Essential for development
  - 📄 PRD Section: Logging
  - ⚠️ Notes: Mobile needs equivalent logging system

- ✅ **Log Entry Structure**
  - 📍 Location: Lines 6-20 (log function)
  - 🎯 Relevant for mobile: **Yes** - Data structure
  - 📋 Status in PRD: **Should Have** - Consistent logging
  - 📄 PRD Section: Log format
  - ⚠️ Notes: Mobile should match log entry structure

- ✅ **Category Emojis**
  - 📍 Location: Lines 29-55 (getCategoryEmoji)
  - 🎯 Relevant for mobile: **Yes** - Visual debugging
  - 📋 Status in PRD: **Should Have** - Enhanced readability
  - 📄 PRD Section: Log formatting
  - ⚠️ Notes: Mobile can use same categories and emojis

---

### useDemoVideo.js

- ✅ **Demo Video Hook Structure**
  - 📍 Location: Entire file (165 lines)
  - 🎯 Relevant for mobile: **Yes** - Core feature
  - 📋 Status in PRD: **CRITICAL** - Must be implemented
  - 📄 PRD Section: Demo video management
  - ⚠️ Notes: Mobile needs equivalent functionality (may not be React hook)

- ✅ **Video Loading Logic**
  - 📍 Location: Lines 9-58 (useEffect)
  - 🎯 Relevant for mobile: **Yes** - Video playback
  - 📋 Status in PRD: **CRITICAL** - Must be implemented
  - 📄 PRD Section: Video loading
  - ⚠️ Notes: Mobile uses native video player APIs

- ✅ **Microphone Pause Logic**
  - 📍 Location: Lines 69-73 (in playDemoVideo)
  - 🎯 Relevant for mobile: **Yes** - Audio management
  - 📋 Status in PRD: **CRITICAL** - Must be implemented
  - 📄 PRD Section: Audio control
  - ⚠️ Notes: Mobile needs same behavior

- ✅ **Avatar PIP Cloning Logic**
  - 📍 Location: Lines 76-106 (in playDemoVideo)
  - 🎯 Relevant for mobile: **Yes** - Enhanced UX
  - 📋 Status in PRD: **Should Have** - Premium experience
  - 📄 PRD Section: Picture-in-picture
  - ⚠️ Notes: Mobile uses native PIP APIs instead of DOM cloning

- ✅ **Keep Mic Muted After Demo**
  - 📍 Location: Lines 124-130 (in stopDemoVideo)
  - 🎯 Relevant for mobile: **Yes** - Correct behavior
  - 📋 Status in PRD: **CRITICAL** - Must be implemented
  - 📄 PRD Section: Post-demo state
  - ⚠️ Notes: Prevents "dead avatar" bug

---

## Summary: Critical vs Optional Features

### CRITICAL (Must Have for Mobile MVP)

**Session Management:**
- LiveKit room connection
- HeyGen session creation/termination
- Auto-expand session start (autoExpand pattern from ExtendedAvatarPage)
- Component cleanup and unmount handling
- Session key pattern for fresh instances

**Audio/Video:**
- Video track attachment/detachment
- Audio track attachment/detachment
- Track subscription handling
- Auto-enable microphone on start
- Toggle microphone
- Toggle avatar audio
- Audio processing (echo cancellation, noise suppression, auto gain)

**Data & Transcripts:**
- Data channel message handling
- User/avatar transcript processing
- Transcript array management (last 10)

**Avatar State:**
- Avatar state tracking (idle/speaking/listening/thinking)
- State transition detection (speaking → listening)

**Demo Video:**
- Demo trigger configuration (video-triggers.json)
- Demo trigger detection
- Play/stop demo video
- Microphone pause during demo
- Keep mic muted after demo
- Demo video state management

**Calendly:**
- Calendly URL configuration (booking-config.json)
- Schedule meeting intent detection
- Pending Calendly (wait for avatar to finish)
- Open/close Calendly
- Mute mic and avatar during Calendly
- Restore audio after Calendly close

**Intent Detection:**
- Intent actions configuration
- Detect intent function
- Demo triggers priority (checked first)

**Disconnect:**
- Disconnect button
- Full disconnect flow
- onDisconnect callback

**Landing Pattern:**
- ExtendedAvatarPage landing screen pattern
- Start conversation button
- Loading state
- Return to landing on disconnect

---

### SHOULD HAVE (Enhanced UX)

- User speaking indicator
- Avatar speaking indicator
- Status overlay (Speaking/Listening/Thinking/Ready)
- Avatar PIP during demo
- Avatar PIP during Calendly
- Demo playing indicator
- Book a Meeting button (manual trigger)
- Event logging system (development)

---

### COULD HAVE (Optional)

- Transcript display overlay (debugging)
- Quick action buttons (voice-first alternative)
- Detected intents history (debugging)

---

### NOT APPLICABLE (Desktop-Specific)

- Widget sizing/positioning (mobile is fullscreen)
- Resize buttons
- Minimized state
- Mobile detection (< 768px)
- HomePage.jsx landing page components
- Screen share preview (legacy)
- Old booking popup modal (replaced by Calendly)
- isVoiceMode toggle (always true)
- handleActivity placeholder (empty function)

---

## Mobile-Specific Implementation Notes

### 1. ExtendedAvatarPage Pattern is IDEAL for Mobile
The ExtendedAvatarPage component (67 lines) is the **perfect reference** for mobile implementation:
- Clean landing screen with avatar preview
- Single "Start Conversation" button
- Auto-expand pattern (no widget resizing)
- Session key pattern for fresh instances
- Clean disconnect flow back to landing
- No complexity from widget sizing or desktop UI

### 2. Core Features from AIChatWidget to Port
Mobile needs to implement these core features from AIChatWidget:
- Session lifecycle (startLiveSession, stopSession, handleDisconnect)
- Audio/video track management (attach/detach)
- Data channel and transcript processing
- Avatar state management
- Demo video system (triggers, playback, PIP)
- Calendly integration (intent detection, display, audio management)
- Intent detection system

### 3. Features to Adapt for Mobile
- **Video rendering:** Use native video views instead of DOM <video> elements
- **Audio playback:** Use native audio APIs instead of <audio> elements
- **Calendly display:** Use WebView or Safari View Controller instead of iframe
- **Picture-in-Picture:** Use native PIP APIs (iOS AVPictureInPictureController, Android PictureInPictureParams)
- **Logging:** Use platform-specific logging (NSLog/os_log for iOS, Log for Android)

### 4. Features to Skip
- Widget sizing/positioning logic (getCurrentWidth, getCurrentHeight, getPosition)
- Resize buttons and widget state transitions
- Minimized state and thumbnail
- Mobile detection (< 768px)
- HomePage landing page (desktop marketing site)
- Framer Motion animations (desktop widget resize)

### 5. Configuration Files (Use As-Is)
- video-triggers.json - Use identical JSON structure
- booking-config.json - Use same Cal.com URL

---

## Gap Analysis

### Features Fully Documented in Source Code ✅
All core features are well-documented with AIDEV-NOTE comments explaining:
- Purpose and behavior
- When called and by what
- Why designed this way
- Edge cases and timing considerations

### Features Missing from PRD ⚠️
If a mobile PRD exists, it should verify coverage of:
1. **Auto-expand pattern** from ExtendedAvatarPage (critical for mobile)
2. **Session key pattern** for fresh instances (prevents state leaks)
3. **Microphone pause during demo** (prevents interruptions)
4. **Keep mic muted after demo** (prevents "dead avatar" bug)
5. **Wait for avatar to finish before Calendly** (polite UX)
6. **Unmute both mic and audio after Calendly close** (resume conversation)
7. **Existing tracks check** with 1000ms delay (handles race condition)
8. **Auto-enable microphone** with 1500ms delay (voice-first UX)
9. **Audio processing settings** (echo cancellation, noise suppression, auto gain)
10. **RELIABLE data packet delivery** for data channel messages

### Critical Timing Values ⏱️
Mobile should preserve these timing values:
- 1500ms delay for auto-enable microphone (line 556)
- 1000ms delay for existing tracks check (line 538)
- 500ms delay before demo video playback if maximizing (line 864)
- 100ms delay for demo trigger check after state change (line 848)
- 100ms delay for PIP cloning (useDemoVideo.js line 76)
- 500ms delay for loading state in ExtendedAvatarPage (line 17)

---

## Recommended Mobile Implementation Approach

1. **Start with ExtendedAvatarPage pattern**
   - Implement landing screen with avatar preview
   - Implement "Start Conversation" button
   - Use session key pattern for fresh instances

2. **Port core AIChatWidget features**
   - Session lifecycle (startLiveSession, stopSession, handleDisconnect)
   - Audio/video track management
   - Data channel and transcripts
   - Avatar state management

3. **Add demo video system**
   - Demo trigger detection
   - Video playback (native player)
   - Picture-in-Picture (native PIP)
   - Microphone pause/resume logic

4. **Add Calendly integration**
   - Intent detection
   - WebView display
   - Picture-in-Picture (native PIP)
   - Audio mute/unmute logic

5. **Add UI controls**
   - Mic button (with speaking indicator)
   - Speaker button (with speaking indicator)
   - Disconnect button
   - Book a Meeting button
   - Status overlay (Speaking/Listening/Ready)

6. **Add logging system**
   - Equivalent to useEventLogger
   - Same categories and log points
   - Platform-specific output (console or analytics)

---

## Testing Checklist

Mobile should test these critical flows:

### Session Lifecycle
- [ ] Landing screen displays correctly
- [ ] "Start Conversation" shows loading state
- [ ] Auto-expand starts session automatically
- [ ] Microphone auto-enables after 1500ms
- [ ] Video and audio tracks attach correctly
- [ ] Disconnect button ends session cleanly
- [ ] Returns to landing screen after disconnect
- [ ] New session gets fresh widget instance (session key pattern)

### Demo Video Flow
- [ ] Demo triggers on correct keywords
- [ ] Widget waits for avatar to finish speaking before demo
- [ ] Microphone pauses during demo
- [ ] Avatar shows in Picture-in-Picture
- [ ] Stop button ends demo
- [ ] Microphone stays muted after demo
- [ ] Widget returns to normal view after demo

### Calendly Flow
- [ ] Intent detection triggers on keywords
- [ ] Waits for avatar to finish speaking before Calendly
- [ ] Mic and audio mute when Calendly opens
- [ ] Avatar shows in Picture-in-Picture
- [ ] Close button dismisses Calendly
- [ ] Mic and audio unmute after Calendly close
- [ ] Returns to normal conversation after close

### Audio/Video Quality
- [ ] Echo cancellation works
- [ ] Noise suppression works
- [ ] Auto gain control works
- [ ] Video plays smoothly
- [ ] Audio syncs with video
- [ ] No audio feedback loops

### Edge Cases
- [ ] Network interruption handling
- [ ] App backgrounding during session
- [ ] App foregrounding restores session
- [ ] Memory cleanup on unmount
- [ ] Multiple rapid disconnect/reconnect
- [ ] Avatar finishes speaking during disconnect
- [ ] Intent detection during demo playback

---

## File References for Mobile Developers

### Primary Reference (Most Important)
- **ExtendedAvatarPage.jsx (67 lines)** - PERFECT mobile pattern, use as primary reference

### Core Logic (Port to Mobile)
- **AIChatWidget.jsx (2318 lines)** - Core features, session management, audio/video, demo, Calendly
- **useDemoVideo.js (165 lines)** - Demo video playback logic
- **useEventLogger.js (57 lines)** - Logging system pattern

### Configuration (Use As-Is)
- **video-triggers.json (41 lines)** - Demo trigger configuration
- **booking-config.json (4 lines)** - Calendly URL

### Not Needed for Mobile
- **HomePage.jsx (2349 lines)** - Desktop landing page, not applicable to mobile app

---

## End of Checklist
