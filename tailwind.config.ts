import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        navy: {
          950: '#060A14',
          900: '#0B132B',
          850: '#0F1C3F',
          800: '#152349',
          750: '#1C2D5C',
          700: '#253570',
          650: '#2E4085',
          600: '#3D5299',
        },
        corporate: {
          blue:    '#2563EB',
          accent:  '#0EA5E9',
          darkBlue: '#1E3A8A',
        }
      },
      boxShadow: {
        'glow-sky':     '0 0 20px -4px rgba(14, 165, 233, 0.35)',
        'glow-indigo':  '0 0 20px -4px rgba(99, 102, 241, 0.35)',
        'glow-emerald': '0 0 20px -4px rgba(16, 185, 129, 0.35)',
        'glow-rose':    '0 0 20px -4px rgba(244, 63, 94, 0.35)',
        'glow-amber':   '0 0 20px -4px rgba(245, 158, 11, 0.30)',
        'card':         '0 4px 24px -4px rgba(0, 0, 0, 0.5)',
        'card-hover':   '0 8px 32px -4px rgba(0, 0, 0, 0.6)',
      },
      animation: {
        'pulse-dot': 'pulseDot 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float':     'float 6s ease-in-out infinite',
        'glow':      'glowPulse 4s ease-in-out infinite alternate',
      },
      keyframes: {
        pulseDot: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.4' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        glowPulse: {
          '0%':   { opacity: '0.5', filter: 'blur(20px)' },
          '100%': { opacity: '0.9', filter: 'blur(30px)' },
        }
      },
      backgroundImage: {
        'gradient-radial':  'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':   'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'mesh-sm':          'radial-gradient(rgba(56, 189, 248, 0.05) 1px, transparent 1px)',
      },
    },
  },
  plugins: [],
};

export default config;
