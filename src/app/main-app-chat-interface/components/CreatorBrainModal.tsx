'use client';
import React, { useState, useEffect } from 'react';
import { Brain, X, Crown, Save, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

// ✅ CREATOR BRAIN (Ultra) — the signature feature's setup UI. The creator
// teaches CRÉO their niche, audience, voice, and goals once; every Ultra
// generation is then written in THEIR voice. Any plan can fill this in
// (it saves), but generations only use it on Ultra — the banner says so
// honestly and links to the upgrade page.
interface Props { onClose: () => void; plan: string; }

const FIELDS = [
  { key: 'niche', label: 'Your niche', placeholder: 'e.g. Self-improvement for students, budget tech reviews, home workouts...', rows: 2 },
  { key: 'audience', label: 'Your audience', placeholder: 'e.g. 16-24 year old students in India who want to study smarter, mostly watch on phones...', rows: 2 },
  { key: 'style', label: 'Your voice & style', placeholder: 'e.g. Fast-paced, funny but direct, short sentences, occasional Hindi words, no corporate talk...', rows: 3 },
  { key: 'goals', label: 'Your goals', placeholder: 'e.g. Grow to 100k subs, drive viewers to my Discord, build authority in my niche...', rows: 2 },
] as const;

export default function CreatorBrainModal({ onClose, plan }: Props) {
  const router = useRouter();
  const isUltra = plan === 'ultra';
  const [memory, setMemory] = useState<Record<string, string>>({ niche: '', audience: '', style: '', goals: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) { setLoading(false); return; }
        const r = await fetch('/api/profile/memory', { headers: { Authorization: `Bearer ${session.access_token}` } });
        const d = await r.json();
        if (d?.memory) setMemory({ niche: d.memory.niche || '', audience: d.memory.audience || '', style: d.memory.style || '', goals: d.memory.goals || '' });
      } catch {}
      setLoading(false);
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast.error('Please sign in again to save.'); setSaving(false); return; }
      const r = await fetch('/api/profile/memory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify(memory),
      });
      const d = await r.json();
      if (d?.success) {
        toast.success(isUltra ? 'Creator Brain updated — every generation now writes in your voice 🧠' : 'Profile saved — it activates when you go Ultra!');
        onClose();
      } else if (r.status === 401) {
        toast.error('Your session expired — please sign in again.');
      } else if (r.status === 404) {
        toast.error('Save endpoint missing — make sure src/app/api/profile/memory/route.ts is deployed.');
      } else {
        toast.error('Could not save — if this keeps happening, run sql/creator_memory.sql in Supabase.');
      }
    } catch {
      toast.error('Could not save — please try again.');
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/70 backdrop-blur-sm animate-backdrop-in">
      <div className="w-full max-w-lg bg-[#0d0d1f] border border-fuchsia-500/25 rounded-2xl flex flex-col max-h-[88vh] animate-modal-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-fuchsia-500/20 to-purple-600/20 border border-fuchsia-500/25 flex items-center justify-center">
              <Brain size={17} className="text-fuchsia-400" />
            </div>
            <div>
              <h2 className="text-white font-bold text-base leading-tight">Creator Brain</h2>
              <p className="text-white/35 text-[11px]">Teach CRÉO to write like you</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white/60"><X size={16} /></button>
        </div>

        {/* Ultra status banner */}
        {!isUltra && (
          <button onClick={() => router.push('/upgrade')} className="mx-6 mt-4 flex items-center gap-2.5 rounded-xl bg-amber-500/8 border border-amber-500/20 px-4 py-3 text-left hover:bg-amber-500/15 transition-all">
            <Crown size={15} className="text-amber-400 flex-shrink-0" />
            <span className="text-xs text-amber-300/90 leading-relaxed">Your profile saves now, but the Brain <b>activates on Ultra</b> — CRÉO will write every hook, title and script in your voice. Tap to upgrade.</span>
          </button>
        )}
        {isUltra && (
          <div className="mx-6 mt-4 flex items-center gap-2.5 rounded-xl bg-fuchsia-500/8 border border-fuchsia-500/20 px-4 py-3">
            <Sparkles size={15} className="text-fuchsia-400 flex-shrink-0" />
            <span className="text-xs text-fuchsia-300/90 leading-relaxed">Active — everything you generate is personalized to the profile below.</span>
          </div>
        )}

        {/* Fields */}
        <div className="px-6 py-5 space-y-4 overflow-y-auto">
          {loading ? (
            <div className="py-10 text-center text-white/30 text-sm">Loading your profile...</div>
          ) : (
            FIELDS.map((f) => (
              <div key={f.key}>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-white/40 mb-1.5">{f.label}</label>
                <textarea
                  value={memory[f.key]}
                  onChange={(e) => setMemory((m) => ({ ...m, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  rows={f.rows}
                  maxLength={500}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-white/20 resize-none focus:outline-none focus:border-fuchsia-500/40 focus:bg-fuchsia-500/5 transition-all"
                />
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/5 flex-shrink-0">
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white font-semibold text-sm hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {saving ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</> : <><Save size={14} />Save Creator Brain</>}
          </button>
        </div>
      </div>
    </div>
  );
}
