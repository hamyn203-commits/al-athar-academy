import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Calendar, Users, Star, Wallet, ClipboardList,
  BookOpen, X, Plus, Clock, BarChart3, MessageSquare, Sparkles,
  Video, MoreHorizontal, UserRound, CheckCircle2, AlertTriangle,
  Headphones, RotateCcw, ChevronLeft, TrendingUp, CalendarDays,
} from 'lucide-react';
import DashboardLayout, { StatCard } from '../../components/dashboard/DashboardLayout';
import { useRequireAuth } from '../../hooks/useRequireAuth';
import { useToast } from '../../context/ToastProvider';
import api from '../../lib/api';
import { TASK_TYPES } from '../TeacherRegistration/constants';
import SessionChatModal from '../../components/session/SessionChatModal';
import { useI18n } from '../../i18n';
import { localizedPath } from '../../lib/locale';

const SESSION_RATE = 50;
const WEEK_DAYS = [
  { id: 'sunday', label: 'الأحد' }, { id: 'monday', label: 'الإثنين' },
  { id: 'tuesday', label: 'الثلاثاء' }, { id: 'wednesday', label: 'الأربعاء' },
  { id: 'thursday', label: 'الخميس' }, { id: 'friday', label: 'الجمعة' },
  { id: 'saturday', label: 'السبت' },
];
const emptyEval = {
  attendance: 5,
  memorization: 5,
  tajweed: 5,
  behavior: 5,
  commitment: 5,
  overallNotes: '',
  surahRecited: '',
  fromAyah: '',
  toAyah: '',
  nextHomework: '',
};
const emptyHomework = { type: 'memorization', description: '', dueDate: '' };

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, ready, logout } = useRequireAuth(['teacher']);
  const { locale } = useI18n();
  const lp = (value) => localizedPath(value, locale);
  const toast = useToast();
  const [tab, setTab] = useState('overview');
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({});
  const [trials, setTrials] = useState([]);
  const [pendingRegular, setPendingRegular] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [activeStudents, setActiveStudents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meetingProvider, setMeetingProvider] = useState('jitsi');
  const [chatSession, setChatSession] = useState(null);
  const [rescheduleModal, setRescheduleModal] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState('');

  const [evalModal, setEvalModal] = useState(null);
  const [evaluation, setEvaluation] = useState(emptyEval);
  const [homeworkList, setHomeworkList] = useState([]);

  const [taskModal, setTaskModal] = useState(false);
  const [newTask, setNewTask] = useState({ studentId: '', type: 'memorization', title: '', description: '', dueDate: '' });
  const [finance, setFinance] = useState({
    balances: {
      EGP: { available: 0, pending: 0, withdrawn: 0, totalEarned: 0 },
      USD: { available: 0, pending: 0, withdrawn: 0, totalEarned: 0 },
    },
    limits: { minPayoutEGP: 100, minPayoutUSD: 10 },
  });
  const [transactions, setTransactions] = useState([]);
  const [withdrawForm, setWithdrawForm] = useState({
    amount: '',
    currency: 'EGP',
    payoutMethod: 'vodafone_cash',
    phone: '',
    ipaAddress: '',
    bankName: '',
    bankAccountNumber: '',
    paypalEmail: '',
  });
  const [withdrawing, setWithdrawing] = useState(false);
  const [studentModal, setStudentModal] = useState(null);
  const [studentSummary, setStudentSummary] = useState(null);
  const [studentSummaryLoading, setStudentSummaryLoading] = useState(false);
  const [homeworkAudio, setHomeworkAudio] = useState({ taskId: '', url: '', loading: false });
  const [taskReview, setTaskReview] = useState({});
  const [analytics, setAnalytics] = useState(null);
  const [reviewsData, setReviewsData] = useState({ reviews: [], averageRating: 0, totalReviews: 0 });
  const [schedule, setSchedule] = useState([]);
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [aiModal, setAiModal] = useState(false);
  const [aiTopic, setAiTopic] = useState('التجويد');
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  const load = useCallback(async () => {
    try {
      const [prof, st, tr, pendReg, sess, stud, tsk, balance, tx] = await Promise.all([
        api.get('/api/teachers/dashboard/profile', { auth: true }),
        api.get('/api/teachers/dashboard/stats', { auth: true }),
        api.get('/api/sessions/my-sessions?type=trial&status=pending', { auth: true }),
        api.get('/api/sessions/my-sessions?type=regular&status=pending', { auth: true }),
        api.get('/api/sessions/my-sessions?type=regular&status=accepted', { auth: true }),
        api.get('/api/teachers/dashboard/active-students', { auth: true }),
        api.get('/api/teachers/dashboard/tasks', { auth: true }),
        api.get('/api/finance/teacher/balance', { auth: true }),
        api.get('/api/finance/teacher/transactions?limit=20', { auth: true }),
      ]);
      setProfile(prof);
      setStats(st);
      setTrials(tr.sessions || []);
      setPendingRegular(pendReg.sessions || []);
      setSessions((sess.sessions || []).sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt)));
      setActiveStudents(stud.students || []);
      setTasks(tsk.tasks || []);
      setFinance(balance || {
        balances: {
          EGP: { available: 0, pending: 0, withdrawn: 0, totalEarned: 0 },
          USD: { available: 0, pending: 0, withdrawn: 0, totalEarned: 0 },
        },
        limits: { minPayoutEGP: 100, minPayoutUSD: 10 },
      });
      setTransactions(tx.transactions || []);
    } catch {
      toast.error('تعذر تحميل بيانات لوحة المعلم');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { if (ready) load(); }, [ready, load]);

  const syncSessions = useCallback(async () => {
    if (!ready) return;
    try {
      const result = await api.get('/api/sessions/my-sessions?limit=100', { auth: true });
      const all = result.sessions || [];
      setTrials(all.filter((item) => item.type === 'trial' && item.status === 'pending'));
      setPendingRegular(all.filter((item) => item.type === 'regular' && item.status === 'pending'));
      setSessions(all.filter((item) => item.status === 'accepted'));
    } catch {
      // Keep the current dashboard stable during a transient sync failure.
    }
  }, [ready]);

  useEffect(() => {
    if (!ready) return undefined;

    const refresh = () => {
      if (document.visibilityState === 'visible') syncSessions();
    };

    refresh();
    const interval = window.setInterval(refresh, 15000);
    const onFocus = () => refresh();
    const onVisibility = () => refresh();

    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [ready, syncSessions]);

  useEffect(() => {
    if (!ready) return undefined;

    const onRealtimeNotification = (event) => {
      const type = event?.detail?.type;
      if (['session-request', 'session-chat-message'].includes(type)) {
        syncSessions();
      }
    };

    window.addEventListener('wn:realtime-notification', onRealtimeNotification);
    return () => window.removeEventListener('wn:realtime-notification', onRealtimeNotification);
  }, [ready, syncSessions]);

  useEffect(() => {
    const requestedTab = searchParams.get('tab');
    const allowedTabs = ['overview', 'requests', 'sessions', 'students', 'homework', 'schedule', 'wallet', 'analytics', 'reviews', 'account'];
    if (requestedTab && allowedTabs.includes(requestedTab)) {
      setTab(requestedTab);
    }

    // Backwards-compatible deep links.
    if (requestedTab === 'trials') setTab('requests');
    if (requestedTab === 'evaluate') setTab('sessions');

    const requestedSessionId = searchParams.get('session');
    if (!requestedSessionId) return;
    const found = [...trials, ...pendingRegular, ...sessions]
      .find((item) => String(item._id) === String(requestedSessionId));
    if (found) setChatSession(found);
  }, [searchParams, trials, pendingRegular, sessions]);

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

  const respondTrial = async (id, action, extra = {}) => {
    try {
      let reason = extra.reason;
      if (action === 'reject' && reason == null) {
        reason = window.prompt('سبب الاعتذار عن الحصة (اختياري):', '') ?? '';
      }

      await api.put(`/api/sessions/${id}/respond`, {
        action,
        provider: action === 'accept' ? meetingProvider : undefined,
        reason,
        rescheduledDate: extra.rescheduledDate,
      }, { auth: true });

      const labels = {
        accept: 'تم قبول الطلب وإشعار الطالب',
        reject: 'تم الاعتذار عن الطلب وإشعار الطالب',
        reschedule: 'تم اقتراح الموعد الجديد وإشعار الطالب',
      };
      toast.success(labels[action] || 'تم تحديث الطلب');
      setRescheduleModal(null);
      setRescheduleDate('');
      load();
    } catch (error) {
      toast.error(error.message || 'حدث خطأ');
    }
  };

  const submitReschedule = async () => {
    if (!rescheduleModal || !rescheduleDate) {
      return toast.error('اختر الموعد الجديد');
    }
    const proposed = new Date(rescheduleDate);
    if (Number.isNaN(proposed.getTime()) || proposed <= new Date()) {
      return toast.error('اختر موعدًا مستقبليًا صحيحًا');
    }
    await respondTrial(rescheduleModal._id, 'reschedule', {
      rescheduledDate: proposed.toISOString(),
    });
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
          attendance: evaluation.attendance,
          memorization: evaluation.memorization,
          tajweed: evaluation.tajweed,
          behavior: evaluation.behavior,
          commitment: evaluation.commitment,
          overallNotes: evaluation.overallNotes,
          assignedHomework: homeworkList.filter((item) => item.description?.trim()),
        },
      }, { auth: true });

      try {
        await api.post(`/api/sessions/${evalModal._id}/report`, {
          studentId: evalModal.student?._id,
          memorizationScore: Math.min(10, Math.max(0, evaluation.memorization * 2)),
          tajweedScore: Math.min(10, Math.max(0, evaluation.tajweed * 2)),
          surahRecited: evaluation.surahRecited,
          fromAyah: evaluation.fromAyah || undefined,
          toAyah: evaluation.toAyah || undefined,
          nextHomework: evaluation.nextHomework || homeworkList[0]?.description || '',
          notes: evaluation.overallNotes,
        }, { auth: true });
      } catch {
        toast.info('تم إنهاء الحصة، لكن تعذر إرسال تقرير المتابعة الخارجي. التقرير محفوظ داخل الحصة.');
      }

      toast.success(`تم إنهاء الحصة واعتماد الاستحقاق (+${SESSION_RATE} ج.م)`);
      setEvalModal(null);
      load();
    } catch (error) {
      toast.error(error.message || 'فشل إكمال الحصة');
    }
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
      const payoutDetails = {};
      if (withdrawForm.payoutMethod === 'vodafone_cash') payoutDetails.phone = withdrawForm.phone;
      if (withdrawForm.payoutMethod === 'instapay') {
        payoutDetails.ipaAddress = withdrawForm.ipaAddress;
        payoutDetails.phone = withdrawForm.phone;
      }
      if (withdrawForm.payoutMethod === 'bank_transfer') {
        payoutDetails.bankName = withdrawForm.bankName;
        payoutDetails.bankAccountNumber = withdrawForm.bankAccountNumber;
      }
      if (withdrawForm.payoutMethod === 'paypal') payoutDetails.paypalEmail = withdrawForm.paypalEmail;

      await api.post('/api/finance/teacher/request-payout', {
        amount: Number(withdrawForm.amount),
        currency: withdrawForm.currency,
        payoutMethod: withdrawForm.payoutMethod,
        payoutDetails,
      }, { auth: true });

      toast.success('تم إرسال طلب السحب للإدارة');
      setWithdrawForm({
        amount: '',
        currency: 'EGP',
        payoutMethod: 'vodafone_cash',
        phone: '',
        ipaAddress: '',
        bankName: '',
        bankAccountNumber: '',
        paypalEmail: '',
      });
      load();
    } catch (err) {
      toast.error(err.message || 'فشل طلب السحب');
    } finally {
      setWithdrawing(false);
    }
  };

  const reviewTask = async (task, action) => {
    try {
      await api.patch(`/api/teachers/dashboard/tasks/${task._id}`, {
        action,
        teacherFeedback: taskReview[task._id] || '',
      }, { auth: true });
      toast.success(action === 'approve' ? 'تم اعتماد الواجب وإشعار الطالب' : 'تم طلب إعادة الواجب وإشعار الطالب');
      setTaskReview((current) => ({ ...current, [task._id]: '' }));
      if (homeworkAudio.url) URL.revokeObjectURL(homeworkAudio.url);
      setHomeworkAudio({ taskId: '', url: '', loading: false });
      load();
    } catch (error) {
      toast.error(error.message || 'تعذر مراجعة الواجب');
    }
  };

  const playHomeworkSubmission = async (task) => {
    if (!task.submissionFile) return toast.error('لا يوجد ملف تسليم لهذا الواجب');

    if (homeworkAudio.taskId === task._id && homeworkAudio.url) return;

    if (homeworkAudio.url) URL.revokeObjectURL(homeworkAudio.url);
    setHomeworkAudio({ taskId: task._id, url: '', loading: true });

    try {
      const response = await api.request(`/api/homework/tasks/${task._id}/file`, {
        auth: true,
        json: false,
        method: 'GET',
      });
      const blob = await response.blob();
      setHomeworkAudio({
        taskId: task._id,
        url: URL.createObjectURL(blob),
        loading: false,
      });
    } catch (error) {
      setHomeworkAudio({ taskId: '', url: '', loading: false });
      toast.error(error.message || 'تعذر تشغيل تسجيل الطالب');
    }
  };

  const openStudent = async (student) => {
    setStudentModal(student);
    setStudentSummary(null);
    setStudentSummaryLoading(true);
    try {
      const result = await api.get(`/api/teachers/dashboard/students/${student._id}/summary`, { auth: true });
      setStudentSummary(result);
    } catch (error) {
      toast.error(error.message || 'تعذر تحميل ملف الطالب');
    } finally {
      setStudentSummaryLoading(false);
    }
  };

  const enterAcademyRoom = async (session) => {
    try {
      const room = await api.post('/api/live/sessions', {
        title: `حلقة ${session.student?.name || 'الطالب'}`,
        description: 'حلقة فردية عبر غرفة الأكاديمية',
        subject: 'quran',
        sessionId: session._id,
      }, { auth: true });
      navigate(lp(`/live/${room.roomId}`));
    } catch (error) {
      toast.error(error.message || 'تعذر فتح غرفة الأكاديمية');
    }
  };

  const generateAiHomework = async () => {
    setAiLoading(true);
    try {
      const res = await api.post('/api/ai/homework-generate', { topic: aiTopic, level: 'intermediate', count: 5, locale: 'ar' }, { auth: true });
      setAiResult(res);
      toast.success('تم توليد الواجبات');
    } catch (e) { toast.error(e.message || 'فشل'); }
    finally { setAiLoading(false); }
  };

  const saveSchedule = async () => {
    setSavingSchedule(true);
    try {
      const availability = schedule
        .map((day) => ({
          day: day.day,
          slots: (day.slots || []).filter((slot) => slot.startTime && slot.endTime),
        }))
        .filter((day) => day.slots.length);

      await api.put('/api/teachers/dashboard/availability', { availability }, { auth: true });
      toast.success('تم حفظ أوقات التوفر');
    } catch (error) {
      toast.error(error.message || 'فشل حفظ الجدول');
    } finally {
      setSavingSchedule(false);
    }
  };

  const addScheduleSlot = (dayIndex) => {
    setSchedule((current) => current.map((day, index) => (
      index === dayIndex
        ? { ...day, slots: [...(day.slots || []), { startTime: '', endTime: '' }] }
        : day
    )));
  };

  const updateScheduleSlot = (dayIndex, slotIndex, key, value) => {
    setSchedule((current) => current.map((day, index) => {
      if (index !== dayIndex) return day;
      return {
        ...day,
        slots: day.slots.map((slot, currentSlotIndex) => (
          currentSlotIndex === slotIndex ? { ...slot, [key]: value } : slot
        )),
      };
    }));
  };

  const removeScheduleSlot = (dayIndex, slotIndex) => {
    setSchedule((current) => current.map((day, index) => (
      index === dayIndex
        ? { ...day, slots: day.slots.filter((_, currentSlotIndex) => currentSlotIndex !== slotIndex) }
        : day
    )));
  };

  const primaryNavItems = [
    { id: 'overview', label: 'الرئيسية', icon: Sparkles },
    { id: 'requests', label: 'الطلبات', icon: ClipboardList, badge: trials.length + pendingRegular.length },
    { id: 'sessions', label: 'حصصي', icon: Calendar, badge: sessions.length },
    { id: 'students', label: 'طلابي', icon: Users, badge: activeStudents.length },
    { id: 'homework', label: 'الواجبات', icon: BookOpen, badge: tasks.filter((task) => task.status === 'submitted').length },
  ];

  const secondaryNavItems = [
    { id: 'schedule', label: 'الجدول', icon: CalendarDays, description: 'أوقات التوفر الأسبوعية' },
    { id: 'wallet', label: 'المحفظة', icon: Wallet, description: 'الرصيد والسحب والمعاملات' },
    { id: 'analytics', label: 'الأداء', icon: BarChart3, description: 'الحصص والتحويل والواجبات' },
    { id: 'reviews', label: 'التقييمات', icon: Star, description: 'آراء الطلاب ومتوسط التقييم' },
    { id: 'account', label: 'ملفي', icon: UserRound, description: 'بيانات حساب المعلم' },
  ];

  const now = new Date();
  const upcomingSessions = sessions
    .filter((session) => new Date(session.scheduledAt) >= now)
    .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));
  const nextSession = upcomingSessions[0] || null;
  const submittedTasks = tasks.filter((task) => task.status === 'submitted');
  const awaitingCompletion = sessions.filter((session) => new Date(session.scheduledAt) <= now);
  const actionCount = trials.length + pendingRegular.length + submittedTasks.length + awaitingCompletion.length;
  const egpBalance = finance?.balances?.EGP || { available: 0, pending: 0, withdrawn: 0, totalEarned: 0 };

  return (
    <DashboardLayout title="لوحة تحكم المعلم" user={user} onLogout={logout}>
      {loading ? <div className="flex justify-center py-20"><div className="spinner spinner-lg" /></div> : (
        <>
          {trials.length > 0 && (
            <button
              type="button"
              onClick={() => setTab('trials')}
              className="w-full mb-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-right hover:bg-amber-100 transition"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-black text-amber-900">
                    لديك {trials.length} {trials.length === 1 ? 'طلب حصة تجريبية جديد' : 'طلبات حصص تجريبية جديدة'}
                  </p>
                  <p className="text-sm text-amber-800 mt-1">
                    اضغط هنا لمراجعة الطلب والقبول أو اقتراح موعد آخر.
                  </p>
                </div>
                <Calendar className="text-amber-700 shrink-0" size={24} />
              </div>
            </button>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            <StatCard label="رصيد مستحق" value={`${wallet.pendingEarnings || 0} ج.م`} icon={Wallet} color="yellow" />
            <StatCard label="حصص مكتملة" value={wallet.completedSessions || stats.totalSessions || 0} icon={Calendar} color="blue" />
            <StatCard label="طلاب نشطون" value={activeStudents.length} icon={Users} color="green" />
            <StatCard label="التقييم" value={stats.averageRating?.toFixed?.(1) || '0'} icon={Star} color="orange" />
          </div>

          <div className="wn-dashboard-surface">
            <TabBar tabs={tabs} active={tab} onChange={setTab} />

            {tab === 'account' && teacher && (
              <div className="space-y-6">
                <div className="wn-dashboard-gold-card rounded-2xl p-5">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2"><Wallet className="text-emerald-600" /><h3 className="font-bold">محفظتي</h3></div>
                  <button type="button" onClick={() => setAiModal(true)} className="text-sm flex items-center gap-1 text-purple-600 hover:underline">
                    <Sparkles size={16} /> مساعد AI
                  </button>
                </div>
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
                    <div className="flex gap-2 flex-wrap">
                      <button onClick={() => setChatSession(s)} className="px-4 py-2 border border-emerald-200 text-emerald-700 rounded-lg text-sm">محادثة</button>
                      <button onClick={() => respondTrial(s._id, 'accept')} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm">قبول</button>
                      <button onClick={() => { setRescheduleModal(s); setRescheduleDate(''); }} className="px-4 py-2 bg-amber-100 text-amber-800 rounded-lg text-sm">موعد آخر</button>
                      <button onClick={() => respondTrial(s._id, 'reject')} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm">اعتذار</button>
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
                        <div className="flex gap-2 flex-wrap">
                          <button onClick={() => setChatSession(s)} className="px-4 py-2 border border-emerald-200 text-emerald-700 rounded-lg text-sm">محادثة</button>
                          <button onClick={() => respondTrial(s._id, 'accept')} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm">قبول</button>
                          <button onClick={() => { setRescheduleModal(s); setRescheduleDate(''); }} className="px-4 py-2 bg-amber-100 text-amber-800 rounded-lg text-sm">موعد آخر</button>
                          <button onClick={() => respondTrial(s._id, 'reject')} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm">اعتذار</button>
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
                    <div className="flex gap-2 flex-wrap">
                      <button onClick={() => setChatSession(s)} className="px-4 py-2 border border-emerald-200 text-emerald-700 rounded-lg text-sm">محادثة</button>
                      {s.meetingLink && (
                        <>
                          <a href={s.meetingLink} target="_blank" rel="noreferrer"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">بدء</a>
                          <Link to={`/meeting/${s._id}`}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm">🌐 ترجمة</Link>
                        </>
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

      {chatSession && (
        <SessionChatModal
          session={chatSession}
          locale="ar"
          onClose={() => setChatSession(null)}
        />
      )}

      {rescheduleModal && (
        <Modal title={`اقتراح موعد جديد لـ ${rescheduleModal.student?.name || 'الطالب'}`} onClose={() => { setRescheduleModal(null); setRescheduleDate(''); }}>
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              الموعد الحالي: {new Date(rescheduleModal.scheduledAt).toLocaleString('ar-EG')}
            </p>
            <div>
              <label className="text-sm font-medium">الموعد المقترح</label>
              <input
                type="datetime-local"
                value={rescheduleDate}
                min={new Date(Date.now() + 30 * 60 * 1000).toISOString().slice(0, 16)}
                onChange={(event) => setRescheduleDate(event.target.value)}
                className="input-field w-full mt-1"
              />
            </div>
            <button type="button" onClick={submitReschedule} className="btn-primary w-full">
              إرسال الموعد الجديد للطالب
            </button>
          </div>
        </Modal>
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

      {aiModal && (
        <Modal title="مساعد المعلم — AI V4" onClose={() => setAiModal(false)}>
          <div className="space-y-3">
            <input className="input-field w-full" placeholder="موضوع الواجبات (مثلاً: الغنة)"
              value={aiTopic} onChange={(e) => setAiTopic(e.target.value)} />
            <button type="button" onClick={generateAiHomework} disabled={aiLoading} className="btn-primary w-full flex items-center justify-center gap-2">
              <Sparkles size={16} /> {aiLoading ? 'جاري التوليد...' : 'توليد 5 واجبات'}
            </button>
            {aiResult?.assignments?.map((a) => (
              <div key={a.id} className="border rounded-lg p-3 text-sm">
                <p className="font-bold">{a.title}</p>
                {a.description && <p className="text-gray-600 mt-1">{a.description}</p>}
              </div>
            ))}
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
