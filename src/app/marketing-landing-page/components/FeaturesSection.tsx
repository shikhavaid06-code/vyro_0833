'use client';
import React from 'react';
import Link from 'next/link';
import { Zap, Brain, BarChart3, Star, Lightbulb, Users, ArrowRight, Lock } from 'lucide-react';

const pillars = [
  { id: 'create', icon: Zap, title: 'Create', desc: 'Turn ideas into high-performing titles, hooks, and scripts with AI.', status: 'live' as const },
  { id: 'brain', icon: Brain, title: 'Brain', desc: 'AI that learns your style, patterns, and what works for you.', status: 'live' as const, badge: 'PRO' },
  { id: 'analytics', icon: BarChart3, title: 'Analytics', desc: 'Track real performance across platforms and get actionable insights.', status: 'live' as const, badge: 'PRO' },
  { id: 'vault', icon: Star, title: 'Vault', desc: 'Save, organize, and reuse your best ideas and content.', status: 'live' as const },
  { id: 'ideas', icon: Lightbulb, title: 'Ideas', desc: 'Never run out of ideas with AI-powered idea generation.', status: 'soon' as const },
  { id: 'teams', icon: Users, title: 'Teams', desc: 'Collaborate with your team and scale your content engine.', status: 'live' as const, badge: 'NEW' },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="relative py-24 overflow-hidden">
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-10">
        <div className="text-center mb-12">
          <p className="creo-caption text-center text-creo-primary uppercase tracking-[0.15em] mb-4">A system designed for creators</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-creo-text-primary">One System. Every Part of Your Process.</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {pillars.map((p) => (
            <div key={p.id} className={`relative rounded-2xl p-6 ${p.status === 'soon' ? 'border border-dashed border-creo-border bg-white/[0.015] opacity-90' : 'creo-surface'}`}>
              {p.badge && (
                <span className={`absolute top-4 right-4 creo-caption px-2 py-0.5 rounded-full ${p.badge === 'NEW' ? 'bg-creo-success/15 text-creo-success' : 'bg-creo-warning/15 text-creo-warning'}`}>{p.badge}</span>
              )}
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${p.status === 'soon' ? 'bg-white/[0.03]' : 'bg-creo-primary/12'}`}>
                {p.status === 'soon' ? <Lock size={17} className="text-creo-text-muted" /> : <p.icon size={18} className="text-creo-primary" />}
              </div>
              <h3 className="creo-h3 text-creo-text-primary mb-1.5">{p.title}</h3>
              <p className="creo-body text-creo-text-muted mb-3">{p.desc}</p>
              {p.status === 'soon' ? (
                <span className="creo-caption text-creo-text-muted">Coming soon</span>
              ) : (
                <Link href={p.id === 'teams' ? '/upgrade' : '/try'} className="creo-caption text-creo-primary flex items-center gap-1 hover:gap-1.5 transition-all">Learn more <ArrowRight size={11} /></Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
