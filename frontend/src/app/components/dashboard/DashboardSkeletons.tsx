/* ═══════════════════════════════════════════════════
   DASHBOARD SKELETONS — Loading & empty states
   Uses theme tokens for dual-theme support
   ═══════════════════════════════════════════════════ */

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`bg-secondary animate-pulse rounded ${className}`} />;
}

/* ── Filter Bar Skeleton ── */
export function FilterBarSkeleton() {
  return (
    <div className="sticky top-0 z-30 flex items-center gap-3 bg-background/95 backdrop-blur-md border-b border-border px-6 py-3">
      <Skeleton className="h-8 w-36 rounded-lg" />
      <Skeleton className="h-8 w-40 rounded-lg" />
      <Skeleton className="h-8 w-28 rounded-lg" />
      <Skeleton className="h-8 w-48 rounded-lg" />
      <Skeleton className="h-8 w-28 rounded-lg" />
      <div className="flex-1" />
      <Skeleton className="h-8 w-20 rounded-lg" />
    </div>
  );
}

/* ── Alert Strip Skeleton ── */
export function AlertStripSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border bg-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-7 w-7 rounded-lg" />
          </div>
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-16" />
        </div>
      ))}
    </div>
  );
}

/* ── KPI Cards Skeleton ── */
export function KpiCardsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border bg-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-7 w-7 rounded-lg" />
          </div>
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-8 w-full" />
          <div className="flex items-center justify-between pt-2 border-t border-border/60">
            <Skeleton className="h-3 w-14" />
            <Skeleton className="h-3 w-12" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Chart Skeleton ── */
export function ChartSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div className="flex items-center gap-2.5">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-16 rounded-md" />
          <Skeleton className="h-6 w-16 rounded-md" />
          <Skeleton className="h-6 w-16 rounded-md" />
        </div>
      </div>
      <div className="px-5 pb-4">
        <Skeleton className="h-[320px] w-full rounded-lg" />
      </div>
    </div>
  );
}

/* ── Table Skeleton ── */
export function TableSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-28" />
        </div>
        <Skeleton className="h-4 w-16" />
      </div>
      <div className="px-5 pb-4 space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-14" />
            <Skeleton className="h-4 w-14 hidden lg:block" />
            <Skeleton className="h-4 w-14 hidden lg:block" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Playback Skeleton ── */
export function PlaybackSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div className="flex items-center gap-2.5">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-44" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
      </div>
      <div className="px-5 pb-3">
        <Skeleton className="w-full aspect-[2.2/1] rounded-lg" />
      </div>
      <div className="px-5 pb-5 space-y-3">
        <Skeleton className="h-1.5 w-full rounded-full" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-9 w-9 rounded-lg" />
            <Skeleton className="h-8 w-8 rounded-lg" />
          </div>
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    </div>
  );
}

/* ── Full Dashboard Skeleton ── */
export function DashboardPageSkeleton() {
  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <FilterBarSkeleton />
      <div className="px-4 md:px-6 space-y-5 max-w-[1600px]">
        <AlertStripSkeleton />
        <KpiCardsSkeleton />
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
          <div className="xl:col-span-3 min-w-0">
            <ChartSkeleton />
          </div>
          <div className="xl:col-span-2 min-w-0">
            <TableSkeleton />
          </div>
        </div>
        <PlaybackSkeleton />
      </div>
    </div>
  );
}

/* ── Empty State ── */
export function EmptyState({
  title = "No data available",
  description = "There is no weather data for the selected filters. Try adjusting your time range or location.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      </div>
      <h3 className="text-[16px] text-foreground mb-1">{title}</h3>
      <p className="text-[13px] text-muted-foreground max-w-sm">{description}</p>
    </div>
  );
}
