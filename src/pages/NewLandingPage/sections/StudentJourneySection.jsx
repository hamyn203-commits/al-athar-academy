import React from 'react';
import { useI18n } from '../../../i18n';
import {
  Compass,
  BookOpen,
  CheckCircle2,
  Award,
  Sprout,
  ArrowDown,
  Sparkles,
  Layers,
} from 'lucide-react';
import LocalizedLink from '../../../components/LocalizedLink';

export default function StudentJourneySection() {
  const { locale } = useI18n();
  const isAr = locale === 'ar';

  const stages = [
    {
      step: '01',
      title: isAr ? 'نتعلم' : 'We Learn',
      phase: isAr ? 'التأسيس والتلقي' : 'Foundation & Oral Reception',
      desc: isAr
        ? 'جلسة تقييمية مجانية لتحديد المستوى بدقة، وضع الخطة المناسبة، ثم البدء بتصحيح مخارج الحروف، وتلقين الآيات كلمة بكلمة مع فهم معانيها.'
        : 'Initial placement assessment, tailored roadmap setup, direct phonetic coaching, and understanding foundational vocabulary.',
      icon: BookOpen,
      deliverables: [
        isAr ? 'تقييم فوري لمستوى التلاوة' : 'Instant recitation diagnosis',
        isAr ? 'خطة أسبوعية ملائمة للوقت' : 'Customized weekly study schedule',
        isAr ? 'تصحيح مباشر من الشيخ' : 'Direct teacher oral correction',
      ],
    },
    {
      step: '02',
      title: isAr ? 'نحفظ' : 'We Memorize',
      phase: isAr ? 'الورد اليومي والتثبيت' : 'Daily Portion & Retention',
      desc: isAr
        ? 'حفظ الآيات المقررة وفق منهجية التكرار الذكي، والتسميع المباشر داخل الحلقة أو الجلسة الخاصة، مع المراجعة الصغرى المستمرة لما سبق حفظه.'
        : 'Daily retention via smart spaced repetition, live recitation before the Sheikh, and continuous short-term cycle consolidation.',
      icon: Compass,
      deliverables: [
        isAr ? 'تسميع يومي وتوثيق بالدرجات' : 'Daily recitation & grading log',
        isAr ? 'مراجعة صغرى لا تنقطع' : 'Unbroken short-cycle reviews',
        isAr ? 'تنبيهات ومتابعة ذكية' : 'Smart attendance & habit alerts',
      ],
    },
    {
      step: '03',
      title: isAr ? 'نتقن' : 'We Master',
      phase: isAr ? 'المراجعة الكبرى والمتشابهات' : 'Major Consolidation & Precision',
      desc: isAr
        ? 'المراجعة الكبرى للأجزاء المكتملة، ربط المتشابهات اللفظية في السور، تطبيق متون التجويد الدقيقة، وخوض اختبارات مرحلية معتمدة.'
        : 'Major cumulative recitation of full Juz, unraveling Mutashabihat parallels, applied Tajweed rules, and milestone exams.',
      icon: Award,
      deliverables: [
        isAr ? 'سرد الأجزاء سرداً متصلاً' : 'Full Juz uninterrupted recitation',
        isAr ? 'ضبط المتشابهات ومواضع اللبس' : 'Mutashabihat mastery',
        isAr ? 'شهادات إتمام أجزاء رسمية' : 'Official accredited milestone certificates',
      ],
    },
    {
      step: '04',
      title: isAr ? 'ننمو' : 'We Grow',
      phase: isAr ? 'الأثر السلوكي والإجازة' : 'Living Character & Ijazah',
      desc: isAr
        ? 'ثمرة الرحلة: تحول الآيات إلى نور يضيء سلوك الطالب وأخلاقه، واستعداد الحفاظ المتقنين لنيل الإجازة بالسند المتصل لنقل الأثر للأجيال القادمة.'
        : 'The ultimate fruit: verses transform into character, conduct, and wisdom. Qualified scholars attain unbroken Sanad to transmit the divine light.',
      icon: Sprout,
      deliverables: [
        isAr ? 'تطبيق عملي وتزكية مستمرة' : 'Living Quranic moral conduct',
        isAr ? 'الإجازة بالسند المتصل لمن أتم' : 'Unbroken Sanad for full graduates',
        isAr ? 'سفراء للقرآن في أسرهم ومجتمعاتهم' : 'Quranic role models in life',
      ],
    },
  ];

  return (
    <section className="py-20 lg:py-28 bg-[#fdfcf9] relative overflow-hidden border-b border-[#e9e3d5]" id="journey">
      <div className="page-container relative z-10">
        
        {/* ترويسة القسم */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold bg-[#f3ede1] text-[var(--wn-forest)] border border-[var(--wn-gold)]/40 mb-4">
            <Layers size={14} className="text-[var(--wn-gold)]" />
            <span>{isAr ? 'خارطة طريق واضحة ومدروسة' : 'A Clear & Purposeful Roadmap'}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[var(--wn-forest)] tracking-tight mb-5">
            {isAr ? 'رحلة الطالب في وحي ونماء' : 'The Student Journey: From First Letter to Flourishing'}
          </h2>

          <p className="text-base sm:text-lg text-[var(--wn-stone)] leading-relaxed font-normal">
            {isAr
              ? 'رحلة أربع مراحل متدرجة تنقل الطالب من مجرد التلقي إلى رسوخ الحفظ، وصولاً إلى النمو الإنساني والأثر السلوكي المبارك.'
              : 'A rigorous four-phase progression guiding students from oral reception to unshakable retention and enduring character.'}
          </p>
        </div>

        {/* مسار المراحل الأربعة التفاعلي */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          
          {stages.map((stage, idx) => {
            const Icon = stage.icon;
            return (
              <div
                key={idx}
                className="relative rounded-2xl bg-white border border-[#e8dfce] p-7 shadow-xs hover:shadow-xl hover:border-[var(--wn-gold)] transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* رأس المرحلة ورقمها */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-xl bg-[var(--wn-ivory)] border border-[#e5decb] flex items-center justify-center text-[var(--wn-forest)] group-hover:bg-[var(--wn-forest)] group-hover:text-[var(--wn-gold)] transition-colors">
                      <Icon size={22} />
                    </div>
                    <span className="text-2xl font-black font-mono text-[#ded6c3] group-hover:text-[var(--wn-gold)] transition-colors">
                      {stage.step}
                    </span>
                  </div>

                  <span className="text-xs font-bold text-[var(--wn-gold-dark)] block mb-1">
                    {stage.phase}
                  </span>
                  <h3 className="text-2xl font-black text-[var(--wn-forest)] mb-3">
                    {stage.title}
                  </h3>

                  <p className="text-sm text-[var(--wn-stone)] leading-relaxed mb-6 font-normal">
                    {stage.desc}
                  </p>
                </div>

                {/* مخرجات المرحلة */}
                <div className="pt-4 border-t border-[#f0ebd9] space-y-2">
                  {stage.deliverables.map((item, dIdx) => (
                    <div key={dIdx} className="flex items-center gap-2 text-xs text-[var(--wn-charcoal)] font-semibold">
                      <CheckCircle2 size={14} className="text-[var(--wn-emerald)] shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

              </div>
            );
          })}

        </div>

        {/* دعوة للانطلاق في أولى الخطوات */}
        <div className="mt-14 p-8 rounded-2xl bg-[var(--wn-ivory)] border border-[var(--wn-gold)]/50 text-center max-w-3xl mx-auto shadow-xs">
          <h4 className="text-xl font-black text-[var(--wn-forest)] mb-2">
            {isAr ? 'ابدأ الخطوة الأولى اليوم بحصة تقييمية مجانية' : 'Take the First Step Today with a Free Assessment'}
          </h4>
          <p className="text-sm text-[var(--wn-stone)] mb-6 font-normal">
            {isAr
              ? 'لا يشترط أي مستوى مسبق. نقف معك على مستواك الحالي ونرسم لك المسار الأنسب.'
              : 'Zero prior expertise required. We meet you at your current level and craft your ideal roadmap.'}
          </p>
          <LocalizedLink
            to="/free-trial"
            locale={locale}
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold text-sm text-white bg-[var(--wn-forest)] hover:bg-[var(--wn-emerald)] shadow-md transition"
          >
            <Sparkles size={16} className="text-[var(--wn-gold)]" />
            <span>{isAr ? 'احجز جلستك التقييمية الآن' : 'Schedule Your Assessment'}</span>
          </LocalizedLink>
        </div>

      </div>
    </section>
  );
}
