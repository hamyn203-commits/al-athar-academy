import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../../components/Logo';
import api from '../../lib/api';

export default function SetupAdmin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/api/admin/ensure-admin', form);
      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4" dir="rtl">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <Logo size={60} showText={false} />
          <h1 className="text-xl font-bold mt-4">إعداد حساب الأدمن</h1>
          <p className="text-sm text-gray-500 mt-1">مرة واحدة فقط — إذا لم يكن هناك أدmin بعد</p>
        </div>
        {done ? (
          <div className="text-center space-y-4">
            <p className="text-green-600 font-semibold">تم إنشاء حساب الأدمن ✅</p>
            <button onClick={() => navigate('/login')} className="w-full py-2 bg-emerald-600 text-white rounded-lg">تسجيل الدخول</button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            {error && <p className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</p>}
            <input required placeholder="الاسم" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border rounded-lg px-3 py-2" />
            <input required type="email" placeholder="البريد" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full border rounded-lg px-3 py-2" />
            <input required type="password" minLength={8} placeholder="كلمة المرور (8+)" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full border rounded-lg px-3 py-2" />
            <button type="submit" disabled={loading} className="w-full py-2 bg-emerald-600 text-white rounded-lg disabled:opacity-50">
              {loading ? 'جاري الإنشاء...' : 'إنشاء الأدمن'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
