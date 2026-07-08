'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Crown, Zap, Sparkles, ArrowLeft, ShieldCheck, RefreshCw, Lock } from 'lucide-react';
import { toast } from 'sonner';
import AppLogo from '@/components/ui/AppLogo';
import { supabase } from '@/lib/supabase';
import { getLocalePricing } from '@/lib/pricing';

declare global {
  interface Window { Razorpay: any; }
}

const RAZORPAY_SCRIPT_SRC = 'https://checkout.razorpay.com/v1/checkout.js';

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = RAZORPAY_SCRIPT_SRC;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

const plans = [
  {
    id: 'free', name: 'Free', icon: null,
    features: ['3 generations per day', 'AI Title Generator', 'Hook Generator', 'Short + medium scripts', 'Basic tone options', '10 Vault items'],
  },
  {
    id: 'pro', name: 'Pro', icon: Zap, highlight: true,
    features: ['100 generations per day', 'Unlimited Vault', 'AI Assistant unlocked', 'Smart editing (rewrite, shorten)', 'Multi-platform optimization', 'No watermark', 'Priority support'],
  },
  {
    id: 'ultra', name: 'Ultra', icon: Crown,
    features: ['Unlimited generations', 'Everything in Pro', 'Priority AI responses', 'Advanced tone & script control', 'Early access to new features', 'Custom voice profile'],
  },
];

