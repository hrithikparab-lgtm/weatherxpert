import { useState } from "react";
import {
  ChevronUp,
  ChevronDown,
  Trophy,
  ExternalLink,
  Medal,
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area } from "recharts";

/* ═══════════════════════════════════════════════════
   PROVIDER COMPARISON TABLE — Ranking, accuracy %,
   last-30-day MAE · Horizontal scroll on mobile
   ═══════════════════════════════════════════════════ */

interface ProviderData {
  rank: number;
  name: string;
  type: string;
  accuracy: number;
  mae: number;
  rmse: number;
  mbe: number;
  correlation: number;
  sparkline: number[];
  trend: "improving" | "stable" | "declining";
  updated: string;
}

const SOLAR_PROVIDERS: ProviderData[] = [
  {
    rank: 1,
    name: "Tomorrow.io",
    type: "Global API",
    accuracy: 95.8,
    mae: 4.2,
    rmse: 6.8,
    mbe: -1.3,
    correlation: 0.94,
    sparkline: [6.5, 5.8, 5.2, 4.9, 4.6, 4.3, 4.2],
    trend: "improving",
    updated: "2h ago",
  },
  {
    rank: 2,
    name: "IMD",
    type: "Regional NWP",
    accuracy: 91.3,
    mae: 8.7,
    rmse: 11.4,
    mbe: +1.5,
    correlation: 0.89,
    sparkline: [10.2, 9.8, 9.5, 9.2, 9.0, 8.8, 8.7],
    trend: "stable",
    updated: "4h ago",
  },
];

const WIND_PROVIDERS: ProviderData[] = [
  {
    rank: 1,
    name: "Tomorrow.io",
    type: "Global API",
    accuracy: 93.2,
    mae: 1.8,
    rmse: 2.4,
    mbe: +0.4,
    correlation: 0.91,
    sparkline: [2.8, 2.5, 2.2, 2.0, 1.9, 1.8, 1.8],
    trend: "improving",
    updated: "2h ago",
  },
  {
    rank: 2,
    name: "IMD",
    type: "Regional NWP",
    accuracy: 88.7,
    mae: 3.0,
    rmse: 3.9,
    mbe: +1.2,
    correlation: 0.86,
    sparkline: [4.0, 3.7, 3.5, 3.3, 3.2, 3.1, 3.0],
    trend: "stable",
    updated: "4h ago",
  },
];

