'use client';
import React, { useState } from 'react';
import { Check, Copy, Zap, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  titles: string[];
}

export default function TitleCards({ titles }: Props) {
  const [selectedTitle, setSelectedTitle] = useState<number | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (title: string, index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(title).catch(() => {});
    setCopiedIndex(index);
    toast.success('Title copied to clipboard');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="w-full max-w-2xl">
      <div className="flex items-center gap-2 mb-3">
        <Zap size={13} className="text-purple-400" />
        <span className="text-xs font-semibold text-purple-400 uppercase tracking-[0.1em]">
          Generated Titles — Click to select
        </span>
      </div>
      <div className="space-y-2">
        {titles.map((title, i) => (
          <div
            key={`title-card-${i}`}
            onClick={() => {
              setSelectedTitle(i);
              toast.success('Title selected! Generating hooks...');
            }}
            className={`group flex items-center justify-between gap-3 rounded-xl px-4 py-3 cursor-pointer border transition-all duration-200 ${
              selectedTitle === i
                ? 'bg-purple-500/15 border-purple-500/40 shadow-lg shadow-purple-500/10'
                : 'glass border-white/8 hover:border-white/15 hover:bg-white/3'
            }`}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all duration-200 ${
                selectedTitle === i
                  ? 'border-purple-400 bg-purple-400' :'border-white/20 group-hover:border-purple-400/50'
              }`}>
                {selectedTitle === i && <Check size={11} className="text-white" />}
              </div>
              <p className={`text-sm leading-snug ${
                selectedTitle === i ? 'text-white font-medium' : 'text-white/70'
              }`}>
                {title}
              </p>
            </div>
            <button
              onClick={(e) => handleCopy(title, i, e)}
              className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-white/25 hover:text-white/60 hover:bg-white/5 opacity-0 group-hover:opacity-100 transition-all duration-200"
            >
              {copiedIndex === i ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={() => toast.info('Regenerating titles...')}
        className="mt-2 flex items-center gap-1.5 text-xs text-white/35 hover:text-white/55 transition-colors duration-200"
      >
        <RefreshCw size={12} />
        Regenerate titles
      </button>
    </div>
  );
}