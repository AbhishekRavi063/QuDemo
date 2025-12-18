# Quick Video Reference for Human Evolution Avatar

This is a quick reference guide for which YouTube videos to use for different topics.

## Primary Video (Most Common)

**URL**: `https://www.youtube.com/watch?v=SGxDv7XybSo`
**Use for**:
- General human evolution questions
- "How did humans evolve from monkeys?"
- "What is human evolution?"
- Most common questions about human evolution

## Video Selection Guide

When the avatar needs to show a video, it should:

1. **Match the topic** to the most relevant video
2. **Use the primary video** (`SGxDv7XybSo`) for most general questions
3. **Announce first**: "Let me show you a great video about [topic]"
4. **Then call the tool** with the appropriate URL

## Example Tool Call

```javascript
{
  "name": "show_demo_video",
  "args": {
    "url": "https://www.youtube.com/watch?v=SGxDv7XybSo",
    "title": "How Humans Evolved from Primates"
  }
}
```

## Adding More Videos

To add more specific videos:

1. Find educational, child-appropriate YouTube videos
2. Test that they're accessible
3. Add them to `HUMAN_EVOLUTION_VIDEOS.md`
4. Update the persona's system prompt with the new URLs
5. Re-run the persona creation script or update via PATCH


