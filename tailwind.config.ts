import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './lib/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        // Deep navy base — adds depth and financial trustworthiness
        bg: { DEFAULT: '#080c1a', 2: '#0d1428', 3: '#141e38' },
        // Slate-tinted borders — more visible, cooler feel
        border: { DEFAULT: 'rgba(148,163,184,0.10)', 2: 'rgba(148,163,184,0.18)' },
        // Blue-shifted text for cohesion with navy base
        text: { DEFAULT: '#dde4f5', 2: '#7a84aa', 3: '#48527a' },
        // Sky blue — cleaner primary than neon cyan
        cyan: { DEFAULT: '#38bdf8', dim: 'rgba(56,189,248,0.10)' },
        // Amber — warmer and more refined than harsh orange
        orange: { DEFAULT: '#fb923c', dim: 'rgba(251,146,60,0.12)' },
        // Emerald — more sophisticated than lime green
        green: { DEFAULT: '#34d399', dim: 'rgba(52,211,153,0.10)' },
        // Violet — keep as secondary accent
        purple: { DEFAULT: '#a78bfa', dim: 'rgba(167,139,250,0.10)' },
        // Gold — partial payments, keep
        gold: { DEFAULT: '#fbbf24' },
        // Rose — more elegant than coral red
        red: { DEFAULT: '#fb7185', dim: 'rgba(251,113,133,0.12)' }
      },
      boxShadow: {
        card: '0 0 0 1px rgba(148,163,184,0.04), 0 8px 24px rgba(0,0,0,0.28), 0 24px 64px rgba(0,0,0,0.36)',
        glow: '0 0 40px rgba(56,189,248,0.10)',
        'glow-sm': '0 0 20px rgba(56,189,248,0.08)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace']
      },
      borderRadius: {
        sm: '8px',
        md: '14px',
        lg: '18px'
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      }
    }
  },
  plugins: []
};

export default config;
