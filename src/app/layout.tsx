import React from 'react';
import type { Metadata, Viewport } from 'next';
import '../styles/tailwind.css';
import { Toaster } from 'sonner';
import { Analytics } from '@vercel/analytics/react';
import CookieConsent from '@/components/ui/CookieConsent';
import RefCapture from '@/components/ui/RefCapture';
import PwaRegister from '@/components/ui/PwaRegister';
import PostHogInit from '@/components/PostHogInit';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0B0C0E',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://vyro-0833.vercel.app'),
  title: { default: 'CRÉO — Creator Intelligence Workspace', template: '%s | CRÉO' },
  description: 'CRÉO is a creator intelligence workspace for thinking, creating, analyzing and improving content.',
  keywords: ['creator intelligence', 'content creation', 'creator workspace', 'AI content tools'],
  openGraph: {
    title: 'CRÉO — Creator Intelligence Workspace',
    description: 'A focused workspace for creators to think, create, analyze and grow.',
    url: 'https://vyro-0833.vercel.app',
    siteName: 'CRÉO',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'CRÉO — Creator Intelligence Workspace',
    description: 'A focused workspace for creators to think, create, analyze and grow.',
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <PostHogInit />
        {children}
        <RefCapture />
        <CookieConsent />
        <Analytics />
        <PwaRegister />
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#181A1D',
              border: '1px solid #2A2D31',
              color: '#EFEEEC',
              backdropFilter: 'blur(20px)',
            },
          }}
        />
        {/* Compatibility layer while legacy purple utility classes are removed component-by-component.
            This is visual only: it does not change data, auth, API, or database behavior. */}
        <style dangerouslySetInnerHTML={{ __html: `
          :root { --creo-primary: #E17E4A; }
          body { background: #0B0C0E !important; }
          body::before {
            background:
              radial-gradient(ellipse 700px 450px at 10% -10%, rgba(225,126,74,.055), transparent 62%),
              radial-gradient(ellipse 600px 500px at 95% 110%, rgba(225,126,74,.035), transparent 62%) !important;
          }
          [class*="bg-purple-"], [class*="bg-violet-"], [class*="bg-fuchsia-"], [class*="bg-pink-"] {
            background-color: #E17E4A !important;
          }
          [class*="text-purple-"], [class*="text-violet-"], [class*="text-fuchsia-"], [class*="text-pink-"] {
            color: #E17E4A !important;
          }
          [class*="border-purple-"], [class*="border-violet-"], [class*="border-fuchsia-"], [class*="border-pink-"] {
            border-color: rgba(225,126,74,.38) !important;
          }
          [class*="from-purple-"], [class*="from-violet-"], [class*="from-fuchsia-"], [class*="from-pink-"],
          [class*="to-purple-"], [class*="to-violet-"], [class*="to-fuchsia-"], [class*="to-pink-"] {
            --tw-gradient-from: #E17E4A !important;
            --tw-gradient-to: #E17E4A !important;
          }
          [class*="bg-gradient-"] { background-image: none !important; }
          [class*="shadow-purple-"], [class*="shadow-pink-"] { box-shadow: 0 1px 2px rgba(0,0,0,.4) !important; }
          .glow-purple, .glow-pink, .glow-button { box-shadow: 0 1px 2px rgba(0,0,0,.4) !important; }
          * { scrollbar-color: rgba(225,126,74,.35) transparent; }
          *::-webkit-scrollbar-thumb { background: rgba(225,126,74,.32); }
          *::-webkit-scrollbar-thumb:hover { background: rgba(225,126,74,.55); }
        ` }} />
      </body>
    </html>
  );
}
