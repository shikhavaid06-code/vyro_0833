'use client';
import React, { useState, useEffect } from 'react';
import { Sparkles, Zap, FileText, MessageSquare, Globe, Wand2, ChevronRight, Brain, ShieldAlert, Layers, Radar, Lock } from 'lucide-react';

interface Stats { totalCreators: number | null; totalGenerated: number | null; }

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M+`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K+`;
  return `${n}`;
}

// ✅ Live features — available today
const features = [
  {
    id: 'title-gen',
    icon: Sparkles,
    color: 'purple',
    title: 'AI Title Generator',
    description: 'Generate 10+ scroll-stopping titles for any idea in under 5 seconds. Trained on millions of viral videos across every niche.',
    detail: 'Analyzes trending patterns, emotional triggers, and platform-specific formats to craft titles that demand clicks.',
    badge: 'Most Used',
    status: 'live' as const,
  },
  {
    id: 'hook-gen',
    icon: Zap,
    color: 'pink',
    title: 'Hook Generator',
    description: 'The first 3 seconds decide everything. CRÉO writes hooks that stop the scroll and pull viewers into your content.',
    detail: 'Choose from curiosity hooks, shock hooks, story hooks, and controversy hooks — all optimized per platform.',
    badge: 'Fan Favorite',
    status: 'live' as const,
  },
  {
    id: 'script-gen',
    icon: FileText,
    color: 'violet',
    title: 'Script Generator',
    description: 'Full scripts for Shorts, Reels, long-form YouTube, and everything in between. Custom duration up to 2 hours.',
    detail: 'Structured with intro, body, and CTA. Tone-matched to your brand voice with every generation.',
    badge: null,
    status: 'live' as const,
  },
  {
    id: 'ai-assistant',
    icon: MessageSquare,
    color: 'indigo',
    title: 'AI Assistant',
    description: 'Chat with your personal AI co-writer. Ask it to rewrite, shorten, make it funnier, or change the entire angle.',
    detail: 'Context-aware — it remembers your entire session and refines based on your feedback naturally.',
    badge: 'Ultra Only',
    status: 'live' as const,
  },
  {
    id: 'multi-platform',
    icon: Globe,
    color: 'cyan',
    title: 'Multi-Platform Optimization',
    description: 'One idea, every platform. CRÉO adapts your content for YouTube, TikTok, Instagram Reels, and Twitter/X.',
    detail: 'Adjusts length, tone, hashtag strategy, and format rules per platform automatically.',
    badge: null,
    status: 'live' as const,
  },
  {
    id: 'smart-edit',
    icon: Wand2,
    color: 'amber',
    title: 'Smart AI Editing',
    description: 'Highlight any part of your script and say "make this more emotional" or "cut this down." AI rewrites it live.',
    detail: 'Works inline within the chat — no copy-pasting to external tools. Your script evolves in real time.',
    badge: 'Pro + Ultra',
    status: 'live' as const,
  },
];

// ✅ SHIPPED (moved out of Coming Soon the day they went live, per the rule
// that roadmap tags only come off once a feature actually exists):
const shippedFeatures = [
  {
    id: 'creator-memory',
    icon: Brain,
    color: 'fuchsia',
    title: 'Creator Memory & Brain',
    description: 'Teach CRÉO your niche, audience, voice, and goals once — every generation is written in YOUR style, not generic AI.',
    detail: 'Set it up from the Brain button in your workspace. The more specific your profile, the more it sounds like you.',
    badge: 'Ultra',
    status: 'live' as const,
  },
  {
    id: 'brutal-reviewer',
    icon: ShieldAlert,
    color: 'red',
    title: 'Brutal Reviewer',
    description: 'A no-mercy AI critique that scores your hook strength, curiosity, emotional pull, and retention — then fixes the weak parts.',
    detail: 'One tap on any generated script. Catches weak openings and slow endings before they cost you views.',
    badge: 'Pro + Ultra',
    status: 'live' as const,
  },
  {
    id: 'content-expansion',
    icon: Layers,
    color: 'emerald',
    title: 'Content Expansion Engine',
    description: 'Turn one idea into a full content pack — hooks, titles, Shorts, a Reel, an X thread, and a LinkedIn post in one pass.',
    detail: 'Stop starting from scratch for every format. One idea, a week of content.',
    badge: 'Pro + Ultra',
    status: 'live' as const,
  },
];

// ✅ Shipped too — Competitor Intelligence graduated from Coming Soon the day
// it went live (framework extraction + structure cloning, Ultra).
const intelFeature = [
  {
    id: 'competitor-intel',
    icon: Radar,
    color: 'sky',
    title: 'Competitor Intelligence',
    description: 'Paste a competitor\'s transcript, titles, or hooks — CRÉO extracts their viral framework and clones the structure for your topic.',
    detail: 'The Intel button in your workspace. Clone the psychology, never the words.',
    badge: 'Ultra',
    status: 'live' as const,
  },
];

// Nothing on the near-term roadmap right now — new roadmap items get added
// here (and to PricingSection simultaneously) when they're announced.
const upcomingFeatures: typeof intelFeature = [];

