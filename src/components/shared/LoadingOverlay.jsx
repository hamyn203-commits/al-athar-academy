export default function LoadingOverlay({ message = 'جاري التحميل...' }) {
  return (
    <div className="loading-overlay" role="status" aria-live="polite">
      <div className="spinner spinner-lg" />
      <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{message}</span>
    </div>
  );
}
