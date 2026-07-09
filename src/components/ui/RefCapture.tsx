'use client';
import { useEffect } from 'react';

// ✅ REFERRAL CAPTURE — if a visitor arrives via someone's referral link
// (any page + ?ref=CODE), remember the code. The auth callback claims it
// after their first sign-up, crediting the referrer. Renders nothing.
export default function RefCapture() {
  useEffect(() => {
    try {
      const ref = new URLSearchParams(window.location.search).get('ref');
      if (ref && !localStorage.getItem('creo_pending_ref')) {
        localStorage.setItem('creo_pending_ref', ref.trim().toUpperCase().slice(0, 20));
      }
    } catch {}
  }, []);
  return null;
}
