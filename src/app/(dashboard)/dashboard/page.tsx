'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Home,
  Zap,
  Brain,
  Lightbulb,
  FileText,
  Star,
  BarChart3,
  Calendar,
  Users,
  Settings,
  TrendingUp,
  Sparkles,
  PlusCircle,
  Upload,
  Lock,
  Crown,
  Flame,
  Check,
  ChevronRight,
  ArrowUpRight,
  Eye,
  Clock,
  Heart,
  UserPlus,
  Target,
  AlertTriangle,
  Video,
  Mic,
  PenTool,
  Radio,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface SavedChat {
  id: string;
  title: string;
  preview: string;
  time: string;
  platform: string;
  generated: number;
}

const PLAN_LIMITS: Record<string, number> = { free: 3, pro: 100, ultra: Infinity };
const DAY_LABELS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

function buildWeekDays(streakCount: number, lastGenDate: string | null) {
  const today = new Date();
  const days: { label: string; date: Date; done: boolean; isToday: boolean }[] = [];
  const monOffset = (today.getDay() + 6) % 7;
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - monOffset);
  const last = lastGenDate ? new Date(lastGenDate + 'T00:00:00') : null;
  const streakStart = last ? new Date(last) : null;
  if (streakStart && streakCount > 0) streakStart.setDate(streakStart.getDate() - (streakCount - 1));
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    const inStreak = !!(last && streakStart && d >= streakStart && d <= last && d <= today);
    days.push({
      label: DAY_LABELS[i],
      date: d,
      done: inStreak,
      isToday: d.toDateString() === today.toDateString(),
    });
  }
  return days;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ name?: string; email?: string; plan?: string }>({});
  const [chats, setChats] = useState<SavedChat[]>([]);
  const [genToday, setGenToday] = useState(0);
  const [streak, setStreak] = useState(0);
  const [lastGenDate, setLastGenDate] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [entries, setEntries] = useState<any[]>([]);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      setUser(JSON.parse(localStorage.getItem('creo_current_user') || '{}'));
      const today = new Date().toISOString().slice(0, 10);
      if (localStorage.getItem('creo_gen_count_date') === today) {
        setGenToday(parseInt(localStorage.getItem('creo_gen_count') || '0'));
      }
      setStreak(parseInt(localStorage.getItem('creo_streak') || '0'));
      setChats(JSON.parse(localStorage.getItem('creo_chat_history') || '[]'));
    } catch {}
    
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        const r = await fetch('/api/streak', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        const d = await r.json();
        if (typeof d.streakCount === 'number') setStreak(d.streakCount);
        setLastGenDate(d.lastGenDate || null);
      } catch {}
      setLoading(false);
    })();
  }, []);

  const plan = user.plan || 'free';
  const hasAnalyticsAccess = plan === 'pro' || plan === 'ultra';
  const limit = PLAN_LIMITS[plan] ?? 3;

  useEffect(() => {
    if (!hasAnalyticsAccess) {
      setLoadingAnalytics(false);
      return;
    }
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const r = await fetch('/api/analytics', {
          headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {},
        });
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
  const weekDays = buildWeekDays(streak, lastGenDate);
  const platformEntries = metrics ? (Object.entries(metrics.byPlatform) as [string, any][]) : [];
  const platformTotal = platformEntries.reduce((s, [, v]) => s + v.totalViews, 0);

  if (loading) {
    return (
      <div className="space-y-5 animate-pulse">
        <div className="h-8 bg-surface-2 rounded-creo-sm w-64" />
        <div className="grid grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-surface-2 rounded-creo" />
          ))}
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-48 bg-surface-2 rounded-creo" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div>
        <h1 className="creo-h2 text-text-primary">
          {greeting}, {firstName}.
        </h1>
        <p className="creo-body text-text-muted mt-1">Let's build something exceptional today.</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            label: 'Content',
            icon: FileText,
            value: chats.length > 0 ? String(chats.length) : '0',
            sub: chats.length > 0 ? `${chats.length} saved` : 'Start creating',
            change: null,
          },
          {
            label: 'Ideas',
            icon: Lightbulb,
            value: '—',
            sub: 'Coming soon',
            change: null,
          },
          {
            label: 'Views',
            icon: TrendingUp,
            value: hasAnalyticsAccess
              ? metrics
                ? metrics.totalViews.toLocaleString()
                : '—'
              : '—',
            sub: hasAnalyticsAccess
              ? metrics
                ? 'from tracked content'
                : 'No data yet'
              : 'Pro/Ultra',
            change: hasAnalyticsAccess && metrics ? '+12%' : null,
          },
          {
            label: 'Engagement',
            icon: Sparkles,
            value: hasAnalyticsAccess
              ? metrics?.avgEngagementRate != null
                ? `${metrics.avgEngagementRate}%`
                : '—'
              : '—',
            sub: hasAnalyticsAccess
              ? metrics?.avgEngagementRate != null
                ? 'avg. rate'
                : 'No data yet'
              : 'Pro/Ultra',
            change: hasAnalyticsAccess && metrics?.avgEngagementRate ? '+3.2%' : null,
          },
        ].map((s) => (
          <div key={s.label} className="creo-card-static hover:border-border-strong transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 rounded-creo-sm bg-terracotta-muted flex items-center justify-center">
                <s.icon size={14} className="text-terracotta" />
              </div>
              {s.change && (
                <span className="text-[11px] font-medium text-success flex items-center gap-0.5">
                  <ArrowUpRight size={10} />
                  {s.change}
                </span>
              )}
            </div>
            <p className="creo-caption uppercase tracking-wider mb-1">{s.label}</p>
            <p className="text-xl font-bold text-text-primary">{s.value}</p>
            <p className="creo-caption text-text-muted mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5 items-start">
        {/* Left Column */}
        <div className="space-y-5 min-w-0">
          {/* Today's Intelligence */}
          <div className="creo-card-static">
            <div className="flex items-center justify-between mb-4">
              <h3 className="creo-h4 text-text-primary">Today's Intelligence</h3>
              <span className="creo-badge-pro">AI</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  icon: Target,
                  title: 'Content Opportunity',
                  desc: 'Short-form educational content is trending in your niche.',
                  metric: '+28%',
                  metricLabel: 'vs last 7 days',
                },
                {
                  icon: Eye,
                  title: 'Audience Insight',
                  desc: 'Your audience is most active between 7-9 PM.',
                  metric: null,
                  metricLabel: 'Peak window',
                },
                {
                  icon: AlertTriangle,
                  title: 'Performance Tip',
                  desc: 'Shorter intros improve retention by 24%.',
                  metric: null,
                  metricLabel: 'Based on your data',
                },
                {
                  icon: TrendingUp,
                  title: 'Content Gap',
                  desc: "You're not covering 'Minimal Workspace' enough.",
                  metric: null,
                  metricLabel: 'High demand topic',
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="bg-surface-1 border border-border rounded-creo-sm p-3 hover:border-border-strong transition-colors"
                >
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-creo-xs bg-terracotta-muted flex items-center justify-center flex-shrink-0">
                      <item.icon size={13} className="text-terracotta" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-text-secondary">{item.title}</p>
                      <p className="text-[11px] text-text-muted mt-0.5 leading-relaxed">{item.desc}</p>
                      {item.metric && (
                        <p className="text-xs font-bold text-terracotta mt-1.5 flex items-center gap-0.5">
                          <ArrowUpRight size={10} />
                          {item.metric}
                          <span className="text-[10px] font-normal text-text-muted ml-0.5">{item.metricLabel}</span>
                        </p>
                      )}
                      {!item.metric && (
                        <p className="text-[10px] text-text-muted mt-1">{item.metricLabel}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Continue Working On */}
          <div className="creo-card-static">
            <div className="flex items-center justify-between mb-4">
              <h3 className="creo-h4 text-text-primary">Continue Working On</h3>
              <button className="text-xs text-terracotta hover:text-terracotta-hover font-medium">View all</button>
            </div>
            {mostRecentChat ? (
              <div className="space-y-2">
                {chats.slice(0, 3).map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => router.push('/create')}
                    className="w-full flex items-center gap-3 text-left p-3 rounded-creo-sm bg-surface-1 border border-border
                      hover:border-border-strong transition-all group"
                  >
                    <div className="w-10 h-10 rounded-creo-sm bg-terracotta-muted flex items-center justify-center flex-shrink-0">
                      <FileText size={16} className="text-terracotta" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-secondary group-hover:text-text-primary transition-colors truncate">
                        {chat.title}
                      </p>
                      <p className="text-[11px] text-text-muted">
                        {chat.platform} · {chat.time}
                      </p>
                    </div>
                    <div className="w-16 h-1.5 bg-surface-2 rounded-full overflow-hidden flex-shrink-0">
                      <div
                        className="h-full bg-terracotta rounded-full"
                        style={{ width: `${Math.random() * 60 + 20}%` }}
                      />
                    </div>
                    <ChevronRight size={14} className="text-text-muted flex-shrink-0" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="creo-empty-state py-8">
                <FileText size={20} className="text-text-muted" />
                <p className="text-sm text-text-secondary">Nothing yet</p>
                <p className="text-xs text-text-muted max-w-xs">
                  Start creating content and your recent work will appear here.
                </p>
                <button
                  onClick={() => router.push('/create')}
                  className="creo-btn-primary mt-2 text-xs py-2 px-4"
                >
                  Start Creating
                </button>
              </div>
            )}
          </div>

          {/* Recent Content */}
          <div className="creo-card-static">
            <div className="flex items-center justify-between mb-4">
              <h3 className="creo-h4 text-text-primary">Recent Content</h3>
              {chats.length > 0 && (
                <button
                  onClick={() => router.push('/content')}
                  className="text-xs text-terracotta hover:text-terracotta-hover font-medium"
                >
                  View all
                </button>
              )}
            </div>
            {chats.length === 0 ? (
              <div className="creo-empty-state py-8">
                <FileText size={20} className="text-text-muted" />
                <p className="text-sm text-text-secondary">No content yet</p>
                <p className="text-xs text-text-muted max-w-xs">
                  Your generated titles, hooks and scripts will show up here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {chats.slice(0, 3).map((c) => (
                  <button
                    key={c.id}
                    onClick={() => router.push('/create')}
                    className="text-left bg-surface-1 border border-border rounded-creo-sm p-3
                      hover:border-border-strong transition-all"
                  >
                    <p className="text-sm font-medium text-text-secondary truncate">{c.title}</p>
                    <p className="text-[11px] text-text-muted mt-1">
                      {c.platform} · {c.time}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Performance Overview */}
          <div className="creo-card-static">
            <div className="flex items-center justify-between mb-1">
              <h3 className="creo-h4 text-text-primary">Performance Overview</h3>
              <span className="creo-badge-warning">PRO</span>
            </div>
            <p className="creo-caption text-text-muted mb-4">
              Track your real content performance across platforms.
            </p>
            {!hasAnalyticsAccess ? (
              <div className="creo-empty-state py-8">
                <Crown size={20} className="text-warning" />
                <p className="text-sm text-text-secondary">Analytics is a Pro/Ultra feature.</p>
                <button
                  onClick={() => router.push('/upgrade')}
                  className="creo-btn-primary mt-2 text-xs py-2 px-4"
                >
                  Upgrade to unlock
                </button>
              </div>
            ) : loadingAnalytics ? (
              <div className="py-8 text-center">
                <div className="w-6 h-6 border-2 border-terracotta/30 border-t-terracotta rounded-full animate-spin mx-auto mb-2" />
                <p className="text-sm text-text-muted">Loading analytics...</p>
              </div>
            ) : !metrics ? (
              <div className="creo-empty-state py-8">
                <TrendingUp size={20} className="text-text-muted" />
                <p className="text-sm text-text-secondary">No data yet</p>
                <p className="text-xs text-text-muted max-w-xs">
                  Add your published content in the Analytics panel and real numbers will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {[
                    { label: 'Views', value: metrics.totalViews.toLocaleString(), icon: Eye },
                    { label: 'Watch Time', value: '8.5K hrs', icon: Clock },
                    { label: 'Engagement', value: `${metrics.avgEngagementRate != null ? metrics.avgEngagementRate : '—'}%`, icon: Heart },
                    { label: 'Subscribers', value: '+1.2K', icon: UserPlus },
                  ].map((s) => (
                    <div key={s.label} className="bg-surface-1 border border-border rounded-creo-sm p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <s.icon size={12} className="text-text-muted" />
                        <p className="creo-caption text-text-muted">{s.label}</p>
                      </div>
                      <p className="text-lg font-bold text-text-primary">{s.value}</p>
                    </div>
                  ))}
                </div>
                {entries.length >= 2 && (
                  <div className="bg-surface-1 border border-border rounded-creo-sm p-3">
                    <p className="creo-caption text-text-muted mb-2">Views Over Time</p>
                    <svg viewBox="0 0 300 80" className="w-full h-20">
                      {(() => {
                        const sorted = [...entries]
                          .filter((e) => e.published_at && e.views != null)
                          .sort(
                            (a, b) =>
                              new Date(a.published_at).getTime() -
                              new Date(b.published_at).getTime()
                          );
                        const max = Math.max(...sorted.map((p) => p.views), 1);
                        const pts = sorted
                          .map(
                            (p, i) =>
                              `${(i / (sorted.length - 1)) * 300},${
                                80 - (p.views / max) * 70
                              }`
                          )
                          .join(' ');
                        return (
                          <polyline
                            points={pts}
                            fill="none"
                            stroke="#C46345"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        );
                      })()}
                    </svg>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-5 min-w-0">
          {/* Today's Focus */}
          <div className="creo-card-static">
            <h3 className="creo-h4 text-text-primary mb-4">Today's Focus</h3>
            <div className="flex items-center gap-4 mb-4">
              <div className="relative w-16 h-16 flex-shrink-0">
                <svg viewBox="0 0 64 64" className="w-16 h-16 -rotate-90">
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    fill="none"
                    stroke="rgba(255,255,255,0.06)"
                    strokeWidth="5"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    fill="none"
                    stroke="#C46345"
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 28}`}
                    strokeDashoffset={`${2 * Math.PI * 28 * (1 - 4 / 6)}`}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-lg font-bold text-text-primary">4/6</span>
                  <span className="text-[9px] text-text-muted">Content Pieces</span>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-text-secondary">Weekly Goal</p>
                <p className="text-xs text-text-muted mt-0.5">4 of 6 completed</p>
                <div className="mt-2 h-1.5 bg-surface-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-terracotta rounded-full"
                    style={{ width: `${(4 / 6) * 100}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 pt-3 border-t border-border">
              <div className="relative w-12 h-12 flex-shrink-0">
                <svg viewBox="0 0 48 48" className="w-12 h-12 -rotate-90">
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    fill="none"
                    stroke="rgba(255,255,255,0.06)"
                    strokeWidth="3"
                  />
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    fill="none"
                    stroke="#C46345"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 20}`}
                    strokeDashoffset={`${2 * Math.PI * 20 * (1 - streak / 7)}`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Flame size={14} className="text-warning" />
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-text-secondary">Current Streak</p>
                <p className="text-xs text-text-muted">{streak > 0 ? `${streak} days` : 'Start today'}</p>
              </div>
              <div className="flex-1 flex justify-end gap-1">
                {weekDays.map((d) => (
                  <div key={d.label} className="flex flex-col items-center gap-1">
                    <span className="text-[8px] text-text-muted">{d.label}</span>
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                        d.done
                          ? 'bg-success/20 text-success'
                          : d.isToday
                          ? 'border border-dashed border-terracotta/40'
                          : 'bg-surface-1'
                      }`}
                    >
                      {d.done && <Check size={10} />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="creo-card-static">
            <h3 className="creo-h4 text-text-primary mb-4">Quick Actions</h3>
            <div className="space-y-1.5">
              {[
                { label: 'New Video', sub: 'Start creating', icon: Video, action: () => router.push('/create') },
                { label: 'New Short', sub: 'Quick content', icon: Mic, action: () => router.push('/create') },
                { label: 'New Blog', sub: 'Long-form', icon: PenTool, action: () => router.push('/create') },
                { label: 'Idea Capture', sub: 'Save an idea', icon: Lightbulb, locked: true, action: undefined },
                { label: 'AI Assistant', sub: 'Get help', icon: Sparkles, locked: true, action: undefined },
                { label: 'Go Live', sub: 'Stream', icon: Radio, locked: true, action: undefined },
              ].map((a) => (
                <button
                  key={a.label}
                  onClick={a.action}
                  disabled={a.locked}
                  className={`w-full flex items-center gap-2.5 text-left p-2.5 rounded-creo-sm bg-surface-1 border border-border
                    transition-all ${
                      a.locked
                        ? 'opacity-40 cursor-not-allowed'
                        : 'hover:border-terracotta/30 group'
                    }`}
                >
                  <a.icon size={14} className="text-terracotta flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm text-text-secondary group-hover:text-text-primary transition-colors truncate">
                      {a.label}
                    </p>
                    <p className="text-[11px] text-text-muted truncate">{a.sub}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* AI Usage */}
          <div className="creo-card-static">
            <h3 className="creo-h4 text-text-primary mb-3">AI Generations</h3>
            <div className="flex items-center gap-3">
              <div className="relative w-14 h-14 flex-shrink-0">
                <svg viewBox="0 0 64 64" className="w-14 h-14 -rotate-90">
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    fill="none"
                    stroke="rgba(255,255,255,0.06)"
                    strokeWidth="5"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    fill="none"
                    stroke="#C46345"
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 28}`}
                    strokeDashoffset={`${2 * Math.PI * 28 * (1 - genPct / 100)}`}
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-text-primary">
                  {genPct}%
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-text-secondary">
                  {limit === Infinity ? 'Unlimited' : `${genToday} / ${limit}`}
                </p>
                <p className="text-[11px] text-text-muted">
                  {limit === Infinity ? 'Unlimited plan' : 'generations today'}
                </p>
              </div>
            </div>
            {plan === 'free' && (
              <button
                onClick={() => router.push('/upgrade')}
                className="w-full mt-3 py-2 rounded-creo-sm bg-terracotta text-white text-xs font-semibold
                  hover:bg-terracotta-hover transition-colors"
              >
                Upgrade Plan
              </button>
            )}
          </div>

          {/* Plan Info */}
          <div className="creo-card-static">
            <div className="flex items-center justify-between mb-2">
              <h3 className="creo-h4 text-text-primary">Plan</h3>
              <span
                className={`creo-badge ${
                  plan === 'ultra'
                    ? 'creo-badge-ultra'
                    : plan === 'pro'
                    ? 'creo-badge-pro'
                    : 'creo-badge-free'
                }`}
              >
                {planLabel}
              </span>
            </div>
            <p className="text-xs text-text-muted leading-relaxed">
              {plan === 'free'
                ? 'Perfect to get started. 3 generations per day.'
                : plan === 'pro'
                ? 'For serious creators. 100 generations per day.'
                : 'For agencies and power users. Unlimited everything.'}
            </p>
            {plan === 'free' && (
              <button
                onClick={() => router.push('/upgrade')}
                className="w-full mt-3 py-2 rounded-creo-sm border border-terracotta/30 text-terracotta text-xs font-semibold
                  hover:bg-terracotta-muted transition-colors"
              >
                Upgrade to Pro
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
