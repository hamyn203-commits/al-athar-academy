import React from 'react';
import { useI18n } from '../../../i18n';
import {
  BookOpen,
  GraduationCap,
  MonitorSmartphone,
  Users,
  ArrowLeft,
  ArrowRight,
  CirclePlay,
} from 'lucide-react';
import LocalizedLink from '../../../components/LocalizedLink';

export default function HeroSection() {
  const { locale } = useI18n();
  const isAr = locale === 'ar';
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const trustItems = [
    {
      icon: GraduationCap,
      title: isAr ? 'معلمون مؤهلون' : 'Qualified Teachers',
      text: isAr ? 'تعليم متقن وتوجيه تربوي' : 'Skilled, caring instruction',
    },
    {
      icon: BookOpen,
      title: isAr ? 'مناهج متدرجة' : 'Structured Programs',
      text: isAr ? 'من التأسيس إلى الإتقان' : 'From foundation to mastery',
    },
    {
      icon: MonitorSmartphone,
      title: isAr ? 'تعلم مرن' : 'Flexible Learning',
      text: isAr ? 'من أي مكان وفي وقت مناسب' : 'Learn from anywhere',
    },
    {
      icon: Users,
      title: isAr ? 'لجميع الأعمار' : 'For All Ages',
      text: isAr ? 'أطفال وناشئة وبالغون' : 'Kids, youth and adults',
    },
  ];

  return (
    <section className="wn-approved-hero">
      <div className="wn-approved-hero__pattern" aria-hidden="true" />

      <div className="page-container wn-approved-hero__layout">
        <div className="wn-approved-hero__copy">
          <span className="wn-approved-eyebrow">
            {isAr ? 'تعليم قرآني أصيل' : 'AUTHENTIC QURAN LEARNING'}
          </span>

          <h1 className="wn-approved-hero__title">
            {isAr ? (
              <>
                <span>تعلَّم القرآن</span>
                <strong>يحفظك وينمو بك</strong>
              </>
            ) : (
              <>
                <span>Learn the Quran.</span>
                <strong>Let it shape your growth.</strong>
              </>
            )}
          </h1>

          <p className="wn-approved-hero__lead">
            {isAr
              ? 'تعليم أصيل، معلمون موثوقون، وتجربة حديثة ترافق الطفل والناشئ والكبير في رحلة من التلاوة والحفظ إلى الفهم والنماء.'
              : 'Authentic Quran learning with trusted teachers and a modern experience that supports children, youth, and adults from recitation and memorization to understanding and growth.'}
          </p>

          <div className="wn-approved-hero__actions">
            <LocalizedLink to="/free-trial" locale={locale} className="wn-btn wn-btn--primary wn-btn--lg">
              <span>{isAr ? 'ابدأ رحلتك الآن' : 'Start Your Journey'}</span>
              <ArrowIcon size={18} className="wn-btn__arrow" />
            </LocalizedLink>

            <LocalizedLink to="/about" locale={locale} className="wn-btn wn-btn--secondary wn-btn--lg">
              <CirclePlay size={19} />
              <span>{isAr ? 'تعرّف على الأكاديمية' : 'Discover the Academy'}</span>
            </LocalizedLink>
          </div>

          <div className="wn-approved-hero__trust">
            {trustItems.map(({ icon: Icon, title, text }) => (
              <div key={title} className="wn-approved-trust-item">
                <span className="wn-approved-trust-item__icon"><Icon size={19} strokeWidth={1.8} /></span>
                <span>
                  <strong>{title}</strong>
                  <small>{text}</small>
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="wn-approved-hero__visual">
          <img
            src="/images/hero-wahy-namaa.jpg"
            alt={isAr ? 'مصحف كريم في أجواء تعليمية روحانية لأكاديمية وحي ونماء' : 'Quran learning atmosphere at Wahy Wa Namaa Academy'}
            loading="eager"
            fetchPriority="high"
          />
          <div className="wn-approved-hero__shade" aria-hidden="true" />

          <aside className="wn-approved-verse-card">
            <span className="wn-approved-verse-card__ornament">✦</span>
            <p className="font-quran">وَرَتِّلِ الْقُرْآنَ تَرْتِيلًا</p>
            <span>{isAr ? 'المزمل: ٤' : 'Al-Muzzammil 73:4'}</span>
          </aside>
        </div>
      </div>
    </section>
  );
}
