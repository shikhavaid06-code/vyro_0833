'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight, Zap, TrendingUp, Play, Star, Flame } from 'lucide-react';
import DemoModal from './DemoModal';
import CountUp from '@/components/ui/CountUp';

// ✅ Platform SVG logos
const YouTubeLogo = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);
const TikTokLogo = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
  </svg>
);
const InstagramLogo = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);
const TwitterLogo = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);
const SubstackLogo = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24L12 18.11 22.54 24V10.812H1.46zM22.54 0H1.46v2.836h21.08V0z"/>
  </svg>
);
const LinkedInLogo = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const platforms = [
  { name: 'YouTube', Logo: YouTubeLogo, color: 'text-red-400', bg: 'bg-red-500/8 border-red-500/15' },
  { name: 'TikTok', Logo: TikTokLogo, color: 'text-creo-text-primary', bg: 'bg-white/[0.03] border-creo-border' },
  { name: 'Instagram', Logo: InstagramLogo, color: 'text-pink-400', bg: 'bg-pink-500/8 border-pink-500/15' },
  { name: 'Twitter/X', Logo: TwitterLogo, color: 'text-sky-400', bg: 'bg-sky-500/8 border-sky-500/15' },
  { name: 'Substack', Logo: SubstackLogo, color: 'text-orange-400', bg: 'bg-orange-500/8 border-orange-500/15' },
  { name: 'LinkedIn', Logo: LinkedInLogo, color: 'text-blue-400', bg: 'bg-blue-500/8 border-blue-500/15' },
];

const steps = [
  {
    num: '01', emoji: '💡', title: 'Enter your idea',
    desc: 'Type any topic — "5 AI study hacks" or "morning routine for creators"',
    tag: 'Any niche, any platform',
  },
  {
    num: '02', emoji: '🎯', title: 'Choose your platform',
    desc: 'YouTube, TikTok, Instagram, Twitter — CRÉO adapts tone, length and format automatically',
    tag: '6 platforms supported',
  },
  {
    num: '03', emoji: '🚀', title: 'Get hooks, titles & scripts',
    desc: 'Publish-ready content in under 60 seconds. Edit inline, save to vault, or refine with AI',
    tag: 'Ready to film or post',
  },
];

// ✅ Rotating example topics for the live hero input — shows the product's
// range without a single fabricated claim.
const EXAMPLE_TOPICS = [
  'morning routine for creators',
  '5 AI study hacks for students',
  'how I edit videos twice as fast',
  'fitness tips for busy people',
  'my first month as a freelancer',
  'street food tour of my city',
];

interface Stats { totalCreators: number | null; totalGenerated: number | null; }

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M+`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K+`;
  return `${n}`;
}

