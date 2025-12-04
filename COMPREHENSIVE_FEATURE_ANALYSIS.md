# Comprehensive Feature Analysis

## File 1: AIChatWidget.jsx (2318 lines)

### Imports

**React Hooks:**
- `useState` - State management
- `useEffect` - Side effects, lifecycle
- `useRef` - DOM references and persistent values

**External Libraries:**
- `framer-motion` (motion, AnimatePresence) - Animations and transitions
- `lucide-react` (X, Maximize2, Minimize2, Volume2, VolumeX, PhoneOff, Calendar, Mic, MicOff, MessageSquare, Ear, Brain, Smile, User, Bot, Video) - Icon components
- `livekit-client` (Room, createLocalAudioTrack, RoomEvent, DataPacket_Kind, Track) - WebRTC video/audio communication

**Internal Components:**
- None (this is a standalone component)

**Utils/Config:**
- `getNodeApiUrl` from '../config/api' - API endpoint helper
- `checkForDemoTrigger` from '../utils/videoTriggerMatcher' - Demo video trigger detection
- `videoTriggersConfig` from '../config/video-triggers.json' - Demo video configuration
- `bookingConfig` from '../config/booking-config.json' - Calendly URL configuration

**Custom Hooks:**
- `useEventLogger` from '../hooks/useEventLogger' - Event logging system
- `useDemoVideo` from '../hooks/useDemoVideo' - Demo video playback management

---

### Props

1. `onDisconnect` (function) - Default: `undefined` - Purpose: Callback when widget disconnects (used by ExtendedAvatarPage)
2. `autoExpand` (boolean) - Default: `false` - Purpose: Auto-expand widget and start session on mount

---

### State Variables (useState)

1. `state` - Initial: `autoExpand ? "small" : "minimized"` - Purpose: Widget size state (minimized/small/medium/maximized)
2. `isMuted` - Initial: `true` - Purpose: User microphone mute state
3. `isVoiceMode` - Initial: `true` - Purpose: Always true (static avatar mode, voice-first experience)
4. `showBookingPopup` - Initial: `false` - Purpose: Legacy booking modal (not used, replaced by Calendly)
5. `selectedDate` - Initial: `""` - Purpose: Legacy booking date selection
6. `selectedTime` - Initial: `""` - Purpose: Legacy booking time selection
7. `email` - Initial: `""` - Purpose: Legacy booking email
8. `isMobile` - Initial: `false` - Purpose: Mobile device detection (< 768px)
9. `isScreenSharing` - Initial: `false` - Purpose: Screen share preview state (legacy, not used in voice mode)
10. `isTransitioning` - Initial: `false` - Purpose: Screen share transition animation state (legacy)
11. `transitionToScreenShare` - Initial: `false` - Purpose: Screen share transition direction (legacy)

**LiveAvatar Session States:**
12. `room` - Initial: `null` - Purpose: LiveKit Room instance for WebRTC connection
13. `isConnecting` - Initial: `false` - Purpose: Session connection loading state
14. `sessionInfo` - Initial: `null` - Purpose: HeyGen session credentials {sessionId, sessionToken, livekitUrl}
15. `hasLiveVideo` - Initial: `false` - Purpose: Video track subscription status
16. `hasAudio` - Initial: `false` - Purpose: Audio track subscription status
17. `audioEnabled` - Initial: `true` - Purpose: Avatar audio output enable/mute
18. `avatarState` - Initial: `"idle"` - Purpose: Avatar state (idle/speaking/listening/thinking)
19. `isAvatarSpeaking` - Initial: `false` - Purpose: Avatar speaking indicator
20. `isUserSpeaking` - Initial: `false` - Purpose: User speaking indicator
21. `transcripts` - Initial: `[]` - Purpose: Speech transcripts array (last 10, user & avatar)
22. `detectedIntents` - Initial: `[]` - Purpose: Detected intent history (last 5)
23. `showCalendly` - Initial: `false` - Purpose: Calendly iframe overlay display state

---

### Refs (useRef)

