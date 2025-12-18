/**
 * Update Persona with YouTube Video
 * 
 * Updates a persona to include a YouTube video in its system prompt
 * 
 * Usage: node update-persona-video.mjs [personaId] [videoUrl]
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get API key
const possiblePaths = [
  join(__dirname, '../../../.env.local'),  // frontend/.env.local
  join(__dirname, '../../../.env'),       // frontend/.env
  join(__dirname, '../../../../backend/node-backend/.env'),
  join(__dirname, '../../../../frontend/.env.local'),
  join(__dirname, '../../../../frontend/.env'),
  'D:\\QuDemo\\qudemo\\frontend\\.env.local',
  'D:\\QuDemo\\qudemo\\frontend\\.env',
  'D:\\QuDemo\\qudemo\\backend\\node-backend\\.env',
];

let tavusApiKey = null;

for (const envPath of possiblePaths) {
  try {
    const envContent = readFileSync(envPath, 'utf-8');
    const envLines = envContent.split('\n');
    
    for (const line of envLines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('TAVUS_API_KEY=') && !trimmed.startsWith('#')) {
        tavusApiKey = trimmed.split('=')[1].trim().replace(/^["']|["']$/g, '');
        break;
      }
    }
    if (tavusApiKey) break;
  } catch (error) {
    continue;
  }
}

if (!tavusApiKey) {
  tavusApiKey = process.env.TAVUS_API_KEY;
}

if (!tavusApiKey) {
  console.error('❌ Error: TAVUS_API_KEY not found!');
  process.exit(1);
}

// Get persona ID and video URL from command line args
const PERSONA_ID = process.argv[2] || 'pc4350da873f';
let VIDEO_URL = process.argv[3] || 'https://youtu.be/xGEmhnw7vp0';

// Convert youtu.be short URL to full YouTube URL if needed
if (VIDEO_URL.includes('youtu.be/')) {
  const videoId = VIDEO_URL.match(/youtu\.be\/([a-zA-Z0-9_-]+)/)?.[1];
  if (videoId) {
    VIDEO_URL = `https://www.youtube.com/watch?v=${videoId}`;
  }
}

console.log('✅ Found TAVUS_API_KEY:', tavusApiKey.substring(0, 8) + '...');
console.log('📋 Updating persona:', PERSONA_ID);
console.log('🎥 Video URL:', VIDEO_URL);
console.log('');

try {
  // First, get the current persona configuration
  console.log('📥 Fetching current persona configuration...');
  const getResponse = await fetch(`https://tavusapi.com/v2/personas/${PERSONA_ID}`, {
    method: 'GET',
    headers: {
      'x-api-key': tavusApiKey,
      'Content-Type': 'application/json',
    },
  });

  if (!getResponse.ok) {
    const errorText = await getResponse.text();
    console.error('❌ Error fetching persona:', getResponse.status);
    console.error('Response:', errorText);
    process.exit(1);
  }

  const personaData = await getResponse.json();
  let systemPrompt = personaData.system_prompt || '';

  // Extract video ID from URL
  const videoIdMatch = VIDEO_URL.match(/[?&]v=([a-zA-Z0-9_-]+)/) || VIDEO_URL.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  const videoId = videoIdMatch ? videoIdMatch[1] : null;

  if (!videoId) {
    console.error('❌ Error: Could not extract video ID from URL:', VIDEO_URL);
    process.exit(1);
  }

  const fullVideoUrl = `https://www.youtube.com/watch?v=${videoId}`;

  // Check if video URL already exists in the prompt
  const existingVideoMatch = systemPrompt.match(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/i) || 
                              systemPrompt.match(/youtu\.be\/([a-zA-Z0-9_-]+)/i);

  if (existingVideoMatch) {
    // Replace existing video URL
    systemPrompt = systemPrompt.replace(
      /youtube\.com\/watch\?v=[a-zA-Z0-9_-]+/gi,
      `youtube.com/watch?v=${videoId}`
    );
    systemPrompt = systemPrompt.replace(
      /youtu\.be\/[a-zA-Z0-9_-]+/gi,
      `youtube.com/watch?v=${videoId}`
    );
    console.log('🔄 Replacing existing video URL in system prompt...');
  } else {
    // Add video instructions to the system prompt
    const videoInstructions = `

**Video Offering Behavior:**
You have access to a video that can help explain topics. When appropriate, you can offer to show it:
- Say: "I have a video about this. Would you like me to show it to you?"
- Wait for the user to say "yes" or confirm
- Then use the show_demo_video tool with the URL: ${fullVideoUrl}
- NEVER say the URL out loud - just call the tool silently

**CRITICAL VIDEO RULES:**
1. NEVER say YouTube URLs out loud. NEVER spell out "https://www.youtube.com/watch?v=..." or any part of a URL.
2. When offering a video, simply say: "I have a video about this. Would you like me to show it to you?"
3. When the user says yes, IMMEDIATELY call the show_demo_video tool with the URL: ${fullVideoUrl}
4. NEVER mention URLs, links, or website addresses in your speech.
5. Just say you have a video, wait for confirmation, then call the tool silently.`;

    systemPrompt = systemPrompt.trim() + videoInstructions;
    console.log('➕ Adding video instructions to system prompt...');
  }

  // Update the persona
  console.log('🔄 Updating persona with video URL...');
  const updatePayload = [
    {
      op: "replace",
      path: "/system_prompt",
      value: systemPrompt
    }
  ];

  const updateResponse = await fetch(`https://tavusapi.com/v2/personas/${PERSONA_ID}`, {
    method: 'PATCH',
    headers: {
      'x-api-key': tavusApiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updatePayload),
  });

  if (!updateResponse.ok) {
    const errorText = await updateResponse.text();
    console.error('❌ Error updating persona:', updateResponse.status);
    console.error('Response:', errorText);
    process.exit(1);
  }

  console.log('✅ Persona updated successfully!');
  console.log('');
  console.log('==========================================');
  console.log('✅ Video Added to Persona!');
  console.log('==========================================');
  console.log('');
  console.log('📋 Persona ID:', PERSONA_ID);
  console.log('🎥 Video URL:', fullVideoUrl);
  console.log('');
  console.log('🎓 The avatar will now:');
  console.log('   ✅ Offer videos when appropriate');
  console.log('   ✅ Use the show_demo_video tool');
  console.log('   ✅ Show video: ' + fullVideoUrl);
  console.log('   ❌ Never say URLs out loud');
  console.log('');
  console.log('💬 Example:');
  console.log('   Avatar: "I have a video about this. Would you like me to show it?"');
  console.log('   User: "Yes"');
  console.log('   Avatar: [Shows video silently]');
  console.log('');
  console.log('🧪 Test it now!');
  console.log('   Visit: http://localhost:3000/v2-avatar/' + PERSONA_ID);
  console.log('');

} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}


