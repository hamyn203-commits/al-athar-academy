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
import { useMarket } from '../../context/MarketProvider';

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
  const { locale } = useI18n();
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
  return <span ref={ref}>{count.toLocaleString(locale === 'ar' ? 'ar-EG' : locale === 'id' ? 'id-ID' : 'en-US')}{suffix}</span>;
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
  const { locale, t } = useI18n();
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
              {locale === 'id' ? 'Platform Edukasi Quran Global' : locale === 'ar' ? 'منصة تعليم قرآن عالمية' : 'Global Quran Learning Platform'}
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
              <LocalizedLink to="/register/student" locale={locale} className="btn-gold text-base px-7 py-3.5">
                {t.hero.cta1}
                <ArrowLeft size={18} strokeWidth={1.5} aria-hidden="true" />
              </LocalizedLink>
              <LocalizedLink
                to="/teachers"
                locale={locale}
                className="inline-flex items-center gap-2 rounded-xl border border-[var(--athar-gold)]/40 bg-white px-7 py-3.5 text-sm font-semibold text-[var(--athar-gold-muted)] shadow-sm hover:border-[var(--athar-gold)] hover:bg-[var(--athar-gold-50)] transition"
              >
                <Users size={18} strokeWidth={1.5} aria-hidden="true" />
                {t.hero.cta2}
              </LocalizedLink>
            </div>

            {/* Trust badges */}
            <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2">
              {(locale === 'id' 
                ? ['Guru Bersertifikat', 'Terjemahan Langsung', 'Pelacakan Hafalan', 'Sertifikat Resmi']
                : locale === 'ar'
                ? ['معلمون مجازون', 'ترجمة فورية', 'تتبع الحفظ', 'شهادات معتمدة']
                : ['Certified Tutors', 'Live Translation', 'Hifz Tracking', 'Accredited Certificates']
              ).map((b) => (
                <span key={b} className="flex items-center gap-1.5 text-sm text-[var(--athar-text-muted)]">
                  <CheckCircle2 size={15} className="text-[var(--athar-gold)]" strokeWidth={2} aria-hidden="true" />
                  {b}
                </span>
              ))}
            </div>

            {/* Quick links */}
            <div className="mt-6 flex flex-wrap gap-2">
              {[
                { to: '/library', label: locale === 'id' ? 'Perpustakaan' : locale === 'ar' ? 'المكتبة' : 'Library', icon: BookOpen },
                { to: '/leaderboard', label: locale === 'id' ? 'Turnamen' : locale === 'ar' ? 'البطولة' : 'Leaderboard', icon: Award },
                { to: '/programs/kids', label: locale === 'id' ? 'Anak-anak' : locale === 'ar' ? 'أطفال' : 'Kids', icon: Sparkles },
                { to: '/programs/women', label: locale === 'id' ? 'Wanita' : locale === 'ar' ? 'نساء' : 'Women', icon: Shield },
                { to: '/donate', label: locale === 'id' ? 'Donasi' : locale === 'ar' ? 'تبرع' : 'Donate', icon: HeartHandshake },
                { to: '/ai', label: locale === 'id' ? 'Pusat AI' : locale === 'ar' ? 'مركز AI' : 'AI Hub', icon: Mic },
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
                alt={locale === 'id' ? 'Syekh membaca Al-Quran' : locale === 'ar' ? 'شيخ يقرأ القرآن الكريم' : 'Sheikh reciting Holy Quran'}
                className="relative w-full h-auto drop-shadow-2xl"
                style={{ filter: 'drop-shadow(0 20px 40px rgba(201,162,39,0.2))' }}
              />
              {/* Floating badge */}
              <div className="absolute -bottom-4 -right-4 glass-card px-4 py-3 flex items-center gap-2.5 shadow-lg">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--athar-gold-100)]">
                  <Sparkles size={18} className="text-[var(--athar-gold)]" />
                </span>
                <div>
                  <p className="text-xs text-[var(--athar-text-muted)]">{locale === 'id' ? 'Analisis Bacaan' : locale === 'ar' ? 'تحليل التلاوة' : 'Recitation Analysis'}</p>
                  <p className="text-sm font-semibold text-[var(--athar-text)]">{locale === 'id' ? 'AI Siap' : locale === 'ar' ? 'AI جاهز' : 'AI Ready'}</p>
                </div>
              </div>
              {/* Floating badge 2 */}
              <div className="absolute -top-4 -left-4 glass-card px-4 py-3 flex items-center gap-2.5 shadow-lg">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50">
                  <CheckCircle2 size={18} className="text-emerald-600" />
                </span>
                <div>
                  <p className="text-xs text-[var(--athar-text-muted)]">{locale === 'id' ? 'Pengajar' : locale === 'ar' ? 'معلمون' : 'Tutors'}</p>
                  <p className="text-sm font-semibold text-[var(--athar-text)]">{locale === 'id' ? '+200 Bersertifikat' : locale === 'ar' ? '+200 مجاز' : '+200 Certified'}</p>
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
const getTestimonialItems = (locale) => {
  if (locale === 'id') {
    return [
      { name: 'Ahmad Mahmud', country: '🇪🇬 Mesir', text: 'Pengalaman luar biasa! Saya belajar Al-Quran secara terstruktur.' },
      { name: 'Sarah Johnson', country: '🇺🇸 AS', text: 'Guru profesional dan jadwal yang fleksibel.' },
      { name: 'Muhammad Al-Amri', country: '🇸🇦 Arab Saudi', text: 'Platform luar biasa untuk menghafal dengan guru bersertifikat.' },
      { name: 'Siti Rahma', country: '🇮🇩 Indonesia', text: 'Sangat terbantu belajar makhraj langsung dengan Syekh Mesir.' },
      { name: 'Yusuf Bakar', country: '🇹🇷 Turki', text: 'Platform terbaik untuk belajar Tajwid dalam bahasa Arab.' },
      { name: 'Fatima Al-Zahra', country: '🇲🇾 Malaysia', text: 'Anak-anak saya sangat menyukai program anak-anak!' },
    ];
  }
  if (locale === 'ar') {
    return [
      { name: 'أحمد محمود', country: '🇪🇬 مصر', text: 'تجربة رائعة! تعلمت القرآن بطريقة منظمة.' },
      { name: 'سارة جونسون', country: '🇺🇸 أمريكا', text: 'معلمون محترفون وجداول مرنة للغاية.' },
      { name: 'محمد العمري', country: '🇸🇦 السعودية', text: 'منصة ممتازة للحفظ مع معلمين مجازين.' },
      { name: 'أمينة حسن', country: '🇬🇧 بريطانيا', text: 'أداة التلاوة بالذكاء الاصطناعي مذهلة حقًا.' },
      { name: 'يوسف بكر', country: '🇹🇷 تركيا', text: 'أفضل منصة لتعلم التجويد بالعربية.' },
      { name: 'فاطمة الزهراء', country: '🇲🇾 ماليزيا', text: 'أطفالي يحبون برنامج الأطفال كثيراً!' },
    ];
  }
  // English/Default
  return [
    { name: 'Ahmad Mahmoud', country: '🇪🇬 Egypt', text: 'Great experience! I learned Quran in an organized way.' },
    { name: 'Sarah Johnson', country: '🇺🇸 USA', text: 'Professional teachers and flexible scheduling.' },
    { name: 'Mohamed Al-Omari', country: '🇸🇦 KSA', text: 'Excellent platform for hifz with certified teachers.' },
    { name: 'Amina Hassan', country: '🇬🇧 UK', text: 'The AI recitation tool is simply incredible.' },
    { name: 'Yusuf Bakar', country: '🇹🇷 Turkey', text: 'Best platform to learn Tajweed in Arabic.' },
    { name: 'Fatima Al-Zahra', country: '🇲🇾 Malaysia', text: 'My kids love the kids program so much!' },
  ];
};

