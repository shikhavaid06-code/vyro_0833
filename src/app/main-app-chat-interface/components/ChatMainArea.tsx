'use client';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Menu, Sparkles, Send, ChevronDown, Download, Share2 } from 'lucide-react';
import { toast } from 'sonner';
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
}

export default function ChatMainArea({ sidebarOpen, onToggleSidebar, activeChatId }: Props) {
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

  const togglePlatform = (p: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  };

  const handleNewChat = () => {
    setMessages([]);
    setInputValue('');
    setIsTyping(false);
    setStep('idle');
    setSelectedTitle('');
  };

  const addAiMessage = (msg: Omit<Message, 'id' | 'timestamp'>) => {
    setMessages((prev) => [...prev, {
      ...msg,
      id: `msg-ai-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
    }]);
  };

  const addUserMessage = (content: string) => {
    setMessages((prev) => [...prev, {
      id: `msg-${Date.now()}`,
      role: 'user',
      type: 'text',
      content,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
    }]);
  };

  const callApi = async (idea: string, forceType: string) => {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idea, forceType }),
    });
    return res.json();
  };

  // Core send function — accepts optional override text so card clicks work
  const handleSendWithText = useCallback(async (overrideText?: string) => {
    const userInput = (overrideText ?? inputValue).trim();
    if (!userInput) return;

    setInputValue('');
    addUserMessage(userInput);
    setIsTyping(true);

    try {
      // STEP 1: idle → generate titles
      if (step === 'idle') {
        const data = await callApi(userInput, 'titles');
        setIsTyping(false);
        addAiMessage({
          role: 'ai',
          type: 'titles',
          content: '🎯 Here are 6 viral titles for your video! Click the one you love:',
          data: data.titles,
        });
        setStep('titles');
        return;
      }

      // STEP 2: titles → generate hooks
      if (step === 'titles') {
        setSelectedTitle(userInput);
        const data = await callApi(userInput, 'hooks');
        setIsTyping(false);
        addAiMessage({
          role: 'ai',
          type: 'hooks',
          content: '🪝 Here are 3 powerful hooks! Click the one that fits your energy:',
          data: data.hooks,
        });
        setStep('hooks');
        return;
      }

      // STEP 3: hooks → generate script
      if (step === 'hooks') {
        const scriptPrompt = `Title: "${selectedTitle}". Hook: "${userInput}". Platform: ${selectedPlatforms.join(', ')}. Tone: ${selectedTone}. Duration: ${selectedDuration}.`;
        const data = await callApi(scriptPrompt, 'script');
        setIsTyping(false);
        addAiMessage({
          role: 'ai',
          type: 'script',
          content: '📝 Here is your full script! Edit any section or ask me to refine it.',
          data: data.result,
        });
        setStep('done');
        return;
      }

      // STEP 4: done → refine
      if (step === 'done') {
        const refinePrompt = `Previous script topic: "${selectedTitle}". User request: "${userInput}". Tone: ${selectedTone}.`;
        const data = await callApi(refinePrompt, 'script');
        setIsTyping(false);
        addAiMessage({
          role: 'ai',
          type: 'script',
          content: '✨ Here is your refined script!',
          data: data.result,
        });
        return;
      }

    } catch (err) {
      setIsTyping(false);
      addAiMessage({
        role: 'ai',
        type: 'text',
        content: 'Something went wrong. Please try again!',
      });
    }
  }, [inputValue, step, selectedTitle, selectedPlatforms, selectedTone, selectedDuration]);

  const handleSend = () => handleSendWithText();

  // Called when user clicks a title card
  const handleTitleSelect = useCallback((title: string) => {
    handleSendWithText(title);
  }, [handleSendWithText]);

  // Called when user clicks a hook card
  const handleHookSelect = useCallback((hook: string) => {
    handleSendWithText(hook);
  }, [handleSendWithText]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

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
    <div className="flex flex-col h-screen">
      {/* Topbar */}
      <div className="h-16 flex items-center justify-between px-4 md:px-6 border-b border-white/5 bg-[#080812]/80 backdrop-blur-xl flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden w-8 h-8 rounded-lg glass border border-white/8 flex items-center justify-center text-white/40 hover:text-white transition-all duration-200"
          >
            <Menu size={15} />
          </button>
          <div>
            <h1 className="text-sm font-semibold text-white truncate max-w-xs md:max-w-md">
              {getStepLabel()}
            </h1>
            <p className="text-[11px] text-white/30">{selectedPlatforms.join(', ')} · {selectedTone} · {selectedDuration}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleNewChat}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass border border-white/8 text-xs font-medium text-white/50 hover:text-white/70 transition-all duration-200"
          >
            + New Chat
          </button>
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
          <button
            onClick={() => toast.success('Script exported as PDF')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass border border-white/8 text-xs font-medium text-white/50 hover:text-white/70 transition-all duration-200"
          >
            <Download size={13} />
            <span className="hidden sm:inline">Export</span>
          </button>
          <button
            onClick={() => toast.success('Share link copied!')}
            className="w-8 h-8 rounded-lg glass border border-white/8 flex items-center justify-center text-white/40 hover:text-white/70 transition-all duration-200"
          >
            <Share2 size={14} />
          </button>
        </div>
      </div>

      {/* Controls panel */}
      {showControls && (
        <div className="px-4 md:px-6 py-3 border-b border-white/5 bg-[#0a0a1a]/50 backdrop-blur-sm animate-slide-up flex-shrink-0">
          <div className="flex flex-wrap gap-4 items-start">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/30 mb-2">Platform</p>
              <div className="flex flex-wrap gap-1.5">
                {platforms.map((p) => (
                  <button
                    key={`ctrl-platform-${p}`}
                    onClick={() => togglePlatform(p)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-200 ${
                      selectedPlatforms.includes(p)
                        ? 'bg-purple-500/20 border border-purple-500/30 text-purple-300' : 'glass border border-white/8 text-white/40 hover:text-white/60'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/30 mb-2">Tone</p>
              <div className="flex flex-wrap gap-1.5">
                {tones.map((t) => (
                  <button
                    key={`ctrl-tone-${t}`}
                    onClick={() => setSelectedTone(t)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-200 ${
                      selectedTone === t
                        ? 'bg-pink-500/20 border border-pink-500/30 text-pink-300' : 'glass border border-white/8 text-white/40 hover:text-white/60'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/30 mb-2">Duration</p>
              <div className="flex flex-wrap gap-1.5">
                {durations.map((d) => (
                  <button
                    key={`ctrl-dur-${d}`}
                    onClick={() => setSelectedDuration(d)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-200 ${
                      selectedDuration === d
                        ? 'bg-violet-500/20 border border-violet-500/30 text-violet-300'
                        : 'glass border border-white/8 text-white/40 hover:text-white/60'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {messages.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-vyro flex items-center justify-center">
            <Sparkles size={24} className="text-white" />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-semibold text-white mb-2">What's your video about?</h2>
            <p className="text-sm text-white/40 max-w-sm">Tell VYRO your topic — it will generate titles, hooks, and a full script step by step.</p>
          </div>
          <div className="flex flex-wrap gap-2 justify-center mt-2">
            {['AI tools for students', 'Morning routine tips', 'How I make $5k/month', 'Fitness for beginners'].map((s) => (
              <button
                key={s}
                onClick={() => setInputValue(s)}
                className="px-3 py-1.5 rounded-lg glass border border-white/8 text-xs text-white/50 hover:text-white/70 transition-all"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      {messages.length > 0 && (
        <div className="flex-1 overflow-y-auto scrollbar-hide px-4 md:px-6 lg:px-10 xl:px-16 py-6 space-y-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 animate-fade-in ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mt-1 ${
                msg.role === 'ai' ? 'bg-gradient-vyro' : 'bg-white/10'
              }`}>
                {msg.role === 'ai' ? (
                  <Sparkles size={14} className="text-white" />
                ) : (
                  <span className="text-xs font-bold text-white">Y</span>
                )}
              </div>

              <div className={`flex flex-col gap-2 max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                {msg.content && (
                  <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === 'user' ? 'chat-bubble-user text-white rounded-tr-sm' : 'chat-bubble-ai text-white/80 rounded-tl-sm'
                  }`}>
                    {msg.content}
                  </div>
                )}

                {msg.type === 'titles' && msg.data && (
                  <TitleCards
                    titles={msg.data as string[]}
                    onSelect={handleTitleSelect}
                  />
                )}

                {msg.type === 'hooks' && msg.data && (
                  <HookCards
                    hooks={msg.data as string[]}
                    onSelect={handleHookSelect}
                  />
                )}

                {msg.type === 'script' && msg.data && (
                  <ScriptCard script={msg.data as string} />
                )}

                <span className="text-[10px] text-white/20 px-1">{msg.timestamp}</span>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3 animate-fade-in">
              <div className="w-8 h-8 rounded-full bg-gradient-vyro flex-shrink-0 flex items-center justify-center mt-1">
                <Sparkles size={14} className="text-white" />
              </div>
              <div className="chat-bubble-ai rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
                <span className="typing-dot w-2 h-2 rounded-full bg-purple-400" />
                <span className="typing-dot w-2 h-2 rounded-full bg-purple-400" />
                <span className="typing-dot w-2 h-2 rounded-full bg-purple-400" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Input area */}
      <div className="flex-shrink-0 px-4 md:px-6 lg:px-10 xl:px-16 py-4 border-t border-white/5 bg-[#080812]/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto">
          <div className="glass-strong rounded-2xl border border-white/10 focus-within:border-purple-500/40 transition-all duration-200">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder={getPlaceholder()}
              className="w-full bg-transparent px-4 pt-4 pb-2 text-sm text-white placeholder:text-white/25 focus:outline-none resize-none max-h-32 scrollbar-hide"
              style={{ minHeight: '48px' }}
            />
            <div className="flex items-center justify-between px-3 pb-3">
              <div className="flex items-center gap-1">
                {step === 'done' && ['Make shorter', 'More energy', 'Add CTA', 'Rewrite intro'].map((cmd) => (
                  <button
                    key={`quick-${cmd}`}
                    onClick={() => setInputValue(cmd)}
                    className="px-2.5 py-1 rounded-lg glass border border-white/8 text-[11px] text-white/40 hover:text-white/60 hover:border-white/15 transition-all duration-200 hidden sm:block"
                  >
                    {cmd}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-white/20">↵ to send</span>
                <button
                  onClick={handleSend}
                  disabled={!inputValue.trim() || isTyping}
                  className="w-9 h-9 rounded-xl bg-gradient-vyro flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-30 disabled:scale-100 disabled:cursor-not-allowed glow-button"
                >
                  <Send size={15} />
                </button>
              </div>
            </div>
          </div>
          <p className="text-center text-[10px] text-white/15 mt-2">
            VYRO can make mistakes. Review your scripts before publishing.
          </p>
        </div>
      </div>
    </div>
  );
}
