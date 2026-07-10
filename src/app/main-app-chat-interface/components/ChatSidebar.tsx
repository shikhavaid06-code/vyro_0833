'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, MessageSquare, ChevronLeft, ChevronRight, X, Clock, Crown, Zap, Sparkles } from 'lucide-react';
import AppLogo from '@/components/ui/AppLogo';

interface SavedChat { id: string; title: string; preview: string; time: string; platform: string; generated: number; }
interface Props { isOpen: boolean; onToggle: () => void; activeChatId: string; onSelectChat: (id: string) => void; onNewChat: () => void; chats: SavedChat[]; onDeleteChat: (id: string) => void; }

export default function ChatSidebar({ isOpen, onToggle, activeChatId, onSelectChat, onNewChat, chats, onDeleteChat }: Props) {
  const router = useRouter();
  const [user, setUser] = useState<{ name?: string; email?: string; plan?: string }>({});
  useEffect(() => {
    try { setUser(JSON.parse(localStorage.getItem('creo_current_user') || '{}')); } catch {}
  }, []);
  const plan = user.plan || 'free';
  return (
    <>
      {isOpen && <div className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden" onClick={onToggle} />}
      <aside className={`fixed inset-y-0 left-0 z-40 bg-[#0a0a14] border-r border-white/5 flex flex-col transition-all duration-300
        ${isOpen ? 'w-72 translate-x-0' : '-translate-x-full'}
        lg:static lg:translate-x-0 ${isOpen ? 'lg:w-72' : 'lg:w-16'}`}>

        <div className="h-14 flex items-center justify-between px-4 border-b border-white/5 flex-shrink-0">
          {isOpen && (
            <div className="flex items-center gap-2">
              <AppLogo size={22} />
              <span className="font-display text-sm font-semibold text-white">CRÉO</span>
            </div>
          )}
          <button onClick={onToggle} className="w-7 h-7 rounded-lg glass border border-white/8 flex items-center justify-center text-white/40 hover:text-white transition-all hidden lg:flex">
            {isOpen ? <ChevronLeft size={13} /> : <ChevronRight size={13} />}
          </button>
          <button onClick={onToggle} className="w-7 h-7 rounded-lg glass border border-white/8 flex items-center justify-center text-white/40 hover:text-white transition-all lg:hidden">
            <X size={13} />
          </button>
        </div>

        <div className="p-3 flex-shrink-0">
          <button onClick={onNewChat} className={`w-full flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-medium transition-all hover:opacity-90 active:scale-95 ${isOpen ? 'px-3 py-2.5 justify-start' : 'p-2.5 justify-center'}`}>
            <Plus size={15} />
            {isOpen && <span>New chat</span>}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-4">
          {isOpen && chats.length > 0 && (
            <div className="flex items-center gap-2 px-2 mb-3 mt-1">
              <Clock size={10} className="text-white/20" />
              <p className="text-[10px] font-semibold uppercase tracking-widest text-white/25">Recent</p>
            </div>
          )}
          {isOpen && chats.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                <MessageSquare size={16} className="text-white/20" />
              </div>
              <p className="text-xs text-white/25 text-center leading-relaxed">Your chats will<br />appear here</p>
            </div>
          )}

          <div className="space-y-1">
            {chats.map((chat) => (
              <div key={chat.id}
                onClick={() => { onSelectChat(chat.id); if (window.innerWidth < 1024) onToggle(); }}
                className={`group relative rounded-xl cursor-pointer transition-all duration-200 ${
                  activeChatId === chat.id
                    ? 'bg-purple-500/15 border border-purple-500/25'
                    : 'hover:bg-white/5 border border-transparent hover:border-white/5'
                } ${isOpen ? 'p-3' : 'p-2.5 flex items-center justify-center'}`}>
                {isOpen ? (
                  <>
                    <div className="flex items-start gap-2.5 mb-1.5">
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 ${activeChatId === chat.id ? 'bg-purple-500/30' : 'bg-white/5'}`}>
                        <MessageSquare size={11} className={activeChatId === chat.id ? 'text-purple-400' : 'text-white/30'} />
                      </div>
                      <p className="text-xs font-medium text-white/75 line-clamp-2 leading-snug flex-1">{chat.title}</p>
                    </div>
                    <div className="flex items-center justify-between pl-7">
                      <span className="text-[10px] text-white/25">{chat.platform} · {chat.time}</span>
                      <button onClick={(e) => { e.stopPropagation(); onDeleteChat(chat.id); }}
                        className="opacity-0 group-hover:opacity-100 w-5 h-5 rounded flex items-center justify-center text-white/25 hover:text-red-400 hover:bg-red-400/10 transition-all">
                        <Trash2 size={10} />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className={`w-6 h-6 rounded-md flex items-center justify-center ${activeChatId === chat.id ? 'bg-purple-500/30' : 'bg-white/5'}`}>
                    <MessageSquare size={13} className={activeChatId === chat.id ? 'text-purple-400' : 'text-white/30'} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ✅ Premium touch — user card pinned to the bottom, tap for settings */}
        <div className="flex-shrink-0 border-t border-white/5 p-3">
          {isOpen ? (
            <button onClick={() => router.push('/settings')}
              className="w-full flex items-center gap-3 rounded-xl p-2.5 glass border border-white/8 hover:border-purple-500/25 hover:bg-purple-500/5 transition-all text-left group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-white">{(user.name || 'C')[0]?.toUpperCase()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white/80 truncate">{user.name || 'Creator'}</p>
                <p className="text-[10px] text-white/30 truncate">{user.email || 'Tap for settings'}</p>
              </div>
              <span className={`flex items-center gap-1 text-[9px] font-bold px-2 py-1 rounded-full uppercase tracking-wide flex-shrink-0 ${
                plan === 'ultra' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/25'
                : plan === 'pro' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/25'
                : 'bg-white/5 text-white/40 border border-white/10'
              }`}>
                {plan === 'ultra' ? <Crown size={9} /> : plan === 'pro' ? <Zap size={9} /> : <Sparkles size={9} />}{plan}
              </span>
            </button>
          ) : (
            <button onClick={() => router.push('/settings')} className="w-full flex justify-center">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center hover:opacity-90 transition-all">
                <span className="text-sm font-bold text-white">{(user.name || 'C')[0]?.toUpperCase()}</span>
              </div>
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
