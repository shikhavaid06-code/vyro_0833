'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AppLogo from '@/components/ui/AppLogo';
import { supabase } from '@/lib/supabase';
import { getLocalePricing } from '@/lib/pricing';
import posthog from 'posthog-js';
import { Sparkles, Mail, ArrowRight, Zap, Crown, Star, Check, Rocket, KeyRound, Smartphone, RefreshCw } from 'lucide-react';

interface Stats { totalCreators: number | null; totalGenerated: number | null; }

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M+`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K+`;
  return `${n}`;
}

// ✅ Raw auth-server failures (e.g. a misconfigured SMTP provider) can come
// back as useless strings like "{}" — never show those to a person.
function friendlyAuthError(message?: string | null): string {
  const m = (message || '').trim();
  if (!m || m === '{}' || m.startsWith('{')) {
    return "We couldn't send the email right now — please try again in a minute.";
  }
  return m;
}

export default function AuthScreen() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const searchParams = useSearchParams(); const requestedPlan = searchParams.get('plan'); const [plan, setPlan] = useState(requestedPlan === 'pro' || requestedPlan === 'ultra' ? requestedPlan : 'free');
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

    // ✅ SIGN-OUT LOOP FIX (4th time's the charm — this is the actual root
    // cause). This "already logged in? go straight to the app" check used
    // to ask Supabase directly via supabase.auth.getSession(). The problem:
    // main-app-chat-interface/page.tsx's OWN "am I allowed here?" guard does
    // NOT ask Supabase at all — it checks the app's own creo_session /
    // creo_current_user flags in localStorage. That's two different sources
    // of truth for the same question. Sign-out clears creo_session /
    // creo_current_user synchronously, but supabase.auth.getSession() can
    // still resolve with a still-live session for a brief moment afterwards
    // (its own internal cache/refresh timing doesn't move in lockstep with
    // our manual cleanup). That gap is exactly what caused the flicker:
    // this page saw "Supabase says logged in" and bounced to the app, the
    // app's guard saw "creo_session is gone" and bounced right back here —
    // forever, with neither guard ever agreeing.
    // The fix: both guards now check the EXACT same thing — the app's own
    // creo_session / creo_current_user flags. Both are plain synchronous
    // localStorage reads with zero network round-trip involved, so there is
    // no longer any timing window where the two pages can disagree.
    const hasSession = localStorage.getItem('creo_session') || sessionStorage.getItem('creo_session');
    const user = localStorage.getItem('creo_current_user');
    if (hasSession && user) { router.replace(requestedPlan === 'pro' || requestedPlan === 'ultra' ? `/upgrade?plan=${requestedPlan}` : '/main-app-chat-interface'); }

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
        setError(friendlyAuthError(authError.message));
        setIsLoading(false);
        return;
      }
      if (name) localStorage.setItem('creo_pending_name', name);
      localStorage.setItem('creo_pending_plan', plan);
      posthog.capture('auth_magic_link_requested', {
        selected_plan: plan,
        has_display_name: Boolean(name.trim()),
      });
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
      if (authError) { setCodeError(friendlyAuthError(authError.message)); return; }
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
    <div className="min-h-screen bg-creo-bg flex overflow-hidden">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 relative flex-col justify-between p-12 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] bg-creo-primary/6 rounded-full blur-[130px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-creo-accent/5 rounded-full blur-[100px]" />
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `linear-gradient(rgba(168,85,247,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(168,85,247,0.5) 1px, transparent 1px)`, backgroundSize: '50px 50px' }} />
        </div>
        <div className="relative z-10 animate-slide-up" style={{ animationFillMode: 'both' }}>
          <div className="flex items-center gap-2">
            <AppLogo size={32} />
            <span className="font-display text-2xl font-semibold text-creo-text-primary">CRÉO</span>
          </div>
        </div>
        <div className="relative z-10 flex flex-col gap-8">
          <div className="animate-slide-up" style={{ animationDelay: '120ms', animationFillMode: 'both' }}>
            <div className="inline-flex items-center gap-2 creo-surface rounded-full px-3 py-1.5 mb-5 border border-creo-primary/20">
              {showCreatorCount ? (
                <>
                  <Star size={11} className="text-creo-warning fill-creo-warning" />
                  <span className="text-xs text-creo-text-secondary">Trusted by {formatCount(stats.totalCreators as number)} creators worldwide</span>
                </>
              ) : (
                <>
                  <Rocket size={11} className="text-creo-primary" />
                  <span className="text-xs text-creo-text-secondary">Newly launched — be one of our first creators</span>
                </>
              )}
            </div>
            <h1 className="font-display text-5xl xl:text-6xl font-bold leading-tight mb-4">
              <span className="text-creo-text-primary">Your ideas deserve</span><br />
              <span className="text-gradient">to go viral.</span>
            </h1>
            <p className="text-creo-text-secondary text-lg leading-relaxed max-w-md">From raw idea to scroll-stopping script in under 60 seconds.</p>
          </div>
          <div className="flex flex-wrap gap-2 animate-slide-up" style={{ animationDelay: '240ms', animationFillMode: 'both' }}>
            {[{ icon: Sparkles, text: 'AI titles & hooks' }, { icon: Zap, text: 'Full scripts instantly' }, { icon: Crown, text: 'Multi-platform' }].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-1.5 creo-surface rounded-full px-3 py-1.5 border border-creo-border">
                <Icon size={11} className="text-creo-primary" />
                <span className="text-creo-text-secondary text-xs">{text}</span>
              </div>
            ))}
          </div>
          {/* ✅ Removed fabricated testimonials & follower counts. Real quotes go here once we have them. */}
          <div className="creo-surface rounded-2xl p-5 border border-creo-border max-w-md animate-slide-up" style={{ animationDelay: '340ms', animationFillMode: 'both' }}>
            <div className="flex gap-1 mb-3">
              <Sparkles size={14} className="text-creo-primary" />
              <p className="text-creo-text-secondary text-sm font-medium">Built for creators who ship daily</p>
            </div>
            <p className="text-creo-text-secondary text-xs leading-relaxed">Titles, hooks, and full scripts — generated in seconds, not hours. No fluff, no filler prompts.</p>
          </div>
        </div>
        <div className="relative z-10"><p className="text-creo-text-muted text-xs">© 2026 CRÉO. All rights reserved.</p></div>
      </div>

      {/* Right form panel */}
      <div className="w-full lg:w-1/2 xl:w-2/5 flex flex-col justify-center items-center px-6 md:px-12 lg:px-10 xl:px-16 py-12 relative">
        <div className="absolute inset-0 bg-creo-bg" />
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-creo-primary/5 blur-[80px] pointer-events-none" />
        <div className="relative z-10 w-full max-w-md">
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <AppLogo size={28} />
            <span className="font-display text-xl font-semibold text-creo-text-primary">CRÉO</span>
          </div>

          {!sent ? (
            <div className="animate-slide-up" style={{ animationFillMode: 'both' }}>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-creo-text-primary mb-1">Get started with CRÉO</h2>
                <p className="text-creo-text-secondary text-sm">Enter your email — we'll send you a sign-in link and code. No password needed!</p>
              </div>

              <form onSubmit={handleMagicLink} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-creo-text-secondary mb-1.5">Your name</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="What should we call you?"
                    className="w-full px-4 py-3 rounded-xl creo-surface border-creo-border text-creo-text-primary text-sm placeholder:text-creo-text-muted focus:outline-none focus:border-creo-primary/50 focus:bg-creo-primary/5 transition-all bg-transparent" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-creo-text-secondary mb-1.5">Email address</label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-creo-text-muted" />
                    <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(''); }} placeholder="you@email.com"
                      className="w-full pl-10 pr-4 py-3 rounded-xl creo-surface border-creo-border text-creo-text-primary text-sm placeholder:text-creo-text-muted focus:outline-none focus:border-creo-primary/50 focus:bg-creo-primary/5 transition-all bg-transparent" />
                  </div>
                  {error && <p className="text-red-400 text-xs mt-1 animate-fade-in">{error}</p>}
                </div>

                {/* ✅ Plan selector */}
                <div>
                  <label className="block text-xs font-medium text-creo-text-secondary mb-2">Choose your plan</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'free', label: 'Free', sub: `${pricing.symbol}0`, badge: null },
                      { value: 'pro', label: 'Pro', sub: `${pricing.symbol}${pricing.pro}/mo`, badge: 'Popular' },
                      { value: 'ultra', label: 'Ultra', sub: `${pricing.symbol}${pricing.ultra}/mo`, badge: null },
                    ].map((p) => {
                      const selected = plan === p.value;
                      return (
                        <button key={p.value} type="button" onClick={() => setPlan(p.value)}
                          className={`relative cursor-pointer rounded-xl p-3 border text-center transition-all active:scale-95 ${selected ? 'border-creo-primary/50 bg-creo-primary/10' : 'border-creo-border creo-surface hover:border-creo-border-strong'}`}>
                          {p.badge && <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-gradient-to-r from-creo-primary to-creo-accent text-[8px] text-white font-semibold">{p.badge}</div>}
                          {selected && <div className="absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-full bg-creo-primary flex items-center justify-center animate-pop-in"><Check size={8} className="text-creo-text-primary" /></div>}
                          <p className={`text-xs font-semibold ${selected ? 'text-creo-primary' : 'text-creo-text-secondary'}`}>{p.label}</p>
                          <p className={`text-[10px] ${selected ? 'text-creo-primary/70' : 'text-creo-text-muted'}`}>{p.sub}</p>
                        </button>
                      );
                    })}
                  </div>
                  {/* ✅ Razorpay-at-signup: set the expectation honestly — the
                      secure checkout opens automatically right after email
                      verification (payment can't precede the account existing). */}
                  {plan !== 'free' && (
                    <p className="flex items-center gap-1.5 text-[11px] text-creo-text-muted mt-2 animate-fade-in">
                      <Zap size={10} className="text-creo-primary flex-shrink-0" />
                      Secure Razorpay checkout ({pricing.symbol}{plan === 'pro' ? pricing.pro : pricing.ultra}/mo) opens automatically right after you verify your email.
                    </p>
                  )}
                </div>

                <button type="submit" disabled={isLoading || !email}
                  className="w-full py-3.5 rounded-xl creo-btn-primary text-white font-semibold text-sm flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100">
                  {isLoading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Sending magic link...</> : <><Sparkles size={15} />Send Magic Link <ArrowRight size={15} /></>}
                </button>
              </form>

              <p className="text-center text-xs text-creo-text-muted mt-5">
                By continuing you agree to our <a href="/terms" className="text-creo-primary hover:text-creo-primary">Terms</a> and <a href="/privacy" className="text-creo-primary hover:text-creo-primary">Privacy Policy</a>
              </p>
            </div>
          ) : (
            <div className="animate-slide-up" style={{ animationFillMode: 'both' }}>
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-creo-primary/20 flex items-center justify-center mx-auto mb-5 animate-pop-in">
                  <Mail size={28} className="text-creo-primary" />
                </div>
                <h2 className="text-2xl font-bold text-creo-text-primary mb-2">Check your inbox 📬</h2>
                <p className="text-creo-text-secondary text-sm leading-relaxed">We sent a sign-in email to</p>
                <p className="text-creo-primary font-semibold">{email}</p>
              </div>

              {/* ✅ Option 1 — same device: click the link */}
              <div className="creo-surface rounded-xl border border-creo-border p-4 mb-3">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles size={13} className="text-creo-primary" />
                  <p className="text-xs font-semibold text-creo-text-secondary">On this device?</p>
                </div>
                <p className="text-xs text-creo-text-secondary leading-relaxed">Just click the magic link in the email — you'll be signed in instantly.</p>
              </div>

              {/* ✅ Option 2 — email opens on another device: enter the code HERE */}
              <div className="creo-surface rounded-xl border border-creo-primary/25 p-4 mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <Smartphone size={13} className="text-creo-accent" />
                  <p className="text-xs font-semibold text-creo-text-secondary">Reading the email on your phone?</p>
                </div>
                <p className="text-xs text-creo-text-secondary leading-relaxed mb-3">Type the code from the email here — you'll be signed in on <b className="text-creo-text-secondary">this</b> device, not your phone.</p>
                <form onSubmit={handleVerifyCode} className="flex gap-2">
                  <div className="relative flex-1">
                    <KeyRound size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-creo-text-muted" />
                    <input
                      ref={codeInputRef}
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={10}
                      value={code}
                      onChange={(e) => { setCode(e.target.value.replace(/\D/g, '')); setCodeError(''); }}
                      placeholder="123456"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl creo-surface border-creo-border text-creo-text-primary text-sm tracking-[0.3em] font-mono placeholder:text-creo-text-muted placeholder:tracking-[0.3em] focus:outline-none focus:border-creo-primary/50 focus:bg-creo-primary/5 transition-all bg-transparent"
                    />
                  </div>
                  <button type="submit" disabled={verifying || code.length < 6}
                    className="px-4 py-2.5 rounded-xl creo-btn-primary text-white text-xs font-semibold flex items-center gap-1.5 active:scale-95 transition-all disabled:opacity-40">
                    {verifying ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Verify<ArrowRight size={12} /></>}
                  </button>
                </form>
                {codeError && <p className="text-red-400 text-xs mt-2 animate-fade-in">{codeError}</p>}
              </div>

              <div className="creo-surface rounded-xl border border-creo-border p-4 text-left space-y-2">
                <p className="text-xs text-creo-text-secondary font-medium">Didn't get it?</p>
                <p className="text-xs text-creo-text-muted">• Check your spam/junk folder — the link expires in 1 hour</p>
                <div className="flex items-center gap-4 pt-1">
                  <button onClick={handleResend} disabled={resendCooldown > 0}
                    className="flex items-center gap-1 text-xs text-creo-primary hover:text-creo-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                    <RefreshCw size={11} />{resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend email'}
                  </button>
                  <button onClick={() => { setSent(false); setCode(''); setCodeError(''); }} className="text-xs text-creo-text-secondary hover:text-creo-text-secondary transition-colors">← Different email</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
