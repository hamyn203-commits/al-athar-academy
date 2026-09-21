import React, { useState } from 'react';
import { useI18n } from '../../../i18n';
import {
  BookOpen,
  Target,
  TrendingUp,
  Sprout,
  UserCheck,
  Play,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  X,
} from 'lucide-react';
import LocalizedLink from '../../../components/LocalizedLink';
import WahyNamaaEmblem from '../../../components/WahyNamaaEmblem';

export default function HeroSection() {
  const { locale } = useI18n();
  const isAr = locale === 'ar';
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;
  const [showVideoModal, setShowVideoModal] = useState(false);

  const journeyPillars = [
    {
      step: isAr ? 'نتعلم' : 'LEARN',
      title: isAr ? 'فهم وتدبر' : 'UNDERSTAND THE QURAN',
      icon: BookOpen,
    },
    {
      step: isAr ? 'نحفظ' : 'MEMORIZE',
      title: isAr ? 'حفظ راسخ' : 'BUILD A LIFELONG CONNECTION',
      icon: Target,
    },
    {
      step: isAr ? 'نتقن' : 'REFINE',
      title: isAr ? 'إتقان التلاوة' : 'GROW IN CHARACTER',
      icon: TrendingUp,
    },
    {
      step: isAr ? 'ننمو' : 'GROW',
      title: isAr ? 'نماء السلوك' : 'DEVELOP A PURPOSE',
      icon: Sprout,
    },
    {
      step: isAr ? 'نرتقي' : 'BECOME',
      title: isAr ? 'بناء الإنسان' : 'A BETTER HUMAN',
      icon: UserCheck,
    },
  ];

  return (
    <section className="relative overflow-hidden bg-[#f7f4ed] text-[#1e2421] border-b border-[#e7decb]">
      {/* خلفية جمالية هادئة مستوحاة من Prompt 10 */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage:
            'radial-gradient(ellipse at 15% 25%, rgba(14, 56, 43, 0.06) 0%, transparent 50%), radial-gradient(ellipse at 85% 70%, rgba(197, 160, 89, 0.08) 0%, transparent 45%)',
        }}
        aria-hidden="true"
      />

      <div className="page-container relative z-10 pt-10 pb-8 sm:pt-14 sm:pb-12 lg:pt-16 lg:pb-14">
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
          
          {/* الجانب الأيمن / المحتوى الرئيسي للعلامة التجارية */}
          <div className="lg:col-span-6 xl:col-span-6 flex flex-col items-center lg:items-start text-center lg:text-start">
            
            {/* رمز الهوية المركزي الرسمي من Prompt 10 */}
            <div className="mb-4 flex flex-col items-center lg:items-start">
              <div className="relative group">
                <WahyNamaaEmblem size={72} glow={true} />
              </div>
            </div>

            {/* الاسم العربي المشكول بدقة */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#0e382b] tracking-tight leading-[1.18] mb-2 font-serif">
              {isAr ? 'وَحْيٌ وَنَمَاء' : 'وَحْيٌ وَنَمَاء'}
            </h1>

            {/* الاسم بالإنجليزية متباعد الحروف بعناية */}
            <div className="text-sm sm:text-base lg:text-lg font-bold text-[#14533e] uppercase tracking-[0.25em] mb-4">
              W A H Y &nbsp; W A &nbsp; N A M A A
            </div>

            {/* الفاصل النوراني بالماسة الذهبية كما في النموذج المعتمد */}
            <div className="flex items-center justify-center lg:justify-start gap-3 w-full max-w-xs my-1 text-[#c5a059]">
              <span className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#c5a059] to-[#c5a059]" />
              <span className="text-xs">✦</span>
              <span className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-[#c5a059] to-[#c5a059]" />
            </div>

            {/* الشعار الرسمي المعتمد */}
            <div className="mt-4 mb-2">
              <p className="text-xl sm:text-2xl font-bold text-[#0e382b]">
                {isAr ? 'نتعلم القرآن، نحفظه، وننمو به.' : 'نتعلم القرآن، نحفظه، وننمو به.'}
              </p>
              <p className="text-xs sm:text-sm font-semibold text-[#665a43] mt-1 tracking-wide">
                {isAr ? 'رحلة قرآنية تُثمر نماءً مستداماً في الإنسان' : 'Quranic Learning. Lifelong Growth.'}
              </p>
            </div>

            {/* عبارة الإلهام "From Quran to a Better You" */}
            <div className="my-4 py-2 px-4 rounded-xl bg-[#f0ebd9]/60 border border-[#e4dcbe] text-xs sm:text-sm text-[#475249] max-w-lg leading-relaxed">
              <span className="font-serif italic font-bold text-[#0e382b]">"From Quran to a Better You"</span>
              <p className="mt-1 font-normal">
                {isAr
                  ? 'القرآن مصدر التعلم، والحفظ وسيلة الإتقان، والنمو هو أثر الرحلة في الإنسان. نأخذ بيدك وبيد أبنائك نحو تلاوة متقنة، وحفظ راسخ، وارتقاء سلوكي تحت إشراف نخبة من كبار المقرئين المجازين بالسند المتصل.'
                  : 'The Quran is the source of learning, memorization is the path to mastery, and growth is the enduring fruit of this journey in human character.'}
              </p>
            </div>

            {/* أزرار الدعوة للعمل المعتمدة (Pill Buttons) */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mt-4 w-full">
              <LocalizedLink
                to="/free-trial"
                locale={locale}
                className="inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full font-bold text-sm sm:text-base text-white bg-[#0e382b] hover:bg-[#14533e] shadow-md hover:shadow-xl hover:shadow-[#0e382b]/25 transition-all duration-300 group"
              >
                <span>{isAr ? 'ابدأ رحلتك' : 'Start Your Journey'}</span>
                <ArrowIcon size={17} className="transition-transform group-hover:translate-x-[-3px] rtl:group-hover:translate-x-[-3px] ltr:group-hover:translate-x-[3px]" />
              </LocalizedLink>

              <button
                type="button"
                onClick={() => setShowVideoModal(true)}
                className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full font-bold text-sm sm:text-base text-[#0e382b] border border-[#c5a059]/60 bg-white/85 hover:bg-white shadow-2xs hover:border-[#c5a059] transition-all duration-300"
              >
                <div className="w-5 h-5 rounded-full bg-[#0e382b] text-white flex items-center justify-center text-[10px]">
                  <Play size={10} className="mr-[-1px]" />
                </div>
                <span>{isAr ? 'شاهد التعريف بالأكاديمية' : 'Watch Video'}</span>
              </button>
            </div>

          </div>

          {/* الجانب الأيسر / الصورة السينمائية الإنسانية الشامخة */}
          <div className="lg:col-span-6 xl:col-span-6 relative flex justify-center">
            
            {/* الحاوية الإبداعية ذات القوس المعماري الأنيق */}
            <div className="relative w-full max-w-lg lg:max-w-none">
              
              {/* هالة دافئة هادئة خلف الإطار */}
              <div
                className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-[#0e382b]/15 via-[#c5a059]/15 to-transparent blur-2xl pointer-events-none"
                aria-hidden="true"
              />

              <div className="relative rounded-3xl overflow-hidden border border-[#d8cfb9] bg-[#eae3cf] shadow-2xl">
                
                {/* علامة مائية ناعمة لشعار وحي ونماء في ركن السماء */}
                <div className="absolute top-4 right-4 z-10 opacity-20 pointer-events-none text-white">
                  <WahyNamaaEmblem size={64} variant="light" />
                </div>

                {/* الصورة السينمائية الإنسانية الرسمية لرحلة القرآن */}
                <img
                  src="/images/hero-wahy-namaa.jpg"
                  alt={isAr ? 'رحلة الإنسان مع القرآن الكريم في أكاديمية وحي ونماء' : 'The Human Journey with the Holy Quran at Wahy Wa Namaa Academy'}
                  className="w-full h-[380px] sm:h-[450px] lg:h-[500px] object-cover object-center transition-transform duration-700 hover:scale-102"
                  loading="eager"
                  fetchPriority="high"
                />

                {/* شريط معلومات تفاعلي ناعم أسفل الصورة */}
                <div className="absolute bottom-4 inset-x-4 p-4 rounded-2xl bg-[#0e382b]/90 backdrop-blur-md border border-[#c5a059]/30 text-white shadow-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#c5a059]/20 border border-[#c5a059]/40 flex items-center justify-center text-[#e9c782]">
                      <Sparkles size={18} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#f5ebd2]">
                        {isAr ? 'مجلس تلاوة وإتقان بالسند المتصل' : 'Oral Transmission & Unbroken Sanad'}
                      </div>
                      <div className="text-[11px] text-slate-300">
                        {isAr ? 'حلقات نموذجية 10 طلاب كحد أقصى أو جلسات فردية' : 'Max 10 students peer circles or private 1-on-1'}
                      </div>
                    </div>
                  </div>
                  <LocalizedLink
                    to="/free-trial"
                    locale={locale}
                    className="shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold text-[#0e382b] bg-[#c5a059] hover:bg-[#d6af5a] transition"
                  >
                    {isAr ? 'حصة مجانية' : 'Free Trial'}
                  </LocalizedLink>
                </div>

              </div>
            </div>

          </div>

        </div>

        {/* ═════ شريط رحلة الطالب الخماسية (The 5 Journey Pillars Strip) ═════ */}
        <div className="mt-14 pt-8 border-t border-[#e2d8c3]">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-0 divide-y sm:divide-y-0 lg:divide-x lg:rtl:divide-x-reverse divide-[#e2d8c3]">
            {journeyPillars.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={idx}
                  className="px-4 py-3 flex flex-col items-center text-center group hover:bg-white/60 rounded-xl transition-all duration-200"
                >
                  <div className="w-10 h-10 rounded-full bg-[#f0ebd9] border border-[#e2d8c3] flex items-center justify-center text-[#0e382b] group-hover:bg-[#0e382b] group-hover:text-[#c5a059] transition-colors mb-2">
                    <Icon size={18} strokeWidth={1.75} />
                  </div>
                  <span className="text-[11px] font-black tracking-widest text-[#0e382b] uppercase font-mono">
                    {pillar.step}
                  </span>
                  <span className="text-[11px] font-bold text-[#636c66] mt-0.5 tracking-tight">
                    {pillar.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* نافذة الفيديو التعريفية عند الضغط على Watch Video */}
      {showVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-3xl bg-[#0e382b] rounded-3xl p-6 border border-[#c5a059]/40 shadow-2xl text-white">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2.5">
                <WahyNamaaEmblem size={24} variant="light" />
                <h3 className="text-base font-bold text-[#f5ebd2]">
                  {isAr ? 'عن أكاديمية وَحْيٌ وَنَمَاء' : 'About Wahy Wa Namaa Academy'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowVideoModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition"
              >
                <X size={18} />
              </button>
            </div>
            <div className="aspect-video w-full rounded-2xl bg-black/40 overflow-hidden flex flex-col items-center justify-center p-8 text-center border border-white/10">
              <div className="w-16 h-16 rounded-full bg-[#c5a059] text-[#0e382b] flex items-center justify-center mb-4 shadow-lg">
                <Play size={26} className="mr-[-2px]" />
              </div>
              <h4 className="text-lg font-black text-white mb-2">
                {isAr ? '«القرآن مصدر التعلم، والحفظ وسيلة الإتقان، والنمو هو أثر الرحلة في الإنسان»' : 'Quranic Learning. Lifelong Growth.'}
              </h4>
              <p className="text-xs sm:text-sm text-slate-300 max-w-md">
                {isAr
                  ? 'فيديو وثائقي يعرفك على منهجية الأكاديمية، ونخبة المشايخ المجازين، وتجربة الفصول الذكية عن بعد.'
                  : 'An introductory overview of our methodology, certified faculty, and smart remote Quranic sanctuary.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}