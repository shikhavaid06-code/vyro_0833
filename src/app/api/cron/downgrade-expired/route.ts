import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(req: NextRequest) {
  // ✅ Vercel Cron sends this header automatically — this stops randoms on
  // the internet from hitting the route and mass-downgrading every user.
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .update({ plan: 'free' })
    .lt('subscription_end_date', new Date().toISOString())
    .neq('plan', 'free')
    .select('user_id');

  if (error) {
    console.error('Downgrade cron error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ downgraded: data?.length ?? 0 });
}
