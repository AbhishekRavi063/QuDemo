/**
 * AudioManager - Robust Web Audio API manager for mobile avatar audio
 *
 * Root Problem:
 * - Mobile browsers require user interaction to start AudioContext
 * - Multiple audio sources can be created without cleanup causing dual audio
 * - AudioContext can get into suspended state at any time
 * - Track events can fire multiple times causing duplicate connections
 *
 * Solution:
 * - Single source of truth for audio state
 * - Proper cleanup before creating new connections
 * - Guaranteed AudioContext resume before audio playback
 * - Idempotent attach/detach operations
 */

class AudioManager {
  constructor() {
    this.audioContext = null;
    this.audioSource = null;
    this.currentTrack = null;
    this.isInitialized = false;
    this.logger = null;
  }

  /**
   * Set logging function for debug output
   */
  setLogger(logFn) {
    this.logger = logFn;
  }

  log(message) {
    if (this.logger) {
      this.logger(message);
    }
    console.log('[AudioManager]', message);
  }

  /**
   * Initialize AudioContext - call this on user interaction
   * Returns: Promise<boolean> - true if successful
   */
  async initialize() {
    try {
      if (!this.audioContext) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.audioContext = new AudioContext();
        this.log(`AudioContext created: state=${this.audioContext.state}`);
      } else {
        this.log(`AudioContext reused: state=${this.audioContext.state}`);
      }

      // Ensure context is running
      if (this.audioContext.state === 'suspended') {
        this.log('AudioContext is suspended, resuming...');
        await this.audioContext.resume();
        this.log(`AudioContext resumed: new state=${this.audioContext.state}`);
      } else {
        this.log(`AudioContext already running: state=${this.audioContext.state}`);
      }

      this.isInitialized = true;
      this.log('✅ AudioManager initialized successfully');
      return true;
    } catch (error) {
      this.log(`❌ Failed to initialize AudioContext: ${error.message}`);
      return false;
    }
  }

  /**
   * Check if we're ready to play audio
   */
  isReady() {
    return this.isInitialized &&
           this.audioContext &&
           this.audioContext.state === 'running';
  }

  /**
   * Attach audio track - idempotent, safe to call multiple times
   * Returns: Promise<boolean> - true if successful
   */
  async attachTrack(track) {
    try {
      this.log(`Attaching audio track: ${track.sid}`);

      // Clean up any existing audio first
      this.detachTrack();

      // Initialize if needed
      if (!this.isInitialized) {
        const success = await this.initialize();
        if (!success) {
          this.log('Failed to initialize audio context');
          return false;
        }
      }

      // Ensure context is running
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
        this.log('AudioContext resumed before attaching');
      }

      // Create MediaStream from track
      const mediaStream = new MediaStream([track.mediaStreamTrack]);
      this.log(`MediaStream created: active=${mediaStream.active}, tracks=${mediaStream.getTracks().length}`);

      // Create and connect audio source
      this.audioSource = this.audioContext.createMediaStreamSource(mediaStream);
      this.audioSource.connect(this.audioContext.destination);
      this.currentTrack = track;

      this.log(`✅ Audio track attached and playing (context state: ${this.audioContext.state})`);
      return true;

    } catch (error) {
      this.log(`❌ Failed to attach audio track: ${error.message}`);
      console.error('[AudioManager] Error:', error);
      return false;
    }
  }

  /**
   * Detach current audio track - idempotent, safe to call multiple times
   */
  detachTrack() {
    if (this.audioSource) {
      try {
        this.audioSource.disconnect();
        this.log('Audio source disconnected');
      } catch (e) {
        // Already disconnected, ignore
      }
      this.audioSource = null;
    }

    if (this.currentTrack) {
      this.currentTrack = null;
      this.log('Audio track reference cleared');
    }
  }

  /**
   * Complete cleanup - call when session ends
   */
  cleanup() {
    this.log('Cleaning up AudioManager');
    this.detachTrack();

    // Don't close AudioContext - reuse it for next session
    // Closing and recreating can cause issues on some mobile browsers
    // Keep isInitialized as true since we're keeping the AudioContext ready
  }

  /**
   * Get current state for debugging
   */
  getState() {
    return {
      hasContext: !!this.audioContext,
      contextState: this.audioContext?.state || 'none',
      hasSource: !!this.audioSource,
      hasTrack: !!this.currentTrack,
      isInitialized: this.isInitialized,
      isReady: this.isReady()
    };
  }
}

// Export singleton instance
const audioManagerInstance = new AudioManager();
export default audioManagerInstance;
