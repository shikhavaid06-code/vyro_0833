'use client';
import React from 'react';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    id: 'test-001',
    quote: 'VYRO turned a 3-hour script grind into a 10-minute flow. My short hit 400k.',
    name: 'Maya R.',
    handle: '@mayamakes',
    platform: 'YouTube',
    avatar: 'M',
    color: 'purple',
    stars: 5,
  },
  {
    id: 'test-002',
    quote: 'The hook generator alone is worth it. Retention doubled on my last three videos.',
    name: 'Dev A.',
    handle: '@devfilmsit',
    platform: 'TikTok',
    avatar: 'D',
    color: 'pink',
    stars: 5,
  },
  {
    id: 'test-003',
    quote: 'I pay for Ultra. Nova feels like a co-writer who knows my voice.',
    name: 'Noor S.',
    handle: '@noorthinks',
    platform: 'Instagram',
    avatar: 'N',
    color: 'violet',
    stars: 5,
  },
  {
    id: 'test-004',
    quote: 'Titles used to be my weakness. Not anymore.',
    name: 'Leo M.',
    handle: '@leorecords',
    platform: 'YouTube',
    avatar: 'L',
    color: 'indigo',
    stars: 5,
  },
  {
    id: 'test-005',
    quote: 'I generate a week of content in one Sunday session. VYRO is the only reason I post consistently.',
    name: 'Priya K.',
    handle: '@priyacreates',
    platform: 'Instagram',
    avatar: 'P',
    color: 'cyan',
    stars: 5,
  },
];

const avatarColors: Record<string, string> = {
  purple: 'from-purple-500 to-violet-600',
  pink: 'from-pink-500 to-rose-600',
  violet: 'from-violet-500 to-purple-700',
  indigo: 'from-indigo-500 to-blue-600',
  cyan: 'from-cyan-500 to-teal-600',
};

export default function SocialProofSection() {
  return (
    <section className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-purple-600/5 blur-[80px]" />
      </div>

      <div className="max-w-screen-2xl mx-auto px-6 lg:px-10">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold tracking-[0.2em] text-pink-400 uppercase mb-4">Social Proof</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
            Creators love VYRO
          </h2>
          <p className="text-white/40 text-base">
            Real results from real creators. No paid testimonials.
          </p>
        </div>

        {/* Testimonial grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="glass rounded-2xl p-5 border border-white/5 hover:border-white/10 hover:-translate-y-1 transition-all duration-300 flex flex-col gap-4"
            >
              <div className="flex items-start justify-between">
                <Quote size={18} className="text-purple-400/50" />
                <div className="flex gap-0.5">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={`star-${t.id}-${i}`} size={11} fill="#a855f7" className="text-purple-400" />
                  ))}
                </div>
              </div>

              <p className="text-white/75 text-sm leading-relaxed flex-1">
                &ldquo;{t.quote}&rdquo;
              </p>

              <div className="flex items-center gap-3 pt-2 border-t border-white/5">
                <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${avatarColors[t.color]} flex items-center justify-center flex-shrink-0`}>
                  <span className="text-xs font-bold text-white">{t.avatar}</span>
                </div>
                <div>
                  <p className="text-white text-xs font-semibold">{t.name}</p>
                  <p className="text-white/40 text-[11px]">{t.handle} · {t.platform}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust bar */}
        <div className="mt-12 glass rounded-2xl p-6 border border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex -space-x-2">
              {['A', 'B', 'C', 'D', 'E'].map((letter, i) => (
                <div
                  key={`avatar-stack-${letter}`}
                  className="w-9 h-9 rounded-full border-2 border-[#080812] bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center"
                  style={{ zIndex: 5 - i }}
                >
                  <span className="text-xs font-bold text-white">{letter}</span>
                </div>
              ))}
            </div>
            <div>
              <p className="text-white font-semibold text-sm">47,832+ creators</p>
              <p className="text-white/40 text-xs">shipping content with VYRO daily</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-white tabular-nums">4.9</p>
              <div className="flex gap-0.5 justify-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={`trust-star-${i}`} size={10} fill="#a855f7" className="text-purple-400" />
                ))}
              </div>
            </div>
            <div className="h-10 w-px bg-white/10" />
            <div className="text-center">
              <p className="text-2xl font-bold text-white tabular-nums">2.4M</p>
              <p className="text-white/40 text-xs">scripts generated</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}