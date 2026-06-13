'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, Play, ArrowRight, Zap, TrendingUp } from 'lucide-react';
import DemoModal from './DemoModal';

const rotatingWords = ['Viral', 'Engaging', 'Scroll-Stopping', 'High-Converting', 'Trending'];

export default function HeroSection() {
  const [wordIndex, setWordIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const [userCount] = useState(47832);
  const [showDemo, setShowDemo] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => { setWordIndex((prev) => (prev + 1) % rotatingWords.length); setVisible(true); }, 300);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-600/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-pink-600/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-violet-600/10 rounded-full blur-[90px]" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `linear-gradient(rgba(168,85,247,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(168,85,247,0.5) 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />
      </div>
      <div className="relative z-10 max-w-screen-2xl mx-auto px-6 lg:px-10 text-center">
        <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-8 animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs font-medium text-white/70 tracking-wide">{userCount.toLocaleString()}+ creators already using CRÉO</span>
          <TrendingUp size={12} className="text-purple-400" />
        </div>

        <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold leading-tight mb-6">
          <span className="text-white">Create </span>
          <span className={`text-gradient inline-block transition-all duration-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>{rotatingWords[wordIndex]}</span>
          <br />
          <span className="text-white">Content with AI</span>
        </h1>

        <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
          From raw idea to scroll-stopping script in seconds. CRÉO writes your titles, hooks, and full scripts — so you can focus on creating, not staring at a blank page.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link href="/sign-up-login-screen" className="group flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-vyro text-white font-semibold text-base glow-button hover:scale-105 active:scale-95 transition-all duration-200">
            <Sparkles size={18} />Start Creating Free<ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-200" />
          </Link>
          <button onClick={() => setShowDemo(true)} className="group flex items-center gap-2 px-8 py-4 rounded-full glass text-white/70 hover:text-white font-medium text-base hover:bg-white/5 transition-all duration-200">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors duration-200"><Play size={12} fill="currentColor" /></div>
            Watch Demo
          </button>
        </div>

        <div className="max-w-3xl mx-auto glass-strong rounded-2xl p-6 text-left animate-float">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500/70" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
              <span className="w-3 h-3 rounded-full bg-green-500/70" />
            </div>
            <span className="text-xs text-white/30 font-mono">creo.ai — content generator</span>
          </div>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-gradient-vyro flex-shrink-0 flex items-center justify-center mt-0.5"><span className="text-xs font-bold text-white">Y</span></div>
              <div className="glass rounded-xl rounded-tl-none px-4 py-3 text-sm text-white/70 max-w-md">I want to make a video about AI tools that help students study smarter</div>
            </div>
            <div className="flex items-start gap-3 flex-row-reverse">
              <div className="w-7 h-7 rounded-full bg-white/10 flex-shrink-0 flex items-center justify-center mt-0.5"><Sparkles size={14} className="text-purple-400" /></div>
              <div className="space-y-2 max-w-lg">
                <div className="glass rounded-xl rounded-tr-none px-4 py-3 text-sm text-white/80">
                  <p className="text-purple-400 text-xs font-medium mb-2 tracking-wide uppercase">Generated Titles</p>
                  <ul className="space-y-1.5">
                    {['5 AI Tools That Will Make You Study 10x Faster', "I Used AI to Study for Finals — Here's What Happened", "Students Are Using This AI Secret to Get Straight A's"].map((title, i) => (
                      <li key={i} className="flex items-center gap-2 text-white/70"><Zap size={11} className="text-pink-400 flex-shrink-0" />{title}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <div className="flex gap-1">
              <span className="typing-dot w-1.5 h-1.5 rounded-full bg-purple-400 inline-block" />
              <span className="typing-dot w-1.5 h-1.5 rounded-full bg-purple-400 inline-block" />
              <span className="typing-dot w-1.5 h-1.5 rounded-full bg-purple-400 inline-block" />
            </div>
            <span className="text-xs text-white/30">CRÉO is generating hooks...</span>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center gap-4">
          <p className="text-xs text-white/30 uppercase tracking-widest">Trusted by creators from</p>
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
            {['YouTube', 'TikTok', 'Instagram', 'Twitch', 'Substack'].map((platform) => (
              <span key={platform} className="text-sm text-white/20 font-medium hover:text-white/40 transition-colors duration-200">{platform}</span>
            ))}
          </div>
        </div>
      </div>

      {showDemo && <DemoModal onClose={() => setShowDemo(false)} />}
    </section>
  );
}
