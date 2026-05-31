import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Star, Users, ArrowRight } from 'lucide-react';
import { useI18n } from '../../i18n';
import { localizedPath } from '../../lib/locale';
import GlobalHeader from '../../components/GlobalHeader';
import GlobalFooter from '../../components/GlobalFooter';
import SEOHead from '../../components/SEOHead';
import api from '../../lib/api';

export default function WomenPortal() {
  const { locale } = useI18n();
  const isAr = locale === 'ar';
  const [teachers, setTeachers] = useState([]);
  const [stats, setStats] = useState({ femaleTeachers: 0, studentsServed: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/api/women/teachers?limit=12'),
      api.get('/api/women/stats'),
    ]).then(([t, s]) => {
      setTeachers(t.teachers || []);
      setStats(s);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <>
      <SEOHead page={{ url: '/women', title: isAr ? 'أكاديمية النساء | الأثر' : 'Women Academy | Al-Athar', description: isAr ? 'قسم مستقل — معلمات وطالبات فقط' : 'Dedicated section — female teachers and students only' }} />
      <GlobalHeader />
      <main className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
        <section className="py-16 px-4 text-center">
          <ShieldCheck className="mx-auto text-purple-600 mb-4" size={52} />
          <h1 className="text-4xl font-bold mb-3">{isAr ? 'أكاديمية النساء' : 'Women Academy'}</h1>
          <p className="text-gray-600 max-w-xl mx-auto mb-6">{isAr ? 'بيئة آمنة ومستقلة — معلمات متخصصات في تعليم القرآن للنساء والبنات' : 'Safe dedicated environment — female teachers specialized in Quran for women and girls'}</p>
          <div className="flex justify-center gap-8 text-sm">
            <span className="flex items-center gap-2"><Users size={18} className="text-purple-600" /> {stats.femaleTeachers} {isAr ? 'معلمة' : 'teachers'}</span>
            <span className="flex items-center gap-2"><Star size={18} className="text-purple-600" /> {stats.studentsServed}+ {isAr ? 'طالبة' : 'students'}</span>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 pb-16">
          <h2 className="text-2xl font-bold mb-6">{isAr ? 'معلماتنا' : 'Our Teachers'}</h2>
          {loading ? (
            <div className="flex justify-center py-12"><div className="spinner spinner-lg" /></div>
          ) : teachers.length === 0 ? (
            <p className="text-center text-gray-500 py-12">{isAr ? 'لا توجد معلمات معتمدات حالياً — سجّل كمعلمة' : 'No approved teachers yet'}</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teachers.map((t) => (
                <Link key={t._id} to={localizedPath(`/teachers/${t._id}`, locale)} className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-xl">
                      {(t.user?.name || t.personalInfo?.fullName || '?')[0]}
                    </div>
                    <div>
                      <h3 className="font-bold">{t.user?.name || t.personalInfo?.fullName}</h3>
                      <p className="text-sm text-gray-500 flex items-center gap-1"><Star size={14} className="text-yellow-500 fill-yellow-500" /> {t.rating?.average?.toFixed(1) || '5.0'}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{t.personalInfo?.country} · {t.quranInfo?.teachingExperience || 0} {isAr ? 'سنوات' : 'yrs'}</p>
                  <span className="inline-flex items-center gap-1 text-purple-600 text-sm mt-3 font-medium">{isAr ? 'عرض الملف' : 'View profile'} <ArrowRight size={14} /></span>
                </Link>
              ))}
            </div>
          )}
          <div className="text-center mt-10">
            <Link to={localizedPath('/register/student', locale)} className="btn-primary">{isAr ? 'سجّلي كطالبة' : 'Register as Student'}</Link>
          </div>
        </section>
      </main>
      <GlobalFooter />
    </>
  );
}
