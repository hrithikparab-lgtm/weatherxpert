import { useState } from "react";
import {
  ChevronUp,
  ChevronDown,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area } from "recharts";
import { toast } from "sonner";

/* ═══════════════════════════════════════════════════
   BLOCK-WISE TABLE — Top 10 blocks with sparklines
   ═══════════════════════════════════════════════════ */

interface BlockData {
  rank: number;
  block: string;
  zone: string;
  temp: number;
  humidity: number;
  wind: number;
  rainfall: number;
  risk: "critical" | "high" | "medium" | "low";
  sparkline: number[];
}

const BLOCK_DATA: BlockData[] = [
  { rank: 1, block: "Colaba", zone: "South Mumbai", temp: 38.2, humidity: 82, wind: 28, rainfall: 8.4, risk: "critical", sparkline: [32, 34, 35, 37, 38, 38.2] },
  { rank: 2, block: "Bandra", zone: "Western", temp: 37.8, humidity: 79, wind: 25, rainfall: 6.2, risk: "high", sparkline: [31, 33, 35, 36, 37, 37.8] },
  { rank: 3, block: "Andheri", zone: "Western", temp: 37.5, humidity: 76, wind: 22, rainfall: 5.8, risk: "high", sparkline: [30, 32, 34, 36, 37, 37.5] },
  { rank: 4, block: "Thane", zone: "Eastern", temp: 37.1, humidity: 80, wind: 20, rainfall: 4.5, risk: "medium", sparkline: [29, 31, 33, 35, 36, 37.1] },
  { rank: 5, block: "Dadar", zone: "Central", temp: 36.8, humidity: 78, wind: 18, rainfall: 3.2, risk: "medium", sparkline: [30, 31, 33, 34, 36, 36.8] },
  { rank: 6, block: "Kurla", zone: "Central", temp: 36.5, humidity: 75, wind: 19, rainfall: 4.1, risk: "medium", sparkline: [29, 30, 32, 34, 35, 36.5] },
  { rank: 7, block: "Borivali", zone: "Western", temp: 36.2, humidity: 74, wind: 16, rainfall: 2.8, risk: "low", sparkline: [28, 30, 32, 34, 35, 36.2] },
  { rank: 8, block: "Vashi", zone: "Navi Mumbai", temp: 35.8, humidity: 77, wind: 24, rainfall: 5.0, risk: "medium", sparkline: [27, 29, 31, 33, 35, 35.8] },
  { rank: 9, block: "Panvel", zone: "Navi Mumbai", temp: 35.4, humidity: 72, wind: 14, rainfall: 2.2, risk: "low", sparkline: [26, 28, 30, 32, 34, 35.4] },
  { rank: 10, block: "Mulund", zone: "Eastern", temp: 35.1, humidity: 73, wind: 15, rainfall: 1.8, risk: "low", sparkline: [27, 29, 31, 33, 34, 35.1] },
];

const riskConfig = {
  critical: {
    icon: AlertTriangle,
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    label: "Critical",
  },
  high: {
    icon: AlertCircle,
    color: "text-orange-600 dark:text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
    label: "High",
  },
  medium: {
    icon: AlertCircle,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    label: "Medium",
  },
  low: {
    icon: CheckCircle2,
    color: "text-chart-3",
    bg: "bg-chart-3/10",
    border: "border-chart-3/20",
    label: "Low",
  },
};

type SortKey = "temp" | "humidity" | "wind" | "rainfall" | "risk";

