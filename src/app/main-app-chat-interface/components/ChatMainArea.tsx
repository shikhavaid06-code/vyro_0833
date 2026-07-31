'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Menu, Sparkles, Send, ChevronDown, Download, Share2, Plus, LogOut, Crown, X, Wand2, Zap, Flame, Star, Settings, Brain, Layers, Radar, Target, Bot, Check, Gift, Globe } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getLocalePricing, formatPerDay } from '@/lib/pricing';
import TitleCards from './TitleCards';
import HookCards from './HookCards';
import ScriptCard from './ScriptCard';
import WinningVault from './WinningVault';
import CreatorBrainModal from './CreatorBrainModal';
import CompetitorIntelModal from './CompetitorIntelModal';

type ChatStep = 'idle' | 'titles' | 'hooks' | 'script' | 'done';
interface Message { id: string; role: 'user' | 'ai'; type: 'text' | 'titles' | 'hooks' | 'script' | 'clarify'; content?: string; data?: unknown; timestamp: string; idea?: string; forceType?: string; }

const platforms = ['YouTube', 'TikTok', 'Instagram', 'Twitter/X'];
const tones = ['Casual', 'Professional', 'Storytelling', 'Educational', 'Hype'];
const durations = ['Shorts (< 60s)', 'Medium (3-8 min)', 'Long (8-20 min)', '20-40 min', '40-60 min', '1-2 hours', 'Custom'];
// ✅ Explicit language selector — before this, CRÉO only auto-detected the
// output language from the idea's own text. That works fine when a creator
// types in Hindi/Tamil/etc., but gives them no way to, say, type an idea in
// English and still get titles/hooks/scripts written in Hindi (or vice
// versa). 'Auto-detect' preserves the old detect-and-match behavior exactly;
// picking any other language always wins, regardless of the input's language.
const languages = ['Auto-detect', 'English', 'Hindi', 'Tamil', 'Telugu', 'Marathi', 'Bengali', 'Kannada'];
// ✅ A regional language can optionally be code-mixed with English — the way
// real creators actually talk (e.g. "mere pass time nahi hai" keeps "time" in
// English inside an otherwise Hindi sentence), not pure/formal language. This
// is a toggle rather than doubling the chip list (Hindi, Hindi + English,
// Tamil, Tamil + English, ...) — same choice, more presentable.
const isRegionalLanguage = (l: string) => l !== 'Auto-detect' && l !== 'English';
const FREE_LIMIT = 3;
// ✅ "What's New" announcement version — shown once per browser until the
// user dismisses/confirms it, then never again UNLESS this string changes
// (bump it whenever there's a new feature worth announcing this same way).
// Bumped to lang-v2 so users who already saw the pure-language announcement
// get told about the new English-mix option too.
const WHATS_NEW_VERSION = 'lang-v2';

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

interface SavedChat { id: string; title: string; preview: string; time: string; platform: string; generated: number; }
interface Props { sidebarOpen: boolean; onToggleSidebar: () => void; activeChatId: string; onChatSaved?: (title: string, platform: string) => void; onNewChat?: () => void; chats?: SavedChat[]; onOpenNova?: () => void; }

// ✅ THE SIGNATURE SUSPENSE LOADER (from the product spec) — rotating status
// lines that make the wait feel like heavy machinery working, not a spinner.
const SUSPENSE_LINES: Record<string, string[]> = {
  titles: [
    'Creo AI is reverse-engineering viral title structures...',
    'Scanning proven curiosity-gap patterns...',
    'Ranking titles by click-pull...',
  ],
  hooks: [
    'Creo AI is reverse-engineering viral database structures...',
    'Testing openers against retention curves...',
    'Sharpening your three strongest hooks...',
  ],
  script: [
    'Structuring your script beat by beat...',
    'Writing like a human — cutting the AI filler...',
    'Timing every section for watch-time...',
  ],
  expand: [
    'Expanding one idea across every platform...',
    'Writing hooks, titles, Shorts and threads...',
    'Making each piece platform-native...',
  ],
};

type LoaderMode = 'titles' | 'hooks' | 'script' | 'expand';

function SuspenseLoader({ mode }: { mode: LoaderMode }) {
  const lines = SUSPENSE_LINES[mode];
  const [lineIndex, setLineIndex] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setLineIndex((i) => (i + 1) % lines.length), 1500);
    return () => clearInterval(t);
  }, [lines.length]);
  return (
    <div className="glass border border-purple-500/15 rounded-2xl rounded-bl-sm px-4 py-3.5 w-full max-w-sm animate-slide-up">
      <div className="flex items-center gap-2.5 mb-3">
        <div className="relative w-5 h-5 flex-shrink-0">
          <div className="absolute inset-0 rounded-full border-2 border-purple-500/20" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-purple-500 animate-spin" />
          <Sparkles size={9} className="absolute inset-0 m-auto text-purple-400 animate-pulse" />
        </div>
        <span key={lineIndex} className="text-xs text-white/60 animate-fade-in">{lines[lineIndex]}</span>
      </div>
      <div className="h-1 rounded-full bg-white/5 overflow-hidden">
        <div className="h-full w-1/3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 animate-loader-sweep" />
      </div>
    </div>
  );
}

