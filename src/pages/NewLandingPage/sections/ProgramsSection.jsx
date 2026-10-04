import { useI18n } from '../../../i18n';
import {
  BookOpen,
  Award,
  Sparkles,
  ScrollText,
  Languages,
  ArrowLeft,
  ArrowRight,
  Sprout,
} from 'lucide-react';
import LocalizedLink from '../../../components/LocalizedLink';

export default function ProgramsSection() {
  const { locale } = useI18n();
  const isAr = locale === 'ar';
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const programs = [
    {
      id: 'kids',
      icon: Sparkles,
      title: isAr ? 'تحفيظ القرآن للأطفال' : 'Quran for Children',
      desc: isAr ? 'أساليب تفاعلية محببة تغرس صلة الطفل بالقرآن وتبني عادة الحفظ والمراجعة.' : 'Warm, interactive learning that builds love of the Quran and steady memorization habits.',
      to: '/programs/kids',
    },
    {
      id: 'hifz',
      icon: BookOpen,
      title: isAr ? 'الحفظ والمراجعة' : 'Memorization & Review',
      desc: isAr ? 'خطة واضحة للحفظ الجديد والمراجعة المستمرة بما يناسب مستوى الطالب ووقته.' : 'A clear plan for new memorization and consistent revision tailored to each learner.',
      to: '/courses',
    },
    {
      id: 'tajweed',
      icon: Award,
      title: isAr ? 'التلاوة والتجويد' : 'Recitation & Tajweed',
      desc: isAr ? 'تصحيح التلاوة ومخارج الحروف وأحكام التجويد خطوة بخطوة مع تطبيق عملي.' : 'Step-by-step recitation correction, articulation, and practical Tajweed.',
      to: '/courses',
    },
    {
      id: 'understanding',
      icon: Languages,
      title: isAr ? 'التفسير وعلوم القرآن' : 'Quran Understanding',
      desc: isAr ? 'فهم أعمق للمعاني والهدايات وربط القرآن بالحياة والسلوك اليومي.' : 'Deeper understanding of Quranic meanings and practical guidance for daily life.',
      to: '/courses',
    },
    {
      id: 'ijazah',
      icon: ScrollText,
      title: isAr ? 'الإجازة والسند' : 'Ijazah & Sanad',
      desc: isAr ? 'مسار متقدم للمتقنين الراغبين في مواصلة التلقي والقراءة على أهل الاختصاص.' : 'An advanced pathway for proficient learners continuing formal recitation with specialist teachers.',
      to: '/courses',
    },
  ];

  const trust = [
    isAr ? 'تعليم مباشر' : 'Live teaching',
    isAr ? 'متابعة مستمرة' : 'Ongoing follow-up',
    isAr ? 'مواعيد مرنة' : 'Flexible scheduling',
    isAr ? 'مسارات متدرجة' : 'Structured pathways',
    isAr ? 'تجربة عالمية' : 'Global access',
  ];

  return (
    <section className="wn-approved-programs" id="programs">
      <div className="wn-approved-programs__pattern" aria-hidden="true" />
      <div className="page-container relative z-10">
        <div className="wn-approved-section-heading">
          <span className="wn-approved-eyebrow">{isAr ? 'برامجنا القرآنية' : 'OUR PROGRAMMES'}</span>
          <h2>{isAr ? 'رحلة تناسب أهدافك في تعلّم القرآن ونماء إيمانك' : 'A Quran journey designed for every stage'}</h2>
        </div>

        <div className="wn-approved-programs__grid">
          {programs.map(({ id, icon: Icon, title, desc, to }) => (
            <article key={id} className="wn-approved-program-card">
              <div className="wn-approved-program-card__visual">
                <Icon size={34} strokeWidth={1.55} />
              </div>
              <div className="wn-approved-program-card__body">
                <h3>{title}</h3>
                <p>{desc}</p>
                <LocalizedLink to={to} locale={locale} className="wn-approved-program-card__link" aria-label={title}>
                  <ArrowIcon size={16} />
                </LocalizedLink>
              </div>
            </article>
          ))}

          <aside className="wn-approved-programs__manifesto">
            <Sprout size={30} strokeWidth={1.5} />
            <p>{isAr ? 'من القرآن نبدأ… وبالعلم والعمل ننمو.' : 'We begin with revelation — and grow through knowledge and practice.'}</p>
            <span>{isAr ? 'رحلة وحي ونماء' : 'A journey of revelation and growth'}</span>
          </aside>
        </div>

        <div className="wn-approved-trust-bar" aria-label={isAr ? 'مميزات تجربة التعلم' : 'Learning experience benefits'}>
          {trust.map((item, index) => (
            <div key={item} className="wn-approved-trust-bar__item">
              <span>{String(index + 1).padStart(2, '0')}</span>
              <strong>{item}</strong>
            </div>
          ))}
        </div>

        <div className="wn-approved-programs__more">
          <LocalizedLink to="/courses" locale={locale} className="wn-btn wn-btn--secondary">
            <span>{isAr ? 'استكشف جميع البرامج' : 'Explore all programmes'}</span>
            <ArrowIcon size={16} className="wn-btn__arrow" />
          </LocalizedLink>
        </div>
      </div>
    </section>
  );
}
