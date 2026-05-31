import { BookOpen, Mic, Globe, Baby, Heart, GraduationCap, ArrowLeft } from 'lucide-react';
import LocalizedLink from './LocalizedLink';
import { useI18n } from '../i18n';

const colorStyles = {
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' },
  blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100' },
  pink: { bg: 'bg-pink-50', text: 'text-pink-600', border: 'border-pink-100' },
  rose: { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-100' },
};

const paths = [
  { icon: BookOpen, color: 'emerald', title: 'تحفيظ القرآن', desc: 'من المبتدئ إلى الحافظ', slug: 'quran-memorization' },
  { icon: Mic, color: 'blue', title: 'التجويد والتلاوة', desc: 'إتقان أحكام التجويد', slug: 'tajweed' },
  { icon: GraduationCap, color: 'purple', title: 'الإجازات القرآنية', desc: 'سند متصل بالقرآن', slug: 'ijaza' },
  { icon: Globe, color: 'amber', title: 'اللغة العربية', desc: 'لغة القرآن للجميع', slug: 'arabic' },
  { icon: Baby, color: 'pink', title: 'تعليم الأطفال', desc: 'برامج ممتعة للصغار', slug: 'kids' },
  { icon: Heart, color: 'rose', title: 'المسلمون الجدد', desc: 'رحلة إيمانية متكاملة', slug: 'reverts' },
];

export default function LearningPathsSection() {
  const { t, locale } = useI18n();

  return (
    <section className="py-20 md:py-24 bg-white border-y border-slate-100">
      <div className="page-container">
        <div className="max-w-2xl mb-12">
          <span className="section-label mb-4">مسارات التعلم</span>
          <h2 className="section-heading">{t.learningPaths?.title || 'مسارات التعلم'}</h2>
          <p className="section-desc">{t.learningPaths?.subtitle || 'اختر المسار المناسب لرحلتك'}</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {paths.map(({ icon: Icon, color, title, desc, slug }) => {
            const s = colorStyles[color] || colorStyles.emerald;
            return (
              <article key={slug} className="card-modern group">
                <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl border ${s.bg} ${s.border} mb-4 group-hover:scale-105 transition-transform`}>
                  <Icon className={s.text} size={22} strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-semibold tracking-tight text-slate-900 mb-1">{title}</h3>
                <p className="text-sm text-slate-600 mb-4">{desc}</p>
                <LocalizedLink to={`/courses?category=${slug}`} locale={locale}
                  className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-600 hover:text-emerald-700">
                  ابدأ المسار <ArrowLeft size={14} strokeWidth={1.5} />
                </LocalizedLink>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