1. `localAudioRef` - Initial: `null` - Purpose: User microphone track reference (LiveKit LocalAudioTrack)
2. `remoteAudioRef` - Initial: `null` - Purpose: Avatar audio element DOM reference
3. `mountedRef` - Initial: `true` - Purpose: Component mount status (prevents async updates after unmount)
4. `previousAgentStateRef` - Initial: `'idle'` - Purpose: Previous avatar state for transition detection
5. `lastAvatarSpeechRef` - Initial: `''` - Purpose: Last avatar speech text for demo trigger detection
6. `preDemoWidgetStateRef` - Initial: `null` - Purpose: Widget state before demo (for restore after demo)
7. `preCalendlyWidgetStateRef` - Initial: `null` - Purpose: Widget state before Calendly (for restore)
8. `preCalendlyMutedRef` - Initial: `false` - Purpose: Mic mute state before Calendly
9. `preCalendlyAudioEnabledRef` - Initial: `true` - Purpose: Avatar audio state before Calendly
10. `pendingCalendlyRef` - Initial: `false` - Purpose: Pending Calendly open (wait for avatar to finish speaking)
11. `hasAutoExpandedRef` - Initial: `false` - Purpose: Prevents duplicate auto-expand in React Strict Mode
12. `screenShareRef` - Initial: `false` - Purpose: Screen share toggle state (legacy)

**Custom Hook Refs (from useDemoVideo):**
13. `demoVideoRef` - Initial: `null` - Purpose: Demo video element reference

---

### useEffects

1. **Dependencies: `[]`**
   - Purpose: Mobile detection on mount, window resize listener
   - Sets `isMobile` based on viewport width (< 768px)

2. **Dependencies: `[isDemoPlaying, log, room, sessionInfo]`** (lines 141-154)
   - Purpose: Restore widget state after demo ends
   - Returns to "small" state (initial connected view) when demo closes
   - Keeps "minimized" if no active session

3. **Dependencies: `[showCalendly, log, room, sessionInfo]`** (lines 159-173)
   - Purpose: Restore widget state after Calendly closes
   - Returns to "small" state (initial connected view) after Calendly dismissal

4. **Dependencies: `[isAvatarSpeaking, state, log]`** (lines 178-193)
   - Purpose: Wait for avatar to finish speaking before opening Calendly
   - When `pendingCalendlyRef` is set, waits until avatar stops, then opens Calendly

5. **Dependencies: `[showCalendly, hasLiveVideo]`** (lines 198-221)
   - Purpose: Clone avatar video to Calendly PIP when Calendly opens
   - Maintains avatar visibility during booking (Picture-in-Picture)

6. **Dependencies: `[showCalendly, isMuted, audioEnabled, room]`** (lines 226-260)
   - Purpose: Mute mic and avatar audio when Calendly opens, restore when closed
   - Saves states in refs, unmutes both on close for conversation resumption

7. **Dependencies: `[autoExpand, state]`** (lines 263-268)
   - Purpose: Update state when autoExpand changes
   - Sets state to "small" if autoExpand and currently "minimized"

8. **Dependencies: `[autoExpand]`** (lines 272-281)
   - Purpose: Auto-start session if autoExpand prop is true
   - Uses `hasAutoExpandedRef` to prevent duplicate calls in Strict Mode

9. **Dependencies: `[]`** (lines 283-299)
   - Purpose: Component mount/unmount cleanup
   - Sets `mountedRef.current = true` on mount
   - On unmount: stops HeyGen session, disconnects room, stops local audio

10. **Dependencies: `[state, isVoiceMode]`** (lines 301-332)
    - Purpose: Screen share toggle animation (legacy, not used in voice mode)
    - Auto-toggles screen share preview every 7 seconds when not in voice mode

---

### Functions/Handlers

1. **`handleUserSpeech(text, source)`** (lines 92-107)
   - Purpose: Processes user speech transcripts from LiveKit data channel
   - Updates transcripts array (last 10), triggers intent detection
   - Called by wireRoomEvents for user_transcript, user_speech events

2. **`handleAvatarSpeech(text, source)`** (lines 113-129)
   - Purpose: Processes avatar speech transcripts for intent detection
   - Saves text to `lastAvatarSpeechRef` for demo trigger detection
   - Called by wireRoomEvents for avatar_transcript, llm_response events

3. **`handleActivity()`** (lines 347-349)
   - Purpose: Placeholder for future activity tracking (previously inactivity timeout)
   - Called by: Quick action buttons, UI interactions

4. **`stopSession()`** (lines 355-400)
   - Purpose: Stops HeyGen LiveAvatar session to prevent quota waste
   - Calls /api/liveavatar/stop-session with sessionId and sessionToken
   - Called by: handleDisconnect, component unmount

5. **`handleDisconnect()`** (lines 406-437)
   - Purpose: Full session cleanup and disconnect from LiveAvatar
   - Stops HeyGen session, disconnects room, stops tracks, removes audio element
   - Calls `onDisconnect` callback if provided (ExtendedAvatarPage)

