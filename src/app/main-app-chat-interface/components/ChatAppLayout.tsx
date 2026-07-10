'use client';
import React, { useState, useCallback, useEffect } from 'react';
import ChatSidebar from './ChatSidebar';
import ChatMainArea from './ChatMainArea';
import FloatingAssistant from './FloatingAssistant';

interface SavedChat { id: string; title: string; preview: string; time: string; platform: string; generated: number; }
const STORAGE_KEY = 'creo_chat_history';

export default function ChatAppLayout() {
  // ✅ Sidebar closed by default on mobile, open on desktop
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeChatId, setActiveChatId] = useState('');
  const [resetKey, setResetKey] = useState(0);
  const [savedChats, setSavedChats] = useState<SavedChat[]>([]);
  // ✅ Nova's open/closed state now lives up here, one level above
  // ChatMainArea's own remount boundary (it remounts on "New chat" via
  // `key={resetKey}`) — so switching or starting chats no longer force-closes
  // Nova mid-conversation. The topbar button that opens her now lives inside
  // ChatMainArea (next to Vault/Brain/Intel) instead of a corner-floating
  // launcher, which is what made her easy to miss/collide with other UI.
  const [showNova, setShowNova] = useState(false);

  useEffect(() => {
    // ✅ Open sidebar by default on desktop only
    if (window.innerWidth >= 1024) setSidebarOpen(true);
  }, []);

  useEffect(() => {
    try { const s = localStorage.getItem(STORAGE_KEY); if (s) setSavedChats(JSON.parse(s)); } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(savedChats)); } catch {}
  }, [savedChats]);

  const handleNewChat = useCallback(() => {
    const newId = `chat-${Date.now()}`;
    setActiveChatId(newId);
    setResetKey((prev) => prev + 1);
  }, []);

  const handleChatSaved = useCallback((title: string, platform: string) => {
    const newChat: SavedChat = {
      id: activeChatId || `chat-${Date.now()}`,
      title, preview: 'Generating content...',
      time: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      platform, generated: 1,
    };
    setSavedChats((prev) => {
      if (prev.find((c) => c.id === newChat.id)) return prev;
      const next = [newChat, ...prev];
      // ✅ Clean up conversation data for chats that fall off the 30-chat list
      next.slice(30).forEach((c) => { try { localStorage.removeItem(`creo_chat_data_${c.id}`); } catch {} });
      return next.slice(0, 30);
    });
    if (!activeChatId) setActiveChatId(newChat.id);
  }, [activeChatId]);

  return (
    <div className="min-h-screen bg-workspace-glow flex overflow-hidden">
      <ChatSidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        activeChatId={activeChatId}
        onSelectChat={(id) => { setActiveChatId(id); setResetKey((p) => p + 1); }}
        onNewChat={handleNewChat}
        chats={savedChats}
        onDeleteChat={(id) => {
          try { localStorage.removeItem(`creo_chat_data_${id}`); } catch {}
          setSavedChats((prev) => prev.filter((c) => c.id !== id));
        }}
      />
      <div className="flex-1 flex flex-col min-h-screen min-w-0 transition-all duration-300">
        <ChatMainArea
          key={resetKey}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          activeChatId={activeChatId}
          onChatSaved={handleChatSaved}
          onNewChat={handleNewChat}
          chats={savedChats}
          onOpenNova={() => setShowNova(true)}
        />
      </div>
      {showNova && <FloatingAssistant onClose={() => setShowNova(false)} />}
    </div>
  );
}
