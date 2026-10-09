import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRequireAuth } from '../../hooks/useRequireAuth';
import { useI18n } from '../../i18n';
import { dashboardPathForRole } from '../../lib/navigation';
import { API_BASE_URL } from '../../config';

export default function ProfileSetup() {
  const { user, ready } = useRequireAuth(['student', 'guardian', 'teacher']);
  const { locale } = useI18n();
  const navigate = useNavigate();
  const [data, setData] = useState({ name: '', phone: '', age: '', gender: '', whatsappPhone: '', preferredTrack: 'memorization', currentLevel: 'beginner', memorizedJuz: 0, memorizationDetails: '', bio: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  useEffect(() => { if (user) setData(prev => ({ ...prev, ...Object.fromEntries(Object.keys(prev).filter(k => user[k] !== undefined && user[k] !== null).map(k => [k, user[k]])) })); }, [user]);
  if (!ready) return null;
  const save = async (event) => {
    event.preventDefault();
    setSaving(true); setError('');
    try {
      const token = sessionStorage.getItem('accessToken') || localStorage.getItem('accessToken');
      const payload = { name: data.name, phone: data.phone, whatsappPhone: data.whatsappPhone, bio: data.bio };
      if (user.role === 'student') Object.assign(payload, { age: data.age ? Number(data.age) : undefined, gender: data.gender || undefined, memorizedJuz: Number(data.memorizedJuz), preferredTrack: data.preferredTrack, currentLevel: data.currentLevel, memorizationDetails: data.memorizationDetails });
      const response = await fetch(`${API_BASE_URL}/api/auth/onboarding`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, credentials: 'include', body: JSON.stringify(payload) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'تعذر حفظ البيانات');
      navigate(dashboardPathForRole(user.role, locale), { replace: true });
    } catch (e) { setError(e.message); } finally { setSaving(false); }
  };
  const field = (label, key, type = 'text') => <label className="block text-sm font-semibold">{label}<input className="input-field w-full mt-2" type={type} value={data[key] ?? ''} onChange={e => setData(p => ({...p, [key]: e.target.value}))} /></label>;
  return <main className="min-h-screen bg-slate-50 py-12 px-4" dir="rtl"><section className="mx-auto max-w-xl rounded-2xl bg-white p-8 shadow-sm border border-slate-200">
    <h1 className="text-2xl font-bold mb-2">استكمال الملف الشخصي</h1>
    <p className="text-sm text-slate-600 mb-6">بياناتك محفوظة ويمكنك استكمالها لاحقًا. {user.role === 'teacher' ? 'لا يمكنك التدريس أو الظهور للطلاب قبل اعتماد الإدارة.' : ''}</p>
    <form className="space-y-4" onSubmit={save}>
      {field('الاسم الكامل', 'name')}{field('رقم الهاتف', 'phone', 'tel')}{field('واتساب (اختياري)', 'whatsappPhone', 'tel')}
      {user.role === 'student' && <>{field('العمر', 'age', 'number')}<label className="block text-sm">الجنس<select className="input-field w-full mt-2" value={data.gender} onChange={e => setData(p => ({...p, gender:e.target.value}))}><option value="">غير محدد</option><option value="male">ذكر</option><option value="female">أنثى</option></select></label>{field('عدد الأجزاء المحفوظة (0–30)', 'memorizedJuz', 'number')}{field('تفاصيل الحفظ', 'memorizationDetails')}</>}
      {field('نبذة مختصرة (اختياري)', 'bio')}
      {error && <p role="alert" className="text-red-700">{error}</p>}
      <button disabled={saving || !data.name.trim()} className="w-full rounded-xl bg-emerald-800 text-white p-3 font-bold">{saving ? 'جاري الحفظ...' : 'حفظ والمتابعة'}</button>
      <button type="button" className="w-full text-slate-600 underline" onClick={() => navigate(dashboardPathForRole(user.role, locale))}>استكمل لاحقًا</button>
    </form>
  </section></main>;
}
