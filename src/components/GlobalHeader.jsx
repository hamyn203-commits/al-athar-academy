import { useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useI18n } from '../i18n';
import { localizedPath, DEFAULT_LOCALE } from '../lib/locale';
import { Menu, X, LogIn, Sparkles } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';
import NotificationBell from './NotificationBell';
import UserMenu from './UserMenu';
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
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="page-container">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link to={lp('/')} className="flex items-center gap-2.5 shrink-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-sm font-bold text-white shadow-sm">
              أ
            </div>
            <div className="leading-tight">
              <span className="block text-sm font-semibold tracking-tight text-slate-900">{t.common.appName}</span>
              <span className="hidden text-[10px] text-slate-500 sm:block">{t.common.slogan}</span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50/80 p-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                    active ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600 hover:text-emerald-700'
                  }`}
                >
                  {Icon && <Icon size={14} strokeWidth={1.5} />}
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            <LanguageSwitcher />
            {isAuthenticated ? (
              <>
                <NotificationBell />
                <UserMenu locale={activeLocale} />
              </>
            ) : (
              <>
                <Link to={lp('/login')} className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:text-emerald-700">
                  {t.common.login}
                </Link>
                <Link to={lp('/register/student')} className="btn-primary !py-2 !px-4 text-sm">
                  {t.common.register}
                </Link>
              </>
            )}
          </div>

          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden rounded-lg p-2 text-slate-700" aria-label="Menu">
            {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden border-t border-slate-100 py-4">
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link key={link.path} to={link.path} onClick={() => setIsMenuOpen(false)}
                  className={`rounded-lg px-3 py-2.5 text-sm font-medium ${isActive(link.path) ? 'bg-emerald-50 text-emerald-700' : 'text-slate-700'}`}>
                  {link.label}
                </Link>
              ))}
              <Link to={lp('/app')} onClick={() => setIsMenuOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-emerald-700">
                {locale === 'ar' ? 'تطبيق الهاتف' : 'Mobile app'}
              </Link>
              <div className="mt-3 flex flex-col gap-2 border-t border-slate-100 pt-3">
                <LanguageSwitcher />
                {isAuthenticated ? (
                  <><NotificationBell /><UserMenu locale={activeLocale} /></>
                ) : (
                  <>
                    <Link to={lp('/login')} className="px-3 py-2 text-sm">{t.common.login}</Link>
                    <Link to={lp('/register/student')} className="btn-primary mx-3">{t.common.register}</Link>
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
