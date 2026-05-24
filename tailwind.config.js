/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#10B981', // Emerald / Splitwise style green
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        },
        coral: {
          50: '#fff5f5',
          100: '#fed7d7',
          200: '#feb2b2',
          300: '#fc8181',
          400: '#f56565',
          500: '#EF4444', // Red for "You owe"
          600: '#E53E3E',
          700: '#C53030',
        },
        dark: {
          bg: '#090D16',       // Premium ultra dark blue-grey
          card: '#131926',     // Card / container background
          border: '#1F293D',   // Elegant border
          text: '#F9FAFB',     // Off white text
          muted: '#9CA3AF'     // Grey text
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'premium': '0 10px 30px -10px rgba(0, 0, 0, 0.08), 0 1px 1px rgba(0, 0, 0, 0.02)',
        'premium-dark': '0 10px 35px -10px rgba(0, 0, 0, 0.5), 0 1px 2px rgba(255, 255, 255, 0.03)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.04)',
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.3)'
      }
    },
  },
  plugins: [],
}
