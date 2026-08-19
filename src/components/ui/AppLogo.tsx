'use client';

import React, { memo, useMemo } from 'react';

interface AppLogoProps {
  src?: string;
  size?: number;
  className?: string;
  onClick?: () => void;
}

/**
 * CRÉO brand mark.
 * Architectural, restrained, and intentionally flat: terracotta C + growth cut.
 * No gradient so the mark stays consistent with the CRÉO design system.
 */
const AppLogo = memo(function AppLogo({ size = 64, className = '', onClick }: AppLogoProps) {
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
        <rect width="64" height="64" rx="15" fill="#0B0C0E" />
        <rect x="1" y="1" width="62" height="62" rx="14" stroke="#2A2D31" strokeWidth="1.5" fill="none" />
        <path
          d="M44.5 46.5 A19 19 0 1 1 44.5 17.5"
          stroke="#E17E4A"
          strokeWidth="7"
          strokeLinecap="round"
          fill="none"
        />
        <path d="M36.5 35.5 L50 22" stroke="#EFE EEC" strokeWidth="5.5" strokeLinecap="round" />
        <path
          d="M42 20.5 L51.5 20.5 L51.5 30"
          stroke="#E17E4A"
          strokeWidth="5.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    </div>
  );
});

export default AppLogo;
