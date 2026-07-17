'use client';
import React, { useState } from 'react';
import { Check, Copy, Zap, RefreshCw, Star } from 'lucide-react';
import { toast } from 'sonner';
import { saveToVault } from './WinningVault';

interface Props {
  titles: string[];
  onSelect?: (title: string) => void;
  topic?: string;
  platform?: string;
  plan?: string;
  onRegenerate?: () => void;
  regenerating?: boolean;
}

export default function TitleCards({ titles, onSelect, topic = '', platform = '', plan = 'free', onRegenerate, regenerating = false }: Props) {
  const [selectedTitle, setSelectedTitle] = useState<number | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [savedIndex, setSavedIndex] = useState<number[]>([]);

  const handleCopy = (title: string, index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(title).catch(() => {});
    setCopiedIndex(index);
    toast.success('Title copied!');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleSave = (title: string, index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (savedIndex.includes(index)) return;
    const success = saveToVault({ type: 'title', content: title, topic, platform }, plan);
    if (success) {
      setSavedIndex((prev) => [...prev, index]);
      toast.success('Saved to Winning Vault! ⭐');
    } else {
      toast.error('Vault full! Upgrade to Pro for unlimited storage.');
    }
  };

  const handleSelect = (title: string, index: number) => {
    setSelectedTitle(index);
    toast.success('Great choice! Generating hooks...');
    if (onSelect) setTimeout(() => onSelect(title), 400);
  };

  return (
    <div className="w-full max-w-2xl">
      <div className="flex items-center gap-2 mb-3">
        <Zap size={13} className="text-purple-400" />
        <span className="text-xs font-semibold text-purple-400 uppercase tracking-[0.1em]">Generated Titles — Click to select</span>
      </div>
      <div className="space-y-2">
        {titles.map((title, i) => (
          <div key={`title-${i}`} onClick={() => handleSelect(title, i)}
            style={{ animationDelay: `${i * 90}ms`, animationFillMode: 'both' }}
            className={`group flex items-center justify-between gap-3 rounded-xl px-4 py-3 cursor-pointer border transition-all duration-200 animate-slide-up ${
              selectedTitle === i ? 'bg-purple-500/15 border-purple-500/40 shadow-lg shadow-purple-500/10' : 'glass border-white/8 hover:border-white/15 hover:bg-white/3'
            }`}>
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${selectedTitle === i ? 'border-purple-400 bg-purple-400' : 'border-white/20 group-hover:border-purple-400/50'}`}>
                {selectedTitle === i && <Check size={11} className="text-white" />}
              </div>
              <p className={`text-sm leading-snug ${selectedTitle === i ? 'text-white font-medium' : 'text-white/70'}`}>{title}</p>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
              <button onClick={(e) => handleSave(title, i, e)}
                className={`relative w-7 h-7 rounded-lg flex items-center justify-center transition-all ${savedIndex.includes(i) ? 'text-yellow-400' : 'text-white/25 hover:text-yellow-400 hover:bg-yellow-400/10'}`}>
                {savedIndex.includes(i) && <span className="absolute inset-0 rounded-full bg-yellow-400/40 animate-burst pointer-events-none" />}
                <Star size={13} className={savedIndex.includes(i) ? 'fill-yellow-400 animate-pop-in' : ''} />
              </button>
              <button onClick={(e) => handleCopy(title, i, e)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-white/25 hover:text-white/60 hover:bg-white/5 transition-all">
                {copiedIndex === i ? <Check size={13} className="text-green-400 animate-pop-in" /> : <Copy size={13} />}
              </button>
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
            toast.info('Regenerating titles...');
          }
        }}
        disabled={regenerating}
        className="mt-2 flex items-center gap-1.5 text-xs text-white/35 hover:text-white/55 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <RefreshCw size={12} className={regenerating ? 'animate-spin' : ''} />
        {regenerating ? 'Regenerating...' : 'Regenerate titles'}
      </button>
    </div>
  );
}
