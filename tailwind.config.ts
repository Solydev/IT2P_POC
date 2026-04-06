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
        'a2p-bg': '#F5F7FA',
        'a2p-surface': '#FFFFFF',
        'a2p-sand': '#DDE2EA',
        'a2p-sand-light': '#EEF1F6',
        'a2p-text': '#1C2333',
        'a2p-text-secondary': '#64748B',
        'a2p-accent': '#2558A8',
        'a2p-accent-hover': '#1A4690',
        'a2p-coming-soon': '#A8B4C4',
        'a2p-success': '#2E7D4F',
        'a2p-warning': '#C97A0A',
        'a2p-error': '#B03040',
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
