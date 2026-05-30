import { Play, Pause } from 'lucide-react';

export default function AudioPlayer({ isActive, isPlaying, progress, onToggle }) {
  return (
    <div className="audio-player-custom" style={{ minWidth: '240px' }}>
      <button
        onClick={onToggle}
        aria-label={isPlaying ? 'إيقاف التشغيل' : 'تشغيل'}
        style={{
          background: 'var(--primary-gold)',
          border: 'none',
          width: '38px',
          height: '38px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: '#fff',
          flexShrink: 0,
          transition: 'transform 0.15s ease, box-shadow 0.15s ease',
          boxShadow: isPlaying ? '0 0 12px var(--primary-gold-glow)' : 'none',
        }}
      >
        {isActive && isPlaying ? <Pause size={18} /> : <Play size={18} style={{ marginRight: '2px' }} />}
      </button>
      <div style={{ flex: 1 }}>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>تلاوة صوتية نموذجية</span>
        <div className="progress-bar" style={{ marginTop: '6px', height: '4px' }}>
          <div className="progress-bar-fill" style={{ width: `${isActive ? progress : 0}%`, transition: 'width 0.15s linear' }} />
        </div>
      </div>
      {isActive && isPlaying && (
        <div style={{ display: 'flex', gap: '3px', alignItems: 'flex-end', height: '18px' }}>
          {[8, 14, 6].map((h, i) => (
            <div key={i} className="eq-bar" style={{ width: '2px', background: 'var(--primary-gold)', height: `${h}px`, animationDelay: `${i * 0.2}s` }} />
          ))}
        </div>
      )}
    </div>
  );
}
