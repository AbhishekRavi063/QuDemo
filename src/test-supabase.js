// Test Supabase configuration
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

console.log('🔍 Supabase Test:');
console.log('🔍 URL:', supabaseUrl);
console.log('🔍 Anon Key length:', supabaseAnonKey?.length);
console.log('🔍 Anon Key starts with:', supabaseAnonKey?.substring(0, 20));

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test basic connection
supabase.auth.getSession().then(({ data, error }) => {
  console.log('🔍 Session test result:', { data, error });
});

// Test OAuth URL generation
supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: 'http://localhost:3000/auth/callback'
  }
}).then(({ data, error }) => {
  console.log('🔍 OAuth URL test:', { data, error });
  if (data?.url) {
    console.log('🔍 Generated OAuth URL:', data.url);
  }
});
