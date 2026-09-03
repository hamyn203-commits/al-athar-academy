import { useI18n } from '../../../i18n';
import { Globe, Users, CheckCircle2, Sparkles, ArrowRight } from 'lucide-react';
import LocalizedLink from '../../../components/LocalizedLink';
import { useReveal, GoldDivider } from './_shared';

export default function HeroSection() {
  const { locale, t } = useI18n();
  const textRef = useReveal();

  return (
    <section className="geo-pattern-light relative overflow-hidden min-h-[92dvh] flex items-center">
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[var(--athar-gold)] to-transparent" aria-hidden="true" />
      <div className="page-container relative w-full py-20 lg:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div ref={textRef} className="reveal order-2 lg:order-1">
            <span className="section-label mb-6 inline-flex">
              <Globe size={13} aria-hidden="true" />
              {locale === 'id' ? 'Platform Edukasi Quran Global' : locale === 'ar' ? 'منصة تعليم قرآن عالمية' : 'Global Quran Learning Platform'}
            </span>
            <h1 className="font-amiri text-5xl md:text-6xl lg:text-[4rem] font-bold leading-[1.3] text-[var(--athar-text)] text-pretty">
              {t.hero.title}
            </h1>
            <GoldDivider />
            <p className="text-lg text-[var(--athar-text-muted)] max-w-xl leading-relaxed text-pretty">
              {t.hero.subtitle}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <LocalizedLink to="/register/student" locale={locale} className="btn-gold text-base px-7 py-3.5">
                {t.hero.cta1}
                <ArrowRight size={18} strokeWidth={1.5} className="rtl:rotate-180" aria-hidden="true" />
              </LocalizedLink>
              <LocalizedLink to="/teachers" locale={locale} className="inline-flex items-center gap-2 rounded-xl border border-[var(--athar-gold)]/40 bg-white px-7 py-3.5 text-sm font-semibold text-[var(--athar-gold-muted)] shadow-sm hover:border-[var(--athar-gold)] hover:bg-[var(--athar-gold-50)] transition">
                <Users size={18} strokeWidth={1.5} aria-hidden="true" />
                {t.hero.cta2}
              </LocalizedLink>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2">
              {(locale === 'id'
                ? ['Guru Bersertifikat', 'Terjemahan Langsung', 'Pelacakan Hafalan', 'Sertifikat Resmi']
                : locale === 'ar'
                ? ['معلمون مجازون', 'ترجمة فورية', 'تتبع الحفظ', 'شهادات معتمدة']
                : ['Certified Tutors', 'Live Translation', 'Hifz Tracking', 'Accredited Certificates']
              ).map((b) => (
                <span key={b} className="flex items-center gap-1.5 text-sm text-[var(--athar-text-muted)]">
                  <CheckCircle2 size={15} className="text-[var(--athar-gold)]" strokeWidth={2} aria-hidden="true" />
                  {b}
                </span>
              ))}
            </div>
          </div>
          <div className="order-1 lg:order-2 flex justify-center lg:justify-end reveal reveal-delay-2">
            <div className="relative w-full max-w-md">
              <div className="absolute inset-0 rounded-3xl" style={{ background: 'radial-gradient(ellipse at 50% 60%, rgba(201,162,39,0.18) 0%, transparent 70%)' }} aria-hidden="true" />
              <img src="/hero-illustration.png" alt={locale === 'id' ? 'Syekh membaca Al-Quran' : locale === 'ar' ? 'شيخ يقرأ القرآن الكريم' : 'Sheikh reciting Holy Quran'} className="relative w-full h-auto drop-shadow-2xl" style={{ filter: 'drop-shadow(0 20px 40px rgba(201,162,39,0.2))' }} />
              <div className="absolute -bottom-4 -right-4 glass-card px-4 py-3 flex items-center gap-2.5 shadow-lg">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--athar-gold-100)]">
                  <Sparkles size={18} className="text-[var(--athar-gold)]" />
                </span>
                <div>
                  <p className="text-xs text-[var(--athar-text-muted)]">{locale === 'id' ? 'Analisis Bacaan' : locale === 'ar' ? 'تحليل التلاوة' : 'Recitation Analysis'}</p>
                  <p className="text-sm font-semibold text-[var(--athar-text)]">{locale === 'id' ? 'AI Siap' : locale === 'ar' ? 'AI جاهز' : 'AI Ready'}</p>
                </div>
              </div>
              <div className="absolute -top-4 -left-4 glass-card px-4 py-3 flex items-center gap-2.5 shadow-lg">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50">
                  <CheckCircle2 size={18} className="text-emerald-600" />
                </span>
                <div>
                  <p className="text-xs text-[var(--athar-text-muted)]">{locale === 'id' ? 'Pengajar' : locale === 'ar' ? 'معلمون' : 'Tutors'}</p>
                  <p className="text-sm font-semibold text-[var(--athar-text)]">{locale === 'id' ? '+200 Bersertifikat' : locale === 'ar' ? '+200 مجاز' : '+200 Certified'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-white to-transparent" aria-hidden="true" />
    </section>
  );
}