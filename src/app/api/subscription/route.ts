import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

// ✅ CANCELLATION + PRORATED REFUND SYSTEM
// GET  → preview: current plan, period end date, and the exact refund the
//        user would get if they cancelled right now (no side effects).
// POST → actually cancel: issues the prorated refund via Razorpay's Refunds
//        API, then immediately downgrades the profile to 'free'.
//
// Policy (matches /terms section 5):
// - Within the first 7 days of a paid period → FULL refund (money-back guarantee).
// - After that → prorated refund for unused FULL days. Pay for 30 days,
//   cancel on day 26 → 4 unused days refunded. The day you cancel on counts
//   as used.
// - Downgrade to Free is immediate on cancellation.
// - Refund is issued to the original payment method (5–7 business days).
//
// Order of operations on POST is deliberate: refund FIRST, downgrade SECOND.
// If the refund API fails, we do NOT downgrade — the user keeps what they
// paid for and can retry, instead of losing both plan and money.

const DAY_MS = 86_400_000;
const ZERO_DECIMAL_CURRENCIES = new Set(['JPY']);

function toMajorUnit(amountSmallest: number, currency: string): number {
  return ZERO_DECIMAL_CURRENCIES.has(currency) ? amountSmallest : amountSmallest / 100;
}

async function getUserId(req: NextRequest): Promise<string | null> {
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return null;
  const { data, error } = await getSupabaseAdmin().auth.getUser(token);
  if (error || !data?.user) return null;
  return data.user.id;
}

function razorpayAuth(): { header: string } | null {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) return null;
  return { header: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}` };
}

interface RefundQuote {
  plan: string;
  endDate: string | null;
  currency: string;
  paidAmount: number;          // major units, what the payment actually charged
  refundAmount: number;        // major units, what cancelling now returns
  refundAmountSmallest: number; // smallest units, what we send to Razorpay
  unusedDays: number;
  totalDays: number;
  usedDays: number;
  fullRefund: boolean;         // true when inside the 7-day money-back window
  paymentId: string | null;
  reason: string;              // human-readable explanation of the quote
}

// Shared by GET (preview) and POST (execute) so the number the user sees is
// EXACTLY the number that gets refunded — no drift between quote and action.
async function computeRefundQuote(userId: string): Promise<{ quote?: RefundQuote; error?: string; status?: number }> {
  const admin = getSupabaseAdmin();
  const { data: profile, error: profileError } = await admin
    .from('profiles')
    .select('plan, subscription_end_date, last_payment_id')
    .eq('user_id', userId)
    .single();

  if (profileError || !profile) return { error: 'Could not load your profile', status: 500 };
  if (!profile.plan || profile.plan === 'free') return { error: 'You are on the Free plan — nothing to cancel', status: 400 };

  // Paid plan but no recorded payment (e.g. manually granted) → cancellable,
  // but there is nothing to refund.
  if (!profile.last_payment_id) {
    return {
      quote: {
        plan: profile.plan, endDate: profile.subscription_end_date, currency: 'INR',
        paidAmount: 0, refundAmount: 0, refundAmountSmallest: 0,
        unusedDays: 0, totalDays: 0, usedDays: 0, fullRefund: false,
        paymentId: null, reason: 'No payment on record for this plan — cancelling will downgrade you to Free without a refund.',
      },
    };
  }

  const auth = razorpayAuth();
  if (!auth) return { error: 'Payments are not configured yet', status: 500 };

  const payRes = await fetch(`https://api.razorpay.com/v1/payments/${profile.last_payment_id}`, {
    headers: { Authorization: auth.header },
  });
  const payment = await payRes.json();
  if (!payRes.ok || !payment?.id) {
    console.error('Razorpay payment fetch failed:', payment);
    return { error: 'Could not look up your payment — please try again or contact support', status: 502 };
  }

  const currency: string = payment.currency || 'INR';
  const amount: number = payment.amount || 0;                 // smallest unit
  const alreadyRefunded: number = payment.amount_refunded || 0;
  const refundable = Math.max(0, amount - alreadyRefunded);

  const now = Date.now();
  const periodStart = (payment.created_at || 0) * 1000;
  // Prefer the stored end date; fall back to deriving it from the payment's
  // own billing note if the profile field is somehow missing.
  let periodEnd = profile.subscription_end_date ? new Date(profile.subscription_end_date).getTime() : 0;
  if (!periodEnd || Number.isNaN(periodEnd)) {
    const billing = payment.notes?.billing === 'yearly' ? 'yearly' : 'monthly';
    const d = new Date(periodStart);
    if (billing === 'yearly') d.setFullYear(d.getFullYear() + 1);
    else d.setMonth(d.getMonth() + 1);
    periodEnd = d.getTime();
  }

  const totalDays = Math.max(1, Math.round((periodEnd - periodStart) / DAY_MS));
  const usedDays = Math.min(totalDays, Math.max(1, Math.ceil((now - periodStart) / DAY_MS)));
  const unusedDays = Math.max(0, totalDays - usedDays);

  const fullRefund = usedDays <= 7 && refundable > 0; // 7-day money-back guarantee
  let refundSmallest = fullRefund
    ? refundable
    : Math.min(refundable, Math.floor((amount * unusedDays) / totalDays));
  if (payment.status !== 'captured') refundSmallest = 0; // nothing capturable to refund

  const reason = fullRefund
    ? `You're within the 7-day money-back window — full refund of ${toMajorUnit(refundable, currency)} ${currency}.`
    : refundSmallest > 0
      ? `${unusedDays} of ${totalDays} days unused — prorated refund.`
      : now >= periodEnd
        ? 'Your paid period has already ended — nothing left to refund.'
        : 'No refundable amount remains on this payment.';

  return {
    quote: {
      plan: profile.plan,
      endDate: profile.subscription_end_date,
      currency,
      paidAmount: toMajorUnit(amount, currency),
      refundAmount: toMajorUnit(refundSmallest, currency),
      refundAmountSmallest: refundSmallest,
      unusedDays, totalDays, usedDays, fullRefund,
      paymentId: payment.id,
      reason,
    },
  };
}

