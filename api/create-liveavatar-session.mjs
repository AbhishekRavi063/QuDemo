/**
 * Vercel Serverless Function
 * Creates a LiveKit session for HeyGen Interactive Avatar
 *
 * Endpoint: /api/create-liveavatar-session
 */

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId = 'default-user' } = req.body;

    // Get HeyGen API key from environment
    const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;

    if (!HEYGEN_API_KEY) {
      console.error('Missing HEYGEN_API_KEY environment variable');
      return res.status(500).json({
        error: 'Server configuration error',
        message: 'Missing API key'
      });
    }

    console.log('Creating LiveAvatar session for user:', userId);

    // Call HeyGen API to create streaming session
    const response = await fetch('https://api.heygen.com/v1/streaming.new', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': HEYGEN_API_KEY,
      },
      body: JSON.stringify({
        quality: 'medium',
        avatar_name: process.env.HEYGEN_AVATAR_ID || '513fd1b7-7ef9-466d-9af2-344e51eeb833',
        voice: {
          voice_id: process.env.HEYGEN_VOICE_ID || '9c0d4577-2863-4d96-b476-05dcd28878da',
        },
        version: 'v2',
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('HeyGen API error:', response.status, errorData);
      return res.status(response.status).json({
        error: 'Failed to create session',
        details: errorData,
      });
    }

    const data = await response.json();

    console.log('Session created successfully:', data.data?.session_id);

    // Return LiveKit credentials
    return res.status(200).json({
      sessionId: data.data.session_id,
      livekitUrl: data.data.url,
      livekitClientToken: data.data.access_token,
      sdp: data.data.sdp,
      ice_servers: data.data.ice_servers,
    });

  } catch (error) {
    console.error('Error creating LiveAvatar session:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
}
