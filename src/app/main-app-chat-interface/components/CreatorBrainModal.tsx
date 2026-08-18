'use client';
import React, { useState, useEffect } from 'react';
import { Brain, X, Crown, Save, Sparkles, User, Users, Mic2, Target } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import posthog from 'posthog-js';

// ✅ CREATOR BRAIN (Ultra) — the signature feature's setup UI. The creator
// teaches CRÉO their niche, audience, voice, and goals once; every Ultra
// generation is then written in THEIR voice. Any plan can fill this in
// (it saves), but generations only use it on Ultra — the banner says so
// honestly and links to the upgrade page.
//
// ✅ MIND-MAP TREATMENT (Aug 2026): visualizes the REAL saved profile as
// connected nodes instead of a plain form. This is genuinely the user's own
// data (niche/audience/style/goals), not decorative or fabricated content —
// there's no AI-computed hook-type/posting-time/content-DNA analysis behind
// this feature, so the map only ever shows what was actually typed in. The
// working edit form below is unchanged.
interface Props { onClose: () => void; plan: string; }

const FIELDS = [
  { key: 'niche', label: 'Your niche', icon: Target, placeholder: 'e.g. Self-improvement for students, budget tech reviews, home workouts...', rows: 2 },
  { key: 'audience', label: 'Your audience', icon: Users, placeholder: 'e.g. 16-24 year old students in India who want to study smarter, mostly watch on phones...', rows: 2 },
  { key: 'style', label: 'Your voice & style', icon: Mic2, placeholder: 'e.g. Fast-paced, funny but direct, short sentences, occasional Hindi words, no corporate talk...', rows: 3 },
  { key: 'goals', label: 'Your goals', icon: User, placeholder: 'e.g. Grow to 100k subs, drive viewers to my Discord, build authority in my niche...', rows: 2 },
] as const;

// Irregular, whiteboard-style positions (percentages of the canvas) — not a
// symmetric grid, matching the reference's scattered mood-board feel.
const NODE_POS: Record<string, { x: number; y: number }> = {
  niche: { x: 16, y: 16 }, audience: { x: 82, y: 14 }, style: { x: 14, y: 82 }, goals: { x: 84, y: 84 },
};
// Sticky-note palette + slight rotation per node — varied tones like a real
// whiteboard, not a uniform dark UI card. Dark text on these, deliberately
// breaking from the app's usual light-on-dark theme to sell the sticky-note
// material.
const NODE_STYLE: Record<string, { bg: string; rotate: string }> = {
  niche: { bg: '#F5E6A8', rotate: '-2deg' },
  audience: { bg: '#F0EBDD', rotate: '1.5deg' },
  style: { bg: '#D9DCE1', rotate: '-1deg' },
  goals: { bg: '#F5E6A8', rotate: '2deg' },
};

