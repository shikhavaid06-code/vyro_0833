// ✅ Single source of truth for regional pricing. Each region has its own
// deliberately-chosen amount (not an FX conversion) so the price *feels*
// right for that region's cost of living — e.g. $14 reads as normal in the
// US, while the India price is calibrated separately, not $14 converted.
export interface RegionPricing {
  region: string;       // key used by the checkout API to look up the real charge amount
  currency: string;     // ISO 4217 code — what Razorpay is actually asked to charge
  symbol: string;
  pro: string; ultra: string; team: string;       // display strings
  proRaw: number; ultraRaw: number; teamRaw: number; // numeric amount in the currency's major unit (e.g. dollars, not cents)
}

export const REGION_PRICES: Record<string, RegionPricing> = {
  IN: { region: 'IN', currency: 'INR', symbol: '₹', pro: '1,000', ultra: '2,000', team: '2,500', proRaw: 1000, ultraRaw: 2000, teamRaw: 2500 },
  JP: { region: 'JP', currency: 'JPY', symbol: '¥', pro: '1,480', ultra: '4,480', team: '5,980', proRaw: 1480, ultraRaw: 4480, teamRaw: 5980 },
  CN: { region: 'CN', currency: 'CNY', symbol: '¥', pro: '98', ultra: '298', team: '398', proRaw: 98, ultraRaw: 298, teamRaw: 398 },
  EU: { region: 'EU', currency: 'EUR', symbol: '€', pro: '12', ultra: '35', team: '45', proRaw: 12, ultraRaw: 35, teamRaw: 45 },
  AE: { region: 'AE', currency: 'AED', symbol: 'AED', pro: '49', ultra: '149', team: '199', proRaw: 49, ultraRaw: 149, teamRaw: 199 },
  SG: { region: 'SG', currency: 'SGD', symbol: 'S$', pro: '18', ultra: '52', team: '68', proRaw: 18, ultraRaw: 52, teamRaw: 68 },
  US: { region: 'US', currency: 'USD', symbol: '$', pro: '14', ultra: '39', team: '49', proRaw: 14, ultraRaw: 39, teamRaw: 49 },
};

export function detectRegion(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz.includes('Asia/Kolkata') || tz.includes('Asia/Calcutta')) return 'IN';
    if (tz.includes('Asia/Tokyo') || tz.includes('Asia/Osaka')) return 'JP';
    if (tz.includes('Asia/Shanghai') || tz.includes('Asia/Hong_Kong')) return 'CN';
    if (tz.includes('Europe')) return 'EU';
    if (tz.includes('Asia/Dubai') || tz.includes('Asia/Riyadh')) return 'AE';
    if (tz.includes('Asia/Singapore') || tz.includes('Asia/Kuala_Lumpur')) return 'SG';
  } catch {}
  return 'US';
}

// ✅ Kept as the function every existing component already calls —
// same return shape as before (symbol/pro/ultra/proRaw/ultraRaw), now also
// carrying `region` and `currency` for the checkout flow to use.
export function getLocalePricing(): RegionPricing {
  return REGION_PRICES[detectRegion()];
}

// Backward-compatible export — used by anything that just wants the India numbers.
export const INR_PRICES = { pro: REGION_PRICES.IN.proRaw, ultra: REGION_PRICES.IN.ultraRaw };

// ✅ Reframes the monthly price as a per-day amount — surfaced right on the
// paywall CTA buttons, the moment a user is most likely to convert, so
// "₹1,000/mo" also reads as the much smaller "≈ ₹33/day".
const NO_DECIMAL_CURRENCIES = ['INR', 'JPY', 'CNY', 'AED', 'SGD'];
export function formatPerDay(monthlyRaw: number, currency: string): string {
  const perDay = monthlyRaw / 30;
  return NO_DECIMAL_CURRENCIES.includes(currency) ? String(Math.round(perDay)) : perDay.toFixed(2);
}
