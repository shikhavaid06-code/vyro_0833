'use client';
import React, { useState } from 'react';
import { X, ArrowRight, Sparkles, Zap, Wand2, Download } from 'lucide-react';

const steps = [
  {
    icon: Sparkles,
    title: 'Step 1 — Share your idea',
    desc: 'Type any video topic, like "5 AI tools for students". CRÉO instantly understands your niche and platform.',
    preview: 'I want to make a video about AI tools that help students study smarter',
  },
  {
    icon: Zap,
    title: 'Step 2 — Get viral titles',
    desc: 'CRÉO generates 6 scroll-stopping titles tailored to your topic. Pick the one that feels right.',
    preview: '5 AI Tools That Will Make You Study 10x Faster',
  },
  {
    icon: Wand2,
    title: 'Step 3 — Choose your hook',
    desc: 'Get 3 powerful opening hooks designed to stop the scroll in the first 3 seconds.',
    preview: "I wasted 2 years studying wrong — here's what changed everything",
  },
  {
    icon: Download,
    title: 'Step 4 — Full script, ready to film',
    desc: 'CRÉO writes your complete script with timestamps, structure, and a strong CTA. Edit, refine, or export instantly.',
    preview: '[INTRO - 0:00-0:15] Hook + problem setup...',
  },
];

export default function DemoModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0);
  const current = steps[step];
  const Icon = current.icon;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/70 backdrop-blur-sm animate-backdrop-in">
      <div className="w-full max-w-lg bg-[#0d0d1f] border border-purple-500/30 rounded-2xl p-6 relative animate-modal-in">
        <button onClick={onClose} className="absolute top-4 right-4 text-white/30 hover:text-white/60">
          <X size={16} />
        </button>

        {/* Progress dots */}
        <div className="flex gap-1.5 mb-6">
          {steps.map((_, i) => (
            <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= step ? 'bg-purple-500' : 'bg-white/10'}`} />
          ))}
        </div>

        <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center mb-4">
          <Icon size={22} className="text-white" />
        </div>

        <h2 className="text-xl font-bold text-white mb-2">{current.title}</h2>
        <p className="text-white/50 text-sm mb-5 leading-relaxed">{current.desc}</p>

        {/* Preview box */}
        <div className="glass rounded-xl border border-white/8 p-4 mb-6">
          <p className="text-purple-400 text-xs font-medium mb-2 tracking-wide uppercase">Example</p>
          <p className="text-white/70 text-sm">{current.preview}</p>
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="text-sm text-white/40 hover:text-white/60 disabled:opacity-0 transition-all"
          >
            Back
          </button>

          {step < steps.length - 1 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold text-sm hover:opacity-90 transition-all"
            >
              Next <ArrowRight size={14} />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold text-sm hover:opacity-90 transition-all"
            >
              Get Started <Sparkles size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
