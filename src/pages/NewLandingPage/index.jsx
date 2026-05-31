import { useState, useEffect } from 'react';
import { useI18n } from '../../i18n';
import { Link } from 'react-router-dom';
import {
  Users, BookOpen, Globe, Award, Clock, Star, ChevronDown, ChevronUp,
  ArrowLeft, CheckCircle2, Sparkles, Mic, GraduationCap, Shield, Video,
} from 'lucide-react';
import GlobalHeader from '../../components/GlobalHeader';
import GlobalFooter from '../../components/GlobalFooter';
import SEOHead from '../../components/SEOHead';
import LearningPathsSection from '../../components/LearningPathsSection';
import LocalizedLink from '../../components/LocalizedLink';

function AnimatedCounter({ end, suffix = '' }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start;
    const tick = (t) => {
      if (!start) start = t;
      const p = Math.min((t - start) / 1800, 1);
      setCount(Math.floor(p * end));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [end]);
  return <span>{count.toLocaleString('ar-EG')}{suffix}</span>;
}

const featureStyles = {
  emerald: { wrap: 'bg-emerald-50 border-emerald-100', icon: 'text-emerald-600' },
  blue: { wrap: 'bg-blue-50 border-blue-100', icon: 'text-blue-600' },
  purple: { wrap: 'bg-purple-50 border-purple-100', icon: 'text-purple-600' },
  amber: { wrap: 'bg-amber-50 border-amber-100', icon: 'text-amber-600' },
  indigo: { wrap: 'bg-indigo-50 border-indigo-100', icon: 'text-indigo-600' },
  rose: { wrap: 'bg-rose-50 border-rose-100', icon: 'text-rose-600' },
};

