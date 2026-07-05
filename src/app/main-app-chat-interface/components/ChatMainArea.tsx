'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Menu, Sparkles, Send, ChevronDown, Download, Share2, Plus, LogOut, Crown, X, Wand2, Zap, Flame, Star, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import TitleCards from './TitleCards';
import HookCards from './HookCards';
import ScriptCard from './ScriptCard';
import WinningVault from './WinningVault';

type ChatStep = 'idle' | 'titles' | 'hooks' | 'script' | 'done';
interface Message { id: string; role: 'user' | 'ai'; type: 'text' | 'titles' | 'hooks' | 'script'; content?: string; data?: unknown; timestamp: string; }

const platforms = ['YouTube', 'TikTok', 'Instagram', 'Twitter/X'];
const tones = ['Casual', 'Professional', 'Storytelling', 'Educational', 'Hype'];
const durations = ['Shorts (< 60s)', 'Medium (3-8 min)', 'Long (8-20 min)', '20-40 min', '40-60 min', '1-2 hours', 'Custom'];
const FREE_LIMIT = 3;

const greetings = [
  (name: string) => `Hey ${name}! What's the idea today? 🚀`,
  (name: string) => `Welcome back, ${name}! Let's make something viral 🔥`,
  (name: string) => `Ready to create, ${name}? ✨`,
  (name: string) => `${name}, your next viral video starts here 👇`,
  (name: string) => `Let's cook something great, ${name}! 🎬`,
  (name: string) => `Good to see you, ${name}! What are we creating? 💡`,
  (name: string) => `${name}, your audience is waiting! Let's go 🎯`,
  (name: string) => `Time to create magic, ${name} ✨`,
];

const promptSets = [
  [
    { icon: '🎮', text: '5 gaming tips that pros never share' },
    { icon: '💰', text: 'How I made ₹1 lakh as a student' },
    { icon: '📱', text: 'Best AI tools for content creators 2026' },
    { icon: '🏋️', text: 'Morning routine that changed my life' },
  ],
  [
    { icon: '🧠', text: 'Study hacks that actually work' },
    { icon: '📸', text: 'How to grow on Instagram in 30 days' },
    { icon: '🚀', text: 'From 0 to 10k subscribers — my story' },
    { icon: '💼', text: 'Side hustles you can start today' },
  ],
  [
    { icon: '🎵', text: 'I tried viral TikTok trends for a week' },
    { icon: '🌍', text: 'Travel hacks nobody tells you' },
    { icon: '📚', text: 'Books that made me smarter in 2026' },
    { icon: '🤖', text: 'How AI is changing content creation' },
  ],
  [
    { icon: '🍕', text: 'Street food secrets from local vendors' },
    { icon: '💪', text: 'I worked out every day for 30 days' },
    { icon: '🎯', text: 'How to find your niche as a creator' },
    { icon: '🔑', text: 'Productivity secrets of top YouTubers' },
  ],
];

interface Props { sidebarOpen: boolean; onToggleSidebar: () => void; activeChatId: string; onChatSaved?: (title: string, platform: string) => void; onNewChat?: () => void; }

function PaywallModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-[#0d0d1f] border border-purple-500/30 rounded-2xl p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-white/30 hover:text-white/60"><X size={16} /></button>
        <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center mb-4"><Crown size={22} className="text-white" /></div>
        <h2 className="text-xl font-bold text-white mb-2">You've used your 3 free generations</h2>
        <p className="text-white/50 text-sm mb-6 leading-relaxed">Upgrade to Pro or Ultra to keep creating viral content.</p>
        <div className="space-y-2">
          <button onClick={() => {
            if (typeof window !== 'undefined') {
              const u = JSON.parse(localStorage.getItem('creo_current_user') || '{}');
              const w = JSON.parse(localStorage.getItem('creo_upgrade_waitlist') || '[]');
              w.push({ email: u.email, plan: 'pro', date: new Date().toISOString() });
              localStorage.setItem('creo_upgrade_waitlist', JSON.stringify(w));
            }
            toast.success("You're on the Pro waitlist!");
            onClose();
          }} className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold text-sm hover:opacity-90 transition-all">
            Join Pro Waitlist — ₹999/mo
          </button>
          <button onClick={() => {
            if (typeof window !== 'undefined') {
              const u = JSON.parse(localStorage.getItem('creo_current_user') || '{}');
              const w = JSON.parse(localStorage.getItem('creo_upgrade_waitlist') || '[]');
              w.push({ email: u.email, plan: 'ultra', date: new Date().toISOString() });
              localStorage.setItem('creo_upgrade_waitlist', JSON.stringify(w));
            }
            toast.success("You're on the Ultra waitlist!");
            onClose();
          }} className="w-full py-3 rounded-xl border border-purple-500/30 text-purple-300 font-semibold text-sm hover:bg-purple-500/10 transition-all">
            Join Ultra Waitlist — ₹2999/mo
          </button>
        </div>
      </div>
    </div>
  );
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
  const [showPaywall, setShowPaywall] = useState(false);
  const [showVault, setShowVault] = useState(false);
  const [userName, setUserName] = useState('');
  const [greetingFn] = useState(() => greetings[Math.floor(Math.random() * greetings.length)]);
  const [promptSet] = useState(() => promptSets[Math.floor(Math.random() * promptSets.length)]);

  const getGenCount = () => typeof window === 'undefined' ? 0 : parseInt(localStorage.getItem('creo_gen_count') || '0');
  const bumpGenCount = () => { if (typeof window !== 'undefined') localStorage.setItem('creo_gen_count', String(getGenCount() + 1)); };
  const isProUser = () => { if (typeof window === 'undefined') return false; try { const u = JSON.parse(localStorage.getItem('creo_current_user') || '{}'); return u.plan === 'pro' || u.plan === 'ultra'; } catch { return false; } };
  const currentPlan = () => { try { return JSON.parse(localStorage.getItem('creo_current_user') || '{}').plan || 'free'; } catch { return 'free'; } };

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesContainerRef.current) messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => {
    try { const u = JSON.parse(localStorage.getItem('creo_current_user') || '{}'); if (u.name) setUserName(u.name.split(' ')[0]); } catch {}
  }, []);

  const togglePlatform = (p: string) => setSelectedPlatforms((prev) => prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]);

  const handleNewChat = () => { setMessages([]); setInputValue(''); setIsTyping(false); setStep('idle'); setSelectedTitle(''); if (onNewChat) onNewChat(); };

  const handleSignOut = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('creo_current_user');
      localStorage.removeItem('creo_session');
      sessionStorage.removeItem('creo_session');
    }
    toast.success('Signed out');
    setTimeout(() => router.push('/sign-up-login-screen'), 600);
  };

  const handleExport = () => {
    const s = messages.find((m) => m.type === 'script');
    if (!s) { toast.error('No script yet!'); return; }
    const text = typeof s.data === 'string' ? s.data : JSON.stringify(s.data);
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([text], { type: 'text/plain' })), download: 'creo-script.txt' });
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    toast.success('Script downloaded!');
  };

  const handleShare = () => navigator.clipboard.writeText(window.location.href).then(() => toast.success('Link copied!')).catch(() => toast.error('Could not copy'));

  const addAiMessage = (msg: Omit<Message, 'id' | 'timestamp'>) => setMessages((prev) => [...prev, { ...msg, id: `ai-${Date.now()}`, timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) }]);
  const addUserMessage = (content: string) => setMessages((prev) => [...prev, { id: `u-${Date.now()}`, role: 'user', type: 'text', content, timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) }]);
  const callApi = async (idea: string, forceType: string) => { const r = await fetch('/api/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ idea, forceType }) }); return r.json(); };

  const handleSendWithText = useCallback(async (overrideText?: string) => {
    const userInput = (overrideText ?? inputValue).trim();
    if (!userInput) return;
    if (!isProUser() && getGenCount() >= FREE_LIMIT) { setShowPaywall(true); return; }
    setInputValue('');
    addUserMessage(userInput);
    setIsTyping(true);
    try {
      if (step === 'idle') {
        const data = await callApi(userInput, 'titles');
        setIsTyping(false);
        addAiMessage({ role: 'ai', type: 'titles', content: '🎯 Here are 6 viral titles! Click the one you love:', data: data.titles });
        setStep('titles'); bumpGenCount();
        if (onChatSaved) onChatSaved(userInput, selectedPlatforms[0]);
        return;
      }
      if (step === 'titles') {
        setSelectedTitle(userInput);
        const data = await callApi(userInput, 'hooks');
        setIsTyping(false);
        addAiMessage({ role: 'ai', type: 'hooks', content: '🪝 Here are 3 powerful hooks! Click the one that fits:', data: data.hooks });
        setStep('hooks'); bumpGenCount(); return;
      }
      if (step === 'hooks') {
        const data = await callApi(`Title: "${selectedTitle}". Hook: "${userInput}". Platform: ${selectedPlatforms.join(', ')}. Tone: ${selectedTone}. Duration: ${selectedDuration}.`, 'script');
        setIsTyping(false);
        addAiMessage({ role: 'ai', type: 'script', content: '📝 Here is your full script!', data: data.result });
        setStep('done'); bumpGenCount(); return;
      }
      if (step === 'done') {
        const data = await callApi(`Topic: "${selectedTitle}". Request: "${userInput}". Tone: ${selectedTone}.`, 'script');
        setIsTyping(false);
        addAiMessage({ role: 'ai', type: 'script', content: '✨ Refined script!', data: data.result });
        bumpGenCount(); return;
      }
    } catch { setIsTyping(false); addAiMessage({ role: 'ai', type: 'text', content: 'Something went wrong. Please try again!' }); }
  }, [inputValue, step, selectedTitle, selectedPlatforms, selectedTone, selectedDuration, onChatSaved]);

  const handleTitleSelect = useCallback((t: string) => handleSendWithText(t), [handleSendWithText]);
  const handleHookSelect = useCallback((h: string) => handleSendWithText(h), [handleSendWithText]);

  const getPlaceholder = () => {
    if (step === 'idle') return 'What is your video about? e.g. "5 AI tools for students"';
    if (step === 'titles') return 'Or type a title manually...';
    if (step === 'hooks') return 'Or type a hook manually...';
    if (step === 'done') return 'Ask me to refine, make shorter, change tone...';
    return 'Tell CRÉO what to create...';
  };

  const getStepLabel = () => {
    if (step === 'idle') return 'New Chat — Tell CRÉO your video topic';
    if (step === 'titles') return 'Step 2 — Pick a title';
    if (step === 'hooks') return 'Step 3 — Pick a hook';
    return '🎉 Script ready — refine anytime!';
  };

  const genLeft = Math.max(0, FREE_LIMIT - getGenCount());

  return (
    <div className="flex flex-col" style={{ height: '100dvh' }}>
      {showPaywall && <PaywallModal onClose={() => setShowPaywall(false)} />}
      {showVault && <WinningVault isOpen={showVault} onClose={() => setShowVault(false)} plan={currentPlan()} />}

      {/* TOPBAR */}
      <div className="flex-shrink-0 h-14 flex items-center justify-between px-3 md:px-6 border-b border-white/5 bg-[#080812]/90 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <button onClick={onToggleSidebar} className="w-8 h-8 rounded-lg glass border border-white/8 flex items-center justify-center text-white/40 hover:text-white transition-all lg:hidden"><Menu size={15} /></button>
          <div>
            <h1 className="text-xs sm:text-sm font-semibold text-white truncate max-w-[160px] sm:max-w-xs">{getStepLabel()}</h1>
            <p className="text-[10px] text-white/30 hidden sm:block">{selectedPlatforms.join(', ')} · {selectedTone}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {!isProUser() && (
            <button onClick={() => setShowPaywall(true)} className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 text-[11px] text-purple-400 hover:bg-purple-500/20 transition-all">
              <Crown size={11} />{genLeft} free left
            </button>
          )}
          <button onClick={handleNewChat} className="flex items-center gap-1 px-2 py-1.5 rounded-lg glass border border-white/8 text-xs font-medium text-white/50 hover:text-white/70 transition-all"><Plus size={12} /><span className="hidden sm:inline">New</span></button>
          {/* ✅ Vault button */}
          <button onClick={() => setShowVault(true)} className="flex items-center gap-1 px-2 py-1.5 rounded-lg glass border border-yellow-500/20 text-xs font-medium text-yellow-400/70 hover:text-yellow-400 transition-all">
            <Star size={12} /><span className="hidden sm:inline">Vault</span>
          </button>
          <button onClick={() => setShowControls(!showControls)} className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${showControls ? 'bg-purple-500/15 border border-purple-500/30 text-purple-400' : 'glass border border-white/8 text-white/50 hover:text-white/70'}`}>
            <Sparkles size={12} /><span className="hidden sm:inline">Controls</span><ChevronDown size={11} className={`transition-transform ${showControls ? 'rotate-180' : ''}`} />
          </button>
          <button onClick={handleExport} className="flex items-center gap-1 px-2 py-1.5 rounded-lg glass border border-white/8 text-xs font-medium text-white/50 hover:text-white/70 transition-all"><Download size={12} /><span className="hidden sm:inline">Export</span></button>
          <button onClick={handleShare} className="w-7 h-7 rounded-lg glass border border-white/8 flex items-center justify-center text-white/40 hover:text-white/70 transition-all"><Share2 size={13} /></button>
          <button onClick={() => router.push('/settings')} className="w-7 h-7 rounded-lg glass border border-white/8 flex items-center justify-center text-white/40 hover:text-white/70 transition-all" title="Settings"><Settings size={13} /></button>
          <button onClick={handleSignOut} className="w-7 h-7 rounded-lg glass border border-white/8 flex items-center justify-center text-white/40 hover:text-red-400 transition-all" title="Sign out"><LogOut size={13} /></button>
        </div>
      </div>

      {/* CONTROLS */}
      {showControls && (
        <div className="flex-shrink-0 px-3 md:px-6 py-3 border-b border-white/5 bg-[#0a0a1a]/50 backdrop-blur-sm animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-wrap gap-3">
            <div><p className="text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-1.5">Platform</p><div className="flex flex-wrap gap-1">{platforms.map((p) => <button key={p} onClick={() => togglePlatform(p)} className={`px-2 py-0.5 rounded-lg text-xs font-medium transition-all ${selectedPlatforms.includes(p) ? 'bg-purple-500/20 border border-purple-500/30 text-purple-300' : 'glass border border-white/8 text-white/40'}`}>{p}</button>)}</div></div>
            <div><p className="text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-1.5">Tone</p><div className="flex flex-wrap gap-1">{tones.map((t) => <button key={t} onClick={() => setSelectedTone(t)} className={`px-2 py-0.5 rounded-lg text-xs font-medium transition-all ${selectedTone === t ? 'bg-pink-500/20 border border-pink-500/30 text-pink-300' : 'glass border border-white/8 text-white/40'}`}>{t}</button>)}</div></div>
            <div><p className="text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-1.5">Duration</p><div className="flex flex-wrap gap-1">{durations.map((d) => <button key={d} onClick={() => setSelectedDuration(d)} className={`px-2 py-0.5 rounded-lg text-xs font-medium transition-all ${selectedDuration === d ? 'bg-violet-500/20 border border-violet-500/30 text-violet-300' : 'glass border border-white/8 text-white/40'}`}>{d}</button>)}</div></div>
          </div>
        </div>
      )}

      {/* MESSAGES */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto overscroll-contain">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full px-4 text-center">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[400px] h-[400px] bg-purple-600/5 rounded-full blur-[100px]" />
            </div>
            <div className="relative z-10 w-full max-w-lg">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/20 flex items-center justify-center mx-auto mb-6">
                <Wand2 size={28} className="text-purple-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">{userName ? greetingFn(userName) : 'What are we creating today? ✨'}</h2>
              <p className="text-white/40 text-sm mb-2">Type your idea or pick a quick start below</p>
              {!isProUser() && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 mb-8">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                  <p className="text-purple-400/80 text-xs">{genLeft} free generation{genLeft !== 1 ? 's' : ''} remaining</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-2 mb-8 w-full">
                {promptSet.map((prompt) => (
                  <button key={prompt.text} onClick={() => handleSendWithText(prompt.text)}
                    className="flex items-start gap-2.5 p-3.5 rounded-xl glass border border-white/8 hover:border-purple-500/30 hover:bg-purple-500/5 text-left transition-all group">
                    <span className="text-lg flex-shrink-0">{prompt.icon}</span>
                    <span className="text-xs text-white/50 group-hover:text-white/70 transition-colors leading-snug">{prompt.text}</span>
                  </button>
                ))}
              </div>
              <div className="flex items-center justify-center gap-1">
                {[{ icon: Sparkles, label: 'Idea', color: 'text-purple-400' }, { icon: Zap, label: 'Titles', color: 'text-pink-400' }, { icon: Flame, label: 'Hook', color: 'text-orange-400' }, { icon: Star, label: 'Script', color: 'text-yellow-400' }].map((s, i) => (
                  <React.Fragment key={s.label}>
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center"><s.icon size={14} className={s.color} /></div>
                      <span className="text-[9px] text-white/25">{s.label}</span>
                    </div>
                    {i < 3 && <div className="w-6 h-px bg-white/10 mb-4 mx-1" />}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="px-3 md:px-6 py-4 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.type === 'text' && (
                <div className={`max-w-[85%] sm:max-w-lg px-4 py-2.5 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-purple-600/80 text-white rounded-br-sm' : 'glass border border-white/8 text-white/80 rounded-bl-sm'}`}>{msg.content}</div>
              )}
              {msg.type === 'titles' && (
                <div className="w-full">
                  <p className="text-white/60 text-sm mb-2 flex items-center gap-1.5"><Zap size={12} className="text-purple-400" />{msg.content}</p>
                  <TitleCards titles={msg.data as string[]} onSelect={handleTitleSelect} topic={selectedTitle} platform={selectedPlatforms[0]} plan={currentPlan()} />
                </div>
              )}
              {msg.type === 'hooks' && (
                <div className="w-full">
                  <p className="text-white/60 text-sm mb-2 flex items-center gap-1.5"><Flame size={12} className="text-pink-400" />{msg.content}</p>
                  <HookCards hooks={msg.data as string[]} onSelect={handleHookSelect} topic={selectedTitle} platform={selectedPlatforms[0]} plan={currentPlan()} />
                </div>
              )}
              {msg.type === 'script' && (
                <div className="w-full">
                  <p className="text-white/60 text-sm mb-2 flex items-center gap-1.5"><Star size={12} className="text-violet-400" />{msg.content}</p>
                  <ScriptCard script={msg.data as string} />
                </div>
              )}
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="glass border border-white/8 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-2">
                <Sparkles size={12} className="text-purple-400 animate-pulse" />
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-xs text-white/30">CRÉO is thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* INPUT */}
      <div className="flex-shrink-0 px-3 md:px-6 py-3 border-t border-white/5 bg-[#080812]/90 backdrop-blur-xl">
        <div className="flex items-end gap-2 max-w-3xl mx-auto">
          <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl overflow-hidden focus-within:border-purple-500/40 focus-within:bg-purple-500/5 transition-all">
            <textarea ref={inputRef} value={inputValue} onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendWithText(); } }}
              placeholder={getPlaceholder()} rows={1}
              className="w-full bg-transparent text-white text-sm placeholder:text-white/25 px-4 py-3 resize-none focus:outline-none" style={{ maxHeight: '100px' }} />
          </div>
          <button onClick={() => handleSendWithText()} disabled={!inputValue.trim() || isTyping}
            className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white hover:opacity-90 hover:scale-105 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:scale-100 flex-shrink-0">
            <Send size={16} />
          </button>
        </div>
        <p className="text-center text-[10px] text-white/15 mt-1.5 hidden sm:block">Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  );
}
