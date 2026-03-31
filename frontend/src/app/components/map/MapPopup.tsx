import { AlertTriangle, ChevronRight, X } from "lucide-react";

interface MapPopupProps {
  data: {
    name: string;
    lat: string;
    lng: string;
    temp: number;
    condition: string;
    status: "normal" | "warning" | "critical";
    alerts?: number;
  };
  onClose: () => void;
  onDetails: () => void;
  position: { x: number; y: number };
}

const statusColor = {
  normal: "bg-emerald-500",
  warning: "bg-amber-500",
  critical: "bg-red-500",
};

export function MapPopup({ data, onClose, onDetails, position }: MapPopupProps) {
  return (
    <div
      className="absolute z-50 w-64 animate-in fade-in zoom-in-95 duration-200"
      style={{
        left: position.x,
        top: position.y,
        transform: "translate(-50%, -100%) translateY(-12px)",
      }}
    >
      <div className="relative bg-popover/95 backdrop-blur-md border border-border rounded-xl shadow-2xl overflow-hidden transition-colors duration-300">
        {/* Header */}
        <div className="px-4 py-3 border-b border-border flex items-start justify-between bg-secondary/50">
          <div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${statusColor[data.status]} shadow-[0_0_8px_currentColor]`} />
              <h4 className="text-[13px] font-semibold text-foreground tracking-wide">{data.name}</h4>
            </div>
            <div className="text-[10px] text-muted-foreground mt-0.5">{data.lat}, {data.lng}</div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[20px] font-bold text-foreground leading-none">{data.temp}°</div>
              <div className="text-[11px] text-muted-foreground mt-1">{data.condition}</div>
            </div>
            {/* Mini visual or icon could go here */}
          </div>

          {data.alerts && data.alerts > 0 && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 px-2 py-1.5 rounded-lg">
              <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
              <span className="text-[11px] text-red-600 dark:text-red-200 font-medium">{data.alerts} Active Alerts</span>
            </div>
          )}

          <div className="pt-2 border-t border-border">
            <button
              onClick={onDetails}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-[11px] font-medium rounded-lg transition-colors shadow-lg shadow-blue-900/20"
            >
              View Full Analytics
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Arrow pointer */}
        <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-popover/95 border-r border-b border-border rotate-45" />
      </div>
    </div>
  );
}
