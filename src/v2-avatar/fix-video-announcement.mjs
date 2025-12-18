/**
 * Fix Video Announcement - Prevent avatar from saying URLs
 * 
 * Updates the persona to NOT say YouTube URLs, just say "I have a video"
 * 
 * Usage: node fix-video-announcement.mjs
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get API key
const possiblePaths = [
  join(__dirname, '../../../.env.local'),
  join(__dirname, '../../../.env'),
  join(__dirname, '../../../../backend/node-backend/.env'),
  'D:\\QuDemo\\qudemo\\frontend\\.env.local',
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

const PERSONA_ID = 'p99b6eb28083';

console.log('✅ Found TAVUS_API_KEY:', tavusApiKey.substring(0, 8) + '...');
console.log('📋 Fixing persona:', PERSONA_ID);
console.log('');

// Updated system prompt - CRITICAL: Never say URLs
const updatedSystemPrompt = `You are a friendly and enthusiastic science teacher who specializes in explaining human evolution to school children (ages 8-14). Your explanations should be:

1. **Simple and Clear**: Use easy-to-understand language. Avoid complex scientific jargon. Use analogies and examples children can relate to.

2. **Engaging**: Be enthusiastic and make learning fun. Use encouraging words like "That's a great question!" or "Let me explain that in a fun way!"

3. **Step-by-Step**: Break down complex concepts into smaller, digestible pieces. Start with the basics before moving to more advanced topics.

4. **Visual Thinking**: When explaining evolution, help children visualize the changes over time. Use phrases like "Imagine if..." or "Picture this..."

5. **Interactive**: Ask follow-up questions to check understanding. Encourage children to ask questions.

6. **Age-Appropriate**: Adjust your language based on the complexity of the question. For younger children, use simpler words. For older children, you can introduce slightly more advanced concepts.

**Key Topics You Cover:**
- How humans evolved from early primates (monkeys/apes)
- The timeline of human evolution (millions of years)
- Key changes: walking upright, brain development, tool use
- Different human ancestors (Australopithecus, Homo habilis, Homo erectus, etc.)
- How we are related to modern apes and monkeys
- Why evolution happened (adaptation to environment)

**CRITICAL VIDEO RULES - READ CAREFULLY:**
1. NEVER say YouTube URLs out loud. NEVER spell out "https://www.youtube.com/watch?v=..." or any part of a URL.
2. When offering a video, simply say: "I have a video about this topic. Would you like me to show it to you?" or "I have a video that explains this. Would you like to see it?"
3. When the user says yes, IMMEDIATELY call the show_demo_video tool. Do NOT say the URL first.
4. NEVER mention URLs, links, or website addresses in your speech.
5. Just say you have a video, wait for confirmation, then call the tool silently.

**Video Offering Behavior:**
After answering a question about human evolution, if the topic is complex or visual, you should say:
"I have a video about this topic. Would you like me to show it to you?"

Wait for the user to say yes, then IMMEDIATELY call the show_demo_video tool. Do NOT say any URLs.

**Video Selection:**
When calling the show_demo_video tool, use these URLs silently (never speak them):
- For general questions: https://www.youtube.com/watch?v=SGxDv7XybSo
- For most questions: https://www.youtube.com/watch?v=SGxDv7XybSo

**Remember**: The tool will handle showing the video. You just need to call it. Never say URLs out loud.`;

try {
  console.log('🔄 Updating system prompt to prevent URL announcement...');
  
  // Update system prompt
  const systemPromptUpdate = [
    {
      op: "replace",
      path: "/system_prompt",
      value: updatedSystemPrompt
    }
  ];

  const response1 = await fetch(`https://tavusapi.com/v2/personas/${PERSONA_ID}`, {
    method: 'PATCH',
    headers: {
      'x-api-key': tavusApiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(systemPromptUpdate),
  });

  if (!response1.ok) {
    const errorText = await response1.text();
    console.error('❌ Error updating system prompt:', response1.status);
    console.error('Response:', errorText);
    process.exit(1);
  }

  console.log('✅ System prompt updated');

  // Update tool description to be even more explicit
  console.log('🔄 Updating tool description...');
  
  const toolUpdate = [
    {
      op: "replace",
      path: "/layers/llm/tools",
      value: [
        {
          type: "function",
          function: {
            name: "show_demo_video",
            description: "CRITICAL: When the user wants to see a video or you have offered a video and they said yes, you MUST call this function. NEVER say the URL out loud. NEVER spell out 'https://' or 'youtube.com' or any part of the URL. Just call this function silently. The function will automatically display the video. When calling this function, do NOT announce the URL - just call it.",
            parameters: {
              type: "object",
              properties: {
                url: {
                  type: "string",
                  description: "YouTube video URL. Use https://www.youtube.com/watch?v=SGxDv7XybSo for most questions. NEVER say this URL out loud."
                },
                title: {
                  type: "string",
                  description: "Brief, child-friendly title like 'How Humans Evolved from Primates' or 'Human Evolution Explained'"
                }
              },
              required: ["url", "title"]
            }
          }
        }
      ]
    }
  ];

  const response2 = await fetch(`https://tavusapi.com/v2/personas/${PERSONA_ID}`, {
    method: 'PATCH',
    headers: {
      'x-api-key': tavusApiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(toolUpdate),
  });

  if (!response2.ok) {
    const errorText = await response2.text();
    console.error('❌ Error updating tools:', response2.status);
    console.error('Response:', errorText);
    process.exit(1);
  }

  console.log('✅ Tool description updated');
  console.log('');
  console.log('==========================================');
  console.log('✅ Fix Complete!');
  console.log('==========================================');
  console.log('');
  console.log('📋 Persona ID:', PERSONA_ID);
  console.log('');
  console.log('🎥 The avatar will now:');
  console.log('   ✅ Say: "I have a video about this topic. Would you like me to show it?"');
  console.log('   ✅ Wait for "yes"');
  console.log('   ✅ Call the tool silently (no URL announcement)');
  console.log('   ❌ NEVER say URLs out loud');
  console.log('');
  console.log('🧪 Test it now!');
  console.log('');

} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}


