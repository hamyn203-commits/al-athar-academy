import { useI18n } from '../../../i18n';
import { Globe, Users, CheckCircle2, Sparkles, ArrowRight } from 'lucide-react';
import LocalizedLink from '../../../components/LocalizedLink';
import { useReveal, GoldDivider } from './_shared';

export default function HeroSection() {
  const { locale, t } = useI18n();
  const textRef = useReveal();

  return (
    /* سطح داكن ثابت في الوضعين — كل النصوص فوقه بـ white/xx مش var(--athar-cream)
       لأن --athar-cream بيبقى #1a1a1a في الوضع الليلي فالنص هيختفي */
    <section className="azhar-section-bg azhar-star-pattern relative overflow-hidden min-h-[92dvh] flex items-center">
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[var(--azhar-gold-leaf)] to-transparent" aria-hidden="true" />
      {/* توهّج ذهبي خلف العنوان — start-0 منطقي فيتبع عمود النص في RTL و LTR */}
      <div className="pointer-events-none absolute top-0 bottom-0 start-0 w-full lg:w-3/5"
        style={{ background: 'radial-gradient(ellipse 60% 50% at 70% 45%, rgba(212,168,67,0.18) 0%, transparent 70%)' }} aria-hidden="true" />
      <div className="page-container relative w-full py-20 lg:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div ref={textRef} className="reveal order-2 lg:order-1">
            <span className="section-label section-label-dark mb-6 inline-flex">
              <Globe size={13} aria-hidden="true" />
              {locale === 'id' ? 'Platform Edukasi Quran Global' : locale === 'ar' ? 'منصة تعليم قرآن عالمية' : 'Global Quran Learning Platform'}
            </span>
            <h1 className="font-amiri text-5xl md:text-6xl lg:text-[4rem] font-bold leading-[1.3] text-[var(--azhar-gold-leaf)] text-pretty">
              {t.hero.title}
            </h1>
            <GoldDivider />
            <p className="text-lg text-white/80 max-w-xl leading-relaxed text-pretty">{t.hero.subtitle}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <LocalizedLink to="/register/student" locale={locale} className="btn-gold text-base px-7 py-3.5">
                {t.hero.cta1}
                <ArrowRight size={18} strokeWidth={1.5} className="rtl:rotate-180" aria-hidden="true" />
              </LocalizedLink>
              <LocalizedLink to="/teachers" locale={locale} className="btn-ghost-light px-7 py-3.5 text-base">
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
                <span key={b} className="flex items-center gap-1.5 text-sm text-white/75">
                  <CheckCircle2 size={15} className="text-[var(--azhar-gold-leaf)]" strokeWidth={2} aria-hidden="true" />
                  {b}
                </span>
              ))}
            </div>
          </div>
          <div className="order-1 lg:order-2 flex justify-center lg:justify-end reveal reveal-delay-2">
            <div className="relative w-full max-w-md">
              <div className="absolute inset-0 rounded-3xl" style={{ background: 'radial-gradient(ellipse at 50% 60%, rgba(212,168,67,0.28) 0%, transparent 70%)' }} aria-hidden="true" />
              <img src="/hero-illustration.png"
                alt={locale === 'id' ? 'Syekh membaca Al-Quran' : locale === 'ar' ? 'شيخ يقرأ القرآن الكريم' : 'Sheikh reciting Holy Quran'}
                className="relative w-full h-auto" style={{ filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.45))' }} />
              <div className="absolute -bottom-4 -right-4 flex items-center gap-2.5 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 shadow-xl backdrop-blur-md">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
                  <Sparkles size={18} className="text-[var(--azhar-gold-bright)]" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-xs text-white/70">{locale === 'id' ? 'Analisis Bacaan' : locale === 'ar' ? 'تحليل التلاوة' : 'Recitation Analysis'}</p>
                  <p className="text-sm font-semibold text-white">{locale === 'id' ? 'AI Siap' : locale === 'ar' ? 'AI جاهز' : 'AI Ready'}</p>
                </div>
              </div>
              <div className="absolute -top-4 -left-4 flex items-center gap-2.5 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 shadow-xl backdrop-blur-md">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
                  <CheckCircle2 size={18} className="text-[var(--azhar-gold-bright)]" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-xs text-white/70">{locale === 'id' ? 'Pengajar' : locale === 'ar' ? 'معلمون' : 'Tutors'}</p>
                  <p className="text-sm font-semibold text-white">{locale === 'id' ? '+200 Bersertifikat' : locale === 'ar' ? '+200 مجاز' : '+200 Certified'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* جسر الانتقال من الهيرو الداكن للقسم الأبيض اللي بعده */}
      <div className="absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-white to-transparent" aria-hidden="true" />
    </section>
  );
}
