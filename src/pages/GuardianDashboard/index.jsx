import { useState, useEffect, useCallback } from 'react';
import { 
  Users, TrendingUp, BookOpen, Award, Bell, FileText, CalendarCheck, 
  Calendar, Clock, CheckCircle, XCircle, AlertCircle, MessageCircle, 
  Phone, ShieldCheck, Star, UserPlus, Sparkles, Check, ChevronLeft, ArrowRight
} from 'lucide-react';
import DashboardLayout, { StatCard, TabBar } from '../../components/dashboard/DashboardLayout';
import { useRequireAuth } from '../../hooks/useRequireAuth';
import { useToast } from '../../context/ToastProvider';
import api from '../../lib/api';

export default function GuardianDashboard() {
  const { user, ready, logout } = useRequireAuth(['guardian', 'admin']);
  const toast = useToast();

  const [children, setChildren] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState(null);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');

  // Link Child Modal State
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkInput, setLinkInput] = useState('');
  const [relationship, setRelationship] = useState('father');
  const [linking, setLinking] = useState(false);

  // RSVP Excuse Modal State
  const [excuseModalSession, setExcuseModalSession] = useState(null);
  const [excuseReason, setExcuseReason] = useState('');
  const [submittingRsvp, setSubmittingRsvp] = useState(false);

  // Fetch all guardian children and sessions
  const loadDashboardData = useCallback(async () => {
    if (!ready) return;
    setLoading(true);
    try {
      // 1. Fetch children
      const childrenRes = await api.get('/api/guardian/children', { auth: true })
        .catch(() => ({ children: [] }));
      
      const kidsList = childrenRes.children || [];
      setChildren(kidsList);

      if (kidsList.length > 0 && !selectedChildId) {
        setSelectedChildId(kidsList[0].studentId);
      }

      // 2. Fetch upcoming sessions
      const sessionsRes = await api.get('/api/guardian/upcoming-sessions', { auth: true })
        .catch(() => ({ sessions: [] }));
      setUpcomingSessions(sessionsRes.sessions || []);

    } catch (err) {
      console.error('Failed to load guardian dashboard:', err);
      toast.error('حدث خطأ أثناء تحميل بيانات لوحة ولي الأمر');
    } finally {
      setLoading(false);
    }
  }, [ready, selectedChildId, toast]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Fetch reports when selected child changes or tab is reports
  useEffect(() => {
    if (!ready || !selectedChildId) return;
    api.get(`/api/guardian/reports/${selectedChildId}`, { auth: true })
      .then((res) => {
        setReports(res.reports || []);
      })
      .catch(() => {
        setReports([]);
      });
  }, [ready, selectedChildId, tab]);

  // Link child handler
  const handleLinkChild = async (e) => {
    e.preventDefault();
    if (!linkInput.trim()) {
      toast.error('يرجى إدخال البريد الإلكتروني أو كود الطالب');
      return;
    }

    setLinking(true);
    try {
      const isEmail = linkInput.includes('@');
      const payload = {
        relationship,
        ...(isEmail ? { email: linkInput.trim() } : { studentCode: linkInput.trim() })
      };

      const res = await api.post('/api/guardian/link-child', payload, { auth: true });
      toast.success(res.message || 'تم ربط الطالب بنجاح!');
      setShowLinkModal(false);
      setLinkInput('');
      await loadDashboardData();
    } catch (err) {
      toast.error(err.message || 'فشل ربط الطالب، تأكد من صحة الكود أو البريد');
    } finally {
      setLinking(false);
    }
  };

  // RSVP Submission (Confirm or Excuse)
  const handleRsvp = async (sessionId, status, reason = '') => {
    if (!selectedChildId) return;
    setSubmittingRsvp(true);
    try {
      const res = await api.post(`/api/sessions/${sessionId}/rsvp`, {
        studentId: selectedChildId,
        status,
        excuseReason: reason
      }, { auth: true });

      toast.success(res.message || (status === 'confirmed' ? 'تم تأكيد الحضور بنجاح' : 'تم تسجيل الاعتذار'));
      setExcuseModalSession(null);
      setExcuseReason('');

      // Refresh upcoming sessions
      const sessionsRes = await api.get('/api/guardian/upcoming-sessions', { auth: true });
      setUpcomingSessions(sessionsRes.sessions || []);
    } catch (err) {
      toast.error(err.message || 'فشل تحديث حالة الحضور');
    } finally {
      setSubmittingRsvp(false);
    }
  };

  if (!ready) return null;

  const currentChild = children.find(c => c.studentId === selectedChildId) || children[0] || null;

  return (
    <DashboardLayout title="لوحة متابعة ولي الأمر" user={user} onLogout={logout}>
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 font-medium font-arabic">جاري تحميل بيانات الأبناء وحلقات القرآن...</p>
        </div>
      ) : (
        <div className="space-y-6">

          {/* Children Selector Top Bar */}
          <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="text-emerald-400" size={20} />
                  <span className="text-emerald-200 text-sm font-arabic">بوابة أولياء الأمور المعتمدة</span>
                </div>
                <h2 className="text-2xl font-bold font-arabic">
                  مرحباً بك، {user?.name || 'ولي الأمر الكريم'}
                </h2>
                <p className="text-emerald-100/80 text-sm mt-1 font-arabic">
                  تابع تقدم أبنائك في حفظ القرآن الكريم وأحكام التجويد، والحصص المباشرة والتقارير الدورية
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowLinkModal(true)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold rounded-xl transition-all shadow-md active:scale-95 text-sm"
              >
                <UserPlus size={18} />
                <span>ربط ابن جديد</span>
              </button>
            </div>

            {/* Child Selector Pills */}
            {children.length > 0 && (
              <div className="mt-6 pt-5 border-t border-emerald-700/60 flex flex-wrap items-center gap-3">
                <span className="text-xs text-emerald-200/90 font-medium font-arabic">الأبناء المسجلون:</span>
                {children.map((child) => {
                  const isSelected = child.studentId === selectedChildId;
                  return (
                    <button
                      key={child.studentId}
                      type="button"
                      onClick={() => setSelectedChildId(child.studentId)}
                      className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm font-arabic transition-all ${
                        isSelected
                          ? 'bg-white text-emerald-900 font-bold shadow-md scale-105 ring-2 ring-emerald-300'
                          : 'bg-emerald-800/80 text-emerald-100 hover:bg-emerald-700/80'
                      }`}
                    >
                      <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                        {child.name?.charAt(0) || 'ط'}
                      </div>
                      <span>{child.name}</span>
                      {child.circle && (
                        <span className="text-[11px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                          {child.circle.name}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Metrics of the Selected Child */}
          {currentChild ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <TrendingUp size={24} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-arabic">نسبة الحضور</p>
                  <p className="text-xl font-bold text-gray-800">{currentChild.attendance?.rate ?? 100}%</p>
                  <span className="text-[11px] text-emerald-600 font-medium">
                    {currentChild.attendance?.attended || 0} من {currentChild.attendance?.total || 0} حصة
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Award size={24} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-arabic">نقاط التحفيز والأوسمة</p>
                  <p className="text-xl font-bold text-gray-800">{currentChild.studentProfile?.points || 0}</p>
                  <span className="text-[11px] text-amber-600 font-medium">🔥 {currentChild.studentProfile?.streak || 0} أيام متتالية</span>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <BookOpen size={24} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-arabic">المسار التعليمي</p>
                  <p className="text-sm font-bold text-gray-800 truncate">
                    {currentChild.studentProfile?.plan || 'مسار التحفيظ والمراجعة'}
                  </p>
                  <span className="text-[11px] text-blue-600 font-medium">
                    المستوى: {currentChild.studentProfile?.level || 'مبتدئ'}
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <Sparkles size={24} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-arabic">السورة الحالية</p>
                  <p className="text-sm font-bold text-gray-800 truncate">
                    {currentChild.studentProfile?.currentSurah || 'سورة الفاتحة'}
                  </p>
                  <span className="text-[11px] text-purple-600 font-medium">
                    {currentChild.circle ? currentChild.circle.name : 'حلقة خاصة'}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
              <Users className="mx-auto text-amber-500 mb-2" size={36} />
              <h3 className="font-bold text-gray-800 text-lg">لم يتم ربط أي طالب بحسابك بعد</h3>
              <p className="text-sm text-gray-600 mt-1">اضغط على زر &quot;ربط ابن جديد&quot; وأدخل كود الطالب أو بريده الإلكتروني للبدء بمتابعة دراسته.</p>
              <button
                type="button"
                onClick={() => setShowLinkModal(true)}
                className="mt-4 inline-flex items-center gap-2 px-5 py-2 bg-emerald-600 text-white rounded-lg font-bold text-sm hover:bg-emerald-700 transition"
              >
                <UserPlus size={16} />
                <span>ربط الطالب الآن</span>
              </button>
            </div>
          )}

          {/* Tab Navigation */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <TabBar
              tabs={[
                { id: 'overview', label: 'نظرة عامة والحصص القادمة' },
                { id: 'reports', label: 'تقارير الحفظ والتجويد (الواتساب)' },
                { id: 'attendance', label: 'سجل الحضور والاعتذارات' }
              ]}
              active={tab}
              onChange={setTab}
            />

            {/* TAB 1: OVERVIEW & UPCOMING SESSIONS */}
            {tab === 'overview' && (
              <div className="space-y-6 mt-4">
                
                {/* Upcoming Quran Sessions Section */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 font-arabic">
                      <Calendar className="text-emerald-600" size={20} />
                      <span>الحصص والحلقات القادمة وتأكيد الحضور (RSVP)</span>
                    </h3>
                    <span className="text-xs text-gray-400 font-arabic">
                      * تذكير: يمكنك الاعتذار قبل 6 ساعات على الأقل للحصول على حصة تعويضية
                    </span>
                  </div>

                  {upcomingSessions.length === 0 ? (
                    <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-8 text-center">
                      <CalendarCheck className="mx-auto text-gray-400 mb-2" size={32} />
                      <p className="text-gray-600 font-medium">لا توجد حصص قادمة مجدولة حالياً</p>
                      <p className="text-xs text-gray-400 mt-1">سيتم إشعارك فور إدراج الحصة القادمة في الجدول.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {upcomingSessions.map((session) => {
                        const dateObj = new Date(session.scheduledAt);
                        const isConfirmed = session.rsvp === 'confirmed';
                        const isExcused = session.rsvp === 'excused';

                        return (
                          <div key={session._id} className="border border-emerald-100/80 rounded-xl p-5 bg-white shadow-sm hover:shadow-md transition">
                            <div className="flex items-start justify-between gap-3 mb-3">
                              <div>
                                <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 mb-1">
                                  {session.circleName}
                                </span>
                                <h4 className="font-bold text-gray-800 text-base">
                                  حلقة الطالب: {session.child?.name || currentChild?.name || 'الطالب'}
                                </h4>
                              </div>

                              {isConfirmed && (
                                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md">
                                  <Check size={14} />
                                  مؤكد الحضور
                                </span>
                              )}
                              {isExcused && (
                                <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded-md">
                                  <AlertCircle size={14} />
                                  معتذر (مستحق للتعويض)
                                </span>
                              )}
                            </div>

                            <div className="space-y-2 text-sm text-gray-600 mb-4 bg-gray-50/70 p-3 rounded-lg">
                              <div className="flex items-center gap-2">
                                <Clock size={16} className="text-emerald-600 shrink-0" />
                                <span>{dateObj.toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                <span className="font-bold text-gray-800 mr-2">
                                  الساعة {dateObj.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Users size={16} className="text-gray-400 shrink-0" />
                                  <span>المعلم: <strong className="text-gray-800">{session.teacher?.name}</strong></span>
                                </div>
                                {session.teacher?.phone && (
                                  <a
                                    href={`https://wa.me/${session.teacher.phone.replace(/[^0-9]/g, '')}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1 text-xs text-emerald-700 hover:text-emerald-800 font-bold bg-white px-2.5 py-1 rounded-md border border-emerald-200 hover:bg-emerald-50 transition"
                                  >
                                    <MessageCircle size={14} className="text-emerald-600" />
                                    <span>محادثة المعلم</span>
                                  </a>
                                )}
                              </div>
                            </div>

                            {/* RSVP Action Buttons */}
                            <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                              {!isConfirmed && !isExcused ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleRsvp(session._id, 'confirmed')}
                                    disabled={submittingRsvp}
                                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-bold transition shadow-sm active:scale-95"
                                  >
                                    <Check size={16} />
                                    <span>تأكيد الحضور</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setExcuseModalSession(session)}
                                    disabled={submittingRsvp}
                                    className="inline-flex items-center justify-center gap-1 py-2 px-3 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition"
                                  >
                                    <span>اعتذار مسبق</span>
                                  </button>
                                </>
                              ) : (
                                <div className="w-full flex items-center justify-between text-xs text-gray-500">
                                  <span>تم تسجيل ردك بنجاح في سجل الحلقة</span>
                                  <a
                                    href={session.meetingLink}
                                    className="inline-flex items-center gap-1 text-emerald-700 font-bold hover:underline"
                                  >
                                    <span>دخول الغرفة كمراقب صامت</span>
                                    <ArrowRight size={14} />
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Latest Evaluation Report Card */}
                {currentChild?.latestEvaluation && (
                  <div className="border border-emerald-100 rounded-2xl p-6 bg-gradient-to-br from-emerald-50/40 via-white to-teal-50/20">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                          <FileText size={20} />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-800 text-base font-arabic">
                            بطاقة تقييم آخر حلقة تسميع
                          </h4>
                          <p className="text-xs text-gray-500">
                            بتاريخ: {new Date(currentChild.latestEvaluation.date).toLocaleDateString('ar-EG', { dateStyle: 'full' })}
                          </p>
                        </div>
                      </div>

                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold">
                        <MessageCircle size={14} />
                        تم الإرسال على واتساب ولي الأمر
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="bg-white p-3.5 rounded-xl border border-gray-100 shadow-sm text-center">
                        <p className="text-xs text-gray-400 mb-1">درجة الحفظ</p>
                        <p className="text-2xl font-black text-emerald-600">
                          {currentChild.latestEvaluation.memorizationScore} <span className="text-sm font-normal text-gray-400">/ 10</span>
                        </p>
                      </div>

                      <div className="bg-white p-3.5 rounded-xl border border-gray-100 shadow-sm text-center">
                        <p className="text-xs text-gray-400 mb-1">درجة التجويد والإتقان</p>
                        <p className="text-2xl font-black text-teal-600">
                          {currentChild.latestEvaluation.tajweedScore} <span className="text-sm font-normal text-gray-400">/ 10</span>
                        </p>
                      </div>

                      <div className="bg-white p-3.5 rounded-xl border border-gray-100 shadow-sm text-center">
                        <p className="text-xs text-gray-400 mb-1">السورة والمقدار</p>
                        <p className="text-sm font-bold text-gray-800">
                          {currentChild.latestEvaluation.surahRecited || 'سورة مسمّعة'}
                        </p>
                        <span className="text-[11px] text-gray-500">
                          الآيات [{currentChild.latestEvaluation.fromAyah || 1} - {currentChild.latestEvaluation.toAyah || 'نهاية السورة'}]
                        </span>
                      </div>

                      <div className="bg-white p-3.5 rounded-xl border border-gray-100 shadow-sm text-center">
                        <p className="text-xs text-gray-400 mb-1">الواجب القادم</p>
                        <p className="text-sm font-bold text-emerald-800 truncate" title={currentChild.latestEvaluation.nextHomework}>
                          {currentChild.latestEvaluation.nextHomework || 'مراجعة الورد السابق'}
                        </p>
                      </div>
                    </div>

                    {currentChild.latestEvaluation.notes && (
                      <div className="bg-white p-3.5 rounded-xl border border-gray-100 text-sm text-gray-700">
                        <strong className="text-emerald-800">توجيهات المعلم لولي الأمر: </strong>
                        <span>{currentChild.latestEvaluation.notes}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: ALL REPORTS (WHATSAPP ARCHIVE) */}
            {tab === 'reports' && (
              <div className="space-y-4 mt-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-gray-800 text-lg font-arabic">
                    سجل تقارير {currentChild?.name || 'الطالب'} المُرسلة للواتساب
                  </h3>
                  <span className="text-xs text-gray-500 font-arabic">
                    إجمالي التقارير: {reports.length}
                  </span>
                </div>

                {reports.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <FileText className="mx-auto text-gray-300 mb-3" size={40} />
                    <p className="text-gray-500 font-medium">لا توجد تقارير مسجلة لهذا الطالب حتى الآن</p>
                    <p className="text-xs text-gray-400 mt-1">يتم إنشاء التقرير تلقائياً فور انتهاء المعلم من حلقة التسميع.</p>
                  </div>
                ) : (
                  reports.map((rep, idx) => (
                    <div key={rep.sessionId || idx} className="border border-gray-100 rounded-xl p-5 bg-white shadow-sm hover:border-emerald-200 transition">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3 pb-3 border-b border-gray-50">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-800 text-base">
                              {rep.surahRecited ? `سورة ${rep.surahRecited}` : 'جلسة تسميع'}
                            </span>
                            {rep.fromAyah && rep.toAyah && (
                              <span className="text-xs px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md font-arabic">
                                من الآية {rep.fromAyah} إلى {rep.toAyah}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            المعلم: {rep.teacherName} • {new Date(rep.scheduledAt).toLocaleDateString('ar-EG', { dateStyle: 'full' })}
                          </p>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <span className="block text-[11px] text-gray-400">الحفظ</span>
                            <span className="font-black text-emerald-600 text-base">{rep.memorizationScore}/10</span>
                          </div>
                          <div className="text-center">
                            <span className="block text-[11px] text-gray-400">التجويد</span>
                            <span className="font-black text-teal-600 text-base">{rep.tajweedScore}/10</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm text-gray-600">
                        {rep.nextHomework && (
                          <p>
                            <strong className="text-gray-800">📖 الواجب المطلوب: </strong>
                            {rep.nextHomework}
                          </p>
                        )}
                        {rep.notes && (
                          <p>
                            <strong className="text-gray-800">📝 ملاحظات المعلم: </strong>
                            {rep.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB 3: ATTENDANCE & MAKEUP SESSIONS */}
            {tab === 'attendance' && (
              <div className="space-y-6 mt-4">
                <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-5">
                  <h4 className="font-bold text-emerald-900 text-base mb-2 font-arabic">
                    سياسة الحضور والحصص التعويضية في أكاديمية الأثر
                  </h4>
                  <ul className="text-sm text-emerald-800/90 space-y-1.5 list-disc list-inside">
                    <li>يتم إرسال تذكير بالحصة قبل 24 ساعة عبر الواتساب لتأكيد الحضور أو تقديم اعتذار.</li>
                    <li>في حال تم تقديم الاعتذار قبل موعد الحصة بـ <strong>6 ساعات على الأقل</strong>، يحفظ للطالب حقه في حصة تعويضية مجانية.</li>
                    <li>الغياب المفاجئ دون اعتذار مسبق يُسجل كغياب وتُعطى الأولوية للطلاب الحاضرين.</li>
                  </ul>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border border-green-200 bg-green-50/50 rounded-xl p-4 text-center">
                    <CheckCircle className="mx-auto text-green-600 mb-2" size={28} />
                    <p className="text-sm text-green-800 font-arabic">الحصص المكتملة</p>
                    <p className="text-2xl font-black text-green-700 mt-1">
                      {currentChild?.attendance?.attended || 0}
                    </p>
                  </div>

                  <div className="border border-amber-200 bg-amber-50/50 rounded-xl p-4 text-center">
                    <AlertCircle className="mx-auto text-amber-600 mb-2" size={28} />
                    <p className="text-sm text-amber-800 font-arabic">اعتذارات معتمدة للتعويض</p>
                    <p className="text-2xl font-black text-amber-700 mt-1">
                      {currentChild?.attendance?.excused || 0}
                    </p>
                  </div>

                  <div className="border border-red-200 bg-red-50/50 rounded-xl p-4 text-center">
                    <XCircle className="mx-auto text-red-600 mb-2" size={28} />
                    <p className="text-sm text-red-800 font-arabic">حالات الغياب غير المعتذر عنها</p>
                    <p className="text-2xl font-black text-red-700 mt-1">
                      {currentChild?.attendance?.absent || 0}
                    </p>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>
      )}

      {/* LINK CHILD MODAL */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2 font-arabic">
                <UserPlus className="text-emerald-600" size={20} />
                <span>ربط حساب طالب بولي الأمر</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowLinkModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-4 font-arabic">
              أدخل البريد الإلكتروني للطالب المسجل في الأكاديمية أو كود الطالب الفريد لربطه بحسابك ومتابعة تقدمه فوراً:
            </p>

            <form onSubmit={handleLinkChild} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  البريد الإلكتروني أو كود الطالب
                </label>
                <input
                  type="text"
                  placeholder="مثال: student@athar.edu أو ATH-1029"
                  value={linkInput}
                  onChange={(e) => setLinkInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  صلة القرابة
                </label>
                <select
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                >
                  <option value="father">أب</option>
                  <option value="mother">أم</option>
                  <option value="guardian">ولي أمر / وصي</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  disabled={linking}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition shadow-sm disabled:opacity-50"
                >
                  {linking ? 'جاري الربط...' : 'تأكيد الربط'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowLinkModal(false)}
                  className="py-2.5 px-4 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl text-sm font-medium"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RSVP EXCUSE MODAL */}
      {excuseModalSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2 font-arabic text-red-600">
                <AlertCircle size={20} />
                <span>الاعتذار عن حضور حلقة القرآن</span>
              </h3>
              <button
                type="button"
                onClick={() => setExcuseModalSession(null)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                ✕
              </button>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 mb-4">
              {excuseModalSession.canExcuseWithCompensation ? (
                <p>
                  ✅ تم تقديم الاعتذار قبل الموعد بأكثر من 6 ساعات ({excuseModalSession.hoursUntilSession} ساعة متبقية). 
                  <strong> يحق لك الحصول على حصة تعويضية مجانية!</strong>
                </p>
              ) : (
                <p>
                  ⚠️ تبقى أقل من 6 ساعات على موعد الحصة. وفقاً للائحة الأكاديمية لا يمكن ضمان حصة تعويضية في حال الاعتذار المتأخر.
                </p>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  سبب الاعتذار (اختياري)
                </label>
                <textarea
                  rows={3}
                  value={excuseReason}
                  onChange={(e) => setExcuseReason(e.target.value)}
                  placeholder="مثال: ظرف طارئ، مرض، اختبارات مدرسية..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => handleRsvp(excuseModalSession._id, 'excused', excuseReason)}
                  disabled={submittingRsvp}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-sm transition shadow-sm disabled:opacity-50"
                >
                  {submittingRsvp ? 'جاري التسجيل...' : 'تأكيد الاعتذار'}
                </button>
                <button
                  type="button"
                  onClick={() => setExcuseModalSession(null)}
                  className="py-2.5 px-4 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl text-sm font-medium"
                >
                  تراجع
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
}

