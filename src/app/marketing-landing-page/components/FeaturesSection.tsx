'use client';
import React, { useState } from 'react';
import { Sparkles, Zap, FileText, MessageSquare, Globe, Wand2, ChevronRight } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';


const features = [
  {
    id: 'title-gen',
    icon: Sparkles,
    color: 'purple',
    title: 'AI Title Generator',
    description: 'Generate 10+ scroll-stopping titles for any idea in under 5 seconds. Trained on millions of viral videos across every niche.',
    detail: 'Analyzes trending patterns, emotional triggers, and platform-specific formats to craft titles that demand clicks.',
    badge: 'Most Used',
  },
  {
    id: 'hook-gen',
    icon: Zap,
    color: 'pink',
    title: 'Hook Generator',
    description: 'The first 3 seconds decide everything. VYRO writes hooks that stop the scroll and pull viewers into your content.',
    detail: 'Choose from curiosity hooks, shock hooks, story hooks, and controversy hooks — all optimized per platform.',
    badge: 'Fan Favorite',
  },
  {
    id: 'script-gen',
    icon: FileText,
    color: 'violet',
    title: 'Script Generator',
    description: 'Full scripts for Shorts, Reels, long-form YouTube, and everything in between. Custom duration up to 2 hours.',
    detail: 'Structured with intro, body, and CTA. Tone-matched to your brand voice with every generation.',
    badge: null,
  },
  {
    id: 'ai-assistant',
    icon: MessageSquare,
    color: 'indigo',
    title: 'AI Assistant',
    description: 'Chat with your personal AI co-writer. Ask it to rewrite, shorten, make it funnier, or change the entire angle.',
    detail: 'Context-aware — it remembers your entire session and refines based on your feedback naturally.',
    badge: 'Ultra Only',
  },
  {
    id: 'multi-platform',
    icon: Globe,
    color: 'cyan',
    title: 'Multi-Platform Optimization',
    description: 'One idea, every platform. VYRO adapts your content for YouTube, TikTok, Instagram Reels, and Twitter/X.',
    detail: 'Adjusts length, tone, hashtag strategy, and format rules per platform automatically.',
    badge: null,
  },
  {
    id: 'smart-edit',
    icon: Wand2,
    color: 'amber',
    title: 'Smart AI Editing',
    description: 'Highlight any part of your script and say "make this more emotional" or "cut this down." AI rewrites it live.',
    detail: 'Works inline within the chat — no copy-pasting to external tools. Your script evolves in real time.',
    badge: 'Pro + Ultra',
  },
];

const colorMap: Record<string, { bg: string; text: string; border: string; glow: string }> = {
  purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20', glow: 'group-hover:shadow-purple-500/20' },
  pink: { bg: 'bg-pink-500/10', text: 'text-pink-400', border: 'border-pink-500/20', glow: 'group-hover:shadow-pink-500/20' },
  violet: { bg: 'bg-violet-500/10', text: 'text-violet-400', border: 'border-violet-500/20', glow: 'group-hover:shadow-violet-500/20' },
  indigo: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/20', glow: 'group-hover:shadow-indigo-500/20' },
  cyan: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20', glow: 'group-hover:shadow-cyan-500/20' },
  amber: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', glow: 'group-hover:shadow-amber-500/20' },
};

export default function FeaturesSection() {
  const [activeFeature, setActiveFeature] = useState('title-gen');

  return (
    <section id="features" className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-screen-2xl mx-auto px-6 lg:px-10">
        {/* Section header */}
        <div className="text-center mb-16">
          <p className="text-xs font-semibold tracking-[0.2em] text-purple-400 uppercase mb-4">Features</p>
          <h2 className="font-display text-4xl md:text-6xl font-bold mb-5">
            <span className="text-white">Everything you need to</span>
            <br />
            <span className="text-gradient">ship content daily</span>
          </h2>
          <p className="text-white/40 text-lg max-w-xl mx-auto">
            Six powerful AI tools working together in one seamless chat interface.
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature) => {
            const colors = colorMap[feature.color];
            const Icon = feature.icon;
            const isActive = activeFeature === feature.id;

            return (
              <div
                key={`feature-${feature.id}`}
                className={`group relative rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:-translate-y-1 ${
                  isActive
                    ? `glass-strong border ${colors.border} shadow-lg ${colors.glow}`
                    : 'glass border border-white/5 hover:border-white/10'
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

                <h3 className="text-white font-semibold text-base mb-2">{feature.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed mb-3">{feature.description}</p>

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

        {/* Stats row */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { value: '47,832+', label: 'Active Creators' },
            { value: '2.4M+', label: 'Scripts Generated' },
            { value: '< 5s', label: 'Average Generation Time' },
            { value: '4.9/5', label: 'Creator Satisfaction' },
          ].map((stat) => (
            <div key={`stat-${stat.label}`} className="glass rounded-2xl p-5 text-center border border-white/5">
              <p className="text-2xl font-bold text-gradient tabular-nums mb-1">{stat.value}</p>
              <p className="text-xs text-white/40 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}