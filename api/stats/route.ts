import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// ✅ Returns REAL numbers from Supabase, never fabricated ones.
// If the RPC (sql/get_public_stats.sql) hasn't been run yet, or the query
// fails for any reason, this returns nulls — the frontend is responsible
// for hiding/softening any stat it doesn't have real data for.
export async function GET() {
  try {
    const { data, error } = await supabase.rpc('get_public_stats');
    if (error) throw error;

    return NextResponse.json({
      totalCreators: typeof data?.total_creators === 'number' ? data.total_creators : null,
      totalGenerated: typeof data?.total_generated === 'number' ? data.total_generated : null,
    });
  } catch (err) {
    return NextResponse.json({ totalCreators: null, totalGenerated: null }, { status: 200 });
  }
}
