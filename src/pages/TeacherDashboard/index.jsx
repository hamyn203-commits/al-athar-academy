import { useState, useEffect } from 'react';
import {
  Calendar, Users, Star, Wallet, ClipboardList,
  BookOpen, X, Plus, Clock, BarChart3, MessageSquare,
} from 'lucide-react';
import DashboardLayout, { StatCard, TabBar } from '../../components/dashboard/DashboardLayout';
import { useRequireAuth } from '../../hooks/useRequireAuth';
import { useToast } from '../../context/ToastProvider';
import api from '../../lib/api';
import { TASK_TYPES } from '../TeacherRegistration/constants';

const SESSION_RATE = 50;
const WEEK_DAYS = [
  { id: 'sunday', label: 'الأحد' }, { id: 'monday', label: 'الإثنين' },
  { id: 'tuesday', label: 'الثلاثاء' }, { id: 'wednesday', label: 'الأربعاء' },
  { id: 'thursday', label: 'الخميس' }, { id: 'friday', label: 'الجمعة' },
  { id: 'saturday', label: 'السبت' },
];
const emptyEval = {
  attendance: 5, memorization: 5, tajweed: 5, behavior: 5, commitment: 5, overallNotes: '',
};
const emptyHomework = { type: 'memorization', description: '', dueDate: '' };

