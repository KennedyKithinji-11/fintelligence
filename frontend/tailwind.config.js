/** @type {import('tailwindcss').Config} */
export default {
  // Tell Tailwind where to scan for class names — it only generates CSS for classes it finds
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Match the FinTelligence design system
        fin: {
          void:    '#050810',
          deep:    '#0a0f1e',
          surface: '#0f1629',
          panel:   '#151d35',
          border:  '#2a3560',
          cyan:    '#00d4ff',
          gold:    '#f0b429',
          green:   '#00e676',
          red:     '#ff4444',
        },
      },
    },
  },
  plugins: [],
}