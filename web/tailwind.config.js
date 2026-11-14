/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#f2f7f4',
          100: '#e1ede6',
          200: '#c4dbcf',
          300: '#9cc1af',
          400: '#6fa28c',
          500: '#4d856f',
          600: '#3a6b57',
          700: '#2f5546',
          800: '#28453a',
          900: '#1d352c',
          950: '#0f1d18',
        },
        sand: {
          50: '#fdfcf9',
          100: '#f9f6ee',
          200: '#f2ece0',
          300: '#e7ddcb',
          400: '#d7c7b0',
          500: '#c3ad92',
          900: '#403528',
        },
        charcoal: {
          50: '#f6f7f8',
          100: '#edeff2',
          200: '#d9dde3',
          300: '#b8c1cb',
          400: '#8f9db0',
          500: '#6e7e93',
          600: '#556477',
          700: '#444f60',
          800: '#38414e',
          900: '#20252e',
          950: '#14171d',
        },
        accent: {
          blue: {
            50: '#eff6ff',
            100: '#dbeafe',
            200: '#bfdbfe',
            600: '#2563eb',
            700: '#1d4ed8',
            800: '#1e40af',
          },
          amber: {
            50: '#fffbeb',
            100: '#fef3c7',
            600: '#d97706',
            700: '#b45309',
            800: '#92400e',
          }
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
