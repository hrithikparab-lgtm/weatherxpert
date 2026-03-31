import { useMemo, useState, useEffect } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from "recharts";
import {
  X,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import {
  PARAMETERS,
  type TimeSeriesRow,
  type ParameterId,
} from "./historicalData";

/* ═══════════════════════════════════════════════════
   QUICK CHART — Inline chart preview for selected rows
   Forecast vs Actual overlay
   ═══════════════════════════════════════════════════ */

interface QuickChartProps {
  rows: TimeSeriesRow[];
  parameterId: ParameterId;
  onClose: () => void;
}

export function QuickChart({ rows, parameterId, onClose }: QuickChartProps) {
  const [mounted, setMounted] = useState(false);
  const param = PARAMETERS.find((p) => p.id === parameterId);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const chartData = useMemo(() => {
    const sorted = [...rows]
      .filter((r) => r.parameter === parameterId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    return sorted.map((r) => ({
      time: r.timestampIST,
      actual: r.actual,
      forecast: r.forecast,
      diff: r.diffPercent,
    }));
  }, [rows, parameterId]);

  if (chartData.length === 0) return null;

  // Stats
  const actualValues = chartData.map((d) => d.actual).filter((v): v is number => v !== null);
  const avgActual = actualValues.length > 0 ? actualValues.reduce((a, b) => a + b, 0) / actualValues.length : 0;
  const maxActual = actualValues.length > 0 ? Math.max(...actualValues) : 0;
  const minActual = actualValues.length > 0 ? Math.min(...actualValues) : 0;
  const avgDiff = chartData.filter((d) => d.diff !== null).reduce((a, b) => a + Math.abs(b.diff!), 0) / Math.max(chartData.filter((d) => d.diff !== null).length, 1);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/60 bg-secondary/20">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-3.5 h-3.5 text-primary" />
          <h4 className="text-[12px] text-foreground font-medium">
            {param?.label} — Quick Preview
          </h4>
          <span className="text-[9px] text-muted-foreground tabular-nums">
            {chartData.length} points
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-px bg-border/30 border-b border-border/40">
        {[
          { label: "Mean", value: `${avgActual.toFixed(1)}${param?.unit}` },
          { label: "Max", value: `${maxActual.toFixed(1)}${param?.unit}` },
          { label: "Min", value: `${minActual.toFixed(1)}${param?.unit}` },
          { label: "Avg |Diff|", value: `${avgDiff.toFixed(1)}%` },
        ].map((s) => (
          <div key={s.label} className="px-3 py-2 bg-card text-center">
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider">{s.label}</p>
            <p className="text-[13px] text-foreground tabular-nums mt-0.5">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="px-4 py-3">
        <div className="h-48" style={{ minHeight: 192 }}>
          {mounted ? (
          <ResponsiveContainer width="100%" height="100%" minHeight={192}>
            <ComposedChart data={chartData} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" opacity={0.5} />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 9, fill: "var(--muted-foreground)" }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 9, fill: "var(--muted-foreground)" }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--popover)",
                  border: "1px solid var(--border)",
                  borderRadius: 10,
                  fontSize: 11,
                  color: "var(--foreground)",
                }}
                formatter={(value: any, name: string) => [
                  `${value}${param?.unit ?? ""}`,
                  name === "actual" ? "Actual" : "Forecast",
                ]}
              />
              <Legend
                verticalAlign="top"
                height={24}
                iconSize={8}
                wrapperStyle={{ fontSize: 10 }}
              />
              <ReferenceLine y={avgActual} stroke="var(--muted-foreground)" strokeDasharray="6 3" strokeWidth={0.8} />
              <Area
                type="monotone"
                dataKey="forecast"
                name="Forecast"
                stroke="var(--chart-2)"
                strokeWidth={1.5}
                strokeDasharray="4 2"
                fill="var(--chart-2)"
                fillOpacity={0.06}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="actual"
                name="Actual"
                stroke={param?.color ?? "var(--chart-1)"}
                strokeWidth={2}
                dot={false}
                connectNulls={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-[12px]">
              Loading chart...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}