import { useI18n } from '../../../i18n';
import {
  Mic2,
  Video,
  BarChart3,
  MessageCircleHeart,
  LibraryBig,
  Sparkles,
  CheckCircle2,
  Waves,
} from 'lucide-react';
import LocalizedLink from '../../../components/LocalizedLink';

export default function ImmersiveLearningSection() {
  const { locale } = useI18n();
  const isAr = locale === 'ar';

  const features = [
    {
      icon: Mic2,
      title: isAr ? 'تحليل التلاوة بالذكاء الاصطناعي' : 'AI recitation analysis',
      text: isAr
        ? 'تسجيل التلاوة ومراجعة الأداء من داخل المنصة، مع تقارير تساعد الطالب على معرفة نقاط التحسين.'
        : 'Record recitation and review performance inside the platform with feedback that highlights improvement areas.',
    },
    {
      icon: Video,
      title: isAr ? 'فصل قرآني مباشر' : 'Live Quran classroom',
      text: isAr
        ? 'جلسات مباشرة، تسميع، إدارة دور الطالب، ومتابعة الدرس في مكان واحد.'
        : 'Live lessons, recitation turns, and lesson follow-up in one focused classroom experience.',
    },
    {
      icon: BarChart3,
      title: isAr ? 'تقدّم واضح لا مجرد حصص' : 'Visible learning progress',
      text: isAr
        ? 'الحفظ والمراجعة والحضور والتقييم تظهر كرحلة مفهومة بدل معلومات متفرقة.'
        : 'Memorization, review, attendance, and assessment become one understandable learning journey.',
    },
    {
      icon: MessageCircleHeart,
      title: isAr ? 'متابعة الأسرة بسهولة' : 'Family progress updates',
      text: isAr
        ? 'تقارير الجلسات والمتابعة تساعد ولي الأمر على معرفة ما تم وما هي الخطوة التالية.'
        : 'Session reports help families understand what happened and what comes next.',
    },
    {
      icon: LibraryBig,
      title: isAr ? 'مكتبة ومسارات في نفس الحساب' : 'Library and learning paths',
      text: isAr
        ? 'المحتوى، الواجبات، المواد التعليمية، والمسار الدراسي مترابطة داخل تجربة واحدة.'
        : 'Content, assignments, learning resources, and study paths stay connected in one experience.',
    },
  ];

  return (
    <section className="wn-immersive" id="platform-experience">
      <div className="wn-immersive__grid-glow" aria-hidden="true" />
      <div className="page-container wn-immersive__layout">
        <div className="wn-immersive__content">
          <span className="wn-immersive__eyebrow">
            <Sparkles size={14} />
            {isAr ? 'تجربة وحي ونماء الرقمية' : 'THE WAHY WA NAMAA EXPERIENCE'}
          </span>

          <h2>
            {isAr ? (
              <>مش مجرد أكاديمية أونلاين.<br /><strong>منصة قرآنية تتفاعل مع رحلتك.</strong></>
            ) : (
              <>More than online classes.<br /><strong>A Quran platform built around your journey.</strong></>
            )}
          </h2>

          <p className="wn-immersive__lead">
            {isAr
              ? 'جمعنا التعليم المباشر، تحليل التلاوة، المتابعة، وتقارير التقدم داخل تجربة حديثة تحافظ على هدوء وهيبة المحتوى القرآني.'
              : 'Live teaching, recitation analysis, progress follow-up, and reports come together in a modern experience that keeps the Quran at the center.'}
          </p>

          <div className="wn-immersive__features">
            {features.map(({ icon: Icon, title, text }) => (
              <article key={title} className="wn-immersive-feature">
                <span><Icon size={18} strokeWidth={1.6} /></span>
                <div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </article>
            ))}
          </div>

          <LocalizedLink to="/ai" locale={locale} className="wn-btn wn-btn--accent wn-btn--lg">
            <Waves size={17} />
            <span>{isAr ? 'استكشف أدوات المنصة' : 'Explore platform tools'}</span>
          </LocalizedLink>
        </div>

        <div className="wn-quran-3d-stage" aria-label={isAr ? 'عرض بصري ثلاثي الأبعاد لتجربة التعلم' : '3D visual of the learning experience'}>
          <div className="wn-quran-3d-stage__halo" aria-hidden="true" />
          <div className="wn-quran-3d-stage__arch" aria-hidden="true" />

          <div className="wn-quran-book3d" aria-hidden="true">
            <div className="wn-quran-book3d__shadow" />
            <div className="wn-quran-book3d__left">
              <div className="wn-quran-book3d__page-lines">
                <i /><i /><i /><i /><i /><i />
              </div>
            </div>
            <div className="wn-quran-book3d__right">
              <div className="wn-quran-book3d__page-lines">
                <i /><i /><i /><i /><i /><i />
              </div>
            </div>
            <div className="wn-quran-book3d__spine" />
            <div className="wn-quran-book3d__light">✦</div>
          </div>

          <div className="wn-float-card wn-float-card--recite">
            <span className="wn-float-card__icon"><Mic2 size={16} /></span>
            <div>
              <strong>{isAr ? 'تحليل التلاوة' : 'Recitation analysis'}</strong>
              <small>{isAr ? 'تسجيل • مراجعة • تقرير' : 'Record • review • report'}</small>
            </div>
          </div>

          <div className="wn-float-card wn-float-card--progress">
            <div className="wn-progress-ring"><span>72%</span></div>
            <div>
              <strong>{isAr ? 'رحلة الحفظ' : 'Hifz journey'}</strong>
              <small>{isAr ? 'تقدم مرئي ومستمر' : 'Visible ongoing progress'}</small>
            </div>
          </div>

          <div className="wn-float-card wn-float-card--family">
            <span className="wn-float-card__icon"><CheckCircle2 size={16} /></span>
            <div>
              <strong>{isAr ? 'تقرير الجلسة جاهز' : 'Session report ready'}</strong>
              <small>{isAr ? 'متابعة الطالب والأسرة' : 'Student and family follow-up'}</small>
            </div>
          </div>

          <div className="wn-quran-3d-stage__caption">
            <span>{isAr ? 'وَحْيٌ' : 'WAHY'}</span>
            <i />
            <span>{isAr ? 'نَمَاء' : 'NAMAA'}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
