'use client';
import React, { useState } from 'react';
import { Radar, X, Crown, Copy, Check, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import posthog from 'posthog-js';

// ✅ COMPETITOR INTELLIGENCE + LINK CLONER (Ultra) — paste a competitor's
// transcript, titles, or hooks; CRÉO extracts their viral framework
// (hook style, structure, psychology, title patterns) and clones the
// STRUCTURE — never the words — for the creator's own topic.
// Plan gating is enforced server-side; non-Ultra users get an honest upsell.
interface Props { onClose: () => void; plan: string; }

export default function CompetitorIntelModal({ onClose, plan }: Props) {
  const router = useRouter();
  const isUltra = plan === 'ultra';
  const [material, setMaterial] = useState('');
  const [topic, setTopic] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleAnalyze = async () => {
    // ✅ Locked feature → straight to the upgrade page, no dead-end error
    if (!isUltra) {
      toast.info('Competitor Intelligence is an Ultra feature — taking you to upgrade!');
      router.push('/upgrade');
      return;
    }
    if (material.trim().length < 40) {
      toast.error('Paste more competitor material — a transcript, several titles, or hooks (at least a few lines).');
      return;
    }
    posthog.capture('competitor_analysis_requested', {
      has_custom_topic: Boolean(topic.trim()),
      material_length_bucket: material.length >= 1000 ? '1000_plus' : material.length >= 250 ? '250_to_999' : '40_to_249',
    });
    setAnalyzing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const idea = `COMPETITOR MATERIAL:\n${material.slice(0, 12000)}\n\nMY TOPIC: ${topic || 'same niche as the competitor material above'}`;
      const r = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({ idea, forceType: 'competitor' }),
      });
      const d = await r.json();
      if (d?.upgradeRequired) {
        toast.info(d.message || 'Competitor Intelligence is an Ultra feature — taking you to upgrade!');
        router.push('/upgrade');
      } else if (d?.limitReached) {
        toast.error("You've hit today's generation limit.", {
          action: { label: 'Upgrade', onClick: () => router.push('/upgrade') },
        });
      } else if (typeof d?.result === 'string' && d.result) {
        setResult(d.result);
      } else {
        toast.error(d?.message || 'Analysis failed — try again in a moment.');
      }
    } catch {
      toast.error('Analysis failed — try again in a moment.');
    }
    setAnalyzing(false);
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result).catch(() => {});
    setCopied(true);
    toast.success('Analysis copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/70 backdrop-blur-sm animate-backdrop-in">
      <div className="w-full max-w-2xl creo-surface-elevated border border-sky-500/25 rounded-2xl flex flex-col max-h-[88vh] animate-modal-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500/20 to-cyan-600/20 border border-sky-500/25 flex items-center justify-center">
              <Radar size={17} className="text-sky-400" />
            </div>
            <div>
              <h2 className="text-creo-text-primary font-bold text-base leading-tight">Competitor Intelligence</h2>
              <p className="text-creo-text-muted text-[11px]">Extract their framework. Clone the structure, never the words.</p>
            </div>
          </div>
          <button onClick={onClose} className="text-creo-text-muted hover:text-creo-text-secondary"><X size={16} /></button>
        </div>

        {!isUltra && (
          <button onClick={() => router.push('/upgrade')} className="mx-6 mt-4 flex items-center gap-2.5 rounded-xl bg-amber-500/8 border border-amber-500/20 px-4 py-3 text-left hover:bg-amber-500/15 transition-all flex-shrink-0">
            <Crown size={15} className="text-amber-400 flex-shrink-0" />
            <span className="text-xs text-amber-300/90 leading-relaxed">Competitor Intelligence is an <b>Ultra</b> feature — tap to upgrade and unlock framework extraction.</span>
          </button>
        )}

        <div className="px-6 py-5 space-y-4 overflow-y-auto">
          {!result ? (
            <>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-creo-text-muted mb-1.5">Competitor material</label>
                <textarea
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                  placeholder={'Paste anything from a competitor whose content performs:\n• a video transcript\n• 5-10 of their titles\n• their hooks or descriptions'}
                  rows={7}
                  className="w-full creo-surface rounded-xl px-3.5 py-2.5 text-sm text-creo-text-primary placeholder:text-creo-text-muted resize-none focus:outline-none focus:border-sky-500/40 transition-all"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-creo-text-muted mb-1.5">Your topic <span className="text-creo-text-muted normal-case">(what should the cloned hooks & titles be about?)</span></label>
                <input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. study tips for college students"
                  className="w-full creo-surface rounded-xl px-3.5 py-2.5 text-sm text-creo-text-primary placeholder:text-creo-text-muted focus:outline-none focus:border-sky-500/40 transition-all"
                />
              </div>
            </>
          ) : (
            <div className="creo-surface rounded-xl border border-sky-500/20 overflow-hidden animate-slide-up">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5 bg-sky-500/5">
                <div className="flex items-center gap-2">
                  <Sparkles size={13} className="text-sky-400" />
                  <span className="text-xs font-semibold text-sky-400 uppercase tracking-[0.1em]">Framework Extracted</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={handleCopy} className="w-7 h-7 rounded-lg flex items-center justify-center text-creo-text-muted hover:text-creo-text-secondary hover:bg-white/5 transition-all">
                    {copied ? <Check size={13} className="text-green-400 animate-pop-in" /> : <Copy size={13} />}
                  </button>
                  <button onClick={() => setResult(null)} className="text-xs text-creo-text-muted hover:text-creo-text-secondary transition-colors">← New analysis</button>
                </div>
              </div>
              <pre className="p-4 text-sm text-creo-text-secondary leading-relaxed whitespace-pre-wrap font-sans max-h-[45vh] overflow-y-auto">{result}</pre>
            </div>
          )}
        </div>

        {!result && (
          <div className="px-6 py-4 border-t border-white/5 flex-shrink-0">
            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-600 text-white font-semibold text-sm hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {analyzing ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Reverse-engineering their framework...</> : <><Radar size={14} />Analyze & Clone Framework</>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
