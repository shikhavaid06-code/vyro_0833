import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

// ✅ Exposes only what's needed to honestly reconstruct which of the last 7
// days were real active-streak days — no new tracking invented, this reads
// columns that already exist and are already written by /api/generate.
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    const admin = getSupabaseAdmin();
    const { data: userData, error: userErr } = await admin.auth.getUser(token);
    if (userErr || !userData?.user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    const { data: profile } = await admin
      .from('profiles')
      .select('streak_count, last_gen_date')
      .eq('user_id', userData.user.id)
      .single();

    return NextResponse.json({
      streakCount: profile?.streak_count || 0,
      lastGenDate: profile?.last_gen_date || null,
    });
  } catch {
    return NextResponse.json({ streakCount: 0, lastGenDate: null });
  }
}
