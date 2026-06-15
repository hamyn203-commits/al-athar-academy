import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useI18n } from '../../i18n';

export default function ThemeToggle() {
  const { locale } = useI18n();
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('academy_theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    localStorage.setItem('academy_theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  return (
    <button
      onClick={() => setIsDark(!isDark)}
      className="rounded-lg p-2 text-slate-600 hover:text-[var(--azhar-green-deep)] hover:bg-[var(--athar-cream)] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600"
      aria-label={
        isDark
          ? (locale === 'ar' ? 'التبديل للوضع الفاتح' : locale === 'tr' ? 'Açık moda geç' : locale === 'id' || locale === 'ms' ? 'Beralih ke mode terang' : locale === 'ur' ? 'روشن موڈ پر جائیں' : locale === 'fr' ? 'Passer en mode clair' : locale === 'de' ? 'Hellen Modus aktivieren' : 'Switch to light mode')
          : (locale === 'ar' ? 'التبديل للوضع الليلي' : locale === 'tr' ? 'Karanlık moda geç' : locale === 'id' || locale === 'ms' ? 'Beralih ke mode gelap' : locale === 'ur' ? 'تاریک موڈ پر جائیں' : locale === 'fr' ? 'Passer en mode sombre' : locale === 'de' ? 'Dunklen Modus aktivieren' : 'Switch to dark mode')
      }
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
