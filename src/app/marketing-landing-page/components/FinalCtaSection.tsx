'use client';
import React from 'react';
import Link from 'next/link';
import { Zap, ShieldCheck, CreditCard, Lock, ArrowRight } from 'lucide-react';

export default function FinalCtaSection() {
  return (
    <section className="relative py-10">
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-10">
        <div className="creo-surface-elevated rounded-2xl p-6 sm:p-7 flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-creo-primary/12 flex items-center justify-center flex-shrink-0"><Zap size={16} className="text-creo-primary" /></div>
            <div>
              <p className="creo-body font-semibold text-creo-text-primary">Stop switching tools. Start building your creative empire with CRÉO.</p>
              <div className="flex flex-wrap items-center gap-3 mt-1.5">
                {[{ icon: ShieldCheck, text: 'Secure & Private' }, { icon: CreditCard, text: 'No credit card' }, { icon: Lock, text: 'Cancel anytime' }].map((b) => (<span key={b.text} className="flex items-center gap-1 creo-caption text-creo-text-muted"><b.icon size={11} />{b.text}</span>))}
              </div>
            </div>
          </div>
          <Link href="/try" className="creo-btn-primary flex items-center gap-2 px-6 py-3 rounded-full text-white font-semibold text-sm flex-shrink-0 hover:scale-[1.02] active:scale-95 transition-all">Get Started Free <ArrowRight size={15} /></Link>
        </div>
      </div>
    </section>
  );
}
