# YouTube Videos for Human Evolution Avatar

## Primary Video (Most Commonly Used)

**Video**: Human Evolution from Primates  
**URL**: `https://www.youtube.com/watch?v=SGxDv7XybSo`  
**Use For**: 
- General human evolution questions
- "How did humans evolve from monkeys?"
- "What is human evolution?"
- Most common questions about human evolution
- Default video when child asks to see a video

## Video Usage Flow

1. **Child asks a question** about human evolution
2. **Avatar answers** in simple, child-friendly terms
3. **Avatar offers**: "I have a detailed video about this topic. Would you like me to show it to you?"
4. **Child says**: "Yes" or "I want to see it"
5. **Avatar plays**: The video using the `show_demo_video` tool

## Current Configuration

The persona (`p99b6eb28083`) is currently configured to use:
- **Primary video**: `https://www.youtube.com/watch?v=SGxDv7XybSo`

This video is used for:
- General evolution questions
- Questions about ancestors
- Timeline questions
- Comparison questions
- Any time a child asks to see a video

## Adding More Videos

To add more specific videos in the future:

1. **Find appropriate videos**: Educational, child-friendly YouTube videos about human evolution
2. **Test accessibility**: Ensure videos are not age-restricted and are accessible
3. **Update persona**: Use the `update-persona-videos.mjs` script or PATCH the persona directly
4. **Add to documentation**: Update this file and `HUMAN_EVOLUTION_VIDEOS.md`

## Example Video Topics to Add Later

- **Lucy (Australopithecus)**: Specific video about the famous early human ancestor
- **Timeline Videos**: Visual timeline showing millions of years
- **Tool Making**: Videos about how early humans started using tools
- **Walking Upright**: Videos about bipedalism and walking on two legs
- **Brain Development**: Videos about how human brains evolved
- **Migration**: Videos about how humans spread across the world

## Quick Reference

**Current Persona ID**: `p99b6eb28083`  
**Primary Video**: `https://www.youtube.com/watch?v=SGxDv7XybSo`  
**Access URL**: `http://localhost:3000/v2-avatar/p99b6eb28083`


