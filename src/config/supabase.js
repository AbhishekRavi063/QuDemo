import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'your-supabase-url';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'your-supabase-anon-key';

console.log('🔍 Supabase Config:');
console.log('🔍 URL:', supabaseUrl);
console.log('🔍 Anon Key:', supabaseAnonKey ? 'Set' : 'Not set');
console.log('🔍 Anon Key length:', supabaseAnonKey?.length || 0);
console.log('🔍 Using placeholder values:', supabaseUrl === 'your-supabase-url' || supabaseAnonKey === 'your-supabase-anon-key-here');
console.log('🔍 Environment variables loaded:', {
  REACT_APP_SUPABASE_URL: process.env.REACT_APP_SUPABASE_URL,
  REACT_APP_SUPABASE_ANON_KEY: process.env.REACT_APP_SUPABASE_ANON_KEY ? 'Set' : 'Not set'
});

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Test Supabase connection
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error('🔍 Supabase connection test failed:', error);
  } else {
    console.log('🔍 Supabase connection test successful');
  }
});

export default supabase;
