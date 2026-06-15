import { useState } from 'react';
import { useI18n } from '../../../i18n';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { useReveal, GoldDivider } from './_shared';

export default function FAQSection() {
  const { t, locale } = useI18n();
  const [open, setOpen] = useState(null);
  const ref = useReveal();
  const faqs = [
    { q: t.faq.q1, a: t.faq.a1 }, { q: t.faq.q2, a: t.faq.a2 }, { q: t.faq.q3, a: t.faq.a3 },
    { q: t.faq.q4, a: t.faq.a4 }, { q: t.faq.q5, a: t.faq.a5 },
  ];

  return (
    <section className="py-24" style={{ background: 'var(--athar-gold-50)' }}>
      <div className="page-container max-w-3xl">
        <div ref={ref} className="reveal text-center mb-12">
          <span className="section-label mb-4">{locale === 'id' ? 'Pertanyaan Umum' : locale === 'ar' ? 'الأسئلة الشائعة' : 'FAQ'}</span>
          <h2 className="section-heading mt-4">{t.faq.title}</h2>
          <GoldDivider center />
          <p className="section-desc mx-auto !mt-2">{t.faq.subtitle}</p>
        </div>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="rounded-2xl border bg-white overflow-hidden transition-shadow" style={{ borderColor: open === i ? 'rgba(201,162,39,0.4)' : 'var(--athar-cream-dark)' }}>
              <button onClick={() => setOpen(open === i ? null : i)} className="flex w-full items-center justify-between gap-4 p-5 text-right text-sm font-semibold text-[var(--athar-text)] hover:bg-[var(--athar-gold-50)] transition-colors">
                {faq.q}
                {open === i ? <ChevronUp size={18} className="shrink-0 text-[var(--athar-gold)]" /> : <ChevronDown size={18} className="shrink-0 text-[var(--athar-text-muted)]" />}
              </button>
              {open === i && (
                <div className="px-5 pb-5 text-sm text-[var(--athar-text-muted)] leading-relaxed border-t border-[var(--athar-cream-dark)] pt-4">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}