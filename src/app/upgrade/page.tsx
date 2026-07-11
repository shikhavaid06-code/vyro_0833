import { SupabaseClient } from '@supabase/supabase-js';

// ✅ PRO → ULTRA UPGRADE CREDIT
// When a Pro user pays for Ultra, they shouldn't lose the days of Pro they
// already paid for. This computes the value of their UNUSED Pro days and
// refunds it to their original payment method automatically — same proration
// math as the cancellation system (the cancel day counts as used).
//
// Called from BOTH the verify route and the webhook (whichever confirms the
// Ultra payment first), BEFORE the profile row is overwritten — the old
// last_payment_id and subscription_end_date are the inputs.
//
// Idempotency guards (double-credit protection when verify AND webhook fire):
//   1. Caller skips if profile.last_payment_id === the new payment id
//      (means the other path already finished and updated the profile).
//   2. We skip if the old payment already has ANY refund on it.
//   3. Razorpay itself rejects refunds exceeding the payment amount.
//
// This function NEVER throws — a failed credit must not break plan
// activation. Worst case the credit is skipped and support handles it.

const DAY_MS = 86_400_000;
const ZERO_DECIMAL_CURRENCIES = new Set(['JPY']);

function toMajorUnit(amountSmallest: number, currency: string): number {
  return ZERO_DECIMAL_CURRENCIES.has(currency) ? amountSmallest : amountSmallest / 100;
}

export interface UpgradeCreditResult {
  credited: number;   // major units (e.g. rupees)
  currency: string;
  refundId: string;
  unusedDays: number;
}

export async function grantUpgradeCredit(
  admin: SupabaseClient,
  userId: string,
  newPlan: string,
  newPaymentId: string,
): Promise<UpgradeCreditResult | null> {
  try {
    // Credit only applies when moving UP from a paid plan to ultra.
    if (newPlan !== 'ultra') return null;

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) return null;
    const authHeader = `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`;

    const { data: profile } = await admin
      .from('profiles')
      .select('plan, subscription_end_date, last_payment_id')
      .eq('user_id', userId)
      .single();

    if (!profile || profile.plan !== 'pro') return null;
    const oldPaymentId: string | null = profile.last_payment_id;
    // Guard 1: no old payment, or the profile was already updated with the
    // new payment id by the other confirmation path → nothing to credit here.
    if (!oldPaymentId || oldPaymentId === newPaymentId) return null;

    const payRes = await fetch(`https://api.razorpay.com/v1/payments/${oldPaymentId}`, {
      headers: { Authorization: authHeader },
    });
    const payment = await payRes.json();
    if (!payRes.ok || !payment?.id || payment.status !== 'captured') return null;
    // Guard 2: any existing refund on the old payment means credit (or a
    // cancellation refund) already happened — never refund twice.
    if ((payment.amount_refunded || 0) > 0) return null;

    const currency: string = payment.currency || 'INR';
    const amount: number = payment.amount || 0; // smallest unit

    const now = Date.now();
    const periodStart = (payment.created_at || 0) * 1000;
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
    const creditSmallest = Math.min(amount, Math.floor((amount * unusedDays) / totalDays));
    if (creditSmallest <= 0) return null;

    // Minimal refund body (see subscription route: Razorpay rejects bodies
    // with parameters the account isn't enabled for). Try with notes for
    // bookkeeping; if the request shape is rejected, retry bare.
    const refundUrl = `https://api.razorpay.com/v1/payments/${oldPaymentId}/refund`;
    const doRefund = async (body: Record<string, unknown>) => {
      const res = await fetch(refundUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: authHeader },
        body: JSON.stringify(body),
      });
      return { res, data: await res.json().catch(() => null) };
    };

    let { res, data: refund } = await doRefund({
      amount: creditSmallest,
      notes: { reason: 'upgrade_credit_pro_to_ultra', userId, unusedDays: String(unusedDays), totalDays: String(totalDays) },
    });
    if ((!res.ok || !refund?.id) && refund?.error?.code === 'BAD_REQUEST_ERROR') {
      ({ res, data: refund } = await doRefund({ amount: creditSmallest }));
    }
    if (!res.ok || !refund?.id) {
      console.error('Upgrade credit refund failed (plan activation continues):', JSON.stringify(refund));
      return null;
    }

    return {
      credited: toMajorUnit(creditSmallest, currency),
      currency,
      refundId: refund.id,
      unusedDays,
    };
  } catch (err) {
    console.error('grantUpgradeCredit error (plan activation continues):', err);
    return null;
  }
}
