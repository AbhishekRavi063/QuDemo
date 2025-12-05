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
 * - Delegates audio to AudioManager, manages video directly
 * - Clean lifecycle: initialize → waitForReady → cleanup
 */

import AudioManager from './AudioManager';

class SessionManager {
  constructor() {
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
   * Initialize session manager with LiveKit room
   * Sets up all event listeners and prepares for tracks
   */
  async initialize(room, videoContainerId = 'live-video-container') {
    this.log('Initializing SessionManager...');

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
        videoEl.muted = true; // Audio handled separately via AudioManager
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
   * Attach audio track - idempotent, delegates to AudioManager
   * Returns: boolean - true if attached, false if already attached or failed
   */
  async attachAudioTrack(track) {
    // Already have audio? Skip
    if (this.audioTrack) {
      this.log('Audio track already attached, skipping');
      return false;
    }

    this.log(`Attaching audio track: ${track.sid}`);

    try {
      const success = await AudioManager.attachTrack(track);

      if (success) {
        this.audioTrack = track;
        this.log('✅ Audio track attached via AudioManager');

        // Resolve ready promise
        if (this.audioReadyResolve) {
          this.audioReadyResolve();
          this.audioReadyResolve = null;
        }

        return true;
      }

      return false;

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
   * Detach audio track
   */
  detachAudio() {
    if (this.audioTrack) {
      AudioManager.detachTrack();
      this.audioTrack = null;
      this.log('Audio track detached');
    }
  }

  /**
   * Complete cleanup - call when session ends
   */
  cleanup() {
    this.log('Cleaning up SessionManager');

    this.detachVideo();
    this.detachAudio();
    AudioManager.cleanup();

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
      audioManager: AudioManager.getState()
    };
  }
}

// Export singleton instance
const sessionManagerInstance = new SessionManager();
export default sessionManagerInstance;
