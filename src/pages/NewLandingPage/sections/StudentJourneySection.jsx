import { useI18n } from '../../../i18n';
import {
  BookOpen,
  Repeat2,
  BadgeCheck,
  Sprout,
  Sparkles,
} from 'lucide-react';
import LocalizedLink from '../../../components/LocalizedLink';

export default function StudentJourneySection() {
  const { locale } = useI18n();
  const isAr = locale === 'ar';

  const stages = [
    {
      step: '01',
      icon: BookOpen,
      title: isAr ? 'نتعلّم' : 'Learn',
      text: isAr ? 'نحدد المستوى ونبدأ من الأساس الذي يحتاجه الطالب فعلًا.' : 'We identify the current level and begin from the foundation the learner actually needs.',
    },
    {
      step: '02',
      icon: Repeat2,
      title: isAr ? 'نحفظ ونراجع' : 'Memorize & review',
      text: isAr ? 'نبني عادة ثابتة للحفظ والمراجعة بدل التقدم السريع غير المستقر.' : 'We build steady memorization and review habits instead of unstable fast progress.',
    },
    {
      step: '03',
      icon: BadgeCheck,
      title: isAr ? 'نتقن' : 'Master',
      text: isAr ? 'نركز على جودة التلاوة، التجويد، والتثبيت بحسب المسار.' : 'We focus on recitation quality, Tajweed, and retention according to the chosen path.',
    },
    {
      step: '04',
      icon: Sprout,
      title: isAr ? 'ننمو' : 'Grow',
      text: isAr ? 'الهدف أن يصبح القرآن جزءًا ثابتًا من التعلم والسلوك والحياة اليومية.' : 'The goal is for the Quran to become a lasting part of learning, character, and daily life.',
    },
  ];

  return (
    <section className="wn-home-section wn-home-section--ivory" id="journey">
      <div className="page-container">
        <div className="wn-approved-section-heading">
          <span className="wn-approved-eyebrow">{isAr ? 'رحلة الطالب' : 'THE STUDENT JOURNEY'}</span>
          <h2>{isAr ? 'من أول خطوة إلى عادة قرآنية مستمرة' : 'From the first step to a lasting Quran habit'}</h2>
          <p>{isAr ? 'أربع مراحل بسيطة وواضحة تجعل التقدم مفهومًا للطالب والأسرة.' : 'Four clear stages make progress easier to understand for both learners and families.'}</p>
        </div>

        <div className="wn-journey-grid">
          {stages.map(({ step, icon: Icon, title, text }, index) => (
            <article key={step} className="wn-journey-card">
              <div className="wn-journey-card__head">
                <span className="wn-journey-card__icon"><Icon size={22} strokeWidth={1.55} /></span>
                <span className="wn-journey-card__step">{step}</span>
              </div>
              <h3>{title}</h3>
              <p>{text}</p>
              {index < stages.length - 1 && <span className="wn-journey-card__line" aria-hidden="true" />}
            </article>
          ))}
        </div>

        <div className="wn-journey-cta">
          <div>
            <strong>{isAr ? 'ابدأ من مستواك الحالي، لا من نقطة مفترضة.' : 'Start from your actual level, not an assumed one.'}</strong>
            <span>{isAr ? 'الحصة التعريفية تساعدنا على تحديد المسار الأنسب.' : 'The introductory lesson helps identify the most suitable path.'}</span>
          </div>
          <LocalizedLink to="/free-trial" locale={locale} className="wn-btn wn-btn--primary">
            <Sparkles size={16} />
            {isAr ? 'ابدأ التقييم' : 'Start assessment'}
          </LocalizedLink>
        </div>
      </div>
    </section>
  );
}
