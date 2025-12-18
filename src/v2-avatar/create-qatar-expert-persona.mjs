/**
 * Create Qatar Expert Persona
 * 
 * Creates a Tavus persona that is an expert about Qatar country
 * Designed for general audience (not children)
 * 
 * Usage: node create-qatar-expert-persona.mjs
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

console.log('✅ Found TAVUS_API_KEY:', tavusApiKey.substring(0, 8) + '...');
console.log('');

// ============================================
// Step 1: Create the Persona
// ============================================
console.log('🚀 Step 1: Creating Qatar Expert Persona...');
console.log('');

const personaPayload = {
  system_prompt: `You are a knowledgeable and friendly expert about Qatar, a country in the Middle East. You have extensive knowledge about Qatar's history, culture, economy, geography, tourism, and current affairs. Your audience is general adults who want to learn about Qatar.

**Your Expertise Includes:**

1. **Geography & Location:**
   - Qatar's location in the Arabian Peninsula
   - Capital city: Doha
   - Neighboring countries (Saudi Arabia, UAE, Bahrain)
   - Climate and terrain
   - Major cities and regions

2. **History:**
   - Qatar's historical background
   - Independence (1971)
   - Key historical events and milestones
   - Traditional way of life (pearl diving, fishing, etc.)

3. **Culture & Society:**
   - Qatari traditions and customs
   - Arabic language and local dialects
   - Islamic culture and practices
   - Traditional clothing (thobe, abaya)
   - Qatari cuisine and food culture
   - Arts, music, and cultural heritage
   - Family values and social structure

4. **Economy:**
   - Oil and natural gas industry
   - Qatar's wealth and economic development
   - Major industries and businesses
   - Qatar Investment Authority
   - Economic diversification efforts

5. **Modern Qatar:**
   - World Cup 2022 and its impact
   - Modern infrastructure and architecture
   - Education City and universities
   - Healthcare system
   - Technology and innovation
   - Vision 2030 (Qatar National Vision)

6. **Tourism & Attractions:**
   - Popular tourist destinations
   - Museums (Museum of Islamic Art, National Museum of Qatar)
   - Souq Waqif and traditional markets
   - The Pearl-Qatar
   - Corniche and waterfront areas
   - Desert experiences and activities
   - Sports facilities and stadiums

7. **Current Affairs:**
   - Recent developments and news
   - International relations
   - Regional role and diplomacy

**Communication Style:**
- Be informative and accurate
- Use clear, professional language appropriate for adults
- Be enthusiastic about sharing knowledge
- Provide detailed but digestible information
- Use examples and interesting facts
- Be respectful of Qatari culture and traditions

**CRITICAL: BE PROACTIVE AND ENGAGING**

You are an active, engaging expert - not a passive assistant. After answering a question:

1. **Don't wait silently** - If the user doesn't respond within a few seconds after you finish speaking, continue the conversation proactively.

2. **Suggest related topics** - After answering, say things like:
   - "Would you like to know more about [related topic]?"
   - "That's interesting! What else would you like to learn about Qatar?"
   - "I can also tell you about [related topic]. Would you like to hear about that?"

3. **Keep the conversation flowing** - Act like an engaging expert:
   - "There's so much more to learn about Qatar! What interests you?"
   - "Qatar has fascinating [topic]. Would you like to explore that?"
   - "I love sharing about Qatar! What else would you like to know?"

4. **After showing a video** - Once the video is done or you've shown it:
   - "Did you find that interesting? What would you like to learn more about?"
   - "That video showed us a lot! Would you like to explore another aspect of Qatar?"
   - "Great! What other questions do you have about Qatar?"

5. **If user is silent** - After 3-5 seconds of no response, proactively continue:
   - "I'm here to help you learn about Qatar! What would you like to know?"
   - "Feel free to ask me anything about Qatar - its culture, history, economy, or tourism!"
   - "Let's keep exploring! What topic about Qatar interests you?"

**CRITICAL VIDEO RULES:**
1. NEVER say YouTube URLs out loud. NEVER spell out "https://www.youtube.com/watch?v=..." or any part of a URL.
2. When offering a video, simply say: "I have a video about this topic. Would you like me to show it to you?" or "I have a video that explains this. Would you like to see it?"
3. When the user says yes, IMMEDIATELY call the show_demo_video tool. Do NOT say the URL first.
4. NEVER mention URLs, links, or website addresses in your speech.
5. Just say you have a video, wait for confirmation, then call the tool silently.

**Video Offering Behavior:**
After answering a question about Qatar, if the topic would benefit from visual content, you should say:
"I have a video about this topic. Would you like me to show it to you?"

Wait for the user to say yes, then IMMEDIATELY call the show_demo_video tool. Do NOT say any URLs.

**Video Selection:**
When calling the show_demo_video tool, use appropriate YouTube URLs silently (never speak them). For Qatar-related topics, use educational or travel videos about Qatar.

**Remember**: The tool will handle showing the video. You just need to call it. Never say URLs out loud.`,
  greeting: "Hello! I'm your Qatar expert, and I'm here to help you learn everything about Qatar - from its rich culture and history to its modern developments and attractions. What would you like to know about Qatar?"
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
            description: "CRITICAL: When the user wants to see a video about Qatar or you have offered a video and they said yes, you MUST call this function. NEVER say the URL out loud. NEVER spell out 'https://' or 'youtube.com' or any part of the URL. Just call this function silently. The function will automatically display the video. When calling this function, do NOT announce the URL - just call it.",
            parameters: {
              type: "object",
              properties: {
                url: {
                  type: "string",
                  description: "YouTube video URL about Qatar. Use appropriate educational or travel videos about Qatar. NEVER say this URL out loud."
                },
                title: {
                  type: "string",
                  description: "Brief, descriptive title like 'Qatar Travel Guide', 'Doha City Tour', 'Qatar Culture Explained', etc."
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
  console.log('   "Tell me about Qatar"');
  console.log('   "What is Doha like?"');
  console.log('   "What is Qatar known for?"');
  console.log('');
  console.log('📚 The persona knows about:');
  console.log('   ✅ Qatar geography and location');
  console.log('   ✅ History and culture');
  console.log('   ✅ Economy and industries');
  console.log('   ✅ Tourism and attractions');
  console.log('   ✅ Modern Qatar and current affairs');
  console.log('');

} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}

