'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import AppLogo from '@/components/ui/AppLogo';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { setError('Please enter your email'); return; }
    // Check if user exists
    try {
      const users = JSON.parse(localStorage.getItem('creo_users') || '[]');
      const match = users.find((u: any) => u.email === email);
      if (!match) { setError('No account found with this email. Please sign up first.'); return; }
      // For now show their password hint (temporary until real email is set up)
      setSent(true);
    } catch { setError('Something went wrong. Try again.'); }
  };

  return (
    <div className="min-h-screen bg-[#080812] flex items-center justify-center px-4">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="relative z-10 w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-8">
          <AppLogo size={24} />
          <span className="font-display text-lg font-semibold text-white">CRÉO</span>
        </div>

        {!sent ? (
          <div className="glass rounded-2xl border border-white/8 p-8">
            <button onClick={() => router.push('/sign-up-login-screen')} className="flex items-center gap-1.5 text-white/40 hover:text-white text-xs mb-6 transition-colors">
              <ArrowLeft size={13} /> Back to login
            </button>
            <h1 className="text-xl font-bold text-white mb-2">Forgot password?</h1>
            <p className="text-white/40 text-sm mb-6">Enter your email and we'll help you get back in.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-white/60 mb-1.5">Email address</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                  <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(''); }}
                    className="w-full pl-10 pr-4 py-3 rounded-xl glass border border-white/10 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-purple-500/50 transition-all bg-transparent"
                    placeholder="you@email.com" />
                </div>
                {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
              </div>
              <button type="submit" className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold text-sm hover:opacity-90 transition-all">
                Find my account
              </button>
            </form>
          </div>
        ) : (
          <div className="glass rounded-2xl border border-green-500/20 p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={28} className="text-green-400" />
            </div>
            <h1 className="text-xl font-bold text-white mb-2">Account found!</h1>
            <p className="text-white/40 text-sm mb-4">Since email recovery isn't set up yet, please try logging in again. If you've forgotten your password, create a new account with a different email for now.</p>
            <p className="text-white/30 text-xs mb-6">Full password recovery via email will be available once Google Auth is set up.</p>
            <button onClick={() => router.push('/sign-up-login-screen')} className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold text-sm hover:opacity-90 transition-all">
              Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
