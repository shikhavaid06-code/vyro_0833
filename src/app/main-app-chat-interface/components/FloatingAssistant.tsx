'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, Minimize2, Maximize2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface AssistantMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
}

const QUICK_COMMANDS = [
  { label: 'More titles', cmd: 'Generate more viral title options for my current idea' },
  { label: 'Improve hook', cmd: 'Make my hook more attention-grabbing' },
  { label: 'Rewrite script', cmd: 'Rewrite the script with a different angle' },
  { label: 'Make shorter', cmd: 'Shorten the script by 30%' },
  { label: 'More emotional', cmd: 'Make the script more emotionally engaging' },
  { label: 'Add CTA', cmd: 'Add a stronger call-to-action at the end' },
];

// ✅ Nova is now a controlled component — she's only ever mounted while
// `showNova` (in ChatAppLayout) is true, so "open" is implicit in being
// mounted at all. Her old self-contained corner-floating launcher button
// (fixed bottom-6 right-6) is gone; the launcher now lives as a proper
// topbar button in ChatMainArea, next to Vault/Brain/Intel, so she's always
// in the same predictable, visible spot instead of a floating circle that
// could end up crowding other controls depending on viewport size.
export default function FloatingAssistant({ onClose }: { onClose: () => void }) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      id: 'assistant-welcome',
      role: 'ai',
      content: "Hey! I'm Nova, your AI co-writer 👋 Tell me what to fix, improve, or create. Try: \"make my hook more shocking\" or \"add a story to the intro\".",
    },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text) return;

    const userMsg: AssistantMessage = {
      id: `a-user-${Date.now()}`,
      role: 'user',
      content: text,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      // ✅ FIXED: now sends the user's session token — before, every Nova
      // message was counted against the anonymous 3/day IP limit instead of
      // the signed-in user's real plan limit, so Nova silently stopped
      // working after 3 messages even for Pro/Ultra users.
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({
          idea: text,
          forceType: 'assistant',
        }),
      });

      const data = await response.json();
      setIsTyping(false);

      const aiMsg: AssistantMessage = {
        id: `a-ai-${Date.now()}`,
        role: 'ai',
        content: data.limitReached
          ? "You've hit today's generation limit — upgrade on the Upgrade page to keep chatting with me!"
          : (data.result || data.message || "Hmm, that didn't go through — try again in a moment."),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      setIsTyping(false);
      setMessages((prev) => [...prev, {
        id: `a-ai-err-${Date.now()}`,
        role: 'ai',
        content: "Sorry, I ran into an issue. Please try again!",
      }]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={`fixed bottom-6 right-6 z-50 w-80 sm:w-96 rounded-2xl creo-surface-elevated border border-creo-primary/20 shadow-2xl shadow-purple-500/10 flex flex-col transition-all duration-300 animate-scale-in ${isMinimized ? 'h-14' : 'h-[480px]'}`}>
      <div className="flex items-center justify-between px-4 h-14 border-b border-white/5 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full creo-btn-primary flex items-center justify-center animate-pulse-glow">
            <Sparkles size={14} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Nova</p>
            <p className="text-[10px] text-green-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
              AI Co-writer · Active
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white/30 hover:text-white/60 hover:bg-white/5 transition-all duration-200"
          >
            {isMinimized ? <Maximize2 size={13} /> : <Minimize2 size={13} />}
          </button>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white/30 hover:text-white/60 hover:bg-white/5 transition-all duration-200"
          >
            <X size={13} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          <div className="flex-1 overflow-y-auto scrollbar-hide px-4 py-3 space-y-3">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                {msg.role === 'ai' && (
                  <div className="w-6 h-6 rounded-full creo-btn-primary flex-shrink-0 flex items-center justify-center mt-0.5">
                    <Sparkles size={11} className="text-white" />
                  </div>
                )}
                <div className={`rounded-xl px-3 py-2 text-xs leading-relaxed max-w-[85%] ${
                  msg.role === 'user' ? 'chat-bubble-user text-white rounded-tr-sm' : 'chat-bubble-ai text-white/75 rounded-tl-sm'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-2">
                <div className="w-6 h-6 rounded-full creo-btn-primary flex-shrink-0 flex items-center justify-center">
                  <Sparkles size={11} className="text-white" />
                </div>
                <div className="chat-bubble-ai rounded-xl rounded-tl-sm px-3 py-2 flex items-center gap-1">
                  <span className="typing-dot w-1.5 h-1.5 rounded-full bg-creo-primary" />
                  <span className="typing-dot w-1.5 h-1.5 rounded-full bg-creo-primary" />
                  <span className="typing-dot w-1.5 h-1.5 rounded-full bg-creo-primary" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="px-4 pb-2 flex gap-1.5 flex-wrap">
            {QUICK_COMMANDS.slice(0, 3).map((qc) => (
              <button
                key={`qc-${qc.label}`}
                onClick={() => handleSend(qc.cmd)}
                className="px-2.5 py-1 rounded-full creo-surface border border-white/8 text-[11px] text-white/40 hover:text-white/65 hover:border-creo-primary/30 transition-all duration-200"
              >
                {qc.label}
              </button>
            ))}
          </div>

          <div className="px-4 pb-4 flex-shrink-0">
            <div className="flex gap-2 creo-surface rounded-xl border border-white/8 focus-within:border-creo-primary/40 transition-all duration-200">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask Nova anything..."
                className="flex-1 bg-transparent px-3 py-2.5 text-xs text-white placeholder:text-white/25 focus:outline-none"
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isTyping}
                className="w-8 h-8 m-1 rounded-lg creo-btn-primary flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-30 disabled:scale-100 flex-shrink-0"
              >
                <Send size={13} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
