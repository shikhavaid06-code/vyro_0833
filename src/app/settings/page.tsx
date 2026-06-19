'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Crown, Zap, LogOut, ArrowLeft, Sparkles, Shield, Bell, Palette, ChevronRight, Copy, Check } from 'lucide-react';
import AppLogo from '@/components/ui/AppLogo';

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [genCount, setGenCount] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem('creo_current_user') || '{}');
      setUser(u);
      setGenCount(parseInt(localStorage.getItem('creo_gen_count') || '0'));
    } catch {}
  }, []);

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
                <span className="text-xs text-white/40">Free generations used</span>
                <span className="text-xs text-purple-400">{genCount} / 3</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-full transition-all" style={{ width: `${Math.min((genCount / 3) * 100, 100)}%` }} />
              </div>
              <button onClick={() => router.push('/main-app-chat-interface')}
                className="w-full mt-3 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-semibold hover:opacity-90 transition-all">
                Upgrade to Pro — ₹999/mo
              </button>
            </div>
          )}
        </div>

        {/* Settings sections */}
        {[
          {
            title: 'Account',
            items: [
              { icon: User, label: 'Profile', sub: 'Name and email', action: () => {} },
              { icon: Shield, label: 'Privacy', sub: 'Data and permissions', action: () => router.push('/privacy') },
            ]
          },
          {
            title: 'Preferences',
            items: [
              { icon: Palette, label: 'Appearance', sub: 'Dark mode (default)', action: () => {} },
              { icon: Bell, label: 'Notifications', sub: 'Coming soon', action: () => {} },
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
            {section.items.map((item, i) => (
              <button key={item.label} onClick={item.action}
                className={`w-full flex items-center gap-3 px-5 py-3.5 hover:bg-white/5 transition-all text-left ${i < section.items.length - 1 ? 'border-b border-white/5' : ''}`}>
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                  <item.icon size={14} className="text-white/40" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-white/80 font-medium">{item.label}</p>
                  <p className="text-xs text-white/30">{item.sub}</p>
                </div>
                <ChevronRight size={14} className="text-white/20" />
              </button>
            ))}
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
