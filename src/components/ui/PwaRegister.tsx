'use client';
import { useEffect } from 'react';

// ✅ Registers /public/sw.js so CRÉO is installable (Add to Home Screen) on
// mobile/desktop. Production-only and fails silently — never something a
// user should see an error for.
export default function PwaRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }, []);
  return null;
}
