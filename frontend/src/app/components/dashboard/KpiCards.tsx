import {
  Thermometer,
  ThermometerSnowflake,
  Wind,
  Droplets,
  CloudRain,
  TrendingUp,
  TrendingDown,
  Minus,
  Activity,
  Info,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { useState } from "react";

/* ═══════════════════════════════════════════════════
   KPI CARDS — 6 headline metrics with sparklines
   ═══════════════════════════════════════════════════ */

interface KpiData {
  title: string;
  value: string;
  unit: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  trend: "up" | "down" | "stable";
  trendValue: string;
  trendLabel: string;
  trendSentiment: "positive" | "negative" | "neutral";
  sparkline: number[];
  sparkColor: string;
  lastUpdated: string;
  dataSource: string;
  updateFrequency: string;
}

const KPI_DATA: KpiData[] = [
  {
    title: "Max Temperature",
    value: "38.2",
    unit: "°C",
    icon: Thermometer,
    iconColor: "text-red-500 dark:text-red-400",
    iconBg: "bg-red-500/10 ring-red-500/20",
    trend: "up",
    trendValue: "+2.4°C",
    trendLabel: "vs yesterday",
    trendSentiment: "negative",
    sparkline: [32, 33, 34, 35, 36, 37, 36, 37, 38, 38.2],
    sparkColor: "var(--chart-5)",
    lastUpdated: "2 min ago",
    dataSource: "AWS IoT Sensors",
    updateFrequency: "Updated every 5 min",
  },
  {
    title: "Min Temperature",
    value: "26.4",
    unit: "°C",
    icon: ThermometerSnowflake,
    iconColor: "text-cyan-500 dark:text-cyan-400",
    iconBg: "bg-cyan-500/10 ring-cyan-500/20",
    trend: "up",
    trendValue: "+0.8°C",
    trendLabel: "vs yesterday",
    trendSentiment: "neutral",
    sparkline: [25, 25.2, 25.5, 25.8, 26, 26.2, 26, 26.3, 26.4, 26.4],
    sparkColor: "var(--chart-1)",
    lastUpdated: "2 min ago",
    dataSource: "IMD Weather Stations",
    updateFrequency: "Updated every 15 min",
  },
  {
    title: "Avg Temperature",
    value: "32.1",
    unit: "°C",
    icon: Activity,
    iconColor: "text-amber-500 dark:text-amber-400",
    iconBg: "bg-amber-500/10 ring-amber-500/20",
    trend: "up",
    trendValue: "+1.6°C",
    trendLabel: "vs 7d avg",
    trendSentiment: "negative",
    sparkline: [29, 30, 31, 30.5, 31, 31.5, 32, 31.8, 32, 32.1],
    sparkColor: "var(--chart-2)",
    lastUpdated: "2 min ago",
    dataSource: "AWS IoT Sensors",
    updateFrequency: "Updated every 5 min",
  },
  {
    title: "Wind Speed",
    value: "23",
    unit: "km/h",
    icon: Wind,
    iconColor: "text-teal-500 dark:text-teal-400",
    iconBg: "bg-teal-500/10 ring-teal-500/20",
    trend: "up",
    trendValue: "+8 km/h",
    trendLabel: "gusting",
    trendSentiment: "neutral",
    sparkline: [12, 14, 16, 15, 18, 20, 22, 28, 25, 23],
    sparkColor: "var(--chart-3)",
    lastUpdated: "1 min ago",
    dataSource: "Tomorrow.io API",
    updateFrequency: "Updated every 10 min",
  },
  {
    title: "Humidity",
    value: "78",
    unit: "%",
    icon: Droplets,
    iconColor: "text-blue-500 dark:text-blue-400",
    iconBg: "bg-blue-500/10 ring-blue-500/20",
    trend: "up",
    trendValue: "+5%",
    trendLabel: "last 3h",
    trendSentiment: "neutral",
    sparkline: [68, 70, 72, 71, 73, 75, 74, 76, 77, 78],
    sparkColor: "var(--chart-1)",
    lastUpdated: "1 min ago",
    dataSource: "IMD Weather Stations",
    updateFrequency: "Updated every 15 min",
  },
  {
    title: "Total Rainfall",
    value: "12.4",
    unit: "mm",
    icon: CloudRain,
    iconColor: "text-indigo-500 dark:text-indigo-400",
    iconBg: "bg-indigo-500/10 ring-indigo-500/20",
    trend: "up",
    trendValue: "+8.2 mm",
    trendLabel: "last 6h",
    trendSentiment: "neutral",
    sparkline: [0, 0, 0.5, 1, 2, 4, 6, 8, 10, 12.4],
    sparkColor: "var(--chart-4)",
    lastUpdated: "5 min ago",
    dataSource: "Rain Gauge Network",
    updateFrequency: "Updated every 15 min",
  },
];

function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  const chartData = data.map((v, i) => ({ v, i }));
  return (
    <div className="w-full h-8" style={{ minHeight: 32 }}>
      <ResponsiveContainer width="100%" height="100%" minHeight={32}>
        <AreaChart data={chartData} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`spark-${color.replace(/[^a-zA-Z0-9]/g, "")}`} x1="0" y1="0" x2="0" y2="1">
              <stop key="spark-stop-start" offset="0%" stopColor={color} stopOpacity={0.3} />
              <stop key="spark-stop-end" offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="v"
            stroke={color}
            strokeWidth={1.5}
            fill={`url(#spark-${color.replace(/[^a-zA-Z0-9]/g, "")})`}
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function KpiCards() {
  const [hoveredKpi, setHoveredKpi] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
      {KPI_DATA.map((kpi) => {
        const Icon = kpi.icon;
        const TrendIcon =
          kpi.trend === "up" ? TrendingUp : kpi.trend === "down" ? TrendingDown : Minus;
        const trendColor =
          kpi.trendSentiment === "positive"
            ? "text-chart-3"
            : kpi.trendSentiment === "negative"
            ? "text-destructive"
            : "text-muted-foreground";

        return (
          <div
            key={kpi.title}
            className="group relative rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-primary/20 hover:shadow-md hover:shadow-primary/5"
            onMouseEnter={() => setHoveredKpi(kpi.title)}
            onMouseLeave={() => setHoveredKpi(null)}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] text-muted-foreground font-medium truncate">
                {kpi.title}
              </span>
              <div
                className={`w-7 h-7 rounded-lg ${kpi.iconBg} ring-1 flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105`}
              >
                <Icon className={`w-3.5 h-3.5 ${kpi.iconColor}`} />
              </div>
            </div>

            {/* Value */}
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-[22px] text-foreground tracking-tight tabular-nums">
                {kpi.value}
              </span>
              <span className="text-[12px] text-muted-foreground">{kpi.unit}</span>
            </div>

            {/* Sparkline */}
            <MiniSparkline data={kpi.sparkline} color={kpi.sparkColor} />

            {/* Trend + Last Updated */}
            <div className="flex items-center justify-between mt-1 pt-2 border-t border-border/60">
              <div className="flex items-center gap-1">
                <TrendIcon className={`w-3 h-3 ${trendColor}`} />
                <span className={`text-[11px] font-medium ${trendColor}`}>{kpi.trendValue}</span>
                <span className="text-[10px] text-muted-foreground hidden sm:inline">
                  {kpi.trendLabel}
                </span>
              </div>
              <span className="text-[10px] text-muted-foreground/70 tabular-nums">{kpi.lastUpdated}</span>
            </div>

            {/* Tooltip on hover */}
            {hoveredKpi === kpi.title && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 animate-in fade-in slide-in-from-bottom-1 duration-200">
                <div className="bg-popover border border-border rounded-lg shadow-lg p-3 min-w-[200px]">
                  <div className="flex items-start gap-2 mb-2">
                    <Info className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-[11px] text-foreground font-medium">Data Source</p>
                      <p className="text-[10px] text-muted-foreground">{kpi.dataSource}</p>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-border/60">
                    <p className="text-[10px] text-muted-foreground">{kpi.updateFrequency}</p>
                  </div>
                  {/* Arrow */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
                    <div className="border-4 border-transparent border-t-border">
                      <div className="border-4 border-transparent border-t-popover -mt-1" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}