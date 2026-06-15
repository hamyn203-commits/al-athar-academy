import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Lock, Mail, Eye, EyeOff, ArrowRight, Star, ArrowLeft } from 'lucide-react';
import Logo from '../../components/Logo';
import { useI18n } from '../../i18n';
import api from '../../lib/api';

export default function Login() {
  const navigate = useNavigate();
  const { locale } = useI18n();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await api.post('/api/auth/login', formData);

      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));

      const roleRoutes = {
        admin: '/admin',
        teacher: '/teacher/dashboard',
        guardian: '/guardian/dashboard',
        student: '/student/dashboard'
      };
      navigate(roleRoutes[data.user.role] || '/student/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="geo-pattern-light min-h-screen flex items-center justify-center p-5 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--azhar-green-deep)]/5 via-transparent to-[var(--azhar-gold-leaf)]/5 pointer-events-none" />

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="azhar-card w-full max-w-md p-8 sm:p-10 relative overflow-hidden"
      >
        <div className="flex items-center justify-center gap-2 mb-6" aria-hidden="true">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[var(--azhar-gold-leaf)] to-transparent opacity-40" />
          <Star size={14} className="text-[var(--azhar-gold-leaf)]" fill="currentColor" />
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[var(--azhar-gold-leaf)] to-transparent opacity-40" />
        </div>

        <div className="text-center mb-8">
          <div className="flex justify-center">
            <Logo size={80} showText={false} />
          </div>
          <h2 className="font-amiri text-3xl font-bold text-[var(--azhar-green-deep)] mt-5 mb-2">
            {locale === 'ar' ? 'تسجيل الدخول' : 'Login'}
          </h2>
          <p className="text-sm text-[var(--athar-text-muted)]">
            {locale === 'ar'
              ? 'ادخل إلى حسابك للمتابعة'
              : 'Sign in to your account to continue'}
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5 text-sm text-red-600"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="block mb-2 text-sm font-semibold text-[var(--azhar-green-deep)]">
              {locale === 'ar' ? 'البريد الإلكتروني' : 'Email'}
            </label>
            <div className="relative">
              <Mail size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--azhar-gold-leaf)] pointer-events-none" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="example@email.com"
                className="input-field !pl-4 !pr-12 !py-3.5 text-base"
                dir="auto"
              />
            </div>
          </div>

          <div>
            <label className="block mb-2 text-sm font-semibold text-[var(--azhar-green-deep)]">
              {locale === 'ar' ? 'كلمة المرور' : 'Password'}
            </label>
            <div className="relative">
              <Lock size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--azhar-gold-leaf)] pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
                className="input-field !pl-12 !pr-12 !py-3.5 text-base"
                dir="auto"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--athar-text-muted)] hover:text-[var(--azhar-green)] transition p-0.5"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-azhar w-full !py-3.5 text-base disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                {locale === 'ar' ? 'تسجيل الدخول' : 'Login'}
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-5 border-t border-[var(--athar-cream-dark)] text-center">
          <p className="text-sm text-[var(--athar-text-muted)] mb-3">
            {locale === 'ar' ? 'ليس لديك حساب؟' : "Don't have an account?"}
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate('/register/student')}
              className="btn-secondary text-sm !py-2.5"
            >
              <User size={16} />
              {locale === 'ar' ? 'طالب' : 'Student'}
            </button>
            <button
              onClick={() => navigate('/teacher/register')}
              className="btn-gold text-sm !py-2.5"
            >
              <User size={16} />
              {locale === 'ar' ? 'معلم' : 'Teacher'}
            </button>
          </div>
        </div>

        <div className="mt-5 text-center space-y-2">
          <button
            onClick={() => navigate('/setup-admin')}
            className="block w-full text-xs text-[var(--athar-text-muted)] hover:text-[var(--azhar-green)] transition cursor-pointer bg-transparent border-none"
          >
            {locale === 'ar' ? 'إعداد أدمن لأول مرة؟' : 'First-time admin setup?'}
          </button>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-1.5 text-sm text-[var(--azhar-green)] hover:text-[var(--azhar-green-deep)] underline underline-offset-2 transition cursor-pointer bg-transparent border-none"
          >
            <ArrowLeft size={14} />
            {locale === 'ar' ? 'العودة للصفحة الرئيسية' : 'Back to Home'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
