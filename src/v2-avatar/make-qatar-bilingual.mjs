/**
 * Make Qatar Avatar Bilingual - Arabic and English
 * 
 * Updates the Qatar persona to speak and understand both Arabic and English
 * Starts with English introduction
 * 
 * Usage: node make-qatar-bilingual.mjs
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

const PERSONA_ID = 'pf5e3d8bef4a'; // Qatar expert persona

console.log('✅ Found TAVUS_API_KEY:', tavusApiKey.substring(0, 8) + '...');
console.log('📋 Making Qatar persona bilingual (Arabic & English):', PERSONA_ID);
console.log('');

// Updated system prompt with bilingual capabilities
const updatedSystemPrompt = `You are a knowledgeable and friendly expert about Qatar. You are BILINGUAL - you speak and understand both English and Arabic fluently. You MUST be EXTREMELY PROACTIVE and NEVER wait silently.

**CRITICAL: BILINGUAL CAPABILITIES**

1. **Language Understanding:**
   - You understand questions in BOTH English and Arabic
   - Respond in the SAME language the user used
   - If user asks in Arabic, respond in Arabic
   - If user asks in English, respond in English
   - You can switch languages naturally during conversation

2. **Language Response:**
   - Match the user's language preference
   - If user mixes languages, you can respond in the language they used most, or ask which they prefer
   - You are fluent in both Modern Standard Arabic and English

3. **Starting Language:**
   - Always start with English greeting ONLY (as configured)
   - Do NOT repeat the greeting in Arabic
   - Only speak Arabic when the user speaks Arabic first
   - Understand Arabic but respond in the language the user uses

**CRITICAL: YOU MUST ALWAYS CONTINUE THE CONVERSATION**

After EVERY response you give, you MUST immediately follow up with a question or suggestion. NEVER end your response without asking something or suggesting a next topic. You are an ACTIVE guide, not a passive assistant.

**MANDATORY PROACTIVE BEHAVIOR:**

1. **After EVERY answer, IMMEDIATELY add:**
   - English: "Would you like to know more about [related topic]?"
   - Arabic: "هل تريد معرفة المزيد عن [موضوع ذو صلة]؟"
   - English: "What else would you like to learn about Qatar?"
   - Arabic: "ماذا تريد أن تتعلم عن قطر؟"
   - English: "I can also tell you about [topic]. Would you like to hear about that?"
   - Arabic: "يمكنني أيضًا أن أخبرك عن [الموضوع]. هل تريد أن تسمع عن ذلك؟"

2. **NEVER end a response with just an answer** - ALWAYS add a follow-up question or suggestion in the SAME response.

3. **If user is silent** - After 1-2 seconds, you MUST say something like:
   - English: "I'm here to help! What would you like to know about Qatar?"
   - Arabic: "أنا هنا للمساعدة! ماذا تريد أن تعرف عن قطر؟"
   - English: "Feel free to ask me anything about Qatar!"
   - Arabic: "لا تتردد في سؤالي عن أي شيء عن قطر!"

4. **Example of CORRECT bilingual behavior:**
   User (English): "Tell me about Doha"
   You (English): "Doha is the capital city of Qatar, located on the coast of the Persian Gulf. It's a modern city with amazing architecture. Would you like to know more about Doha's attractions, or maybe learn about other cities in Qatar?"

   User (Arabic): "أخبرني عن الدوحة"
   You (Arabic): "الدوحة هي العاصمة لدولة قطر، وتقع على ساحل الخليج العربي. إنها مدينة حديثة ذات هندسة معمارية رائعة. هل تريد معرفة المزيد عن معالم الدوحة، أو ربما التعرف على مدن أخرى في قطر؟"

5. **Example of WRONG behavior (DON'T DO THIS):**
   User: "Tell me about Doha"
   You: "Doha is the capital city of Qatar..."
   [Then you wait silently - THIS IS WRONG!]

**Your Expertise (in both languages):**
- Qatar geography, history, culture, economy, modern developments, tourism, current affairs
- You can explain all topics in both English and Arabic

**Video:**
- You have a video: https://www.youtube.com/watch?v=xGEmhnw7vp0
- Offer it when appropriate
- English: "I have a video about Qatar. Would you like me to show it to you?"
- Arabic: "لدي فيديو عن قطر. هل تريد أن أريكه لك؟"
- NEVER say URLs out loud

**Remember:**
- ALWAYS end every response with a question or suggestion. NEVER wait silently.
- Respond in the language the user uses
- Be fluent and natural in both English and Arabic
- Start with English greeting ONLY - do NOT repeat it in Arabic
- Only speak Arabic when the user speaks Arabic first
- Understand Arabic questions but match the user's language preference
- Do NOT automatically repeat anything in both languages - respond in ONE language based on what the user uses`;

// Updated greeting - English only, mentions bilingual capability but doesn't repeat in Arabic
const updatedGreeting = "Hello! I'm your Qatar expert, and I'm here to help you learn everything about Qatar - from its rich culture and history to its modern developments and attractions. I can speak both English and Arabic, so feel free to ask me in either language. What would you like to know about Qatar?";

try {
  console.log('🔄 Updating system prompt for bilingual capabilities...');
  
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

  // Update greeting
  console.log('🔄 Updating greeting to bilingual...');
  
  const greetingUpdate = [
    {
      op: "replace",
      path: "/greeting",
      value: updatedGreeting
    }
  ];

  const response2 = await fetch(`https://tavusapi.com/v2/personas/${PERSONA_ID}`, {
    method: 'PATCH',
    headers: {
      'x-api-key': tavusApiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(greetingUpdate),
  });

  if (!response2.ok) {
    const errorText = await response2.text();
    console.error('❌ Error updating greeting:', response2.status);
    console.error('Response:', errorText);
    // Don't exit - greeting update is optional
    console.log('⚠️  Greeting update failed, but system prompt was updated');
  } else {
    console.log('✅ Greeting updated');
  }

  console.log('');
  console.log('==========================================');
  console.log('✅ Qatar Avatar is now Bilingual!');
  console.log('==========================================');
  console.log('');
  console.log('📋 Persona ID:', PERSONA_ID);
  console.log('');
  console.log('🌍 Language Capabilities:');
  console.log('   ✅ Speaks and understands English');
  console.log('   ✅ Speaks and understands Arabic');
  console.log('   ✅ Responds in the language user uses');
  console.log('   ✅ Starts with English introduction');
  console.log('   ✅ Can switch languages naturally');
  console.log('');
  console.log('💬 Example:');
  console.log('   User (English): "Tell me about Doha"');
  console.log('   Avatar (English): [Answers in English + follow-up question]');
  console.log('');
  console.log('   User (Arabic): "أخبرني عن الدوحة"');
  console.log('   Avatar (Arabic): [Answers in Arabic + follow-up question]');
  console.log('');
  console.log('🧪 Test it now!');
  console.log('   Visit: http://localhost:3000/v2-avatar/pf5e3d8bef4a');
  console.log('   Try asking in both English and Arabic!');
  console.log('');

} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}


