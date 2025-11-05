import { createClient } from '@supabase/supabase-js';

// Use valid placeholder URL for development without env vars
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxOTI4MDAsImV4cCI6MTk2MDc2ODgwMH0.placeholder';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Test Supabase connection (only if real env vars exist)
if (process.env.REACT_APP_SUPABASE_URL) {
  supabase.auth.getSession().then(({ data, error }) => {
    if (error) {
      console.log('Supabase connection error (expected in dev mode)');
    } else {
      console.log('Supabase connected');
    }
  });
}

export default supabase;
