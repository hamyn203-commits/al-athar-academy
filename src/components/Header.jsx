import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Users, Menu, X } from 'lucide-react';
import Logo from './Logo';
import LanguageSwitcher from './shared/LanguageSwitcher';
import ThemeToggle from './shared/ThemeToggle';
import { useAppContext } from '../context/AppProvider';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { t } = useAppContext();

  const navLinks = [
    { href: '/#about', label: t.header.about },
    { href: '/#sheikhs', label: t.header.sheikhs },
    { href: '/#honors', label: t.header.honors },
    { href: '/#contact', label: t.header.contact },
  ];

  return (
    <>
      <div style={{
        background: 'linear-gradient(90deg, var(--primary-gold-dark), var(--clay-terracotta))',
        color: '#fff',
        textAlign: 'center',
        padding: '8px',
        fontSize: '0.82rem',
        fontWeight: '600',
        letterSpacing: '0.3px',
      }}>
        {t.header.developedBy}
      </div>
      <header className="glass-card animate-fade" style={{
        margin: '16px auto',
        width: '95%',
        maxWidth: '1200px',
        borderRadius: 'var(--radius-lg)',
        position: 'sticky',
        top: '16px',
        zIndex: 100,
        padding: '12px 24px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link to="/" aria-label="الصفحة الرئيسية">
            <Logo size={48} />
          </Link>

          <nav style={{ display: 'flex', gap: '28px', alignItems: 'center' }} className="desktop-only" aria-label="التنقل الرئيسي">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className="nav-hover" style={{ fontWeight: '500', color: 'var(--text-secondary)' }}>
                {link.label}
              </a>
            ))}
          </nav>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }} className="desktop-only">
            <ThemeToggle />
            <LanguageSwitcher compact />
            <button onClick={() => navigate('/student')} className="btn-premium-outline" style={{ padding: '8px 20px', fontSize: '0.88rem' }} aria-label={t.header.studentPortal}>
              <User size={16} /> {t.header.studentPortal}
            </button>
            <button onClick={() => navigate('/teacher')} className="btn-premium" style={{ padding: '8px 20px', fontSize: '0.88rem' }} aria-label={t.header.teacherPortal}>
              <Users size={16} /> {t.header.teacherPortal}
            </button>
          </div>

          <button
            className="mobile-only"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
            aria-expanded={mobileMenuOpen}
            style={{ background: 'none', border: 'none', color: 'var(--primary-gold)', cursor: 'pointer', padding: '4px' }}
          >
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <nav className="mobile-only animate-fade" style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            marginTop: '20px',
            padding: '16px 0',
            borderTop: '1px solid var(--border-light)',
          }} aria-label="التنقل للجوال">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} onClick={() => setMobileMenuOpen(false)} style={{ fontWeight: 500, padding: '4px 0' }}>
                {link.label}
              </a>
            ))}
            <hr style={{ border: 'none', borderTop: '1px solid var(--border-light)' }} />
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '8px' }}>
              <ThemeToggle />
              <LanguageSwitcher />
            </div>
            <button onClick={() => { navigate('/student'); setMobileMenuOpen(false); }} className="btn-premium-outline" style={{ justifyContent: 'center' }}>
              <User size={16} /> {t.header.studentPortal}
            </button>
            <button onClick={() => { navigate('/teacher'); setMobileMenuOpen(false); }} className="btn-premium" style={{ justifyContent: 'center' }}>
              <Users size={16} /> {t.header.teacherPortal}
            </button>
          </nav>
        )}
      </header>
    </>
  );
}
