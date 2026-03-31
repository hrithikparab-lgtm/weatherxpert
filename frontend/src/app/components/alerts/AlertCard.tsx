import { useState } from "react";
import {
  MapPin,
  Clock,
  UserPlus,
  CheckCircle2,
  ArrowUpRight,
  Map,
  Eye,
  CloudLightning,
  Wind,
  Thermometer,
  Zap,
  CloudFog,
  Droplets,
  Waves,
  Wrench,
  Timer,
  Shield,
  User,
  X,
  AlertTriangle,
} from "lucide-react";
import {
  type AlertRecord,
  type AlertType,
  SEVERITY_CONFIG,
} from "./alertsData";

/* ═══════════════════════════════════════════════════
   ALERT CARD — Grid card with severity, actions,
   map toggle, unread indicator
   ═══════════════════════════════════════════════════ */

const TYPE_ICONS: Record<AlertType, React.ElementType> = {
  storm: CloudLightning,
  wind: Wind,
  heat: Thermometer,
  lightning: Zap,
  fog: CloudFog,
  flood: Waves,
  humidity: Droplets,
  equipment: Wrench,
};

interface AlertCardProps {
  alert: AlertRecord;
  onAcknowledge: (id: string) => void;
  onAssign: (id: string) => void;
  onEscalate: (id: string) => void;
  onMapView: (id: string) => void;
  onMarkRead: (id: string) => void;
  onResolve?: (id: string) => void;
  canEdit: boolean;
}

