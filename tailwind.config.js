/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fcfaff',
          100: '#f7f4ff',
          200: '#eee8ff',
          300: '#dfd4ff',
          400: '#cab3ff',
          500: '#b18cff',
          600: '#9b6eff',
          700: '#8e5ff5',
          800: '#7a4dd4',
          900: '#6441ad',
          950: '#432a7e',
        },
        background: 'var(--color-background)',
        surface: 'var(--color-surface)',
        surfaceLight: 'var(--color-surfaceLight)',
        textPrimary: 'var(--color-textPrimary)',
        textSecondary: 'var(--color-textSecondary)',
      }
    },
  },
  plugins: [],
}
