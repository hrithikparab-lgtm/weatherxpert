import {
  X,
  Thermometer,
  Droplets,
  Wind,
  CloudRain,
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  MapPin,
  Zap,
  Sun,
  Factory,
  Radio,
  Cloud,
} from "lucide-react";
import { type StationRecord, STATION_TYPE_LABELS } from "./mapData";

/* ═══════════════════════════════════════════════════
   STATION POPUP — Rich popup with forecast snapshot,
   active alerts, and CTA
   ═══════════════════════════════════════════════════ */

interface StationPopupProps {
  station: StationRecord;
  onClose: () => void;
  onViewDetail?: () => void;
}

const STATUS_STYLES = {
  normal: { dot: "bg-emerald-500", label: "Normal", glow: "shadow-emerald-500/30" },
  warning: { dot: "bg-amber-500", label: "Warning", glow: "shadow-amber-500/30" },
  critical: { dot: "bg-red-500", label: "Critical", glow: "shadow-red-500/30" },
  offline: { dot: "bg-muted-foreground/30", label: "Offline", glow: "" },
};

const TYPE_ICONS: Record<StationRecord["type"], React.ElementType> = {
  thermal: Factory,
  solar: Sun,
  wind: Wind,
  hydro: Droplets,
  substation: Zap,
  weather: Cloud,
};

export function StationPopup({ station, onClose, onViewDetail }: StationPopupProps) {
  const status = STATUS_STYLES[station.status];
  const TypeIcon = TYPE_ICONS[station.type];

  return (
    <div className="relative bg-popover/95 backdrop-blur-md border border-border rounded-xl shadow-2xl overflow-hidden w-[280px] animate-in fade-in zoom-in-95 duration-200 transition-colors">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border/60 bg-secondary/30">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-2 min-w-0">
            <div className={`w-7 h-7 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0 mt-0.5`}>
              <TypeIcon className="w-3.5 h-3.5 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${status.dot} shadow-lg ${status.glow} flex-shrink-0`} />
                <h4 className="text-[13px] text-foreground font-medium truncate">{station.name}</h4>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[9px] text-muted-foreground">{STATION_TYPE_LABELS[station.type]}</span>
                <span className="text-[9px] text-muted-foreground/40">·</span>
                <span className="text-[9px] text-muted-foreground tabular-nums">
                  {station.lat.toFixed(2)}°N, {station.lng.toFixed(2)}°E
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors flex-shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Current conditions */}
      <div className="px-4 py-3 space-y-3">
        {/* Temperature hero */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[28px] text-foreground tabular-nums tracking-tight leading-none">
              {station.temp}°C
            </div>
            <div className="text-[11px] text-muted-foreground mt-1">{station.condition}</div>
          </div>
          <Thermometer className="w-8 h-8 text-muted-foreground/20" />
        </div>

        {/* Weather grid */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: Droplets, label: "Humidity", value: `${station.humidity}%`, color: "text-blue-500" },
            { icon: Wind, label: "Wind", value: `${station.windSpeed} km/h`, color: "text-cyan-500" },
            { icon: CloudRain, label: "Rain", value: `${station.rainfall} mm`, color: "text-emerald-500" },
          ].map((item) => (
            <div key={item.label} className="text-center p-1.5 rounded-lg bg-secondary/30">
              <item.icon className={`w-3 h-3 mx-auto mb-0.5 ${item.color}`} />
              <p className="text-[10px] text-foreground font-medium tabular-nums">{item.value}</p>
              <p className="text-[8px] text-muted-foreground/60">{item.label}</p>
            </div>
          ))}
        </div>

        {/* Forecast snapshot */}
        <div className="rounded-lg border border-border/40 bg-secondary/20 p-2.5">
          <p className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider mb-1.5">
            24h Forecast
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-[11px]">
                <TrendingUp className="w-3 h-3 text-destructive" />
                <span className="text-foreground font-medium tabular-nums">{station.forecastHigh}°</span>
              </div>
              <div className="flex items-center gap-1 text-[11px]">
                <TrendingDown className="w-3 h-3 text-blue-500" />
                <span className="text-foreground font-medium tabular-nums">{station.forecastLow}°</span>
              </div>
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">{station.forecastCondition}</p>
        </div>

        {/* Active alerts */}
        {station.activeAlerts > 0 && (
          <div className="flex items-center gap-2 px-2.5 py-2 bg-destructive/8 border border-destructive/15 rounded-lg">
            <AlertTriangle className="w-3.5 h-3.5 text-destructive flex-shrink-0" />
            <span className="text-[11px] text-destructive font-medium">
              {station.activeAlerts} Active Alert{station.activeAlerts > 1 ? "s" : ""}
            </span>
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="px-4 py-3 border-t border-border/60">
        <button
          className="w-full flex items-center justify-center gap-1.5 py-2 bg-primary text-primary-foreground rounded-lg text-[11px] font-medium hover:bg-primary/90 transition-colors shadow-sm"
          onClick={onViewDetail}
        >
          Open Location Detail
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      {/* Arrow pointer */}
      <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-popover/95 border-r border-b border-border rotate-45" />
    </div>
  );
}