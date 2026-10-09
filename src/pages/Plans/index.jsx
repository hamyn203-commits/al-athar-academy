import { useMemo, useState } from 'react';
import {
  ArrowLeft, ArrowRight, BadgeCheck, BookOpenCheck, Check, Clock3,
  Crown, Heart, ShieldCheck, Sparkles, Users, UserRound
} from 'lucide-react';
import GlobalHeader from '../../components/GlobalHeader';
import GlobalFooter from '../../components/GlobalFooter';
import SEOHead from '../../components/SEOHead';
import LocalizedLink from '../../components/LocalizedLink';
import { useI18n } from '../../i18n';
import './plans.css';

const PLAN_DEFS = [
  {
    id: 'community',
    nameAr: 'الحلقة الاقتصادية الكبرى',
    nameEn: 'Community Circle',
    price: 10,
    studentsAr: 'من 10 إلى 15 طالب',
    studentsEn: '10–15 students',
    image: '/images/plans/plan-community.svg',
    badgeAr: 'الأوفر',
    badgeEn: 'Best value',
    tone: 'mint',
    featuresAr: ['حلقة جماعية منظمة', '60 دقيقة', 'تسميع بالدور', 'مناسبة للاستمرار بتكلفة منخفضة'],
    featuresEn: ['Structured group circle', '60 minutes', 'Turn-based recitation', 'Lowest-cost continuous learning'],
  },
  {
    id: 'group',
    nameAr: 'الحلقة الجماعية',
    nameEn: 'Group Circle',
    price: 20,
    studentsAr: 'من 5 إلى 10 طلاب',
    studentsEn: '5–10 students',
    image: '/images/plans/plan-group.svg',
    badgeAr: 'الأكثر طلبًا',
    badgeEn: 'Most popular',
    tone: 'emerald',
    featured: true,
    featuresAr: ['متابعة أكبر لكل طالب', '60 دقيقة', 'وقت تسميع أفضل', 'توازن ممتاز بين السعر والمتابعة'],
    featuresEn: ['More attention per learner', '60 minutes', 'More recitation time', 'Strong price-to-attention balance'],
  },
  {
    id: 'focused',
    nameAr: 'الحلقة المركزة',
    nameEn: 'Focused Circle',
    price: 35,
    studentsAr: 'من 3 إلى 5 طلاب',
    studentsEn: '3–5 students',
    image: '/images/plans/plan-focused.svg',
    badgeAr: 'متابعة أقوى',
    badgeEn: 'More focus',
    tone: 'teal',
    featuresAr: ['مجموعة صغيرة', '60 دقيقة', 'تصحيح وتوجيه أكثر', 'مناسبة للحفظ والمراجعة المكثفة'],
    featuresEn: ['Small group', '60 minutes', 'More correction and coaching', 'Ideal for focused memorization'],
  },
  {
    id: 'mini',
    nameAr: 'الحلقة المصغرة',
    nameEn: 'Mini Circle',
    price: 50,
    studentsAr: 'من 2 إلى 3 طلاب',
    studentsEn: '2–3 students',
    image: '/images/plans/plan-mini.svg',
    badgeAr: 'شبه فردي',
    badgeEn: 'Semi-private',
    tone: 'gold',
    featuresAr: ['اهتمام شبه فردي', '60 دقيقة', 'وقت أكبر للتسميع', 'خطة متابعة أدق'],
    featuresEn: ['Near-private attention', '60 minutes', 'More recitation time', 'More precise follow-up'],
  },
  {
    id: 'private',
    nameAr: 'الحصة الفردية',
    nameEn: 'Private Session',
    price: 100,
    studentsAr: 'طالب واحد',
    studentsEn: '1 student',
    image: '/images/plans/plan-private.svg',
    badgeAr: 'أعلى متابعة',
    badgeEn: 'Maximum attention',
    tone: 'ink',
    from: true,
    featuresAr: ['طالب واحد مع المعلم', '60 دقيقة', 'خطة مخصصة بالكامل', 'أقصى مرونة وتركيز'],
    featuresEn: ['One learner with the tutor', '60 minutes', 'Fully personalized plan', 'Maximum flexibility and focus'],
  },
];

