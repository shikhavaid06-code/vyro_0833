import { NextRequest, NextResponse } from 'next/server';
import { REGION_PRICES } from '@/lib/pricing';

// JPY has no minor unit (no "cents" equivalent) — everything else here does.
const ZERO_DECIMAL_CURRENCIES = new Set(['JPY']);
function toSmallestUnit(amount: number, currency: string): number {
  return ZERO_DECIMAL_CURRENCIES.has(currency) ? amount : Math.round(amount * 100);
}

async function createRazorpayOrder(amountSmallestUnit: number, currency: string, receipt: string, notes: Record<string, string>, keyId: string, keySecret: string) {
  const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
  const res = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Basic ${auth}` },
    body: JSON.stringify({ amount: amountSmallestUnit, currency, receipt, notes }),
  });
  const data = await res.json();
  return { ok: res.ok, data };
}

export async function POST(req: NextRequest) {
  try {
    const { plan, billing, userId, region } = await req.json();

    if (!['pro', 'ultra'].includes(plan) || !['monthly', 'yearly'].includes(billing) || !userId) {
      return NextResponse.json({ error: 'Invalid plan, billing cycle, or missing user' }, { status: 400 });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      return NextResponse.json({ error: 'Payments are not configured yet' }, { status: 500 });
    }

    // ✅ Region-calibrated pricing (PPP-style, not FX-converted) — the amount
    // is looked up server-side from the region key only. The client never
    // gets to send an amount directly.
    const regionData = REGION_PRICES[region] || REGION_PRICES.US;
    const monthlyAmount = plan === 'pro' ? regionData.proRaw : regionData.ultraRaw;
    const amount = billing === 'yearly' ? Math.round(monthlyAmount * 12 * 0.75) : monthlyAmount;
    const receipt = `creo_${plan}_${billing}_${Date.now()}`;
    const notes = { userId, plan, billing, region: regionData.region };

    // ✅ Try the visitor's real regional currency first.
    let { ok, data } = await createRazorpayOrder(toSmallestUnit(amount, regionData.currency), regionData.currency, receipt, notes, keyId, keySecret);
    let fallbackUsed = false;
    let chargedCurrency = regionData.currency;
    let chargedAmount = amount;

    // ✅ If the account isn't approved for that currency yet (common until
    // Razorpay's International Payments is enabled beyond basic KYC), fall
    // back to the real INR price — never a converted number, the actual
    // India price — and be upfront with the user about it on the frontend.
    if (!ok && regionData.currency !== 'INR') {
      const inr = REGION_PRICES.IN;
      const inrAmount = plan === 'pro' ? inr.proRaw : inr.ultraRaw;
      const fallbackAmount = billing === 'yearly' ? Math.round(inrAmount * 12 * 0.75) : inrAmount;
      const retry = await createRazorpayOrder(toSmallestUnit(fallbackAmount, 'INR'), 'INR', receipt, { ...notes, fallback: 'true' }, keyId, keySecret);
      ok = retry.ok;
      data = retry.data;
      fallbackUsed = true;
      chargedCurrency = 'INR';
      chargedAmount = fallbackAmount;
    }

    if (!ok) {
      console.error('Razorpay order error:', data);
      return NextResponse.json({ error: data.error?.description || 'Could not create order' }, { status: 500 });
    }

    return NextResponse.json({
      orderId: data.id,
      amount: data.amount,
      currency: data.currency,
      keyId,
      fallbackUsed,
      displayCurrency: regionData.currency,
      chargedCurrency,
      chargedAmount,
    });
  } catch (err) {
    console.error('create-order error:', err);
    return NextResponse.json({ error: 'Something went wrong creating your order' }, { status: 500 });
  }
}
