'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { Check, X, Star, Vault, ChevronDown, Sparkles, ArrowRight } from 'lucide-react';
import Reveal from '@/components/ui/Reveal';

// ✅ Week 1 conversion items in one section, all honest — no fake numbers,
// no fake testimonials (deliberate: real ones get added when real users
// give them):
//   1. ChatGPT vs CRÉO comparison table
//   2. Winning Vault marketing card (the feature exists in-app already)
//   3. FAQ — answers the trust questions a stranger actually asks

// ✅ Honest comparison vs the big general chatbots — they're all brilliant
// general assistants; none of them is a creator content pipeline. The last
// row concedes their strength, which makes the rest believable.
const RIVALS = ['ChatGPT', 'Gemini', 'Claude'] as const;
const comparison = [
  { feature: 'Built only for creator content', creo: true, rivals: false, note: 'Viral hook frameworks are baked in — not something you prompt for' },
  { feature: 'Idea → titles → hooks → script workflow', creo: true, rivals: false, note: 'One guided flow instead of 15 copy-pasted prompts' },
  { feature: 'Anti-AI-filler engine', creo: true, rivals: false, note: 'Banned phrases like "delve" and "game-changer" — output sounds human by default' },
  { feature: 'Retention scoring (Brutal Reviewer)', creo: true, rivals: false, note: 'Your script scored & fixed before you post — built in, one tap' },
  { feature: 'AI that learns YOUR voice over time', creo: true, rivals: false, note: 'Creator Brain remembers your niche, audience & style on every generation' },
  { feature: 'Winning Vault for your best content', creo: true, rivals: false, note: 'Your winners saved and organized — not lost in chat history' },
  { feature: 'Zero prompt engineering needed', creo: true, rivals: false, note: 'Type your topic. That\'s the whole learning curve.' },
  { feature: 'General-purpose chat about anything', creo: false, rivals: true, note: 'Their job, not ours — CRÉO does one thing at a professional level' },
];

const faqs = [
  {
    q: 'Is the free plan actually free?',
    a: 'Yes — 3 generations every day, forever, no credit card. It resets daily so you can test CRÉO on your real content before paying anything.',
  },
  {
    q: 'How is this different from just using ChatGPT?',
    a: 'ChatGPT is a blank page — you engineer the prompts, fight the robotic filler, and re-explain your platform every session. CRÉO is a purpose-built pipeline: proven hook frameworks, banned AI clichés, and a guided idea → titles → hooks → script flow tuned for watch time.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Plans never auto-renew — when your paid period ends you simply return to Free unless you choose to renew. Changed your mind right after buying? Every paid plan includes a 24-hour full-refund window: cancel within 24 hours of purchase for your money back, no questions asked.',
  },
  {
    q: 'Which platforms does CRÉO write for?',
    a: 'YouTube (long-form and Shorts), TikTok, Instagram Reels, and Twitter/X — with tone, length, and format adapted per platform.',
  },
  {
    q: 'What happens to my data?',
    a: 'Your content stays yours. We never sell your data, and payments are processed securely by Razorpay — we never see your card details.',
  },
];

