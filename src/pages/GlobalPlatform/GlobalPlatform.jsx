import { Link } from 'react-router-dom';
import { Globe2, Bot, GraduationCap, Users, BookOpenCheck, BellRing, LibraryBig, ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import GlobalHeader from '../../components/GlobalHeader';
import GlobalFooter from '../../components/GlobalFooter';
import SEOHead from '../../components/SEOHead';
import { useI18n } from '../../i18n';
import { localizedPath } from '../../lib/locale';
import '../../styles/public-experience.css';

export default function GlobalPlatform() {
  const { locale } = useI18n();
  const isAr = locale === 'ar';
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const modules = [
    { icon: GraduationCap, title: isAr ? 'مسارات وبرامج' : 'Programs and paths', text: isAr ? 'الدورات والمسارات المتدرجة من التأسيس إلى الحفظ والإتقان.' : 'Structured courses and paths from foundations to memorization and mastery.', to: '/tracks' },
    { icon: Users, title: isAr ? 'معلمون وجلسات مباشرة' : 'Teachers and live sessions', text: isAr ? 'ملفات معلمين، حجز جلسات، وفصل مباشر داخل نفس الحساب.' : 'Teacher profiles, booking, and live learning inside one account.', to: '/teachers' },
    { icon: Bot, title: isAr ? 'أدوات الذكاء الاصطناعي' : 'AI learning tools', text: isAr ? 'مساعد قرآني وتحليل تلاوة وأدوات مساندة للطالب والمعلم.' : 'Quran assistant, recitation analysis, and tools for learners and teachers.', to: '/ai' },
    { icon: LibraryBig, title: isAr ? 'المكتبة التعليمية' : 'Learning library', text: isAr ? 'مواد وكتب وفيديوهات تعليمية متاحة داخل المنصة.' : 'Learning materials, books, and recorded lessons inside the platform.', to: '/library' },
    { icon: BellRing, title: isAr ? 'المتابعة والإشعارات' : 'Follow-up and notifications', text: isAr ? 'تنبيهات الجلسات وتفضيلات التواصل والمتابعة من الحساب.' : 'Session alerts, communication preferences, and account follow-up.', to: '/notifications' },
    { icon: BookOpenCheck, title: isAr ? 'الشهادات والتقدم' : 'Certificates and progress', text: isAr ? 'متابعة تقدم الدورات والتحقق من الشهادات الصادرة فعليًا.' : 'Track course progress and verify certificates that are actually issued.', to: '/courses' },
  ];

  return (
    <>
      <SEOHead page={{ url:'/global-platform', title:isAr ? 'منظومة وحي ونماء الرقمية' : 'Wahy Wa Namaa Digital Platform', description:isAr ? 'استكشف وحدات منصة وحي ونماء التعليمية.' : 'Explore the Wahy Wa Namaa learning platform.' }} />
      <GlobalHeader />
      <main className="wn-public-shell">
        <section className="wn-public-hero">
          <div className="page-container wn-public-hero__inner">
            <div>
              <span className="wn-auth-visual__eyebrow"><Sparkles size={14} /> {isAr ? 'منظومة واحدة للتعلم' : 'ONE LEARNING ECOSYSTEM'}</span>
              <h1>{isAr ? 'كل رحلة القرآن داخل تجربة واحدة' : 'Your Quran journey in one connected experience'}</h1>
              <p>{isAr ? 'بدل التنقل بين أدوات متفرقة، تجمع وحي ونماء البرامج والمعلمين والجلسات والمكتبة والمتابعة في منصة واحدة.' : 'Wahy Wa Namaa brings programs, teachers, live sessions, library resources, and follow-up into one connected platform.'}</p>
              <div className="flex flex-wrap gap-2 mt-5">
                <Link to={localizedPath('/register/student',locale)} className="wn-btn wn-btn--accent">{isAr ? 'ابدأ كطالب' : 'Start as a learner'} <ArrowIcon size={15} /></Link>
                <Link to={localizedPath('/courses',locale)} className="wn-btn wn-btn--secondary">{isAr ? 'استكشف البرامج' : 'Explore programs'}</Link>
              </div>
            </div>
            <div className="wn-public-hero__art" aria-hidden="true"><div className="wn-public-orbit" /><div className="wn-public-orbit__core"><Globe2 size={46} strokeWidth={1.25} /></div></div>
          </div>
        </section>

        <section className="page-container wn-public-copy-section">
          <div className="wn-ecosystem-grid">
            {modules.map(({icon:Icon,title,text,to}) => (
              <Link key={title} to={localizedPath(to,locale)} className="wn-ecosystem-card">
                <Icon size={24} />
                <h3>{title}</h3>
                <p>{text}</p>
                <span className="inline-flex items-center gap-1 mt-4 text-xs font-bold text-[var(--wn-emerald-dark)]">{isAr ? 'فتح الوحدة' : 'Open module'} <ArrowIcon size={13} /></span>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <GlobalFooter />
    </>
  );
}
