import { Layers, Check } from "lucide-react";

interface Layer {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface MapLayersProps {
  layers: Layer[];
  activeLayers: string[];
  onToggle: (id: string) => void;
}

export function MapLayers({ layers, activeLayers, onToggle }: MapLayersProps) {
  return (
    <div className="bg-popover/90 backdrop-blur-md border border-border rounded-xl p-2 shadow-2xl w-48 transition-colors duration-300">
      <div className="flex items-center gap-2 px-2 py-1.5 mb-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
        <Layers className="w-3.5 h-3.5" />
        Map Layers
      </div>
      <div className="space-y-0.5">
        {layers.map((layer) => {
          const isActive = activeLayers.includes(layer.id);
          return (
            <button
              key={layer.id}
              onClick={() => onToggle(layer.id)}
              className={`w-full flex items-center justify-between px-2 py-2 rounded-lg text-[12px] transition-all group ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className={isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}>
                    {layer.icon}
                </span>
                <span className="font-medium">{layer.label}</span>
              </div>
              {isActive && <Check className="w-3.5 h-3.5 text-primary" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
