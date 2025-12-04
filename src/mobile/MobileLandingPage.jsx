import React, { useState, useEffect, useRef } from 'react';
import { MobileAvatarWidget } from './components/MobileAvatarWidget';

/**
 * Mobile Landing Page (Epic 2 - Session Management)
 *
 * Mobile-optimized version of desktop HomePage
 * Key differences:
 * - No animations (SimpleLightRays, LightRays, RadarScanner removed)
 * - Fullscreen by default
 * - Audio unlock pattern for iOS/Android
 * - Session key pattern for fresh instances
 * - Loading state with 500ms delay
 * - 100dvh viewport height
 */

// Module-scoped variables for audio unlock (avoid global pollution)
let audioUnlocked = false;
let audioUnlockAttempts = 0;
const MAX_AUDIO_UNLOCK_ATTEMPTS = 3;

const MobileLandingPage = () => {
  const [triggerAvatarFullscreen, setTriggerAvatarFullscreen] = useState(false);
  const [sessionKey, setSessionKey] = useState(0); // Session key pattern for fresh instances
  const [loading, setLoading] = useState(false); // Loading state
  const [audioError, setAudioError] = useState(null); // Audio unlock errors

  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  /**
   * Audio Unlock Strategy (iOS/Android requirement)
   *
   * Mobile browsers require audio to be unlocked in user gesture context.
   * This function MUST be called synchronously within a click handler.
   */
  const unlockAudioContext = async () => {
    audioUnlockAttempts++;

    if (audioUnlockAttempts > MAX_AUDIO_UNLOCK_ATTEMPTS) {
      setAudioError('Audio unlock failed after 3 attempts. Please check your device settings.');
      return false;
    }

    // Create temporary audio element
    const unlockAudioEl = document.createElement("audio");
    // Silent MP3 base64 (required for iOS)
    unlockAudioEl.src = "data:audio/mpeg;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsuY29tIC8gTGFTb25vdGhlcXVlLm9yZwBURU5DAAAAHQAAA1N3aXRjaCBQbHVzIMKpIE5DSCBTb2Z0d2FyZQBUSVQyAAAABgAAAzIyMzUAVFNTRQAAAA8AAANMYXZmNTcuODMuMTAwAAAAAAAAAAAAAAD/80DEAAAAA0gAAAAATEFNRTMuMTAwVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQsRbAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQMSkAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV";

    try {
      // CRITICAL: Await play() promise
      await unlockAudioEl.play();
      audioUnlocked = true;

      // CRITICAL: Clear src and remove element (iOS requirement)
      unlockAudioEl.src = '';
      unlockAudioEl.remove();

      console.log('[AudioUnlock] ✅ Audio unlocked successfully');
      return true;
    } catch (error) {
      console.error('[AudioUnlock] ❌ Audio unlock failed:', error);

      // Clean up on error
      unlockAudioEl.src = '';
      unlockAudioEl.remove();

      return false;
    }
  };

  /**
   * Handle "Talk to Agent" button click
   *
   * Epic 2 Implementation:
   * 1. Show loading state (prevents double-click)
   * 2. Unlock audio in gesture context
   * 3. Pre-create audio element for avatar (CRITICAL for mobile)
   * 4. Wait 500ms (loading delay)
   * 5. Trigger avatar fullscreen
   */
  const handleTalkToAgent = async () => {
    if (loading) return; // Prevent double-click

    setLoading(true);
    setAudioError(null);

    // Step 1: Unlock audio (MUST be synchronous in gesture context)
    const unlockSuccess = await unlockAudioContext();

    if (!unlockSuccess) {
      console.warn('[AudioUnlock] Audio unlock failed, but continuing anyway...');
      // Don't block user - some browsers are more lenient
    }

    // Step 2: CRITICAL - Pre-create audio element in gesture context for mobile
    // This ensures avatar audio can play without additional user interaction
    const audioEl = document.createElement("audio");
    audioEl.autoplay = true;
    audioEl.playsInline = true;
    audioEl.setAttribute('playsinline', ''); // iOS compatibility
    audioEl.setAttribute('webkit-playsinline', ''); // Older iOS
    audioEl.muted = false;
    audioEl.volume = 1.0;
    audioEl.id = "avatar-audio-preload"; // ID so widget can find it
    audioEl.style.display = "none";
    document.body.appendChild(audioEl);

    // Try to play silent audio to fully unlock (with timeout to prevent hanging)
    try {
      const playPromise = audioEl.play();
      // Don't wait for play() - continue immediately
      playPromise
        .then(() => console.log('[AudioUnlock] ✅ Audio element pre-created and unlocked'))
        .catch(e => console.warn('[AudioUnlock] Pre-created audio play failed:', e.message));
    } catch (e) {
      console.warn('[AudioUnlock] Pre-created audio play error:', e.message);
    }

    // Step 3: 500ms delay (prevents UI flash, shows "Starting..." feedback)
    setTimeout(() => {
      if (!mountedRef.current) return;

      setTriggerAvatarFullscreen(true);
      setLoading(false);
    }, 500);
  };

  /**
   * Handle disconnect from avatar
   *
   * Session Key Pattern (Gap #3):
   * Increment sessionKey to force React to create a fresh MobileAvatarWidget instance.
   * This prevents state leaks between sessions.
   */
  const handleDisconnect = () => {
    setTriggerAvatarFullscreen(false);
    setSessionKey(prev => prev + 1); // CRITICAL: Force fresh instance
    console.log('[Session] Disconnected, session key incremented to:', sessionKey + 1);
  };

  return (
    <div
      style={{
        height: '100dvh', // Mobile-optimized viewport height
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '20px',
        textAlign: 'center',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        overflow: 'hidden',
      }}
    >
      {/* Landing Page Content */}
      {!triggerAvatarFullscreen && (
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            padding: '40px',
            maxWidth: '400px',
            width: '100%',
          }}
        >
          <h1 style={{ fontSize: '32px', marginBottom: '16px', fontWeight: '600' }}>
            Talk to Our AI Agent
          </h1>
          <p style={{ fontSize: '18px', marginBottom: '32px', opacity: 0.9 }}>
            Experience the future of interactive demos
          </p>

          {/* Error Message */}
          {audioError && (
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid rgba(239, 68, 68, 0.5)',
                borderRadius: '12px',
                padding: '12px',
                marginBottom: '20px',
                fontSize: '14px',
              }}
            >
              {audioError}
            </div>
          )}

          {/* Talk to Agent Button */}
          <button
            onClick={handleTalkToAgent}
            disabled={loading}
            style={{
              background: loading ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.95)',
              color: loading ? 'rgba(102, 126, 234, 0.5)' : '#667eea',
              border: 'none',
              borderRadius: '12px',
              padding: '16px 32px',
              fontSize: '18px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              width: '100%',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            {loading ? (
              <>
                <div
                  style={{
                    width: '20px',
                    height: '20px',
                    border: '2px solid rgba(102, 126, 234, 0.3)',
                    borderTopColor: '#667eea',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                  }}
                />
                Starting...
              </>
            ) : (
              '🎤 Talk to Agent'
            )}
          </button>

          <div
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '16px',
              marginTop: '24px',
              fontSize: '12px',
              opacity: 0.8,
            }}
          >
            <p>Epic 2: Core Session Management</p>
            <p style={{ marginTop: '8px' }}>✅ Session key pattern</p>
            <p>✅ Loading state (500ms)</p>
            <p>✅ Audio unlock</p>
          </div>
        </div>
      )}

      {/* Avatar Widget - Fullscreen */}
      {triggerAvatarFullscreen && (
        <MobileAvatarWidget
          key={sessionKey} // CRITICAL: Forces fresh instance on each session
          autoExpand={true}
          onDisconnect={handleDisconnect}
        />
      )}

      {/* Keyframes for loading spinner */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default MobileLandingPage;
