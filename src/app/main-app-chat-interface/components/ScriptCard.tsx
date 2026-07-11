'use client';
import React, { useState } from 'react';
import { Copy, Check, RefreshCw, Download, Wand2, ChevronDown, ChevronUp, Edit3, MessageSquare, Flame, X, Clapperboard, Recycle, Users, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

interface Props { script: string; }

// ✅ POWER TOOLS — every tool that operates on the generated script. Each is
// gated server-side (see PREMIUM_TYPES in the generate route); the client just
// renders the result or an honest upsell. Split by feature weight:
//   Pro   → production tools (Brutal Review, Shot Plan, Resurrect)
//   Ultra → intelligence tools (Audience Simulator, Risk Detector)
const TOOLS = [
  {
    key: 'review', label: 'Brutal Review', runningLabel: 'Reviewing...', icon: Flame,
    tier: 'Pro', color: 'red', title: 'Get your script brutally scored & fixed (Pro)',
    panelTitle: 'Brutal Review', successToast: 'The Brutal Reviewer has spoken 🔥',
  },
  {
    key: 'shotplan', label: 'Shot Plan', runningLabel: 'Planning...', icon: Clapperboard,
    tier: 'Pro', color: 'violet', title: 'Turn this script into a ready-to-film shot list (Pro)',
    panelTitle: 'Script-to-Shot Plan', successToast: 'Your shot list is ready 🎬',
  },
  {
    key: 'resurrect', label: 'Resurrect', runningLabel: 'Reviving...', icon: Recycle,
    tier: 'Pro', color: 'emerald', title: 'Give this content new life — fresh angles, hooks & a remix (Pro)',
    panelTitle: 'Content Resurrection', successToast: 'Back from the dead — fresh angles ready 💀→✨',
  },
  {
    key: 'simulate', label: 'Simulate', runningLabel: 'Simulating...', icon: Users,
    tier: 'Ultra', color: 'sky', title: 'Test how 4 real viewer types would react before you post (Ultra)',
    panelTitle: 'Audience Simulation', successToast: 'Your simulated audience has reacted 🧪',
  },
  {
    key: 'risk', label: 'Risk Check', runningLabel: 'Scanning...', icon: ShieldAlert,
    tier: 'Ultra', color: 'amber', title: 'Find retention leaks before your audience does (Ultra)',
    panelTitle: 'Content Risk Scan', successToast: 'Risk scan complete 🚨',
  },
] as const;

type ToolKey = (typeof TOOLS)[number]['key'];

// Tailwind-safe static class lookups (dynamic template classes get purged).
const TOOL_CLASSES: Record<string, { btn: string; panel: string; header: string; text: string }> = {
  red: { btn: 'border-red-500/20 text-red-400/80 hover:text-red-400 hover:bg-red-500/10', panel: 'border-red-500/25', header: 'bg-red-500/5', text: 'text-red-400' },
  violet: { btn: 'border-violet-500/20 text-violet-400/80 hover:text-violet-400 hover:bg-violet-500/10', panel: 'border-violet-500/25', header: 'bg-violet-500/5', text: 'text-violet-400' },
  emerald: { btn: 'border-emerald-500/20 text-emerald-400/80 hover:text-emerald-400 hover:bg-emerald-500/10', panel: 'border-emerald-500/25', header: 'bg-emerald-500/5', text: 'text-emerald-400' },
  sky: { btn: 'border-sky-500/20 text-sky-400/80 hover:text-sky-400 hover:bg-sky-500/10', panel: 'border-sky-500/25', header: 'bg-sky-500/5', text: 'text-sky-400' },
  amber: { btn: 'border-amber-500/20 text-amber-400/80 hover:text-amber-400 hover:bg-amber-500/10', panel: 'border-amber-500/25', header: 'bg-amber-500/5', text: 'text-amber-400' },
};

export default function ScriptCard({ script }: Props) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedScript, setEditedScript] = useState(script);
  const [runningTool, setRunningTool] = useState<ToolKey | null>(null);
  const [results, setResults] = useState<Partial<Record<ToolKey, string>>>({});

  // ✅ One handler for every power tool — same auth, gating and error pattern
  // that Brutal Reviewer proved out. The server enforces the plan gate BEFORE
  // any credit is spent; Free users get an honest upsell, never a broken panel.
  const runTool = async (tool: (typeof TOOLS)[number]) => {
    if (runningTool) return;
    setRunningTool(tool.key);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const r = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({ idea: editedScript.slice(0, 12000), forceType: tool.key }),
      });
      const d = await r.json();
      if (d?.upgradeRequired) {
        toast.info(d.message || `${tool.panelTitle} is a ${tool.tier} feature — taking you to upgrade!`);
        setTimeout(() => { window.location.href = '/upgrade'; }, 900);
      } else if (d?.limitReached) {
        toast.error("You've hit today's generation limit — upgrade to keep going.", {
          action: { label: 'Upgrade', onClick: () => { window.location.href = '/upgrade'; } },
        });
      } else if (typeof d?.result === 'string' && d.result) {
        setResults((prev) => ({ ...prev, [tool.key]: d.result }));
        toast.success(tool.successToast);
      } else {
        toast.error(d?.message || `${tool.panelTitle} failed — try again in a moment.`);
      }
    } catch {
      toast.error(`${tool.panelTitle} failed — try again in a moment.`);
    }
    setRunningTool(null);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(editedScript).catch(() => {});
    setCopied(true);
    toast.success('Script copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  // ✅ Export as properly formatted HTML that opens in browser and can be printed/saved as PDF
  const handleExport = () => {
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>CRÉO Script</title>
<style>
  body { font-family: Georgia, serif; max-width: 800px; margin: 40px auto; padding: 20px; color: #1a1a1a; line-height: 1.8; }
  h1 { font-size: 24px; color: #6d28d9; border-bottom: 2px solid #6d28d9; padding-bottom: 10px; }
  .meta { color: #666; font-size: 13px; margin-bottom: 30px; }
  pre { white-space: pre-wrap; font-family: Georgia, serif; font-size: 15px; line-height: 1.8; }
  .section { background: #f9f7ff; border-left: 3px solid #6d28d9; padding: 12px 16px; margin: 16px 0; border-radius: 0 8px 8px 0; }
  @media print { body { margin: 20px; } }
</style>
</head>
<body>
<h1>📝 CRÉO Script</h1>
<div class="meta">Generated by CRÉO · ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
<pre>${editedScript.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
<hr style="margin-top:40px;border:none;border-top:1px solid #eee">
<p style="color:#999;font-size:12px;text-align:center">Created with CRÉO — creo.ai · Print this page or Save as PDF</p>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    // Open in new tab so user can read, print, or save as PDF
    window.open(url, '_blank');
    toast.success('Script opened in new tab!', { description: 'Use Ctrl+P to save as PDF or print.' });
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  };

  // ✅ Also keep plain text download option
  const handleDownloadTxt = () => {
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(new Blob([editedScript], { type: 'text/plain' })),
      download: 'creo-script.txt'
    });
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    toast.success('Script downloaded as .txt!');
  };

  const previewLines = editedScript.split('\n').slice(0, 8).join('\n');
  const wordCount = editedScript.split(/\s+/).filter(Boolean).length;
  const estimatedMinutes = Math.round(wordCount / 130);

  return (
    <div className="w-full max-w-2xl">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Wand2 size={13} className="text-violet-400" />
          <span className="text-xs font-semibold text-violet-400 uppercase tracking-[0.1em]">Full Script Generated</span>
        </div>
        <span className="text-[11px] text-white/30">{wordCount} words · ~{estimatedMinutes} min</span>
      </div>

      <div className="glass rounded-2xl border border-violet-500/20 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5 bg-violet-500/5">
          <div className="flex items-center gap-2">
            <button onClick={() => setEditMode(!editMode)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${editMode ? 'bg-violet-500/20 border border-violet-500/30 text-violet-300' : 'glass border border-white/8 text-white/40 hover:text-white/60'}`}>
              <Edit3 size={12} />{editMode ? 'Editing' : 'Edit'}
            </button>
            <button onClick={() => toast.info('AI rewriting...')}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg glass border border-white/8 text-xs font-medium text-white/40 hover:text-white/60 transition-all">
              <RefreshCw size={12} />Regenerate
            </button>
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={handleCopy} className="w-7 h-7 rounded-lg flex items-center justify-center text-white/40 hover:text-white/70 hover:bg-white/5 transition-all" title="Copy to clipboard">
              {copied ? <Check size={13} className="text-green-400 animate-pop-in" /> : <Copy size={13} />}
            </button>
            {/* ✅ Export opens readable HTML in new tab */}
            <button onClick={handleExport} className="flex items-center gap-1 px-2 py-1 rounded-lg glass border border-violet-500/20 text-xs text-violet-400 hover:bg-violet-500/10 transition-all" title="Open & save as PDF">
              <Download size={12} />PDF
            </button>
            {/* ✅ Also download as .txt */}
            <button onClick={handleDownloadTxt} className="flex items-center gap-1 px-2 py-1 rounded-lg glass border border-white/8 text-xs text-white/40 hover:text-white/60 transition-all" title="Download as text file">
              <Download size={12} />TXT
            </button>
          </div>
        </div>

        {/* ✅ POWER TOOLS ROW — Pro production tools + Ultra intelligence tools */}
        <div className="flex flex-wrap items-center gap-1.5 px-4 py-2 border-b border-white/5 bg-white/[0.015]">
          <span className="text-[9px] font-bold uppercase tracking-widest text-white/25 mr-1">Power tools</span>
          {TOOLS.map((tool) => {
            const c = TOOL_CLASSES[tool.color];
            const ToolIcon = tool.icon;
            const isRunning = runningTool === tool.key;
            return (
              <button key={tool.key} onClick={() => runTool(tool)} disabled={!!runningTool} title={tool.title}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg glass border text-xs font-medium transition-all disabled:opacity-50 ${c.btn}`}>
                <ToolIcon size={12} />{isRunning ? tool.runningLabel : tool.label}
                <span className={`text-[8px] font-bold px-1 py-px rounded-full ${tool.tier === 'Ultra' ? 'bg-amber-500/10 text-amber-400' : 'bg-purple-500/10 text-purple-400'}`}>{tool.tier}</span>
              </button>
            );
          })}
        </div>

        <div className="p-4">
          {editMode ? (
            <textarea value={editedScript} onChange={(e) => setEditedScript(e.target.value)}
              className="w-full bg-transparent text-sm text-white/80 leading-relaxed focus:outline-none resize-none min-h-[300px] font-mono" />
          ) : (
            <div>
              <pre className={`text-sm text-white/75 leading-relaxed whitespace-pre-wrap font-sans ${!expanded ? 'max-h-48 overflow-hidden' : ''}`}>
                {expanded ? editedScript : previewLines}
              </pre>
              {!expanded && <div className="relative mt-0"><div className="absolute -top-12 left-0 right-0 h-12 bg-gradient-to-t from-[#0f0f1e] to-transparent pointer-events-none" /></div>}
            </div>
          )}
        </div>

        {!editMode && (
          <button onClick={() => setExpanded(!expanded)}
            className="w-full py-2.5 border-t border-white/5 text-xs text-white/40 hover:text-white/60 flex items-center justify-center gap-1.5 transition-all hover:bg-white/2">
            {expanded ? <><ChevronUp size={13} />Collapse script</> : <><ChevronDown size={13} />Read full script ({wordCount} words)</>}
          </button>
        )}
      </div>

      {/* ✅ Power tool result panels — one per tool that has run */}
      {TOOLS.map((tool) => {
        const result = results[tool.key];
        if (!result) return null;
        const c = TOOL_CLASSES[tool.color];
        const ToolIcon = tool.icon;
        return (
          <div key={`panel-${tool.key}`} className={`mt-3 glass rounded-2xl border overflow-hidden animate-slide-up ${c.panel}`}>
            <div className={`flex items-center justify-between px-4 py-2.5 border-b border-white/5 ${c.header}`}>
              <div className="flex items-center gap-2">
                <ToolIcon size={13} className={c.text} />
                <span className={`text-xs font-semibold uppercase tracking-[0.1em] ${c.text}`}>{tool.panelTitle}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button onClick={() => { navigator.clipboard.writeText(result).catch(() => {}); toast.success('Copied!'); }}
                  className="w-6 h-6 rounded-lg flex items-center justify-center text-white/30 hover:text-white/60 transition-all" title="Copy">
                  <Copy size={12} />
                </button>
                <button onClick={() => setResults((prev) => ({ ...prev, [tool.key]: undefined }))} className="text-white/30 hover:text-white/60"><X size={14} /></button>
              </div>
            </div>
            <pre className="p-4 text-sm text-white/75 leading-relaxed whitespace-pre-wrap font-sans">{result}</pre>
          </div>
        );
      })}

      <div className="mt-3 flex flex-wrap gap-2">
        {['Make intro shorter', 'Add more emotion', 'Change outro CTA', 'Make it funnier', 'Add timestamps'].map((cmd) => (
          <button key={cmd} onClick={() => toast.info(`Applying: "${cmd}"...`)}
            className="px-3 py-1.5 rounded-full glass border border-white/8 text-xs text-white/45 hover:text-white/65 hover:border-white/15 transition-all">
            {cmd}
          </button>
        ))}
      </div>
    </div>
  );
}
