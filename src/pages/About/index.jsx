import GlobalHeader from '../../components/GlobalHeader';
import GlobalFooter from '../../components/GlobalFooter';
import SEOHead from '../../components/SEOHead';
import { useI18n } from '../../i18n';
import { motion } from 'framer-motion';
import { Target, Globe, Heart, Sparkles, BookOpenCheck, Sprout } from 'lucide-react';
import '../../styles/public-experience.css';

export default function About() {
  const { locale } = useI18n();
  const isAr = locale === 'ar';

  const values = [
    {
      icon: Target,
      title: isAr ? 'رسالتنا' : 'Our mission',
      text: isAr ? 'تقديم تعليم قرآني واضح ومتدرج يجمع بين الإتقان وحسن التوجيه.' : 'Provide clear, structured Quran learning that combines mastery with thoughtful guidance.',
    },
    {
      icon: Globe,
      title: isAr ? 'تعلم بلا حدود مكانية' : 'Learning beyond location',
      text: isAr ? 'تجربة رقمية تساعد الطالب على التعلم من مكانه وبالوقت المتاح له.' : 'A digital experience that helps learners study from where they are and around their available time.',
    },
    {
      icon: Heart,
      title: isAr ? 'الرفق والاحترام' : 'Care and respect',
      text: isAr ? 'نريد أن تكون رحلة القرآن هادئة ومحترمة ومناسبة لعمر الطالب واحتياجه.' : 'We want Quran learning to feel calm, respectful, and appropriate to each learner’s age and needs.',
    },
    {
      icon: Sprout,
      title: isAr ? 'النماء قبل الأرقام' : 'Growth before vanity metrics',
      text: isAr ? 'نركز على تقدم حقيقي يمكن فهمه ومتابعته، لا على أرقام تسويقية غير موثقة.' : 'We focus on understandable, trackable progress rather than unverified marketing numbers.',
    },
  ];

  return (
    <>
      <SEOHead page={{
        title: isAr ? 'عن أكاديمية وَحْيٌ وَنَمَاء' : 'About Wahy Wa Namaa Academy',
        description: isAr ? 'تعرف على رؤية ورسالة أكاديمية وحي ونماء لتعليم القرآن.' : 'Learn about the vision and mission behind Wahy Wa Namaa Academy.',
        url: '/about',
        type: 'website',
      }} />
      <GlobalHeader />

      <main className="wn-public-shell">
        <section className="wn-public-hero">
          <div className="page-container wn-public-hero__inner">
            <div>
              <span className="wn-auth-visual__eyebrow"><Sparkles size={14} /> {isAr ? 'من نحن' : 'ABOUT US'}</span>
              <h1>{isAr ? 'وحيٌ نتعلّمه… ونماءٌ نعيشه' : 'Revelation we learn. Growth we live.'}</h1>
              <p>
                {isAr
                  ? 'وحي ونماء أكاديمية قرآنية رقمية نبني فيها تجربة تعلم تجمع أصالة التلقي مع أدوات حديثة تخدم الطالب والمعلم والأسرة.'
                  : 'Wahy Wa Namaa is a digital Quran academy combining authentic learning with modern tools that support learners, teachers, and families.'}
              </p>
            </div>
            <div className="wn-public-hero__art" aria-hidden="true">
              <div className="wn-public-orbit" />
              <div className="wn-public-orbit__core"><BookOpenCheck size={46} strokeWidth={1.25} /></div>
            </div>
          </div>
        </section>

        <section className="page-container wn-public-copy-section">
          <div className="wn-public-feature-grid">
            {values.map(({ icon: Icon, title, text }, index) => (
              <motion.article
                key={title}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * .05 }}
                className="wn-public-feature-card"
              >
                <span><Icon size={21} /></span>
                <h3>{title}</h3>
                <p>{text}</p>
              </motion.article>
            ))}
          </div>

          <div className="mt-6 wn-public-track-banner">
            <span className="wn-auth-visual__eyebrow">{isAr ? 'فلسفة الاسم' : 'THE NAME'}</span>
            <h2>{isAr ? 'وَحْيٌ وَنَمَاء' : 'Wahy Wa Namaa'}</h2>
            <p>
              {isAr
                ? 'الوحي هو الأصل الذي نتلقى منه، والنماء هو الأثر الذي نرجو أن يظهر في العلم والسلوك والاستمرار.'
                : 'Wahy is the source we learn from; Namaa is the growth we hope to see in knowledge, character, and consistency.'}
            </p>
          </div>
        </section>
      </main>

      <GlobalFooter />
    </>
  );
}
