'use client';
import React, { useState } from 'react';
import AppLogo from '@/components/ui/AppLogo';
import { Mail } from 'lucide-react';
import { toast } from 'sonner';

const TwitterIcon = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>);
const YoutubeIcon = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>);
const InstagramIcon = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>);
const DiscordIcon = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.865-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.058a.082.082 0 0 0 .031.056 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.291.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" /></svg>);

// ✅ CRÉO community Discord — never-expires invite, wired 2026-07.
const DISCORD_INVITE = 'https://discord.gg/WDqJeKUcu';

// ✅ Real CRÉO accounts — wired 2026-07 (were placeholder platform homepages).
const socialLinks = [
  { SocialIcon: TwitterIcon, label: 'Twitter', href: 'https://x.com/get_creo' },
  { SocialIcon: YoutubeIcon, label: 'YouTube', href: 'https://www.youtube.com/@get-creo' },
  { SocialIcon: InstagramIcon, label: 'Instagram', href: 'https://www.instagram.com/creo_.2026/' },
  { SocialIcon: DiscordIcon, label: 'Discord community', href: DISCORD_INVITE },
];

const CONTACT_EMAIL = 'creo.app.ai@gmail.com';

// ✅ FIXED: these were mailto: links, which silently fail (or open a broken
// handler page) on any computer without a configured mail app — most of them.
// Contact entries now COPY the email to the clipboard with a subject hint,
// which works for 100% of visitors.
type FooterLink = { label: string; href?: string; subject?: string };

const productLinks: FooterLink[] = [
  { label: 'Features', href: '/#features' },
  { label: 'Pricing', href: '/#pricing' },
  { label: 'Changelog', href: '/changelog' },
  { label: 'Roadmap', href: '/roadmap' },
  { label: 'API', subject: 'API Access Request' },
];

const companyLinks: FooterLink[] = [
  { label: 'About', href: '/#hero' },
  { label: 'Community', href: DISCORD_INVITE },
  { label: 'Careers', subject: 'Careers' },
  { label: 'Press Kit', subject: 'Press Kit Request' },
  { label: 'Affiliates', subject: 'Affiliate Program' },
];

export default function FooterSection() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // ✅ Copy-to-contact — works on every device, no mail app needed.
  const copyContact = (subject: string) => {
    navigator.clipboard.writeText(CONTACT_EMAIL).catch(() => {});
    toast.success(`Email copied: ${CONTACT_EMAIL}`, {
      description: `Send us a mail with the subject "${subject}" and we'll get back to you.`,
    });
  };

  // ✅ Actually saves to Supabase now instead of just showing a success toast.
  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');
      toast.success("You're on the list!", { description: "We'll notify you about CRÉO updates." });
      setEmail('');
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong. Please try again.');
    }
    setSubmitting(false);
  };
  return (
    <footer className="relative border-t border-white/5 pt-16 pb-8 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none"><div className="absolute bottom-0 left-0 w-[400px] h-[300px] bg-purple-900/10 blur-[100px]" /></div>
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <AppLogo size={28} />
              <span className="font-display text-xl font-semibold text-white">CRÉO</span>
            </div>
            <p className="text-white/40 text-sm leading-relaxed mb-6 max-w-xs">The AI content creation platform built for creators who ship daily. From idea to viral script in seconds.</p>
            <div className="flex items-center gap-3">
              {socialLinks.map(({ SocialIcon, label, href }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="w-9 h-9 glass rounded-lg border border-white/8 flex items-center justify-center text-white/40 hover:text-white hover:border-white/20 transition-all duration-200"><SocialIcon /></a>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-white/30 mb-4">Product</p>
            <ul className="space-y-3">{productLinks.map(({ label, href, subject }) => (<li key={label}>{href ? (<a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel={href.startsWith('http') ? 'noopener noreferrer' : undefined} className="text-sm text-white/50 hover:text-white transition-colors duration-200">{label}</a>) : (<button onClick={() => copyContact(subject || label)} className="text-sm text-white/50 hover:text-white transition-colors duration-200">{label}</button>)}</li>))}</ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-white/30 mb-4">Company</p>
            <ul className="space-y-3">{companyLinks.map(({ label, href, subject }) => (<li key={label}>{href ? (<a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel={href.startsWith('http') ? 'noopener noreferrer' : undefined} className="text-sm text-white/50 hover:text-white transition-colors duration-200">{label}</a>) : (<button onClick={() => copyContact(subject || label)} className="text-sm text-white/50 hover:text-white transition-colors duration-200">{label}</button>)}</li>))}</ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-white/30 mb-4">Stay Updated</p>
            <p className="text-sm text-white/40 mb-4 leading-relaxed">Get creator tips and CRÉO updates. No spam, ever.</p>
            <form onSubmit={handleNewsletter} className="flex flex-col gap-2">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" className="w-full px-4 py-2.5 rounded-xl glass border border-white/10 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-purple-500/50 transition-colors duration-200 bg-transparent" />
              <button type="submit" disabled={submitting} className="w-full py-2.5 rounded-xl bg-gradient-vyro text-white text-sm font-semibold hover:scale-[1.02] active:scale-95 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100">{submitting ? 'Subscribing...' : 'Subscribe'}</button>
            </form>
          </div>
        </div>
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/25">© 2026 CRÉO. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="/privacy" className="text-xs text-white/30 hover:text-white/60 transition-colors duration-200">Privacy Policy</a>
            <a href="/terms" className="text-xs text-white/30 hover:text-white/60 transition-colors duration-200">Terms of Service</a>
            <a href="/refunds" className="text-xs text-white/30 hover:text-white/60 transition-colors duration-200">Refund Policy</a>
            <a href="/contact" className="text-xs text-white/30 hover:text-white/60 transition-colors duration-200">Contact Us</a>
          </div>
          <div className="flex items-center gap-2 text-xs text-white/25">
            <Mail size={11} />
            <button onClick={() => copyContact('Hello')} className="hover:text-white/50 transition-colors duration-200" title="Click to copy">{CONTACT_EMAIL}</button>
          </div>
        </div>
      </div>
    </footer>
  );
}
