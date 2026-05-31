import { motion } from 'framer-motion';
import { useI18n } from '../i18n';

export default function Logo({ size = 40, showText = true }) {
  const { t } = useI18n();
  const c = t.common;

  return (
    <motion.div
      className="logo-container flex-center"
      style={{ gap: '12px' }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <div
        className="logo-icon flex-center"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 0 20px rgba(197, 168, 128, 0.4)',
          border: '2px solid var(--primary-gold)',
        }}
      >
        <img
          src="/assets/logo.png"
          alt={c.appName}
          width={size}
          height={size}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.parentElement.innerHTML = '<span style="color:#0f0e0d; font-weight:bold; font-size:1.2rem;">أ</span>';
            e.target.parentElement.style.background = 'linear-gradient(135deg, var(--primary-gold), var(--clay-terracotta))';
          }}
        />
      </div>

      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span className="text-gradient-gold logo-title" style={{ fontSize: `${size * 0.45}px`, lineHeight: '1.2', margin: 0, fontWeight: '800' }}>
            {c.appNameFull || c.appName}
          </span>
          <span style={{ fontSize: `${size * 0.25}px`, color: 'var(--text-secondary)', fontWeight: '500', letterSpacing: 0 }}>
            {c.slogan}
          </span>
        </div>
      )}
    </motion.div>
  );
}
