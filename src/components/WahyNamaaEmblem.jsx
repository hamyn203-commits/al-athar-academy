import React from 'react';

/**
 * WahyNamaaEmblem — الرمز الرسمي المعتمد لأكاديمية «وَحْيٌ وَنَمَاء»
 * مطابق للمرجع البصري الرسمي المعتمد في Brand Identity Prompt 10:
 * - شكل القوس النوراني ونبتة النماء الصاعدة (Ascending Revelation Arch & Sprout)
 * - التداخل الخطي لحرفي الواو والنون بأسلوب عربي هندسي معاصر
 * - الماسة الرباعية الذهبية في القمة (✦)
 * - تدرج أخضر غابي داكن (Deep Forest Green #0e382b) مع لمسة الذهب الأثري (#c5a059)
 */
export default function WahyNamaaEmblem({
  size = 44,
  className = '',
  glow = false,
  variant = 'default', // 'default', 'monochrome', 'light', 'watermark'
}) {
  const uniqueId = React.useId().replace(/:/g, '');
  const greenId = `wn-emblem-green-${uniqueId}`;
  const goldId = `wn-emblem-gold-${uniqueId}`;

  const isLight = variant === 'light';
  const isWatermark = variant === 'watermark';

  const primaryFill = isLight ? '#ffffff' : isWatermark ? 'currentColor' : `url(#${greenId})`;
  const diamondFill = isLight ? '#f3e5b8' : isWatermark ? 'currentColor' : `url(#${goldId})`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      style={{
        filter: glow ? 'drop-shadow(0 4px 12px rgba(14, 56, 43, 0.28))' : undefined,
      }}
      aria-label="شعار أكاديمية وحي ونماء"
      role="img"
    >
      <defs>
        {/* تدرج الأخضر الغابي العميق */}
        <linearGradient id={greenId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#14533e" />
          <stop offset="55%" stopColor="#0e382b" />
          <stop offset="100%" stopColor="#08231b" />
        </linearGradient>

        {/* تدرج الذهب الأثري الهادئ المعتمد */}
        <linearGradient id={goldId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#dfbe75" />
          <stop offset="50%" stopColor="#c5a059" />
          <stop offset="100%" stopColor="#967432" />
        </linearGradient>
      </defs>

      {/* ═══ 1. الماسة الرباعية النورانية في القمة (✦) ═══ */}
      <path
        d="M50 3 L53.5 11 L50 19 L46.5 11 Z"
        fill={diamondFill}
      />
      <circle cx="50" cy="11" r="1.2" fill={isLight ? '#ffffff' : '#fff9e6'} opacity="0.9" />

      {/* ═══ 2. الجناح الأيسر المقوس (The Noon Bowl & Left Arc) ═══ */}
      <path
        d="M50 25 C45 32 30 46 25 64 C20 81 29 96 46 102 C35 97 29 88 32 75 C34 64 42 50 50 39 Z"
        fill={primaryFill}
      />

      {/* ═══ 3. الجناح الأيمن وحلقة الواو المتصلة (The Ascending Waw & Right Arc) ═══ */}
      <path
        d="M50 25 C55 32 70 46 75 64 C80 81 71 96 54 102 C65 97 71 88 68 75 C66 64 58 50 50 39 Z"
        fill={primaryFill}
      />

      {/* ═══ 4. القلب الداخلي المتشابك (The Central Interlocking Loop & Sprout) ═══ */}
      <path
        d="M50 42 C44 48 41 56 42 64 C43 72 49 78 57 76 C65 74 68 67 67 59 C66 52 61 46 54 44 L50 42 Z M51 51 C55 52 58 56 58 61 C58 65 56 68 52 69 C48 70 45 67 45 63 C45 58 48 53 51 51 Z"
        fill={primaryFill}
      />

      {/* ═══ 5. نماء الصعود السفلي الممتد (The Upward Growth Stem) ═══ */}
      <path
        d="M48.5 76 C48.5 86 45 94 39 99 C44 98 48 94 50 88 C52 94 56 98 61 99 C55 94 51.5 86 51.5 76 Z"
        fill={primaryFill}
      />
    </svg>
  );
}
