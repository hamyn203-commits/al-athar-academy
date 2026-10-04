import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle, Sparkles } from 'lucide-react';
import GlobalHeader from '../../components/GlobalHeader';
import GlobalFooter from '../../components/GlobalFooter';
import SEOHead from '../../components/SEOHead';
import { useI18n } from '../../i18n';
import '../../styles/public-experience.css';

export default function FAQPage() {
  const { t, locale } = useI18n();
  const isAr = locale === 'ar';
  const [open, setOpen] = useState(0);

  const faqs = [
    { q: t.faq.q1, a: t.faq.a1 },
    { q: t.faq.q2, a: t.faq.a2 },
    { q: t.faq.q3, a: t.faq.a3 },
    { q: t.faq.q4, a: t.faq.a4 },
    { q: t.faq.q5, a: t.faq.a5 },
  ].filter((item) => item.q && item.a);

  return (
    <>
      <SEOHead page={{ title: t.faq?.title || (isAr ? 'الأسئلة الشائعة' : 'FAQ'), description: t.faq?.subtitle, url: '/faq', type: 'website' }} />
      <GlobalHeader />
      <main className="wn-public-shell">
        <section className="wn-public-hero">
          <div className="page-container wn-public-hero__inner">
            <div>
              <span className="wn-auth-visual__eyebrow"><Sparkles size={14} /> {isAr ? 'مركز المساعدة' : 'HELP CENTER'}</span>
              <h1>{t.faq?.title || (isAr ? 'الأسئلة الشائعة' : 'Frequently asked questions')}</h1>
              <p>{t.faq?.subtitle || (isAr ? 'إجابات مختصرة على الأسئلة المتكررة عن الدراسة والحسابات.' : 'Short answers to common questions about learning and accounts.')}</p>
            </div>
            <div className="wn-public-hero__art" aria-hidden="true"><div className="wn-public-orbit" /><div className="wn-public-orbit__core"><HelpCircle size={46} strokeWidth={1.25} /></div></div>
          </div>
        </section>

        <section className="wn-editorial-wrap">
          <div className="wn-faq-list">
            {faqs.map((item, index) => (
              <div key={item.q} className="wn-faq-item">
                <button type="button" onClick={() => setOpen(open === index ? -1 : index)} className="wn-faq-button">
                  <span>{item.q}</span>
                  <ChevronDown size={18} className={'shrink-0 transition-transform ' + (open === index ? 'rotate-180' : '')} />
                </button>
                <AnimatePresence initial={false}>
                  {open === index ? (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="wn-faq-answer">{item.a}</div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </section>
      </main>
      <GlobalFooter />
    </>
  );
}
