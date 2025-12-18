# Tavus Integration - Complete Code Flow Documentation

This document explains the complete code flow of the Tavus integration in the frontend serverless system.

## Architecture Overview

```
Frontend (React) → Serverless API → Tavus API → Daily.co → Frontend (Video/Audio)
```

## 1. Route & Entry Point

**File**: `frontend/src/App.js`
- Route: `/v2-avatar/:personaId?`
- Component: `TavusAvatarPage`
- Extracts `personaId` from URL params

**File**: `frontend/src/v2-avatar/components/TavusAvatarPage.jsx`
- Landing page with start button
- Passes `personaId` to `TavusAvatarWidget`

## 2. Widget Initialization

**File**: `frontend/src/v2-avatar/components/TavusAvatarWidget.jsx`

### Initial State
- Receives `personaId` prop from page
- State: `isConnecting = false`, `hasLiveVideo = false`, `hasAudio = false`
- Auto-expands on mount if `autoExpand = true`

### Auto-Start Flow
```javascript
useEffect(() => {
  if (autoExpand && !hasAutoExpandedRef.current) {
    startTavusSession();
  }
}, [autoExpand]);
```

## 3. Session Creation Flow

### Step 1: Create Conversation (Serverless API)

**File**: `frontend/api/tavus/create-conversation.mjs`

**Endpoint**: `POST /api/tavus/create-conversation`

**Request Body**:
```javascript
{
  personaId: "pf5e3d8bef4a",  // From URL param
  userId: "default-user",     // Optional
  language: "english"         // Optional
}
```

**Process**:
1. Validates `TAVUS_API_KEY` from environment
2. Uses `personaId` from request or falls back to `TAVUS_PERSONA_ID` env var
3. Calls Tavus API: `POST https://tavusapi.com/v2/conversations`
4. Payload: `{ persona_id, properties: { language } }`

**Response**:
```javascript
{
  conversationId: "conv_xxx",
  conversationUrl: "https://daily.co/room-url",  // Daily.co room URL
  conversationName: "Qatar Expert",
  status: "active",
  createdAt: "2025-01-..."
}
```

**Frontend Call**:
```javascript
// In TavusAvatarWidget.jsx
const resp = await fetch(getCreateConversationUrl(), {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ personaId })
});
```

### Step 2: Initialize Daily.co Session

**File**: `frontend/src/v2-avatar/utils/TavusSessionManager.js`

**Process**:
1. Creates Daily.co call object: `DailyIframe.createCallObject()`
2. Joins Daily.co room using `conversationUrl` from Tavus
3. Sets up event listeners for:
   - `participant-joined` - When replica avatar joins
   - `track-started` - When video/audio tracks start
   - `track-stopped` - When tracks stop
   - `error` - Connection errors

**Code Flow**:
```javascript
// Create Daily call object
this.daily = DailyIframe.createCallObject({
  subscribeToTracksAutomatically: true,
  dailyConfig: { ... }
});

// Join room
await this.daily.join({ url: conversationUrl });

// Wait for replica participant
this.daily.on('participant-joined', (event) => {
  if (event.participant.user_name === 'replica') {
    this.replicaParticipantId = event.participant.session_id;
  }
});

// Wait for tracks
this.daily.on('track-started', (event) => {
  if (event.track.kind === 'video') {
    this.attachVideoTrack(event.track);
  }
  if (event.track.kind === 'audio') {
    this.attachAudioTrack(event.track);
  }
});
```

### Step 3: Setup Event Manager

**File**: `frontend/src/v2-avatar/utils/DailyEventManager.js`

**Process**:
1. Attaches to Daily.co call object
2. Listens for `app-message` events (Tavus sends events via Daily.co data channel)
3. Routes events to appropriate callbacks

**Event Types Handled**:
- `system.replica_joined` - Avatar joined
- `conversation.user.started_speaking` - User started talking
- `conversation.user.stopped_speaking` - User stopped talking
- `conversation.replica.started_speaking` - Avatar started talking
- `conversation.replica.stopped_speaking` - Avatar stopped talking
- `conversation.utterance` - Transcripts (user/replica speech)
- `conversation.tool_call` - Function calls (videos, PDFs, calendly)

**Code Flow**:
```javascript
// Attach to Daily
dailyEventManager.attachToDaily(daily, conversationId);

// Listen for app-message events
this.daily.on('app-message', (event) => {
  const { event_type, properties } = event.data;
  
  switch (event_type) {
    case 'conversation.utterance':
      // Handle transcript
      break;
    case 'conversation.tool_call':
      // Handle tool call
      break;
    // ... other events
  }
});
```

### Step 4: Wait for Ready State

