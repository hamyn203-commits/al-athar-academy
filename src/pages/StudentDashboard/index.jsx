import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar, CheckCircle, FileText, Star, Trophy, BookOpen,
  Upload, Clock, Users, X, Award, Video, Gift, Copy,
} from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';
import DashboardLayout, { StatCard, TabBar } from '../../components/dashboard/DashboardLayout';
import { useRequireAuth } from '../../hooks/useRequireAuth';
import { useGamificationApi } from '../../hooks/useGamificationApi';
import { useToast } from '../../context/ToastProvider';
import api from '../../lib/api';
import { TASK_TYPES } from '../TeacherRegistration/constants';
import { useI18n } from '../../i18n';

const emptyReview = { rating: 5, comment: '', wouldContinue: true };
const emptyBook = { date: '', time: '', notes: '' };

const getStatusLabel = (status, locale) => {
  const labels = {
    id: {
      pending: 'Menunggu',
      accepted: 'Dikonfirmasi',
      rejected: 'Ditolak',
      completed: 'Selesai',
      cancelled: 'Dibatalkan',
    },
    ar: {
      pending: 'قيد الانتظار',
      accepted: 'مؤكدة',
      rejected: 'مرفوضة',
      completed: 'مكتملة',
      cancelled: 'ملغاة',
    },
    en: {
      pending: 'Pending',
      accepted: 'Confirmed',
      rejected: 'Rejected',
      completed: 'Completed',
      cancelled: 'Cancelled',
    }
  };
  const active = labels[locale] || labels.en;
  return active[status] || status;
};

