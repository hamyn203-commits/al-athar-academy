import { useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useI18n } from '../i18n';
import { localizedPath, DEFAULT_LOCALE } from '../lib/locale';
import { Menu, X, User, LogIn, Sparkles } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';
import NotificationBell from './NotificationBell';
import UserMenu from './UserMenu';
import { useAuth } from '../hooks/useAuth';

export default function GlobalHeader() {
  const { t } = useI18n();
  const { isAuthenticated } = useAuth();
  const { locale: paramLocale } = useParams();
  const activeLocale = paramLocale || DEFAULT_LOCALE;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const lp = (path) => localizedPath(path, activeLocale);

  const navLinks = [
    { path: lp('/'), label: t.common.home },
    { path: lp('/teachers'), label: t.common.teachers },
    { path: lp('/courses'), label: t.common.courses },
    { path: lp('/ai'), label: 'AI', icon: Sparkles },
    { path: lp('/blog'), label: t.common.blog },
    { path: lp('/about'), label: t.common.about },
    { path: lp('/contact'), label: t.common.contact },
  ];

  const isActive = (path) => location.pathname === path || location.pathname.endsWith(path.replace(`/${activeLocale}`, ''));

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to={lp('/')} className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-600 to-green-600 flex items-center justify-center">
              <span className="text-white font-bold text-xl">أ</span>
            </div>
            <span className="text-xl font-bold text-gray-900">{t.common.appName}</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
              <Link
                key={link.path}
                to={link.path}
                className={`font-medium transition-colors flex items-center gap-1 ${
                  isActive(link.path) ? 'text-emerald-600' : 'text-gray-700 hover:text-emerald-600'
                }`}
              >
                {Icon && <Icon size={14} />}
                {link.label}
              </Link>
            );})}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <LanguageSwitcher />
            {isAuthenticated ? (
              <>
                <NotificationBell />
                <UserMenu locale={activeLocale} />
              </>
            ) : (
              <>
                <Link to={lp('/login')} className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-emerald-600 transition-colors">
                  <LogIn size={18} />
                  {t.common.login}
                </Link>
                <Link to={lp('/register/student')} className="btn-primary flex items-center gap-2">
                  <User size={18} />
                  {t.common.register}
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-700"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`font-medium transition-colors ${isActive(link.path) ? 'text-emerald-600' : 'text-gray-700 hover:text-emerald-600'}`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex flex-col gap-2 pt-4 border-t border-gray-200">
                <LanguageSwitcher />
                {isAuthenticated ? (
                  <>
                    <NotificationBell />
                    <UserMenu locale={activeLocale} />
                  </>
                ) : (
                  <>
                    <Link to={lp('/login')} onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-gray-700">
                      <LogIn size={18} /> {t.common.login}
                    </Link>
                    <Link to={lp('/register/student')} onClick={() => setIsMenuOpen(false)} className="btn-primary flex items-center justify-center gap-2">
                      <User size={18} /> {t.common.register}
                    </Link>
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