6. **`startLiveSession()`** (lines 444-581)
   - Purpose: Initializes LiveAvatar session - creates HeyGen session, connects to LiveKit
   - Multi-step async flow: POST /api/liveavatar/create-session → connect room → wire events → attach tracks
   - Auto-enables microphone after 1500ms for immediate conversation
   - Called by: Widget expansion (minimized → small), autoExpand prop

7. **`attachTrackToDom(track)`** (lines 587-617)
   - Purpose: Attaches LiveKit video track to DOM
   - Creates <video> element in #live-video-container, forces autoplay
   - Called by: TrackSubscribed event, existing tracks check

8. **`detachTrackFromDom(track)`** (lines 623-625)
   - Purpose: Detaches video track from DOM element
   - Called by: TrackUnsubscribed event

9. **`attachAudioTrack(track)`** (lines 631-650)
   - Purpose: Attaches avatar audio track to hidden <audio> element
   - Creates persistent audio element in document.body
   - Called by: TrackSubscribed event, existing tracks check

10. **`detachAudioTrack(track)`** (lines 656-664)
    - Purpose: Detaches audio track and removes element from DOM
    - Prevents memory leak from lingering audio element
    - Called by: TrackUnsubscribed event, handleDisconnect

11. **`toggleAudio()`** (lines 670-675)
    - Purpose: Toggles avatar audio output (speaker button)
    - Mutes/unmutes remoteAudioRef element
    - Called by: Speaker button (Volume2/VolumeX icon)

12. **`toggleMicrophone()`** (lines 681-708)
    - Purpose: Toggles user microphone (mic button)
    - Full publish/unpublish cycle with audio processing (echo cancellation, noise suppression)
    - Called by: Microphone button (Mic/MicOff icon)

13. **`publishLocalAudio()`** (lines 714-737)
    - Purpose: Publishes user microphone without toggle logic
    - Used during session init and Calendly close
    - Called by: Auto-enable in startLiveSession, Calendly close effect

14. **`wireRoomEvents(r)`** (lines 744-879)
    - Purpose: Wires all LiveKit room events - data channel, participant attributes
    - Handles transcripts, state changes, demo triggers
    - Called by: startLiveSession after room connection

15. **`detectIntent(transcript, fullData, source)`** (lines 913-947)
    - Purpose: Detects intents from transcripts and triggers actions
    - Checks demo triggers first, then intent actions (meeting scheduling)
    - Called by: handleUserSpeech, handleAvatarSpeech

16. **`sendDataToAvatar(message)`** (lines 953-967)
    - Purpose: Sends text message to avatar via LiveKit data channel
    - Uses RELIABLE delivery for guaranteed message delivery
    - Called by: handleSendMessage, handleQuickAction

17. **`handleQuickAction(action)`** (lines 981-987)
    - Purpose: Handles quick action button clicks
    - Sends predefined prompts to avatar via data channel
    - Called by: Quick action button clicks (shown when not in live mode)

18. **`getCurrentWidth()`** (lines 993-1007)
    - Purpose: Calculates widget width based on state and device type
    - Returns pixel values for responsive design
    - Called by: framer-motion animate prop

19. **`getCurrentHeight()`** (lines 1013-1031)
    - Purpose: Calculates widget height based on state and device type
    - Special handling for Calendly (taller height)
    - Called by: framer-motion animate prop

20. **`getPosition()`** (lines 1037-1045)
    - Purpose: Calculates widget position (bottom-right corner)
    - Maximized state centers more (10% margin)
    - Called by: framer-motion style prop

---

### Event Listeners

1. **Event: `window resize`** - Handler: inline - Purpose: Update isMobile on viewport resize
2. **Event: `RoomEvent.TrackSubscribed`** - Handler: inline (lines 509-525) - Purpose: Attach video/audio tracks when published
3. **Event: `RoomEvent.TrackUnsubscribed`** - Handler: inline (lines 528-534) - Purpose: Detach tracks when unpublished
4. **Event: `RoomEvent.DataReceived`** - Handler: inline (lines 746-831) - Purpose: Process data channel messages (transcripts, state)
5. **Event: `RoomEvent.ParticipantAttributesChanged`** - Handler: inline (lines 834-878) - Purpose: Track avatar state changes, trigger demos
6. **Event: `video onEnded`** (demo video) - Handler: `stopDemoVideo` - Purpose: Stop demo when video ends
7. **Event: `video onError`** (demo video) - Handler: inline (lines 1627-1639) - Purpose: Handle demo video load errors

