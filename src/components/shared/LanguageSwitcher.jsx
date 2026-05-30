import { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { useAppContext } from '../../context/AppProvider';

export default function LanguageSwitcher({ compact = false }) {
  const { currentLang, changeLanguage, languages } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentLanguage = languages[currentLang];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (langCode) => {
    changeLanguage(langCode);
    setIsOpen(false);
  };

  if (compact) {
    return (
      <div className="lang-switcher" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="lang-btn-compact"
          aria-label="Select language"
          aria-expanded={isOpen}
        >
          <span className="lang-flag">{currentLanguage.flag}</span>
          <ChevronDown size={14} style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
        </button>
        
        {isOpen && (
          <div className="lang-dropdown">
            {Object.values(languages).map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleSelect(lang.code)}
                className={`lang-option ${currentLang === lang.code ? 'active' : ''}`}
              >
                <span className="lang-flag">{lang.flag}</span>
                <span className="lang-name">{lang.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="lang-switcher" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lang-btn"
        aria-label="Select language"
        aria-expanded={isOpen}
      >
        <Globe size={16} />
        <span className="lang-flag">{currentLanguage.flag}</span>
        <span className="lang-label">{currentLanguage.name}</span>
        <ChevronDown size={14} style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
      </button>
      
      {isOpen && (
        <div className="lang-dropdown">
          {Object.values(languages).map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleSelect(lang.code)}
              className={`lang-option ${currentLang === lang.code ? 'active' : ''}`}
            >
              <span className="lang-flag">{lang.flag}</span>
              <span className="lang-name">{lang.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
