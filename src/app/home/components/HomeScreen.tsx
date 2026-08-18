'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Home as HomeIcon, Zap, Brain, Lightbulb, FileText, Star, BarChart3, Calendar, Users, Settings,
  Search, Bell, ChevronRight, TrendingUp, Sparkles, PlusCircle, Upload, Lock, Crown, Flame, Check, Boxes,
} from 'lucide-react';
import AppLogo from '@/components/ui/AppLogo';
import { supabase } from '@/lib/supabase';
import { INR_PRICES } from '@/lib/pricing';

interface SavedChat { id: string; title: string; preview: string; time: string; platform: string; generated: number; }
const PLAN_LIMITS: Record<string, number> = { free: 3, pro: 100, ultra: Infinity };
const DAY_LABELS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
const DONUT_COLORS = ['#e17e4a', '#8a8f98', '#5b8a72', '#c9a15a', '#6b7280'];

const NAV = [
  { label: 'Home', icon: HomeIcon, href: '/home', active: true },
  { label: 'Create', icon: Zap, href: '/main-app-chat-interface' },
  { label: 'Brain', icon: Brain, href: '/main-app-chat-interface', badge: 'PRO' },
  { label: 'Ideas', icon: Lightbulb, locked: true },
  { label: 'Content', icon: FileText, href: '/main-app-chat-interface' },
  { label: 'Vault', icon: Star, href: '/main-app-chat-interface' },
  { label: 'Analytics', icon: BarChart3, href: '/main-app-chat-interface', badge: 'PRO' },
  { label: 'Calendar', icon: Calendar, locked: true },
  { label: 'Teams', icon: Users, href: '/upgrade', badge: 'NEW' },
  { label: 'Settings', icon: Settings, href: '/settings' },
];

// ✅ Real reconstruction, not fabrication: streak_count + last_gen_date are
// real columns written by /api/generate every time someone actually
// generates. Standard streak semantics = the most recent `streakCount`
// CONSECUTIVE days ending at lastGenDate were genuinely active. Anything
// outside that window is honestly marked incomplete, never guessed.
function buildWeekDays(streakCount: number, lastGenDate: string | null) {
  const today = new Date();
  const days: { label: string; date: Date; done: boolean; isToday: boolean }[] = [];
  const monOffset = (today.getDay() + 6) % 7; // 0 = Monday
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - monOffset);

  const last = lastGenDate ? new Date(lastGenDate + 'T00:00:00') : null;
  const streakStart = last ? new Date(last) : null;
  if (streakStart && streakCount > 0) streakStart.setDate(streakStart.getDate() - (streakCount - 1));

  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    const inStreak = !!(last && streakStart && d >= streakStart && d <= last && d <= today);
    days.push({ label: DAY_LABELS[i], date: d, done: inStreak, isToday: d.toDateString() === today.toDateString() });
  }
  return days;
}