---

### UI Components/Elements

1. **Component: Minimized State Button** (lines 1072-1114) - Conditional: `state === "minimized"` - Purpose: Avatar thumbnail with pulse, expands widget on click
2. **Component: Widget Header** (lines 1136-1258) - Conditional: `state !== "minimized"` - Purpose: Resize buttons, Book a Meeting button
3. **Component: Video Container** (lines 1260-1442) - Conditional: Always visible when expanded - Purpose: Shows connecting spinner, LiveKit video, or static avatar
4. **Component: Live Video Container** (lines 1304-1315) - Conditional: `hasLiveVideo || room` - Purpose: DOM container for LiveKit video track attachment
5. **Component: Screen Share Preview** (lines 1316-1430) - Conditional: `!isVoiceMode && !hasLiveVideo` - Purpose: Legacy screen share animation (not used)
6. **Component: Static Avatar Image** (lines 1432-1442) - Conditional: Default fallback - Purpose: Shows static avatar when no live video
7. **Component: Quick Action Buttons** (lines 1444-1516) - Conditional: `!hasLiveVideo && !isVoiceMode` - Purpose: Predefined prompt buttons (hidden in voice mode)
8. **Component: Live Session Status Overlay** (lines 1519-1591) - Conditional: `hasLiveVideo && sessionInfo` - Purpose: Shows avatar state (speaking/listening/thinking/idle)
9. **Component: Demo Video Fullscreen** (lines 1596-1681) - Conditional: `isDemoPlaying` - Purpose: Fullscreen demo video with avatar PIP, stop button
10. **Component: Calendly Iframe Overlay** (lines 1686-1778) - Conditional: `showCalendly` - Purpose: Fullscreen Calendly booking with avatar PIP, close button
11. **Component: Demo Playing Indicator** (lines 1782-1801) - Conditional: `isDemoPlaying` - Purpose: Banner showing demo is playing, mic paused
12. **Component: Transcript Overlay** (lines 1808-1860) - Conditional: `transcripts.length > 0 && state === "maximized" && !showCalendly && !isDemoPlaying` - Purpose: Shows last 3 transcripts in maximized mode
13. **Component: Powered by Qudemo Badge** (lines 1862-1902) - Conditional: Always visible - Purpose: Branding link at bottom center
14. **Component: Control Panel** (lines 1926-2065) - Conditional: Always visible when expanded - Purpose: Mic, speaker, disconnect buttons
15. **Component: Booking Popup Modal** (lines 2073-2313) - Conditional: `showBookingPopup` - Purpose: Legacy booking form (not used, replaced by Calendly)

---

### Conditional Rendering

1. **Minimized vs Expanded** - Shows avatar thumbnail or full widget interface
2. **Resize Buttons** - Hidden when `autoExpand={true}` (ExtendedAvatarPage mode)
3. **Connecting Spinner** - Shows when `isConnecting || (autoExpand && !room)`
4. **LiveKit Video** - Shows when `hasLiveVideo || room`
5. **Quick Actions** - Hidden when `hasLiveVideo` (live session active)
6. **Status Overlay** - Shows when `hasLiveVideo && sessionInfo`
7. **Demo Video** - Shows when `isDemoPlaying`
8. **Calendly Iframe** - Shows when `showCalendly`
9. **Transcripts** - Shows when `transcripts.length > 0 && state === "maximized" && !showCalendly && !isDemoPlaying`
10. **Speaker Button** - Only shows when `hasAudio` (audio track attached)

---

### Custom Hooks

1. **`useEventLogger()`** - Returns: `{logs, log, clearLogs}` - Purpose: Event logging system for debugging
2. **`useDemoVideo({room, localAudioRef, log, setState})`** - Returns: `{isDemoPlaying, currentVideoUrl, demoVideoRef, playDemoVideo, stopDemoVideo}` - Purpose: Demo video playback management

---

### API Calls

1. **Endpoint:** `/api/liveavatar/create-session` - **Method:** `POST` - **Purpose:** Create HeyGen session and get LiveKit credentials
   - Request: `{userId: "widget-user"}`
   - Response: `{livekitUrl, livekitClientToken, sessionId, sessionToken}`
   - Called by: startLiveSession (line 456)

2. **Endpoint:** `/api/liveavatar/stop-session` - **Method:** `POST` - **Purpose:** Stop HeyGen session to prevent quota waste
   - Request: `{sessionId, sessionToken}`
   - Response: Success confirmation
   - Called by: stopSession (line 370), component unmount (line 290)

