import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Lock, Mail, Eye, EyeOff, ArrowRight } from 'lucide-react';
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

      localStorage.setItem('token', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('user', JSON.stringify(data.user));

      if (data.user.role === 'admin') {
        navigate('/admin');
      } else if (data.user.role === 'teacher') {
        navigate('/teacher/dashboard');
      } else if (data.user.role === 'guardian') {
        navigate('/guardian/dashboard');
      } else {
        navigate('/student/dashboard');
      }
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
          maxWidth: '480px', 
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
            {locale === 'ar' ? 'تسجيل الدخول' : 'Login'}
          </h2>
          <p style={{ color: '#718096', fontSize: '0.95rem' }}>
            {locale === 'ar' 
              ? 'ادخل إلى حسابك للمتابعة' 
              : 'Sign in to your account to continue'}
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

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
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
                {locale === 'ar' ? 'تسجيل الدخول' : 'Login'}
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
            {locale === 'ar' ? 'ليس لديك حساب؟' : "Don't have an account?"}
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button
              onClick={() => navigate('/register/student')}
              style={{
                padding: '10px 20px',
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
              <User size={16} style={{ display: 'inline', marginRight: '6px' }} />
              {locale === 'ar' ? 'طالب' : 'Student'}
            </button>
            <button
              onClick={() => navigate('/teacher/register')}
              style={{
                padding: '10px 20px',
                background: 'white',
                color: '#764ba2',
                border: '2px solid #764ba2',
                borderRadius: '10px',
                fontSize: '0.9rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
            >
              <User size={16} style={{ display: 'inline', marginRight: '6px' }} />
              {locale === 'ar' ? 'معلم' : 'Teacher'}
            </button>
          </div>
        </div>

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <button
            onClick={() => navigate('/setup-admin')}
            style={{ background: 'none', border: 'none', color: '#718096', fontSize: '0.85rem', cursor: 'pointer', marginBottom: '8px', display: 'block', width: '100%' }}
          >
            {locale === 'ar' ? 'إعداد أدمن لأول مرة؟' : 'First-time admin setup?'}
          </button>
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
