import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, BookOpen, Calendar, DollarSign, CheckCircle, XCircle, Eye, Clock } from 'lucide-react';
import DashboardLayout, { StatCard, TabBar } from '../../components/dashboard/DashboardLayout';
import { useRequireAuth } from '../../hooks/useRequireAuth';
import { useToast } from '../../context/ToastProvider';
import api from '../../lib/api';

export default function AdminDashboard() {
  const { user, ready, logout } = useRequireAuth(['admin']);
  const navigate = useNavigate();
  const toast = useToast();
  const [tab, setTab] = useState('pending');
  const [pending, setPending] = useState([]);
  const [approved, setApproved] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [st, pend, appr] = await Promise.all([
        api.get('/api/admin/stats', { auth: true }),
        api.get('/api/teachers/admin/pending', { auth: true }),
        api.get('/api/admin/teachers/approved', { auth: true }),
      ]);
      setStats(st);
      setPending(Array.isArray(pend) ? pend : []);
      setApproved(Array.isArray(appr) ? appr : []);
    } catch {
      toast.error('تعذر تحميل بيانات الإدارة');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (ready) load(); }, [ready]);

  if (!ready) return null;

  const review = async (id, action, note = '') => {
    try {
      await api.put(`/api/teachers/admin/${id}/review`, { action, note }, { auth: true });
      toast.success(action === 'approve' ? 'تم قبول المعلم' : 'تم الرفض');
      load();
    } catch { toast.error('فشلت العملية'); }
  };

  return (
    <DashboardLayout title="لوحة تحكم الإدارة" user={user} onLogout={logout}>
      {loading ? <div className="flex justify-center py-20"><div className="spinner spinner-lg" /></div> : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard label="الطلاب" value={stats.totalStudents || 0} icon={Users} />
            <StatCard label="المعلمون" value={stats.totalTeachers || 0} icon={BookOpen} color="blue" />
            <StatCard label="الحصص" value={stats.totalSessions || 0} icon={Calendar} color="purple" />
            <StatCard label="الأرباح" value={`${stats.totalEarnings || 0} ج.م`} icon={DollarSign} color="yellow" />
          </div>

          <div className="mb-6 flex gap-3 flex-wrap">
            <button onClick={async () => {
              try {
                const r = await api.post('/api/lms/seed-demo', {}, { auth: true });
                toast.success(r.message || 'تم إنشاء الدورة التجريبية');
              } catch (e) { toast.error(e.message); }
            }} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">
              + إنشاء دورة LMS تجريبية
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <TabBar tabs={[
              { id: 'pending', label: `قيد المراجعة (${pending.length})` },
              { id: 'approved', label: `معتمدون (${approved.length})` },
            ]} active={tab} onChange={setTab} />

            {tab === 'pending' && (
              <div className="space-y-4">
                {pending.length === 0 ? <p className="text-center text-gray-500 py-8">لا معلمين قيد المراجعة</p> : pending.map((t) => (
                  <div key={t._id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h3 className="font-bold text-lg">{t.user?.name}</h3>
                        <p className="text-gray-600 text-sm">{t.personalInfo?.country} — {t.personalInfo?.city}</p>
                        <p className="text-xs text-gray-400 mt-1">{t.academicInfo?.university}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => navigate(`/teachers/${t._id}`)} className="p-2 bg-gray-100 rounded-lg"><Eye size={18} /></button>
                        <button onClick={() => review(t._id, 'approve')} className="p-2 bg-green-100 text-green-700 rounded-lg"><CheckCircle size={18} /></button>
                        <button onClick={() => review(t._id, 'reject', 'مرفوض')} className="p-2 bg-red-100 text-red-700 rounded-lg"><XCircle size={18} /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab === 'approved' && (
              <div className="space-y-3">
                {approved.length === 0 ? <p className="text-center text-gray-500 py-8">لا معلمين معتمدين</p> : approved.map((t) => (
                  <div key={t._id} className="border rounded-lg p-4 flex justify-between items-center">
                    <div>
                      <h3 className="font-bold">{t.user?.name}</h3>
                      <p className="text-sm text-gray-500">{t.personalInfo?.country} — ⭐ {t.rating?.average?.toFixed?.(1) || '0'}</p>
                    </div>
                    <button onClick={() => navigate(`/teachers/${t._id}`)} className="text-emerald-600 text-sm hover:underline">عرض الملف</button>
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
