# Quick Setup Guide - Human Evolution Teaching Avatar

## Overview
Create a Tavus persona that teaches human evolution to school children, with the ability to show YouTube videos when requested.

## Prerequisites
- Tavus API Key
- Access to Tavus API

## Quick Steps

### 1. Create Persona (One-time setup)

**Using curl (Linux/Mac/Git Bash):**
```bash
curl --location 'https://tavusapi.com/v2/personas' \
--header 'x-api-key: YOUR_TAVUS_API_KEY' \
--header 'Content-Type: application/json' \
--data @persona-config.json
```

**Or use the setup script:**
```bash
# Edit create-evolution-persona.sh and add your API key
chmod +x create-evolution-persona.sh
./create-evolution-persona.sh
```

**Save the `persona_id` from the response** (e.g., `pc4350da873f`)

### 2. Add Video Tool

```bash
curl --location --request PATCH 'https://tavusapi.com/v2/personas/YOUR_PERSONA_ID' \
--header 'x-api-key: YOUR_TAVUS_API_KEY' \
--header 'Content-Type: application/json' \
--data '[{
  "op": "replace",
  "path": "/layers/llm/tools",
  "value": [{
    "type": "function",
    "function": {
      "name": "show_demo_video",
      "description": "ALWAYS call this function when the user asks to see a video about human evolution or when you have offered to show a video and the user says yes. Do NOT speak the URL - you MUST invoke this function instead.",
      "parameters": {
        "type": "object",
        "properties": {
          "url": {
            "type": "string",
            "description": "YouTube video URL: https://www.youtube.com/watch?v=VIDEO_ID"
          },
          "title": {
            "type": "string",
            "description": "Child-friendly video title"
          }
        },
        "required": ["url", "title"]
      }
    }
  }]
}]'
```

### 3. Access Your Avatar

```
https://your-frontend-url.com/v2-avatar/YOUR_PERSONA_ID
```

## How It Works

1. **User asks a question** about human evolution
2. **Avatar explains** in simple, child-friendly terms
3. **Avatar offers video**: "I have a detailed video about this topic. Would you like me to show it to you?"
4. **User says yes**
5. **Avatar calls tool** `show_demo_video` with YouTube URL
6. **Video appears** in the widget overlay

## System Prompt Key Features

The persona is configured with:
- ✅ Simple, age-appropriate language (ages 8-14)
- ✅ Engaging and enthusiastic teaching style
- ✅ Step-by-step explanations
- ✅ Visual thinking prompts
- ✅ Automatic video offering after complex topics
- ✅ Interactive Q&A style

## Testing

1. Go to `/v2-avatar/YOUR_PERSONA_ID`
2. Ask: "How did humans evolve from monkeys?"
3. Wait for explanation
4. When avatar offers video, say "yes"
5. Video should appear

## Troubleshooting

**Avatar doesn't offer videos:**
- Check tools are configured (Step 2)
- Verify system prompt includes video offering instructions

**Videos don't show:**
- Check browser console for errors
- Verify YouTube URL is accessible
- Ensure tool name is exactly `show_demo_video`

**Persona not found:**
- Verify persona ID in URL matches created persona
- Check API key has access

## Full Documentation

See `HUMAN_EVOLUTION_PERSONA_SETUP.md` for complete details.


