import { useState } from 'react';
import { useI18n } from '../../../i18n';
import {
  Globe,
  Users,
  CheckCircle2,
  BookOpen,
  Award,
  Sparkles,
  Shield,
  HeartHandshake,
  Mic,
  ArrowLeft,
  Volume2,
  Play,
  Pause,
} from 'lucide-react';
import LocalizedLink from '../../../components/LocalizedLink';
import AtharEmblem from '../../../components/AtharEmblem';
import { useReveal, GoldDivider } from './_shared';

export default function HeroSection() {
  const { locale, t } = useI18n();
  const textRef = useReveal();
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  return (
    <section className="geo-pattern-light relative overflow-hidden min-h-[92vh] flex items-center bg-gradient-to-b from-[#fffef9] via-[#fbf9f2] to-white">
      {/* الخط العلوي الذهبي الملوكي */}
      <div
        className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[var(--azhar-gold-leaf)] to-transparent"
        aria-hidden="true"
      />

      <div className="page-container relative w-full py-16 lg:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* الجانب الأيمن: النصوص والدعوات للعمل */}
          <div ref={textRef} className="reveal order-2 lg:order-1">
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className="section-label inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-amber-300/60 bg-amber-50/80 text-amber-900 text-xs font-bold shadow-sm">
                <Globe size={14} className="text-amber-600" aria-hidden="true" />
                {locale === 'id'
                  ? 'Platform Edukasi Quran Global'
                  : locale === 'ar'
                  ? 'منصة أزهرية عالمية لتعليم القرآن الكريم'
                  : 'Global Azhari Quranic Learning Platform'}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-emerald-100/90 text-emerald-900 border border-emerald-300/60">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping inline-block" />
                {locale === 'ar' ? 'التسجيل مفتوح الآن' : 'Open Registration'}
              </span>
            </div>

            <h1 className="font-naskh text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.2] text-[#0a1628] text-pretty">
              {t.hero.title}
            </h1>

            <GoldDivider />

            <p className="text-base sm:text-lg text-slate-700 max-w-xl leading-relaxed text-pretty font-normal mt-3">
              {t.hero.subtitle}
            </p>

            {/* الأزرار الرئيسية الفاخرة */}
            <div className="mt-8 flex flex-wrap items-center gap-3.5">
              <LocalizedLink
                to="/free-trial"
                locale={locale}
                className="btn-gold-shimmer text-base !px-8 !py-3.5 shadow-lg group"
              >
                <Sparkles size={18} className="text-amber-950 animate-pulse" />
                <span>
                  {locale === 'ar' ? 'احجز حصتك التجريبية مجاناً' : 'Book Free Trial Lesson'}
                </span>
                <ArrowLeft
                  size={18}
                  strokeWidth={2}
                  className="transition-transform group-hover:-translate-x-1"
                  aria-hidden="true"
                />
              </LocalizedLink>

              <LocalizedLink
                to="/teachers"
                locale={locale}
                className="inline-flex items-center gap-2 rounded-xl border border-amber-300/80 bg-white/95 px-6 py-3.5 text-sm font-bold text-[#0a1628] shadow-sm hover:border-amber-400 hover:bg-amber-50/50 transition-all duration-200"
              >
                <Users size={18} strokeWidth={1.75} className="text-amber-700" aria-hidden="true" />
                {t.hero.cta2}
              </LocalizedLink>
            </div>

            {/* ضمانات الحصة التجريبية */}
            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs sm:text-sm text-slate-700 font-medium">
              {[
                locale === 'ar' ? 'مجانية 100% بدون أي رسوم' : '100% Free with zero obligation',
                locale === 'ar' ? 'معلمون ومعلمات أزهريون مجازون' : 'Certified Azhari male & female scholars',
                locale === 'ar' ? 'حلقات متكافئة 10 طلاب بحد أقصى' : 'Max 10 peers per group circle',
                locale === 'ar' ? 'تحديد فوري لمستوى التلاوة' : 'Instant recitation level diagnosis',
              ].map((benefit) => (
                <span key={benefit} className="flex items-center gap-1.5">
                  <CheckCircle2 size={16} className="text-emerald-700 shrink-0" strokeWidth={2.5} />
                  <span>{benefit}</span>
                </span>
              ))}
            </div>

            {/* روابط سريعة لأقسام المنصة */}
            <div className="mt-8 flex flex-wrap gap-2 pt-6 border-t border-amber-200/50">
              {[
                { to: '/tracks', label: locale === 'ar' ? 'المسارات التعليمية' : 'Tracks', icon: Award },
                { to: '/library', label: locale === 'ar' ? 'المكتبة والمتون' : 'Library', icon: BookOpen },
                { to: '/kids', label: locale === 'ar' ? 'جوائز الأطفال' : 'Kids Awards', icon: Sparkles },
                { to: '/ai', label: locale === 'ar' ? 'مصحح الذكاء الاصطناعي' : 'AI Recitation', icon: Mic },
                { to: '/donate', label: locale === 'ar' ? 'كفالة حلقات' : 'Support Circles', icon: HeartHandshake },
              ].map(({ to, label, icon: Icon }) => (
                <LocalizedLink
                  key={to}
                  to={to}
                  className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/40 bg-white/80 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-amber-50 hover:border-amber-400 hover:text-amber-900 transition-colors shadow-2xs"
                >
                  <Icon size={13} className="text-amber-700" aria-hidden="true" />
                  {label}
                </LocalizedLink>
              ))}
            </div>
          </div>

          {/* الجانب الأيسر: بطاقة العرض الحية الفاخرة (Interactive Showcase) */}
          <div className="order-1 lg:order-2 flex justify-center lg:justify-end reveal reveal-delay-2">
            <div className="relative w-full max-w-lg">
              {/* هالة ذهبية خلفية */}
              <div
                className="absolute -inset-4 rounded-3xl opacity-50 blur-2xl pointer-events-none"
                style={{
                  background:
                    'radial-gradient(ellipse at 50% 50%, rgba(212,168,67,0.3) 0%, rgba(20,83,45,0.15) 50%, transparent 80%)',
                }}
                aria-hidden="true"
              />

              {/* البطاقة الزجاجية الحية */}
              <div className="relative rounded-3xl border border-amber-200/80 bg-white/95 backdrop-blur-2xl p-6 sm:p-7 shadow-[0_20px_50px_rgba(10,22,40,0.12)]">
                {/* ترويسة البطاقة: الشعار الفاخر + إشارة البث المباشر */}
                <div className="flex items-center justify-between pb-5 border-b border-amber-100">
                  <div className="flex items-center gap-3">
                    <AtharEmblem size={44} glow={true} />
                    <div>
                      <h2 className="text-sm font-black text-[#0a1628] leading-tight">
                        {locale === 'ar' ? 'مجلس تلاوة وتسميع مباشر' : 'Live Quranic Sanctuary'}
                      </h2>
                      <p className="text-[11px] font-semibold text-amber-800">
                        {locale === 'ar' ? 'إشراف معتمد من الأزهر الشريف' : 'Accredited Azhari Scholars'}
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-red-50 text-red-700 border border-red-200">
                    <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                    {locale === 'ar' ? 'مباشر الآن' : 'Live Now'}
                  </span>
                </div>

                {/* استماع لنموذج تلاوة عذب */}
                <div className="mt-5 rounded-2xl bg-gradient-to-br from-[#0a1628] to-[#0c2b1e] p-5 text-white shadow-md relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--azhar-gold-leaf)]/10 rounded-full blur-xl pointer-events-none" />
                  
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <Volume2 size={18} className="text-[var(--azhar-gold-bright)]" />
                      <span className="text-xs font-bold text-amber-200 tracking-wide">
                        {locale === 'ar' ? 'تلاوة نموذجية مرتلة' : 'Sample Holy Recitation'}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/10 text-amber-200">
                      سورة الفاتحة
                    </span>
                  </div>

                  {/* موجات الصوت التفاعلية */}
                  <div className="flex items-center justify-between gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                      className="w-10 h-10 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 flex items-center justify-center shrink-0 shadow hover:scale-105 active:scale-95 transition-transform"
                      aria-label={isPlayingAudio ? 'إيقاف التلاوة' : 'تشغيل نموذج التلاوة'}
                    >
                      {isPlayingAudio ? <Pause size={18} /> : <Play size={18} className="mr-0.5" />}
                    </button>

                    {/* أشرطة الموجات الصوتية */}
                    <div className="flex-1 flex items-center justify-around h-7 gap-1 px-2">
                      {[18, 35, 60, 85, 45, 95, 70, 50, 80, 40, 65, 30, 90, 55, 75, 40, 25].map(
                        (h, idx) => (
                          <span
                            key={idx}
                            className={`w-1 rounded-full transition-all duration-300 ${
                              isPlayingAudio ? 'bg-amber-400 animate-pulse' : 'bg-white/30'
                            }`}
                            style={{
                              height: isPlayingAudio ? `${Math.max(20, (h * ((idx % 3) + 1)) % 100)}%` : `${h * 0.4}%`,
                            }}
                          />
                        )
                      )}
                    </div>

                    <span className="text-[11px] text-amber-100 font-mono">00:45</span>
                  </div>
                </div>

                {/* الحلقات الطلابية المتكافئة (10 مقاعد) */}
                <div className="mt-5 p-4 rounded-2xl bg-amber-50/70 border border-amber-200/60">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-2.5">
                    <span className="flex items-center gap-1.5">
                      <Users size={14} className="text-amber-700" />
                      {locale === 'ar' ? 'سعة الحلقة النموذجية' : 'Standard Peer Circle'}
                    </span>
                    <span className="text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-md font-extrabold text-[11px]">
                      {locale === 'ar' ? 'متبقي مقعدين' : '2 Seats Left'}
                    </span>
                  </div>

                  {/* مؤشر المقاعد الـ 10 */}
                  <div className="grid grid-cols-10 gap-1.5">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div
                        key={i}
                        className={`h-5 rounded-md flex items-center justify-center text-[9px] font-bold ${
                          i < 8
                            ? 'bg-emerald-700 text-white shadow-xs'
                            : 'bg-white border-2 border-dashed border-amber-400 text-amber-900 font-black'
                        }`}
                        title={i < 8 ? `طالب ${i + 1}` : 'مقعد شاغر'}
                      >
                        {i < 8 ? '✓' : `${i + 1}`}
                      </div>
                    ))}
                  </div>
                  <p className="text-[11px] text-slate-600 mt-2">
                    {locale === 'ar'
                      ? '١٠ طلاب متقاربين في السن والمستوى لضمان أقصى تركيز وتركيز كامل من الشيخ.'
                      : 'Max 10 peers of the same level and age for personalized teacher attention.'}
                  </p>
                </div>

                {/* زر الدعوة السريع داخل البطاقة */}
                <div className="mt-5">
                  <LocalizedLink
                    to="/free-trial"
                    locale={locale}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-900 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow hover:shadow-lg hover:brightness-110 transition-all"
                  >
                    <span>{locale === 'ar' ? 'احجز المقعد الشاغر في حلقة اليوم' : 'Reserve Available Seat Today'}</span>
                    <ArrowLeft size={16} className="text-amber-300" />
                  </LocalizedLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-white to-transparent"
        aria-hidden="true"
      />
    </section>
  );
}