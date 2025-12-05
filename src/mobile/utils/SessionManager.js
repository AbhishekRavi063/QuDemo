/**
 * SessionManager - Robust LiveKit session manager for mobile avatar
 *
 * Root Problems Solved:
 * - Race conditions between TrackSubscribed events and existing tracks check
 * - Duplicate track attachments from multiple code paths
 * - Unpredictable ready state - spinner hiding before actually ready
 * - Scattered state management across component
 * - No guaranteed sequencing of audio → video → ready
 *
 * Solution:
 * - Single source of truth for session state
 * - Idempotent track attachment - safe to call multiple times
 * - Promise-based readiness - await until fully ready
 * - Manages both video and audio tracks with native HTML elements
 * - Clean lifecycle: initialize → waitForReady → cleanup
 */

class SessionManager {
  constructor() {
    this.instanceId = Math.random().toString(36).substring(7); // Unique ID for tracking
    this.room = null;
    this.videoTrack = null;
    this.audioTrack = null;
    this.isInitialized = false;
    this.logger = null;

    // Promise resolvers for ready state
    this.videoReadyResolve = null;
    this.audioReadyResolve = null;
    this.videoReadyPromise = null;
    this.audioReadyPromise = null;

    // DOM references
    this.videoElement = null;
    this.videoContainer = null;
    this.audioElement = null; // Add audio element reference
  }

  /**
   * Set logging function
   */
  setLogger(logFn) {
    this.logger = logFn;
  }

  log(message) {
    if (this.logger) {
      this.logger(message);
    }
    console.log('[SessionManager]', message);
  }

  /**
   * Log with call stack - shows who called this function
   */
  logWithStack(message) {
    const stack = new Error().stack;
    const lines = stack.split('\n');
    // Line 0 is "Error", Line 1 is logWithStack, Line 2 is the method that called logWithStack, Line 3 is the ACTUAL caller
    const caller = lines[3] || 'unknown';
    const callerInfo = caller.trim().replace(/^at\s+/, '');
    this.log(`${message} | CALLED FROM: ${callerInfo}`);
  }

  /**
   * Initialize session manager with LiveKit room
   * Sets up all event listeners and prepares for tracks
   */
  async initialize(room, videoContainerId = 'live-video-container') {
    this.log(`[${this.instanceId}] Initializing SessionManager...`);

    this.room = room;
    this.videoContainer = document.getElementById(videoContainerId);

    if (!this.videoContainer) {
      this.log(`⚠️ Video container #${videoContainerId} not found in DOM`);
    }

    // Create ready promises
    this.videoReadyPromise = new Promise(resolve => {
      this.videoReadyResolve = resolve;
    });

    this.audioReadyPromise = new Promise(resolve => {
      this.audioReadyResolve = resolve;
    });

    this.isInitialized = true;
    this.log('✅ SessionManager initialized');
    return true;
  }

  /**
   * Attach video track - idempotent, safe to call multiple times
   * Returns: boolean - true if attached, false if already attached or failed
   */
  async attachVideoTrack(track) {
    this.logWithStack(`[${this.instanceId}] attachVideoTrack() called`);

    // Already have video? Skip
    if (this.videoTrack) {
      this.log('Video track already attached, skipping');
      return false;
    }

    this.log(`Attaching video track: ${track.sid}`);

    try {
      // Wait for video container if not ready
      if (!this.videoContainer) {
        this.log('Waiting for video container...');
        await this.waitForVideoContainer();
      }

      // Create or reuse video element
      let videoEl = this.videoContainer.querySelector('video');
      if (!videoEl) {
        videoEl = document.createElement('video');
        videoEl.autoplay = true;
        videoEl.playsInline = true;
        videoEl.muted = true; // Audio handled separately via audio track attachment
        videoEl.style.width = '100%';
        videoEl.style.height = '100%';
        videoEl.style.objectFit = 'cover';
        videoEl.style.backgroundColor = '#000';
        this.videoContainer.appendChild(videoEl);
        this.log('Video element created');
      }

      // Attach track
      track.attach(videoEl);
      this.videoElement = videoEl;
      this.videoTrack = track;

      // Force play
      await videoEl.play().catch(e => this.log(`Video autoplay blocked: ${e.message}`));

      this.log('✅ Video track attached and playing');

      // Resolve ready promise
      if (this.videoReadyResolve) {
        this.videoReadyResolve();
        this.videoReadyResolve = null;
      }

      return true;

    } catch (error) {
      this.log(`❌ Failed to attach video track: ${error.message}`);
      console.error('[SessionManager] Video error:', error);
      return false;
    }
  }

