'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error || !session) {
          router.replace('/auth');
          return;
        }

        const user = session.user;
        const plan = localStorage.getItem('creo_pending_plan') || 'free';
        const name = localStorage.getItem('creo_pending_name') || user.email?.split('@')[0] || 'Creator';

        const { data: existing } = await supabase
          .from('profiles')
          .select('user_id')
          .eq('user_id', user.id)
          .single();

        if (!existing) {
          await supabase.from('profiles').insert({
            user_id: user.id,
            email: user.email,
            name,
            plan,
            daily_gen_count: 0,
            daily_gen_reset_date: new Date().toISOString().slice(0, 10),
            streak_count: 0,
            referral_bonus: 0,
          });
        }

        localStorage.setItem('creo_session', JSON.stringify(session));
        localStorage.setItem('creo_current_user', JSON.stringify({
          id: user.id,
          email: user.email,
          name,
          plan,
        }));

        localStorage.removeItem('creo_pending_plan');
        localStorage.removeItem('creo_pending_name');

        const { data: profile } = await supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('user_id', user.id)
          .single();

        if (!profile?.onboarding_completed) {
          router.replace('/onboarding');
        } else {
          router.replace('/dashboard');
        }
      } catch {
        router.replace('/auth');
      }
    })();
  }, [router]);

  return (
    <div className="min-h-screen bg-charcoal flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 size={32} className="text-terracotta animate-spin mx-auto" />
        <p className="text-sm text-text-muted">Setting up your workspace...</p>
      </div>
    </div>
  );
}
