import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Users, BookOpen, Calendar, DollarSign, CheckCircle, XCircle, Eye,
  Mail, MessageSquare, Plus, Trash2, Upload, Video, Edit3, Send,
  TrendingUp, BriefcaseBusiness, MonitorPlay, AlertTriangle, ShieldCheck,
  Clock3, History, ChevronLeft, CreditCard, UserCheck,
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, Cell, PieChart, Pie, Legend } from 'recharts';
import DashboardLayout, { StatCard, TabBar } from '../../components/dashboard/DashboardLayout';
import { useRequireAuth } from '../../hooks/useRequireAuth';
import { useToast } from '../../context/ToastProvider';
import api from '../../lib/api';
import { uploadFileDirect } from '../../lib/fileUpload';
import TeacherReviewQueue from './TeacherReviewQueue';
import TeacherReviewDossier from './TeacherReviewDossier';
import AdminPeopleSearch from './AdminPeopleSearch';
import Student360Dossier from './Student360Dossier';
import Family360Dossier from './Family360Dossier';
import LaunchReadinessPanel from './LaunchReadinessPanel';

const STATUS_LABEL = { new: 'جديدة', read: 'مقروءة', replied: 'تم الرد', closed: 'مغلقة' };
const STATUS_COLOR = { new: 'bg-blue-100 text-blue-700', read: 'bg-gray-100', replied: 'bg-green-100 text-green-700', closed: 'bg-gray-200' };

function Empty({ text }) {
  return <p className="text-center text-gray-500 py-10">{text}</p>;
}

