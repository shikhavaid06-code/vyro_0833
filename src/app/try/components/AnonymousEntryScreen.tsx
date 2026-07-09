'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight, Mail, Lock, Flame, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type Stage = 'entry' | 'loading' | 'gate' | 'sent';

const LOADING_MS = 2000;
const HANDOFF_KEY = 'creo_pending_handoff';

export default function AnonymousEntryScreen() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>('entry');
  const [topic, setTopic] = useState('');
  const [hooks, setHooks] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // ✅ Already signed in? This flow is for anonymous visitors — send them straight in.
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace('/main-app-chat-interface');
    }).catch(() => {});
  }, []);

  const handleGenerate = async () => {
    const trimmed = topic.trim();
    if (!trimmed) { setError('Enter a topic or keyword first'); return; }
    setError('');
    setStage('loading');

    try {
      // ✅ Run the real Gemini call and the 2s suspense animation together —
      // whichever takes longer decides when we move to the gate. If Gemini
      // is slow, the animation just runs a little longer; it never lies
      // about progress that hasn't happened.
      const [res] = await Promise.all([
        fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idea: trimmed, forceType: 'hooks' }),
        }),
        new Promise((r) => setTimeout(r, LOADING_MS)),
      ]);
      const data = await res.json();

      if (data.limitReached) {
        setError("You've used today's free trial hooks — sign up free to keep going.");
        setStage('entry');
        return;
      }

      const generatedHooks: string[] = Array.isArray(data.hooks) ? data.hooks : [];

      if (!generatedHooks.length) {
        setError('Something went wrong generating your hooks. Please try again.');
        setStage('entry');
        return;
      }

      setHooks(generatedHooks);

      // ✅ Save the result now, before auth — so it survives the redirect
      // to the user's email inbox and back through /auth/callback.
      try {
        localStorage.setItem(HANDOFF_KEY, JSON.stringify({ topic: trimmed, hooks: generatedHooks, ts: Date.now() }));
      } catch {}

      setStage('gate');
    } catch {
      setError('Connection failed. Please check your internet and try again.');
      setStage('entry');
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { setAuthError('Please enter your email'); return; }
    setAuthLoading(true);
    setAuthError('');

    try {
      const { error: authErr } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: { name: email.split('@')[0], plan: 'free' },
        },
      });

      if (authErr) {
        setAuthError(authErr.message || 'Something went wrong. Please try again.');
        setAuthLoading(false);
        return;
      }

      localStorage.setItem('creo_pending_plan', 'free');
      setStage('sent');
    } catch {
      setAuthError('Connection failed. Please check your internet and try again.');
    }
    setAuthLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#080812] relative overflow-hidden flex flex-col items-center justify-center px-6">
      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-purple-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-pink-600/10 rounded-full blur-[100px]" />
      </div>

      {/* Background workspace — blurs slightly once the gate appears */}
      <div className={`relative z-10 w-full max-w-xl transition-all duration-500 ${stage === 'gate' || stage === 'sent' ? 'blur-sm scale-[0.98] opacity-60 pointer-events-none' : ''}`}>
        {stage === 'entry' && (
          <div className="text-center">
            <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-8 border border-purple-500/20">
              <Sparkles size={12} className="text-purple-400" />
              <span className="text-xs font-medium text-white/60">No sign-up needed to try it</span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
              What's your <span className="text-gradient">video about?</span>
            </h1>
            <p className="text-white/40 text-base mb-10">Drop a topic or keyword. CRÉO writes you 3 scroll-stopping hooks — free.</p>

            <div className="glass rounded-2xl border border-white/10 p-2 flex items-center gap-2 mb-3">
              <input
                ref={inputRef}
                type="text"
                value={topic}
                onChange={(e) => { setTopic(e.target.value); setError(''); }}
                onKeyDown={(e) => { if (e.key === 'Enter') handleGenerate(); }}
                placeholder="Topic / Keyword — e.g. &quot;morning routine for creators&quot;"
                className="flex-1 bg-transparent text-white text-sm md:text-base placeholder:text-white/25 px-4 py-3 focus:outline-none"
                autoFocus
              />
            </div>
            {error && <p className="text-red-400 text-xs mb-4">{error}</p>}

            <button
              onClick={handleGenerate}
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-gradient-vyro text-white font-semibold text-base glow-button hover:scale-105 active:scale-95 transition-all duration-200"
            >
              <Flame size={18} />Generate Retention Hooks
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-200" />
            </button>
          </div>
        )}

        {stage === 'loading' && (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-8 relative">
              <div className="absolute inset-0 rounded-full border-2 border-purple-500/20" />
              <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-purple-500 animate-spin" />
              <Sparkles size={20} className="absolute inset-0 m-auto text-purple-400 animate-pulse" />
            </div>
            <p className="text-white/70 text-sm md:text-base font-mono">
              Creo AI is reverse-engineering viral database structures<span className="animate-pulse">...</span>
            </p>
          </div>
        )}
      </div>

      {/* THE GATE — slides up over the (blurred) background */}
      {(stage === 'gate' || stage === 'sent') && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-[#0d0d1f] border border-purple-500/20 rounded-3xl p-7 sm:p-8 relative animate-in slide-in-from-bottom-8 duration-400 shadow-2xl shadow-purple-500/10">
            {stage === 'gate' ? (
              <>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600/30 to-pink-600/30 border border-purple-500/30 flex items-center justify-center mb-5">
                  <Flame size={24} className="text-pink-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Your Viral Hooks are Ready!</h2>
                <p className="text-white/50 text-sm leading-relaxed mb-6">
                  Sign in in 1-tap to reveal your {hooks.length} hooks and unlock your free workspace — no password needed.
                </p>

                {/* Blurred teaser of what's waiting behind the gate */}
                <div className="space-y-2 mb-6 select-none">
                  {hooks.slice(0, 2).map((h, i) => (
                    <div key={i} className="rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3">
                      <p className="text-white/40 text-xs blur-[3px]">{h}</p>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleMagicLink} className="space-y-3">
                  <div className="relative">
                    <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setAuthError(''); }}
                      placeholder="you@email.com"
                      className="w-full pl-10 pr-4 py-3 rounded-xl glass border border-white/10 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-purple-500/50 focus:bg-purple-500/5 transition-all bg-transparent"
                    />
                  </div>
                  {authError && <p className="text-red-400 text-xs">{authError}</p>}
                  <button
                    type="submit"
                    disabled={authLoading || !email}
                    className="w-full py-3.5 rounded-xl bg-gradient-vyro text-white font-semibold text-sm flex items-center justify-center gap-2 glow-button hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
                  >
                    {authLoading ? (
                      <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Sending magic link...</>
                    ) : (
                      <><Sparkles size={15} />Continue with Email <ArrowRight size={15} /></>
                    )}
                  </button>
                </form>
                <p className="flex items-center gap-1.5 justify-center text-[11px] text-white/25 mt-4">
                  <Lock size={10} />Your hooks are saved — they'll be waiting the second you're in.
                </p>
              </>
            ) : (
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/20 flex items-center justify-center mx-auto mb-5">
                  <CheckCircle size={30} className="text-purple-400" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Check your inbox! 📬</h2>
                <p className="text-white/50 text-sm mb-1">We sent a magic link to</p>
                <p className="text-purple-400 font-semibold mb-4">{email}</p>
                <p className="text-white/30 text-xs">Click the link and your hooks + workspace will be waiting for you.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
