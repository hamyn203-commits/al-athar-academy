import React from 'react';
import { useI18n } from '../../../i18n';
import {
  ShieldCheck,
  GraduationCap,
  Users,
  Clock,
  Sparkles,
  Smartphone,
  HeartHandshake,
  CheckCircle,
} from 'lucide-react';
import WahyNamaaEmblem from '../../../components/WahyNamaaEmblem';

export default function WhyWahyNamaaSection() {
  const { locale } = useI18n();
  const isAr = locale === 'ar';

  const pillars = [
    {
      icon: GraduationCap,
      title: isAr ? 'معلمون مجازون بالسند المتصل' : 'Certified Scholars with Unbroken Sanad',
      desc: isAr
        ? 'مشايخ ومعلمات من خريجي الأزهر الشريف وحملة القراءات العشر، يجمعون بين الرسوخ العلمي والرفق التربوي وحسن التوجيه.'
        : 'Male and female scholars accredited from Al-Azhar and holders of the 10 canonical readings, combining scholarly depth with compassionate pedagogy.',
    },
    {
      icon: HeartHandshake,
      title: isAr ? 'منهجية تربوية ترعى أثر القرآن' : 'Pedagogy Grounded in Moral Growth',
      desc: isAr
        ? 'لا نكتفي بالتسميع الآلي، بل نربط الحفظ بتزكية السلوك وبناء الضمير الإيماني، ليكون القرآن منهج حياة يلمسه الأهل والمجتمع.'
        : 'Beyond mechanical memorization, we anchor each verse in ethical refinement and moral consciousness, shaping noble character.',
    },
    {
      icon: Smartphone,
      title: isAr ? 'فصول ذكية ومصحف تفاعلي متزامن' : 'Smart Classrooms & Synced Interactive Mushaf',
      desc: isAr
        ? 'تقنيات اتصال صوتي ومرئي فائقة النقاء، مصحف رقمي يشير فيه الشيخ للكلمة المرتلة لحظياً، وأداة تصحيح ذكية للمراجعة الذاتية.'
        : 'Crystal-clear audiovisual classrooms, synchronized real-time digital Mushaf where the Sheikh points to verses live, and AI phonetics practice.',
    },
    {
      icon: ShieldCheck,
      title: isAr ? 'لوحة ولي الأمر ومتابعة دقيقة' : 'Guardian Portal & Transparent Analytics',
      desc: isAr
        ? 'إشعار فوري بعد كل حصة بتقرير الإنجاز، متابعة الواجبات الصوتية، وميزة الانضمام الصامت لمتابعة تفاعل ابنك دون إحراجه.'
        : 'Immediate post-session progress reports, audio homework reviews, and silent observation mode for parents to watch their child blossom.',
    },
    {
      icon: Clock,
      title: isAr ? 'مرونة زمنية على مدار الساعة 24/7' : 'Round-the-Clock Flexibility 24/7',
      desc: isAr
        ? 'أوقات دراسية مرنة تتكيف مع دوام المدارس وأوقات العمل في كافة القارات والمناطق الزمنية (أمريكا، أوروبا، الخليج، آسيا).'
        : 'Adaptive class timings aligning with school and work commitments across all time zones (Americas, Europe, Gulf, Asia).',
    },
    {
      icon: Users,
      title: isAr ? 'حلقات متكافئة لا تتجاوز 10 مقاعد' : 'Peer Circles Capped at Max 10 Seats',
      desc: isAr
        ? 'نضمن العدالة والتركيز الكامل بتحديد سعة الحلقات لعشرة طلاب متقاربين في المستوى والعمر، أو اختيار جلسات فردية خاصة بالكامل.'
        : 'Strict ceiling of 10 students of matched age and proficiency per circle, ensuring every student receives focused teacher attention.',
    },
  ];

  return (
    <section className="py-20 lg:py-28 bg-[var(--wn-ivory)] relative overflow-hidden border-b border-[#e9e3d5]" id="why-wahy-namaa">
      <div className="page-container relative z-10">
        
        {/* ترويسة القسم */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold bg-white text-[var(--wn-forest)] border border-[var(--wn-gold)]/40 mb-4 shadow-2xs">
            <Sparkles size={14} className="text-[var(--wn-gold)]" />
            <span>{isAr ? 'ركائز الثقة والتميز' : 'Pillars of Excellence & Trust'}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[var(--wn-forest)] tracking-tight mb-5">
            {isAr ? 'لماذا يختار الدارسون وَحْيٌ وَنَمَاء؟' : 'Why Students Choose Wahy Wa Namaa'}
          </h2>

          <p className="text-base sm:text-lg text-[var(--wn-stone)] leading-relaxed font-normal">
            {isAr
              ? 'نجمع بين أمانة الرواية وعراقة الإسناد، وبين أحدث أدوات التعليم الذكي والمتابعة التربوية التي تبث الطمأنينة في نفوس الأسر.'
              : 'Combining sacred authenticity of oral Sanad with cutting-edge digital pedagogy and total peace of mind for families.'}
          </p>
        </div>

        {/* شبكة المزايا الست */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {pillars.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="group relative rounded-2xl bg-white border border-[#e5decb] p-8 shadow-xs hover:shadow-xl hover:border-[var(--wn-gold)] transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-xl bg-[var(--wn-ivory)] border border-[#e5decb] flex items-center justify-center text-[var(--wn-forest)] group-hover:bg-[var(--wn-forest)] group-hover:text-[var(--wn-gold)] transition-colors mb-6">
                  <Icon size={26} strokeWidth={1.75} />
                </div>

                <h3 className="text-xl font-black text-[var(--wn-forest)] mb-3">
                  {item.title}
                </h3>

                <p className="text-sm sm:text-base text-[var(--wn-stone)] leading-relaxed font-normal">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* شريط الأثر الرقمي والمجتمعي */}
        <div className="mt-14 p-8 rounded-2xl bg-gradient-to-r from-[var(--wn-forest)] to-[var(--wn-emerald)] text-white shadow-lg border border-[var(--wn-gold)]/40">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl sm:text-4xl font-black text-[var(--wn-gold)] font-mono">100%</div>
              <div className="text-xs sm:text-sm text-slate-200 mt-1 font-semibold">
                {isAr ? 'مشايخ مجازون بالسند' : 'Sanad-Certified Faculty'}
              </div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-black text-[var(--wn-gold)] font-mono">35+</div>
              <div className="text-xs sm:text-sm text-slate-200 mt-1 font-semibold">
                {isAr ? 'دولة حول العالم' : 'Countries Represented'}
              </div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-black text-[var(--wn-gold)] font-mono">10</div>
              <div className="text-xs sm:text-sm text-slate-200 mt-1 font-semibold">
                {isAr ? 'طلاب كحد أقصى للحلقة' : 'Max Students per Circle'}
              </div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-black text-[var(--wn-gold)] font-mono">4.9 / 5</div>
              <div className="text-xs sm:text-sm text-slate-200 mt-1 font-semibold">
                {isAr ? 'رضا أولياء الأمور والطلاب' : 'Parent & Student Rating'}
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
