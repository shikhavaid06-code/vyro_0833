'use client';
import React, { useState, useCallback } from 'react';
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

export default function ChatAppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeChatId, setActiveChatId] = useState('');
  const [resetKey, setResetKey] = useState(0);
  const [savedChats, setSavedChats] = useState<SavedChat[]>([]);

  // ✅ Called when New Content button is clicked — resets everything
  const handleNewChat = useCallback(() => {
    const newId = `chat-${Date.now()}`;
    setActiveChatId(newId);
    setResetKey((prev) => prev + 1); // forces ChatMainArea to remount = full reset
  }, []);

  // ✅ Called when ChatMainArea generates first title — saves chat to sidebar
  const handleChatSaved = useCallback((title: string, platform: string) => {
    const newChat: SavedChat = {
      id: activeChatId,
      title,
      preview: 'Generating content...',
      time: 'Just now',
      platform,
      generated: 1,
    };
    setSavedChats((prev) => {
      // don't duplicate
      if (prev.find((c) => c.id === activeChatId)) return prev;
      return [newChat, ...prev];
    });
  }, [activeChatId]);

  return (
    <div className="min-h-screen bg-[#080812] flex overflow-hidden">
      {/* Sidebar */}
      <ChatSidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        activeChatId={activeChatId}
        onSelectChat={setActiveChatId}
        onNewChat={handleNewChat}
        chats={savedChats}
        onDeleteChat={(id) => setSavedChats((prev) => prev.filter((c) => c.id !== id))}
      />

      {/* Main area */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
          sidebarOpen ? 'ml-0 lg:ml-72' : 'ml-0 lg:ml-16'
        }`}
      >
        <ChatMainArea
          key={resetKey}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          activeChatId={activeChatId}
          onChatSaved={handleChatSaved}
        />
      </div>

      {/* Floating AI Assistant */}
      <FloatingAssistant />
    </div>
  );
}
