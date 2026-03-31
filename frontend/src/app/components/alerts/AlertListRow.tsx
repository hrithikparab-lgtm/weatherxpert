import { useState, useRef } from "react";
import {
  MapPin,
  Clock,
  UserPlus,
  CheckCircle2,
  ArrowUpRight,
  Map,
  ChevronRight,
  CloudLightning,
  Wind,
  Thermometer,
  Zap,
  CloudFog,
  Droplets,
  Waves,
  Wrench,
} from "lucide-react";
import {
  type AlertRecord,
  type AlertType,
  SEVERITY_CONFIG,
} from "./alertsData";

/* ═══════════════════════════════════════════════════
   ALERT LIST ROW — Table-style row for list view
   Mobile: swipe-to-reveal actions
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

interface AlertListRowProps {
  alert: AlertRecord;
  onAcknowledge: (id: string) => void;
  onAssign: (id: string) => void;
  onEscalate: (id: string) => void;
  onMapView: (id: string) => void;
  onMarkRead: (id: string) => void;
  canEdit: boolean;
}

export function AlertListRow({
  alert,
  onAcknowledge,
  onAssign,
  onEscalate,
  onMapView,
  onMarkRead,
  canEdit,
}: AlertListRowProps) {
  const sev = SEVERITY_CONFIG[alert.severity];
  const Icon = TYPE_ICONS[alert.type];
  const isActive = alert.status === "active";
  const isAcked = alert.status === "acknowledged";

  // Swipe state for mobile
  const [swiped, setSwiped] = useState(false);
  const touchStartX = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 60) setSwiped(true);
    else if (diff < -30) setSwiped(false);
  };

  const timeAgo = getTimeAgo(alert.issuedAt);

  return (
    <div className="relative overflow-hidden" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      {/* Swipe action panel (mobile) */}
      <div className="absolute inset-y-0 right-0 flex items-center gap-1 pr-2 md:hidden">
        {canEdit && isActive && (
          <>
            <button
              onClick={() => { onAcknowledge(alert.id); setSwiped(false); }}
              className="h-10 px-3 rounded-lg bg-chart-3 text-white text-[11px] font-medium"
            >
              Ack
            </button>
            <button
              onClick={() => { onAssign(alert.id); setSwiped(false); }}
              className="h-10 px-3 rounded-lg bg-primary text-white text-[11px] font-medium"
            >
              Assign
            </button>
          </>
        )}
      </div>

      {/* Main row */}
      <div
        className={`flex items-center gap-3 px-4 md:px-5 py-3 border-b border-border/40 transition-all duration-200 cursor-pointer ${
          !alert.read ? sev.bg : "hover:bg-secondary/30"
        }`}
        style={{
          transform: swiped ? "translateX(-140px)" : "translateX(0)",
          transition: "transform 0.2s ease",
        }}
        onClick={() => onMarkRead(alert.id)}
      >
        {/* Severity indicator + icon */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          {/* Unread dot */}
          <div className="w-2 flex-shrink-0">
            {!alert.read && <span className={`block w-2 h-2 rounded-full ${sev.dot}`} />}
          </div>
          <div className={`w-8 h-8 rounded-lg ${sev.bg} ring-1 ${sev.ring} flex items-center justify-center`}>
            <Icon className={`w-3.5 h-3.5 ${sev.text}`} />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider ${sev.badge}`}>
              {sev.label}
            </span>
            <span className="text-[10px] text-muted-foreground/50 tabular-nums">{alert.id}</span>
          </div>
          <h4 className="text-[13px] text-foreground font-medium leading-snug truncate">
            {alert.title}
          </h4>
          <div className="flex items-center gap-3 mt-0.5 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-0.5 truncate">
              <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
              {alert.location}
            </span>
            <span className="flex items-center gap-0.5 flex-shrink-0">
              <Clock className="w-2.5 h-2.5" />
              {timeAgo}
            </span>
            {alert.assignee && (
              <span className="hidden sm:flex items-center gap-0.5 flex-shrink-0">
                <UserPlus className="w-2.5 h-2.5" />
                {alert.assignee}
              </span>
            )}
          </div>
        </div>

        {/* Status */}
        <span
          className={`hidden sm:inline text-[10px] px-2 py-0.5 rounded font-semibold uppercase ${
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

        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-1 flex-shrink-0">
          {canEdit && isActive && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); onAcknowledge(alert.id); }}
                className="p-1.5 rounded-md text-chart-3 hover:bg-chart-3/10 transition-colors"
                title="Acknowledge"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onAssign(alert.id); }}
                className="p-1.5 rounded-md text-primary hover:bg-primary/10 transition-colors"
                title="Assign"
              >
                <UserPlus className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onEscalate(alert.id); }}
                className="p-1.5 rounded-md text-destructive hover:bg-destructive/10 transition-colors"
                title="Escalate"
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onMapView(alert.id); }}
            className="p-1.5 rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            title="View on Map"
          >
            <Map className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Mobile chevron */}
        <ChevronRight className="w-4 h-4 text-muted-foreground/40 md:hidden flex-shrink-0" />
      </div>
    </div>
  );
}

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
