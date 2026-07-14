import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { grantUpgradeCredit } from '@/lib/upgradeCredit';

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
    } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing payment details' }, { status: 400 });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) return NextResponse.json({ error: 'Payments are not configured yet' }, { status: 500 });

    // ✅ Security check 1 — the signature proves this order/payment pair
    // really came from Razorpay and wasn't forged by calling this endpoint.
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 });
    }

    // ✅ Security check 2 — LIVE-MODE HARDENING. The signature only proves the
    // payment exists; it says nothing about WHICH plan was paid for. The old
    // version trusted plan/billing/userId from the request body, which meant
    // a paying Pro user could replay their valid signature with plan:"ultra"
    // and self-upgrade for free. Now we fetch the payment from Razorpay and
    // read plan/billing/userId from the ORDER NOTES we ourselves attached in
    // create-order — the client's word is never the source of truth for money.
    const authHeader = `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`;
    const payRes = await fetch(`https://api.razorpay.com/v1/payments/${razorpay_payment_id}`, {
      headers: { Authorization: authHeader },
    });
    const payment = await payRes.json();
    if (!payRes.ok || !payment?.id) {
      console.error('verify: payment lookup failed:', JSON.stringify(payment));
      return NextResponse.json({ error: 'Could not confirm your payment with the provider — please contact support' }, { status: 502 });
    }
    if (payment.order_id !== razorpay_order_id) {
      return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 });
    }
    if (payment.status !== 'captured' && payment.status !== 'authorized') {
      return NextResponse.json({ error: 'Payment is not complete yet — if you were charged, contact support' }, { status: 400 });
    }

    // The ORDER's notes were written by our own create-order route and can't
    // be touched from the browser (payment.notes CAN be — Checkout lets the
    // client attach notes to the payment). Orders are the source of truth.
    const orderRes = await fetch(`https://api.razorpay.com/v1/orders/${razorpay_order_id}`, {
      headers: { Authorization: authHeader },
    });
    const order = await orderRes.json();
    if (!orderRes.ok || !order?.id) {
      console.error('verify: order lookup failed:', JSON.stringify(order));
      return NextResponse.json({ error: 'Could not confirm your order with the provider — please contact support' }, { status: 502 });
    }

    const notes = order.notes || {};
    const userId: string | undefined = notes.userId;
    const plan: string | undefined = notes.plan;
    const billing: string | undefined = notes.billing;
    if (!userId || !plan || !['pro', 'ultra'].includes(plan) || !['monthly', 'yearly'].includes(billing || '')) {
      console.error('verify: order notes missing/invalid:', JSON.stringify(notes));
      return NextResponse.json({ error: 'Payment succeeded but activating your plan failed — contact support' }, { status: 500 });
    }

    const admin = getSupabaseAdmin();

    // ✅ PRO → ULTRA FAIR UPGRADE: before overwriting the profile, refund the
    // unused days of the old Pro payment automatically. Must run BEFORE the
    // update below — it reads the OLD last_payment_id / end date. Never
    // blocks activation; returns null if there's nothing to credit.
    const credit = await grantUpgradeCredit(admin, userId, plan, razorpay_payment_id);

    const { error } = await admin
      .from('profiles')
      .update({
        plan,
        subscription_end_date: addPeriod(billing as 'monthly' | 'yearly'),
        last_payment_id: razorpay_payment_id,
      })
      .eq('user_id', userId);

    if (error) {
      console.error('Profile update error after payment:', error.message);
      return NextResponse.json({ error: 'Payment succeeded but activating your plan failed — contact support' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      upgradeCredit: credit ? { amount: credit.credited, currency: credit.currency, unusedDays: credit.unusedDays } : null,
    });
  } catch (err) {
    console.error('verify error:', err);
    return NextResponse.json({ error: 'Something went wrong verifying your payment' }, { status: 500 });
  }
}
