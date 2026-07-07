'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

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
        const pendingName = localStorage.getItem('creo_pending_name') || 
          user.email?.split('@')[0] || 'Creator';
        const pendingPlan = localStorage.getItem('creo_pending_plan') || 'free';
        // ✅ Anonymous entry flow (/try) leaves generated hooks here — if present,
        // skip onboarding and go straight to the workspace so the hooks + topic
        // are waiting the instant the user lands, with no re-typing required.
        const hasHandoff = !!localStorage.getItem('creo_pending_handoff');

        // ✅ Check if profile exists
        const { data: existing } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (!existing) {
          // ✅ New user — save to profiles
          const { error } = await supabase.from('profiles').insert({
            user_id: user.id,
            email: user.email,
            name: pendingName,
            plan: pendingPlan,
            gen_count: 0,
            last_active: new Date().toISOString(),
          });

          if (error) console.error('Profile insert error:', error.message);

          localStorage.removeItem('creo_pending_name');
          localStorage.removeItem('creo_pending_plan');
          router.replace(hasHandoff ? '/main-app-chat-interface' : '/onboarding-flow');
        } else {
          // ✅ Existing user — update last_active
          await supabase.from('profiles')
            .update({ last_active: new Date().toISOString() })
            .eq('user_id', user.id);
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
