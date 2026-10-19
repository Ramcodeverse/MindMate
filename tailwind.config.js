/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: '#176B57',
          deep: '#104C40',
          dark: '#142E1F',
          light: '#2D5A46',
        },
        brand: {
          mint: '#E8F5EF',
          sage: '#F3F7F3',
          canvas: '#F7F9FC',
          card: '#FFFFFF',
          border: '#E4EAF0',
          text: '#172B3A',
          muted: '#657587',
        },
        mood: {
          great: '#F2A18B',
          good: '#31A878',
          okay: '#E8B64C',
          low: '#9279DB',
          struggling: '#6C8DB8',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
      }
    },
  },
  plugins: [],
};
