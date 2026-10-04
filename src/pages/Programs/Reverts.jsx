import { Link } from 'react-router-dom';
import { HeartHandshake, Globe2, Users, ArrowRight, BookOpen } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useI18n } from '../../i18n';
import { localizedPath } from '../../lib/locale';
import GlobalHeader from '../../components/GlobalHeader';
import GlobalFooter from '../../components/GlobalFooter';
import SEOHead from '../../components/SEOHead';
import api from '../../lib/api';
import '../../styles/public-experience.css';

const FEATURES = [
  { icon: Globe2, ar: 'دعم بالإنجليزية والفرنسية', en: 'Support in English & French' },
  { icon: BookOpen, ar: 'مسارات تعليمية مخصصة', en: 'Custom learning paths' },
  { icon: Users, ar: 'مرافقة فردية', en: 'One-on-one mentoring' },
  { icon: HeartHandshake, ar: 'مجتمع داعم', en: 'Supportive community' },
];

export default function RevertsProgram() {
  const { locale } = useI18n();
  const isAr = locale === 'ar';
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    api.get('/api/courses?program=reverts&limit=6').then((d) => setCourses(d.courses || d || [])).catch(() => {
      api.get('/api/courses?category=islamic&level=beginner&limit=6').then((d) => setCourses(d.courses || d || [])).catch(() => {});
    });
  }, []);

  return (
    <>
      <SEOHead page={{ url: '/programs/reverts', title: isAr ? 'برنامج المسلمين الجدد' : 'New Muslims Program', description: isAr ? 'مسار تعليمي للمسلمين الجدد' : 'Learning path for new Muslims' }} />
      <GlobalHeader />
      <main className="wn-program-shell">
        <section className="wn-program-hero page-container max-w-3xl">
          <div className="wn-program-hero__icon"><HeartHandshake size={42} /></div>
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
              <div key={f.ar} className="wn-program-card p-6">
                <Icon className="text-teal-600 mb-3" size={32} />
                <h3 className="font-bold text-lg">{isAr ? f.ar : f.en}</h3>
              </div>
            );
          })}
        </section>
        {courses.length > 0 && (
          <section className="max-w-4xl mx-auto px-4 pb-16">
            <h2 className="font-bold text-xl mb-4 flex items-center gap-2"><BookOpen size={22} /> {isAr ? 'مسارات للمسلمين الجدد' : 'New Muslim Paths'}</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {courses.map((c) => (
                <Link key={c._id} to={localizedPath(`/courses/${c.slug}`, locale)} className="wn-program-card p-4">
                  <p className="font-bold">{c.title?.ar || c.title?.en}</p>
                  <p className="text-sm text-teal-700 mt-1">{c.price} {c.currency}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
      <GlobalFooter />
    </>
  );
}
