import { useI18n } from '../../../i18n';
import {
  Mic2,
  Radio,
  BarChart3,
  MessageCircleHeart,
  CalendarCheck2,
  BookOpenCheck,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Headphones,
} from 'lucide-react';
import LocalizedLink from '../../../components/LocalizedLink';

function Waveform() {
  return (
    <div className="wn-product-wave" aria-hidden="true">
      {Array.from({ length: 28 }).map((_, index) => <i key={index} style={{ '--i': index }} />)}
    </div>
  );
}

export default function ProductShowcaseSection() {
  const { locale } = useI18n();
  const isAr = locale === 'ar';
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const steps = [
    isAr ? 'استمع للتلاوة' : 'Listen to recitation',
    isAr ? 'راجع الملاحظات' : 'Review feedback',
    isAr ? 'طبّق في الجلسة التالية' : 'Apply it next session',
  ];

  return (
    <section className="wn-product-showcase" id="learning-tools">
      <div className="page-container">
        <div className="wn-section-split-heading wn-product-showcase__heading">
          <div>
            <span className="wn-approved-eyebrow">
              <Sparkles size={14} />
              {isAr ? 'داخل تجربة وحي ونماء' : 'INSIDE WAHY WA NAMAA'}
            </span>
            <h2 className="wn-home-title">
              {isAr ? 'منصة تبدو حديثة… وتظل هادئة حول القرآن' : 'A modern platform that stays quiet around the Quran'}
            </h2>
            <p className="wn-home-lead">
              {isAr
                ? 'بدل أن تكون التقنية هي البطل، نجعلها تعمل في الخلفية لتوضح التقدم، تسهّل المتابعة، وتترك التركيز للمعلم والقرآن.'
                : 'Technology works quietly in the background to clarify progress, simplify follow-up, and keep attention on the teacher and the Quran.'}
            </p>
          </div>

          <span className="wn-product-showcase__demo-label">
            {isAr ? 'واجهة توضيحية للتجربة' : 'Illustrative product preview'}
          </span>
        </div>

        <div className="wn-product-bento">
          <article className="wn-product-tile wn-product-tile--recitation">
            <div className="wn-product-tile__top">
              <span className="wn-product-icon"><Mic2 size={20} /></span>
              <span className="wn-product-status"><i /> {isAr ? 'استوديو التلاوة' : 'Recitation studio'}</span>
            </div>

            <div className="wn-product-recitation">
              <div className="wn-product-recitation__verse">
                <span>{isAr ? 'مقطع التدريب' : 'Practice passage'}</span>
                <p className="font-quran">وَقُل رَّبِّ زِدْنِي عِلْمًا</p>
              </div>
              <Waveform />
              <div className="wn-product-recitation__controls">
                <span><Headphones size={15} /> {isAr ? 'استماع' : 'Listen'}</span>
                <span><Radio size={15} /> {isAr ? 'تسجيل' : 'Record'}</span>
                <span><BookOpenCheck size={15} /> {isAr ? 'مراجعة' : 'Review'}</span>
              </div>
            </div>

            <div className="wn-product-tile__copy">
              <h3>{isAr ? 'التغذية الراجعة جزء من رحلة التعلّم' : 'Feedback becomes part of the learning loop'}</h3>
              <p>{isAr ? 'يسجّل الطالب، يراجع ملاحظاته، ثم يعود للجلسة التالية بصورة أوضح لما يحتاج إلى تحسينه.' : 'The learner records, reviews feedback, and returns to the next lesson with a clearer improvement target.'}</p>
            </div>
          </article>

          <article className="wn-product-tile wn-product-tile--journey">
            <div className="wn-product-tile__top">
              <span className="wn-product-icon wn-product-icon--mint"><BarChart3 size={19} /></span>
              <span className="wn-product-kicker">{isAr ? 'مسار الحفظ' : 'HIFZ JOURNEY'}</span>
            </div>

            <div className="wn-hifz-map" aria-hidden="true">
              <span className="is-done">1</span>
              <i />
              <span className="is-done">2</span>
              <i />
              <span className="is-current">3</span>
              <i />
              <span>4</span>
              <i />
              <span>5</span>
            </div>

            <h3>{isAr ? 'تقدّم مرئي بدل الإحساس بالتشتت' : 'Visible progress instead of scattered activity'}</h3>
            <p>{isAr ? 'الحفظ الجديد، المراجعة، والثبات تظهر كمسار واحد مفهوم للطالب.' : 'New memorization, review, and retention appear as one understandable path.'}</p>
          </article>

          <article className="wn-product-tile wn-product-tile--classroom">
            <div className="wn-product-classroom__screen">
              <div className="wn-product-classroom__teacher">
                <span><Radio size={18} /></span>
                <strong>{isAr ? 'جلسة مباشرة' : 'Live session'}</strong>
                <small>{isAr ? 'المعلم والطالب في مساحة مركزة' : 'Teacher and learner in a focused space'}</small>
              </div>
              <div className="wn-product-classroom__rail">
                <span><CalendarCheck2 size={15} /> {isAr ? 'هدف الحصة' : 'Lesson goal'}</span>
                <span><Mic2 size={15} /> {isAr ? 'دور التلاوة' : 'Recitation turn'}</span>
                <span><CheckCircle2 size={15} /> {isAr ? 'الخطوة التالية' : 'Next step'}</span>
              </div>
            </div>
            <div className="wn-product-tile__copy">
              <h3>{isAr ? 'الفصل المباشر بدون تشتيت' : 'A live classroom without visual noise'}</h3>
              <p>{isAr ? 'كل شيء في الشاشة يخدم الدرس: الاستماع، التسميع، الهدف، والخطوة التالية.' : 'Everything on screen serves the lesson: listening, recitation, the goal, and the next step.'}</p>
            </div>
          </article>

          <article className="wn-product-tile wn-product-tile--family">
            <div className="wn-product-tile__top">
              <span className="wn-product-icon wn-product-icon--gold"><MessageCircleHeart size={19} /></span>
              <span className="wn-product-kicker">{isAr ? 'متابعة الأسرة' : 'FAMILY FOLLOW-UP'}</span>
            </div>

            <div className="wn-family-report">
              {steps.map((step, index) => (
                <div key={step}>
                  <span>{index + 1}</span>
                  <p>{step}</p>
                  <CheckCircle2 size={15} />
                </div>
              ))}
            </div>

            <h3>{isAr ? 'تقرير مفهوم، لا شاشة مليئة بالأرقام' : 'A useful report, not a wall of numbers'}</h3>
            <p>{isAr ? 'يعرف ولي الأمر ما تم، وما يحتاج إلى متابعة، وما هي الخطوة التالية.' : 'Families can understand what happened, what needs attention, and what comes next.'}</p>
          </article>
        </div>

        <div className="wn-product-showcase__cta">
          <LocalizedLink to="/free-trial" locale={locale} className="wn-btn wn-btn--primary">
            <span>{isAr ? 'ابدأ تجربة التعلم' : 'Start the learning experience'}</span>
            <ArrowIcon size={16} className="wn-btn__arrow" />
          </LocalizedLink>
        </div>
      </div>
    </section>
  );
}
