'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Circle, Lock } from 'lucide-react';
import AppLogo from '@/components/ui/AppLogo';

const phases = [
  {
    phase: 'Phase 1',
    title: 'Money & Trust',
    status: 'in progress',
    items: ['Razorpay checkout & subscriptions', 'Upgrade page with plan comparison', 'Trust section, guarantees & FAQ', 'Real social proof, no inflated numbers'],
  },
  {
    phase: 'Phase 2',
    title: 'Retention System',
    status: 'planned',
    items: ['Creator Memory & Creator Brain', 'Daily missions, streaks & progress dashboard', 'Idea Bank, Swipe File & Hall of Fame'],
  },
  {
    phase: 'Phase 3',
    title: 'Content Superpowers',
    status: 'planned',
    items: ['Content Expansion Engine', 'Brutal Reviewer — hook & retention scoring', 'Script-to-Shot Planner', 'Audience Simulator'],
  },
  {
    phase: 'Phase 4',
    title: 'Unique Moat',
    status: 'planned',
    items: ['Competitor Intelligence & Link Cloner', 'Personal Viral Pattern Detector', 'Winning hook prediction & engagement forecasting'],
  },
  {
    phase: 'Phase 5',
    title: 'Growth Engine',
    status: 'planned',
    items: ['Public roadmap & feedback portal', 'Referral program', 'Community templates & Hook Marketplace'],
  },
  {
    phase: 'Phase 6',
    title: 'Teams & Agencies',
    status: 'planned',
    items: ['Team Brain & shared vault', 'Client workspaces', 'Agency outreach automation'],
  },
  {
    phase: 'Phase 7',
    title: 'Mobile',
    status: 'planned',
    items: ['Full mobile-responsive UI', 'Progressive Web App', 'Native app on Play Store & App Store'],
  },
];

export default function RoadmapPage() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-[#080812] px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-white/40 hover:text-white text-sm mb-8 transition-colors">
          <ArrowLeft size={15} /> Back
        </button>
        <div className="flex items-center gap-2 mb-8">
          <AppLogo size={24} />
          <span className="font-display text-lg font-semibold text-white">CRÉO</span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Roadmap</h1>
        <p className="text-white/40 text-sm mb-10">Where CRÉO is headed. Nothing here is a promise of dates — just direction.</p>

        <div className="space-y-6">
          {phases.map((p) => (
            <div key={p.phase} className="glass rounded-2xl border border-white/8 p-6">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-purple-400">{p.phase}</p>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${p.status === 'in progress' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-white/5 text-white/40 border border-white/10'}`}>
                  {p.status === 'in progress' ? <Circle size={7} className="fill-green-400 text-green-400" /> : <Lock size={9} />}
                  {p.status}
                </span>
              </div>
              <h2 className="text-white font-semibold text-lg mb-3">{p.title}</h2>
              <ul className="space-y-1.5">
                {p.items.map((item) => (
                  <li key={item} className="text-white/55 text-sm flex items-start gap-2">
                    <span className="text-purple-400/60 mt-1">•</span>{item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-white/8">
          <p className="text-white/30 text-xs">Already shipped? See the <a href="/changelog" className="text-purple-400 hover:text-purple-300">changelog</a>.</p>
        </div>
      </div>
    </div>
  );
}
