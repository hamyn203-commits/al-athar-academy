import { Link } from 'react-router-dom';
import { Sparkles, MessageCircle } from 'lucide-react';
import { useI18n } from '../i18n';
import { localizedPath, DEFAULT_LOCALE } from '../lib/locale';

export default function MobileStickyBar() {
  const { locale, t } = useI18n();
  const lp = (path) => localizedPath(path, locale || DEFAULT_LOCALE);

  const whatsappNumber = '201000000000'; // رقم واتساب الأكاديمية
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    locale === 'ar'
      ? 'السلام عليكم، أود الاستفسار عن حجز حصة تجريبية مجانية في أكاديمية الأثر الطيب'
      : 'Hello, I would like to inquire about booking a free trial Quran session at Al-Athar Academy'
  )}`;

  return (
    <aside
      aria-label={locale === 'ar' ? 'شريط الإجراءات السريعة' : 'Quick Actions Bar'}
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-xl border-t border-amber-300/40 px-3 py-2.5 shadow-[0_-8px_25px_rgba(10,22,40,0.12)]"
    >
      <div className="flex items-center gap-2 max-w-md mx-auto">
        {/* زر حجز الحصة التجريبية الذهبي */}
        <Link
          to={lp('/free-trial')}
          className="flex-1 btn-gold-shimmer !py-2.5 !px-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 shadow-md"
        >
          <Sparkles size={16} className="text-amber-950 animate-pulse" />
          <span>{locale === 'ar' ? 'احجز حصتك التجريبية مجاناً' : 'Book Free Trial'}</span>
          <span className="bg-emerald-800 text-white text-[10px] px-1.5 py-0.5 rounded-full font-black">
            100%
          </span>
        </Link>

        {/* زر الواتساب المباشر */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 flex items-center justify-center w-11 h-11 rounded-xl bg-emerald-600 text-white shadow-md hover:bg-emerald-700 transition-colors"
          aria-label={locale === 'ar' ? 'محادثة فورية عبر الواتساب' : 'Chat on WhatsApp'}
        >
          <MessageCircle size={22} />
        </a>
      </div>
    </aside>
  );
}
