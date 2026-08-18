'use client';
import React, { useState, useEffect } from 'react';
import { ShieldCheck, RefreshCw, Lock, CreditCard } from 'lucide-react';

interface Stats { totalCreators: number | null; totalGenerated: number | null; }

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M+`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K+`;
  return `${n}`;
}

// ✅ Real, verifiable claims only — no fabricated brand logos, names, or
// quotes. Restyled to the reference's compact horizontal-strip layout, but
// the content stays exactly what it was: real /api/stats data with an
// honest fallback, and trust badges that are all literally true today.
const trustBadges = [
  { icon: RefreshCw, text: '24-hour full-refund guarantee' },
  { icon: CreditCard, text: 'Secure payments via Razorpay' },
  { icon: Lock, text: 'Cancel anytime, no lock-in' },
  { icon: ShieldCheck, text: 'We never sell your data' },
];

export default function SocialProofSection() {
  const [stats, setStats] = useState<Stats>({ totalCreators: null, totalGenerated: null });

  useEffect(() => {
    fetch('/api/stats').then((r) => r.json()).then((d) => setStats(d)).catch(() => {});
  }, []);

  const hasCreatorCount = stats.totalCreators !== null && stats.totalCreators >= 10;

  return (
    <section className="relative py-10 border-y border-creo-border overflow-hidden">
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-10">
        <p className="creo-caption text-center text-creo-primary uppercase tracking-[0.15em] mb-6">
          {hasCreatorCount ? `Trusted by ${formatCount(stats.totalCreators as number)} creators worldwide` : 'Built for creators who ship daily — just launched'}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {trustBadges.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2 creo-surface rounded-full px-4 py-2">
              <Icon size={13} className="text-creo-primary" />
              <span className="creo-caption text-creo-text-secondary">{text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
