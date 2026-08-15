import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

// ✅ ANALYTICS — manual entry, real math only.
// Every number returned is either something the user typed in, or a
// derived calculation from what they typed in. Nothing is estimated,
// guessed, or shown when there isn't enough data to support it.

async function getUserId(req: NextRequest): Promise<string | null> {
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return null;
  const { data, error } = await getSupabaseAdmin().auth.getUser(token);
  if (error || !data?.user) return null;
  return data.user.id;
}

function computeMetrics(entries: any[]) {
  if (!entries.length) return null;

  const withEngagementInputs = entries.filter((e) => e.views && (e.likes || e.comments || e.shares || e.saves));
  const avgEngagementRate = withEngagementInputs.length
    ? withEngagementInputs.reduce((sum, e) => {
        const interactions = (e.likes || 0) + (e.comments || 0) + (e.shares || 0) + (e.saves || 0);
        return sum + (interactions / e.views) * 100;
      }, 0) / withEngagementInputs.length
    : null;

  const totalViews = entries.reduce((s, e) => s + (e.views || 0), 0);
  const totalLikes = entries.reduce((s, e) => s + (e.likes || 0), 0);
  const totalComments = entries.reduce((s, e) => s + (e.comments || 0), 0);
  const totalShares = entries.reduce((s, e) => s + (e.shares || 0), 0);

  const topByViews = [...entries].filter((e) => e.views != null).sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5);

  const byPlatform: Record<string, { count: number; totalViews: number; avgEngagement: number | null }> = {};
  for (const e of entries) {
    if (!byPlatform[e.platform]) byPlatform[e.platform] = { count: 0, totalViews: 0, avgEngagement: null };
    byPlatform[e.platform].count += 1;
    byPlatform[e.platform].totalViews += e.views || 0;
  }
  for (const platform of Object.keys(byPlatform)) {
    const platformEntries = withEngagementInputs.filter((e) => e.platform === platform);
    if (platformEntries.length) {
      byPlatform[platform].avgEngagement = platformEntries.reduce((sum, e) => {
        const interactions = (e.likes || 0) + (e.comments || 0) + (e.shares || 0) + (e.saves || 0);
        return sum + (interactions / e.views) * 100;
      }, 0) / platformEntries.length;
    }
  }

  return {
    totalEntries: entries.length,
    totalViews,
    totalLikes,
    totalComments,
    totalShares,
    avgEngagementRate: avgEngagementRate !== null ? Math.round(avgEngagementRate * 10) / 10 : null,
    topByViews,
    byPlatform,
  };
}

export async function GET(req: NextRequest) {
  try {
    const userId = await getUserId(req);
    if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    const { data, error } = await getSupabaseAdmin()
      .from('content_performance')
      .select('*')
      .eq('user_id', userId)
      .order('published_at', { ascending: false, nullsFirst: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const entries = data || [];
    return NextResponse.json({ entries, metrics: computeMetrics(entries) });
  } catch {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId(req);
    if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    const body = await req.json();
    const { platform, title, url, published_at, views, likes, comments, shares, saves, watch_time_seconds, followers_gained } = body;

    if (!platform || !title) {
      return NextResponse.json({ error: 'Platform and title are required' }, { status: 400 });
    }

    const { data, error } = await getSupabaseAdmin()
      .from('content_performance')
      .insert({
        user_id: userId, platform, title, url: url || null, published_at: published_at || null,
        views: views ?? null, likes: likes ?? null, comments: comments ?? null, shares: shares ?? null,
        saves: saves ?? null, watch_time_seconds: watch_time_seconds ?? null, followers_gained: followers_gained ?? null,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ entry: data });
  } catch {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