  /**
   * Attach audio track - idempotent, uses LiveKit native audio playback
   * Returns: boolean - true if attached, false if already attached or failed
   */
  async attachAudioTrack(track) {
    this.logWithStack(`[${this.instanceId}] attachAudioTrack() called`);

    // Already have audio? Skip
    if (this.audioTrack) {
      this.log('Audio track already attached, skipping');
      return false;
    }

    this.log(`Attaching audio track: ${track.sid}`);

    try {
      // AIDEV-NOTE: CRITICAL FIX - Attach track to HTML audio element
      // AIDEV-NOTE: room.startAudio() unlocks AudioContext, but we must attach track to <audio> element
      // AIDEV-NOTE: This is required for audio to actually play through device speakers on mobile

      // Create audio element if it doesn't exist
      if (!this.audioElement) {
        this.audioElement = document.createElement('audio');
        this.audioElement.autoplay = true;
        this.audioElement.playsInline = true;
        this.audioElement.muted = false; // CRITICAL: Must be unmuted to hear audio
        this.audioElement.volume = 1.0; // Set volume to maximum
        this.audioElement.style.display = 'none'; // Hidden audio element
        document.body.appendChild(this.audioElement);
        this.log('Audio element created and added to DOM');
      }

      // Attach track to audio element
      track.attach(this.audioElement);
      this.audioTrack = track;

      this.log(`📊 Audio BEFORE play: muted=${this.audioElement.muted}, volume=${this.audioElement.volume}, paused=${this.audioElement.paused}, readyState=${this.audioElement.readyState}, hasSrcObject=${!!this.audioElement.srcObject}`);

      // Force play (should work because room.startAudio() was called)
      try {
        await this.audioElement.play();
        this.log('✅ audioElement.play() succeeded');
      } catch (e) {
        this.log(`⚠️ audioElement.play() error: ${e.name} - ${e.message}`);
      }

      this.log(`📊 Audio AFTER play: muted=${this.audioElement.muted}, volume=${this.audioElement.volume}, paused=${this.audioElement.paused}, readyState=${this.audioElement.readyState}`);

      // AIDEV-NOTE: CRITICAL FIX - Ensure audio is unmuted after attachment
      // AIDEV-NOTE: iOS Safari may reset muted state during track attachment
      // AIDEV-NOTE: Force unmute here to guarantee audio plays on first connection
      if (this.audioElement.muted) {
        this.log('⚠️ Audio element was muted after attachment - forcing unmute');
        this.audioElement.muted = false;
      }

      // AIDEV-NOTE: iOS Chrome fix - ensure audio is playing and not paused
      if (this.audioElement.paused) {
        this.log('⚠️ Audio element is paused after play() - retrying play()');
        try {
          await this.audioElement.play();
          this.log(`📊 Retry play result: paused=${this.audioElement.paused}`);
        } catch (e) {
          this.log(`⚠️ Retry play error: ${e.name} - ${e.message}`);
        }
      }

      // Resolve ready promise
      if (this.audioReadyResolve) {
        this.audioReadyResolve();
        this.audioReadyResolve = null;
      }

      return true;

    } catch (error) {
      this.log(`❌ Failed to attach audio track: ${error.message}`);
      return false;
    }
  }

