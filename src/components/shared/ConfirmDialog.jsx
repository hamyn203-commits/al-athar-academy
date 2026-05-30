import { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '../../context/AppProvider';

export default function ConfirmDialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText, 
  cancelText,
  type = 'warning',
  isLoading = false 
}) {
  const { t } = useAppContext();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e) => { 
      if (e.key === 'Escape' && !isLoading) onClose(); 
    };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose, isLoading]);

  const colors = {
    warning: { bg: 'rgba(251, 191, 36, 0.1)', border: '#f59e0b', icon: '#f59e0b' },
    danger: { bg: 'var(--danger-light)', border: 'var(--danger)', icon: 'var(--danger)' },
    info: { bg: 'rgba(166, 132, 83, 0.1)', border: 'var(--primary-gold)', icon: 'var(--primary-gold)' }
  };

  const color = colors[type] || colors.warning;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="modal-overlay"
          onClick={!isLoading ? onClose : undefined}
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-dialog-title"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25 }}
            className="modal-content"
            style={{ maxWidth: '440px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              className="modal-close" 
              onClick={onClose}
              disabled={isLoading}
              aria-label={t.common.close}
            >
              <X size={20} />
            </button>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: '20px',
              padding: '20px 0'
            }}>
              <div style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                background: color.bg,
                border: `2px solid ${color.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <AlertTriangle size={36} style={{ color: color.icon }} />
              </div>

              <div>
                <h3 
                  id="confirm-dialog-title"
                  style={{
                    fontSize: '1.3rem',
                    fontWeight: '800',
                    color: 'var(--text-primary)',
                    marginBottom: '8px'
                  }}
                >
                  {title || t.confirm?.title || 'تأكيد'}
                </h3>
                <p style={{
                  fontSize: '0.95rem',
                  color: 'var(--text-secondary)',
                  lineHeight: '1.7'
                }}>
                  {message || t.confirm?.message || 'هل أنت متأكد من هذا الإجراء؟'}
                </p>
              </div>

              <div style={{
                display: 'flex',
                gap: '12px',
                width: '100%',
                marginTop: '8px'
              }}>
                <button
                  onClick={onClose}
                  className="btn-premium-outline"
                  style={{ flex: 1, justifyContent: 'center' }}
                  disabled={isLoading}
                >
                  {cancelText || t.common.cancel || 'إلغاء'}
                </button>
                <button
                  onClick={onConfirm}
                  className="btn-premium"
                  style={{ 
                    flex: 1, 
                    justifyContent: 'center',
                    background: type === 'danger' ? 'var(--danger)' : undefined
                  }}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }} />
                  ) : (
                    confirmText || t.common.confirm || 'تأكيد'
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
