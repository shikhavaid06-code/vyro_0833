import { createClient } from '@supabase/supabase-js';

// ⚠️ SERVER-ONLY. Never import this in a 'use client' component or expose
// SUPABASE_SERVICE_ROLE_KEY to the browser — it bypasses Row Level Security.
// Used by webhook/verify routes, which act on a user's behalf without that
// user's own session (Razorpay calls our server directly, not the browser).
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});
