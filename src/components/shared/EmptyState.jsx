export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="empty-state-card animate-fade-up">
      {Icon && <Icon size={48} style={{ color: 'var(--primary-gold)', opacity: 0.7 }} />}
      <h3 style={{ fontSize: '1.2rem' }}>{title}</h3>
      {description && (
        <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', fontSize: '0.9rem', margin: '0 auto', lineHeight: '1.7' }}>
          {description}
        </p>
      )}
      {action}
    </div>
  );
}
