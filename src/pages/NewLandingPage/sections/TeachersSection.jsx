import React from 'react';
import { useI18n } from '../../../i18n';
import {
  GraduationCap,
  Star,
  Award,
  CheckCircle2,
  Calendar,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import LocalizedLink from '../../../components/LocalizedLink';

export default function TeachersSection() {
  const { locale, t } = useI18n();
  const isAr = locale === 'ar';
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const faculty = [
    {
      id: 1,
      name: isAr ? 'فضيلة الشيخ / د. أحمد عبد الرحمن' : 'Dr. Sheikh Ahmad Abdulrahman',
      title: isAr ? 'مُجاز بالقراءات العشر الصغرى والكبرى' : 'Certified in the 10 Canonical Qira’at',
      credentials: isAr ? 'دكتوراه التفسير وعلوم القرآن — جامعة الأزهر' : 'Ph.D. in Quranic Sciences, Al-Azhar University',
      experience: isAr ? 'خبرة 16 عاماً في الإقراء والتحفيظ' : '16+ Years in Quranic Sanad Transmission',
      rating: 4.98,
      reviewsCount: 184,
      specialty: isAr ? 'الإجازات بالسند المتصل وشرح متون التجويد' : 'Unbroken Sanad & Matn Commentary',
      tag: isAr ? 'كبير المقرئين' : 'Senior Sheikh',
    },
    {
      id: 2,
      name: isAr ? 'الشيخة / فاطمة الزهراء علي' : 'Sheikha Fatima Al-Zahraa Ali',
      title: isAr ? 'مُجازة بروايتي حفص وشعبة عن عاصم' : 'Certified in Hafs & Shu’bah Transmissions',
      credentials: isAr ? 'ليسانس الدراسات الإسلامية والعربية — الأزهر' : 'B.A. in Islamic Studies, Al-Azhar',
      experience: isAr ? 'خبرة 11 عاماً في تعليم الفتيات وبراعم القرآن' : '11+ Years Teaching Girls & Young Blossoms',
      rating: 4.95,
      reviewsCount: 142,
      specialty: isAr ? 'حلقات السيدات، وبراعم الأطفال، وتصحيح التلاوة' : 'Women Circles & Early Childhood Hifz',
      tag: isAr ? 'قسم الأخوات والبراعم' : 'Women & Children',
    },
    {
      id: 3,
      name: isAr ? 'الشيخ / عمر بن خالد الحسني' : 'Sheikh Omar bin Khalid Al-Hasani',
      title: isAr ? 'مُجاز برواية ورش عن نافع وحفص عن عاصم' : 'Certified in Warsh & Hafs Transmissions',
      credentials: isAr ? 'معهد القراءات بشبرا — الأزهر الشريف' : 'Institute of Qira’at, Al-Azhar Al-Sharif',
      experience: isAr ? 'خبرة 9 أعوام في تأهيل الحفظة للمسابقات' : '9+ Years Coaching Quran Champions',
      rating: 4.96,
      reviewsCount: 128,
      specialty: isAr ? 'ضبط المتشابهات والتثبيت السريع والمراجعة الكبرى' : 'Mutashabihat & Advanced Retention',
      tag: isAr ? 'الإتقان والمسابقات' : 'Competitions & Precision',
    },
  ];

  return (
    <section className="py-20 lg:py-28 bg-[#fdfcf9] relative overflow-hidden border-b border-[#e9e3d5]" id="faculty">
      <div className="page-container relative z-10">
        
        {/* ترويسة القسم */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold bg-[#f3ede1] text-[var(--wn-forest)] border border-[var(--wn-gold)]/40 mb-3 shadow-2xs">
              <GraduationCap size={15} className="text-[var(--wn-gold)]" />
              <span>{isAr ? 'الهيئة التعليمية المعتمدة' : 'Accredited Scholarly Faculty'}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[var(--wn-forest)] tracking-tight">
              {isAr ? 'المعلمون المجازون بالسند المتصل' : 'Our Sanad-Certified Faculty'}
            </h2>
            <p className="text-base sm:text-lg text-[var(--wn-stone)] mt-3 font-normal">
              {isAr
                ? 'نخبة من خريجي الأزهر الشريف والمجازين في القراءات، تم اختيارهم وفق معايير صارمة تجمع بين الإتقان وحسن الخلق والمهارة التربوية.'
                : 'Distinguished scholars holding unbroken chains of transmission, rigorously vetted for pedagogical mastery, patience, and warmth.'}
            </p>
          </div>

          <LocalizedLink
            to="/teachers"
            locale={locale}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-[var(--wn-forest)] border border-[var(--wn-gold)]/50 bg-white hover:bg-[#f6f0e4] transition shadow-xs self-start md:self-auto"
          >
            <span>{isAr ? 'تصفح جميع المعلمين والمعلمات' : 'Meet All Faculty Members'}</span>
            <ArrowIcon size={16} />
          </LocalizedLink>
        </div>

        {/* شبكة بطاقات المعلمين */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {faculty.map((sheikh) => (
            <div
              key={sheikh.id}
              className="group relative rounded-2xl bg-white border border-[#e8dfce] p-7 shadow-xs hover:shadow-xl hover:border-[var(--wn-gold)] transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* الشارة والتقييم */}
                <div className="flex items-center justify-between gap-2 mb-5">
                  <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-[#f6f0e4] text-[var(--wn-forest)] border border-[var(--wn-gold)]/30">
                    {sheikh.tag}
                  </span>
                  <div className="flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                    <Star size={13} className="fill-amber-500 text-amber-500" />
                    <span>{sheikh.rating}</span>
                    <span className="text-[10px] text-slate-500 font-normal">({sheikh.reviewsCount})</span>
                  </div>
                </div>

                {/* الاسم والمؤهلات */}
                <h3 className="text-xl font-black text-[var(--wn-forest)] mb-1 group-hover:text-[var(--wn-emerald)] transition-colors">
                  {sheikh.name}
                </h3>
                <div className="text-xs font-bold text-[var(--wn-gold-dark)] mb-3 flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-[var(--wn-emerald)]" />
                  <span>{sheikh.title}</span>
                </div>

                <p className="text-xs text-[var(--wn-stone)] leading-relaxed mb-4">
                  {sheikh.credentials}
                </p>

                {/* الخبرة والتخصص */}
                <div className="space-y-2 py-4 border-y border-[#f0ebd9] mb-6">
                  <div className="flex items-center gap-2 text-xs text-[var(--wn-charcoal)] font-semibold">
                    <Award size={14} className="text-[var(--wn-emerald)] shrink-0" />
                    <span>{sheikh.specialty}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <Calendar size={14} className="text-[var(--wn-gold)] shrink-0" />
                    <span>{sheikh.experience}</span>
                  </div>
                </div>
              </div>

              {/* زر الحجز المباشر */}
              <LocalizedLink
                to="/free-trial"
                locale={locale}
                className="w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm text-center flex items-center justify-center gap-2 text-[var(--wn-forest)] bg-[var(--wn-ivory)] hover:bg-[var(--wn-forest)] hover:text-white border border-[#e5decb] transition-all duration-200 group/btn"
              >
                <span>{isAr ? 'احجز حصة تجريبية مع الشيخ' : 'Book Session with Sheikh'}</span>
                <ArrowIcon size={14} className="transition-transform group-hover/btn:translate-x-[-2px] rtl:group-hover/btn:translate-x-[-2px] ltr:group-hover/btn:translate-x-[2px]" />
              </LocalizedLink>

            </div>
          ))}
        </div>

        {/* كفالة وحلقات الأخوات المخصصة */}
        <div className="mt-12 p-6 rounded-2xl bg-white border border-[#e8dfce] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#f6f0e4] flex items-center justify-center text-[var(--wn-forest)] shrink-0">
              <CheckCircle2 size={20} className="text-[var(--wn-emerald)]" />
            </div>
            <div>
              <div className="text-sm font-black text-[var(--wn-forest)]">
                {isAr ? 'خصوصية تامة وقسم مستقل للأخوات والبنات' : 'Complete Privacy & Dedicated Female Faculty'}
              </div>
              <div className="text-xs text-[var(--wn-stone)]">
                {isAr ? 'معلمات خاتمات ومجازات بالسند لحلقات الفتيات والنساء في أجواء آمنة' : 'Female scholars holding unbroken Sanad for women and young girls in total privacy'}
              </div>
            </div>
          </div>
          <LocalizedLink
            to="/teachers"
            locale={locale}
            className="shrink-0 px-5 py-2.5 rounded-xl text-xs font-bold text-[var(--wn-forest)] border border-[#ded6c3] bg-[var(--wn-ivory)] hover:bg-[#f3ede1] transition"
          >
            {isAr ? 'استعراض معلمات قسم الأخوات' : 'View Female Scholars'}
          </LocalizedLink>
        </div>

      </div>
    </section>
  );
}