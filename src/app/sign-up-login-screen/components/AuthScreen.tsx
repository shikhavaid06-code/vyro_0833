'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppLogo from '@/components/ui/AppLogo';
import { supabase } from '@/lib/supabase';
import { Sparkles, Mail, ArrowRight, Zap, Crown, Star, CheckCircle } from 'lucide-react';

function getLocalePricing() {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz.includes('Asia/Kolkata') || tz.includes('Asia/Calcutta')) return { symbol: '₹', pro: '999', ultra: '2,999' };
    if (tz.includes('Asia/Tokyo') || tz.includes('Asia/Osaka')) return { symbol: '¥', pro: '1,480', ultra: '4,480' };
    if (tz.includes('Asia/Shanghai') || tz.includes('Asia/Hong_Kong')) return { symbol: '¥', pro: '98', ultra: '298' };
    if (tz.includes('Europe')) return { symbol: '€', pro: '12', ultra: '35' };
    if (tz.includes('Asia/Dubai') || tz.includes('Asia/Riyadh')) return { symbol: 'AED', pro: '49', ultra: '149' };
    if (tz.includes('Asia/Singapore') || tz.includes('Asia/Kuala_Lumpur')) return { symbol: 'S$', pro: '18', ultra: '52' };
  } catch {}
  return { symbol: '$', pro: '14', ultra: '39' };
}

const testimonials = [
  { name: 'Priya K.', handle: '@priyacreates', followers: '280k', text: 'CRÉO is the only reason I post 5x a week without burning out.', initial: 'P', color: 'from-purple-500 to-pink-600' },
  { name: 'Aryan S.', handle: '@aryantech', followers: '95k', text: 'Went from 0 to 95k subscribers using CRÉO scripts. Game changer.', initial: 'A', color: 'from-blue-500 to-violet-600' },
  { name: 'Nisha R.', handle: '@nishalifestyle', followers: '180k', text: 'I save 4 hours every week. The hooks it generates are insane.', initial: 'N', color: 'from-pink-500 to-rose-600' },
];

