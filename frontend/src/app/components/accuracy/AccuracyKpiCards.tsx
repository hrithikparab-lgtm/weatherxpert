import {
  TrendingUp,
  TrendingDown,
  Minus,
  Activity,
  Target,
  GitBranch,
  Gauge,
  Sigma,
} from "lucide-react";
import {
  METRICS,
  type KpiSnapshot,
  type MetricId,
} from "./accuracyData";

/* ═══════════════════════════════════════════════════
   KPI CARDS — MAE, RMSE, MBE, Bias, Correlation
   Change vs previous period  ·  Click to select metric
   ═══════════════════════════════════════════════════ */

const METRIC_ICONS: Record<MetricId, React.ElementType> = {
  mae: Target,
  rmse: Activity,
  mbe: GitBranch,
  bias: Gauge,
  correlation: Sigma,
};

interface AccuracyKpiCardsProps {
  kpis: KpiSnapshot[];
  activeMetric: MetricId;
  onSelectMetric: (id: MetricId) => void;
}

export function AccuracyKpiCards({ kpis, activeMetric, onSelectMetric }: AccuracyKpiCardsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {kpis.map((kpi) => {
        const meta = METRICS.find((m) => m.id === kpi.metricId)!;
        const Icon = METRIC_ICONS[kpi.metricId];
        const isActive = activeMetric === kpi.metricId;
        const isImproved = meta.lowerIsBetter ? kpi.changePercent < 0 : kpi.changePercent > 0;
        const changeMag = Math.abs(kpi.changePercent);

        return (
          <button
            key={kpi.metricId}
            onClick={() => onSelectMetric(kpi.metricId)}
            className={`text-left rounded-xl border transition-all p-3.5 group ${
              isActive
                ? "bg-primary/6 border-primary/20 ring-1 ring-primary/10 shadow-sm"
                : "bg-card border-border hover:border-primary/15 hover:bg-card/80"
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                isActive ? "bg-primary/12 text-primary" : "bg-secondary text-muted-foreground"
              }`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
              {isActive && (
                <span className="text-[8px] text-primary font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary/8">
                  Active
                </span>
              )}
            </div>

            {/* Value */}
            <div className="text-[22px] text-foreground tabular-nums tracking-tight leading-none">
              {kpi.metricId === "correlation"
                ? kpi.value.toFixed(3)
                : kpi.value.toFixed(2)}
              {meta.unit && <span className="text-[12px] text-muted-foreground ml-0.5">{meta.unit}</span>}
            </div>

            {/* Label */}
            <p className="text-[10px] text-muted-foreground font-medium mt-1">{meta.label}</p>

            {/* Change badge */}
            <div className="flex items-center gap-1 mt-2">
              {isImproved ? (
                <div className="flex items-center gap-0.5 text-chart-3">
                  <TrendingUp className="w-3 h-3" />
                  <span className="text-[10px] font-medium tabular-nums">{changeMag.toFixed(1)}%</span>
                </div>
              ) : kpi.changePercent === 0 ? (
                <div className="flex items-center gap-0.5 text-muted-foreground">
                  <Minus className="w-3 h-3" />
                  <span className="text-[10px] font-medium">No change</span>
                </div>
              ) : (
                <div className="flex items-center gap-0.5 text-destructive">
                  <TrendingDown className="w-3 h-3" />
                  <span className="text-[10px] font-medium tabular-nums">{changeMag.toFixed(1)}%</span>
                </div>
              )}
              <span className="text-[9px] text-muted-foreground/50">vs prev.</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
