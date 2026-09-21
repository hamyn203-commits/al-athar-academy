import React from 'react';
import { useI18n } from '../../../i18n';
import {
  Sparkles,
  Users,
  Briefcase,
  Globe,
  Check,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';
import LocalizedLink from '../../../components/LocalizedLink';

export default function TargetAudiencesSection() {
  const { locale } = useI18n();
  const isAr = locale === 'ar';
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const audiences = [
    {
      id: 'kids',
      title: isAr ? 'الأطفال والبراعم' : 'Kids & Blossoms',
      range: isAr ? 'من 4 إلى 12 سنة' : 'Ages 4 to 12 Years',
      icon: Sparkles,
      desc: isAr
        ? 'بيداغوجيا رحيمة ومحببة تناسب طاقة الطفل، تجمع بين التلقين الشفهي، وقصص القرآن، وأوسمة الإنجاز لغرس حب كتاب الله مبكراً.'
        : 'A joyful, compassionate pedagogy tailored to young minds, combining oral repetition, Quranic stories, and badges of achievement.',
      features: [
        isAr ? 'معلمون مؤهلون خصيصاً للصغار' : 'Specialized early childhood Quran tutors',
        isAr ? 'متابعة مباشرة وتقارير مصورة للوالدين' : 'Direct parental reports & audio recordings',
        isAr ? 'حلقات قصيرة تحافظ على تركيز الطفل' : 'Engaging short sessions to maintain focus',
      ],
      link: '/programs/kids',
      badge: isAr ? 'غرس الإيمان والقرآن' : 'Nurturing Faith',
    },
    {
      id: 'youth',
      title: isAr ? 'الناشئة والشباب' : 'Youth & Teens',
      range: isAr ? 'من 13 إلى 20 سنة' : 'Ages 13 to 20 Years',
      icon: Users,
      desc: isAr
        ? 'بناء الهوية الإيمانية والمناعة الفكرية، وتثبيت الحفظ مع تدبر معاني الآيات وإجابة التساؤلات الفكرية في مرحلة البناء والتكوين.'
        : 'Strengthening moral identity and intellectual resilience, anchoring memorization with deep thematic understanding.',
      features: [
        isAr ? 'صحبة قرآنية صالحة وقدوة واعية' : 'Uplifting Quranic peer companionship',
        isAr ? 'تأهيل للمسابقات والمحافل القرآنية' : 'Coaching for local and global competitions',
        isAr ? 'ربط القرآن بواقع الشباب المعاصر' : 'Connecting revelation to contemporary challenges',
      ],
      link: '/courses',
      badge: isAr ? 'بناء الهوية والرشاد' : 'Identity & Leadership',
    },
    {
      id: 'adults',
      title: isAr ? 'الكبار والموظفون' : 'Adults & Professionals',
      range: isAr ? 'لجميع الأعمار والمشاغل' : 'Working Adults & University Students',
      icon: Briefcase,
      desc: isAr
        ? 'جداول مرنة تراعي مسؤوليات العمل والأسرة. حصص فجرية ومسائية هادئة لتصحيح التلاوة وتدارس القرآن دون ضغط أو إرهاق.'
        : 'Flexible early morning and evening slots adapting to busy professional and family lives, ensuring peaceful consistent progress.',
      features: [
        isAr ? 'مواعيد مخصصة قبل الدوام أو بعده' : 'Pre-work dawn & post-work evening slots',
        isAr ? 'خطط حفظ فردية حسب وتيرة كل دارس' : 'Custom paced memorization goals',
        isAr ? 'بيئة ناضجة ومحترمة تراعي الخصوصية' : 'Mature, supportive, private atmosphere',
      ],
      link: '/courses',
      badge: isAr ? 'بركة الوقت والحياة' : 'Life Balance & Barakah',
    },
    {
      id: 'global',
      title: isAr ? 'غير الناطقين بالعربية' : 'International Students',
      range: isAr ? 'للجاليات ومسلمي العالم' : 'Non-Arabic Speakers Worldwide',
      icon: Globe,
      desc: isAr
        ? 'تعليم الحروف العربية والنطق القرآني السليم من الصفر بالإنجليزية والفرنسية، مع نخبة من المقرئين المتقنين للغات العالمية.'
        : 'Teaching Arabic phonetics and flawless Quranic recitation from scratch in English and French by bilingual certified instructors.',
      features: [
        isAr ? 'تأسيس صوتي لمخارج الحروف الصعبة' : 'Phonetic drill for challenging Arabic letters',
        isAr ? 'مناهج مترجمة واضحة المفاهيم' : 'Bilingual textbooks and interactive guides',
        isAr ? 'تغطية لكافة المناطق الزمنية العالمية' : 'Coverage across all global time zones',
      ],
      link: '/courses',
      badge: isAr ? 'رسالة القرآن للعالمين' : 'Universal Message',
    },
  ];

  return (
    <section className="py-20 lg:py-28 bg-[var(--wn-ivory)] relative overflow-hidden border-b border-[#e9e3d5]" id="audiences">
      <div className="page-container relative z-10">
        
        {/* ترويسة القسم */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold bg-white text-[var(--wn-forest)] border border-[var(--wn-gold)]/40 mb-4 shadow-2xs">
            <Users size={14} className="text-[var(--wn-gold)]" />
            <span>{isAr ? 'برامج مخصصة لكل مرحلة' : 'Programs for Every Walk of Life'}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[var(--wn-forest)] tracking-tight mb-5">
            {isAr ? 'فئات تعليمية مخصصة وموجهة' : 'Tailored Programs for Every Student'}
          </h2>

          <p className="text-base sm:text-lg text-[var(--wn-stone)] leading-relaxed font-normal">
            {isAr
              ? 'ندرك أن لكل فئة عمرية احتياجاتها النفسية والزمنية، لذا صممنا لكل فئة منهجاً يلائم ظروفها ويحقق لها أقصى نفع ونماء.'
              : 'Recognizing that every age bracket possesses distinct pedagogical needs, we engineered targeted tracks maximizing growth.'}
          </p>
        </div>

        {/* شبكة الفئات الأربع */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {audiences.map((aud) => {
            const Icon = aud.icon;
            return (
              <div
                key={aud.id}
                className="group relative rounded-2xl bg-white border border-[#e5decb] p-7 shadow-xs hover:shadow-xl hover:border-[var(--wn-gold)] transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-[#f6f0e4] text-[var(--wn-forest)] border border-[var(--wn-gold)]/30">
                      {aud.badge}
                    </span>
                    <div className="w-12 h-12 rounded-xl bg-[var(--wn-ivory)] border border-[#e5decb] flex items-center justify-center text-[var(--wn-forest)] group-hover:bg-[var(--wn-forest)] group-hover:text-[var(--wn-gold)] transition-colors">
                      <Icon size={22} />
                    </div>
                  </div>

                  <h3 className="text-xl font-black text-[var(--wn-forest)] mb-1">
                    {aud.title}
                  </h3>
                  <div className="text-xs font-semibold text-[var(--wn-gold-dark)] mb-3">
                    {aud.range}
                  </div>

                  <p className="text-xs sm:text-sm text-[var(--wn-stone)] leading-relaxed mb-6 font-normal">
                    {aud.desc}
                  </p>

                  <div className="space-y-2 py-4 border-t border-[#f0ebd9] mb-6">
                    {aud.features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-2 text-xs text-[var(--wn-charcoal)]">
                        <Check size={14} className="text-[var(--wn-emerald)] mt-0.5 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <LocalizedLink
                  to="/free-trial"
                  locale={locale}
                  className="w-full py-2.5 px-4 rounded-xl font-bold text-xs text-center flex items-center justify-center gap-2 text-[var(--wn-forest)] bg-[var(--wn-ivory)] hover:bg-[var(--wn-forest)] hover:text-white border border-[#e5decb] transition-all"
                >
                  <span>{isAr ? 'ابدأ في هذا المسار' : 'Start in This Track'}</span>
                  <ArrowIcon size={14} />
                </LocalizedLink>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