function TinySparkline({ data, risk }: { data: number[]; risk: string }) {
  const chartData = data.map((v, i) => ({ v, i }));
  const color = risk === "critical" || risk === "high" ? "var(--chart-5)" : "var(--chart-1)";
  return (
    <div className="w-16 h-6" style={{ minHeight: 24 }}>
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

export function BlockwiseTable() {
  const [sortKey, setSortKey] = useState<SortKey>("temp");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const riskOrder = { critical: 4, high: 3, medium: 2, low: 1 };

  const sorted = [...BLOCK_DATA].sort((a, b) => {
    let aVal: number, bVal: number;
    if (sortKey === "risk") {
      aVal = riskOrder[a.risk];
      bVal = riskOrder[b.risk];
    } else {
      aVal = a[sortKey];
      bVal = b[sortKey];
    }
    return sortDir === "desc" ? bVal - aVal : aVal - bVal;
  });

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    else {
      setSortKey(key);
      setSortDir("desc");
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
      className={`flex items-center gap-0.5 text-[11px] text-muted-foreground font-semibold uppercase tracking-wider hover:text-foreground transition-colors ${className}`}
    >
      {label}
      {sortKey === field &&
        (sortDir === "desc" ? (
          <ChevronDown className="w-3 h-3 text-primary" />
        ) : (
          <ChevronUp className="w-3 h-3 text-primary" />
        ))}
    </button>
  );

  return (
    <div className="rounded-xl border border-border bg-card transition-colors duration-200">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div>
          <h3 className="text-[14px] text-foreground font-medium">
            Block-wise Overview
          </h3>
          <p className="text-[11px] text-muted-foreground">Top 10 blocks by temperature</p>
        </div>
        <button
          onClick={() => toast.info("Block-wise Report", { description: "Navigating to full block-wise analytics view..." })}
          className="flex items-center gap-1 text-[11px] text-primary hover:text-primary/80 transition-colors font-medium active:scale-95"
        >
          View all
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="border-t border-b border-border/60">
              <th className="px-5 py-2.5 text-left text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">
                Block
              </th>
              <th className="px-3 py-2.5 text-left">
                <SortHeader label="Temp" field="temp" />
              </th>
              <th className="px-3 py-2.5 text-left hidden lg:table-cell">
                <SortHeader label="Humidity" field="humidity" />
              </th>
              <th className="px-3 py-2.5 text-left hidden lg:table-cell">
                <SortHeader label="Wind" field="wind" />
              </th>
              <th className="px-3 py-2.5 text-left hidden md:table-cell">
                <SortHeader label="Rain" field="rainfall" />
              </th>
              <th className="px-3 py-2.5 text-center">
                <span className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">
                  Trend
                </span>
              </th>
              <th className="px-3 py-2.5 text-right pr-5">
                <SortHeader label="Risk" field="risk" className="justify-end" />
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((block) => {
              const riskCfg = riskConfig[block.risk];
              const RiskIcon = riskCfg.icon;
              return (
                <tr
                  key={block.block}
                  className="border-b border-border/40 last:border-0 hover:bg-secondary/30 transition-colors cursor-pointer group"
                >
                  {/* Block Name */}
                  <td className="px-5 py-3">
                    <div>
                      <span className="text-[13px] text-foreground group-hover:text-primary transition-colors">
                        {block.block}
                      </span>
                      <p className="text-[10px] text-muted-foreground">{block.zone}</p>
                    </div>
                  </td>

                  {/* Temperature */}
                  <td className="px-3 py-3">
                    <span className="text-[13px] text-foreground font-medium tabular-nums">
                      {block.temp}°C
                    </span>
                  </td>

                  {/* Humidity */}
                  <td className="px-3 py-3 hidden lg:table-cell">
                    <span className="text-[12px] text-muted-foreground tabular-nums">
                      {block.humidity}%
                    </span>
                  </td>

                  {/* Wind */}
                  <td className="px-3 py-3 hidden lg:table-cell">
                    <span className="text-[12px] text-muted-foreground tabular-nums">
                      {block.wind} km/h
                    </span>
                  </td>

                  {/* Rainfall */}
                  <td className="px-3 py-3 hidden md:table-cell">
                    <span className="text-[12px] text-muted-foreground tabular-nums">
                      {block.rainfall} mm
                    </span>
                  </td>

                  {/* Sparkline */}
                  <td className="px-3 py-3">
                    <div className="flex justify-center">
                      <TinySparkline data={block.sparkline} risk={block.risk} />
                    </div>
                  </td>

                  {/* Risk */}
                  <td className="px-3 py-3 pr-5">
                    <div className="flex items-center justify-end gap-1.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${riskCfg.bg} ${riskCfg.border} border ${riskCfg.color}`}
                      >
                        <RiskIcon className="w-3 h-3" />
                        {riskCfg.label}
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