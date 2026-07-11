'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Circle, Lock, CheckCircle2 } from 'lucide-react';
import AppLogo from '@/components/ui/AppLogo';

// ✅ Roadmap kept in sync with what has ACTUALLY shipped — every item marked
// done: true is live in the product today. Under-selling shipped features
// was costing us; over-selling unshipped ones would cost us more.
type RoadmapItem = { label: string; done: boolean };
type Phase = { phase: string; title: string; status: 'shipped' | 'in progress' | 'planned'; items: RoadmapItem[] };

const phases: Phase[] = [
  {
    phase: 'Phase 1',
    title: 'Money & Trust',
    status: 'shipped',
    items: [
      { label: 'Razorpay checkout & subscriptions', done: true },
      { label: 'Upgrade page with plan comparison', done: true },
      { label: 'Trust section, guarantees & FAQ', done: true },
      { label: 'Real social proof, no inflated numbers', done: true },
      { label: 'Cancel anytime with prorated refunds', done: true },
    ],
  },
  {
    phase: 'Phase 2',
    title: 'Retention System',
    status: 'in progress',
    items: [
      { label: 'Creator Memory & Creator Brain', done: true },
      { label: 'Winning Vault', done: true },
      { label: 'Daily missions, streaks & progress dashboard', done: true },
      { label: 'Idea Bank, Swipe File & Hall of Fame', done: false },
    ],
  },
  {
    phase: 'Phase 3',
    title: 'Content Superpowers',
    status: 'in progress',
    items: [
      { label: 'Hook, title & script generation', done: true },
      { label: 'Nova AI assistant & smart editing', done: true },
      { label: 'Content Expansion Engine', done: true },
      { label: 'Brutal Reviewer — hook & retention scoring', done: true },
      { label: 'Script-to-Shot Planner', done: true },
      { label: 'Audience Simulator', done: true },
      { label: 'Content Resurrection', done: true },
      { label: 'Content Risk Detector', done: true },
    ],
  },
  {
    phase: 'Phase 4',
    title: 'Unique Moat',
    status: 'in progress',
    items: [
      { label: 'Competitor Intelligence & Link Cloner', done: true },
      { label: 'Personal Viral Pattern Detector', done: false },
      { label: 'Winning hook prediction & engagement forecasting', done: false },
    ],
  },
  {
    phase: 'Phase 5',
    title: 'Growth Engine',
    status: 'in progress',
    items: [
      { label: 'Referral program', done: true },
      { label: 'Public roadmap & changelog', done: true },
      { label: 'Feedback portal', done: false },
      { label: 'Community templates & Hook Marketplace', done: false },
    ],
  },
  {
    phase: 'Phase 6',
    title: 'Teams & Agencies',
    status: 'planned',
    items: [
      { label: 'Team Brain & shared vault', done: false },
      { label: 'Client workspaces', done: false },
      { label: 'Agency outreach automation', done: false },
    ],
  },
  {
    phase: 'Phase 7',
    title: 'Mobile',
    status: 'planned',
    items: [
      { label: 'Full mobile-responsive UI', done: true },
      { label: 'Progressive Web App', done: false },
      { label: 'Native app on Play Store & App Store', done: false },
    ],
  },
];

const statusChip: Record<Phase['status'], { classes: string; icon: React.ReactNode }> = {
  shipped: {
    classes: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    icon: <CheckCircle2 size={9} />,
  },
  'in progress': {
    classes: 'bg-green-500/10 text-green-400 border border-green-500/20',
    icon: <Circle size={7} className="fill-green-400 text-green-400" />,
  },
  planned: {
    classes: 'bg-white/5 text-white/40 border border-white/10',
    icon: <Lock size={9} />,
  },
};

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
        <p className="text-white/40 text-sm mb-10">Where CRÉO is headed — and what's already live. Nothing here is a promise of dates, just direction.</p>

        <div className="space-y-6">
          {phases.map((p) => (
            <div key={p.phase} className="glass rounded-2xl border border-white/8 p-6">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-purple-400">{p.phase}</p>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${statusChip[p.status].classes}`}>
                  {statusChip[p.status].icon}
                  {p.status}
                </span>
              </div>
              <h2 className="text-white font-semibold text-lg mb-3">{p.title}</h2>
              <ul className="space-y-1.5">
                {p.items.map((item) => (
                  <li key={item.label} className={`text-sm flex items-start gap-2 ${item.done ? 'text-white/70' : 'text-white/45'}`}>
                    {item.done
                      ? <CheckCircle2 size={14} className="text-emerald-400/80 mt-0.5 flex-shrink-0" />
                      : <span className="text-purple-400/60 mt-1 w-3.5 text-center flex-shrink-0">•</span>}
                    <span>{item.label}{item.done && <span className="ml-1.5 text-[10px] uppercase tracking-wide text-emerald-400/60 font-semibold">live</span>}</span>
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