export default function WhyCreoSection() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <section id="why-creo" className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-creo-accent/4 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-screen-2xl mx-auto px-6 lg:px-10">
        {/* ─── COMPARISON TABLE ─── */}
        <Reveal><div className="text-center mb-12">
          <p className="text-xs font-semibold tracking-[0.2em] text-creo-primary uppercase mb-4">Why CRÉO</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            <span className="text-creo-text-primary">You could prompt a chatbot for an hour.</span><br />
            <span className="text-gradient">Or type your topic once.</span>
          </h2>
        </div></Reveal>

        <Reveal delay={100}><div className="max-w-4xl mx-auto creo-surface rounded-2xl border-creo-border overflow-hidden mb-24">
          <div className="grid grid-cols-[1fr_repeat(4,56px)] sm:grid-cols-[1fr_repeat(4,88px)] items-center px-5 py-4 border-b border-creo-border bg-white/[0.02]">
            <span className="text-xs font-semibold text-creo-text-muted uppercase tracking-wide">Feature</span>
            <span className="text-sm font-bold text-gradient text-center">CRÉO</span>
            {RIVALS.map((r) => (
              <span key={r} className="text-xs sm:text-sm font-semibold text-creo-text-muted text-center">{r}</span>
            ))}
          </div>
          {comparison.map((row) => (
            <div key={row.feature} className="grid grid-cols-[1fr_repeat(4,56px)] sm:grid-cols-[1fr_repeat(4,88px)] items-center px-5 py-4 border-b border-creo-border last:border-b-0 hover:bg-white/[0.02] transition-colors">
              <div className="pr-2">
                <p className="text-sm text-creo-text-secondary font-medium">{row.feature}</p>
                <p className="text-xs text-creo-text-muted mt-0.5 hidden sm:block">{row.note}</p>
              </div>
              <div className="flex justify-center">
                {row.creo
                  ? <div className="w-6 h-6 rounded-full bg-creo-primary/15 border border-creo-primary/30 flex items-center justify-center"><Check size={13} className="text-creo-primary" /></div>
                  : <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center"><X size={13} className="text-creo-text-muted" /></div>}
              </div>
              {RIVALS.map((r) => (
                <div key={r} className="flex justify-center">
                  {row.rivals
                    ? <div className="w-6 h-6 rounded-full bg-white/10 border border-white/15 flex items-center justify-center"><Check size={13} className="text-creo-text-secondary" /></div>
                    : <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center"><X size={13} className="text-creo-text-muted" /></div>}
                </div>
              ))}
            </div>
          ))}
          <p className="px-5 py-3 text-[11px] text-creo-text-muted bg-white/[0.02]">ChatGPT, Gemini and Claude are excellent general assistants — CRÉO is a specialist built for one job: content that keeps people watching.</p>
        </div></Reveal>

        {/* ─── WINNING VAULT CARD ─── */}
        <Reveal><div className="max-w-3xl mx-auto mb-24">
          <div className="relative creo-surface-elevated rounded-2xl border border-creo-warning/20 p-8 overflow-hidden">
            <div className="absolute top-0 right-0 w-[250px] h-[250px] bg-creo-warning/5 rounded-full blur-[80px] pointer-events-none" />
            <div className="relative z-10 flex flex-col sm:flex-row items-start gap-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-creo-warning/15 to-creo-warning/10 border border-creo-warning/30 flex items-center justify-center flex-shrink-0">
                <Vault size={26} className="text-creo-warning" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-creo-text-primary text-2xl font-bold">The Winning Vault</h3>
                  <Star size={16} className="text-creo-warning fill-yellow-400" />
                </div>
                <p className="text-creo-text-secondary text-sm leading-relaxed mb-4">
                  Your best hooks, titles, and scripts — saved forever, organized, one tap away.
                  When something works, you never lose it. When you need your next video,
                  your proven winners are right there to build on.
                </p>
                <div className="flex flex-wrap gap-2 mb-5">
                  {['Save winning hooks', 'Keep your best titles', 'Full script library', 'Yours forever'].map((t) => (
                    <span key={t} className="text-xs text-creo-warning/70 bg-creo-warning/5 border border-creo-warning/15 rounded-full px-3 py-1">{t}</span>
                  ))}
                </div>
                <Link href="/try" className="inline-flex items-center gap-2 text-sm font-semibold text-creo-warning hover:text-yellow-300 transition-colors">
                  Start building your vault <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div></Reveal>

        {/* ─── FAQ ─── */}
        <Reveal><div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-creo-text-primary mb-2">Questions, answered</h2>
            <p className="text-creo-text-muted text-sm">Everything a smart creator asks before trusting a new tool.</p>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={faq.q} className="creo-surface rounded-xl border-creo-border overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/[0.02] transition-colors"
                >
                  <span className="text-sm font-medium text-creo-text-secondary pr-4">{faq.q}</span>
                  <ChevronDown size={16} className={`text-creo-text-muted flex-shrink-0 transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4">
                    <p className="text-sm text-creo-text-secondary leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
          <p className="text-center text-creo-text-muted text-xs mt-8">
            <Sparkles size={11} className="inline mr-1 text-creo-primary" />
            Still unsure? Try it free — 3 generations a day, no card, no catch.
          </p>
        </div></Reveal>
      </div>
    </section>
  );
}
