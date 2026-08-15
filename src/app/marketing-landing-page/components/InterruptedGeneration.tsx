'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Sparkles, X, Zap } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type Stage = 'idle' | 'loading' | 'gate' | 'done';

export default function InterruptedGeneration() {
  const [topic, setTopic] = useState('');
  const [stage, setStage] = useState<Stage>('idle');
  const [hooks, setHooks] = useState<string[]>([]);
  const [loadingText, setLoadingText] = useState('');
  const router = useRouter();

  const loadingMessages = [
    'Reverse-engineering viral database structures...',
    'Analyzing top-performing content patterns...',
    'Generating high-retention hooks for your topic...',
  ];

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setStage('loading');

    // Cycle loading messages
    let i = 0;
    setLoadingText(loadingMessages[0]);
    const interval = setInterval(() => {
      i = (i + 1) % loadingMessages.length;
      setLoadingText(loadingMessages[i]);
    }, 700);

    try {
      // Call real API
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea: topic, forceType: 'hooks' }),
      });
      const data = await res.json();
      clearInterval(interval);

      // Store hooks + topic for after auth
      if (typeof window !== 'undefined') {
        localStorage.setItem('creo_interrupted_hooks', JSON.stringify(data.hooks || []));
        localStorage.setItem('creo_interrupted_topic', topic);
      }
      setHooks(data.hooks || []);

      // Show the gate after suspense
      await new Promise((r) => setTimeout(r, 400));
      setStage('gate');
    } catch {
      clearInterval(interval);
      setStage('idle');
    }
  };

  const handleSignIn = async () => {
    // Save topic before redirect
    localStorage.setItem('creo_pending_name', '');
    localStorage.setItem('creo_pending_plan', 'free');
    // Redirect to magic link signup
    router.push(`/sign-up-login-screen?topic=${encodeURIComponent(topic)}`);
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* ✅ Stage 1 — Input */}
      {(stage === 'idle' || stage === 'loading') && (
        <div className={`transition-all duration-300 ${stage === 'loading' ? 'blur-sm pointer-events-none' : ''}`}>
          <div className="glass rounded-2xl border border-white/10 p-6">
            <p className="text-xs font-semibold text-purple-400 uppercase tracking-widest mb-3">Try it free — no signup needed</p>
            <h3 className="text-white font-bold text-xl mb-4">What's your video topic?</h3>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleGenerate(); }}
              placeholder="e.g. morning routine for students, fitness tips, AI tools..."
              className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-purple-500/50 transition-all mb-4"
            />
            <button onClick={handleGenerate} disabled={!topic.trim() || stage === 'loading'}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-40">
              <Zap size={16} />Generate Retention Hooks
            </button>
          </div>
        </div>
      )}

      {/* ✅ Stage 2 — Loading overlay */}
      {stage === 'loading' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-10">
          <div className="w-14 h-14 rounded-full border-2 border-purple-500/30 border-t-purple-500 animate-spin" />
          <p className="text-purple-300 text-sm font-medium text-center animate-pulse max-w-xs">{loadingText}</p>
        </div>
      )}

      {/* ✅ Stage 3 — The Gate (Interrupt Modal) */}
      {stage === 'gate' && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />
          <div className="relative w-full max-w-md bg-[#0d0d1f] border border-purple-500/30 rounded-2xl p-6 animate-modal-in">
            {/* Hooks preview — blurred */}
            <div className="mb-5 p-4 rounded-xl bg-white/3 border border-white/8 relative overflow-hidden">
              <div className="absolute inset-0 backdrop-blur-sm bg-[#0d0d1f]/60 flex items-center justify-center z-10 rounded-xl">
                <div className="text-center">
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center mx-auto mb-2">
                    <Sparkles size={18} className="text-purple-400" />
                  </div>
                  <p className="text-white/60 text-xs">Sign in to reveal</p>
                </div>
              </div>
              {hooks.slice(0, 2).map((hook, i) => (
                <p key={i} className="text-white/30 text-xs mb-2 line-clamp-1 blur-sm select-none">{hook}</p>
              ))}
            </div>

            <h2 className="text-xl font-bold text-white mb-2">Your Viral Hooks are Ready! 🎉</h2>
            <p className="text-white/50 text-sm mb-6 leading-relaxed">
              Sign in to reveal your hooks, access your free workspace, and start creating content instantly — no re-typing needed.
            </p>

            <button onClick={handleSignIn}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all mb-3">
              <Sparkles size={15} />Sign In & Reveal My Hooks
              <ArrowRight size={15} />
            </button>

            <button onClick={() => setStage('idle')} className="w-full text-center text-xs text-white/25 hover:text-white/40 transition-colors py-2">
              ← Try a different topic
            </button>

            <p className="text-center text-[10px] text-white/20 mt-2">Free forever · No credit card</p>
          </div>
        </div>
      )}
    </div>
  );
}
