'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Cookie } from 'lucide-react';

// ✅ Cookie/storage notice (Week 1 item). Honest by design: CRÉO currently
// uses only essential storage (login session, preferences) — no ad trackers,
// no third-party analytics cookies — so this is a clear notice with a single
// acknowledge action, not a fake "accept/reject" choice for trackers that
// don't exist. If real analytics are ever added, upgrade this to a proper
// accept/decline consent flow first.
export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem('creo_cookie_notice')) setVisible(true);
    } catch {}
  }, []);

  const dismiss = () => {
    try { localStorage.setItem('creo_cookie_notice', new Date().toISOString()); } catch {}
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-sm z-[60]">
      <div className="bg-[#0d0d1f]/95 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-4 shadow-2xl shadow-black/40">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center flex-shrink-0">
            <Cookie size={15} className="text-purple-400" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-white/60 leading-relaxed mb-3">
              CRÉO uses essential browser storage to keep you signed in and remember your
              preferences — no ad trackers, no data sold. Details in our{' '}
              <Link href="/privacy" className="text-purple-400 hover:text-purple-300 underline underline-offset-2">Privacy Policy</Link>.
            </p>
            <button
              onClick={dismiss}
              className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-semibold hover:opacity-90 transition-all"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
