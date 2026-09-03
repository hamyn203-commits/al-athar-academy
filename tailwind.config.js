/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        /* ── الألوان الأساسية ── */
        primary: {
          50: '#f0f7f2', 100: '#dcebe0', 200: '#bad8c3', 300: '#8ebd9c', 400: '#5c9a70',
          500: '#166534', 600: '#14532d', 700: '#113f23', 800: '#0d2f1b', 900: '#0a2114',
        },
        emerald: {
          50: '#f0f7f2', 100: '#dcebe0', 200: '#bad8c3', 300: '#8ebd9c', 400: '#5c9a70',
          500: '#166534', 600: '#14532d', 700: '#113f23', 800: '#0d2f1b', 900: '#0a2114',
        },
        gold: {
          50: '#fdfaf0', 100: '#faf2d9', 200: '#f2e3ad', 300: '#f0c75e', 400: '#d4a843',
          500: '#c9a227', 600: '#a8861f', 700: '#856a18', 800: '#63500f', 900: '#42350a',
        },

        /* ── الألوان الأزهرية ── */
        azhar: {
          'green-deep': '#14532d',
          'green': '#166534',
          'green-mid': '#15803d',
          'green-light': '#22c55e',
          'green-50': '#f0fdf4',
          'gold-leaf': '#d4a843',
          'gold-bright': '#f0c75e',
          'gold-dark': '#8b6914',
          'cream-parchment': '#f5ead0',
          'brown-warm': '#78350f',
          'teal': '#0f766e',
          'teal-light': '#14b8a6',
        },
      },

      fontFamily: {
        arabic: ['Cairo', 'Tajawal', 'sans-serif'],
        english: ['Inter', 'sans-serif'],
        amiri: ['Amiri', 'serif'],
        naskh: ['Noto Naskh Arabic', 'serif'],
        scheherazade: ['Scheherazade New', 'serif'],
      },

      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'bounce-slow': 'bounce 2s infinite',
        'gold-shimmer': 'goldShimmer 4s ease-in-out infinite',
        'star-rotate': 'starRotate 20s linear infinite',
        'gold-pulse': 'goldPulse 2s ease-in-out infinite',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        goldShimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        starRotate: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        goldPulse: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(212, 168, 67, 0.4)' },
          '50%': { boxShadow: '0 0 0 12px rgba(212, 168, 67, 0)' },
        },
      },

      boxShadow: {
        'azhar': '0 4px 24px -4px rgba(20, 83, 45, 0.15)',
        'azhar-lg': '0 20px 50px -12px rgba(20, 83, 45, 0.2)',
        'azhar-gold': '0 8px 32px -4px rgba(212, 168, 67, 0.3)',
        'gold-glow': '0 0 20px rgba(212, 168, 67, 0.3)',
      },
    },
  },
  plugins: [],
}
