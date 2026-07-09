'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import AppLogo from '@/components/ui/AppLogo';
import { supabase } from '@/lib/supabase';
import { getLocalePricing } from '@/lib/pricing';
import { Sparkles, Mail, ArrowRight, Zap, Crown, Star, Check, Rocket, KeyRound, Smartphone, RefreshCw } from 'lucide-react';

interface Stats { totalCreators: number | null; totalGenerated: number | null; }

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M+`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K+`;
  return `${n}`;
}

export default function AuthScreen() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [plan, setPlan] = useState('free');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [pricing, setPricing] = useState({ symbol: '$', pro: '14', ultra: '39' });
  const [stats, setStats] = useState<Stats>({ totalCreators: null, totalGenerated: null });
  // ✅ Cross-device fix: 6-digit code entry so the session is created on THIS
  // device, even if the email is opened on a phone.
  const [code, setCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [codeError, setCodeError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const codeInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    setPricing(getLocalePricing());
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace('/main-app-chat-interface');
    }).catch(() => {});
    // ✅ Real stats only — no fabricated testimonials or follower counts.
    fetch('/api/stats').then((r) => r.json()).then((d) => setStats(d)).catch(() => {});
  }, []);

  // Resend cooldown ticker
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const sendLink = async () => {
    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: { name: name || email.split('@')[0], plan },
      },
    });
    return authError;
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { setError('Please enter your email'); return; }
    setIsLoading(true);
    setError('');

    try {
      const authError = await sendLink();
      if (authError) {
        setError(authError.message || 'Something went wrong. Please try again.');
        setIsLoading(false);
        return;
      }
      if (name) localStorage.setItem('creo_pending_name', name);
      localStorage.setItem('creo_pending_plan', plan);
      setSent(true);
      setResendCooldown(30);
      setTimeout(() => codeInputRef.current?.focus(), 400);
    } catch {
      setError('Connection failed. Please check your internet and try again.');
    }
    setIsLoading(false);
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setCodeError('');
    try {
      const authError = await sendLink();
      if (authError) { setCodeError(authError.message); return; }
      setResendCooldown(30);
    } catch {
      setCodeError('Could not resend — try again in a moment.');
    }
  };

  // ✅ THE CROSS-DEVICE FIX — verifying the emailed 6-digit code creates the
  // session in THIS browser. (Clicking the magic link signs in whichever
  // device opened the email; this code path signs in the device you're
  // actually sitting at.)
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = code.replace(/\D/g, '');
    if (token.length < 6 || token.length > 10) { setCodeError('Enter the code from the email (6-10 digits).'); return; }
    setVerifying(true);
    setCodeError('');
    try {
      const { data, error: otpError } = await supabase.auth.verifyOtp({ email, token, type: 'email' });
      if (otpError || !data?.session) {
        setCodeError(otpError?.message || 'Invalid or expired code — request a new one.');
        setVerifying(false);
        return;
      }
      // Session now lives on THIS device — the callback page does the
      // profile + plan-sync work exactly as if the link had been clicked here.
      router.replace('/auth/callback');
    } catch {
      setCodeError('Verification failed — please try again.');
      setVerifying(false);
    }
  };

  const showCreatorCount = stats.totalCreators !== null && stats.totalCreators >= 10;

  return (
    <div className="min-h-screen bg-[#080812] flex overflow-hidden">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 relative flex-col justify-between p-12 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] bg-purple-600/12 rounded-full blur-[130px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-pink-600/10 rounded-full blur-[100px]" />
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `linear-gradient(rgba(168,85,247,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(168,85,247,0.5) 1px, transparent 1px)`, backgroundSize: '50px 50px' }} />
        </div>
        <div className="relative z-10 animate-slide-up" style={{ animationFillMode: 'both' }}>
          <div className="flex items-center gap-2">
            <AppLogo size={32} />
            <span className="font-display text-2xl font-semibold text-white">CRÉO</span>
          </div>
        </div>
        <div className="relative z-10 flex flex-col gap-8">
          <div className="animate-slide-up" style={{ animationDelay: '120ms', animationFillMode: 'both' }}>
            <div className="inline-flex items-center gap-2 glass rounded-full px-3 py-1.5 mb-5 border border-purple-500/20">
              {showCreatorCount ? (
                <>
                  <Star size={11} className="text-yellow-400 fill-yellow-400" />
                  <span className="text-xs text-white/60">Trusted by {formatCount(stats.totalCreators as number)} creators worldwide</span>
                </>
              ) : (
                <>
                  <Rocket size={11} className="text-purple-400" />
                  <span className="text-xs text-white/60">Newly launched — be one of our first creators</span>
                </>
              )}
            </div>
            <h1 className="font-display text-5xl xl:text-6xl font-bold leading-tight mb-4">
              <span className="text-white">Your ideas deserve</span><br />
              <span className="text-gradient">to go viral.</span>
            </h1>
            <p className="text-white/50 text-lg leading-relaxed max-w-md">From raw idea to scroll-stopping script in under 60 seconds.</p>
          </div>
          <div className="flex flex-wrap gap-2 animate-slide-up" style={{ animationDelay: '240ms', animationFillMode: 'both' }}>
            {[{ icon: Sparkles, text: 'AI titles & hooks' }, { icon: Zap, text: 'Full scripts instantly' }, { icon: Crown, text: 'Multi-platform' }].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-1.5 glass rounded-full px-3 py-1.5 border border-white/8">
                <Icon size={11} className="text-purple-400" />
                <span className="text-white/60 text-xs">{text}</span>
              </div>
            ))}
          </div>
          {/* ✅ Removed fabricated testimonials & follower counts. Real quotes go here once we have them. */}
          <div className="glass rounded-2xl p-5 border border-white/8 max-w-md animate-slide-up" style={{ animationDelay: '340ms', animationFillMode: 'both' }}>
            <div className="flex gap-1 mb-3">
              <Sparkles size={14} className="text-purple-400" />
              <p className="text-white/70 text-sm font-medium">Built for creators who ship daily</p>
            </div>
            <p className="text-white/40 text-xs leading-relaxed">Titles, hooks, and full scripts — generated in seconds, not hours. No fluff, no filler prompts.</p>
          </div>
        </div>
        <div className="relative z-10"><p className="text-white/20 text-xs">© 2026 CRÉO. All rights reserved.</p></div>
      </div>

      {/* Right form panel */}
      <div className="w-full lg:w-1/2 xl:w-2/5 flex flex-col justify-center items-center px-6 md:px-12 lg:px-10 xl:px-16 py-12 relative">
        <div className="absolute inset-0 bg-[#0a0a18]" />
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-purple-900/10 blur-[80px] pointer-events-none" />
        <div className="relative z-10 w-full max-w-md">
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <AppLogo size={28} />
            <span className="font-display text-xl font-semibold text-white">CRÉO</span>
          </div>

          {!sent ? (
            <div className="animate-slide-up" style={{ animationFillMode: 'both' }}>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-1">Get started with CRÉO</h2>
                <p className="text-white/40 text-sm">Enter your email — we'll send you a sign-in link and code. No password needed!</p>
              </div>

              <form onSubmit={handleMagicLink} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-white/60 mb-1.5">Your name</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="What should we call you?"
                    className="w-full px-4 py-3 rounded-xl glass border border-white/10 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-purple-500/50 focus:bg-purple-500/5 transition-all bg-transparent" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/60 mb-1.5">Email address</label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                    <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(''); }} placeholder="you@email.com"
                      className="w-full pl-10 pr-4 py-3 rounded-xl glass border border-white/10 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-purple-500/50 focus:bg-purple-500/5 transition-all bg-transparent" />
                  </div>
                  {error && <p className="text-red-400 text-xs mt-1 animate-fade-in">{error}</p>}
                </div>

                {/* ✅ Plan selector */}
                <div>
                  <label className="block text-xs font-medium text-white/60 mb-2">Choose your plan</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'free', label: 'Free', sub: `${pricing.symbol}0`, badge: null },
                      { value: 'pro', label: 'Pro', sub: `${pricing.symbol}${pricing.pro}/mo`, badge: 'Popular' },
                      { value: 'ultra', label: 'Ultra', sub: `${pricing.symbol}${pricing.ultra}/mo`, badge: null },
                    ].map((p) => {
                      const selected = plan === p.value;
                      return (
                        <button key={p.value} type="button" onClick={() => setPlan(p.value)}
                          className={`relative cursor-pointer rounded-xl p-3 border text-center transition-all active:scale-95 ${selected ? 'border-purple-500/50 bg-purple-500/10' : 'border-white/8 glass hover:border-white/15'}`}>
                          {p.badge && <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-[8px] text-white font-semibold">{p.badge}</div>}
                          {selected && <div className="absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-full bg-purple-500 flex items-center justify-center animate-pop-in"><Check size={8} className="text-white" /></div>}
                          <p className={`text-xs font-semibold ${selected ? 'text-purple-300' : 'text-white/70'}`}>{p.label}</p>
                          <p className={`text-[10px] ${selected ? 'text-purple-400/70' : 'text-white/30'}`}>{p.sub}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button type="submit" disabled={isLoading || !email}
                  className="w-full py-3.5 rounded-xl bg-gradient-vyro text-white font-semibold text-sm flex items-center justify-center gap-2 glow-button hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100">
                  {isLoading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Sending magic link...</> : <><Sparkles size={15} />Send Magic Link <ArrowRight size={15} /></>}
                </button>
              </form>

              <p className="text-center text-xs text-white/25 mt-5">
                By continuing you agree to our <a href="/terms" className="text-purple-400 hover:text-purple-300">Terms</a> and <a href="/privacy" className="text-purple-400 hover:text-purple-300">Privacy Policy</a>
              </p>
            </div>
          ) : (
            <div className="animate-slide-up" style={{ animationFillMode: 'both' }}>
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/20 flex items-center justify-center mx-auto mb-5 animate-pop-in">
                  <Mail size={28} className="text-purple-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Check your inbox 📬</h2>
                <p className="text-white/50 text-sm leading-relaxed">We sent a sign-in email to</p>
                <p className="text-purple-400 font-semibold">{email}</p>
              </div>

              {/* ✅ Option 1 — same device: click the link */}
              <div className="glass rounded-xl border border-white/8 p-4 mb-3">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles size={13} className="text-purple-400" />
                  <p className="text-xs font-semibold text-white/70">On this device?</p>
                </div>
                <p className="text-xs text-white/40 leading-relaxed">Just click the magic link in the email — you'll be signed in instantly.</p>
              </div>

              {/* ✅ Option 2 — email opens on another device: enter the code HERE */}
              <div className="glass rounded-xl border border-purple-500/25 p-4 mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <Smartphone size={13} className="text-pink-400" />
                  <p className="text-xs font-semibold text-white/70">Reading the email on your phone?</p>
                </div>
                <p className="text-xs text-white/40 leading-relaxed mb-3">Type the code from the email here — you'll be signed in on <b className="text-white/60">this</b> device, not your phone.</p>
                <form onSubmit={handleVerifyCode} className="flex gap-2">
                  <div className="relative flex-1">
                    <KeyRound size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                    <input
                      ref={codeInputRef}
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={10}
                      value={code}
                      onChange={(e) => { setCode(e.target.value.replace(/\D/g, '')); setCodeError(''); }}
                      placeholder="123456"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl glass border border-white/10 text-white text-sm tracking-[0.3em] font-mono placeholder:text-white/15 placeholder:tracking-[0.3em] focus:outline-none focus:border-purple-500/50 focus:bg-purple-500/5 transition-all bg-transparent"
                    />
                  </div>
                  <button type="submit" disabled={verifying || code.length < 6}
                    className="px-4 py-2.5 rounded-xl bg-gradient-vyro text-white text-xs font-semibold flex items-center gap-1.5 hover:opacity-90 active:scale-95 transition-all disabled:opacity-40">
                    {verifying ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Verify<ArrowRight size={12} /></>}
                  </button>
                </form>
                {codeError && <p className="text-red-400 text-xs mt-2 animate-fade-in">{codeError}</p>}
              </div>

              <div className="glass rounded-xl border border-white/8 p-4 text-left space-y-2">
                <p className="text-xs text-white/40 font-medium">Didn't get it?</p>
                <p className="text-xs text-white/30">• Check your spam/junk folder — the link expires in 1 hour</p>
                <div className="flex items-center gap-4 pt-1">
                  <button onClick={handleResend} disabled={resendCooldown > 0}
                    className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                    <RefreshCw size={11} />{resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend email'}
                  </button>
                  <button onClick={() => { setSent(false); setCode(''); setCodeError(''); }} className="text-xs text-white/40 hover:text-white/60 transition-colors">← Different email</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
