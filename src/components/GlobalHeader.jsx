import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useI18n } from '../i18n';
import { Menu, X, User, LogIn } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';

export default function GlobalHeader() {
  const { t } = useI18n();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { path: '/', label: t.common.home },
    { path: '/teachers', label: t.common.teachers },
    { path: '/courses', label: t.common.courses },
    { path: '/blog', label: t.common.blog },
    { path: '/contact', label: t.common.contact },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-600 to-green-600 flex items-center justify-center">
              <span className="text-white font-bold text-xl">أ</span>
            </div>
            <span className="text-xl font-bold text-gray-900">
              {t.common.appName}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`font-medium transition-colors ${
                  isActive(link.path)
                    ? 'text-emerald-600'
                    : 'text-gray-700 hover:text-emerald-600'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <LanguageSwitcher />
            <Link
              to="/login"
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-emerald-600 transition-colors"
            >
              <LogIn size={18} />
              {t.common.login}
            </Link>
            <Link
              to="/student"
              className="btn-primary flex items-center gap-2"
            >
              <User size={18} />
              {t.common.register}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-700"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`font-medium transition-colors ${
                    isActive(link.path)
                      ? 'text-emerald-600'
                      : 'text-gray-700 hover:text-emerald-600'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex flex-col gap-2 pt-4 border-t border-gray-200">
                <LanguageSwitcher />
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-emerald-600 transition-colors"
                >
                  <LogIn size={18} />
                  {t.common.login}
                </Link>
                <Link
                  to="/student"
                  onClick={() => setIsMenuOpen(false)}
                  className="btn-primary flex items-center justify-center gap-2"
                >
                  <User size={18} />
                  {t.common.register}
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
