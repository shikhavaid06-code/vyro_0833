export function getLocalePricing() {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz.includes('Asia/Kolkata') || tz.includes('Asia/Calcutta')) 
      return { symbol: '₹', pro: '1,000', ultra: '2,000', proRaw: 1000, ultraRaw: 2000 };
    if (tz.includes('Asia/Tokyo') || tz.includes('Asia/Osaka')) 
      return { symbol: '¥', pro: '1,480', ultra: '4,480', proRaw: 1480, ultraRaw: 4480 };
    if (tz.includes('Asia/Shanghai') || tz.includes('Asia/Hong_Kong')) 
      return { symbol: '¥', pro: '98', ultra: '298', proRaw: 98, ultraRaw: 298 };
    if (tz.includes('Europe')) 
      return { symbol: '€', pro: '12', ultra: '35', proRaw: 12, ultraRaw: 35 };
    if (tz.includes('Asia/Dubai') || tz.includes('Asia/Riyadh')) 
      return { symbol: 'AED', pro: '49', ultra: '149', proRaw: 49, ultraRaw: 149 };
    if (tz.includes('Asia/Singapore') || tz.includes('Asia/Kuala_Lumpur')) 
      return { symbol: 'S$', pro: '18', ultra: '52', proRaw: 18, ultraRaw: 52 };
  } catch {}
  // Default — US and rest of world
  return { symbol: '$', pro: '14', ultra: '39', proRaw: 14, ultraRaw: 39 };
}