---

### Third-party Integrations

1. **Service:** HeyGen LiveAvatar API - **Purpose:** AI avatar video generation and session management
   - Session creation (/create-session), session termination (/stop-session)

2. **Service:** LiveKit - **Purpose:** WebRTC video/audio communication
   - Room connection, track management, data channel messaging

3. **Service:** Calendly (via cal.com) - **Purpose:** Meeting booking iframe
   - URL from `bookingConfig.calendlyUrl`
   - Opens in fullscreen overlay with avatar PIP

---

### Intent Actions (Keyword Detection)

1. **Schedule Meeting Intent** - Keywords: ["set up a meet", "schedule a meeting", "book a call", "arrange a meeting", "schedule a call", "book a meeting"] - Action: Sets `pendingCalendlyRef.current = true`, waits for avatar to finish speaking, then opens Calendly

---

### Demo Video Triggers

**Configuration:** `videoTriggersConfig` (video-triggers.json)
- Primary keywords: ["rendering", "render", "demo"]
- Secondary keywords differentiate videos: ["nvidia", "gpu"], ["microsoft", "enterprise"], ["apple", "ios", "macos"], ["google", "search", "workspace"]
- Trigger detection: `checkForDemoTrigger(text, videoTriggersConfig, log)`
- Triggered on: user speech, avatar speech, avatar state transition (speaking → listening)

---

### Data Flow

1. **Widget Lifecycle:**
   - Minimized → Click → Small + startLiveSession → Connect to LiveKit → Wire events → Attach tracks → Auto-enable mic
   - Auto-expand mode: Mount → setState("small") → startLiveSession (no user click)

2. **Speech Flow:**
   - User speaks → LiveKit data channel → DataReceived event → handleUserSpeech → Update transcripts → detectIntent
   - Avatar responds → LiveKit data channel → DataReceived event → handleAvatarSpeech → Update transcripts → detectIntent

3. **Demo Video Flow:**
   - Speech contains trigger keywords → detectIntent checks demo triggers → playDemoVideo → Maximize widget → Mute mic → Clone avatar to PIP → Play video → stopDemoVideo → Restore state to "small"

4. **Calendly Flow:**
   - Intent detected OR button clicked → pendingCalendlyRef = true → Wait for avatar to stop speaking → Maximize widget → Mute mic and audio → setShowCalendly(true) → Clone avatar to PIP → User books → Close → Unmute mic and audio → Restore state to "small"

---

## File 2: HomePage.jsx (2349 lines)

### Imports

**React Hooks:**
- `React` - React library
- `useState` - State management
- `useEffect` - Side effects, lifecycle

**External Libraries:**
- `react-router-dom` (useNavigate) - Navigation
- `react-icons/fa` (FaRocket, FaClock, FaChartLine, FaDollarSign, FaSlack, FaHubspot, FaSalesforce, FaGoogle, FaMicrosoft, FaJira, FaInstagram, FaTwitter, FaFacebookF) - Icon components
- `lucide-react` (Edit2, Eye, Pointer, Upload, User2) - Icon components

**Internal Components:**
- `StarBorder` from './ui/star-border' - Decorative border component
- `FadeInSection` from './FadeInSection' - Scroll-based fade-in animations
- `InfiniteScroll` from './ui/InfiniteScroll' - Infinite scrolling logo carousel (commented out)
- `TestimonialCard` from './ui/TestimonialCard' - Customer testimonial cards
- `PricingCard` from './ui/PricingCard' - Pricing plan cards (commented out)
- `IntegrationCard` from './ui/IntegrationCard' - Integration cards (commented out)
- `LightRays` from './ui/LightRays' - Animated light rays background
- `SimpleLightRays` from './ui/SimpleLightRays' - Simple light rays background
- `SpotlightCard` from './ui/SpotlightCard' - Card with spotlight hover effect
- `InfiniteBadges` from './ui/InfiniteBadges' - Infinite scrolling badges
- `RadarScanner` from './ui/RadarScanner' - Radar scanning animation (commented out)
- `AIChatWidget` from './AIChatWidget' - AI avatar widget

**Utils/Config:**
- `navigateToCreate` from '../utils/navigation' - Navigation helper
- `useIsMobile` from '../hooks/useIsMobile' - Mobile detection hook

---

### Props

None (top-level page component)

---

### State Variables (useState)

