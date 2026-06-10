'use client';
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import AppLogo from '@/components/ui/AppLogo';
import { Eye, EyeOff, Sparkles, ArrowRight, Zap, Crown, Mail, Lock, User } from 'lucide-react';

type AuthMode = 'login' | 'signup';
interface LoginFormData { email: string; password: string; remember: boolean; }
interface SignupFormData { name: string; email: string; password: string; plan: string; agreeTerms: boolean; }

// ✅ Currency detection by timezone
function getLocalePricing() {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (tz.includes('Asia/Kolkata') || tz.includes('Asia/Calcutta')) return { symbol: '₹', pro: '999', ultra: '2,999' };
  if (tz.includes('Asia/Tokyo') || tz.includes('Asia/Osaka')) return { symbol: '¥', pro: '1,480', ultra: '4,480' };
  if (tz.includes('Asia/Shanghai') || tz.includes('Asia/Hong_Kong')) return { symbol: '¥', pro: '98', ultra: '298' };
  if (tz.includes('Europe')) return { symbol: '€', pro: '12', ultra: '35' };
  if (tz.includes('Asia/Dubai') || tz.includes('Asia/Riyadh')) return { symbol: 'AED', pro: '49', ultra: '149' };
  if (tz.includes('Asia/Singapore') || tz.includes('Asia/Kuala_Lumpur')) return { symbol: 'S$', pro: '18', ultra: '52' };
  return { symbol: '$', pro: '14', ultra: '39' }; // default USD
}