const colorMap: Record<string, { bg: string; text: string; border: string; glow: string }> = {
  purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20', glow: 'group-hover:shadow-purple-500/20' },
  pink: { bg: 'bg-pink-500/10', text: 'text-pink-400', border: 'border-pink-500/20', glow: 'group-hover:shadow-pink-500/20' },
  violet: { bg: 'bg-violet-500/10', text: 'text-violet-400', border: 'border-violet-500/20', glow: 'group-hover:shadow-violet-500/20' },
  indigo: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/20', glow: 'group-hover:shadow-indigo-500/20' },
  cyan: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20', glow: 'group-hover:shadow-cyan-500/20' },
  amber: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', glow: 'group-hover:shadow-amber-500/20' },
  fuchsia: { bg: 'bg-fuchsia-500/10', text: 'text-fuchsia-400', border: 'border-fuchsia-500/20', glow: 'group-hover:shadow-fuchsia-500/20' },
  red: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20', glow: 'group-hover:shadow-red-500/20' },
  emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', glow: 'group-hover:shadow-emerald-500/20' },
  sky: { bg: 'bg-sky-500/10', text: 'text-sky-400', border: 'border-sky-500/20', glow: 'group-hover:shadow-sky-500/20' },
};

export default function FeaturesSection() {
  const [activeFeature, setActiveFeature] = useState('title-gen');
  const [stats, setStats] = useState<Stats>({ totalCreators: null, totalGenerated: null });

  useEffect(() => {
    fetch('/api/stats').then((r) => r.json()).then((d) => setStats(d)).catch(() => {});
  }, []);

  const liveFeatures = [...features, ...shippedFeatures, ...intelFeature];

  return (
    <section id="features" className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-creo-primary/4 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-screen-2xl mx-auto px-6 lg:px-10">
        {/* Section header */}
        <div className="text-center mb-16">
          <p className="text-xs font-semibold tracking-[0.2em] text-purple-400 uppercase mb-4">Features</p>
          <h2 className="font-display text-4xl md:text-6xl font-bold mb-5">
            <span className="text-creo-text-primary">Everything you need to</span>
            <br />
            <span className="text-gradient">ship content daily</span>
          </h2>
          <p className="text-creo-text-muted text-lg max-w-xl mx-auto">
            Ten tools live today — including an AI Brain that learns your voice and a competitor framework cloner.
          </p>
        </div>

        {/* Live feature grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {liveFeatures.map((feature) => {
            const colors = colorMap[feature.color];
            const Icon = feature.icon;
            const isActive = activeFeature === feature.id;

            return (
              <div
                key={`feature-${feature.id}`}
                className={`group relative rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:-translate-y-1 ${
                  isActive
                    ? `creo-surface-elevated border-${colors.border}`
                    : 'creo-surface hover:border-creo-border-strong'
                }`}
                onClick={() => setActiveFeature(feature.id)}
              >
                {feature.badge && (
                  <span className={`absolute top-4 right-4 text-[10px] font-semibold px-2 py-0.5 rounded-full ${colors.bg} ${colors.text} border ${colors.border}`}>
                    {feature.badge}
                  </span>
                )}

                <div className={`w-11 h-11 rounded-xl ${colors.bg} border ${colors.border} flex items-center justify-center mb-4`}>
                  <Icon size={20} className={colors.text} />
                </div>

                <h3 className="text-creo-text-primary font-semibold text-base mb-2">{feature.title}</h3>
                <p className="text-creo-text-secondary text-sm leading-relaxed mb-3">{feature.description}</p>

                {isActive && (
                  <div className="animate-slide-up">
                    <p className={`text-xs leading-relaxed ${colors.text} opacity-80`}>{feature.detail}</p>
                    <div className={`mt-3 flex items-center gap-1 text-xs ${colors.text} font-medium`}>
                      <span>Try it now</span>
                      <ChevronRight size={12} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Coming soon grid — visually distinct so it never reads as "already shipped" */}
        {upcomingFeatures.length > 0 && (
        <div className="mt-14">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px flex-1 bg-white/8" />
            <span className="text-xs font-semibold tracking-[0.15em] text-creo-text-muted uppercase whitespace-nowrap">Coming Soon — On The Roadmap</span>
            <div className="h-px flex-1 bg-white/8" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {upcomingFeatures.map((feature) => {
              const colors = colorMap[feature.color];
              const Icon = feature.icon;

              return (
                <div
                  key={`upcoming-${feature.id}`}
                  className="relative rounded-2xl p-6 border border-dashed border-creo-border bg-white/[0.015] opacity-90"
                >
                  <span className={`absolute top-4 right-4 flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${colors.bg} ${colors.text} border ${colors.border}`}>
                    <Lock size={9} />{feature.badge}
                  </span>

                  <div className={`w-11 h-11 rounded-xl ${colors.bg} border ${colors.border} flex items-center justify-center mb-4`}>
                    <Icon size={20} className={colors.text} />
                  </div>

                  <h3 className="text-creo-text-secondary font-semibold text-base mb-2">{feature.title}</h3>
                  <p className="text-creo-text-muted text-sm leading-relaxed">{feature.description}</p>
                  <div className="mt-3 inline-flex items-center gap-1 text-[10px] font-semibold text-creo-text-muted uppercase tracking-wide">
                    Coming Soon
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        )}

        {/* Stats row — real numbers only, honest fallback copy otherwise */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              value: stats.totalCreators !== null && stats.totalCreators >= 10 ? formatCount(stats.totalCreators) : 'New',
              label: stats.totalCreators !== null && stats.totalCreators >= 10 ? 'Active Creators' : 'Just Launched',
            },
            {
              value: stats.totalGenerated !== null && stats.totalGenerated >= 10 ? formatCount(stats.totalGenerated) : '2',
              label: stats.totalGenerated !== null && stats.totalGenerated >= 10 ? 'Scripts Generated' : 'AI Models Behind It',
            },
            { value: '< 5s', label: 'Average Generation Time' },
            { value: '6', label: 'Platforms Supported' },
          ].map((stat) => (
            <div key={`stat-${stat.label}`} className="creo-surface rounded-2xl p-5 text-center">
              <p className="text-2xl font-bold text-gradient tabular-nums mb-1">{stat.value}</p>
              <p className="text-xs text-creo-text-muted font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