export default function TeacherDashboard() {
  const { user, ready, logout } = useRequireAuth(['teacher']);
  const toast = useToast();
  const [tab, setTab] = useState('account');
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({});
  const [trials, setTrials] = useState([]);
  const [pendingRegular, setPendingRegular] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [activeStudents, setActiveStudents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meetingProvider, setMeetingProvider] = useState('jitsi');

  const [evalModal, setEvalModal] = useState(null);
  const [evaluation, setEvaluation] = useState(emptyEval);
  const [homeworkList, setHomeworkList] = useState([]);

  const [taskModal, setTaskModal] = useState(false);
  const [newTask, setNewTask] = useState({ studentId: '', type: 'memorization', title: '', description: '', dueDate: '' });
  const [withdrawals, setWithdrawals] = useState([]);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [withdrawForm, setWithdrawForm] = useState({ amount: '', method: 'vodafone_cash', accountInfo: '' });
  const [withdrawing, setWithdrawing] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [reviewsData, setReviewsData] = useState({ reviews: [], averageRating: 0, totalReviews: 0 });
  const [schedule, setSchedule] = useState([]);
  const [savingSchedule, setSavingSchedule] = useState(false);

  const load = async () => {
    try {
      const [prof, st, tr, pendReg, sess, stud, tsk, wdr] = await Promise.all([
        api.get('/api/teachers/dashboard/profile', { auth: true }),
        api.get('/api/teachers/dashboard/stats', { auth: true }),
        api.get('/api/sessions/my-sessions?type=trial&status=pending', { auth: true }),
        api.get('/api/sessions/my-sessions?type=regular&status=pending', { auth: true }),
        api.get('/api/sessions/my-sessions?type=regular&status=accepted', { auth: true }),
        api.get('/api/teachers/dashboard/active-students', { auth: true }),
        api.get('/api/teachers/dashboard/tasks', { auth: true }),
        api.get('/api/teachers/dashboard/withdrawals', { auth: true }),
      ]);
      setProfile(prof);
      setStats(st);
      setTrials(tr.sessions || []);
      setPendingRegular(pendReg.sessions || []);
      setSessions(sess.sessions || []);
      setActiveStudents(stud.students || []);
      setTasks(tsk.tasks || []);
      setWithdrawals(wdr.withdrawals || []);
      setAvailableBalance(wdr.available ?? prof?.wallet?.pendingEarnings ?? 0);
    } catch {
      toast.error('تعذر تحميل بيانات لوحة المعلم');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (ready) load(); }, [ready]);

  useEffect(() => {
    if (!ready) return;
    if (tab === 'analytics' && !analytics) {
      api.get('/api/teachers/dashboard/analytics', { auth: true }).then(setAnalytics).catch(() => {});
    }
    if (tab === 'reviews' && !reviewsData.reviews.length) {
      api.get('/api/teachers/dashboard/reviews', { auth: true }).then(setReviewsData).catch(() => {});
    }
    if (tab === 'schedule' && !schedule.length) {
      api.get('/api/teachers/dashboard/availability', { auth: true })
        .then((d) => setSchedule(mergeSchedule(d.availability)))
        .catch(() => setSchedule(mergeSchedule([])));
    }
  }, [tab, ready, analytics, reviewsData.reviews.length, schedule.length]);

  if (!ready) return null;

  const wallet = profile?.wallet || {};
  const teacher = profile?.teacher;

  const respondTrial = async (id, action) => {
    try {
      await api.put(`/api/sessions/${id}/respond`, {
        action,
        provider: action === 'accept' ? meetingProvider : undefined,
      }, { auth: true });
      toast.success(action === 'accept' ? 'تم قبول الطلب' : 'تم رفض الطلب');
      load();
    } catch { toast.error('حدث خطأ'); }
  };

  const openEval = (session) => {
    setEvalModal(session);
    setEvaluation(emptyEval);
    setHomeworkList([]);
  };

  const addHomework = () => {
    setHomeworkList((p) => [...p, { ...emptyHomework }]);
  };

  const completeSession = async () => {
    if (!evalModal) return;
    try {
      await api.put(`/api/sessions/${evalModal._id}/complete`, {
        evaluation: {
          ...evaluation,
          assignedHomework: homeworkList.filter((h) => h.description?.trim()),
        },
      }, { auth: true });
      toast.success(`تم إكمال الحصة — +${SESSION_RATE} ج.م`);
      setEvalModal(null);
      load();
    } catch { toast.error('فشل إكمال الحصة'); }
  };

  const assignTask = async () => {
    if (!newTask.studentId || !newTask.title) return toast.error('اختر الطالب واكتب عنوان الواجب');
    try {
      await api.post('/api/teachers/dashboard/tasks', newTask, { auth: true });
      toast.success('تم إسناد الواجب');
      setTaskModal(false);
      setNewTask({ studentId: '', type: 'memorization', title: '', description: '', dueDate: '' });
      load();
    } catch { toast.error('فشل إسناد الواجب'); }
  };

  const requestWithdraw = async (e) => {
    e.preventDefault();
    setWithdrawing(true);
    try {
      await api.post('/api/teachers/dashboard/withdrawals', {
        amount: Number(withdrawForm.amount),
        method: withdrawForm.method,
        accountInfo: withdrawForm.accountInfo,
      }, { auth: true });
      toast.success('تم إرسال طلب السحب — سيتم المراجعة خلال 48 ساعة');
      setWithdrawForm({ amount: '', method: 'vodafone_cash', accountInfo: '' });
      load();
    } catch (err) { toast.error(err.message || 'فشل طلب السحب'); }
    finally { setWithdrawing(false); }
  };

  const markTaskDone = async (id) => {
    try {
      await api.patch(`/api/teachers/dashboard/tasks/${id}`, { status: 'done' }, { auth: true });
      toast.success('تم اعتماد الواجب');
      load();
    } catch { toast.error('فشل'); }
  };

  const saveSchedule = async () => {
    setSavingSchedule(true);
    try {
      const availability = schedule
        .filter((d) => d.startTime && d.endTime)
        .map((d) => ({ day: d.day, slots: [{ startTime: d.startTime, endTime: d.endTime }] }));
      await api.put('/api/teachers/dashboard/availability', { availability }, { auth: true });
      toast.success('تم حفظ الجدول');
    } catch { toast.error('فشل حفظ الجدول'); }
    finally { setSavingSchedule(false); }
  };

  const tabs = [
    { id: 'account', label: 'حسابي' },
    { id: 'schedule', label: 'الجدول' },
    { id: 'analytics', label: 'الإحصائيات' },
    { id: 'reviews', label: 'التقييمات' },
    { id: 'trials', label: `تجريبية (${trials.length})` },
    { id: 'sessions', label: `حصصي (${sessions.length + pendingRegular.length})` },
    { id: 'evaluate', label: 'التقييم' },
    { id: 'homework', label: 'الواجبات' },
  ];

  const completedForEval = sessions.filter((s) => s.status === 'accepted');

  return (
    <DashboardLayout title="لوحة تحكم المعلم" user={user} onLogout={logout}>
      {loading ? <div className="flex justify-center py-20"><div className="spinner spinner-lg" /></div> : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            <StatCard label="رصيد مستحق" value={`${wallet.pendingEarnings || 0} ج.م`} icon={Wallet} color="yellow" />
            <StatCard label="حصص مكتملة" value={wallet.completedSessions || stats.totalSessions || 0} icon={Calendar} color="blue" />
            <StatCard label="طلاب نشطون" value={activeStudents.length} icon={Users} color="green" />
            <StatCard label="التقييم" value={stats.averageRating?.toFixed?.(1) || '0'} icon={Star} color="orange" />
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <TabBar tabs={tabs} active={tab} onChange={setTab} />

            {tab === 'account' && teacher && (
              <div className="space-y-6">
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-2"><Wallet className="text-emerald-600" /><h3 className="font-bold">محفظتي</h3></div>
                  <p className="text-3xl font-bold text-emerald-700">{wallet.pendingEarnings || 0} <span className="text-lg">ج.م</span></p>
                  <p className="text-sm text-slate-600 mt-2">
                    كل حصة = ساعة واحدة = <strong>{SESSION_RATE} ج.م</strong> (ثابت)
                  </p>
                  <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
                    <div className="bg-white rounded-lg p-3"><span className="text-slate-500">إجمالي الأرباح</span><p className="font-bold">{wallet.totalEarned || 0} ج.م</p></div>
                    <div className="bg-white rounded-lg p-3"><span className="text-slate-500">تم سحبه</span><p className="font-bold">{wallet.withdrawn || 0} ج.م</p></div>
                  </div>
                  <p className="text-xs text-slate-500 mt-3">متاح للسحب: <strong>{availableBalance} ج.م</strong></p>
                </div>

                {availableBalance >= SESSION_RATE && (
                  <form onSubmit={requestWithdraw} className="border border-slate-200 rounded-xl p-5 space-y-3">
                    <h3 className="font-bold text-sm">طلب سحب أرباح</h3>
                    <div className="grid md:grid-cols-3 gap-3">
                      <input type="number" min={SESSION_RATE} step={SESSION_RATE} required placeholder={`المبلغ (min ${SESSION_RATE})`}
                        value={withdrawForm.amount} onChange={(e) => setWithdrawForm((p) => ({ ...p, amount: e.target.value }))}
                        className="input-field" />
                      <select value={withdrawForm.method} onChange={(e) => setWithdrawForm((p) => ({ ...p, method: e.target.value }))}
                        className="input-field">
                        <option value="vodafone_cash">فودافون كاش</option>
                        <option value="instapay">InstaPay</option>
                        <option value="bank">حساب بنكي</option>
                      </select>
                      <input required placeholder="رقم المحفظة / IBAN"
                        value={withdrawForm.accountInfo} onChange={(e) => setWithdrawForm((p) => ({ ...p, accountInfo: e.target.value }))}
                        className="input-field" />
                    </div>
                    <button type="submit" disabled={withdrawing} className="btn-primary text-sm">
                      {withdrawing ? 'جاري الإرسال...' : 'إرسال طلب السحب'}
                    </button>
                  </form>
                )}

                {withdrawals.length > 0 && (
                  <div>
                    <h3 className="font-bold text-sm mb-2">سجل السحوبات</h3>
                    <div className="space-y-2">
                      {withdrawals.map((w) => (
                        <div key={w._id} className="flex justify-between items-center border rounded-lg p-3 text-sm">
                          <div>
                            <span className="font-bold">{w.amount} ج.م</span>
                            <span className="text-slate-500 mx-2">—</span>
                            <span className="text-slate-600">{w.method}</span>
                            <p className="text-xs text-slate-400 mt-0.5">{new Date(w.createdAt).toLocaleDateString('ar-EG')}</p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded ${
                            w.status === 'approved' ? 'bg-green-100 text-green-700'
                              : w.status === 'rejected' ? 'bg-red-100 text-red-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {w.status === 'approved' ? 'تم التحويل' : w.status === 'rejected' ? 'مرفوض' : 'قيد المراجعة'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <InfoRow label="الاسم" value={teacher.personalInfo?.fullName} />
                  <InfoRow label="البريد" value={user?.email} />
                  <InfoRow label="الهاتف" value={teacher.personalInfo?.phone} />
                  <InfoRow label="البلد" value={teacher.personalInfo?.country} />
                  <InfoRow label="الجامعة" value={teacher.academicInfo?.university} />
                  <InfoRow label="الحالة" value={statusLabel(teacher.status)} />
                </div>
              </div>
            )}

            {tab === 'schedule' && (
              <div className="space-y-4">
                <p className="text-sm text-slate-600">حدّد أوقات فراغك الأسبوعية — يراها الطلاب عند الحجز</p>
                {schedule.map((row, i) => (
                  <div key={row.day} className="flex flex-wrap items-center gap-3 border rounded-lg p-3">
                    <span className="w-20 font-medium text-sm">{row.label}</span>
                    <input type="time" className="input-field w-32" value={row.startTime}
                      onChange={(e) => setSchedule((p) => p.map((r, j) => j === i ? { ...r, startTime: e.target.value } : r))} />
                    <span className="text-slate-400">—</span>
                    <input type="time" className="input-field w-32" value={row.endTime}
                      onChange={(e) => setSchedule((p) => p.map((r, j) => j === i ? { ...r, endTime: e.target.value } : r))} />
                  </div>
                ))}
                <button type="button" onClick={saveSchedule} disabled={savingSchedule} className="btn-primary text-sm">
                  {savingSchedule ? 'جاري الحفظ...' : 'حفظ الجدول'}
                </button>
              </div>
            )}

            {tab === 'analytics' && (
              <div className="space-y-4">
                {!analytics ? <p className="text-center py-8 text-gray-500">جاري التحميل...</p> : (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="bg-emerald-50 rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold text-emerald-700">{analytics.earnings?.daily || 0}</p>
                        <p className="text-xs text-slate-600">أرباح اليوم (ج.م)</p>
                      </div>
                      <div className="bg-blue-50 rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold text-blue-700">{analytics.earnings?.weekly || 0}</p>
                        <p className="text-xs text-slate-600">هذا الأسبوع</p>
                      </div>
                      <div className="bg-purple-50 rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold text-purple-700">{analytics.earnings?.monthly || 0}</p>
                        <p className="text-xs text-slate-600">هذا الشهر</p>
                      </div>
                      <div className="bg-yellow-50 rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold text-yellow-700">{analytics.totalCompleted || 0}</p>
                        <p className="text-xs text-slate-600">حصص (6 أشهر)</p>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-sm mb-3 flex items-center gap-2"><BarChart3 size={16} /> حصص شهرية</h3>
                      <div className="space-y-2">
                        {(analytics.monthlySessions || []).map((m) => (
                          <div key={m.month} className="flex items-center gap-3">
                            <span className="text-xs w-16 text-slate-500">{m.month}</span>
                            <div className="flex-1 bg-slate-100 rounded-full h-3">
                              <div className="bg-emerald-500 h-3 rounded-full" style={{ width: `${Math.min(100, m.count * 15)}%` }} />
                            </div>
                            <span className="text-sm font-bold w-6">{m.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {tab === 'reviews' && (
              <div className="space-y-3">
                <p className="text-sm text-slate-600 flex items-center gap-2">
                  <MessageSquare size={16} /> متوسط التقييم: <strong>{reviewsData.averageRating?.toFixed?.(1) || '0'}</strong> ({reviewsData.totalReviews || 0} تقييم)
                </p>
                {reviewsData.reviews.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">لا تقييمات بعد</p>
                ) : reviewsData.reviews.map((r) => (
                  <div key={r._id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <p className="font-bold text-sm">{r.student?.name || 'طالب'}</p>
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} size={14} className={i < r.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />
                        ))}
                      </div>
                    </div>
                    {r.comment && <p className="text-sm text-gray-600 mt-2">{r.comment}</p>}
                    <p className="text-xs text-gray-400 mt-1">{new Date(r.createdAt).toLocaleDateString('ar-EG')}</p>
                  </div>
                ))}
              </div>
            )}

            {tab === 'trials' && (
              <div className="space-y-3">
                <p className="text-sm text-slate-600 mb-3">طلبات من طلاب شاهدوا صورتك وفيديو تلاوتك ويريدون حصة تجريبية</p>
                <div className="flex items-center gap-2 text-sm mb-2">
                  <span className="text-gray-600">منصة الاجتماع عند القبول:</span>
                  <select value={meetingProvider} onChange={(e) => setMeetingProvider(e.target.value)}
                    className="border rounded-lg px-2 py-1">
                    <option value="jitsi">Jitsi (فوري)</option>
                    <option value="zoom">Zoom</option>
                    <option value="google_meet">Google Meet</option>
                  </select>
                </div>
                {trials.length === 0 ? <p className="text-center text-gray-500 py-8">لا طلبات تجريبية</p> : trials.map((s) => (
                  <div key={s._id} className="border rounded-lg p-4 flex flex-wrap justify-between items-center gap-4">
                    <div>
                      <h3 className="font-bold">{s.student?.name}</h3>
                      <p className="text-sm text-gray-600">{new Date(s.scheduledAt).toLocaleString('ar-EG')}</p>
                      {s.student?.email && <p className="text-xs text-gray-400">{s.student.email}</p>}
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
                {pendingRegular.length > 0 && (
                  <div className="space-y-3 mb-6">
                    <p className="text-sm font-semibold text-amber-800">طلبات حصص منتظمة ({pendingRegular.length}) — تحتاج موافقتك</p>
                    <div className="flex items-center gap-2 text-sm mb-1">
                      <span className="text-gray-600">منصة الاجتماع عند القبول:</span>
                      <select value={meetingProvider} onChange={(e) => setMeetingProvider(e.target.value)}
                        className="border rounded-lg px-2 py-1">
                        <option value="jitsi">Jitsi (فوري)</option>
                        <option value="zoom">Zoom</option>
                        <option value="google_meet">Google Meet</option>
                      </select>
                    </div>
                    {pendingRegular.map((s) => (
                      <div key={s._id} className="border border-amber-200 bg-amber-50 rounded-lg p-4 flex flex-wrap justify-between items-center gap-4">
                        <div>
                          <h3 className="font-bold">{s.student?.name}</h3>
                          <p className="text-sm text-gray-600">{new Date(s.scheduledAt).toLocaleString('ar-EG')}</p>
                          {s.notes && <p className="text-xs text-gray-500 mt-1">{s.notes}</p>}
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => respondTrial(s._id, 'accept')} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm">قبول</button>
                          <button onClick={() => respondTrial(s._id, 'reject')} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm">رفض</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-sm text-slate-600 mb-3">الحصص المقبولة — انضم وقيّم بعد الانتهاء</p>
                {sessions.length === 0 && pendingRegular.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">لا حصص حالياً</p>
                ) : sessions.map((s) => (
                  <div key={s._id} className="border rounded-lg p-4 flex flex-wrap justify-between items-center gap-3">
                    <div>
                      <h3 className="font-bold">{s.student?.name}</h3>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <Clock size={14} /> {new Date(s.scheduledAt).toLocaleString('ar-EG')} — ساعة واحدة
                      </p>
                      {s.meetingLink && (
                        <a href={s.meetingLink} target="_blank" rel="noreferrer"
                          className="text-sm text-emerald-600 font-semibold hover:underline mt-1 inline-block">
                          انضم للحصة
                        </a>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {s.meetingLink && (
                        <a href={s.meetingLink} target="_blank" rel="noreferrer"
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">بدء</a>
                      )}
                      <button onClick={() => openEval(s)} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm">
                        إكمال + تقييم
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab === 'evaluate' && (
              <div className="space-y-3">
                <p className="text-sm text-slate-600 mb-3">قيّم كل طالب بعد انتهاء الحصة</p>
                {completedForEval.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">لا حصص جاهزة للتقييم — أكمل حصة من تبويب «حصصي»</p>
                ) : completedForEval.map((s) => (
                  <div key={s._id} className="border rounded-lg p-4 flex justify-between items-center">
                    <div>
                      <h3 className="font-bold">{s.student?.name}</h3>
                      <p className="text-sm text-gray-500">{new Date(s.scheduledAt).toLocaleString('ar-EG')}</p>
                    </div>
                    <button onClick={() => openEval(s)} className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm">
                      تقييم الطالب
                    </button>
                  </div>
                ))}
              </div>
            )}

            {tab === 'homework' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-slate-600">واجباتك للطلاب: حفظ، مراجعة قريبة/بعيدة، تسجيل صوتي...</p>
                  <button onClick={() => setTaskModal(true)} className="btn-primary text-sm flex items-center gap-1">
                    <Plus size={16} /> واجب جديد
                  </button>
                </div>
                {tasks.length === 0 ? <p className="text-center text-gray-500 py-8">لا واجبات بعد</p> : tasks.map((t) => (
                  <div key={t._id} className="border rounded-lg p-4 flex justify-between items-start gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <BookOpen size={16} className="text-emerald-600" />
                        <h3 className="font-bold">{t.title}</h3>
                        <span className="text-xs bg-slate-100 px-2 py-0.5 rounded">{taskTypeLabel(t.type)}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{t.student?.name}</p>
                      {t.description && <p className="text-sm text-gray-500 mt-1">{t.description}</p>}
                      {t.dueDate && <p className="text-xs text-gray-400 mt-1">موعد: {new Date(t.dueDate).toLocaleDateString('ar-EG')}</p>}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`text-xs px-2 py-1 rounded ${t.status === 'done' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {t.status === 'done' ? 'منجز' : t.status === 'submitted' ? 'مُسلّم' : 'قيد الانتظار'}
                      </span>
                      {t.status === 'submitted' && (
                        <button onClick={() => markTaskDone(t._id)} className="text-xs px-2 py-1 bg-emerald-600 text-white rounded">
                          اعتماد
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {evalModal && (
        <Modal title={`تقييم ${evalModal.student?.name}`} onClose={() => setEvalModal(null)}>
          <div className="space-y-4">
            {[
              ['attendance', 'الحضور والانتباه'],
              ['memorization', 'الحفظ'],
              ['tajweed', 'التجويد'],
              ['behavior', 'السلوك'],
              ['commitment', 'الالتزام'],
            ].map(([key, label]) => (
              <div key={key}>
                <label className="text-sm font-medium">{label} (1-5)</label>
                <input type="range" min={1} max={5} value={evaluation[key]}
                  onChange={(e) => setEvaluation((p) => ({ ...p, [key]: Number(e.target.value) }))}
                  className="w-full" />
                <span className="text-sm text-emerald-600 font-bold">{evaluation[key]}</span>
              </div>
            ))}
            <div>
              <label className="text-sm font-medium">ملاحظات</label>
              <textarea className="input-field w-full mt-1" rows={2} value={evaluation.overallNotes}
                onChange={(e) => setEvaluation((p) => ({ ...p, overallNotes: e.target.value }))} />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium flex items-center gap-1"><ClipboardList size={16} /> واجبات بعد الحصة</label>
                <button type="button" onClick={addHomework} className="text-sm text-emerald-600">+ إضافة</button>
              </div>
              {homeworkList.map((hw, i) => (
                <div key={i} className="border rounded-lg p-3 mb-2 space-y-2">
                  <select className="input-field w-full" value={hw.type}
                    onChange={(e) => setHomeworkList((p) => p.map((h, j) => j === i ? { ...h, type: e.target.value } : h))}>
                    {TASK_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
                  </select>
                  <input className="input-field w-full" placeholder="التفاصيل (مثلاً: سورة البقرة 1-5)"
                    value={hw.description}
                    onChange={(e) => setHomeworkList((p) => p.map((h, j) => j === i ? { ...h, description: e.target.value } : h))} />
                  <input type="date" className="input-field w-full" value={hw.dueDate}
                    onChange={(e) => setHomeworkList((p) => p.map((h, j) => j === i ? { ...h, dueDate: e.target.value } : h))} />
                </div>
              ))}
            </div>
            <button onClick={completeSession} className="btn-primary w-full">
              إكمال الحصة (+{SESSION_RATE} ج.م)
            </button>
          </div>
        </Modal>
      )}

      {taskModal && (
        <Modal title="إسناد واجب جديد" onClose={() => setTaskModal(false)}>
          <div className="space-y-3">
            <select className="input-field w-full" value={newTask.studentId}
              onChange={(e) => setNewTask((p) => ({ ...p, studentId: e.target.value }))}>
              <option value="">اختر الطالب</option>
              {activeStudents.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>
            <select className="input-field w-full" value={newTask.type}
              onChange={(e) => setNewTask((p) => ({ ...p, type: e.target.value }))}>
              {TASK_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
            <input className="input-field w-full" placeholder="عنوان الواجب" value={newTask.title}
              onChange={(e) => setNewTask((p) => ({ ...p, title: e.target.value }))} />
            <textarea className="input-field w-full" placeholder="التفاصيل" rows={2} value={newTask.description}
              onChange={(e) => setNewTask((p) => ({ ...p, description: e.target.value }))} />
            <input type="date" className="input-field w-full" value={newTask.dueDate}
              onChange={(e) => setNewTask((p) => ({ ...p, dueDate: e.target.value }))} />
            <button onClick={assignTask} className="btn-primary w-full">إسناد</button>
          </div>
        </Modal>
      )}
    </DashboardLayout>
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
    <div className="bg-slate-50 rounded-lg p-3">
      <span className="text-slate-500 text-xs">{label}</span>
      <p className="font-semibold">{value || '—'}</p>
    </div>
  );
}

function statusLabel(s) {
  const m = { pending: 'قيد المراجعة', 'under-review': 'تحت المراجعة', approved: 'موافق', rejected: 'مرفوض', suspended: 'موقوف' };
  return m[s] || s;
}

function taskTypeLabel(t) {
  return TASK_TYPES.find((x) => x.id === t)?.label || t;
}

function mergeSchedule(apiDays) {
  return WEEK_DAYS.map((d) => {
    const found = (apiDays || []).find((a) => a.day === d.id);
    const slot = found?.slots?.[0];
    return { day: d.id, label: d.label, startTime: slot?.startTime || '', endTime: slot?.endTime || '' };
  });
}
