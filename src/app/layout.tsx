import React from 'react';
import type { Metadata, Viewport } from 'next';
import '../styles/tailwind.css';
import { Toaster } from 'sonner';
import { Analytics } from '@vercel/analytics/react';
import CookieConsent from '@/components/ui/CookieConsent';
import RefCapture from '@/components/ui/RefCapture';
import PwaRegister from '@/components/ui/PwaRegister';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#080812',
};

// ✅ Real SEO metadata (Week 1 item) — OpenGraph + Twitter cards so shared
// links look professional, plus canonical base URL for search engines.
export const metadata: Metadata = {
  metadataBase: new URL('https://vyro-0833.vercel.app'),
  title: {
    default: 'CRÉO — Create Viral Content with AI',
    template: '%s | CRÉO',
  },
  description:
    'CRÉO turns your raw ideas into viral titles, hooks, and scripts in seconds. The AI content creation platform built for creators who ship daily.',
  keywords: ['AI content creation', 'viral hooks', 'YouTube titles', 'video scripts', 'content creator tools'],
  openGraph: {
    title: 'CRÉO — Create Viral Content with AI',
    description: 'Turn raw ideas into viral titles, hooks, and scripts in seconds.',
    url: 'https://vyro-0833.vercel.app',
    siteName: 'CRÉO',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'CRÉO — Create Viral Content with AI',
    description: 'Turn raw ideas into viral titles, hooks, and scripts in seconds.',
  },
};

// ✅ Rocket.new tracker scripts removed — they loaded third-party analytics
// and a screenshot script on EVERY page, slowing load times and sending
// visitor data to a builder tool no longer in use.
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        {children}
        <RefCapture />
        <CookieConsent />
        {/* ✅ Vercel Analytics — cookieless page-view + visitor tracking so we
            can see real traffic → signup numbers instead of guessing. Shows
            up automatically in the Vercel dashboard's Analytics tab once
            deployed, no extra setup needed. */}
        <Analytics />
        <PwaRegister />
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'rgba(20, 20, 35, 0.95)',
              border: '1px solid rgba(168, 85, 247, 0.3)',
              color: '#f8f8ff',
              backdropFilter: 'blur(20px)',
            },
          }}
        />
      </body>
    </html>
  );
}
