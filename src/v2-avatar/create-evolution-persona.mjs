/**
 * Human Evolution Teaching Avatar - Setup Script
 * Creates a Tavus persona for teaching human evolution to school children
 * 
 * Usage: node create-evolution-persona.js
 * 
 * This script reads TAVUS_API_KEY from backend .env file
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Try to load .env file from frontend or backend
// Try multiple possible paths
const possiblePaths = [
  join(__dirname, '../../../.env.local'),  // frontend/.env.local
  join(__dirname, '../../../.env'),        // frontend/.env
  join(__dirname, '../../../../backend/node-backend/.env'),  // backend/.env
  join(__dirname, '../../../backend/node-backend/.env'),
  'D:\\QuDemo\\qudemo\\frontend\\.env.local',
  'D:\\QuDemo\\qudemo\\backend\\node-backend\\.env',
];
let tavusApiKey = null;

for (const backendEnvPath of possiblePaths) {
  try {
    // Try to read the backend .env file directly
    const envContent = readFileSync(backendEnvPath, 'utf-8');
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
    // Try next path
    continue;
  }
}

if (!tavusApiKey) {
  console.log('⚠️  Could not read backend .env file, trying environment variables...');
}

// Fallback to environment variable or try reading from frontend .env.local
if (!tavusApiKey) {
  // Try loading from process.env (might be set in system)
  tavusApiKey = process.env.TAVUS_API_KEY;
  
  // If still not found, try reading frontend .env.local directly
  if (!tavusApiKey) {
    try {
      const frontendEnvPath = join(__dirname, '../../../.env.local');
      const envContent = readFileSync(frontendEnvPath, 'utf-8');
      const envLines = envContent.split('\n');
      
      for (const line of envLines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('TAVUS_API_KEY=') && !trimmed.startsWith('#')) {
          tavusApiKey = trimmed.split('=')[1].trim().replace(/^["']|["']$/g, '');
          break;
        }
      }
    } catch (error) {
      // Ignore
    }
  }
}

if (!tavusApiKey) {
  console.error('❌ Error: TAVUS_API_KEY not found!');
  console.error('   Please ensure TAVUS_API_KEY is set in backend/node-backend/.env');
  process.exit(1);
}

console.log('✅ Found TAVUS_API_KEY:', tavusApiKey.substring(0, 8) + '...');
console.log('');

// ============================================
// Step 1: Create the Persona
// ============================================
console.log('🚀 Step 1: Creating Human Evolution Teaching Persona...');
console.log('');

const personaPayload = {
  system_prompt: `You are a friendly and enthusiastic science teacher who specializes in explaining human evolution to school children (ages 8-14). Your explanations should be:

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

**Video Offering Behavior:**
After answering a question about human evolution, if the topic is complex or visual, you should say:
"I have a detailed video about this topic. Would you like me to show it to you?"

Wait for the user to say yes, then use the show_demo_video tool to display an educational YouTube video about human evolution.

**When to Offer Videos:**
- When explaining complex concepts like "How did humans evolve from monkeys?"
- When discussing specific ancestors or time periods
- When the user asks "Can you show me?" or "I want to see a video"
- When explaining visual concepts like skeletal changes or migration patterns

**Video Selection:**
When the user wants to see a video about human evolution, use the show_demo_video tool with appropriate YouTube URLs. Here are specific videos you can use:

**For General Human Evolution Questions:**
- "How did humans evolve from monkeys?" → Use: https://www.youtube.com/watch?v=SGxDv7XybSo
- "What is human evolution?" → Use: https://www.youtube.com/watch?v=SGxDv7XybSo
- General overview questions → Use: https://www.youtube.com/watch?v=SGxDv7XybSo

**For Questions About Early Humans/Ancestors:**
- Questions about Lucy, Australopithecus, or early ancestors → Use: https://www.youtube.com/watch?v=SGxDv7XybSo
- Questions about tool use or Homo habilis → Use: https://www.youtube.com/watch?v=SGxDv7XybSo
- Questions about walking upright or Homo erectus → Use: https://www.youtube.com/watch?v=SGxDv7XybSo

**For Timeline Questions:**
- "How long did evolution take?" → Use: https://www.youtube.com/watch?v=SGxDv7XybSo
- Questions about millions of years → Use: https://www.youtube.com/watch?v=SGxDv7XybSo

**For Comparison Questions:**
- "How are we different from monkeys?" → Use: https://www.youtube.com/watch?v=SGxDv7XybSo
- Questions about similarities/differences with apes → Use: https://www.youtube.com/watch?v=SGxDv7XybSo

**Important Video Rules:**
1. Always use the exact YouTube URL format: https://www.youtube.com/watch?v=VIDEO_ID
2. Always announce what you're showing: "Let me show you a great video about [topic]" before calling the tool
3. Use the video URL that best matches the topic the child asked about
4. If the child directly asks "Can you show me a video?" or "I want to see a video", immediately use the show_demo_video tool with an appropriate video`,
  greeting: "Hello! I'm your friendly science teacher, and I'm here to help you learn about how humans evolved from our primate ancestors! It's a fascinating journey that took millions of years. What would you like to know about human evolution?"
};

try {
  const createResponse = await fetch('https://tavusapi.com/v2/personas', {
    method: 'POST',
    headers: {
      'x-api-key': tavusApiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(personaPayload),
  });

  if (!createResponse.ok) {
    const errorText = await createResponse.text();
    console.error('❌ Error creating persona:', createResponse.status);
    console.error('Response:', errorText);
    process.exit(1);
  }

  const personaData = await createResponse.json();
  const personaId = personaData.persona_id;

  if (!personaId) {
    console.error('❌ Error: No persona_id in response');
    console.error('Response:', JSON.stringify(personaData, null, 2));
    process.exit(1);
  }

  console.log('✅ Persona created successfully!');
  console.log('   Persona ID:', personaId);
  console.log('');
  console.log('📝 Save this Persona ID - you\'ll need it for the next step!');
  console.log('');

  // ============================================
  // Step 2: Configure Tools
  // ============================================
  console.log('🔧 Step 2: Configuring video tool for the persona...');
  console.log('');

  const toolPayload = [
    {
      op: "replace",
      path: "/layers/llm/tools",
      value: [
        {
          type: "function",
          function: {
            name: "show_demo_video",
            description: "ALWAYS call this function when the user asks to see a video, demo, or visual explanation about human evolution. Also call this when you have offered to show a video and the user says yes. Do NOT speak the URL - you MUST invoke this function instead. The function will display the video to the user. Use educational YouTube videos about human evolution, early humans, primate evolution, or related topics.",
            parameters: {
              type: "object",
              properties: {
                url: {
                  type: "string",
                  description: "YouTube video URL in format: https://www.youtube.com/watch?v=VIDEO_ID. Choose educational videos about human evolution, early humans, or primate evolution that are appropriate for school children."
                },
                title: {
                  type: "string",
                  description: "Brief, child-friendly title describing the video content (e.g., \"How Humans Evolved from Primates\", \"The Story of Early Humans\", \"Human Evolution Timeline\")"
                }
              },
              required: ["url", "title"]
            }
          }
        }
      ]
    }
  ];

  const toolResponse = await fetch(`https://tavusapi.com/v2/personas/${personaId}`, {
    method: 'PATCH',
    headers: {
      'x-api-key': tavusApiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(toolPayload),
  });

  if (!toolResponse.ok) {
    const errorText = await toolResponse.text();
    console.error('❌ Error configuring tools:', toolResponse.status);
    console.error('Response:', errorText);
    process.exit(1);
  }

  console.log('✅ Tools configured successfully!');
  console.log('');

  // ============================================
  // Summary
  // ============================================
  console.log('==========================================');
  console.log('✅ Setup Complete!');
  console.log('==========================================');
  console.log('');
  console.log('📋 Your Persona ID:', personaId);
  console.log('');
  console.log('🌐 Access your avatar at:');
  console.log('   https://your-frontend-url.com/v2-avatar/' + personaId);
  console.log('   or locally:');
  console.log('   http://localhost:3000/v2-avatar/' + personaId);
  console.log('');
  console.log('🧪 Test it by asking:');
  console.log('   "How did humans evolve from monkeys?"');
  console.log('');
  console.log('📚 For more details, see: HUMAN_EVOLUTION_PERSONA_SETUP.md');
  console.log('');

} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}

