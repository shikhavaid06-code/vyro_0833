'use client';
import React from 'react';
import { Zap, Sparkles, BarChart3, Users } from 'lucide-react';

const steps = [
  { num: '1', icon: Zap, title: 'Capture Ideas', desc: 'Save or generate ideas whenever inspiration hits.' },
  { num: '2', icon: Sparkles, title: 'Create Content', desc: 'Use AI to turn ideas into high-quality content.' },
  { num: '3', icon: BarChart3, title: 'Analyze Performance', desc: 'Track results and understand what actually works.' },
  { num: '4', icon: Users, title: 'Improve & Scale', desc: 'Optimize, repurpose, and grow your content engine.' },
];

export default function HowItWorksSection() {
  return (
    <section className="relative py-16 overflow-hidden">
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-10">
        <p className="creo-caption text-center text-creo-primary uppercase tracking-[0.15em] mb-8">How CRÉO Works</p>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-center gap-6 sm:gap-3">
          {steps.map((s, i) => (
            <React.Fragment key={s.num}>
              <div className="flex items-start gap-3 max-w-[220px]">
                <div className="w-11 h-11 rounded-full bg-creo-primary/12 flex items-center justify-center flex-shrink-0"><s.icon size={17} className="text-creo-primary" /></div>
                <div><p className="creo-body font-semibold text-creo-text-primary">{s.num}. {s.title}</p><p className="creo-caption text-creo-text-muted mt-0.5">{s.desc}</p></div>
              </div>
              {i < steps.length - 1 && <div className="hidden sm:block w-8 h-px bg-creo-border flex-shrink-0" />}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}
