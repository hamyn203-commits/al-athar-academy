import { Award, BarChart3, BookOpenCheck, CheckCircle2, HeartHandshake, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useI18n } from '../../i18n';
import { localizedPath } from '../../lib/locale';

export default function KidsCompetitionsAndAwards() {
  const { locale } = useI18n();
  const isAr = locale === 'ar';

  const items = [
    {
      icon: BarChart3,
      title: isAr ? 'إنجازات يمكن متابعتها' : 'Progress you can follow',
      text: isAr
        ? 'يتابع الطالب والأسرة الحفظ والمراجعة والحضور من البيانات المسجلة في الحساب.'
        : 'Learners and families can follow memorization, review, and attendance from recorded account data.',
    },
    {
      icon: Award,
      title: isAr ? 'تحفيز مرتبط بالتقدم' : 'Motivation tied to progress',
      text: isAr
        ? 'الأوسمة أو عناصر التحفيز تظهر عندما يحقق الطالب شروطها الفعلية داخل المنصة.'
        : 'Badges and motivation elements appear when the learner actually meets their requirements.',
    },
    {
      icon: HeartHandshake,
      title: isAr ? 'متابعة الأسرة' : 'Family follow-up',
      text: isAr
        ? 'تقارير الجلسات تساعد ولي الأمر على معرفة ما تم وما يحتاج إلى متابعة.'
        : 'Session reports help families understand what was completed and what needs follow-up.',
    },
    {
      icon: BookOpenCheck,
      title: isAr ? 'مسابقات عند الإعلان عنها' : 'Competitions when published',
      text: isAr
        ? 'لو أعلنت الأكاديمية مسابقة فعلية، تظهر مواعيدها وشروطها وجوائزها من النظام وقت النشر.'
        : 'When the academy publishes a real competition, its dates, rules, and prizes are shown from the system.',
    },
  ];

  return (
    <section className="py-16">
      <div className="page-container">
        <div className="text-center max-w-3xl mx-auto mb-8">
          <span className="wn-public-eyebrow">
            <Sparkles size={14} />
            {isAr ? 'تحفيز الأطفال' : 'KIDS MOTIVATION'}
          </span>
          <h2 className="mt-3 font-[var(--wn-font-display)] text-3xl md:text-4xl text-[var(--wn-emerald-deep)]">
            {isAr ? 'نشجّع الطفل على إنجاز حقيقي، لا أرقام تجريبية' : 'Motivation built around real progress'}
          </h2>
          <p className="mt-3 text-sm leading-7 text-[var(--wn-text-secondary)]">
            {isAr
              ? 'كل ما يظهر للطفل والأسرة يجب أن يكون مرتبطًا ببيانات أو إعلان فعلي داخل الأكاديمية.'
              : 'What learners and families see should be connected to real account data or an actual academy announcement.'}
          </p>
        </div>

        <div className="wn-public-feature-grid">
          {items.map(({ icon: Icon, title, text }) => (
            <article key={title} className="wn-public-feature-card">
              <span><Icon size={21} /></span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>

        <div className="flex justify-center mt-7">
          <Link to={localizedPath('/register/student', locale)} className="wn-btn wn-btn--primary">
            <CheckCircle2 size={16} />
            {isAr ? 'ابدأ رحلة الطفل' : 'Start the child’s journey'}
          </Link>
        </div>
      </div>
    </section>
  );
}
