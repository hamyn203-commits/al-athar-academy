import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  GraduationCap,
  Play,
  Search,
  Sparkles,
  Star,
  Volume2,
} from 'lucide-react';
import { localizedPath } from '../../lib/locale';

function specializationLabel(value, locale) {
  const ar = {
    children: 'تعليم الأطفال',
    adults: 'تعليم الكبار',
    women: 'تعليم النساء',
    'non-arabic': 'غير الناطقين بالعربية',
    tajweed: 'التجويد',
    ijaza: 'الإجازة',
    'arabic-language': 'اللغة العربية',
  };

  const en = {
    children: 'Children',
    adults: 'Adults',
    women: 'Women',
    'non-arabic': 'Non-Arabic speakers',
    tajweed: 'Tajweed',
    ijaza: 'Ijazah',
    'arabic-language': 'Arabic language',
  };

  return (locale === 'ar' ? ar : en)[value] || value;
}

export default function StudentTeacherMarketplace({ teachers = [], locale = 'ar' }) {
  const isAr = locale === 'ar';
  const lp = (path) => localizedPath(path, locale);
  const [preview, setPreview] = useState(null);

  const togglePreview = (teacherId, mode) => {
    setPreview((current) => (
      current?.teacherId === teacherId && current?.mode === mode
        ? null
        : { teacherId, mode }
    ));
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-900 p-6 md:p-8 text-white overflow-hidden relative">
        <div className="absolute -left-16 -bottom-20 h-52 w-52 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-5">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-white/10 px-3 py-1 text-xs font-bold text-emerald-100">
              <Sparkles size={14} />
              {isAr ? 'اختيار المعلم المناسب لك' : 'Find the right Quran tutor'}
            </span>
            <h2 className="mt-4 text-2xl md:text-3xl font-black">
              {isAr ? 'شاهد، استمع، ثم اختر الشيخ الذي ترتاح لطريقته' : 'Watch, listen, then choose the tutor who fits you'}
            </h2>
            <p className="mt-2 text-sm leading-7 text-emerald-100/80">
              {isAr
                ? 'استعرض المعلمين المعتمدين، شاهد التعريف، استمع إلى التلاوة، ثم احجز حصة تجريبية مع اختيارك.'
                : 'Browse approved tutors, preview their introduction and recitation, then book a trial session.'}
            </p>
          </div>

          <Link
            to={lp('/teachers')}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-5 py-3 text-sm font-black text-stone-950 hover:bg-amber-300 transition"
          >
            <Search size={17} />
            {isAr ? 'بحث وفلاتر متقدمة' : 'Search all tutors'}
          </Link>
        </div>
      </div>

      {teachers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 p-10 text-center">
          <GraduationCap size={40} className="mx-auto text-slate-300 mb-3" />
          <h3 className="font-bold text-slate-800">{isAr ? 'لا توجد ملفات منشورة حاليًا' : 'No tutor profiles are available yet'}</h3>
          <p className="text-sm text-slate-500 mt-1">{isAr ? 'ستظهر هنا المعلمين المعتمدين بمجرد نشر ملفاتهم.' : 'Approved tutors will appear here once their profiles are published.'}</p>
        </div>
      ) : (
        <div className="grid xl:grid-cols-2 gap-4">
          {teachers.map((teacher) => {
            const name = teacher.user?.name || teacher.personalInfo?.fullName || (isAr ? 'معلم قرآن' : 'Quran tutor');
            const rating = Number(teacher.rating?.average || 0);
            const ratingCount = Number(teacher.rating?.count || 0);
            const experience = Number(teacher.quranInfo?.teachingExperience || 0);
            const ijazat = Number(teacher.quranInfo?.numberOfIjazat || 0);
            const specializations = Array.isArray(teacher.quranInfo?.specializations)
              ? teacher.quranInfo.specializations.slice(0, 4)
              : [];
            const intro = teacher.media?.introductionVideo;
            const recitation = teacher.media?.recitationVideo;
            const activePreview = preview?.teacherId === teacher._id ? preview.mode : null;
            const previewUrl = activePreview === 'intro' ? intro : activePreview === 'recitation' ? recitation : null;

            return (
              <article key={teacher._id} className="rounded-2xl border border-slate-200 bg-white p-4 md:p-5 shadow-sm">
                <div className="flex gap-4">
                  <img
                    src={teacher.media?.profilePhoto || teacher.user?.avatar || '/default-teacher.png'}
                    alt={name}
                    className="h-24 w-24 rounded-2xl object-cover border border-slate-100 shrink-0"
                    loading="lazy"
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-black text-slate-900 text-lg">{name}</h3>
                      {teacher.isVerified && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-700">
                          <CheckCircle2 size={12} />
                          {isAr ? 'موثق' : 'Verified'}
                        </span>
                      )}
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                      {rating > 0 && (
                        <span className="inline-flex items-center gap-1 text-amber-600">
                          <Star size={13} fill="currentColor" /> {rating.toFixed(1)}
                          {ratingCount > 0 ? <span className="text-slate-400">({ratingCount})</span> : null}
                        </span>
                      )}
                      {experience > 0 && <span className="inline-flex items-center gap-1"><Clock size={13} /> {experience} {isAr ? 'سنوات خبرة' : 'years'}</span>}
                      {ijazat > 0 && <span className="inline-flex items-center gap-1"><Award size={13} /> {ijazat} {isAr ? 'إجازات' : 'ijazahs'}</span>}
                    </div>

                    {specializations.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {specializations.map((item) => (
                          <span key={item} className="rounded-full bg-slate-50 border border-slate-100 px-2 py-1 text-[11px] text-slate-600">
                            {specializationLabel(item, locale)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 grid sm:grid-cols-2 gap-2">
                  {intro && (
                    <button
                      type="button"
                      onClick={() => togglePreview(teacher._id, 'intro')}
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:border-emerald-300 hover:bg-emerald-50"
                    >
                      <Play size={15} />
                      {isAr ? 'شاهد التعريف' : 'Watch introduction'}
                    </button>
                  )}
                  {recitation && (
                    <button
                      type="button"
                      onClick={() => togglePreview(teacher._id, 'recitation')}
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:border-emerald-300 hover:bg-emerald-50"
                    >
                      <Volume2 size={15} />
                      {isAr ? 'استمع للتلاوة' : 'Hear recitation'}
                    </button>
                  )}
                </div>

                {previewUrl && (
                  <div className="mt-3 rounded-xl overflow-hidden bg-slate-950">
                    <video key={previewUrl} controls preload="metadata" className="w-full max-h-64">
                      <source src={previewUrl} />
                    </video>
                  </div>
                )}

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <Link
                    to={lp('/teachers/' + teacher._id)}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-200 px-3 py-2.5 text-sm font-bold text-emerald-800 hover:bg-emerald-50"
                  >
                    <BookOpen size={15} />
                    {isAr ? 'عرض الملف' : 'View profile'}
                  </Link>
                  <Link
                    to={lp('/book-trial/' + teacher._id)}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-700 px-3 py-2.5 text-sm font-bold text-white hover:bg-emerald-800"
                  >
                    <GraduationCap size={15} />
                    {isAr ? 'احجز حصة تجريبية' : 'Book trial'}
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
