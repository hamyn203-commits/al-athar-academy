import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, GraduationCap, UserRound, CalendarDays, ChevronLeft, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.jsx';
import { useI18n } from '../../i18n';
import { localizedPath } from '../../lib/locale';
import api from '../../lib/api';
import GlobalHeader from '../../components/GlobalHeader';
import GlobalFooter from '../../components/GlobalFooter';
import { teacherPublicImage, teacherImageFallback } from '../../lib/teacherMedia';

const TRACKS = [
  { id: 'memorization', ar: 'حفظ القرآن ومراجعته', en: 'Quran memorization', description: 'خطة حفظ ومراجعة تناسب مستواك', specialties: ['tajweed', 'ijaza', 'adults', 'children'] },
  { id: 'tajweed_ijazah', ar: 'التجويد والإجازات', en: 'Tajweed and Ijazah', description: 'إتقان التلاوة وأحكام التجويد', specialties: ['tajweed', 'ijaza'] },
  { id: 'kids_foundation', ar: 'تأسيس الأطفال والناشئة', en: 'Kids foundation', description: 'تعليم القرآن بأسلوب يناسب الصغار', specialties: ['children'] },
];
const activeTrack = (id) => TRACKS.find(t => t.id === id) || TRACKS[0];

export default function StudentJourney() {
  const { user, isAuthenticated, isLoading, refreshUser } = useAuth();
  const { locale } = useI18n();
  const navigate = useNavigate();
  const lp = (path) => localizedPath(path, locale);
  const [chosen, setChosen] = useState('');
  const [teachers, setTeachers] = useState([]);
  const [loadingTeachers, setLoadingTeachers] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [preferredGender, setPreferredGender] = useState('any');
  const isAr = locale === 'ar';

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      navigate(lp('/login') + '?redirect=' + encodeURIComponent(lp('/journey')), { replace: true });
      return;
    }
    if (user?.role !== 'student') {
      navigate(lp(user?.role === 'guardian' ? '/guardian/dashboard' : user?.role === 'teacher' ? '/teacher/dashboard' : '/'), { replace: true });
      return;
    }
    if (!user?.name?.trim() || !user?.phone?.trim() || (user?.onboarding?.required && !user?.onboarding?.completed)) {
      navigate(lp('/profile/setup') + '?next=' + encodeURIComponent(lp('/journey')), { replace: true });
    }
  }, [isLoading, isAuthenticated, user, navigate, locale]);

  useEffect(() => {
    if (!chosen) return;
    let valid = true;
    const spec = activeTrack(chosen).specialties;
    setLoadingTeachers(true);
    setError('');
    // The public API returns approved and verified teachers only.
    api.get('/api/teachers?specialization=' + encodeURIComponent(spec.join(',')) + '&limit=60')
      .then(result => {
        if (!valid) return;
        const found = new Map();
        (result.teachers || []).forEach(t => found.set(String(t._id), t));
        setTeachers(Array.from(found.values()).sort((a, b) => {
          const score = teacher => {
            const matching = (teacher.quranInfo?.specializations || []).filter(item => spec.includes(item)).length;
            const experience = Number(teacher.quranInfo?.teachingExperience) || 0;
            const rating = Number(teacher.rating?.average) || 0;
            return matching * 100 + Math.min(experience, 15) * 2 + rating * 4;
          };
          return score(b) - score(a);
        }));
      })
      .catch(() => { if (valid) setError(isAr ? 'تعذر تحميل المعلمين الآن. حاول مجددًا.' : 'Could not load tutors. Please retry.'); })
      .finally(() => { if (valid) setLoadingTeachers(false); });
    return () => { valid = false; };
  }, [chosen, isAr]);

  const choose = async (trackId) => {
    setSaving(true);
    setError('');
    try {
      await api.patch('/api/auth/learning-track', { track: trackId }, { auth: true });
      await refreshUser();
      setChosen(trackId);
    } catch (e) { setError(e.message || 'تعذر حفظ المسار'); }
    finally { setSaving(false); }
  };
  if (isLoading || !user || user.role !== 'student') return null;
  const step = !chosen ? 3 : 4;
  const visibleTeachers = preferredGender === 'any' ? teachers : teachers.filter(t => t.personalInfo?.gender === preferredGender);

  return <>
    <GlobalHeader />
    <main className="min-h-screen bg-slate-50 py-10 px-4" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="mx-auto max-w-5xl">
        <span className="text-emerald-800 font-bold text-sm">{isAr ? 'وحي ونماء • رحلتك التعليمية' : 'Wahy Wa Namaa • Your learning journey'}</span>
        <h1 className="text-3xl font-bold mt-3 mb-2">{isAr ? 'اختر الطريق الذي يناسبك' : 'Find your learning path'}</h1>
        <p className="text-slate-600 mb-7">{isAr ? 'تم تسجيل حسابك. اختر مسارك لتظهر لك أسماء المعلمين المعتمدين المناسبين، ثم تعرف عليهم واحجز حصة تجريبية.' : 'Choose a path, explore verified tutors, and book a trial lesson.'}</p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-8">
          {[
            [1, isAr ? 'الحساب' : 'Account'], [2, isAr ? 'الملف' : 'Profile'], [3, isAr ? 'المسار' : 'Track'],
            [4, isAr ? 'الشيخ المناسب' : 'Tutor'], [5, isAr ? 'التجريبية' : 'Trial'],
          ].map(([n, label]) => <div key={n} className={`rounded-xl p-3 border text-center text-xs font-bold ${n < step ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : n === step ? 'bg-white border-emerald-600 text-emerald-900' : 'bg-slate-100 border-slate-200 text-slate-500'}`}>
            {n < step ? <CheckCircle2 className="inline-block w-4 h-4 me-1" /> : n + '. '}{label}
          </div>)}
        </div>
        {!chosen ? <>
          <h2 className="text-xl font-bold mb-4">{isAr ? 'اختر مسارك التعليمي' : 'Choose your learning track'}</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {TRACKS.map(track => <button key={track.id} type="button" onClick={() => choose(track.id)} disabled={saving}
              className="text-start bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:border-emerald-600 hover:shadow-md transition disabled:opacity-60">
              <BookOpen className="text-emerald-800 mb-4" size={28}/>
              <h3 className="font-bold text-lg mb-2">{isAr ? track.ar : track.en}</h3>
              <p className="text-slate-600 text-sm mb-4">{isAr ? track.description : 'A structured track suited to your goals.'}</p>
              <span className="text-emerald-800 font-bold text-sm">{isAr ? 'اختيار المسار' : 'Select track'} <ChevronLeft className="inline" size={16}/></span>
            </button>)}
          </div>
        </> : <>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <div><h2 className="text-xl font-bold">{isAr ? 'المشايخ المرشحون لمسار' : 'Recommended tutors for'} {isAr ? activeTrack(chosen).ar : activeTrack(chosen).en}</h2>
            <p className="text-sm text-slate-500 mt-1">{isAr ? 'جميع المعلمين المعروضين معتمدون، والترشيح حسب التخصص.' : 'All listed tutors are approved. Matching is based on specialization.'}</p></div>
            <button type="button" className="text-emerald-800 underline" onClick={() => {setChosen('');setTeachers([]);}}>{isAr ? 'تغيير المسار' : 'Change track'}</button>
          </div>
          <div className="flex flex-wrap gap-3 items-center mb-5"><label className="text-sm font-bold" htmlFor="journey-gender">{isAr ? 'أفضل التعلم مع' : 'Preferred tutor'}</label><select id="journey-gender" value={preferredGender} onChange={e => setPreferredGender(e.target.value)} className="rounded-xl border border-slate-300 bg-white p-2 text-sm"><option value="any">{isAr ? 'لا يوجد تفضيل' : 'No preference'}</option><option value="male">{isAr ? 'شيخ' : 'Male tutor'}</option><option value="female">{isAr ? 'معلمة' : 'Female tutor'}</option></select><span className="text-xs text-slate-500">{isAr ? 'الترتيب حسب مطابقة التخصص ثم الخبرة والتقييم المتاح' : 'Ordered by specialty match, experience and available ratings'}</span></div>
          {loadingTeachers && <p role="status" className="p-6 bg-white rounded-xl">{isAr ? 'جاري البحث عن المشايخ المناسبين...' : 'Finding matching tutors...'}</p>}
          {!loadingTeachers && !error && !visibleTeachers.length && <div className="bg-white border rounded-2xl p-8 text-center">
            <GraduationCap className="mx-auto text-slate-400 mb-3" size={32}/>
            <h3 className="font-bold">{isAr ? 'لا يوجد حاليًا مشايخ معتمدون مطابقون للمسار' : 'No approved tutors currently match this track'}</h3>
            <p className="text-slate-600 text-sm my-3">{isAr ? 'تقدر تختار مسارًا آخر أو تستعرض كل المعلمين المعتمدين.' : 'Choose another track or browse approved tutors.'}</p>
            <Link className="text-emerald-800 underline" to={lp('/teachers')}>{isAr ? 'عرض جميع المعلمين' : 'Browse all tutors'}</Link>
          </div>}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleTeachers.map(teacher => <div key={teacher._id} className="bg-white rounded-2xl border border-slate-200 p-5">
              <img src={teacherPublicImage(teacher.media?.profilePhoto || teacher.user?.avatar)} alt="" className="w-20 h-20 rounded-full object-cover mb-3" onError={teacherImageFallback}/>
              <h3 className="text-lg font-bold">{teacher.personalInfo?.fullName || teacher.user?.name || (isAr ? 'معلم القرآن الكريم' : 'Quran tutor')}</h3>
              <p className="text-sm text-emerald-800 mt-2 font-semibold">{isAr ? 'تخصصات مطابقة للمسار:' : 'Matching specialties:'} {(teacher.quranInfo?.specializations || []).filter(spec => activeTrack(chosen).specialties.includes(spec)).join(' • ')}</p>
              <p className="text-sm text-slate-600 mt-1">{isAr ? 'خبرة تعليمية:' : 'Experience:'} {teacher.quranInfo?.teachingExperience ?? '—'}</p>
              <div className="grid gap-2 mt-5">
                <Link to={lp('/teachers/' + teacher._id)} className="rounded-xl border border-emerald-700 text-emerald-800 text-center p-3 font-bold flex justify-center gap-2"><UserRound size={18}/>{isAr ? 'التعرف على الشيخ' : 'View tutor profile'}</Link>
                <Link to={lp('/book-trial/' + teacher._id)} className="rounded-xl bg-emerald-800 text-white text-center p-3 font-bold flex justify-center gap-2"><CalendarDays size={18}/>{isAr ? 'حجز حصة تجريبية' : 'Book a trial lesson'}</Link>
              </div>
            </div>)}
          </div>
        </>}
        {error && <p role="alert" className="mt-5 p-4 rounded-lg bg-red-50 text-red-700">{error}</p>}
      </div>
    </main>
    <GlobalFooter />
  </>;
}
