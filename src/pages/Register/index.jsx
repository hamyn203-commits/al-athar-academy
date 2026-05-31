import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Lock, Mail, Phone, Eye, EyeOff, ArrowRight, CheckCircle } from 'lucide-react';
import Logo from '../../components/Logo';
import { useI18n } from '../../i18n';

export default function Register() {
  const navigate = useNavigate();
  const { locale } = useI18n();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
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

    // التحقق من تطابق كلمات المرور
    if (formData.password !== formData.confirmPassword) {
      setError(locale === 'ar' ? 'كلمات المرور غير متطابقة' : 'Passwords do not match');
      setLoading(false);
      return;
    }

    // التحقق من قوة كلمة المرور
    if (formData.password.length < 8) {
      setError(locale === 'ar' ? 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' : 'Password must be at least 8 characters');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          role: 'student'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'فشل إنشاء الحساب');
      }

      // حفظ الـ token وبيانات المستخدم
      localStorage.setItem('token', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));

      // التوجيه إلى لوحة الطالب
      navigate('/student/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '20px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }}
        className="glass-card"
        style={{ 
          width: '100%', 
          maxWidth: '520px', 
          padding: '40px 30px',
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '20px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <Logo size={80} showText={false} />
          <h2 style={{ 
            margin: '20px 0 8px', 
            fontSize: '2rem',
            fontWeight: 'bold',
            color: '#1a202c'
          }}>
            {locale === 'ar' ? 'إنشاء حساب طالب' : 'Create Student Account'}
          </h2>
          <p style={{ color: '#718096', fontSize: '0.95rem' }}>
            {locale === 'ar' 
              ? 'انضم إلى أكاديمية الأثر الطيب' 
              : 'Join Al-Athar Academy'}
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: '#fed7d7',
              border: '1px solid #fc8181',
              borderRadius: '10px',
              padding: '12px 16px',
              marginBottom: '20px',
              color: '#c53030',
              fontSize: '0.9rem'
            }}
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontSize: '0.9rem', 
              fontWeight: '600',
              color: '#2d3748'
            }}>
              {locale === 'ar' ? 'الاسم الكامل' : 'Full Name'}
            </label>
            <div style={{ position: 'relative' }}>
              <User size={20} style={{ 
                position: 'absolute', 
                right: '16px', 
                top: '50%', 
                transform: 'translateY(-50%)',
                color: '#a0aec0'
              }} />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder={locale === 'ar' ? 'أدخل اسمك الكامل' : 'Enter your full name'}
                style={{
                  width: '100%',
                  padding: '14px 50px 14px 16px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '10px',
                  fontSize: '1rem',
                  transition: 'all 0.3s',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>
          </div>

          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontSize: '0.9rem', 
              fontWeight: '600',
              color: '#2d3748'
            }}>
              {locale === 'ar' ? 'البريد الإلكتروني' : 'Email'}
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={20} style={{ 
                position: 'absolute', 
                right: '16px', 
                top: '50%', 
                transform: 'translateY(-50%)',
                color: '#a0aec0'
              }} />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder={locale === 'ar' ? 'example@email.com' : 'example@email.com'}
                style={{
                  width: '100%',
                  padding: '14px 50px 14px 16px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '10px',
                  fontSize: '1rem',
                  transition: 'all 0.3s',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>
          </div>

          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontSize: '0.9rem', 
              fontWeight: '600',
              color: '#2d3748'
            }}>
              {locale === 'ar' ? 'رقم الهاتف' : 'Phone Number'}
            </label>
            <div style={{ position: 'relative' }}>
              <Phone size={20} style={{ 
                position: 'absolute', 
                right: '16px', 
                top: '50%', 
                transform: 'translateY(-50%)',
                color: '#a0aec0'
              }} />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder={locale === 'ar' ? '+20 123 456 7890' : '+20 123 456 7890'}
                style={{
                  width: '100%',
                  padding: '14px 50px 14px 16px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '10px',
                  fontSize: '1rem',
                  transition: 'all 0.3s',
                  outline: 'none',
                  direction: 'ltr',
                  textAlign: 'right'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>
          </div>

          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontSize: '0.9rem', 
              fontWeight: '600',
              color: '#2d3748'
            }}>
              {locale === 'ar' ? 'كلمة المرور' : 'Password'}
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={20} style={{ 
                position: 'absolute', 
                right: '16px', 
                top: '50%', 
                transform: 'translateY(-50%)',
                color: '#a0aec0'
              }} />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder={locale === 'ar' ? '••••••••' : '••••••••'}
                style={{
                  width: '100%',
                  padding: '14px 50px 14px 50px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '10px',
                  fontSize: '1rem',
                  transition: 'all 0.3s',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#a0aec0',
                  padding: '4px'
                }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {formData.password && formData.password.length >= 8 && (
              <div style={{ 
                marginTop: '8px', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px',
                color: '#48bb78',
                fontSize: '0.85rem'
              }}>
                <CheckCircle size={16} />
                {locale === 'ar' ? 'كلمة مرور قوية' : 'Strong password'}
              </div>
            )}
          </div>

          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontSize: '0.9rem', 
              fontWeight: '600',
              color: '#2d3748'
            }}>
              {locale === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'}
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={20} style={{ 
                position: 'absolute', 
                right: '16px', 
                top: '50%', 
                transform: 'translateY(-50%)',
                color: '#a0aec0'
              }} />
              <input
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder={locale === 'ar' ? '••••••••' : '••••••••'}
                style={{
                  width: '100%',
                  padding: '14px 50px 14px 16px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '10px',
                  fontSize: '1rem',
                  transition: 'all 0.3s',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              background: loading ? '#cbd5e0' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.3s',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
              marginTop: '10px'
            }}
          >
            {loading ? (
              <div style={{ 
                width: '20px', 
                height: '20px', 
                border: '3px solid rgba(255, 255, 255, 0.3)',
                borderTop: '3px solid white',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
            ) : (
              <>
                {locale === 'ar' ? 'إنشاء الحساب' : 'Create Account'}
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        <div style={{ 
          marginTop: '30px', 
          textAlign: 'center',
          paddingTop: '20px',
          borderTop: '1px solid #e2e8f0'
        }}>
          <p style={{ color: '#718096', fontSize: '0.9rem', marginBottom: '10px' }}>
            {locale === 'ar' ? 'لديك حساب بالفعل؟' : 'Already have an account?'}
          </p>
          <button
            onClick={() => navigate('/login')}
            style={{
              padding: '10px 30px',
              background: 'white',
              color: '#667eea',
              border: '2px solid #667eea',
              borderRadius: '10px',
              fontSize: '0.9rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
          >
            {locale === 'ar' ? 'تسجيل الدخول' : 'Login'}
          </button>
        </div>

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <button
            onClick={() => navigate('/')}
            style={{
              background: 'none',
              border: 'none',
              color: '#667eea',
              fontSize: '0.9rem',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            {locale === 'ar' ? 'العودة للصفحة الرئيسية' : 'Back to Home'}
          </button>
        </div>
      </motion.div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
