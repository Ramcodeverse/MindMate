/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        serenity: {
          forest: '#174C3C',
          evergreen: '#102F27',
          sage: '#A9C7B2',
          mint: '#E2F1E6',
          ivory: '#F8F7F1',
          white: '#FFFFFF',
          lavender: '#EAE6F7',
          peach: '#F4DDD0',
          primary: '#20352C',
          secondary: '#66766C',
          border: '#E3E9E2',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'subtle': '0 2px 8px -2px rgba(16, 47, 39, 0.05), 0 1px 4px -1px rgba(16, 47, 39, 0.03)',
        'elevated': '0 12px 32px -8px rgba(16, 47, 39, 0.08), 0 4px 12px -2px rgba(16, 47, 39, 0.04)',
      },
    },
  },
  plugins: [],
};
