'use client';
import React, { useState } from 'react';
import ChatSidebar from './ChatSidebar';
import ChatMainArea from './ChatMainArea';
import FloatingAssistant from './FloatingAssistant';

export default function ChatAppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeChatId, setActiveChatId] = useState('chat-001');

  return (
    <div className="min-h-screen bg-[#080812] flex overflow-hidden">
      {/* Sidebar */}
      <ChatSidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        activeChatId={activeChatId}
        onSelectChat={setActiveChatId}
      />

      {/* Main area */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
          sidebarOpen ? 'ml-0 lg:ml-72' : 'ml-0 lg:ml-16'
        }`}
      >
        <ChatMainArea
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          activeChatId={activeChatId}
        />
      </div>

      {/* Floating AI Assistant */}
      <FloatingAssistant />
    </div>
  );
}