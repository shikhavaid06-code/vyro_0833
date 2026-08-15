'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Home as HomeIcon, Zap, Brain, Lightbulb, FileText, Star, BarChart3, Calendar, Users, Settings,
  Search, Bell, ChevronRight, TrendingUp, Sparkles, PlusCircle, Upload, Lock, Crown, Flame, Check,
} from 'lucide-react';
import AppLogo from '@/components/ui/AppLogo';
import { supabase } from '@/lib/supabase';
import { INR_PRICES } from '@/lib/pricing';

interface SavedChat { id: string; title: string; preview: string; time: string; platform: string; generated: number; }
const PLAN_LIMITS: Record<string, number> = { free: 3, pro: 100, ultra: Infinity };

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

export default function HomeScreen() {
  const router = useRouter();
  const [user, setUser] = useState<{ name?: string; email?: string; plan?: string }>({});
  const [chats, setChats] = useState<SavedChat[]>([]);
  const [genToday, setGenToday] = useState(0);
  const [streak, setStreak] = useState(0);
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
        <div className="p-3 border-t border-creo-border">
          <div className="creo-surface rounded-xl p-3">
            <p className="creo-caption text-creo-text-muted uppercase tracking-wide mb-1">{plan} Plan</p>
            <p className="creo-body font-semibold text-creo-text-primary">{limit === Infinity ? 'Unlimited' : `${genToday} / ${limit}`}{limit !== Infinity && <span className="creo-caption text-creo-text-muted"> generations today</span>}</p>
            {plan === 'free' && <button onClick={() => router.push('/upgrade')} className="creo-btn-primary w-full mt-2 py-1.5 rounded-lg text-white creo-caption font-semibold">Upgrade Plan</button>}
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

          <div className="creo-surface rounded-2xl p-4">
            <p className="creo-body font-semibold text-creo-text-primary mb-3">Quick Actions</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { label: 'New Content', sub: 'Start creating', icon: PlusCircle, action: () => router.push('/main-app-chat-interface') },
                { label: 'Add Performance', sub: 'Track content', icon: BarChart3, action: () => router.push('/main-app-chat-interface') },
                { label: 'New Idea', sub: 'Coming soon', icon: Lightbulb, locked: true, action: undefined },
                { label: 'Import Content', sub: 'Coming soon', icon: Upload, locked: true, action: undefined },
              ].map((a) => (
                <button key={a.label} onClick={a.action} disabled={a.locked} title={a.locked ? 'Coming soon' : undefined}
                  className={`text-left creo-surface rounded-xl p-3 transition-all ${a.locked ? 'opacity-50 cursor-not-allowed' : 'hover:border-creo-primary/30'}`}>
                  <a.icon size={15} className="text-creo-primary mb-1.5" />
                  <p className="creo-body text-creo-text-secondary">{a.label}</p>
                  <p className="creo-caption text-creo-text-muted">{a.sub}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="creo-surface rounded-2xl p-4 flex items-center gap-4">
              <div className="relative w-16 h-16 flex-shrink-0">
                <svg viewBox="0 0 64 64" className="w-16 h-16 -rotate-90">
                  <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
                  <circle cx="32" cy="32" r="28" fill="none" stroke="#8b5cf6" strokeWidth="6" strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 28}`} strokeDashoffset={`${2 * Math.PI * 28 * (1 - genPct / 100)}`} />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center creo-caption font-bold text-creo-text-primary">{genPct}%</span>
              </div>
              <div>
                <p className="creo-body font-semibold text-creo-text-primary">Today's Generations</p>
                <p className="creo-caption text-creo-text-muted">{limit === Infinity ? 'Unlimited plan' : `${genToday} of ${limit} used today`}</p>
              </div>
            </div>
            <div className="creo-surface rounded-2xl p-4 flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-creo-warning/10 border border-creo-warning/25 flex flex-col items-center justify-center flex-shrink-0">
                <Flame size={18} className="text-creo-warning" /><span className="creo-caption font-bold text-creo-warning">{streak}d</span>
              </div>
              <div>
                <p className="creo-body font-semibold text-creo-text-primary">Creation Streak</p>
                <p className="creo-caption text-creo-text-muted">{streak > 0 ? 'Keep it going — generate today to extend it.' : 'Generate today to start a streak.'}</p>
              </div>
            </div>
          </div>

          <div className="creo-surface rounded-2xl p-4">
            <p className="creo-body font-semibold text-creo-text-primary mb-2">Upcoming</p>
            <div className="flex items-center gap-2 py-3"><Lock size={14} className="text-creo-text-muted" /><p className="creo-caption text-creo-text-muted">Content calendar is coming soon.</p></div>
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

                {trendPoints.length >= 2 ? (
                  <div className="creo-surface rounded-xl p-3">
                    <p className="creo-caption text-creo-text-muted mb-2">Views Over Time (published content)</p>
                    <svg viewBox="0 0 300 80" className="w-full h-20">
                      {(() => {
                        const max = Math.max(...trendPoints.map((p) => p.views), 1);
                        const pts = trendPoints.map((p, i) => `${(i / (trendPoints.length - 1)) * 300},${80 - (p.views / max) * 70}`).join(' ');
                        return <polyline points={pts} fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />;
                      })()}
                    </svg>
                  </div>
                ) : (
                  <div className="creo-surface rounded-xl p-4 text-center creo-caption text-creo-text-muted">Add content with view counts and publish dates to see a trend line.</div>
                )}

                {Object.keys(metrics.byPlatform).length > 0 && (
                  <div>
                    <p className="creo-caption text-creo-text-muted mb-2">Traffic Sources (by platform)</p>
                    <div className="space-y-1.5">
                      {Object.entries(metrics.byPlatform).map(([platform, stats]: any) => (
                        <div key={platform} className="flex items-center justify-between creo-surface rounded-xl px-3 py-2">
                          <span className="creo-body text-creo-text-secondary">{platform}</span>
                          <span className="creo-caption text-creo-text-muted">{stats.count} posts · {stats.totalViews.toLocaleString()} views</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

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
                  <p className="creo-caption text-creo-text-muted">Audience demographics aren't available yet — this needs data CRÉO doesn't collect today.</p>
                </div>
              </div>
            )}
          </div>

          <div className="creo-surface rounded-2xl p-4">
            <p className="creo-body font-semibold text-creo-text-primary mb-1">Choose Your Plan</p>
            <p className="creo-caption text-creo-text-muted mb-3">Start free, upgrade when you're ready.</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { name: 'Free', price: '₹0', current: plan === 'free' },
                { name: 'Pro', price: `₹${INR_PRICES.pro.toLocaleString()}`, best: true, current: plan === 'pro' },
                { name: 'Ultra', price: `₹${INR_PRICES.ultra.toLocaleString()}`, current: plan === 'ultra' },
                { name: 'Teams', price: 'Contact us', current: false },
              ].map((p) => (
                <div key={p.name} className={`creo-surface rounded-xl p-3 ${p.best ? 'border-creo-primary/40' : ''}`}>
                  {p.best && <span className="creo-caption bg-creo-primary/20 text-creo-primary px-1.5 rounded-full">Best value</span>}
                  <p className="creo-body font-semibold text-creo-text-primary mt-1">{p.name}</p>
                  <p className="text-lg font-bold text-creo-text-primary">{p.price}{p.price.startsWith('₹') && <span className="creo-caption text-creo-text-muted">/mo</span>}</p>
                  {p.current ? (
                    <p className="creo-caption text-creo-success mt-1.5 flex items-center gap-1"><Check size={11} />Current plan</p>
                  ) : (
                    <button onClick={() => router.push('/upgrade')} className="creo-btn-primary w-full mt-1.5 py-1.5 rounded-lg text-white creo-caption font-semibold">{p.name === 'Teams' ? 'Contact Sales' : 'Upgrade'}</button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
