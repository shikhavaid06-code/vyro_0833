'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Crown, Zap, LogOut, ArrowLeft, Sparkles, Shield, Bell, Palette, ChevronRight, Copy, Check, Gift, Flame } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { getLocalePricing } from '@/lib/pricing';
import AppLogo from '@/components/ui/AppLogo';

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [genCount, setGenCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [refCopied, setRefCopied] = useState(false);
  // ✅ Referral program — code, count and earned bonus come from the API.
  const [referral, setReferral] = useState<{ code: string | null; referrals: number; bonus: number; maxBonus: number } | null>(null);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem('creo_current_user') || '{}');
      setUser(u);
      setGenCount(parseInt(localStorage.getItem('creo_gen_count') || '0'));
      setStreak(parseInt(localStorage.getItem('creo_streak') || '0'));
    } catch {}
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        // ✅ Email/name fallback from the real session — fixes "No email" when
        // localStorage is missing or stale.
        if (session.user?.email) {
          setUser((u: any) => ({
            ...(u || {}),
            email: u?.email || session.user.email,
            name: u?.name || session.user.email?.split('@')[0],
          }));
        }
        const r = await fetch('/api/referral', { headers: { Authorization: `Bearer ${session.access_token}` } });
        const d = await r.json();
        if (d?.code) setReferral(d);
      } catch {}
    })();
  }, []);

  const referralLink = referral?.code ? `${typeof window !== 'undefined' ? window.location.origin : ''}/?ref=${referral.code}` : '';
  const handleCopyReferral = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink).catch(() => {});
    setRefCopied(true);
    setTimeout(() => setRefCopied(false), 2000);
  };

  const handleSignOut = () => {
    localStorage.removeItem('creo_current_user');
    localStorage.removeItem('creo_session');
    sessionStorage.removeItem('creo_session');
    router.push('/sign-up-login-screen');
  };

  const handleCopyEmail = () => {
    if (user?.email) {
      navigator.clipboard.writeText(user.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const planColors: Record<string, string> = {
    free: 'text-white/60',
    pro: 'text-purple-400',
    ultra: 'text-amber-400',
  };

  const planIcons: Record<string, React.ReactNode> = {
    free: <Sparkles size={14} className="text-white/40" />,
    pro: <Zap size={14} className="text-purple-400" />,
    ultra: <Crown size={14} className="text-amber-400" />,
  };

  const plan = user?.plan || 'free';

  return (
    <div className="min-h-screen bg-[#080812] px-4 py-8">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-purple-600/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => router.push('/main-app-chat-interface')}
            className="w-9 h-9 rounded-xl glass border border-white/8 flex items-center justify-center text-white/40 hover:text-white transition-all">
            <ArrowLeft size={16} />
          </button>
          <div className="flex items-center gap-2">
            <AppLogo size={22} />
            <span className="font-display text-sm font-semibold text-white">Settings</span>
          </div>
        </div>

        {/* Profile card */}
        <div className="glass rounded-2xl border border-white/8 p-5 mb-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0">
              <span className="text-xl font-bold text-white">{user?.name?.[0]?.toUpperCase() || 'U'}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-base">{user?.name || 'User'}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-white/40 text-sm truncate">{user?.email || 'No email'}</p>
                <button onClick={handleCopyEmail} className="text-white/30 hover:text-white/60 transition-all flex-shrink-0">
                  {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                </button>
              </div>
            </div>
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full glass border border-white/8 ${planColors[plan]}`}>
              {planIcons[plan]}
              <span className="text-xs font-semibold capitalize">{plan}</span>
            </div>
          </div>

          {/* Usage bar */}
          {plan === 'free' && (
            <div className="mt-4 pt-4 border-t border-white/5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-white/40">Free generations used today</span>
                <span className="text-xs text-purple-400">{genCount} / 3</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-full transition-all" style={{ width: `${Math.min((genCount / 3) * 100, 100)}%` }} />
              </div>
              <button onClick={() => router.push('/upgrade')}
                className="w-full mt-3 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-semibold hover:opacity-90 active:scale-[0.98] transition-all">
                Upgrade to Pro — {getLocalePricing().symbol}{getLocalePricing().pro}/mo
              </button>
            </div>
          )}
        </div>

        {/* ✅ Refer & Earn card */}
        {referral?.code && (
          <div className="glass rounded-2xl border border-emerald-500/20 p-5 mb-4">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <Gift size={14} className="text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm text-white/80 font-semibold">Refer & Earn</p>
                  <p className="text-[11px] text-white/35">+1 permanent daily generation per friend (max +{referral.maxBonus})</p>
                </div>
              </div>
              {streak > 0 && (
                <div className="flex items-center gap-1 text-[11px] text-orange-400"><Flame size={11} className="fill-orange-400/40" />{streak}d</div>
              )}
            </div>
            <div className="flex gap-2 mt-3">
              <div className="flex-1 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white/50 font-mono truncate">{referralLink}</div>
              <button onClick={handleCopyReferral}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-semibold flex items-center gap-1.5 hover:opacity-90 active:scale-95 transition-all">
                {refCopied ? <Check size={12} className="animate-pop-in" /> : <Copy size={12} />}{refCopied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div className="flex items-center gap-4 mt-3 text-[11px] text-white/40">
              <span><b className="text-emerald-400">{referral.referrals}</b> friend{referral.referrals !== 1 ? 's' : ''} joined</span>
              <span><b className="text-emerald-400">+{referral.bonus}</b> bonus generations/day earned</span>
            </div>
          </div>
        )}

        {/* Settings sections */}
        {[
          {
            title: 'Account',
            items: [
              { icon: Crown, label: 'Manage subscription', sub: 'Upgrade, change or renew your plan', action: () => router.push('/upgrade') },
              { icon: Sparkles, label: 'Back to workspace', sub: 'Creator Brain, Vault & Intel live here', action: () => router.push('/main-app-chat-interface') },
            ]
          },
          {
            title: 'Preferences',
            items: [
              { icon: Palette, label: 'Appearance', sub: 'Dark mode — always on, the CRÉO way', action: null },
              { icon: Bell, label: 'Notifications', sub: 'Coming soon', action: null },
            ]
          },
          {
            title: 'Legal',
            items: [
              { icon: Shield, label: 'Terms of Service', sub: 'Read our terms', action: () => router.push('/terms') },
              { icon: Shield, label: 'Privacy Policy', sub: 'How we use your data', action: () => router.push('/privacy') },
            ]
          }
        ].map((section) => (
          <div key={section.title} className="glass rounded-2xl border border-white/8 mb-4 overflow-hidden">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-white/25 px-5 pt-4 pb-2">{section.title}</p>
            {section.items.map((item, i) => {
              const rowInner = (
                <>
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                    <item.icon size={14} className="text-white/40" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-white/80 font-medium">{item.label}</p>
                    <p className="text-xs text-white/30">{item.sub}</p>
                  </div>
                  {item.action && <ChevronRight size={14} className="text-white/20" />}
                </>
              );
              const rowClass = `w-full flex items-center gap-3 px-5 py-3.5 text-left ${i < section.items.length - 1 ? 'border-b border-white/5' : ''}`;
              return item.action ? (
                <button key={item.label} onClick={item.action} className={`${rowClass} hover:bg-white/5 transition-all`}>{rowInner}</button>
              ) : (
                <div key={item.label} className={`${rowClass} opacity-70 cursor-default`}>{rowInner}</div>
              );
            })}
          </div>
        ))}

        {/* Sign out */}
        <button onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl glass border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-all text-sm font-medium">
          <LogOut size={15} />
          Sign out
        </button>

        <p className="text-center text-[10px] text-white/15 mt-6">CRÉO v1.0 · Made with ❤️</p>
      </div>
    </div>
  );
}
