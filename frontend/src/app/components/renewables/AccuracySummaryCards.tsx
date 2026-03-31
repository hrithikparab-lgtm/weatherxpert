import {
  Target,
  Activity,
  TrendingDown,
  GitBranch,
  TrendingUp,
  Minus,
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area } from "recharts";

/* ═══════════════════════════════════════════════════
   ACCURACY SUMMARY CARDS — MAE, RMSE, MBE, Correlation
   Each with percentage, sparkline, and trend
   ═══════════════════════════════════════════════════ */

interface AccuracyMetric {
  title: string;
  abbr: string;
  value: string;
  unit: string;
  percentBetter: string;
  trend: "up" | "down" | "stable";
  trendLabel: string;
  trendSentiment: "positive" | "negative" | "neutral";
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  sparkline: number[];
  sparkColor: string;
  description: string;
}

const SOLAR_METRICS: AccuracyMetric[] = [
  {
    title: "Mean Absolute Error",
    abbr: "MAE",
    value: "4.2",
    unit: "%",
    percentBetter: "12%",
    trend: "down",
    trendLabel: "vs last month",
    trendSentiment: "positive",
    icon: Target,
    iconColor: "text-chart-1",
    iconBg: "bg-chart-1/10 ring-chart-1/20",
    sparkline: [6.8, 6.2, 5.9, 5.5, 5.1, 4.8, 4.6, 4.4, 4.3, 4.2],
    sparkColor: "var(--chart-1)",
    description: "Average absolute forecast deviation",
  },
  {
    title: "Root Mean Square Error",
    abbr: "RMSE",
    value: "6.8",
    unit: "%",
    percentBetter: "8%",
    trend: "down",
    trendLabel: "vs last month",
    trendSentiment: "positive",
    icon: Activity,
    iconColor: "text-chart-4",
    iconBg: "bg-chart-4/10 ring-chart-4/20",
    sparkline: [8.5, 8.1, 7.8, 7.5, 7.2, 7.0, 6.9, 6.8, 6.8, 6.8],
    sparkColor: "var(--chart-4)",
    description: "Penalizes large deviations more heavily",
  },
  {
    title: "Mean Bias Error",
    abbr: "MBE",
    value: "-1.3",
    unit: "%",
    percentBetter: "5%",
    trend: "stable",
    trendLabel: "last 7 days",
    trendSentiment: "neutral",
    icon: TrendingDown,
    iconColor: "text-chart-2",
    iconBg: "bg-chart-2/10 ring-chart-2/20",
    sparkline: [-2.1, -1.8, -1.6, -1.5, -1.4, -1.3, -1.3, -1.4, -1.3, -1.3],
    sparkColor: "var(--chart-2)",
    description: "Systematic over/under-prediction tendency",
  },
  {
    title: "Correlation Coefficient",
    abbr: "R²",
    value: "0.94",
    unit: "",
    percentBetter: "3%",
    trend: "up",
    trendLabel: "vs last month",
    trendSentiment: "positive",
    icon: GitBranch,
    iconColor: "text-chart-3",
    iconBg: "bg-chart-3/10 ring-chart-3/20",
    sparkline: [0.88, 0.89, 0.90, 0.91, 0.91, 0.92, 0.93, 0.93, 0.94, 0.94],
    sparkColor: "var(--chart-3)",
    description: "Forecast-actual linear agreement",
  },
];

