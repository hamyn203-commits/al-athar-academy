import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import GlobalHeader from '../../components/GlobalHeader';
import GlobalFooter from '../../components/GlobalFooter';
import SEOHead from '../../components/SEOHead';
import { useI18n } from '../../i18n';

export default function FAQPage() {
  const { t } = useI18n();
  const [open, setOpen] = useState(0);
  const faqs = [
    { q: t.faq.q1, a: t.faq.a1 },
    { q: t.faq.q2, a: t.faq.a2 },
    { q: t.faq.q3, a: t.faq.a3 },
    { q: t.faq.q4, a: t.faq.a4 },
    { q: t.faq.q5, a: t.faq.a5 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead title="الأسئلة الشائعة" description="إجابات على أكثر الأسئلة شيوعاً عن أكاديمية الأثر" />
      <GlobalHeader />
      <div className="container mx-auto px-4 py-16 max-w-3xl">
        <h1 className="text-4xl font-bold text-center mb-4">{t.faq?.title || 'الأسئلة الشائعة'}</h1>
        <p className="text-gray-600 text-center mb-12">{t.faq?.subtitle}</p>
        <div className="space-y-3">
          {faqs.map((item, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <button onClick={() => setOpen(open === i ? -1 : i)}
                className="w-full flex justify-between items-center p-5 text-right font-semibold hover:bg-gray-50 transition">
                {item.q}
                <ChevronDown size={20} className={`transition-transform shrink-0 ${open === i ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                    <p className="px-5 pb-5 text-gray-600 leading-relaxed">{item.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
      <GlobalFooter />
    </div>
  );
}
