/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      animation: {
        'scale-in': 'scaleIn 4s ease-in-out forwards',
        'fade-out': 'fadeOut 4s ease-in-out forwards',
        'letter-spacing': 'letterSpacing 4s ease-in-out forwards',
        'loading-bounce': 'loadingBounce 4s ease-in-out infinite',
      },
      keyframes: {
        scaleIn: {
          '0%': { transform: 'scale(1)', opacity: '0' },
          '30%': { transform: 'scale(1.1)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        },
        fadeOut: {
          '0%': { opacity: '0' },
          '20%': { opacity: '1' },
          '80%': { opacity: '1' },
          '100%': { opacity: '0' }
        },
        letterSpacing: {
          '0%': { letterSpacing: '0em' },
          '30%': { letterSpacing: '0.15em' },
          '100%': { letterSpacing: '0.1em' }
        },
        loadingBounce: {
          '0%, 100%': { transform: 'translateX(0)' },
          '50%': { transform: 'translateX(200%)' }
        }
      },
      colors: {
        'brand-primary': '#E0B0FF',
        'brand-secondary': '#C8A2C8',
        'brand-light': '#1a1a1a'
      }
    },
  },
  plugins: [],
};