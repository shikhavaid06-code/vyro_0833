'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AppLogo from '@/components/ui/AppLogo';

export default function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'home', href: '#hero' },
    { label: 'features', href: '#features' },
    { label: 'pricing', href: '#pricing' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#080812]/90 backdrop-blur-xl border-b border-white/5 shadow-lg shadow-black/20'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AppLogo size={28} />
          <span className="font-display text-xl font-semibold tracking-tight text-white">
            VYRO
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {navLinks?.map((link) => (
            <a
              key={`nav-${link?.label}`}
              href={link?.href}
              className="text-sm text-white/60 hover:text-white transition-colors duration-200 tracking-wide"
            >
              {link?.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/sign-up-login-screen"
            className="text-sm text-white/70 hover:text-white transition-colors duration-200 px-4 py-2"
          >
            login
          </Link>
          <Link
            href="/sign-up-login-screen"
            className="text-sm font-semibold px-5 py-2.5 rounded-full bg-gradient-vyro text-white glow-button hover:scale-105 active:scale-95 transition-all duration-200"
          >
            get started
          </Link>
        </div>

        <button
          className="md:hidden p-2 text-white/70 hover:text-white transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle mobile menu"
        >
          <div className="w-5 h-4 flex flex-col justify-between">
            <span className={`block h-0.5 bg-current transition-all duration-300 ${mobileOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
            <span className={`block h-0.5 bg-current transition-all duration-300 ${mobileOpen ? 'opacity-0' : ''}`} />
            <span className={`block h-0.5 bg-current transition-all duration-300 ${mobileOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
          </div>
        </button>
      </div>
      {mobileOpen && (
        <div className="md:hidden glass-strong border-t border-white/5 px-6 py-4 flex flex-col gap-4 animate-slide-up">
          {navLinks?.map((link) => (
            <a
              key={`mobile-nav-${link?.label}`}
              href={link?.href}
              className="text-sm text-white/70 hover:text-white transition-colors py-1"
              onClick={() => setMobileOpen(false)}
            >
              {link?.label}
            </a>
          ))}
          <div className="flex flex-col gap-3 pt-2 border-t border-white/10">
            <Link href="/sign-up-login-screen" className="text-sm text-white/70 hover:text-white transition-colors py-1">
              login
            </Link>
            <Link
              href="/sign-up-login-screen"
              className="text-sm font-semibold px-5 py-2.5 rounded-full bg-gradient-vyro text-white text-center"
            >
              get started
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}