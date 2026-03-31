import {
  Thermometer,
  Droplets,
  Wind,
  AlertTriangle,
  Activity,
  Circle,
} from "lucide-react";

/* ═══════════════════════════════════════════════════
   MAP LEGEND — Top-right mini legend panel
   Shows active layer legends + station status
   ═══════════════════════════════════════════════════ */

interface MapLegendProps {
  showHeatmap: boolean;
  showRain: boolean;
  showWind: boolean;
}

export function MapLegend({ showHeatmap, showRain, showWind }: MapLegendProps) {
  return (
    <div className="bg-popover/90 backdrop-blur-md border border-border rounded-xl shadow-xl p-2.5 w-[180px] transition-colors duration-200">
      <p className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider mb-2 px-1">
        Legend
      </p>

      {/* Station status */}
      <div className="space-y-1.5 mb-2">
        <p className="text-[9px] text-muted-foreground/60 uppercase tracking-wider font-semibold px-1">Stations</p>
        {[
          { color: "bg-emerald-500", label: "Normal" },
          { color: "bg-amber-500", label: "Warning" },
          { color: "bg-red-500", label: "Critical" },
          { color: "bg-muted-foreground/30", label: "Offline" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-2 px-1">
            <span className={`w-2 h-2 rounded-full ${item.color} flex-shrink-0`} />
            <span className="text-[10px] text-muted-foreground">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Alert severity */}
      <div className="space-y-1.5 mb-2 pt-2 border-t border-border/50">
        <p className="text-[9px] text-muted-foreground/60 uppercase tracking-wider font-semibold px-1">Alerts</p>
        {[
          { color: "bg-red-500", label: "Critical" },
          { color: "bg-orange-500", label: "High" },
          { color: "bg-amber-500", label: "Medium" },
          { color: "bg-blue-500", label: "Low" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-2 px-1">
            <AlertTriangle className={`w-2.5 h-2.5 flex-shrink-0`} style={{ color: item.color.replace("bg-", "").includes("red") ? "#EF4444" : item.color.includes("orange") ? "#F97316" : item.color.includes("amber") ? "#F59E0B" : "#3B82F6" }} />
            <span className="text-[10px] text-muted-foreground">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Layer-specific legends */}
      {(showHeatmap || showRain || showWind) && (
        <div className="space-y-1.5 pt-2 border-t border-border/50">
          <p className="text-[9px] text-muted-foreground/60 uppercase tracking-wider font-semibold px-1">Overlays</p>
          {showHeatmap && (
            <div className="flex items-center gap-2 px-1">
              <div className="w-12 h-2 rounded-full bg-gradient-to-r from-blue-500 via-yellow-500 to-red-500 flex-shrink-0" />
              <span className="text-[9px] text-muted-foreground">Temp °C</span>
            </div>
          )}
          {showRain && (
            <div className="flex items-center gap-2 px-1">
              <div className="w-12 h-2 rounded-full bg-gradient-to-r from-green-300 via-green-500 to-blue-600 flex-shrink-0" />
              <span className="text-[9px] text-muted-foreground">Rain mm</span>
            </div>
          )}
          {showWind && (
            <div className="flex items-center gap-2 px-1">
              <Wind className="w-3 h-3 text-cyan-500 flex-shrink-0" />
              <span className="text-[9px] text-muted-foreground">Vectors</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
