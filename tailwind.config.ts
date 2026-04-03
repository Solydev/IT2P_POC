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
        'it2p-bg': '#FAFAF7',
        'it2p-surface': '#FFFFFF',
        'it2p-sand': '#D4C5A9',
        'it2p-sand-light': '#F5EBD8',
        'it2p-text': '#2D2A26',
        'it2p-text-secondary': '#6B6560',
        'it2p-accent': '#2E5A88',
        'it2p-accent-hover': '#1D4A75',
        'it2p-coming-soon': '#C8C4BE',
        'it2p-success': '#4A7C59',
        'it2p-warning': '#B8860B',
        'it2p-error': '#A04040',
        'it2p-info': '#4A6FA5',
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Source Sans 3', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
export default config
