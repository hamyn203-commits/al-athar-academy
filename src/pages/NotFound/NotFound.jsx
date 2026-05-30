import { useNavigate, Link } from 'react-router-dom';
import { Home, Search, ArrowRight, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import Logo from '../../components/Logo';
import { useAppContext } from '../../context/AppProvider';

export default function NotFoundPage() {
  const navigate = useNavigate();
  const { t } = useAppContext();

  const suggestions = [
    { icon: Home, label: t.notFound?.suggestions?.home || 'الصفحة الرئيسية', path: '/' },
    { icon: BookOpen, label: t.notFound?.suggestions?.student || 'بوابة الطالب', path: '/student' },
    { icon: BookOpen, label: t.notFound?.suggestions?.teacher || 'بوابة المعلم', path: '/teacher' },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-main)',
      padding: '40px 20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div className="bg-particle" style={{ top: '10%', left: '15%', width: '300px', height: '300px' }} />
      <div className="bg-particle" style={{ bottom: '10%', right: '15%', width: '350px', height: '350px' }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          maxWidth: '680px',
          width: '100%',
          textAlign: 'center',
          position: 'relative',
          zIndex: 1
        }}
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
          style={{ marginBottom: '32px' }}
        >
          <Logo size={80} showText={false} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          style={{
            fontSize: 'clamp(6rem, 20vw, 12rem)',
            fontWeight: '900',
            lineHeight: '1',
            marginBottom: '16px',
            fontFamily: 'var(--font-arabic-heading)'
          }}
          className="text-gradient-gold"
        >
          404
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          style={{
            fontSize: 'clamp(1.5rem, 4vw, 2.2rem)',
            fontWeight: '800',
            color: 'var(--text-primary)',
            marginBottom: '16px'
          }}
        >
          {t.notFound?.title || 'الصفحة غير موجودة'}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          style={{
            fontSize: '1.05rem',
            color: 'var(--text-secondary)',
            marginBottom: '40px',
            lineHeight: '1.8',
            maxWidth: '500px',
            margin: '0 auto 40px'
          }}
        >
          {t.notFound?.description || 'عذراً، لم نتمكن من العثور على الصفحة التي تبحث عنها. ربما تم نقلها أو حذفها.'}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '24px'
          }}
        >
          <button
            onClick={() => navigate('/')}
            className="btn-premium"
            style={{
              padding: '16px 32px',
              fontSize: '1rem',
              justifyContent: 'center',
              width: '100%',
              maxWidth: '320px',
              margin: '0 auto'
            }}
          >
            <Home size={20} />
            {t.notFound?.backHome || 'العودة للرئيسية'}
          </button>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <span style={{
              fontSize: '0.85rem',
              color: 'var(--text-muted)',
              fontWeight: '600'
            }}>
              {t.notFound?.tryInstead || 'أو جرب أحد هذه الروابط:'}
            </span>
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              {suggestions.map((item, i) => (
                <Link
                  key={i}
                  to={item.path}
                  className="btn-premium-outline"
                  style={{
                    padding: '10px 20px',
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <item.icon size={16} />
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          style={{
            marginTop: '48px',
            padding: '20px',
            background: 'var(--bg-elevated)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-light)'
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: '8px',
            color: 'var(--primary-gold)'
          }}>
            <Search size={18} />
            <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>
              {t.notFound?.needHelp || 'تحتاج مساعدة؟'}
            </span>
          </div>
          <p style={{
            fontSize: '0.85rem',
            color: 'var(--text-secondary)',
            margin: 0
          }}>
            {t.notFound?.contactUs || 'تواصل معنا وسنساعدك في العثور على ما تبحث عنه'}
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
