import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './space-travel.html', './deep-rehearsal.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#DEDBC8',
      },
      fontFamily: {
        serif: ['"Instrument Serif"', 'serif'],
        heading: ['"Instrument Serif"', 'serif'],
        body: ['Barlow', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '9999px',
      },
    },
  },
  plugins: [],
} satisfies Config;