// ✅ FIXED: this modal used to collect a fake "waitlist" in localStorage with
// outdated prices (₹999/₹2999) — while a fully working Razorpay checkout
// already existed at /upgrade. Users who hit their limit were being sent to
// a dead end instead of the payment page. Now it routes to the real checkout
// with the real regional prices from lib/pricing.ts.
function PaywallModal({ onClose, streak = 0 }: { onClose: () => void; streak?: number }) {
  const router = useRouter();
  const prices = getLocalePricing();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/70 backdrop-blur-sm animate-backdrop-in">
      <div className="w-full max-w-sm rounded-2xl relative animate-modal-in overflow-hidden border border-purple-500/30 bg-[#0d0d1f]">
        {/* Ambient glow */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-[280px] h-[160px] bg-purple-600/25 rounded-full blur-[70px] pointer-events-none" />
        <button onClick={onClose} className="absolute top-4 right-4 text-white/30 hover:text-white/60 z-10"><X size={16} /></button>

        <div className="relative p-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center mb-4 shadow-lg shadow-purple-500/30 animate-pop-in">
            <Crown size={26} className="text-white" />
          </div>

          <h2 className="text-xl font-bold text-white mb-1.5">You're out of free generations — for today</h2>
          {streak > 0 ? (
            <p className="text-orange-400/90 text-xs font-medium mb-1 flex items-center gap-1">
              <Flame size={12} className="fill-orange-400/40" />Your {streak}-day streak is alive — don't let the limit stop it.
            </p>
          ) : null}
          <p className="text-white/45 text-sm mb-5 leading-relaxed">They reset tomorrow. Or keep the momentum going right now:</p>

          {/* What upgrading unlocks — concrete, not vague */}
          <div className="space-y-1.5 mb-5">
            {[
              ['🚀', '100 generations/day', 'Pro'],
              ['🔥', 'Brutal Reviewer — score & fix scripts', 'Pro'],
              ['🧩', '1 idea → a full week of content', 'Pro'],
              ['🧠', 'An AI that learns YOUR voice', 'Ultra'],
            ].map(([emoji, text, tier]) => (
              <div key={text as string} className="flex items-center gap-2.5 rounded-lg bg-white/[0.03] border border-white/6 px-3 py-2">
                <span className="text-sm">{emoji}</span>
                <span className="text-xs text-white/70 flex-1">{text}</span>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${tier === 'Ultra' ? 'bg-amber-500/10 text-amber-400' : 'bg-purple-500/10 text-purple-400'}`}>{tier}</span>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <div>
              <button onClick={() => router.push('/upgrade')} className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold text-sm hover:opacity-90 active:scale-[0.98] transition-all glow-button">
                🚀 Grow with Pro — {prices.symbol}{prices.pro}/mo
              </button>
              {/* ✅ Per-day anchor — reframes the monthly price at the exact
                  moment (hitting the daily cap) someone is most likely to convert. */}
              <p className="text-center text-[10px] text-white/30 mt-1">≈ {prices.symbol}{formatPerDay(prices.proRaw, prices.currency)}/day</p>
            </div>
            <div>
              <button onClick={() => router.push('/upgrade')} className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500/15 to-pink-500/15 border border-amber-500/30 text-amber-300 font-semibold text-sm hover:bg-amber-500/15 active:scale-[0.98] transition-all">
                👑 Build with Ultra — {prices.symbol}{prices.ultra}/mo
              </button>
              <p className="text-center text-[10px] text-white/30 mt-1">≈ {prices.symbol}{formatPerDay(prices.ultraRaw, prices.currency)}/day</p>
            </div>
          </div>

          {/* ✅ Yearly-billing nudge — prices above are monthly; most people
              never learn the 25%-off yearly option exists until /upgrade,
              so surface it here too, right where the price is already top of mind. */}
          <button onClick={() => router.push('/upgrade')} className="w-full mt-2.5 flex items-center justify-center gap-1 text-[11px] text-white/35 hover:text-white/55 transition-colors">
            🎉 Save 25% with yearly billing
          </button>

          {/* Free alternative — honest, and it fuels the referral loop */}
          <button onClick={() => router.push('/settings')} className="w-full mt-3 flex items-center justify-center gap-1.5 text-[11px] text-emerald-400/80 hover:text-emerald-300 transition-colors">
            🎁 Or invite a friend — earn +1 free generation every day, forever
          </button>

          <p className="text-center text-[10px] text-white/25 mt-3">24-hour refund guarantee · No auto-renewal</p>
        </div>
      </div>
    </div>
  );
}

// ✅ "WHAT'S NEW" ANNOUNCEMENT — the language selector used to be a plain
// chip buried inside the collapsed Controls drawer: nothing told a creator it
// existed, and clicking a chip just silently changed a setting with no
// confirmation it had actually taken effect. This surfaces the feature the
// moment someone opens the app after it ships, explains it in one line, and
// makes picking a language an explicit, confirmed choice — not a
// hidden toggle. Shown once per browser (see WHATS_NEW_VERSION above);
// "Skip for now" leaves the existing Auto-detect behavior untouched and the
// same picker stays available in Controls afterward either way.
function WhatsNewModal({
  onDismiss,
  initialLanguage,
  initialMix,
}: {
  onDismiss: (chosenLanguage?: string, mixWithEnglish?: boolean) => void;
  initialLanguage: string;
  initialMix: boolean;
}) {
  const [picked, setPicked] = useState(initialLanguage);
  const [mixed, setMixed] = useState(initialMix);
  const regional = isRegionalLanguage(picked);
  const displayLabel = regional && mixed ? `${picked} + English` : picked;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/70 backdrop-blur-sm animate-backdrop-in">
      <div className="w-full max-w-sm rounded-2xl relative animate-modal-in overflow-hidden border border-sky-500/30 bg-[#0d0d1f]">
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-[280px] h-[160px] bg-sky-600/25 rounded-full blur-[70px] pointer-events-none" />
        <button onClick={() => onDismiss()} className="absolute top-4 right-4 text-white/30 hover:text-white/60 z-10"><X size={16} /></button>

        <div className="relative p-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-300 border border-sky-500/25">What's New</span>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-600 to-purple-600 flex items-center justify-center mb-4 shadow-lg shadow-sky-500/30 animate-pop-in">
            <Globe size={26} className="text-white" />
          </div>

          <h2 className="text-xl font-bold text-white mb-1.5">Choose your language</h2>
          <p className="text-white/45 text-sm mb-4 leading-relaxed">
            CRÉO can now write your titles, hooks, and scripts in Hindi, Tamil, Telugu, Marathi, Bengali, or Kannada — not just English. Pick what you want your content written in:
          </p>

          <div className="flex flex-wrap gap-1.5 mb-3">
            {languages.map((l) => (
              <button
                key={l}
                onClick={() => { setPicked(l); if (!isRegionalLanguage(l)) setMixed(false); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${picked === l ? 'bg-sky-500/20 border border-sky-500/40 text-sky-300' : 'glass border border-white/8 text-white/50 hover:text-white/80'}`}
              >
                {picked === l && <Check size={11} className="inline mr-1 -mt-0.5" />}
                {l}
              </button>
            ))}
          </div>

          {/* ✅ Code-mix toggle — real regional-language creator content is
              almost always mixed with English ("mere pass time nahi hai"),
              not pure/formal language. Only shown once a regional language is
              picked, so it never clutters Auto-detect/English. */}
          {regional && (
            <button
              onClick={() => setMixed((m) => !m)}
              title='Blend natural English words in, like "mere pass time nahi hai"'
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all mb-5 ${mixed ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300' : 'glass border border-white/8 text-white/45 hover:text-white/70'}`}
            >
              <span className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${mixed ? 'bg-emerald-500 border-emerald-500' : 'border-white/20'}`}>
                {mixed && <Check size={10} className="text-white" />}
              </span>
              <span className="flex-1 text-left">{picked} + English mix — how creators actually talk</span>
            </button>
          )}
          {!regional && <div className="mb-5" />}

          <button onClick={() => onDismiss(picked, regional && mixed)} className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-600 to-purple-600 text-white font-semibold text-sm hover:opacity-90 active:scale-[0.98] transition-all">
            Continue in {displayLabel}
          </button>
          <button onClick={() => onDismiss()} className="w-full mt-2.5 text-center text-[11px] text-white/35 hover:text-white/55 transition-colors">
            Skip for now — I'll pick later in Controls
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ChatMainArea({ sidebarOpen, onToggleSidebar, activeChatId, onChatSaved, onNewChat, chats = [], onOpenNova }: Props) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [step, setStep] = useState<ChatStep>('idle');
  const [selectedTitle, setSelectedTitle] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['YouTube']);
  const [selectedTone, setSelectedTone] = useState('Casual');
  const [selectedDuration, setSelectedDuration] = useState('Medium (3-8 min)');
  // ✅ 'Auto-detect' is sent to the server as 'auto', which means "detect the
  // idea's own language and match it" (unchanged old behavior). Any other
  // value is an explicit override that always wins server-side.
  const [selectedLanguage, setSelectedLanguage] = useState('Auto-detect');
  // ✅ Code-mixed style — only meaningful alongside a regional selectedLanguage
  // (see isRegionalLanguage above). When true, the server is asked for
  // natural "<language> + English" creator speech instead of pure/formal
  // language — e.g. "mere pass time nahi hai", not a textbook translation.
  const [mixWithEnglish, setMixWithEnglish] = useState(false);
  // ✅ "What's New" popup — shown once per browser (see WHATS_NEW_VERSION) to
  // announce the language feature and let the user explicitly pick it, rather
  // than the pick being a silent chip nobody knows to look for.
  const [showWhatsNew, setShowWhatsNew] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showVault, setShowVault] = useState(false);
  const [showBrain, setShowBrain] = useState(false);
  const [showIntel, setShowIntel] = useState(false);
  // ✅ Streak — served by the API on every generation; cached for display.
  const [streak, setStreak] = useState(0);
  const [loaderMode, setLoaderMode] = useState<LoaderMode | null>(null);
  // ✅ Regenerate / quick-command state — tracks which message (by id) is
  // currently mid-request, so the right card can show a spinner and every
  // other card stays clickable.
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
  const [applyingCommand, setApplyingCommand] = useState<{ id: string; cmd: string } | null>(null);
  const [userName, setUserName] = useState('');
  const [greetingFn] = useState(() => greetings[Math.floor(Math.random() * greetings.length)]);
  const [promptSet] = useState(() => promptSets[Math.floor(Math.random() * promptSets.length)]);
  // ✅ Referral nudge — same program that already lives in Settings
  // (/api/referral), just surfaced at the moment it actually converts: right
  // after someone sees a finished script, not buried in a settings page
  // nobody opens on day one.
  const [referral, setReferral] = useState<{ code: string; referrals: number } | null>(null);
  const [refCopied, setRefCopied] = useState(false);

  // ✅ Clarifying-question flow — when the raw idea is too vague for strong
  // titles (e.g. "fitness video"), the server asks ONE sharp question back
  // instead of generating generic ones. This holds the original idea while
  // we wait for the answer, so the next input can be merged into it and
  // sent with skipClarify — CRÉO never asks twice for the same idea, and
  // asking never costs a generation (only the merged, real attempt does).
  const [pendingClarify, setPendingClarify] = useState<{ idea: string } | null>(null);

  // ✅ FIXED: this counter never reset — a free user was permanently paywalled
  // after 3 lifetime generations, even though the server (correctly) allows
  // 3 per DAY. Now it's date-scoped to match the server's daily reset.
  // The server check is still the authoritative one; this only exists to
  // skip an obviously-wasted round trip and show "X free left".
  const getGenCount = () => {
    if (typeof window === 'undefined') return 0;
    const today = new Date().toISOString().slice(0, 10);
    if (localStorage.getItem('creo_gen_count_date') !== today) return 0;
    return parseInt(localStorage.getItem('creo_gen_count') || '0');
  };
  const bumpGenCount = () => {
    if (typeof window === 'undefined') return;
    const today = new Date().toISOString().slice(0, 10);
    localStorage.setItem('creo_gen_count', String(getGenCount() + 1));
    localStorage.setItem('creo_gen_count_date', today);
  };
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
    try { setStreak(parseInt(localStorage.getItem('creo_streak') || '0')); } catch {}
  }, []);

  // ✅ Show the "What's New" language announcement once per browser, until
  // dismissed/confirmed — see WHATS_NEW_VERSION.
  useEffect(() => {
    try {
      if (localStorage.getItem('creo_whatsnew_seen') !== WHATS_NEW_VERSION) setShowWhatsNew(true);
    } catch {}
  }, []);

  const handleDismissWhatsNew = (chosenLanguage?: string, mix?: boolean) => {
    if (chosenLanguage) {
      setSelectedLanguage(chosenLanguage);
      setMixWithEnglish(!!mix);
      const label = mix ? `${chosenLanguage} + English` : chosenLanguage;
      toast.success(
        chosenLanguage === 'Auto-detect'
          ? "Language set to auto-detect — you can change this anytime in Controls"
          : `Language set to ${label} — you can change this anytime in Controls`
      );
    }
    try { localStorage.setItem('creo_whatsnew_seen', WHATS_NEW_VERSION); } catch {}
    setShowWhatsNew(false);
  };

  // ✅ Load (and lazily create) this user's referral code once, in the
  // background — same endpoint Settings already calls. Silently no-ops for
  // logged-out/anonymous "try it free" visitors, since /api/referral
  // requires a session; the nudge below just won't render for them.
  useEffect(() => {
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) return;
        const res = await fetch('/api/referral', { headers: { Authorization: `Bearer ${session.access_token}` } });
        const d = await res.json();
        if (d?.code) setReferral({ code: d.code, referrals: d.referrals || 0 });
      } catch {}
    })();
  }, []);

  const referralLink = referral?.code ? `${typeof window !== 'undefined' ? window.location.origin : ''}/?ref=${referral.code}` : '';
  const handleCopyReferral = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink).catch(() => {});
    setRefCopied(true);
    toast.success('Referral link copied!');
    setTimeout(() => setRefCopied(false), 2000);
  };

  // ✅ CHAT HISTORY FIX — previous chats were listed in the sidebar but could
  // never be reopened (nothing stored the messages). Now every chat's full
  // conversation is saved and restored when clicked. If a chat is a KNOWN
  // sidebar entry but genuinely has no saved data (e.g. it's from before this
  // fix shipped), we surface that clearly instead of silently showing a
  // blank screen that looks broken.
  useEffect(() => {
    if (!activeChatId) return;
    try {
      const raw = localStorage.getItem(`creo_chat_data_${activeChatId}`);
      if (raw) {
        const d = JSON.parse(raw);
        if (Array.isArray(d.messages) && d.messages.length > 0) {
          setMessages(d.messages);
          setStep(d.step || 'done');
          setSelectedTitle(d.selectedTitle || '');
          return;
        }
      }
      const isKnownChat = chats.some((c) => c.id === activeChatId);
      if (isKnownChat) {
        toast.info("This chat has no saved messages — it's likely from before chat history was fixed.");
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!activeChatId || messages.length === 0) return;
    try {
      localStorage.setItem(`creo_chat_data_${activeChatId}`, JSON.stringify({ messages, step, selectedTitle }));
    } catch {}
  }, [messages, step, selectedTitle, activeChatId]);

  // ✅ Streak sync — every generation response carries the server-computed
  // streak; keep the flame chip + local cache up to date.
  const syncStreak = (data: any) => {
    if (typeof data?.streak === 'number' && data.streak > 0) {
      setStreak(data.streak);
      try { localStorage.setItem('creo_streak', String(data.streak)); } catch {}
    }
  };

  // ✅ Anonymous entry flow handoff (see /try) — if the user generated hooks
  // before signing in, drop them straight into the workspace instead of
  // making them re-type their topic.
  useEffect(() => {
    try {
      const raw = localStorage.getItem('creo_pending_handoff');
      if (!raw) return;
      const parsed = JSON.parse(raw);
      const topic: string = parsed?.topic || '';
      const hooks: string[] = Array.isArray(parsed?.hooks) ? parsed.hooks : [];
      if (topic && hooks.length) {
        addUserMessage(topic);
        addAiMessage({ role: 'ai', type: 'hooks', content: '🪝 Here are 3 powerful hooks! Click the one that fits:', data: hooks, idea: topic, forceType: 'hooks' });
        setSelectedTitle(topic);
        setStep('hooks');
        bumpGenCount();
        if (onChatSaved) onChatSaved(topic, selectedPlatforms[0]);
      }
    } catch {
      // ignore malformed handoff data
    } finally {
      localStorage.removeItem('creo_pending_handoff');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const togglePlatform = (p: string) => setSelectedPlatforms((prev) => prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]);

  const handleNewChat = () => { setMessages([]); setInputValue(''); setIsTyping(false); setStep('idle'); setSelectedTitle(''); if (onNewChat) onNewChat(); };

  // ✅ SIGN-OUT GLITCH FIX — this used to only clear the app's own
  // `creo_session` flag and never actually ended the real Supabase session.
  // That left a valid Supabase auth token sitting in storage, so the sign-in
  // page's "already logged in? bounce back to the app" check would silently
  // redirect the user right back in a fraction of a second later — a
  // flicker/redirect-loop that looked like the app glitching. Now we end the
  // real Supabase session FIRST and wait for it to finish before redirecting.
  const handleSignOut = async () => {
    // ✅ THIRD SIGN-OUT FIX — the first two fixes attacked the timing race
    // (clearing the real session before redirecting, then a grace-period
    // flag), but the loop kept happening because of something underneath
    // both of those: Next.js's client-side router can reuse an already-
    // mounted copy of the sign-in page from its cache instead of mounting a
    // fresh one, so its "already logged in?" check either doesn't re-run or
    // runs against stale state — which is what "remembers" the login and
    // sends you right back into the app no matter how well the sign-out
    // itself clears storage. The only bulletproof fix for that class of bug
    // is to stop using client-side navigation for sign-out entirely and force
    // a real full-page reload instead — that guarantees a 100% fresh app
    // load with no cached router state of any kind to race against.
    try {
      await supabase.auth.signOut();
    } catch {
      // even if this fails (e.g. offline), still clear local state below so
      // the user isn't stuck looking logged in on this device.
    }
    if (typeof window !== 'undefined') {
      // ✅ FIX — sign-out used to only clear the auth flags (creo_current_user,
      // creo_session, the Supabase token), leaving every other piece of this
      // account's data — the whole chat history sidebar (creo_chat_history),
      // every individual chat's messages (creo_chat_data_<id>), the Winning
      // Vault, streak, and generation count — sitting in localStorage under
      // plain global keys with no user id attached. The next person who
      // signed in on the same browser inherited all of it. Now we wipe every
      // creo_-prefixed key (current and future — anything the app adds later
      // under this prefix is covered automatically) plus any Supabase auth
      // token, so a fresh sign-in always starts from a truly empty slate.
      try {
        Object.keys(localStorage).forEach((k) => {
          if (k.startsWith('creo_') || (k.startsWith('sb-') && k.includes('-auth-token'))) {
            localStorage.removeItem(k);
          }
        });
      } catch {}
      sessionStorage.removeItem('creo_session');
    }
    toast.success('Signed out');
    // Hard navigation, not router.push — see comment above.
    if (typeof window !== 'undefined') window.location.href = '/sign-up-login-screen';
  };

  const handleExport = () => {
    const s = messages.find((m) => m.type === 'script');
    if (!s) { toast.error('No script yet!'); return; }
    // ✅ "Engineered by CRÉO" export footer (Week 1 item) — every exported
    // script carries the brand, so shared scripts market the product.
    const scriptText = typeof s.data === 'string' ? s.data : JSON.stringify(s.data);
    const text = `${scriptText}\n\n${'─'.repeat(40)}\n⚡ Engineered by CRÉO — AI viral titles, hooks & scripts\nhttps://vyro-0833.vercel.app`;
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([text], { type: 'text/plain' })), download: 'creo-script.txt' });
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    toast.success('Script downloaded!');
  };

  const handleShare = () => navigator.clipboard.writeText(window.location.href).then(() => toast.success('Link copied!')).catch(() => toast.error('Could not copy'));

  const addAiMessage = (msg: Omit<Message, 'id' | 'timestamp'>) => setMessages((prev) => [...prev, { ...msg, id: `ai-${Date.now()}`, timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) }]);
  const addUserMessage = (content: string) => setMessages((prev) => [...prev, { id: `u-${Date.now()}`, role: 'user', type: 'text', content, timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) }]);
  // ✅ Sends the real Supabase session token — the server verifies it and
  // looks up the actual plan/usage itself. This is the authoritative check;
  // the client-side pre-check below is just an optimization to avoid an
  // obviously-wasted round trip.
  const callApi = async (idea: string, forceType: string, skipClarify = false) => {
    const { data: { session } } = await supabase.auth.getSession();
    // ✅ 'Auto-detect' → 'auto' (the server's detect-and-match default); any
    // other selection is sent as the explicit override, appending "+ English"
    // when the code-mix toggle is on for a regional language (the server's
    // parseMixedLanguage() picks that shape apart — see api/generate/route.ts).
    const language = selectedLanguage === 'Auto-detect'
      ? 'auto'
      : (isRegionalLanguage(selectedLanguage) && mixWithEnglish ? `${selectedLanguage} + English` : selectedLanguage);
    const r = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
      },
      body: JSON.stringify({ idea, forceType, skipClarify, language }),
    });
    return r.json();
  };

  // ✅ Powers every "Regenerate" button (titles/hooks/script cards). Reuses
  // the exact idea/forceType that produced the message in the first place —
  // captured on the message object at creation time — so a regenerate is a
  // true re-roll of the same request, not a guess. This was previously a
  // dead stub (`toast.info('Regenerating...')`) that never called the API.
  const handleRegenerate = async (id: string) => {
    const msg = messages.find((m) => m.id === id);
    if (!msg || !msg.idea || !msg.forceType || regeneratingId) return;
    if (!isProUser() && getGenCount() >= FREE_LIMIT) { setShowPaywall(true); return; }
    setRegeneratingId(id);
    try {
      const data = await callApi(msg.idea, msg.forceType);
      if (data?.upgradeRequired) {
        toast.info(data.message || 'That feature needs an upgrade!');
        router.push('/upgrade');
        return;
      }
      if (data?.limitReached) { setShowPaywall(true); return; }
      let newData: unknown = null;
      if (msg.forceType === 'titles' && Array.isArray(data?.titles) && data.titles.length > 0) newData = data.titles;
      else if (msg.forceType === 'hooks' && Array.isArray(data?.hooks) && data.hooks.length > 0) newData = data.hooks;
      else if (typeof data?.result === 'string' && data.result) newData = data.result;
      if (!newData) {
        toast.error(data?.message || 'Regeneration failed — try again in a moment.');
        return;
      }
      syncStreak(data);
      bumpGenCount();
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, data: newData } : m)));
      toast.success('Regenerated!');
    } catch {
      toast.error('Regeneration failed — try again in a moment.');
    } finally {
      setRegeneratingId(null);
    }
  };

  // ✅ Powers ScriptCard's quick-command chips ("Make intro shorter", etc.),
  // previously also a dead stub. Sends the current script + the instruction
  // back through /api/generate as a script rewrite and swaps the result in.
  const handleQuickCommand = async (id: string, cmd: string) => {
    const msg = messages.find((m) => m.id === id);
    if (!msg || typeof msg.data !== 'string' || applyingCommand) return;
    if (!isProUser() && getGenCount() >= FREE_LIMIT) { setShowPaywall(true); return; }
    setApplyingCommand({ id, cmd });
    try {
      const idea = `Here is an existing video script:\n\n"""\n${msg.data}\n"""\n\nInstruction: ${cmd}. Rewrite the FULL script applying this instruction, keeping the same topic, structure and length otherwise.`;
      const data = await callApi(idea, 'script');
      if (data?.upgradeRequired) {
        toast.info(data.message || 'That feature needs an upgrade!');
        router.push('/upgrade');
        return;
      }
      if (data?.limitReached) { setShowPaywall(true); return; }
      if (typeof data?.result !== 'string' || !data.result) {
        toast.error(data?.message || 'Failed to apply — try again in a moment.');
        return;
      }
      syncStreak(data);
      bumpGenCount();
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, data: data.result } : m)));
      toast.success(`Applied: "${cmd}"`);
    } catch {
      toast.error('Failed to apply — try again in a moment.');
    } finally {
      setApplyingCommand(null);
    }
  };

  const handleSendWithText = useCallback(async (overrideText?: string) => {
    const userInput = (overrideText ?? inputValue).trim();
    if (!userInput) return;
    if (!isProUser() && getGenCount() >= FREE_LIMIT) { setShowPaywall(true); return; }
    setInputValue('');
    addUserMessage(userInput);
    setIsTyping(true);
    try {
      if (step === 'idle') {
        // ✅ This input answers a clarifying question CRÉO just asked — merge
        // it into the original idea and force real generation (skipClarify),
        // so it can't loop into asking a second time.
        if (pendingClarify) {
          const mergedIdea = `${pendingClarify.idea} — ${userInput}`;
          setPendingClarify(null);
          const data = await callApi(mergedIdea, 'titles', true);
          setIsTyping(false);
          if (data?.limitReached) { setShowPaywall(true); return; }
          if (!Array.isArray(data?.titles) || data.titles.length === 0) {
            addAiMessage({ role: 'ai', type: 'text', content: data?.message || '⚠️ CRÉO is at capacity right now — give it a minute and try again.' });
            return;
          }
          syncStreak(data);
          addAiMessage({ role: 'ai', type: 'titles', content: '🎯 Here are 6 viral titles! Click the one you love:', data: data.titles, idea: mergedIdea, forceType: 'titles' });
          setStep('titles'); bumpGenCount();
          if (onChatSaved) onChatSaved(mergedIdea, selectedPlatforms[0]);
          return;
        }

        const data = await callApi(userInput, 'titles');
        setIsTyping(false);
        if (data?.limitReached) { setShowPaywall(true); return; }
        // ✅ The idea is too vague for strong titles — CRÉO asks ONE sharp
        // question back instead of generating generic ones. Free (doesn't
        // touch gen count/streak) until the real, merged attempt below.
        if (data?.type === 'clarify' && data?.question) {
          addAiMessage({ role: 'ai', type: 'clarify', content: data.question, data: Array.isArray(data.options) ? data.options : [], idea: userInput, forceType: 'titles' });
          setPendingClarify({ idea: userInput });
          return;
        }
        // ✅ Graceful failure — previously a failed generation rendered broken empty cards.
        if (!Array.isArray(data?.titles) || data.titles.length === 0) {
          addAiMessage({ role: 'ai', type: 'text', content: data?.message || '⚠️ CRÉO is at capacity right now — give it a minute and try again.' });
          return;
        }
        syncStreak(data);
        addAiMessage({ role: 'ai', type: 'titles', content: '🎯 Here are 6 viral titles! Click the one you love:', data: data.titles, idea: userInput, forceType: 'titles' });
        setStep('titles'); bumpGenCount();
        if (onChatSaved) onChatSaved(userInput, selectedPlatforms[0]);
        return;
      }
      if (step === 'titles') {
        setSelectedTitle(userInput);
        const data = await callApi(userInput, 'hooks');
        setIsTyping(false);
        if (data?.limitReached) { setShowPaywall(true); return; }
        if (!Array.isArray(data?.hooks) || data.hooks.length === 0) {
          addAiMessage({ role: 'ai', type: 'text', content: data?.message || '⚠️ CRÉO is at capacity right now — give it a minute and try again.' });
          return;
        }
        syncStreak(data);
        addAiMessage({ role: 'ai', type: 'hooks', content: '🪝 Here are 3 powerful hooks! Click the one that fits:', data: data.hooks, idea: userInput, forceType: 'hooks' });
        setStep('hooks'); bumpGenCount(); return;
      }
      if (step === 'hooks') {
        const scriptIdea = `Title: "${selectedTitle}". Hook: "${userInput}". Platform: ${selectedPlatforms.join(', ')}. Tone: ${selectedTone}. Duration: ${selectedDuration}.`;
        const data = await callApi(scriptIdea, 'script');
        setIsTyping(false);
        if (data?.limitReached) { setShowPaywall(true); return; }
        if (typeof data?.result !== 'string' || !data.result) {
          addAiMessage({ role: 'ai', type: 'text', content: data?.message || '⚠️ CRÉO is at capacity right now — give it a minute and try again.' });
          return;
        }
        syncStreak(data);
        addAiMessage({ role: 'ai', type: 'script', content: '📝 Here is your full script!', data: data.result, idea: scriptIdea, forceType: 'script' });
        setStep('done'); bumpGenCount(); return;
      }
      if (step === 'done') {
        const refineIdea = `Topic: "${selectedTitle}". Request: "${userInput}". Tone: ${selectedTone}.`;
        const data = await callApi(refineIdea, 'script');
        setIsTyping(false);
        if (data?.limitReached) { setShowPaywall(true); return; }
        if (typeof data?.result !== 'string' || !data.result) {
          addAiMessage({ role: 'ai', type: 'text', content: data?.message || '⚠️ CRÉO is at capacity right now — give it a minute and try again.' });
          return;
        }
        syncStreak(data);
        addAiMessage({ role: 'ai', type: 'script', content: '✨ Refined script!', data: data.result, idea: refineIdea, forceType: 'script' });
        bumpGenCount(); return;
      }
    } catch { setIsTyping(false); addAiMessage({ role: 'ai', type: 'text', content: 'Something went wrong. Please try again!' }); }
    // ✅ pendingClarify MUST be a dependency here — without it this callback
    // closes over a stale (null) value and never takes the merge-and-force
    // branch above, so every clarify answer gets treated as a brand new,
    // still-vague idea and CRÉO asks again instead of ever generating.
  }, [inputValue, step, pendingClarify, selectedTitle, selectedPlatforms, selectedTone, selectedDuration, onChatSaved]);

  // ✅ CONTENT EXPANSION ENGINE (Pro/Ultra) — one idea → hooks, titles,
  // Shorts, a Reel, a thread and a LinkedIn post in one pass. Server enforces
  // the plan gate before any credit is spent.
  const handleExpand = async () => {
    const topic = selectedTitle || messages.find((m) => m.role === 'user')?.content || '';
    if (!topic) { toast.error('Generate a script first, then expand it!'); return; }
    setIsTyping(true);
    setLoaderMode('expand');
    try {
      const data = await callApi(topic, 'expand');
      setIsTyping(false);
      setLoaderMode(null);
      if (data?.upgradeRequired) {
        toast.info(data.message || 'Content Expansion is a Pro feature — taking you to upgrade!');
        router.push('/upgrade');
        return;
      }
      if (data?.limitReached) { setShowPaywall(true); return; }
      if (typeof data?.result !== 'string' || !data.result) {
        addAiMessage({ role: 'ai', type: 'text', content: data?.message || '⚠️ CRÉO is at capacity right now — give it a minute and try again.' });
        return;
      }
      syncStreak(data);
      addAiMessage({ role: 'ai', type: 'script', content: '🧩 Your full content pack — one idea, every platform!', data: data.result, idea: topic, forceType: 'expand' });
      bumpGenCount();
    } catch {
      setIsTyping(false);
      setLoaderMode(null);
      addAiMessage({ role: 'ai', type: 'text', content: 'Something went wrong. Please try again!' });
    }
  };

  const handleTitleSelect = useCallback((t: string) => handleSendWithText(t), [handleSendWithText]);
  const handleHookSelect = useCallback((h: string) => handleSendWithText(h), [handleSendWithText]);

  const getPlaceholder = () => {
    if (pendingClarify) return 'Type your answer, or tap an option above...';
    if (step === 'idle') return 'What is your video about? e.g. "5 AI tools for students"';
    if (step === 'titles') return 'Or type a title manually...';
    if (step === 'hooks') return 'Or type a hook manually...';
    if (step === 'done') return 'Ask me to refine, make shorter, change tone...';
    return 'Tell CRÉO what to create...';
  };

  const getStepLabel = () => {
    if (pendingClarify) return 'One quick question...';
    if (step === 'idle') return 'New chat';
    if (step === 'titles') return 'Pick a title';
    if (step === 'hooks') return 'Pick a hook';
    return 'Script ready 🎉';
  };

  const genLeft = Math.max(0, FREE_LIMIT - getGenCount());

  return (
    <div className="flex flex-col" style={{ height: '100dvh' }}>
      {showWhatsNew && <WhatsNewModal onDismiss={handleDismissWhatsNew} initialLanguage={selectedLanguage} initialMix={mixWithEnglish} />}
      {showPaywall && <PaywallModal onClose={() => setShowPaywall(false)} streak={streak} />}
      {showVault && <WinningVault isOpen={showVault} onClose={() => setShowVault(false)} plan={currentPlan()} />}
      {showBrain && <CreatorBrainModal onClose={() => setShowBrain(false)} plan={currentPlan()} />}
      {showIntel && <CompetitorIntelModal onClose={() => setShowIntel(false)} plan={currentPlan()} />}

      {/* TOPBAR */}
      <div className="flex-shrink-0 h-14 flex items-center justify-between px-3 md:px-6 border-b border-white/5 bg-[#080812]/90 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <button onClick={onToggleSidebar} className="w-8 h-8 rounded-lg glass border border-white/8 flex items-center justify-center text-white/40 hover:text-white transition-all lg:hidden"><Menu size={15} /></button>
          <div>
            <h1 className="text-xs sm:text-sm font-semibold text-white truncate max-w-[160px] sm:max-w-xs">{getStepLabel()}</h1>
            <p className="text-[10px] text-white/30 hidden sm:block">{selectedPlatforms.join(', ')} · {selectedTone}{selectedLanguage !== 'Auto-detect' ? ` · ${selectedLanguage}${isRegionalLanguage(selectedLanguage) && mixWithEnglish ? ' + English' : ''}` : ''}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* ✅ Streak flame — the daily habit loop */}
          {streak > 0 && (
            <div className="hidden sm:flex items-center gap-0.5 h-7 px-2 rounded-lg bg-orange-500/10 border border-orange-500/20 text-[11px] font-semibold text-orange-400 whitespace-nowrap" title={`${streak}-day creation streak — generate tomorrow to keep it alive!`}>
              <Flame size={11} className="fill-orange-400/40 flex-shrink-0" />{streak}d
            </div>
          )}
          {!isProUser() && (
            <button onClick={() => setShowPaywall(true)} className="hidden sm:flex items-center gap-1 h-7 px-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-[11px] font-semibold text-purple-400 hover:bg-purple-500/20 transition-all whitespace-nowrap">
              <Crown size={11} className="flex-shrink-0" />{genLeft} left
            </button>
          )}
          <button onClick={handleNewChat} className="flex items-center gap-1.5 h-8 px-2.5 rounded-lg glass border border-white/8 text-xs font-medium text-white/55 hover:text-white hover:border-white/15 transition-all"><Plus size={12} /><span className="hidden xl:inline">New</span></button>
          <div className="w-px h-5 bg-white/8 hidden md:block" />
          {/* ✅ Vault button */}
          <button onClick={() => setShowVault(true)} className="flex items-center gap-1.5 h-8 px-2.5 rounded-lg glass border border-white/8 text-xs font-medium text-white/55 hover:text-white hover:border-white/15 transition-all">
            <Star size={12} className="text-yellow-400/70" /><span className="hidden xl:inline">Vault</span>
          </button>
          {/* ✅ Creator Brain button */}
          <button onClick={() => setShowBrain(true)} className="flex items-center gap-1.5 h-8 px-2.5 rounded-lg glass border border-white/8 text-xs font-medium text-white/55 hover:text-white hover:border-white/15 transition-all" title="Creator Brain — teach CRÉO your style">
            <Brain size={12} className="text-fuchsia-400/70" /><span className="hidden xl:inline">Brain</span>
          </button>
          {/* ✅ Competitor Intelligence button */}
          <button onClick={() => setShowIntel(true)} className="flex items-center gap-1.5 h-8 px-2.5 rounded-lg glass border border-white/8 text-xs font-medium text-white/55 hover:text-white hover:border-white/15 transition-all" title="Competitor Intelligence — clone any viral framework (Ultra)">
            <Radar size={12} className="text-sky-400/70" /><span className="hidden xl:inline">Intel</span>
          </button>
          {/* ✅ Nova — moved here from a corner-floating launcher so she has one
              predictable, always-visible spot instead of a circle that could
              end up crowding other controls depending on screen size. */}
          {onOpenNova && (
            <button onClick={onOpenNova} className="flex items-center gap-1.5 h-8 px-2.5 rounded-lg glass border border-white/8 text-xs font-medium text-white/55 hover:text-white hover:border-white/15 transition-all" title="Nova — your AI co-writer">
              <Bot size={12} className="text-pink-400/70" /><span className="hidden xl:inline">Nova</span>
            </button>
          )}
          <div className="w-px h-5 bg-white/8 hidden md:block" />
          <button onClick={() => setShowControls(!showControls)} className={`flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-xs font-medium transition-all ${showControls ? 'bg-purple-500/15 border border-purple-500/30 text-purple-400' : 'glass border border-white/8 text-white/55 hover:text-white hover:border-white/15'}`}>
            <Sparkles size={12} /><span className="hidden xl:inline">Controls</span><ChevronDown size={11} className={`transition-transform ${showControls ? 'rotate-180' : ''}`} />
          </button>
          <button onClick={handleExport} className="flex items-center gap-1.5 h-8 px-2.5 rounded-lg glass border border-white/8 text-xs font-medium text-white/55 hover:text-white hover:border-white/15 transition-all"><Download size={12} /><span className="hidden xl:inline">Export</span></button>
          <button onClick={handleShare} className="w-8 h-8 rounded-lg glass border border-white/8 flex items-center justify-center text-white/50 hover:text-white hover:border-white/15 transition-all"><Share2 size={13} /></button>
          <button onClick={() => router.push('/settings')} className="w-8 h-8 rounded-lg glass border border-white/8 flex items-center justify-center text-white/50 hover:text-white hover:border-white/15 transition-all" title="Settings"><Settings size={13} /></button>
          <button onClick={handleSignOut} className="w-8 h-8 rounded-lg glass border border-white/8 flex items-center justify-center text-white/50 hover:text-red-400 hover:border-red-500/20 transition-all" title="Sign out"><LogOut size={13} /></button>
        </div>
      </div>

      {/* CONTROLS */}
      {showControls && (
        <div className="flex-shrink-0 px-3 md:px-6 py-3 border-b border-white/5 bg-[#0a0a1a]/50 backdrop-blur-sm animate-slide-down">
          <div className="flex flex-wrap gap-3">
            <div><p className="text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-1.5">Platform</p><div className="flex flex-wrap gap-1">{platforms.map((p) => <button key={p} onClick={() => togglePlatform(p)} className={`px-2 py-0.5 rounded-lg text-xs font-medium transition-all ${selectedPlatforms.includes(p) ? 'bg-purple-500/20 border border-purple-500/30 text-purple-300' : 'glass border border-white/8 text-white/40'}`}>{p}</button>)}</div></div>
            <div><p className="text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-1.5">Tone</p><div className="flex flex-wrap gap-1">{tones.map((t) => <button key={t} onClick={() => setSelectedTone(t)} className={`px-2 py-0.5 rounded-lg text-xs font-medium transition-all ${selectedTone === t ? 'bg-pink-500/20 border border-pink-500/30 text-pink-300' : 'glass border border-white/8 text-white/40'}`}>{t}</button>)}</div></div>
            <div><p className="text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-1.5">Duration</p><div className="flex flex-wrap gap-1">{durations.map((d) => <button key={d} onClick={() => setSelectedDuration(d)} className={`px-2 py-0.5 rounded-lg text-xs font-medium transition-all ${selectedDuration === d ? 'bg-violet-500/20 border border-violet-500/30 text-violet-300' : 'glass border border-white/8 text-white/40'}`}>{d}</button>)}</div></div>
            {/* ✅ Language selector — 'Auto-detect' matches the idea's own
                language (old behavior); any other pick always wins, so a
                creator can, say, type in English and get Hindi titles/hooks/
                scripts back, or the reverse. */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-1.5">Language</p>
              <div className="flex flex-wrap gap-1">
                {languages.map((l) => (
                  <button
                    key={l}
                    onClick={() => {
                      if (l === selectedLanguage) return;
                      setSelectedLanguage(l);
                      if (!isRegionalLanguage(l)) setMixWithEnglish(false);
                      toast.success(`Language set to ${l}`);
                    }}
                    className={`px-2 py-0.5 rounded-lg text-xs font-medium transition-all ${selectedLanguage === l ? 'bg-sky-500/20 border border-sky-500/30 text-sky-300' : 'glass border border-white/8 text-white/40'}`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
            {/* ✅ Code-mix toggle — real regional-language content is almost
                always mixed with English ("mere pass time nahi hai"), not
                pure/formal language. Only appears once a regional language is
                selected above. */}
            {isRegionalLanguage(selectedLanguage) && (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-1.5">Style</p>
                <button
                  onClick={() => {
                    const next = !mixWithEnglish;
                    setMixWithEnglish(next);
                    toast.success(next ? `Language set to ${selectedLanguage} + English` : `Language set to pure ${selectedLanguage}`);
                  }}
                  title='Blend natural English words in, like "mere pass time nahi hai"'
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium transition-all ${mixWithEnglish ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-300' : 'glass border border-white/8 text-white/40'}`}
                >
                  {mixWithEnglish && <Check size={11} />}
                  {selectedLanguage} + English mix
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MESSAGES */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto overscroll-contain">
        {messages.length === 0 && (
          <div className="relative flex flex-col items-center justify-center min-h-full px-4 py-10 text-center">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[400px] h-[400px] bg-purple-600/5 rounded-full blur-[100px]" />
            </div>
            <div className="relative z-10 w-full max-w-2xl">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/20 flex items-center justify-center mx-auto mb-4">
                <Wand2 size={28} className="text-purple-400" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">
                <span className="text-white">{userName ? greetingFn(userName) : 'What are we creating today? ✨'}</span>
              </h2>
              <p className="text-white/40 text-sm mb-3">Type your idea or pick a quick start below</p>
              {!isProUser() && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 mb-5">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                  <p className="text-purple-400/80 text-xs">{genLeft} free generation{genLeft !== 1 ? 's' : ''} remaining</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-2 mb-4 w-full">
                {promptSet.map((prompt, pi) => (
                  <button key={prompt.text} onClick={() => handleSendWithText(prompt.text)}
                    style={{ animationDelay: `${pi * 70}ms`, animationFillMode: 'both' }}
                    className="flex items-center gap-3 p-3 rounded-xl glass border border-white/8 hover:border-purple-500/30 hover:bg-purple-500/5 hover:-translate-y-0.5 text-left transition-all group animate-slide-up">
                    <span className="w-9 h-9 rounded-lg bg-white/5 border border-white/8 group-hover:border-purple-500/20 group-hover:bg-purple-500/10 flex items-center justify-center text-base flex-shrink-0 transition-all">{prompt.icon}</span>
                    <span className="text-xs text-white/55 group-hover:text-white/80 transition-colors leading-snug">{prompt.text}</span>
                  </button>
                ))}
              </div>
              {/* ✅ Daily Mission — the reason to open CRÉO every day */}
              <div className="glass rounded-2xl border border-orange-500/15 p-3.5 mb-5 text-left">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Target size={13} className="text-orange-400" />
                    <span className="text-xs font-semibold text-white/70">Today's Mission</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-orange-400">
                    <Flame size={11} className="fill-orange-400/40" />{streak > 0 ? `${streak}-day streak` : 'Start your streak'}
                  </div>
                </div>
                <p className="text-xs text-white/40 leading-relaxed">Create one piece of content today — a title set, a hook, or a full script. Generate on consecutive days and your streak grows. 🔥</p>
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

        <div className="max-w-3xl mx-auto px-3 md:px-6 py-4 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex animate-slide-up ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.type === 'text' && (
                <div className={`max-w-[85%] sm:max-w-lg px-4 py-2.5 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-purple-600/80 text-white rounded-br-sm' : 'glass border border-white/8 text-white/80 rounded-bl-sm'}`}>{msg.content}</div>
              )}
              {msg.type === 'titles' && (
                <div className="w-full">
                  <p className="text-white/60 text-sm mb-2 flex items-center gap-1.5"><Zap size={12} className="text-purple-400" />{msg.content}</p>
                  <TitleCards titles={msg.data as string[]} onSelect={handleTitleSelect} topic={selectedTitle} platform={selectedPlatforms[0]} plan={currentPlan()}
                    onRegenerate={() => handleRegenerate(msg.id)} regenerating={regeneratingId === msg.id} />
                </div>
              )}
              {msg.type === 'hooks' && (
                <div className="w-full">
                  <p className="text-white/60 text-sm mb-2 flex items-center gap-1.5"><Flame size={12} className="text-pink-400" />{msg.content}</p>
                  <HookCards hooks={msg.data as string[]} onSelect={handleHookSelect} topic={selectedTitle} platform={selectedPlatforms[0]} plan={currentPlan()}
                    onRegenerate={() => handleRegenerate(msg.id)} regenerating={regeneratingId === msg.id} />
                </div>
              )}
              {msg.type === 'clarify' && (
                <div className="w-full max-w-md glass border border-purple-500/15 rounded-2xl rounded-bl-sm px-4 py-3.5">
                  <p className="text-white/75 text-sm mb-2.5 flex items-center gap-1.5"><Sparkles size={12} className="text-purple-400 flex-shrink-0" />{msg.content}</p>
                  <div className="flex flex-wrap gap-2">
                    {(msg.data as string[]).map((opt, oi) => (
                      <button key={`${msg.id}-opt-${oi}`} onClick={() => handleSendWithText(opt)}
                        style={{ animationDelay: `${oi * 80}ms`, animationFillMode: 'both' }}
                        className="px-3.5 py-2 rounded-full bg-white/[0.03] border border-purple-500/20 text-xs font-medium text-white/70 hover:text-white hover:border-purple-500/40 hover:bg-purple-500/10 transition-all animate-slide-up">
                        {opt}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-white/25 mt-2.5">Or just type your own answer below ↓</p>
                </div>
              )}
              {msg.type === 'script' && (
                <div className="w-full">
                  <p className="text-white/60 text-sm mb-2 flex items-center gap-1.5"><Star size={12} className="text-violet-400" />{msg.content}</p>
                  <ScriptCard script={msg.data as string}
                    onRegenerate={msg.idea && msg.forceType ? () => handleRegenerate(msg.id) : undefined}
                    regenerating={regeneratingId === msg.id}
                    onQuickCommand={(cmd) => handleQuickCommand(msg.id, cmd)}
                    busyCommand={applyingCommand?.id === msg.id ? applyingCommand.cmd : null} />
                </div>
              )}
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <SuspenseLoader mode={loaderMode ?? (step === 'idle' ? 'titles' : step === 'titles' ? 'hooks' : 'script')} />
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* ✅ Expand suggestion — appears once a script exists */}
      {step === 'done' && !isTyping && (
        <div className="flex-shrink-0 px-3 md:px-6 pb-1">
          <div className="max-w-3xl mx-auto flex flex-wrap items-center gap-2">
            <button onClick={handleExpand}
              className="flex items-center gap-2 px-3.5 py-2 rounded-full glass border border-emerald-500/25 text-xs font-medium text-emerald-400/80 hover:text-emerald-300 hover:bg-emerald-500/10 transition-all animate-slide-up">
              <Layers size={13} />Expand this idea — hooks, Shorts, thread & more<span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/25">PRO</span>
            </button>
            {/* ✅ Referral nudge — same moment as the upsell above: right after
                someone sees a finished script, i.e. right after CRÉO just
                proved its value. Only renders for a logged-in user who has a
                code (silently absent for anonymous "try it free" visitors). */}
            {referral?.code && (
              <button onClick={handleCopyReferral}
                title={referralLink}
                className="flex items-center gap-2 px-3.5 py-2 rounded-full glass border border-purple-500/25 text-xs font-medium text-purple-300/80 hover:text-purple-200 hover:bg-purple-500/10 transition-all animate-slide-up">
                {refCopied ? <Check size={13} /> : <Gift size={13} />}
                {refCopied ? 'Link copied!' : 'Know a creator who needs this? Invite them — get +1 free generation/day'}
              </button>
            )}
          </div>
        </div>
      )}

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