const getHwStatus = (status, locale) => {
  const statuses = {
    id: {
      pending: { label: 'Belum Dikirim', cls: 'bg-yellow-100 text-yellow-700' },
      submitted: { label: 'Dikirim', cls: 'bg-blue-100 text-blue-700' },
      done: { label: 'Disetujui', cls: 'bg-green-100 text-green-700' },
    },
    ar: {
      pending: { label: 'لم يُسلّم', cls: 'bg-yellow-100 text-yellow-700' },
      submitted: { label: 'مُسلّم', cls: 'bg-blue-100 text-blue-700' },
      done: { label: 'معتمد', cls: 'bg-green-100 text-green-700' },
    },
    en: {
      pending: { label: 'Pending', cls: 'bg-yellow-100 text-yellow-700' },
      submitted: { label: 'Submitted', cls: 'bg-blue-100 text-blue-700' },
      done: { label: 'Approved', cls: 'bg-green-100 text-green-700' },
    }
  };
  const active = statuses[locale] || statuses.en;
  return active[status] || active.pending;
};

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { user, ready, logout } = useRequireAuth(['student']);
  const { locale } = useI18n();
  const toast = useToast();
  const { stats: gameStats, badges } = useGamificationApi();

  const [tab, setTab] = useState('account');
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({});
  const [trials, setTrials] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [homework, setHomework] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [courses, setCourses] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [recordings, setRecordings] = useState([]);
  const [referral, setReferral] = useState(null);
  const [loading, setLoading] = useState(true);

  const [reviewModal, setReviewModal] = useState(null);
  const [reviewForm, setReviewForm] = useState(emptyReview);
  const [bookModal, setBookModal] = useState(null);
  const [bookForm, setBookForm] = useState(emptyBook);
  const [booking, setBooking] = useState(false);

  const load = async () => {
    try {
      const [prof, st, tr, sess, hw, tch, ev, rev, enrollments, ref] = await Promise.all([
        api.get('/api/students/dashboard/profile', { auth: true }),
        api.get('/api/students/dashboard/stats', { auth: true }),
        api.get('/api/sessions/my-sessions?type=trial&limit=50', { auth: true }),
        api.get('/api/sessions/my-sessions?type=regular&limit=50', { auth: true }),
        api.get('/api/homework/student', { auth: true }),
        api.get('/api/students/dashboard/teachers', { auth: true }),
        api.get('/api/students/dashboard/evaluations', { auth: true }),
        api.get('/api/reviews/student', { auth: true }),
        api.get('/api/courses/my-courses', { auth: true }).catch(() => []),
        api.get('/api/referrals/my', { auth: true }).catch(() => ({ code: '', stats: {}, referrals: [] })),
      ]);
      setProfile(prof);
      setStats(st);
      setTrials(tr.sessions || []);
      setSessions(sess.sessions || []);
      setHomework(hw.homework || []);
      setTeachers(tch.teachers || []);
      setEvaluations(ev.evaluations || []);
      setReviews(Array.isArray(rev) ? rev : rev.reviews || []);
      setCourses(Array.isArray(enrollments) ? enrollments : []);
      setReferral(ref);
    } catch {
      toast.error(locale === 'id' ? 'Gagal memuat data dasbor siswa' : locale === 'ar' ? 'تعذر تحميل بيانات لوحة الطالب' : 'Failed to load student dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (ready) load(); }, [ready]);

  useEffect(() => {
    if (!ready) return;
    if (tab === 'certificates' && !certificates.length) {
      api.get('/api/lms/my-certificates', { auth: true }).then(setCertificates).catch(() => setCertificates([]));
    }
    if (tab === 'recordings' && !recordings.length) {
      api.get('/api/students/dashboard/recordings', { auth: true })
        .then((d) => setRecordings(d.sessions || [])).catch(() => setRecordings([]));
    }
    if (tab === 'referral' && !referral) {
      api.get('/api/referrals/my', { auth: true }).then(setReferral).catch(() => setReferral({ code: '', stats: {}, referrals: [] }));
    }
  }, [tab, ready, certificates.length, recordings.length, referral]);

  if (!ready) return null;

  const upcomingTrials = trials.filter((s) => s.status === 'accepted' && new Date(s.scheduledAt) >= new Date());
  const pendingTrials = trials.filter((s) => s.status === 'pending');
  const upcomingSessions = sessions.filter((s) => s.status === 'accepted' && new Date(s.scheduledAt) >= new Date());
  const pendingSessions = sessions.filter((s) => s.status === 'pending');

  const submitHomework = async (homeworkId, file, sessionId) => {
    if (!file) return;
    const fd = new FormData();
    fd.append('submission', file);
    if (sessionId) fd.append('sessionId', sessionId);
    try {
      await api.post(`/api/homework/${homeworkId}/submit`, fd, { auth: true, json: false });
      toast.success(locale === 'id' ? 'Tugas berhasil diunggah' : locale === 'ar' ? 'تم رفع الواجب بنجاح' : 'Homework uploaded successfully');
      load();
    } catch (e) {
      toast.error(e.message || (locale === 'id' ? 'Gagal mengunggah tugas' : locale === 'ar' ? 'فشل رفع الواجب' : 'Failed to upload homework'));
    }
  };

  const openReview = (session) => {
    setReviewModal(session);
    setReviewForm(emptyReview);
  };

  const submitReview = async () => {
    if (!reviewModal) return;
    try {
      await api.post('/api/reviews', {
        teacherId: reviewModal.teacher?._id,
        sessionId: reviewModal._id,
        rating: reviewForm.rating,
        comment: reviewForm.comment,
      }, { auth: true });
      await api.put(`/api/sessions/${reviewModal._id}/feedback`, {
        rating: reviewForm.rating,
        comment: reviewForm.comment,
        wouldContinue: reviewForm.wouldContinue,
      }, { auth: true });
      toast.success(locale === 'id' ? 'Ulasan Anda berhasil dikirim' : locale === 'ar' ? 'تم إرسال تقييمك' : 'Review submitted successfully');
      setReviewModal(null);
      load();
    } catch (e) {
      toast.error(e.message || (locale === 'id' ? 'Gagal mengirim ulasan' : locale === 'ar' ? 'فشل إرسال التقييم' : 'Failed to submit review'));
    }
  };

  const openBook = (teacher) => {
    setBookModal(teacher);
    setBookForm(emptyBook);
  };

  const bookRegular = async (e) => {
    e.preventDefault();
    if (!bookModal || !bookForm.date || !bookForm.time) return;
    setBooking(true);
    try {
      await api.post('/api/sessions/regular', {
        teacherId: bookModal._id,
        scheduledAt: new Date(`${bookForm.date}T${bookForm.time}`),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        notes: bookForm.notes,
      }, { auth: true });
      toast.success(locale === 'id' ? 'Permintaan sesi berhasil dikirim ke guru' : locale === 'ar' ? 'تم إرسال طلب الحصة للمعلم' : 'Session request sent to tutor');
      setBookModal(null);
      load();
    } catch (err) {
      toast.error(err.message || (locale === 'id' ? 'Gagal memesan sesi' : locale === 'ar' ? 'فشل الحجز' : 'Failed to book session'));
    } finally {
      setBooking(false);
    }
  };

  const hasReviewed = (sessionId) => reviews.some((r) => r.session === sessionId || r.session?._id === sessionId);

  const tabs = [
    { id: 'account', label: locale === 'id' ? 'Akun Saya' : locale === 'ar' ? 'حسابي' : 'My Account' },
    { id: 'trials', label: locale === 'id' ? `Uji Coba (${pendingTrials.length + upcomingTrials.length})` : locale === 'ar' ? `تجريبية (${pendingTrials.length + upcomingTrials.length})` : `Trials (${pendingTrials.length + upcomingTrials.length})` },
    { id: 'sessions', label: locale === 'id' ? `Sesi Saya (${upcomingSessions.length + pendingSessions.length})` : locale === 'ar' ? `حصصي (${upcomingSessions.length + pendingSessions.length})` : `My Sessions (${upcomingSessions.length + pendingSessions.length})` },
    { id: 'homework', label: locale === 'id' ? `Tugas (${stats.homeworkPending || 0})` : locale === 'ar' ? `واجبات (${stats.homeworkPending || 0})` : `Homework (${stats.homeworkPending || 0})` },
    { id: 'certificates', label: locale === 'id' ? 'Sertifikat' : locale === 'ar' ? 'شهاداتي' : 'Certificates' },
    { id: 'recordings', label: locale === 'id' ? 'Rekaman' : locale === 'ar' ? 'تسجيلات' : 'Recordings' },
    { id: 'achievements', label: locale === 'id' ? 'Pencapaian' : locale === 'ar' ? 'إنجازاتي' : 'Achievements' },
    { id: 'referral', label: locale === 'id' ? 'Afiliasi' : locale === 'ar' ? 'السفراء' : 'Referral' },
    { id: 'evaluations', label: locale === 'id' ? 'Evaluasi Guru' : locale === 'ar' ? 'تقييمات المعلم' : 'Tutor Evaluations' },
  ];

  return (
    <DashboardLayout title={locale === 'id' ? 'Dasbor Siswa' : locale === 'ar' ? 'لوحة تحكم الطالب' : 'Student Dashboard'} user={user} onLogout={logout}>
      {loading ? (
        <div className="flex justify-center py-20"><div className="spinner spinner-lg" /></div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            <StatCard label={locale === 'id' ? 'Sesi Mendatang' : locale === 'ar' ? 'حصص قادمة' : 'Upcoming Sessions'} value={stats.upcomingSessions || 0} icon={Calendar} color="emerald" />
            <StatCard label={locale === 'id' ? 'Uji Coba Pending' : locale === 'ar' ? 'تجريبية معلقة' : 'Pending Trials'} value={stats.pendingTrials || 0} icon={Clock} color="yellow" />
            <StatCard label={locale === 'id' ? 'Sesi Selesai' : locale === 'ar' ? 'حصص مكتملة' : 'Completed Sessions'} value={stats.completedSessions || 0} icon={CheckCircle} color="blue" />
            <StatCard label={locale === 'id' ? 'Poin' : locale === 'ar' ? 'النقاط' : 'Points'} value={gameStats?.points?.total || 0} icon={Trophy} color="orange" />
          </div>

          {referral?.code && (
            <div className="mb-6 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="font-bold flex items-center gap-2 text-orange-900"><Gift size={20} /> {locale === 'id' ? 'Program Afiliasi' : locale === 'ar' ? 'برنامج السفراء' : 'Referral Program'}</p>
                <p className="text-sm text-orange-800 mt-1">
                  {locale === 'id' ? `Undang teman dan dapatkan poin — ${referral.stats?.totalPoints || 0} poin sejauh ini` : locale === 'ar' ? `ادعُ صديقاً واحصل على نقاط — ${referral.stats?.totalPoints || 0} نقطة حتى الآن` : `Invite a friend and earn points — ${referral.stats?.totalPoints || 0} points so far`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <code className="bg-white px-3 py-2 rounded-lg font-mono text-sm border">{referral.code}</code>
                <button type="button" onClick={() => { navigator.clipboard?.writeText(referral.link || referral.code); toast.success(locale === 'id' ? 'Tautan afiliasi berhasil disalin' : locale === 'ar' ? 'تم نسخ رابط الإحالة' : 'Referral link copied'); }}
                  className="flex items-center gap-1 bg-orange-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-orange-700">
                  <Copy size={16} /> {locale === 'id' ? 'Salin' : locale === 'ar' ? 'نسخ' : 'Copy'}
                </button>
                <button type="button" onClick={() => setTab('referral')} className="text-sm text-orange-700 underline">{locale === 'id' ? 'Detail' : locale === 'ar' ? 'التفاصيل' : 'Details'}</button>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <TabBar tabs={tabs} active={tab} onChange={setTab} />

            {tab === 'account' && (
              <div className="space-y-6">
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5">
                  <h3 className="font-bold mb-3">{locale === 'id' ? 'Selamat datang,' : locale === 'ar' ? 'مرحباً،' : 'Welcome,'} {profile?.user?.name || user?.name}</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                    <InfoRow label={locale === 'id' ? 'Email' : locale === 'ar' ? 'البريد' : 'Email'} value={profile?.user?.email || user?.email} />
                    <InfoRow label={locale === 'id' ? 'Telepon' : locale === 'ar' ? 'الهاتف' : 'Phone'} value={profile?.user?.phone} />
                    <InfoRow label={locale === 'id' ? 'Sesi Selesai' : locale === 'ar' ? 'حصص مكتملة' : 'Completed Sessions'} value={profile?.summary?.completedSessions || 0} />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-5">
                    <Trophy className="text-emerald-600 mb-2" size={28} />
                    <p className="text-2xl font-bold text-emerald-700">{gameStats?.points?.total || 0} {locale === 'id' ? 'poin' : locale === 'ar' ? 'نقطة' : 'points'}</p>
                    <p className="text-sm text-slate-600">
                      {locale === 'id' ? `Level ${gameStats?.points?.level || 1}` : locale === 'ar' ? `المستوى ${gameStats?.points?.level || 1}` : `Level ${gameStats?.points?.level || 1}`} — 🔥 {gameStats?.streaks?.current || 0} {locale === 'id' ? 'hari' : locale === 'ar' ? 'يوم' : 'days'}
                    </p>
                    {(badges.unlocked || []).length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {badges.unlocked.slice(0, 4).map((b) => (
                          <span key={b._id} className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                            {b.badge?.name?.ar || b.badge?.code}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="border rounded-xl p-5">
                    <h3 className="font-bold text-sm mb-2 flex items-center gap-2"><BookOpen size={16} /> {locale === 'id' ? 'Kursus Saya' : locale === 'ar' ? 'دوراتي' : 'My Courses'} ({courses.length})</h3>
                    {courses.length === 0 ? (
                      <Link to="/courses" className="text-sm text-emerald-600 hover:underline">{locale === 'id' ? 'Cari Kursus' : locale === 'ar' ? 'تصفح الدورات' : 'Browse Courses'}</Link>
                    ) : courses.slice(0, 3).map((e) => (
                      <div key={e._id} className="flex justify-between items-center text-sm py-1.5 border-b last:border-0">
                        <span>{locale === 'id' ? (e.course?.title?.id || e.course?.title?.en) : (e.course?.title?.ar || 'دورة')}</span>
                        <button onClick={() => navigate(`/courses/${e.course?.slug}/learn`)} className="text-emerald-600 text-xs">{locale === 'id' ? 'Lanjutkan' : locale === 'ar' ? 'متابعة' : 'Continue'}</button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold flex items-center gap-2"><Users size={18} /> {locale === 'id' ? 'Guru Saya' : locale === 'ar' ? 'معلموي' : 'My Tutors'} ({teachers.length})</h3>
                    <Link to="/teachers" className="text-sm text-emerald-600 hover:underline">{locale === 'id' ? 'Cari Guru' : locale === 'ar' ? 'ابحث عن معلم' : 'Find a Tutor'}</Link>
                  </div>
                  {teachers.length === 0 ? (
                    <p className="text-center text-gray-500 py-6">{locale === 'id' ? 'Pesan sesi uji coba gratis dari halaman guru' : locale === 'ar' ? 'احجز حصة تجريبية من صفحة المعلمين' : 'Book a trial session from the teachers page'}</p>
                  ) : teachers.map((t) => (
                    <div key={t._id} className="border rounded-lg p-4 mb-2 flex flex-wrap justify-between items-center gap-3">
                      <div>
                        <h4 className="font-bold">{t.name}</h4>
                        <p className="text-xs text-gray-500">{t.country} — {t.sessionCount} {locale === 'id' ? 'sesi' : locale === 'ar' ? 'حصة' : 'sessions'} — ⭐ {t.rating?.toFixed?.(1) || '0'}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => navigate(`/teachers/${t._id}`)} className="px-3 py-1.5 border rounded-lg text-sm">{locale === 'id' ? 'Profil' : locale === 'ar' ? 'الملف' : 'Profile'}</button>
                        {t.canBookRegular && (
                          <button onClick={() => openBook(t)} className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-sm">{locale === 'id' ? 'Pesan Sesi' : locale === 'ar' ? 'حجز حصة' : 'Book Session'}</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === 'trials' && (
              <div className="space-y-3">
                <p className="text-sm text-slate-600 mb-2">{locale === 'id' ? 'Permintaan sesi uji coba dengan guru' : locale === 'ar' ? 'طلبات الحصة التجريبية مع المعلمين' : 'Trial session requests with tutors'}</p>
                {trials.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-3">{locale === 'id' ? 'Tidak ada permintaan uji coba' : locale === 'ar' ? 'لا طلبات تجريبية' : 'No trial requests'}</p>
                    <Link to="/teachers" className="btn-primary inline-block text-sm">{locale === 'id' ? 'Pesan Sesi Uji Coba' : locale === 'ar' ? 'احجز تجريبية' : 'Book a Trial'}</Link>
                  </div>
                ) : trials.map((s) => (
                  <SessionCard key={s._id} session={s} onReview={openReview} hasReviewed={hasReviewed(s._id)} />
                ))}
              </div>
            )}

            {tab === 'sessions' && (
              <div className="space-y-3">
                <p className="text-sm text-slate-600 mb-2">{locale === 'id' ? 'Sesi kelas reguler Anda setelah guru menyetujui' : locale === 'ar' ? 'حصصك المنتظمة بعد الموافقة على المعلم' : 'Your regular sessions after tutor approval'}</p>
                {sessions.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">{locale === 'id' ? 'Tidak ada sesi reguler — Selesaikan kelas uji coba terlebih dahulu, lalu pesan dari menu akun' : locale === 'ar' ? 'لا حصص منتظمة — أكمل تجريبية ثم احجز من «حسابي»' : 'No regular sessions — complete a trial first, then book from your account tab'}</p>
                ) : sessions.map((s) => (
                  <SessionCard key={s._id} session={s} onReview={openReview} hasReviewed={hasReviewed(s._id)} />
                ))}
              </div>
            )}

            {tab === 'homework' && (
              <div className="space-y-3">
                <p className="text-sm text-slate-600 mb-2">{locale === 'id' ? 'Tugas hafalan, murajaah, dan rekaman audio' : locale === 'ar' ? 'واجبات الحفظ والمراجعة والتسجيل الصوتي' : 'Memorization, revision, and audio assignments'}</p>
                {homework.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">{locale === 'id' ? 'Tidak ada tugas saat ini' : locale === 'ar' ? 'لا واجبات حالياً' : 'No assignments currently'}</p>
                ) : homework.map((hw) => {
                  const st = getHwStatus(hw.status, locale);
                  return (
                    <div key={hw._id} className="border rounded-lg p-4 flex flex-wrap justify-between items-start gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <FileText size={16} className="text-emerald-600" />
                          <h3 className="font-bold">{hw.title}</h3>
                          {hw.type && (
                            <span className="text-xs bg-slate-100 px-2 py-0.5 rounded">{taskTypeLabel(hw.type)}</span>
                          )}
                        </div>
                        {hw.description && <p className="text-sm text-gray-600 mt-1">{hw.description}</p>}
                        {hw.dueDate && (
                          <p className="text-xs text-gray-400 mt-1">
                            {locale === 'id' ? `Batas waktu: ${new Date(hw.dueDate).toLocaleDateString('id-ID')}` : locale === 'ar' ? `موعد: ${new Date(hw.dueDate).toLocaleDateString('ar-EG')}` : `Due: ${new Date(hw.dueDate).toLocaleDateString('en-US')}`}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded ${st.cls}`}>{st.label}</span>
                        {hw.status === 'pending' && (
                          <>
                            <input type="file" accept="audio/*" className="hidden" id={`hw-${hw._id}`}
                              onChange={(e) => submitHomework(hw._id, e.target.files?.[0], hw.sessionId)} />
                            <label htmlFor={`hw-${hw._id}`} className="btn-primary cursor-pointer flex items-center gap-1 text-xs px-3 py-1.5">
                              <Upload size={14} /> {locale === 'id' ? 'Unggah Audio' : locale === 'ar' ? 'رفع صوت' : 'Upload Audio'}
                            </label>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {tab === 'certificates' && (
              <div className="space-y-3">
                <p className="text-sm text-slate-600">{locale === 'id' ? 'Sertifikat kelulusan setelah menyelesaikan kursus' : locale === 'ar' ? 'شهاداتك بعد إكمال الدورات' : 'Your certificates after completing courses'}</p>
                {certificates.length === 0 ? (
                  <div className="text-center py-8">
                    <Award className="mx-auto text-gray-300 mb-3" size={48} />
                    <p className="text-gray-500">{locale === 'id' ? 'Belum ada sertifikat' : locale === 'ar' ? 'لا شهادات بعد' : 'No certificates yet'}</p>
                    <RouterLink to="/courses" className="text-sm text-emerald-600 hover:underline mt-2 inline-block">{locale === 'id' ? 'Mulai Belajar' : locale === 'ar' ? 'ابدأ دورة' : 'Start a Course'}</RouterLink>
                  </div>
                ) : certificates.map((c) => (
                  <div key={c._id} className="border rounded-lg p-4 flex flex-wrap justify-between items-center gap-3">
                    <div>
                      <h3 className="font-bold">{locale === 'id' ? (c.course?.title?.id || c.course?.title?.en) : (c.course?.title?.ar || c.course?.title?.en || 'شهادة')}</h3>
                      <p className="text-xs text-gray-500">{c.issuedAt ? new Date(c.issuedAt).toLocaleDateString(locale === 'id' ? 'id-ID' : 'ar-EG') : ''}</p>
                    </div>
                    <RouterLink to={`/verify-certificate/${c.certificateId || c._id}`}
                      className="btn-primary text-sm px-4 py-2">
                      {locale === 'id' ? 'Lihat / Unduh' : locale === 'ar' ? 'عرض / تحميل' : 'View / Download'}
                    </RouterLink>
                  </div>
                ))}
              </div>
            )}

            {tab === 'recordings' && (
              <div className="space-y-3">
                <p className="text-sm text-slate-600">{locale === 'id' ? 'Sesi kelas yang selesai beserta rekamannya' : locale === 'ar' ? 'حصصك المكتملة وتسجيلاتها' : 'Your completed sessions and recordings'}</p>
                {recordings.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">{locale === 'id' ? 'Belum ada rekaman' : locale === 'ar' ? 'لا تسجيلات بعد' : 'No recordings yet'}</p>
                ) : recordings.map((s) => (
                  <div key={s._id} className="border rounded-lg p-4 flex flex-wrap justify-between items-center gap-3">
                    <div>
                      <h3 className="font-bold">{s.teacher?.user?.name || 'المعلم'}</h3>
                      <p className="text-sm text-gray-600">{new Date(s.scheduledAt).toLocaleString(locale === 'id' ? 'id-ID' : 'ar-EG')}</p>
                    </div>
                    {s.recordingUrl ? (
                      <a href={s.recordingUrl} target="_blank" rel="noreferrer"
                        className="flex items-center gap-1 text-sm text-emerald-600 font-semibold">
                        <Video size={16} /> {locale === 'id' ? 'Tonton' : locale === 'ar' ? 'مشاهدة' : 'Watch'}
                      </a>
                    ) : (
                      <span className="text-xs text-gray-400">{locale === 'id' ? 'Rekaman tidak tersedia' : locale === 'ar' ? 'لا تسجيل متاح' : 'No recording available'}</span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {tab === 'achievements' && (
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-6 text-center">
                  <Trophy className="mx-auto text-emerald-600 mb-2" size={40} />
                  <p className="text-3xl font-bold text-emerald-700">{gameStats?.points?.total || 0}</p>
                  <p className="text-sm text-slate-600">{locale === 'id' ? 'poin' : locale === 'ar' ? 'نقطة' : 'points'} — {locale === 'id' ? `Level ${gameStats?.points?.level || 1}` : locale === 'ar' ? `المستوى ${gameStats?.points?.level || 1}` : `Level ${gameStats?.points?.level || 1}`}</p>
                  <p className="text-sm mt-1">{locale === 'id' ? `Streak harian ${gameStats?.streaks?.current || 0} hari` : locale === 'ar' ? `سلسلة ${gameStats?.streaks?.current || 0} يوم` : `Streak ${gameStats?.streaks?.current || 0} days`}</p>
                  <Link to="/leaderboard" className="inline-block mt-3 text-sm text-emerald-700 font-medium hover:underline">{locale === 'id' ? '🏆 Papan Peringkat' : locale === 'ar' ? '🏆 لوحة المتصدرين' : '🏆 Leaderboard'}</Link>
                </div>
                <h3 className="font-bold text-sm">{locale === 'id' ? 'Lencana' : locale === 'ar' ? 'الأوسمة' : 'Badges'}</h3>
                {(badges.unlocked || []).length === 0 ? (
                  <p className="text-gray-500 text-center py-6">{locale === 'id' ? 'Selesaikan kelas dan kursus untuk mendapatkan lencana' : locale === 'ar' ? 'أكمل حصصاً ودورات لكسب الأوسمة' : 'Complete sessions and courses to earn badges'}</p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {badges.unlocked.map((b) => (
                      <div key={b._id} className="border rounded-xl p-4 text-center bg-yellow-50">
                        <Award className="mx-auto text-yellow-600 mb-2" size={28} />
                        <p className="font-bold text-sm">{b.badge?.name?.ar || b.badge?.code}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === 'referral' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-6 text-center">
                  <Gift className="mx-auto text-orange-600 mb-3" size={40} />
                  <h3 className="font-bold text-lg mb-2">{locale === 'id' ? 'Program Afiliasi' : locale === 'ar' ? 'نظام السفراء' : 'Referral Program'}</h3>
                  <p className="text-sm text-slate-600 mb-4">{locale === 'id' ? 'Undang teman Anda dan dapatkan 50 poin untuk setiap pendaftaran' : locale === 'ar' ? 'ادعُ أصدقاءك واحصل على 50 نقطة لكل تسجيل' : 'Invite your friends and get 50 points for each registration'}</p>
                  {referral?.code && (
                    <div className="flex items-center justify-center gap-2 flex-wrap">
                      <code className="bg-white px-4 py-2 rounded-lg font-mono text-lg border">{referral.code}</code>
                      <button type="button" onClick={() => { navigator.clipboard?.writeText(referral.link || referral.code); toast.success(locale === 'id' ? 'Berhasil disalin' : locale === 'ar' ? 'تم النسخ' : 'Copied'); }}
                        className="flex items-center gap-1 text-sm text-orange-700 hover:underline">
                        <Copy size={14} /> {locale === 'id' ? 'Salin Tautan' : locale === 'ar' ? 'نسخ الرابط' : 'Copy Link'}
                      </button>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-white border rounded-xl p-4">
                    <p className="text-2xl font-bold text-orange-600">{referral?.stats?.totalInvites || 0}</p>
                    <p className="text-xs text-gray-500">{locale === 'id' ? 'Undangan' : locale === 'ar' ? 'دعوات' : 'Invites'}</p>
                  </div>
                  <div className="bg-white border rounded-xl p-4">
                    <p className="text-2xl font-bold text-emerald-600">{referral?.stats?.active || 0}</p>
                    <p className="text-xs text-gray-500">{locale === 'id' ? 'Aktif' : locale === 'ar' ? 'نشطة' : 'Active'}</p>
                  </div>
                  <div className="bg-white border rounded-xl p-4">
                    <p className="text-2xl font-bold text-blue-600">{referral?.stats?.totalPoints || 0}</p>
                    <p className="text-xs text-gray-500">{locale === 'id' ? 'Poin Bonus' : locale === 'ar' ? 'نقاط مكافأة' : 'Bonus Points'}</p>
                  </div>
                </div>
                {(referral?.referrals || []).length > 0 ? (
                  <div className="space-y-2">
                    <h4 className="font-bold text-sm">{locale === 'id' ? 'Undangan Terbaru' : locale === 'ar' ? 'آخر الدعوات' : 'Recent Referrals'}</h4>
                    {referral.referrals.slice(0, 10).map((r) => (
                      <div key={r._id} className="flex justify-between items-center border rounded-lg px-4 py-3 text-sm">
                        <span>{r.referee?.name || '—'}</span>
                        <span className={`px-2 py-0.5 rounded text-xs ${r.status === 'rewarded' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                          {r.status === 'rewarded' ? (locale === 'id' ? 'Diberi Poin' : 'مكافأ') : r.status === 'active' ? (locale === 'id' ? 'Aktif' : 'نشط') : (locale === 'id' ? 'Tertunda' : 'معلق')}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-4">{locale === 'id' ? 'Bagikan tautan Anda dengan teman-teman untuk mulai mendapatkan poin' : locale === 'ar' ? 'شارك رابطك مع أصدقائك لبدء كسب النقاط' : 'Share your link with friends to start earning points'}</p>
                )}
              </div>
            )}

            {tab === 'evaluations' && (
              <div className="space-y-4">
                <p className="text-sm text-slate-600">{locale === 'id' ? 'Evaluasi dari guru setelah setiap kelas selesai' : locale === 'ar' ? 'تقييمات معلمك بعد كل حصة مكتملة' : 'Tutor evaluations after each completed session'}</p>
                {evaluations.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">{locale === 'id' ? 'Belum ada evaluasi — akan muncul setelah kelas selesai' : locale === 'ar' ? 'لا تقييمات بعد — ستظهر بعد إكمال حصة' : 'No evaluations yet — they will appear after completing a session'}</p>
                ) : evaluations.map((s) => {
                  const ev = s.teacherEvaluation || {};
                  return (
                    <div key={s._id} className="border rounded-xl p-5">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-bold">{s.teacher?.user?.name || 'المعلم'}</h3>
                          <p className="text-xs text-gray-500">{new Date(s.scheduledAt).toLocaleString(locale === 'id' ? 'id-ID' : 'ar-EG')}</p>
                        </div>
                        {!hasReviewed(s._id) && (
                          <button onClick={() => openReview(s)} className="text-sm text-orange-600 hover:underline">{locale === 'id' ? 'Beri Nilai Guru' : locale === 'ar' ? 'قيّم المعلم' : 'Rate Teacher'}</button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">
                        {[
                          ['attendance', locale === 'id' ? 'Kehadiran' : locale === 'ar' ? 'الحضور' : 'Attendance'],
                          ['memorization', locale === 'id' ? 'Hafalan' : locale === 'ar' ? 'الحفظ' : 'Memorization'],
                          ['tajweed', locale === 'id' ? 'Tajwid' : locale === 'ar' ? 'التجويد' : 'Tajweed'],
                          ['behavior', locale === 'id' ? 'Sikap' : locale === 'ar' ? 'السلوك' : 'Behavior'],
                          ['commitment', locale === 'id' ? 'Komitmen' : locale === 'ar' ? 'الالتزام' : 'Commitment'],
                        ].map(([k, label]) => (
                          <div key={k} className="bg-slate-50 rounded-lg p-2 text-center">
                            <p className="text-xs text-slate-500">{label}</p>
                            <p className="font-bold text-emerald-700">{ev[k] || '—'}/5</p>
                          </div>
                        ))}
                      </div>
                      {ev.overallNotes && (
                        <p className="text-sm text-gray-600 mt-3 bg-gray-50 rounded-lg p-3">{ev.overallNotes}</p>
                      )}
                      {ev.assignedHomework?.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs font-semibold text-slate-500 mb-1">{locale === 'id' ? 'Tugas dari Sesi:' : locale === 'ar' ? 'واجبات من الحصة:' : 'Assigned homework from session:'}</p>
                          {ev.assignedHomework.map((h, i) => (
                            <p key={i} className="text-sm text-gray-600">• {h.description}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}

                {reviews.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-bold mb-3 flex items-center gap-2"><Star size={18} /> {locale === 'id' ? 'Evaluasi Anda untuk Guru' : locale === 'ar' ? 'تقييماتك للمعلمين' : 'Your Tutor Reviews'}</h3>
                    {reviews.map((r) => (
                      <div key={r._id} className="border rounded-lg p-3 mb-2">
                        <p className="font-semibold text-sm">{r.teacher?.personalInfo?.fullName || r.teacher?.user?.name || 'معلم'}</p>
                        <div className="flex gap-0.5 my-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} size={12} className={i < r.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />
                          ))}
                        </div>
                        {r.comment && <p className="text-xs text-gray-600">{r.comment}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {reviewModal && (
        <Modal title={locale === 'id' ? `Evaluasi ${reviewModal.teacher?.user?.name || 'Guru'}` : locale === 'ar' ? `تقييم ${reviewModal.teacher?.user?.name || 'المعلم'}` : `Rate ${reviewModal.teacher?.user?.name || 'Tutor'}`} onClose={() => setReviewModal(null)}>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">{locale === 'id' ? 'Penilaian (1-5)' : locale === 'ar' ? 'التقييم (1-5)' : 'Rating (1-5)'}</label>
              <input type="range" min={1} max={5} value={reviewForm.rating}
                onChange={(e) => setReviewForm((p) => ({ ...p, rating: Number(e.target.value) }))}
                className="w-full" />
              <span className="text-emerald-600 font-bold">{reviewForm.rating}</span>
            </div>
            <div>
              <label className="text-sm font-medium">{locale === 'id' ? 'Komentar Anda' : locale === 'ar' ? 'تعليقك' : 'Your Comment'}</label>
              <textarea className="input-field w-full mt-1" rows={3} value={reviewForm.comment}
                onChange={(e) => setReviewForm((p) => ({ ...p, comment: e.target.value }))} />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={reviewForm.wouldContinue}
                onChange={(e) => setReviewForm((p) => ({ ...p, wouldContinue: e.target.checked }))} />
              {locale === 'id' ? 'Saya ingin melanjutkan kelas dengan guru ini' : locale === 'ar' ? 'أرغب في الاستمرار مع هذا المعلم' : 'I want to continue learning with this tutor'}
            </label>
            <button onClick={submitReview} className="btn-primary w-full">{locale === 'id' ? 'Kirim Evaluasi' : locale === 'ar' ? 'إرسال التقييم' : 'Submit Review'}</button>
          </div>
        </Modal>
      )}

      {bookModal && (
        <Modal title={locale === 'id' ? `Pesan Sesi Kelas — ${bookModal.name}` : locale === 'ar' ? `حجز حصة — ${bookModal.name}` : `Book Session — ${bookModal.name}`} onClose={() => setBookModal(null)}>
          <form onSubmit={bookRegular} className="space-y-3">
            <input type="date" required className="input-field w-full" value={bookForm.date}
              onChange={(e) => setBookForm((p) => ({ ...p, date: e.target.value }))} />
            <input type="time" required className="input-field w-full" value={bookForm.time}
              onChange={(e) => setBookForm((p) => ({ ...p, time: e.target.value }))} />
            <textarea className="input-field w-full" rows={2} placeholder={locale === 'id' ? 'Catatan (opsional)' : locale === 'ar' ? 'ملاحظات (اختياري)' : 'Notes (optional)'}
              value={bookForm.notes} onChange={(e) => setBookForm((p) => ({ ...p, notes: e.target.value }))} />
            <button type="submit" disabled={booking} className="btn-primary w-full">
              {booking ? (locale === 'id' ? 'Mengirim...' : 'جاري الإرسال...') : (locale === 'id' ? 'Kirim Permintaan Sesi' : locale === 'ar' ? 'إرسال طلب الحصة' : 'Send Session Request')}
            </button>
          </form>
        </Modal>
      )}
    </DashboardLayout>
  );
}

function SessionCard({ session, onReview, hasReviewed }) {
  const { locale } = useI18n();
  const teacherName = session.teacher?.user?.name || session.teacher?.personalInfo?.fullName || (locale === 'id' ? 'Guru' : locale === 'ar' ? 'المعلم' : 'Tutor');
  const isTrial = session.type === 'trial';

  return (
    <div className="border rounded-lg p-4 flex flex-wrap justify-between items-start gap-3">
      <div>
        <div className="flex items-center gap-2">
          <h3 className="font-bold">{teacherName}</h3>
          <span className="text-xs bg-slate-100 px-2 py-0.5 rounded">{isTrial ? (locale === 'id' ? 'Uji Coba' : 'تجريبية') : (locale === 'id' ? 'Reguler' : 'منتظمة')}</span>
        </div>
        <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
          <Clock size={14} /> {new Date(session.scheduledAt).toLocaleString(locale === 'id' ? 'id-ID' : 'ar-EG')} — {locale === 'id' ? '1 Jam' : locale === 'ar' ? 'ساعة' : '1 Hour'}
        </p>
        <span className={`text-xs px-2 py-0.5 rounded mt-1 inline-block ${
          session.status === 'accepted' ? 'bg-green-100 text-green-700'
            : session.status === 'pending' ? 'bg-yellow-100 text-yellow-700'
            : session.status === 'completed' ? 'bg-blue-100 text-blue-700'
            : 'bg-gray-100 text-gray-600'
        }`}>
          {getStatusLabel(session.status, locale)}
        </span>
        {session.status === 'pending' && (
          <p className="text-xs text-amber-600 mt-1">{locale === 'id' ? 'Menunggu persetujuan guru' : locale === 'ar' ? 'بانتظار موافقة المعلم' : 'Awaiting teacher approval'}</p>
        )}
        {session.meetingLink && session.status === 'accepted' && (
          <div className="flex flex-wrap gap-2 mt-2">
            <a href={session.meetingLink} target="_blank" rel="noreferrer"
              className="text-sm text-emerald-600 font-semibold hover:underline">
              {locale === 'id' ? 'Masuk Kelas' : locale === 'ar' ? 'انضم للحصة' : 'Join Session'}
            </a>
            <Link to={`/meeting/${session._id}`}
              className="text-sm text-purple-600 font-semibold hover:underline flex items-center gap-1">
              🌐 {locale === 'id' ? 'Dengan Terjemahan' : locale === 'ar' ? 'مع ترجمة' : 'With Translation'}
            </Link>
          </div>
        )}
      </div>
      {session.status === 'completed' && !hasReviewed && (
        <button onClick={() => onReview(session)} className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm">
          {locale === 'id' ? 'Beri Nilai Guru' : locale === 'ar' ? 'قيّم المعلم' : 'Rate Teacher'}
        </button>
      )}
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 relative">
        <button onClick={onClose} className="absolute left-4 top-4 text-gray-400 hover:text-gray-600"><X size={20} /></button>
        <h3 className="text-lg font-bold mb-4">{title}</h3>
        {children}
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="bg-white rounded-lg p-3">
      <span className="text-slate-500 text-xs">{label}</span>
      <p className="font-semibold">{value || '—'}</p>
    </div>
  );
}

function taskTypeLabel(t) {
  return TASK_TYPES.find((x) => x.id === t)?.label || t;
}
