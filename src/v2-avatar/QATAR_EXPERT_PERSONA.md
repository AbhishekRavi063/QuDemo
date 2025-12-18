# Qatar Expert Persona - Setup Complete

## Persona Information

**Persona ID**: `pf5e3d8bef4a`  
**Target Audience**: General adults  
**Expertise**: Qatar country knowledge  
**Access URL**: `http://localhost:3000/v2-avatar/pf5e3d8bef4a`

## Knowledge Areas

The persona is an expert in:

### 1. Geography & Location
- Qatar's location in the Arabian Peninsula
- Capital city: Doha
- Neighboring countries
- Climate and terrain
- Major cities and regions

### 2. History
- Qatar's historical background
- Independence (1971)
- Key historical events
- Traditional way of life (pearl diving, fishing)

### 3. Culture & Society
- Qatari traditions and customs
- Arabic language and local dialects
- Islamic culture and practices
- Traditional clothing (thobe, abaya)
- Qatari cuisine
- Arts, music, and cultural heritage
- Family values and social structure

### 4. Economy
- Oil and natural gas industry
- Qatar's wealth and economic development
- Major industries and businesses
- Qatar Investment Authority
- Economic diversification efforts

### 5. Modern Qatar
- World Cup 2022 and its impact
- Modern infrastructure and architecture
- Education City and universities
- Healthcare system
- Technology and innovation
- Vision 2030 (Qatar National Vision)

### 6. Tourism & Attractions
- Popular tourist destinations
- Museums (Museum of Islamic Art, National Museum of Qatar)
- Souq Waqif and traditional markets
- The Pearl-Qatar
- Corniche and waterfront areas
- Desert experiences
- Sports facilities and stadiums

### 7. Current Affairs
- Recent developments and news
- International relations
- Regional role and diplomacy

## Features

✅ **Proactive conversation** - Keeps the conversation flowing like an engaging expert  
✅ **Video support** - Can show videos about Qatar (without saying URLs)  
✅ **Comprehensive knowledge** - Covers all aspects of Qatar  
✅ **Professional tone** - Appropriate for general adult audience  
✅ **Cultural sensitivity** - Respectful of Qatari culture and traditions

## Example Questions

Users can ask:
- "Tell me about Qatar"
- "What is Doha like?"
- "What is Qatar known for?"
- "Tell me about Qatari culture"
- "What are the main attractions in Qatar?"
- "What is Qatar's economy based on?"
- "Tell me about the World Cup 2022 in Qatar"
- "What is Vision 2030?"

## Conversation Flow

1. **User asks** a question about Qatar
2. **Avatar answers** with detailed, accurate information
3. **Avatar offers video** (if appropriate): "I have a video about this topic. Would you like me to show it?"
4. **Avatar continues conversation** proactively if user is silent
5. **Avatar suggests related topics** to keep engagement

## Video Support

The persona can show videos about Qatar using the `show_demo_video` tool. Videos should be:
- Educational or travel-related
- About Qatar topics
- Never announced with URLs (tool handles it silently)

## Testing

Visit: `http://localhost:3000/v2-avatar/pf5e3d8bef4a`

Try asking:
- "What is Qatar?"
- "Tell me about Doha"
- "What is Qatar famous for?"
- "Tell me about Qatari culture"

## Comparison with Human Evolution Persona

| Feature | Human Evolution | Qatar Expert |
|---------|----------------|--------------|
| **Persona ID** | `p99b6eb28083` | `pf5e3d8bef4a` |
| **Audience** | School children (8-14) | General adults |
| **Language** | Simple, child-friendly | Professional, detailed |
| **Topic** | Human evolution | Qatar country |
| **Proactive** | ✅ Yes | ✅ Yes |
| **Video Support** | ✅ Yes | ✅ Yes |

## Updating the Persona

To update this persona, you can:
1. Use PATCH request to update system prompt
2. Add more video URLs to the system prompt
3. Update tool descriptions
4. Modify greeting message

Use the Tavus API:
```bash
curl --location --request PATCH 'https://tavusapi.com/v2/personas/pf5e3d8bef4a' \
--header 'x-api-key: YOUR_TAVUS_API_KEY' \
--header 'Content-Type: application/json' \
--data '[{
  "op": "replace",
  "path": "/system_prompt",
  "value": "Your updated system prompt..."
}]'
```

