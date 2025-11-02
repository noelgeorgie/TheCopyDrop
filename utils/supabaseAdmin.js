import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

// --- THIS IS THE FIX ---
// Changed from SUPABASE_SERVICE_KEY to SUPABASE_SERVICE_ROLE_KEY to match your .env.local file
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; 

if (!supabaseServiceKey) {
  console.error('CRITICAL: SUPABASE_SERVICE_ROLE_KEY is missing. API routes will fail.');
  // Throw an error to make it obvious
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set in .env.local. Check your .env.local file.');
}

// This is your admin client. ONLY import this in API routes.
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

