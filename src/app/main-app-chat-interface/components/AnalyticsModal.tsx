'use client';
import React, { useState, useEffect } from 'react';
import { BarChart3, X, Crown, Plus, Video, Camera, Music2, AtSign, Globe2, TrendingUp, Eye, Heart, MessageCircle, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

// ✅ ANALYTICS (manual entry v1) — Pro/Ultra feature. Every number shown is
// either typed in by the creator or derived by real arithmetic from what
// they typed in. No estimates, no fabricated trends. Free users see a
// locked teaser, matching the existing gating pattern used by Competitor
// Intelligence and Creator Brain.
interface Props { onClose: () => void; plan: string; }
interface Entry {
  id: string; platform: string; title: string; url?: string; published_at?: string;
  views?: number; likes?: number; comments?: number; shares?: number; saves?: number;
  watch_time_seconds?: number; followers_gained?: number;
}
interface Metrics {
  totalEntries: number; totalViews: number; totalLikes: number; totalComments: number; totalShares: number;
  avgEngagementRate: number | null; topByViews: Entry[];
  byPlatform: Record<string, { count: number; totalViews: number; avgEngagement: number | null }>;
}

const PLATFORMS = [
  { name: 'YouTube', icon: Video, color: 'text-red-400' },
  { name: 'Instagram', icon: Camera, color: 'text-pink-400' },
  { name: 'TikTok', icon: Music2, color: 'text-white' },
  { name: 'X', icon: AtSign, color: 'text-sky-400' },
  { name: 'Other', icon: Globe2, color: 'text-creo-text-muted' },
];

export default function AnalyticsModal({ onClose, plan }: Props) {
  const router = useRouter();
  const hasAccess = plan === 'pro' || plan === 'ultra';
  const [entries, setEntries] = useState<Entry[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ platform: 'YouTube', title: '', url: '', published_at: '', views: '', likes: '', comments: '', shares: '', saves: '', followers_gained: '' });

  useEffect(() => {
    if (!hasAccess) { setLoading(false); return; }
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const r = await fetch('/api/analytics', { headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {} });
        const d = await r.json();
        setEntries(d.entries || []);
        setMetrics(d.metrics || null);
      } catch {}
      setLoading(false);
    })();
  }, [hasAccess]);

  const handleAddEntry = async () => {
    if (!form.title.trim()) { toast.error('Add a title so you can find this content later'); return; }
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const toNum = (v: string) => (v.trim() === '' ? undefined : Number(v));
      const r = await fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}) },
        body: JSON.stringify({
          platform: form.platform, title: form.title.trim(), url: form.url.trim() || undefined, published_at: form.published_at || undefined,
          views: toNum(form.views), likes: toNum(form.likes), comments: toNum(form.comments), shares: toNum(form.shares),
          followers_gained: toNum(form.followers_gained),
        }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      toast.success('Content added');
      setForm({ platform: 'YouTube', title: '', url: '', published_at: '', views: '', likes: '', comments: '', shares: '', saves: '', followers_gained: '' });
      setShowForm(false);
      // Refresh from server so derived metrics reflect the new entry
      const { data: { session: s2 } } = await supabase.auth.getSession();
      const r2 = await fetch('/api/analytics', { headers: s2?.access_token ? { Authorization: `Bearer ${s2.access_token}` } : {} });
      const d2 = await r2.json();
      setEntries(d2.entries || []);
      setMetrics(d2.metrics || null);
    } catch {
      toast.error('Could not save — try again');
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/70 backdrop-blur-sm animate-backdrop-in">
      <div className="w-full max-w-2xl creo-surface-elevated rounded-2xl flex flex-col max-h-[88vh] animate-modal-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-creo-border flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-creo-primary/15 border border-creo-primary/25 flex items-center justify-center">
              <BarChart3 size={17} className="text-creo-primary" />
            </div>
            <div>
              <h2 className="creo-h3 text-creo-text-primary leading-tight">Analytics</h2>
              <p className="creo-caption text-creo-text-muted">Real numbers from content you've actually published.</p>
            </div>
          </div>
          <button onClick={onClose} className="text-creo-text-muted hover:text-creo-text-primary"><X size={16} /></button>
        </div>

        {!hasAccess ? (
          <div className="px-6 py-10 flex flex-col items-center text-center gap-3">
            <Crown size={22} className="text-creo-warning" />
            <p className="creo-body text-creo-text-secondary max-w-sm">Analytics is a Pro/Ultra feature — track your published content's real performance and see what's actually working.</p>
            <button onClick={() => router.push('/upgrade')} className="creo-btn-primary mt-2 px-5 py-2.5 rounded-xl text-white creo-body font-semibold">Upgrade to unlock</button>
          </div>
        ) : (
          <>
            <div className="px-6 py-5 space-y-4 overflow-y-auto">
              {loading ? (
                <p className="creo-body text-creo-text-muted text-center py-8">Loading...</p>
              ) : showForm ? (
                <div className="space-y-3 animate-slide-up">
                  <div>
                    <label className="block creo-caption uppercase tracking-wider text-creo-text-muted mb-1.5">Platform</label>
                    <div className="flex flex-wrap gap-1.5">
                      {PLATFORMS.map((p) => (
                        <button key={p.name} onClick={() => setForm({ ...form, platform: p.name })}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg creo-body transition-all ${form.platform === p.name ? 'bg-creo-primary/20 border border-creo-primary/40 text-creo-primary' : 'creo-surface text-creo-text-muted'}`}>
                          <p.icon size={13} className={form.platform === p.name ? '' : p.color} />{p.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Content title *"
                    className="w-full creo-surface rounded-xl px-3.5 py-2.5 creo-body text-creo-text-primary placeholder:text-creo-text-muted focus:outline-none focus:border-creo-primary/40" />
                  <div className="grid grid-cols-2 gap-2">
                    <input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="URL (optional)"
                      className="creo-surface rounded-xl px-3.5 py-2.5 creo-body text-creo-text-primary placeholder:text-creo-text-muted focus:outline-none focus:border-creo-primary/40" />
                    <input type="date" value={form.published_at} onChange={(e) => setForm({ ...form, published_at: e.target.value })}
                      className="creo-surface rounded-xl px-3.5 py-2.5 creo-body text-creo-text-primary focus:outline-none focus:border-creo-primary/40" />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {(['views', 'likes', 'comments', 'shares', 'saves', 'followers_gained'] as const).map((f) => (
                      <input key={f} type="number" min="0" value={(form as any)[f]} onChange={(e) => setForm({ ...form, [f]: e.target.value })}
                        placeholder={f === 'followers_gained' ? 'Followers +' : f[0].toUpperCase() + f.slice(1)}
                        className="creo-surface rounded-xl px-3 py-2 creo-body text-creo-text-primary placeholder:text-creo-text-muted focus:outline-none focus:border-creo-primary/40" />
                    ))}
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button onClick={() => setShowForm(false)} className="creo-surface rounded-xl px-4 py-2.5 creo-body text-creo-text-secondary">Cancel</button>
                    <button onClick={handleAddEntry} disabled={saving} className="creo-btn-primary flex-1 rounded-xl px-4 py-2.5 text-white creo-body font-semibold disabled:opacity-50">{saving ? 'Saving...' : 'Save content'}</button>
                  </div>
                </div>
              ) : !metrics ? (
                <div className="flex flex-col items-center text-center py-10 gap-3">
                  <TrendingUp size={22} className="text-creo-text-muted" />
                  <p className="creo-body text-creo-text-secondary">Not enough data yet.</p>
                  <p className="creo-caption text-creo-text-muted max-w-xs">Add your first piece of published content and CRÉO will start calculating real engagement and trends from it.</p>
                  <button onClick={() => setShowForm(true)} className="creo-btn-primary mt-1 flex items-center gap-1.5 px-4 py-2 rounded-xl text-white creo-body font-semibold"><Plus size={14} />Add content</button>
                </div>
              ) : (
                <div className="space-y-4 animate-slide-up">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { icon: Eye, label: 'Total Views', value: metrics.totalViews.toLocaleString() },
                      { icon: Heart, label: 'Total Likes', value: metrics.totalLikes.toLocaleString() },
                      { icon: MessageCircle, label: 'Comments', value: metrics.totalComments.toLocaleString() },
                      { icon: TrendingUp, label: 'Avg Engagement', value: metrics.avgEngagementRate !== null ? `${metrics.avgEngagementRate}%` : '—' },
                    ].map((s) => (
                      <div key={s.label} className="creo-surface rounded-xl p-3">
                        <s.icon size={13} className="text-creo-primary mb-1.5" />
                        <p className="creo-h3 text-creo-text-primary" style={{ fontSize: '1.1rem' }}>{s.value}</p>
                        <p className="creo-caption text-creo-text-muted">{s.label}</p>
                      </div>
                    ))}
                  </div>

                  <div>
                    <p className="creo-caption uppercase tracking-wider text-creo-text-muted mb-2">Top Performing Content</p>
                    <div className="space-y-1.5">
                      {metrics.topByViews.map((e) => (
                        <div key={e.id} className="creo-surface rounded-xl px-3.5 py-2.5 flex items-center justify-between gap-3">
                          <p className="creo-body text-creo-text-secondary truncate flex-1">{e.title}</p>
                          <span className="creo-caption text-creo-text-muted flex-shrink-0">{e.platform} · {(e.views || 0).toLocaleString()} views</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {Object.keys(metrics.byPlatform).length > 1 && (
                    <div>
                      <p className="creo-caption uppercase tracking-wider text-creo-text-muted mb-2">By Platform</p>
                      <div className="space-y-1.5">
                        {Object.entries(metrics.byPlatform).map(([platform, stats]) => (
                          <div key={platform} className="creo-surface rounded-xl px-3.5 py-2.5 flex items-center justify-between">
                            <span className="creo-body text-creo-text-secondary">{platform}</span>
                            <span className="creo-caption text-creo-text-muted">{stats.count} posts · {stats.totalViews.toLocaleString()} views{stats.avgEngagement !== null ? ` · ${Math.round(stats.avgEngagement * 10) / 10}% eng.` : ''}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <button onClick={() => setShowForm(true)} className="w-full creo-surface hover:border-creo-primary/30 rounded-xl px-4 py-2.5 creo-body text-creo-text-secondary flex items-center justify-center gap-1.5"><Plus size={14} />Add another</button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
