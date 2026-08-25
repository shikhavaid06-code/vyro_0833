/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Satoshi', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        vyro: {
          purple: '#a855f7',
          pink: '#ec4899',
          bg: '#080812',
          card: '#0a0a18',
        },
        // ✅ FINAL BRAND RETHEME (checkpoint 2) — "high-end architectural
        // creative studio" identity, replacing the violet/magenta system.
        // Hex values are a best-effort read of the reference swatch image
        // (can't pixel-sample exactly) — flagged in the report, easy to
        // nudge once real design tokens/Figma values are available.
        creo: {
          bg: '#0b0c0e',           // near-black matte foundation
          surface: '#111214',      // resting card/panel surface
          elevated: '#181a1d',     // hovered/active surface, modals
          surface3: '#1e2124',     // third depth level (nested cards)
          border: '#2a2d31',
          'border-strong': 'rgba(255,255,255,0.16)',
          primary: '#ad6f52',      // muted clay terracotta — architectural material, not saturated SaaS-orange (4.82:1 on bg — passes AA)
          'primary-btn': '#6e4230', // deep burnt-clay for FILLED buttons — muted, architectural, passes WCAG comfortably (8.45:1)
          accent: '#ad6f52',       // kept as an alias so existing accent-usage call sites don't need touching
          success: '#3fa66b',
          warning: '#d9a441',
          danger: '#c65b4a',
          'text-primary': '#efeeec',
          'text-secondary': 'rgba(239,238,236,0.62)',
          'text-muted': '#9a9a96',
        },
      },
      backgroundImage: {
        'gradient-vyro': 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
        'gradient-vyro-subtle': 'linear-gradient(135deg, rgba(168,85,247,0.15) 0%, rgba(236,72,153,0.15) 100%)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'modal-in': 'modalIn 0.35s cubic-bezier(0.22, 1, 0.36, 1) both',
        'backdrop-in': 'backdropIn 0.25s ease both',
        'slide-down': 'slideDown 0.25s ease both',
        'pop-in': 'popIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) both',
        'burst': 'burst 0.5s ease-out forwards',
        'loader-sweep': 'loaderSweep 1.2s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite',
        'slide-up': 'slideUp 0.5s ease forwards',
        'fade-in': 'fadeIn 0.4s ease forwards',
        'scale-in': 'scaleIn 0.3s ease forwards',
      },
      keyframes: {
        modalIn: {
          from: { opacity: '0', transform: 'translateY(24px) scale(0.97)' },
          to: { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        backdropIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideDown: {
          from: { opacity: '0', transform: 'translateY(-8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        popIn: {
          from: { opacity: '0', transform: 'scale(0.4)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        burst: {
          from: { opacity: '0.8', transform: 'scale(0.4)' },
          to: { opacity: '0', transform: 'scale(2)' },
        },
        loaderSweep: {
          from: { transform: 'translateX(-110%)' },
          to: { transform: 'translateX(320%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(168, 85, 247, 0.4), 0 0 40px rgba(168, 85, 247, 0.2)' },
          '50%': { boxShadow: '0 0 35px rgba(168, 85, 247, 0.7), 0 0 70px rgba(168, 85, 247, 0.3)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
      },
      boxShadow: {
        'glow-purple': '0 0 30px rgba(168, 85, 247, 0.3), 0 0 60px rgba(168, 85, 247, 0.1)',
        'glow-pink': '0 0 30px rgba(236, 72, 153, 0.3), 0 0 60px rgba(236, 72, 153, 0.1)',
      },
    },
  },
  plugins: [],
};
