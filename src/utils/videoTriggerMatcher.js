import videoTriggersData from '../config/video-triggers.json';

/**
 * Check if transcript contains demo trigger keywords
 * Returns matching video URL or null
 */
export function checkForDemoTrigger(transcript, conversationHistory = []) {
  if (!transcript || typeof transcript !== 'string') {
    return null;
  }

  const lowerTranscript = transcript.toLowerCase();
  const triggers = videoTriggersData.triggers;

  // Check each trigger configuration
  for (const trigger of triggers) {
    // Check if primary keywords are present
    const hasPrimaryKeyword = trigger.primaryKeywords.some(keyword =>
      lowerTranscript.includes(keyword.toLowerCase())
    );

    if (!hasPrimaryKeyword) {
      continue; // Skip if no primary keyword match
    }

    // If there are secondary keywords, check for them
    if (trigger.secondaryKeywords && trigger.secondaryKeywords.length > 0) {
      const hasSecondaryKeyword = trigger.secondaryKeywords.some(keyword =>
        lowerTranscript.includes(keyword.toLowerCase())
      );

      if (hasSecondaryKeyword) {
        // Found a specific match (primary + secondary)
        console.log(`🎯 Demo trigger matched: ${trigger.description}`);
        return {
          videoUrl: trigger.videoUrl,
          triggerId: trigger.id,
          description: trigger.description,
        };
      }
    } else {
      // No secondary keywords required, use generic fallback
      console.log(`🎯 Generic demo trigger matched: ${trigger.description}`);
      return {
        videoUrl: trigger.videoUrl,
        triggerId: trigger.id,
        description: trigger.description,
      };
    }
  }

  return null;
}

/**
 * Check conversation history for demo triggers
 */
export function checkConversationForTriggers(conversationHistory) {
  // Combine last few messages into one string
  const recentMessages = conversationHistory
    .slice(-3) // Last 3 messages
    .map(msg => msg.text || '')
    .join(' ');

  return checkForDemoTrigger(recentMessages);
}

