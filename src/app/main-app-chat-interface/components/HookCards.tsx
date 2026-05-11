'use client';
import React, { useState } from 'react';
import { Check, Copy, Zap, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  hooks: string[];
  onSelect?: (hook: string) => void;
}

export default function HookCards({ hooks, onSelect }: Props) {
  const [selectedHook, setSelectedHook] = useState<number | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (hook: string, index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(hook).catch(() => {});
    setCopiedIndex(index);
    toast.success('Hook copied!');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleSelect = (hook: string, index: number) => {
    setSelectedHook(index);
    toast.success('Hook selected! Generating full script...');
    if (onSelect) {
      setTimeout(() => onSelect(hook), 400);
    }
  };

  const hookTypes = ['Curiosity Hook', 'Story Hook', 'Shock Hook'];

  return (
    <div className="w-full max-w-2xl">
      <div className="flex items-center gap-2 mb-3">
        <Zap size={13} className="text-pink-400" />
        <span className="text-xs font-semibold text-pink-400 uppercase tracking-[0.1em]">
          Generated Hooks — Select your opening
        </span>
      </div>
      <div className="space-y-3">
        {hooks.map((hook, i) => (
          <div
            key={`hook-card-${i}`}
            onClick={() => handleSelect(hook, i)}
            className={`group relative rounded-xl px-4 py-4 cursor-pointer border transition-all duration-200 ${
              selectedHook === i
                ? 'bg-pink-500/10 border-pink-500/30 shadow-lg shadow-pink-500/10'
                : 'glass border-white/8 hover:border-white/15 hover:bg-white/3'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1">
                <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center mt-0.5 transition-all duration-200 ${
                  selectedHook === i
                    ? 'border-pink-400 bg-pink-400' : 'border-white/20 group-hover:border-pink-400/50'
                }`}>
                  {selectedHook === i && <Check size={11} className="text-white" />}
                </div>
                <div>
                  <span className={`text-[10px] font-semibold uppercase tracking-wider mb-1.5 block ${
                    selectedHook === i ? 'text-pink-400' : 'text-white/30'
                  }`}>
                    {hookTypes[i] || `Hook ${i + 1}`}
                  </span>
                  <p className={`text-sm leading-relaxed ${
                    selectedHook === i ? 'text-white' : 'text-white/70'
                  }`}>
                    &ldquo;{hook}&rdquo;
                  </p>
                </div>
              </div>
              <button
                onClick={(e) => handleCopy(hook, i, e)}
                className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-white/25 hover:text-white/60 hover:bg-white/5 opacity-0 group-hover:opacity-100 transition-all duration-200 mt-0.5"
              >
                {copiedIndex === i ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
              </button>
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={() => toast.info('Regenerating hooks...')}
        className="mt-2 flex items-center gap-1.5 text-xs text-white/35 hover:text-white/55 transition-colors duration-200"
      >
        <RefreshCw size={12} />
        Regenerate hooks
      </button>
    </div>
  );
}