1. `openFAQ` - Initial: `null` - Purpose: Currently open FAQ accordion index
2. `isLoggedIn` - Initial: `false` - Purpose: User authentication state (not used, commented out)
3. `userEmail` - Initial: `""` - Purpose: User email (not used, commented out)
4. `isYearly` - Initial: `false` - Purpose: Pricing toggle (monthly/yearly) (not used, pricing section commented out)
5. `triggerAvatarFullscreen` - Initial: `false` - Purpose: Triggers fullscreen avatar widget via "Talk to Agent" button

---

### Refs (useRef)

None

---

### useEffects

1. **Dependencies: `[]`** (lines 43-78)
   - Purpose: Check authentication state on mount, listen for storage changes
   - Reads localStorage (accessToken, refreshToken, user)
   - Sets `isLoggedIn` and `userEmail` (not used, auth buttons commented out)

---

### Functions/Handlers

1. **`toggleFAQ(index)`** (lines 80-82)
   - Purpose: Toggle FAQ accordion open/close
   - Sets `openFAQ` to index or null

2. **`scrollToSection(sectionId)`** (lines 85-90)
   - Purpose: Smooth scroll to section by ID
   - Called by: Navigation links in header and footer

3. **`checkAuthState()`** (lines 44-61)
   - Purpose: Check localStorage for auth tokens and set login state
   - Called by: useEffect on mount, storage event listener

4. **`handleStorageChange(e)`** (lines 64-72)
   - Purpose: Handle storage events (login/logout in another tab)
   - Calls `checkAuthState()` when auth tokens change

---

### Event Listeners

1. **Event: `window storage`** - Handler: `handleStorageChange` - Purpose: Sync auth state across tabs

---

### UI Components/Elements

1. **Component: Navigation Bar** (lines 241-319) - Conditional: Always visible - Purpose: Logo, "Talk to Us" button, auth buttons (commented out)
2. **Component: Hero Section** (lines 326-462) - Conditional: Always visible - Purpose: Main headline, user avatars badge, "Talk to Agent" CTA button
3. **Component: Radial Gradient Overlays** (lines 189-237) - Conditional: `!isMobile` - Purpose: Visual depth backgrounds
4. **Component: SimpleLightRays Background** (lines 334-338) - Conditional: `!isMobile` - Purpose: Animated light rays on hero
5. **Component: User Avatars Badge** (lines 369-408) - Conditional: Always visible - Purpose: Social proof (200+ customers)
6. **Component: "Talk to Agent" Button** (lines 440-450) - Conditional: Always visible - Purpose: Opens fullscreen avatar widget
7. **Component: Use Cases Section** (lines 465-774) - Conditional: Always visible - Purpose: 3 benefit cards (Instant Demo, Smart Onboarding, Interactive Training)
8. **Component: InfiniteBadges** (lines 765-771) - Conditional: Always visible - Purpose: Scrolling badge carousel
9. **Component: Testimonials Section** (lines 777-888) - Conditional: Always visible - Purpose: 6 customer testimonial cards
10. **Component: Pricing Section** (lines 891-1027) - Conditional: Commented out - Purpose: Pricing cards (Starter, Enterprise)
11. **Component: Integrations Section** (lines 1101-1503) - Conditional: `{false && ...}` (fully disabled) - Purpose: Integration hub with animated beams
12. **Component: FAQ Section** (lines 1855-2071) - Conditional: Commented out - Purpose: 5 FAQ accordion items
13. **Component: Final CTA Section** (lines 2075-2133) - Conditional: Always visible - Purpose: "Grow Now with Qudemo" call-to-action
14. **Component: Footer** (lines 2135-2294) - Conditional: Always visible - Purpose: Logo, navigation links, social media, copyright
15. **Component: AIChatWidget** (lines 2338-2344) - Conditional: Always visible - Purpose: AI avatar widget, fullscreen when `triggerAvatarFullscreen=true`

---

### Conditional Rendering

1. **Mobile-specific UI** - Many decorative elements hidden on mobile (`!isMobile` conditionals)
2. **Auth buttons** - Commented out (lines 282-317)
3. **Pricing section** - Completely commented out (lines 891-1027)
4. **Integrations section** - Disabled with `{false && ...}` (lines 1101-1503)
5. **FAQ section** - Commented out (lines 1855-2071)
6. **Avatar fullscreen wrapper** - Applied when `triggerAvatarFullscreen={true}` (line 2339)

---

### Custom Hooks

1. **`useIsMobile()`** - Returns: `isMobile` (boolean) - Purpose: Detect mobile viewport for conditional rendering

---

