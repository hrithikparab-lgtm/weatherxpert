/* ═══════════════════════════════════════════════════
   RENEWABLES SKELETONS — Loading & empty states
   ═══════════════════════════════════════════════════ */

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`bg-secondary animate-pulse rounded ${className}`} />;
}

export function RenewablesFilterSkeleton() {
  return (
    <div className="sticky top-0 z-30 flex items-center gap-3 bg-background/95 backdrop-blur-md border-b border-border px-6 py-3">
      <Skeleton className="h-8 w-56 rounded-lg" />
      <Skeleton className="h-8 w-52 rounded-lg" />
      <Skeleton className="h-8 w-40 rounded-lg" />
      <Skeleton className="h-8 w-32 rounded-lg" />
      <div className="flex-1" />
      <Skeleton className="h-8 w-20 rounded-lg" />
    </div>
  );
}

export function AccuracyCardsSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border bg-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-7 w-7 rounded-lg" />
          </div>
          <Skeleton className="h-7 w-16" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-2.5 w-full" />
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div className="flex items-center gap-2.5">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-36" />
          </div>
        </div>
        <Skeleton className="h-6 w-20 rounded-md" />
      </div>
      <div className="px-5 pb-4">
        <Skeleton className="h-[280px] w-full rounded-lg" />
      </div>
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div className="flex items-center gap-2.5">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-52" />
          </div>
        </div>
        <Skeleton className="h-4 w-28" />
      </div>
      <div className="px-5 pb-4 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="h-7 w-7 rounded-lg" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function RenewablesPageSkeleton() {
  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <RenewablesFilterSkeleton />
      <div className="px-4 md:px-6 space-y-5 max-w-[1600px]">
        <div className="space-y-1.5">
          <Skeleton className="h-7 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <AccuracyCardsSkeleton />
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
        <ChartSkeleton />
        <TableSkeleton />
      </div>
    </div>
  );
}

export function RenewablesEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
        <svg
          className="w-8 h-8 text-muted-foreground"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
          />
        </svg>
      </div>
      <h3 className="text-[16px] text-foreground mb-1">No Renewable Data Available</h3>
      <p className="text-[13px] text-muted-foreground max-w-sm">
        There is no forecast or generation data for the selected site and date range. Try
        adjusting your filters or selecting a different plant.
      </p>
    </div>
  );
}
