import { useState, useCallback } from 'react';

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

