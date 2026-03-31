import { WifiOff, ShieldCheck, AlertTriangle } from "lucide-react";

/* ═══════════════════════════════════════════════════
   ALERTS SKELETONS — Loading, empty, server-down
   ═══════════════════════════════════════════════════ */

function Sk({ className = "" }: { className?: string }) {
  return <div className={`bg-secondary animate-pulse rounded ${className}`} />;
}

export function AlertsPageSkeleton() {
  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Filter bar */}
      <div className="sticky top-0 z-30 flex items-center gap-3 bg-background/95 backdrop-blur-md border-b border-border px-6 py-3">
        <Sk className="h-8 w-44 rounded-lg" />
        <Sk className="h-8 w-32 rounded-lg" />
        <Sk className="h-8 w-32 rounded-lg" />
        <Sk className="h-8 w-36 rounded-lg" />
        <div className="flex-1" />
        <Sk className="h-8 w-20 rounded-lg" />
      </div>

      <div className="px-4 md:px-6 space-y-5 max-w-[1600px]">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1.5">
            <Sk className="h-7 w-48" />
            <Sk className="h-4 w-72" />
          </div>
          <div className="flex gap-2">
            <Sk className="h-8 w-20 rounded-lg" />
            <Sk className="h-8 w-20 rounded-lg" />
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-4 space-y-2">
              <Sk className="h-3 w-20" />
              <Sk className="h-7 w-12" />
            </div>
          ))}
        </div>

        {/* Alert cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-4 space-y-3">
              <div className="flex items-start gap-3">
                <Sk className="h-9 w-9 rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="flex gap-1.5">
                    <Sk className="h-4 w-14 rounded" />
                    <Sk className="h-4 w-12 rounded" />
                  </div>
                  <Sk className="h-4 w-full" />
                </div>
              </div>
              <div className="flex gap-3">
                <Sk className="h-3 w-28" />
                <Sk className="h-3 w-16" />
              </div>
              <Sk className="h-8 w-full rounded" />
              <div className="flex gap-1.5 pt-1 border-t border-border/50">
                <Sk className="h-6 w-12 rounded-md" />
                <Sk className="h-6 w-14 rounded-md" />
                <Sk className="h-6 w-16 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function NoAlertsState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-chart-3/10 ring-1 ring-chart-3/20 flex items-center justify-center mb-4">
        <ShieldCheck className="w-8 h-8 text-chart-3" />
      </div>
      <h3 className="text-[16px] text-foreground mb-1">All Clear</h3>
      <p className="text-[13px] text-muted-foreground max-w-sm">
        There are no active alerts matching your filters. All systems are operating normally.
        Alerts will appear here when weather conditions require attention.
      </p>
    </div>
  );
}

export function ServerDownState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-destructive/10 ring-1 ring-destructive/20 flex items-center justify-center mb-4">
        <WifiOff className="w-8 h-8 text-destructive" />
      </div>
      <h3 className="text-[16px] text-foreground mb-1">Alert Server Unreachable</h3>
      <p className="text-[13px] text-muted-foreground max-w-sm mb-4">
        Unable to connect to the alert notification server. This may be due to a network issue
        or scheduled maintenance. Alerts may be delayed.
      </p>
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-[13px] font-medium hover:bg-primary/90 transition-colors"
      >
        Retry Connection
      </button>
      <div className="mt-4 flex items-center gap-2">
        <AlertTriangle className="w-3.5 h-3.5 text-chart-2" />
        <span className="text-[11px] text-muted-foreground">
          Last successful sync: 12 minutes ago
        </span>
      </div>
    </div>
  );
}
