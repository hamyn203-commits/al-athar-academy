import { useI18n } from '../i18n';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher() {
  const { locale, changeLocale, t } = useI18n();

  const toggleLanguage = () => {
    changeLocale(locale === 'ar' ? 'en' : 'ar');
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 backdrop-blur-lg border border-white/20 hover:bg-white/20 transition-all duration-200"
      aria-label={t.common.language}
    >
      <Globe size={18} />
      <span className="font-medium">
        {locale === 'ar' ? 'EN' : 'عربي'}
      </span>
    </button>
  );
}
