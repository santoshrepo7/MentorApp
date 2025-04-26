import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please connect to Supabase using the "Connect to Supabase" button in the top right.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);