function SocialProofStrip() {
  const { locale } = useI18n();
  const items = getTestimonialItems(locale);
  const doubled = [...items, ...items];
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
  const { t, locale } = useI18n();
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
          <span className="section-label mb-4">{locale === 'id' ? 'Mengapa Al-Athar?' : locale === 'ar' ? 'لماذا الأثر؟' : 'Why Al-Athar?'}</span>
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
function CourseTimelineSection() {
  const { locale } = useI18n();
  const ref = useReveal();

  const sectionLabel = locale === 'id' ? 'Alur Belajar' : locale === 'ar' ? 'مسار التعلم' : 'Learning Path';
  const heading = locale === 'id' ? 'Perjalanan Anda Dari Nol hingga Ijazah' : locale === 'ar' ? 'رحلتك من الصفر إلى الإجازة' : 'Your Journey from Zero to Ijazah';
  const desc = locale === 'id' ? 'Empat langkah terstruktur dari awal hingga menguasai bacaan' : locale === 'ar' ? 'أربع مراحل واضحة تأخذك من البداية حتى الاحتراف' : 'Four clear steps taking you from beginner to master';

  const steps = [
    { 
      icon: BookMarked, 
      label: locale === 'id' ? 'Pemula' : locale === 'ar' ? 'مبتدئ' : 'Beginner', 
      title: locale === 'id' ? 'Belajar Membaca' : locale === 'ar' ? 'تعلّم القراءة' : 'Learn Reading', 
      desc: locale === 'id' ? 'Dasar-dasar pelafalan & tajwid dengan guru ahli' : locale === 'ar' ? 'أساسيات النطق والتجويد مع معلم متخصص' : 'Pronunciation & Tajweed basics with an expert tutor', 
      color: 'bg-emerald-500', light: 'bg-emerald-50', text: 'text-emerald-600' 
    },
    { 
      icon: Mic, 
      label: locale === 'id' ? 'Menengah' : locale === 'ar' ? 'متوسط' : 'Intermediate', 
      title: locale === 'id' ? 'Perbaiki Pelafalan' : locale === 'ar' ? 'صحّح التلاوة' : 'Correct Recitation', 
      desc: locale === 'id' ? 'Analisis suara interaktif dengan AI secara instan' : locale === 'ar' ? 'تحليل صوتي بالذكاء الاصطناعي وتصحيح فوري' : 'Interactive AI audio analysis & instant feedback', 
      color: 'bg-[var(--athar-gold)]', light: 'bg-[var(--athar-gold-100)]', text: 'text-[var(--athar-gold-muted)]' 
    },
    { 
      icon: BookOpen, 
      label: locale === 'id' ? 'Lanjutan' : locale === 'ar' ? 'متقدم' : 'Advanced', 
      title: locale === 'id' ? 'Mulai Hafalan' : locale === 'ar' ? 'ابدأ الحفظ' : 'Start Memorization', 
      desc: locale === 'id' ? 'Sistem hafalan Sabak/Sabki/Manzil yang teruji' : locale === 'ar' ? 'نظام سباق/سبق/منزل المُثبَت علمياً' : 'Proven Sabak/Sabki/Manzil hifz system', 
      color: 'bg-blue-500', light: 'bg-blue-50', text: 'text-blue-600' 
    },
    { 
      icon: Award, 
      label: locale === 'id' ? 'Lulusan' : locale === 'ar' ? 'خريج' : 'Graduate', 
      title: locale === 'id' ? 'Dapatkan Sertifikat' : locale === 'ar' ? 'احصل على شهادتك' : 'Get Certified', 
      desc: locale === 'id' ? 'Sertifikat resmi terverifikasi setelah lulus' : locale === 'ar' ? 'شهادة معتمدة رقمياً بعد إتمام الدورة' : 'Accredited digital certificate upon completion', 
      color: 'bg-purple-500', light: 'bg-purple-50', text: 'text-purple-600' 
    },
  ];

  return (
    <section className="py-24 bg-white">
      <div className="page-container">
        <div ref={ref} className="reveal text-center max-w-2xl mx-auto mb-16">
          <span className="section-label mb-4">{sectionLabel}</span>
          <h2 className="section-heading mt-4">{heading}</h2>
          <GoldDivider center />
          <p className="section-desc mx-auto !mt-2">{desc}</p>
        </div>

        <div className="relative">
          {/* Connecting line */}
          <div
            className="absolute top-10 right-10 left-10 h-0.5 hidden lg:block"
            style={{ background: 'linear-gradient(90deg, var(--athar-gold-200), var(--athar-gold), var(--athar-gold-200))' }}
            aria-hidden="true"
          />

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map(({ icon: Icon, label, title, desc, color, light, text }, idx) => {
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
    { text: "رَبِّ", correct: false, errorText: locale === 'id' ? 'Peringatan Harakat: Dibaca dhommah (Rabbu) padahal seharusnya kasrah (Rabbi)' : locale === 'ar' ? 'تنبيه تشكيل: نُطقت بالضم (رَبُّ) والموضع مجرور بالكسرة (رَبِّ)' : 'Harakat Warning: Pronounced with dhommah (Rabbu) instead of kasrah (Rabbi)' },
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
              {locale === 'id' ? 'Didukung AI' : locale === 'ar' ? 'مدعوم بالذكاء الاصطناعي' : 'AI-Powered'}
            </span>
            <h2 className="font-naskh text-4xl font-bold text-[var(--athar-text)] mt-4">
              {locale === 'id' ? 'Pusat AI Penghafalan' : locale === 'ar' ? 'مركز AI لرحلة الحفظ' : 'AI Hub for Hifz'}
            </h2>
            <GoldDivider />
            <p className="text-[var(--athar-text-muted)] leading-relaxed">
              {locale === 'id' 
                ? 'Asisten Quran, analisis suara tajwid, dan rencana hifz harian — seperti platform Hifz global terbaik.' 
                : locale === 'ar' 
                ? 'مساعد قرآن، تحليل تلاوة بالصوت، وخطط حفظ يومية — مثل أفضل منصات Hifz العالمية.' 
                : 'Quran assistant, voice analysis, and daily hifz planner — like the top global Hifz platforms.'}
            </p>
            <ul className="mt-6 space-y-3">
              {[
                { icon: Mic, text: locale === 'id' ? 'Analisis tajwid & bacaan suara' : locale === 'ar' ? 'تحليل التجويد والتلاوة بالصوت' : 'Tajweed & voice analysis' },
                { icon: BookOpen, text: locale === 'id' ? 'Rencana harian Sabak / Sabki / Manzil' : locale === 'ar' ? 'خطط سباق / سبق / منزل يومية' : 'Daily Sabak / Sabki / Manzil plans' },
                { icon: Sparkles, text: locale === 'id' ? 'Asisten pintar untuk guru & siswa' : locale === 'ar' ? 'مساعد ذكي للمعلم والطالب' : 'Smart assistant for tutor & student' },
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
              {locale === 'id' ? 'Coba Pusat AI' : locale === 'ar' ? 'جرّب مركز AI' : 'Try AI Center'}
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
                  <p className="text-xs text-[var(--athar-text-muted)]">{isPlaying ? (locale === 'id' ? 'Mendengarkan bacaan...' : locale === 'ar' ? 'جاري الاستماع للتلاوة...' : 'Listening...') : (locale === 'id' ? 'Simulasi Rekaman' : locale === 'ar' ? 'محاكاة تلاوة تجريبية' : 'Simulated Recitation')}</p>
                  <p className="text-sm font-semibold text-[var(--athar-text)]">{locale === 'id' ? 'Surah Al-Fatihah (Ayat 2)' : locale === 'ar' ? 'سورة الفاتحة (الآية 2)' : 'Surah Al-Fatihah (Verse 2)'}</p>
                </div>
              </div>
              
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold transition shadow-sm ${isPlaying ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100' : 'bg-[var(--athar-gold-100)] text-[var(--athar-gold-muted)] border border-[var(--athar-gold)]/30 hover:bg-[var(--athar-gold-200)]'}`}
              >
                <Play size={10} className={isPlaying ? 'hidden' : 'inline'} />
                {isPlaying ? (locale === 'id' ? 'Hentikan Demo' : locale === 'ar' ? 'إيقاف المحاكاة' : 'Stop Demo') : (locale === 'id' ? 'Mulai Demo' : locale === 'ar' ? 'تشغيل المحاكاة' : 'Start Demo')}
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
              { label: locale === 'id' ? 'Tajwid & Intonasi' : locale === 'ar' ? 'التجويد ونبرات الصوت' : 'Tajweed & Intonation', val: scores.tajweed, color: 'bg-[var(--athar-gold)]' },
              { label: locale === 'id' ? 'Makhraj Huruf' : locale === 'ar' ? 'مخارج الحروف الفموية' : 'Makhraj & Articulation', val: scores.makharij, color: 'bg-emerald-500' },
              { label: locale === 'id' ? 'Waqaf & Ibtida' : locale === 'ar' ? 'الوقف والابتداء والقراءة الصحيحة' : 'Waqf & Recitation Flow', val: scores.waqf, color: 'bg-blue-500' },
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
              {isPlaying 
                ? (locale === 'id' ? 'AI sedang menganalisis dan mencocokkan bacaan...' : locale === 'ar' ? 'الذكاء الاصطناعي يقوم بتحليل التلاوة ومطابقتها...' : 'AI is analyzing and matching the recitation...') 
                : (locale === 'id' ? 'Coba bacaan suara Anda di dasbor siswa untuk penilaian instan' : locale === 'ar' ? 'جرّب التلاوة بصوتك في لوحة الطالب للحصول على تقييم فوري' : 'Try reciting in the student dashboard for instant feedback')}
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
  const { t, locale } = useI18n();
  const ref = useReveal();
  const teachers = [
    {
      id: 1,
      name: locale === 'id' ? 'Syekh Ahmad Muhammad' : locale === 'ar' ? 'الشيخ أحمد محمد' : 'Sheikh Ahmad Muhammad',
      specialty: locale === 'id' ? 'Tahfidz Al-Quran' : locale === 'ar' ? 'تحفيظ القرآن' : 'Quran Memorization',
      rating: 4.9,
      reviews: 120,
      initial: locale === 'ar' ? 'أ' : 'A',
      from: 'emerald'
    },
    {
      id: 2,
      name: locale === 'id' ? 'Syekhah Fatima Ali' : locale === 'ar' ? 'الشيخة فاطمة علي' : 'Sheikha Fatima Ali',
      specialty: locale === 'id' ? 'Tajwid' : locale === 'ar' ? 'التجويد' : 'Tajweed',
      rating: 4.8,
      reviews: 95,
      initial: locale === 'ar' ? 'ف' : 'F',
      from: 'amber'
    },
    {
      id: 3,
      name: locale === 'id' ? 'Syekh Umar Hasan' : locale === 'ar' ? 'الشيخ عمر حسن' : 'Sheikh Omar Hassan',
      specialty: locale === 'id' ? 'Bahasa Arab' : locale === 'ar' ? 'اللغة العربية' : 'Arabic Language',
      rating: 4.9,
      reviews: 150,
      initial: locale === 'ar' ? 'ع' : 'U',
      from: 'blue'
    },
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
            <span className="section-label mb-4">{locale === 'id' ? 'Pengajar Unggulan' : locale === 'ar' ? 'نخبة المعلمين' : 'Featured Tutors'}</span>
            <h2 className="section-heading mt-4">{t.teachers.title}</h2>
            <GoldDivider />
            <p className="section-desc !mx-0 !mt-2">{t.teachers.subtitle}</p>
          </div>
          <LocalizedLink to="/teachers" locale={locale} className="btn-secondary shrink-0">{t.teachers.viewAll}</LocalizedLink>
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
                  <LocalizedLink
                    to={`/teachers/${teacher.id}`}
                    locale={locale}
                    className="btn-gold w-full justify-center text-sm !py-2.5"
                  >
                    {t.teachers.bookTrial}
                  </LocalizedLink>
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
  const { locale } = useI18n();
  const { marketSlug } = useMarket();
  const isIndonesian = marketSlug === 'indonesia-malaysia';

  const [path, setPath] = useState('hifz');
  const [frequency, setFrequency] = useState(2);
  const [level, setLevel] = useState('beginner');
  const [studyMode, setStudyMode] = useState('private'); // 'private' or 'group'

  const getEstimatedDuration = () => {
    if (path === 'hifz') {
      if (frequency === 1) return locale === 'id' ? '4.5 Tahun' : locale === 'ar' ? '4.5 سنوات' : '4.5 Years';
      if (frequency === 2) return locale === 'id' ? '2.5 Tahun' : locale === 'ar' ? '2.5 سنة' : '2.5 Years';
      if (frequency === 3) return locale === 'id' ? '1.5 Tahun' : locale === 'ar' ? '1.5 سنة' : '1.5 Years';
      return locale === 'id' ? '10 Bulan' : locale === 'ar' ? '10 أشهر' : '10 Months';
    } else if (path === 'tajweed') {
      if (frequency === 1) return locale === 'id' ? '6 Bulan' : locale === 'ar' ? '6 أشهر' : '6 Months';
      if (frequency === 2) return locale === 'id' ? '4 Bulan' : locale === 'ar' ? '4 أشهر' : '4 Months';
      if (frequency === 3) return locale === 'id' ? '3 Bulan' : locale === 'ar' ? '3 أشهر' : '3 Months';
      return locale === 'id' ? '6 Minggu' : locale === 'ar' ? '6 أسابيع' : '6 Weeks';
    } else {
      if (frequency === 1) return locale === 'id' ? '1.5 Tahun' : locale === 'ar' ? '1.5 سنة' : '1.5 Years';
      if (frequency === 2) return locale === 'id' ? '9 Bulan' : locale === 'ar' ? '9 أشهر' : '9 Months';
      if (frequency === 3) return locale === 'id' ? '6 Bulan' : locale === 'ar' ? '6 أشهر' : '6 Months';
      return locale === 'id' ? '3 Bulan' : locale === 'ar' ? '3 أشهر' : '3 Months';
    }
  };

  const getEstimatedPrice = () => {
    if (isIndonesian) {
      if (studyMode === 'group') {
        return { formatted: 'Rp 100.000', currency: 'IDR' };
      } else {
        let rate = 450000;
        if (frequency === 1) rate = 250000;
        else if (frequency === 2) rate = 450000;
        else if (frequency === 3) rate = 600000;
        else if (frequency === 5) rate = 900000;
        return { formatted: `Rp ${rate.toLocaleString('id-ID')}`, currency: 'IDR' };
      }
    } else {
      const monthlyHours = frequency * 4;
      const usdPrice = monthlyHours * 10;
      const egpPrice = monthlyHours * 50;
      return { usd: usdPrice, egp: egpPrice, currency: 'USD/EGP' };
    }
  };

  const prices = getEstimatedPrice();
  const duration = getEstimatedDuration();

  return (
    <section className="py-24 bg-white relative overflow-hidden" id="planner">
      <div className="absolute inset-0 opacity-5 pointer-events-none geo-pattern" aria-hidden="true" />
      <div className="page-container relative">
        <div ref={ref} className="reveal text-center max-w-2xl mx-auto mb-16">
          <span className="section-label mb-4">
            {locale === 'ar' ? 'مخطط الدراسة الذكي' : locale === 'id' ? 'Rencana Belajar Cerdas' : 'Smart Study Planner'}
          </span>
          <h2 className="section-heading mt-4">
            {locale === 'ar' ? 'احسب خطتك الدراسية المخصصة' : locale === 'id' ? 'Hitung Rencana Belajar Anda' : 'Calculate Your Custom Study Plan'}
          </h2>
          <GoldDivider center />
          <p className="section-desc mx-auto !mt-2">
            {locale === 'ar' ? 'حدد أهدافك وعدد الساعات لتصميم خطة تتناسب مع وقتك وميزانيتك' : locale === 'id' ? 'Tentukan tujuan dan jam belajar untuk merancang rencana yang sesuai' : 'Select your goals and hours to design a plan that fits your time and budget'}
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8 items-start">
          <div className="lg:col-span-3 glass-card p-8 space-y-6">
            {/* If Indonesian market, show study mode selector (Private 1-on-1 vs Group) */}
            {isIndonesian && (
              <div>
                <label className="block text-sm font-bold text-[var(--athar-text)] mb-3">
                  {locale === 'id' ? '1. Jenis Kelas:' : locale === 'ar' ? '1. نوع الدراسة:' : '1. Study Mode:'}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'private', label: locale === 'id' ? 'Kelas Privat (1-on-1)' : locale === 'ar' ? 'حصة فردية خاصة' : 'Private Class (1-on-1)', desc: locale === 'id' ? 'Guru Privat Al-Azhar' : locale === 'ar' ? 'معلم خاص أزهري' : 'Private Al-Azhar Tutor' },
                    { id: 'group', label: locale === 'id' ? 'Kelas Grup (Halaqah)' : locale === 'ar' ? 'حلقة جماعية اقتصادية' : 'Group Class (Halaqah)', desc: locale === 'id' ? 'Biaya Ekonomis (5-7 siswa)' : locale === 'ar' ? 'أقل سعر (5-7 طلاب)' : 'Economical (5-7 students)' }
                  ].map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => setStudyMode(opt.id)}
                      className={`flex flex-col items-center justify-center p-4 rounded-xl border text-center transition ${studyMode === opt.id ? 'border-[var(--athar-gold)] bg-[var(--athar-gold-50)] text-[var(--athar-gold-muted)] font-semibold shadow-sm' : 'border-[var(--athar-cream-dark)] hover:border-slate-300'}`}
                    >
                      <span className="text-sm">{opt.label}</span>
                      <span className="text-[10px] text-[var(--athar-text-muted)] mt-1">{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-[var(--athar-text)] mb-3">
                {isIndonesian ? (locale === 'id' ? '2. Pilih Program Studi:' : locale === 'ar' ? '2. حدد المسار التعليمي:' : '2. Select Learning Path:') : (locale === 'id' ? '1. Pilih Program Studi:' : locale === 'ar' ? '1. حدد المسار التعليمي:' : '1. Select Learning Path:')}
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'hifz', label: locale === 'id' ? 'Hafalan & Tajwid' : locale === 'ar' ? 'حفظ القرآن وتجويده' : 'Quran Memorization', desc: locale === 'id' ? 'Dewasa & Anak-anak' : locale === 'ar' ? 'للكبار والصغار' : 'Adults & Kids' },
                  { id: 'tajweed', label: locale === 'id' ? 'Tajwid & Makhraj' : locale === 'ar' ? 'أحكام التجويد والنطق' : 'Tajweed & Makhraj', desc: locale === 'id' ? 'Perbaikan Pelafalan' : locale === 'ar' ? 'تصحيح ومخارج الحروف' : 'Recitation Correction' },
                  { id: 'arabic', label: locale === 'id' ? 'Bahasa Arab' : locale === 'ar' ? 'اللغة العربية الفصحى' : 'Arabic Language', desc: locale === 'id' ? 'Untuk Non-Arab' : locale === 'ar' ? 'لغير الناطقين بها' : 'For Non-Arabic Speakers' }
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
              <label className="block text-sm font-bold text-[var(--athar-text)] mb-3">
                {isIndonesian ? (locale === 'id' ? '3. Tingkat Kemampuan:' : locale === 'ar' ? '3. المستوى الحالي للدارس:' : '3. Current Level:') : (locale === 'id' ? '2. Tingkat Kemampuan:' : locale === 'ar' ? '2. المستوى الحالي للدارس:' : '2. Current Level:')}
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'beginner', label: locale === 'id' ? 'Pemula' : locale === 'ar' ? 'مبتدئ' : 'Beginner', desc: locale === 'id' ? 'Belum bisa membaca' : locale === 'ar' ? 'لا يعرف القراءة' : 'Cannot read yet' },
                  { id: 'intermediate', label: locale === 'id' ? 'Menengah' : locale === 'ar' ? 'متوسط' : 'Intermediate', desc: locale === 'id' ? 'Bisa membaca & butuh perbaikan' : locale === 'ar' ? 'يقرأ ولكن يحتاج ضبطاً' : 'Can read but needs polish' },
                  { id: 'advanced', label: locale === 'id' ? 'Lanjutan' : locale === 'ar' ? 'متقدم' : 'Advanced', desc: locale === 'id' ? 'Hafal & mencari Sanad' : locale === 'ar' ? 'حافظ ويبحث عن السند' : 'Memorized & seeks Sanad' }
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

            {/* Frequency selection: only visible or active for Private classes */}
            {(!isIndonesian || studyMode === 'private') ? (
              <div>
                <label className="block text-sm font-bold text-[var(--athar-text)] mb-3">
                  {isIndonesian ? (locale === 'id' ? '4. Jumlah Jam Per Minggu:' : locale === 'ar' ? '4. عدد الساعات في الأسبوع:' : '4. Hours Per Week:') : (locale === 'id' ? '3. Jumlah Jam Per Minggu:' : locale === 'ar' ? '3. عدد الساعات في الأسبوع:' : '3. Hours Per Week:')}
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { id: 1, label: locale === 'id' ? '1 Jam' : locale === 'ar' ? 'ساعة واحدة' : '1 Hour', desc: locale === 'id' ? '1 sesi / minggu' : locale === 'ar' ? 'حصة / أسبوع' : '1 session / week' },
                    { id: 2, label: locale === 'id' ? '2 Jam' : locale === 'ar' ? 'ساعتان' : '2 Hours', desc: locale === 'id' ? '2 sesi / minggu' : locale === 'ar' ? '2 حصة / أسبوع' : '2 sessions / week' },
                    { id: 3, label: locale === 'id' ? '3 Jam' : locale === 'ar' ? '3 ساعات' : '3 Hours', desc: locale === 'id' ? '3 sesi / minggu' : locale === 'ar' ? '3 حصص / أسبوع' : '3 sessions / week' },
                    { id: 5, label: locale === 'id' ? '5 Jam' : locale === 'ar' ? '5 ساعات' : '5 Hours', desc: locale === 'id' ? '5 sesi / minggu' : locale === 'ar' ? '5 حصص / أسبوع' : '5 sessions / week' }
                  ].map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => setFrequency(opt.id)}
                      className={`flex flex-col p-3 rounded-xl border text-center transition ${frequency === opt.id ? 'border-[var(--athar-gold)] bg-[var(--athar-gold-50)] text-[var(--athar-gold-muted)] font-semibold' : 'border-[var(--athar-cream-dark)] hover:border-slate-300'}`}
                    >
                      <span className="text-sm font-bold">{opt.label}</span>
                      <span className="text-[10px] text-[var(--athar-text-muted)] mt-0.5">{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-bold text-[var(--athar-text)] mb-3">
                  {locale === 'id' ? '4. Jumlah Jam Per Minggu:' : locale === 'ar' ? '4. عدد الساعات في الأسبوع:' : '4. Hours Per Week:'}
                </label>
                <div className="p-4 rounded-xl border border-[var(--athar-gold)]/20 bg-[var(--athar-gold-50)] text-sm text-[var(--athar-gold-muted)] font-semibold flex items-center gap-2">
                  <Clock size={16} />
                  <span>
                    {locale === 'id' ? '2 sesi per minggu (Jadwal kelas grup tetap)' : locale === 'ar' ? '2 حصة في الأسبوع (مجدولة جماعياً)' : '2 sessions per week (Fixed group schedule)'}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-2 rounded-2xl border-2 border-[var(--athar-gold)]/30 bg-gradient-to-br from-white to-[var(--athar-gold-50)] p-8 shadow-md relative overflow-hidden flex flex-col justify-between min-h-[400px]">
            <div className="absolute top-0 right-0 w-24 h-24 opacity-15 pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h60v60H0z' fill='none'/%3E%3Cpath d='M60 0C26.863 0 0 26.863 0 60' fill='none' stroke='%23c9a227' stroke-width='1.5'/%3E%3C/svg%3E")`, backgroundSize: 'cover' }} aria-hidden="true" />

            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--athar-gold-100)] px-3 py-1 text-xs font-semibold text-[var(--athar-gold-muted)] mb-5">
                <Sparkles size={12} />
                {locale === 'ar' ? 'ملخص الخطة المقترحة' : locale === 'id' ? 'Ringkasan Rencana' : 'Plan Summary'}
              </span>

              <div className="space-y-5">
                <div>
                  <p className="text-xs text-[var(--athar-text-muted)]">
                    {locale === 'ar' ? 'المدة المتوقعة للختم / الإنجاز:' : locale === 'id' ? 'Estimasi Durasi Selesai:' : 'Estimated Duration:'}
                  </p>
                  <p className="font-naskh text-3xl font-bold text-[var(--athar-text)] mt-1">
                    {studyMode === 'group' && isIndonesian ? (locale === 'id' ? '1.5 Tahun' : locale === 'ar' ? '1.5 سنة' : '1.5 Years') : duration}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-[var(--athar-gold)]/20 pt-4">
                  <div>
                    <p className="text-xs text-[var(--athar-text-muted)]">
                      {locale === 'ar' ? 'الرسوم الشهرية المقدرة:' : locale === 'id' ? 'Biaya Bulanan:' : 'Estimated Monthly Fee:'}
                    </p>
                    <p className="text-xl font-extrabold text-[var(--athar-text)] mt-1">
                      {isIndonesian ? (
                        <span className="text-lg">{prices.formatted}</span>
                      ) : (
                        <>
                          {prices.egp} ج.م <span className="text-xs text-[var(--athar-text-muted)] font-normal">/ {prices.usd}$</span>
                        </>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--athar-text-muted)]">
                      {locale === 'ar' ? 'معدل الحصص شهرياً:' : locale === 'id' ? 'Jumlah Sesi Bulanan:' : 'Monthly Sessions:'}
                    </p>
                    <p className="text-lg font-bold text-[var(--athar-text)] mt-1">
                      {studyMode === 'group' && isIndonesian ? '8' : frequency * 4} {locale === 'id' ? 'sesi' : locale === 'ar' ? 'حصص' : 'sessions'}
                    </p>
                  </div>
                </div>

                {isIndonesian && (
                  <div className="flex items-start gap-2 rounded-xl bg-emerald-50 border border-emerald-200/60 p-2.5 text-[11px] text-emerald-800 font-semibold leading-normal shadow-xs">
                    <Globe size={14} className="shrink-0 text-emerald-600 mt-0.5 animate-spin" style={{ animationDuration: '6s' }} />
                    <span>
                      {locale === 'id' 
                        ? 'Terdeteksi IP Indonesia: Subsidi Biaya Khusus Aktif (Dukungan Guru Mesir Terjangkau)' 
                        : locale === 'ar'
                        ? 'تم رصد عنوان IP من إندونيسيا: الرسوم المدعومة نشطة (معلمين مصريين بتكلفة مناسبة)'
                        : 'Indonesian IP Detected: Subsidized Pricing Active (Affordable Egyptian Scholars)'}
                    </span>
                  </div>
                )}

                <div className="border-t border-[var(--athar-gold)]/20 pt-4 space-y-2">
                  <p className="text-xs font-bold text-[var(--athar-text-muted)] mb-2">
                    {locale === 'id' ? 'Fasilitas Termasuk:' : locale === 'ar' ? 'المزايا المشمولة في خطتك:' : 'Included Benefits:'}
                  </p>
                  {(studyMode === 'group' && isIndonesian ? (
                    locale === 'id' ? [
                      'Guru Al-Azhar (Kelas grup 5-7 siswa)',
                      'Kurikulum Iqro interaktif lengkap',
                      'Sertifikat kelulusan terverifikasi QR Code',
                      'Biaya ekonomis khusus Indonesia'
                    ] : locale === 'ar' ? [
                      'معلم أزهري مباشر (حلقة جماعية 5-7 طلاب)',
                      'منهج إقرأ الإندونيسي التفاعلي المتكامل',
                      'شهادة إتمام معتمدة برمز QR عند التخرج',
                      'سعر اقتصادي مدعوم بالكامل لأندونيسيا'
                    ] : [
                      'Direct Al-Azhar tutor (Group class 5-7 students)',
                      'Complete interactive Iqro curriculum',
                      'Accredited QR Code completion certificate',
                      'Fully subsidized economical price for Indonesia'
                    ]
                  ) : (
                    locale === 'id' ? [
                      'Guru privat 1-on-1 langsung dari Mesir',
                      'Laporan perkembangan siswa berkala',
                      'Sertifikat kelulusan berlisensi resmi',
                      'Rekaman sesi tersedia untuk diulang'
                    ] : locale === 'ar' ? [
                      'معلم شخصي مباشر 1-on-1 (أزهري مجاز)',
                      'تقارير أداء دورية لولي الأمر والطالب',
                      'شهادة تخرج معتمدة برقم تحقق QR Code',
                      'إمكانية تسجيل الحصص لإعادة المراجعة'
                    ] : [
                      'Direct 1-on-1 private tutor (Azhari certified)',
                      'Periodic performance reports for parents & students',
                      'Accredited QR Code completion certificate',
                      'Option to record sessions for revision'
                    ]
                  )).map((feat) => (
                    <div key={feat} className="flex items-start gap-2 text-xs text-[var(--athar-text)]">
                      <CheckCircle2 size={13} className="text-[var(--athar-gold)] mt-0.5 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8">
              <LocalizedLink
                to={`/register/student?path=${path}&freq=${studyMode === 'group' ? 2 : frequency}&level=${level}&mode=${studyMode}`}
                locale={locale}
                className="btn-gold w-full justify-center text-sm py-3 shadow-lg"
              >
                {locale === 'ar' ? 'ابدأ خطتك التعليمية الآن' : locale === 'id' ? 'Mulai Belajar Sekarang' : 'Start Your Plan Now'}
                <ArrowLeft size={16} />
              </LocalizedLink>

              {isIndonesian && (
                <div className="mt-4 pt-3 border-t border-[var(--athar-gold)]/20 text-center">
                  <p className="text-[10px] text-[var(--athar-text-muted)] font-bold mb-2">
                    {locale === 'id' ? 'Metode Pembayaran Lokal Didukung:' : locale === 'ar' ? 'طرق الدفع المحلية المدعومة:' : 'Supported Local Payment Methods:'}
                  </p>
                  <div className="flex flex-wrap justify-center gap-1.5 opacity-90">
                    {['QRIS', 'GoPay', 'OVO', 'DANA', 'ShopeePay', 'LinkAja', 'Transfer Bank'].map(method => (
                      <span key={method} className="text-[9px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/50 rounded px-1.5 py-0.5">
                        {method}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-[10px] text-center text-[var(--athar-text-muted)] mt-2">
                {locale === 'ar' ? '*الأسعار تقريبية وقد تتغير حسب خيارات التخصيص' : '*Biaya bersifat estimasi dan dapat disesuaikan'}
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
  const { t, locale } = useI18n();
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
          <span className="section-label mb-4">{locale === 'id' ? 'Pertanyaan Umum' : locale === 'ar' ? 'الأسئلة الشائعة' : 'FAQ'}</span>
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
  const { t, locale } = useI18n();
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

          <span className="section-label mb-6">{locale === 'id' ? 'Mulai Perjalanan Anda' : locale === 'ar' ? 'ابدأ رحلتك' : 'Start Your Journey'}</span>
          <h2 className="font-naskh text-4xl md:text-5xl font-bold text-[var(--athar-text)] mt-4 text-pretty">
            {t.cta.title}
          </h2>
          <p className="mt-4 text-[var(--athar-text-muted)] max-w-xl mx-auto leading-relaxed">
            {t.cta.subtitle}
          </p>
          <div className="mt-8 flex flex-wrap gap-3 justify-center">
            <LocalizedLink to="/register/student" locale={locale} className="btn-gold text-base px-8 py-3.5">
              {t.cta.button}
              <ArrowLeft size={18} aria-hidden="true" />
            </LocalizedLink>
            <LocalizedLink
              to="/teachers"
              locale={locale}
              className="inline-flex items-center gap-2 rounded-xl border border-[var(--athar-gold)]/40 bg-white px-7 py-3.5 text-sm font-semibold text-[var(--athar-gold-muted)] hover:bg-[var(--athar-gold-50)] transition"
            >
              <Play size={16} strokeWidth={1.5} />
              {locale === 'id' ? 'Lihat Cara Kerja Platform' : locale === 'ar' ? 'شاهد كيف تعمل المنصة' : 'See How It Works'}
            </LocalizedLink>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════
   Al-Azhar Heritage Section
══════════════════════════════════════════ */
function AlAzharHeritageSection() {
  const { locale } = useI18n();
  const { marketSlug } = useMarket();
  const isIndonesian = marketSlug === 'indonesia-malaysia';
  const ref = useReveal();

  const title = locale === 'id' 
    ? 'Sanad & Pengajar Al-Azhar Mesir'
    : locale === 'ar'
    ? 'السند الأزهري المتصل بالرسول ﷺ'
    : 'Azhari Sanad & Academic Heritage';

  const subtitle = locale === 'id'
    ? 'Belajar mengaji langsung dengan guru-guru lulusan Universitas Al-Azhar Kairo, Mesir yang memiliki Sanad (silsilah) periwayatan Quran yang bersambung.'
    : locale === 'ar'
    ? 'تعلّم القرآن الكريم بالتجويد ومخارج الحروف مع شيوخ ومعلمات مجازين من الأزهر الشريف بسند متصل إلى النبي صلى الله عليه وسلم.'
    : 'Learn Quran and Tajweed directly from native scholars graduated from Al-Azhar University in Cairo, holding authentic Sanad chains.';

  const points = [
    {
      title: locale === 'id' ? 'Silsilah Sanad Bersambung' : locale === 'ar' ? 'سند متصل متواتر' : 'Connected Sanad Chain',
      desc: locale === 'id' 
        ? 'Guru kami memegang Ijazah & Sanad hafalan Quran yang bersambung langsung hingga Rasulullah ﷺ.' 
        : locale === 'ar'
        ? 'إجازة وسند متصل من المعلم إلى التابعين ثم إلى رسول الله ﷺ في الحفظ والإتقان.'
        : 'Our tutors hold verified Ijazah and Sanad certificates going back to the Prophet ﷺ.',
      icon: Award
    },
    {
      title: locale === 'id' ? 'Pengajar Asli Mesir (Native)' : locale === 'ar' ? 'معلمون عرب من مصر' : 'Native Egyptian Scholars',
      desc: locale === 'id' 
        ? 'Interaksi langsung dengan Ustadz/Ustadzah Mesir untuk melatih makhraj & lahjah Arabiyah yang fasih.' 
        : locale === 'ar'
        ? 'تحدث ونطق سليم مع شيوخ مصريين ناطقين بالعربية الفصحى لضبط مخارج الحروف.'
        : 'Direct interaction with Cairo-based tutors to perfect your Arabic pronunciation and accent.',
      icon: Globe
    },
    {
      title: locale === 'id' ? 'Standar Kurikulum Azhari' : locale === 'ar' ? 'منهجية الأزهر الشريف' : 'Azhari Curriculum',
      desc: locale === 'id' 
        ? 'Kurikulum terstruktur yang menggabungkan metode Iqro, tajwid teoretis, dan takhrij hafalan secara bertahap.' 
        : locale === 'ar'
        ? 'منهج تعليمي منظم يجمع بين تصحيح التلاوة، التجويد النظري، والضبط العملي المتدرج.'
        : 'A structured methodology combining practical recitation, theoretical Tajweed, and gradual hifz.',
      icon: BookOpen
    }
  ];

  return (
    <section className="py-24 relative overflow-hidden bg-[var(--athar-navy)] text-white">
      {/* Visual background representation of Al-Azhar dome / Islamic geometric patterns */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none" 
        style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23c9a227' stroke-opacity='0.25' stroke-width='0.5'%3E%3Cpath d='M40 0 C40 20, 20 40, 0 40 C20 40, 40 60, 40 80 C40 60, 60 40, 80 40 C60 40, 40 20, 40 0 Z'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '40px 40px'
        }} 
        aria-hidden="true" 
      />
      {/* Decorative large golden glow circle representing Al-Azhar's dome silhouette glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[var(--athar-gold)]/10 blur-[120px] pointer-events-none" aria-hidden="true" />

      <div className="page-container relative z-10">
        <div ref={ref} className="reveal text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--athar-gold)]/40 bg-[var(--athar-gold)]/10 px-3.5 py-1 text-xs font-semibold text-[var(--athar-gold-light)] mb-4">
            <Award size={12} />
            {locale === 'id' ? 'Keunggulan Akademik' : locale === 'ar' ? 'أصالة السند العلمي' : 'Academic Excellence'}
          </span>
          <h2 className="font-naskh text-4xl md:text-5xl font-bold leading-tight text-white mb-6">
            {title}
          </h2>
          <div className="gold-divider mx-auto mb-6" />
          <p className="text-slate-300 text-lg leading-relaxed max-w-2xl mx-auto">
            {subtitle}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {points.map((pt, i) => {
            const Icon = pt.icon;
            return (
              <div 
                key={i} 
                className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 hover:border-[var(--athar-gold)]/40 transition-all duration-300 group shadow-lg"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--athar-gold)]/20 border border-[var(--athar-gold)]/30 mb-6 group-hover:scale-110 transition-transform">
                  <Icon className="text-[var(--athar-gold-light)]" size={24} />
                </span>
                <h3 className="text-xl font-bold mb-3 group-hover:text-[var(--athar-gold-light)] transition-colors">
                  {pt.title}
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  {pt.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Custom badge highlighting the Egyptian Azhar Syekhs for Indonesia */}
        {isIndonesian && (
          <div className="mt-16 text-center">
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-emerald-950/40 via-emerald-900/40 to-emerald-950/40 border border-emerald-500/30 rounded-2xl p-6 max-w-2xl mx-auto shadow-md">
              <span className="text-3xl">🇮🇩</span>
              <p className="text-left text-xs md:text-sm text-emerald-200 leading-relaxed">
                <strong>Catatan Khusus Indonesia:</strong> Kami memahami pentingnya Sanad dari Syekh Mesir. Semua kelas privat di Al-Athar diampu langsung oleh lulusan Al-Azhar Kairo asli Arab, bukan guru lokal.
              </p>
            </div>
          </div>
        )}
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
        <AlAzharHeritageSection />
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