export function AlertCard({
  alert,
  onAcknowledge,
  onAssign,
  onEscalate,
  onMapView,
  onMarkRead,
  onResolve,
  canEdit,
}: AlertCardProps) {
  const [showTimeline, setShowTimeline] = useState(false);
  const sev = SEVERITY_CONFIG[alert.severity];
  const Icon = TYPE_ICONS[alert.type];
  const isActive = alert.status === "active";
  const isAcked = alert.status === "acknowledged";

  const timeAgo = getTimeAgo(alert.issuedAt);
  const slaTime = formatSLATime(alert.slaMinutes);

  // Calculate aging color gradient
  const agingGradient = getAgingGradient(alert.slaMinutes, alert.severity);

  return (
    <>
      <div
        className={`group relative rounded-xl border bg-card transition-all duration-200 hover:shadow-lg hover:shadow-primary/5 ${
          !alert.read ? `border-l-[3px] ${sev.border}` : "border-border"
        } ${!alert.read ? sev.bg : ""} ${agingGradient}`}
        onClick={() => onMarkRead(alert.id)}
      >
        {/* Unread dot */}
        {!alert.read && (
          <span className={`absolute top-3 right-3 w-2.5 h-2.5 rounded-full ${sev.dot} animate-pulse`} />
        )}

        {/* Header */}
        <div className="px-4 pt-4 pb-2">
          <div className="flex items-start gap-3">
            <div
              className={`w-9 h-9 rounded-lg ${sev.bg} ring-1 ${sev.ring} flex items-center justify-center flex-shrink-0`}
            >
              <Icon className={`w-4 h-4 ${sev.text}`} />
            </div>
            <div className="flex-1 min-w-0">
              {/* Badges */}
              <div className="flex items-center gap-1.5 flex-wrap mb-1">
                <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider ${sev.badge}`}>
                  {sev.label}
                </span>
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider ${
                    isActive
                      ? "bg-red-500/10 text-red-600 dark:text-red-400"
                      : isAcked
                      ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                      : alert.status === "escalated"
                      ? "bg-purple-500/10 text-purple-600 dark:text-purple-400"
                      : "bg-chart-3/10 text-chart-3"
                  }`}
                >
                  {alert.status}
                </span>
                <span className="text-[10px] text-muted-foreground/60 tabular-nums">{alert.id}</span>
              </div>

              {/* Title */}
              <h4 className="text-[13px] text-foreground font-medium leading-snug line-clamp-2">
                {alert.title}
              </h4>
            </div>
          </div>
        </div>

        {/* Meta */}
        <div className="px-4 pb-2">
          <div className="flex items-center gap-3 flex-wrap text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {alert.location}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {timeAgo}
            </span>
            {/* SLA Timer */}
            <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md font-semibold ${
              alert.slaMinutes > 120 
                ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                : alert.slaMinutes > 60
                ? "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400"
                : "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
            }`}>
              <Timer className="w-3 h-3" />
              Open for {slaTime}
            </span>
          </div>
          {/* Owner Avatar */}
          {alert.assignee && (
            <div className="flex items-center gap-1.5 mt-2 text-[11px] text-muted-foreground">
              <div className={`w-5 h-5 rounded-full ${
                alert.assignee === "Rajiv Sharma" ? "bg-blue-500" :
                alert.assignee === "Priya Mehta" ? "bg-purple-500" :
                alert.assignee === "Arun Desai" ? "bg-green-500" :
                alert.assignee === "Suresh Kumar" ? "bg-orange-500" :
                "bg-primary"
              } flex items-center justify-center text-[9px] text-white font-bold`}>
                {alert.assignee.split(" ").map(n => n[0]).join("")}
              </div>
              <span>{alert.assignee}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 px-3 pb-3 pt-1 border-t border-border/50 mt-1">
          {canEdit && isActive && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); onAcknowledge(alert.id); }}
                className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium text-chart-3 bg-chart-3/8 hover:bg-chart-3/15 transition-colors"
              >
                <CheckCircle2 className="w-3 h-3" />
                Ack
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onAssign(alert.id); }}
                className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium text-primary bg-primary/8 hover:bg-primary/15 transition-colors"
              >
                <UserPlus className="w-3 h-3" />
                Assign
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onEscalate(alert.id); }}
                className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium text-destructive bg-destructive/8 hover:bg-destructive/15 transition-colors"
              >
                <ArrowUpRight className="w-3 h-3" />
                Escalate
              </button>
              {/* Quick Resolve Button */}
              {onResolve && (
                <button
                  onClick={(e) => { e.stopPropagation(); onResolve(alert.id); }}
                  className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/8 hover:bg-emerald-500/15 transition-colors"
                >
                  <CheckCircle2 className="w-3 h-3" />
                  Resolve
                </button>
              )}
            </>
          )}
          {canEdit && isAcked && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); onEscalate(alert.id); }}
                className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium text-destructive bg-destructive/8 hover:bg-destructive/15 transition-colors"
              >
                <ArrowUpRight className="w-3 h-3" />
                Escalate
              </button>
              {onResolve && (
                <button
                  onClick={(e) => { e.stopPropagation(); onResolve(alert.id); }}
                  className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/8 hover:bg-emerald-500/15 transition-colors"
                >
                  <CheckCircle2 className="w-3 h-3" />
                  Resolve
                </button>
              )}
            </>
          )}
          <div className="flex-1" />
          {/* Timeline Button */}
          <button
            onClick={(e) => { e.stopPropagation(); setShowTimeline(true); }}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <Clock className="w-3 h-3" />
            Timeline
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onMapView(alert.id); }}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <Map className="w-3 h-3" />
            Map
          </button>
        </div>
      </div>

      {/* Timeline Drawer */}
      {showTimeline && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowTimeline(false)} />
          <div className="relative bg-card border border-border rounded-t-2xl sm:rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/60">
              <div>
                <h3 className="text-[16px] text-foreground font-medium">Incident Timeline</h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">{alert.id} · {alert.title}</p>
              </div>
              <button
                onClick={() => setShowTimeline(false)}
                className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Timeline Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
              <div className="space-y-4">
                {alert.timeline.map((event, idx) => (
                  <div key={idx} className="flex gap-4">
                    {/* Timeline Line */}
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full ${
                        event.action === "Resolved" ? "bg-emerald-500/10 ring-emerald-500/20" :
                        event.action === "Escalated" ? "bg-red-500/10 ring-red-500/20" :
                        event.action === "Acknowledged" ? "bg-amber-500/10 ring-amber-500/20" :
                        "bg-blue-500/10 ring-blue-500/20"
                      } ring-2 flex items-center justify-center flex-shrink-0`}>
                        {event.action === "Resolved" ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        ) : event.action === "Escalated" ? (
                          <ArrowUpRight className="w-4 h-4 text-red-600 dark:text-red-400" />
                        ) : event.action === "Acknowledged" ? (
                          <CheckCircle2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        )}
                      </div>
                      {idx < alert.timeline.length - 1 && (
                        <div className="w-0.5 h-full bg-border/60 mt-1" style={{ minHeight: "40px" }} />
                      )}
                    </div>

                    {/* Event Content */}
                    <div className="flex-1 pb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[13px] text-foreground font-medium">{event.action}</span>
                        <span className="text-[10px] text-muted-foreground/60">·</span>
                        <span className="text-[10px] text-muted-foreground">{event.timestamp}</span>
                      </div>
                      <p className="text-[12px] text-muted-foreground">{event.details}</p>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <User className="w-3 h-3 text-muted-foreground/60" />
                        <span className="text-[11px] text-muted-foreground/80">{event.user}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── Helpers ──
function getTimeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function formatSLATime(minutes: number): string {
  if (minutes < 60) return `${minutes} mins`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

function getAgingGradient(slaMinutes: number, severity: string): string {
  if (severity === "critical" && slaMinutes > 120) {
    return "bg-gradient-to-br from-red-50 to-rose-100 dark:from-red-950/20 dark:to-rose-950/30";
  }
  if (severity === "high" && slaMinutes > 90) {
    return "bg-gradient-to-br from-orange-50 to-amber-100 dark:from-orange-950/20 dark:to-amber-950/30";
  }
  if (slaMinutes > 60) {
    return "bg-gradient-to-br from-amber-50 to-yellow-100 dark:from-amber-950/20 dark:to-yellow-950/30";
  }
  return "";
}