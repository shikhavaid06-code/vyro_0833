'use client';
import React, { useState, useEffect } from 'react';
import { ShieldCheck, RefreshCw, Lock, CreditCard, TrendingUp } from 'lucide-react';

interface Stats { totalCreators: number | null; totalGenerated: number | null; }

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M+`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K+`;
  return `${n}`;
}

// ✅ Real, verifiable claims only — no fabricated names, followers, or quotes.
// Each of these is actually true today: Razorpay is the live payment processor,
// the 24-hour refund guarantee is stated on the pricing page, cancel-anytime is how
// subscriptions work, and "never sell your data" is a Privacy Policy commitment.
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
  const hasGenCount = stats.totalGenerated !== null && stats.totalGenerated >= 10;

  return (
    <section className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-creo-primary/4 blur-[80px]" />
      </div>

      <div className="max-w-screen-2xl mx-auto px-6 lg:px-10">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold tracking-[0.2em] text-creo-accent uppercase mb-4">Trust</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-creo-text-primary mb-4">
            {hasCreatorCount ? 'Creators are already shipping with CRÉO' : 'Built for creators who ship daily'}
          </h2>
          <p className="text-creo-text-muted text-base">
            {hasCreatorCount ? 'Real numbers, updated live. No paid placements.' : 'Real numbers will show here as creators join — no inflated stats, ever.'}
          </p>
        </div>

        {/* Live stat counters — real data or honest non-numeric framing */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto mb-14">
          <div className="creo-surface rounded-2xl p-6 text-center border border-white/5">
            <TrendingUp size={16} className="text-creo-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-gradient tabular-nums mb-1">
              {hasCreatorCount ? formatCount(stats.totalCreators as number) : 'New'}
            </p>
            <p className="text-xs text-creo-text-muted font-medium">{hasCreatorCount ? 'Creators onboard' : 'Just launched'}</p>
          </div>
          <div className="creo-surface rounded-2xl p-6 text-center border border-white/5">
            <TrendingUp size={16} className="text-creo-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-gradient tabular-nums mb-1">
              {hasGenCount ? formatCount(stats.totalGenerated as number) : '< 60s'}
            </p>
            <p className="text-xs text-creo-text-muted font-medium">{hasGenCount ? 'Scripts generated' : 'Per generation'}</p>
          </div>
          <div className="creo-surface rounded-2xl p-6 text-center border border-white/5">
            <TrendingUp size={16} className="text-creo-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-gradient tabular-nums mb-1">6</p>
            <p className="text-xs text-creo-text-muted font-medium">Platforms supported</p>
          </div>
        </div>

        {/* Trust badges — removes buying fear at the point of decision */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {trustBadges.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2 creo-surface rounded-full px-4 py-2 border border-white/8">
              <Icon size={13} className="text-creo-primary" />
              <span className="text-creo-text-secondary text-xs font-medium">{text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
