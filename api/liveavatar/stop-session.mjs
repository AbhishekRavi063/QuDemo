/**
 * Vercel Serverless Function
 * Stops a HeyGen LiveAvatar session
 *
 * Endpoint: /api/liveavatar/stop-session
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
    const { sessionId, sessionToken } = req.body;

    if (!sessionId || !sessionToken) {
      return res.status(400).json({
        error: 'Missing required parameters',
        message: 'sessionId and sessionToken are required'
      });
    }

    console.log('Stopping LiveAvatar session:', sessionId);

    // Call HeyGen stop session API
    const stopResponse = await fetch('https://api.liveavatar.com/v1/sessions/stop', {
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

    if (!stopResponse.ok) {
      const errorData = await stopResponse.text();
      console.error('LiveAvatar stop API error:', stopResponse.status, errorData);
      return res.status(stopResponse.status).json({
        error: 'Failed to stop session',
        details: errorData,
      });
    }

    const stopData = await stopResponse.json();
    console.log('Session stopped successfully:', sessionId);

    return res.status(200).json({
      success: true,
      message: 'Session stopped successfully',
      data: stopData,
    });

  } catch (error) {
    console.error('Error stopping LiveAvatar session:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
}
