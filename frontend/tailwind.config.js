/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Kingdom Training brand colors
        primary: {
          50: '#e8eaf6',
          100: '#c5cae9',
          200: '#9fa8da',
          300: '#7986cb',
          400: '#5c6bc0',
          500: '#4169e1', // Main primary color (Deep Blue)
          600: '#3949ab',
          700: '#303f9f',
          800: '#283593',
          900: '#1A237E', // Deepest blue
        },
        secondary: {
          50: '#fffef0',
          100: '#fffce0',
          200: '#fff9c4',
          300: '#fff59d',
          400: '#fff176',
          500: '#FFD700', // Main secondary color (Gold/Yellow)
          600: '#fdd835',
          700: '#fbc02d',
          800: '#f9a825',
          900: '#f57f17',
        },
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#2F3E46', // Gunmetal (Dark Gray)
          900: '#1f2937',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      typography: {
        DEFAULT: {
          css: {
            color: '#2F3E46',
            a: {
              color: '#4169e1',
              '&:hover': {
                color: '#1A237E',
              },
            },
            h1: {
              color: '#2F3E46',
            },
            h2: {
              color: '#2F3E46',
            },
            h3: {
              color: '#2F3E46',
            },
            h4: {
              color: '#2F3E46',
            },
          },
        },
      },
    },
  },
  plugins: [],
}

