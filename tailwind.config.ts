import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        bg: {
          DEFAULT: '#000000',
          2: '#050505',
          3: '#0a0a0a',
        },
        card: {
          DEFAULT: 'rgba(255, 255, 255, 0.03)',
          2: 'rgba(255, 255, 255, 0.05)',
        },
        border: {
          DEFAULT: 'rgba(212, 175, 55, 0.1)',
          hover: 'rgba(212, 175, 55, 0.35)',
        },
        primary: {
          DEFAULT: '#D4AF37',
          dim: 'rgba(212, 175, 55, 0.08)',
          glow: 'rgba(212, 175, 55, 0.3)',
        },
        accent: {
          DEFAULT: '#D4AF37',
          dim: 'rgba(212, 175, 55, 0.08)',
        },
        gold: {
          DEFAULT: '#D4AF37',
          light: '#F5D77A',
          dim: 'rgba(212, 175, 55, 0.08)',
        },
        provo: {
          text: '#f0ece2',
          muted: 'rgba(255, 255, 255, 0.5)',
          dim: 'rgba(255, 255, 255, 0.25)',
        },
      },
      backgroundImage: {
        'grad-primary': 'linear-gradient(135deg, #D4AF37, #F5D77A)',
        'grad-gold': 'linear-gradient(135deg, #D4AF37, #F5D77A)',
        'grad-hero': 'radial-gradient(ellipse 80% 60% at 20% 50%, rgba(212, 175, 55, 0.07) 0%, transparent 60%)',
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease both',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'spin-slow': 'spin 1.5s linear infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      maxWidth: {
        page: '1160px',
      },
    },
  },
  plugins: [],
}

export default config
