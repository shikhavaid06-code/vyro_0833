'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, MessageSquare, ChevronLeft, ChevronRight, X, Clock, Crown, Zap, Sparkles } from 'lucide-react';
import AppLogo from '@/components/ui/AppLogo';

interface SavedChat { id: string; title: string; preview: string; time: string; platform: string; generated: number; }
interface Props { isOpen: boolean; onToggle: () => void; activeChatId: string; onSelectChat: (id: string) => void; onNewChat: () => void; chats: SavedChat[]; onDeleteChat: (id: string) => void; }

// ✅ REDESIGN PASS (Aug 2026) — same structure, props, and logic as before.
// Only the visual language changed: flat near-black surfaces instead of the
// old semi-transparent glass, a single restrained purple accent instead of
// the purple-to-pink gradient everywhere, hairline borders instead of blur.
export default function ChatSidebar({ isOpen, onToggle, activeChatId, onSelectChat, onNewChat, chats, onDeleteChat }: Props) {
  const router = useRouter();
  const [user, setUser] = useState<{ name?: string; email?: string; plan?: string }>({});
  useEffect(() => {
    try { setUser(JSON.parse(localStorage.getItem('creo_current_user') || '{}')); } catch {}
  }, []);
  const plan = user.plan || 'free';
  return (
    <>
      {isOpen && <div className="fixed inset-0 z-30 bg-black/60 lg:hidden" onClick={onToggle} />}
      <aside className={`fixed inset-y-0 left-0 z-40 bg-creo-bg border-r border-creo-border flex flex-col transition-all duration-300
        ${isOpen ? 'w-72 translate-x-0' : '-translate-x-full'}
        lg:static lg:translate-x-0 ${isOpen ? 'lg:w-72' : 'lg:w-16'}`}>

        <div className="h-14 flex items-center justify-between px-4 border-b border-creo-border flex-shrink-0">
          {isOpen && (
            <div className="flex items-center gap-2">
              <AppLogo size={22} />
              <span className="font-sans text-sm font-semibold text-creo-text-primary">CRÉO</span>
            </div>
          )}
          <button onClick={onToggle} className="w-7 h-7 rounded-lg creo-surface flex items-center justify-center text-creo-text-muted hover:text-creo-text-primary transition-all hidden lg:flex">
            {isOpen ? <ChevronLeft size={13} /> : <ChevronRight size={13} />}
          </button>
          <button onClick={onToggle} className="w-7 h-7 rounded-lg creo-surface flex items-center justify-center text-creo-text-muted hover:text-creo-text-primary transition-all lg:hidden">
            <X size={13} />
          </button>
        </div>

        <div className="p-3 flex-shrink-0">
          <button onClick={onNewChat} className={`creo-btn-primary w-full flex items-center gap-2 rounded-xl text-white text-sm font-medium active:scale-95 ${isOpen ? 'px-3 py-2.5 justify-start' : 'p-2.5 justify-center'}`}>
            <Plus size={15} />
            {isOpen && <span>New chat</span>}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-4">
          {isOpen && chats.length > 0 && (
            <div className="flex items-center gap-2 px-2 mb-3 mt-1">
              <Clock size={10} className="text-creo-text-muted" />
              <p className="creo-caption uppercase tracking-widest text-creo-text-muted">Recent</p>
            </div>
          )}
          {isOpen && chats.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="w-10 h-10 rounded-xl creo-surface flex items-center justify-center">
                <MessageSquare size={16} className="text-creo-text-muted" />
              </div>
              <p className="creo-caption text-creo-text-muted text-center leading-relaxed">Your chats will<br />appear here</p>
            </div>
          )}

          <div className="space-y-1">
            {chats.map((chat) => (
              <div key={chat.id}
                onClick={() => { onSelectChat(chat.id); if (window.innerWidth < 1024) onToggle(); }}
                className={`group relative rounded-xl cursor-pointer transition-all duration-200 ${
                  activeChatId === chat.id
                    ? 'bg-creo-primary/10 border border-creo-primary/30'
                    : 'hover:bg-creo-surface border border-transparent hover:border-creo-border'
                } ${isOpen ? 'p-3' : 'p-2.5 flex items-center justify-center'}`}>
                {isOpen ? (
                  <>
                    <div className="flex items-start gap-2.5 mb-1.5">
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 ${activeChatId === chat.id ? 'bg-creo-primary/25' : 'bg-creo-surface'}`}>
                        <MessageSquare size={11} className={activeChatId === chat.id ? 'text-creo-primary' : 'text-creo-text-muted'} />
                      </div>
                      <p className="creo-body font-medium text-creo-text-secondary line-clamp-2 leading-snug flex-1">{chat.title}</p>
                    </div>
                    <div className="flex items-center justify-between pl-7">
                      <span className="creo-caption text-creo-text-muted">{chat.platform} · {chat.time}</span>
                      <button onClick={(e) => { e.stopPropagation(); onDeleteChat(chat.id); }}
                        className="opacity-0 group-hover:opacity-100 w-5 h-5 rounded flex items-center justify-center text-creo-text-muted hover:text-creo-danger hover:bg-creo-danger/10 transition-all">
                        <Trash2 size={10} />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className={`w-6 h-6 rounded-md flex items-center justify-center ${activeChatId === chat.id ? 'bg-creo-primary/25' : 'bg-creo-surface'}`}>
                    <MessageSquare size={13} className={activeChatId === chat.id ? 'text-creo-primary' : 'text-creo-text-muted'} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* User card, pinned to the bottom, tap for settings — same destination/logic as before */}
        <div className="flex-shrink-0 border-t border-creo-border p-3">
          {isOpen ? (
            <button onClick={() => router.push('/settings')}
              className="w-full flex items-center gap-3 rounded-xl p-2.5 creo-surface hover:border-creo-primary/30 transition-all text-left group">
              <div className="w-9 h-9 rounded-xl bg-creo-primary flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-white">{(user.name || 'C')[0]?.toUpperCase()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="creo-body font-semibold text-creo-text-secondary truncate">{user.name || 'Creator'}</p>
                <p className="creo-caption text-creo-text-muted truncate">{user.email || 'Tap for settings'}</p>
              </div>
              <span className={`flex items-center gap-1 creo-caption font-bold px-2 py-1 rounded-full uppercase tracking-wide flex-shrink-0 ${
                plan === 'ultra' ? 'bg-creo-warning/10 text-creo-warning border border-creo-warning/25'
                : plan === 'pro' ? 'bg-creo-primary/10 text-creo-primary border border-creo-primary/25'
                : 'bg-creo-surface text-creo-text-muted border border-creo-border'
              }`}>
                {plan === 'ultra' ? <Crown size={9} /> : plan === 'pro' ? <Zap size={9} /> : <Sparkles size={9} />}{plan}
              </span>
            </button>
          ) : (
            <button onClick={() => router.push('/settings')} className="w-full flex justify-center">
              <div className="w-9 h-9 rounded-xl bg-creo-primary flex items-center justify-center hover:opacity-90 transition-all">
                <span className="text-sm font-bold text-white">{(user.name || 'C')[0]?.toUpperCase()}</span>
              </div>
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
