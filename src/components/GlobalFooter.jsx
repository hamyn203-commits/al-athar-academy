import { useI18n } from '../i18n';
import { Link } from 'react-router-dom';
import {
  Globe, MessageCircle, Camera, Play, Send,
  Mail, Phone, MapPin, ArrowRight,
} from 'lucide-react';
import { SOCIAL_LINKS, CONTACT } from '../config/social';

export default function GlobalFooter() {
  const { t } = useI18n();

  const social = [
    { href: SOCIAL_LINKS.facebook, icon: Globe, label: 'Facebook' },
    { href: SOCIAL_LINKS.whatsapp, icon: MessageCircle, label: 'WhatsApp' },
    { href: SOCIAL_LINKS.instagram, icon: Camera, label: 'Instagram' },
    { href: SOCIAL_LINKS.youtube, icon: Play, label: 'YouTube' },
    { href: SOCIAL_LINKS.telegram, icon: Send, label: 'Telegram' },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div>
            <h3 className="text-xl font-bold mb-4">{t.footer.about}</h3>
            <p className="text-gray-400 leading-relaxed mb-6">
              {t.footer.aboutText}
            </p>
            <div className="flex gap-3 flex-wrap">
              {social.map(({ href, icon: Icon, label }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-emerald-600 transition-colors">
                  <Icon size={20} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">{t.footer.quickLinks}</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/courses" className="text-gray-400 hover:text-emerald-400 transition-colors flex items-center gap-2">
                  <ArrowRight size={16} />
                  {t.footer.courses}
                </Link>
              </li>
              <li>
                <Link to="/teachers" className="text-gray-400 hover:text-emerald-400 transition-colors flex items-center gap-2">
                  <ArrowRight size={16} />
                  {t.footer.teachers}
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-gray-400 hover:text-emerald-400 transition-colors flex items-center gap-2">
                  <ArrowRight size={16} />
                  {t.footer.blog}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-emerald-400 transition-colors flex items-center gap-2">
                  <ArrowRight size={16} />
                  {t.footer.contact}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">{t.footer.support}</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/help" className="text-gray-400 hover:text-emerald-400 transition-colors flex items-center gap-2">
                  <ArrowRight size={16} />
                  {t.footer.helpCenter}
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-400 hover:text-emerald-400 transition-colors flex items-center gap-2">
                  <ArrowRight size={16} />
                  {t.footer.faq}
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-400 hover:text-emerald-400 transition-colors flex items-center gap-2">
                  <ArrowRight size={16} />
                  {t.footer.privacy}
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-400 hover:text-emerald-400 transition-colors flex items-center gap-2">
                  <ArrowRight size={16} />
                  {t.footer.terms}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">{t.footer.contactUs}</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Mail className="text-emerald-400 mt-1" size={20} />
                <div>
                  <div className="text-gray-400 text-sm">{t.footer.email}</div>
                  <a href={`mailto:${CONTACT.email}`} className="text-white hover:text-emerald-400 transition-colors">
                    {CONTACT.email}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="text-emerald-400 mt-1" size={20} />
                <div>
                  <div className="text-gray-400 text-sm">{t.footer.phone}</div>
                  <a href={`tel:${CONTACT.phone.replace(/\s/g, '')}`} className="text-white hover:text-emerald-400 transition-colors">
                    {CONTACT.phone}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="text-emerald-400 mt-1" size={20} />
                <div>
                  <div className="text-gray-400 text-sm">{t.footer.address}</div>
                  <span className="text-white">{CONTACT.address}</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-gray-400 text-sm">
            © {new Date().getFullYear()} Al-Athar Academy. {t.footer.rights}
          </div>
          <div className="flex gap-6 text-sm">
            <Link to="/privacy" className="text-gray-400 hover:text-emerald-400 transition-colors">
              {t.footer.privacy}
            </Link>
            <Link to="/terms" className="text-gray-400 hover:text-emerald-400 transition-colors">
              {t.footer.terms}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
