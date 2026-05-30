import { X } from 'lucide-react';

export default function VideoModal({ isOpen, onClose, video }) {
  if (!isOpen || !video) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '700px' }} onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="إغلاق الفيديو">
          <X size={20} />
        </button>
        <h3 style={{ marginBottom: '8px' }}>فيديو تعريفي</h3>
        <span className="badge-gold" style={{ display: 'inline-block', marginBottom: '16px' }}>{video.name}</span>
        <div style={{ position: 'relative', width: '100%', background: '#000', borderRadius: 'var(--radius-md)', overflow: 'hidden', aspectRatio: '16/9' }}>
          <video src={video.videoUrl} controls autoPlay style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
        <p style={{ marginTop: '16px', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.7' }}>{video.bio}</p>
      </div>
    </div>
  );
}