export default function PlansPage() {
  const { locale } = useI18n();
  const isAr = locale === 'ar';
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;
  const [audience, setAudience] = useState('general');
  const [sessionsPerMonth, setSessionsPerMonth] = useState(8);

  const plans = useMemo(() => PLAN_DEFS.map((plan) => ({
    ...plan,
    monthly: plan.price * sessionsPerMonth,
  })), [sessionsPerMonth]);

  const pageTitle = isAr
    ? 'خطط الاشتراك | أكاديمية وحي ونماء'
    : 'Subscription Plans | Wahy Wa Namaa Academy';

  return (
    <>
      <SEOHead
        page={{
          title: pageTitle,
          description: isAr
            ? 'خطط مرنة لتعلّم القرآن تبدأ من 10 جنيه للحصة مع حلقات جماعية، مجموعات مركزة، وحصص فردية، وقسم نسائي مستقل.'
            : 'Flexible Quran learning plans starting from 10 EGP per session, with group, focused, private, and women-only learning options.',
          url: '/plans',
          type: 'website',
        }}
      />
      <GlobalHeader />

      <main className="wn-plans-page">
        <section className="wn-plans-hero">
          <div className="wn-plans-hero__glow" aria-hidden="true" />
          <div className="wn-plans-container wn-plans-hero__grid">
            <div className="wn-plans-hero__copy">
              <span className="wn-plans-kicker"><Sparkles size={16} /> {isAr ? 'خطط تناسب كل بيت' : 'Plans for every learner'}</span>
              <h1>{isAr ? 'ابدأ رحلتك مع القرآن من 10 جنيه للحصة' : 'Start your Quran journey from 10 EGP per session'}</h1>
              <p>
                {isAr
                  ? 'كلما صغر حجم الحلقة زاد وقت المتابعة والتسميع لكل طالب. اختر المستوى الذي يناسب ميزانيتك واحتياجك.'
                  : 'Smaller circles give each learner more recitation and tutor attention. Choose the balance that fits your goals and budget.'}
              </p>
              <div className="wn-plans-hero__proof">
                <span><ShieldCheck size={18} /> {isAr ? 'معلمون ومعلمات معتمدون' : 'Approved tutors'}</span>
                <span><BookOpenCheck size={18} /> {isAr ? 'حفظ وتجويد وتأسيس' : 'Hifz, Tajweed & foundation'}</span>
                <span><Clock3 size={18} /> {isAr ? '60 دقيقة للحصة' : '60-minute sessions'}</span>
              </div>
            </div>

            <div className="wn-plans-hero__visual">
              <img
                src={audience === 'women' ? '/images/plans/plan-women.svg' : '/images/plans/plan-community.svg'}
                alt={isAr
                  ? (audience === 'women' ? 'حلقة قرآن للقسم النسائي' : 'طلاب في حلقة قرآن جماعية')
                  : (audience === 'women' ? 'Women Quran learning circle' : 'Students in a group Quran circle')}
              />
              <div className="wn-plans-hero__price">
                <small>{isAr ? 'تبدأ من' : 'Starting at'}</small>
                <strong>10 <em>{isAr ? 'جنيه' : 'EGP'}</em></strong>
                <span>{isAr ? 'للحصة' : 'per session'}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="wn-plans-control-shell">
          <div className="wn-plans-container">
            <div className="wn-plans-controls">
              <div className="wn-plans-segment" role="tablist" aria-label={isAr ? 'اختيار القسم' : 'Choose section'}>
                <button
                  type="button"
                  role="tab"
                  aria-selected={audience === 'general'}
                  className={audience === 'general' ? 'is-active' : ''}
                  onClick={() => setAudience('general')}
                >
                  <Users size={18} />
                  <span>
                    <strong>{isAr ? 'الحلقات العامة' : 'General circles'}</strong>
                    <small>{isAr ? 'أولاد ورجال حسب العمر والمستوى' : 'Boys and men by age and level'}</small>
                  </span>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={audience === 'women'}
                  className={audience === 'women' ? 'is-active is-women' : 'is-women'}
                  onClick={() => setAudience('women')}
                >
                  <Heart size={18} />
                  <span>
                    <strong>{isAr ? 'القسم الحريمي' : 'Women’s section'}</strong>
                    <small>{isAr ? 'معلمات متخصصات وبيئة مريحة' : 'Female tutors in a comfortable environment'}</small>
                  </span>
                </button>
              </div>

              <div className="wn-plans-frequency" aria-label={isAr ? 'عدد الحصص الشهري' : 'Monthly session count'}>
                <span>{isAr ? 'الاشتراك الشهري' : 'Monthly plan'}</span>
                <button type="button" className={sessionsPerMonth === 8 ? 'is-active' : ''} onClick={() => setSessionsPerMonth(8)}>
                  {isAr ? '8 حصص' : '8 sessions'}
                </button>
                <button type="button" className={sessionsPerMonth === 12 ? 'is-active' : ''} onClick={() => setSessionsPerMonth(12)}>
                  {isAr ? '12 حصة' : '12 sessions'}
                </button>
              </div>
            </div>

            {audience === 'women' && (
              <aside className="wn-plans-women-banner">
                <div className="wn-plans-women-banner__icon"><Heart size={24} /></div>
                <div>
                  <span>{isAr ? 'قسم نسائي متكامل' : 'Dedicated women’s section'}</span>
                  <h2>{isAr ? 'نفس الخطط والأسعار — مع معلمات فقط' : 'Same plans and pricing — female tutors only'}</h2>
                  <p>{isAr ? 'يتم توزيع الطالبات حسب السن والمستوى، مع الحفاظ على الخصوصية وجودة المتابعة.' : 'Learners are grouped by age and level with privacy and consistent academic follow-up.'}</p>
                </div>
                <img src="/images/plans/plan-women.svg" alt="" aria-hidden="true" />
              </aside>
            )}
          </div>
        </section>

        <section className="wn-plans-catalog">
          <div className="wn-plans-container">
            <div className="wn-plans-heading">
              <span>{isAr ? '5 خطط واضحة' : '5 clear plans'}</span>
              <h2>{isAr ? 'كلما قل العدد، زادت المتابعة' : 'Fewer learners. More tutor attention.'}</h2>
              <p>{isAr ? 'السعر المعروض هو سعر الطالب للحصة الواحدة، ويظهر أسفله إجمالي الاشتراك الشهري حسب عدد الحصص المختار.' : 'Prices are per learner, per session. The monthly total updates with your selected session count.'}</p>
            </div>

            <div className="wn-plans-grid">
              {plans.map((plan) => (
                <article key={plan.id} className={'wn-plan-card is-' + plan.tone + (plan.featured ? ' is-featured' : '')}>
                  <div className="wn-plan-card__media">
                    <img src={plan.image} alt={isAr ? plan.nameAr : plan.nameEn} loading="lazy" />
                    <span className="wn-plan-card__badge">{isAr ? plan.badgeAr : plan.badgeEn}</span>
                  </div>

                  <div className="wn-plan-card__body">
                    <div className="wn-plan-card__title">
                      <div>
                        <span>{isAr ? plan.studentsAr : plan.studentsEn}</span>
                        <h3>{isAr ? plan.nameAr : plan.nameEn}</h3>
                      </div>
                      {plan.featured ? <Crown size={22} /> : <BadgeCheck size={21} />}
                    </div>

                    <div className="wn-plan-card__price">
                      <span>{isAr ? (plan.from ? 'من' : '') : (plan.from ? 'from' : '')}</span>
                      <strong>{plan.price}</strong>
                      <div>
                        <b>{isAr ? 'جنيه' : 'EGP'}</b>
                        <small>{isAr ? '/ الحصة' : '/ session'}</small>
                      </div>
                    </div>

                    <div className="wn-plan-card__monthly">
                      <span>{sessionsPerMonth} {isAr ? 'حصص شهريًا' : 'sessions / month'}</span>
                      <strong>{plan.from && (isAr ? 'من ' : 'from ')}{plan.monthly} {isAr ? 'ج' : 'EGP'}</strong>
                    </div>

                    <ul>
                      {(isAr ? plan.featuresAr : plan.featuresEn).map((feature) => (
                        <li key={feature}><Check size={15} /> {feature}</li>
                      ))}
                    </ul>

                    <LocalizedLink
                      to={'/contact?plan=' + encodeURIComponent(plan.id) + '&section=' + audience}
                      locale={locale}
                      className="wn-plan-card__cta"
                    >
                      {isAr ? 'اختيار الخطة' : 'Choose plan'}
                      <ArrowIcon size={17} />
                    </LocalizedLink>
                  </div>
                </article>
              ))}
            </div>

            <div className="wn-plans-note">
              <UserRound size={21} />
              <div>
                <strong>{isAr ? 'التسكين حسب المستوى والعمر' : 'Placement by level and age'}</strong>
                <p>{isAr ? 'بعد الحصة التجريبية نرشح الحلقة الأنسب للطالب. الحلقة الاقتصادية 10 جنيه تبدأ عند اكتمال الحد الأدنى المناسب للتشغيل.' : 'After the trial, we recommend the best-fit circle. The 10 EGP community plan starts once the minimum viable group is formed.'}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="wn-plans-bottom-cta">
          <div className="wn-plans-container">
            <div>
              <span>{isAr ? 'لسه محتار؟' : 'Not sure yet?'}</span>
              <h2>{isAr ? 'ابدأ بالتجربة، وبعدها نرشح لك الخطة الأنسب' : 'Start with a trial, then we recommend the best plan'}</h2>
            </div>
            <LocalizedLink to="/teachers" locale={locale} className="wn-plans-bottom-cta__button">
              {isAr ? 'اختيار معلم' : 'Choose a tutor'}
              <ArrowIcon size={18} />
            </LocalizedLink>
          </div>
        </section>
      </main>

      <GlobalFooter />
    </>
  );
}
