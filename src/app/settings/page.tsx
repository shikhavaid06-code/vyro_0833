'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Crown, Zap, LogOut, ArrowLeft, Sparkles, Shield, Bell, Palette, ChevronRight, Copy, Check, Gift, Flame, XCircle, Loader2, Star, MessageCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { getLocalePricing } from '@/lib/pricing';
import AppLogo from '@/components/ui/AppLogo';
import posthog from 'posthog-js';

// ✅ What each plan includes — shown when the user taps their plan badge.
// Only lists features that are actually live in the product.
const PLAN_FEATURES: Record<string, { title: string; items: string[] }> = {
  free: {
    title: 'Your Free plan includes',
    items: [
      '3 generations per day (+1 per friend referred, up to +10)',
      'AI Title, Hook & Script generation',
      'Basic tone options',
      '10 Winning Vault slots',
      'Daily missions & streaks',
    ],
  },
  pro: {
    title: 'Your Pro plan includes',
    items: [
      '100 generations per day',
      'Brutal Reviewer — score & fix scripts',
      'Content Expansion — 1 idea → full pack',
      'Script-to-Shot Planner — filmable shot lists',
      'Content Resurrection — old content, new life',
      'Unlimited Winning Vault',
      'Nova AI Assistant + smart editing',
      'Multi-platform optimization · no watermark',
    ],
  },
  ultra: {
    title: 'Your Ultra plan includes',
    items: [
      'Unlimited generations',
      'Creator Memory & Brain — AI that writes in YOUR voice',
      'Competitor Intelligence + Link Cloner',
      'Audience Simulator — test viewer reactions first',
      'Content Risk Detector — find retention leaks first',
      'Everything in Pro (Reviewer, Expansion, Shot Plan, Resurrection)',
      'Priority AI responses · early access to new features',
    ],
  },
};

