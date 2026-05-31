import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, BookOpen, Calendar, DollarSign, CheckCircle, XCircle, Eye,
  Mail, MessageSquare, Plus, Trash2, Upload, Video, Edit3, Send,
  TrendingUp, BriefcaseBusiness, MonitorPlay,
} from 'lucide-react';
import DashboardLayout, { StatCard, TabBar } from '../../components/dashboard/DashboardLayout';
import { useRequireAuth } from '../../hooks/useRequireAuth';
import { useToast } from '../../context/ToastProvider';
import api from '../../lib/api';

const STATUS_LABEL = { new: 'جديدة', read: 'مقروءة', replied: 'تم الرد', closed: 'مغلقة' };
const STATUS_COLOR = { new: 'bg-blue-100 text-blue-700', read: 'bg-gray-100', replied: 'bg-green-100 text-green-700', closed: 'bg-gray-200' };

function Empty({ text }) {
  return <p className="text-center text-gray-500 py-10">{text}</p>;
}

export default function AdminDashboard() {
  const { user, ready, logout } = useRequireAuth(['admin']);
  const navigate = useNavigate();
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

  const loadCore = useCallback(async () => {
    const [st, pend, appr, h] = await Promise.all([
      api.get('/api/admin/stats', { auth: true }),
      api.get('/api/teachers/admin/pending', { auth: true }),
      api.get('/api/admin/teachers/approved', { auth: true }),
      api.get('/api/health').catch(() => null),
    ]);
    setStats(st);
    setPending(Array.isArray(pend) ? pend : []);
    setApproved(Array.isArray(appr) ? appr : []);
    setHealth(h);
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

  const loadWithdrawals = useCallback(async () => {
    const r = await api.get('/api/admin/withdrawals?status=all', { auth: true });
    setWithdrawals(r.withdrawals || []);
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

  const load = async () => {
    setLoading(true);
    try {
      if (['overview', 'teachers', 'courses'].includes(tab)) await loadCore();
      if (tab === 'messages') await loadMessages();
      if (tab === 'courses') await loadCourses();
      if (tab === 'blog') await loadBlog();
      if (tab === 'withdrawals') await loadWithdrawals();
      if (tab === 'growth') await loadGrowth();
    } catch (e) {
      toast.error(e.message || 'تعذر تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (ready) load(); }, [ready, tab]);

  if (!ready) return null;

  const review = async (id, action, note = '') => {
    try {
      await api.put(`/api/teachers/admin/${id}/review`, { action, note }, { auth: true });
      toast.success(action === 'approve' ? 'تم قبول المعلم' : 'تم الرفض');
      load();
    } catch { toast.error('فشلت العملية'); }
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
      await api.post('/api/admin/teachers', { ...teacherForm, autoApprove: true }, { auth: true });
      toast.success('تم إضافة الشيخ');
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
      const fd = new FormData();
      fd.append('file', file);
      const r = await api.post('/api/admin/upload', fd, { auth: true });
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

  const reviewWithdraw = async (id, action) => {
    try {
      await api.patch(`/api/admin/withdrawals/${id}`, { action }, { auth: true });
      toast.success(action === 'approve' ? 'تم تحويل المبلغ' : 'تم رفض الطلب');
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
    { id: 'teachers', label: 'المعلمون' },
    { id: 'withdrawals', label: `السحوبات (${withdrawals.filter(w => w.status === 'pending').length || '…'})` },
    { id: 'courses', label: 'الدورات' },
    { id: 'blog', label: 'المدونة' },
    { id: 'growth', label: 'النمو V4' },
  ];

  return (
    <DashboardLayout title="لوحة تحكم الإدارة" user={user} onLogout={logout}>
      <TabBar tabs={tabs} active={tab} onChange={setTab} />

      {loading && tab !== 'overview' ? (
        <div className="flex justify-center py-20"><div className="spinner spinner-lg" /></div>
      ) : (
        <>
          {tab === 'overview' && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <StatCard label="الطلاب" value={stats.totalStudents || 0} icon={Users} />
                <StatCard label="المعلمون" value={stats.totalTeachers || 0} icon={BookOpen} color="blue" />
                <StatCard label="الحصص" value={stats.totalSessions || 0} icon={Calendar} color="purple" />
                <StatCard label="الأرباح" value={`${stats.totalEarnings || 0} ج.م`} icon={DollarSign} color="yellow" />
              </div>
              {health && (
                <div className="bg-slate-900 text-white rounded-xl p-5 mb-6">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                    <h3 className="font-bold flex items-center gap-2"><MonitorPlay size={18} /> صحة النظام v{health.version}</h3>
                    <a href="https://al-athar-api.azurewebsites.net/api/health" target="_blank" rel="noreferrer" className="text-xs text-emerald-300 hover:underline">فتح API health ↗</a>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {Object.entries(health.features || {}).map(([k, v]) => (
                      <span key={k} className={`px-2 py-1 rounded-full ${v ? 'bg-emerald-500/20 text-emerald-200' : 'bg-red-500/20 text-red-200'}`}>{k}: {v ? '✓' : '✗'}</span>
                    ))}
                  </div>
                </div>
              )}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="font-bold mb-4">معلمون قيد المراجعة ({pending.length})</h3>
                {pending.length === 0 ? <Empty text="لا طلبات جديدة" /> : pending.map((t) => (
                  <div key={t._id} className="border rounded-lg p-4 mb-3 flex justify-between items-start gap-4">
                    <div>
                      <h4 className="font-bold">{t.user?.name || t.personalInfo?.fullName}</h4>
                      <p className="text-sm text-gray-500">{t.personalInfo?.country} — {t.personalInfo?.phone}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => navigate(`/teachers/${t._id}`)} className="p-2 bg-gray-100 rounded-lg"><Eye size={18} /></button>
                      <button onClick={() => review(t._id, 'approve')} className="p-2 bg-green-100 text-green-700 rounded-lg"><CheckCircle size={18} /></button>
                      <button onClick={() => review(t._id, 'reject', 'مرفوض')} className="p-2 bg-red-100 text-red-700 rounded-lg"><XCircle size={18} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {tab === 'messages' && (
            <div className="space-y-4">
              {messages.length === 0 ? <Empty text="لا رسائل" /> : messages.map((m) => (
                <div key={m._id} className="bg-white rounded-xl border p-5">
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
            <div className="grid lg:grid-cols-2 gap-6">
              <form onSubmit={addTeacher} className="bg-white rounded-xl border p-6 space-y-3">
                <h3 className="font-bold flex items-center gap-2"><Plus size={18} /> إضافة شيخ جديد</h3>
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
                <button type="submit" className="w-full py-2 bg-emerald-600 text-white rounded-lg text-sm">إضافة واعتماد</button>
              </form>
              <div className="bg-white rounded-xl border p-6">
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
              <form onSubmit={addCourse} className="bg-white rounded-xl border p-6 grid md:grid-cols-2 gap-3">
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
                <div className="bg-white rounded-xl border p-6">
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
                  <div className="bg-white rounded-xl border p-6">
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
              <form onSubmit={addBlog} className="bg-white rounded-xl border p-6 space-y-3">
                <h3 className="font-bold flex items-center gap-2"><Edit3 size={18} /> مقال جديد</h3>
                <input required placeholder="slug" value={blogForm.slug} onChange={(e) => setBlogForm((p) => ({ ...p, slug: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm" />
                <input required placeholder="العنوان" value={blogForm.titleAr} onChange={(e) => setBlogForm((p) => ({ ...p, titleAr: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm" />
                <input placeholder="مقتطف" value={blogForm.excerptAr} onChange={(e) => setBlogForm((p) => ({ ...p, excerptAr: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm" />
                <textarea required placeholder="المحتوى" rows={6} value={blogForm.contentAr} onChange={(e) => setBlogForm((p) => ({ ...p, contentAr: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm" />
                <button type="submit" className="w-full py-2 bg-emerald-600 text-white rounded-lg text-sm">نشر</button>
              </form>
              <div className="bg-white rounded-xl border p-6">
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
                <div key={w._id} className="bg-white rounded-xl border p-5 flex flex-wrap justify-between items-center gap-4">
                  <div>
                    <p className="font-bold">{w.teacher?.user?.name || w.teacher?.personalInfo?.fullName || 'معلم'}</p>
                    <p className="text-sm text-gray-500">{w.teacher?.user?.email}</p>
                    <p className="text-lg font-bold text-emerald-700 mt-1">{w.amount} ج.م — {w.method}</p>
                    <p className="text-sm text-gray-600">{w.accountInfo}</p>
                    <p className="text-xs text-gray-400 mt-1">{new Date(w.createdAt).toLocaleString('ar-EG')}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded ${
                      w.status === 'approved' ? 'bg-green-100 text-green-700'
                        : w.status === 'rejected' ? 'bg-red-100 text-red-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {w.status === 'approved' ? 'تم التحويل' : w.status === 'rejected' ? 'مرفوض' : 'قيد المراجعة'}
                    </span>
                    {w.status === 'pending' && (
                      <>
                        <button onClick={() => reviewWithdraw(w._id, 'approve')} className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm">موافقة</button>
                        <button onClick={() => reviewWithdraw(w._id, 'reject')} className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm">رفض</button>
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

              <div className="bg-white rounded-xl border p-6">
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

              <div className="bg-white rounded-xl border p-6">
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
                }} className="bg-white rounded-xl border p-6 space-y-3">
                  <h3 className="font-bold">فيديو جديد</h3>
                  <input required placeholder="العنوان" className="w-full border rounded-lg px-3 py-2 text-sm" value={videoForm.title} onChange={(e) => setVideoForm((p) => ({ ...p, title: e.target.value }))} />
                  <input required placeholder="رابط YouTube embed" className="w-full border rounded-lg px-3 py-2 text-sm" value={videoForm.videoUrl} onChange={(e) => setVideoForm((p) => ({ ...p, videoUrl: e.target.value }))} />
                  <select className="w-full border rounded-lg px-3 py-2 text-sm" value={videoForm.category} onChange={(e) => setVideoForm((p) => ({ ...p, category: e.target.value }))}>
                    {['quran', 'tajweed', 'arabic', 'seerah', 'kids'].map((c) => <option key={c}>{c}</option>)}
                  </select>
                  <button type="submit" className="w-full py-2 bg-emerald-600 text-white rounded-lg text-sm">إضافة</button>
                </form>
                <div className="bg-white rounded-xl border p-6">
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
    </DashboardLayout>
  );
}
