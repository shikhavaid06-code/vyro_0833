'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Home, Sparkles } from 'lucide-react';

// ✅ Rebuilt on-brand (Week 1 item) — the old 404 used theme classes that
// were never defined in tailwind.config (bg-background, text-primary, etc.),
// so it rendered as unstyled black-on-white. It also pulled in the entire
// @heroicons library through AppIcon for two small icons; lucide-react is
// already used across the whole app.
export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#080812] p-4">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-2">
          <h1 className="text-9xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent opacity-40">
            404
          </h1>
        </div>

        <h2 className="text-2xl font-semibold text-white mb-2">Page Not Found</h2>
        <p className="text-white/50 mb-8 leading-relaxed">
          This page doesn&apos;t exist — but your next viral video could. Let&apos;s get you back to creating.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => (typeof window !== 'undefined' ? window.history?.back() : null)}
            className="inline-flex items-center justify-center gap-2 border border-white/10 text-white/70 px-6 py-3 rounded-xl font-medium hover:bg-white/5 hover:text-white transition-all"
          >
            <ArrowLeft size={16} />
            Go Back
          </button>

          <button
            onClick={() => router?.push('/')}
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-all"
          >
            <Home size={16} />
            Back to Home
          </button>
        </div>

        <button
          onClick={() => router?.push('/try')}
          className="mt-6 inline-flex items-center gap-1.5 text-sm text-purple-400/70 hover:text-purple-300 transition-all"
        >
          <Sparkles size={13} />
          Or try CRÉO free — no signup needed
        </button>
      </div>
    </div>
  );
}
