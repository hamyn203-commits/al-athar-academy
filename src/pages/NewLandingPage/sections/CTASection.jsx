import { useI18n } from '../../../i18n';
import { ArrowLeft, Play } from 'lucide-react';
import LocalizedLink from '../../../components/LocalizedLink';
import { useReveal } from './_shared';

export default function CTASection() {
  const { t, locale } = useI18n();
  const ref = useReveal();
  return (
    <section className="py-20 bg-white">
      <div className="page-container">
        <div ref={ref} className="reveal relative rounded-3xl overflow-hidden px-8 py-16 md:px-16 text-center shadow-xl" style={{
          background: 'linear-gradient(135deg, var(--athar-gold-100) 0%, var(--athar-gold-50) 50%, #fff 100%)',
          border: '1px solid rgba(201,162,39,0.3)',
        }}>
          <div className="absolute top-0 right-0 w-48 h-48 opacity-20 pointer-events-none" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='150' height='150' viewBox='0 0 150 150' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23c9a227' stroke-opacity='0.4' stroke-width='1'%3E%3Cpath d='M75 15l10 30 30 10-30 10-10 30-10-30-30-10 30-10z'/%3E%3C/g%3E%3C/svg%3E")`,
          }} aria-hidden="true" />
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[var(--athar-gold)] to-transparent" aria-hidden="true" />
          <span className="section-label mb-6">{locale === 'id' ? 'Mulai Perjalanan Anda' : locale === 'ar' ? 'ابدأ رحلتك' : 'Start Your Journey'}</span>
          <h2 className="font-naskh text-4xl md:text-5xl font-bold text-[var(--athar-text)] mt-4 text-pretty">{t.cta.title}</h2>
          <p className="mt-4 text-[var(--athar-text-muted)] max-w-xl mx-auto leading-relaxed">{t.cta.subtitle}</p>
          <div className="mt-8 flex flex-wrap gap-3 justify-center">
            <LocalizedLink to="/register/student" locale={locale} className="btn-gold text-base px-8 py-3.5">
              {t.cta.button}
              <ArrowLeft size={18} aria-hidden="true" />
            </LocalizedLink>
            <LocalizedLink to="/teachers" locale={locale} className="inline-flex items-center gap-2 rounded-xl border border-[var(--athar-gold)]/40 bg-white px-7 py-3.5 text-sm font-semibold text-[var(--athar-gold-muted)] hover:bg-[var(--athar-gold-50)] transition">
              <Play size={16} strokeWidth={1.5} />
              {locale === 'id' ? 'Lihat Cara Kerja Platform' : locale === 'ar' ? 'شاهد كيف تعمل المنصة' : 'See How It Works'}
            </LocalizedLink>
          </div>
        </div>
      </div>
    </section>
  );
}