### API Calls

None (static landing page)

---

### Third-party Integrations

1. **Service:** Cal.com - **Purpose:** Meeting booking (external link)
   - URL: `https://cal.com/jazeem-choori-7jbaio/qudemo-intro`
   - Opened via "Talk to Us" button in nav (line 270)

2. **Service:** AIChatWidget - **Purpose:** Embedded AI avatar for demos
   - Triggered by "Talk to Agent" button (line 441)
   - Fullscreen mode via CSS wrapper (lines 2323-2335)

---

### Data Structures

1. **`testimonials` array** (lines 93-154) - 6 testimonial objects with: name, role, company, rating, image, testimonial

2. **`integrations` array** (lines 157-184) - 6 integration objects with: name, icon (FaSlack, etc.), description, comingSoon flag

---

### CSS Animations

1. **`@keyframes fadeInUp`** (lines 2299-2308) - Fade in with upward motion
2. **`@keyframes fadeIn`** (lines 2310-2317) - Simple fade in
3. **`.animate-fadeIn`** (lines 2319-2321) - CSS class for fade-in animation
4. **`.avatar-fullscreen-wrapper`** (lines 2323-2335) - Forces fullscreen positioning for avatar widget

---

## File 3: ExtendedAvatarPage.jsx (67 lines)

### Imports

**React Hooks:**
- `useState` from 'react' - State management

**Internal Components:**
- `AIChatWidget` from './AIChatWidget' - AI avatar widget

**Utils/Config:**
- `styles` from './ExtendedAvatarPage.module.css' - CSS modules

---

### Props

None (top-level route component for /extended)

---

### State Variables (useState)

1. `isStarted` - Initial: `false` - Purpose: Whether conversation has started (shows landing vs widget)
2. `sessionKey` - Initial: `0` - Purpose: Force new widget instance on each session (React key prop)
3. `isLoading` - Initial: `false` - Purpose: Loading state during connection

---

### Refs (useRef)

None

---

### useEffects

None

---

### Functions/Handlers

1. **`handleStartConversation()`** (lines 13-18)
   - Purpose: Handle "Start Conversation" button click
   - Sets loading state, shows widget, clears loading after 500ms
   - Called by: "Start Conversation" button

2. **`handleDisconnect()`** (lines 21-26)
   - Purpose: Handle disconnect callback from AIChatWidget
   - Resets to landing page, increments sessionKey to force new widget instance
   - Called by: AIChatWidget's onDisconnect callback

---

### Event Listeners

None

---

### UI Components/Elements

1. **Component: Landing Page** (lines 31-51) - Conditional: `!isStarted` - Purpose: Avatar preview, "Start Conversation" button
2. **Component: Avatar Preview Image** (lines 34-37) - Conditional: `!isStarted` - Purpose: Shows `/ai-avatar.jpg` as background
3. **Component: Text Container** (lines 39-42) - Conditional: `!isStarted` - Purpose: "Qudemo Assistant" title and subtitle
4. **Component: Start Conversation Button** (lines 44-50) - Conditional: `!isStarted` - Purpose: Starts session, shows "Connecting..." when loading
5. **Component: Widget Container** (lines 54-60) - Conditional: `isStarted` - Purpose: Full-screen widget wrapper
6. **Component: AIChatWidget** (line 58) - Conditional: `isStarted` - Purpose: AI avatar widget with auto-expand

---

### Conditional Rendering

1. **Landing vs Widget** - Shows landing page when `!isStarted`, widget when `isStarted`
2. **Button Loading State** - Button text changes to "Connecting..." when `isLoading`
3. **Button Disabled** - Button disabled when `isLoading`

---

### Custom Hooks

None

---

### API Calls

None (delegates to AIChatWidget)

---

### Third-party Integrations

None (delegates to AIChatWidget)

---

### Data Flow

1. **Page Load:**
   - Shows landing page with avatar preview
   - User clicks "Start Conversation"
   - `handleStartConversation()` sets `isLoading=true`, `isStarted=true`
   - Widget renders with `autoExpand={true}` and `key={sessionKey}`
   - Widget auto-starts LiveKit session

2. **Disconnect:**
   - User clicks disconnect in widget
   - AIChatWidget calls `onDisconnect()` callback
   - `handleDisconnect()` resets `isStarted=false`, increments `sessionKey`
   - Returns to landing page, widget unmounts completely (new instance next time)

---

## File 4: useEventLogger.js (Custom Hook - 57 lines)

### Purpose
Event logging system for debugging AIChatWidget

