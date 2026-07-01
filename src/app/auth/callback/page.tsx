'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleAuth = async () => {
      try {
        // ✅ This exchanges the token from the URL for a real session
        const { data, error } = await supabase.auth.getSession();
        
        if (error || !data.session) {
          // Try to get session from URL hash (magic link flow)
          const { data: { session }, error: sessionError } = await supabase.auth.refreshSession();
          
          if (sessionError || !session) {
            router.replace('/sign-up-login-screen');
            return;
          }
        }

        const session = data.session;
        
        if (session?.user) {
          // Check if profile exists in Supabase
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', session.user.email)
            .single();

          if (!profile) {
            // New user — create profile
            const pendingName = localStorage.getItem('creo_pending_name') || 
              session.user.user_metadata?.name || 
              session.user.email?.split('@')[0] || 'Creator';
            const pendingPlan = localStorage.getItem('creo_pending_plan') || 'free';

            await supabase.from('profiles').upsert({
              id: session.user.id,
              email: session.user.email,
              name: pendingName,
              plan: pendingPlan,
              gen_count: 0,
            });

            localStorage.removeItem('creo_pending_name');
            localStorage.removeItem('creo_pending_plan');
            router.replace('/onboarding-flow');
          } else {
            router.replace('/main-app-chat-interface');
          }
        } else {
          router.replace('/sign-up-login-screen');
        }
      } catch {
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
