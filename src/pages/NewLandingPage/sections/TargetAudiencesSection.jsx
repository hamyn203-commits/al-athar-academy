import { useI18n } from '../../../i18n';
import {
  Sparkles,
  Users,
  BriefcaseBusiness,
  Globe2,
  Check,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';
import LocalizedLink from '../../../components/LocalizedLink';

export default function TargetAudiencesSection() {
  const { locale } = useI18n();
  const isAr = locale === 'ar';
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const audiences = [
    {
      icon: Sparkles,
      title: isAr ? 'الأطفال' : 'Children',
      eyebrow: isAr ? 'تعلم محبّب ومتدرج' : 'Gentle, engaging learning',
      desc: isAr ? 'جلسات تناسب قدرة الطفل على التركيز، مع بناء علاقة محبة وثابتة مع القرآن.' : 'Age-aware sessions that support attention, confidence, and a positive relationship with the Quran.',
      items: [
        isAr ? 'إيقاع مناسب للعمر' : 'Age-appropriate pacing',
        isAr ? 'تواصل واضح مع الأسرة' : 'Clear family communication',
      ],
    },
    {
      icon: Users,
      title: isAr ? 'الناشئة والشباب' : 'Youth & teens',
      eyebrow: isAr ? 'ثبات وهوية وفهم' : 'Consistency and identity',
      desc: isAr ? 'مسار يساعد على التثبيت والفهم وربط التعلم القرآني بمرحلة البناء والتكوين.' : 'A pathway that supports retention, understanding, and Quran learning through formative years.',
      items: [
        isAr ? 'أهداف قابلة للقياس' : 'Clear learning goals',
        isAr ? 'مراجعة منتظمة' : 'Consistent review',
      ],
    },
    {
      icon: BriefcaseBusiness,
      title: isAr ? 'الكبار والمشغولون' : 'Adults & professionals',
      eyebrow: isAr ? 'مرونة بلا تنازل عن الجودة' : 'Flexible without losing quality',
      desc: isAr ? 'تعلم هادئ يناسب العمل والأسرة، بخطة واقعية يمكن الاستمرار عليها.' : 'Calm, realistic learning that can fit around work and family commitments.',
      items: [
        isAr ? 'مواعيد مرنة حسب التوفر' : 'Flexible available slots',
        isAr ? 'خطة تناسب الوتيرة الشخصية' : 'Personal learning pace',
      ],
    },
    {
      icon: Globe2,
      title: isAr ? 'طلاب من أنحاء العالم' : 'Learners worldwide',
      eyebrow: isAr ? 'تعلم عن بعد' : 'Learn from anywhere',
      desc: isAr ? 'تجربة رقمية تتيح الانضمام من مناطق زمنية مختلفة، مع مطابقة المعلم حسب اللغة المتاحة.' : 'A remote experience designed for different time zones, with teacher matching based on available language support.',
      items: [
        isAr ? 'تعلم من أي مكان' : 'Learn from anywhere',
        isAr ? 'مطابقة حسب اللغة المتاحة' : 'Language-aware matching',
      ],
    },
  ];

  return (
    <section className="wn-home-section wn-home-section--white" id="audiences">
      <div className="page-container">
        <div className="wn-approved-section-heading">
          <span className="wn-approved-eyebrow">{isAr ? 'لكل مرحلة طريقها' : 'A PATH FOR EVERY STAGE'}</span>
          <h2>{isAr ? 'تجربة تتكيّف مع المتعلم، لا العكس' : 'An experience that adapts to the learner'}</h2>
          <p>{isAr ? 'العمر والوقت والهدف عوامل أساسية في اختيار شكل التعلم المناسب.' : 'Age, schedule, and goals all shape the learning experience.'}</p>
        </div>

        <div className="wn-audiences-grid">
          {audiences.map(({ icon: Icon, title, eyebrow, desc, items }) => (
            <article key={title} className="wn-audience-card">
              <span className="wn-icon-box wn-icon-box--gold"><Icon size={21} strokeWidth={1.6} /></span>
              <small>{eyebrow}</small>
              <h3>{title}</h3>
              <p>{desc}</p>
              <div className="wn-audience-card__checks">
                {items.map((item) => <span key={item}><Check size={14} /> {item}</span>)}
              </div>
              <LocalizedLink to="/start" locale={locale} className="wn-audience-card__link">
                <span>{isAr ? 'ابدأ بهذا المسار' : 'Start this path'}</span>
                <ArrowIcon size={14} />
              </LocalizedLink>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
