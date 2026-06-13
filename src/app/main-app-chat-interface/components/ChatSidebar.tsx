'use client';
import React, { useEffect, useState } from 'react';
import { Sparkles, Plus, Trash2, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react';
import AppLogo from '@/components/ui/AppLogo';

interface SavedChat {
  id: string;
  title: string;
  preview: string;
  time: string;
  platform: string;
  generated: number;
}

interface Props {
  isOpen: boolean;
  onToggle: () => void;
  activeChatId: string;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  chats: SavedChat[];
  onDeleteChat: (id: string) => void;
}

export default function ChatSidebar({ isOpen, onToggle, activeChatId, onSelectChat, onNewChat, chats, onDeleteChat }: Props) {
  return (
    <aside className={`fixed lg:static inset-y-0 left-0 z-40 bg-[#0a0a14] border-r border-white/5 flex flex-col transition-all duration-300 ${isOpen ? 'w-72 translate-x-0' : 'w-72 -translate-x-full lg:w-16 lg:translate-x-0'}`}>
      {/* Header */}
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
      </div>

      {/* New chat */}
      <div className="p-3 flex-shrink-0">
        <button onClick={onNewChat} className={`w-full flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-medium transition-all hover:opacity-90 ${isOpen ? 'px-3 py-2.5 justify-start' : 'p-2.5 justify-center'}`}>
          <Plus size={15} />
          {isOpen && <span>New chat</span>}
        </button>
      </div>

      {/* History */}
      <div className="flex-1 overflow-y-auto px-3 space-y-1">
        {isOpen && (
          <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30 px-2 mb-2 mt-1">
            {chats.length > 0 ? 'Recent chats' : 'No history yet'}
          </p>
        )}
        {chats.map((chat) => (
          <div
            key={chat.id}
            onClick={() => onSelectChat(chat.id)}
            className={`group relative rounded-xl cursor-pointer transition-all ${
              activeChatId === chat.id ? 'bg-purple-500/15 border border-purple-500/30' : 'hover:bg-white/5 border border-transparent'
            } ${isOpen ? 'p-3' : 'p-2.5 flex items-center justify-center'}`}
          >
            {isOpen ? (
              <>
                <div className="flex items-start gap-2 mb-1">
                  <MessageSquare size={13} className="text-purple-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs font-medium text-white/80 line-clamp-2 leading-snug">{chat.title}</p>
                </div>
                <div className="flex items-center justify-between text-[10px] text-white/30 pl-5">
                  <span>{chat.platform} · {chat.time}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); onDeleteChat(chat.id); }}
                    className="opacity-0 group-hover:opacity-100 text-white/30 hover:text-red-400 transition-all"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              </>
            ) : (
              <MessageSquare size={15} className="text-purple-400" />
            )}
          </div>
        ))}
      </div>
    </aside>
  );
}
