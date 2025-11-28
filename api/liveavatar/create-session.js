/**
 * Vercel Serverless Function
 * Creates a LiveKit session for HeyGen Interactive Avatar
 *
 * Endpoint: /api/liveavatar/create-session
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

    // STEP 1: Create session token
    const tokenResponse = await fetch('https://api.liveavatar.com/v1/sessions/token', {
      method: 'POST',
      headers: {
        'X-API-KEY': HEYGEN_API_KEY,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mode: 'FULL',
        avatar_id: process.env.HEYGEN_AVATAR_ID || '513fd1b7-7ef9-466d-9af2-344e51eeb833',
        avatar_persona: {
          voice_id: process.env.HEYGEN_VOICE_ID || 'e59787e949bd43e9ad4bef693e6b8c8e',
          context_id: process.env.HEYGEN_CONTEXT_ID || '0594f8e4-c890-44dc-a5f4-113248958449',
          language: 'en',
        },
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('LiveAvatar token API error:', tokenResponse.status, errorData);
      return res.status(tokenResponse.status).json({
        error: 'Failed to create session token',
        details: errorData,
      });
    }

    const tokenData = await tokenResponse.json();
    const sessionToken = tokenData?.data?.session_token;
    const sessionId = tokenData?.data?.session_id;

    console.log('Session token created:', sessionId);

    if (!sessionToken || !sessionId) {
      console.error('Malformed token response:', tokenData);
      return res.status(500).json({
        error: 'Malformed token response',
        details: tokenData,
      });
    }

    // STEP 2: Start session to get LiveKit credentials
    const startResponse = await fetch('https://api.liveavatar.com/v1/sessions/start', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionToken}`,
      },
      body: JSON.stringify({
        session_id: sessionId,
      }),
    });

    if (!startResponse.ok) {
      const errorData = await startResponse.text();
      console.error('LiveAvatar start API error:', startResponse.status, errorData);
      return res.status(startResponse.status).json({
        error: 'Failed to start session',
        details: errorData,
      });
    }

    const startData = await startResponse.json();
    const livekitUrl = startData?.data?.livekit_url ?? startData?.livekit_url;
    const livekitClientToken = startData?.data?.livekit_client_token ?? startData?.livekit_client_token;

    console.log('Session started successfully with LiveKit credentials');

    if (!livekitUrl || !livekitClientToken) {
      console.warn('Missing LiveKit info in start response:', startData);
      return res.status(200).json({
        sessionId,
        sessionToken,
        warning: 'startSucceededButNoLivekitInfo',
        startData,
      });
    }

    // Return session credentials in the format frontend expects
    return res.status(200).json({
      sessionId,
      sessionToken,
      livekitUrl,
      livekitClientToken,
      _backend: 'vercel-serverless', // Identifier to confirm using Vercel
    });

  } catch (error) {
    console.error('Error creating LiveAvatar session:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
}
