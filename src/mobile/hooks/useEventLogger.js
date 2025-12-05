import { useState, useCallback } from 'react';

// Import API URL helper (same pattern as MobileAvatarWidget)
const getNodeApiUrl = (path) => {
  // Check if running on localhost
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return `http://localhost:5000${path}`;
  }
  // Production - use relative path
  return path;
};

export function useEventLogger() {
  const [logs, setLogs] = useState([]);

  const log = useCallback((category, message, data) => {
    const timestamp = new Date().toISOString();
    const entry = {
      timestamp,
      category,
      message,
      data: data !== undefined ? data : null,
    };

    setLogs(prev => [...prev, entry]);

    // Also log to console for debugging
    const emoji = getCategoryEmoji(category);
    console.log(`[${category}] ${emoji} ${message}`, data || '');

    // Send to Node.js backend for logging (fire and forget)
    // Format: "[CATEGORY] emoji message" + data as JSON
    const logMessage = `[${category}] ${emoji} ${message}${data ? ' ' + JSON.stringify(data) : ''}`;
    try {
      fetch(getNodeApiUrl('/api/mobile-logs'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          log: logMessage,
          userAgent: navigator.userAgent,
          category: category,
          timestamp: timestamp
        })
      }).catch(() => {}); // Ignore errors
    } catch (e) {}
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  return { logs, log, clearLogs };
}

function getCategoryEmoji(category) {
  const emojis = {
    SYSTEM: '⚙️',
    SESSION: '✅',
    API: '🌐',
    LIVEKIT: '📡',
    EVENTS: '📢',
    ROOM_EVENT: '🏠',
    PARTICIPANT: '👤',
    TRACK: '🎬',
    LOCAL_AUDIO: '🎤',
    DATA_CHANNEL: '📨',
    AVATAR_STATE: '🤖',
    USER_STATE: '👤',
    AGENT_STATE: '🤖',
    TRANSCRIPTION: '📝',
    INTENT_DETECTED: '🎯',
    INTENT_MATCH: '✨',
    DEMO: '🎬',
    UI: '🖥️',
    CONNECTION: '🔌',
    CLEANUP: '🧹',
    WARNING: '⚠️',
    ERROR: '❌',
  };
  return emojis[category] || '📌';
}

