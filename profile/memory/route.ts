import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

// ✅ CREATOR BRAIN — persistence for the "teach CRÉO your niche/audience/
// voice/goals" profile shown in CreatorBrainModal.tsx. This route was
// missing entirely (the modal called it, got a 404, and silently told the
// user their profile didn't save) — this fixes that.
//
// Stored as a single JSONB column (`creator_memory`) on `profiles`, already
// read by /api/generate/route.ts for Ultra users. If that column somehow
// doesn't exist yet in your Supabase project, run this once in the SQL
// editor:
//   ALTER TABLE profiles ADD COLUMN IF NOT EXISTS creator_memory JSONB;

const FIELD_KEYS = ['niche', 'audience', 'style', 'goals'] as const;
type MemoryField = (typeof FIELD_KEYS)[number];
const MAX_FIELD_LEN = 500;

async function getUserId(req: NextRequest): Promise<string | null> {
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return null;
  const admin = getSupabaseAdmin();
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data?.user) return null;
  return data.user.id;
}

export async function GET(req: NextRequest) {
  try {
    const userId = await getUserId(req);
    if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    const admin = getSupabaseAdmin();
    const { data: profile, error } = await admin
      .from('profiles')
      .select('creator_memory')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('profile/memory GET error:', error.message);
      return NextResponse.json({ error: 'server_error' }, { status: 500 });
    }

    const memory = profile?.creator_memory && typeof profile.creator_memory === 'object' ? profile.creator_memory : null;
    return NextResponse.json({ memory });
  } catch (err) {
    console.error('profile/memory GET error:', err);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId(req);
    if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    const body = await req.json();
    if (!body || typeof body !== 'object') return NextResponse.json({ error: 'invalid_body' }, { status: 400 });

    // ✅ Only accept the four known fields, each trimmed and capped — never
    // trust the client to send exactly what the UI sends.
    const memory: Record<MemoryField, string> = { niche: '', audience: '', style: '', goals: '' };
    for (const key of FIELD_KEYS) {
      const value = body[key];
      if (typeof value === 'string') memory[key] = value.trim().slice(0, MAX_FIELD_LEN);
    }

    const admin = getSupabaseAdmin();
    const { error } = await admin.from('profiles').update({ creator_memory: memory }).eq('user_id', userId);

    if (error) {
      console.error('profile/memory POST error:', error.message);
      return NextResponse.json({ error: 'server_error' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('profile/memory POST error:', err);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