// Shape returned by GET /api/subscription — the refund preview.
interface SubQuote {
  plan: string;
  endDate: string | null;
  currency: string;
  paidAmount: number;
  refundAmount: number;
  unusedDays: number;
  totalDays: number;
  usedDays: number;
  fullRefund: boolean;
  reason: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [genCount, setGenCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [refCopied, setRefCopied] = useState(false);
  // ✅ Referral program — code, count and earned bonus come from the API.
  const [referral, setReferral] = useState<{ code: string | null; referrals: number; bonus: number; maxBonus: number } | null>(null);
  const [streak, setStreak] = useState(0);
  // ✅ Cancellation + 24-hour refund — quote fetched from /api/subscription.
  const [sub, setSub] = useState<SubQuote | null>(null);
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelResult, setCancelResult] = useState<{ ok: boolean; message: string } | null>(null);
  // ✅ Review collector — one review per user, editable anytime.
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [reviewSaving, setReviewSaving] = useState(false);
  const [reviewSaved, setReviewSaved] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [hoverStar, setHoverStar] = useState(0);
  // ✅ Plan badge → features panel toggle
  const [showPlanFeatures, setShowPlanFeatures] = useState(false);
  // ✅ Notifications — real, working toggles (persisted in this browser).
  const [notifRenewal, setNotifRenewal] = useState(true);
  const [notifEmail, setNotifEmail] = useState(false);
  const [notifEmailBusy, setNotifEmailBusy] = useState(false);

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem('creo_current_user') || '{}');
      setUser(u);
      setGenCount(parseInt(localStorage.getItem('creo_gen_count') || '0'));
      setStreak(parseInt(localStorage.getItem('creo_streak') || '0'));
      setNotifRenewal(localStorage.getItem('creo_notif_renewal') !== 'off');
      setNotifEmail(localStorage.getItem('creo_notif_email') === 'on');
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
        // Refund preview — 400s harmlessly for Free users, so ignore errors.
        const s = await fetch('/api/subscription', { headers: { Authorization: `Bearer ${session.access_token}` } });
        if (s.ok) {
          const q = await s.json();
          if (q?.plan && q.plan !== 'free') setSub(q);
        }
        // Prefill an existing review so users can edit rather than re-type.
        const rv = await fetch('/api/reviews', { headers: { Authorization: `Bearer ${session.access_token}` } });
        if (rv.ok) {
          const d = await rv.json();
          if (d?.review) {
            setReviewRating(d.review.rating || 0);
            setReviewText(d.review.review || '');
          }
        }
      } catch {}
    })();
  }, []);

  // ✅ Submit (or update) the review.
  const handleSubmitReview = async () => {
    if (reviewSaving) return;
    if (!reviewRating) { setReviewError('Tap a star rating first'); return; }
    setReviewSaving(true);
    setReviewError('');
    setReviewSaved(false);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setReviewError('Session expired — sign in again'); setReviewSaving(false); return; }
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ rating: reviewRating, review: reviewText }),
      });
      const d = await res.json();
      if (!res.ok || !d?.success) {
        setReviewError(d?.error || 'Could not save — try again');
      } else {
        setReviewSaved(true);
        setTimeout(() => setReviewSaved(false), 3000);
      }
    } catch {
      setReviewError('Network error — try again');
    }
    setReviewSaving(false);
  };

  const referralLink = referral?.code ? `${typeof window !== 'undefined' ? window.location.origin : ''}/?ref=${referral.code}` : '';
  const handleCopyReferral = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink).catch(() => {});
    setRefCopied(true);
    setTimeout(() => setRefCopied(false), 2000);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    posthog.reset();
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

  // ✅ Notification toggles — both do something real.
  const toggleRenewalNotif = () => {
    const next = !notifRenewal;
    setNotifRenewal(next);
    try { localStorage.setItem('creo_notif_renewal', next ? 'on' : 'off'); } catch {}
  };

  const toggleEmailNotif = async () => {
    if (notifEmailBusy) return;
    const next = !notifEmail;
    // Turning ON subscribes this account's email to product updates.
    if (next && user?.email) {
      setNotifEmailBusy(true);
      try {
        await fetch('/api/newsletter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: user.email }),
        });
      } catch {}
      setNotifEmailBusy(false);
    }
    setNotifEmail(next);
    try { localStorage.setItem('creo_notif_email', next ? 'on' : 'off'); } catch {}
  };

  // ✅ The actual cancel action — refund first (server-side), then immediate
  // downgrade. On success we sync localStorage so the whole app agrees.
  const handleConfirmCancel = async () => {
    if (cancelling) return;
    setCancelling(true);
    setCancelResult(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setCancelResult({ ok: false, message: 'Your session expired — please sign in again.' });
        setCancelling(false);
        return;
      }
      const res = await fetch('/api/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ action: 'cancel' }),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        setCancelResult({ ok: false, message: data?.error || 'Cancellation failed — your plan is unchanged.' });
      } else {
        setCancelResult({ ok: true, message: data.message });
        setSub(null);
        setConfirmingCancel(false);
        try {
          const u = JSON.parse(localStorage.getItem('creo_current_user') || '{}');
          localStorage.setItem('creo_current_user', JSON.stringify({ ...u, plan: 'free' }));
          setUser({ ...u, plan: 'free' });
        } catch {}
      }
    } catch {
      setCancelResult({ ok: false, message: 'Network error — your plan is unchanged. Please try again.' });
    }
    setCancelling(false);
  };

  const formatRefund = (q: SubQuote) =>
    `${q.currency === 'INR' ? '₹' : ''}${q.refundAmount.toLocaleString()}${q.currency === 'INR' ? '' : ` ${q.currency}`}`;

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
            {/* ✅ Tap the plan badge to see exactly what this plan includes */}
            <button onClick={() => setShowPlanFeatures((v) => !v)}
              title="See what your plan includes"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full glass border transition-all active:scale-95 ${showPlanFeatures ? 'border-purple-500/40 bg-purple-500/10' : 'border-white/8 hover:border-white/20'} ${planColors[plan]}`}>
              {planIcons[plan]}
              <span className="text-xs font-semibold capitalize">{plan}</span>
              <ChevronRight size={11} className={`text-white/30 transition-transform duration-200 ${showPlanFeatures ? 'rotate-90' : ''}`} />
            </button>
          </div>

          {/* ✅ Plan features panel — opens from the badge */}
          {showPlanFeatures && (
            <div className="mt-4 pt-4 border-t border-white/5 animate-slide-up">
              <p className="text-xs font-semibold text-white/70 mb-2.5">{(PLAN_FEATURES[plan] || PLAN_FEATURES.free).title}</p>
              <div className="space-y-1.5">
                {(PLAN_FEATURES[plan] || PLAN_FEATURES.free).items.map((item) => (
                  <div key={item} className="flex items-start gap-2">
                    <Check size={12} className={`mt-0.5 flex-shrink-0 ${plan === 'ultra' ? 'text-amber-400' : plan === 'pro' ? 'text-purple-400' : 'text-white/40'}`} />
                    <span className="text-xs text-white/55 leading-relaxed">{item}</span>
                  </div>
                ))}
              </div>
              {plan !== 'ultra' && (
                <button onClick={() => router.push(plan === 'pro' ? '/upgrade?plan=ultra' : '/upgrade')}
                  className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors">
                  <Crown size={12} /> See what {plan === 'pro' ? 'Ultra' : 'Pro & Ultra'} add{plan === 'pro' ? 's' : ''} <ChevronRight size={11} />
                </button>
              )}
            </div>
          )}

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

        {/* ✅ Cancellation result banner — shown after a cancel attempt */}
        {cancelResult && (
          <div className={`glass rounded-2xl p-4 mb-4 border ${cancelResult.ok ? 'border-emerald-500/25' : 'border-red-500/25'}`}>
            <p className={`text-sm ${cancelResult.ok ? 'text-emerald-300' : 'text-red-300'}`}>{cancelResult.message}</p>
          </div>
        )}

        {/* ✅ Subscription management card — paid plans only */}
        {sub && plan !== 'free' && (
          <div className="glass rounded-2xl border border-white/8 p-5 mb-4">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${plan === 'ultra' ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-purple-500/10 border border-purple-500/20'}`}>
                  {plan === 'ultra' ? <Crown size={14} className="text-amber-400" /> : <Zap size={14} className="text-purple-400" />}
                </div>
                <div>
                  <p className="text-sm text-white/80 font-semibold capitalize">{sub.plan} plan — active</p>
                  <p className="text-[11px] text-white/35">
                    {sub.endDate ? `Access until ${new Date(sub.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}` : 'Active period'}
                    {' · '}does not auto-renew
                  </p>
                </div>
              </div>
            </div>

            {/* ✅ Pro → Ultra upgrade path — Pro users get a one-tap route to the
                next tier right where they manage their plan. */}
            {plan === 'pro' && !confirmingCancel && (
              <button onClick={() => router.push('/upgrade?plan=ultra')}
                className="w-full mt-3 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-pink-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 hover:opacity-90 active:scale-[0.98] transition-all">
                <Crown size={13} /> Upgrade to Ultra — unlock Creator Brain & Competitor Intelligence
              </button>
            )}

            {sub.refundAmount <= 0 ? (
              <p className="mt-3 pt-3 border-t border-white/5 text-[11px] text-white/40 leading-relaxed">{sub.reason}</p>
            ) : !confirmingCancel ? (
              <button onClick={() => setConfirmingCancel(true)}
                className="w-full mt-3 py-2.5 rounded-xl border border-red-500/20 text-red-400/80 hover:bg-red-500/10 hover:text-red-400 transition-all text-xs font-medium flex items-center justify-center gap-1.5">
                <XCircle size={13} /> Cancel plan
              </button>
            ) : (
              <div className="mt-3 pt-3 border-t border-white/5">
                <p className="text-xs text-white/60 leading-relaxed mb-1">
                  <>You're within the <b className="text-white/80">24-hour refund window</b>. Cancelling refunds the full <b className="text-emerald-400">{formatRefund(sub)}</b> to your original payment method in 5–7 business days.</>
                </p>
                <p className="text-[11px] text-white/30 mb-3">Your plan ends immediately — this can't be undone.</p>
                <div className="flex gap-2">
                  <button onClick={() => setConfirmingCancel(false)} disabled={cancelling}
                    className="flex-1 py-2.5 rounded-xl glass border border-white/10 text-white/60 hover:text-white text-xs font-medium transition-all">
                    Keep my plan
                  </button>
                  <button onClick={handleConfirmCancel} disabled={cancelling}
                    className="flex-1 py-2.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 hover:bg-red-500/25 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 disabled:opacity-60">
                    {cancelling ? <><Loader2 size={13} className="animate-spin" /> Cancelling…</> : sub.refundAmount > 0 ? `Cancel & refund ${formatRefund(sub)}` : 'Confirm cancel'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

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
              <a href={`https://wa.me/?text=${encodeURIComponent(`Been using CRÉO to script my shorts — one idea → titles, hooks, full scripts. Try it, I get a bonus generation when you do: ${referralLink}`)}`}
                target="_blank" rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl bg-[#25D366]/15 border border-[#25D366]/30 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 hover:bg-[#25D366]/25 active:scale-95 transition-all">
                <MessageCircle size={12} /> Share
              </a>
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

        {/* ✅ Rate CRÉO — the review collector. Reviews land in Supabase
            (reviews table) for the founder to read; nothing is auto-published. */}
        <div className="glass rounded-2xl border border-white/8 p-5 mb-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
              <Star size={14} className="text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-white/80 font-semibold">Rate CRÉO</p>
              <p className="text-[11px] text-white/35">Your feedback goes straight to the founder — it shapes what gets built next.</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-3 mb-3">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button"
                onClick={() => { setReviewRating(n); setReviewError(''); }}
                onMouseEnter={() => setHoverStar(n)}
                onMouseLeave={() => setHoverStar(0)}
                aria-label={`${n} star${n !== 1 ? 's' : ''}`}
                className="p-0.5 transition-transform hover:scale-110 active:scale-95">
                <Star size={22} className={`transition-colors ${(hoverStar || reviewRating) >= n ? 'text-yellow-400 fill-yellow-400' : 'text-white/20'}`} />
              </button>
            ))}
            {reviewRating > 0 && <span className="text-xs text-white/40 ml-1">{['', 'Ouch — tell us why', 'Needs work', 'Decent', 'Great', 'Love it!'][reviewRating]}</span>}
          </div>
          <textarea
            value={reviewText}
            onChange={(e) => { setReviewText(e.target.value); setReviewError(''); }}
            placeholder="What's working? What's missing? Brutal honesty welcome — that's kind of our thing."
            rows={3}
            maxLength={2000}
            className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs leading-relaxed placeholder:text-white/20 focus:outline-none focus:border-yellow-500/40 transition-all resize-none"
          />
          {reviewError && <p className="text-red-400 text-xs mt-1.5">{reviewError}</p>}
          <button onClick={handleSubmitReview} disabled={reviewSaving}
            className="w-full mt-2.5 py-2.5 rounded-xl bg-gradient-to-r from-yellow-500/90 to-amber-500/90 text-black text-xs font-semibold flex items-center justify-center gap-1.5 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60">
            {reviewSaving ? <><Loader2 size={13} className="animate-spin" /> Saving…</>
              : reviewSaved ? <><Check size={13} /> Saved — thank you!</>
              : <><Star size={13} /> Submit review</>}
          </button>
        </div>

        {/* ✅ Notifications — working toggles, no more "coming soon" */}
        <div className="glass rounded-2xl border border-white/8 p-5 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
              <Bell size={14} className="text-sky-400" />
            </div>
            <p className="text-sm text-white/80 font-semibold">Notifications</p>
          </div>
          {[
            { label: 'Plan renewal reminders', sub: 'A banner in your workspace during the last 5 days of a paid plan', on: notifRenewal, toggle: toggleRenewalNotif, busy: false },
            { label: 'Product updates by email', sub: `New features & creator tips to ${user?.email || 'your email'} — no spam, ever`, on: notifEmail, toggle: toggleEmailNotif, busy: notifEmailBusy },
          ].map((row) => (
            <div key={row.label} className="flex items-center justify-between gap-3 py-2.5 border-t border-white/5 first:border-t-0">
              <div className="min-w-0">
                <p className="text-xs text-white/75 font-medium">{row.label}</p>
                <p className="text-[11px] text-white/35 truncate">{row.sub}</p>
              </div>
              <button onClick={row.toggle} disabled={row.busy} aria-label={`Toggle ${row.label}`}
                className={`relative w-10 h-5.5 h-6 rounded-full transition-colors flex-shrink-0 ${row.on ? 'bg-gradient-to-r from-purple-600 to-pink-600' : 'bg-white/10'} disabled:opacity-60`}>
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${row.on ? 'left-[18px]' : 'left-0.5'}`} />
              </button>
            </div>
          ))}
        </div>

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
