'use client';
import React, { useState } from 'react';
import { X, Sparkles, ArrowRight, Zap } from 'lucide-react';
import Link from 'next/link';

interface Props { onClose: () => void; }

// ✅ Illustrative walkthrough, not a live generation — clearly labeled.
// Real generation happens at /try (the actual anonymous free trial).
const STEPS = [
  { label: 'Your Idea', content: '"Fitness tips for busy students"' },
  { label: '6 Viral Titles', content: '"The 5-Minute Student Workout Nobody Talks About"' },
  { label: '3 Hook Options', content: '"I wasted 2 years studying wrong — here\'s what changed"' },
  { label: 'Full Script', content: '[INTRO 0:00] Hook + problem... [MAIN] 5 tips... [CTA] Follow for more' },
];

export default function DemoModal({ onClose }: Props) {
  const [step, setStep] = useState(0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-lg creo-surface-elevated rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-creo-primary/12 flex items-center justify-center"><Sparkles size={15} className="text-creo-primary" /></div>
            <div>
              <h2 className="creo-h3 text-creo-text-primary leading-tight">How CRÉO works</h2>
              <p className="creo-caption text-creo-text-muted">Illustrative walkthrough — not live generation</p>
            </div>
          </div>
          <button onClick={onClose} className="text-creo-text-muted hover:text-creo-text-primary"><X size={16} /></button>
        </div>

        <div className="flex gap-1.5 mb-5">
          {STEPS.map((_, i) => (
            <div key={i} className={`h-1 flex-1 rounded-full ${i <= step ? 'bg-creo-primary' : 'bg-white/10'}`} />
          ))}
        </div>

        <div className="creo-surface rounded-xl p-5 mb-5 min-h-[120px] flex flex-col justify-center">
          <p className="creo-caption text-creo-text-muted uppercase tracking-wide mb-2">{STEPS[step].label}</p>
          <p className="creo-body text-creo-text-secondary leading-relaxed">{STEPS[step].content}</p>
        </div>

        <div className="flex items-center justify-between gap-3">
          <button onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0} className="creo-caption text-creo-text-muted disabled:opacity-30">Back</button>
          {step < STEPS.length - 1 ? (
            <button onClick={() => setStep((s) => s + 1)} className="creo-btn-primary flex items-center gap-1.5 px-5 py-2 rounded-full text-white creo-caption font-semibold">Next <ArrowRight size={12} /></button>
          ) : (
            <Link href="/try" className="creo-btn-primary flex items-center gap-1.5 px-5 py-2 rounded-full text-white creo-caption font-semibold"><Zap size={12} />Try it for real</Link>
          )}
        </div>
      </div>
    </div>
  );
}
