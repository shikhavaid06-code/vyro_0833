import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

function addPeriod(billing: 'monthly' | 'yearly'): string {
  const end = new Date();
  if (billing === 'yearly') end.setFullYear(end.getFullYear() + 1);
  else end.setMonth(end.getMonth() + 1);
  return end.toISOString();
}

export async function POST(req: NextRequest) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      userId,
      plan,
      billing,
    } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !userId || !plan || !billing) {
      return NextResponse.json({ error: 'Missing payment details' }, { status: 400 });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) return NextResponse.json({ error: 'Payments are not configured yet' }, { status: 500 });

    // ✅ This is the actual security check — confirms the payment really came
    // from Razorpay and wasn't forged by someone calling this endpoint directly.
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 });
    }

    const { error } = await getSupabaseAdmin()
      .from('profiles')
      .update({
        plan,
        subscription_end_date: addPeriod(billing),
        last_payment_id: razorpay_payment_id,
      })
      .eq('user_id', userId);

    if (error) {
      console.error('Profile update error after payment:', error.message);
      return NextResponse.json({ error: 'Payment succeeded but activating your plan failed — contact support' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('verify error:', err);
    return NextResponse.json({ error: 'Something went wrong verifying your payment' }, { status: 500 });
  }
}
