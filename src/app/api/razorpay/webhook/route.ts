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
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });

    // ✅ Must read the RAW body for signature verification — parsing to JSON
    // first and re-stringifying can produce a different byte sequence and
    // make a legitimate webhook fail verification.
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature');

    const expectedSignature = crypto.createHmac('sha256', webhookSecret).update(rawBody).digest('hex');
    if (signature !== expectedSignature) {
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;

    if (event === 'payment.captured') {
      const payment = payload.payload?.payment?.entity;

      // ✅ LIVE-MODE HARDENING: plan/billing/userId are read from the ORDER's
      // notes, which only our create-order route ever writes — NOT from
      // payment.notes, which Razorpay Checkout lets the client attach (a
      // tampered browser could inject plan:"ultra" there). The order is the
      // source of truth for what was actually bought.
      if (payment?.id && payment.order_id) {
        const keyId = process.env.RAZORPAY_KEY_ID;
        const keySecret = process.env.RAZORPAY_KEY_SECRET;
        let notes: Record<string, string> = {};
        if (keyId && keySecret) {
          const authHeader = `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`;
          const orderRes = await fetch(`https://api.razorpay.com/v1/orders/${payment.order_id}`, {
            headers: { Authorization: authHeader },
          });
          const order = await orderRes.json().catch(() => null);
          if (orderRes.ok && order?.id) notes = order.notes || {};
          else console.error('webhook: order lookup failed:', JSON.stringify(order));
        }

        const { userId, plan, billing } = notes;
        if (userId && ['pro', 'ultra'].includes(plan) && ['monthly', 'yearly'].includes(billing)) {
          const admin = getSupabaseAdmin();

          // ✅ PRO → ULTRA FAIR UPGRADE (webhook path — the safety net when the
          // browser died before /verify ran). Same call as verify; the guards
          // inside (old-payment-already-refunded, last_payment_id already
          // updated) make it a no-op if verify handled it first.
          await grantUpgradeCredit(admin, userId, plan, payment.id);

          const { error } = await admin
            .from('profiles')
            .update({
              plan,
              subscription_end_date: addPeriod(billing as 'monthly' | 'yearly'),
              last_payment_id: payment.id,
            })
            .eq('user_id', userId);

          if (error) console.error('Webhook profile update error:', error.message);
        } else {
          console.error('webhook: order notes missing/invalid for payment', payment.id, JSON.stringify(notes));
        }
      }
    }

    // Always 200 on a verified, handled webhook — Razorpay retries on non-2xx.
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('webhook error:', err);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
