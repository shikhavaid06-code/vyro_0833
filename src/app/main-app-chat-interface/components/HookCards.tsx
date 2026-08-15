'use client';
import React, { useState } from 'react';
import { Check, Copy, Zap, RefreshCw, Star } from 'lucide-react';
import { toast } from 'sonner';
import { saveToVault } from './WinningVault';

interface Props {
  hooks: string[];
  onSelect?: (hook: string) => void;
  topic?: string;
  platform?: string;
  plan?: string;
  onRegenerate?: () => void;
  regenerating?: boolean;
}

export default function HookCards({ hooks, onSelect, topic = '', platform = '', plan = 'free', onRegenerate, regenerating = false }: Props) {
  const [selectedHook, setSelectedHook] = useState<number | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [savedIndex, setSavedIndex] = useState<number[]>([]);

  const handleCopy = (hook: string, index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(hook).catch(() => {});
    setCopiedIndex(index);
    toast.success('Hook copied!');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleSave = (hook: string, index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (savedIndex.includes(index)) return;
    const success = saveToVault({ type: 'hook', content: hook, topic, platform }, plan);
    if (success) {
      setSavedIndex((prev) => [...prev, index]);
      toast.success('Saved to Winning Vault! ⭐');
    } else {
      toast.error('Vault full! Upgrade to Pro for unlimited storage.');
    }
  };

  const handleSelect = (hook: string, index: number) => {
    setSelectedHook(index);
    toast.success('Hook selected! Generating full script...');
    if (onSelect) setTimeout(() => onSelect(hook), 400);
  };

  const hookTypes = ['Curiosity Hook', 'Story Hook', 'Shock Hook'];

  return (
    <div className="w-full max-w-2xl">
      <div className="flex items-center gap-2 mb-3">
        <Zap size={13} className="text-pink-400" />
        <span className="text-xs font-semibold text-pink-400 uppercase tracking-[0.1em]">Generated Hooks — Select your opening</span>
      </div>
      <div className="space-y-3">
        {hooks.map((hook, i) => (
          <div key={`hook-${i}`} onClick={() => handleSelect(hook, i)}
            style={{ animationDelay: `${i * 120}ms`, animationFillMode: 'both' }}
            className={`group relative rounded-xl px-4 py-4 cursor-pointer border transition-all duration-200 animate-slide-up ${
              selectedHook === i ? 'bg-pink-500/10 border-pink-500/30 shadow-lg shadow-pink-500/10' : 'creo-surface border-white/8 hover:border-white/15 hover:bg-white/3'
            }`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1">
                <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center mt-0.5 transition-all ${selectedHook === i ? 'border-pink-400 bg-pink-400' : 'border-white/20 group-hover:border-pink-400/50'}`}>
                  {selectedHook === i && <Check size={11} className="text-white" />}
                </div>
                <div>
                  <span className={`text-[10px] font-semibold uppercase tracking-wider mb-1.5 block ${selectedHook === i ? 'text-pink-400' : 'text-creo-text-muted'}`}>
                    {hookTypes[i] || `Hook ${i + 1}`}
                  </span>
                  <p className={`text-sm leading-relaxed ${selectedHook === i ? 'text-white' : 'text-creo-text-secondary'}`}>&ldquo;{hook}&rdquo;</p>
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all mt-0.5">
                <button onClick={(e) => handleSave(hook, i, e)}
                  className={`relative w-7 h-7 rounded-lg flex items-center justify-center transition-all ${savedIndex.includes(i) ? 'text-yellow-400' : 'text-creo-text-muted hover:text-yellow-400 hover:bg-yellow-400/10'}`}>
                  {savedIndex.includes(i) && <span className="absolute inset-0 rounded-full bg-yellow-400/40 animate-burst pointer-events-none" />}
                  <Star size={13} className={savedIndex.includes(i) ? 'fill-yellow-400 animate-pop-in' : ''} />
                </button>
                <button onClick={(e) => handleCopy(hook, i, e)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-creo-text-muted hover:text-creo-text-secondary hover:bg-white/5 transition-all">
                  {copiedIndex === i ? <Check size={13} className="text-green-400 animate-pop-in" /> : <Copy size={13} />}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={() => {
          if (regenerating) return;
          if (onRegenerate) {
            onRegenerate();
          } else {
            toast.info('Regenerating hooks...');
          }
        }}
        disabled={regenerating}
        className="mt-2 flex items-center gap-1.5 text-xs text-creo-text-muted hover:text-creo-text-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <RefreshCw size={12} className={regenerating ? 'animate-spin' : ''} />
        {regenerating ? 'Regenerating...' : 'Regenerate hooks'}
      </button>
    </div>
  );
}
