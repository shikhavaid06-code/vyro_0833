'use client';

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
} from 'react';

import {
  Menu,
  Sparkles,
  Send,
  ChevronDown,
  Download,
  Share2,
  LogOut,
  Plus,
} from 'lucide-react';

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

export default function ChatMainArea({
  sidebarOpen,
  onToggleSidebar,
  activeChatId,
  onChatSaved,
  onNewChat,
}: Props) {
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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

  // ✅ SIGN OUT — works properly
  const handleSignOut = () => {
    toast.success('Signed out successfully');
    setTimeout(() => router.push('/sign-up-login-screen'), 800);
  };

  // ✅ EXPORT — copies script text to clipboard
  const handleExport = () => {
    const scriptMessage = messages.find((m) => m.type === 'script');
    if (!scriptMessage) {
      toast.error('No script to export yet — generate one first!');
      return;
    }
    const text = typeof scriptMessage.data === 'string' ? scriptMessage.data : JSON.stringify(scriptMessage.data, null, 2);
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Script copied to clipboard!', { description: 'Paste it anywhere you need.' });
    }).catch(() => {
      toast.error('Could not copy — try selecting the text manually.');
    });
  };

  // ✅ SHARE — copies current page URL
  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      toast.success('Link copied!', { description: 'Share your VYRO session with anyone.' });
    }).catch(() => {
      toast.error('Could not copy link.');
    });
  };

  const addAiMessage = (msg: Omit<Message, 'id' | 'timestamp'>) => {
    setMessages((prev) => [
      ...prev,
      {
        ...msg,
        id: `msg-ai-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      },
    ]);
  };

  const addUserMessage = (content: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `msg-${Date.now()}`,
        role: 'user',
        type: 'text',
        content,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      },
    ]);
  };

  const callApi = async (idea: string, forceType: string) => {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idea, forceType }),
    });
    return res.json();
  };

  const handleSendWithText = useCallback(
    async (overrideText?: string) => {
      const userInput = (overrideText ?? inputValue).trim();
      if (!userInput) return;

      setInputValue('');
      addUserMessage(userInput);
      setIsTyping(true);

      try {
        if (step === 'idle') {
          const data = await callApi(userInput, 'titles');
          setIsTyping(false);
          addAiMessage({ role: 'ai', type: 'titles', content: '🎯 Here are 6 viral titles for your video! Click the one you love:', data: data.titles });
          setStep('titles');
          if (onChatSaved) onChatSaved(userInput, selectedPlatforms[0]);
          return;
        }

        if (step === 'titles') {
          setSelectedTitle(userInput);
          const data = await callApi(userInput, 'hooks');
          setIsTyping(false);
          addAiMessage({ role: 'ai', type: 'hooks', content: '🪝 Here are 3 powerful hooks! Click the one that fits your energy:', data: data.hooks });
          setStep('hooks');
          return;
        }

        if (step === 'hooks') {
          const scriptPrompt = `Title: "${selectedTitle}". Hook: "${userInput}". Platform: ${selectedPlatforms.join(', ')}. Tone: ${selectedTone}. Duration: ${selectedDuration}.`;
          const data = await callApi(scriptPrompt, 'script');
          setIsTyping(false);
          addAiMessage({ role: 'ai', type: 'script', content: '📝 Here is your full script! Edit any section or ask me to refine it.', data: data.result });
          setStep('done');
          return;
        }

        if (step === 'done') {
          const refinePrompt = `Previous script topic: "${selectedTitle}". User request: "${userInput}". Tone: ${selectedTone}.`;
          const data = await callApi(refinePrompt, 'script');
          setIsTyping(false);
          addAiMessage({ role: 'ai', type: 'script', content: '✨ Here is your refined script!', data: data.result });
          return;
        }
      } catch (error) {
        setIsTyping(false);
        addAiMessage({ role: 'ai', type: 'text', content: 'Something went wrong. Please try again!' });
      }
    },
    [inputValue, step, selectedTitle, selectedPlatforms, selectedTone, selectedDuration, onChatSaved]
  );

  const handleSend = () => handleSendWithText();

  const handleTitleSelect = useCallback((title: string) => { handleSendWithText(title); }, [handleSendWithText]);
  const handleHookSelect = useCallback((hook: string) => { handleSendWithText(hook); }, [handleSendWithText]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const getPlaceholder = () => {
    if (step === 'idle') return 'What is your video about? e.g. "5 AI tools for students"';
    if (step === 'titles') return 'Or type a title manually...';
    if (step === 'hooks') return 'Or type a hook manually...';
    if (step === 'done') return 'Ask me to refine, make shorter, change tone...';
    return 'Tell VYRO what to create...';
  };

  const getStepLabel = () => {
    if (step === 'idle') return 'New Chat — Tell CRÉO your video topic';
    if (step === 'titles') return 'Step 2 — Pick a title';
    if (step === 'hooks') return 'Step 3 — Pick a hook';
    return '🎉 Script ready — refine anytime!';
  };

  return (
    <div className="flex flex-col h-screen">
      {/* TOPBAR */}
      <div className="h-16 flex items-center justify-between px-4 md:px-6 border-b border-white/5 bg-[#080812]/80 backdrop-blur-xl flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden w-8 h-8 rounded-lg glass border border-white/8 flex items-center justify-center text-white/40 hover:text-white transition-all duration-200"
          >
            <Menu size={15} />
          </button>
          <div>
            <h1 className="text-sm font-semibold text-white truncate max-w-xs md:max-w-md">{getStepLabel()}</h1>
            <p className="text-[11px] text-white/30">{selectedPlatforms.join(', ')} · {selectedTone} · {selectedDuration}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* ✅ NEW CONTENT */}
          <button
            onClick={handleNewChat}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass border border-white/8 text-xs font-medium text-white/50 hover:text-white/70 transition-all duration-200"
          >
            <Plus size={13} />
            <span className="hidden sm:inline">New</span>
          </button>

          {/* ✅ CONTROLS */}
          <button
            onClick={() => setShowControls(!showControls)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
              showControls ? 'bg-purple-500/15 border border-purple-500/30 text-purple-400' : 'glass border border-white/8 text-white/50 hover:text-white/70'
            }`}
          >
            <Sparkles size={13} />
            Controls
            <ChevronDown size={12} className={`transition-transform duration-200 ${showControls ? 'rotate-180' : ''}`} />
          </button>

          {/* ✅ EXPORT */}
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass border border-white/8 text-xs font-medium text-white/50 hover:text-white/70 transition-all duration-200"
          >
            <Download size={13} />
            <span className="hidden sm:inline">Export</span>
          </button>

          {/* ✅ SHARE */}
          <button
            onClick={handleShare}
            className="w-8 h-8 rounded-lg glass border border-white/8 flex items-center justify-center text-white/40 hover:text-white/70 transition-all duration-200"
          >
            <Share2 size={14} />
          </button>

          {/* ✅ SIGN OUT */}
          <button
            onClick={handleSignOut}
            className="w-8 h-8 rounded-lg glass border border-white/8 flex items-center justify-center text-white/40 hover:text-red-400 transition-all duration-200"
            title="Sign out"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>

      {/* CONTROLS PANEL */}
      {showControls && (
        <div className="px-4 md:px-6 py-3 border-b border-white/5 bg-[#0a0a1a]/50 backdrop-blur-sm flex-shrink-0">
          <div className="flex flex-wrap gap-4 items-start">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/30 mb-2">Platform</p>
              <div className="flex flex-wrap gap-1.5">
                {platforms.map((p) => (
                  <button key={p} onClick={() => togglePlatform(p)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-200 ${
                      selectedPlatforms.includes(p) ? 'bg-purple-500/20 border border-purple-500/30 text-purple-300' : 'glass border border-white/8 text-white/40 hover:text-white/60'
                    }`}
                  >{p}</button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/30 mb-2">Tone</p>
              <div className="flex flex-wrap gap-1.5">
                {tones.map((t) => (
                  <button key={t} onClick={() => setSelectedTone(t)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-200 ${
                      selectedTone === t ? 'bg-pink-500/20 border border-pink-500/30 text-pink-300' : 'glass border border-white/8 text-white/40 hover:text-white/60'
                    }`}
                  >{t}</button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/30 mb-2">Duration</p>
              <div className="flex flex-wrap gap-1.5">
                {durations.map((d) => (
                  <button key={d} onClick={() => setSelectedDuration(d)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-200 ${
                      selectedDuration === d ? 'bg-violet-500/20 border border-violet-500/30 text-violet-300' : 'glass border border-white/8 text-white/40 hover:text-white/60'
                    }`}
                  >{d}</button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MESSAGES AREA */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-4">
              <Sparkles size={28} className="text-purple-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">What are we creating today?</h2>
            <p className="text-white/40 text-sm max-w-sm">Type your video idea below and CRÉO will generate viral titles, hooks, and a full script for you.</p>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.type === 'text' && (
              <div className={`max-w-lg px-4 py-3 rounded-2xl text-sm ${
                msg.role === 'user'
                  ? 'bg-purple-600/80 text-white rounded-br-sm'
                  : 'glass border border-white/8 text-white/80 rounded-bl-sm'
              }`}>
                {msg.content}
              </div>
            )}
            {msg.type === 'titles' && (
              <div className="w-full max-w-2xl">
                <p className="text-white/60 text-sm mb-3">{msg.content}</p>
                <TitleCards titles={msg.data as string[]} onSelect={handleTitleSelect} />
              </div>
            )}
            {msg.type === 'hooks' && (
              <div className="w-full max-w-2xl">
                <p className="text-white/60 text-sm mb-3">{msg.content}</p>
                <HookCards hooks={msg.data as string[]} onSelect={handleHookSelect} />
              </div>
            )}
            {msg.type === 'script' && (
              <div className="w-full max-w-2xl">
                <p className="text-white/60 text-sm mb-3">{msg.content}</p>
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

      {/* INPUT AREA */}
      <div className="px-4 md:px-6 py-4 border-t border-white/5 bg-[#080812]/80 backdrop-blur-xl flex-shrink-0">
        <div className="flex items-end gap-3 max-w-4xl mx-auto">
          <div className="flex-1 glass border border-white/10 rounded-2xl overflow-hidden focus-within:border-purple-500/40 transition-colors duration-200">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={getPlaceholder()}
              rows={1}
              className="w-full bg-transparent text-white text-sm placeholder:text-white/25 px-4 py-3.5 resize-none focus:outline-none max-h-32"
              style={{ minHeight: '48px' }}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isTyping}
            className="w-11 h-11 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white hover:opacity-90 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
          >
            <Send size={16} />
          </button>
        </div>
        <p className="text-center text-[11px] text-white/20 mt-2">Press Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  );
}
