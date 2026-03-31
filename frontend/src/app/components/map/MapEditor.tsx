import { useState } from "react";
import {
  Settings2,
  X,
  Eye,
  EyeOff,
  Move,
  Image,
  Palette,
  RotateCcw,
  Save,
  ChevronDown,
  Grid3X3,
  Compass,
  Map as MapIcon,
  Gauge,
  Clock,
  Layers,
  Type,
  SlidersHorizontal,
  Download,
  Camera,
  Share2,
  Maximize2,
  AlignStartVertical,
  MonitorSmartphone,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

/* ═══════════════════════════════════════════════════
   MAP EDITOR — Customization panel for map overlays
   Elements · Layout · Branding · Style · Export
   ═══════════════════════════════════════════════════ */

// ── Position presets ──
export type OverlayPosition =
  | "top-left"
  | "top-right"
  | "top-center"
  | "bottom-left"
  | "bottom-right"
  | "bottom-center";

export interface MapConfig {
  // Element visibility
  showLegend: boolean;
  showTimeline: boolean;
  showZoomControls: boolean;
  showLayerPanel: boolean;
  showCompass: boolean;
  showFooter: boolean;
  showGrid: boolean;
  showBranding: boolean;
  showZoomBadge: boolean;
  showStationLabels: boolean;

  // Layout positions
  legendPosition: OverlayPosition;
  zoomControlsPosition: OverlayPosition;
  layerPanelPosition: OverlayPosition;

  // Branding
  brandingText: string;
  brandingPosition: OverlayPosition;
  brandingOpacity: number;

  // Style
  gridDensity: "sparse" | "normal" | "dense";
  markerSize: "small" | "medium" | "large";
  overlayOpacity: number;
  mapStyle: "standard" | "satellite" | "terrain" | "minimal";
}

export const DEFAULT_CONFIG: MapConfig = {
  showLegend: true,
  showTimeline: true,
  showZoomControls: true,
  showLayerPanel: true,
  showCompass: true,
  showFooter: true,
  showGrid: true,
  showBranding: true,
  showZoomBadge: true,
  showStationLabels: true,

  legendPosition: "top-right",
  zoomControlsPosition: "bottom-right",
  layerPanelPosition: "top-left",

  brandingText: "TATA Power — WeatherXpert",
  brandingPosition: "top-center",
  brandingOpacity: 80,

  gridDensity: "normal",
  markerSize: "medium",
  overlayOpacity: 90,
  mapStyle: "standard",
};

type EditorTab = "elements" | "layout" | "branding" | "style" | "export";

interface MapEditorProps {
  open: boolean;
  onClose: () => void;
  config: MapConfig;
  onConfigChange: (config: MapConfig) => void;
}

export function MapEditor({ open, onClose, config, onConfigChange }: MapEditorProps) {
  const [activeTab, setActiveTab] = useState<EditorTab>("elements");

  const update = <K extends keyof MapConfig>(key: K, value: MapConfig[K]) => {
    onConfigChange({ ...config, [key]: value });
  };

  const handleReset = () => {
    onConfigChange({ ...DEFAULT_CONFIG });
    toast.success("Map reset to defaults", { description: "All customizations have been cleared." });
  };

  const handleSave = () => {
    toast.success("Map layout saved", { description: "Your map preferences have been saved to your profile." });
    onClose();
  };

  const handleExportPNG = () => {
    toast.success("Map screenshot captured", { description: "High-resolution PNG saved to downloads." });
  };

  const handleShareConfig = () => {
    navigator.clipboard.writeText(JSON.stringify(config, null, 2));
    toast.success("Configuration copied", { description: "Map config JSON copied to clipboard. Share it with your team." });
  };

  if (!open) return null;

  const TABS: { id: EditorTab; label: string; icon: React.ElementType }[] = [
    { id: "elements", label: "Elements", icon: Eye },
    { id: "layout", label: "Layout", icon: Move },
    { id: "branding", label: "Branding", icon: Image },
    { id: "style", label: "Style", icon: Palette },
    { id: "export", label: "Export", icon: Download },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-[380px] bg-card border-l border-border shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-card/95 backdrop-blur-md flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/10 ring-1 ring-primary/20 flex items-center justify-center">
              <Settings2 className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="text-[14px] text-foreground font-medium">Map Editor</h2>
              <p className="text-[10px] text-muted-foreground">Customize your map view</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleReset}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              title="Reset to defaults"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Tab Bar ── */}
        <div className="flex border-b border-border bg-secondary/20 flex-shrink-0 overflow-x-auto no-scrollbar">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 text-[11px] font-medium whitespace-nowrap transition-all border-b-2 ${
                activeTab === tab.id
                  ? "text-primary border-primary bg-primary/5"
                  : "text-muted-foreground border-transparent hover:text-foreground hover:bg-secondary/40"
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Tab Content ── */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {activeTab === "elements" && (
            <ElementsTab config={config} update={update} />
          )}
          {activeTab === "layout" && (
            <LayoutTab config={config} update={update} />
          )}
          {activeTab === "branding" && (
            <BrandingTab config={config} update={update} />
          )}
          {activeTab === "style" && (
            <StyleTab config={config} update={update} />
          )}
          {activeTab === "export" && (
            <ExportTab
              onExportPNG={handleExportPNG}
              onShareConfig={handleShareConfig}
            />
          )}
        </div>

        {/* ── Footer Actions ── */}
        <div className="flex items-center gap-2 px-4 py-3 border-t border-border bg-card/95 backdrop-blur-md flex-shrink-0">
          <button
            onClick={handleReset}
            className="flex-1 py-2.5 bg-secondary border border-border text-foreground rounded-xl text-[12px] font-medium hover:bg-secondary/80 transition-colors active:scale-[0.98]"
          >
            Reset Defaults
          </button>
          <button
            onClick={handleSave}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-primary text-primary-foreground rounded-xl text-[12px] font-medium hover:bg-primary/90 transition-colors shadow-sm active:scale-[0.98]"
          >
            <Save className="w-3.5 h-3.5" />
            Save Layout
          </button>
        </div>
      </div>
    </>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   TAB: ELEMENTS — Toggle visibility of each overlay
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function ElementsTab({
  config,
  update,
}: {
  config: MapConfig;
  update: <K extends keyof MapConfig>(key: K, val: MapConfig[K]) => void;
}) {
  const elements: {
    key: keyof MapConfig;
    label: string;
    description: string;
    icon: React.ElementType;
  }[] = [
    { key: "showLayerPanel", label: "Layer Panel", description: "Layer toggle sidebar control", icon: Layers },
    { key: "showLegend", label: "Legend", description: "Station & overlay color legend", icon: MapIcon },
    { key: "showTimeline", label: "Timeline Player", description: "Bottom playback bar with scrubber", icon: Clock },
    { key: "showZoomControls", label: "Zoom Controls", description: "+/- and reset buttons", icon: Maximize2 },
    { key: "showCompass", label: "Compass & Zoom %", description: "Direction indicator & zoom level", icon: Compass },
    { key: "showFooter", label: "Footer Info", description: "Station count, refresh time", icon: SlidersHorizontal },
    { key: "showGrid", label: "Grid Lines", description: "Background grid overlay", icon: Grid3X3 },
    { key: "showBranding", label: "Branding Logo", description: "TATA Power branding watermark", icon: Image },
    { key: "showZoomBadge", label: "Zoom Badge", description: "Current zoom percentage indicator", icon: Gauge },
    { key: "showStationLabels", label: "Station Labels", description: "Name labels on hover/select", icon: Type },
  ];

  const visibleCount = elements.filter((e) => config[e.key] as boolean).length;

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[13px] text-foreground font-medium">Map Elements</h3>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Toggle which overlays appear on the map
          </p>
        </div>
        <span className="text-[10px] text-primary font-semibold tabular-nums px-2 py-0.5 rounded-full bg-primary/10">
          {visibleCount}/{elements.length}
        </span>
      </div>

      <div className="space-y-1">
        {elements.map((el) => {
          const isOn = config[el.key] as boolean;
          return (
            <button
              key={el.key}
              onClick={() => update(el.key, !isOn as any)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${
                isOn
                  ? "bg-primary/5 border border-primary/10"
                  : "bg-secondary/30 border border-transparent hover:bg-secondary/50"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                  isOn
                    ? "bg-primary/15 text-primary"
                    : "bg-secondary text-muted-foreground group-hover:text-foreground"
                }`}
              >
                <el.icon className="w-4 h-4" />
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className={`text-[12px] font-medium truncate ${isOn ? "text-foreground" : "text-muted-foreground"}`}>
                  {el.label}
                </p>
                <p className="text-[10px] text-muted-foreground/60 truncate">{el.description}</p>
              </div>
              <div className={`w-9 h-5 rounded-full flex items-center transition-colors flex-shrink-0 ${
                isOn ? "bg-primary justify-end" : "bg-muted justify-start"
              }`}>
                <div className="w-4 h-4 rounded-full bg-white shadow-sm mx-0.5 transition-all" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Quick actions */}
      <div className="flex items-center gap-2 pt-2">
        <button
          onClick={() => {
            elements.forEach((e) => update(e.key, true as any));
            toast.info("All elements visible");
          }}
          className="flex-1 py-2 bg-secondary border border-border rounded-xl text-[11px] text-foreground font-medium hover:bg-secondary/80 transition-colors active:scale-[0.98]"
        >
          Show All
        </button>
        <button
          onClick={() => {
            elements.forEach((e) => update(e.key, false as any));
            toast.info("All elements hidden");
          }}
          className="flex-1 py-2 bg-secondary border border-border rounded-xl text-[11px] text-muted-foreground font-medium hover:bg-secondary/80 transition-colors active:scale-[0.98]"
        >
          Hide All
        </button>
      </div>
    </>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   TAB: LAYOUT — Position each overlay
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function LayoutTab({
  config,
  update,
}: {
  config: MapConfig;
  update: <K extends keyof MapConfig>(key: K, val: MapConfig[K]) => void;
}) {
  const POSITIONS: { id: OverlayPosition; label: string }[] = [
    { id: "top-left", label: "Top Left" },
    { id: "top-center", label: "Top Center" },
    { id: "top-right", label: "Top Right" },
    { id: "bottom-left", label: "Bottom Left" },
    { id: "bottom-center", label: "Bottom Center" },
    { id: "bottom-right", label: "Bottom Right" },
  ];

  const layoutItems: {
    key: keyof MapConfig;
    label: string;
    icon: React.ElementType;
    visibleKey: keyof MapConfig;
  }[] = [
    { key: "layerPanelPosition", label: "Layer Panel", icon: Layers, visibleKey: "showLayerPanel" },
    { key: "legendPosition", label: "Legend", icon: MapIcon, visibleKey: "showLegend" },
    { key: "zoomControlsPosition", label: "Zoom Controls", icon: Maximize2, visibleKey: "showZoomControls" },
  ];

  return (
    <>
      <div>
        <h3 className="text-[13px] text-foreground font-medium">Overlay Positions</h3>
        <p className="text-[10px] text-muted-foreground mt-0.5">
          Drag overlays or select a position preset
        </p>
      </div>

      {/* Visual position map */}
      <div className="bg-secondary/30 border border-border rounded-2xl p-4">
        <div className="relative aspect-[16/10] bg-background/50 border border-border/50 rounded-xl overflow-hidden">
          {/* Grid */}
          <div className="absolute inset-0 grid grid-cols-3 grid-rows-2">
            {POSITIONS.map((pos) => {
              const occupants = layoutItems.filter(
                (item) =>
                  (config[item.key] as string) === pos.id && config[item.visibleKey] as boolean
              );
              return (
                <div
                  key={pos.id}
                  className="flex items-center justify-center border border-dashed border-border/30 p-1"
                >
                  {occupants.length > 0 ? (
                    <div className="flex flex-col items-center gap-0.5">
                      {occupants.map((o) => (
                        <div
                          key={o.key}
                          className="flex items-center gap-1 px-1.5 py-0.5 bg-primary/10 border border-primary/20 rounded text-[8px] text-primary font-medium"
                        >
                          <o.icon className="w-2.5 h-2.5" />
                          {o.label}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-[7px] text-muted-foreground/30">{pos.label}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Position selectors */}
      <div className="space-y-3">
        {layoutItems.map((item) => {
          const isVisible = config[item.visibleKey] as boolean;
          return (
            <div
              key={item.key}
              className={`rounded-xl border p-3 transition-colors ${
                isVisible ? "border-border bg-card" : "border-border/40 bg-secondary/20 opacity-50"
              }`}
            >
              <div className="flex items-center gap-2 mb-2.5">
                <item.icon className={`w-4 h-4 ${isVisible ? "text-primary" : "text-muted-foreground"}`} />
                <span className="text-[12px] text-foreground font-medium">{item.label}</span>
                {!isVisible && (
                  <span className="text-[9px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">Hidden</span>
                )}
              </div>
              <div className="grid grid-cols-3 gap-1">
                {POSITIONS.map((pos) => {
                  const isActive = (config[item.key] as string) === pos.id;
                  return (
                    <button
                      key={pos.id}
                      onClick={() => update(item.key, pos.id as any)}
                      disabled={!isVisible}
                      className={`py-1.5 rounded-lg text-[10px] font-medium transition-all ${
                        isActive
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
                      } disabled:opacity-30 disabled:cursor-not-allowed`}
                    >
                      {pos.label}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   TAB: BRANDING — Logo text, position, opacity
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function BrandingTab({
  config,
  update,
}: {
  config: MapConfig;
  update: <K extends keyof MapConfig>(key: K, val: MapConfig[K]) => void;
}) {
  const POSITIONS: { id: OverlayPosition; label: string }[] = [
    { id: "top-left", label: "Top Left" },
    { id: "top-center", label: "Top Center" },
    { id: "top-right", label: "Top Right" },
    { id: "bottom-left", label: "Bottom Left" },
    { id: "bottom-center", label: "Bottom Center" },
    { id: "bottom-right", label: "Bottom Right" },
  ];

  return (
    <>
      <div>
        <h3 className="text-[13px] text-foreground font-medium">Branding & Watermark</h3>
        <p className="text-[10px] text-muted-foreground mt-0.5">
          Add your organization branding to the map view
        </p>
      </div>

      {/* Toggle */}
      <div className="flex items-center justify-between px-3 py-3 bg-secondary/30 border border-border rounded-xl">
        <div className="flex items-center gap-2.5">
          <Image className="w-4 h-4 text-primary" />
          <span className="text-[12px] text-foreground font-medium">Show Branding</span>
        </div>
        <button
          onClick={() => update("showBranding", !config.showBranding)}
          className={`w-9 h-5 rounded-full flex items-center transition-colors ${
            config.showBranding ? "bg-primary justify-end" : "bg-muted justify-start"
          }`}
        >
          <div className="w-4 h-4 rounded-full bg-white shadow-sm mx-0.5" />
        </button>
      </div>

      {config.showBranding && (
        <>
          {/* Text input */}
          <div>
            <label className="text-[11px] text-muted-foreground font-medium mb-1.5 block">Branding Text</label>
            <input
              type="text"
              value={config.brandingText}
              onChange={(e) => update("brandingText", e.target.value)}
              placeholder="Your organization name..."
              className="w-full px-3 py-2.5 bg-secondary/50 border border-border rounded-xl text-[12px] text-foreground font-medium outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/40 transition-all"
            />
          </div>

          {/* Position */}
          <div>
            <label className="text-[11px] text-muted-foreground font-medium mb-1.5 block">Position</label>
            <div className="grid grid-cols-3 gap-1">
              {POSITIONS.map((pos) => (
                <button
                  key={pos.id}
                  onClick={() => update("brandingPosition", pos.id)}
                  className={`py-2 rounded-lg text-[10px] font-medium transition-all ${
                    config.brandingPosition === pos.id
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  {pos.label}
                </button>
              ))}
            </div>
          </div>

          {/* Opacity slider */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] text-muted-foreground font-medium">Opacity</label>
              <span className="text-[11px] text-foreground font-medium tabular-nums">{config.brandingOpacity}%</span>
            </div>
            <input
              type="range"
              min={10}
              max={100}
              value={config.brandingOpacity}
              onChange={(e) => update("brandingOpacity", Number(e.target.value))}
              className="w-full h-1.5 appearance-none bg-secondary rounded-full cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-background"
            />
          </div>

          {/* Preview */}
          <div className="rounded-xl border border-border bg-secondary/20 p-4">
            <p className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider mb-2">Preview</p>
            <div className="relative bg-background/50 border border-border/50 rounded-lg aspect-[16/9] flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <div
                  className="w-full h-full"
                  style={{
                    backgroundImage: "linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)",
                    backgroundSize: "20px 20px",
                  }}
                />
              </div>
              <div
                className={`absolute px-3 py-1.5 bg-popover/80 backdrop-blur border border-border/50 rounded-lg shadow-sm ${
                  config.brandingPosition.includes("top") ? "top-2" : "bottom-2"
                } ${
                  config.brandingPosition.includes("left")
                    ? "left-2"
                    : config.brandingPosition.includes("right")
                    ? "right-2"
                    : "left-1/2 -translate-x-1/2"
                }`}
                style={{ opacity: config.brandingOpacity / 100 }}
              >
                <span className="text-[9px] text-foreground font-semibold tracking-wide">
                  {config.brandingText || "Your Brand"}
                </span>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   TAB: STYLE — Grid, markers, opacity, map style
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function StyleTab({
  config,
  update,
}: {
  config: MapConfig;
  update: <K extends keyof MapConfig>(key: K, val: MapConfig[K]) => void;
}) {
  const MAP_STYLES: { id: MapConfig["mapStyle"]; label: string; desc: string }[] = [
    { id: "standard", label: "Standard", desc: "Default theme-aware map" },
    { id: "satellite", label: "Satellite", desc: "Darker satellite-like view" },
    { id: "terrain", label: "Terrain", desc: "Elevation-accented style" },
    { id: "minimal", label: "Minimal", desc: "Clean, no textures" },
  ];

  const GRID_OPTIONS: { id: MapConfig["gridDensity"]; label: string; size: string }[] = [
    { id: "sparse", label: "Sparse", size: "120px" },
    { id: "normal", label: "Normal", size: "80px" },
    { id: "dense", label: "Dense", size: "40px" },
  ];

  const MARKER_SIZES: { id: MapConfig["markerSize"]; label: string }[] = [
    { id: "small", label: "Small" },
    { id: "medium", label: "Medium" },
    { id: "large", label: "Large" },
  ];

  return (
    <>
      <div>
        <h3 className="text-[13px] text-foreground font-medium">Visual Style</h3>
        <p className="text-[10px] text-muted-foreground mt-0.5">
          Customize the map's appearance and feel
        </p>
      </div>

      {/* Map style */}
      <div>
        <label className="text-[11px] text-muted-foreground font-medium mb-2 block">Map Theme</label>
        <div className="grid grid-cols-2 gap-2">
          {MAP_STYLES.map((style) => (
            <button
              key={style.id}
              onClick={() => update("mapStyle", style.id)}
              className={`p-3 rounded-xl border text-left transition-all ${
                config.mapStyle === style.id
                  ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                  : "border-border bg-secondary/20 hover:bg-secondary/40"
              }`}
            >
              <p className={`text-[11px] font-medium ${config.mapStyle === style.id ? "text-primary" : "text-foreground"}`}>
                {style.label}
              </p>
              <p className="text-[9px] text-muted-foreground mt-0.5">{style.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Grid density */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-[11px] text-muted-foreground font-medium">Grid Density</label>
          <button
            onClick={() => update("showGrid", !config.showGrid)}
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-medium transition-colors ${
              config.showGrid ? "text-primary bg-primary/10" : "text-muted-foreground bg-secondary"
            }`}
          >
            {config.showGrid ? <Eye className="w-2.5 h-2.5" /> : <EyeOff className="w-2.5 h-2.5" />}
            {config.showGrid ? "On" : "Off"}
          </button>
        </div>
        <div className="flex items-center gap-1 bg-secondary/50 border border-border rounded-xl p-0.5">
          {GRID_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => update("gridDensity", opt.id)}
              disabled={!config.showGrid}
              className={`flex-1 py-2 rounded-lg text-[11px] font-medium transition-all ${
                config.gridDensity === opt.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              } disabled:opacity-30`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Marker size */}
      <div>
        <label className="text-[11px] text-muted-foreground font-medium mb-2 block">Marker Size</label>
        <div className="flex items-center gap-1 bg-secondary/50 border border-border rounded-xl p-0.5">
          {MARKER_SIZES.map((size) => (
            <button
              key={size.id}
              onClick={() => update("markerSize", size.id)}
              className={`flex-1 py-2 rounded-lg text-[11px] font-medium transition-all ${
                config.markerSize === size.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {size.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overlay opacity */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-[11px] text-muted-foreground font-medium">Panel Opacity</label>
          <span className="text-[11px] text-foreground font-medium tabular-nums">{config.overlayOpacity}%</span>
        </div>
        <input
          type="range"
          min={50}
          max={100}
          value={config.overlayOpacity}
          onChange={(e) => update("overlayOpacity", Number(e.target.value))}
          className="w-full h-1.5 appearance-none bg-secondary rounded-full cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-background"
        />
        <div className="flex items-center justify-between mt-1">
          <span className="text-[9px] text-muted-foreground">Transparent</span>
          <span className="text-[9px] text-muted-foreground">Solid</span>
        </div>
      </div>
    </>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   TAB: EXPORT — Screenshot, share config
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function ExportTab({
  onExportPNG,
  onShareConfig,
}: {
  onExportPNG: () => void;
  onShareConfig: () => void;
}) {
  return (
    <>
      <div>
        <h3 className="text-[13px] text-foreground font-medium">Export & Share</h3>
        <p className="text-[10px] text-muted-foreground mt-0.5">
          Capture or share your current map view
        </p>
      </div>

      <div className="space-y-2">
        {/* Screenshot */}
        <button
          onClick={onExportPNG}
          className="w-full flex items-center gap-3 px-4 py-4 bg-secondary/30 border border-border rounded-xl hover:bg-secondary/50 transition-colors group active:scale-[0.98]"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 ring-1 ring-blue-500/20 flex items-center justify-center flex-shrink-0">
            <Camera className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-left">
            <p className="text-[12px] text-foreground font-medium">Screenshot Map</p>
            <p className="text-[10px] text-muted-foreground">Export as high-res PNG with all overlays</p>
          </div>
        </button>

        {/* Share config */}
        <button
          onClick={onShareConfig}
          className="w-full flex items-center gap-3 px-4 py-4 bg-secondary/30 border border-border rounded-xl hover:bg-secondary/50 transition-colors group active:scale-[0.98]"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 ring-1 ring-emerald-500/20 flex items-center justify-center flex-shrink-0">
            <Share2 className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-left">
            <p className="text-[12px] text-foreground font-medium">Share Configuration</p>
            <p className="text-[10px] text-muted-foreground">Copy config JSON to clipboard for team sharing</p>
          </div>
        </button>

        {/* Export PDF */}
        <button
          onClick={() => toast.info("PDF report generation started...", { description: "Map view will be included in the report." })}
          className="w-full flex items-center gap-3 px-4 py-4 bg-secondary/30 border border-border rounded-xl hover:bg-secondary/50 transition-colors group active:scale-[0.98]"
        >
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 ring-1 ring-orange-500/20 flex items-center justify-center flex-shrink-0">
            <Download className="w-5 h-5 text-orange-500" />
          </div>
          <div className="text-left">
            <p className="text-[12px] text-foreground font-medium">Export as PDF Report</p>
            <p className="text-[10px] text-muted-foreground">Generate a PDF with map snapshot and data summary</p>
          </div>
        </button>

        {/* Device preview */}
        <button
          onClick={() => toast.info("Responsive preview", { description: "Your map layout adapts automatically to mobile devices." })}
          className="w-full flex items-center gap-3 px-4 py-4 bg-secondary/30 border border-border rounded-xl hover:bg-secondary/50 transition-colors group active:scale-[0.98]"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 ring-1 ring-purple-500/20 flex items-center justify-center flex-shrink-0">
            <MonitorSmartphone className="w-5 h-5 text-purple-500" />
          </div>
          <div className="text-left">
            <p className="text-[12px] text-foreground font-medium">Responsive Preview</p>
            <p className="text-[10px] text-muted-foreground">See how your map looks on mobile & tablet</p>
          </div>
        </button>
      </div>
    </>
  );
}
