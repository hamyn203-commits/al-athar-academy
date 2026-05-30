export function Skeleton({ width, height, borderRadius = '8px', style = {} }) {
  return (
    <div
      className="skeleton"
      style={{
        width: width || '100%',
        height: height || '20px',
        borderRadius,
        ...style
      }}
    />
  );
}

export function SkeletonText({ lines = 3, style = {} }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', ...style }}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height="14px"
          width={i === lines - 1 ? '60%' : '100%'}
        />
      ))}
    </div>
  );
}

export function SkeletonAvatar({ size = 48, style = {} }) {
  return (
    <Skeleton
      width={`${size}px`}
      height={`${size}px`}
      borderRadius="50%"
      style={style}
    />
  );
}

export function SkeletonCard({ style = {} }) {
  return (
    <div
      className="premium-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        ...style
      }}
    >
      <Skeleton height="24px" width="70%" />
      <SkeletonText lines={3} />
      <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
        <Skeleton height="36px" width="100px" borderRadius="var(--radius-md)" />
        <Skeleton height="36px" width="100px" borderRadius="var(--radius-md)" />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5, columns = 4, style = {} }) {
  return (
    <div className="premium-card" style={{ padding: 0, overflow: 'hidden', ...style }}>
      <div style={{ padding: '16px', borderBottom: '1px solid var(--border-light)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: '16px' }}>
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} height="16px" />
          ))}
        </div>
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          style={{
            padding: '16px',
            borderBottom: i < rows - 1 ? '1px solid var(--border-light)' : 'none'
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: '16px' }}>
            {Array.from({ length: columns }).map((_, j) => (
              <Skeleton key={j} height="14px" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonList({ items = 5, style = {} }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', ...style }}>
      {Array.from({ length: items }).map((_, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px',
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-light)'
          }}
        >
          <SkeletonAvatar size={40} />
          <div style={{ flex: 1 }}>
            <Skeleton height="16px" width="60%" style={{ marginBottom: '8px' }} />
            <Skeleton height="12px" width="40%" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonDashboard({ style = {} }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', ...style }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="stat-card">
            <Skeleton height="14px" width="60%" />
            <Skeleton height="32px" width="40%" style={{ marginTop: '8px' }} />
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
}
