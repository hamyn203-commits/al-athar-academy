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

        /* ── ملاحظة معمارية: ممنوع تكرار الألوان الأزهرية هنا ──────────────
           الألوان الأزهرية (azhar-green, gold-leaf, teal, cream-parchment …)
           معرّفة كمتغيّرات CSS في src/styles/brand.css، ولكل واحدة منها نسخة
           خاصة بالوضع الليلي تحت [data-theme="dark"].

           قيم Tailwind ثابتة وقت البناء ولا تعرف شيئاً عن الوضع الليلي، فلو
           عرّفناها هنا فكلاس مثل bg-azhar-green سيبقى بنفس اللون في الليل.

           الاستخدام الصحيح:
             bg-[var(--azhar-green)]     أو    كلاس جاهز من brand.css
           ──────────────────────────────────────────────────────────────── */
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
        /* الحركات الأزهرية (goldShimmer / starRotate / goldPulse) معرّفة في
           brand.css، وبلوك prefers-reduced-motion هناك يوقفها احتراماً
           لإعدادات المستخدم. تكرارها هنا يتجاوز ذلك الحماية — لا تضفها. */
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
      },

      /* الظلال الأزهرية متغيّرات في brand.css:
         var(--shadow-azhar) / var(--shadow-azhar-lg) / var(--shadow-azhar-gold)
         لا تُكرّر هنا كـ shadow-azhar وأخواتها. */
    },
  },
  plugins: [],
}
