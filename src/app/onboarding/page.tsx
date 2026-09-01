'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowRight, Check, User, Target, Video, Flag, Link2, Sparkles,
  ChevronRight, ChevronLeft, Crown, Zap, Brain,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import AppLogo from '@/components/ui/AppLogo';

const STEPS = [
  { id: 0, label: 'Welcome', title: 'Welcome to CRÉO', icon: Sparkles },
  { id: 1, label: 'About You', title: 'About You', icon: User },
  { id: 2, label: 'Your Content', title: 'Your Content', icon: Video },
  { id: 3, label: 'Goals', title: 'Goals', icon: Flag },
  { id: 4, label: 'Connect', title: 'Connect', icon: Link2 },
  { id: 5, label: 'Complete', title: 'You\\'re all set!', icon: Check },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState({
    name: '',
    niche: '',
    experience_level: 'intermediate',
    platforms: [] as string[],
    content_types: [] as string[],
    posting_frequency: 'weekly',
    content_goals: [] as string[],
    target_audience_size: '10K-50K',
    primary_goal: 'brand_growth',
    connected_platforms: {} as Record<string, boolean>,
  });

  const update = (key: string, value: any) => setData((d) => ({ ...d, [key]: value }));

  const toggleArray = (key: string, value: string) => {
    setData((d) => {
      const arr = (d as any)[key] as string[];
      return arr.includes(value)
        ? { ...d, [key]: arr.filter((v) => v !== value) }
        : { ...d, [key]: [...arr, value] };
    });
  };

  const handleNext = async () => {
    if (step === STEPS.length - 1) {
      setSaving(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        await fetch('/api/onboarding', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.access_token || ''}`,
          },
          body: JSON.stringify({ ...data, completed: true }),
        });
        router.push('/dashboard');
      } catch {}
      setSaving(false);
      return;
    }
    setStep((s) => s + 1);
  };

  const handleBack = () => setStep((s) => Math.max(0, s - 1));

  const StepContent = () => {
    switch (step) {
      case 0:
        return (
          <div className="text-center space-y-6 py-8">
            <div className="w-20 h-20 rounded-creo-lg bg-terracotta-muted border border-terracotta/20 flex items-center justify-center mx-auto">
              <AppLogo size={40} />
            </div>
            <div>
              <h2 className="creo-h2 text-text-primary mb-2">Welcome to CRÉO</h2>
              <p className="text-text-secondary text-sm max-w-sm mx-auto leading-relaxed">
                Your intelligent partner for content creation and growth.
              </p>
            </div>
            <div className="space-y-2 max-w-xs mx-auto text-left">
              {[
                'Understand your audience deeply',
                'Create content that performs',
                'Analyze and improve constantly',
                'Stay ahead of trends',
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm text-text-secondary">
                  <Check size={14} className="text-terracotta flex-shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-4">
            <h2 className="creo-h2 text-text-primary text-center mb-6">About You</h2>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">What's your name?</label>
              <input
                type="text"
                value={data.name}
                onChange={(e) => update('name', e.target.value)}
                placeholder="Your name"
                className="creo-input"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">What's your niche?</label>
              <select
                value={data.niche}
                onChange={(e) => update('niche', e.target.value)}
                className="creo-select"
              >
                <option value="">Select a niche</option>
                <option>Architecture & Design</option>
                <option>Productivity</option>
                <option>Tech & Gadgets</option>
                <option>Lifestyle</option>
                <option>Education</option>
                <option>Entertainment</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">Experience level</label>
              <select
                value={data.experience_level}
                onChange={(e) => update('experience_level', e.target.value)}
                className="creo-select"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="expert">Expert</option>
              </select>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h2 className="creo-h2 text-text-primary text-center mb-6">Your Content</h2>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-2">What platforms do you create on?</label>
              <div className="flex flex-wrap gap-2">
                {['YouTube', 'Instagram', 'TikTok', 'Twitter/X', 'Blog', 'LinkedIn'].map((p) => (
                  <button
                    key={p}
                    onClick={() => toggleArray('platforms', p)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      data.platforms.includes(p)
                        ? 'bg-terracotta text-white border-terracotta'
                        : 'bg-surface-1 text-text-muted border-border hover:text-text-secondary'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-2">Content types</label>
              <div className="flex flex-wrap gap-2">
                {['Videos', 'Shorts', 'Blogs', 'Posts', 'Scripts', 'Newsletter'].map((t) => (
                  <button
                    key={t}
                    onClick={() => toggleArray('content_types', t)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      data.content_types.includes(t)
                        ? 'bg-terracotta text-white border-terracotta'
                        : 'bg-surface-1 text-text-muted border-border hover:text-text-secondary'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">Posting frequency</label>
              <select
                value={data.posting_frequency}
                onChange={(e) => update('posting_frequency', e.target.value)}
                className="creo-select"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="biweekly">Bi-weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h2 className="creo-h2 text-text-primary text-center mb-6">Goals</h2>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-2">Content goals</label>
              <div className="flex flex-wrap gap-2">
                {['Grow my audience', 'Increase engagement', 'Build personal brand', 'Monetize my content', 'All of the above'].map((g) => (
                  <button
                    key={g}
                    onClick={() => toggleArray('content_goals', g)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      data.content_goals.includes(g)
                        ? 'bg-terracotta text-white border-terracotta'
                        : 'bg-surface-1 text-text-muted border-border hover:text-text-secondary'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">Target audience size</label>
              <select
                value={data.target_audience_size}
                onChange={(e) => update('target_audience_size', e.target.value)}
                className="creo-select"
              >
                <option value="1K-10K">1K - 10K</option>
                <option value="10K-50K">10K - 50K</option>
                <option value="50K-100K">50K - 100K</option>
                <option value="100K-500K">100K - 500K</option>
                <option value="500K+">500K+</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">Primary goal</label>
              <select
                value={data.primary_goal}
                onChange={(e) => update('primary_goal', e.target.value)}
                className="creo-select"
              >
                <option value="brand_growth">Brand Growth</option>
                <option value="revenue">Revenue</option>
                <option value="community">Community</option>
                <option value="education">Education</option>
              </select>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h2 className="creo-h2 text-text-primary text-center mb-6">Connect (Optional)</h2>
            <p className="text-sm text-text-muted text-center mb-4">Connect your platforms for deeper insights</p>
            <div className="space-y-2">
              {['YouTube', 'Instagram', 'TikTok'].map((platform) => (
                <div
                  key={platform}
                  className="flex items-center justify-between p-3 rounded-creo-sm bg-surface-1 border border-border"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-creo-xs bg-surface-2 flex items-center justify-center">
                      <Zap size={14} className="text-text-muted" />
                    </div>
                    <span className="text-sm text-text-secondary font-medium">{platform}</span>
                  </div>
                  <button
                    onClick={() =>
                      update('connected_platforms', {
                        ...data.connected_platforms,
                        [platform]: !data.connected_platforms[platform],
                      })
                    }
                    className={`px-3 py-1.5 rounded-creo-sm text-xs font-medium transition-all ${
                      data.connected_platforms[platform]
                        ? 'bg-success/10 text-success border border-success/20'
                        : 'bg-surface-2 text-text-muted border border-border hover:text-text-secondary'
                    }`}
                  >
                    {data.connected_platforms[platform] ? 'Connected' : 'Connect'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="text-center space-y-6 py-8">
            <div className="w-20 h-20 rounded-full bg-success/10 border border-success/20 flex items-center justify-center mx-auto">
              <Check size={32} className="text-success" />
            </div>
            <div>
              <h2 className="creo-h2 text-text-primary mb-2">You\\'re all set!</h2>
              <p className="text-text-secondary text-sm max-w-sm mx-auto leading-relaxed">
                Your workspace is ready. Let\\'s create something exceptional.
              </p>
            </div>
            <div className="bg-surface-1 border border-border rounded-creo p-4 max-w-sm mx-auto text-left space-y-2">
              <p className="text-xs text-text-muted">Summary:</p>
              <div className="space-y-1 text-sm text-text-secondary">
                {data.name && <p>\\u2022 Name: {data.name}</p>}
                {data.niche && <p>\\u2022 Niche: {data.niche}</p>}
                <p>\\u2022 Platforms: {data.platforms.length > 0 ? data.platforms.join(', ') : 'None selected'}</p>
                <p>\\u2022 Goal: {data.primary_goal.replace('_', ' ')}</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-charcoal flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-lg">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <AppLogo size={24} />
            <span className="font-display text-sm font-semibold text-text-primary">CRÉO</span>
          </div>
          <div className="h-1 bg-surface-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-terracotta rounded-full transition-all duration-500"
              style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-2">
            {STEPS.map((s, i) => (
              <div
                key={s.id}
                className={`flex flex-col items-center gap-1 ${
                  i <= step ? 'text-terracotta' : 'text-text-muted'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                    i < step
                      ? 'bg-terracotta text-white'
                      : i === step
                      ? 'bg-terracotta-muted text-terracotta border border-terracotta/20'
                      : 'bg-surface-1 text-text-muted border border-border'
                  }`}
                >
                  {i < step ? <Check size={10} /> : i + 1}
                </div>
                <span className="text-[9px] font-medium hidden sm:block">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Card */}
        <div className="bg-graphite border border-border rounded-creo-lg p-6 shadow-modal">
          <StepContent />

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-4 border-t border-border">
            <button
              onClick={handleBack}
              disabled={step === 0}
              className={`flex items-center gap-1 text-xs font-medium transition-colors ${
                step === 0 ? 'text-text-muted cursor-not-allowed' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <ChevronLeft size={14} /> Back
            </button>
            <button
              onClick={handleNext}
              disabled={saving}
              className="creo-btn-primary text-sm flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : step === STEPS.length - 1 ? (
                <>
                  Go to Dashboard <ArrowRight size={14} />
                </>
              ) : (
                <>
                  Next <ChevronRight size={14} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
