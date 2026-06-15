import { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, Star } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose, duration = 3000 }) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      setTimeout(onClose, 300);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = { success: CheckCircle, error: AlertCircle, info: Star };
  const colors = {
    success: 'var(--azhar-green)',
    error: 'var(--clay-terracotta)',
    info: 'var(--azhar-gold-leaf)'
  };
  const Icon = icons[type] || Info;

  return (
    <div className={`toast ${type} ${show ? 'show' : ''}`} role="alert" aria-live="polite">
      <Icon size={20} style={{ color: colors[type] }} />
      <span>{message}</span>
    </div>
  );
}
