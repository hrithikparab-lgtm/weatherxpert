import {
  AlertTriangle,
  AlertCircle,
  Info,
  ChevronRight,
  ShieldAlert,
  User,
  Clock,
  ArrowUpCircle,
} from "lucide-react";
import { useState, useEffect } from "react";

/* ═══════════════════════════════════════════════════
   ALERT STRIP — 4 severity tiles with count & CTA
   ═══════════════════════════════════════════════════ */

interface AlertTile {
  severity: string;
  count: number;
  label: string;
  icon: React.ElementType;
  dotColor: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  badgeColor: string;
  latest: string;
  assignedTo: string;
  escalationLevel: number;
  slaMinutes: number;
}

const ALERT_TILES: AlertTile[] = [
  {
    severity: "critical",
    count: 2,
    label: "Critical",
    icon: ShieldAlert,
    dotColor: "bg-red-500",
    bgColor: "bg-red-500/5 dark:bg-red-500/10",
    borderColor: "border-red-500/20 hover:border-red-500/40",
    textColor: "text-red-600 dark:text-red-400",
    badgeColor: "bg-red-500 text-white",
    latest: "Cyclone warning — coastal Gujarat",
    assignedTo: "Rajesh Kumar",
    escalationLevel: 3,
    slaMinutes: 15,
  },
  {
    severity: "high",
    count: 5,
    label: "High",
    icon: AlertTriangle,
    dotColor: "bg-orange-500",
    bgColor: "bg-orange-500/5 dark:bg-orange-500/10",
    borderColor: "border-orange-500/20 hover:border-orange-500/40",
    textColor: "text-orange-600 dark:text-orange-400",
    badgeColor: "bg-orange-500 text-white",
    latest: "Heat wave advisory — Thane district",
    assignedTo: "Priya Shah",
    escalationLevel: 2,
    slaMinutes: 42,
  },
  {
    severity: "medium",
    count: 12,
    label: "Medium",
    icon: AlertCircle,
    dotColor: "bg-amber-500",
    bgColor: "bg-amber-500/5 dark:bg-amber-500/10",
    borderColor: "border-amber-500/20 hover:border-amber-500/40",
    textColor: "text-amber-600 dark:text-amber-400",
    badgeColor: "bg-amber-500 text-white",
    latest: "Humidity spike expected — Colaba zone",
    assignedTo: "Amit Patel",
    escalationLevel: 1,
    slaMinutes: 120,
  },
  {
    severity: "low",
    count: 8,
    label: "Low",
    icon: Info,
    dotColor: "bg-blue-500",
    bgColor: "bg-blue-500/5 dark:bg-blue-500/10",
    borderColor: "border-blue-500/20 hover:border-blue-500/40",
    textColor: "text-blue-600 dark:text-blue-400",
    badgeColor: "bg-blue-500 text-white",
    latest: "Mild fog predicted — early morning",
    assignedTo: "Unassigned",
    escalationLevel: 0,
    slaMinutes: 240,
  },
];

interface AlertStripProps {
  onAlertClick?: (severity: string) => void;
}

function SLACountdown({ minutes }: { minutes: number }) {
  const [timeLeft, setTimeLeft] = useState(minutes * 60);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const isUrgent = timeLeft < 600; // Less than 10 minutes
  const isCritical = timeLeft < 300; // Less than 5 minutes

  return (
    <div className={`flex items-center gap-1 text-[10px] font-medium tabular-nums ${
      isCritical ? "text-red-600 dark:text-red-400" : 
      isUrgent ? "text-orange-600 dark:text-orange-400" : 
      "text-muted-foreground"
    }`}>
      <Clock className={`w-3 h-3 ${isCritical ? "animate-pulse" : ""}`} />
      SLA: {mins}m {secs}s
    </div>
  );
}

function EscalationBadge({ level }: { level: number }) {
  if (level === 0) return null;
  
  const colors = {
    1: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800",
    2: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800",
    3: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800",
  };

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${colors[level as keyof typeof colors] || colors[1]}`}>
      <ArrowUpCircle className="w-3 h-3" />
      L{level} ESCALATED
    </div>
  );
}

export function AlertStrip({ onAlertClick }: AlertStripProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {ALERT_TILES.map((tile) => {
        const Icon = tile.icon;
        return (
          <button
            key={tile.severity}
            onClick={() => onAlertClick?.(tile.severity)}
            className={`group relative text-left rounded-xl border ${tile.bgColor} ${tile.borderColor} p-4 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 active:scale-[0.98]`}
          >
            {/* Top row: icon + count */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Icon className={`w-4.5 h-4.5 ${tile.textColor}`} />
                <span className={`text-[12px] font-semibold ${tile.textColor} uppercase tracking-wide`}>
                  {tile.label}
                </span>
              </div>
              <span
                className={`${tile.badgeColor} text-[13px] font-semibold h-7 min-w-7 flex items-center justify-center rounded-lg px-2 tabular-nums shadow-sm`}
              >
                {tile.count}
              </span>
            </div>

            {/* Latest alert preview */}
            <p className="text-[12px] text-muted-foreground leading-relaxed line-clamp-1 mb-3">
              {tile.latest}
            </p>

            {/* Alert Ownership */}
            <div className="flex items-center gap-1.5 mb-2">
              <User className="w-3 h-3 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground">
                Assigned to: <span className="text-foreground font-medium">{tile.assignedTo}</span>
              </span>
            </div>

            {/* SLA Countdown & Escalation */}
            <div className="flex items-center justify-between mb-3">
              <SLACountdown minutes={tile.slaMinutes} />
              <EscalationBadge level={tile.escalationLevel} />
            </div>

            {/* CTA */}
            <div className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground group-hover:text-foreground transition-colors">
              View all
              <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>

            {/* Pulse indicator for critical */}
            {tile.severity === "critical" && tile.count > 0 && (
              <span className="absolute top-3 right-3 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}