import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ⚠️ SERVER-ONLY. Never import this in a 'use client' component or expose
// SUPABASE_SERVICE_ROLE_KEY to the browser — it bypasses Row Level Security.
// Used by webhook/verify/cron routes, which act without a user's own
// browser session (Razorpay and Vercel Cron call our server directly).
//
// ✅ Built lazily, on first real use — not at module import time. Supabase's
// client throws immediately if the key is missing, and throwing at import
// time crashes the ENTIRE Next.js build (every route, not just this one).
// Building it lazily means a misconfigured env var only breaks the one
// request that actually needed it, with a clear error message.
let _client: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (_client) return _client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      'Supabase admin client is not configured — check that NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (exact name) are set in Vercel.'
    );
  }

  _client = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
  return _client;
}