**File**: `frontend/src/v2-avatar/utils/TavusSessionManager.js`

**Process**:
1. Waits for both video and audio tracks to be ready
2. Creates video element and attaches video track
3. Creates audio element and attaches audio track
4. Resolves ready promise when both are available

**Code**:
```javascript
async waitForReady(timeoutMs = 15000) {
  await Promise.race([
    Promise.all([this.videoReadyPromise, this.audioReadyPromise]),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), timeoutMs)
    )
  ]);
}
```

## 4. Conversation Flow

### User Speaks
1. User's microphone captures audio
2. Daily.co sends audio to Tavus
3. Tavus processes speech → LLM generates response
4. Tavus sends events back via Daily.co `app-message`:

**Events Received**:
- `conversation.user.started_speaking`
- `conversation.user.stopped_speaking`
- `conversation.utterance` (with `role: 'user'`)

### Avatar Responds
1. Tavus generates avatar video/audio
2. Daily.co receives video/audio tracks
3. Frontend displays video, plays audio
4. Events received:
   - `conversation.replica.started_speaking`
   - `conversation.replica.stopped_speaking`
   - `conversation.utterance` (with `role: 'replica'`)

### Tool Calls (Videos, PDFs, Calendly)
1. Persona's LLM decides to call a tool
2. Tavus sends `conversation.tool_call` event
3. Frontend receives via `DailyEventManager`
4. Routes to `handleToolCall()` in widget

**Tool Call Structure**:
```javascript
{
  event_type: 'conversation.tool_call',
  properties: {
    name: 'show_demo_video',
    arguments: {
      url: 'https://www.youtube.com/watch?v=xxx',
      title: 'Video Title'
    }
  }
}
```

**Tool Handling**:
```javascript
// In TavusAvatarWidget.jsx
const handleToolCall = (name, args) => {
  switch (name) {
    case 'show_demo_video':
      // Store video URL
      pendingDemoVideoRef.current = args.url;
      // Wait for avatar to finish speaking
      // Then play video
      break;
    case 'show_pdf':
      // Show PDF overlay
      break;
    case 'schedule_meeting':
      // Open Calendly
      break;
  }
};
```

## 5. Video Playback Flow

**File**: `frontend/src/v2-avatar/hooks/useDemoVideo.js`

**Process**:
1. Tool call received → video URL stored
2. Wait for avatar to finish speaking
3. Mute avatar audio
4. Show video overlay
5. Play YouTube video (or direct URL)
6. When video ends → restore avatar audio

**Code Flow**:
```javascript
// Wait for speaking to stop
useEffect(() => {
  if (!isAvatarSpeaking && pendingDemoVideoRef.current) {
    // Play video
    playDemoVideo(pendingDemoVideoRef.current);
    pendingDemoVideoRef.current = null;
  }
}, [isAvatarSpeaking]);
```

## 6. Session End Flow

### User Disconnects
**File**: `frontend/src/v2-avatar/components/TavusAvatarWidget.jsx`

**Process**:
1. User clicks disconnect button
2. Calls `stopTavusSession()`
3. Calls serverless API: `POST /api/tavus/end-conversation`
4. Leaves Daily.co room
5. Cleans up session manager and event manager

**Serverless Endpoint**: `frontend/api/tavus/end-conversation.mjs`
- Calls Tavus API: `POST https://tavusapi.com/v2/conversations/{id}/end`
- Returns success/error

## 7. Development Server

**File**: `frontend/dev-server.mjs`

**Purpose**: Local development server that proxies serverless functions

**Endpoints**:
- `POST /api/tavus/create-conversation` → `./api/tavus/create-conversation.mjs`
- `POST /api/tavus/end-conversation` → `./api/tavus/end-conversation.mjs`
- `POST /api/mobile-logs` → Logs frontend events

**Usage**:
```bash
node dev-server.mjs  # Runs on port 5000
npm start            # React app on port 3000
```

## 8. Configuration

**File**: `frontend/src/v2-avatar/config/api.js`

**Environment Variables**:
- Development: `http://localhost:5000` (dev-server)
- Production: `''` (relative URLs to Vercel serverless)

**API URLs**:
- `getCreateConversationUrl()` → `/api/tavus/create-conversation`
- `getEndConversationUrl()` → `/api/tavus/end-conversation`

## 9. Key Components Summary

