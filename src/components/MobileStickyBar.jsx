import { Link } from 'react-router-dom';
import { Sparkles, MessageCircleMore } from 'lucide-react';
import { useI18n } from '../i18n';
import { localizedPath, DEFAULT_LOCALE } from '../lib/locale';

export default function MobileStickyBar() {
  const { locale } = useI18n();
  const activeLocale = locale || DEFAULT_LOCALE;
  const lp = (path) => localizedPath(path, activeLocale);
  const isAr = activeLocale === 'ar';

  return (
    <aside
      aria-label={isAr ? 'إجراءات سريعة' : 'Quick actions'}
      className="wn-mobile-sticky"
    >
      <div className="wn-mobile-sticky__inner">
        <Link to={lp('/start')} className="wn-mobile-sticky__primary">
          <Sparkles size={16} />
          <span>{isAr ? 'ابدأ حصة تعريفية' : 'Start a trial lesson'}</span>
        </Link>
        <Link
          to={lp('/contact')}
          className="wn-mobile-sticky__secondary"
          aria-label={isAr ? 'تواصل مع الأكاديمية' : 'Contact the academy'}
        >
          <MessageCircleMore size={20} />
        </Link>
      </div>
    </aside>
  );
}
