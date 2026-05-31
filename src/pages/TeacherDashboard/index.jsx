import { useState, useEffect } from 'react';
import {
  Calendar, Users, Star, Wallet, ClipboardList,
  BookOpen, X, Plus, Clock,
} from 'lucide-react';
import DashboardLayout, { StatCard, TabBar } from '../../components/dashboard/DashboardLayout';
import { useRequireAuth } from '../../hooks/useRequireAuth';
import { useToast } from '../../context/ToastProvider';
import api from '../../lib/api';
import { TASK_TYPES } from '../TeacherRegistration/constants';

const SESSION_RATE = 50;
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

  const load = async () => {
    try {
      const [prof, st, tr, sess, stud, tsk] = await Promise.all([
        api.get('/api/teachers/dashboard/profile', { auth: true }),
        api.get('/api/teachers/dashboard/stats', { auth: true }),
        api.get('/api/sessions/my-sessions?type=trial&status=pending', { auth: true }),
        api.get('/api/sessions/my-sessions?type=regular&status=accepted', { auth: true }),
        api.get('/api/teachers/dashboard/active-students', { auth: true }),
        api.get('/api/teachers/dashboard/tasks', { auth: true }),
      ]);
      setProfile(prof);
      setStats(st);
      setTrials(tr.sessions || []);
      setSessions(sess.sessions || []);
      setActiveStudents(stud.students || []);
      setTasks(tsk.tasks || []);
    } catch {
      toast.error('تعذر تحميل بيانات لوحة المعلم');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (ready) load(); }, [ready]);

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

  const tabs = [
    { id: 'account', label: 'حسابي' },
    { id: 'trials', label: `تجريبية (${trials.length})` },
    { id: 'sessions', label: `حصصي (${sessions.length})` },
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
                </div>
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
                <p className="text-sm text-slate-600 mb-3">الطلاب الذين وافقوا عليك بعد الحصة التجريبية</p>
                {sessions.length === 0 ? <p className="text-center text-gray-500 py-8">لا حصص حالياً</p> : sessions.map((s) => (
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
                    <span className={`text-xs px-2 py-1 rounded ${t.status === 'done' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {t.status === 'done' ? 'منجز' : t.status === 'submitted' ? 'مُسلّم' : 'قيد الانتظار'}
                    </span>
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
