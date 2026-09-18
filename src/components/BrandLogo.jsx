import { Link } from 'react-router-dom';
import { useI18n } from '../i18n';
import AtharEmblem from './AtharEmblem';

export default function BrandLogo({ size = 'md', showText = true, to = '/', variant = 'dark' }) {
  const { t, locale } = useI18n();
  const sizes = { sm: 34, md: 42, lg: 50, xl: 60 };
  const px = sizes[size] || sizes.md;

  const mark = (
    <div className="relative shrink-0 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
      <AtharEmblem size={px} glow={true} />
    </div>
  );

  const inner = (
    <div className="group flex items-center gap-3 shrink-0 select-none">
      {mark}
      {showText && (
        <div className="leading-tight min-w-0 flex flex-col justify-center">
          <div className="flex items-center gap-1.5">
            <span
              className={`block text-[15px] sm:text-[16px] font-black tracking-tight truncate ${
                variant === 'light' ? 'text-white' : 'text-[#0a1628]'
              }`}
              style={{ fontFamily: 'Cairo, sans-serif' }}
            >
              {t.common.appName}
            </span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--azhar-gold-leaf)] shadow-[0_0_8px_rgba(212,168,67,0.8)]" />
          </div>
          <span
            className={`block text-[10.5px] font-semibold tracking-wide truncate ${
              variant === 'light' ? 'text-[var(--athar-gold-light)]' : 'text-[#8b6914]'
            }`}
          >
            {t.common.slogan || (locale === 'ar' ? 'لتعليم القرآن الكريم والقراءات' : 'Noble Quran & Sunnah Academy')}
          </span>
        </div>
      )}
    </div>
  );

  if (to) {
    return (
      <Link
        to={to}
        className="flex items-center shrink-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 rounded-xl transition"
      >
        {inner}
      </Link>
    );
  }
  return inner;
}

