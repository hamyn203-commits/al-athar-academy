import React from 'react';
import { useI18n } from '../../../i18n';
import {
  BookOpen,
  Award,
  Sparkles,
  Scroll,
  Globe2,
  ArrowLeft,
  ArrowRight,
  Clock,
  Users,
  Check,
} from 'lucide-react';
import LocalizedLink from '../../../components/LocalizedLink';

export default function ProgramsSection() {
  const { locale } = useI18n();
  const isAr = locale === 'ar';
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const programs = [
    {
      id: 'hifz',
      badge: isAr ? 'المسار الأكثر إقبالاً' : 'Most Popular',
      title: isAr ? 'مسار تحفيظ القرآن الكريم' : 'Quran Memorization Track',
      target: isAr ? 'للأطفال والناشئة والكبار' : 'For Children, Youth & Adults',
      desc: isAr
        ? 'خطة حفظ منهجية مرنة تراعي قدرة الطالب ووقت فراغه، مع ورد يومي للحفظ الجديد، ومراجعة صغرى وكبرى تضمن عدم التفلت.'
        : 'Systematic flexible memorization plans tailored to student capacity and schedule, with daily new verses and cumulative review.',
      features: [
        isAr ? 'جلسات فردية 1-on-1 أو حلقات نموذجية (10 مقاعد)' : '1-on-1 private or peer circles (max 10)',
        isAr ? 'متابعة يومية عبر المصحف المتزامن' : 'Daily tracking with synced Mushaf',
        isAr ? 'تقارير دورية شهرية عن وتيرة الحفظ' : 'Monthly progress & retention analytics',
      ],
      icon: BookOpen,
      link: '/courses',
    },
    {
      id: 'tajweed',
      badge: isAr ? 'إتقان الأداء الصوتي' : 'Vocal Mastery',
      title: isAr ? 'مسار التجويد وشرح المتون' : 'Tajweed & Matn Mastery',
      target: isAr ? 'للراغبين في إتقان التلاوة وتصحيح اللحن' : 'For Articulation & Tajweed Scholars',
      desc: isAr
        ? 'دراسة تطبيقية لأحكام التجويد ومخارج الحروف وصفاتها، مع شرح متني «تحفة الأطفال» و«المقدمة الجزرية» وتطبيق عملي دقيق.'
        : 'Practical study of Tajweed rules, articulation points, and classical texts (Tuhfat Al-Atfal & Al-Jazariyyah) with phonetics drill.',
      features: [
        isAr ? 'تصحيح دقيق للوقف والابتداء' : 'Rigorous pause & start rules',
        isAr ? 'شرح نظري وتطبيق عملي آية بآية' : 'Verse-by-verse theoretical & oral drill',
        isAr ? 'شهادة إتمام معتمدة بعد الاختبار' : 'Accredited certificate upon completion',
      ],
      icon: Award,
      link: '/courses',
    },
    {
      id: 'kids',
      badge: isAr ? 'التربية المبكرة' : 'Early Foundation',
      title: isAr ? 'مسار براعم النماء للأطفال' : 'Bara’em Al-Namaa for Kids',
      target: isAr ? 'للأعمار من 4 إلى 12 سنة' : 'Ages 4 to 12 Years',
      desc: isAr
        ? 'بيئة مشوقة تجمع بين التلقين بالمشافهة، والقصص القرآني، وغرس مكارم الأخلاق، بأساليب محببة وبيداغوجيا تراعي نفسية الطفل.'
        : 'Engaging, compassionate pedagogy combining oral recitation, Quranic prophetic stories, and character building.',
      features: [
        isAr ? 'معلمون ومعلمات متخصصون في تعليم الصغار' : 'Faculty specialized in early childhood education',
        isAr ? 'نظام أوسمة وجوائز تحفيزية مستمرة' : 'Continuous badge & reward gamification',
        isAr ? 'غرس العقيدة والآداب النبوية' : 'Nurturing Islamic ethics & mannerisms',
      ],
      icon: Sparkles,
      link: '/programs/kids',
    },
    {
      id: 'ijazah',
      badge: isAr ? 'أعلى درجات الإتقان' : 'Supreme Mastery',
      title: isAr ? 'مسار الإجازات بالسند المتصل' : 'Sanad & Ijazah Track',
      target: isAr ? 'لحفظة القرآن المتقنين' : 'For Accomplished Memorizers',
      desc: isAr
        ? 'ختم القرآن الكريم كاملاً غيباً بإتقان مع التلقي المباشر، لنيل الإجازة بالسند المتصل إلى رسول الله ﷺ بروايات القراءات العشر.'
        : 'Reciting the entire Holy Quran from memory under an accredited Sheikh to earn an unbroken chain of transmission (Sanad) to Prophet Muhammad ﷺ.',
      features: [
        isAr ? 'إسناد متصل موثق ومختوم رسمياً' : 'Officially stamped authentic chain of transmission',
        isAr ? 'روايات حفص، ورش، قالون، والقراءات العشر' : 'Hafs, Warsh, Qalun & the 10 canonical readings',
        isAr ? 'جلسات انفرادية مركزة مع كبار المشايخ' : 'Intensive one-on-one sessions with senior scholars',
      ],
      icon: Scroll,
      link: '/courses',
    },
    {
      id: 'non-arabic',
      badge: isAr ? 'للعالمية واللغات' : 'Global Reach',
      title: isAr ? 'القرآن لغير الناطقين بالعربية' : 'Quran for Non-Arabic Speakers',
      target: isAr ? 'للجاليات والمسلمين الجدد' : 'For English, French & International Students',
      desc: isAr
        ? 'مناهج خاصة لتعليم الحروف العربية والنطق القرآني مع معلمين يجيدون الإنجليزية ولغات متعددة لتسهيل الفهم والممارسة.'
        : 'Dedicated syllabi teaching Arabic phonetics and Quranic reading with multilingual certified instructors fluent in English.',
      features: [
        isAr ? 'شرح التجويد والمصطلحات بالإنجليزية' : 'Bilingual instruction and clear English syllabi',
        isAr ? 'تأسيس من الصفر في القراءة والحفظ' : 'From beginner alphabet to fluent recitation',
        isAr ? 'مواعيد ملائمة لكافة المناطق الزمنية' : 'Flexible schedules across all time zones',
      ],
      icon: Globe2,
      link: '/courses',
    },
  ];

  return (
    <section className="py-20 lg:py-28 bg-[var(--wn-ivory)] relative overflow-hidden border-b border-[#e9e3d5]" id="programs">
      <div className="page-container relative z-10">
        
        {/* ترويسة القسم */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold bg-white text-[var(--wn-forest)] border border-[var(--wn-gold)]/40 mb-3 shadow-2xs">
              <Scroll size={14} className="text-[var(--wn-gold)]" />
              <span>{isAr ? 'المسارات التعليمية الأكاديمية' : 'Academic Tracks'}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[var(--wn-forest)] tracking-tight">
              {isAr ? 'برامجنا في وحي ونماء' : 'Our Academic Programs'}
            </h2>
            <p className="text-base sm:text-lg text-[var(--wn-stone)] mt-3 font-normal">
              {isAr
                ? 'مسارات منهجية صممت بعناية لتناسب كل مرحلة عمرية ومستوى معرفي، من البداية وحتى نيل الإجازة بالسند المتصل.'
                : 'Carefully engineered pathways suited to every age bracket and proficiency stage, from foundational phonetics to unbroken Sanad.'}
            </p>
          </div>

          <LocalizedLink
            to="/courses"
            locale={locale}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-[var(--wn-forest)] border border-[var(--wn-gold)]/50 bg-white hover:bg-[#f6f0e4] transition shadow-xs self-start md:self-auto"
          >
            <span>{isAr ? 'عرض كافة المقررات والمسارات' : 'View All Tracks & Syllabi'}</span>
            <ArrowIcon size={16} />
          </LocalizedLink>
        </div>

        {/* شبكة البطاقات */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {programs.map((prog) => {
            const Icon = prog.icon;
            return (
              <div
                key={prog.id}
                className="group relative rounded-2xl bg-white border border-[#e5decb] p-7 shadow-xs hover:shadow-xl hover:border-[var(--wn-gold)] transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* شارة وأيقونة البرنامج */}
                  <div className="flex items-center justify-between gap-2 mb-5">
                    <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold bg-[#f6f0e4] text-[var(--wn-forest)] border border-[var(--wn-gold)]/30">
                      {prog.badge}
                    </span>
                    <div className="w-12 h-12 rounded-xl bg-[var(--wn-ivory)] border border-[#e5decb] flex items-center justify-center text-[var(--wn-forest)] group-hover:bg-[var(--wn-forest)] group-hover:text-[var(--wn-gold)] transition-colors">
                      <Icon size={22} />
                    </div>
                  </div>

                  <h3 className="text-xl font-black text-[var(--wn-forest)] mb-1 group-hover:text-[var(--wn-emerald)] transition-colors">
                    {prog.title}
                  </h3>
                  <div className="text-xs font-semibold text-[var(--wn-gold-dark)] mb-3">
                    {prog.target}
                  </div>

                  <p className="text-sm text-[var(--wn-stone)] leading-relaxed mb-6 font-normal">
                    {prog.desc}
                  </p>

                  {/* مميزات المسار */}
                  <div className="space-y-2.5 mb-8 pt-4 border-t border-[#f0ebd9]">
                    {prog.features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-2 text-xs sm:text-sm text-[var(--wn-charcoal)]">
                        <Check size={16} className="text-[var(--wn-emerald)] mt-0.5 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* زر التسجيل أو التفاصيل */}
                <LocalizedLink
                  to="/free-trial"
                  locale={locale}
                  className="w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm text-center flex items-center justify-center gap-2 text-[var(--wn-forest)] bg-[var(--wn-ivory)] hover:bg-[var(--wn-forest)] hover:text-white border border-[#e5decb] transition-all duration-200 group/btn"
                >
                  <span>{isAr ? 'سجل في هذا المسار' : 'Enroll in Track'}</span>
                  <ArrowIcon size={15} className="transition-transform group-hover/btn:translate-x-[-2px] rtl:group-hover/btn:translate-x-[-2px] ltr:group-hover/btn:translate-x-[2px]" />
                </LocalizedLink>

              </div>
            );
          })}

          {/* بطاقة خاصة للاستشارة وتحديد المسار */}
          <div className="rounded-2xl bg-gradient-to-br from-[var(--wn-forest)] to-[#081f17] text-white p-7 shadow-lg flex flex-col justify-between border border-[var(--wn-gold)]/40 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-36 h-36 bg-[var(--wn-gold)]/10 rounded-full blur-2xl pointer-events-none" />
            
            <div>
              <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-[var(--wn-gold)] mb-5">
                <Users size={22} />
              </div>
              <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold bg-[var(--wn-gold)]/20 text-[var(--wn-gold-light)] border border-[var(--wn-gold)]/40 mb-3">
                {isAr ? 'استشارة تعليمية مجانية' : 'Academic Advisory'}
              </span>
              <h3 className="text-xl font-black mb-3">
                {isAr ? 'لست متأكداً أي مسار يناسبك أو يناسب طفلك؟' : 'Unsure Which Track Fits Best?'}
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed font-normal mb-6">
                {isAr
                  ? 'احجز جلسة استشارية تقييمية مجانية مدتها 20 دقيقة مع أحد مشرفينا التربويين لتحديد مستوى الحفظ واقتراح الخطة الأمثل.'
                  : 'Book a complimentary 20-minute consultation with our academic counselor to diagnose level and design an optimal plan.'}
              </p>
            </div>

            <LocalizedLink
              to="/free-trial"
              locale={locale}
              className="w-full py-3.5 px-4 rounded-xl font-bold text-xs sm:text-sm text-center flex items-center justify-center gap-2 text-[var(--wn-forest)] bg-[var(--wn-gold)] hover:bg-[#d6b063] transition shadow-md"
            >
              <span>{isAr ? 'احجز استشارة تقييمية مجانية' : 'Book Free Assessment'}</span>
              <ArrowIcon size={15} />
            </LocalizedLink>
          </div>

        </div>

      </div>
    </section>
  );
}
