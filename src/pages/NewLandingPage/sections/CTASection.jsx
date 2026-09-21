import React from 'react';
import { useI18n } from '../../../i18n';
import { Sparkles, ArrowLeft, ArrowRight, ShieldCheck, CheckCircle2, PhoneCall } from 'lucide-react';
import LocalizedLink from '../../../components/LocalizedLink';
import WahyNamaaEmblem from '../../../components/WahyNamaaEmblem';

export default function CTASection() {
  const { locale } = useI18n();
  const isAr = locale === 'ar';
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  return (
    <section className="py-20 lg:py-28 bg-[#fdfcf9] relative overflow-hidden" id="cta">
      <div className="page-container relative z-10">
        
        {/* الحاوية الرئيسية الفاخرة */}
        <div className="relative rounded-3xl overflow-hidden px-8 py-16 md:px-16 text-center shadow-2xl bg-gradient-to-br from-[var(--wn-forest)] via-[var(--wn-forest-dark)] to-[#061510] text-white border-2 border-[var(--wn-gold)]/40">
          
          {/* لمسات خلفية نورانية */}
          <div
            className="absolute top-0 right-1/4 w-96 h-96 rounded-full opacity-15 blur-3xl pointer-events-none"
            style={{ background: 'radial-gradient(circle, var(--wn-gold) 0%, transparent 70%)' }}
            aria-hidden="true"
          />
          <div
            className="absolute bottom-0 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl pointer-events-none"
            style={{ background: 'radial-gradient(circle, var(--wn-emerald) 0%, transparent 70%)' }}
            aria-hidden="true"
          />

          {/* خط زخرفي ذهبي أعلى الحاوية */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[var(--wn-gold)] to-transparent" aria-hidden="true" />

          {/* الرمز الرسمي المضيء */}
          <div className="flex justify-center mb-6">
            <WahyNamaaEmblem size={56} glow={true} />
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-white/10 text-[var(--wn-gold-light)] border border-white/15 mb-4 backdrop-blur-sm">
            <Sparkles size={14} className="text-[var(--wn-gold)]" />
            <span>{isAr ? 'أكاديمية وَحْيٌ وَنَمَاء' : 'WAHY WA NAMAA ACADEMY'}</span>
          </div>

          {/* العنوان الرسمي والدعوة */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-4 max-w-2xl mx-auto leading-tight">
            {isAr ? 'ابدأ رحلتك مع القرآن اليوم' : 'Begin Your Quranic Journey Today'}
          </h2>

          <p className="text-base sm:text-lg text-slate-300 max-w-xl mx-auto leading-relaxed mb-10 font-normal">
            {isAr
              ? 'نتعلم القرآن، نحفظه، وننمو به. احجز حصتك التجريبية المجانية لتقييم المستوى والانضمام لنخبة طلابنا حول العالم.'
              : 'Learn the Quran. Memorize it. Grow through it. Reserve your complimentary assessment session with certified scholars.'}
          </p>

          {/* أزرار الدعوة */}
          <div className="flex flex-wrap gap-4 justify-center items-center">
            <LocalizedLink
              to="/free-trial"
              locale={locale}
              className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl font-bold text-base text-[var(--wn-forest)] bg-[var(--wn-gold)] hover:bg-[#d6af5a] shadow-lg transition-all transform hover:-translate-y-0.5 group"
            >
              <span>{isAr ? 'احجز حصتك التجريبية مجاناً' : 'Book Free Trial Lesson'}</span>
              <ArrowIcon size={18} className="transition-transform group-hover:translate-x-[-3px] rtl:group-hover:translate-x-[-3px] ltr:group-hover:translate-x-[3px]" />
            </LocalizedLink>

            <LocalizedLink
              to="/contact"
              locale={locale}
              className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl font-bold text-base text-white border border-white/30 bg-white/10 hover:bg-white/20 backdrop-blur-sm transition"
            >
              <PhoneCall size={18} className="text-[var(--wn-gold-light)]" />
              <span>{isAr ? 'تحدث مع مستشار تعليمي' : 'Speak with Counselor'}</span>
            </LocalizedLink>
          </div>

          {/* ضمانات الاطمئنان الثلاث */}
          <div className="mt-12 pt-8 border-t border-white/10 flex flex-wrap justify-center items-center gap-6 sm:gap-10 text-xs sm:text-sm text-slate-300 font-medium">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-[var(--wn-gold)]" />
              <span>{isAr ? 'حصة أولى مجانية 100% بدون التزام' : '100% Free with zero obligation'}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-[var(--wn-gold)]" />
              <span>{isAr ? 'تحديد دقيق للمستوى وخطة مخصصة' : 'Placement diagnosis & custom roadmap'}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-[var(--wn-gold)]" />
              <span>{isAr ? 'معلمون مجازون بالسند المتصل' : 'Certified scholars with Sanad'}</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}