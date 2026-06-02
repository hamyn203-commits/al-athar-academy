import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../i18n';

export default function BrandLogo({ size = 'md', showText = true, to = '/', variant = 'dark' }) {
  const { t } = useI18n();
  const [imgFailed, setImgFailed] = useState(false);
  const sizes = { sm: 36, md: 40, lg: 48 };
  const px = sizes[size] || sizes.md;

  const mark = (
    <div
      className="relative flex shrink-0 items-center justify-center rounded-xl overflow-hidden font-bold text-[var(--athar-navy)]"
      style={{
        width: px,
        height: px,
        background: 'linear-gradient(145deg, var(--athar-gold-light), var(--athar-gold))',
        boxShadow: '0 0 0 2px rgba(201,162,39,0.3), 0 4px 12px rgba(10,22,40,0.15)',
        fontSize: px * 0.45,
      }}
    >
      {!imgFailed && (
        <img
          src="/assets/logo.png"
          alt=""
          width={px}
          height={px}
          className="absolute inset-0 h-full w-full object-cover"
          onError={() => setImgFailed(true)}
        />
      )}
      {imgFailed && <span aria-hidden="true">أ</span>}
    </div>
  );

  const inner = (
    <>
      {mark}
      {showText && (
        <div className="leading-tight min-w-0">
          <span className={`block text-sm font-bold tracking-tight truncate ${variant === 'light' ? 'text-white' : 'text-slate-900'}`}>
            {t.common.appName}
          </span>
          <span className={`block text-[10px] font-medium truncate ${variant === 'light' ? 'text-[var(--athar-gold-light)]' : 'text-[var(--athar-gold-muted)]'}`}>
            {t.common.slogan}
          </span>
        </div>
      )}
    </>
  );

  if (to) {
    return (
      <Link to={to} className="flex items-center gap-2.5 shrink-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 rounded-lg">
        {inner}
      </Link>
    );
  }
  return <div className="flex items-center gap-2.5 shrink-0">{inner}</div>;
}
