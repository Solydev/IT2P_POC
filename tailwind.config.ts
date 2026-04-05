import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'a2p-bg': '#FAFAF7',
        'a2p-surface': '#FFFFFF',
        'a2p-sand': '#D4C5A9',
        'a2p-sand-light': '#F5EBD8',
        'a2p-text': '#2D2A26',
        'a2p-text-secondary': '#6B6560',
        'a2p-accent': '#2E5A88',
        'a2p-accent-hover': '#1D4A75',
        'a2p-coming-soon': '#C8C4BE',
        'a2p-success': '#4A7C59',
        'a2p-warning': '#B8860B',
        'a2p-error': '#A04040',
        'a2p-info': '#4A6FA5',
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Source Sans 3', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      keyframes: {
        'slide-in': {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
      },
      animation: {
        'slide-in': 'slide-in 0.3s ease-out',
      },
    },
  },
  plugins: [],
}
export default config
