import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        snapdeal: {
          DEFAULT: '#e40046',
          dark: '#c1003b',
          light: '#fff1f3',
          border: '#ffd0d8',
        },
      },
      keyframes: {
        pulseSlow: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        },
        wave: {
          '0%, 100%': { height: '8px' },
          '50%': { height: '32px' },
        },
      },
      animation: {
        'pulse-slow': 'pulseSlow 2s ease-in-out infinite',
        'wave-bar': 'wave 1.2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;

