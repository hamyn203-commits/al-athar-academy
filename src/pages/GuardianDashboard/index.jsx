import { useState, useEffect } from 'react';
import { Users, TrendingUp, BookOpen, Award, Bell, FileText, CalendarCheck } from 'lucide-react';
import DashboardLayout, { StatCard, TabBar } from '../../components/dashboard/DashboardLayout';
import { useRequireAuth } from '../../hooks/useRequireAuth';
import { useToast } from '../../context/ToastProvider';
import api from '../../lib/api';

export default function GuardianDashboard() {
  const { user, ready, logout } = useRequireAuth(['guardian', 'admin']);
  const toast = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('children');
  const [reports, setReports] = useState([]);
  const [weeklySummaries, setWeeklySummaries] = useState({});
  const [generating, setGenerating] = useState(null);

  useEffect(() => {
    if (!ready) return;
    api.get('/api/guardians/dashboard', { auth: true })
      .then(setData)
      .catch(() => {
        toast.error('لم يتم العثور على ملف ولي الأمر — تواصل مع الدعم');
        setData({ children: [], totalChildren: 0 });
      })
      .finally(() => setLoading(false));
  }, [ready, toast]);

  useEffect(() => {
    if (!ready || tab !== 'reports') return;
    api.get('/api/guardians/reports', { auth: true })
      .then(setReports)
      .catch(() => setReports([]));
  }, [tab, ready]);

  useEffect(() => {
    if (!ready || tab !== 'attendance' || !data?.children?.length) return;
    data.children.forEach((child) => {
      const id = child.student?._id;
      if (!id || weeklySummaries[id]) return;
      api.get(`/api/guardians/child/${id}/weekly-summary`, { auth: true })
        .then((summary) => setWeeklySummaries((p) => ({ ...p, [id]: summary })))
        .catch(() => {});
    });
  }, [tab, ready, data, weeklySummaries]);

  const generateReport = async (studentId) => {
    setGenerating(studentId);
    try {
      await api.post(`/api/guardians/report/${studentId}`, { type: 'weekly' }, { auth: true });
      toast.success('تم إنشاء التقرير الأسبوعي');
      const updated = await api.get('/api/guardians/reports', { auth: true });
      setReports(updated);
    } catch (e) {
      toast.error(e.message || 'فشل إنشاء التقرير');
    } finally {
      setGenerating(null);
    }
  };

  if (!ready) return null;

  const children = data?.children || [];
  const avgProgress = children.length
    ? Math.round(children.reduce((s, c) => s + (c.stats?.averageProgress || 0), 0) / children.length)
    : 0;

  return (
    <DashboardLayout title="لوحة ولي الأمر" user={user} onLogout={logout}>
      {loading ? <div className="flex justify-center py-20"><div className="spinner spinner-lg" /></div> : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard label="الأبناء" value={data?.totalChildren || 0} icon={Users} />
            <StatCard label="متوسط التقدم" value={`${avgProgress}%`} icon={TrendingUp} color="blue" />
            <StatCard label="الدورات النشطة" value={children.reduce((s, c) => s + (c.stats?.enrolledCourses || 0), 0)} icon={BookOpen} color="purple" />
            <StatCard label="الإنجازات" value={children.reduce((s, c) => s + (c.stats?.totalAchievements || 0), 0)} icon={Award} color="orange" />
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <TabBar tabs={[
              { id: 'children', label: 'الأبناء' },
              { id: 'attendance', label: 'حضور وواجبات' },
              { id: 'reports', label: 'التقارير' },
              { id: 'activity', label: 'النشاطات' },
            ]} active={tab} onChange={setTab} />

            {tab === 'children' && (
              <div className="space-y-4">
                {children.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="mx-auto text-gray-300 mb-4" size={48} />
                    <p className="text-gray-500">لا يوجد أبناء مرتبطون بعد</p>
                    <p className="text-sm text-gray-400 mt-2">تواصل مع الدعم لربط حساب طفلك</p>
                  </div>
                ) : children.map((child) => (
                  <div key={child.student?._id} className="border rounded-xl p-5">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-lg">{child.student?.name}</h3>
                        <p className="text-sm text-gray-500">{child.relationship === 'father' ? 'أب' : child.relationship === 'mother' ? 'أم' : child.relationship}</p>
                      </div>
                      <span className="text-emerald-600 font-bold">{Math.round(child.stats?.averageProgress || 0)}%</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-center text-sm">
                      <div className="bg-gray-50 rounded-lg p-2"><p className="font-bold">{child.stats?.enrolledCourses || 0}</p><p className="text-gray-500">دورات</p></div>
                      <div className="bg-gray-50 rounded-lg p-2"><p className="font-bold">{child.stats?.totalAchievements || 0}</p><p className="text-gray-500">إنجازات</p></div>
                      <div className="bg-gray-50 rounded-lg p-2"><p className="font-bold">{child.stats?.currentStreak || 0}</p><p className="text-gray-500">🔥 سلسلة</p></div>
                    </div>
                    <button type="button" onClick={() => generateReport(child.student._id)}
                      disabled={generating === child.student._id}
                      className="mt-3 text-sm text-emerald-600 hover:underline">
                      {generating === child.student._id ? 'جاري...' : 'إنشاء تقرير أسبوعي'}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {tab === 'attendance' && (
              <div className="space-y-4">
                {children.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">لا أبناء مرتبطين</p>
                ) : children.map((child) => {
                  const sum = weeklySummaries[child.student?._id];
                  return (
                    <div key={child.student?._id} className="border rounded-xl p-5">
                      <h3 className="font-bold mb-3 flex items-center gap-2">
                        <CalendarCheck size={18} className="text-emerald-600" />
                        {child.student?.name} — هذا الأسبوع
                      </h3>
                      {!sum ? <p className="text-sm text-gray-400">جاري التحميل...</p> : (
                        <>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-4">
                            <div className="bg-green-50 rounded-lg p-3 text-center">
                              <p className="font-bold text-green-700">{sum.week?.completed || 0}</p>
                              <p className="text-gray-500">حصص مكتملة</p>
                            </div>
                            <div className="bg-red-50 rounded-lg p-3 text-center">
                              <p className="font-bold text-red-700">{sum.week?.missed || 0}</p>
                              <p className="text-gray-500">غياب</p>
                            </div>
                            <div className="bg-yellow-50 rounded-lg p-3 text-center">
                              <p className="font-bold text-yellow-700">{sum.week?.homeworkPending || 0}</p>
                              <p className="text-gray-500">واجبات معلقة</p>
                            </div>
                            <div className="bg-blue-50 rounded-lg p-3 text-center">
                              <p className="font-bold text-blue-700">{sum.week?.homeworkDone || 0}</p>
                              <p className="text-gray-500">واجبات منجزة</p>
                            </div>
                          </div>
                          {(sum.recentSessions || []).slice(0, 3).map((s) => (
                            <p key={s._id} className="text-xs text-gray-600 border-t pt-2">
                              ✓ {s.teacher?.user?.name} — {new Date(s.scheduledAt).toLocaleDateString('ar-EG')}
                            </p>
                          ))}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {tab === 'reports' && (
              <div className="space-y-3">
                {reports.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="mx-auto text-gray-300 mb-3" size={40} />
                    <p className="text-gray-500">لا تقارير بعد — أنشئ تقريراً من تبويب الأبناء</p>
                  </div>
                ) : reports.map((r, i) => (
                  <div key={r._id || i} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-sm">{r.childId?.name || 'ابن/ة'}</p>
                        <p className="text-xs text-gray-500">{r.type === 'weekly' ? 'تقرير أسبوعي' : r.type}</p>
                      </div>
                      <span className="text-xs text-gray-400">
                        {r.generatedAt ? new Date(r.generatedAt).toLocaleDateString('ar-EG') : ''}
                      </span>
                    </div>
                    {r.summary && <p className="text-sm text-gray-600 mt-2">{r.summary}</p>}
                    {r.stats && (
                      <div className="flex gap-4 text-xs mt-2 text-slate-500">
                        {r.stats.sessionsCompleted != null && <span>حصص: {r.stats.sessionsCompleted}</span>}
                        {r.stats.homeworkCompleted != null && <span>واجبات: {r.stats.homeworkCompleted}</span>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {tab === 'activity' && (
              <div className="space-y-3">
                {children.flatMap((c) => (c.recentAchievements || []).map((a, i) => (
                  <div key={`${c.student?._id}-${i}`} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                    <Bell size={16} className="text-emerald-600 mt-1 shrink-0" />
                    <div>
                      <p className="text-sm font-medium">{a.title || a.type} — {c.student?.name}</p>
                      <p className="text-xs text-gray-400">{a.achievedAt ? new Date(a.achievedAt).toLocaleDateString('ar-EG') : ''}</p>
                    </div>
                  </div>
                )))}
                {!children.some((c) => c.recentAchievements?.length) && (
                  <p className="text-center text-gray-500 py-8">لا توجد نشاطات حديثة</p>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
