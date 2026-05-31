import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useI18n } from '../i18n';
import { stripLocale, localizedPath } from '../lib/locale';
import { Globe, ChevronDown } from 'lucide-react';

const languages = [
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  { code: 'ur', name: 'اردو', flag: '🇵🇰' },
  { code: 'id', name: 'Indonesia', flag: '🇮🇩' },
  { code: 'ku', name: 'کوردی', flag: '🟥🟩🟡' },
  { code: 'ms', name: 'Melayu', flag: '🇲🇾' },
];

export default function LanguageSwitcher() {
  const { locale, changeLocale, t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const currentLanguage = languages.find(lang => lang.code === locale) || languages[0];

  const handleLanguageChange = (langCode) => {
    changeLocale(langCode);
    const path = stripLocale(location.pathname);
    navigate(localizedPath(path, langCode));
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 backdrop-blur-lg border border-white/20 hover:bg-white/20 transition-all duration-200"
        aria-label={t.common.language}
      >
        <Globe size={18} />
        <span className="font-medium">{currentLanguage.flag} {currentLanguage.name}</span>
        <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 ${
                  locale === lang.code ? 'bg-emerald-50 text-emerald-600' : 'text-gray-700'
                }`}
              >
                <span className="text-xl">{lang.flag}</span>
                <span className="font-medium">{lang.name}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
