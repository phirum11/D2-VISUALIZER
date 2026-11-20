/** @type {import('tailwindcss').Config} */
const editorAccent = {
  50: '#f5f2ff', 100: '#ebe5fc', 200: '#d8cef1', 300: '#c4b4e9',
  400: '#b5a1df', 500: '#9783c5', 600: '#75629f', 700: '#554775',
  800: '#3a3153', 900: '#252038', 950: '#151220',
}

module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // One restrained lavender UI accent; artwork keeps its independent palette.
        ...Object.fromEntries(['indigo', 'cyan', 'purple', 'violet', 'blue', 'sky', 'teal',
          'emerald', 'green', 'lime', 'yellow', 'amber', 'orange', 'red', 'rose', 'pink',
          'fuchsia', 'slate'].map(name => [name, editorAccent])),
        d2: {
          canvas: '#0b0f17',
          surface: '#121925',
          surfaceElevated: '#1b2534',
          surfaceActive: '#23364d',
          border: '#2f3e52',
          borderSubtle: '#202d3f',
          text: '#e6edf7',
          textMuted: '#a1b0c5',
          textSubtle: '#8294ad',
          accent: '#b5a1df',
          accentHover: '#cdbcf0',
          accentCyan: '#d0c5e9',
          danger: '#afbdd0',
          dangerHover: '#ced8e6',
          success: '#c4b4e9',
          warning: '#afbdd0',
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
        '4xs': ['0.5625rem', { lineHeight: '0.75rem' }],
        '3xs': ['0.625rem', { lineHeight: '0.875rem' }],
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.8125rem', { lineHeight: '1.25rem' }],
        'base': ['0.875rem', { lineHeight: '1.375rem' }],
      },
    },
  },
  plugins: [],
}