### State Variables

1. `logs` - Initial: `[]` - Purpose: Array of log entries

### Functions

1. **`log(category, message, data)`** (lines 6-20)
   - Purpose: Add log entry to array and console
   - Creates entry with timestamp, category, message, data
   - Uses emoji prefix based on category

2. **`clearLogs()`** (lines 22-24)
   - Purpose: Clear all logs

3. **`getCategoryEmoji(category)`** (lines 29-55)
   - Purpose: Get emoji for log category
   - Categories: SYSTEM, SESSION, API, LIVEKIT, EVENTS, ROOM_EVENT, PARTICIPANT, TRACK, etc.

### Returns

`{logs, log, clearLogs}`

---

## File 5: useDemoVideo.js (Custom Hook - 165 lines)

### Purpose
Demo video playback management for AIChatWidget

### State Variables

1. `isDemoPlaying` - Initial: `false` - Purpose: Demo playback status
2. `currentVideoUrl` - Initial: `''` - Purpose: Current demo video URL

### Refs

1. `demoVideoRef` - Initial: `null` - Purpose: Video element reference

### useEffects

1. **Dependencies: `[isDemoPlaying, currentVideoUrl, log]`** (lines 9-58)
   - Purpose: Handle video loading when demo starts
   - Sets video src, loads video, plays on canplay event

### Functions

1. **`playDemoVideo(videoUrl)`** (lines 60-116)
   - Purpose: Start demo video playback
   - Mutes microphone during demo
   - Clones avatar video to PIP container
   - Sets state to trigger video loading in useEffect

2. **`stopDemoVideo()`** (lines 118-154)
   - Purpose: Stop demo video playback
   - Keeps microphone muted after demo (avatar returns to idle)
   - Clears PIP container
   - Resets demo video element

### Returns

`{isDemoPlaying, currentVideoUrl, demoVideoRef, playDemoVideo, stopDemoVideo}`

---

## File 6: video-triggers.json (Configuration - 41 lines)

### Purpose
Demo video trigger configuration for keyword-based video playback

### Structure

**`triggers` array** - 5 trigger objects:

1. **nvidia-demo**
   - Primary keywords: ["rendering", "render", "demo"]
   - Secondary keywords: ["nvidia", "gpu"]
   - Video URL: https://storage.googleapis.com/video_db/nvidia.mp4

2. **microsoft-demo**
   - Primary keywords: ["rendering", "render", "demo"]
   - Secondary keywords: ["microsoft", "enterprise"]
   - Video URL: https://storage.googleapis.com/video_db/microsoft.mp4

3. **apple-demo**
   - Primary keywords: ["rendering", "render", "demo"]
   - Secondary keywords: ["apple", "ios", "macos"]
   - Video URL: https://storage.googleapis.com/video_db/apple.mp4

4. **google-demo**
   - Primary keywords: ["rendering", "render", "demo"]
   - Secondary keywords: ["google", "search", "workspace"]
   - Video URL: https://storage.googleapis.com/video_db/google.mp4

5. **generic-demo**
   - Primary keywords: ["rendering", "render", "demo"]
   - Secondary keywords: [] (fallback)
   - Video URL: https://storage.googleapis.com/video_db/demo.mp4

---

## File 7: booking-config.json (Configuration - 4 lines)

### Purpose
Calendly booking URL configuration

### Structure

**`calendlyUrl`** - String: `"https://cal.com/jazeem-choori-7jbaio/qudemo-intro"`

---

# Summary Statistics

## AIChatWidget.jsx
- **Total Lines:** 2318
- **State Variables:** 23
- **Refs:** 13
- **useEffects:** 10
- **Functions:** 20
- **Event Listeners:** 7
- **UI Components:** 15
- **API Calls:** 2
- **Third-party Integrations:** 3 (HeyGen, LiveKit, Calendly)

## HomePage.jsx
- **Total Lines:** 2349
- **State Variables:** 5
- **Refs:** 0
- **useEffects:** 1
- **Functions:** 4
- **Event Listeners:** 1
- **UI Components:** 15
- **API Calls:** 0
- **Third-party Integrations:** 2 (Cal.com, AIChatWidget)

## ExtendedAvatarPage.jsx
- **Total Lines:** 67
- **State Variables:** 3
- **Refs:** 0
- **useEffects:** 0
- **Functions:** 2
- **Event Listeners:** 0
- **UI Components:** 6
- **API Calls:** 0
- **Third-party Integrations:** 0 (delegates to AIChatWidget)
