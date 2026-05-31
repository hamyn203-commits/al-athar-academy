import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowRight } from 'lucide-react';
import GlobalHeader from '../../components/GlobalHeader';
import GlobalFooter from '../../components/GlobalFooter';
import SEOHead from '../../components/SEOHead';
import api from '../../lib/api';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus('');
    try {
      await api.post('/api/auth/forgot-password', { email });
      setStatus('success');
    } catch {
      setStatus('success'); // don't reveal if email exists
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <SEOHead title="استعادة كلمة المرور" />
      <GlobalHeader />
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
          <h1 className="text-2xl font-bold mb-2 text-center">نسيت كلمة المرور؟</h1>
          <p className="text-gray-600 text-center mb-6 text-sm">أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين</p>
          {status === 'success' ? (
            <div className="text-center text-emerald-600">
              <p className="mb-4">إذا كان البريد مسجلاً، ستصلك رسالة قريباً.</p>
              <button onClick={() => navigate('/login')} className="btn-primary">العودة لتسجيل الدخول</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Mail size={18} className="absolute right-3 top-3 text-gray-400" />
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@email.com" className="input-field pr-10 w-full" dir="ltr" />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                {loading ? 'جاري الإرسال...' : <>إرسال الرابط <ArrowRight size={18} /></>}
              </button>
            </form>
          )}
        </div>
      </main>
      <GlobalFooter />
    </div>
  );
}
