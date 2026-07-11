import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

// ✅ REVIEW COLLECTOR
// GET  → the caller's own review (to prefill the form in Settings).
// POST → create or update the caller's review { rating: 1–5, review: text }.
// One review per user (upsert on user_id). Reviews are read by Shaurya in
// the Supabase Table Editor — there is deliberately no public read endpoint,
// so nothing can be scraped and no fake social proof can leak to the site.

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

    const { data } = await getSupabaseAdmin()
      .from('reviews')
      .select('rating, review, updated_at')
      .eq('user_id', userId)
      .single();

    return NextResponse.json({ review: data || null });
  } catch (err) {
    console.error('reviews GET error:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId(req);
    if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const rating = Number(body?.rating);
    const review = typeof body?.review === 'string' ? body.review.trim().slice(0, 2000) : '';

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be 1 to 5 stars' }, { status: 400 });
    }

    const admin = getSupabaseAdmin();

    // Snapshot the user's plan so feedback can be read in context
    // ("free users want X, ultra users want Y").
    const { data: profile } = await admin
      .from('profiles')
      .select('plan')
      .eq('user_id', userId)
      .single();

    const { error } = await admin.from('reviews').upsert(
      {
        user_id: userId,
        rating,
        review,
        plan: profile?.plan || 'free',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' },
    );

    if (error) {
      console.error('Review upsert error:', error.message);
      return NextResponse.json({ error: 'Could not save your review — please try again' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('reviews POST error:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