const WIND_METRICS: AccuracyMetric[] = [
  {
    title: "Mean Absolute Error",
    abbr: "MAE",
    value: "1.8",
    unit: "m/s",
    percentBetter: "15%",
    trend: "down",
    trendLabel: "vs last month",
    trendSentiment: "positive",
    icon: Target,
    iconColor: "text-chart-1",
    iconBg: "bg-chart-1/10 ring-chart-1/20",
    sparkline: [3.0, 2.7, 2.5, 2.3, 2.1, 2.0, 1.9, 1.9, 1.8, 1.8],
    sparkColor: "var(--chart-1)",
    description: "Average absolute wind speed forecast error",
  },
  {
    title: "Root Mean Square Error",
    abbr: "RMSE",
    value: "2.4",
    unit: "m/s",
    percentBetter: "10%",
    trend: "down",
    trendLabel: "vs last month",
    trendSentiment: "positive",
    icon: Activity,
    iconColor: "text-chart-4",
    iconBg: "bg-chart-4/10 ring-chart-4/20",
    sparkline: [3.4, 3.1, 2.9, 2.8, 2.6, 2.5, 2.5, 2.4, 2.4, 2.4],
    sparkColor: "var(--chart-4)",
    description: "Penalizes large wind forecast deviations",
  },
  {
    title: "Mean Bias Error",
    abbr: "MBE",
    value: "+0.4",
    unit: "m/s",
    percentBetter: "7%",
    trend: "down",
    trendLabel: "improving",
    trendSentiment: "positive",
    icon: TrendingDown,
    iconColor: "text-chart-2",
    iconBg: "bg-chart-2/10 ring-chart-2/20",
    sparkline: [0.9, 0.8, 0.7, 0.6, 0.6, 0.5, 0.5, 0.4, 0.4, 0.4],
    sparkColor: "var(--chart-2)",
    description: "Slight over-prediction tendency",
  },
  {
    title: "Correlation Coefficient",
    abbr: "R²",
    value: "0.91",
    unit: "",
    percentBetter: "4%",
    trend: "up",
    trendLabel: "vs last month",
    trendSentiment: "positive",
    icon: GitBranch,
    iconColor: "text-chart-3",
    iconBg: "bg-chart-3/10 ring-chart-3/20",
    sparkline: [0.84, 0.85, 0.86, 0.87, 0.88, 0.89, 0.90, 0.90, 0.91, 0.91],
    sparkColor: "var(--chart-3)",
    description: "Wind speed forecast-actual correlation",
  },
];

function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  const chartData = data.map((v, i) => ({ v, i }));
  const gradientId = `acc-${color.replace(/[^a-zA-Z0-9]/g, "")}`;
  return (
    <div className="w-full h-9 relative" style={{ minHeight: 36 }}>
      {/* Gradient hoisted outside Recharts to prevent duplicate-key warnings */}
      <svg width="0" height="0" className="absolute overflow-hidden" aria-hidden="true">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.25} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
      </svg>
      <ResponsiveContainer width="100%" height="100%" minHeight={36}>
        <AreaChart data={chartData} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
          <Area
            type="monotone"
            dataKey="v"
            stroke={color}
            strokeWidth={1.5}
            fill={`url(#${gradientId})`}
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

interface AccuracySummaryCardsProps {
  isSolar: boolean;
}

export function AccuracySummaryCards({ isSolar }: AccuracySummaryCardsProps) {
  const metrics = isSolar ? SOLAR_METRICS : WIND_METRICS;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {metrics.map((m) => {
        const Icon = m.icon;
        const TrendIcon =
          m.trend === "up" ? TrendingUp : m.trend === "down" ? TrendingDown : Minus;
        const trendColor =
          m.trendSentiment === "positive"
            ? "text-chart-3"
            : m.trendSentiment === "negative"
            ? "text-destructive"
            : "text-muted-foreground";

        return (
          <div
            key={m.abbr}
            className="group rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-primary/20 hover:shadow-md hover:shadow-primary/5"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] text-muted-foreground font-medium">
                {m.title}
              </span>
              <div
                className={`w-7 h-7 rounded-lg ${m.iconBg} ring-1 flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105`}
              >
                <Icon className={`w-3.5 h-3.5 ${m.iconColor}`} />
              </div>
            </div>

            {/* Value */}
            <div className="flex items-baseline gap-1.5 mb-0.5">
              <span className="text-[24px] text-foreground tracking-tight tabular-nums">
                {m.value}
              </span>
              {m.unit && (
                <span className="text-[12px] text-muted-foreground">{m.unit}</span>
              )}
            </div>

            {/* Improvement badge */}
            <div className="flex items-center gap-1.5 mb-2">
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-chart-3/10 text-[10px] text-chart-3 font-semibold">
                <TrendingDown className="w-2.5 h-2.5" />
                {m.percentBetter} better
              </span>
              <span className="text-[10px] text-muted-foreground">{m.trendLabel}</span>
            </div>

            {/* Sparkline */}
            <MiniSparkline data={m.sparkline} color={m.sparkColor} />

            {/* Description */}
            <p className="text-[10px] text-muted-foreground/70 mt-1 leading-relaxed">
              {m.description}
            </p>
          </div>
        );
      })}
    </div>
  );
}