  /**
   * Wait for video container to be available in DOM
   */
  async waitForVideoContainer(maxRetries = 10, delayMs = 100) {
    for (let i = 0; i < maxRetries; i++) {
      this.videoContainer = document.getElementById('live-video-container');
      if (this.videoContainer) {
        this.log('Video container found');
        return true;
      }
      this.log(`Video container not ready, retry ${i + 1}/${maxRetries}...`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
    this.log('⚠️ Video container never became available');
    return false;
  }

  /**
   * Wait for both audio and video to be ready
   * Returns: Promise that resolves when session is fully ready
   */
  async waitForReady(timeoutMs = 10000) {
    this.log('Waiting for session to be ready (audio + video)...');

    try {
      // Race against timeout
      await Promise.race([
        Promise.all([this.audioReadyPromise, this.videoReadyPromise]),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Session ready timeout')), timeoutMs)
        )
      ]);

      this.log('✅ Session fully ready (audio + video)');
      return true;

    } catch (error) {
      this.log(`⚠️ Session ready timeout or error: ${error.message}`);
      // Return true anyway if we have at least audio OR video
      return !!(this.audioTrack || this.videoTrack);
    }
  }

  /**
   * Check if video track is already attached
   */
  hasVideo() {
    return !!this.videoTrack;
  }

  /**
   * Check if audio track is already attached
   */
  hasAudio() {
    return !!this.audioTrack;
  }

  /**
   * Check if session is fully ready
   */
  isReady() {
    return this.hasVideo() && this.hasAudio();
  }

  /**
   * Detach video track
   */
  detachVideo() {
    if (this.videoTrack) {
      this.videoTrack.detach();
      this.videoTrack = null;
      this.log('Video track detached');
    }
    if (this.videoElement) {
      this.videoElement.srcObject = null;
      this.videoElement = null;
    }
  }

  /**
   * Mute/unmute audio output (speaker control)
   */
  setAudioMuted(muted) {
    this.logWithStack(`🔊 setAudioMuted(${muted}) called`);

    if (this.audioElement) {
      this.log(`📊 BEFORE setAudioMuted(${muted}): muted=${this.audioElement.muted}, volume=${this.audioElement.volume}, paused=${this.audioElement.paused}`);

      this.audioElement.muted = muted;

      this.log(`✅ AFTER setAudioMuted(${muted}): muted=${this.audioElement.muted}, volume=${this.audioElement.volume}, paused=${this.audioElement.paused}`);

      // AIDEV-NOTE: If unmuting and audio is paused, try to play
      if (!muted && this.audioElement.paused) {
        this.log('⚠️ Audio is paused while unmuting - attempting play()');
        this.audioElement.play().then(() => {
          this.log(`✅ play() after unmute succeeded: paused=${this.audioElement.paused}`);
        }).catch(e => {
          this.log(`⚠️ play() after unmute failed: ${e.name} - ${e.message}`);
        });
      }

      return true;
    } else {
      this.log('⚠️ Cannot set audio muted - no audio element');
      return false;
    }
  }

  /**
   * Detach audio track
   */
  detachAudio() {
    if (this.audioTrack) {
      // Detach track from audio element
      this.audioTrack.detach();
      this.audioTrack = null;
      this.log('Audio track detached');
    }

    // Clean up audio element
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.srcObject = null;
      if (this.audioElement.parentNode) {
        this.audioElement.parentNode.removeChild(this.audioElement);
      }
      this.audioElement = null;
      this.log('Audio element removed from DOM');
    }
  }

  /**
   * Complete cleanup - call when session ends
   */
  cleanup() {
    this.logWithStack(`[${this.instanceId}] cleanup() called`);

    // AIDEV-NOTE: GUARD - Don't cleanup if we haven't attached any tracks yet
    // AIDEV-NOTE: This prevents premature cleanup before session is ready
    if (!this.videoTrack && !this.audioTrack) {
      this.log(`[${this.instanceId}] ⚠️ Cleanup called but no tracks attached yet - IGNORING`);
      return;
    }

    this.log(`[${this.instanceId}] Cleaning up SessionManager`);

    this.detachVideo();
    this.detachAudio();

    this.room = null;
    this.videoContainer = null;
    this.isInitialized = false;

    // Reset promises
    this.videoReadyResolve = null;
    this.audioReadyResolve = null;
    this.videoReadyPromise = null;
    this.audioReadyPromise = null;

    this.log('✅ SessionManager cleaned up');
  }

  /**
   * Get current state for debugging
   */
  getState() {
    return {
      isInitialized: this.isInitialized,
      hasVideo: this.hasVideo(),
      hasAudio: this.hasAudio(),
      isReady: this.isReady(),
      videoTrackId: this.videoTrack?.sid || null,
      audioTrackId: this.audioTrack?.sid || null,
      hasRoom: !!this.room,
      hasVideoContainer: !!this.videoContainer,
      hasAudioElement: !!this.audioElement
    };
  }
}

// AIDEV-NOTE: CRITICAL FIX - Export class, not singleton
// AIDEV-NOTE: Each connection needs its own SessionManager instance
// AIDEV-NOTE: Singleton was causing state corruption between different users/devices
// AIDEV-NOTE: User A (iOS) → User B (Android) → corrupted audio element → User A fails
export default SessionManager;
