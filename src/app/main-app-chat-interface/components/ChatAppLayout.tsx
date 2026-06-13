'use client';
import React, { useState, useCallback, useEffect } from 'react';
import ChatSidebar from './ChatSidebar';
import ChatMainArea from './ChatMainArea';
import FloatingAssistant from './FloatingAssistant';

interface SavedChat {
  id: string;
  title: string;
  preview: string;
  time: string;
  platform: string;
  generated: number;
}

const STORAGE_KEY = 'creo_chat_history';

export default function ChatAppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeChatId, setActiveChatId] = useState('');
  const [resetKey, setResetKey] = useState(0);
  const [savedChats, setSavedChats] = useState<SavedChat[]>([]);

  // ✅ Load chat history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setSavedChats(JSON.parse(stored));
    } catch {}
  }, []);

  // ✅ Persist chat history whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedChats));
    } catch {}
  }, [savedChats]);

  const handleNewChat = useCallback(() => {
    const newId = `chat-${Date.now()}`;
    setActiveChatId(newId);
    setResetKey((prev) => prev + 1);
  }, []);

  const handleChatSaved = useCallback((title: string, platform: string) => {
    const newChat: SavedChat = {
      id: activeChatId || `chat-${Date.now()}`,
      title,
      preview: 'Generating content...',
      time: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      platform,
      generated: 1,
    };
    setSavedChats((prev) => {
      if (prev.find((c) => c.id === newChat.id)) return prev;
      return [newChat, ...prev].slice(0, 30); // keep last 30
    });
    if (!activeChatId) setActiveChatId(newChat.id);
  }, [activeChatId]);

  return (
    <div className="min-h-screen bg-[#080812] flex overflow-hidden">
      <ChatSidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        activeChatId={activeChatId}
        onSelectChat={(id) => { setActiveChatId(id); setResetKey((p) => p + 1); }}
        onNewChat={handleNewChat}
        chats={savedChats}
        onDeleteChat={(id) => setSavedChats((prev) => prev.filter((c) => c.id !== id))}
      />
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${sidebarOpen ? 'ml-0 lg:ml-72' : 'ml-0 lg:ml-16'}`}>
        <ChatMainArea
          key={resetKey}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          activeChatId={activeChatId}
          onChatSaved={handleChatSaved}
          onNewChat={handleNewChat}
        />
      </div>
      <FloatingAssistant />
    </div>
  );
}
