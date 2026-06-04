// Supabase Client Configuration
const { createClient } = require('@supabase/supabase-js');

// Validate required environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

// Helper function to check if URL is valid
const isValidUrl = (url) => {
  if (!url) return false;
  // Check if it's a placeholder value
  if (url.includes('your_supabase') || url === 'your_supabase_project_url') return false;
  // Check if it's a valid HTTP/HTTPS URL
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
};

// Helper function to check if key is valid
const isValidKey = (key) => {
  if (!key) return false;
  // Check if it's a placeholder value
  if (key.includes('your_supabase') || key.startsWith('your_')) return false;
  return key.length > 20; // Real JWT keys are much longer
};

const hasValidCredentials = isValidUrl(supabaseUrl) && isValidKey(supabaseAnonKey);

if (!hasValidCredentials) {
  console.warn('⚠️  Supabase credentials not configured. Using SQLite fallback.');
  console.warn('   Set SUPABASE_URL and SUPABASE_ANON_KEY in .env to enable Supabase.');
  console.warn('   See SUPABASE_SETUP.md for configuration instructions.');
}

// Create Supabase client with anon key (for client-side operations)
const supabase = hasValidCredentials
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Create Supabase admin client with service key (for server-side operations)
const supabaseAdmin = hasValidCredentials && isValidKey(supabaseServiceKey)
  ? createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
  : null;

// Check if Supabase is enabled
const isSupabaseEnabled = () => {
  return supabase !== null && supabaseAdmin !== null;
};

module.exports = {
  supabase,
  supabaseAdmin,
  isSupabaseEnabled
};
