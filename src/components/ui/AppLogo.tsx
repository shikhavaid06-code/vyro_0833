'use client';

import React, { memo, useMemo } from 'react';

interface AppLogoProps {
  src?: string; // kept for backward compatibility — ignored, the mark is now inline SVG
  size?: number;
  className?: string;
  onClick?: () => void;
}

// ✅ THE CRÉO MARK — a "C" with a golden growth arrow launching out of its
// opening: content that grows. Rendered as inline SVG so it's pixel-crisp at
// every size, needs no image download, and never 404s.
// (Replaced the old app_logo.png, which read as a Wi-Fi symbol.)
const AppLogo = memo(function AppLogo({
  size = 64,
  className = '',
  onClick,
}: AppLogoProps) {
  const containerClassName = useMemo(() => {
    const classes = ['flex items-center'];
    if (onClick) classes.push('cursor-pointer hover:opacity-80 transition-opacity');
    if (className) classes.push(className);
    return classes.join(' ');
  }, [onClick, className]);

  return (
    <div className={containerClassName} onClick={onClick}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
        aria-label="CRÉO logo"
      >
        <defs>
          <linearGradient id="creo-bg" x1="0" y1="64" x2="64" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#7c3aed" />
            <stop offset="0.55" stopColor="#a855f7" />
            <stop offset="1" stopColor="#ec4899" />
          </linearGradient>
          <linearGradient id="creo-spark" x1="34" y1="38" x2="54" y2="16" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="1" stopColor="#fcd34d" />
          </linearGradient>
        </defs>
        <rect width="64" height="64" rx="15" fill="url(#creo-bg)" />
        <rect x="1" y="1" width="62" height="62" rx="14" stroke="white" strokeOpacity="0.14" strokeWidth="1.5" fill="none" />
        <path d="M44.5 46.5 A19 19 0 1 1 44.5 17.5" stroke="white" strokeWidth="7" strokeLinecap="round" fill="none" />
        <path d="M36.5 35.5 L50 22" stroke="url(#creo-spark)" strokeWidth="5.5" strokeLinecap="round" />
        <path d="M42 20.5 L51.5 20.5 L51.5 30" stroke="url(#creo-spark)" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
    </div>
  );
});

export default AppLogo;
