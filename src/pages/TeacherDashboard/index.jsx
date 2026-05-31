import { useState, useEffect } from 'react';
import { Calendar, Users, DollarSign, Clock, Star, TrendingUp, FileText, Award, BarChart3 } from 'lucide-react';
import DashboardLayout, { StatCard, TabBar } from '../../components/dashboard/DashboardLayout';
import { useRequireAuth } from '../../hooks/useRequireAuth';
import { useToast } from '../../context/ToastProvider';
import api from '../../lib/api';

export default function TeacherDashboard() {
  const { user, ready, logout } = useRequireAuth(['teacher']);
  const toast = useToast();
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState({ totalStudents: 0, totalSessions: 0, totalHours: 0, pendingEarnings: 0, totalEarnings: 0, averageRating: 0 });
  const [sessions, setSessions] = useState([]);
  const [students, setStudents] = useState([]);
  const [trials, setTrials] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const [meetingProvider, setMeetingProvider] = useState('jitsi');

  const load = async () => {
    try {
      const [st, sess, stud, tr, an, rev] = await Promise.all([
        api.get('/api/teachers/dashboard/stats', { auth: true }),
        api.get('/api/sessions/my-sessions?status=accepted', { auth: true }),
        api.get('/api/teachers/dashboard/students', { auth: true }),
        api.get('/api/sessions/my-sessions?type=trial&status=pending', { auth: true }),
        api.get('/api/teachers/dashboard/analytics', { auth: true }),
        api.get('/api/teachers/dashboard/reviews', { auth: true }),
      ]);
      setStats(st);
      setSessions(sess.sessions || []);
      setStudents(stud.students || []);
      setTrials(tr.sessions || []);
      setAnalytics(an);
      setReviews(rev.reviews || []);
    } catch {
      toast.error('تعذر تحميل بيانات لوحة المعلم');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (ready) load(); }, [ready]);

  if (!ready) return null;

  const respondTrial = async (id, action) => {
    try {
      await api.put(`/api/sessions/${id}/respond`, {
        action,
        provider: action === 'accept' ? meetingProvider : undefined,
      }, { auth: true });
      toast.success(action === 'accept' ? 'تم قبول الطلب وإنشاء رابط الاجتماع' : 'تم رفض الطلب');
      load();
    } catch { toast.error('حدث خطأ'); }
  };

  const completeSession = async (id) => {
    const evaluation = {
      attendance: 5, memorization: 5, tajweed: 5, behavior: 5, commitment: 5,
      overallNotes: 'حصة ممتازة',
    };
    try {
      await api.put(`/api/sessions/${id}/complete`, { evaluation }, { auth: true });
      toast.success('تم إكمال الحصة');
      load();
    } catch { toast.error('فشل إكمال الحصة'); }
  };

  const tabs = [
    { id: 'overview', label: 'نظرة عامة' },
    { id: 'trials', label: `تجريبية (${trials.length})` },
    { id: 'sessions', label: 'الحصص' },
    { id: 'students', label: 'الطلاب' },
    { id: 'analytics', label: 'التحليلات' },
    { id: 'reviews', label: 'التقييمات' },
  ];

  return (
    <DashboardLayout title="لوحة تحكم المعلم" user={user} onLogout={logout}>
      {loading ? <div className="flex justify-center py-20"><div className="spinner spinner-lg" /></div> : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
            <StatCard label="الطلاب" value={stats.totalStudents} icon={Users} />
            <StatCard label="الحصص" value={stats.totalSessions} icon={Calendar} color="blue" />
            <StatCard label="الساعات" value={stats.totalHours} icon={Clock} color="purple" />
            <StatCard label="مستحقة" value={stats.pendingEarnings} icon={DollarSign} color="yellow" />
            <StatCard label="الأرباح" value={stats.totalEarnings} icon={TrendingUp} color="green" />
            <StatCard label="التقييم" value={stats.averageRating?.toFixed?.(1) || '0'} icon={Star} color="orange" />
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <TabBar tabs={tabs} active={tab} onChange={setTab} />

            {tab === 'overview' && (
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-emerald-50 rounded-lg p-5">
                  <p className="font-bold">طلبات تجريبية</p>
                  <p className="text-3xl font-bold text-emerald-600">{trials.length}</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-5">
                  <p className="font-bold">حصص اليوم</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {sessions.filter((s) => new Date(s.scheduledAt).toDateString() === new Date().toDateString()).length}
                  </p>
                </div>
              </div>
            )}

            {tab === 'trials' && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm mb-2">
                  <span className="text-gray-600">منصة الاجتماع عند القبول:</span>
                  <select value={meetingProvider} onChange={(e) => setMeetingProvider(e.target.value)}
                    className="border rounded-lg px-2 py-1">
                    <option value="jitsi">Jitsi (فوري)</option>
                    <option value="zoom">Zoom</option>
                    <option value="google_meet">Google Meet</option>
                  </select>
                </div>
                {trials.length === 0 ? <p className="text-center text-gray-500 py-8">لا توجد طلبات</p> : trials.map((s) => (
                  <div key={s._id} className="border rounded-lg p-4 flex justify-between items-center gap-4">
                    <div>
                      <h3 className="font-bold">{s.student?.name}</h3>
                      <p className="text-sm text-gray-600">{new Date(s.scheduledAt).toLocaleString('ar-EG')}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => respondTrial(s._id, 'accept')} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm">قبول</button>
                      <button onClick={() => respondTrial(s._id, 'reject')} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm">رفض</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab === 'sessions' && (
              <div className="space-y-3">
                {sessions.length === 0 ? <p className="text-center text-gray-500 py-8">لا حصص قادمة</p> : sessions.map((s) => (
                  <div key={s._id} className="border rounded-lg p-4 flex flex-wrap justify-between items-center gap-3">
                    <div>
                      <h3 className="font-bold">{s.student?.name}</h3>
                      <p className="text-sm text-gray-600">{new Date(s.scheduledAt).toLocaleString('ar-EG')}</p>
                      {s.meetingLink && (
                        <a href={s.meetingLink} target="_blank" rel="noreferrer"
                          className="text-sm text-emerald-600 font-semibold hover:underline mt-1 inline-block">
                          🎥 انضم للحصة
                        </a>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {s.meetingLink && (
                        <a href={s.meetingLink} target="_blank" rel="noreferrer"
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">
                          بدء الاجتماع
                        </a>
                      )}
                      <button onClick={() => completeSession(s._id)} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm">إكمال</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab === 'students' && (
              <div className="space-y-3">
                {students.length === 0 ? <p className="text-center text-gray-500 py-8">لا طلاب</p> : students.map((s) => (
                  <div key={s._id} className="border rounded-lg p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-emerald-700">{s.name?.[0]}</div>
                    <div>
                      <h3 className="font-bold">{s.name}</h3>
                      <p className="text-sm text-gray-500">{s.sessionCount || 0} حصة</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab === 'analytics' && analytics && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4"><BarChart3 className="text-emerald-600" /><h3 className="font-bold">تحليلات الأداء</h3></div>
                <div className="grid md:grid-cols-3 gap-4">
                  <StatCard label="حصص مكتملة (6 أشهر)" value={analytics.totalCompleted} icon={Calendar} />
                  <StatCard label="متوسط التقييم" value={analytics.averageRating?.toFixed?.(1)} icon={Star} color="orange" />
                  <StatCard label="إجمالي الطلاب" value={analytics.totalStudents} icon={Users} color="blue" />
                </div>
                {analytics.monthlySessions?.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-semibold mb-2">الحصص الشهرية</h4>
                    {analytics.monthlySessions.map(({ month, count }) => (
                      <div key={month} className="flex items-center gap-3 mb-2">
                        <span className="text-sm w-20 text-gray-500">{month}</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-3">
                          <div className="bg-emerald-500 h-3 rounded-full" style={{ width: `${Math.min(count * 20, 100)}%` }} />
                        </div>
                        <span className="text-sm font-bold">{count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === 'reviews' && (
              <div className="space-y-4">
                <div className="bg-orange-50 border border-orange-100 rounded-lg p-5 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">متوسط التقييم</p>
                    <p className="text-4xl font-bold text-orange-600">{stats.averageRating?.toFixed?.(1) || '0'}</p>
                  </div>
                  <Award className="text-orange-400" size={48} />
                </div>
                {reviews.length === 0 ? <p className="text-center text-gray-500">لا تقييمات بعد</p> : reviews.map((r) => (
                  <div key={r._id} className="border rounded-lg p-4">
                    <div className="flex gap-1 mb-1">{Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={14} className={i < r.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />
                    ))}</div>
                    <p className="text-sm">{r.comment}</p>
                    <p className="text-xs text-gray-400 mt-1">{r.student?.name}</p>
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
