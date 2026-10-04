/** @type {import('tailwindcss').Config} */
/*
 * Wahy Wa Namaa — Tailwind bridge.
 * Brand colours live in src/styles/brand.css (single source of truth).
 *  • `wn-*` colours map straight to CSS variables (theme-aware, opacity
 *    modifiers like bg-wn-emerald/10 work via color-mix).
 *  • `emerald` / `primary` / `teal` / `gold` scales are derived from the
 *    approved palette so existing dashboard classes inherit the identity.
 */
const emerald = {
  50: '#eef7f3', 100: '#d8ede6', 200: '#b1dbcb', 300: '#7fc0a9', 400: '#3f9a7b',
  500: '#148060', 600: '#0f6b4f', 700: '#0c5a42', 800: '#0a4a37', 900: '#073528', 950: '#04241b',
};

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        wn: {
          emerald: 'var(--wn-emerald)',
          'emerald-dark': 'var(--wn-emerald-dark)',
          'emerald-deep': 'var(--wn-emerald-deep)',
          'emerald-hover': 'var(--wn-emerald-hover)',
          'emerald-soft': 'var(--wn-emerald-soft)',
          teal: 'var(--wn-teal)',
          'teal-dark': 'var(--wn-teal-dark)',
          mint: 'var(--wn-mint)',
          'mint-soft': 'var(--wn-mint-soft)',
          ivory: 'var(--wn-ivory)',
          'ivory-deep': 'var(--wn-ivory-deep)',
          gold: 'var(--wn-gold)',
          'gold-dark': 'var(--wn-gold-dark)',
          'gold-soft': 'var(--wn-gold-soft)',
          sand: 'var(--wn-sand)',
          text: 'var(--wn-text-primary)',
          muted: 'var(--wn-text-secondary)',
          subtle: 'var(--wn-text-tertiary)',
          heading: 'var(--wn-heading)',
          inverse: 'var(--wn-text-inverse)',
          bg: 'var(--wn-bg)',
          surface: 'var(--wn-surface)',
          'surface-soft': 'var(--wn-surface-soft)',
          'surface-mint': 'var(--wn-surface-mint)',
          'surface-sunken': 'var(--wn-surface-sunken)',
          border: 'var(--wn-border)',
          'border-strong': 'var(--wn-border-strong)',
          'border-mint': 'var(--wn-border-mint)',
          danger: 'var(--wn-danger)',
        },
        primary: emerald,
        emerald,
        teal: {
          50: '#effaf8', 100: '#d6f0eb', 200: '#b0e1d8', 300: '#82cdc1', 400: '#56b3a6',
          500: '#3c998c', 600: '#2f8a7d', 700: '#276f65', 800: '#225a53', 900: '#1e4b45',
        },
        gold: {
          50: '#fbf7ee', 100: '#f6eedb', 200: '#ecdcb6', 300: '#e2c88f', 400: '#d4af6b',
          500: '#c3964a', 600: '#a87c37', 700: '#8f6b2a', 800: '#6f5222', 900: '#57411d',
        },
      },

      fontFamily: {
        sans: ['var(--wn-font-ui)'],
        display: ['var(--wn-font-display)'],
        arabic: ['IBM Plex Sans Arabic', 'system-ui', 'sans-serif'],
        english: ['Manrope', 'system-ui', 'sans-serif'],
        naskh: ['Noto Naskh Arabic', 'serif'],
        amiri: ['Amiri', 'serif'],
        quran: ['Amiri', 'Noto Naskh Arabic', 'serif'],
        playfair: ['Playfair Display', 'Georgia', 'serif'],
      },

      borderRadius: {
        'wn-sm': 'var(--wn-radius-sm)',
        'wn-md': 'var(--wn-radius-md)',
        'wn-lg': 'var(--wn-radius-lg)',
        'wn-xl': 'var(--wn-radius-xl)',
      },

      boxShadow: {
        'wn-xs': 'var(--wn-shadow-xs)',
        'wn-sm': 'var(--wn-shadow-sm)',
        'wn-md': 'var(--wn-shadow-md)',
        'wn-lg': 'var(--wn-shadow-lg)',
        'wn-gold': 'var(--wn-shadow-gold)',
      },

      maxWidth: {
        'wn-container': 'var(--wn-container)',
        'wn-narrow': 'var(--wn-container-narrow)',
      },

      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.35s ease-out',
        'slide-down': 'slideDown 0.35s ease-out',
        'scale-in': 'scaleIn 0.25s ease-out',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(12px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-12px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.96)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
