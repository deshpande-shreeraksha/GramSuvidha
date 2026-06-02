/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0F4B70',
        'primary-dark': '#0a344f',
        'primary-light': '#C4F8FF',
        background: '#f4fbfd',
        surface: '#ffffff',
        text: '#0b2a3f',
        muted: '#527c95',
        gov: {
          blue: '#0F4B70',
          primary: '#0F4B70',
          saffron: '#C4F8FF',
          green: '#0F4B70',
          bg: '#f4fbfd',
          text: '#0b2a3f',
          muted: '#527c95'
        }
      },
      fontFamily: {
        sans: ['"Montserrat"', 'sans-serif'],
        display: ['"Cinzel"', 'serif'],
        serif: ['"Playfair Display"', 'serif'],
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'scale-in': 'scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'slide-up': 'slideUp 0.4s ease-out forwards',
      }
    },
  },
  plugins: [],
}
