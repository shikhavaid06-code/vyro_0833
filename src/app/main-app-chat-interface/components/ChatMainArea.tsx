'use client';
import React, { useState, useRef, useEffect } from 'react';
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

const MOCK_TITLES = [
  '5 AI Tools That Will Make You Study 10x Faster',
  'I Used AI to Study for Finals — Here\'s What Happened',
  'Students Are Using This AI Secret to Get Straight A\'s',
  'The AI Study Hack Every Student Needs in 2026',
  'How AI Helped Me Go From C\'s to A\'s in One Semester',
  'Stop Studying Wrong — Use AI Instead (It Actually Works)',
];

const MOCK_HOOKS = [
  'What if I told you that the top 1% of students don\'t actually study harder — they use AI to study smarter?',
  'I failed three exams in a row. Then I discovered a tool that changed everything. Here\'s exactly what I did.',
  'Your professor doesn\'t want you to know about these AI tools. I\'m going to tell you anyway.',
];

const MOCK_SCRIPT = `[INTRO - 0:00-0:15]
What if I told you that the top 1% of students aren't working harder — they're using AI to work smarter? Today I'm breaking down 5 AI tools that completely transformed how I study, and by the end of this video, you'll have everything you need to use them too.

[HOOK EXPANSION - 0:15-0:45]
Last semester, I was drowning. Three exams in two weeks, a part-time job, and zero time to breathe. I stumbled across these tools out of pure desperation — and I ended up getting my best grades ever.

[TOOL 1 - 0:45-2:00]
The first tool is Notion AI. Most students use Notion as just a notes app, but the AI layer turns it into a personal tutor. You can paste in any lecture notes and literally ask it to quiz you, simplify complex concepts, or create a study plan. It's like having a TA available 24/7.

[TOOL 2 - 2:00-3:30]
Next up is Perplexity AI — think of it as Google, but it actually explains things. When I'm researching for essays, instead of clicking through 10 tabs, I ask Perplexity one question and get a cited, summarized answer in seconds.

[TOOL 3 - 3:30-5:00]
Tool number three is Anki combined with ChatGPT. Here's the hack: paste your textbook chapter into ChatGPT and ask it to generate 20 Anki flashcards in the right format. What used to take me 2 hours now takes 3 minutes.

[TOOL 4 - 5:00-6:30]
Otter.ai for lecture recording and transcription. I stopped frantically taking notes in class and started actually listening and engaging. Otter transcribes everything, and I review the clean transcript later.

[TOOL 5 - 6:30-8:00]
The last tool is the wildcard — Wolfram Alpha for math and science. It doesn't just give you answers, it shows you every single step. It's the best tutor money can't buy.

[OUTRO & CTA - 8:00-8:30]
Those are the 5 AI tools that took me from barely passing to straight A's. If you found this useful, subscribe — I drop new creator and student productivity videos every week. And drop a comment: which tool are you trying first?`;

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

  // ✅ FIX 3: New Chat button handler
  const handleNewChat = () => {
    setMessages([]);
    setInputValue('');
    setIsTyping(false);
  };

  // ✅ FIX 2: Real Gemini API connection
 const handleSend = async () => {
  if (!inputValue.trim()) return;

  const userMsg: Message = {
    id: `msg-${Date.now()}`,
    role: 'user',
    type: 'text',
    content: inputValue.trim(),
    timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
  };

  setMessages((prev) => [...prev, userMsg]);
  const prompt = inputValue.trim();
  setInputValue('');
  setIsTyping(true);

  try {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idea: prompt }),
    });

    const data = await res.json();
    setIsTyping(false);

    // ✅ Handle titles
    if (data.type === 'titles') {
      setMessages((prev) => [...prev, {
        id: `msg-ai-${Date.now()}`,
        role: 'ai',
        type: 'titles',
        content: 'Here are 6 viral titles for your video. Pick the one you love!',
        data: data.titles,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      }]);
      return;
    }

    // ✅ Handle hooks
    if (data.type === 'hooks') {
      setMessages((prev) => [...prev, {
        id: `msg-ai-${Date.now()}`,
        role: 'ai',
        type: 'hooks',
        content: 'Here are 3 powerful hooks. Pick the one that fits your energy!',
        data: data.hooks,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      }]);
      return;
    }

    // ✅ Handle script
    if (data.type === 'script') {
      setMessages((prev) => [...prev, {
        id: `msg-ai-${Date.now()}`,
        role: 'ai',
        type: 'script',
        content: 'Here is your full script! Edit any section or ask me to rewrite it.',
        data: data.result,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      }]);
      return;
    }

    // Fallback
    setMessages((prev) => [...prev, {
      id: `msg-ai-${Date.now()}`,
      role: 'ai',
      type: 'text',
      content: data.result || 'Something went wrong, try again!',
      timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
    }]);

  } catch (err) {
    setIsTyping(false);
    setMessages((prev) => [...prev, {
      id: `msg-err-${Date.now()}`,
      role: 'ai',
      type: 'text',
      content: 'API error — check your Gemini key in Vercel settings.',
      timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
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
              AI tools for students → viral YouTube
            </h1>
            <p className="text-[11px] text-white/30">6 messages · YouTube · Casual</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* ✅ FIX 3: New Chat button wired up */}
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
                        ? 'bg-purple-500/20 border border-purple-500/30 text-purple-300' :'glass border border-white/8 text-white/40 hover:text-white/60'
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
                        ? 'bg-pink-500/20 border border-pink-500/30 text-pink-300' :'glass border border-white/8 text-white/40 hover:text-white/60'
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

      {/* Messages */}
      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 md:px-6 lg:px-10 xl:px-16 py-6 space-y-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 animate-fade-in ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            {/* Avatar */}
            <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mt-1 ${
              msg.role === 'ai' ?'bg-gradient-vyro' :'bg-white/10'
            }`}>
              {msg.role === 'ai' ? (
                <Sparkles size={14} className="text-white" />
              ) : (
                <span className="text-xs font-bold text-white">Y</span>
              )}
            </div>

            {/* Content */}
            <div className={`flex flex-col gap-2 max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              {msg.content && (
                <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'user' ?'chat-bubble-user text-white rounded-tr-sm' :'chat-bubble-ai text-white/80 rounded-tl-sm'
                }`}>
                  {msg.content}
                </div>
              )}

              {msg.type === 'titles' && msg.data && (
                <TitleCards titles={msg.data as string[]} />
              )}

              {msg.type === 'hooks' && msg.data && (
                <HookCards hooks={msg.data as string[]} />
              )}

              {msg.type === 'script' && msg.data && (
                <ScriptCard script={msg.data as string} />
              )}

              <span className="text-[10px] text-white/20 px-1">{msg.timestamp}</span>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
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
              placeholder='Tell VYRO what to create... or say "make it more emotional" to refine'
              className="w-full bg-transparent px-4 pt-4 pb-2 text-sm text-white placeholder:text-white/25 focus:outline-none resize-none max-h-32 scrollbar-hide"
              style={{ minHeight: '48px' }}
            />
            <div className="flex items-center justify-between px-3 pb-3">
              <div className="flex items-center gap-1">
                {['More titles', 'Improve hook', 'Rewrite script', 'Make shorter'].map((cmd) => (
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
                <span className="text-[11px] text-white/20">⌘↵ to send</span>
                <button
                  onClick={handleSend}
                  disabled={!inputValue.trim()}
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
