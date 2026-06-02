import { useState, useEffect, useRef } from 'react';
import { useI18n } from '../../i18n';
import { Link } from 'react-router-dom';
import {
  Users, BookOpen, Globe, Award, Clock, Star, ChevronDown, ChevronUp,
  ArrowLeft, CheckCircle2, Sparkles, Mic, GraduationCap, Shield, Video,
  Play, Quote, Zap, BookMarked, HeartHandshake,
} from 'lucide-react';
import GlobalHeader from '../../components/GlobalHeader';
import GlobalFooter from '../../components/GlobalFooter';
import SEOHead from '../../components/SEOHead';
import LocalizedLink from '../../components/LocalizedLink';

/* ─── Scroll Reveal Hook ─── */
function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!window.IntersectionObserver) {
      el.classList.add('visible');
      return;
    }
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('visible');
          obs.disconnect();
        }
      },
      { threshold: 0.02 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

/* ─── Animated Counter ─── */
function AnimatedCounter({ end, suffix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      obs.disconnect();
      let start;
      const tick = (t) => {
        if (!start) start = t;
        const p = Math.min((t - start) / 1800, 1);
        setCount(Math.floor(p * end));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [end]);
  return <span ref={ref}>{count.toLocaleString('ar-EG')}{suffix}</span>;
}

/* ─── Gold Divider ─── */
function GoldDivider({ center = false }) {
  return (
    <div className={`gold-divider my-5 ${center ? 'mx-auto' : ''}`} aria-hidden="true" />
  );
}

/* ══════════════════════════════════════════
   1. HERO SECTION
══════════════════════════════════════════ */
function HeroSection() {
  const { t } = useI18n();
  const textRef = useReveal();

  return (
    <section className="geo-pattern-light relative overflow-hidden min-h-[92vh] flex items-center">
      {/* Top gradient accent */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[var(--athar-gold)] to-transparent" aria-hidden="true" />

      <div className="page-container relative w-full py-20 lg:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">

          {/* ── Text ── */}
          <div ref={textRef} className="reveal order-2 lg:order-1">
            <span className="section-label mb-6 inline-flex">
              <Globe size={13} aria-hidden="true" />
              منصة تعليم قرآن عالمية
            </span>

            <h1
              className="font-naskh text-5xl md:text-6xl lg:text-[4rem] font-bold leading-[1.15] text-[var(--athar-text)] text-pretty"
              style={{ letterSpacing: '-0.01em' }}
            >
              {t.hero.title}
            </h1>

            <GoldDivider />

            <p className="text-lg text-[var(--athar-text-muted)] max-w-xl leading-relaxed text-pretty">
              {t.hero.subtitle}
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/register/student" className="btn-gold text-base px-7 py-3.5">
                {t.hero.cta1}
                <ArrowLeft size={18} strokeWidth={1.5} aria-hidden="true" />
              </Link>
              <Link
                to="/teachers"
                className="inline-flex items-center gap-2 rounded-xl border border-[var(--athar-gold)]/40 bg-white px-7 py-3.5 text-sm font-semibold text-[var(--athar-gold-muted)] shadow-sm hover:border-[var(--athar-gold)] hover:bg-[var(--athar-gold-50)] transition"
              >
                <Users size={18} strokeWidth={1.5} aria-hidden="true" />
                {t.hero.cta2}
              </Link>
            </div>

            {/* Trust badges */}
            <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2">
              {['معلمون مجازون', 'ترجمة فورية', 'تتبع الحفظ', 'شهادات معتمدة'].map((b) => (
                <span key={b} className="flex items-center gap-1.5 text-sm text-[var(--athar-text-muted)]">
                  <CheckCircle2 size={15} className="text-[var(--athar-gold)]" strokeWidth={2} aria-hidden="true" />
                  {b}
                </span>
              ))}
            </div>

            {/* Quick links */}
            <div className="mt-6 flex flex-wrap gap-2">
              {[
                { to: '/library', label: 'المكتبة', icon: BookOpen },
                { to: '/leaderboard', label: 'البطولة', icon: Award },
                { to: '/programs/kids', label: 'أطفال', icon: Sparkles },
                { to: '/programs/women', label: 'نساء', icon: Shield },
                { to: '/donate', label: 'تبرع', icon: HeartHandshake },
                { to: '/ai', label: 'مركز AI', icon: Mic },
              ].map(({ to, label, icon: Icon }) => (
                <LocalizedLink
                  key={to}
                  to={to}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[var(--athar-gold)]/30 bg-[var(--athar-gold-50)] px-3 py-1.5 text-xs font-medium text-[var(--athar-gold-muted)] hover:bg-[var(--athar-gold-100)] hover:border-[var(--athar-gold)]/60 transition"
                >
                  <Icon size={12} aria-hidden="true" />
                  {label}
                </LocalizedLink>
              ))}
            </div>
          </div>

          {/* ── Illustration ── */}
          <div className="order-1 lg:order-2 flex justify-center lg:justify-end reveal reveal-delay-2">
            <div className="relative w-full max-w-md">
              {/* Glow behind image */}
              <div
                className="absolute inset-0 rounded-3xl"
                style={{ background: 'radial-gradient(ellipse at 50% 60%, rgba(201,162,39,0.18) 0%, transparent 70%)' }}
                aria-hidden="true"
              />
              <img
                src="/hero-illustration.png"
                alt="شيخ يقرأ القرآن الكريم"
                className="relative w-full h-auto drop-shadow-2xl"
                style={{ filter: 'drop-shadow(0 20px 40px rgba(201,162,39,0.2))' }}
              />
              {/* Floating badge */}
              <div className="absolute -bottom-4 -right-4 glass-card px-4 py-3 flex items-center gap-2.5 shadow-lg">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--athar-gold-100)]">
                  <Sparkles size={18} className="text-[var(--athar-gold)]" />
                </span>
                <div>
                  <p className="text-xs text-[var(--athar-text-muted)]">تحليل التلاوة</p>
                  <p className="text-sm font-semibold text-[var(--athar-text)]">AI جاهز</p>
                </div>
              </div>
              {/* Floating badge 2 */}
              <div className="absolute -top-4 -left-4 glass-card px-4 py-3 flex items-center gap-2.5 shadow-lg">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50">
                  <CheckCircle2 size={18} className="text-emerald-600" />
                </span>
                <div>
                  <p className="text-xs text-[var(--athar-text-muted)]">معلمون</p>
                  <p className="text-sm font-semibold text-[var(--athar-text)]">+200 مجاز</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-white to-transparent" aria-hidden="true" />
    </section>
  );
}

/* ══════════════════════════════════════════
   2. SOCIAL PROOF MARQUEE
══════════════════════════════════════════ */
const testimonialItems = [
  { name: 'أحمد محمود', country: '🇪🇬 مصر', text: 'تجربة رائعة! تعلمت القرآن بطريقة منظمة.' },
  { name: 'Sarah Johnson', country: '🇺🇸 USA', text: 'Professional teachers and flexible scheduling.' },
  { name: 'محمد العمري', country: '🇸🇦 السعودية', text: 'منصة ممتازة للحفظ مع معلمين مجازين.' },
  { name: 'Amina Hassan', country: '🇬🇧 UK', text: 'The AI recitation tool is simply incredible.' },
  { name: 'يوسف بكر', country: '🇹🇷 تركيا', text: 'أفضل منصة لتعلم التجويد بالعربية.' },
  { name: 'Fatima Al-Zahra', country: '🇲🇾 Malaysia', text: 'My kids love the kids program so much!' },
];

function SocialProofStrip() {
  const doubled = [...testimonialItems, ...testimonialItems];
  return (
    <section className="border-y border-[var(--athar-cream-dark)] bg-white py-5 overflow-hidden" aria-label="آراء الطلاب">
      <div className="marquee-track gap-5">
        {doubled.map((item, i) => (
          <div
            key={i}
            className="flex-shrink-0 flex items-center gap-3 rounded-2xl border border-[var(--athar-cream-dark)] bg-[var(--athar-gold-50)] px-5 py-3 mx-2.5"
            style={{ minWidth: '260px' }}
          >
            <Quote size={16} className="text-[var(--athar-gold)] shrink-0" strokeWidth={1.5} />
            <div>
              <p className="text-xs text-[var(--athar-text-muted)] line-clamp-1">"{item.text}"</p>
              <p className="text-xs font-semibold text-[var(--athar-text)] mt-0.5">{item.name} · {item.country}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════
   3. STATS BAR
══════════════════════════════════════════ */
function StatsBar() {
  const { t } = useI18n();
  const ref = useReveal();
  const stats = [
    { icon: Users, value: 5000, label: t.stats.students, suffix: '+' },
    { icon: GraduationCap, value: 200, label: t.stats.teachers, suffix: '+' },
    { icon: Globe, value: 38, label: t.stats.countries, suffix: '+' },
    { icon: Clock, value: 7600, label: t.stats.sessions, suffix: '+' },
  ];

  return (
    <section className="py-12 bg-white">
      <div className="page-container">
        <div ref={ref} className="reveal grid grid-cols-2 md:grid-cols-4 gap-px bg-[var(--athar-cream-dark)] rounded-2xl overflow-hidden shadow-sm ring-1 ring-[var(--athar-gold)]/20">
          {stats.map(({ icon: Icon, value, label, suffix }, idx) => (
            <div
              key={label}
              className="bg-white flex flex-col items-center justify-center py-8 px-4 text-center group hover:bg-[var(--athar-gold-50)] transition-colors duration-200"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--athar-gold-100)] mb-3 group-hover:scale-110 transition-transform">
                <Icon className="text-[var(--athar-gold)]" size={22} strokeWidth={1.5} />
              </span>
              <p className="font-naskh text-3xl font-bold text-[var(--athar-text)]">
                <AnimatedCounter end={value} suffix={suffix} />
              </p>
              <p className="text-sm text-[var(--athar-text-muted)] mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════
   4. FEATURES (GLASSMORPHISM)
══════════════════════════════════════════ */
function FeaturesSection() {
  const { t } = useI18n();
  const ref = useReveal();

  const features = [
    { Icon: Shield, bg: 'bg-emerald-50', iconCls: 'text-emerald-600', title: t.features.feature1.title, desc: t.features.feature1.description, delay: '' },
    { Icon: Clock, bg: 'bg-blue-50', iconCls: 'text-blue-600', title: t.features.feature2.title, desc: t.features.feature2.description, delay: 'reveal-delay-1' },
    { Icon: BookOpen, bg: 'bg-purple-50', iconCls: 'text-purple-600', title: t.features.feature3.title, desc: t.features.feature3.description, delay: 'reveal-delay-2' },
    { Icon: Award, bg: 'bg-amber-50', iconCls: 'text-amber-600', title: t.features.feature4.title, desc: t.features.feature4.description, delay: 'reveal-delay-3' },
    { Icon: Globe, bg: 'bg-indigo-50', iconCls: 'text-indigo-600', title: t.features.feature5.title, desc: t.features.feature5.description, delay: 'reveal-delay-4' },
    { Icon: Sparkles, bg: 'bg-rose-50', iconCls: 'text-rose-600', title: t.features.feature6.title, desc: t.features.feature6.description, delay: 'reveal-delay-5' },
  ];

  return (
    <section
      className="py-24 relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg, var(--athar-gold-50) 0%, #fff 40%, var(--athar-gold-50) 100%)' }}
    >
      {/* Background arabesque accent */}
      <div
        className="absolute top-0 left-0 w-64 h-64 opacity-30 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23c9a227' stroke-opacity='0.15' stroke-width='1'%3E%3Cpath d='M100 20l12 36 36 12-36 12-12 36-12-36-36-12 36-12z'/%3E%3Cpath d='M100 60l6 18 18 6-18 6-6 18-6-18-18-6 18-6z'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: 'cover',
        }}
        aria-hidden="true"
      />

      <div className="page-container relative">
        <div ref={ref} className="reveal max-w-2xl mb-14">
          <span className="section-label mb-4">لماذا الأثر؟</span>
          <h2 className="section-heading mt-4">{t.features.title}</h2>
          <GoldDivider />
          <p className="section-desc !mt-2">{t.features.subtitle}</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map(({ Icon, bg, iconCls, title, desc, delay }) => {
            const cardRef = useReveal();
            return (
              <div key={title} ref={cardRef} className={`glass-card p-7 reveal ${delay}`}>
                <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${bg} mb-5`}>
                  <Icon className={iconCls} size={22} strokeWidth={1.5} />
                </div>
                <h3 className="font-naskh text-xl font-semibold text-[var(--athar-text)] mb-2">{title}</h3>
                <p className="text-sm text-[var(--athar-text-muted)] leading-relaxed">{desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════
   5. COURSE TIMELINE
══════════════════════════════════════════ */
const timelineSteps = [
  { icon: BookMarked, label: 'مبتدئ', title: 'تعلّم القراءة', desc: 'أساسيات النطق والتجويد مع معلم متخصص', color: 'bg-emerald-500', light: 'bg-emerald-50', text: 'text-emerald-600' },
  { icon: Mic, label: 'متوسط', title: 'صحّح التلاوة', desc: 'تحليل صوتي بالذكاء الاصطناعي وتصحيح فوري', color: 'bg-[var(--athar-gold)]', light: 'bg-[var(--athar-gold-100)]', text: 'text-[var(--athar-gold-muted)]' },
  { icon: BookOpen, label: 'متقدم', title: 'ابدأ الحفظ', desc: 'نظام سباق/سبق/منزل المُثبَت علمياً', color: 'bg-blue-500', light: 'bg-blue-50', text: 'text-blue-600' },
  { icon: Award, label: 'خريج', title: 'احصل على شهادتك', desc: 'شهادة معتمدة رقمياً بعد إتمام الدورة', color: 'bg-purple-500', light: 'bg-purple-50', text: 'text-purple-600' },
];

function CourseTimelineSection() {
  const ref = useReveal();
  return (
    <section className="py-24 bg-white">
      <div className="page-container">
        <div ref={ref} className="reveal text-center max-w-2xl mx-auto mb-16">
          <span className="section-label mb-4">مسار التعلم</span>
          <h2 className="section-heading mt-4">رحلتك من الصفر إلى الإجازة</h2>
          <GoldDivider center />
          <p className="section-desc mx-auto !mt-2">أربع مراحل واضحة تأخذك من البداية حتى الاحتراف</p>
        </div>

        <div className="relative">
          {/* Connecting line */}
          <div
            className="absolute top-10 right-10 left-10 h-0.5 hidden lg:block"
            style={{ background: 'linear-gradient(90deg, var(--athar-gold-200), var(--athar-gold), var(--athar-gold-200))' }}
            aria-hidden="true"
          />

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {timelineSteps.map(({ icon: Icon, label, title, desc, color, light, text }, idx) => {
              const stepRef = useReveal();
              return (
                <div key={title} ref={stepRef} className={`reveal reveal-delay-${idx + 1} flex flex-col items-center text-center`}>
                  {/* Step circle */}
                  <div className={`relative flex h-20 w-20 items-center justify-center rounded-full ${light} ring-4 ring-white shadow-md mb-5 group-hover:scale-110 transition-transform`}>
                    <Icon className={text} size={28} strokeWidth={1.5} />
                    <span className={`absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full ${color} text-white text-xs font-bold ring-2 ring-white`}>
                      {idx + 1}
                    </span>
                  </div>
                  <span className={`text-xs font-semibold ${text} mb-1`}>{label}</span>
                  <h3 className="font-naskh text-lg font-bold text-[var(--athar-text)] mb-2">{title}</h3>
                  <p className="text-sm text-[var(--athar-text-muted)] leading-relaxed">{desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════
   6. AI SECTION (GOLD BG)
══════════════════════════════════════════ */
function AISectionModern() {
  const { locale } = useI18n();
  const ref = useReveal();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentWord, setCurrentWord] = useState(-1);
  const [showError, setShowError] = useState(false);
  const [scores, setScores] = useState({ tajweed: 82, makharij: 78, waqf: 85 });

  useEffect(() => {
    if (!isPlaying) {
      setCurrentWord(-1);
      setShowError(false);
      return;
    }

    const timers = [];

    // Word 0: الْحَمْدُ (correct)
    timers.push(setTimeout(() => {
      setCurrentWord(0);
      setScores(prev => ({ ...prev, makharij: 83 }));
    }, 800));

    // Word 1: لِلَّهِ (correct)
    timers.push(setTimeout(() => {
      setCurrentWord(1);
      setScores(prev => ({ ...prev, waqf: 88 }));
    }, 1800));

    // Word 2: رَبِّ (simulated error - student said "rabbu")
    timers.push(setTimeout(() => {
      setCurrentWord(2);
      setShowError(true);
      setScores(prev => ({ ...prev, tajweed: 70 }));
    }, 2800));

    // Word 3: الْعَالَمِينَ (correct)
    timers.push(setTimeout(() => {
      setCurrentWord(3);
      setScores({ tajweed: 89, makharij: 88, waqf: 92 });
    }, 4200));

    // Stop demo after 5.5s
    timers.push(setTimeout(() => {
      setIsPlaying(false);
    }, 5500));

    return () => timers.forEach(clearTimeout);
  }, [isPlaying]);

  const words = [
    { text: "الْحَمْدُ", correct: true },
    { text: "لِلَّهِ", correct: true },
    { text: "رَبِّ", correct: false, errorText: "تنبيه تشكيل: نُطقت بالضم (رَبُّ) والموضع مجرور بالكسرة (رَبِّ)" },
    { text: "الْعَالَمِينَ", correct: true }
  ];

  return (
    <section
      className="relative py-24 overflow-hidden"
      style={{ background: 'linear-gradient(135deg, var(--athar-gold-50) 0%, var(--athar-gold-100) 50%, var(--athar-gold-50) 100%)' }}
    >
      {/* Arabesque watermark */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23c9a227' stroke-opacity='0.25' stroke-width='0.7'%3E%3Cpath d='M60 12l8 24 24 8-24 8-8 24-8-24-24-8 24-8z'/%3E%3C/g%3E%3C/svg%3E")`,
        }}
        aria-hidden="true"
      />

      <div className="page-container relative">
        <div ref={ref} className="reveal grid lg:grid-cols-2 gap-12 items-center">

          {/* Text */}
          <div>
            <span className="section-label mb-4">
              <Zap size={14} aria-hidden="true" />
              مدعوم بالذكاء الاصطناعي
            </span>
            <h2 className="font-naskh text-4xl font-bold text-[var(--athar-text)] mt-4">
              مركز AI لرحلة الحفظ
            </h2>
            <GoldDivider />
            <p className="text-[var(--athar-text-muted)] leading-relaxed">
              مساعد قرآن، تحليل تلاوة بالصوت، وخطط حفظ يومية — مثل أفضل منصات Hifz العالمية.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                { icon: Mic, text: 'تحليل التجويد والتلاوة بالصوت' },
                { icon: BookOpen, text: 'خطط سباق / سبق / منزل يومية' },
                { icon: Sparkles, text: 'مساعد ذكي للمعلم والطالب' },
              ].map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3 text-sm text-[var(--athar-text)]">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/70 shadow-sm border border-[var(--athar-gold)]/20">
                    <Icon size={16} className="text-[var(--athar-gold)]" strokeWidth={1.5} />
                  </span>
                  {text}
                </li>
              ))}
            </ul>
            <LocalizedLink to="/ai" locale={locale} className="btn-gold mt-8 inline-flex">
              جرّب مركز AI
              <ArrowLeft size={18} aria-hidden="true" />
            </LocalizedLink>
          </div>

          {/* Dynamic AI Recitation Card */}
          <div className="glass-card p-7 border-2 transition-all relative overflow-hidden" style={{ borderColor: isPlaying ? 'var(--athar-gold)' : 'rgba(201,162,39,0.2)' }}>
            <div className="flex items-center justify-between gap-3 mb-6">
              <div className="flex items-center gap-3">
                <span className={`flex h-10 w-10 items-center justify-center rounded-xl transition ${isPlaying ? 'bg-red-100 text-red-600' : 'bg-[var(--athar-gold-100)] text-[var(--athar-gold)]'}`}>
                  {isPlaying ? <span className="flex h-2.5 w-2.5 rounded-full bg-red-600 animate-ping" /> : <Mic size={18} strokeWidth={1.5} />}
                </span>
                <div>
                  <p className="text-xs text-[var(--athar-text-muted)]">{isPlaying ? 'جاري الاستماع للتلاوة...' : 'محاكاة تلاوة تجريبية'}</p>
                  <p className="text-sm font-semibold text-[var(--athar-text)]">سورة الفاتحة (الآية 2)</p>
                </div>
              </div>
              
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold transition shadow-sm ${isPlaying ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100' : 'bg-[var(--athar-gold-100)] text-[var(--athar-gold-muted)] border border-[var(--athar-gold)]/30 hover:bg-[var(--athar-gold-200)]'}`}
              >
                <Play size={10} className={isPlaying ? 'hidden' : 'inline'} />
                {isPlaying ? 'إيقاف المحاكاة' : 'تشغيل المحاكاة'}
              </button>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-6 text-center">
              <p className="font-naskh text-2xl font-bold leading-loose text-slate-800 flex items-center justify-center gap-2 flex-wrap">
                {words.map((w, idx) => {
                  const isHighlighted = idx === currentWord;
                  const isPast = idx < currentWord;
                  let colorClass = 'text-slate-400';
                  
                  if (isHighlighted) {
                    colorClass = w.correct ? 'text-emerald-600 font-extrabold scale-105' : 'text-red-600 font-extrabold scale-105';
                  } else if (isPast) {
                    colorClass = w.correct ? 'text-slate-800' : 'text-red-500';
                  }
                  
                  return (
                    <span
                      key={idx}
                      className={`transition-all duration-300 relative group cursor-help ${colorClass}`}
                    >
                      {w.text}
                      {!w.correct && idx <= currentWord && (
                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-slate-800 text-white text-[10px] p-2 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition duration-200 z-10 pointer-events-none leading-normal">
                          {w.errorText}
                        </span>
                      )}
                    </span>
                  );
                })}
              </p>
              
              <div className="flex items-center justify-center gap-1 h-6 mt-4">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((bar) => (
                  <div
                    key={bar}
                    className="w-1 rounded-full bg-[var(--athar-gold)] transition-all duration-300"
                    style={{
                      height: isPlaying ? `${Math.floor(Math.random() * 18) + 6}px` : '4px',
                      opacity: isPlaying ? 0.8 : 0.3,
                    }}
                  />
                ))}
              </div>
            </div>

            {[
              { label: 'التجويد ونبرات الصوت', val: scores.tajweed, color: 'bg-[var(--athar-gold)]' },
              { label: 'مخارج الحروف الفموية', val: scores.makharij, color: 'bg-emerald-500' },
              { label: 'الوقف والابتداء والقراءة الصحيحة', val: scores.waqf, color: 'bg-blue-500' },
            ].map(({ label, val, color }) => (
              <div key={label} className="mb-4">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-[var(--athar-text-muted)]">{label}</span>
                  <span className="font-bold text-[var(--athar-text)]">{val}%</span>
                </div>
                <div className="h-2 rounded-full bg-[var(--athar-gold-200)] overflow-hidden">
                  <div
                    className={`h-full rounded-full ${color} transition-all duration-500`}
                    style={{ width: `${val}%` }}
                  />
                </div>
              </div>
            ))}

            <p className="mt-4 text-xs text-[var(--athar-text-muted)] border-t border-[var(--athar-gold)]/20 pt-4 text-center">
              {isPlaying ? 'الذكاء الاصطناعي يقوم بتحليل التلاوة ومطابقتها...' : 'جرّب التلاوة بصوتك في لوحة الطالب للحصول على تقييم فوري'}
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════
   7. TEACHERS SECTION
══════════════════════════════════════════ */
function TeachersSection() {
  const { t } = useI18n();
  const ref = useReveal();
  const teachers = [
    { id: 1, name: 'الشيخ أحمد محمد', specialty: 'تحفيظ القرآن', rating: 4.9, reviews: 120, initial: 'أ', from: 'emerald' },
    { id: 2, name: 'الشيخة فاطمة علي', specialty: 'التجويد', rating: 4.8, reviews: 95, initial: 'ف', from: 'amber' },
    { id: 3, name: 'الشيخ عمر حسن', specialty: 'اللغة العربية', rating: 4.9, reviews: 150, initial: 'ع', from: 'blue' },
  ];

  const gradients = {
    emerald: 'from-emerald-400 to-teal-600',
    amber: 'from-amber-400 to-orange-500',
    blue: 'from-blue-400 to-indigo-600',
  };

  return (
    <section className="py-24 bg-white">
      <div className="page-container">
        <div ref={ref} className="reveal flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-14">
          <div>
            <span className="section-label mb-4">نخبة المعلمين</span>
            <h2 className="section-heading mt-4">{t.teachers.title}</h2>
            <GoldDivider />
            <p className="section-desc !mx-0 !mt-2">{t.teachers.subtitle}</p>
          </div>
          <Link to="/teachers" className="btn-secondary shrink-0">{t.teachers.viewAll}</Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {teachers.map((teacher, idx) => {
            const cardRef = useReveal();
            return (
              <article key={teacher.id} ref={cardRef} className={`glass-card overflow-hidden !p-0 reveal reveal-delay-${idx + 1}`}>
                {/* Gold top accent */}
                <div className="h-1 bg-gradient-to-r from-[var(--athar-gold-200)] via-[var(--athar-gold)] to-[var(--athar-gold-200)]" />
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-5">
                    <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${gradients[teacher.from]} text-2xl font-bold text-white shadow-md`}>
                      {teacher.initial}
                    </div>
                    <div>
                      <h3 className="font-naskh text-lg font-bold text-[var(--athar-text)]">{teacher.name}</h3>
                      <p className="text-sm text-[var(--athar-gold-muted)]">{teacher.specialty}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 mb-5">
                    <Star className="text-amber-400 fill-amber-400" size={15} />
                    <span className="font-semibold text-sm text-[var(--athar-text)]">{teacher.rating}</span>
                    <span className="text-xs text-[var(--athar-text-muted)]">({teacher.reviews} {t.teachers.reviews})</span>
                  </div>
                  <Link
                    to={`/teachers/${teacher.id}`}
                    className="btn-gold w-full justify-center text-sm !py-2.5"
                  >
                    {t.teachers.bookTrial}
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════
   Interactive Plan Calculator (Moddakir/Iqra Style)
══════════════════════════════════════════ */
function InteractivePlannerSection() {
  const ref = useReveal();
  const [path, setPath] = useState('hifz');
  const [frequency, setFrequency] = useState(2);
  const [level, setLevel] = useState('beginner');

  const getEstimatedDuration = () => {
    if (path === 'hifz') {
      if (frequency === 1) return '4.5 سنوات';
      if (frequency === 2) return '2.5 سنة';
      if (frequency === 3) return '1.5 سنة';
      return '10 أشهر';
    } else if (path === 'tajweed') {
      if (frequency === 1) return '6 أشهر';
      if (frequency === 2) return '4 أشهر';
      if (frequency === 3) return '3 أشهر';
      return '6 أسابيع';
    } else {
      if (frequency === 1) return '1.5 سنة';
      if (frequency === 2) return '9 أشهر';
      if (frequency === 3) return '6 أشهر';
      return '3 أشهر';
    }
  };

  const getEstimatedPrice = () => {
    const monthlyHours = frequency * 4;
    const usdPrice = monthlyHours * 10;
    const egpPrice = monthlyHours * 50;
    return { usd: usdPrice, egp: egpPrice };
  };

  const prices = getEstimatedPrice();
  const duration = getEstimatedDuration();

  return (
    <section className="py-24 bg-white relative overflow-hidden" id="planner">
      <div className="absolute inset-0 opacity-5 pointer-events-none geo-pattern" aria-hidden="true" />
      <div className="page-container relative">
        <div ref={ref} className="reveal text-center max-w-2xl mx-auto mb-16">
          <span className="section-label mb-4">مخطط الدراسة الذكي</span>
          <h2 className="section-heading mt-4">احسب خطتك الدراسية المخصصة</h2>
          <GoldDivider center />
          <p className="section-desc mx-auto !mt-2">حدد أهدافك وعدد الساعات لتصميم خطة تتناسب مع وقتك وميزانيتك</p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8 items-start">
          <div className="lg:col-span-3 glass-card p-8 space-y-6">
            <div>
              <label className="block text-sm font-bold text-[var(--athar-text)] mb-3">1. حدد المسار التعليمي:</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'hifz', label: 'حفظ القرآن وتجويده', desc: 'للكبار والصغار' },
                  { id: 'tajweed', label: 'أحكام التجويد والنطق', desc: 'تصحيح ومخارج الحروف' },
                  { id: 'arabic', label: 'اللغة العربية الفصحى', desc: 'لغير الناطقين بها' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setPath(opt.id)}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border text-center transition ${path === opt.id ? 'border-[var(--athar-gold)] bg-[var(--athar-gold-50)] text-[var(--athar-gold-muted)] font-semibold shadow-sm' : 'border-[var(--athar-cream-dark)] hover:border-slate-300'}`}
                  >
                    <span className="text-sm">{opt.label}</span>
                    <span className="text-[10px] text-[var(--athar-text-muted)] mt-1">{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-[var(--athar-text)] mb-3">2. المستوى الحالي للدارس:</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'beginner', label: 'مبتدئ', desc: 'لا يعرف القراءة' },
                  { id: 'intermediate', label: 'متوسط', desc: 'يقرأ ولكن يحتاج ضبطاً' },
                  { id: 'advanced', label: 'متقدم', desc: 'حافظ ويبحث عن السند' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setLevel(opt.id)}
                    className={`flex flex-col p-3 rounded-xl border text-center transition ${level === opt.id ? 'border-[var(--athar-gold)] bg-[var(--athar-gold-50)] text-[var(--athar-gold-muted)] font-semibold' : 'border-[var(--athar-cream-dark)] hover:border-slate-300'}`}
                  >
                    <span className="text-sm">{opt.label}</span>
                    <span className="text-[10px] text-[var(--athar-text-muted)] mt-0.5">{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-[var(--athar-text)] mb-3">3. عدد الساعات في الأسبوع:</label>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { id: 1, label: 'ساعة واحدة', desc: 'حصة / أسبوع' },
                  { id: 2, label: 'ساعتان', desc: 'حصتان / أسبوع' },
                  { id: 3, label: '3 ساعات', desc: '3 حصص / أسبوع' },
                  { id: 5, label: '5 ساعات', desc: '5 حصص / أسبوع' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setFrequency(opt.id)}
                    className={`flex flex-col p-3 rounded-xl border text-center transition ${frequency === opt.id ? 'border-[var(--athar-gold)] bg-[var(--athar-gold-50)] text-[var(--athar-gold-muted)] font-semibold' : 'border-[var(--athar-cream-dark)] hover:border-slate-300'}`}
                  >
                    <span className="text-sm font-bold">{opt.id} {opt.id === 1 ? 'ساعة' : opt.id === 2 ? 'ساعتان' : 'ساعات'}</span>
                    <span className="text-[10px] text-[var(--athar-text-muted)] mt-0.5">{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 rounded-2xl border-2 border-[var(--athar-gold)]/30 bg-gradient-to-br from-white to-[var(--athar-gold-50)] p-8 shadow-md relative overflow-hidden flex flex-col justify-between min-h-[400px]">
            <div className="absolute top-0 right-0 w-24 h-24 opacity-15 pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h60v60H0z' fill='none'/%3E%3Cpath d='M60 0C26.863 0 0 26.863 0 60' fill='none' stroke='%23c9a227' stroke-width='1.5'/%3E%3C/svg%3E")`, backgroundSize: 'cover' }} aria-hidden="true" />

            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--athar-gold-100)] px-3 py-1 text-xs font-semibold text-[var(--athar-gold-muted)] mb-5">
                <Sparkles size={12} />
                ملخص الخطة المقترحة
              </span>

              <div className="space-y-5">
                <div>
                  <p className="text-xs text-[var(--athar-text-muted)]">المدة المتوقعة للختم / الإنجاز:</p>
                  <p className="font-naskh text-3xl font-bold text-[var(--athar-text)] mt-1">{duration}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-[var(--athar-gold)]/20 pt-4">
                  <div>
                    <p className="text-xs text-[var(--athar-text-muted)]">الرسوم الشهرية المقدرة:</p>
                    <p className="text-xl font-extrabold text-[var(--athar-text)] mt-1">{prices.egp} ج.م <span className="text-xs text-[var(--athar-text-muted)] font-normal">/ {prices.usd}$</span></p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--athar-text-muted)]">معدل الحصص شهرياً:</p>
                    <p className="text-lg font-bold text-[var(--athar-text)] mt-1">{frequency * 4} حصص</p>
                  </div>
                </div>

                <div className="border-t border-[var(--athar-gold)]/20 pt-4 space-y-2">
                  <p className="text-xs font-bold text-[var(--athar-text-muted)] mb-2">المزايا المشمولة في خطتك:</p>
                  {[
                    'معلم شخصي مباشر 1-on-1 (أزهري مجاز)',
                    'تقارير أداء دورية (لوحة قيادة الطالب وولي الأمر)',
                    'شهادة تخرج معتمدة برقم تحقق QR Code',
                    'إمكانية تسجيل الحصص لإعادة المراجعة'
                  ].map((feat) => (
                    <div key={feat} className="flex items-start gap-2 text-xs text-[var(--athar-text)]">
                      <CheckCircle2 size={13} className="text-[var(--athar-gold)] mt-0.5 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8">
              <Link
                to={`/register/student?path=${path}&freq=${frequency}&level=${level}`}
                className="btn-gold w-full justify-center text-sm py-3 shadow-lg"
              >
                ابدأ خطتك التعليمية الآن
                <ArrowLeft size={16} />
              </Link>
              <p className="text-[10px] text-center text-[var(--athar-text-muted)] mt-2">
                *الأسعار تقريبية وقد تتغير حسب اختيار المعلم وخيارات التخصيص
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════
   8. FAQ
══════════════════════════════════════════ */
function FAQSection() {
  const { t } = useI18n();
  const [open, setOpen] = useState(null);
  const ref = useReveal();
  const faqs = [
    { q: t.faq.q1, a: t.faq.a1 }, { q: t.faq.q2, a: t.faq.a2 }, { q: t.faq.q3, a: t.faq.a3 },
    { q: t.faq.q4, a: t.faq.a4 }, { q: t.faq.q5, a: t.faq.a5 },
  ];

  return (
    <section className="py-24" style={{ background: 'var(--athar-gold-50)' }}>
      <div className="page-container max-w-3xl">
        <div ref={ref} className="reveal text-center mb-12">
          <span className="section-label mb-4">الأسئلة الشائعة</span>
          <h2 className="section-heading mt-4">{t.faq.title}</h2>
          <GoldDivider center />
          <p className="section-desc mx-auto !mt-2">{t.faq.subtitle}</p>
        </div>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="rounded-2xl border bg-white overflow-hidden transition-shadow"
              style={{ borderColor: open === i ? 'rgba(201,162,39,0.4)' : 'var(--athar-cream-dark)' }}
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between gap-4 p-5 text-right text-sm font-semibold text-[var(--athar-text)] hover:bg-[var(--athar-gold-50)] transition-colors"
              >
                {faq.q}
                {open === i
                  ? <ChevronUp size={18} className="shrink-0 text-[var(--athar-gold)]" />
                  : <ChevronDown size={18} className="shrink-0 text-[var(--athar-text-muted)]" />}
              </button>
              {open === i && (
                <div className="px-5 pb-5 text-sm text-[var(--athar-text-muted)] leading-relaxed border-t border-[var(--athar-cream-dark)] pt-4">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════
   9. CTA SECTION
══════════════════════════════════════════ */
function CTASection() {
  const { t } = useI18n();
  const ref = useReveal();
  return (
    <section className="py-20 bg-white">
      <div className="page-container">
        <div
          ref={ref}
          className="reveal relative rounded-3xl overflow-hidden px-8 py-16 md:px-16 text-center shadow-xl"
          style={{
            background: 'linear-gradient(135deg, var(--athar-gold-100) 0%, var(--athar-gold-50) 50%, #fff 100%)',
            border: '1px solid rgba(201,162,39,0.3)',
          }}
        >
          {/* Arabesque corners */}
          <div
            className="absolute top-0 right-0 w-48 h-48 opacity-20 pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='150' height='150' viewBox='0 0 150 150' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23c9a227' stroke-opacity='0.4' stroke-width='1'%3E%3Cpath d='M75 15l10 30 30 10-30 10-10 30-10-30-30-10 30-10z'/%3E%3C/g%3E%3C/svg%3E")`,
            }}
            aria-hidden="true"
          />
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[var(--athar-gold)] to-transparent" aria-hidden="true" />

          <span className="section-label mb-6">ابدأ رحلتك</span>
          <h2 className="font-naskh text-4xl md:text-5xl font-bold text-[var(--athar-text)] mt-4 text-pretty">
            {t.cta.title}
          </h2>
          <p className="mt-4 text-[var(--athar-text-muted)] max-w-xl mx-auto leading-relaxed">
            {t.cta.subtitle}
          </p>
          <div className="mt-8 flex flex-wrap gap-3 justify-center">
            <Link to="/register/student" className="btn-gold text-base px-8 py-3.5">
              {t.cta.button}
              <ArrowLeft size={18} aria-hidden="true" />
            </Link>
            <Link
              to="/teachers"
              className="inline-flex items-center gap-2 rounded-xl border border-[var(--athar-gold)]/40 bg-white px-7 py-3.5 text-sm font-semibold text-[var(--athar-gold-muted)] hover:bg-[var(--athar-gold-50)] transition"
            >
              <Play size={16} strokeWidth={1.5} />
              شاهد كيف تعمل المنصة
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════
   MAIN PAGE EXPORT
══════════════════════════════════════════ */
export default function NewLandingPage() {
  const { t } = useI18n();
  return (
    <>
      <SEOHead page={{ title: t.hero.title, description: t.hero.subtitle, url: '/', type: 'website' }} />
      <GlobalHeader />
      <main className="bg-white">
        <HeroSection />
        <SocialProofStrip />
        <StatsBar />
        <FeaturesSection />
        <CourseTimelineSection />
        <AISectionModern />
        <TeachersSection />
        <InteractivePlannerSection />
        <FAQSection />
        <CTASection />
      </main>
      <GlobalFooter />
    </>
  );
}
