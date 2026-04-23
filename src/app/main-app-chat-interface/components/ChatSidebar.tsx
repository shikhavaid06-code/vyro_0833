'use client';
import React, { useState } from 'react';

import AppLogo from '@/components/ui/AppLogo';
import { Plus, Search, ChevronLeft, ChevronRight, MessageSquare, Crown, Zap, Settings, LogOut, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import Icon from '@/components/ui/AppIcon';


const chatHistory = [
  {
    id: 'chat-001',
    title: 'AI tools for students → viral YouTube',
    preview: 'Generated 8 titles, 3 hooks...',
    time: '2m ago',
    platform: 'YouTube',
    generated: 12,
  },
  {
    id: 'chat-002',
    title: 'Morning routine productivity hacks',
    preview: 'Script generated for 8-min video',
    time: '1h ago',
    platform: 'Instagram',
    generated: 7,
  },
  {
    id: 'chat-003',
    title: 'How I saved $10k in 6 months',
    preview: 'Hook selected, script in progress',
    time: '3h ago',
    platform: 'TikTok',
    generated: 5,
  },
  {
    id: 'chat-004',
    title: 'Best budget cameras for creators 2026',
    preview: 'Titles generated, awaiting hook selection',
    time: 'Yesterday',
    platform: 'YouTube',
    generated: 9,
  },
  {
    id: 'chat-005',
    title: 'Why most creators quit in year 1',
    preview: 'Full script exported',
    time: 'Yesterday',
    platform: 'YouTube',
    generated: 15,
  },
  {
    id: 'chat-006',
    title: 'Gym motivation — dark academia aesthetic',
    preview: 'Multi-platform optimized',
    time: '2 days ago',
    platform: 'TikTok',
    generated: 11,
  },
  {
    id: 'chat-007',
    title: 'Passive income ideas that actually work',
    preview: 'Script completed',
    time: '3 days ago',
    platform: 'Instagram',
    generated: 8,
  },
];

const platformColors: Record<string, string> = {
  YouTube: 'bg-red-500/15 text-red-400',
  TikTok: 'bg-cyan-500/15 text-cyan-400',
  Instagram: 'bg-pink-500/15 text-pink-400',
};

interface Props {
  isOpen: boolean;
  onToggle: () => void;
  activeChatId: string;
  onSelectChat: (id: string) => void;
}

export default function ChatSidebar({ isOpen, onToggle, activeChatId, onSelectChat }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredChat, setHoveredChat] = useState<string | null>(null);

  const filtered = chatHistory.filter(
    (c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.platform.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleNewChat = () => {
    toast.success('New chat started', { description: 'Drop your idea to begin generating content.' });
  };

  const handleDeleteChat = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toast.success('Chat deleted');
  };

  return (
    <aside
      className={`fixed left-0 top-0 h-full z-40 flex flex-col bg-[#0a0a18] border-r border-white/5 transition-all duration-300 ease-in-out ${
        isOpen ? 'w-72' : 'w-16'
      }`}
    >
      {/* Header */}
      <div className={`flex items-center h-16 px-4 border-b border-white/5 flex-shrink-0 ${isOpen ? 'justify-between' : 'justify-center'}`}>
        {isOpen && (
          <div className="flex items-center gap-2 overflow-hidden">
            <AppLogo size={26} />
            <span className="font-display text-lg font-semibold text-white whitespace-nowrap">VYRO</span>
          </div>
        )}
        <button
          onClick={onToggle}
          className="w-8 h-8 rounded-lg glass border border-white/8 flex items-center justify-center text-white/40 hover:text-white hover:border-white/20 transition-all duration-200 flex-shrink-0"
          aria-label="Toggle sidebar"
        >
          {isOpen ? <ChevronLeft size={15} /> : <ChevronRight size={15} />}
        </button>
      </div>

      {/* New chat button */}
      <div className={`p-3 flex-shrink-0 ${isOpen ? '' : 'flex justify-center'}`}>
        <button
          onClick={handleNewChat}
          className={`flex items-center gap-2.5 bg-gradient-vyro text-white font-semibold text-sm rounded-xl hover:scale-[1.02] active:scale-95 transition-all duration-200 glow-button ${
            isOpen ? 'w-full px-4 py-3' : 'w-10 h-10 justify-center'
          }`}
        >
          <Plus size={16} className="flex-shrink-0" />
          {isOpen && <span>New Content</span>}
        </button>
      </div>

      {/* Search */}
      {isOpen && (
        <div className="px-3 pb-3 flex-shrink-0">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chats..."
              className="w-full pl-8 pr-3 py-2 rounded-xl glass border border-white/8 text-xs text-white placeholder:text-white/25 focus:outline-none focus:border-purple-500/40 transition-colors duration-200 bg-transparent"
            />
          </div>
        </div>
      )}

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto scrollbar-hide px-3 pb-3 space-y-1">
        {isOpen && (
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/20 px-2 py-2">
            Recent
          </p>
        )}
        {filtered.map((chat) => (
          <div
            key={chat.id}
            className={`group relative rounded-xl cursor-pointer transition-all duration-200 ${
              activeChatId === chat.id
                ? 'bg-purple-500/10 border border-purple-500/20' :'hover:bg-white/3 border border-transparent hover:border-white/5'
            } ${isOpen ? 'px-3 py-2.5' : 'flex justify-center items-center h-10 w-10 mx-auto'}`}
            onClick={() => onSelectChat(chat.id)}
            onMouseEnter={() => setHoveredChat(chat.id)}
            onMouseLeave={() => setHoveredChat(null)}
          >
            {isOpen ? (
              <>
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm font-medium truncate flex-1 leading-tight ${
                    activeChatId === chat.id ? 'text-white' : 'text-white/70'
                  }`}>
                    {chat.title}
                  </p>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {hoveredChat === chat.id && (
                      <button
                        onClick={(e) => handleDeleteChat(chat.id, e)}
                        className="w-6 h-6 rounded-lg flex items-center justify-center text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                    <span className="text-[10px] text-white/25 whitespace-nowrap">{chat.time}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md ${platformColors[chat.platform]}`}>
                    {chat.platform}
                  </span>
                  <span className="text-[10px] text-white/25 truncate">{chat.preview}</span>
                </div>
              </>
            ) : (
              <div
                title={chat.title}
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  activeChatId === chat.id ? 'bg-purple-500/20' : 'bg-white/5'
                }`}
              >
                <MessageSquare size={14} className={activeChatId === chat.id ? 'text-purple-400' : 'text-white/40'} />
              </div>
            )}
          </div>
        ))}

        {filtered.length === 0 && isOpen && (
          <div className="text-center py-8">
            <MessageSquare size={24} className="text-white/15 mx-auto mb-2" />
            <p className="text-white/25 text-xs">No chats found</p>
          </div>
        )}
      </div>

      {/* Plan badge */}
      {isOpen && (
        <div className="px-3 pb-3 flex-shrink-0">
          <div className="glass rounded-xl p-3 border border-purple-500/15">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Zap size={13} className="text-purple-400" />
                <span className="text-xs font-semibold text-white/80">Pro Plan</span>
              </div>
              <span className="text-[10px] text-purple-400 font-medium">72/100 today</span>
            </div>
            <div className="w-full h-1.5 bg-white/8 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-vyro rounded-full" style={{ width: '72%' }} />
            </div>
            <button className="w-full mt-2.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500/20 to-pink-500/20 border border-amber-500/20 text-[11px] font-semibold text-amber-400 hover:from-amber-500/30 hover:to-pink-500/30 transition-all duration-200 flex items-center justify-center gap-1">
              <Crown size={11} />
              Upgrade to Ultra
            </button>
          </div>
        </div>
      )}

      {/* Bottom nav */}
      <div className={`border-t border-white/5 p-3 space-y-1 flex-shrink-0 ${isOpen ? '' : 'flex flex-col items-center'}`}>
        {[
          { icon: Settings, label: 'Settings' },
          { icon: LogOut, label: 'Sign Out', action: () => toast.info('Signing out...') },
        ].map(({ icon: Icon, label, action }) => (
          <button
            key={`sidebar-bottom-${label}`}
            onClick={action}
            className={`flex items-center gap-3 text-white/40 hover:text-white/70 transition-all duration-200 rounded-xl hover:bg-white/3 ${
              isOpen ? 'w-full px-3 py-2' : 'w-10 h-10 justify-center'
            }`}
            title={label}
          >
            <Icon size={16} className="flex-shrink-0" />
            {isOpen && <span className="text-sm">{label}</span>}
          </button>
        ))}
      </div>
    </aside>
  );
}