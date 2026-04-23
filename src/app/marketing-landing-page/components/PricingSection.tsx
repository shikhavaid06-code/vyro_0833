'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { Check, Crown, Zap, Sparkles, ArrowRight } from 'lucide-react';

const plans = [
  {
    id: 'free',
    name: 'Free',
    tagline: 'A taste of the magic.',
    price: { monthly: 0, yearly: 0 },
    priceLabel: '/ forever',
    cta: 'Start Free',
    ctaStyle: 'secondary',
    icon: null,
    highlight: false,
    border: 'border-white/8',
    features: [
      '8 generations per day',
      'AI Title Generator',
      'Hook Generator',
      'Short + medium scripts',
      'Community updates',
      'Basic tone options',
    ],
    locked: [
      'AI Assistant',
      'Smart editing',
      'Multi-platform optimization',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    tagline: 'For creators who ship weekly.',
    price: { monthly: 14, yearly: 10 },
    priceLabel: '/ per month',
    cta: 'Get Pro',
    ctaStyle: 'primary',
    icon: Zap,
    highlight: true,
    border: 'border-purple-500/30',
    features: [
      '100 generations per day',
      'All durations including custom',
      'AI Assistant unlocked',
      'Smart editing (rewrite, shorten)',
      'Multi-platform optimization',
      'No watermark',
      'Faster generation speed',
      'Priority support',
    ],
    locked: [],
  },
  {
    id: 'ultra',
    name: 'Ultra',
    tagline: 'Unlimited, priority, holographic.',
    price: { monthly: 39, yearly: 29 },
    priceLabel: '/ per month',
    cta: 'Go Ultra',
    ctaStyle: 'gold',
    icon: Crown,
    highlight: false,
    border: 'border-pink-500/20',
    features: [
      'Unlimited generations',
      'Priority AI responses',
      'Advanced tone & script control',
      'Multi-platform optimization',
      'Smart AI editing (live rewrites)',
      'Early access to new features',
      'Premium UI effects unlocked',
      'Custom voice profile',
      'Dedicated AI co-writer',
    ],
    locked: [],
  },
];

export default function PricingSection() {
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');

  return (
    <section id="pricing" className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-purple-600/5 blur-[100px]" />
      </div>

      <div className="max-w-screen-2xl mx-auto px-6 lg:px-10">
        {/* Section header */}
        <div className="text-center mb-14">
          <p className="text-xs font-semibold tracking-[0.2em] text-purple-400 uppercase mb-4">Pricing</p>
          <h2 className="font-display text-5xl md:text-6xl font-bold mb-4">
            <span className="text-white">Start free. </span>
            <span className="text-gradient">Scale beautifully.</span>
          </h2>
          <p className="text-white/40 text-base mb-8">No credit card required. Upgrade when you're ready.</p>

          {/* Billing toggle */}
          <div className="inline-flex items-center glass rounded-full p-1 gap-1">
            {(['monthly', 'yearly'] as const).map((b) => (
              <button
                key={`billing-${b}`}
                onClick={() => setBilling(b)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  billing === b
                    ? 'bg-gradient-vyro text-white shadow-lg'
                    : 'text-white/50 hover:text-white/70'
                }`}
              >
                {b === 'monthly' ? 'Monthly' : 'Yearly'}
                {b === 'yearly' && (
                  <span className="ml-2 text-[10px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded-full">
                    Save 28%
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan) => {
            const PlanIcon = plan.icon;
            const price = plan.price[billing];

            return (
              <div
                key={`plan-${plan.id}`}
                className={`relative rounded-2xl p-7 flex flex-col border ${plan.border} transition-all duration-300 hover:-translate-y-1 ${
                  plan.highlight
                    ? 'glass-strong shadow-lg shadow-purple-500/10'
                    : 'glass'
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-vyro text-white text-xs font-semibold shadow-lg shadow-purple-500/30">
                    Most Popular
                  </div>
                )}

                {/* Header */}
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-white text-xl font-bold">{plan.name}</h3>
                    <p className="text-white/40 text-sm mt-1">{plan.tagline}</p>
                  </div>
                  {PlanIcon && (
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      plan.id === 'ultra' ? 'bg-amber-500/10' : 'bg-purple-500/10'
                    }`}>
                      <PlanIcon size={18} className={plan.id === 'ultra' ? 'text-amber-400' : 'text-purple-400'} />
                    </div>
                  )}
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-1 my-6">
                  <span className="font-display text-5xl font-bold text-white tabular-nums">
                    ${price}
                  </span>
                  <span className="text-white/40 text-sm">{plan.priceLabel}</span>
                </div>

                {/* CTA */}
                <Link
                  href="/sign-up-login-screen"
                  className={`w-full py-3 rounded-xl text-sm font-semibold text-center mb-7 flex items-center justify-center gap-2 transition-all duration-200 active:scale-95 ${
                    plan.ctaStyle === 'primary' ?'bg-gradient-vyro text-white glow-button hover:scale-[1.02]'
                      : plan.ctaStyle === 'gold' ?'bg-gradient-to-r from-amber-500 to-pink-500 text-white hover:scale-[1.02] shadow-lg shadow-amber-500/20' :'glass border border-white/10 text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {plan.cta}
                  <ArrowRight size={14} />
                </Link>

                {/* Features */}
                <div className="space-y-2.5 flex-1">
                  {plan.features.map((feat) => (
                    <div key={`feat-${plan.id}-${feat}`} className="flex items-start gap-2.5">
                      <Check size={14} className={`mt-0.5 flex-shrink-0 ${
                        plan.id === 'ultra' ? 'text-amber-400' : 'text-purple-400'
                      }`} />
                      <span className="text-white/70 text-sm">{feat}</span>
                    </div>
                  ))}
                  {plan.locked.map((feat) => (
                    <div key={`locked-${plan.id}-${feat}`} className="flex items-start gap-2.5 opacity-30">
                      <div className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 rounded-full border border-white/30 flex items-center justify-center">
                        <div className="w-1 h-1 rounded-full bg-white/50" />
                      </div>
                      <span className="text-white/50 text-sm line-through">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Money-back note */}
        <p className="text-center text-white/30 text-xs mt-8">
          <Sparkles size={11} className="inline mr-1 text-purple-400" />
          All paid plans include a 7-day money-back guarantee. No questions asked.
        </p>
      </div>
    </section>
  );
}