export default function HomeScreen() {
  const router = useRouter();
  const [user, setUser] = useState<{ name?: string; email?: string; plan?: string }>({});
  const [chats, setChats] = useState<SavedChat[]>([]);
  const [genToday, setGenToday] = useState(0);
  const [streak, setStreak] = useState(0);
  const [lastGenDate, setLastGenDate] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [entries, setEntries] = useState<any[]>([]);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);

  useEffect(() => {
    try { setUser(JSON.parse(localStorage.getItem('creo_current_user') || '{}')); } catch {}
    try {
      const today = new Date().toISOString().slice(0, 10);
      if (localStorage.getItem('creo_gen_count_date') === today) setGenToday(parseInt(localStorage.getItem('creo_gen_count') || '0'));
    } catch {}
    try { setStreak(parseInt(localStorage.getItem('creo_streak') || '0')); } catch {}
    try { setChats(JSON.parse(localStorage.getItem('creo_chat_history') || '[]')); } catch {}
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        const r = await fetch('/api/streak', { headers: { Authorization: `Bearer ${session.access_token}` } });
        const d = await r.json();
        if (typeof d.streakCount === 'number') setStreak(d.streakCount);
        setLastGenDate(d.lastGenDate || null);
      } catch {}
    })();
  }, []);

  const plan = user.plan || 'free';
  const hasAnalyticsAccess = plan === 'pro' || plan === 'ultra';
  const limit = PLAN_LIMITS[plan] ?? 3;

  useEffect(() => {
    if (!hasAnalyticsAccess) { setLoadingAnalytics(false); return; }
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const r = await fetch('/api/analytics', { headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {} });
        const d = await r.json();
        setMetrics(d.metrics || null);
        setEntries(d.entries || []);
      } catch {}
      setLoadingAnalytics(false);
    })();
  }, [hasAnalyticsAccess]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const firstName = (user.name || 'Creator').split(' ')[0];
  const genPct = limit === Infinity ? 100 : Math.min(100, Math.round((genToday / limit) * 100));
  const mostRecentChat = chats[0];

  const trendPoints = [...entries]
    .filter((e) => e.published_at && e.views != null)
    .sort((a, b) => new Date(a.published_at).getTime() - new Date(b.published_at).getTime());

  const weekDays = buildWeekDays(streak, lastGenDate);
  const platformEntries = metrics ? Object.entries(metrics.byPlatform) as [string, any][] : [];
  const platformTotal = platformEntries.reduce((s, [, v]) => s + v.totalViews, 0);

  return (
    <div className="min-h-screen bg-creo-bg flex">
      <aside className="hidden lg:flex w-56 flex-shrink-0 flex-col border-r border-creo-border">
        <div className="h-14 flex items-center gap-2 px-4 border-b border-creo-border">
          <AppLogo size={22} /><span className="text-sm font-semibold text-creo-text-primary">CRÉO</span>
        </div>
        <nav className="flex-1 py-3 px-2 space-y-0.5">
          {NAV.map((item) => (
            <button
              key={item.label}
              onClick={() => item.locked ? undefined : item.href && router.push(item.href)}
              disabled={item.locked}
              title={item.locked ? 'Coming soon' : undefined}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl creo-body transition-all ${
                item.active ? 'bg-creo-primary/12 text-creo-primary border border-creo-primary/25'
                : item.locked ? 'text-creo-text-muted/60 cursor-not-allowed'
                : 'text-creo-text-secondary hover:text-creo-text-primary hover:bg-creo-surface'
              }`}>
              {item.locked ? <Lock size={14} /> : <item.icon size={14} />}
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && (
                <span className={`creo-caption px-1.5 py-0.5 rounded-full ${item.badge === 'NEW' ? 'bg-creo-success/15 text-creo-success' : 'bg-creo-warning/15 text-creo-warning'}`}>{item.badge}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-creo-border space-y-3">
          <div className="creo-surface rounded-xl p-3">
            <p className="creo-caption text-creo-text-muted uppercase tracking-wide mb-1">{plan} Plan</p>
            <p className="creo-body font-semibold text-creo-text-primary">{limit === Infinity ? 'Unlimited' : `${genToday} / ${limit}`}{limit !== Infinity && <span className="creo-caption text-creo-text-muted"> generations today</span>}</p>
            {plan === 'free' && <button onClick={() => router.push('/upgrade')} className="creo-btn-primary w-full mt-2 py-1.5 rounded-lg text-white creo-caption font-semibold">Upgrade Plan</button>}
          </div>
          <div className="creo-surface rounded-xl p-3">
            <p className="creo-caption text-creo-text-secondary leading-relaxed italic">"We're not just building a tool. We're building a creator's competitive edge."</p>
            <p className="creo-caption text-creo-text-muted mt-1.5">— CRÉO Team</p>
          </div>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        <div className="h-14 flex items-center justify-between px-4 sm:px-6 border-b border-creo-border bg-creo-bg/95 backdrop-blur-md gap-3">
          <div className="hidden sm:flex items-center gap-2 creo-caption text-creo-text-secondary creo-surface rounded-full px-3 py-1.5">
            <span className="font-semibold text-creo-primary">Free Plan Access</span>
            <span className="text-creo-text-muted">·</span>
            <span>{limit === Infinity ? 'Unlimited' : limit} generations / day</span>
            {plan === 'free' && <button onClick={() => router.push('/upgrade')} className="creo-btn-primary ml-1 px-2.5 py-0.5 rounded-full text-white creo-caption font-semibold">Upgrade</button>}
          </div>
          <div className="flex-1" />
          <div title="Search — coming soon" className="hidden md:flex items-center gap-2 creo-surface rounded-full px-3 py-1.5 creo-caption text-creo-text-muted cursor-not-allowed"><Search size={13} />Search anything...</div>
          <button title="Notifications — coming soon" disabled className="w-8 h-8 rounded-lg creo-surface flex items-center justify-center text-creo-text-muted cursor-not-allowed"><Bell size={14} /></button>
          <button onClick={() => router.push('/settings')} className="w-8 h-8 rounded-full bg-creo-primary flex items-center justify-center text-white text-xs font-bold">{firstName[0]?.toUpperCase()}</button>
        </div>

        <div className="p-4 sm:p-6 space-y-5 max-w-[1400px]">
          <div>
            <h1 className="creo-h2 text-creo-text-primary">{greeting}, {firstName} 👋</h1>
            <p className="creo-body text-creo-text-muted mt-1">Here's what's happening with your content today.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Content', icon: FileText, value: chats.length > 0 ? String(chats.length) : '0', sub: chats.length > 0 ? `${chats.length} saved` : 'Start creating' },
              { label: 'Ideas', icon: Lightbulb, value: '—', sub: 'Coming soon' },
              { label: 'Views', icon: TrendingUp, value: hasAnalyticsAccess ? (metrics ? metrics.totalViews.toLocaleString() : '—') : '—', sub: hasAnalyticsAccess ? (metrics ? 'from tracked content' : 'No data yet') : 'Pro/Ultra' },
              { label: 'Engagement', icon: Sparkles, value: hasAnalyticsAccess ? (metrics?.avgEngagementRate != null ? `${metrics.avgEngagementRate}%` : '—') : '—', sub: hasAnalyticsAccess ? (metrics?.avgEngagementRate != null ? 'avg. rate' : 'No data yet') : 'Pro/Ultra' },
            ].map((s) => (
              <div key={s.label} className="creo-surface rounded-2xl p-4">
                <div className="w-8 h-8 rounded-lg bg-creo-primary/12 flex items-center justify-center mb-2"><s.icon size={14} className="text-creo-primary" /></div>
                <p className="creo-caption text-creo-text-muted">{s.label}</p>
                <p className="text-xl font-bold text-creo-text-primary">{s.value}</p>
                <p className="creo-caption text-creo-text-muted mt-0.5">{s.sub}</p>
              </div>
            ))}
          </div>

          {/* ✅ Two-column layout: main content (left) + right sidebar — matches
              the reference structure instead of one long stacked column. */}
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-4 items-start">
            <div className="space-y-4 min-w-0">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="creo-surface rounded-2xl p-4 lg:col-span-2">
                  <p className="creo-body font-semibold text-creo-text-primary mb-3">Today's Priorities</p>
                  <div className="flex flex-col items-center text-center py-6 gap-2">
                    <Lock size={16} className="text-creo-text-muted" />
                    <p className="creo-body text-creo-text-secondary">Coming soon</p>
                    <p className="creo-caption text-creo-text-muted max-w-xs">Smart daily suggestions based on your content and audience aren't built yet — this card is reserved for when they are.</p>
                  </div>
                </div>
                <div className="creo-surface rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-3"><p className="creo-body font-semibold text-creo-text-primary">AI Insight</p><span className="creo-caption bg-creo-warning/15 text-creo-warning px-1.5 py-0.5 rounded-full">PRO</span></div>
                  <div className="flex flex-col items-center text-center py-4 gap-2">
                    <Lock size={16} className="text-creo-text-muted" />
                    <p className="creo-caption text-creo-text-muted">Pattern insights from your content aren't available yet.</p>
                  </div>
                </div>
              </div>

              <div className="creo-surface rounded-2xl p-4">
                <p className="creo-body font-semibold text-creo-text-primary mb-3">Continue Working On</p>
                {mostRecentChat ? (
                  <button onClick={() => router.push('/main-app-chat-interface')} className="w-full flex items-center gap-3 text-left hover:bg-white/[0.02] rounded-xl p-2 -m-2 transition-all">
                    <div className="w-10 h-10 rounded-xl bg-creo-primary/12 flex items-center justify-center flex-shrink-0"><FileText size={16} className="text-creo-primary" /></div>
                    <div className="flex-1 min-w-0"><p className="creo-body text-creo-text-secondary truncate">{mostRecentChat.title}</p><p className="creo-caption text-creo-text-muted">{mostRecentChat.platform} · {mostRecentChat.time}</p></div>
                    <ChevronRight size={14} className="text-creo-text-muted flex-shrink-0" />
                  </button>
                ) : (
                  <p className="creo-body text-creo-text-muted">Nothing yet — <button onClick={() => router.push('/main-app-chat-interface')} className="text-creo-primary hover:underline">start creating</button> to see it here.</p>
                )}
              </div>

              <div className="creo-surface rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3"><p className="creo-body font-semibold text-creo-text-primary">Recent Content</p>{chats.length > 0 && <button onClick={() => router.push('/main-app-chat-interface')} className="creo-caption text-creo-primary">View all</button>}</div>
                {chats.length === 0 ? (
                  <p className="creo-body text-creo-text-muted text-center py-6">No content yet. Your generated titles, hooks and scripts will show up here.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {chats.slice(0, 3).map((c) => (
                      <button key={c.id} onClick={() => router.push('/main-app-chat-interface')} className="text-left creo-surface rounded-xl p-3 hover:border-creo-border-strong transition-all">
                        <p className="creo-body text-creo-text-secondary truncate">{c.title}</p>
                        <p className="creo-caption text-creo-text-muted mt-0.5">{c.platform} · {c.time}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right sidebar */}
            <div className="space-y-4 min-w-0">
              <div className="creo-surface rounded-2xl p-4">
                <p className="creo-body font-semibold text-creo-text-primary mb-3">Quick Actions</p>
                <div className="space-y-1.5">
                  {[
                    { label: 'New Content', sub: 'Start creating', icon: PlusCircle, action: () => router.push('/main-app-chat-interface') },
                    { label: 'Add Performance', sub: 'Track content', icon: BarChart3, action: () => router.push('/main-app-chat-interface') },
                    { label: 'New Idea', sub: 'Coming soon', icon: Lightbulb, locked: true, action: undefined },
                    { label: 'Import Content', sub: 'Coming soon', icon: Upload, locked: true, action: undefined },
                  ].map((a) => (
                    <button key={a.label} onClick={a.action} disabled={a.locked} title={a.locked ? 'Coming soon' : undefined}
                      className={`w-full flex items-center gap-2.5 text-left creo-surface rounded-xl p-2.5 transition-all ${a.locked ? 'opacity-50 cursor-not-allowed' : 'hover:border-creo-primary/30'}`}>
                      <a.icon size={14} className="text-creo-primary flex-shrink-0" />
                      <div className="min-w-0"><p className="creo-body text-creo-text-secondary truncate">{a.label}</p><p className="creo-caption text-creo-text-muted truncate">{a.sub}</p></div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="creo-surface rounded-2xl p-4">
                <p className="creo-body font-semibold text-creo-text-primary mb-3">Daily Progress</p>
                <div className="flex items-center gap-3">
                  <div className="relative w-14 h-14 flex-shrink-0">
                    <svg viewBox="0 0 64 64" className="w-14 h-14 -rotate-90">
                      <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
                      <circle cx="32" cy="32" r="28" fill="none" stroke="#e17e4a" strokeWidth="6" strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 28}`} strokeDashoffset={`${2 * Math.PI * 28 * (1 - genPct / 100)}`} />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center creo-caption font-bold text-creo-text-primary">{genPct}%</span>
                  </div>
                  <p className="creo-caption text-creo-text-muted">{limit === Infinity ? 'Unlimited plan' : `${genToday} of ${limit} generations used today`}</p>
                </div>
              </div>

              <div className="creo-surface rounded-2xl p-4">
                <p className="creo-body font-semibold text-creo-text-primary mb-2">Upcoming</p>
                <div className="flex items-center gap-2 py-3"><Lock size={14} className="text-creo-text-muted" /><p className="creo-caption text-creo-text-muted">Content calendar is coming soon.</p></div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="creo-h3 text-creo-text-primary mb-1">Everything you need to create, grow &amp; win.</h2>
            <p className="creo-caption text-creo-text-muted mb-3">All in one intelligent system.</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {[
                { label: 'Create', icon: Zap, desc: 'Turn ideas into content.', href: '/main-app-chat-interface' },
                { label: 'Brain', icon: Brain, desc: 'AI that learns your style.', badge: 'PRO', href: '/main-app-chat-interface' },
                { label: 'Analytics', icon: BarChart3, desc: 'Real performance tracking.', badge: 'PRO', href: '/main-app-chat-interface' },
                { label: 'Vault', icon: Star, desc: 'Organize your best content.', href: '/main-app-chat-interface' },
                { label: 'Teams', icon: Users, desc: 'Collaborate with your team.', badge: 'NEW', href: '/upgrade' },
              ].map((f) => (
                <button key={f.label} onClick={() => router.push(f.href)} className="text-left creo-surface rounded-2xl p-4 hover:border-creo-primary/30 transition-all">
                  <div className="w-9 h-9 rounded-xl bg-creo-primary/12 flex items-center justify-center mb-2.5"><f.icon size={16} className="text-creo-primary" /></div>
                  <div className="flex items-center gap-1.5"><p className="creo-body font-semibold text-creo-text-primary">{f.label}</p>{f.badge && <span className={`creo-caption px-1.5 rounded-full ${f.badge === 'NEW' ? 'bg-creo-success/15 text-creo-success' : 'bg-creo-warning/15 text-creo-warning'}`}>{f.badge}</span>}</div>
                  <p className="creo-caption text-creo-text-muted mt-0.5">{f.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="creo-surface rounded-2xl p-4">
            <div className="flex items-center justify-between mb-1"><p className="creo-body font-semibold text-creo-text-primary">Performance Overview</p><span className="creo-caption bg-creo-warning/15 text-creo-warning px-1.5 py-0.5 rounded-full">PRO</span></div>
            <p className="creo-caption text-creo-text-muted mb-4">Track your real content performance across platforms.</p>

            {!hasAnalyticsAccess ? (
              <div className="flex flex-col items-center text-center py-8 gap-2">
                <Crown size={18} className="text-creo-warning" />
                <p className="creo-body text-creo-text-secondary">Analytics is a Pro/Ultra feature.</p>
                <button onClick={() => router.push('/upgrade')} className="creo-btn-primary mt-1 px-4 py-2 rounded-xl text-white creo-caption font-semibold">Upgrade to unlock</button>
              </div>
            ) : loadingAnalytics ? (
              <p className="creo-body text-creo-text-muted text-center py-8">Loading...</p>
            ) : !metrics ? (
              <div className="flex flex-col items-center text-center py-8 gap-2">
                <TrendingUp size={18} className="text-creo-text-muted" />
                <p className="creo-body text-creo-text-secondary">No data yet.</p>
                <p className="creo-caption text-creo-text-muted max-w-xs">Add your published content in the Analytics panel and real numbers will appear here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { label: 'Views', value: metrics.totalViews.toLocaleString() },
                    { label: 'Likes', value: metrics.totalLikes.toLocaleString() },
                    { label: 'Comments', value: metrics.totalComments.toLocaleString() },
                    { label: 'Avg. Engagement', value: metrics.avgEngagementRate != null ? `${metrics.avgEngagementRate}%` : '—' },
                  ].map((s) => (
                    <div key={s.label} className="creo-surface rounded-xl p-3"><p className="creo-caption text-creo-text-muted">{s.label}</p><p className="text-lg font-bold text-creo-text-primary">{s.value}</p></div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {trendPoints.length >= 2 ? (
                    <div className="creo-surface rounded-xl p-3">
                      <p className="creo-caption text-creo-text-muted mb-2">Views Over Time (published content)</p>
                      <svg viewBox="0 0 300 80" className="w-full h-20">
                        {(() => {
                          const max = Math.max(...trendPoints.map((p) => p.views), 1);
                          const pts = trendPoints.map((p, i) => `${(i / (trendPoints.length - 1)) * 300},${80 - (p.views / max) * 70}`).join(' ');
                          return <polyline points={pts} fill="none" stroke="#e17e4a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />;
                        })()}
                      </svg>
                    </div>
                  ) : (
                    <div className="creo-surface rounded-xl p-4 flex items-center justify-center text-center creo-caption text-creo-text-muted">Add content with view counts and publish dates to see a trend line.</div>
                  )}

                  {/* ✅ Real donut — segment sizes computed directly from
                      metrics.byPlatform (actual view totals per platform),
                      not decorative. */}
                  {platformEntries.length > 0 ? (
                    <div className="creo-surface rounded-xl p-3">
                      <p className="creo-caption text-creo-text-muted mb-2">Traffic Sources</p>
                      <div className="flex items-center gap-4">
                        <div className="relative w-20 h-20 flex-shrink-0">
                          <svg viewBox="0 0 64 64" className="w-20 h-20 -rotate-90">
                            {(() => {
                              const circumference = 2 * Math.PI * 26;
                              let offset = 0;
                              return platformEntries.map(([platform, stats], i) => {
                                const frac = platformTotal > 0 ? stats.totalViews / platformTotal : 0;
                                const dash = frac * circumference;
                                const el = (
                                  <circle key={platform} cx="32" cy="32" r="26" fill="none" stroke={DONUT_COLORS[i % DONUT_COLORS.length]} strokeWidth="8"
                                    strokeDasharray={`${dash} ${circumference - dash}`} strokeDashoffset={-offset} />
                                );
                                offset += dash;
                                return el;
                              });
                            })()}
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-xs font-bold text-creo-text-primary">{metrics.totalViews.toLocaleString()}</span>
                            <span className="creo-caption text-creo-text-muted" style={{ fontSize: 8 }}>Total Views</span>
                          </div>
                        </div>
                        <div className="space-y-1 min-w-0">
                          {platformEntries.map(([platform, stats], i) => (
                            <div key={platform} className="flex items-center gap-1.5 creo-caption text-creo-text-secondary">
                              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: DONUT_COLORS[i % DONUT_COLORS.length] }} />
                              <span className="truncate">{platform}</span>
                              <span className="text-creo-text-muted flex-shrink-0">{platformTotal > 0 ? Math.round((stats.totalViews / platformTotal) * 100) : 0}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="creo-surface rounded-xl p-4 flex items-center justify-center text-center creo-caption text-creo-text-muted">Add content from more than one platform to see a breakdown.</div>
                  )}
                </div>

                {metrics.topByViews?.length > 0 && (
                  <div>
                    <p className="creo-caption text-creo-text-muted mb-2">Top Performing Content</p>
                    <div className="space-y-1.5">
                      {metrics.topByViews.map((e: any) => (
                        <div key={e.id} className="flex items-center justify-between creo-surface rounded-xl px-3 py-2">
                          <span className="creo-body text-creo-text-secondary truncate">{e.title}</span>
                          <span className="creo-caption text-creo-text-muted flex-shrink-0">{(e.views || 0).toLocaleString()} views</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="creo-surface rounded-xl p-4 text-center">
                  <p className="creo-caption text-creo-text-muted">Not available for now — audience demographics need data CRÉO doesn't collect today.</p>
                </div>
              </div>
            )}
          </div>

          {/* ✅ "More than an AI" marketing block — static copy, no data claims */}
          <div className="creo-surface rounded-2xl p-6 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 items-center">
            <div>
              <h2 className="creo-h3 text-creo-text-primary mb-1">More than an AI.</h2>
              <p className="creo-h3 text-creo-primary mb-2">Your Complete Creator System.</p>
              <p className="creo-caption text-creo-text-muted leading-relaxed mb-3">CRÉO combines AI, analytics, and your creative intelligence to help you create better content, faster.</p>
              <Link href="/main-app-chat-interface" className="creo-btn-primary inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-white creo-caption font-semibold">Explore All Features <ChevronRight size={12} /></Link>
            </div>
            <div>
              <p className="creo-body font-semibold text-creo-text-primary mb-3">Built for creators who are serious about growth.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { icon: Zap, label: 'AI-Powered Creation', desc: 'Generate content that connects.' },
                  { icon: Sparkles, label: 'Data-Driven Insights', desc: 'Make decisions that drive results.', badge: 'PRO' },
                  { icon: Boxes, label: 'Smart Organization', desc: 'Keep everything organized & accessible.' },
                  { icon: Users, label: 'Team Collaboration', desc: 'Work together, achieve more.', badge: 'NEW' },
                ].map((f) => (
                  <div key={f.label} className="flex items-start gap-2">
                    <f.icon size={13} className="text-creo-primary mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5"><p className="creo-caption font-semibold text-creo-text-secondary">{f.label}</p>{f.badge && <span className={`creo-caption px-1 rounded ${f.badge === 'NEW' ? 'bg-creo-success/15 text-creo-success' : 'bg-creo-warning/15 text-creo-warning'}`}>{f.badge}</span>}</div>
                      <p className="creo-caption text-creo-text-muted">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* ✅ Comparison teaser — links to the real comparison table
                (WhyCreoSection on the landing page), doesn't duplicate the data */}
            <a href="/#why-creo" className="creo-surface rounded-2xl p-4 hover:border-creo-primary/30 transition-all block">
              <p className="creo-body font-semibold text-creo-text-primary mb-1">Why Creators Choose CRÉO</p>
              <p className="creo-caption text-creo-text-muted mb-3">See how we compare with others.</p>
              <span className="creo-caption text-creo-primary flex items-center gap-1">View Comparison <ChevronRight size={11} /></span>
            </a>

            <div className="creo-surface rounded-2xl p-4">
              <p className="creo-body font-semibold text-creo-text-primary mb-1">Choose Your Plan</p>
              <p className="creo-caption text-creo-text-muted mb-3">Start free, upgrade when you're ready.</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { name: 'Free', price: '₹0', current: plan === 'free' },
                  { name: 'Pro', price: `₹${INR_PRICES.pro.toLocaleString()}`, best: true, current: plan === 'pro' },
                  { name: 'Ultra', price: `₹${INR_PRICES.ultra.toLocaleString()}`, current: plan === 'ultra' },
                  { name: 'Teams', price: 'Contact us', current: false },
                ].map((p) => (
                  <div key={p.name} className={`creo-surface rounded-xl p-2.5 ${p.best ? 'border-creo-primary/40' : ''}`}>
                    <p className="creo-caption font-semibold text-creo-text-primary">{p.name}</p>
                    <p className="text-sm font-bold text-creo-text-primary">{p.price}</p>
                    {p.current ? <p className="creo-caption text-creo-success flex items-center gap-0.5 mt-1"><Check size={9} />Current</p> : <button onClick={() => router.push('/upgrade')} className="creo-btn-primary w-full mt-1 py-1 rounded-lg text-white creo-caption font-semibold">{p.name === 'Teams' ? 'Contact' : 'Upgrade'}</button>}
                  </div>
                ))}
              </div>
            </div>

            {/* ✅ Today's Focus — real weekly streak reconstruction */}
            <div className="creo-surface rounded-2xl p-4">
              <p className="creo-body font-semibold text-creo-text-primary mb-1">Today's Focus</p>
              <p className="creo-caption text-creo-text-muted mb-3">Your daily commitment to growth.</p>
              <div className="flex items-center gap-3 mb-3">
                <div className="relative w-12 h-12 flex-shrink-0">
                  <svg viewBox="0 0 48 48" className="w-12 h-12 -rotate-90">
                    <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
                    <circle cx="24" cy="24" r="20" fill="none" stroke="#e17e4a" strokeWidth="4" strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 20}`} strokeDashoffset={`${2 * Math.PI * 20 * (1 - Math.min(1, weekDays.filter(d => d.done).length / 7))}`} />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center" style={{ fontSize: 10 }}><Flame size={13} className="text-creo-warning" /></span>
                </div>
                <p className="creo-caption text-creo-text-muted">{streak > 0 ? `${streak}-day streak — keep it going.` : 'Generate today to start a streak.'}</p>
              </div>
              <div className="flex justify-between gap-1">
                {weekDays.map((d) => (
                  <div key={d.label} className="flex flex-col items-center gap-1">
                    <span className="creo-caption text-creo-text-muted" style={{ fontSize: 8 }}>{d.label}</span>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${d.done ? 'bg-creo-success/20 text-creo-success' : d.isToday ? 'border border-dashed border-creo-primary/40' : 'creo-surface'}`}>
                      {d.done && <Check size={10} />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
