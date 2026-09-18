import React from 'react';

/**
 * AtharEmblem — الشعار المتجهي الفاخر لأكاديمية الأثر الطيب
 * شعار إسلامي هندسي فائق الدقة (Vector SVG) يتضمن:
 * 1. نجمة إسلامية ثمانية مذهبة (Islamic Star Medallion)
 * 2. مصحف شريف مفتوح بوقار (Noble Quran)
 * 3. أشعة النور الذهبية للأثر القرآني (Radiant Light Rays)
 * 4. هلال ونجمة المعرفة بالأعلى (Illuminated Crescent)
 */
export default function AtharEmblem({ size = 42, className = '', glow = true }) {
  const uniqueId = React.useId().replace(/:/g, '');
  const goldGradId = `athar-gold-grad-${uniqueId}`;
  const navyGradId = `athar-navy-grad-${uniqueId}`;
  const glowFilterId = `athar-glow-${uniqueId}`;
  const lightGradId = `athar-light-grad-${uniqueId}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      style={{
        filter: glow ? `drop-shadow(0 4px 12px rgba(201, 162, 39, 0.35))` : undefined,
      }}
      aria-label="شعار أكاديمية الأثر الطيب"
      role="img"
    >
      <defs>
        {/* تدرج الذهب الملكي عيار 24 */}
        <linearGradient id={goldGradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f7e08b" />
          <stop offset="35%" stopColor="#d4a843" />
          <stop offset="70%" stopColor="#f0c75e" />
          <stop offset="100%" stopColor="#8b6914" />
        </linearGradient>

        {/* تدرج خلفية الكحلي الأزهري الملكي والزمردي */}
        <linearGradient id={navyGradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#081426" />
          <stop offset="50%" stopColor="#0a1d35" />
          <stop offset="100%" stopColor="#07231c" />
        </linearGradient>

        {/* تدرج نور القرآن الذهبي الناعم */}
        <radialGradient id={lightGradId} cx="50%" cy="55%" r="45%">
          <stop offset="0%" stopColor="#fef3c7" stopOpacity="0.45" />
          <stop offset="50%" stopColor="#d4a843" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#0a1d35" stopOpacity="0" />
        </radialGradient>

        {/* فلتر التوهج اللطيف */}
        <filter id={glowFilterId} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* ═══ 1. القاعدة الهندسية: نجمة إسلامية ثمانية مزدوجة ═══ */}
      {/* المربع الأول مائل 45 درجة */}
      <rect
        x="13"
        y="13"
        width="74"
        height="74"
        rx="16"
        transform="rotate(45 50 50)"
        fill={`url(#${navyGradId})`}
        stroke={`url(#${goldGradId})`}
        strokeWidth="2.2"
      />
      {/* المربع الثاني القائم */}
      <rect
        x="13"
        y="13"
        width="74"
        height="74"
        rx="16"
        fill={`url(#${navyGradId})`}
        stroke={`url(#${goldGradId})`}
        strokeWidth="2.2"
      />

      {/* حلقة ذهبية زخرفية داخلية */}
      <circle
        cx="50"
        cy="50"
        r="34"
        stroke={`url(#${goldGradId})`}
        strokeWidth="0.8"
        strokeDasharray="2 3"
        opacity="0.65"
      />

      {/* هالة النور الوسطية */}
      <circle cx="50" cy="50" r="32" fill={`url(#${lightGradId})`} />

      {/* ═══ 2. إشعاع النور الصاعد (الأثر الطيب) ═══ */}
      <g stroke={`url(#${goldGradId})`} strokeWidth="0.8" opacity="0.45">
        <line x1="50" y1="36" x2="50" y2="23" strokeLinecap="round" />
        <line x1="42" y1="38" x2="35" y2="28" strokeLinecap="round" />
        <line x1="58" y1="38" x2="65" y2="28" strokeLinecap="round" />
      </g>

      {/* ═══ 3. الهلال والنجمة في القمة (رمز العلو والرفعة) ═══ */}
      <path
        d="M50 20 A3.2 3.2 0 0 1 47.5 24.8 A3.5 3.5 0 1 0 51.5 20.8 A3.2 3.2 0 0 1 50 20 Z"
        fill={`url(#${goldGradId})`}
      />
      <polygon
        points="50,16 50.8,17.8 52.8,18 51.3,19.3 51.7,21.3 50,20.2 48.3,21.3 48.7,19.3 47.2,18 49.2,17.8"
        fill="#fef08a"
        transform="scale(0.55) translate(41, 10)"
      />

      {/* ═══ 4. المصحف الشريف المفتوح بوقار ═══ */}
      <g filter={`url(#${glowFilterId})`}>
        {/* صفحة اليمين */}
        <path
          d="M50 63 C44 57, 33 58, 25 61 C24.5 61.2 24 60.8 24 60.2 L24 45.5 C24 44.9 24.5 44.5 25 44.3 C33 41.5 44 42.5 50 48 Z"
          fill="#fdfbf7"
          stroke={`url(#${goldGradId})`}
          strokeWidth="1.2"
        />
        {/* خطوط أسطر صفحة اليمين */}
        <path
          d="M28 47.5 C34 45.5 42 46.5 46 50.5 M28 51.5 C34 49.5 42 50.5 46 54.5 M28 55.5 C34 53.5 42 54.5 46 58.5"
          stroke={`url(#${goldGradId})`}
          strokeWidth="0.7"
          strokeLinecap="round"
          opacity="0.75"
        />

        {/* صفحة اليسار */}
        <path
          d="M50 63 C56 57, 67 58, 75 61 C75.5 61.2 76 60.8 76 60.2 L76 45.5 C76 44.9 75.5 44.5 75 44.3 C67 41.5 56 42.5 50 48 Z"
          fill="#fdfbf7"
          stroke={`url(#${goldGradId})`}
          strokeWidth="1.2"
        />
        {/* خطوط أسطر صفحة اليسار */}
        <path
          d="M54 50.5 C58 46.5 66 45.5 72 47.5 M54 54.5 C58 50.5 66 49.5 72 51.5 M54 58.5 C58 54.5 66 53.5 72 55.5"
          stroke={`url(#${goldGradId})`}
          strokeWidth="0.7"
          strokeLinecap="round"
          opacity="0.75"
        />

        {/* كعب المصحف والشريط المذهب (Spine & Ribbon Bookmark) */}
        <path
          d="M50 47 L50 64"
          stroke={`url(#${goldGradId})`}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        {/* شريط الإشارة المنسدل بنهاية مشقوقة */}
        <path
          d="M50 64 Q50 68 52 71 L50 70 L48 71 Q50 68 50 64"
          fill={`url(#${goldGradId})`}
        />
      </g>

      {/* ═══ 5. حامل المصحف الخشبي التراثي (الرحلة - Rihal Stand) ═══ */}
      <g stroke={`url(#${goldGradId})`} strokeWidth="1.6" strokeLinecap="round">
        {/* ساق اليمين */}
        <path d="M37 65 L48 76 L51 76 L40 65" fill="#8b6914" opacity="0.85" />
        {/* ساق اليسار متقاطعة */}
        <path d="M63 65 L52 76 L49 76 L60 65" fill="#8b6914" opacity="0.85" />
        {/* قاعدة الارتكاز المذهبة */}
        <circle cx="50" cy="74" r="1.5" fill="#fef08a" />
      </g>

      {/* نقطة بريق ذهبي متلألئة */}
      <circle cx="50" cy="46" r="1.2" fill="#fff" filter={`url(#${glowFilterId})`} />
    </svg>
  );
}
