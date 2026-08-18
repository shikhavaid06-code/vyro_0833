'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import AppLogo from '@/components/ui/AppLogo';

export default function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  // ✅ Professional casing + Roadmap added (it's public and honest now — show it off)
  const navLinks = [
    { label: 'Home', href: '#hero' },
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Compare', href: '#why-creo' },
    { label: 'Roadmap', href: '/roadmap' },
  ];
  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-creo-bg/90 backdrop-blur-xl border-b border-creo-border shadow-lg shadow-black/20' : 'bg-transparent'}`}>
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AppLogo size={28} />
          <span className="font-display text-xl font-semibold tracking-tight text-creo-text-primary">CRÉO</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          {navLinks?.map((link) => (
            <a key={`nav-${link?.label}`} href={link?.href} className="text-sm text-creo-text-secondary hover:text-creo-text-primary transition-colors duration-200 tracking-wide">{link?.label}</a>
          ))}
        </div>
        <div className="hidden md:flex items-center gap-4">
          <Link href="/sign-up-login-screen" className="text-sm text-creo-text-secondary hover:text-creo-text-primary transition-colors duration-200 px-4 py-2">Log in</Link>
          {/* ✅ PLG: primary nav CTA goes to the zero-friction /try experience,
              not a signup form — visitors feel the product before any commitment. */}
          <Link href="/try" className="flex items-center gap-1.5 text-sm font-semibold px-5 py-2.5 rounded-full creo-btn-primary text-white hover:scale-105 active:scale-95 transition-all duration-200">
            <Sparkles size={14} />Try it free
          </Link>
        </div>
        <button className="md:hidden p-2 text-creo-text-secondary hover:text-creo-text-primary transition-colors" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle mobile menu">
          <div className="w-5 h-4 flex flex-col justify-between">
            <span className={`block h-0.5 bg-current transition-all duration-300 ${mobileOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
            <span className={`block h-0.5 bg-current transition-all duration-300 ${mobileOpen ? 'opacity-0' : ''}`} />
            <span className={`block h-0.5 bg-current transition-all duration-300 ${mobileOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
          </div>
        </button>
      </div>
      {mobileOpen && (
        <div className="md:hidden creo-surface-elevated border-t border-creo-border px-6 py-4 flex flex-col gap-4 animate-slide-up">
          {navLinks?.map((link) => (
            <a key={`mobile-nav-${link?.label}`} href={link?.href} className="text-sm text-creo-text-secondary hover:text-creo-text-primary transition-colors py-1" onClick={() => setMobileOpen(false)}>{link?.label}</a>
          ))}
          <div className="flex flex-col gap-3 pt-2 border-t border-creo-border">
            <Link href="/sign-up-login-screen" className="text-sm text-creo-text-secondary hover:text-creo-text-primary transition-colors py-1">Log in</Link>
            <Link href="/try" className="flex items-center justify-center gap-1.5 text-sm font-semibold px-5 py-2.5 rounded-full creo-btn-primary text-white text-center">
              <Sparkles size={14} />Try it free
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
