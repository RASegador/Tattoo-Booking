import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          black: '#050505',
          charcoal: '#0e0e10',
          gray: '#1a1a1d',
          mist: '#2a2a2e',
        },
        crimson: {
          DEFAULT: '#b3122e',
          light: '#e0193b',
          dark: '#7a0c1f',
        },
        gold: {
          DEFAULT: '#c9a24b',
          light: '#e6c979',
          dark: '#8f7130',
        },
        cyan: {
          DEFAULT: '#3ff0e0',
          light: '#8bffef',
        },
      },
      fontFamily: {
        display: ['var(--font-cinzel)', 'serif'],
        body: ['var(--font-inter)', 'sans-serif'],
      },
      backgroundImage: {
        'noise': "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E\")",
        'grunge': "radial-gradient(circle at 20% 20%, rgba(179,18,46,0.10), transparent 45%), radial-gradient(circle at 80% 70%, rgba(179,18,46,0.08), transparent 50%), linear-gradient(180deg, #050505 0%, #0e0e10 50%, #050505 100%)",
      },
      boxShadow: {
        'glow-red': '0 0 20px rgba(179,18,46,0.35), 0 0 4px rgba(224,25,59,0.5)',
        'glow-red-lg': '0 0 45px rgba(179,18,46,0.45), 0 0 12px rgba(224,25,59,0.4)',
        'glow-gold': '0 0 20px rgba(201,162,75,0.3)',
        'card-red': '0 10px 30px -10px rgba(179,18,46,0.35), 0 2px 8px rgba(0,0,0,0.4)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-18px) rotate(1.5deg)' },
        },
        drift: {
          '0%': { transform: 'translate(0,0) scale(1)', opacity: '0.15' },
          '50%': { transform: 'translate(20px,-40px) scale(1.1)', opacity: '0.3' },
          '100%': { transform: 'translate(-10px,-80px) scale(1)', opacity: '0' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.5', filter: 'blur(60px)' },
          '50%': { opacity: '0.9', filter: 'blur(80px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseGlowRed: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(224,25,59,0.45), 0 0 12px rgba(179,18,46,0.3)' },
          '50%': { boxShadow: '0 0 0 8px rgba(224,25,59,0), 0 0 26px rgba(179,18,46,0.55)' },
        },
        borderGlowRed: {
          '0%, 100%': { borderColor: 'rgba(179,18,46,0.4)', opacity: '0.7' },
          '50%': { borderColor: 'rgba(224,25,59,0.9)', opacity: '1' },
        },
        inkSpread: {
          '0%': { transform: 'scale(0)', opacity: '0.9' },
          '70%': { opacity: '0.5' },
          '100%': { transform: 'scale(1)', opacity: '0' },
        },
        parallaxDrift: {
          '0%, 100%': { transform: 'translate3d(0,0,0) scale(1)' },
          '50%': { transform: 'translate3d(0,-24px,0) scale(1.03)' },
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        drift: 'drift 9s ease-in infinite',
        glowPulse: 'glowPulse 5s ease-in-out infinite',
        shimmer: 'shimmer 3s linear infinite',
        pulseGlowRed: 'pulseGlowRed 2.4s ease-in-out infinite',
        borderGlowRed: 'borderGlowRed 3s ease-in-out infinite',
        inkSpread: 'inkSpread 1.8s ease-out infinite',
        parallaxDrift: 'parallaxDrift 12s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
export default config;
