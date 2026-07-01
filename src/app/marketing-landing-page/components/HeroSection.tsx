'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, Zap, TrendingUp, Play } from 'lucide-react';
import DemoModal from './DemoModal';

export default function HeroSection() {
  const [showDemo, setShowDemo] = useState(false);
  const [userCount] = useState(47832);

  return (
    <section id="hero" className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-16">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-600/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-pink-600/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-violet-600/10 rounded-full blur-[90px]" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `linear-gradient(rgba(168,85,247,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(168,85,247,0.5) 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />
      </div>

      <div className="relative z-10 max-w-screen-2xl mx-auto px-6 lg:px-10 text-center w-full">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-8">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs font-medium text-white/70">{userCount.toLocaleString()}+ creators already using CRÉO</span>
          <TrendingUp size={12} className="text-purple-400" />
        </div>

        {/* ✅ New headline — sells results not features */}
        <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold leading-tight mb-6">
          <span className="text-white">Turn One Idea Into</span><br />
          <span className="text-gradient">30 Days of Viral Content</span>
        </h1>

        <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-4 leading-relaxed font-light">
          Stop guessing what to post. CRÉO writes hooks, titles, and full scripts that keep people watching — in under 60 seconds.
        </p>

        {/* Result pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {['Get viewers to stop scrolling', 'Publish-ready scripts instantly', 'Works for YouTube, TikTok & Reels'].map((t) => (
            <span key={t} className="flex items-center gap-1.5 glass border border-white/8 rounded-full px-3 py-1 text-xs text-white/50">
              <Zap size={10} className="text-purple-400" />{t}
            </span>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
          <Link href="/sign-up-login-screen" className="group flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-vyro text-white font-semibold text-base glow-button hover:scale-105 active:scale-95 transition-all duration-200">
            <Sparkles size={18} />Start Creating Free
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-200" />
          </Link>
          <button onClick={() => setShowDemo(true)} className="group flex items-center gap-2 px-8 py-4 rounded-full glass text-white/70 hover:text-white font-medium text-base hover:bg-white/5 transition-all duration-200">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
              <Play size={12} fill="currentColor" />
            </div>
            Watch Demo
          </button>
        </div>

        {/* ✅ Product visualization — shows idea → output flow */}
        <div className="max-w-3xl mx-auto glass rounded-2xl p-6 text-left mb-20 border border-white/8">
          <div className="flex items-center gap-3 mb-5">
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500/70" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
              <span className="w-3 h-3 rounded-full bg-green-500/70" />
            </div>
            <span className="text-xs text-white/30 font-mono">creo.ai — content generator</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            {[
              { step: '01', label: 'Your Idea', content: '"Fitness tips for busy students"', color: 'border-purple-500/30 bg-purple-500/5' },
              { step: '02', label: '6 Viral Titles', content: '"The 5-Minute Student Workout Nobody Talks About"', color: 'border-pink-500/30 bg-pink-500/5' },
              { step: '03', label: '3 Hook Options', content: '"I went from failing exams to top of my class — here\'s what changed"', color: 'border-violet-500/30 bg-violet-500/5' },
              { step: '04', label: 'Full Script', content: '[INTRO 0:00] Hook + problem setup... [MAIN] 5 actionable tips...', color: 'border-green-500/30 bg-green-500/5' },
            ].map((item) => (
              <div key={item.step} className={`rounded-xl border p-3 ${item.color}`}>
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="text-[10px] font-bold text-white/30">{item.step}</span>
                  <span className="text-[10px] font-semibold text-white/60 uppercase tracking-wide">{item.label}</span>
                </div>
                <p className="text-xs text-white/60 leading-relaxed line-clamp-3">{item.content}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ✅ How It Works — 3 steps */}
        <div className="max-w-3xl mx-auto mb-20">
          <p className="text-xs font-semibold tracking-[0.2em] text-purple-400 uppercase mb-4">How It Works</p>
          <h2 className="text-3xl font-bold text-white mb-10">Three steps to viral content</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { num: '1', title: 'Enter your idea', desc: 'Type any topic — "5 AI study hacks" or "morning routine for creators"', icon: '💡' },
              { num: '2', title: 'Choose your platform', desc: 'YouTube, TikTok, Instagram, Twitter — CRÉO adapts the format automatically', icon: '🎯' },
              { num: '3', title: 'Get hooks, titles & scripts', desc: 'Publish-ready content in under 60 seconds. Edit, export, or refine with AI', icon: '🚀' },
            ].map((step) => (
              <div key={step.num} className="glass rounded-2xl border border-white/8 p-6 text-left relative overflow-hidden group hover:border-purple-500/30 transition-all duration-300">
                <div className="absolute top-4 right-4 text-4xl font-black text-white/5 group-hover:text-white/8 transition-all">{step.num}</div>
                <span className="text-3xl mb-4 block">{step.icon}</span>
                <h3 className="text-white font-semibold text-base mb-2">{step.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Trusted by */}
        <div className="flex flex-col items-center gap-4">
          <p className="text-xs text-white/30 uppercase tracking-widest">Trusted by creators from</p>
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
            {['YouTube', 'TikTok', 'Instagram', 'Twitch', 'Substack'].map((platform) => (
              <span key={platform} className="text-sm text-white/20 font-medium hover:text-white/40 transition-colors">{platform}</span>
            ))}
          </div>
        </div>
      </div>

      {showDemo && <DemoModal onClose={() => setShowDemo(false)} />}
    </section>
  );
}
