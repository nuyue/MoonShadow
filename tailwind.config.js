/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#0A0A0F',
        'bg-secondary': '#12121A',
        'bg-tertiary': '#1A1A24',
        'text-primary': '#E4E4E7',
        'text-secondary': '#A1A1AA',
        'text-muted': '#52525B',
        'accent-purple': '#8B5CF6',
        'accent-blue': '#3B82F6',
        'accent-cyan': '#06B6D4',
        'border': '#27272A',
      },
      fontFamily: {
        'mono': ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}