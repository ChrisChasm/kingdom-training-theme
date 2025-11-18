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
        // Primary: Teal (#2dbaba)
        primary: {
          50: '#e0f7f7',
          100: '#b3eeee',
          200: '#80e3e3',
          300: '#4dd8d8',
          400: '#26d0d0',
          500: '#2dbaba', // Main primary color (Teal)
          600: '#28a7a7',
          700: '#229393',
          800: '#1c7f7f',
          900: '#115d5d',
        },
        // Secondary: Navy / Deep Blue (#264653, #235e7d)
        secondary: {
          50: '#e8f0f2',
          100: '#c5d9df',
          200: '#9ebfc9',
          300: '#77a5b3',
          400: '#5991a3',
          500: '#3b7d93', // Base navy
          600: '#357185',
          700: '#2d6275',
          800: '#235e7d', // Deep blue variant
          900: '#264653', // Main secondary color (Navy)
        },
        // Accent: Mustard Yellow (#ffcc00, #ffd166)
        accent: {
          50: '#fffef0',
          100: '#fffce0',
          200: '#fff9c4',
          300: '#fff59d',
          400: '#fff176',
          500: '#ffd166', // Main accent color
          600: '#ffcc00', // Vibrant mustard
          700: '#e6b800',
          800: '#cc9900',
          900: '#b38600',
        },
        // Background: Soft Light/Cream (#f4f7f6, #e2f1ee)
        background: {
          50: '#f4f7f6', // Soft light
          100: '#e2f1ee', // Cream
          200: '#d0ebe6',
          300: '#bee5de',
          400: '#acdfd6',
          500: '#9ad9ce',
        },
        // Support: Gunmetal Gray (#2f3e46)
        gray: {
          50: '#f4f7f6',
          100: '#e2f1ee',
          200: '#d0e5e0',
          300: '#b8d4cd',
          400: '#9fb3ad',
          500: '#7a8d87',
          600: '#5d6d67',
          700: '#45504b',
          800: '#2f3e46', // Gunmetal (Support color)
          900: '#1f282c',
        },
        // Success: Vivid Green
        success: {
          50: '#d1fae5',
          100: '#a7f5cb',
          200: '#7defb1',
          300: '#53e997',
          400: '#42e695',
          500: '#27ae60',
          600: '#229d55',
          700: '#1d8b4a',
          800: '#18793f',
          900: '#0f5729',
        },
        // Warning: Amber/Yellow
        warning: {
          50: '#fffef0',
          100: '#fff78c',
          200: '#fde68a',
          300: '#fcdd78',
          400: '#ffd166',
          500: '#ffcc00',
          600: '#ffb74d',
          700: '#ffa726',
          800: '#ff9800',
          900: '#f57c00',
        },
        // Error: Vibrant Red
        error: {
          50: '#fde8e8',
          100: '#fbc5c5',
          200: '#f99e9e',
          300: '#f77777',
          400: '#f55959',
          500: '#ff5151',
          600: '#e74c3c',
          700: '#d32f2f',
          800: '#c62828',
          900: '#b71c1c',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      typography: {
        DEFAULT: {
          css: {
            color: '#2f3e46',
            maxWidth: 'none',
            fontSize: '1.125rem',
            lineHeight: '1.75',
            p: {
              marginTop: '1.25em',
              marginBottom: '1.25em',
            },
            h1: {
              color: '#2f3e46',
              fontSize: '2.25em',
              fontWeight: '700',
              lineHeight: '1.2',
              marginTop: '0',
              marginBottom: '0.8888889em',
            },
            h2: {
              color: '#2f3e46',
              fontSize: '1.875em',
              fontWeight: '700',
              lineHeight: '1.3333333',
              marginTop: '2em',
              marginBottom: '1em',
            },
            h3: {
              color: '#2f3e46',
              fontSize: '1.5em',
              fontWeight: '600',
              lineHeight: '1.6',
              marginTop: '1.6em',
              marginBottom: '0.6em',
            },
            h4: {
              color: '#2f3e46',
              fontSize: '1.25em',
              fontWeight: '600',
              lineHeight: '1.6',
              marginTop: '1.5em',
              marginBottom: '0.5em',
            },
            strong: {
              fontWeight: '700',
              color: '#2f3e46',
            },
            b: {
              fontWeight: '700',
              color: '#2f3e46',
            },
            a: {
              color: '#2dbaba',
              textDecoration: 'none',
              fontWeight: '500',
              '&:hover': {
                color: '#229393',
                textDecoration: 'underline',
              },
            },
            ul: {
              marginTop: '1.25em',
              marginBottom: '1.25em',
              paddingLeft: '1.625em',
            },
            ol: {
              marginTop: '1.25em',
              marginBottom: '1.25em',
              paddingLeft: '1.625em',
            },
            li: {
              marginTop: '0.5em',
              marginBottom: '0.5em',
            },
            blockquote: {
              fontWeight: '500',
              fontStyle: 'italic',
              color: '#2f3e46',
              borderLeftWidth: '0.25rem',
              borderLeftColor: '#2dbaba',
              quotes: '"\\201C""\\201D""\\2018""\\2019"',
              marginTop: '1.6em',
              marginBottom: '1.6em',
              paddingLeft: '1em',
            },
            code: {
              color: '#2f3e46',
              fontWeight: '600',
              fontSize: '0.875em',
              backgroundColor: '#f4f7f6',
              padding: '0.125rem 0.375rem',
              borderRadius: '0.25rem',
            },
            pre: {
              color: '#2f3e46',
              backgroundColor: '#f4f7f6',
              overflowX: 'auto',
              fontSize: '0.875em',
              lineHeight: '1.7142857',
              marginTop: '1.7142857em',
              marginBottom: '1.7142857em',
              borderRadius: '0.375rem',
              paddingTop: '0.8571429em',
              paddingRight: '1.1428571em',
              paddingBottom: '0.8571429em',
              paddingLeft: '1.1428571em',
            },
            img: {
              marginTop: '2em',
              marginBottom: '2em',
            },
          },
        },
      },
    },
  },
  plugins: [],
}