export async function GET(req: NextRequest) {
  try {
    const userId = await getUserId(req);
    if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    const { quote, error, status } = await computeRefundQuote(userId);
    if (error) return NextResponse.json({ error }, { status: status || 500 });
    // Never leak the internal payment id or smallest-unit math to the client.
    const { paymentId, refundAmountSmallest, ...publicQuote } = quote!;
    return NextResponse.json(publicQuote);
  } catch (err) {
    console.error('subscription GET error:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId(req);
    if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    if (body?.action !== 'cancel') {
      return NextResponse.json({ error: 'Unsupported action' }, { status: 400 });
    }

    const { quote, error, status } = await computeRefundQuote(userId);
    if (error) return NextResponse.json({ error }, { status: status || 500 });
    const q = quote!;

    // 1. Refund first (only if there is something to refund).
    let refundId: string | null = null;
    if (q.refundAmountSmallest > 0 && q.paymentId) {
      const auth = razorpayAuth();
      if (!auth) return NextResponse.json({ error: 'Payments are not configured yet' }, { status: 500 });

      const refundRes = await fetch(`https://api.razorpay.com/v1/payments/${q.paymentId}/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: auth.header },
        body: JSON.stringify({
          amount: q.refundAmountSmallest,
          speed: 'normal',
          notes: {
            reason: q.fullRefund ? 'money_back_guarantee' : 'prorated_cancellation',
            userId,
            unusedDays: String(q.unusedDays),
            totalDays: String(q.totalDays),
          },
        }),
      });
      const refund = await refundRes.json();
      if (!refundRes.ok || !refund?.id) {
        console.error('Razorpay refund failed:', refund);
        // Do NOT downgrade — the user keeps their paid plan and can retry.
        return NextResponse.json(
          { error: refund?.error?.description || 'Refund could not be processed — your plan is unchanged. Please try again or contact support.' },
          { status: 502 },
        );
      }
      refundId = refund.id;
    }

    // 2. Downgrade to Free immediately.
    const { error: dbError } = await getSupabaseAdmin()
      .from('profiles')
      .update({ plan: 'free', subscription_end_date: null })
      .eq('user_id', userId);

    if (dbError) {
      // Refund already went out; the daily downgrade-expired cron is the
      // safety net, but surface it honestly.
      console.error('Downgrade after refund failed:', dbError.message, 'refund:', refundId);
      return NextResponse.json(
        { error: 'Your refund was issued but the downgrade glitched — contact support and we will sort it immediately.', refundId },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      refundId,
      refundAmount: q.refundAmount,
      currency: q.currency,
      fullRefund: q.fullRefund,
      unusedDays: q.unusedDays,
      totalDays: q.totalDays,
      message: q.refundAmount > 0
        ? `Plan cancelled. ${q.currency === 'INR' ? '₹' : ''}${q.refundAmount.toLocaleString()}${q.currency === 'INR' ? '' : ` ${q.currency}`} refund initiated — it reaches your original payment method in 5–7 business days.`
        : 'Plan cancelled. You are now on the Free plan.',
    });
  } catch (err) {
    console.error('subscription POST error:', err);
    return NextResponse.json({ error: 'Something went wrong cancelling your plan' }, { status: 500 });
  }
}
