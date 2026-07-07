interface SkeletonProps {
  className?: string;
  rounded?: string;
}

export function Skeleton({ className = '', rounded = 'rounded-lg' }: SkeletonProps) {
  return <div className={`shimmer ${rounded} ${className}`} />;
}

export function SkeletonCard({ lines: _lines = 3 }: { lines?: number }) {
  return (
    <div className="glass-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-10" rounded="rounded-xl" />
      </div>
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-3 w-40" />
    </div>
  );
}

export function SkeletonRow({ columns = 4 }: { columns?: number }) {
  return (
    <div className="flex items-center gap-4 px-6 py-4">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} className={`h-4 flex-1`} />
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-0">
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonRow key={i} columns={columns} />
      ))}
    </div>
  );
}

export function SkeletonChart({ height = 'h-64' }: { height?: string }) {
  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-3 w-48" />
        </div>
        <Skeleton className="h-8 w-24" rounded="rounded-lg" />
      </div>
      <Skeleton className={`${height} w-full`} rounded="rounded-xl" />
    </div>
  );
}
