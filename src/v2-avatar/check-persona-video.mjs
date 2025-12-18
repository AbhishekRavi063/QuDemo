/**
 * Check which YouTube video is configured for a persona
 * 
 * Usage: node check-persona-video.mjs [personaId]
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

const PERSONA_ID = process.argv[2] || 'pc4350da873f';

console.log('✅ Found TAVUS_API_KEY:', tavusApiKey.substring(0, 8) + '...');
console.log('📋 Checking persona:', PERSONA_ID);
console.log('');

try {
  const response = await fetch(`https://tavusapi.com/v2/personas/${PERSONA_ID}`, {
    method: 'GET',
    headers: {
      'x-api-key': tavusApiKey,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Error fetching persona:', response.status);
    console.error('Response:', errorText);
    process.exit(1);
  }

  const personaData = await response.json();
  const systemPrompt = personaData.system_prompt || '';
  
  // Search for YouTube video URLs in the system prompt
  const videoMatches = [
    ...systemPrompt.matchAll(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/gi),
    ...systemPrompt.matchAll(/youtu\.be\/([a-zA-Z0-9_-]+)/gi),
  ];

  console.log('==========================================');
  console.log('📋 Persona Information');
  console.log('==========================================');
  console.log('');
  console.log('Persona ID:', PERSONA_ID);
  console.log('Name:', personaData.name || 'N/A');
  console.log('Greeting:', personaData.greeting ? personaData.greeting.substring(0, 100) + '...' : 'N/A');
  console.log('');

  // Check for tools
  if (personaData.tools && personaData.tools.length > 0) {
    console.log('🔧 Tools Configured:');
    personaData.tools.forEach((tool, index) => {
      console.log(`   ${index + 1}. ${tool.type || 'Unknown'}: ${tool.name || 'N/A'}`);
      if (tool.function && tool.function.parameters) {
        console.log(`      Parameters: ${JSON.stringify(tool.function.parameters).substring(0, 100)}...`);
      }
    });
    console.log('');
  }

  if (videoMatches.length > 0) {
    console.log('🎥 YouTube Videos Found in System Prompt:');
    const uniqueVideos = [...new Set(videoMatches.map(m => m[1]))];
    uniqueVideos.forEach((videoId, index) => {
      console.log(`   ${index + 1}. https://www.youtube.com/watch?v=${videoId}`);
    });
    console.log('');
  } else {
    console.log('❌ No YouTube video URLs found in system prompt');
    console.log('');
  }

  console.log('');
  console.log('📝 System Prompt Preview (first 500 chars):');
  console.log('   ', systemPrompt.substring(0, 500).replace(/\n/g, '\n   '));
  if (systemPrompt.length > 500) {
    console.log('   ...');
  }
  console.log('');

} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}

