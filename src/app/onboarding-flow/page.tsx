'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Check, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import posthog from 'posthog-js';

const HEAR_OPTIONS = [
  { id: 'youtube', label: 'YouTube', emoji: '▶️' },
  { id: 'tiktok', label: 'TikTok', emoji: '🎵' },
  { id: 'instagram', label: 'Instagram', emoji: '📸' },
  { id: 'twitter', label: 'Twitter / X', emoji: '🐦' },
  { id: 'google', label: 'Google Search', emoji: '🔍' },
  { id: 'friend', label: 'A Friend', emoji: '👥' },
  { id: 'reddit', label: 'Reddit', emoji: '🤖' },
  { id: 'linkedin', label: 'LinkedIn', emoji: '💼' },
  { id: 'podcast', label: 'Podcast', emoji: '🎙️' },
  { id: 'newsletter', label: 'Newsletter', emoji: '📧' },
  { id: 'ad', label: 'An Ad', emoji: '📢' },
  { id: 'other', label: 'Other', emoji: '✨' },
];

const SKILL_OPTIONS = [
  { id: 'beginner', label: 'Just Starting Out', sub: 'I post occasionally or not at all yet', emoji: '🌱', color: 'from-green-600/20 to-emerald-600/20', border: 'border-green-500/30' },
  { id: 'intermediate', label: 'Growing Creator', sub: 'I post regularly and want to grow faster', emoji: '🚀', color: 'from-purple-600/20 to-violet-600/20', border: 'border-purple-500/30' },
  { id: 'advanced', label: 'Full-Time Creator', sub: 'Content is my business — I need to ship daily', emoji: '👑', color: 'from-amber-600/20 to-orange-600/20', border: 'border-amber-500/30' },
];

export default function OnboardingFlowPage() {
  const router = useRouter();
  const [step, setStep] = useState<'hear' | 'skill'>('hear');
  const [selectedHear, setSelectedHear] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hearError, setHearError] = useState(false);
  const [skillError, setSkillError] = useState(false);

  const handleHearNext = () => {
    if (!selectedHear) { setHearError(true); return; }
    setHearError(false);
    setStep('skill');
  };

  const handleFinish = async () => {
    if (!selectedSkill) { setSkillError(true); return; }
    setSkillError(false);
    setIsLoading(true);

    try {
      // ✅ Save through the API (service role) — the old direct client-side
      // profiles.update() was silently blocked by row-level security, so
      // answers never actually saved. The API route saves for real.
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await fetch('/api/onboarding', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
          body: JSON.stringify({ hear: selectedHear, skill: selectedSkill }),
        });
      }
      // Mark done locally so the workspace never re-prompts this browser.
      localStorage.setItem('creo_onboarded', 'true');
      posthog.capture('onboarding_completed', {
        acquisition_source: selectedHear,
        creator_level: selectedSkill,
      });
    } catch (err) {
      console.error('Onboarding save error:', err);
    }

    await new Promise((r) => setTimeout(r, 400));
    setIsLoading(false);
    router.push('/main-app-chat-interface');
  };

  return (
    <div className="min-h-screen bg-[#080812] flex items-center justify-center px-4 py-12">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="relative z-10 w-full max-w-lg">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Sparkles size={18} className="text-purple-400" />
          <span className="font-display text-lg font-semibold text-white">CRÉO</span>
        </div>

        <div className="flex gap-2 mb-8">
          <div className="flex-1 h-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" />
          <div className={`flex-1 h-1 rounded-full transition-all duration-500 ${step === 'skill' ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-white/10'}`} />
        </div>

        {step === 'hear' && (
          <div>
            <div className="mb-8 text-center">
              <p className="text-purple-400 text-sm font-medium mb-2">Step 1 of 2</p>
              <h1 className="text-3xl font-bold text-white mb-2">How did you find CRÉO?</h1>
              <p className="text-white/40 text-sm">Help us understand where our creators come from.</p>
              {hearError && <p className="text-red-400 text-sm mt-2">Please pick one option to continue.</p>}
            </div>
            <div className="grid grid-cols-3 gap-2 mb-8">
              {HEAR_OPTIONS.map((opt) => (
                <button key={opt.id} onClick={() => { setSelectedHear(opt.id); setHearError(false); }}
                  className={`relative flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border text-center transition-all duration-200 ${selectedHear === opt.id ? 'border-purple-500/60 bg-purple-500/10' : 'border-white/8 bg-white/3 hover:border-white/15'}`}>
                  {selectedHear === opt.id && (
                    <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-purple-500 flex items-center justify-center">
                      <Check size={9} className="text-white" />
                    </div>
                  )}
                  <span className="text-lg">{opt.emoji}</span>
                  <span className={`text-[11px] font-medium ${selectedHear === opt.id ? 'text-purple-300' : 'text-white/60'}`}>{opt.label}</span>
                </button>
              ))}
            </div>
            <button onClick={handleHearNext} className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all">
              Continue <ArrowRight size={16} />
            </button>
          </div>
        )}

        {step === 'skill' && (
          <div>
            <div className="mb-8 text-center">
              <p className="text-purple-400 text-sm font-medium mb-2">Step 2 of 2</p>
              <h1 className="text-3xl font-bold text-white mb-2">What's your creator level?</h1>
              <p className="text-white/40 text-sm">We'll personalise CRÉO's suggestions for you.</p>
              {skillError && <p className="text-red-400 text-sm mt-2">Please select your level to continue.</p>}
            </div>
            <div className="flex flex-col gap-3 mb-8">
              {SKILL_OPTIONS.map((opt) => (
                <button key={opt.id} onClick={() => { setSelectedSkill(opt.id); setSkillError(false); }}
                  className={`flex items-center gap-4 p-4 rounded-xl border text-left transition-all duration-200 bg-gradient-to-r ${selectedSkill === opt.id ? `${opt.color} ${opt.border}` : 'border-white/8 bg-transparent hover:border-white/15'}`}>
                  <span className="text-3xl">{opt.emoji}</span>
                  <div className="flex-1">
                    <p className={`text-sm font-semibold ${selectedSkill === opt.id ? 'text-white' : 'text-white/80'}`}>{opt.label}</p>
                    <p className="text-xs text-white/40 mt-0.5">{opt.sub}</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${selectedSkill === opt.id ? 'border-purple-500 bg-purple-500' : 'border-white/20'}`}>
                    {selectedSkill === opt.id && <Check size={11} className="text-white" />}
                  </div>
                </button>
              ))}
            </div>
            <button onClick={handleFinish} disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-60">
              {isLoading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</> : <><Sparkles size={15} />Let's Create <ArrowRight size={15} /></>}
            </button>
            <button onClick={() => setStep('hear')} className="w-full mt-3 text-center text-xs text-white/25 hover:text-white/40 transition-colors">← Back</button>
          </div>
        )}
      </div>
    </div>
  );
}
