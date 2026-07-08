import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Please enter a valid email' }, { status: 400 });
    }

    const { error } = await supabase.from('newsletter_subscribers').insert({ email: email.trim().toLowerCase() });

    // Unique constraint violation just means they're already subscribed — treat as success.
    if (error && error.code !== '23505') {
      console.error('Newsletter insert error:', error.message);
      return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
