import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

// ✅ REFERRAL PROGRAM — "share CRÉO, earn permanent daily generations."
// GET  → returns (and lazily creates) the caller's referral code + stats.
// POST → claims a referral code for a NEW user; the referrer earns +1
//        permanent daily free generation, capped at +10.
// All writes go through the verified session token — a user can never claim
// their own code, claim twice, or forge someone else's referral.
const MAX_BONUS = 10;

async function getUserId(req: NextRequest): Promise<string | null> {
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return null;
  const admin = getSupabaseAdmin();
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data?.user) return null;
  return data.user.id;
}

// Deterministic-ish short code from the user id + random suffix.
function makeCode(userId: string): string {
  const base = userId.replace(/-/g, '').slice(0, 6);
  const rand = Math.random().toString(36).slice(2, 6);
  return `${base}${rand}`.toUpperCase();
}

export async function GET(req: NextRequest) {
  try {
    const userId = await getUserId(req);
    if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    const admin = getSupabaseAdmin();
    const { data: profile } = await admin
      .from('profiles')
      .select('referral_code, referral_bonus')
      .eq('user_id', userId)
      .single();

    let code = profile?.referral_code;
    if (!code) {
      // Lazily assign a code the first time the user opens the referral card.
      for (let attempt = 0; attempt < 3 && !code; attempt++) {
        const candidate = makeCode(userId);
        const { error } = await admin.from('profiles').update({ referral_code: candidate }).eq('user_id', userId);
        if (!error) code = candidate;
      }
    }

    const { count } = await admin
      .from('profiles')
      .select('user_id', { count: 'exact', head: true })
      .eq('referred_by', code || '___none___');

    return NextResponse.json({
      code: code || null,
      referrals: count || 0,
      bonus: Math.min(profile?.referral_bonus || 0, MAX_BONUS),
      maxBonus: MAX_BONUS,
    });
  } catch {
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId(req);
    if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    const { code } = await req.json();
    if (!code || typeof code !== 'string') return NextResponse.json({ error: 'invalid_code' }, { status: 400 });
    const cleanCode = code.trim().toUpperCase().slice(0, 20);

    const admin = getSupabaseAdmin();

    // The claimer must not already have a referrer (one claim per account, ever).
    const { data: me } = await admin.from('profiles').select('referred_by, referral_code').eq('user_id', userId).single();
    if (!me) return NextResponse.json({ error: 'no_profile' }, { status: 400 });
    if (me.referred_by) return NextResponse.json({ error: 'already_claimed' }, { status: 400 });
    if (me.referral_code && me.referral_code === cleanCode) return NextResponse.json({ error: 'own_code' }, { status: 400 });

    // Find the referrer.
    const { data: referrer } = await admin
      .from('profiles')
      .select('user_id, referral_bonus')
      .eq('referral_code', cleanCode)
      .single();
    if (!referrer || referrer.user_id === userId) return NextResponse.json({ error: 'code_not_found' }, { status: 404 });

    // Record the referral + reward the referrer (capped).
    await admin.from('profiles').update({ referred_by: cleanCode }).eq('user_id', userId);
    const newBonus = Math.min((referrer.referral_bonus || 0) + 1, MAX_BONUS);
    await admin.from('profiles').update({ referral_bonus: newBonus }).eq('user_id', referrer.user_id);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
