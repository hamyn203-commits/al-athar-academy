import React from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../i18n';
import WahyNamaaEmblem from './WahyNamaaEmblem';

export default function BrandLogo({
  size = 'md',
  showText = true,
  to = '/',
  variant = 'dark', // 'dark', 'light'
  layout = 'horizontal', // 'horizontal', 'vertical'
}) {
  const { locale } = useI18n();
  const sizes = { sm: 32, md: 42, lg: 52, xl: 64 };
  const px = typeof size === 'number' ? size : (sizes[size] || sizes.md);

  const isLight = variant === 'light';

  const mark = (
    <div className="relative shrink-0 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
      <WahyNamaaEmblem size={px} variant={isLight ? 'light' : 'default'} glow={!isLight} />
    </div>
  );

  const isVertical = layout === 'vertical';

  const inner = (
    <div className={`group flex ${isVertical ? 'flex-col items-center text-center gap-2' : 'items-center gap-3'} shrink-0 select-none`}>
      {mark}
      {showText && (
        <div className={`leading-tight min-w-0 flex flex-col justify-center ${isVertical ? 'items-center' : 'items-start'}`}>
          <div className="flex items-center gap-1.5">
            <span
              className={`block text-[16px] sm:text-[18px] font-black tracking-tight leading-tight font-serif ${
                isLight ? 'text-white' : 'text-[#0e382b]'
              }`}
            >
              وَحْيٌ وَنَمَاء
            </span>
          </div>
          <span
            className={`block text-[9.5px] sm:text-[10px] font-bold tracking-[0.22em] uppercase leading-none mt-1 ${
              isLight ? 'text-[#f1e5c5]' : 'text-[#14533e]'
            }`}
          >
            WAHY WA NAMAA
          </span>
        </div>
      )}
    </div>
  );

  if (to) {
    return (
      <Link
        to={to}
        className="flex items-center shrink-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0e382b] rounded-xl transition"
        aria-label="أكاديمية وحي ونماء — الصفحة الرئيسية"
      >
        {inner}
      </Link>
    );
  }
  return inner;
}
