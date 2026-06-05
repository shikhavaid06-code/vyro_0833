'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Menu, Sparkles, Send, ChevronDown, Download, Share2, Plus, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import TitleCards from './TitleCards';
import HookCards from './HookCards';
import ScriptCard from './ScriptCard';

type ChatStep = 'idle' | 'titles' | 'hooks' | 'script' | 'done';

interface Message {
  id: string;
  role: 'user' | 'ai';
  type: 'text' | 'titles' | 'hooks' | 'script';
  content?: string;
  data?: unknown;
  timestamp: string;
}

const platforms = ['YouTube', 'TikTok', 'Instagram', 'Twitter/X'];
const tones = ['Casual', 'Professional', 'Storytelling', 'Educational', 'Hype'];
const durations = ['Shorts (< 60s)', 'Medium (3-8 min)', 'Long (8-20 min)', 'Custom'];

interface Props {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  activeChatId: string;
  onChatSaved?: (title: string, platform: string) => void;
  onNewChat?: () => void;
}

export default function ChatMainArea({ sidebarOpen, onToggleSidebar, activeChatId, onChatSaved, onNewChat }: Props) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [step, setStep] = useState<ChatStep>('idle');
  const [selectedTitle, setSelectedTitle] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['YouTube']);
  const [selectedTone, setSelectedTone] = useState('Casual');
  const [selectedDuration, setSelectedDuration] = useState('Medium (3-8 min)');
  const [showControls, setShowControls] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // ✅ MOBILE FIX: scroll only within the messages container, not the whole page
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform) ? prev.filter((p) => p !== platform) : [...prev, platform]
    );
  };

  const handleNewChat = () => {
    setMessages([]);
    setInputValue('');
    setIsTyping(false);
    setStep('idle');
    setSelectedTitle('');
    if (onNewChat) onNewChat();
  };

  const handleSignOut = () => {
    toast.success('Signed out');
    setTimeout(() => router.push('/sign-up-login-screen'), 600);
  };

  const handleExport = () => {
    const scriptMessage = messages.find((m) => m.type === 'script');
    if (!scriptMessage) { toast.error('No script yet — generate one first!'); return; }
    const text = typeof scriptMessage.data === 'string' ? scriptMessage.data : JSON.stringify(scriptMessage.data);
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'vyro-script.txt';
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
    toast.success('Script downloaded!');
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
      .then(() => toast.success('Link copied!'))
      .catch(() => toast.error('Could not copy link'));
  };

  const addAiMessage = (msg: Omit<Message, 'id' | 'timestamp'>) => {
    setMessages((prev) => [...prev, { ...msg, id: `msg-ai-${Date.now()}`, timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) }]);
  };

  const addUserMessage = (content: string) => {
    setMessages((prev) => [...prev, { id: `msg-${Date.now()}`, role: 'user', type: 'text', content, timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) }]);
  };

  const callApi = async (idea: string, forceType: string) => {
    const res = await fetch('/api/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ idea, forceType }) });
    return res.json();
  };

  const handleSendWithText = useCallback(async (overrideText?: string) => {
    const userInput = (overrideText ?? inputValue).trim();
    if (!userInput) return;
    setInputValue('');
    addUserMessage(userInput);
    setIsTyping(true);

    try {
      if (step === 'idle') {
        const data = await callApi(userInput, 'titles');
        setIsTyping(false);
        addAiMessage({ role: 'ai', type: 'titles', content: '🎯 Here are 6 viral titles! Click the one you love:', data: data.titles });
        setStep('titles');
        if (onChatSaved) onChatSaved(userInput, selectedPlatforms[0]);
        return;
      }
      if (step === 'titles') {
        setSelectedTitle(userInput);
        const data = await callApi(userInput, 'hooks');
        setIsTyping(false);
        addAiMessage({ role: 'ai', type: 'hooks', content: '🪝 Here are 3 powerful hooks! Click the one that fits:', data: data.hooks });
        setStep('hooks');
        return;
      }
      if (step === 'hooks') {
        const scriptPrompt = `Title: "${selectedTitle}". Hook: "${userInput}". Platform: ${selectedPlatforms.join(', ')}. Tone: ${selectedTone}. Duration: ${selectedDuration}.`;
        const data = await callApi(scriptPrompt, 'script');
        setIsTyping(false);
        addAiMessage({ role: 'ai', type: 'script', content: '📝 Here is your full script! Edit or ask me to refine it.', data: data.result });
        setStep('done');
        return;
      }
      if (step === 'done') {
        const data = await callApi(`Topic: "${selectedTitle}". Request: "${userInput}". Tone: ${selectedTone}.`, 'script');
        setIsTyping(false);
        addAiMessage({ role: 'ai', type: 'script', content: '✨ Here is your refined script!', data: data.result });
        return;
      }
    } catch {
      setIsTyping(false);
      addAiMessage({ role: 'ai', type: 'text', content: 'Something went wrong. Please try again!' });
    }
  }, [inputValue, step, selectedTitle, selectedPlatforms, selectedTone, selectedDuration, onChatSaved]);

  const handleTitleSelect = useCallback((title: string) => { handleSendWithText(title); }, [handleSendWithText]);
  const handleHookSelect = useCallback((hook: string) => { handleSendWithText(hook); }, [handleSendWithText]);

  const getPlaceholder = () => {
    if (step === 'idle') return 'What is your video about? e.g. "5 AI tools for students"';
    if (step === 'titles') return 'Or type a title manually...';
    if (step === 'hooks') return 'Or type a hook manually...';
    if (step === 'done') return 'Ask me to refine, make shorter, change tone...';
    return 'Tell VYRO what to create...';
  };

  const getStepLabel = () => {
    if (step === 'idle') return 'New Chat — Tell VYRO your video topic';
    if (step === 'titles') return 'Step 2 — Pick a title';
    if (step === 'hooks') return 'Step 3 — Pick a hook';
    return '🎉 Script ready — refine anytime!';
  };

  return (
    // ✅ MOBILE FIX: use dvh (dynamic viewport height) instead of h-screen
    // dvh accounts for mobile browser address bar correctly
    <div className="flex flex-col" style={{ height: '100dvh' }}>

      {/* TOPBAR */}
      <div className="flex-shrink-0 h-14 flex items-center justify-between px-3 md:px-6 border-b border-white/5 bg-[#080812]/90 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <button onClick={onToggleSidebar} className="lg:hidden w-8 h-8 rounded-lg glass border border-white/8 flex items-center justify-center text-white/40 hover:text-white transition-all">
            <Menu size={15} />
          </button>
          <div>
            <h1 className="text-xs sm:text-sm font-semibold text-white truncate max-w-[160px] sm:max-w-xs md:max-w-md">{getStepLabel()}</h1>
            <p className="text-[10px] text-white/30 hidden sm:block">{selectedPlatforms.join(', ')} · {selectedTone}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button onClick={handleNewChat} className="flex items-center gap-1 px-2 py-1.5 rounded-lg glass border border-white/8 text-xs font-medium text-white/50 hover:text-white/70 transition-all">
            <Plus size={12} /><span className="hidden sm:inline">New</span>
          </button>
          <button onClick={() => setShowControls(!showControls)}
            className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${showControls ? 'bg-purple-500/15 border border-purple-500/30 text-purple-400' : 'glass border border-white/8 text-white/50 hover:text-white/70'}`}>
            <Sparkles size={12} /><span className="hidden sm:inline">Controls</span>
            <ChevronDown size={11} className={`transition-transform ${showControls ? 'rotate-180' : ''}`} />
          </button>
          <button onClick={handleExport} className="flex items-center gap-1 px-2 py-1.5 rounded-lg glass border border-white/8 text-xs font-medium text-white/50 hover:text-white/70 transition-all">
            <Download size={12} /><span className="hidden sm:inline">Export</span>
          </button>
          <button onClick={handleShare} className="w-7 h-7 rounded-lg glass border border-white/8 flex items-center justify-center text-white/40 hover:text-white/70 transition-all">
            <Share2 size={13} />
          </button>
          <button onClick={handleSignOut} className="w-7 h-7 rounded-lg glass border border-white/8 flex items-center justify-center text-white/40 hover:text-red-400 transition-all" title="Sign out">
            <LogOut size={13} />
          </button>
        </div>
      </div>

      {/* CONTROLS PANEL */}
      {showControls && (
        <div className="flex-shrink-0 px-3 md:px-6 py-3 border-b border-white/5 bg-[#0a0a1a]/50 backdrop-blur-sm">
          <div className="flex flex-wrap gap-3 items-start">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-1.5">Platform</p>
              <div className="flex flex-wrap gap-1">
                {platforms.map((p) => (
                  <button key={p} onClick={() => togglePlatform(p)}
                    className={`px-2 py-0.5 rounded-lg text-xs font-medium transition-all ${selectedPlatforms.includes(p) ? 'bg-purple-500/20 border border-purple-500/30 text-purple-300' : 'glass border border-white/8 text-white/40'}`}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-1.5">Tone</p>
              <div className="flex flex-wrap gap-1">
                {tones.map((t) => (
                  <button key={t} onClick={() => setSelectedTone(t)}
                    className={`px-2 py-0.5 rounded-lg text-xs font-medium transition-all ${selectedTone === t ? 'bg-pink-500/20 border border-pink-500/30 text-pink-300' : 'glass border border-white/8 text-white/40'}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-1.5">Duration</p>
              <div className="flex flex-wrap gap-1">
                {durations.map((d) => (
                  <button key={d} onClick={() => setSelectedDuration(d)}
                    className={`px-2 py-0.5 rounded-lg text-xs font-medium transition-all ${selectedDuration === d ? 'bg-violet-500/20 border border-violet-500/30 text-violet-300' : 'glass border border-white/8 text-white/40'}`}>
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ✅ MOBILE FIX: messages area scrolls internally, never pushes input off screen */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-3 md:px-6 py-4 space-y-4 overscroll-contain">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-4">
              <Sparkles size={24} className="text-purple-400" />
            </div>
            <h2 className="text-lg font-bold text-white mb-2">What are we creating today?</h2>
            <p className="text-white/40 text-sm max-w-xs">Type your video idea below and VYRO will generate viral titles, hooks, and a full script.</p>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.type === 'text' && (
              <div className={`max-w-[85%] sm:max-w-lg px-4 py-2.5 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-purple-600/80 text-white rounded-br-sm' : 'glass border border-white/8 text-white/80 rounded-bl-sm'}`}>
                {msg.content}
              </div>
            )}
            {msg.type === 'titles' && (
              <div className="w-full">
                <p className="text-white/60 text-sm mb-2">{msg.content}</p>
                <TitleCards titles={msg.data as string[]} onSelect={handleTitleSelect} />
              </div>
            )}
            {msg.type === 'hooks' && (
              <div className="w-full">
                <p className="text-white/60 text-sm mb-2">{msg.content}</p>
                <HookCards hooks={msg.data as string[]} onSelect={handleHookSelect} />
              </div>
            )}
            {msg.type === 'script' && (
              <div className="w-full">
                <p className="text-white/60 text-sm mb-2">{msg.content}</p>
                <ScriptCard script={msg.data as string} />
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="glass border border-white/8 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ✅ MOBILE FIX: input always pinned to bottom, never scrolls away */}
      <div className="flex-shrink-0 px-3 md:px-6 py-3 border-t border-white/5 bg-[#080812]/90 backdrop-blur-xl">
        <div className="flex items-end gap-2 max-w-3xl mx-auto">
          <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl overflow-hidden focus-within:border-purple-500/40 transition-colors">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendWithText(); } }}
              placeholder={getPlaceholder()}
              rows={1}
              className="w-full bg-transparent text-white text-sm placeholder:text-white/25 px-4 py-3 resize-none focus:outline-none"
              style={{ maxHeight: '100px' }}
            />
          </div>
          <button
            onClick={() => handleSendWithText()}
            disabled={!inputValue.trim() || isTyping}
            className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white hover:opacity-90 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
          >
            <Send size={16} />
          </button>
        </div>
        <p className="text-center text-[10px] text-white/20 mt-1.5 hidden sm:block">Enter to send · Shift+Enter for new line</p>
      </div>

    </div>
  );
}
