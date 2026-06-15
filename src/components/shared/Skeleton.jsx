export function Skeleton({ width, height, className = '', style = {} }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-[var(--athar-cream-dark)]/40 ${className}`}
      style={{
        width: width || '100%',
        height: height || '20px',
        ...style
      }}
    />
  );
}

export function SkeletonText({ lines = 3, className = '' }) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
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

export function SkeletonAvatar({ size = 48, className = '' }) {
  return (
    <div
      className={`animate-pulse rounded-full bg-[var(--athar-cream-dark)]/40 ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

export function SkeletonCard({ className = '' }) {
  return (
    <div className={`azhar-card flex flex-col gap-4 p-6 ${className}`}>
      <Skeleton height="24px" width="70%" />
      <SkeletonText lines={3} />
      <div className="flex gap-3 mt-2">
        <Skeleton height="36px" width="100px" />
        <Skeleton height="36px" width="100px" />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5, columns = 4, className = '' }) {
  return (
    <div className={`azhar-card overflow-hidden ${className}`}>
      <div className="p-4 border-b border-[var(--athar-cream-dark)]">
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} height="16px" />
          ))}
        </div>
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className={`p-4 ${i < rows - 1 ? 'border-b border-[var(--athar-cream-dark)]' : ''}`}
        >
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {Array.from({ length: columns }).map((_, j) => (
              <Skeleton key={j} height="14px" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonList({ items = 5, className = '' }) {
  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {Array.from({ length: items }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 p-3 bg-[var(--athar-surface)] rounded-xl border border-[var(--athar-cream-dark)]"
        >
          <SkeletonAvatar size={40} />
          <div className="flex-1">
            <Skeleton height="16px" width="60%" className="mb-2" />
            <Skeleton height="12px" width="40%" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonDashboard({ className = '' }) {
  return (
    <div className={`flex flex-col gap-6 ${className}`}>
      <div className="grid gap-5 grid-cols-[repeat(auto-fit,minmax(240px,1fr))]">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="azhar-card p-5">
            <Skeleton height="14px" width="60%" />
            <Skeleton height="32px" width="40%" className="mt-2" />
          </div>
        ))}
      </div>
      <div className="grid gap-5 grid-cols-[repeat(auto-fit,minmax(300px,1fr))]">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
}
