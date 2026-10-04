import React from 'react';
import { useI18n } from '../../../i18n';
import {
  GraduationCap,
  HeartHandshake,
  MonitorSmartphone,
  ShieldCheck,
  Clock,
  Users,
  Sparkles,
} from 'lucide-react';

export default function WhyWahyNamaaSection() {
  const { locale } = useI18n();
  const isAr = locale === 'ar';

  const pillars = [
    {
      icon: GraduationCap,
      title: isAr ? 'تعليم راسخ وموثوق' : 'Trusted Quran Teaching',
      desc: isAr ? 'اختيار المعلمين وبناء المسارات حول الإتقان، حسن التوجيه، والرفق بالمتعلم.' : 'Teachers and learning paths centered on mastery, guidance, and compassionate instruction.',
    },
    {
      icon: HeartHandshake,
      title: isAr ? 'القرآن أثرٌ في السلوك' : 'Growth Beyond Memorization',
      desc: isAr ? 'نربط التلاوة والحفظ بالفهم والانضباط وبناء علاقة مستمرة مع القرآن.' : 'Recitation and memorization are connected to understanding, discipline, and lifelong growth.',
    },
    {
      icon: MonitorSmartphone,
      title: isAr ? 'تجربة رقمية حديثة' : 'Modern Digital Experience',
      desc: isAr ? 'تعلم واضح وسهل عبر الأجهزة المختلفة مع أدوات تساعد على المتابعة والاستمرارية.' : 'A clear, accessible learning experience across devices with tools that support consistency.',
    },
    {
      icon: ShieldCheck,
      title: isAr ? 'متابعة للأسرة والطالب' : 'Clear Progress Follow-up',
      desc: isAr ? 'تجربة متابعة منظمة تساعد الطالب وولي الأمر على فهم التقدم والخطوة التالية.' : 'Structured follow-up helps learners and families understand progress and next steps.',
    },
    {
      icon: Clock,
      title: isAr ? 'مرونة في المواعيد' : 'Flexible Scheduling',
      desc: isAr ? 'خيارات تعلم مرنة تناسب اختلاف المناطق الزمنية وأنماط الحياة.' : 'Flexible learning options that work across time zones and different routines.',
    },
    {
      icon: Users,
      title: isAr ? 'مسارات لمراحل مختلفة' : 'Paths for Different Stages',
      desc: isAr ? 'من البداية إلى المراحل المتقدمة، مع تجربة تناسب الأطفال والناشئة والبالغين.' : 'From foundation to advanced study, with experiences for children, youth, and adults.',
    },
  ];

  return (
    <section className="wn-approved-why" id="why-wahy-namaa">
      <div className="page-container">
        <div className="wn-approved-section-heading">
          <span className="wn-approved-eyebrow"><Sparkles size={14} /> {isAr ? 'لماذا وحي ونماء؟' : 'WHY WAHY WA NAMAA'}</span>
          <h2>{isAr ? 'هوية قرآنية أصيلة بتجربة تعليم حديثة' : 'Authentic Quran learning in a modern educational experience'}</h2>
          <p>{isAr ? 'نحافظ على روح التلقي القرآني، ونقدمه في تجربة هادئة وواضحة تناسب المتعلم المعاصر.' : 'We preserve the spirit of Quranic learning and deliver it through a calm, clear experience for today’s learner.'}</p>
        </div>

        <div className="wn-approved-why__grid">
          {pillars.map(({ icon: Icon, title, desc }) => (
            <article key={title} className="wn-approved-why-card">
              <span className="wn-icon-box wn-icon-box--gold"><Icon size={22} strokeWidth={1.6} /></span>
              <h3>{title}</h3>
              <p>{desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
