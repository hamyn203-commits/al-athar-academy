import { motion } from 'framer-motion';
import { useI18n } from '../i18n';
import AtharEmblem from './AtharEmblem';

export default function Logo({ size = 40, showText = true }) {
  const { t, locale } = useI18n();
  const c = t.common;

  return (
    <motion.div
      className="logo-container flex items-center gap-3 select-none"
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
    >
      <div className="shrink-0 flex items-center justify-center">
        <AtharEmblem size={size} glow={true} />
      </div>

      {showText && (
        <div className="flex flex-col leading-tight">
          <span
            className="text-gradient-gold logo-title font-black"
            style={{ fontSize: `${Math.max(14, size * 0.45)}px`, lineHeight: '1.2' }}
          >
            {c.appNameFull || c.appName}
          </span>
          <span
            className="text-[var(--text-secondary)] font-medium"
            style={{ fontSize: `${Math.max(10, size * 0.26)}px` }}
          >
            {c.slogan || (locale === 'ar' ? 'لتعليم القرآن الكريم والقراءات' : 'Holy Quran Academy')}
          </span>
        </div>
      )}
    </motion.div>
  );
}

