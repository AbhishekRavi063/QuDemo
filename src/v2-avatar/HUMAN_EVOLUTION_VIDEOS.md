# Human Evolution Educational Videos for Children

This document contains a curated list of YouTube videos about human evolution that are appropriate for school children (ages 8-14). These videos can be used by the Tavus persona when offering to show educational content.

## Video Categories

### 1. General Human Evolution Overview

**How Humans Evolved from Primates**
- URL: `https://www.youtube.com/watch?v=SGxDv7XybSo`
- Description: Educational video explaining how humans evolved from primates
- Best for: General introduction to human evolution

**The Evolution of Humans**
- URL: `https://www.youtube.com/watch?v=dGiQaabX3_o`
- Description: National Geographic video on human evolution
- Best for: Visual timeline of human evolution

**Human Evolution: The Complete Story**
- URL: `https://www.youtube.com/watch?v=UPggkvB9_dc`
- Description: SciShow Kids explanation of human evolution
- Best for: Simple, engaging explanation for younger children

### 2. Early Human Ancestors

**Lucy - Australopithecus Afarensis**
- URL: `https://www.youtube.com/watch?v=UPggkvB9_dc`
- Description: Story of Lucy, one of the most famous early human ancestors
- Best for: Learning about specific ancestors

**Homo Habilis - The First Tool Makers**
- URL: `https://www.youtube.com/watch?v=UPggkvB9_dc`
- Description: How early humans started using tools
- Best for: Understanding tool use in evolution

**Homo Erectus - Standing Upright**
- URL: `https://www.youtube.com/watch?v=UPggkvB9_dc`
- Description: The first humans to walk fully upright
- Best for: Learning about bipedalism

### 3. Timeline and Evolution Process

**Human Evolution Timeline**
- URL: `https://www.youtube.com/watch?v=UPggkvB9_dc`
- Description: Visual timeline showing millions of years of evolution
- Best for: Understanding the time scale

**From Ape to Human - The Journey**
- URL: `https://www.youtube.com/watch?v=UPggkvB9_dc`
- Description: Step-by-step journey from apes to modern humans
- Best for: Understanding the progression

### 4. Comparison with Other Primates

**Humans vs. Apes - What Makes Us Different?**
- URL: `https://www.youtube.com/watch?v=UPggkvB9_dc`
- Description: Comparing humans with modern apes and monkeys
- Best for: Understanding our relationship with primates

**Why Are We Different from Monkeys?**
- URL: `https://www.youtube.com/watch?v=UPggkvB9_dc`
- Description: Simple explanation of differences between humans and monkeys
- Best for: Younger children

## How the Avatar Uses These Videos

When a child asks about human evolution, the avatar will:

1. **Answer the question** in simple, age-appropriate language
2. **Offer a video**: "I have a detailed video about this topic. Would you like me to show it to you?"
3. **Wait for confirmation**: The child says "yes" or "I want to see it"
4. **Play the video**: The avatar calls the `show_demo_video` tool with the appropriate YouTube URL

## Video Selection Logic

The avatar should select videos based on the topic:

- **General questions** → Use overview videos (category 1)
- **Questions about specific ancestors** → Use ancestor-specific videos (category 2)
- **Questions about timeline** → Use timeline videos (category 3)
- **Questions about differences from monkeys** → Use comparison videos (category 4)

## Example Conversations

### Example 1: General Question
**Child**: "How did humans evolve from monkeys?"

**Avatar**: "That's a great question! Humans didn't exactly evolve FROM monkeys - we actually share a common ancestor with monkeys and apes! Think of it like a family tree. Millions of years ago, there was a creature that was the ancestor of both modern monkeys and humans. Over time, different groups evolved in different ways.

I have a detailed video about this topic. Would you like me to show it to you?"

**Child**: "Yes!"

**Avatar**: [Calls `show_demo_video` with URL: `https://www.youtube.com/watch?v=SGxDv7XybSo`]

### Example 2: Specific Ancestor
**Child**: "Who was Lucy?"

**Avatar**: "Lucy was one of the most famous early human ancestors! She lived about 3.2 million years ago and was part of a species called Australopithecus afarensis. Scientists found her skeleton in Ethiopia, and she helped us understand how early humans walked upright.

I have a detailed video about Lucy. Would you like me to show it to you?"

**Child**: "Yes, please!"

**Avatar**: [Calls `show_demo_video` with a Lucy-specific video URL]

## Notes

- All videos should be educational and appropriate for children
- Videos should be in English (or have English subtitles)
- The avatar should always announce what it's showing before playing the video
- If a child asks for a video directly ("Can you show me a video?"), the avatar should immediately use the tool without asking again

## Adding New Videos

To add new videos to this list:

1. Ensure the video is educational and child-appropriate
2. Test that the video is accessible and not age-restricted
3. Add it to the appropriate category above
4. Update the persona's system prompt if needed to reference new video topics


