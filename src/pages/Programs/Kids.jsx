import { Link } from 'react-router-dom';
import { Gamepad2, Trophy, Medal, ArrowRight, ShieldCheck, BookOpen } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useI18n } from '../../i18n';
import { localizedPath } from '../../lib/locale';
import GlobalHeader from '../../components/GlobalHeader';
import GlobalFooter from '../../components/GlobalFooter';
import SEOHead from '../../components/SEOHead';
import api from '../../lib/api';
import KidsQuizGame from '../../components/games/KidsQuizGame';
import KidsLettersGame from '../../components/games/KidsLettersGame';
import KidsCompetitionsAndAwards from '../../components/kids/KidsCompetitionsAndAwards';

const FEATURES = [
  { icon: Gamepad2, ar: 'ألعاب تعليمية ممتعة', en: 'Fun educational games' },
  { icon: Trophy, ar: 'مكافآت ونقاط', en: 'Rewards & points' },
  { icon: Medal, ar: 'مسابقات شهرية', en: 'Monthly competitions' },
  { icon: ShieldCheck, ar: 'بيئة آمنة للأطفال', en: 'Safe environment for kids' },
];

export default function KidsProgram() {
  const { locale } = useI18n();
  const isAr = locale === 'ar';
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    api.get('/api/courses?program=kids&limit=6').then((d) => setCourses(d.courses || d || [])).catch(() => {
      api.get('/api/courses?category=children&limit=6').then((d) => setCourses(d.courses || d || [])).catch(() => {});
    });
  }, []);

  return (
    <>
      <SEOHead page={{ url: '/programs/kids', title: isAr ? 'برنامج الأطفال' : 'Kids Program', description: isAr ? 'تعليم القرآن للأطفال بطريقة ممتعة' : 'Fun Quran learning for children' }} />
      <GlobalHeader />
      <main className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
        <section className="py-20 px-4 text-center max-w-3xl mx-auto">
          <Gamepad2 className="mx-auto text-amber-500 mb-6" size={56} />
          <h1 className="text-4xl font-bold mb-4">{isAr ? 'برنامج الأطفال' : 'Kids Program'}</h1>
          <p className="text-gray-600 text-lg mb-8">{isAr ? 'حفظ القرآن والتجويد للأطفال — ألعاب ومكافآت ومسابقات' : 'Quran memorization for kids — games, rewards, and competitions'}</p>
          <Link to={localizedPath('/register/student', locale)} className="btn-primary inline-flex items-center gap-2">
            {isAr ? 'سجّل طفلك' : 'Register Your Child'} <ArrowRight size={18} />
          </Link>
        </section>
        <section className="max-w-4xl mx-auto px-4 pb-20 grid md:grid-cols-2 gap-6">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.ar} className="bg-white rounded-2xl p-6 shadow-md">
                <Icon className="text-amber-500 mb-3" size={32} />
                <h3 className="font-bold text-lg">{isAr ? f.ar : f.en}</h3>
              </div>
            );
          })}
        </section>
        {/* ═══ نظام مسابقات الأطفال والجوائز النصف سنوية (كل 6 أشهر) ═══ */}
        <div className="max-w-6xl mx-auto px-4 pb-16">
          <KidsCompetitionsAndAwards />
        </div>

        {/* ═══ دعوة للانضمام لمسار تأسيس الأطفال ═══ */}
        <section className="max-w-4xl mx-auto px-4 pb-16">
          <div className="bg-gradient-to-r from-emerald-900 to-teal-950 text-white rounded-3xl p-8 shadow-xl border border-emerald-500/30 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-right">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300">
                {isAr ? 'المسار المنهجي التأسيسي' : 'Foundational Track'}
              </span>
              <h3 className="text-2xl font-bold">
                {isAr ? 'مسار تأسيس الأطفال: القاعدة النورانية ونور البيان' : 'Kids Foundation: Noorania & Noor Al-Bayan'}
              </h3>
              <p className="text-emerald-100 text-sm max-w-xl">
                {isAr
                  ? 'منهج متكامل لضبط مخارج الحروف، التلقين بالصوت والصورة، والتهجئة بالرسم العثماني مع كبار المعلمين المتخصصين.'
                  : 'Complete program for phonetics, interactive pronunciation, and reading directly from the Mushaf.'}
              </p>
            </div>
            <Link
              to={localizedPath('/tracks', locale)}
              className="shrink-0 px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md hover:scale-105 transition"
            >
              {isAr ? 'استكشف مسار الأطفال' : 'Explore Kids Track'}
            </Link>
          </div>
        </section>

        <section className="max-w-xl mx-auto px-4 pb-8">
          <h2 className="font-bold text-xl mb-4 text-center">{isAr ? 'لعبة التجويد السريعة' : 'Quick Tajweed Quiz'}</h2>
          <KidsQuizGame locale={locale} />
        </section>
        <section className="max-w-xl mx-auto px-4 pb-12">
          <h2 className="font-bold text-xl mb-4 text-center">{isAr ? 'لعبة حروف الهجاء' : 'Arabic Letters Game'}</h2>
          <KidsLettersGame locale={locale} />
        </section>
        {courses.length > 0 && (
          <section className="max-w-4xl mx-auto px-4 pb-16">
            <h2 className="font-bold text-xl mb-4 flex items-center gap-2"><BookOpen size={22} /> {isAr ? 'دورات الأطفال' : 'Kids Courses'}</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {courses.map((c) => (
                <Link key={c._id} to={localizedPath(`/courses/${c.slug}`, locale)} className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition">
                  <p className="font-bold">{c.title?.ar || c.title?.en}</p>
                  <p className="text-sm text-emerald-700 mt-1">{c.price} {c.currency}</p>
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
