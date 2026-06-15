import { useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useI18n } from '../i18n';
import { localizedPath, DEFAULT_LOCALE } from '../lib/locale';
import { Menu, X, Sparkles, Star } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';
import NotificationBell from './NotificationBell';
import UserMenu from './UserMenu';
import BrandLogo from './BrandLogo';
import ThemeToggle from './shared/ThemeToggle';
import { useAuth } from '../hooks/useAuth';

export default function GlobalHeader() {
  const { t, locale } = useI18n();
  const { isAuthenticated } = useAuth();
  const { locale: paramLocale } = useParams();
  const activeLocale = paramLocale || DEFAULT_LOCALE;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const lp = (path) => localizedPath(path, activeLocale);

  const navLinks = [
    { path: lp('/teachers'), label: t.common.teachers },
    { path: lp('/courses'), label: t.common.courses },
    { path: lp('/ai'), label: 'AI', icon: Sparkles },
    { path: lp('/library'), label: locale === 'ar' ? 'المكتبة' : 'Library' },
    { path: lp('/leaderboard'), label: locale === 'ar' ? 'البطولة' : 'Leaderboard' },
    { path: lp('/donate'), label: locale === 'ar' ? 'تبرع' : 'Donate' },
    { path: lp('/blog'), label: t.common.blog },
    { path: lp('/about'), label: t.common.about },
  ];

  const isActive = (path) =>
    location.pathname === path || location.pathname.endsWith(path.replace(`/${activeLocale}`, ''));

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--athar-cream-dark)] bg-white/95 backdrop-blur-xl shadow-sm">
      {/* ═══ الخط الأزهري العلوي — ذهبي مزخرف ═══ */}
      <div className="h-1 w-full bg-gradient-to-r from-[var(--azhar-gold-dark)] via-[var(--azhar-gold-leaf)] to-[var(--azhar-gold-dark)]" aria-hidden="true" />

      {/* ═══ نمط هندسي إسلامي خفيف على الخلفية ═══ */}
      <div className="absolute inset-0 azhar-star-pattern opacity-30 pointer-events-none" aria-hidden="true" />

      <div className="page-container relative">
        <div className="flex h-16 items-center justify-between gap-4">
          <BrandLogo to={lp('/')} size="md" />

          {/* ═══ شريط التنقل — أزهري ═══ */}
          <nav className="hidden lg:flex items-center gap-1 rounded-full border-2 border-[var(--azhar-gold-leaf)]/30 bg-[var(--athar-cream)]/80 p-1" aria-label="Main">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600 ${
                    active
                      ? 'bg-white text-[var(--azhar-green-deep)] shadow-sm ring-2 ring-[var(--azhar-gold-leaf)]/40 shadow-azhar-gold/20'
                      : 'text-slate-600 hover:text-[var(--azhar-green-deep)] hover:bg-white/50'
                  }`}
                >
                  {Icon && <Icon size={14} strokeWidth={1.5} aria-hidden="true" />}
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden md:flex items-center gap-1">
            <ThemeToggle />
            <LanguageSwitcher />
            {isAuthenticated ? (
              <>
                <NotificationBell />
                <UserMenu locale={activeLocale} />
              </>
            ) : (
              <>
                <Link to={lp('/login')} className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:text-[var(--azhar-green-deep)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600 transition">
                  {t.common.login}
                </Link>
                <Link to={lp('/register/student')} className="btn-primary !py-2 !px-4 text-sm">
                  {t.common.register}
                </Link>
              </>
            )}
          </div>

          <button type="button" onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden rounded-lg p-2 text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600" aria-label={isMenuOpen ? (locale === 'id' ? 'Tutup menu' : locale === 'ar' ? 'إغلاق القائمة' : 'Close menu') : (locale === 'id' ? 'Buka menu' : locale === 'ar' ? 'فتح القائمة' : 'Open menu')} aria-expanded={isMenuOpen}>
            {isMenuOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
          </button>
        </div>

        {/* ═══ القائمة المنسدلة — أزهرية ═══ */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-[var(--azhar-gold-leaf)]/20 py-4 relative">
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link key={link.path} to={link.path} onClick={() => setIsMenuOpen(false)}
                  className={`rounded-lg px-3 py-2.5 text-sm font-medium flex items-center gap-2 ${isActive(link.path) ? 'bg-[var(--azhar-green-50)] text-[var(--azhar-green-deep)] ring-1 ring-[var(--azhar-gold-leaf)]/30' : 'text-slate-700 hover:bg-[var(--azhar-gold-50)]'}`}>
                  {link.icon && <link.icon size={16} />}
                  {link.label}
                </Link>
              ))}
              <Link to={lp('/app')} onClick={() => setIsMenuOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--azhar-gold-dark)] flex items-center gap-2">
                <Star size={16} />
                {locale === 'ar' ? 'تطبيق الهاتف' : 'Mobile app'}
              </Link>
              <div className="mt-3 flex flex-col gap-2 border-t border-[var(--azhar-gold-leaf)]/20 pt-3">
                <div className="flex items-center gap-2 px-3">
                  <ThemeToggle />
                  <LanguageSwitcher />
                </div>
                {isAuthenticated ? (
                  <><NotificationBell /><UserMenu locale={activeLocale} /></>
                ) : (
                  <>
                    <Link to={lp('/login')} onClick={() => setIsMenuOpen(false)} className="px-3 py-2 text-sm text-slate-700 hover:text-[var(--azhar-green-deep)]">{t.common.login}</Link>
                    <Link to={lp('/register/student')} onClick={() => setIsMenuOpen(false)} className="btn-primary mx-3">{t.common.register}</Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