export default function CreatorBrainModal({ onClose, plan }: Props) {
  const router = useRouter();
  const isUltra = plan === 'ultra';
  const [memory, setMemory] = useState<Record<string, string>>({ niche: '', audience: '', style: '', goals: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeField, setActiveField] = useState<string | null>(null);

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
        posthog.capture('creator_brain_saved', {
          plan: isUltra ? 'ultra' : plan,
          completed_fields: Object.values(memory).filter(Boolean).length,
        });
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

  const filledCount = Object.values(memory).filter(Boolean).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/70 backdrop-blur-sm animate-backdrop-in">
      <div className="w-full max-w-2xl creo-surface-elevated border border-fuchsia-500/25 rounded-2xl flex flex-col max-h-[90vh] animate-modal-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-creo-border flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-fuchsia-500/20 to-purple-600/20 border border-fuchsia-500/25 flex items-center justify-center">
              <Brain size={17} className="text-fuchsia-400" />
            </div>
            <div>
              <h2 className="text-creo-text-primary font-bold text-base leading-tight">Creator Brain</h2>
              <p className="text-creo-text-muted text-[11px]">Teach CRÉO to write like you</p>
            </div>
          </div>
          <button onClick={onClose} className="text-creo-text-muted hover:text-creo-text-secondary"><X size={16} /></button>
        </div>

        {/* Ultra status banner */}
        {!isUltra && (
          <button onClick={() => router.push('/upgrade')} className="mx-6 mt-4 flex items-center gap-2.5 rounded-xl bg-amber-500/8 border border-amber-500/20 px-4 py-3 text-left hover:bg-amber-500/15 transition-all flex-shrink-0">
            <Crown size={15} className="text-amber-400 flex-shrink-0" />
            <span className="text-xs text-amber-300/90 leading-relaxed">Your profile saves now, but the Brain <b>activates on Ultra</b> — CRÉO will write every hook, title and script in your voice. Tap to upgrade.</span>
          </button>
        )}
        {isUltra && (
          <div className="mx-6 mt-4 flex items-center gap-2.5 rounded-xl bg-fuchsia-500/8 border border-fuchsia-500/20 px-4 py-3 flex-shrink-0">
            <Sparkles size={15} className="text-fuchsia-400 flex-shrink-0" />
            <span className="text-xs text-fuchsia-300/90 leading-relaxed">Active — everything you generate is personalized to the map below.</span>
          </div>
        )}

        <div className="overflow-y-auto">
          {loading ? (
            <div className="py-10 text-center text-creo-text-muted text-sm">Loading your profile...</div>
          ) : (
            <>
              {/* ✅ MIND-MAP — real saved data only, connected to a central
                  Creator Brain node. Empty fields honestly show "Not set". */}
              <div className="px-6 pt-5">
                <div className="relative creo-surface rounded-2xl p-6" style={{ minHeight: 300 }}>
                  <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 280 200" preserveAspectRatio="none">
                    {Object.entries(NODE_POS).map(([key, pos]) => {
                      const x2 = pos.x / 100 * 280, y2 = pos.y / 100 * 200;
                      // Organic curve — control point offset perpendicular-ish from the straight line, not a straight ray
                      const cx = 140 + (x2 - 140) * 0.5 + (y2 - 100) * 0.15;
                      const cy = 100 + (y2 - 100) * 0.5 - (x2 - 140) * 0.15;
                      return (
                        <g key={key}>
                          <path d={`M 140 100 Q ${cx} ${cy} ${x2} ${y2}`} fill="none" stroke="rgba(217,70,239,0.3)" strokeWidth="1.5" strokeDasharray="1 4" strokeLinecap="round" />
                          <circle cx={x2} cy={y2} r="2.5" fill="rgba(217,70,239,0.6)" />
                        </g>
                      );
                    })}
                    <circle cx="140" cy="100" r="3" fill="rgba(217,70,239,0.8)" />
                  </svg>
                  {/* Center node — stays dark/premium, anchoring the lighter sticky notes around it */}
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-fuchsia-500/25 to-purple-600/25 border border-fuchsia-500/40 shadow-lg shadow-fuchsia-500/10 flex flex-col items-center justify-center text-center px-2">
                      <Brain size={16} className="text-fuchsia-300 mb-0.5" />
                      <span className="text-[9px] font-bold text-fuchsia-200 leading-tight">{memory.niche ? memory.niche.split(/[,.]/)[0].slice(0, 22) : 'Your Brain'}</span>
                    </div>
                  </div>
                  {/* Branch nodes — varied sticky notes, irregular position + rotation */}
                  {FIELDS.map((f) => {
                    const pos = NODE_POS[f.key];
                    const style = NODE_STYLE[f.key];
                    const filled = !!memory[f.key];
                    return (
                      <button
                        key={f.key}
                        onClick={() => setActiveField(f.key)}
                        className={`absolute z-10 -translate-x-1/2 -translate-y-1/2 w-[128px] text-left rounded-lg px-3 py-2.5 shadow-md transition-all hover:-translate-y-[52%] hover:shadow-lg ${activeField === f.key ? 'ring-2 ring-fuchsia-400' : ''}`}
                        style={{
                          left: `${pos.x}%`, top: `${pos.y}%`,
                          backgroundColor: filled ? style.bg : 'rgba(255,255,255,0.04)',
                          transform: `translate(-50%, -50%) rotate(${filled ? style.rotate : '0deg'})`,
                          border: filled ? 'none' : '1.5px dashed rgba(255,255,255,0.15)',
                        }}
                      >
                        <div className="flex items-center gap-1 mb-0.5">
                          <f.icon size={10} className={filled ? 'text-black/50' : 'text-creo-text-muted'} />
                          <span className={`text-[9px] font-semibold uppercase tracking-wide ${filled ? 'text-black/60' : 'text-creo-text-muted'}`}>{f.label}</span>
                        </div>
                        <p className={`text-[10.5px] leading-snug line-clamp-2 font-medium ${filled ? 'text-black/80' : 'text-creo-text-muted italic'}`}>{memory[f.key] || 'Not set — tap to add'}</p>
                      </button>
                    );
                  })}
                </div>
                <p className="text-[10px] text-creo-text-muted text-center mt-2">{filledCount} of 4 fields set — tap a note to edit</p>
              </div>

              {/* Edit form — unchanged real save logic, now driven by the map */}
              <div className="px-6 py-5 space-y-4">
                {FIELDS.map((f) => (
                  <div key={f.key} className={activeField && activeField !== f.key ? 'opacity-50' : ''}>
                    <label className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-creo-text-muted mb-1.5">
                      <f.icon size={11} className="text-fuchsia-400/70" />{f.label}
                    </label>
                    <textarea
                      value={memory[f.key]}
                      onFocus={() => setActiveField(f.key)}
                      onChange={(e) => setMemory((m) => ({ ...m, [f.key]: e.target.value }))}
                      placeholder={f.placeholder}
                      rows={f.rows}
                      maxLength={500}
                      className="w-full creo-surface rounded-xl px-3.5 py-2.5 text-sm text-creo-text-primary placeholder:text-creo-text-muted resize-none focus:outline-none focus:border-fuchsia-500/40 transition-all"
                    />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-creo-border flex-shrink-0">
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
