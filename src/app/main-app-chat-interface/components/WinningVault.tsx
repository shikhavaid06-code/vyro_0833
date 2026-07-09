'use client';
import React, { useState, useEffect } from 'react';
import { Star, Trash2, Copy, Check, X, Zap, FileText, Sparkles, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export interface VaultItem {
  id: string;
  type: 'hook' | 'title' | 'script';
  content: string;
  topic: string;
  platform: string;
  savedAt: string;
}

const VAULT_KEY = 'creo_winning_vault';
const FREE_LIMIT = 20;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  plan: string;
}

export function saveToVault(item: Omit<VaultItem, 'id' | 'savedAt'>, plan: string): boolean {
  try {
    const existing: VaultItem[] = JSON.parse(localStorage.getItem(VAULT_KEY) || '[]');
    if (plan === 'free' && existing.length >= FREE_LIMIT) return false;
    const newItem: VaultItem = { ...item, id: `vault-${Date.now()}`, savedAt: new Date().toISOString() };
    localStorage.setItem(VAULT_KEY, JSON.stringify([newItem, ...existing]));
    return true;
  } catch { return false; }
}

export default function WinningVault({ isOpen, onClose, plan }: Props) {
  const router = useRouter();
  const [items, setItems] = useState<VaultItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'hook' | 'title' | 'script'>('all');
  const [copied, setCopied] = useState('');

  useEffect(() => {
    if (isOpen) {
      const stored = JSON.parse(localStorage.getItem(VAULT_KEY) || '[]');
      setItems(stored);
    }
  }, [isOpen]);

  const handleDelete = (id: string) => {
    const updated = items.filter((i) => i.id !== id);
    setItems(updated);
    localStorage.setItem(VAULT_KEY, JSON.stringify(updated));
    toast.success('Removed from vault');
  };

  const handleCopy = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopied(id);
    toast.success('Copied!');
    setTimeout(() => setCopied(''), 2000);
  };

  const filtered = filter === 'all' ? items : items.filter((i) => i.type === filter);
  const isFree = plan === 'free';

  const typeIcon = (type: string) => {
    if (type === 'hook') return <Zap size={11} className="text-pink-400" />;
    if (type === 'title') return <Sparkles size={11} className="text-purple-400" />;
    return <FileText size={11} className="text-violet-400" />;
  };

  const typeColor = (type: string) => {
    if (type === 'hook') return 'bg-pink-500/10 border-pink-500/20 text-pink-400';
    if (type === 'title') return 'bg-purple-500/10 border-purple-500/20 text-purple-400';
    return 'bg-violet-500/10 border-violet-500/20 text-violet-400';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/70 backdrop-blur-sm animate-backdrop-in">
      <div className="w-full max-w-2xl bg-[#0d0d1f] border border-purple-500/20 rounded-2xl flex flex-col max-h-[85vh] animate-modal-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-yellow-500/20 to-amber-500/20 border border-yellow-500/20 flex items-center justify-center">
              <Star size={16} className="text-yellow-400 fill-yellow-400" />
            </div>
            <div>
              <h2 className="text-white font-semibold text-base">Winning Vault</h2>
              <p className="text-white/30 text-xs">{items.length}{isFree ? `/${FREE_LIMIT}` : ''} saved · {isFree ? 'Free plan' : plan}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg glass border border-white/8 flex items-center justify-center text-white/30 hover:text-white transition-all">
            <X size={14} />
          </button>
        </div>

        {/* Free limit warning */}
        {isFree && items.length >= FREE_LIMIT && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex-shrink-0">
            <p className="text-amber-400 text-xs font-medium">Vault full! Upgrade to Pro for unlimited storage.</p>
          </div>
        )}

        {/* Filter tabs */}
        <div className="flex gap-2 px-6 py-3 border-b border-white/5 flex-shrink-0">
          <Filter size={13} className="text-white/30 mt-0.5" />
          {(['all', 'hook', 'title', 'script'] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all capitalize ${filter === f ? 'bg-purple-500/20 border border-purple-500/30 text-purple-300' : 'glass border border-white/8 text-white/40 hover:text-white/60'}`}>
              {f === 'all' ? `All (${items.length})` : `${f}s (${items.filter(i => i.type === f).length})`}
            </button>
          ))}
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
                <Star size={22} className="text-yellow-400/50" />
              </div>
              <p className="text-white/40 text-sm text-center">Your vault is empty.<br />Save your best hooks, titles and scripts here.</p>
            </div>
          ) : (
            filtered.map((item) => (
              <div key={item.id} className="glass rounded-xl border border-white/8 p-4 group hover:border-white/12 transition-all">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-semibold capitalize ${typeColor(item.type)}`}>
                      {typeIcon(item.type)}{item.type}
                    </span>
                    {item.platform && <span className="text-[10px] text-white/30">{item.platform}</span>}
                    {item.topic && <span className="text-[10px] text-white/20 truncate max-w-[150px]">{item.topic}</span>}
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button onClick={() => handleCopy(item.content, item.id)}
                      className="w-6 h-6 rounded-lg flex items-center justify-center text-white/30 hover:text-white/70 hover:bg-white/5 transition-all">
                      {copied === item.id ? <Check size={11} className="text-green-400" /> : <Copy size={11} />}
                    </button>
                    <button onClick={() => handleDelete(item.id)}
                      className="w-6 h-6 rounded-lg flex items-center justify-center text-white/30 hover:text-red-400 hover:bg-red-400/10 transition-all">
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
                <p className="text-white/70 text-sm leading-relaxed line-clamp-3">{item.content}</p>
                <p className="text-white/20 text-[10px] mt-2">{new Date(item.savedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</p>
              </div>
            ))
          )}
        </div>

        {/* Upgrade prompt for free users */}
        {isFree && (
          <div className="px-6 py-4 border-t border-white/5 flex-shrink-0">
            <button onClick={() => router.push('/upgrade')} className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-semibold hover:opacity-90 active:scale-[0.98] transition-all">
              Upgrade to Pro — Unlimited Vault Storage
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
