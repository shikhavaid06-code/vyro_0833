/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/pages/**/*.{js,ts,jsx,tsx,mdx}', './src/components/**/*.{js,ts,jsx,tsx,mdx}', './src/app/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'sans-serif'], display: ['Satoshi', 'sans-serif'], mono: ['JetBrains Mono', 'monospace'] },
      colors: {
        vyro: { purple: '#E17E4A', pink: '#E17E4A', bg: '#0B0C0E', card: '#111214' },
        creo: {
          bg: '#0B0C0E', surface: '#111214', elevated: '#181A1D', surface3: '#1E2124', border: '#2A2D31',
          'border-strong': 'rgba(255,255,255,0.16)', primary: '#E17E4A', accent: '#E17E4A', success: '#3FA66B', warning: '#D9A441', danger: '#C65B4A',
          'text-primary': '#EFEEEC', 'text-secondary': 'rgba(239,238,236,0.62)', 'text-muted': '#9A9A96',
        },
      },
      backgroundImage: {
        'gradient-vyro': 'linear-gradient(135deg, #E17E4A 0%, #C9683B 100%)',
        'gradient-vyro-subtle': 'linear-gradient(135deg, rgba(225,126,74,0.12) 0%, rgba(201,104,59,0.08) 100%)',
      },
      animation: {
        float: 'float 6s ease-in-out infinite', modal-in: 'modalIn 0.35s cubic-bezier(0.22, 1, 0.36, 1) both', backdrop-in: 'backdropIn 0.25s ease both',
        'slide-down': 'slideDown 0.25s ease both', 'pop-in': 'popIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) both', burst: 'burst 0.5s ease-out forwards',
        'loader-sweep': 'loaderSweep 1.2s ease-in-out infinite', 'pulse-glow': 'pulseGlow 2s ease-in-out infinite', shimmer: 'shimmer 2s infinite',
        'slide-up': 'slideUp 0.5s ease forwards', 'fade-in': 'fadeIn 0.4s ease forwards', 'scale-in': 'scaleIn 0.3s ease forwards',
      },
      keyframes: {
        modalIn: { from: { opacity: '0', transform: 'translateY(24px) scale(0.97)' }, to: { opacity: '1', transform: 'translateY(0) scale(1)' } },
        backdropIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideDown: { from: { opacity: '0', transform: 'translateY(-8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        popIn: { from: { opacity: '0', transform: 'scale(0.4)' }, to: { opacity: '1', transform: 'scale(1)' } },
        burst: { from: { opacity: '0.8', transform: 'scale(0.4)' }, to: { opacity: '0', transform: 'scale(2)' } },
        loaderSweep: { from: { transform: 'translateX(-110%)' }, to: { transform: 'translateX(320%)' } },
        float: { '0%, 100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-12px)' } },
        pulseGlow: { '0%, 100%': { boxShadow: '0 0 12px rgba(225,126,74,0.18)' }, '50%': { boxShadow: '0 0 22px rgba(225,126,74,0.28)' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(20px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } }, scaleIn: { from: { opacity: '0', transform: 'scale(0.95)' }, to: { opacity: '1', transform: 'scale(1)' } },
      },
      boxShadow: {
        'glow-purple': '0 0 18px rgba(225,126,74,0.18)', 'glow-pink': '0 0 18px rgba(225,126,74,0.14)',
      },
    },
  },
  plugins: [],
};
