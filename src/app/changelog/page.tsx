'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import AppLogo from '@/components/ui/AppLogo';

const entries = [
  {
    date: 'July 2026',
    items: [
      'Anonymous free trial — generate hooks before signing up, no account required',
      'Auto currency detection across 6 regions',
      'Onboarding survey now saves to your profile',
    ],
  },
  {
    date: 'June 2026',
    items: [
      'Winning Vault — save your best hooks, titles, and scripts',
      'Supabase Magic Link authentication — no passwords',
      'Terms of Service and Privacy Policy pages',
      'Landing page rebuilt — new headline, How It Works, product visualization',
    ],
  },
  {
    date: 'Earlier',
    items: [
      'Core AI pipeline — titles, hooks, and scripts across 6 platforms',
      'Multi-platform tone and format optimization',
      'Premium chat workspace with history sidebar',
    ],
  },
];

export default function ChangelogPage() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-creo-bg px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-creo-text-muted hover:text-creo-text-primary text-sm mb-8 transition-colors">
          <ArrowLeft size={15} /> Back
        </button>
        <div className="flex items-center gap-2 mb-8">
          <AppLogo size={24} />
          <span className="font-display text-lg font-semibold text-creo-text-primary">CRÉO</span>
        </div>
        <h1 className="text-3xl font-bold text-creo-text-primary mb-2">Changelog</h1>
        <p className="text-creo-text-muted text-sm mb-10">What's shipped, in order. No fluff — just what actually changed.</p>

        <div className="space-y-10">
          {entries.map((entry) => (
            <div key={entry.date}>
              <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-creo-primary mb-4">{entry.date}</h2>
              <div className="space-y-3">
                {entry.items.map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle2 size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
                    <p className="text-creo-text-secondary text-sm leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-white/8">
          <p className="text-creo-text-muted text-xs">Want to see what's coming next? Check the <a href="/roadmap" className="text-creo-primary hover:text-creo-primary">roadmap</a>.</p>
        </div>
      </div>
    </div>
  );
}
