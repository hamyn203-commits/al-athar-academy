import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Calendar, CheckCircle, FileText, Star, Trophy, Award, Upload, Play, BookOpen } from 'lucide-react';
import DashboardLayout, { StatCard, TabBar } from '../../components/dashboard/DashboardLayout';
import { useRequireAuth } from '../../hooks/useRequireAuth';
import { useGamificationApi } from '../../hooks/useGamificationApi';
import { useToast } from '../../context/ToastProvider';
import api from '../../lib/api';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { user, ready, logout } = useRequireAuth(['student']);
  const toast = useToast();
  const { stats: gameStats, badges, leaderboard, loading: gameLoading } = useGamificationApi();
  const [tab, setTab] = useState('overview');
  const [sessions, setSessions] = useState([]);
  const [homework, setHomework] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [courses, setCourses] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready) return;
    Promise.all([
      api.get('/api/sessions/my-sessions', { auth: true }),
      api.get('/api/homework/student', { auth: true }),
      api.get('/api/reviews/student', { auth: true }),
      api.get('/api/courses/my-courses', { auth: true }).catch(() => []),
      api.get('/api/lms/my-certificates', { auth: true }).catch(() => []),
    ]).then(([sess, hw, rev, enrollments, certs]) => {
      setSessions(sess.sessions || []);
      setHomework(hw.homework || []);
      setReviews(Array.isArray(rev) ? rev : rev.reviews || []);
      setCourses(Array.isArray(enrollments) ? enrollments : []);
      setCertificates(Array.isArray(certs) ? certs : []);
    }).catch(() => toast.error('تعذر تحميل البيانات'))
      .finally(() => setLoading(false));
  }, [ready, toast]);

  if (!ready) return null;

  const pending = sessions.filter((s) => s.status === 'pending');
  const upcoming = sessions.filter((s) => s.status === 'accepted' && new Date(s.scheduledAt) > new Date());
  const completed = sessions.filter((s) => s.status === 'completed');

  const submitHomework = async (homeworkId, file) => {
    if (!file) return;
    const fd = new FormData();
    fd.append('submission', file);
    try {
      await api.post(`/api/homework/${homeworkId}/submit`, fd, { auth: true, json: false });
      toast.success('تم رفع الواجب بنجاح');
      const hw = await api.get('/api/homework/student', { auth: true });
      setHomework(hw.homework || []);
    } catch {
      toast.error('فشل رفع الواجب');
    }
  };

  const rateSession = async (sessionId, teacherId) => {
    const rating = parseInt(window.prompt('قيّم الحصة (1-5):', '5') || '0', 10);
    if (!rating || rating < 1 || rating > 5) return;
    const comment = window.prompt('اكتب تعليقك:') || '';
    try {
      await api.post('/api/reviews', { teacherId, sessionId, rating, comment }, { auth: true });
      toast.success('تم إرسال التقييم');
      const rev = await api.get('/api/reviews/student', { auth: true });
      setReviews(Array.isArray(rev) ? rev : []);
    } catch {
      toast.error('فشل إرسال التقييم');
    }
  };

  const tabs = [
    { id: 'overview', label: 'نظرة عامة' },
    { id: 'sessions', label: 'حصصي' },
    { id: 'courses', label: 'دوراتي' },
    { id: 'homework', label: 'الواجبات' },
    { id: 'gamification', label: 'الإنجازات' },
    { id: 'certificates', label: 'الشهادات' },
    { id: 'reviews', label: 'تقييماتي' },
  ];

  return (
    <DashboardLayout title="لوحة تحكم الطالب" user={user} onLogout={logout}>
      {loading ? (
        <div className="flex justify-center py-20"><div className="spinner spinner-lg" /></div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard label="حصص قادمة" value={upcoming.length} icon={Calendar} color="emerald" />
            <StatCard label="قيد الانتظار" value={pending.length} icon={Calendar} color="yellow" />
            <StatCard label="حصص مكتملة" value={completed.length} icon={CheckCircle} color="blue" />
            <StatCard label="الواجبات" value={homework.length} icon={FileText} color="purple" />
            <StatCard label="النقاط" value={gameStats?.points?.total || 0} icon={Trophy} color="orange" />
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <TabBar tabs={tabs} active={tab} onChange={setTab} />

            {tab === 'overview' && (
              <div className="space-y-4">
                {upcoming[0] && (
                  <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-100">
                    <h3 className="font-bold mb-1">أقرب حصة</h3>
                    <p>{upcoming[0].teacher?.user?.name || 'المعلم'}</p>
                    <p className="text-sm text-gray-600">{new Date(upcoming[0].scheduledAt).toLocaleString('ar-EG')}</p>
                  </div>
                )}
                {courses.length > 0 && (
                  <p className="text-gray-600">مسجل في {courses.length} دورة</p>
                )}
                {!upcoming.length && !courses.length && (
                  <p className="text-center text-gray-500 py-8">ابدأ بحجز حصة تجريبية من صفحة المعلمين</p>
                )}
              </div>
            )}

            {tab === 'sessions' && (
              <div className="space-y-3">
                {sessions.length === 0 ? <p className="text-center text-gray-500 py-8">لا توجد حصص</p> : sessions.map((s) => (
                  <div key={s._id} className="border rounded-lg p-4 flex justify-between items-start gap-4">
                    <div>
                      <h3 className="font-bold">{s.teacher?.user?.name || s.student?.name}</h3>
                      <p className="text-sm text-gray-600">{new Date(s.scheduledAt).toLocaleString('ar-EG')}</p>
                      <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">{s.status}</span>
                      {s.status === 'pending' && (
                        <p className="text-xs text-amber-600 mt-1">بانتظار موافقة المعلم</p>
                      )}
                      {s.meetingLink && s.status === 'accepted' && (
                        <a href={s.meetingLink} target="_blank" rel="noreferrer"
                          className="block mt-2 text-sm text-emerald-600 font-semibold hover:underline">
                          🎥 انضم للحصة
                        </a>
                      )}
                      {s.status === 'completed' && (
                        <button onClick={() => rateSession(s._id, s.teacher?._id)} className="block mt-2 text-sm text-orange-600 hover:underline">قيّم الحصة</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab === 'courses' && (
              <div className="space-y-3">
                {courses.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="mx-auto text-gray-300 mb-3" size={40} />
                    <p className="text-gray-500 mb-4">لم تسجل في دورات بعد</p>
                    <Link to="/courses" className="btn-primary inline-block">تصفح الدورات</Link>
                  </div>
                ) : courses.map((e) => (
                  <div key={e._id} className="border rounded-lg p-4 flex justify-between items-center gap-4">
                    <div className="flex-1">
                      <h3 className="font-bold">{e.course?.title?.ar || e.course?.title?.en || 'دورة'}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 bg-gray-100 rounded-full h-1.5 max-w-[120px]">
                          <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${e.progress?.percentage || 0}%` }} />
                        </div>
                        <span className="text-sm text-emerald-600">{e.progress?.percentage || 0}%</span>
                      </div>
                      {e.status === 'completed' && <span className="text-xs text-emerald-600">✓ مكتملة</span>}
                    </div>
                    <button onClick={() => navigate(`/courses/${e.course?.slug}/learn`)}
                      className="flex items-center gap-1 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700">
                      <Play size={14} /> {e.progress?.percentage > 0 ? 'متابعة' : 'ابدأ'}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {tab === 'homework' && (
              <div className="space-y-3">
                {homework.length === 0 ? <p className="text-center text-gray-500 py-8">لا توجد واجبات</p> : homework.map((hw) => (
                  <div key={hw._id} className="border rounded-lg p-4 flex justify-between items-center gap-4">
                    <div>
                      <h3 className="font-bold">{hw.title}</h3>
                      <p className="text-sm text-gray-600">{hw.description}</p>
                    </div>
                    {hw.status !== 'submitted' && (
                      <>
                        <input type="file" accept="audio/*" className="hidden" id={`hw-${hw._id}`}
                          onChange={(e) => submitHomework(hw._id, e.target.files?.[0])} />
                        <label htmlFor={`hw-${hw._id}`} className="btn-primary cursor-pointer flex items-center gap-1 text-sm">
                          <Upload size={14} /> رفع
                        </label>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}

            {tab === 'gamification' && (
              gameLoading ? <div className="spinner mx-auto" /> : (
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-6">
                    <Trophy className="text-emerald-600 mb-2" size={32} />
                    <p className="text-3xl font-bold text-emerald-700">{gameStats?.points?.total || 0} نقطة</p>
                    <p className="text-sm text-gray-600">المستوى {gameStats?.points?.level || 1} — {gameStats?.points?.pointsToNextLevel || 0} نقطة للمستوى التالي</p>
                    <p className="text-sm mt-2">🔥 سلسلة: {gameStats?.streaks?.current || 0} يوم</p>
                  </div>
                  <div>
                    <h3 className="font-bold mb-3 flex items-center gap-2"><Award size={18} /> الشارات ({badges.stats?.totalUnlocked || 0})</h3>
                    <div className="flex flex-wrap gap-2">
                      {(badges.unlocked || []).slice(0, 6).map((b) => (
                        <span key={b._id} className="bg-yellow-100 text-yellow-800 text-xs px-3 py-1 rounded-full">{b.badge?.name?.ar || b.badge?.code}</span>
                      ))}
                      {!badges.unlocked?.length && <p className="text-gray-500 text-sm">لا توجد شارات بعد</p>}
                    </div>
                  </div>
                  {leaderboard.length > 0 && (
                    <div className="md:col-span-2">
                      <h3 className="font-bold mb-3">لوحة المتصدرين</h3>
                      {leaderboard.slice(0, 5).map((entry, i) => (
                        <div key={i} className="flex justify-between py-2 border-b text-sm">
                          <span>#{i + 1} {entry.userName || entry.name}</span>
                          <span className="font-bold text-emerald-600">{entry.points || entry.score} نقطة</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            )}

            {tab === 'certificates' && (
              <div className="space-y-3">
                {certificates.length === 0 ? <p className="text-center text-gray-500 py-8">لا توجد شهادات بعد — أكمل دورة للحصول على شهادة</p> : certificates.map((c) => (
                  <div key={c._id} className="border rounded-lg p-4 flex justify-between items-center">
                    <div>
                      <h3 className="font-bold">{c.course?.title?.ar || 'شهادة'}</h3>
                      <p className="text-sm text-gray-500">{new Date(c.issuedAt).toLocaleDateString('ar-EG')}</p>
                    </div>
                    <Link to={`/verify-certificate/${c.certificateId}`} className="text-emerald-600 text-sm font-semibold hover:underline">عرض الشهادة</Link>
                  </div>
                ))}
              </div>
            )}

            {tab === 'reviews' && (
              <div className="space-y-3">
                {reviews.length === 0 ? <p className="text-center text-gray-500 py-8">لا توجد تقييمات</p> : reviews.map((r) => (
                  <div key={r._id} className="border rounded-lg p-4">
                    <h3 className="font-bold">{r.teacher?.personalInfo?.fullName || r.teacher?.user?.name || 'معلم'}</h3>
                    <div className="flex gap-0.5 my-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={14} className={i < r.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />
                      ))}
                    </div>
                    <p className="text-gray-700 text-sm">{r.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
