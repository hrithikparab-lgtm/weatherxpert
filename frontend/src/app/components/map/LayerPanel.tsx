import { useState } from "react";
import {
  Layers,
  Satellite,
  Cloud,
  Wind,
  CloudRain,
  Navigation,
  Radio,
  Flame,
  MapPinned,
  CircleDot,
  ChevronDown,
  Check,
  X,
  Eye,
  EyeOff,
} from "lucide-react";
import { MAP_LAYERS, type LayerId } from "./mapData";

/* ═══════════════════════════════════════════════════
   LAYER PANEL — Left sidebar layer control
   Grouped by base / weather / overlay
   Collapse-able on desktop, drawer on mobile
   ═══════════════════════════════════════════════════ */

const LAYER_ICONS: Record<LayerId, React.ElementType> = {
  satellite: Satellite,
  cloud: Cloud,
  wind: Wind,
  rain: CloudRain,
  cyclone: Navigation,
  stations: Radio,
  heatmap: Flame,
  blocks: MapPinned,
  circles: CircleDot,
};

const GROUP_LABELS = {
  base: "Base Layers",
  weather: "Weather Overlays",
  overlay: "Analysis Overlays",
};

interface LayerPanelProps {
  activeLayers: Set<LayerId>;
  onToggle: (id: LayerId) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function LayerPanel({ activeLayers, onToggle, collapsed, onToggleCollapse }: LayerPanelProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(["base", "weather", "overlay"]));

  const toggleGroup = (group: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(group)) next.delete(group);
      else next.add(group);
      return next;
    });
  };

  const activeCount = activeLayers.size;

  if (collapsed) {
    return (
      <button
        onClick={onToggleCollapse}
        className="flex flex-col items-center gap-1 p-2 bg-popover/90 backdrop-blur-md border border-border rounded-xl shadow-xl transition-colors"
        title="Expand layers"
      >
        <Layers className="w-4 h-4 text-primary" />
        <span className="text-[9px] text-primary font-semibold tabular-nums">{activeCount}</span>
      </button>
    );
  }

  return (
    <div className="w-[220px] bg-popover/95 backdrop-blur-md border border-border rounded-xl shadow-2xl overflow-hidden transition-all duration-200 animate-in slide-in-from-left-2 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-border/60 bg-secondary/30">
        <div className="flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-primary" />
          <span className="text-[11px] text-foreground font-semibold uppercase tracking-wider">Layers</span>
          <span className="text-[9px] text-primary font-semibold tabular-nums px-1 py-0.5 rounded bg-primary/10">
            {activeCount}
          </span>
        </div>
        <button
          onClick={onToggleCollapse}
          className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <X className="w-3 h-3" />
        </button>
      </div>

      {/* Groups */}
      <div className="max-h-[420px] overflow-y-auto py-1">
        {(["base", "weather", "overlay"] as const).map((group) => {
          const layers = MAP_LAYERS.filter((l) => l.group === group);
          const isExpanded = expandedGroups.has(group);

          return (
            <div key={group} className="px-2">
              <button
                onClick={() => toggleGroup(group)}
                className="w-full flex items-center gap-1.5 px-1.5 py-1.5 text-left rounded-md hover:bg-secondary/40 transition-colors"
              >
                <ChevronDown
                  className={`w-3 h-3 text-muted-foreground transition-transform ${isExpanded ? "" : "-rotate-90"}`}
                />
                <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider flex-1">
                  {GROUP_LABELS[group]}
                </span>
              </button>

              {isExpanded && (
                <div className="space-y-0.5 mb-1 animate-in slide-in-from-top-1 duration-150">
                  {layers.map((layer) => {
                    const Icon = LAYER_ICONS[layer.id];
                    const isActive = activeLayers.has(layer.id);

                    return (
                      <button
                        key={layer.id}
                        onClick={() => onToggle(layer.id)}
                        className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg text-left transition-all group ${
                          isActive
                            ? "bg-primary/8 text-foreground"
                            : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 transition-colors ${
                          isActive ? "bg-primary/15 text-primary" : "bg-secondary/60 text-muted-foreground group-hover:text-foreground"
                        }`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-medium truncate">{layer.label}</p>
                        </div>
                        {isActive ? (
                          <Eye className="w-3 h-3 text-primary flex-shrink-0" />
                        ) : (
                          <EyeOff className="w-3 h-3 text-muted-foreground/30 flex-shrink-0 group-hover:text-muted-foreground" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Mobile Layer Drawer ── */
interface MobileLayerDrawerProps {
  open: boolean;
  onClose: () => void;
  activeLayers: Set<LayerId>;
  onToggle: (id: LayerId) => void;
}

export function MobileLayerDrawer({ open, onClose, activeLayers, onToggle }: MobileLayerDrawerProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute bottom-0 left-0 right-0 bg-card border-t border-border rounded-t-2xl shadow-xl max-h-[60vh] flex flex-col animate-in slide-in-from-bottom duration-300">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" />
            <h3 className="text-[14px] text-foreground font-medium">Map Layers</h3>
            <span className="text-[10px] text-primary font-semibold tabular-nums px-1.5 py-0.5 rounded bg-primary/10">
              {activeLayers.size} active
            </span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {MAP_LAYERS.map((layer) => {
            const Icon = LAYER_ICONS[layer.id];
            const isActive = activeLayers.has(layer.id);
            return (
              <button
                key={layer.id}
                onClick={() => onToggle(layer.id)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                  isActive
                    ? "bg-primary/8 border border-primary/15"
                    : "bg-secondary/30 border border-transparent hover:bg-secondary/60"
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  isActive ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 text-left">
                  <p className={`text-[12px] font-medium ${isActive ? "text-foreground" : "text-muted-foreground"}`}>{layer.label}</p>
                  <p className="text-[10px] text-muted-foreground/60">{layer.description}</p>
                </div>
                {isActive && <Check className="w-4 h-4 text-primary flex-shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
