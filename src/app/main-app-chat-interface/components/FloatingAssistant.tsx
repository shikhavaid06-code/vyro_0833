'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, Minimize2, Maximize2 } from 'lucide-react';


interface AssistantMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
}

const QUICK_COMMANDS = [
  { label: 'More titles', cmd: 'Generate more title options for my current idea' },
  { label: 'Improve hook', cmd: 'Make my hook more attention-grabbing' },
  { label: 'Rewrite script', cmd: 'Rewrite the script with a different angle' },
  { label: 'Make shorter', cmd: 'Shorten the script by 30%' },
  { label: 'More emotional', cmd: 'Make the script more emotionally engaging' },
  { label: 'Add CTA', cmd: 'Add a stronger call-to-action at the end' },
];

const AI_RESPONSES: Record<string, string> = {
  default: "I'm on it! Give me a moment to refine your content...",
  titles: "Generating 6 fresh title variations now. I'll optimize for click-through rate and your target platform.",
  hook: "Rewriting your hook with stronger emotional pull. I'll give you 3 options to choose from.",
  script: "Rewriting with a fresh angle. I'll keep your core message but change the delivery style.",
  shorter: "Trimming the script by 30% while keeping all the key points. No fluff, pure value.",
  emotional: "Adding emotional storytelling beats throughout. This will increase watch time significantly.",
  cta: "Crafting 3 CTA variations — soft, medium, and strong. You pick what fits your style.",
};

export default function FloatingAssistant() {
  const [isOpen, setIsOpen] = useState(false);
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
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const getAIResponse = (userInput: string): string => {
    const lower = userInput.toLowerCase();
    if (lower.includes('title')) return AI_RESPONSES.titles;
    if (lower.includes('hook')) return AI_RESPONSES.hook;
    if (lower.includes('script') || lower.includes('rewrite')) return AI_RESPONSES.script;
    if (lower.includes('short') || lower.includes('trim')) return AI_RESPONSES.shorter;
    if (lower.includes('emotion') || lower.includes('feel')) return AI_RESPONSES.emotional;
    if (lower.includes('cta') || lower.includes('call')) return AI_RESPONSES.cta;
    return AI_RESPONSES.default;
  };

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

    // Backend integration point: POST /api/ai/assistant
    await new Promise((r) => setTimeout(r, 1200));
    setIsTyping(false);

    const aiMsg: AssistantMessage = {
      id: `a-ai-${Date.now()}`,
      role: 'ai',
      content: getAIResponse(text),
    };
    setMessages((prev) => [...prev, aiMsg]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-vyro flex items-center justify-center animate-pulse-glow hover:scale-110 active:scale-95 transition-all duration-200 shadow-2xl"
          aria-label="Open AI Assistant"
        >
          <Sparkles size={22} className="text-white" />
        </button>
      )}

      {/* Assistant panel */}
      {isOpen && (
        <div
          className={`fixed bottom-6 right-6 z-50 w-80 sm:w-96 rounded-2xl glass-strong border border-purple-500/20 shadow-2xl shadow-purple-500/10 flex flex-col transition-all duration-300 animate-scale-in ${
            isMinimized ? 'h-14' : 'h-[480px]'
          }`}
        >
          {/* Panel header */}
          <div className="flex items-center justify-between px-4 h-14 border-b border-white/5 flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-vyro flex items-center justify-center animate-pulse-glow">
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
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-white/30 hover:text-white/60 hover:bg-white/5 transition-all duration-200"
              >
                <X size={13} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto scrollbar-hide px-4 py-3 space-y-3">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    {msg.role === 'ai' && (
                      <div className="w-6 h-6 rounded-full bg-gradient-vyro flex-shrink-0 flex items-center justify-center mt-0.5">
                        <Sparkles size={11} className="text-white" />
                      </div>
                    )}
                    <div
                      className={`rounded-xl px-3 py-2 text-xs leading-relaxed max-w-[85%] ${
                        msg.role === 'user' ?'chat-bubble-user text-white rounded-tr-sm' :'chat-bubble-ai text-white/75 rounded-tl-sm'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-vyro flex-shrink-0 flex items-center justify-center">
                      <Sparkles size={11} className="text-white" />
                    </div>
                    <div className="chat-bubble-ai rounded-xl rounded-tl-sm px-3 py-2 flex items-center gap-1">
                      <span className="typing-dot w-1.5 h-1.5 rounded-full bg-purple-400" />
                      <span className="typing-dot w-1.5 h-1.5 rounded-full bg-purple-400" />
                      <span className="typing-dot w-1.5 h-1.5 rounded-full bg-purple-400" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick commands */}
              <div className="px-4 pb-2 flex gap-1.5 flex-wrap">
                {QUICK_COMMANDS.slice(0, 3).map((qc) => (
                  <button
                    key={`qc-${qc.label}`}
                    onClick={() => handleSend(qc.cmd)}
                    className="px-2.5 py-1 rounded-full glass border border-white/8 text-[11px] text-white/40 hover:text-white/65 hover:border-purple-500/30 transition-all duration-200"
                  >
                    {qc.label}
                  </button>
                ))}
              </div>

              {/* Input */}
              <div className="px-4 pb-4 flex-shrink-0">
                <div className="flex gap-2 glass rounded-xl border border-white/8 focus-within:border-purple-500/40 transition-all duration-200">
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
                    disabled={!input.trim()}
                    className="w-8 h-8 m-1 rounded-lg bg-gradient-vyro flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-30 disabled:scale-100 flex-shrink-0"
                  >
                    <Send size={13} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}