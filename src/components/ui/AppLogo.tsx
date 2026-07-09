'use client';

import React, { memo, useMemo } from 'react';
import { Sparkles } from 'lucide-react';
import AppImage from './AppImage';

interface AppLogoProps {
  src?: string; // Image source (optional)
  size?: number; // Size for icon/image
  className?: string; // Additional classes
  onClick?: () => void; // Click handler
}

// ✅ Icon fallback now uses lucide-react (already used app-wide) instead of
// AppIcon, which imported the ENTIRE @heroicons library into the bundle for
// a fallback branch that never rendered (src always has a default).
const AppLogo = memo(function AppLogo({
  src = '/assets/images/app_logo.png',
  size = 64,
  className = '',
  onClick,
}: AppLogoProps) {
  // Memoize className calculation
  const containerClassName = useMemo(() => {
    const classes = ['flex items-center'];
    if (onClick) classes.push('cursor-pointer hover:opacity-80 transition-opacity');
    if (className) classes.push(className);
    return classes.join(' ');
  }, [onClick, className]);

  return (
    <div className={containerClassName} onClick={onClick}>
      {/* Show image if src provided, otherwise show icon */}
      {src ? (
        <AppImage
          src={src}
          alt="Logo"
          width={size}
          height={size}
          className="flex-shrink-0"
          priority={true}
          unoptimized={src.endsWith('.svg')}
        />
      ) : (
        <Sparkles size={size} className="flex-shrink-0 text-purple-400" />
      )}
    </div>
  );
});

export default AppLogo;
