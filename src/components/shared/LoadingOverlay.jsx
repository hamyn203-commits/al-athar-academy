import { Star } from 'lucide-react';

export default function LoadingOverlay({ message = 'جاري التحميل...' }) {
  return (
    <div className="loading-overlay" role="status" aria-live="polite">
      <div className="relative">
        <div className="spinner spinner-lg" />
        <Star size={16} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[var(--azhar-gold-leaf)]" fill="currentColor" />
      </div>
      <span style={{ color: 'var(--athar-text-muted)', fontWeight: 600, fontFamily: 'Amiri, serif' }}>{message}</span>
    </div>
  );
}
