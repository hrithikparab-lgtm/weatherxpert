interface AssetMarkerProps {
  status: "normal" | "warning" | "critical";
  onClick: () => void;
  label?: string;
  selected?: boolean;
}

const colors = {
  normal: "bg-emerald-500 dark:bg-emerald-600",
  warning: "bg-amber-500 dark:bg-amber-600",
  critical: "bg-red-500 dark:bg-red-600",
};

const rings = {
  normal: "ring-emerald-500/30 dark:ring-emerald-500/20",
  warning: "ring-amber-500/30 dark:ring-amber-500/20",
  critical: "ring-red-500/30 dark:ring-red-500/20",
};

export function AssetMarker({ status, onClick, label, selected }: AssetMarkerProps) {
  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="group cursor-pointer relative flex flex-col items-center"
    >
      <div className="relative flex items-center justify-center w-6 h-6">
        <div
          className={`w-3 h-3 rounded-full ${colors[status]} shadow-lg transition-transform duration-300 ${
            selected ? "scale-125 ring-4 " + rings[status] : "group-hover:scale-110"
          }`}
        />
        {/* Pulse effect for warning/critical */}
        {(status === "warning" || status === "critical") && (
          <div
            className={`absolute inset-0 rounded-full ${colors[status]} animate-ping opacity-40`}
          />
        )}
      </div>
      
      {/* Label (visible on hover or selected) */}
      {(label && (selected)) && (
          <div className="absolute top-7 px-2 py-1 bg-popover/90 backdrop-blur border border-border rounded-md text-[10px] text-popover-foreground font-medium whitespace-nowrap shadow-xl z-20 animate-in fade-in slide-in-from-top-1 transition-colors duration-300">
            {label}
          </div>
      )}
    </div>
  );
}
