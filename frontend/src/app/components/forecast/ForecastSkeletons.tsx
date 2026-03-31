/* ═══════════════════════════════════════════════════
   FORECAST EXPLORER SKELETONS — Loading & empty states
   ═══════════════════════════════════════════════════ */

function Sk({ className = "" }: { className?: string }) {
  return <div className={`bg-secondary animate-pulse rounded ${className}`} />;
}

export function ForecastPageSkeleton() {
  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Filter skeleton */}
      <div className="sticky top-0 z-30 flex items-center gap-3 bg-background/95 backdrop-blur-md border-b border-border px-6 py-3">
        <Sk className="h-8 w-36 rounded-lg" />
        <Sk className="h-8 w-40 rounded-lg" />
        <Sk className="h-8 w-28 rounded-lg" />
        <Sk className="h-8 w-36 rounded-lg" />
        <div className="flex-1" />
        <Sk className="h-8 w-20 rounded-lg" />
      </div>

      <div className="px-4 md:px-6 space-y-5 max-w-[1600px]">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1.5">
            <Sk className="h-7 w-56" />
            <Sk className="h-4 w-96" />
          </div>
          <div className="flex gap-2">
            <Sk className="h-8 w-24 rounded-lg" />
            <Sk className="h-8 w-24 rounded-lg" />
          </div>
        </div>

        {/* Tabs */}
        <Sk className="h-10 w-[520px] rounded-lg" />

        {/* Chart + Table */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-2">
            <div className="rounded-xl border border-border bg-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Sk className="h-8 w-8 rounded-lg" />
                  <div className="space-y-1">
                    <Sk className="h-4 w-44" />
                    <Sk className="h-3 w-32" />
                  </div>
                </div>
                <Sk className="h-7 w-28 rounded-lg" />
              </div>
              <div className="flex gap-1.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Sk key={i} className="h-6 w-20 rounded-full" />
                ))}
              </div>
              <Sk className="h-[340px] w-full rounded-lg" />
            </div>
          </div>
          <div className="xl:col-span-1">
            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Sk className="h-4 w-28" />
                  <Sk className="h-3 w-20" />
                </div>
                <Sk className="h-7 w-16 rounded-lg" />
              </div>
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Sk className="h-3.5 w-12" />
                  <Sk className="h-3.5 w-10" />
                  <Sk className="h-3.5 w-10" />
                  <Sk className="h-3.5 w-10" />
                  <Sk className="h-3.5 w-10" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ForecastEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
      </div>
      <h3 className="text-[16px] text-foreground mb-1">No Forecast Data</h3>
      <p className="text-[13px] text-muted-foreground max-w-sm">
        No forecast model output available for the selected filters and time range. Try adjusting
        your date range or selecting a different provider.
      </p>
    </div>
  );
}
