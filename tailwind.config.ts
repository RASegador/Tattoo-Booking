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
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        drift: 'drift 9s ease-in infinite',
        glowPulse: 'glowPulse 5s ease-in-out infinite',
        shimmer: 'shimmer 3s linear infinite',
      },
    },
  },
  plugins: [],
};
export default config;
