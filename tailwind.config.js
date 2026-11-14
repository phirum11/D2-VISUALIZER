/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        d2: {
          canvas: '#0b0d11',
          surface: '#13171f',
          surfaceElevated: '#1c222d',
          surfaceActive: '#252d3d',
          border: '#262d3d',
          borderSubtle: '#1e2330',
          text: '#f3f4f6',
          textMuted: '#9ca3af',
          textSubtle: '#6b7280',
          accent: '#6366f1',
          accentHover: '#4f46e5',
          accentCyan: '#06b6d4',
          danger: '#ef4444',
          dangerHover: '#dc2626',
          success: '#10b981',
          warning: '#f59e0b',
        }
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
        mono: [
          '"JetBrains Mono"',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          'monospace',
        ],
      },
      fontSize: {
        '2xs': ['0.65rem', { lineHeight: '0.85rem' }],
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.8125rem', { lineHeight: '1.25rem' }],
        'base': ['0.875rem', { lineHeight: '1.375rem' }],
      },
    },
  },
  plugins: [],
}
