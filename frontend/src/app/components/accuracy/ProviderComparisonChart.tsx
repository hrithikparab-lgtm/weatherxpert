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
import { Bookmark } from "lucide-react";
import {
  PROVIDERS,
  METRICS,
  type MetricId,
  type TimeSeriesPoint,
  type Annotation,
  ANNOTATION_TYPES,
} from "./accuracyData";

/* ═══════════════════════════════════════════════════
   PROVIDER COMPARISON CHART
   Multi-line with error bands  ·  Annotations overlay
   ═══════════════════════════════════════════════════ */

interface ProviderComparisonChartProps {
  data: TimeSeriesPoint[];
  metricId: MetricId;
  selectedProviders: Set<string>;
  annotations: Annotation[];
  showErrorBands: boolean;
}

export function ProviderComparisonChart({
  data,
  metricId,
  selectedProviders,
  annotations,
  showErrorBands,
}: ProviderComparisonChartProps) {
  const [mounted, setMounted] = useState(false);
  const meta = METRICS.find((m) => m.id === metricId)!;
  const visibleProviders = PROVIDERS.filter((p) => selectedProviders.has(p.id));

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border/60 bg-secondary/10 flex items-center justify-between">
        <div>
          <h4 className="text-[12px] text-foreground font-medium">
            Provider Comparison — {meta.label}
          </h4>
          <p className="text-[9px] text-muted-foreground mt-0.5">{meta.description}</p>
        </div>
        <div className="flex items-center gap-1.5">
          {annotations.length > 0 && (
            <span className="flex items-center gap-1 text-[9px] text-muted-foreground font-medium px-1.5 py-0.5 rounded bg-secondary">
              <Bookmark className="w-2.5 h-2.5" />
              {annotations.length} events
            </span>
          )}
        </div>
      </div>

      <div className="px-4 py-3">
        <div className="h-[280px]" style={{ minHeight: 280 }}>
          {mounted ? (
          <ResponsiveContainer width="100%" height="100%" minHeight={280}>
            <ComposedChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" opacity={0.5} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 9, fill: "var(--muted-foreground)" }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 9, fill: "var(--muted-foreground)" }}
                tickLine={false}
                axisLine={false}
                domain={metricId === "correlation" ? [0.7, 1] : ["auto", "auto"]}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--popover)",
                  border: "1px solid var(--border)",
                  borderRadius: 10,
                  fontSize: 11,
                  color: "var(--foreground)",
                }}
                formatter={(value: number, name: string) => {
                  const prov = PROVIDERS.find((p) => p.id === name);
                  return [
                    `${value}${meta.unit}`,
                    prov?.name ?? name,
                  ];
                }}
              />
              <Legend
                verticalAlign="top"
                height={30}
                iconSize={8}
                wrapperStyle={{ fontSize: 10 }}
                formatter={(value: string) => {
                  const prov = PROVIDERS.find((p) => p.id === value);
                  return prov?.name ?? value;
                }}
              />

              {/* Annotation reference lines */}
              {annotations.map((ann) => {
                const typeConf = ANNOTATION_TYPES.find((t) => t.id === ann.type);
                return (
                  <ReferenceLine
                    key={ann.id}
                    x={ann.date}
                    stroke={typeConf?.color ?? "var(--muted-foreground)"}
                    strokeDasharray="4 3"
                    strokeWidth={1.5}
                    label={{
                      value: ann.label,
                      position: "insideTopRight",
                      fill: typeConf?.color ?? "var(--muted-foreground)",
                      fontSize: 8,
                    }}
                  />
                );
              })}

              {/* Error bands + lines per provider */}
              {visibleProviders.map((provider) => (
                <Area
                  key={`${provider.id}_band`}
                  type="monotone"
                  dataKey={`${provider.id}_upper`}
                  stroke="none"
                  fill={provider.color}
                  fillOpacity={showErrorBands ? 0.06 : 0}
                  name={`${provider.id}_upper`}
                  legendType="none"
                  tooltipType="none"
                />
              ))}

              {visibleProviders.map((provider) => (
                <Line
                  key={provider.id}
                  type="monotone"
                  dataKey={provider.id}
                  name={provider.id}
                  stroke={provider.color}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 2, fill: "var(--card)" }}
                />
              ))}
            </ComposedChart>
          </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-sm text-muted-foreground">Loading...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}