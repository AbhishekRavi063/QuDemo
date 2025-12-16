# Tavus Persona Tools Setup Guide

This guide explains how to configure tools for your Tavus persona so the avatar can trigger actions like showing videos, PDFs, or opening the calendar.

## Available Tools

The frontend supports three tools that can be triggered by the Tavus persona:

| Tool Name | Description | Parameters |
|-----------|-------------|------------|
| `schedule_meeting` | Opens Calendly/Cal.com scheduling interface | `calendly_url` (required), `purpose` (required) |
| `show_demo_video` | Displays a video (YouTube or direct URL) | `url` (required), `title` (required) |
| `show_pdf` | Displays a PDF document | `url` (required), `title` (required) |

## How It Works

1. The persona's LLM decides when to call a tool based on conversation context
2. The tool call is sent via Daily.co data channel to the frontend
3. Frontend waits for the avatar to finish speaking
4. Then displays the overlay (video/PDF/Calendly) with avatar in PIP mode

## Setup: PATCH Request to Add Tools

Run this curl command **once** to add tools to your persona. The Tavus API uses JSON Patch format:

```bash
curl --location --request PATCH 'https://tavusapi.com/v2/personas/YOUR_PERSONA_ID' \
--header 'x-api-key: YOUR_TAVUS_API_KEY' \
--header 'Content-Type: application/json' \
--data '[
    {
      "op": "replace",
      "path": "/layers/llm/tools",
      "value": [
        {
          "type": "function",
          "function": {
            "name": "show_demo_video",
            "description": "ALWAYS call this function when the user asks to see a demo, video, or product walkthrough. Do NOT speak the URL - you MUST invoke this function instead. The function will display the video to the user.",
            "parameters": {
              "type": "object",
              "properties": {
                "url": {
                  "type": "string",
                  "description": "The YouTube or video URL to display. Example: https://www.youtube.com/watch?v=YOUR_VIDEO_ID"
                },
                "title": {
                  "type": "string",
                  "description": "Brief title describing the video"
                }
              },
              "required": ["url", "title"]
            }
          }
        },
        {
          "type": "function",
          "function": {
            "name": "schedule_meeting",
            "description": "ALWAYS call this function when the user wants to schedule a meeting, book a call, set up an appointment, or discuss availability. Do NOT speak the URL - you MUST invoke this function instead. The function will open the scheduling interface.",
            "parameters": {
              "type": "object",
              "properties": {
                "calendly_url": {
                  "type": "string",
                  "description": "The Calendly or Cal.com URL. Example: https://cal.com/your-team/meeting"
                },
                "purpose": {
                  "type": "string",
                  "description": "Brief description of meeting purpose"
                }
              },
              "required": ["calendly_url", "purpose"]
            }
          }
        },
        {
          "type": "function",
          "function": {
            "name": "show_pdf",
            "description": "ALWAYS call this function when the user asks for documents, brochures, whitepapers, pricing sheets, or any PDF materials. Do NOT speak the URL - you MUST invoke this function instead. The function will display the PDF to the user.",
            "parameters": {
              "type": "object",
              "properties": {
                "url": {
                  "type": "string",
                  "description": "The URL of the PDF document to display. Must be publicly accessible."
                },
                "title": {
                  "type": "string",
                  "description": "Brief title describing the document"
                }
              },
              "required": ["url", "title"]
            }
          }
        }
      ]
    }
  ]'
```

### Replace These Values

- `YOUR_PERSONA_ID` - Your Tavus persona ID (e.g., `pc4350da873f`)
- `YOUR_TAVUS_API_KEY` - Your Tavus API key

### Important Notes

- The request uses **JSON Patch** format with `op`, `path`, and `value`
- The `path` must be `/layers/llm/tools` to target the LLM layer's tools
- The `op` is `replace` which overwrites any existing tools
- Tool descriptions should instruct the LLM to "ALWAYS call this function" and "Do NOT speak the URL"

## Persona System Prompt Tips

For the persona to use these tools effectively, include instructions in your persona's system prompt:

```
You have access to the following tools:

1. show_demo_video - Use this to show product demos or tutorial videos
   - When user asks "show me a demo" or "can I see how it works"
   - Pass the video URL in the 'url' parameter

2. show_pdf - Use this to display documents, brochures, or whitepapers
   - When user asks for documentation, pricing, or written materials
   - Pass the PDF URL in the 'url' parameter

3. schedule_meeting - Use this to open the calendar for booking calls
   - When user wants to schedule a meeting, book a demo, or talk to sales
   - No parameters required (uses default Calendly URL)

Always announce what you're about to show before calling a tool.
Example: "Let me show you our product demo video" then call show_demo_video
```

## Frontend Configuration

### Calendly URL

The default Calendly URL is configured in:
```
src/v2-avatar/config/booking-config.json
```

```json
{
  "calendlyUrl": "https://calendly.com/your-team/30min"
}
```

### Tool Handler Location

Tool calls are handled in `TavusAvatarWidget.jsx` in the `handleToolCall` function:

```javascript
const handleToolCall = (name, args) => {
  switch (name) {
    case 'schedule_meeting':
    case 'book_call':        // alias
      // Opens Calendly
      break;
    case 'show_demo_video':
      // Plays video from args.url
      break;
    case 'show_pdf':
      // Shows PDF from args.url
      break;
  }
};
```

## Adding New Tools

To add a new tool:

1. **Update the persona** - PATCH request with the new tool definition
2. **Update frontend** - Add a new case in `handleToolCall`
3. **Add state management** - Create state/refs for the new overlay
4. **Add UI** - Create the overlay component in `renderVideoContainer`

## Troubleshooting

### Tool not triggering
- Check browser console for `[TOOL_CALL]` logs
- Verify tool name matches exactly (case-sensitive)
- Ensure persona has tools configured via PATCH

### Video/PDF not showing
- Check if URL is accessible (CORS issues with some URLs)
- YouTube URLs are auto-converted to embed format
- PDFs use Google Docs Viewer - URL must be publicly accessible

### Avatar audio continues during overlay
- Audio is automatically muted when video plays
- Audio remains active during PDF/Calendly (user can still talk)

## API Reference

### Get Persona (verify tools are set)
```bash
curl --location 'https://tavusapi.com/v2/personas/YOUR_PERSONA_ID' \
--header 'x-api-key: YOUR_TAVUS_API_KEY'
```

### Update Persona Tools (JSON Patch format)
```bash
curl --location --request PATCH 'https://tavusapi.com/v2/personas/YOUR_PERSONA_ID' \
--header 'x-api-key: YOUR_TAVUS_API_KEY' \
--header 'Content-Type: application/json' \
--data '[
    {
      "op": "replace",
      "path": "/layers/llm/tools",
      "value": [...]
    }
  ]'
```
