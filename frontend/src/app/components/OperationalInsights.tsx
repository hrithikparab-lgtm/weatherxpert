import {
  Zap,
  Sun,
  Wind,
  Thermometer,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  CloudLightning,
  Cloud,
} from "lucide-react";
import { useRole } from "./RoleContext";
import { UTILITIES_DATA, DEFAULT_DATA } from "./mockData";

// Icon map
const iconMap: Record<string, React.ElementType> = {
  Zap,
  Sun,
  Wind,
  Thermometer,
  CloudLightning,
  Cloud,
};

interface OperationalInsightsProps {
  selectedUtility: string;
}

const priorityConfig = {
  high: {
    border: "border-l-red-500",
    badge: "bg-red-500/10 text-red-400 border border-red-500/20",
    icon: <AlertCircle className="w-3 h-3" />,
  },
  medium: {
    border: "border-l-amber-500",
    badge: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    icon: <Clock className="w-3 h-3" />,
  },
  low: {
    border: "border-l-emerald-500",
    badge: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    icon: <CheckCircle2 className="w-3 h-3" />,
  },
};

export function OperationalInsights({ selectedUtility }: OperationalInsightsProps) {
  const { can } = useRole();
  const data = UTILITIES_DATA[selectedUtility] || DEFAULT_DATA;
  const insights = data.insights;

  if (!insights || insights.length === 0) return null;

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/5 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-white font-semibold">Operational Insights</h3>
          <p className="text-[11px] text-slate-400 mt-1">
            AI-powered recommendations for {data.location.split("—")[0]}
          </p>
        </div>
        <span className="text-[10px] text-blue-300 bg-blue-500/20 px-2.5 py-1 rounded-full border border-blue-500/30 font-medium">
          {insights.length} Active
        </span>
      </div>

      <div className="space-y-3">
        {insights.map((insight: any) => {
          // @ts-ignore
          const config = priorityConfig[insight.priority] || priorityConfig.medium;
          const Icon = iconMap[insight.icon] || Zap;
          
          return (
            <div
              key={insight.id}
              className={`border border-white/5 bg-white/5 ${config.border} border-l-[3px] rounded-xl p-4 hover:bg-white/10 transition-colors group`}
            >
              <div className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-lg bg-black/20 flex items-center justify-center text-blue-400 flex-shrink-0 mt-0.5 border border-white/5">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span
                      className={`${config.badge} text-[9px] px-2 py-0.5 rounded-full flex items-center gap-1 font-bold tracking-wider`}
                    >
                      {config.icon}
                      {insight.priority.toUpperCase()}
                    </span>
                    <span className="text-[13px] text-white font-semibold tracking-tight">
                      {insight.title}
                    </span>
                  </div>
                  <p className="text-[12px] text-slate-400 mb-3 line-clamp-2 md:line-clamp-none leading-relaxed group-hover:text-slate-300 transition-colors">{insight.description}</p>
                  
                  {/* Desktop metadata inline */}
                  <div className="hidden md:flex items-center gap-6 text-[11px] bg-black/20 p-2 rounded-lg border border-white/5">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">Action:</span>
                      <span className="text-blue-300 font-medium">
                        {insight.action}
                      </span>
                    </div>
                    <div className="w-px h-3 bg-white/10" />
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">Impact:</span>
                      <span className="text-slate-200 font-medium">
                        {insight.impact}
                      </span>
                    </div>
                    <div className="w-px h-3 bg-white/10" />
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">Timeframe:</span>
                      <span className="text-slate-200 font-medium">
                        {insight.timeframe}
                      </span>
                    </div>
                  </div>
                  
                  {/* Mobile metadata stacked */}
                  <div className="md:hidden space-y-1.5 text-[11px] bg-black/20 p-2 rounded-lg mt-2">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 w-16">Action:</span>
                      <span className="text-blue-300 font-medium">{insight.action}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 w-16">Impact:</span>
                      <span className="text-slate-200 font-medium">{insight.impact}</span>
                    </div>
                     <div className="flex items-center gap-2">
                      <span className="text-slate-500 w-16">Time:</span>
                      <span className="text-slate-200 font-medium">{insight.timeframe}</span>
                    </div>
                  </div>
                </div>
                {can("edit") && (
                  <button className="text-slate-500 hover:text-blue-400 p-2 hover:bg-white/5 rounded-lg transition-all flex-shrink-0 group-hover:translate-x-1">
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