export default function AuthScreen() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [pricing, setPricing] = useState({ symbol: '$', pro: '14', ultra: '39' });
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const router = useRouter();

  useEffect(() => {
    setPricing(getLocalePricing());
    // Check if already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace('/main-app-chat-interface');
    });
    const t = setInterval(() => setTestimonialIdx((i) => (i + 1) % testimonials.length), 4000);
    return () => clearInterval(t);
  }, []);

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { setError('Please enter your email'); return; }
    setIsLoading(true);
    setError('');

    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: { name: name || email.split('@')[0] },
      },
    });

    if (authError) {
      setError(authError.message);
      setIsLoading(false);
      return;
    }

    // Save name for later use in profile creation
    if (name) localStorage.setItem('creo_pending_name', name);
    setSent(true);
    setIsLoading(false);
  };

  const t = testimonials[testimonialIdx];

  return (
    <div className="min-h-screen bg-[#080812] flex overflow-hidden">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 relative flex-col justify-between p-12 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] bg-purple-600/12 rounded-full blur-[130px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-pink-600/10 rounded-full blur-[100px]" />
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `linear-gradient(rgba(168,85,247,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(168,85,247,0.5) 1px, transparent 1px)`, backgroundSize: '50px 50px' }} />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-2">
            <AppLogo size={32} />
            <span className="font-display text-2xl font-semibold text-white">CRÉO</span>
          </div>
        </div>

        <div className="relative z-10 flex flex-col gap-8">
          <div>
            <div className="inline-flex items-center gap-2 glass rounded-full px-3 py-1.5 mb-5 border border-purple-500/20">
              <Star size={11} className="text-yellow-400 fill-yellow-400" />
              <span className="text-xs text-white/60">Trusted by 47,000+ creators worldwide</span>
            </div>
            <h1 className="font-display text-5xl xl:text-6xl font-bold leading-tight mb-4">
              <span className="text-white">Your ideas deserve</span><br />
              <span className="text-gradient">to go viral.</span>
            </h1>
            <p className="text-white/50 text-lg leading-relaxed max-w-md">From raw idea to scroll-stopping script in under 60 seconds.</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { icon: Sparkles, text: 'AI titles & hooks' },
              { icon: Zap, text: 'Full scripts instantly' },
              { icon: Crown, text: 'Multi-platform' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-1.5 glass rounded-full px-3 py-1.5 border border-white/8">
                <Icon size={11} className="text-purple-400" />
                <span className="text-white/60 text-xs">{text}</span>
              </div>
            ))}
          </div>

          {/* Rotating testimonial */}
          <div className="glass rounded-2xl p-5 border border-white/8 max-w-md transition-all duration-500">
            <div className="flex gap-1 mb-3">
              {[...Array(5)].map((_, i) => <Star key={i} size={12} className="text-yellow-400 fill-yellow-400" />)}
            </div>
            <p className="text-white/70 text-sm italic leading-relaxed mb-3">&ldquo;{t.text}&rdquo;</p>
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center`}>
                <span className="text-xs font-bold text-white">{t.initial}</span>
              </div>
              <div>
                <p className="text-white text-xs font-semibold">{t.name}</p>
                <p className="text-white/40 text-[11px]">{t.handle} · {t.followers} followers</p>
              </div>
            </div>
          </div>

          <div className="flex gap-6">
            {[['47K+', 'Creators'], ['2.1M+', 'Scripts made'], ['4.9★', 'Rating']].map(([val, label]) => (
              <div key={label}>
                <p className="text-white font-bold text-xl">{val}</p>
                <p className="text-white/40 text-xs">{label}</p>
              </div>
            ))}
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
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-1">Get started with CRÉO</h2>
                <p className="text-white/40 text-sm">Enter your email — we'll send you a magic link. No password needed!</p>
              </div>

              <form onSubmit={handleMagicLink} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-white/60 mb-1.5">Your name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="What should we call you?"
                    className="w-full px-4 py-3 rounded-xl glass border border-white/10 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-purple-500/50 focus:bg-purple-500/5 transition-all bg-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/60 mb-1.5">Email address</label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(''); }}
                      placeholder="you@email.com"
                      className="w-full pl-10 pr-4 py-3 rounded-xl glass border border-white/10 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-purple-500/50 focus:bg-purple-500/5 transition-all bg-transparent"
                    />
                  </div>
                  {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
                </div>

                <button type="submit" disabled={isLoading || !email}
                  className="w-full py-3.5 rounded-xl bg-gradient-vyro text-white font-semibold text-sm flex items-center justify-center gap-2 glow-button hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100">
                  {isLoading
                    ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Sending magic link...</>
                    : <><Sparkles size={15} />Send Magic Link <ArrowRight size={15} /></>
                  }
                </button>
              </form>

              {/* Plan preview */}
              <div className="mt-6 p-4 glass rounded-xl border border-white/8">
                <p className="text-xs text-white/40 mb-3 text-center">Choose your plan after signing in</p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Free', sub: `${pricing.symbol}0`, color: 'text-white/60' },
                    { label: 'Pro', sub: `${pricing.symbol}${pricing.pro}/mo`, color: 'text-purple-400', popular: true },
                    { label: 'Ultra', sub: `${pricing.symbol}${pricing.ultra}/mo`, color: 'text-amber-400' },
                  ].map((plan) => (
                    <div key={plan.label} className={`relative text-center p-2.5 rounded-lg glass border ${plan.popular ? 'border-purple-500/30' : 'border-white/8'}`}>
                      {plan.popular && <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-[8px] text-white font-semibold">Popular</div>}
                      <p className={`text-xs font-semibold ${plan.color}`}>{plan.label}</p>
                      <p className="text-[10px] text-white/30">{plan.sub}</p>
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-center text-xs text-white/25 mt-4">
                By continuing you agree to our{' '}
                <a href="/terms" className="text-purple-400 hover:text-purple-300">Terms</a>
                {' '}and{' '}
                <a href="/privacy" className="text-purple-400 hover:text-purple-300">Privacy Policy</a>
              </p>
            </>
          ) : (
            /* Success state */
            <div className="text-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/20 flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={36} className="text-purple-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">Check your inbox! 📬</h2>
              <p className="text-white/50 text-sm leading-relaxed mb-2">
                We sent a magic link to
              </p>
              <p className="text-purple-400 font-semibold mb-6">{email}</p>
              <p className="text-white/30 text-xs mb-8">Click the link in your email to sign in. It expires in 1 hour.</p>

              <div className="glass rounded-xl border border-white/8 p-4 text-left space-y-2.5">
                <p className="text-xs text-white/40 font-medium">Didn't get it?</p>
                <p className="text-xs text-white/30">• Check your spam/junk folder</p>
                <p className="text-xs text-white/30">• Make sure you typed the right email</p>
                <button onClick={() => setSent(false)} className="text-xs text-purple-400 hover:text-purple-300 transition-colors">
                  ← Try a different email
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