function TinySparkline({ data, color }: { data: number[]; color: string }) {
  const chartData = data.map((v, i) => ({ v, i }));
  return (
    <div className="w-20 h-6" style={{ minHeight: 24 }}>
      <ResponsiveContainer width="100%" height="100%" minHeight={24}>
        <AreaChart data={chartData} margin={{ top: 1, right: 0, left: 0, bottom: 1 }}>
          <Area
            type="monotone"
            dataKey="v"
            stroke={color}
            strokeWidth={1.5}
            fill={color}
            fillOpacity={0.1}
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

const trendConfig = {
  improving: { color: "text-chart-3", label: "Improving" },
  stable: { color: "text-muted-foreground", label: "Stable" },
  declining: { color: "text-destructive", label: "Declining" },
};

const rankBadge = (rank: number) => {
  if (rank === 1)
    return "bg-chart-2/15 text-chart-2 border-chart-2/25";
  if (rank === 2)
    return "bg-muted text-muted-foreground border-border";
  if (rank === 3)
    return "bg-orange-500/10 text-orange-500 dark:text-orange-400 border-orange-500/20";
  return "bg-secondary text-muted-foreground border-border";
};

type SortKey = "rank" | "accuracy" | "mae" | "rmse" | "correlation";

interface ProviderComparisonTableProps {
  isSolar: boolean;
}

export function ProviderComparisonTable({ isSolar }: ProviderComparisonTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("rank");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const providers = isSolar ? SOLAR_PROVIDERS : WIND_PROVIDERS;

  const sorted = [...providers].sort((a, b) => {
    const aVal = a[sortKey];
    const bVal = b[sortKey];
    return sortDir === "asc" ? aVal - bVal : bVal - aVal;
  });

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir(key === "mae" || key === "rmse" || key === "rank" ? "asc" : "desc");
    }
  };

  const SortHeader = ({
    label,
    field,
    className = "",
  }: {
    label: string;
    field: SortKey;
    className?: string;
  }) => (
    <button
      onClick={() => handleSort(field)}
      className={`flex items-center gap-0.5 text-[11px] text-muted-foreground font-semibold uppercase tracking-wider hover:text-foreground transition-colors whitespace-nowrap ${className}`}
    >
      {label}
      {sortKey === field &&
        (sortDir === "asc" ? (
          <ChevronUp className="w-3 h-3 text-primary" />
        ) : (
          <ChevronDown className="w-3 h-3 text-primary" />
        ))}
    </button>
  );

  return (
    <div className="rounded-xl border border-border bg-card transition-colors duration-200">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-chart-2/10 ring-1 ring-chart-2/20 flex items-center justify-center">
            <Trophy className="w-4 h-4 text-chart-2" />
          </div>
          <div>
            <h3 className="text-[14px] text-foreground font-medium">
              Provider Comparison
            </h3>
            <p className="text-[11px] text-muted-foreground">
              Last 30 days · {isSolar ? "Solar" : "Wind"} forecast accuracy ranking
            </p>
          </div>
        </div>
        <button className="flex items-center gap-1 text-[11px] text-primary hover:text-primary/80 transition-colors font-medium">
          View detailed analytics
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>

      {/* Table — horizontal scroll on mobile */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px]">
          <thead>
            <tr className="border-t border-b border-border/60">
              <th className="px-5 py-2.5 text-left">
                <SortHeader label="Rank" field="rank" />
              </th>
              <th className="px-3 py-2.5 text-left text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">
                Provider
              </th>
              <th className="px-3 py-2.5 text-left">
                <SortHeader label="Accuracy" field="accuracy" />
              </th>
              <th className="px-3 py-2.5 text-left">
                <SortHeader
                  label={isSolar ? "MAE (%)" : "MAE (m/s)"}
                  field="mae"
                />
              </th>
              <th className="px-3 py-2.5 text-left">
                <SortHeader
                  label={isSolar ? "RMSE (%)" : "RMSE (m/s)"}
                  field="rmse"
                />
              </th>
              <th className="px-3 py-2.5 text-left">
                <SortHeader label="R²" field="correlation" />
              </th>
              <th className="px-3 py-2.5 text-center text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">
                30d MAE Trend
              </th>
              <th className="px-3 py-2.5 text-right pr-5 text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((p) => {
              const trend = trendConfig[p.trend];
              return (
                <tr
                  key={p.name}
                  className="border-b border-border/40 last:border-0 hover:bg-secondary/30 transition-colors"
                >
                  {/* Rank */}
                  <td className="px-5 py-3">
                    <span
                      className={`inline-flex items-center justify-center w-7 h-7 rounded-lg border text-[12px] font-semibold tabular-nums ${rankBadge(
                        p.rank
                      )}`}
                    >
                      {p.rank === 1 ? (
                        <Medal className="w-3.5 h-3.5" />
                      ) : (
                        p.rank
                      )}
                    </span>
                  </td>

                  {/* Provider */}
                  <td className="px-3 py-3">
                    <div>
                      <span className="text-[13px] text-foreground font-medium">
                        {p.name}
                      </span>
                      <p className="text-[10px] text-muted-foreground">{p.type}</p>
                    </div>
                  </td>

                  {/* Accuracy */}
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] text-foreground font-medium tabular-nums">
                        {p.accuracy}%
                      </span>
                      <div className="hidden lg:block w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-chart-3"
                          style={{ width: `${p.accuracy}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* MAE */}
                  <td className="px-3 py-3">
                    <span className="text-[13px] text-foreground tabular-nums">
                      {p.mae}
                    </span>
                  </td>

                  {/* RMSE */}
                  <td className="px-3 py-3">
                    <span className="text-[12px] text-muted-foreground tabular-nums">
                      {p.rmse}
                    </span>
                  </td>

                  {/* Correlation */}
                  <td className="px-3 py-3">
                    <span className="text-[12px] text-muted-foreground tabular-nums">
                      {p.correlation.toFixed(2)}
                    </span>
                  </td>

                  {/* Sparkline */}
                  <td className="px-3 py-3">
                    <div className="flex justify-center">
                      <TinySparkline
                        data={p.sparkline}
                        color={
                          p.trend === "improving"
                            ? "var(--chart-3)"
                            : p.trend === "declining"
                            ? "var(--chart-5)"
                            : "var(--muted-foreground)"
                        }
                      />
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-3 py-3 pr-5">
                    <div className="flex items-center justify-end gap-1.5">
                      <span className={`text-[11px] font-medium ${trend.color}`}>
                        {trend.label}
                      </span>
                      <span className="text-[10px] text-muted-foreground/60">
                        · {p.updated}
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}