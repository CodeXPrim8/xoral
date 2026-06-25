import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabasePublicKey, isSupabaseConfigured } from './config';

let browserClient: SupabaseClient | undefined;

function getBrowserClient() {
  if (!browserClient) {
    browserClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      getSupabasePublicKey()!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: true,
          detectSessionInUrl: true,
        },
      }
    );
  }
  return browserClient;
}

export function createClient() {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured');
  }
  return getBrowserClient();
}

export function createClientIfConfigured() {
  if (!isSupabaseConfigured()) return null;
  return getBrowserClient();
}
