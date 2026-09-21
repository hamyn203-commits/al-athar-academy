import React from 'react';
import { useI18n } from '../../../i18n';
import {
  Video,
  BookOpen,
  Mic,
  Shield,
  Headphones,
  CheckCircle,
  Sparkles,
  Smartphone,
  Eye,
} from 'lucide-react';
import LocalizedLink from '../../../components/LocalizedLink';

export default function LearningExperienceSection() {
  const { locale } = useI18n();
  const isAr = locale === 'ar';

  const features = [
    {
      icon: BookOpen,
      title: isAr ? 'المصحف المتزامن لحظياً' : 'Synchronized Live Mushaf',
      desc: isAr
        ? 'أثناء التسميع، يرى الطالب والشيخ نفس الصفحة، مع إشارة الشيخ المباشرة للكلمات والتنبيه الملون على مواضع الخطأ وأحكام التجويد.'
        : 'Student and teacher view the exact same Mushaf page in real-time. The Sheikh points directly to verses with color-coded phonetic notes.',
    },
    {
      icon: Video,
      title: isAr ? 'فصول ذكية خالية من التشويش' : 'Distraction-Free Smart Classrooms',
      desc: isAr
        ? 'بنية تقنية مخصصة تضمن جودة صوتية فائقة حتى مع سرعات الإنترنت المتوسطة، مع تسجيل الحصص للرجوع إليها عند المراجعة.'
        : 'Dedicated low-latency audiovisual infrastructure optimized for crystal-clear phonetics, complete with session review recordings.',
    },
    {
      icon: Mic,
      title: isAr ? 'تسليم الواجبات الصوتية وتصحيحها' : 'Audio Homework & Sheikh Feedback',
      desc: isAr
        ? 'يسجل الطالب ورده اليومي عبر المنصة بضغطة زر، ليستمع الشيخ ويسجل له ملاحظة صوتية توضح نقاط التحسين بدقة ورفق.'
        : 'Students record their daily recitation directly in the portal. The Sheikh replies with tailored voice notes guiding refinement.',
    },
    {
      icon: Eye,
      title: isAr ? 'المراقبة الصامتة لولي الأمر' : 'Silent Parent Observation Mode',
      desc: isAr
        ? 'خاصية مبتكرة تتيح لولي الأمر الدخول للحصة والاستماع لطفله ولتفاعل الشيخ دون أن يشعر الطفل بأي ارتباك أو إحراج.'
        : 'An innovative feature enabling parents to silently tune into their child’s live circle to witness progress without causing nervousness.',
    },
  ];

  return (
    <section className="py-20 lg:py-28 bg-[#fdfcf9] relative overflow-hidden border-b border-[#e9e3d5]" id="experience">
      <div className="page-container relative z-10">
        
        {/* ترويسة القسم */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold bg-[#f3ede1] text-[var(--wn-forest)] border border-[var(--wn-gold)]/40 mb-4 shadow-2xs">
            <Smartphone size={14} className="text-[var(--wn-gold)]" />
            <span>{isAr ? 'البيئة الرقمية المتقدمة' : 'Modern Learning Environment'}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[var(--wn-forest)] tracking-tight mb-5">
            {isAr ? 'تجربة التعلم التفاعلي عن بعد' : 'The Modern Remote Learning Experience'}
          </h2>

          <p className="text-base sm:text-lg text-[var(--wn-stone)] leading-relaxed font-normal">
            {isAr
              ? 'صممنا فصولنا الذكية لتمنحك شعور الجلوس بين يدي الشيخ في المسجد النبوي، مع مرونة وسهولة الحضور من منزلك وفي الوقت الذي يناسبك.'
              : 'Engineered to replicate the sacred intimacy of sitting before a master scholar in the mosque, with the full convenience of your home.'}
          </p>
        </div>

        {/* عرض تفاعلي لمكونات تجربة التعلم */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* الجانب الأيمن: بطاقات المزايا التقنية */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-white border border-[#e8dfce] shadow-xs hover:shadow-lg hover:border-[var(--wn-gold)] transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-xl bg-[var(--wn-ivory)] border border-[#e5decb] flex items-center justify-center text-[var(--wn-forest)] mb-4">
                    <Icon size={22} />
                  </div>
                  <h3 className="text-lg font-black text-[var(--wn-forest)] mb-2">
                    {feat.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[var(--wn-stone)] leading-relaxed font-normal">
                    {feat.desc}
                  </p>
                </div>
              );
            })}
          </div>

          {/* الجانب الأيسر: محاكاة بصرية لمجلس التلاوة المباشر */}
          <div className="lg:col-span-5">
            <div className="rounded-3xl bg-[var(--wn-forest)] text-white p-7 border border-[var(--wn-gold)]/40 shadow-xl relative overflow-hidden">
              
              {/* هالة داخلية */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-[var(--wn-gold)]/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold text-slate-200">
                    {isAr ? 'حلقة تلاوة مباشرة نشطة' : 'Live Interactive Circle'}
                  </span>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/10 text-[var(--wn-gold-light)]">
                  {isAr ? 'سورة مريم: آية 1-15' : 'Surah Maryam: 1-15'}
                </span>
              </div>

              {/* شاشة المصحف الافتراضية */}
              <div className="rounded-2xl bg-[#faf8f4] text-[var(--wn-charcoal)] p-5 shadow-inner border border-[#e5decb] mb-5">
                <div className="text-center font-serif text-lg leading-loose text-slate-900 border-b border-stone-200 pb-3 mb-3">
                  بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
                </div>
                <p className="text-sm font-serif leading-loose text-center text-slate-800">
                  كهيعص ﴿١﴾ ذِكْرُ رَحْمَتِ رَبِّكَ عَبْدَهُۥ زَكَرِيَّآ ﴿٢﴾ إِذْ نَادَىٰ رَبَّهُۥ نِدَآءً خَفِيًّۭا ﴿٣﴾
                </p>
                <div className="mt-3 flex items-center justify-between text-[11px] font-semibold text-[var(--wn-emerald)] pt-2 border-t border-stone-200">
                  <span>{isAr ? 'إشارة الشيخ: تفخيم الراء في "رَحْمَتِ"' : 'Teacher note: Tafkheem on "Rahmat"'}</span>
                  <span className="text-[var(--wn-gold-dark)]">✓ {isAr ? 'متقن' : 'Mastered'}</span>
                </div>
              </div>

              {/* بطاقة تفاعل المعلم والطالب */}
              <div className="flex items-center justify-between text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Headphones size={15} className="text-[var(--wn-gold)]" />
                  <span>{isAr ? 'صوت استوديو عالي النقاء 48kHz' : 'Studio Quality 48kHz Audio'}</span>
                </div>
                <span className="text-emerald-400 font-bold">● {isAr ? 'متصل' : 'Connected'}</span>
              </div>

              <div className="mt-6 pt-5 border-t border-white/10">
                <LocalizedLink
                  to="/free-trial"
                  locale={locale}
                  className="w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm text-center flex items-center justify-center gap-2 text-[var(--wn-forest)] bg-[var(--wn-gold)] hover:bg-[#d4ad5a] transition"
                >
                  <Sparkles size={16} />
                  <span>{isAr ? 'جرب الفصل الذكي في حصتك المجانية' : 'Experience the Smart Classroom Free'}</span>
                </LocalizedLink>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
