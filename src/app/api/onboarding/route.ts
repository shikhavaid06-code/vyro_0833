import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

// ✅ ONBOARDING SAVE — the onboarding flow used to write `hear`/`skill`
// straight from the browser with the anon key, which row-level security
// silently blocked: the page LOOKED like it worked, but no answer was ever
// saved. This route saves through the service role (same verified-token
// pattern as /api/referral), so the data actually lands.
// GET  → { completed } — has this user already answered? (used by the
//         workspace to send not-yet-onboarded users to /onboarding-flow once)
// POST → { hear, skill } — save the answers.

const HEAR_IDS = ['youtube', 'tiktok', 'instagram', 'twitter', 'google', 'friend', 'reddit', 'linkedin', 'podcast', 'newsletter', 'ad', 'other'];
const SKILL_IDS = ['beginner', 'intermediate', 'advanced'];

async function getUserId(req: NextRequest): Promise<string | null> {
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return null;
  const { data, error } = await getSupabaseAdmin().auth.getUser(token);
  if (error || !data?.user) return null;
  return data.user.id;
}

export async function GET(req: NextRequest) {
  try {
    const userId = await getUserId(req);
    if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    const { data: profile } = await getSupabaseAdmin()
      .from('profiles')
      .select('hear, skill')
      .eq('user_id', userId)
      .single();

    return NextResponse.json({ completed: !!(profile?.hear && profile?.skill) });
  } catch (err) {
    console.error('onboarding GET error:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId(req);
    if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const hear = HEAR_IDS.includes(body?.hear) ? body.hear : null;
    const skill = SKILL_IDS.includes(body?.skill) ? body.skill : null;
    if (!hear || !skill) {
      return NextResponse.json({ error: 'Both answers are required' }, { status: 400 });
    }

    const { error } = await getSupabaseAdmin()
      .from('profiles')
      .update({ hear, skill })
      .eq('user_id', userId);

    if (error) {
      console.error('Onboarding save error:', error.message);
      return NextResponse.json({ error: 'Could not save — try again' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('onboarding POST error:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
