import React, { useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useI18n } from '../i18n';
import { localizedPath, DEFAULT_LOCALE } from '../lib/locale';
import { Menu, X, ArrowLeft, ArrowRight, Sparkles, Search } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';
import NotificationBell from './NotificationBell';
import UserMenu from './UserMenu';
import BrandLogo from './BrandLogo';
import ThemeToggle from './shared/ThemeToggle';
import { useAuth } from '../hooks/useAuth';

export default function GlobalHeader() {
  const { t, locale } = useI18n();
  const isAr = locale === 'ar';
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;
  const { isAuthenticated } = useAuth();
  const { locale: paramLocale } = useParams();
  const activeLocale = paramLocale || DEFAULT_LOCALE;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const lp = (path) => localizedPath(path, activeLocale);

  const navLinks = [
    { path: lp('/'), label: isAr ? 'الرئيسية' : 'Home' },
    { path: lp('/about'), label: isAr ? 'عن الأكاديمية' : 'About' },
    { path: lp('/courses'), label: isAr ? 'البرامج' : 'Programs' },
    { path: lp('/teachers'), label: isAr ? 'المعلمون' : 'Teachers' },
    { path: lp('/tracks'), label: isAr ? 'المسارات' : 'Tracks' },
    { path: lp('/blog'), label: isAr ? 'المدونة' : 'Blog' },
    { path: lp('/contact'), label: isAr ? 'اتصل بنا' : 'Contact' },
  ];

  const isActive = (path) => {
    if (path === lp('/') || path === `/${activeLocale}` || path === `/${activeLocale}/`) {
      return location.pathname === path || location.pathname === `/${activeLocale}`;
    }
    return location.pathname === path || location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#f7f4ed]/95 backdrop-blur-md border-b border-[#e7decb] transition-colors">
      <div className="page-container">
        <div className="flex h-20 items-center justify-between gap-4">
          
          {/* ═══ الشعار الرسمي — وَحْيٌ وَنَمَاء ═══ */}
          <div className="flex items-center gap-3">
            <BrandLogo to={lp('/')} size="md" />
          </div>

          {/* ═══ شريط التنقل الرئيسي — مينيمال دولي راقٍ ═══ */}
          <nav className="hidden lg:flex items-center gap-7" aria-label="Main Navigation">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative py-2 text-sm font-semibold tracking-wide transition-colors ${
                    active
                      ? 'text-[#0e382b] font-bold'
                      : 'text-[#4e5852] hover:text-[#0e382b]'
                  }`}
                >
                  <span>{link.label}</span>
                  {active && (
                    <span
                      className="absolute bottom-0 inset-x-0 h-[2px] bg-[#c5a059] rounded-full"
                      aria-hidden="true"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* ═══ الإجراءات — اللغة والحساب والدعوة للعمل ═══ */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            <LanguageSwitcher />

            {isAuthenticated ? (
              <>
                <NotificationBell />
                <UserMenu locale={activeLocale} />
              </>
            ) : (
              <>
                <Link
                  to={lp('/login')}
                  className="rounded-full px-4 py-2 text-sm font-bold text-[#0e382b] hover:bg-black/5 transition"
                >
                  {t.common.login}
                </Link>
                <Link
                  to={lp('/free-trial')}
                  className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-bold text-white bg-[#0e382b] hover:bg-[#14533e] shadow-sm hover:shadow-md transition-all duration-200 group"
                >
                  <span>{isAr ? 'ابدأ رحلتك' : 'Join Now'}</span>
                  <ArrowIcon size={15} className="transition-transform group-hover:translate-x-[-2px] rtl:group-hover:translate-x-[-2px] ltr:group-hover:translate-x-[2px]" />
                </Link>
              </>
            )}
          </div>

          {/* زر قائمة الموبايل */}
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden rounded-xl p-2 text-[#0e382b] hover:bg-black/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0e382b]"
            aria-label={isMenuOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

        </div>

        {/* ═══ القائمة المنسدلة للهواتف ═══ */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-[#e7decb] py-5 px-2 bg-[#f7f4ed]">
            <nav className="flex flex-col gap-2">
              <Link
                to={lp('/free-trial')}
                onClick={() => setIsMenuOpen(false)}
                className="w-full mb-3 rounded-full p-3 text-sm font-bold flex items-center justify-between text-white bg-[#0e382b] shadow-md"
              >
                <span>{isAr ? 'ابدأ رحلتك (حصة تجريبية مجانية)' : 'Start Your Journey (Free Trial)'}</span>
                <ArrowIcon size={16} />
              </Link>

              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`rounded-xl px-4 py-3 text-sm font-semibold flex items-center justify-between transition ${
                    isActive(link.path)
                      ? 'bg-[#0e382b]/10 text-[#0e382b] font-bold'
                      : 'text-[#4e5852] hover:bg-black/5'
                  }`}
                >
                  <span>{link.label}</span>
                  {isActive(link.path) && <span className="w-1.5 h-1.5 rounded-full bg-[#c5a059]" />}
                </Link>
              ))}

              <div className="mt-4 pt-4 border-t border-[#e7decb] flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <ThemeToggle />
                  <LanguageSwitcher />
                </div>
                {!isAuthenticated && (
                  <Link
                    to={lp('/login')}
                    onClick={() => setIsMenuOpen(false)}
                    className="px-4 py-2 text-sm font-bold text-[#0e382b]"
                  >
                    {t.common.login}
                  </Link>
                )}
              </div>
            </nav>
          </div>
        )}

      </div>
    </header>
  );
}
