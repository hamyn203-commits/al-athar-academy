import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar, CheckCircle, FileText, Star, Trophy, BookOpen,
  Upload, Clock, Users, X,
} from 'lucide-react';
import DashboardLayout, { StatCard, TabBar } from '../../components/dashboard/DashboardLayout';
import { useRequireAuth } from '../../hooks/useRequireAuth';
import { useGamificationApi } from '../../hooks/useGamificationApi';
import { useToast } from '../../context/ToastProvider';
import api from '../../lib/api';
import { TASK_TYPES } from '../TeacherRegistration/constants';

const emptyReview = { rating: 5, comment: '', wouldContinue: true };
const emptyBook = { date: '', time: '', notes: '' };

const STATUS_LABEL = {
  pending: 'قيد الانتظار',
  accepted: 'مؤكدة',
  rejected: 'مرفوضة',
  completed: 'مكتملة',
  cancelled: 'ملغاة',
};

const HW_STATUS = {
  pending: { label: 'لم يُسلّم', cls: 'bg-yellow-100 text-yellow-700' },
  submitted: { label: 'مُسلّم', cls: 'bg-blue-100 text-blue-700' },
  done: { label: 'معتمد', cls: 'bg-green-100 text-green-700' },
};

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { user, ready, logout } = useRequireAuth(['student']);
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
  const [loading, setLoading] = useState(true);

  const [reviewModal, setReviewModal] = useState(null);
  const [reviewForm, setReviewForm] = useState(emptyReview);
  const [bookModal, setBookModal] = useState(null);
  const [bookForm, setBookForm] = useState(emptyBook);
  const [booking, setBooking] = useState(false);

  const load = async () => {
    try {
      const [prof, st, tr, sess, hw, tch, ev, rev, enrollments] = await Promise.all([
        api.get('/api/students/dashboard/profile', { auth: true }),
        api.get('/api/students/dashboard/stats', { auth: true }),
        api.get('/api/sessions/my-sessions?type=trial&limit=50', { auth: true }),
        api.get('/api/sessions/my-sessions?type=regular&limit=50', { auth: true }),
        api.get('/api/homework/student', { auth: true }),
        api.get('/api/students/dashboard/teachers', { auth: true }),
        api.get('/api/students/dashboard/evaluations', { auth: true }),
        api.get('/api/reviews/student', { auth: true }),
        api.get('/api/courses/my-courses', { auth: true }).catch(() => []),
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
    } catch {
      toast.error('تعذر تحميل بيانات لوحة الطالب');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (ready) load(); }, [ready]);

  if (!ready) return null;

  const upcomingTrials = trials.filter((s) => s.status === 'accepted' && new Date(s.scheduledAt) >= new Date());
  const pendingTrials = trials.filter((s) => s.status === 'pending');
  const upcomingSessions = sessions.filter((s) => s.status === 'accepted' && new Date(s.scheduledAt) >= new Date());
  const pendingSessions = sessions.filter((s) => s.status === 'pending');

  const submitHomework = async (homeworkId, file) => {
    if (!file) return;
    const fd = new FormData();
    fd.append('submission', file);
    try {
      await api.post(`/api/homework/${homeworkId}/submit`, fd, { auth: true, json: false });
      toast.success('تم رفع الواجب بنجاح');
      load();
    } catch (e) {
      toast.error(e.message || 'فشل رفع الواجب');
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
      toast.success('تم إرسال تقييمك');
      setReviewModal(null);
      load();
    } catch (e) {
      toast.error(e.message || 'فشل إرسال التقييم');
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
      toast.success('تم إرسال طلب الحصة للمعلم');
      setBookModal(null);
      load();
    } catch (err) {
      toast.error(err.message || 'فشل الحجز');
    } finally {
      setBooking(false);
    }
  };

  const hasReviewed = (sessionId) => reviews.some((r) => r.session === sessionId || r.session?._id === sessionId);

  const tabs = [
    { id: 'account', label: 'حسابي' },
    { id: 'trials', label: `تجريبية (${pendingTrials.length + upcomingTrials.length})` },
    { id: 'sessions', label: `حصصي (${upcomingSessions.length + pendingSessions.length})` },
    { id: 'homework', label: `واجبات (${stats.homeworkPending || 0})` },
    { id: 'evaluations', label: 'تقييمات المعلم' },
  ];

  return (
    <DashboardLayout title="لوحة تحكم الطالب" user={user} onLogout={logout}>
      {loading ? (
        <div className="flex justify-center py-20"><div className="spinner spinner-lg" /></div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            <StatCard label="حصص قادمة" value={stats.upcomingSessions || 0} icon={Calendar} color="emerald" />
            <StatCard label="تجريبية معلقة" value={stats.pendingTrials || 0} icon={Clock} color="yellow" />
            <StatCard label="حصص مكتملة" value={stats.completedSessions || 0} icon={CheckCircle} color="blue" />
            <StatCard label="النقاط" value={gameStats?.points?.total || 0} icon={Trophy} color="orange" />
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <TabBar tabs={tabs} active={tab} onChange={setTab} />

            {tab === 'account' && (
              <div className="space-y-6">
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5">
                  <h3 className="font-bold mb-3">مرحباً، {profile?.user?.name || user?.name}</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                    <InfoRow label="البريد" value={profile?.user?.email || user?.email} />
                    <InfoRow label="الهاتف" value={profile?.user?.phone} />
                    <InfoRow label="حصص مكتملة" value={profile?.summary?.completedSessions || 0} />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-5">
                    <Trophy className="text-emerald-600 mb-2" size={28} />
                    <p className="text-2xl font-bold text-emerald-700">{gameStats?.points?.total || 0} نقطة</p>
                    <p className="text-sm text-slate-600">المستوى {gameStats?.points?.level || 1} — 🔥 {gameStats?.streaks?.current || 0} يوم</p>
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
                    <h3 className="font-bold text-sm mb-2 flex items-center gap-2"><BookOpen size={16} /> دوراتي ({courses.length})</h3>
                    {courses.length === 0 ? (
                      <Link to="/courses" className="text-sm text-emerald-600 hover:underline">تصفح الدورات</Link>
                    ) : courses.slice(0, 3).map((e) => (
                      <div key={e._id} className="flex justify-between items-center text-sm py-1.5 border-b last:border-0">
                        <span>{e.course?.title?.ar || 'دورة'}</span>
                        <button onClick={() => navigate(`/courses/${e.course?.slug}/learn`)} className="text-emerald-600 text-xs">متابعة</button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold flex items-center gap-2"><Users size={18} /> معلموي ({teachers.length})</h3>
                    <Link to="/teachers" className="text-sm text-emerald-600 hover:underline">ابحث عن معلم</Link>
                  </div>
                  {teachers.length === 0 ? (
                    <p className="text-center text-gray-500 py-6">احجز حصة تجريبية من صفحة المعلمين</p>
                  ) : teachers.map((t) => (
                    <div key={t._id} className="border rounded-lg p-4 mb-2 flex flex-wrap justify-between items-center gap-3">
                      <div>
                        <h4 className="font-bold">{t.name}</h4>
                        <p className="text-xs text-gray-500">{t.country} — {t.sessionCount} حصة — ⭐ {t.rating?.toFixed?.(1) || '0'}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => navigate(`/teachers/${t._id}`)} className="px-3 py-1.5 border rounded-lg text-sm">الملف</button>
                        {t.canBookRegular && (
                          <button onClick={() => openBook(t)} className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-sm">حجز حصة</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === 'trials' && (
              <div className="space-y-3">
                <p className="text-sm text-slate-600 mb-2">طلبات الحصة التجريبية مع المعلمين</p>
                {trials.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-3">لا طلبات تجريبية</p>
                    <Link to="/teachers" className="btn-primary inline-block text-sm">احجز تجريبية</Link>
                  </div>
                ) : trials.map((s) => (
                  <SessionCard key={s._id} session={s} onReview={openReview} hasReviewed={hasReviewed(s._id)} />
                ))}
              </div>
            )}

            {tab === 'sessions' && (
              <div className="space-y-3">
                <p className="text-sm text-slate-600 mb-2">حصصك المنتظمة بعد الموافقة على المعلم</p>
                {sessions.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">لا حصص منتظمة — أكمل تجريبية ثم احجز من «حسابي»</p>
                ) : sessions.map((s) => (
                  <SessionCard key={s._id} session={s} onReview={openReview} hasReviewed={hasReviewed(s._id)} />
                ))}
              </div>
            )}

            {tab === 'homework' && (
              <div className="space-y-3">
                <p className="text-sm text-slate-600 mb-2">واجبات الحفظ والمراجعة والتسجيل الصوتي</p>
                {homework.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">لا واجبات حالياً</p>
                ) : homework.map((hw) => {
                  const st = HW_STATUS[hw.status] || HW_STATUS.pending;
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
                          <p className="text-xs text-gray-400 mt-1">موعد: {new Date(hw.dueDate).toLocaleDateString('ar-EG')}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded ${st.cls}`}>{st.label}</span>
                        {hw.status === 'pending' && (
                          <>
                            <input type="file" accept="audio/*" className="hidden" id={`hw-${hw._id}`}
                              onChange={(e) => submitHomework(hw._id, e.target.files?.[0])} />
                            <label htmlFor={`hw-${hw._id}`} className="btn-primary cursor-pointer flex items-center gap-1 text-xs px-3 py-1.5">
                              <Upload size={14} /> رفع صوت
                            </label>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {tab === 'evaluations' && (
              <div className="space-y-4">
                <p className="text-sm text-slate-600">تقييمات معلمك بعد كل حصة مكتملة</p>
                {evaluations.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">لا تقييمات بعد — ستظهر بعد إكمال حصة</p>
                ) : evaluations.map((s) => {
                  const ev = s.teacherEvaluation || {};
                  return (
                    <div key={s._id} className="border rounded-xl p-5">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-bold">{s.teacher?.user?.name || 'المعلم'}</h3>
                          <p className="text-xs text-gray-500">{new Date(s.scheduledAt).toLocaleString('ar-EG')}</p>
                        </div>
                        {!hasReviewed(s._id) && (
                          <button onClick={() => openReview(s)} className="text-sm text-orange-600 hover:underline">قيّم المعلم</button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">
                        {[
                          ['attendance', 'الحضور'],
                          ['memorization', 'الحفظ'],
                          ['tajweed', 'التجويد'],
                          ['behavior', 'السلوك'],
                          ['commitment', 'الالتزام'],
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
                          <p className="text-xs font-semibold text-slate-500 mb-1">واجبات من الحصة:</p>
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
                    <h3 className="font-bold mb-3 flex items-center gap-2"><Star size={18} /> تقييماتك للمعلمين</h3>
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
        <Modal title={`تقييم ${reviewModal.teacher?.user?.name || 'المعلم'}`} onClose={() => setReviewModal(null)}>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">التقييم (1-5)</label>
              <input type="range" min={1} max={5} value={reviewForm.rating}
                onChange={(e) => setReviewForm((p) => ({ ...p, rating: Number(e.target.value) }))}
                className="w-full" />
              <span className="text-emerald-600 font-bold">{reviewForm.rating}</span>
            </div>
            <div>
              <label className="text-sm font-medium">تعليقك</label>
              <textarea className="input-field w-full mt-1" rows={3} value={reviewForm.comment}
                onChange={(e) => setReviewForm((p) => ({ ...p, comment: e.target.value }))} />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={reviewForm.wouldContinue}
                onChange={(e) => setReviewForm((p) => ({ ...p, wouldContinue: e.target.checked }))} />
              أرغب في الاستمرار مع هذا المعلم
            </label>
            <button onClick={submitReview} className="btn-primary w-full">إرسال التقييم</button>
          </div>
        </Modal>
      )}

      {bookModal && (
        <Modal title={`حجز حصة — ${bookModal.name}`} onClose={() => setBookModal(null)}>
          <form onSubmit={bookRegular} className="space-y-3">
            <input type="date" required className="input-field w-full" value={bookForm.date}
              onChange={(e) => setBookForm((p) => ({ ...p, date: e.target.value }))} />
            <input type="time" required className="input-field w-full" value={bookForm.time}
              onChange={(e) => setBookForm((p) => ({ ...p, time: e.target.value }))} />
            <textarea className="input-field w-full" rows={2} placeholder="ملاحظات (اختياري)"
              value={bookForm.notes} onChange={(e) => setBookForm((p) => ({ ...p, notes: e.target.value }))} />
            <button type="submit" disabled={booking} className="btn-primary w-full">
              {booking ? 'جاري الإرسال...' : 'إرسال طلب الحصة'}
            </button>
          </form>
        </Modal>
      )}
    </DashboardLayout>
  );
}

function SessionCard({ session, onReview, hasReviewed }) {
  const teacherName = session.teacher?.user?.name || session.teacher?.personalInfo?.fullName || 'المعلم';
  const isTrial = session.type === 'trial';

  return (
    <div className="border rounded-lg p-4 flex flex-wrap justify-between items-start gap-3">
      <div>
        <div className="flex items-center gap-2">
          <h3 className="font-bold">{teacherName}</h3>
          <span className="text-xs bg-slate-100 px-2 py-0.5 rounded">{isTrial ? 'تجريبية' : 'منتظمة'}</span>
        </div>
        <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
          <Clock size={14} /> {new Date(session.scheduledAt).toLocaleString('ar-EG')} — ساعة
        </p>
        <span className={`text-xs px-2 py-0.5 rounded mt-1 inline-block ${
          session.status === 'accepted' ? 'bg-green-100 text-green-700'
            : session.status === 'pending' ? 'bg-yellow-100 text-yellow-700'
            : session.status === 'completed' ? 'bg-blue-100 text-blue-700'
            : 'bg-gray-100 text-gray-600'
        }`}>
          {STATUS_LABEL[session.status] || session.status}
        </span>
        {session.status === 'pending' && (
          <p className="text-xs text-amber-600 mt-1">بانتظار موافقة المعلم</p>
        )}
        {session.meetingLink && session.status === 'accepted' && (
          <a href={session.meetingLink} target="_blank" rel="noreferrer"
            className="block mt-2 text-sm text-emerald-600 font-semibold hover:underline">
            انضم للحصة
          </a>
        )}
      </div>
      {session.status === 'completed' && !hasReviewed && (
        <button onClick={() => onReview(session)} className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm">
          قيّم المعلم
        </button>
      )}
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" dir="rtl">
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
