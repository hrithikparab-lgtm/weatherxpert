import { AlertTriangle, X, ChevronRight, Clock } from "lucide-react";
import { useState } from "react";
import { ALERT_DATA } from "./mockData";

interface AlertsBannerProps {
  selectedUtility: string;
}

const severityConfig = {
  critical: {
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    icon: "text-red-400",
    badge: "bg-red-500 text-white shadow-[0_0_10px_rgba(239,68,68,0.4)]",
    label: "CRITICAL",
    text: "text-red-200"
  },
  warning: {
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    icon: "text-amber-400",
    badge: "bg-amber-500 text-white shadow-[0_0_10px_rgba(245,158,11,0.4)]",
    label: "WARNING",
    text: "text-amber-200"
  },
  advisory: {
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    icon: "text-blue-400",
    badge: "bg-blue-500 text-white",
    label: "ADVISORY",
    text: "text-blue-200"
  },
};

export function AlertsBanner({ selectedUtility }: AlertsBannerProps) {
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);
  
  const visibleAlerts = ALERT_DATA.filter((a) => {
    if (dismissedAlerts.includes(a.id)) return false;
    return a.location === selectedUtility || a.location.includes(selectedUtility);
  });

  if (visibleAlerts.length === 0) return null;

  return (
    <div className="space-y-3 animate-in slide-in-from-top-4 duration-500">
      {visibleAlerts.map((alert) => {
        // @ts-ignore
        const config = severityConfig[alert.severity] || severityConfig.advisory;
        return (
          <div
            key={alert.id}
            className={`${config.bg} ${config.border} border rounded-xl px-4 py-3 backdrop-blur-sm transition-all hover:bg-opacity-20`}
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className={`w-5 h-5 ${config.icon} mt-0.5 flex-shrink-0 animate-pulse`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span
                    className={`${config.badge} text-[10px] px-2 py-0.5 rounded-md font-bold tracking-wider`}
                  >
                    {config.label}
                  </span>
                  <span className={`text-[13px] font-semibold ${config.text} tracking-tight`}>
                    {alert.title}
                  </span>
                  <span className="hidden sm:inline text-[11px] text-slate-400 font-medium">— {alert.location}</span>
                </div>
                
                <div className="sm:hidden text-[11px] text-slate-500 mt-0.5">{alert.location}</div>
                
                <p className={`text-[13px] ${config.text} opacity-90 mt-1 font-normal leading-relaxed`}>
                  {alert.location}
                </p>
                
                {/* Mobile action row */}
                <div className="flex items-center gap-3 mt-3 md:hidden">
                  <span className="text-[11px] text-slate-500 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {alert.time}
                  </span>
                  <button className="text-[12px] text-blue-400 flex items-center gap-0.5 font-medium">
                    Details <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Desktop actions */}
              <div className="hidden md:flex items-center gap-4 flex-shrink-0">
                <span className="text-[11px] text-slate-500 flex items-center gap-1.5 bg-black/20 px-2 py-1 rounded-md">
                  <Clock className="w-3.5 h-3.5" />
                  {alert.time}
                </span>
                <button className="text-[12px] text-blue-400 flex items-center gap-0.5 hover:text-blue-300 font-medium transition-colors">
                  Details
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <button
                onClick={() => setDismissedAlerts([...dismissedAlerts, alert.id])}
                className="p-1.5 hover:bg-black/20 rounded-lg flex-shrink-0 transition-colors text-slate-400 hover:text-white"
                aria-label="Dismiss alert"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
