import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  unit: string;
  icon: React.ReactNode;
  trend?: "up" | "down" | "stable";
  trendValue?: string;
  trendLabel?: string;
  status?: "normal" | "warning" | "critical";
  subtitle?: string;
}

const statusColors = {
  normal: "border-l-emerald-500",
  warning: "border-l-amber-500",
  critical: "border-l-red-500",
};

export function MetricCard({
  title,
  value,
  unit,
  icon,
  trend,
  trendValue,
  trendLabel,
  status = "normal",
  subtitle,
}: MetricCardProps) {
  return (
    <div
      className={`relative bg-white/5 backdrop-blur-sm rounded-xl border border-white/5 p-4 border-l-[3px] ${statusColors[status]} hover:bg-white/10 transition-all duration-300 group`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="text-[12px] text-slate-400 font-medium group-hover:text-slate-300 transition-colors">
          {title}
        </div>
        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-blue-400 border border-white/5 group-hover:scale-105 transition-transform">
          {icon}
        </div>
      </div>
      
      <div className="flex items-baseline gap-1.5">
        <span className="text-2xl font-semibold text-white tracking-tight">
          {value}
        </span>
        <span className="text-[13px] text-slate-500 font-medium">{unit}</span>
      </div>

      {subtitle && (
        <div className="text-[11px] text-slate-500 mt-1 truncate">{subtitle}</div>
      )}

      {trend && trendValue && (
        <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-white/5">
          {trend === "up" && <TrendingUp className="w-3 h-3 text-red-400" />}
          {trend === "down" && <TrendingDown className="w-3 h-3 text-emerald-400" />}
          {trend === "stable" && <Minus className="w-3 h-3 text-slate-500" />}
          <span
            className={`text-[11px] font-medium ${
              trend === "up"
                ? "text-red-400"
                : trend === "down"
                ? "text-emerald-400"
                : "text-slate-500"
            }`}
          >
            {trendValue}
          </span>
          {trendLabel && (
            <span className="text-[11px] text-slate-600 hidden sm:inline">{trendLabel}</span>
          )}
        </div>
      )}
    </div>
  );
}