export default function AdminDashboard() {
  const { user, ready, logout } = useRequireAuth(['admin']);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const toast = useToast();
  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({});
  const [pending, setPending] = useState([]);
  const [approved, setApproved] = useState([]);
  const [messages, setMessages] = useState([]);
  const [courses, setCourses] = useState([]);
  const [blogPosts, setBlogPosts] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [lessons, setLessons] = useState([]);

  const [replyText, setReplyText] = useState({});
  const [teacherForm, setTeacherForm] = useState({ name: '', email: '', password: '', phone: '', country: 'مصر', city: 'القاهرة' });
  const [courseForm, setCourseForm] = useState({ titleAr: '', slug: '', instructorId: '', price: 0, descAr: '', programs: [] });
  const [lessonForm, setLessonForm] = useState({ titleAr: '', type: 'video', videoUrl: '', youtubeUrl: '', duration: 10 });
  const [blogForm, setBlogForm] = useState({ slug: '', titleAr: '', excerptAr: '', contentAr: '' });
  const [uploading, setUploading] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [growthSummary, setGrowthSummary] = useState({});
  const [donations, setDonations] = useState([]);
  const [applications, setApplications] = useState([]);
  const [videos, setVideos] = useState([]);
  const [videoForm, setVideoForm] = useState({ title: '', category: 'quran', videoUrl: '', duration: 600 });
  const [courseProgramFilter, setCourseProgramFilter] = useState('all');
  const [health, setHealth] = useState(null);
  const [commandCenter, setCommandCenter] = useState({ summary: {}, actions: [], recentTeachers: [], recentAudit: [] });
  const [auditEntries, setAuditEntries] = useState([]);
  const [teacherDossier, setTeacherDossier] = useState(null);
  const [teacherDossierLoading, setTeacherDossierLoading] = useState(false);
  const [studentDossier, setStudentDossier] = useState(null);
  const [studentDossierLoading, setStudentDossierLoading] = useState(false);
  const [familyDossier, setFamilyDossier] = useState(null);
  const [familyDossierLoading, setFamilyDossierLoading] = useState(false);

  const loadPendingTeachers = useCallback(async () => {
    const result = await api.get('/api/admin/teachers/pending', { auth: true });
    setPending(Array.isArray(result) ? result : (result.teachers || []));
  }, []);

  const loadCore = useCallback(async () => {
    const [statsResult, pendingResult, approvedResult, healthResult, commandResult] = await Promise.allSettled([
      api.get('/api/admin/stats', { auth: true }),
      api.get('/api/admin/teachers/pending', { auth: true }),
      api.get('/api/admin/teachers/approved', { auth: true }),
      api.get('/api/health'),
      api.get('/api/admin/command-center', { auth: true }),
    ]);

    if (statsResult.status === 'fulfilled') setStats(statsResult.value || {});
    if (pendingResult.status === 'fulfilled') {
      const value = pendingResult.value;
      setPending(Array.isArray(value) ? value : (value?.teachers || []));
    }
    if (approvedResult.status === 'fulfilled') {
      const value = approvedResult.value;
      setApproved(Array.isArray(value) ? value : (value?.teachers || []));
    }
    if (healthResult.status === 'fulfilled') setHealth(healthResult.value);
    if (commandResult.status === 'fulfilled') {
      setCommandCenter(commandResult.value || { summary: {}, actions: [], recentTeachers: [], recentAudit: [] });
    }

    if (pendingResult.status === 'rejected') {
      throw new Error('تعذر تحميل طلبات المعلمين المعلقة');
    }
  }, []);

  const loadMessages = useCallback(async () => {
    const r = await api.get('/api/contact', { auth: true });
    setMessages(r.messages || []);
  }, []);

  const loadCourses = useCallback(async () => {
    const r = await api.get('/api/admin/courses', { auth: true });
    setCourses(Array.isArray(r) ? r : []);
  }, []);

  const loadBlog = useCallback(async () => {
    const r = await api.get('/api/admin/blog', { auth: true });
    setBlogPosts(Array.isArray(r) ? r : []);
  }, []);

  const loadAudit = useCallback(async () => {
    const result = await api.get('/api/admin/audit?limit=150', { auth: true });
    setAuditEntries(result.entries || []);
  }, []);

  const loadWithdrawals = useCallback(async () => {
    const [ledgerResult, legacyResult] = await Promise.all([
      api.get('/api/finance/admin/payouts?status=all', { auth: true }),
      api.get('/api/admin/withdrawals?status=all', { auth: true }),
    ]);

    const ledger = (ledgerResult.payouts || []).map((item) => ({
      ...item,
      source: 'ledger',
      method: item.payoutMethod,
      accountInfo:
        item.payoutDetails?.ipaAddress
        || item.payoutDetails?.phone
        || [item.payoutDetails?.bankName, item.payoutDetails?.bankAccountNumber].filter(Boolean).join(' — ')
        || item.payoutDetails?.paypalEmail
        || '',
    }));

    const legacy = (legacyResult.withdrawals || []).map((item) => ({
      ...item,
      source: 'legacy',
    }));

    setWithdrawals([...ledger, ...legacy].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
  }, []);

  const loadGrowth = useCallback(async () => {
    const [sum, don, apps, vids] = await Promise.all([
      api.get('/api/admin/growth/summary', { auth: true }),
      api.get('/api/donations', { auth: true }),
      api.get('/api/careers/applications', { auth: true }),
      api.get('/api/videos?limit=50', { auth: true }),
    ]);
    setGrowthSummary(sum);
    setDonations(don.donations || []);
    setApplications(apps.applications || []);
    setVideos(vids.videos || []);
  }, []);

  const loadLessons = async (courseId) => {
    const r = await api.get(`/api/admin/courses/${courseId}/lessons`, { auth: true });
    setLessons(Array.isArray(r) ? r : []);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      if (['overview', 'teachers', 'courses'].includes(tab)) await loadCore();
      if (tab === 'messages') await loadMessages();
      if (tab === 'courses') await loadCourses();
      if (tab === 'blog') await loadBlog();
      if (tab === 'withdrawals') await loadWithdrawals();
      if (tab === 'growth') await loadGrowth();
      if (tab === 'audit') await loadAudit();
    } catch (e) {
      toast.error(e.message || 'تعذر تحميل البيانات');
    } finally {
      setLoading(false);
    }
  }, [tab, loadCore, loadMessages, loadCourses, loadBlog, loadWithdrawals, loadGrowth, loadAudit, toast]);

  useEffect(() => { if (ready) load(); }, [ready, load]);

  useEffect(() => {
    const requestedTab = searchParams.get('tab');
    const allowed = ['overview', 'messages', 'teachers', 'withdrawals', 'courses', 'blog', 'growth', 'audit'];
    if (requestedTab && allowed.includes(requestedTab)) {
      setTab(requestedTab);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!ready || !['overview', 'teachers'].includes(tab)) return undefined;

    const refreshQueue = () => {
      if (document.visibilityState === 'visible') {
        loadPendingTeachers().catch(() => {});
      }
    };

    const interval = window.setInterval(refreshQueue, 12000);
    const onFocus = () => refreshQueue();
    const onVisibility = () => refreshQueue();

    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [ready, tab, loadPendingTeachers]);

  useEffect(() => {
    if (!ready) return undefined;

    const onRealtimeNotification = (event) => {
      const actionUrl = String(event?.detail?.data?.actionUrl || '');
      if (actionUrl.includes('tab=teachers')) loadPendingTeachers().catch(() => {});
      if (actionUrl.includes('tab=withdrawals')) loadWithdrawals().catch(() => {});
    };

    window.addEventListener('wn:realtime-notification', onRealtimeNotification);
    return () => window.removeEventListener('wn:realtime-notification', onRealtimeNotification);
  }, [ready, loadPendingTeachers, loadWithdrawals]);

    if (!ready) return null;

  const review = async (id, action, note = '') => {
    let reviewNote = note;

    if (['request-changes', 'reject'].includes(action) && !reviewNote) {
      reviewNote = window.prompt(
        action === 'reject' ? 'اكتب سبب رفض الطلب:' : 'اكتب المطلوب من المعلم استكماله أو تعديله:',
        ''
      ) ?? '';
      if (!reviewNote.trim()) return;
    }

    try {
      await api.put(`/api/teachers/admin/${id}/review`, { action, note: reviewNote }, { auth: true });
      const labels = {
        approve: 'تم قبول المعلم وفتح الحساب',
        reject: 'تم رفض الطلب',
        'request-changes': 'تم إرسال طلب الاستكمال للمعلم',
      };
      toast.success(labels[action] || 'تم تحديث الطلب');
      setTeacherDossier(null);
      await loadCore();
    } catch (error) {
      toast.error(error.message || 'فشلت العملية');
    }
  };

  const openTeacherDossier = async (teacherId) => {
    setTeacherDossierLoading(true);
    setTeacherDossier({ teacher: { _id: teacherId } });
    try {
      const result = await api.get(`/api/teachers/admin/${teacherId}/review-dossier`, { auth: true });
      setTeacherDossier(result);
    } catch (error) {
      setTeacherDossier(null);
      toast.error(error.message || 'تعذر تحميل ملف المعلم الكامل');
    } finally {
      setTeacherDossierLoading(false);
    }
  };

  const updateTeacherChecklist = async (teacherId, key, status, note = '') => {
    try {
      await api.put(
        `/api/teachers/admin/${teacherId}/review-checklist/${key}`,
        { status, note },
        { auth: true }
      );
      toast.success(status === 'approved' ? 'تم اعتماد بند المراجعة' : 'تم تحديث بند المراجعة');
      await openTeacherDossier(teacherId);
      await loadPendingTeachers();
    } catch (error) {
      toast.error(error.message || 'تعذر تحديث قائمة المراجعة');
    }
  };

  const openStudentDossier = async (studentId) => {
    if (!studentId) return;
    setFamilyDossier(null);
    setStudentDossierLoading(true);
    setStudentDossier({ student: { _id: studentId } });
    try {
      const result = await api.get(`/api/admin/people/students/${studentId}`, { auth: true });
      setStudentDossier(result);
    } catch (error) {
      setStudentDossier(null);
      toast.error(error.message || 'تعذر تحميل ملف الطالب الكامل');
    } finally {
      setStudentDossierLoading(false);
    }
  };

  const openFamilyDossier = async (guardianId) => {
    if (!guardianId) return;
    setStudentDossier(null);
    setFamilyDossierLoading(true);
    setFamilyDossier({ guardian: { _id: guardianId } });
    try {
      const result = await api.get(`/api/admin/people/guardians/${guardianId}`, { auth: true });
      setFamilyDossier(result);
    } catch (error) {
      setFamilyDossier(null);
      toast.error(error.message || 'تعذر تحميل ملف الأسرة');
    } finally {
      setFamilyDossierLoading(false);
    }
  };

  const openStudentHomeworkAudio = async (taskId) => {
    try {
      const response = await api.request(
        `/api/homework/tasks/${taskId}/file?reason=student-360-review`,
        { auth: true, json: false, method: 'GET' }
      );
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank', 'noopener,noreferrer');
      window.setTimeout(() => URL.revokeObjectURL(url), 120000);
    } catch (error) {
      toast.error(error.message || 'تعذر فتح تسليم الطالب');
    }
  };

  const openTeacherDocument = async (teacherId, kind, index) => {
    try {
      const suffix = Number.isInteger(index) ? `/${index}` : '';
      const response = await api.request(
        `/api/teachers/admin/${teacherId}/document/${kind}${suffix}?reason=teacher-review`,
        { auth: true, json: false, method: 'GET' }
      );
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank', 'noopener,noreferrer');
      window.setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (error) {
      toast.error(error.message || 'تعذر فتح المستند');
    }
  };

  const openTeacherMedia = async (teacherId, kind, index) => {
    try {
      const suffix = Number.isInteger(index) ? `/${index}` : '';
      const response = await api.request(
        `/api/teachers/admin/${teacherId}/media/${kind}${suffix}?reason=teacher-review`,
        { auth: true, json: false, method: 'GET' }
      );
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank', 'noopener,noreferrer');
      window.setTimeout(() => URL.revokeObjectURL(url), 120000);
    } catch (error) {
      toast.error(error.message || 'تعذر فتح ملف المعلم');
    }
  };

  const sendReply = async (id) => {
    const reply = replyText[id];
    if (!reply?.trim()) return toast.error('اكتب الرد أولاً');
    try {
      await api.put(`/api/contact/${id}/reply`, { reply }, { auth: true });
      toast.success('تم إرسال الرد');
      setReplyText((p) => ({ ...p, [id]: '' }));
      loadMessages();
    } catch (e) { toast.error(e.message); }
  };

  const seedDemoCourse = async () => {
    setSeeding(true);
    try {
      const r = await api.post('/api/lms/seed-demo', {}, { auth: true });
      toast.success(r.message || 'تم إنشاء الدورة التجريبية');
      await loadCourses();
    } catch (e) {
      toast.error(e.message || 'فشل إنشاء الدورة');
    } finally {
      setSeeding(false);
    }
  };

  const addTeacher = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/admin/teachers', { ...teacherForm, autoApprove: false }, { auth: true });
      toast.success('تم إنشاء ملف المعلم وإرساله إلى مركز المراجعة');
      setTeacherForm({ name: '', email: '', password: '', phone: '', country: 'مصر', city: 'القاهرة' });
      load();
    } catch (e) { toast.error(e.message); }
  };

  const addCourse = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/admin/courses', courseForm, { auth: true });
      toast.success('تم إنشاء الدورة');
      setCourseForm({ titleAr: '', slug: '', instructorId: '', price: 0, descAr: '', programs: [] });
      loadCourses();
    } catch (e) { toast.error(e.message); }
  };

  const addLesson = async (e) => {
    e.preventDefault();
    if (!selectedCourse) return;
    try {
      await api.post(`/api/admin/courses/${selectedCourse}/lessons`, lessonForm, { auth: true });
      toast.success('تم إضافة الدرس');
      setLessonForm({ titleAr: '', type: 'video', videoUrl: '', youtubeUrl: '', duration: 10 });
      loadLessons(selectedCourse);
    } catch (e) { toast.error(e.message); }
  };

  const uploadVideo = async (e, lessonField = 'videoUrl') => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const storageFile = await uploadFileDirect(file, 'course-media');
      const r = await api.post('/api/admin/upload', { storageFile }, { auth: true });
      setLessonForm((p) => ({ ...p, [lessonField]: r.url }));
      toast.success('تم رفع الفيديو');
    } catch (err) { toast.error(err.message); }
    finally { setUploading(false); }
  };

  const addBlog = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/admin/blog', blogForm, { auth: true });
      toast.success('تم نشر المقال');
      setBlogForm({ slug: '', titleAr: '', excerptAr: '', contentAr: '' });
      loadBlog();
    } catch (e) { toast.error(e.message); }
  };

  const reviewWithdraw = async (withdrawal, action) => {
    try {
      if (withdrawal.source === 'ledger') {
        await api.put(`/api/finance/admin/payouts/${withdrawal._id}/process`, {
          action,
        }, { auth: true });
      } else {
        await api.patch(`/api/admin/withdrawals/${withdrawal._id}`, { action }, { auth: true });
      }
      toast.success(action === 'approve' ? 'تم اعتماد تحويل المبلغ' : 'تم رفض الطلب');
      loadWithdrawals();
    } catch (e) { toast.error(e.message); }
  };

  const deleteItem = async (type, id) => {
    if (!confirm('هل أنت متأكد؟')) return;
    const paths = { course: `/api/admin/courses/${id}`, lesson: `/api/admin/lessons/${id}`, blog: `/api/admin/blog/${id}`, message: `/api/contact/${id}` };
    try {
      await api.delete(paths[type], { auth: true });
      toast.success('تم الحذف');
      if (type === 'lesson') loadLessons(selectedCourse);
      else load();
    } catch (e) { toast.error(e.message); }
  };

  const tabs = [
    { id: 'overview', label: 'نظرة عامة' },
    { id: 'messages', label: `الرسائل (${messages.filter(m => m.status === 'new').length || '…'})` },
    { id: 'teachers', label: `المعلمون (${pending.length})` },
    { id: 'withdrawals', label: `السحوبات (${withdrawals.filter(w => ['pending', 'processing'].includes(w.status)).length || '…'})` },
    { id: 'courses', label: 'الدورات' },
    { id: 'blog', label: 'المدونة' },
    { id: 'growth', label: 'التحليلات والنمو' },
    { id: 'audit', label: 'سجل الإدارة' },
  ];

  const COLORS = ['#f43f5e', '#3b82f6', '#8b5cf6', '#10b981'];

  const donationPieData = Object.entries(growthSummary.donationsByCategory || {}).map(([name, value]) => ({
    name: name === 'student' ? 'كفالة طالب' : name === 'teacher' ? 'كفالة معلم' : name === 'halaqa' ? 'كفالة حلقة' : 'تبرع عام',
    value
  }));

  const regsData = (growthSummary.monthlyRegs || []).map(r => ({
    name: r.month,
    'الطلاب': r.count
  }));

  const enrollmentsData = (growthSummary.enrollmentsByCourse || []).map(e => ({
    name: e.name.length > 20 ? e.name.slice(0, 20) + '...' : e.name,
    'الاشتراكات': e.count
  }));

  return (
    <DashboardLayout title="لوحة تحكم الإدارة" user={user} onLogout={logout}>
      <AdminPeopleSearch
        onOpenStudent={openStudentDossier}
        onOpenGuardian={openFamilyDossier}
        onOpenTeacher={openTeacherDossier}
        onOpenPayments={() => navigate('payments')}
      />
      <TabBar tabs={tabs} active={tab} onChange={setTab} />

      {loading && tab !== 'overview' ? (
        <div className="flex justify-center py-20"><div className="spinner spinner-lg" /></div>
      ) : (
        <>
          {tab === 'overview' && (
            <>
              <section className="wn-admin-command-center">
                <div className="wn-admin-command-center__heading">
                  <div>
                    <span>Admin Command Center</span>
                    <h2>ماذا يحتاج تدخل الإدارة الآن؟</h2>
                    <p>الأولوية للقرارات التشغيلية، ثم الإحصائيات.</p>
                  </div>
                  <div className="wn-admin-command-center__score">
                    <strong>{commandCenter.summary?.totalPendingActions || 0}</strong>
                    <small>إجراء معلق</small>
                  </div>
                </div>

                <div className="wn-admin-command-center__actions">
                  {(commandCenter.actions || []).map((item) => {
                    const Icon = item.id === 'teacher-review'
                      ? UserCheck
                      : item.id === 'manual-payments'
                        ? CreditCard
                        : item.id === 'overdue-sessions'
                          ? Clock3
                          : item.severity === 'high'
                            ? AlertTriangle
                            : ShieldCheck;
                    return (
                      <button
                        type="button"
                        key={item.id}
                        className={`is-${item.severity || 'info'}`}
                        onClick={() => {
                          if (item.actionUrl === '/admin/payments') navigate('payments');
                          else {
                            const match = item.actionUrl?.match(/tab=([^&]+)/);
                            if (match?.[1]) setTab(match[1]);
                          }
                        }}
                      >
                        <span><Icon size={18} /></span>
                        <span><strong>{item.label}</strong><small>{item.count ? 'يحتاج متابعة' : 'لا يوجد إجراء'}</small></span>
                        <b>{item.count || 0}</b>
                        <ChevronLeft size={15} />
                      </button>
                    );
                  })}
                </div>
              </section>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <StatCard label="الطلاب" value={stats.totalStudents || 0} icon={Users} />
                <StatCard label="المعلمون" value={stats.totalTeachers || 0} icon={BookOpen} color="blue" />
                <StatCard label="الحصص" value={stats.totalSessions || 0} icon={Calendar} color="purple" />
                <StatCard label="الأرباح" value={`${stats.totalEarnings || 0} ج.م`} icon={DollarSign} color="yellow" />
              </div>
              <LaunchReadinessPanel />

              {health && (
                <div className="bg-slate-900 text-white rounded-xl p-5 mb-6">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                    <h3 className="font-bold flex items-center gap-2"><MonitorPlay size={18} /> صحة النظام v{health.version}</h3>
                    <a href="https://wahy-wa-namaa-api.vercel.app/api/health" target="_blank" rel="noreferrer" className="text-xs text-emerald-300 hover:underline">فتح API health ↗</a>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {Object.entries(health.features || {}).map(([k, v]) => (
                      <span key={k} className={`px-2 py-1 rounded-full ${v ? 'bg-emerald-500/20 text-emerald-200' : 'bg-red-500/20 text-red-200'}`}>{k}: {v ? '✓' : '✗'}</span>
                    ))}
                  </div>
                </div>
              )}
              <div className="wn-dashboard-surface mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold flex items-center gap-2"><DollarSign size={18} /> مراجعة مدفوعات الطلاب</h3>
                  <p className="text-sm text-gray-500 mt-1">راجع تحويلات InstaPay وVodafone Cash ثم فعّل الاشتراك بعد التأكد من وصول المبلغ.</p>
                </div>
                <button onClick={() => navigate('payments')} className="wn-btn wn-btn--primary">فتح مراجعة المدفوعات</button>
              </div>

              <TeacherReviewQueue
                teachers={pending}
                loading={loading}
                onRefresh={loadPendingTeachers}
                onOpenDossier={openTeacherDossier}
                compact
              />
            </>
          )}

          {tab === 'messages' && (
            <div className="space-y-4">
              {messages.length === 0 ? <Empty text="لا رسائل" /> : messages.map((m) => (
                <div key={m._id} className="wn-dashboard-surface">
                  <div className="flex justify-between items-start gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Mail size={16} className="text-emerald-600" />
                        <span className="font-bold">{m.name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLOR[m.status]}`}>{STATUS_LABEL[m.status]}</span>
                      </div>
                      <p className="text-sm text-gray-500">{m.email} {m.phone && `— ${m.phone}`}</p>
                      <p className="font-semibold mt-2">{m.subject}</p>
                      <p className="text-gray-700 mt-1 whitespace-pre-wrap">{m.message}</p>
                      {m.adminReply && (
                        <div className="mt-3 p-3 bg-emerald-50 rounded-lg text-sm">
                          <strong>ردك:</strong> {m.adminReply}
                        </div>
                      )}
                    </div>
                    <button onClick={() => deleteItem('message', m._id)} className="text-red-500 p-1"><Trash2 size={16} /></button>
                  </div>
                  {m.status !== 'replied' && (
                    <div className="flex gap-2 mt-3">
                      <input
                        value={replyText[m._id] || ''}
                        onChange={(e) => setReplyText((p) => ({ ...p, [m._id]: e.target.value }))}
                        placeholder="اكتب ردك..."
                        className="flex-1 border rounded-lg px-3 py-2 text-sm"
                      />
                      <button onClick={() => sendReply(m._id)} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm flex items-center gap-1">
                        <Send size={14} /> رد
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {tab === 'teachers' && (
            <div className="space-y-6">
              <TeacherReviewQueue
                teachers={pending}
                loading={loading}
                onRefresh={loadPendingTeachers}
                onOpenDossier={openTeacherDossier}
              />

              <div className="grid lg:grid-cols-2 gap-6">
              <form onSubmit={addTeacher} className="wn-dashboard-surface space-y-3">
                <h3 className="font-bold flex items-center gap-2"><Plus size={18} /> إضافة معلم جديد</h3>
                {['name', 'email', 'password', 'phone'].map((f) => (
                  <input key={f} required={f !== 'phone'} type={f === 'password' ? 'password' : f === 'email' ? 'email' : 'text'}
                    placeholder={{ name: 'الاسم', email: 'البريد', password: 'كلمة المرور', phone: 'الهاتف' }[f]}
                    value={teacherForm[f]} onChange={(e) => setTeacherForm((p) => ({ ...p, [f]: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm" />
                ))}
                <div className="grid grid-cols-2 gap-2">
                  <input placeholder="الدولة" value={teacherForm.country} onChange={(e) => setTeacherForm((p) => ({ ...p, country: e.target.value }))} className="border rounded-lg px-3 py-2 text-sm" />
                  <input placeholder="المدينة" value={teacherForm.city} onChange={(e) => setTeacherForm((p) => ({ ...p, city: e.target.value }))} className="border rounded-lg px-3 py-2 text-sm" />
                </div>
                <button type="submit" className="w-full py-2 bg-emerald-600 text-white rounded-lg text-sm">إنشاء ملف للمراجعة</button>
              </form>
              <div className="wn-dashboard-surface">
                <h3 className="font-bold mb-4">المعلمون المعتمدون ({approved.length})</h3>
                {approved.length === 0 ? <Empty text="لا معلمين" /> : approved.map((t) => (
                  <div key={t._id} className="border rounded-lg p-3 mb-2 flex justify-between items-center">
                    <div>
                      <p className="font-semibold">{t.user?.name || t.personalInfo?.fullName}</p>
                      <p className="text-xs text-gray-500">{t.personalInfo?.country} — {t.hourlyRate} ج.م/س</p>
                    </div>
                    <button onClick={() => navigate(`/teachers/${t._id}`)} className="text-emerald-600 text-sm">عرض</button>
                  </div>
                ))}
              </div>
              </div>
            </div>
          )}

          {tab === 'audit' && (
            <section className="wn-dashboard-surface">
              <div className="flex items-start justify-between gap-3 mb-5">
                <div>
                  <h3 className="font-bold flex items-center gap-2"><History size={18} /> سجل الإدارة</h3>
                  <p className="text-xs text-slate-500 mt-1">يسجل القرارات والوصول إلى المستندات والوسائط الحساسة.</p>
                </div>
                <button type="button" onClick={loadAudit} className="wn-btn">تحديث</button>
              </div>

              {auditEntries.length === 0 ? <Empty text="لا توجد أحداث إدارية مسجلة" /> : (
                <div className="wn-admin-audit-list">
                  {auditEntries.map((entry) => (
                    <div key={entry._id}>
                      <span>
                        <strong>{entry.actor?.name || 'الإدارة'}</strong>
                        <small>{new Date(entry.createdAt).toLocaleString('ar-EG')}</small>
                      </span>
                      <span>
                        <strong>{entry.action}</strong>
                        <small>{entry.entityType} · {entry.entityId}</small>
                      </span>
                      <span>
                        <strong>{entry.reason || 'بدون ملاحظة'}</strong>
                        <small>{entry.request?.path || ''}</small>
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {tab === 'courses' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-l from-emerald-50 to-white border border-emerald-100 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-emerald-900">دورة LMS تجريبية</h3>
                  <p className="text-sm text-slate-600 mt-1">إنشاء دورة «تحفيظ القرآن للمبتدئين» مع دروس واختبار — كما في README</p>
                </div>
                <button type="button" onClick={seedDemoCourse} disabled={seeding}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm disabled:opacity-60">
                  {seeding ? 'جاري الإنشاء...' : 'إنشاء دورة تجريبية'}
                </button>
              </div>
              <form onSubmit={addCourse} className="wn-dashboard-surface grid md:grid-cols-2 gap-3">
                <h3 className="font-bold md:col-span-2 flex items-center gap-2"><BookOpen size={18} /> دورة جديدة</h3>
                <input required placeholder="عنوان الدورة (عربي)" value={courseForm.titleAr} onChange={(e) => setCourseForm((p) => ({ ...p, titleAr: e.target.value }))} className="border rounded-lg px-3 py-2 text-sm" />
                <input required placeholder="slug (مثال: quran-kids)" value={courseForm.slug} onChange={(e) => setCourseForm((p) => ({ ...p, slug: e.target.value }))} className="border rounded-lg px-3 py-2 text-sm" />
                <select required value={courseForm.instructorId} onChange={(e) => setCourseForm((p) => ({ ...p, instructorId: e.target.value }))} className="border rounded-lg px-3 py-2 text-sm">
                  <option value="">اختر المعلم</option>
                  {approved.map((t) => <option key={t._id} value={t._id}>{t.user?.name || t.personalInfo?.fullName}</option>)}
                </select>
                <input type="number" placeholder="السعر" value={courseForm.price} onChange={(e) => setCourseForm((p) => ({ ...p, price: Number(e.target.value) }))} className="border rounded-lg px-3 py-2 text-sm" />
                <textarea placeholder="وصف الدورة" value={courseForm.descAr} onChange={(e) => setCourseForm((p) => ({ ...p, descAr: e.target.value }))} className="md:col-span-2 border rounded-lg px-3 py-2 text-sm" rows={2} />
                <div className="md:col-span-2 flex flex-wrap gap-3">
                  {['kids', 'reverts', 'women', 'general'].map((prog) => (
                    <label key={prog} className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={courseForm.programs.includes(prog)}
                        onChange={(e) => setCourseForm((p) => ({
                          ...p,
                          programs: e.target.checked ? [...p.programs, prog] : p.programs.filter((x) => x !== prog),
                        }))} />
                      {prog}
                    </label>
                  ))}
                </div>
                <button type="submit" className="md:col-span-2 py-2 bg-indigo-600 text-white rounded-lg text-sm">إنشاء الدورة</button>
              </form>

              <div className="grid lg:grid-cols-2 gap-6">
                <div className="wn-dashboard-surface">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                    <h3 className="font-bold">الدورات ({courses.filter((c) => courseProgramFilter === 'all' || (c.programs || []).includes(courseProgramFilter)).length})</h3>
                    <select value={courseProgramFilter} onChange={(e) => setCourseProgramFilter(e.target.value)} className="border rounded-lg px-2 py-1 text-sm">
                      <option value="all">كل البرامج</option>
                      {['kids', 'reverts', 'women', 'general'].map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  {courses.length === 0 ? <Empty text="لا دورات" /> : courses.filter((c) => courseProgramFilter === 'all' || (c.programs || []).includes(courseProgramFilter)).map((c) => (
                    <div key={c._id} className={`border rounded-lg p-3 mb-2 cursor-pointer transition ${selectedCourse === c._id ? 'border-emerald-500 bg-emerald-50' : ''}`}
                      onClick={() => { setSelectedCourse(c._id); loadLessons(c._id); }}>
                      <div className="flex justify-between">
                        <div>
                          <p className="font-semibold">{c.title?.ar}</p>
                          <p className="text-xs text-gray-500">{c.slug} — {c.status} — {c.price}$ {(c.programs || []).length ? `[${c.programs.join(',')}]` : ''}</p>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); deleteItem('course', c._id); }} className="text-red-500"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  ))}
                </div>

                {selectedCourse && (
                  <div className="wn-dashboard-surface">
                    <h3 className="font-bold mb-4 flex items-center gap-2"><Video size={18} /> دروس الدورة</h3>
                    <form onSubmit={addLesson} className="space-y-2 mb-4 p-3 bg-gray-50 rounded-lg">
                      <input required placeholder="عنوان الدرس" value={lessonForm.titleAr} onChange={(e) => setLessonForm((p) => ({ ...p, titleAr: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm" />
                      <select value={lessonForm.type} onChange={(e) => setLessonForm((p) => ({ ...p, type: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm">
                        <option value="video">فيديو</option>
                        <option value="text">نص</option>
                      </select>
                      {lessonForm.type === 'video' && (
                        <>
                          <input placeholder="رابط YouTube (embed)" value={lessonForm.youtubeUrl} onChange={(e) => setLessonForm((p) => ({ ...p, youtubeUrl: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm" />
                          <div className="flex gap-2 items-center">
                            <label className="flex-1 flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer text-sm bg-white hover:bg-gray-50">
                              <Upload size={16} /> {uploading ? 'جاري الرفع...' : 'رفع فيديو'}
                              <input type="file" accept="video/*" className="hidden" onChange={uploadVideo} disabled={uploading} />
                            </label>
                            {lessonForm.videoUrl && <span className="text-xs text-green-600 truncate max-w-[120px]">✓ مرفوع</span>}
                          </div>
                        </>
                      )}
                      <button type="submit" className="w-full py-2 bg-emerald-600 text-white rounded-lg text-sm">+ إضافة درس</button>
                    </form>
                    {lessons.map((l) => (
                      <div key={l._id} className="border rounded p-2 mb-2 flex justify-between text-sm">
                        <span>{l.order}. {l.title?.ar} ({l.type})</span>
                        <button onClick={() => deleteItem('lesson', l._id)} className="text-red-500"><Trash2 size={14} /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === 'blog' && (
            <div className="grid lg:grid-cols-2 gap-6">
              <form onSubmit={addBlog} className="wn-dashboard-surface space-y-3">
                <h3 className="font-bold flex items-center gap-2"><Edit3 size={18} /> مقال جديد</h3>
                <input required placeholder="slug" value={blogForm.slug} onChange={(e) => setBlogForm((p) => ({ ...p, slug: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm" />
                <input required placeholder="العنوان" value={blogForm.titleAr} onChange={(e) => setBlogForm((p) => ({ ...p, titleAr: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm" />
                <input placeholder="مقتطف" value={blogForm.excerptAr} onChange={(e) => setBlogForm((p) => ({ ...p, excerptAr: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm" />
                <textarea required placeholder="المحتوى" rows={6} value={blogForm.contentAr} onChange={(e) => setBlogForm((p) => ({ ...p, contentAr: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm" />
                <button type="submit" className="w-full py-2 bg-emerald-600 text-white rounded-lg text-sm">نشر</button>
              </form>
              <div className="wn-dashboard-surface">
                <h3 className="font-bold mb-4 flex items-center gap-2"><MessageSquare size={18} /> المقالات ({blogPosts.length})</h3>
                {blogPosts.length === 0 ? <Empty text="لا مقالات" /> : blogPosts.map((p) => (
                  <div key={p._id} className="border rounded-lg p-3 mb-2 flex justify-between">
                    <div>
                      <p className="font-semibold">{p.title?.ar}</p>
                      <p className="text-xs text-gray-500">{p.slug} — {p.status}</p>
                    </div>
                    <button onClick={() => deleteItem('blog', p._id)} className="text-red-500"><Trash2 size={16} /></button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'withdrawals' && (
            <div className="space-y-3">
              {withdrawals.length === 0 ? <Empty text="لا طلبات سحب" /> : withdrawals.map((w) => (
                <div key={w._id} className="wn-dashboard-surface flex flex-wrap justify-between items-center gap-4">
                  <div>
                    <p className="font-bold">{w.teacher?.user?.name || w.teacher?.personalInfo?.fullName || 'معلم'}</p>
                    <p className="text-sm text-gray-500">{w.teacher?.user?.email}</p>
                    <p className="text-lg font-bold text-emerald-700 mt-1">{w.amount} {w.currency || 'EGP'} — {w.method}</p>
                    <p className="text-[11px] text-slate-400">{w.source === 'ledger' ? 'السجل المالي الموحد' : 'طلب قديم قيد الترحيل'}</p>
                    <p className="text-sm text-gray-600">{w.accountInfo}</p>
                    <p className="text-xs text-gray-400 mt-1">{new Date(w.createdAt).toLocaleString('ar-EG')}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded ${
                      ['approved', 'completed'].includes(w.status) ? 'bg-green-100 text-green-700'
                        : w.status === 'rejected' ? 'bg-red-100 text-red-700'
                        : w.status === 'processing' ? 'bg-blue-100 text-blue-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {['approved', 'completed'].includes(w.status)
                        ? 'تم التحويل'
                        : w.status === 'rejected'
                          ? 'مرفوض'
                          : w.status === 'processing'
                            ? 'جاري التحويل'
                            : 'قيد المراجعة'}
                    </span>
                    {w.status === 'pending' && (
                      <>
                        <button onClick={() => reviewWithdraw(w, 'approve')} className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm">موافقة</button>
                        <button onClick={() => reviewWithdraw(w, 'reject')} className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm">رفض</button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'growth' && (
            <div className="space-y-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard label="تبرعات" value={growthSummary.donations?.pledged?.count || 0} icon={TrendingUp} color="orange" />
                <StatCard label="طلبات توظيف" value={growthSummary.newApplications || 0} icon={BriefcaseBusiness} color="blue" />
                <StatCard label="فيديوهات" value={growthSummary.publishedVideos || 0} icon={MonitorPlay} color="purple" />
                <StatCard label="إحالات" value={growthSummary.totalReferrals || 0} icon={Users} color="emerald" />
              </div>

              {/* Visual Analytics Charts */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 my-6">
                
                {/* Monthly Registrations Area Chart */}
                <div className="bg-white p-6 rounded-2xl border shadow-sm flex flex-col text-right-rtl">
                  <h4 className="font-bold text-gray-800 mb-4 text-right">نمو تسجيل الطلاب (آخر 6 أشهر)</h4>
                  <div className="h-64 w-full">
                    {regsData.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-gray-400 text-sm">لا بيانات كافية للرسم البياني</div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={regsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorRegs" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} />
                          <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} />
                          <Tooltip contentStyle={{ background: '#0f172a', color: '#fff', borderRadius: '12px', border: 'none' }} />
                          <Area type="monotone" dataKey="الطلاب" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorRegs)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

                {/* Course Enrollments Bar Chart */}
                <div className="bg-white p-6 rounded-2xl border shadow-sm flex flex-col text-right-rtl">
                  <h4 className="font-bold text-gray-800 mb-4 text-right">توزيع الاشتراكات حسب الدورة</h4>
                  <div className="h-64 w-full">
                    {enrollmentsData.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-gray-400 text-sm">لا اشتراكات نشطة حالياً</div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={enrollmentsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="name" tick={{ fontSize: 8, fill: '#64748b' }} axisLine={false} />
                          <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} />
                          <Tooltip contentStyle={{ background: '#0f172a', color: '#fff', borderRadius: '12px', border: 'none' }} />
                          <Bar dataKey="الاشتراكات" fill="#8b5cf6" radius={[4, 4, 0, 0]}>
                            {enrollmentsData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

                {/* Donation Categories Donut Chart */}
                <div className="bg-white p-6 rounded-2xl border shadow-sm flex flex-col text-right-rtl">
                  <h4 className="font-bold text-gray-800 mb-4 text-right">حصص فئات التبرعات (نسب مئوية)</h4>
                  <div className="h-64 w-full relative">
                    {donationPieData.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-gray-400 text-sm">لا تبرعات مسجلة بعد</div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={donationPieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                            {donationPieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ background: '#0f172a', color: '#fff', borderRadius: '12px', border: 'none' }} />
                          <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

              </div>

              <div className="wn-dashboard-surface">
                <h3 className="font-bold mb-4">التبرعات ({donations.length})</h3>
                {donations.length === 0 ? <Empty text="لا تبرعات" /> : donations.slice(0, 10).map((d) => (
                  <div key={d._id} className="flex flex-wrap justify-between items-center border rounded-lg p-3 mb-2 gap-2">
                    <div>
                      <p className="font-semibold">{d.isAnonymous ? 'متبرع مجهول' : d.name}</p>
                      <p className="text-xs text-gray-500">{d.amount} {d.currency} — {d.category}</p>
                    </div>
                    <select value={d.status} onChange={async (e) => {
                      await api.put(`/api/donations/${d._id}/status`, { status: e.target.value }, { auth: true });
                      loadGrowth();
                    }} className="text-sm border rounded-lg px-2 py-1">
                      {['pledged', 'confirmed', 'cancelled'].map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                ))}
              </div>

              <div className="wn-dashboard-surface">
                <h3 className="font-bold mb-4">طلبات التوظيف ({applications.length})</h3>
                {applications.length === 0 ? <Empty text="لا طلبات" /> : applications.slice(0, 10).map((a) => (
                  <div key={a._id} className="flex flex-wrap justify-between items-center border rounded-lg p-3 mb-2 gap-2">
                    <div>
                      <p className="font-semibold">{a.name}</p>
                      <p className="text-xs text-gray-500">{a.position} — {a.email}</p>
                    </div>
                    <select value={a.status} onChange={async (e) => {
                      await api.put(`/api/careers/applications/${a._id}/status`, { status: e.target.value }, { auth: true });
                      loadGrowth();
                    }} className="text-sm border rounded-lg px-2 py-1">
                      {['new', 'reviewing', 'interview', 'hired', 'rejected'].map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                ))}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    await api.post('/api/videos', videoForm, { auth: true });
                    toast.success('تم إضافة الفيديو');
                    setVideoForm({ title: '', category: 'quran', videoUrl: '', duration: 600 });
                    loadGrowth();
                  } catch (err) { toast.error(err.message); }
                }} className="wn-dashboard-surface space-y-3">
                  <h3 className="font-bold">فيديو جديد</h3>
                  <input required placeholder="العنوان" className="w-full border rounded-lg px-3 py-2 text-sm" value={videoForm.title} onChange={(e) => setVideoForm((p) => ({ ...p, title: e.target.value }))} />
                  <input required placeholder="رابط YouTube embed" className="w-full border rounded-lg px-3 py-2 text-sm" value={videoForm.videoUrl} onChange={(e) => setVideoForm((p) => ({ ...p, videoUrl: e.target.value }))} />
                  <select className="w-full border rounded-lg px-3 py-2 text-sm" value={videoForm.category} onChange={(e) => setVideoForm((p) => ({ ...p, category: e.target.value }))}>
                    {['quran', 'tajweed', 'arabic', 'seerah', 'kids'].map((c) => <option key={c}>{c}</option>)}
                  </select>
                  <button type="submit" className="w-full py-2 bg-emerald-600 text-white rounded-lg text-sm">إضافة</button>
                </form>
                <div className="wn-dashboard-surface">
                  <h3 className="font-bold mb-4">المكتبة ({videos.length})</h3>
                  {videos.slice(0, 8).map((v) => (
                    <div key={v._id} className="flex justify-between items-center border rounded-lg p-2 mb-2 text-sm">
                      <span>{v.title}</span>
                      <button type="button" onClick={async () => { await api.delete(`/api/videos/${v._id}`, { auth: true }); loadGrowth(); }} className="text-red-500"><Trash2 size={14} /></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
      {teacherDossier && (
        <TeacherReviewDossier
          dossier={teacherDossier}
          loading={teacherDossierLoading}
          onClose={() => setTeacherDossier(null)}
          onChecklist={updateTeacherChecklist}
          onReview={review}
          onOpenDocument={openTeacherDocument}
          onOpenMedia={openTeacherMedia}
        />
      )}

      {studentDossier && (
        <Student360Dossier
          dossier={studentDossier}
          loading={studentDossierLoading}
          onClose={() => setStudentDossier(null)}
          onOpenGuardian={openFamilyDossier}
          onOpenTeacher={openTeacherDossier}
          onOpenHomeworkAudio={openStudentHomeworkAudio}
        />
      )}

      {familyDossier && (
        <Family360Dossier
          dossier={familyDossier}
          loading={familyDossierLoading}
          onClose={() => setFamilyDossier(null)}
          onOpenStudent={openStudentDossier}
        />
      )}
    </DashboardLayout>
  );
}