function HeroSection() {
  const { t } = useI18n();

  return (
    <section className="relative overflow-hidden bg-slate-950 text-white geo-pattern">
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/40 via-slate-950 to-slate-950" />
      <div className="page-container relative pt-16 pb-24 lg:pt-20 lg:pb-28">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <span className="section-label !border-emerald-500/30 !bg-emerald-500/10 !text-emerald-200 mb-6">
              <Globe size={14} /> منصة تعليم قرآن عالمية
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.15] text-white">
              {t.hero.title}
            </h1>
            <p className="mt-5 text-lg text-slate-300 max-w-xl leading-relaxed">
              {t.hero.subtitle}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/register/student" className="btn-primary !bg-emerald-500 hover:!bg-emerald-400">
                {t.hero.cta1} <ArrowLeft size={18} strokeWidth={1.5} />
              </Link>
              <Link to="/teachers" className="btn-ghost-light">
                <Users size={18} strokeWidth={1.5} /> {t.hero.cta2}
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap gap-4 text-sm text-slate-400">
              {['معلمون مجازون', 'حصص Zoom/Jitsi', 'تتبع حفظ ومراجعة', 'شهادات معتمدة'].map((b) => (
                <span key={b} className="flex items-center gap-1.5">
                  <CheckCircle2 size={15} className="text-emerald-400" strokeWidth={1.5} /> {b}
                </span>
              ))}
            </div>
          </div>

          {/* لوحة تقدم — مستوحاة من ilmify / Hifz Academy */}
          <div className="card-dark lg:ml-auto w-full max-w-md border-emerald-500/20">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs text-emerald-300/80">لوحة الطالب</p>
                <p className="text-lg font-semibold tracking-tight">متابعة الحفظ اليومية</p>
              </div>
              <span className="rounded-lg bg-emerald-500/20 px-2.5 py-1 text-xs font-semibold text-emerald-200">جuz 30</span>
            </div>
            <div className="space-y-4">
              {[
                { label: 'سباق (جديد)', val: 85, color: 'bg-emerald-500' },
                { label: 'سبق (مراجعة قريبة)', val: 72, color: 'bg-teal-500' },
                { label: 'منزل (مراجعة بعيدة)', val: 91, color: 'bg-cyan-500' },
              ].map((row) => (
                <div key={row.label}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-slate-300">{row.label}</span>
                    <span className="font-semibold text-white">{row.val}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                    <div className={`h-full rounded-full ${row.color}`} style={{ width: `${row.val}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
                <Video size={18} className="mx-auto mb-1 text-emerald-300" strokeWidth={1.5} />
                <p className="text-xs text-slate-400">حصة غداً</p>
                <p className="text-sm font-semibold">4:00 م</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
                <Sparkles size={18} className="mx-auto mb-1 text-emerald-300" strokeWidth={1.5} />
                <p className="text-xs text-slate-400">تحليل تلاوة</p>
                <p className="text-sm font-semibold">AI جاهز</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatsBar() {
  const { t } = useI18n();
  const stats = [
    { icon: Users, value: 5000, label: t.stats.students, suffix: '+' },
    { icon: GraduationCap, value: 200, label: t.stats.teachers, suffix: '+' },
    { icon: Globe, value: 38, label: t.stats.countries, suffix: '+' },
    { icon: Clock, value: 7600, label: t.stats.sessions, suffix: '+' },
  ];

  return (
    <section className="relative z-10 -mt-10 pb-4">
      <div className="page-container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50">
          {stats.map(({ icon: Icon, value, label, suffix }) => (
            <div key={label} className="text-center md:text-right md:pr-4 md:border-l md:border-slate-100 first:md:border-0">
              <Icon className="mx-auto md:mx-0 mb-2 text-emerald-600" size={22} strokeWidth={1.5} />
              <p className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-900">
                <AnimatedCounter end={value} suffix={suffix} />
              </p>
              <p className="text-sm text-slate-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const { t } = useI18n();
  const features = [
    { Icon: Shield, style: featureStyles.emerald, title: t.features.feature1.title, desc: t.features.feature1.description },
    { Icon: Clock, style: featureStyles.blue, title: t.features.feature2.title, desc: t.features.feature2.description },
    { Icon: BookOpen, style: featureStyles.purple, title: t.features.feature3.title, desc: t.features.feature3.description },
    { Icon: Award, style: featureStyles.amber, title: t.features.feature4.title, desc: t.features.feature4.description },
    { Icon: Globe, style: featureStyles.indigo, title: t.features.feature5.title, desc: t.features.feature5.description },
    { Icon: Sparkles, style: featureStyles.rose, title: t.features.feature6.title, desc: t.features.feature6.description },
  ];

  return (
    <section className="py-20 md:py-24 bg-[#fafafa]">
      <div className="page-container">
        <div className="max-w-2xl mb-12">
          <span className="section-label mb-4">لماذا الأثر؟</span>
          <h2 className="section-heading">{t.features.title}</h2>
          <p className="section-desc">{t.features.subtitle}</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map(({ Icon, style, title, desc }) => (
            <div key={title} className="card-modern group">
              <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl border ${style.wrap} mb-4 group-hover:scale-105 transition-transform`}>
                <Icon className={style.icon} size={22} strokeWidth={1.5} />
              </div>
              <h3 className="text-lg font-semibold tracking-tight text-slate-900 mb-2">{title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AISectionModern() {
  const { locale } = useI18n();
  return (
    <section className="py-20 bg-slate-950 text-white geo-pattern">
      <div className="page-container">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <span className="section-label !bg-white/10 !border-white/20 !text-emerald-200 mb-4">
              <Sparkles size={14} /> مدعوم بالذكاء الاصطناعي
            </span>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">مركز AI لرحلة الحفظ</h2>
            <p className="mt-4 text-slate-400 leading-relaxed">
              مساعد قرآن، تحليل تلاوة بالصوت، وخطط حفظ يومية — مثل أفضل منصات Hifz العالمية.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                { icon: Mic, text: 'تحليل التجويد والتلاوة بالصوت' },
                { icon: BookOpen, text: 'خطط سباق / سبق / منزل يومية' },
                { icon: Sparkles, text: 'مساعد للمعلم والطالب' },
              ].map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3 text-sm text-slate-300">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15">
                    <Icon size={16} className="text-emerald-400" strokeWidth={1.5} />
                  </span>
                  {text}
                </li>
              ))}
            </ul>
            <LocalizedLink to="/ai" locale={locale} className="btn-primary mt-8 !bg-emerald-500">
              جرّب مركز AI <ArrowLeft size={18} />
            </LocalizedLink>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 font-mono text-sm">
            <p className="text-emerald-400 mb-2">// تقرير تلاوة تجريبي</p>
            <div className="space-y-2 text-slate-300">
              <p>التجويد: <span className="text-white font-semibold">82%</span></p>
              <p>المخارج: <span className="text-white font-semibold">78%</span></p>
              <p>الوقف: <span className="text-white font-semibold">85%</span></p>
            </div>
            <p className="mt-4 text-xs text-slate-500">ارفع تسجيلك واحصل على توصيات فورية</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function TeachersSection() {
  const { t } = useI18n();
  const teachers = [
    { id: 1, name: 'الشيخ أحمد محمد', specialty: 'تحفيظ القرآن', rating: 4.9, reviews: 120, initial: 'أ' },
    { id: 2, name: 'الشيخة فاطمة علي', specialty: 'التجويد', rating: 4.8, reviews: 95, initial: 'ف' },
    { id: 3, name: 'الشيخ عمر حسن', specialty: 'اللغة العربية', rating: 4.9, reviews: 150, initial: 'ع' },
  ];

  return (
    <section className="py-20 md:py-24 bg-white">
      <div className="page-container">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
          <div>
            <span className="section-label mb-4">نخبة المعلمين</span>
            <h2 className="section-heading">{t.teachers.title}</h2>
            <p className="section-desc !mx-0">{t.teachers.subtitle}</p>
          </div>
          <Link to="/teachers" className="btn-secondary shrink-0">{t.teachers.viewAll}</Link>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {teachers.map((teacher) => (
            <article key={teacher.id} className="card-modern overflow-hidden !p-0">
              <div className="flex items-center gap-4 p-5 border-b border-slate-100">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-xl font-bold text-white">
                  {teacher.initial}
                </div>
                <div>
                  <h3 className="font-semibold tracking-tight text-slate-900">{teacher.name}</h3>
                  <p className="text-sm text-emerald-600">{teacher.specialty}</p>
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-1.5 mb-4">
                  <Star className="text-amber-400 fill-amber-400" size={16} />
                  <span className="font-semibold text-sm">{teacher.rating}</span>
                  <span className="text-xs text-slate-500">({teacher.reviews} {t.teachers.reviews})</span>
                </div>
                <Link to={`/teachers/${teacher.id}`} className="btn-primary w-full text-sm !py-2.5">
                  {t.teachers.bookTrial}
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  const { t } = useI18n();
  const items = [
    { name: 'أحمد محمود', country: 'مصر 🇪🇬', text: 'تجربة رائعة! تعلمت القرآن بطريقة منظمة مع متابعة يومية.' },
    { name: 'Sarah Johnson', country: 'USA 🇺🇸', text: 'Professional teachers and flexible scheduling worldwide.' },
    { name: 'محمد علي', country: 'السعودية 🇸🇦', text: 'منصة ممتازة للحفظ والمراجعة مع معلمين مجازين.' },
  ];

  return (
    <section className="py-20 bg-[#fafafa]">
      <div className="page-container">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="section-label mb-4">آراء الطلاب</span>
          <h2 className="section-heading">{t.testimonials.title}</h2>
          <p className="section-desc mx-auto">{t.testimonials.subtitle}</p>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {items.map((item) => (
            <blockquote key={item.name} className="card-modern">
              <div className="flex gap-0.5 mb-3">
                {[...Array(5)].map((_, i) => <Star key={i} size={14} className="text-amber-400 fill-amber-400" />)}
              </div>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">&ldquo;{item.text}&rdquo;</p>
              <footer className="text-sm font-semibold text-slate-900">{item.name}</footer>
              <p className="text-xs text-slate-500">{item.country}</p>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQSection() {
  const { t } = useI18n();
  const [open, setOpen] = useState(null);
  const faqs = [
    { q: t.faq.q1, a: t.faq.a1 }, { q: t.faq.q2, a: t.faq.a2 }, { q: t.faq.q3, a: t.faq.a3 },
    { q: t.faq.q4, a: t.faq.a4 }, { q: t.faq.q5, a: t.faq.a5 },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="page-container max-w-3xl">
        <div className="text-center mb-10">
          <h2 className="section-heading">{t.faq.title}</h2>
          <p className="section-desc mx-auto">{t.faq.subtitle}</p>
        </div>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="rounded-xl border border-slate-200 overflow-hidden">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between gap-4 p-4 text-right text-sm font-semibold text-slate-900 hover:bg-slate-50"
              >
                {faq.q}
                {open === i ? <ChevronUp size={18} className="shrink-0 text-emerald-600" /> : <ChevronDown size={18} className="shrink-0 text-slate-400" />}
              </button>
              {open === i && <div className="px-4 pb-4 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">{faq.a}</div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  const { t } = useI18n();
  return (
    <section className="py-20">
      <div className="page-container">
        <div className="rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 px-8 py-14 md:px-16 text-center text-white shadow-xl shadow-emerald-900/20">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">{t.cta.title}</h2>
          <p className="mt-3 text-emerald-100 max-w-xl mx-auto">{t.cta.subtitle}</p>
          <Link to="/register/student" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm font-semibold text-emerald-800 shadow-lg hover:bg-emerald-50 transition">
            {t.cta.button} <ArrowLeft size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function NewLandingPage() {
  const { t } = useI18n();
  return (
    <>
      <SEOHead page={{ title: t.hero.title, description: t.hero.subtitle, url: '/', type: 'website' }} />
      <GlobalHeader />
      <main className="bg-[#fafafa]">
        <HeroSection />
        <StatsBar />
        <FeaturesSection />
        <LearningPathsSection />
        <AISectionModern />
        <TeachersSection />
        <TestimonialsSection />
        <FAQSection />
        <CTASection />
      </main>
      <GlobalFooter />
    </>
  );
}
