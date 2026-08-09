'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import posthog from 'posthog-js';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.user) {
          router.replace('/sign-up-login-screen');
          return;
        }

        const user = session.user;
        const identifyUser = (name: string, plan: string) => {
          posthog.identify(user.id, {
            ...(user.email ? { email: user.email } : {}),
            name,
            plan,
          });
        };
        const pendingName = localStorage.getItem('creo_pending_name') || 
          user.email?.split('@')[0] || 'Creator';
        const pendingPlan = localStorage.getItem('creo_pending_plan') || 'free';
        // ✅ Anonymous entry flow (/try) leaves generated hooks here — if present,
        // skip onboarding and go straight to the workspace so the hooks + topic
        // are waiting the instant the user lands, with no re-typing required.
        const hasHandoff = !!localStorage.getItem('creo_pending_handoff');

        // ✅ Check if profile exists — select the fields the rest of the app
        // needs in localStorage (plan-gating in ChatMainArea reads from there,
        // not from Supabase directly).
        const { data: existing } = await supabase
          .from('profiles')
          .select('id, name, email, plan, subscription_end_date')
          .eq('user_id', user.id)
          .single();

        if (!existing) {
          // ✅ PAYWALL BYPASS FIX — this used to insert the plan the user
          // PICKED on the sign-up form (pendingPlan) directly into the
          // database, with zero payment ever collected. That meant anyone
          // could get Pro or Ultra for free just by selecting it at signup.
          // Every new profile is now created as 'free', no exceptions. If
          // they picked Pro/Ultra, we still honor that choice — we just send
          // them straight to the real Razorpay checkout to actually pay for
          // it instead of silently granting it.
          const { error } = await supabase.from('profiles').insert({
            user_id: user.id,
            email: user.email,
            name: pendingName,
            plan: 'free',
            gen_count: 0,
            last_active: new Date().toISOString(),
          });

          if (error) console.error('Profile insert error:', error.message);

          // ✅ Referral claim — if this signup came through someone's ?ref=
          // link, credit the referrer (+1 permanent daily generation, capped).
          // Fire-and-forget: a failed claim must never block sign-in.
          try {
            const pendingRef = localStorage.getItem('creo_pending_ref');
            if (pendingRef) {
              fetch('/api/referral', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
                body: JSON.stringify({ code: pendingRef }),
              }).catch(() => {});
              localStorage.removeItem('creo_pending_ref');
            }
          } catch {}

          localStorage.setItem('creo_current_user', JSON.stringify({
            id: user.id, name: pendingName, email: user.email, plan: 'free',
          }));
          localStorage.setItem('creo_session', 'true');
          identifyUser(pendingName, 'free');

          localStorage.removeItem('creo_pending_name');
          localStorage.removeItem('creo_pending_plan');

          const wantsPaidPlan = pendingPlan === 'pro' || pendingPlan === 'ultra';
          if (wantsPaidPlan && !hasHandoff) {
            router.replace(`/upgrade?plan=${pendingPlan}&welcome=1`);
          } else {
            router.replace(hasHandoff ? '/main-app-chat-interface' : '/onboarding-flow');
          }
        } else {
          // ✅ Existing user — update last_active, and sync their real plan
          // into localStorage (this is what makes an upgrade actually unlock
          // Pro/Ultra features after they pay and come back).
          await supabase.from('profiles')
            .update({ last_active: new Date().toISOString() })
            .eq('user_id', user.id);

          // If a paid plan expired since their last visit, treat them as free
          // client-side too — the daily cron job handles the DB write-back.
          const expired = existing.subscription_end_date && new Date(existing.subscription_end_date) < new Date();
          const effectivePlan = expired ? 'free' : (existing.plan || 'free');

          localStorage.setItem('creo_current_user', JSON.stringify({
            id: user.id, name: existing.name || pendingName, email: existing.email || user.email, plan: effectivePlan,
          }));
          localStorage.setItem('creo_session', 'true');
          identifyUser(existing.name || pendingName, effectivePlan);

          router.replace('/main-app-chat-interface');
        }
      } catch (err) {
        console.error('Auth callback error:', err);
        router.replace('/sign-up-login-screen');
      }
    };

    handleAuth();
  }, []);

  return (
    <div className="min-h-screen bg-[#080812] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
        <p className="text-white/40 text-sm">Signing you in...</p>
      </div>
    </div>
  );
}
