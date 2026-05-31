import { motion } from 'framer-motion';
import { BookOpen, Mic, Globe, Baby, Heart, GraduationCap } from 'lucide-react';
import LocalizedLink from './LocalizedLink';
import { useI18n } from '../i18n';

const paths = [
  { icon: BookOpen, color: 'emerald', title: 'تحفيظ القرآن', desc: 'من المبتدئ إلى الحافظ', slug: 'quran-memorization' },
  { icon: Mic, color: 'blue', title: 'التجويد والتلاوة', desc: 'إتقان أحكام التجويد', slug: 'tajweed' },
  { icon: GraduationCap, color: 'purple', title: 'الإجازات القرآنية', desc: 'سند متصل بالقرآن', slug: 'ijaza' },
  { icon: Globe, color: 'amber', title: 'اللغة العربية', desc: 'لغة القرآن للجميع', slug: 'arabic' },
  { icon: Baby, color: 'pink', title: 'تعليم الأطفال', desc: 'برامج ممتعة للصغار', slug: 'kids' },
  { icon: Heart, color: 'rose', title: 'المسلمون الجدد', desc: 'رحلة إيمانية متكاملة', slug: 'reverts' },
];

export default function LearningPathsSection() {
  const { t } = useI18n();

  return (
    <section className="py-20 bg-gradient-to-b from-white to-emerald-50">
      <div className="container mx-auto px-4">
        <h2 className="section-title">{t.learningPaths?.title || 'مسارات التعلم'}</h2>
        <p className="section-subtitle">{t.learningPaths?.subtitle || 'اختر المسار المناسب لرحلتك التعليمية'}</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {paths.map(({ icon: Icon, color, title, desc, slug }, i) => (
            <motion.div key={slug} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              className="group bg-white/70 backdrop-blur-sm border border-white rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className={`w-14 h-14 rounded-xl bg-${color}-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <Icon className={`text-${color}-600`} size={28} />
              </div>
              <h3 className="text-xl font-bold mb-2">{title}</h3>
              <p className="text-gray-600 mb-4">{desc}</p>
              <LocalizedLink to={`/courses?category=${slug}`} className="text-emerald-600 font-semibold text-sm hover:underline">
                ابدأ المسار ←
              </LocalizedLink>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
