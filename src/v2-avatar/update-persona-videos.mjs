/**
 * Update Human Evolution Persona with Video URLs
 * 
 * This script updates the existing persona (p99b6eb28083) with improved
 * video selection guidance including specific YouTube URLs
 * 
 * Usage: node update-persona-videos.mjs
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

const PERSONA_ID = 'p99b6eb28083'; // The persona we created earlier

console.log('✅ Found TAVUS_API_KEY:', tavusApiKey.substring(0, 8) + '...');
console.log('📋 Updating persona:', PERSONA_ID);
console.log('');

// Updated system prompt with specific video URLs
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

**Video Offering Behavior:**
After answering a question about human evolution, if the topic is complex or visual, you should say:
"I have a detailed video about this topic. Would you like me to show it to you?"

Wait for the user to say yes, then use the show_demo_video tool to display an educational YouTube video about human evolution.

**Video Selection with Specific URLs:**
When the user wants to see a video about human evolution, use the show_demo_video tool with these specific YouTube URLs:

**For General Human Evolution Questions:**
- "How did humans evolve from monkeys?" → Use: https://www.youtube.com/watch?v=SGxDv7XybSo
- "What is human evolution?" → Use: https://www.youtube.com/watch?v=SGxDv7XybSo
- General overview questions → Use: https://www.youtube.com/watch?v=SGxDv7XybSo
- Questions about evolution in general → Use: https://www.youtube.com/watch?v=SGxDv7XybSo

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
4. If the child directly asks "Can you show me a video?" or "I want to see a video", immediately use the show_demo_video tool with: https://www.youtube.com/watch?v=SGxDv7XybSo
5. For most questions, the primary video (SGxDv7XybSo) is appropriate and educational`;

try {
  console.log('🔄 Updating system prompt with video URLs...');
  
  // Try different possible paths for system prompt
  const updatePayload = [
    {
      op: "replace",
      path: "/system_prompt",
      value: updatedSystemPrompt
    }
  ];

  const response = await fetch(`https://tavusapi.com/v2/personas/${PERSONA_ID}`, {
    method: 'PATCH',
    headers: {
      'x-api-key': tavusApiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updatePayload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Error updating persona:', response.status);
    console.error('Response:', errorText);
    process.exit(1);
  }

  const data = await response.json();
  console.log('✅ Persona updated successfully!');
  console.log('');
  console.log('📋 Persona ID:', PERSONA_ID);
  console.log('');
  console.log('🎥 The avatar now has specific video URLs configured:');
  console.log('   Primary video: https://www.youtube.com/watch?v=SGxDv7XybSo');
  console.log('');
  console.log('🧪 Test it by asking:');
  console.log('   "How did humans evolve from monkeys?"');
  console.log('   Then say "yes" when the avatar offers to show a video');
  console.log('');

} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}