export default function UpgradePage() {
  const router = useRouter();
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');
  const [currentPlan, setCurrentPlan] = useState('free');
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [locale] = useState(getLocalePricing());

  useEffect(() => {
    // ✅ userId/email come from the actual Supabase session, not localStorage —
    // that's the value that gets charged, so it has to be the real thing.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        router.replace('/sign-up-login-screen');
        return;
      }
      setUserId(session.user.id);
      setUserEmail(session.user.email || '');
      try {
        const u = JSON.parse(localStorage.getItem('creo_current_user') || '{}');
        setCurrentPlan(u.plan || 'free');
        setUserName(u.name || '');
      } catch {}
    });
  }, []);

  const priceFor = (planId: string) => {
    if (planId === 'free') return 0;
    const monthly = planId === 'pro' ? locale.proRaw : locale.ultraRaw;
    return billing === 'yearly' ? Math.round(monthly * 12 * 0.75) : monthly;
  };

  const handleUpgrade = async (planId: 'pro' | 'ultra') => {
    if (!userId) return;
    if (planId === currentPlan) {
      toast.info("You're already on this plan.");
      return;
    }

    setLoadingPlan(planId);
    try {
      const scriptOk = await loadRazorpayScript();
      if (!scriptOk) {
        toast.error('Could not load payment gateway. Check your connection and try again.');
        setLoadingPlan(null);
        return;
      }

      const orderRes = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId, billing, userId, region: locale.region }),
      });
      const order = await orderRes.json();
      if (!orderRes.ok) throw new Error(order.error || 'Could not start checkout');

      // ✅ Be upfront BEFORE the payment popup opens, not after — if their
      // region's currency isn't approved on our payment processor yet, they
      // should know they're about to be charged the INR amount, not the
      // price shown on this page.
      if (order.fallbackUsed) {
        toast.info(`Heads up — international billing for your region isn't live yet, so you'll be charged ₹${order.chargedAmount.toLocaleString()} (INR) for this instead.`, { duration: 6000 });
      }

      const rzp = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.orderId,
        name: 'CRÉO',
        description: `${planId === 'pro' ? 'Pro' : 'Ultra'} plan — ${billing}`,
        prefill: { name: userName, email: userEmail },
        theme: { color: '#a855f7' },
        handler: async (response: any) => {
          try {
            const verifyRes = await fetch('/api/razorpay/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                userId, plan: planId, billing,
              }),
            });
            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) throw new Error(verifyData.error || 'Payment verification failed');

            // ✅ Sync the new plan into localStorage right away — this is what
            // actually unlocks Pro/Ultra features in the workspace immediately.
            try {
              const u = JSON.parse(localStorage.getItem('creo_current_user') || '{}');
              localStorage.setItem('creo_current_user', JSON.stringify({ ...u, plan: planId }));
            } catch {}

            toast.success(`Welcome to ${planId === 'pro' ? 'Pro' : 'Ultra'}! 🎉`);
            setCurrentPlan(planId);
            router.push('/main-app-chat-interface');
          } catch (err: any) {
            toast.error(err.message || 'Payment succeeded but activation failed — contact support@creo.ai');
          }
        },
        modal: { ondismiss: () => setLoadingPlan(null) },
      });

      rzp.on('payment.failed', (resp: any) => {
        toast.error(resp.error?.description || 'Payment failed. Please try again.');
        setLoadingPlan(null);
      });

      rzp.open();
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong starting checkout.');
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#080812] px-4 py-10">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-purple-600/8 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-white/40 hover:text-white text-sm mb-8 transition-colors">
          <ArrowLeft size={15} /> Back
        </button>
        <div className="flex items-center gap-2 mb-8">
          <AppLogo size={24} />
          <span className="font-display text-lg font-semibold text-white">CRÉO</span>
        </div>

        <div className="text-center mb-10">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-3">Upgrade your workflow</h1>
          <p className="text-white/40 text-base mb-6">Cancel anytime. No hidden fees. Prices shown in {locale.currency}.</p>
          <div className="inline-flex items-center glass rounded-full p-1 gap-1">
            {(['monthly', 'yearly'] as const).map((b) => (
              <button key={b} onClick={() => setBilling(b)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${billing === b ? 'bg-gradient-vyro text-white shadow-lg' : 'text-white/50 hover:text-white/70'}`}>
                {b === 'monthly' ? 'Monthly' : 'Yearly'}
                {b === 'yearly' && <span className="ml-2 text-[10px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded-full">Save 25%</span>}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {plans.map((plan) => {
            const PlanIcon = plan.icon;
            const price = priceFor(plan.id);
            const isCurrent = currentPlan === plan.id;
            const isLoading = loadingPlan === plan.id;

            return (
              <div key={plan.id} className={`relative rounded-2xl p-7 flex flex-col border transition-all duration-300 ${plan.highlight ? 'glass-strong border-purple-500/30 shadow-lg shadow-purple-500/10' : 'glass border-white/8'}`}>
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-vyro text-white text-xs font-semibold shadow-lg shadow-purple-500/30">Most Popular</div>
                )}
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-white text-xl font-bold">{plan.name}</h3>
                  {PlanIcon && (
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${plan.id === 'ultra' ? 'bg-amber-500/10' : 'bg-purple-500/10'}`}>
                      <PlanIcon size={18} className={plan.id === 'ultra' ? 'text-amber-400' : 'text-purple-400'} />
                    </div>
                  )}
                </div>

                <div className="flex items-baseline gap-1 mb-6">
                  <span className="font-display text-4xl font-bold text-white tabular-nums">{plan.id === 'free' ? '₹0' : `${locale.symbol}${price.toLocaleString()}`}</span>
                  <span className="text-white/40 text-sm">{plan.id === 'free' ? '/ forever' : billing === 'monthly' ? '/ mo' : '/ yr'}</span>
                </div>

                <button
                  onClick={() => plan.id !== 'free' && handleUpgrade(plan.id as 'pro' | 'ultra')}
                  disabled={isCurrent || isLoading || plan.id === 'free'}
                  className={`w-full py-3 rounded-xl text-sm font-semibold text-center mb-7 flex items-center justify-center gap-2 transition-all duration-200 active:scale-95 disabled:cursor-not-allowed ${
                    isCurrent ? 'bg-white/5 text-white/40 border border-white/10'
                      : plan.id === 'free' ? 'glass border border-white/10 text-white/40'
                      : plan.highlight ? 'bg-gradient-vyro text-white glow-button hover:scale-[1.02] disabled:opacity-60'
                      : 'bg-gradient-to-r from-amber-500 to-pink-500 text-white hover:scale-[1.02] disabled:opacity-60'
                  }`}>
                  {isCurrent ? 'Current Plan' : isLoading ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Opening checkout...</>
                  ) : plan.id === 'free' ? 'Included' : `Upgrade to ${plan.name}`}
                </button>

                <div className="space-y-2.5 flex-1">
                  {plan.features.map((feat) => (
                    <div key={feat} className="flex items-start gap-2.5">
                      <Check size={14} className={`mt-0.5 flex-shrink-0 ${plan.id === 'ultra' ? 'text-amber-400' : 'text-purple-400'}`} />
                      <span className="text-white/70 text-sm">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          {[
            { icon: RefreshCw, text: '7-day money-back guarantee' },
            { icon: Lock, text: 'Secure payments via Razorpay' },
            { icon: ShieldCheck, text: 'Cancel anytime' },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2 glass rounded-full px-4 py-2 border border-white/8">
              <Icon size={13} className="text-purple-400" />
              <span className="text-white/60 text-xs font-medium">{text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
