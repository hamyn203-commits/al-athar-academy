import { useI18n } from '../i18n';
import { Link, useParams } from 'react-router-dom';
import { localizedPath, DEFAULT_LOCALE } from '../lib/locale';
import {
  Globe, MessageCircle, Camera, Play, Send,
  Mail, Phone, MapPin, ArrowRight,
} from 'lucide-react';
import { SOCIAL_LINKS, CONTACT } from '../config/social';
import BrandLogo from './BrandLogo';

export default function GlobalFooter() {
  const { t, locale } = useI18n();
  const { locale: paramLocale } = useParams();
  const activeLocale = paramLocale || locale || DEFAULT_LOCALE;
  const lp = (path) => localizedPath(path, activeLocale);

  const quickLinks = [
    { to: lp('/courses'), label: t.footer.courses },
    { to: lp('/teachers'), label: t.footer.teachers },
    { to: lp('/library'), label: activeLocale === 'ar' ? 'المكتبة' : 'Library' },
    { to: lp('/leaderboard'), label: activeLocale === 'ar' ? 'البطولة' : 'Leaderboard' },
    { to: lp('/donate'), label: activeLocale === 'ar' ? 'تبرع' : 'Donate' },
    { to: lp('/programs/kids'), label: activeLocale === 'ar' ? 'برنامج الأطفال' : 'Kids' },
    { to: lp('/women'), label: activeLocale === 'ar' ? 'نساء' : 'Women' },
    { to: lp('/app'), label: activeLocale === 'ar' ? 'تطبيق الهاتف' : 'Mobile app' },
    { to: lp('/blog'), label: t.footer.blog },
    { to: lp('/contact'), label: t.footer.contact },
  ];

  const social = [
    { href: SOCIAL_LINKS.facebook, icon: Globe, label: 'Facebook' },
    { href: SOCIAL_LINKS.whatsapp, icon: MessageCircle, label: 'WhatsApp' },
    { href: SOCIAL_LINKS.instagram, icon: Camera, label: 'Instagram' },
    { href: SOCIAL_LINKS.youtube, icon: Play, label: 'YouTube' },
    { href: SOCIAL_LINKS.telegram, icon: Send, label: 'Telegram' },
  ];

  return (
    <footer className="geo-pattern-athar text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--athar-navy)] via-[var(--athar-navy-mid)]/95 to-[var(--athar-navy-mid)]" />
      <div className="relative page-container py-16">
        <div className="h-px w-full max-w-xs mx-auto mb-12 bg-gradient-to-r from-transparent via-[var(--athar-gold)] to-transparent opacity-60" aria-hidden="true" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div>
            <BrandLogo to={lp('/')} showText variant="light" />
            <p className="text-slate-400 leading-relaxed mt-4 mb-6 text-sm max-w-xs">
              {t.footer.aboutText}
            </p>
            <div className="flex gap-3 flex-wrap">
              {social.map(({ href, icon: Icon, label }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                  className="w-10 h-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center hover:bg-[var(--athar-gold)] hover:border-[var(--athar-gold)] hover:text-[var(--athar-navy)] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--athar-gold)]">
                  <Icon size={18} aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--athar-gold-light)] mb-4">{t.footer.quickLinks}</h3>
            <ul className="space-y-2.5">
              {quickLinks.map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="text-slate-400 hover:text-[var(--athar-gold-light)] transition-colors flex items-center gap-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--athar-gold)] rounded">
                    <ArrowRight size={14} className="opacity-50" aria-hidden="true" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--athar-gold-light)] mb-4">{t.footer.support}</h3>
            <ul className="space-y-2.5">
              {[
                { to: lp('/help'), label: t.footer.helpCenter },
                { to: lp('/faq'), label: t.footer.faq },
                { to: lp('/privacy'), label: t.footer.privacy },
                { to: lp('/terms'), label: t.footer.terms },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="text-slate-400 hover:text-[var(--athar-gold-light)] transition-colors flex items-center gap-2 text-sm">
                    <ArrowRight size={14} className="opacity-50" aria-hidden="true" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--athar-gold-light)] mb-4">{t.footer.contactUs}</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <Mail className="text-[var(--athar-gold)] mt-0.5 shrink-0" size={18} aria-hidden="true" />
                <div>
                  <div className="text-slate-500 text-xs">{t.footer.email}</div>
                  <a href={`mailto:${CONTACT.email}`} className="text-white hover:text-[var(--athar-gold-light)] transition-colors">
                    {CONTACT.email}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="text-[var(--athar-gold)] mt-0.5 shrink-0" size={18} aria-hidden="true" />
                <div>
                  <div className="text-slate-500 text-xs">{t.footer.phone}</div>
                  <a href={`tel:${CONTACT.phone.replace(/\s/g, '')}`} className="text-white hover:text-[var(--athar-gold-light)] transition-colors">
                    {CONTACT.phone}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="text-[var(--athar-gold)] mt-0.5 shrink-0" size={18} aria-hidden="true" />
                <div>
                  <div className="text-slate-500 text-xs">{t.footer.address}</div>
                  <span className="text-slate-200">{CONTACT.address}</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
          <p className="text-slate-500">
            © {new Date().getFullYear()} Al-Athar Academy. {t.footer.rights}
          </p>
          <div className="flex gap-6">
            <Link to={lp('/privacy')} className="text-slate-500 hover:text-[var(--athar-gold-light)] transition-colors">
              {t.footer.privacy}
            </Link>
            <Link to={lp('/terms')} className="text-slate-500 hover:text-[var(--athar-gold-light)] transition-colors">
              {t.footer.terms}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
