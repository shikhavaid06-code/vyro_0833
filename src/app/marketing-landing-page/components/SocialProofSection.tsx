'use client';
import React from 'react';
import { Star, Quote } from 'lucide-react';

const testimonials = [
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
            Creators love CRÉO
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
           
          </div>
        </div>
      </div>
    </section>
  );
}
