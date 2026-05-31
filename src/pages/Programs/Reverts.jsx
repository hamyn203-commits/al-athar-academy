import { Link } from 'react-router-dom';
import { HeartHandshake, Globe2, Users, ArrowRight, BookOpen } from 'lucide-react';
import { useI18n } from '../../i18n';
import { localizedPath } from '../../lib/locale';
import GlobalHeader from '../../components/GlobalHeader';
import GlobalFooter from '../../components/GlobalFooter';
import SEOHead from '../../components/SEOHead';

const FEATURES = [
  { icon: Globe2, ar: 'دعم بالإنجليزية والفرنسية', en: 'Support in English & French' },
  { icon: BookOpen, ar: 'مسارات تعليمية مخصصة', en: 'Custom learning paths' },
  { icon: Users, ar: 'مرافقة فردية', en: 'One-on-one mentoring' },
  { icon: HeartHandshake, ar: 'مجتمع داعم', en: 'Supportive community' },
];

export default function RevertsProgram() {
  const { locale } = useI18n();
  const isAr = locale === 'ar';

  return (
    <>
      <SEOHead page={{ url: '/programs/reverts', title: isAr ? 'برنامج المسلمين الجدد' : 'New Muslims Program', description: isAr ? 'مسار تعليمي للمسلمين الجدد' : 'Learning path for new Muslims' }} />
      <GlobalHeader />
      <main className="min-h-screen bg-gradient-to-b from-teal-50 to-white">
        <section className="py-20 px-4 text-center max-w-3xl mx-auto">
          <HeartHandshake className="mx-auto text-teal-600 mb-6" size={56} />
          <h1 className="text-4xl font-bold mb-4">{isAr ? 'برنامج المسلمين الجدد' : 'New Muslims Program'}</h1>
          <p className="text-gray-600 text-lg mb-8">{isAr ? 'رحلة تعليمية لطيفة من الأساسيات إلى إتقان القرآن — بلغتك' : 'A gentle journey from basics to Quran mastery — in your language'}</p>
          <Link to={localizedPath('/register/student', locale)} className="btn-primary inline-flex items-center gap-2">
            {isAr ? 'ابدأ الآن' : 'Start Now'} <ArrowRight size={18} />
          </Link>
        </section>
        <section className="max-w-4xl mx-auto px-4 pb-20 grid md:grid-cols-2 gap-6">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.ar} className="bg-white rounded-2xl p-6 shadow-md">
                <Icon className="text-teal-600 mb-3" size={32} />
                <h3 className="font-bold text-lg">{isAr ? f.ar : f.en}</h3>
              </div>
            );
          })}
        </section>
      </main>
      <GlobalFooter />
    </>
  );
}