export default function AuthScreen() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pricing, setPricing] = useState({ symbol: '$', pro: '14', ultra: '39' });
  const router = useRouter();

  useEffect(() => { setPricing(getLocalePricing()); }, []);

  const loginForm = useForm<LoginFormData>({ defaultValues: { email: '', password: '', remember: false } });
  const signupForm = useForm<SignupFormData>({ defaultValues: { name: '', email: '', password: '', plan: 'free', agreeTerms: false } });

  const handleLogin = async (data: LoginFormData) => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    const stored = localStorage.getItem('vyro_users');
    const users = stored ? JSON.parse(stored) : [];
    const match = users.find((u: any) => u.email === data.email && u.password === data.password);
    if (!match) {
      toast.error('Wrong email or password. New here? Sign up first!');
      setIsLoading(false);
      return;
    }
    localStorage.setItem('vyro_current_user', JSON.stringify(match));
    toast.success(`Welcome back, ${match.name}!`);
    const onboarded = localStorage.getItem(`vyro_onboarding_${match.email}`);
    setTimeout(() => router.push('/main-app-chat-interface'), 800);
    setIsLoading(false);
  };

  const handleSignup = async (data: SignupFormData) => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    const stored = localStorage.getItem('vyro_users');
    const users = stored ? JSON.parse(stored) : [];
    if (users.find((u: any) => u.email === data.email)) {
      toast.error('Email already registered. Please log in!');
      setIsLoading(false);
      return;
    }
    const newUser = { name: data.name, email: data.email, password: data.password, plan: data.plan, joinedAt: new Date().toISOString() };
    users.push(newUser);
    localStorage.setItem('vyro_users', JSON.stringify(users));
    localStorage.setItem('vyro_current_user', JSON.stringify(newUser));
    toast.success('Account created!', { description: "Welcome to CRÉO 🎉" });
    setTimeout(() => router.push('/onboarding-flow'), 800);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#080812] flex overflow-hidden">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 relative flex-col justify-between p-12 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/15 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-pink-600/10 rounded-full blur-[80px]" />
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: `linear-gradient(rgba(168,85,247,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(168,85,247,0.5) 1px, transparent 1px)`, backgroundSize: '50px 50px' }} />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2">
            <AppLogo size={32} />
            <span className="font-display text-2xl font-semibold text-white">CRÉO</span>
          </div>
        </div>
        <div className="relative z-10 flex flex-col gap-8">
          <div>
            <h1 className="font-display text-5xl xl:text-6xl font-bold leading-tight mb-4">
              <span className="text-white">Your ideas deserve</span><br />
              <span className="text-gradient">to go viral.</span>
            </h1>
            <p className="text-white/50 text-lg leading-relaxed max-w-md">Join 47,000+ creators who turn raw ideas into scroll-stopping content in under 60 seconds.</p>
          </div>
          <div className="space-y-3">
            {[
              { icon: Sparkles, text: 'AI titles, hooks & full scripts — instantly' },
              { icon: Zap, text: 'Chat-based flow — no steps, no friction' },
              { icon: Crown, text: 'Ultra plan: unlimited, priority, holographic' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center flex-shrink-0"><Icon size={15} className="text-purple-400" /></div>
                <span className="text-white/70 text-sm">{text}</span>
              </div>
            ))}
          </div>
          <div className="glass rounded-2xl p-5 border border-white/8 max-w-md">
            <p className="text-white/70 text-sm italic leading-relaxed mb-3">&ldquo;CRÉO is the only reason I post 5x a week without burning out.&rdquo;</p>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center"><span className="text-xs font-bold text-white">P</span></div>
              <div><p className="text-white text-xs font-semibold">Priya K.</p><p className="text-white/40 text-[11px]">@priyacreates · 280k followers</p></div>
            </div>
          </div>
        </div>
        <div className="relative z-10"><p className="text-white/20 text-xs">© 2026 CRÉO. All rights reserved.</p></div>
      </div>

      {/* Right form panel */}
      <div className="w-full lg:w-1/2 xl:w-2/5 flex flex-col justify-center items-center px-6 md:px-12 lg:px-10 xl:px-16 py-12 relative">
        <div className="absolute inset-0 bg-[#0a0a18]" />
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-purple-900/10 blur-[80px] pointer-events-none" />
        <div className="relative z-10 w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8"><AppLogo size={28} /><span className="font-display text-xl font-semibold text-white">CRÉO</span></div>

          <div className="flex glass rounded-xl p-1 mb-8 border border-white/8">
            {(['login', 'signup'] as const).map((m) => (
              <button key={m} onClick={() => { setMode(m); setShowPassword(false); }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${mode === m ? 'bg-gradient-vyro text-white shadow-lg' : 'text-white/50 hover:text-white/70'}`}>
                {m === 'login' ? 'Log In' : 'Sign Up'}
              </button>
            ))}
          </div>

          <div className="mb-7">
            <h2 className="text-2xl font-bold text-white mb-1">{mode === 'login' ? 'Welcome back' : 'Create your account'}</h2>
            <p className="text-white/40 text-sm">{mode === 'login' ? 'Sign in to continue creating viral content.' : 'Start free. No credit card required.'}</p>
          </div>

          <div className="flex gap-3 mb-6">
            <button onClick={() => toast.info('Google auth coming soon')}
              className="flex-1 glass border border-white/10 rounded-xl py-3 flex items-center justify-center gap-2 text-white/70 hover:text-white hover:border-white/20 transition-all text-sm font-medium">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </button>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-white/8" /><span className="text-white/25 text-xs">or continue with email</span><div className="flex-1 h-px bg-white/8" />
          </div>

          {mode === 'login' && (
            <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">Email address</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                  <input type="email" {...loginForm.register('email', { required: 'Email is required', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email' } })}
                    className="w-full pl-10 pr-4 py-3 rounded-xl glass border border-white/10 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-purple-500/50 transition-colors bg-transparent" placeholder="you@email.com" />
                </div>
                {loginForm.formState.errors.email && <p className="text-red-400 text-xs mt-1">{loginForm.formState.errors.email.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">Password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                  <input type={showPassword ? 'text' : 'password'} {...loginForm.register('password', { required: 'Password is required', minLength: { value: 6, message: 'Minimum 6 characters' } })}
                    className="w-full pl-10 pr-10 py-3 rounded-xl glass border border-white/10 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-purple-500/50 transition-colors bg-transparent" placeholder="••••••••" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {loginForm.formState.errors.password && <p className="text-red-400 text-xs mt-1">{loginForm.formState.errors.password.message}</p>}
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" {...loginForm.register('remember')} className="w-4 h-4 rounded border-white/20 bg-white/5 accent-purple-500" />
                  <span className="text-sm text-white/50">Remember me</span>
                </label>
                <a href="#" className="text-sm text-purple-400 hover:text-purple-300">Forgot password?</a>
              </div>
              <button type="submit" disabled={isLoading}
                className="w-full py-3.5 rounded-xl bg-gradient-vyro text-white font-semibold text-sm flex items-center justify-center gap-2 glow-button hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100">
                {isLoading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Signing in...</> : <>Sign In <ArrowRight size={16} /></>}
              </button>
            </form>
          )}

          {mode === 'signup' && (
            <form onSubmit={signupForm.handleSubmit(handleSignup)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">Your name</label>
                <div className="relative">
                  <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                  <input type="text" {...signupForm.register('name', { required: 'Name is required' })}
                    className="w-full pl-10 pr-4 py-3 rounded-xl glass border border-white/10 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-purple-500/50 transition-colors bg-transparent" placeholder="Your name" />
                </div>
                {signupForm.formState.errors.name && <p className="text-red-400 text-xs mt-1">{signupForm.formState.errors.name.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">Email address</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                  <input type="email" {...signupForm.register('email', { required: 'Email is required', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email' } })}
                    className="w-full pl-10 pr-4 py-3 rounded-xl glass border border-white/10 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-purple-500/50 transition-colors bg-transparent" placeholder="you@email.com" />
                </div>
                {signupForm.formState.errors.email && <p className="text-red-400 text-xs mt-1">{signupForm.formState.errors.email.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">Password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                  <input type={showPassword ? 'text' : 'password'} {...signupForm.register('password', { required: 'Password is required', minLength: { value: 8, message: 'Minimum 8 characters' } })}
                    className="w-full pl-10 pr-10 py-3 rounded-xl glass border border-white/10 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-purple-500/50 transition-colors bg-transparent" placeholder="Create a strong password" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {signupForm.formState.errors.password && <p className="text-red-400 text-xs mt-1">{signupForm.formState.errors.password.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Start with</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'free', label: 'Free', sub: `${pricing.symbol}0` },
                    { value: 'pro', label: 'Pro', sub: `${pricing.symbol}${pricing.pro}/mo` },
                    { value: 'ultra', label: 'Ultra', sub: `${pricing.symbol}${pricing.ultra}/mo` },
                  ].map((plan) => {
                    const selected = signupForm.watch('plan') === plan.value;
                    return (
                      <label key={plan.value} className={`cursor-pointer rounded-xl p-3 border text-center transition-all ${selected ? 'border-purple-500/50 bg-purple-500/10' : 'border-white/8 glass hover:border-white/15'}`}>
                        <input type="radio" value={plan.value} {...signupForm.register('plan')} className="sr-only" />
                        <p className={`text-xs font-semibold ${selected ? 'text-purple-300' : 'text-white/70'}`}>{plan.label}</p>
                        <p className={`text-[11px] ${selected ? 'text-purple-400/70' : 'text-white/30'}`}>{plan.sub}</p>
                      </label>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="flex items-start gap-2 cursor-pointer">
                  <input type="checkbox" {...signupForm.register('agreeTerms', { required: 'You must agree to the terms' })} className="w-4 h-4 mt-0.5 rounded border-white/20 bg-white/5 accent-purple-500" />
                  <span className="text-xs text-white/40 leading-relaxed">I agree to the <a href="#" className="text-purple-400 hover:text-purple-300 underline">Terms of Service</a> and <a href="#" className="text-purple-400 hover:text-purple-300 underline">Privacy Policy</a></span>
                </label>
                {signupForm.formState.errors.agreeTerms && <p className="text-red-400 text-xs mt-1">{signupForm.formState.errors.agreeTerms.message}</p>}
              </div>
              <button type="submit" disabled={isLoading}
                className="w-full py-3.5 rounded-xl bg-gradient-vyro text-white font-semibold text-sm flex items-center justify-center gap-2 glow-button hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100">
                {isLoading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating account...</> : <><Sparkles size={16} />Create Account</>}
              </button>
            </form>
          )}

          <p className="text-center text-xs text-white/25 mt-6">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} className="text-purple-400 hover:text-purple-300 font-medium">
              {mode === 'login' ? 'Sign up free' : 'Log in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
