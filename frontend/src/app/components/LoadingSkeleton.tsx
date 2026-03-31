interface SkeletonProps {
  className?: string;
}

function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div className={`bg-[#e5e7eb] rounded animate-pulse ${className}`} />
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-md border border-[#E5E7EB] p-4 space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
      <Skeleton className="h-7 w-16" />
      <Skeleton className="h-2.5 w-28" />
      <Skeleton className="h-2.5 w-20" />
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="bg-white rounded-md border border-[#E5E7EB] p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-2.5 w-48" />
        </div>
        <Skeleton className="h-7 w-36 rounded-md" />
      </div>
      <Skeleton className="h-56 w-full rounded" />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white rounded-md border border-[#E5E7EB]">
      <div className="px-4 py-3 border-b border-[#E5E7EB] flex items-center justify-between">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-7 w-24 rounded-md" />
      </div>
      <div className="p-4 space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 flex-1" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="p-4 md:p-6 space-y-4 max-w-[1600px]">
      <Skeleton className="h-3 w-40" />
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Skeleton className="h-5 w-56" />
          <Skeleton className="h-3 w-72" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-28 rounded-md" />
          <Skeleton className="h-8 w-28 rounded-md" />
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
      <ChartSkeleton />
      <TableSkeleton />
    </div>
  );
}

export { Skeleton };