// ✅ REDESIGN PASS (Aug 2026) — same content, same logic, same CTAs and stats
// fetching. Visual language only: near-black foundation, one restrained
// purple accent instead of purple+pink+violet everywhere, flat creo-surface
// cards instead of blurred glass, toned-down ambient glow.
export default function HeroSection() {
  const router = useRouter();
  const [showDemo, setShowDemo] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [stats, setStats] = useState<Stats>({ totalCreators: null, totalGenerated: null });
  const [heroTopic, setHeroTopic] = useState('');
  const [exampleIdx, setExampleIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActiveStep((i) => (i + 1) % 3), 2500);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setExampleIdx((i) => (i + 1) % EXAMPLE_TOPICS.length), 2600);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    fetch('/api/stats')
      .then((r) => r.json())
      .then((d) => setStats(d))
      .catch(() => {});
  }, []);

  const showCreatorBadge = stats.totalCreators !== null && stats.totalCreators >= 10;

  const handleHeroGenerate = () => {
    const t = heroTopic.trim();
    router.push(t ? `/try?topic=${encodeURIComponent(t)}` : '/try');
  };

  return (
    <section id="hero" className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-16 bg-creo-bg">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-creo-primary/6 rounded-full blur-[130px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-creo-accent/5 rounded-full blur-[100px]" />
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: `linear-gradient(rgba(139,92,246,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.5) 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />
      </div>

      <div className="relative z-10 max-w-screen-2xl mx-auto px-6 lg:px-10 text-center w-full">
        {/* Badge — real count if we have one, honest "new" framing if we don't */}
        <div className="inline-flex items-center gap-2 creo-surface rounded-full px-4 py-2 mb-8 animate-slide-up" style={{ animationDelay: '0ms', animationFillMode: 'both' }}>
          <span className="w-2 h-2 rounded-full bg-creo-success animate-pulse" />
          {showCreatorBadge ? (
            <span className="creo-body text-creo-text-secondary"><CountUp value={stats.totalCreators as number} format={formatCount} /> creators already using CRÉO</span>
          ) : (
            <span className="creo-body text-creo-text-secondary">Just launched — be one of our first creators</span>
          )}
          <TrendingUp size={12} className="text-creo-primary" />
        </div>

        {/* Headline */}
        <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold leading-tight mb-6 animate-slide-up" style={{ animationDelay: '120ms', animationFillMode: 'both' }}>
          <span className="text-creo-text-primary">Stop Guessing What To Post.</span><br />
          <span className="text-gradient">Build A Content System</span><br />
          <span className="text-creo-text-primary text-4xl md:text-5xl lg:text-6xl">That Never Runs Dry.</span>
        </h1>

        <p className="text-lg md:text-xl text-creo-text-secondary max-w-2xl mx-auto mb-4 leading-relaxed font-light animate-slide-up" style={{ animationDelay: '240ms', animationFillMode: 'both' }}>
          CRÉO writes hooks, titles and full scripts that keep people watching — in under 60 seconds.
        </p>

        {/* Result pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10 animate-slide-up" style={{ animationDelay: '340ms', animationFillMode: 'both' }}>
          {['Get viewers to stop scrolling', 'Publish-ready scripts instantly', 'Creator Memory that grows with you'].map((t) => (
            <span key={t} className="flex items-center gap-1.5 creo-surface rounded-full px-3 py-1 creo-caption text-creo-text-secondary">
              <Zap size={10} className="text-creo-primary" />{t}
            </span>
          ))}
        </div>

        {/* ✅ LIVE TOPIC INPUT — the product starts on the landing page.
            Typing an idea here hands it straight to the /try anonymous flow,
            which generates real hooks before any signup is asked for. */}
        <div className="max-w-xl mx-auto mb-5 animate-slide-up" style={{ animationDelay: '440ms', animationFillMode: 'both' }}>
          <div className="creo-surface-elevated rounded-full p-1.5 pl-5 flex items-center gap-2 focus-within:border-creo-primary/50 transition-all duration-300">
            <Sparkles size={16} className="text-creo-primary flex-shrink-0" />
            <input
              type="text"
              value={heroTopic}
              onChange={(e) => setHeroTopic(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleHeroGenerate(); }}
              placeholder={`Try "${EXAMPLE_TOPICS[exampleIdx]}"`}
              className="flex-1 min-w-0 bg-transparent text-creo-text-primary text-sm md:text-base placeholder:text-creo-text-muted py-3 focus:outline-none"
              aria-label="Your video topic"
            />
            <button
              onClick={handleHeroGenerate}
              className="creo-btn-primary group flex items-center gap-2 px-5 md:px-7 py-3 rounded-full text-white font-semibold text-sm md:text-base hover:scale-[1.02] active:scale-95 transition-all duration-200 flex-shrink-0">
              <Flame size={16} />
              <span className="hidden sm:inline">Generate Hooks</span>
              <span className="sm:hidden">Go</span>
              <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform duration-200" />
            </button>
          </div>
          <p className="creo-caption text-creo-text-muted mt-3">Free · No card required · Real hooks in seconds</p>
        </div>

        {/* Secondary CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20 animate-slide-up" style={{ animationDelay: '540ms', animationFillMode: 'both' }}>
          <button onClick={() => setShowDemo(true)} className="group flex items-center gap-2 px-6 py-3 rounded-full creo-surface text-creo-text-secondary hover:text-creo-text-primary font-medium text-sm hover:border-creo-border-strong transition-all duration-200">
            <div className="w-7 h-7 rounded-full bg-white/[0.06] flex items-center justify-center group-hover:bg-creo-primary/15 transition-colors">
              <Play size={11} fill="currentColor" />
            </div>
            Watch Demo
          </button>
          <Link href="/sign-up-login-screen" className="group flex items-center gap-1.5 text-sm text-creo-text-secondary hover:text-creo-text-primary font-medium transition-colors duration-200">
            or create your free account <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-200" />
          </Link>
        </div>

        {/* Product flow visualization */}
        <div className="max-w-3xl mx-auto creo-surface rounded-2xl p-6 text-left mb-20">
          <div className="flex items-center gap-3 mb-5">
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500/60" />
              <span className="w-3 h-3 rounded-full bg-creo-warning/60" />
              <span className="w-3 h-3 rounded-full bg-creo-success/60" />
            </div>
            <span className="creo-caption text-creo-text-muted font-mono">creo.ai — content generator</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { step: '01', label: 'Your Idea', content: '"Fitness tips for busy students"' },
              { step: '02', label: '6 Viral Titles', content: '"The 5-Minute Student Workout Nobody Talks About"' },
              { step: '03', label: '3 Hook Options', content: '"I wasted 2 years studying wrong — here\'s what changed"' },
              { step: '04', label: 'Full Script', content: '[INTRO 0:00] Hook + problem... [MAIN] 5 tips...' },
            ].map((item) => (
              <div key={item.step} className="rounded-xl border border-creo-border bg-white/[0.02] p-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="creo-caption text-creo-text-muted font-bold">{item.step}</span>
                  <span className="creo-caption text-creo-text-secondary uppercase tracking-wide">{item.label}</span>
                </div>
                <p className="creo-body text-creo-text-secondary leading-relaxed line-clamp-3">{item.content}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ✅ How It Works with animated active state */}
        <div className="max-w-4xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 creo-surface rounded-full px-3 py-1.5 mb-4">
            <Star size={11} className="text-creo-primary fill-creo-primary" />
            <span className="creo-caption text-creo-primary">How It Works</span>
          </div>
          <h2 className="creo-h2 text-creo-text-primary mb-3">Three steps to viral content</h2>
          <p className="creo-body text-creo-text-muted mb-10">No learning curve. No blank page. Just results.</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {steps.map((step, i) => (
              <div key={step.num}
                className={`rounded-2xl border p-6 text-left relative overflow-hidden transition-all duration-500 cursor-pointer ${
                  activeStep === i ? 'creo-surface-elevated border-creo-primary/30' : 'creo-surface hover:border-creo-border-strong'
                }`}
                onClick={() => setActiveStep(i)}>
                <div className="absolute top-4 right-4 text-5xl font-black text-white/[0.03]">{step.num}</div>
                <span className="text-3xl mb-4 block">{step.emoji}</span>
                <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full creo-caption mb-3 ${activeStep === i ? 'bg-creo-primary/15 text-creo-primary' : 'bg-white/[0.03] text-creo-text-muted'}`}>
                  {step.tag}
                </div>
                <h3 className="creo-h3 text-creo-text-primary mb-2">{step.title}</h3>
                <p className="creo-body text-creo-text-muted leading-relaxed">{step.desc}</p>
                {activeStep === i && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-creo-primary" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Platform logos */}
        <div className="flex flex-col items-center gap-6 mb-20">
          <p className="creo-caption text-creo-text-muted uppercase tracking-widest">Works perfectly for creators on</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {platforms.map(({ name, Logo, color, bg }) => (
              <div key={name} className={`flex items-center gap-2 border ${bg} rounded-xl px-4 py-2.5 transition-all hover:scale-105`}>
                <span className={color}><Logo /></span>
                <span className="creo-body text-creo-text-secondary font-medium">{name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ✅ Trust stats row — real data or honest non-numeric claims, never fabricated */}
        <div className="max-w-2xl mx-auto grid grid-cols-3 gap-4 mb-8">
          {[
            {
              val: 'New',
              count: stats.totalCreators !== null && stats.totalCreators >= 10 ? stats.totalCreators : undefined,
              label: 'Creators',
              sub: stats.totalCreators !== null && stats.totalCreators >= 10 ? 'and growing daily' : 'join us early',
            },
            {
              val: '< 60s',
              count: stats.totalGenerated !== null && stats.totalGenerated >= 10 ? stats.totalGenerated : undefined,
              label: stats.totalGenerated !== null && stats.totalGenerated >= 10 ? 'Scripts made' : 'Per generation',
              sub: stats.totalGenerated !== null && stats.totalGenerated >= 10 ? 'across all niches' : 'idea to script',
            },
            { val: '6', count: 6, label: 'Platforms', sub: 'YouTube, TikTok & more' },
          ].map(({ val, label, sub, count }: any) => (
            <div key={label} className="creo-surface rounded-2xl p-4 text-center">
              <p className="text-2xl font-bold text-creo-text-primary mb-0.5">{typeof count === 'number' ? <CountUp value={count} format={formatCount} /> : val}</p>
              <p className="creo-caption text-creo-text-secondary font-semibold">{label}</p>
              <p className="creo-caption text-creo-text-muted">{sub}</p>
            </div>
          ))}
        </div>
      </div>

      {showDemo && <DemoModal onClose={() => setShowDemo(false)} />}
    </section>
  );
}
