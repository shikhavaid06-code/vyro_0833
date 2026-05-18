'use client';
import React, { useState } from 'react';
import {
  Copy, Check, RefreshCw, Download, Wand2,
  ChevronDown, ChevronUp, Edit3, MessageSquare
} from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  script: string;
}

export default function ScriptCard({ script }: Props) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedScript, setEditedScript] = useState(script);

  const handleCopy = () => {
    navigator.clipboard.writeText(editedScript).catch(() => {});
    setCopied(true);
    toast.success('Full script copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  // ✅ REAL download as .txt file
  const handleExport = () => {
    const blob = new Blob([editedScript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vyro-script.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Script downloaded!', { description: 'Saved as vyro-script.txt' });
  };

  const previewLines = editedScript.split('\n').slice(0, 8).join('\n');
  const wordCount = editedScript.split(/\s+/).filter(Boolean).length;
  const estimatedMinutes = Math.round(wordCount / 130);

  return (
    <div className="w-full max-w-2xl">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Wand2 size={13} className="text-violet-400" />
          <span className="text-xs font-semibold text-violet-400 uppercase tracking-[0.1em]">
            Full Script Generated
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-white/30">{wordCount} words · ~{estimatedMinutes} min</span>
        </div>
      </div>

      <div className="glass rounded-2xl border border-violet-500/20 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5 bg-violet-500/5">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setEditMode(!editMode)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-200 ${
                editMode
                  ? 'bg-violet-500/20 border border-violet-500/30 text-violet-300'
                  : 'glass border border-white/8 text-white/40 hover:text-white/60'
              }`}
            >
              <Edit3 size={12} />
              {editMode ? 'Editing' : 'Edit'}
            </button>
            <button
              onClick={() => toast.info('AI rewriting script...')}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg glass border border-white/8 text-xs font-medium text-white/40 hover:text-white/60 transition-all duration-200"
            >
              <RefreshCw size={12} />
              Regenerate
            </button>
            <button
              onClick={() => toast.info('Opening AI refinement panel...')}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg glass border border-white/8 text-xs font-medium text-white/40 hover:text-white/60 transition-all duration-200"
            >
              <MessageSquare size={12} />
              Refine
            </button>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleCopy}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white/40 hover:text-white/70 hover:bg-white/5 transition-all duration-200"
            >
              {copied ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
            </button>
            <button
              onClick={handleExport}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white/40 hover:text-white/70 hover:bg-white/5 transition-all duration-200"
              title="Download script"
            >
              <Download size={13} />
            </button>
          </div>
        </div>

        <div className="p-4">
          {editMode ? (
            <textarea
              value={editedScript}
              onChange={(e) => setEditedScript(e.target.value)}
              className="w-full bg-transparent text-sm text-white/80 leading-relaxed focus:outline-none resize-none min-h-[300px] font-mono scrollbar-hide"
            />
          ) : (
            <div>
              <pre className={`text-sm text-white/75 leading-relaxed whitespace-pre-wrap font-sans ${!expanded ? 'max-h-48 overflow-hidden' : ''}`}>
                {expanded ? editedScript : previewLines}
              </pre>
              {!expanded && (
                <div className="relative mt-0">
                  <div className="absolute -top-12 left-0 right-0 h-12 bg-gradient-to-t from-[#0f0f1e] to-transparent pointer-events-none" />
                </div>
              )}
            </div>
          )}
        </div>

        {!editMode && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full py-2.5 border-t border-white/5 text-xs text-white/40 hover:text-white/60 flex items-center justify-center gap-1.5 transition-all duration-200 hover:bg-white/2"
          >
            {expanded ? (
              <><ChevronUp size={13} /> Collapse script</>
            ) : (
              <><ChevronDown size={13} /> Read full script ({wordCount} words)</>
            )}
          </button>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {['Make intro shorter', 'Add more emotion', 'Change outro CTA', 'Make it funnier', 'Add timestamps'].map((cmd) => (
          <button
            key={`refine-${cmd}`}
            onClick={() => toast.info(`Applying: "${cmd}"...`)}
            className="px-3 py-1.5 rounded-full glass border border-white/8 text-xs text-white/45 hover:text-white/65 hover:border-white/15 transition-all duration-200"
          >
            {cmd}
          </button>
        ))}
      </div>
    </div>
  );
}
