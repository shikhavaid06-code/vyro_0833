'use client';
import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Hourglass, X, Zap, Crown } from 'lucide-react';
import ChatSidebar from './ChatSidebar';
import ChatMainArea from './ChatMainArea';
import FloatingAssistant from './FloatingAssistant';
import { supabase } from '@/lib/supabase';

interface SavedChat { id: string; title: string; preview: string; time: string; platform: string; generated: number; }
const STORAGE_KEY = 'creo_chat_history';

// ✅ RENEWAL REMINDER — plans don't auto-renew (deliberate, honest), which
// means paid users silently drop to Free when their period ends. This banner
// shows during the final days so renewing is a choice they get to make, not
// something they forget. Dismissing hides it for the rest of the day; it
// returns each day until renewal or expiry.
const RENEW_WINDOW_DAYS = 5;
const RENEW_DISMISS_KEY = 'creo_renew_dismissed_on';

interface RenewalInfo { plan: string; daysLeft: number; endDate: string; }

export default function ChatAppLayout() {
  // ✅ Sidebar closed by default on mobile, open on desktop
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeChatId, setActiveChatId] = useState('');
  const [resetKey, setResetKey] = useState(0);
  const [savedChats, setSavedChats] = useState<SavedChat[]>([]);
  // ✅ Nova's open/closed state now lives up here, one level above
  // ChatMainArea's own remount boundary (it remounts on "New chat" via
  // `key={resetKey}`) — so switching or starting chats no longer force-closes
  // Nova mid-conversation. The topbar button that opens her now lives inside
  // ChatMainArea (next to Vault/Brain/Intel) instead of a corner-floating
  // launcher, which is what made her easy to miss/collide with other UI.
  const [showNova, setShowNova] = useState(false);
  const [renewal, setRenewal] = useState<RenewalInfo | null>(null);
  const router = useRouter();

  useEffect(() => {
    // ✅ Open sidebar by default on desktop only
    if (window.innerWidth >= 1024) setSidebarOpen(true);
  }, []);

  // ✅ Renewal reminder check — one lightweight call per workspace load.
  useEffect(() => {
    (async () => {
      try {
        // Dismissed today already? Stay quiet until tomorrow.
        if (localStorage.getItem(RENEW_DISMISS_KEY) === new Date().toISOString().slice(0, 10)) return;
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        const res = await fetch('/api/subscription', { headers: { Authorization: `Bearer ${session.access_token}` } });
        if (!res.ok) return; // free users get a 400 here — nothing to remind
        const q = await res.json();
        if (!q?.plan || q.plan === 'free' || !q.endDate) return;
        const msLeft = new Date(q.endDate).getTime() - Date.now();
        const daysLeft = Math.ceil(msLeft / 86_400_000);
        if (daysLeft > 0 && daysLeft <= RENEW_WINDOW_DAYS) {
          setRenewal({ plan: q.plan, daysLeft, endDate: q.endDate });
        }
      } catch {}
    })();
  }, []);

  const dismissRenewal = () => {
    try { localStorage.setItem(RENEW_DISMISS_KEY, new Date().toISOString().slice(0, 10)); } catch {}
    setRenewal(null);
  };

  // ✅ ONBOARDING CATCH-ALL — paid-plan signups and /try signups skip the
  // onboarding flow on their first landing (deliberate: payment and their
  // generated hooks come first). This sends anyone who has never answered
  // "How did you find CRÉO?" + "creator level" there exactly once. The
  // localStorage flag short-circuits the check on every later visit, and
  // users who answered on another device get the flag set from the server
  // without being re-asked.
  useEffect(() => {
    (async () => {
      try {
        if (localStorage.getItem('creo_onboarded') === 'true') return;
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        const r = await fetch('/api/onboarding', { headers: { Authorization: `Bearer ${session.access_token}` } });
        if (!r.ok) return; // fail open — never lock someone out of the workspace over a survey
        const d = await r.json();
        if (d?.completed) {
          localStorage.setItem('creo_onboarded', 'true');
        } else {
          router.push('/onboarding-flow');
        }
      } catch {}
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try { const s = localStorage.getItem(STORAGE_KEY); if (s) setSavedChats(JSON.parse(s)); } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(savedChats)); } catch {}
  }, [savedChats]);

  const handleNewChat = useCallback(() => {
    const newId = `chat-${Date.now()}`;
    setActiveChatId(newId);
    setResetKey((prev) => prev + 1);
  }, []);

  const handleChatSaved = useCallback((title: string, platform: string) => {
    const newChat: SavedChat = {
      id: activeChatId || `chat-${Date.now()}`,
      title, preview: 'Generating content...',
      time: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      platform, generated: 1,
    };
    setSavedChats((prev) => {
      if (prev.find((c) => c.id === newChat.id)) return prev;
      const next = [newChat, ...prev];
      // ✅ Clean up conversation data for chats that fall off the 30-chat list
      next.slice(30).forEach((c) => { try { localStorage.removeItem(`creo_chat_data_${c.id}`); } catch {} });
      return next.slice(0, 30);
    });
    if (!activeChatId) setActiveChatId(newChat.id);
  }, [activeChatId]);

  return (
    <div className="min-h-screen bg-workspace-glow flex overflow-hidden">
      <ChatSidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        activeChatId={activeChatId}
        onSelectChat={(id) => { setActiveChatId(id); setResetKey((p) => p + 1); }}
        onNewChat={handleNewChat}
        chats={savedChats}
        onDeleteChat={(id) => {
          try { localStorage.removeItem(`creo_chat_data_${id}`); } catch {}
          setSavedChats((prev) => prev.filter((c) => c.id !== id));
        }}
      />
      <div className="flex-1 flex flex-col min-h-screen min-w-0 transition-all duration-300">
        {/* ✅ Renewal reminder banner — final days of a paid period */}
        {renewal && (
          <div className="relative z-20 flex items-center gap-3 px-4 py-2.5 bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border-b border-amber-500/25 animate-slide-up">
            <Hourglass size={14} className="text-amber-400 flex-shrink-0" />
            <p className="flex-1 text-xs text-white/75 leading-snug">
              Your <b className="capitalize text-amber-300">{renewal.plan}</b> plan ends in{' '}
              <b className="text-amber-300">{renewal.daysLeft} day{renewal.daysLeft !== 1 ? 's' : ''}</b>
              {' '}({new Date(renewal.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}). Plans don't auto-renew — renew to keep{' '}
              {renewal.plan === 'ultra' ? 'unlimited generations, Creator Brain & Competitor Intelligence' : 'your 100 generations/day, Brutal Reviewer & Expansion Engine'}.
            </p>
            <button
              onClick={() => router.push(`/upgrade?plan=${renewal.plan}`)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[11px] font-semibold hover:opacity-90 active:scale-95 transition-all flex-shrink-0">
              {renewal.plan === 'ultra' ? <Crown size={11} /> : <Zap size={11} />}Renew now
            </button>
            <button onClick={dismissRenewal} aria-label="Dismiss renewal reminder"
              className="text-white/30 hover:text-white/70 transition-colors flex-shrink-0 p-1">
              <X size={13} />
            </button>
          </div>
        )}
        <ChatMainArea
          key={resetKey}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          activeChatId={activeChatId}
          onChatSaved={handleChatSaved}
          onNewChat={handleNewChat}
          chats={savedChats}
          onOpenNova={() => setShowNova(true)}
        />
      </div>
      {showNova && <FloatingAssistant onClose={() => setShowNova(false)} />}
    </div>
  );
}
