import { Sparkles, Mic, Bot, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import LocalizedLink from './LocalizedLink';
import { useI18n } from '../i18n';

export default function AISection() {
  const { locale } = useI18n();

  const features = [
    { icon: Bot, text: 'مساعد قرآن ذكي' },
    { icon: Mic, text: 'تحليل التلاوة بالصوت' },
    { icon: Sparkles, text: 'خطط حفظ يومية' },
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-emerald-900 via-green-800 to-teal-900 text-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full text-sm mb-4">
              <Sparkles size={16} /> مدعوم بالذكاء الاصطناعي
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">مركز AI — رفيقك في رحلة القرآن</h2>
            <p className="text-emerald-100 mb-8 text-lg">
              اسأل عن التجويد، حلّل تلاوتك، واحصل على خطة حفظ مخصصة — بالعربية والإنجليزية
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              {features.map(({ icon: Icon, text }) => (
                <span key={text} className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg text-sm">
                  <Icon size={16} /> {text}
                </span>
              ))}
            </div>
            <LocalizedLink
              to="/ai"
              locale={locale}
              className="inline-flex items-center gap-2 bg-white text-emerald-800 px-8 py-3 rounded-xl font-bold hover:bg-emerald-50 transition"
            >
              جرّب مركز AI
              <ArrowLeft size={18} />
            </LocalizedLink>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
