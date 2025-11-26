/**
 * Local development server for testing API routes
 * Run this alongside npm start for full local testing
 *
 * Usage: node dev-server.mjs
 */

import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

// Load .env.local file explicitly
dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Enable CORS for React dev server
app.use(cors());
app.use(express.json());

// Import the API handler dynamically
const { default: createSessionHandler } = await import('./api/liveavatar/create-session.js');

// Mount the primary API route (current frontend expects this path)
app.post('/api/liveavatar/create-session', async (req, res) => {
  console.log('📡 API Request received:', req.body);

  try {
    await createSessionHandler(req, res);
  } catch (error) {
    console.error('❌ API Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Also support alternative path for compatibility
app.post('/api/create-liveavatar-session', async (req, res) => {
  console.log('📡 API Request received (alt path):', req.body);

  try {
    await createSessionHandler(req, res);
  } catch (error) {
    console.error('❌ API Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Dev server running!' });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`
🚀 Development API Server running!

📡 API Endpoints:
   - http://localhost:${PORT}/api/liveavatar/create-session (primary)
   - http://localhost:${PORT}/api/create-liveavatar-session (alt)
✅ Health Check: http://localhost:${PORT}/api/health

💡 Make sure to:
1. Set environment variables in .env.local
2. Run React app: npm start (in another terminal)
3. Both servers must run simultaneously

Press Ctrl+C to stop
  `);
});
