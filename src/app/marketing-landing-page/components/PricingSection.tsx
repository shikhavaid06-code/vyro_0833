'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Check, Crown, Zap, Sparkles, ArrowRight, Lock, Users } from 'lucide-react';
import { getLocalePricing } from '@/lib/pricing'; import { toast } from 'sonner';

const CONTACT_EMAIL = 'creo.app.ai@gmail.com'; function copyTeamsContact() { navigator.clipboard.writeText(CONTACT_EMAIL).catch(() => {}); toast.success(`Email copied: ${CONTACT_EMAIL}`, { description: "Send us a mail with the subject \"Teams plan inquiry\" and we'll get back to you." }); } export default function PricingSection() {
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');
  const [locale, setLocale] = useState(getLocalePricing());

  useEffect(() => { setLocale(getLocalePricing()); }, []);

  // ✅ Prices now come from the single source of truth (src/lib/pricing.ts)
  // instead of a second, slightly different hardcoded copy that lived here before.
  const plans = [
    {
      id: 'free', name: 'Free', journey: 'Start', tagline: 'Start your creator journey.',
      audience: 'For creators finding their voice.',
      price: { monthly: 0, yearly: 0 }, priceLabel: '/ forever',
      cta: 'Start Free', ctaStyle: 'secondary', icon: null, highlight: false, border: 'border-white/8',
      features: ['3 generations per day', 'AI Title Generator', 'Hook Generator', 'Short + medium scripts', 'Community updates', 'Basic tone options', 'Invite a friend → +1 free generation/day (up to +10)'],
      locked: ['AI Assistant', 'Smart editing', 'Multi-platform optimization'],
      roadmap: [],
    },
    {
      id: 'pro', name: 'Pro', journey: 'Grow', tagline: 'Grow faster. Ship daily.',
      audience: 'For creators serious about growth.',
      price: { monthly: locale.proRaw, yearly: Math.round(locale.proRaw * 0.75) }, priceLabel: '/ per month',
      cta: 'Get Pro', ctaStyle: 'primary', icon: Zap, highlight: true, border: 'border-purple-500/30',
      features: ['100 generations per day', 'Brutal Reviewer — script scoring & fixes', 'Content Expansion Engine — 1 idea → full pack', 'Script-to-Shot Planner — filmable shot lists', 'Content Resurrection — old content, new life', 'All durations including custom', 'AI Assistant unlocked', 'Smart editing (rewrite, shorten)', 'Multi-platform optimization', 'No watermark', 'Priority support'],
      locked: [],
      roadmap: [],
    },
    {
      id: 'ultra', name: 'Ultra', journey: 'Build', tagline: 'Build your content empire.',
      audience: 'For creators building something bigger than themselves.',
      price: { monthly: locale.ultraRaw, yearly: Math.round(locale.ultraRaw * 0.75) }, priceLabel: '/ per month',
      cta: 'Go Ultra', ctaStyle: 'gold', icon: Crown, highlight: false, border: 'border-pink-500/20',
      features: ['Unlimited generations', 'Creator Memory & Brain — AI that writes in YOUR voice', 'Competitor Intelligence — clone any viral framework', 'Audience Simulator — test viewer reactions first', 'Content Risk Detector — find retention leaks first', 'Brutal Reviewer — script scoring & fixes', 'Content Expansion Engine — 1 idea → full pack', 'Priority AI responses', 'Advanced tone & script control', 'Early access to new features'],
      locked: [],
      roadmap: [],
    },
{ id: 'teams', name: 'Teams', journey: 'Teams', tagline: 'Scale content across your whole team.', audience: 'For agencies, media teams, and creator groups.', price: { monthly: locale.teamRaw, yearly: Math.round(locale.teamRaw * 0.75) }, priceLabel: '/ seat / month · 3 seat min', cta: 'Contact Us', ctaStyle: 'contact', icon: Users, highlight: false, border: 'border-cyan-500/25', features: ['Everything in Pro, for every teammate', 'Centralized billing — one invoice, one admin', 'Shared brand voice — Creator Memory synced across the team', 'Shared content library & calendar', 'Team usage dashboard for admins', 'Priority onboarding & support'], locked: [], roadmap: [] },  ];

  return (
    <section id="pricing" className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-purple-600/5 blur-[100px]" />
      </div>

      <div className="max-w-screen-2xl mx-auto px-6 lg:px-10">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold tracking-[0.2em] text-purple-400 uppercase mb-4">Pricing</p>
          <h2 className="font-display text-5xl md:text-6xl font-bold mb-4">
            <span className="text-white">Start free. </span>
            <span className="text-gradient">Scale beautifully.</span>
          </h2>
          <p className="text-white/40 text-base mb-6">No credit card required. Upgrade when you're ready.</p>

          {/* ✅ The creator journey — pricing sells a progression, not a feature table */}
          <div className="flex items-center justify-center gap-2 mb-8 text-sm">
            {[['Start', 'text-white/50'], ['Grow', 'text-purple-400'], ['Build', 'text-amber-400']].map(([label, color], i) => (
              <React.Fragment key={label}>
                {i > 0 && <ArrowRight size={13} className="text-white/20" />}
                <span className={`font-semibold ${color}`}>{label}</span>
              </React.Fragment>
            ))}
          </div>

          <div className="inline-flex items-center glass rounded-full p-1 gap-1">
            {(['monthly', 'yearly'] as const).map((b) => (
              <button key={b} onClick={() => setBilling(b)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${billing === b ? 'bg-gradient-vyro text-white shadow-lg' : 'text-white/50 hover:text-white/70'}`}>
                {b === 'monthly' ? 'Monthly' : 'Yearly'}
                {b === 'yearly' && <span className="ml-2 text-[10px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded-full">Save 25%</span>}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {plans.map((plan) => {
            const PlanIcon = plan.icon;
            const price = plan.price[billing];

            return (
              <div key={plan.id} className={`relative rounded-2xl p-7 flex flex-col border ${plan.border} transition-all duration-300 hover:-translate-y-1 ${plan.highlight ? 'glass-strong shadow-lg shadow-purple-500/10' : 'glass'}`}>
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-vyro text-white text-xs font-semibold shadow-lg shadow-purple-500/30">Most Popular</div>
                )}
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-white text-xl font-bold">{plan.name}</h3>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide ${plan.id === 'ultra' ? 'bg-amber-500/10 text-amber-400' : plan.id === 'pro' ? 'bg-purple-500/10 text-purple-400' : plan.id === 'teams' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-white/5 text-white/40'}`}>{plan.journey}</span>
                    </div>
                    <p className="text-white/40 text-sm mt-1">{plan.tagline}</p>
                    <p className="text-white/25 text-xs mt-0.5">{plan.audience}</p>
                  </div>
                  {PlanIcon && (
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${plan.id === 'ultra' ? 'bg-amber-500/10' : plan.id === 'teams' ? 'bg-cyan-500/10' : 'bg-purple-500/10'}`}>
                      <PlanIcon size={18} className={plan.id === 'ultra' ? 'text-amber-400' : plan.id === 'teams' ? 'text-cyan-400' : 'text-purple-400'} />
                    </div>
                  )}
                </div>

                <div className="flex items-baseline gap-1 my-6">
                  <span className="font-display text-5xl font-bold text-white tabular-nums">{locale.symbol}{price.toLocaleString()}</span>
                  <span className="text-white/40 text-sm">{plan.priceLabel}</span>
                </div>

                <Link href={plan.id === 'teams' ? '#' : `/sign-up-login-screen?plan=${plan.id}`} onClick={(e) => { if (plan.id === 'teams') { e.preventDefault(); copyTeamsContact(); } }}
                  className={`w-full py-3 rounded-xl text-sm font-semibold text-center mb-7 flex items-center justify-center gap-2 transition-all duration-200 active:scale-95 ${
                    plan.ctaStyle === 'primary' ? 'bg-gradient-vyro text-white glow-button hover:scale-[1.02]'
                      : plan.ctaStyle === 'gold' ? 'bg-gradient-to-r from-amber-500 to-pink-500 text-white hover:scale-[1.02] shadow-lg shadow-amber-500/20'
                      : plan.ctaStyle === 'contact' ? 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 hover:scale-[1.02]' : 'glass border border-white/10 text-white/70 hover:text-white hover:bg-white/5'
                  }`}>
                  {plan.cta}<ArrowRight size={14} />
                </Link>

                <div className="space-y-2.5 flex-1">
                  {plan.features.map((feat) => (
                    <div key={feat} className="flex items-start gap-2.5">
                      <Check size={14} className={`mt-0.5 flex-shrink-0 ${plan.id === 'ultra' ? 'text-amber-400' : plan.id === 'teams' ? 'text-cyan-400' : 'text-purple-400'}`} />
                      <span className="text-white/70 text-sm">{feat}</span>
                    </div>
                  ))}
                  {plan.locked.map((feat) => (
                    <div key={feat} className="flex items-start gap-2.5 opacity-30">
                      <div className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 rounded-full border border-white/30 flex items-center justify-center"><div className="w-1 h-1 rounded-full bg-white/50" /></div>
                      <span className="text-white/50 text-sm line-through">{feat}</span>
                    </div>
                  ))}

                  {/* ✅ Roadmap features, per tier — clearly marked "Coming Soon" so nobody thinks these ship today */}
                  {plan.roadmap.length > 0 && (
                    <div className="pt-3 mt-2 border-t border-white/8">
                      <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wide mb-2">Coming Soon</p>
                      <div className="space-y-2">
                        {plan.roadmap.map((feat) => (
                          <div key={feat} className="flex items-start gap-2.5">
                            <Lock size={12} className={`mt-0.5 flex-shrink-0 ${plan.id === 'ultra' ? 'text-amber-400/60' : 'text-purple-400/60'}`} />
                            <span className="text-white/45 text-xs leading-relaxed">{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-center text-white/30 text-xs mt-8">
          <Sparkles size={11} className="inline mr-1 text-purple-400" />
          All paid plans include a 24-hour full-refund guarantee. No questions asked.
        </p>
      </div>
    </section>
  );
}
