import GlobalHeader from '../../components/GlobalHeader';
import GlobalFooter from '../../components/GlobalFooter';
import SEOHead from '../../components/SEOHead';
import { useI18n } from '../../i18n';
import { motion } from 'framer-motion';
import { Target, Globe, Heart, Award } from 'lucide-react';

const values = [
  { icon: Target, title: 'رسالتنا', text: 'نشر تعليم القرآن والعلوم الشرعية بأعلى معايير الجودة للمسلمين حول العالم.' },
  { icon: Globe, title: 'رؤيتنا', text: 'أن نكون أكبر منصة تعليم إسلامي رقمية عالمياً تخدم أكثر من 100 دولة.' },
  { icon: Heart, title: 'قيمنا', text: 'الإتقان، الأمانة، الابتكار، وخدمة كتاب الله بكل حب وإخلاص.' },
  { icon: Award, title: 'تميزنا', text: 'معلمون مجازون، مناهج معتمدة، وتقنيات حديثة مدعومة بالذكاء الاصطناعي.' },
];

export default function About() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-white">
      <SEOHead title={t.common.about} description="تعرف على أكاديمية الأثر — منصة تعليم إسلامي عالمية" />
      <GlobalHeader />
      <section className="bg-gradient-to-br from-emerald-900 to-green-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-5xl font-bold mb-4">
            {t.common.about}
          </motion.h1>
          <p className="text-emerald-100 text-lg max-w-2xl mx-auto">أثرٌ يساوي حياة — منصة تعليمية عالمية للقرآن واللغة العربية والدراسات الإسلامية</p>
        </div>
      </section>
      <section className="container mx-auto px-4 py-16 grid md:grid-cols-2 gap-8">
        {values.map(({ icon: Icon, title, text }, i) => (
          <motion.div key={title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="glass-card p-8 bg-white shadow-lg border border-gray-100">
            <Icon className="text-emerald-600 mb-4" size={32} />
            <h3 className="text-xl font-bold mb-2">{title}</h3>
            <p className="text-gray-600 leading-relaxed">{text}</p>
          </motion.div>
        ))}
      </section>
      <GlobalFooter />
    </div>
  );
}