| Component | Purpose | Key Methods |
|-----------|---------|-------------|
| `TavusAvatarPage` | Page wrapper | Extracts personaId, manages start/stop |
| `TavusAvatarWidget` | Main widget | UI, session management, tool handling |
| `TavusSessionManager` | Daily.co session | `initialize()`, `waitForReady()`, `cleanup()` |
| `DailyEventManager` | Event handling | `attachToDaily()`, `_handleAppMessage()` |
| `create-conversation.mjs` | Serverless API | Creates Tavus conversation |
| `end-conversation.mjs` | Serverless API | Ends Tavus conversation |

## 10. Event Flow Diagram

```
User Action
    ↓
TavusAvatarWidget
    ↓
Serverless API (/api/tavus/create-conversation)
    ↓
Tavus API (creates conversation)
    ↓
Returns Daily.co room URL
    ↓
TavusSessionManager (joins Daily.co room)
    ↓
Daily.co (connects to room)
    ↓
Tavus (sends video/audio tracks via Daily.co)
    ↓
TavusSessionManager (attaches tracks to DOM)
    ↓
DailyEventManager (listens for app-message events)
    ↓
TavusAvatarWidget (handles events, tool calls)
    ↓
UI Updates (video display, transcripts, etc.)
```

## 11. Tool Call Flow

```
Persona LLM decides to call tool
    ↓
Tavus sends conversation.tool_call event
    ↓
Daily.co app-message event
    ↓
DailyEventManager._handleAppMessage()
    ↓
Routes to _handleToolCall()
    ↓
Calls callback: onToolCall(name, args)
    ↓
TavusAvatarWidget.handleToolCall()
    ↓
Switch on tool name:
  - show_demo_video → Play video
  - show_pdf → Show PDF
  - schedule_meeting → Open Calendly
```

## 12. Error Handling

**Connection Errors**:
- Retry button shown
- Error message displayed
- Session cleanup on failure

**Track Errors**:
- Video/audio track failures logged
- Fallback behavior (continue without video/audio)

**API Errors**:
- Serverless functions return error responses
- Frontend displays error messages
- User can retry connection

## 13. State Management

**Widget State**:
- `isConnecting` - Connection in progress
- `hasLiveVideo` - Video track available
- `hasAudio` - Audio track available
- `isAvatarSpeaking` - Avatar currently speaking
- `isUserSpeaking` - User currently speaking
- `transcripts` - Array of conversation transcripts
- `showCalendly` - Calendly overlay visible
- `isDemoPlaying` - Video overlay visible

**Session State**:
- `sessionInfo` - { conversationId, conversationUrl }
- `sessionManagerRef` - TavusSessionManager instance
- `dailyEventManagerRef` - DailyEventManager instance

## 14. Production Deployment

**Vercel Serverless Functions**:
- `api/tavus/create-conversation.mjs` → `/api/tavus/create-conversation`
- `api/tavus/end-conversation.mjs` → `/api/tavus/end-conversation`

**Environment Variables** (Vercel):
- `TAVUS_API_KEY` - Tavus API key
- `TAVUS_PERSONA_ID` - Default persona ID (optional)

**Frontend Build**:
- React app builds to `build/` directory
- Serverless functions in `api/` directory
- Both deployed to Vercel

## 15. Key Differences from HeyGen/LiveKit

| Feature | HeyGen/LiveKit | Tavus/Daily.co |
|---------|----------------|----------------|
| **Transport** | LiveKit Room | Daily.co Room |
| **Events** | `RoomEvent.DataReceived` | `app-message` via Daily |
| **Tracks** | `track.attach(element)` | Daily handles automatically |
| **Tool Calls** | Not native | Native `conversation.tool_call` |
| **API** | `api.liveavatar.com` | `tavusapi.com/v2` |
| **Session** | Session Token | Conversation ID |

## 16. Testing

**Local Development**:
1. Start dev server: `node dev-server.mjs`
2. Start React: `npm start`
3. Visit: `http://localhost:3000/v2-avatar/{personaId}`

**Test Personas**:
- Human Evolution: `p99b6eb28083`
- Qatar Expert: `pf5e3d8bef4a`

**Test Flow**:
1. Page loads → Auto-starts session
2. Wait for video/audio
3. Speak to avatar
4. Avatar responds
5. Tool calls trigger videos/PDFs
6. Disconnect ends session

## 17. Debugging

**Console Logs**:
- `[TAVUS-WIDGET]` - Widget events
- `[TavusSessionManager]` - Session manager events
- `[DailyEventManager]` - Event manager events
- `[TOOL_CALL]` - Tool call events

**Debug Logs**:
- Widget maintains `debugLogs` array
- Shows last 10 log entries in UI
- Can be sent to backend via `/api/mobile-logs`

**Network Tab**:
- Check `/api/tavus/create-conversation` requests
- Check `/api/tavus/end-conversation` requests
- Check Daily.co WebSocket connections


