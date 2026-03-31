import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  STATIONS,
  ALERT_MARKERS,
  clusterStations,
  isCluster,
  type LayerId,
  type StationRecord,
} from "../components/map/mapData";
import { useSearchParams } from "react-router";
import { useTheme } from "next-themes";
import { StationPopup } from "../components/map/StationPopup";
import { motion, AnimatePresence } from "motion/react";
import {
  Plus,
  Minus,
  Maximize,
  Layers,
  LocateFixed,
  Factory,
  Sun,
  Wind,
  Droplets,
  Zap,
  Cloud,
  Clock,
  TrendingUp,
  Play,
  Pause,
  Search,
  AlertTriangle,
  Thermometer,
  Activity,
  Globe,
  Map,
  BarChart2,
  Radar,
  History,
  CloudLightning,
  Gauge,
  Sliders,
  RefreshCw,
  Download,
  X,
  MapPin,
  Crosshair,
  Navigation,
  Grid,
  ExternalLink,
  SkipBack,
  SkipForward,
  ChevronRight,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { toast } from "sonner";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
type MainTab = "live-map" | "forecast" | "radar" | "severe" | "historical" | "climate" | "models";
type WeatherLayer = "temperature" | "precipitation" | "wind" | "clouds" | "humidity" | "pressure" | "uv" | "aqi";
type MapStyle = "satellite" | "standard" | "terrain" | "minimal";

const TYPE_ICONS: Record<StationRecord["type"], React.ElementType> = {
  thermal: Factory,
  solar: Sun,
  wind: Wind,
  hydro: Droplets,
  substation: Zap,
  weather: Cloud,
};

const STATUS_COLORS = {
  normal:   { dot: "bg-emerald-500", ring: "ring-emerald-400/30", glow: "shadow-emerald-500/50" },
  warning:  { dot: "bg-amber-500",   ring: "ring-amber-400/30",   glow: "shadow-amber-500/50"  },
  critical: { dot: "bg-red-500",     ring: "ring-red-400/30",     glow: "shadow-red-500/50"    },
  offline:  { dot: "bg-slate-400",   ring: "ring-slate-400/20",   glow: ""                     },
};

// ─────────────────────────────────────────────
// Mock data
// ─────────────────────────────────────────────
const FORECAST_DATA = Array.from({ length: 15 }, (_, i) => ({
  day: i === 0 ? "Today" : i === 1 ? "Tomorrow" : `Day ${i + 1}`,
  temp_max: 28 + Math.round(Math.sin(i * 0.5) * 6 + Math.random() * 3),
  temp_min: 18 + Math.round(Math.sin(i * 0.4) * 4 + Math.random() * 2),
  precipitation: Math.max(0, Math.round(Math.sin(i * 0.8) * 15 + Math.random() * 10)),
  wind: 12 + Math.round(Math.sin(i * 0.6) * 8 + Math.random() * 4),
  humidity: 55 + Math.round(Math.sin(i * 0.4) * 20 + Math.random() * 5),
}));

const RADAR_FRAMES = Array.from({ length: 12 }, (_, i) => ({
  time: `${String((new Date().getHours() - 11 + i + 24) % 24).padStart(2, "0")}:${i % 2 === 0 ? "00" : "30"}`,
  intensity: 20 + Math.round(Math.sin(i * 0.7) * 30 + Math.random() * 20),
}));

const SEVERE_ALERTS = [
  { id: "ALT-001", type: "Cyclone Warning",     region: "Bay of Bengal Coast",   severity: "Extreme", issued: "2h ago",  expires: "48h", color: "red"    },
  { id: "ALT-002", type: "Heat Wave Advisory",   region: "Rajasthan, Gujarat",    severity: "High",    issued: "4h ago",  expires: "72h", color: "orange" },
  { id: "ALT-003", type: "Heavy Rainfall Alert", region: "Kerala, Karnataka",     severity: "High",    issued: "1h ago",  expires: "24h", color: "orange" },
  { id: "ALT-004", type: "Strong Wind Warning",  region: "Kutch Wind Corridor",   severity: "Medium",  issued: "30m ago", expires: "12h", color: "amber"  },
  { id: "ALT-005", type: "Fog Advisory",         region: "Punjab, Haryana",       severity: "Low",     issued: "6h ago",  expires: "8h",  color: "yellow" },
  { id: "ALT-006", type: "Thunderstorm Watch",   region: "Maharashtra Deccan",    severity: "Medium",  issued: "2h ago",  expires: "18h", color: "amber"  },
];

const HISTORICAL_DATA = Array.from({ length: 12 }, (_, i) => ({
  month: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][i],
  avg_temp: 18 + Math.round(Math.sin((i / 12) * Math.PI * 2) * 10),
  rainfall:  30 + Math.round(Math.sin((i / 12) * Math.PI * 1.5 + 1) * 80 + Math.random() * 20),
}));

const CLIMATE_DATA = Array.from({ length: 10 }, (_, i) => ({
  year:          (2015 + i).toString(),
  temp_anomaly:  parseFloat((0.1 * i + Math.sin(i * 0.5) * 0.3 + Math.random() * 0.2).toFixed(2)),
  extremes:      8 + Math.round(i * 1.5 + Math.random() * 3),
}));

const MODEL_COMPARISON = [
  { metric: "Temperature MAE", IMD: 2.1, "Tomorrow.io": 1.2 },
  { metric: "Wind RMSE",       IMD: 2.8, "Tomorrow.io": 1.9 },
  { metric: "Rainfall Acc.",   IMD: 72,  "Tomorrow.io": 84  },
  { metric: "Humidity Bias",   IMD: 3.8, "Tomorrow.io": 2.1 },
  { metric: "Pressure Error",  IMD: 1.1, "Tomorrow.io": 0.5 },
];

const WEATHER_LAYERS: { id: WeatherLayer; label: string; icon: React.ElementType; color: string; unit: string }[] = [
  { id: "temperature",   label: "Temperature",  icon: Thermometer, color: "#ef4444", unit: "°C"   },
  { id: "precipitation", label: "Precipitation",icon: Droplets,    color: "#3b82f6", unit: "mm"   },
  { id: "wind",          label: "Wind",         icon: Wind,        color: "#06b6d4", unit: "km/h" },
  { id: "clouds",        label: "Clouds",       icon: Cloud,       color: "#94a3b8", unit: "%"    },
  { id: "humidity",      label: "Humidity",     icon: Activity,    color: "#8b5cf6", unit: "%"    },
  { id: "pressure",      label: "Pressure",     icon: Gauge,       color: "#f59e0b", unit: "hPa"  },
  { id: "uv",            label: "UV Index",     icon: Sun,         color: "#f97316", unit: "UVI"  },
  { id: "aqi",           label: "Air Quality",  icon: Globe,       color: "#10b981", unit: "AQI"  },
];

const MAIN_TABS: { id: MainTab; label: string; icon: React.ElementType }[] = [
  { id: "live-map",   label: "Live Map",   icon: Map          },
  { id: "forecast",   label: "Forecast",   icon: TrendingUp   },
  { id: "radar",      label: "Radar",      icon: Radar        },
  { id: "severe",     label: "Severe",     icon: CloudLightning },
  { id: "historical", label: "Historical", icon: History      },
  { id: "climate",    label: "Climate",    icon: BarChart2    },
  { id: "models",     label: "Models",     icon: Sliders      },
];

// Tooltip style uses CSS variables so it adapts to theme
const tooltipStyle: React.CSSProperties = {
  backgroundColor: "hsl(var(--popover))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "10px",
  boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
  color: "hsl(var(--popover-foreground))",
  fontSize: "12px",
};

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────
export function MapPage() {
  const { resolvedTheme } = useTheme();
  const [searchParams] = useSearchParams();

  const [activeTab, setActiveTab]     = useState<MainTab>("live-map");
  const [activeLayer, setActiveLayer] = useState<WeatherLayer>("temperature");
  const [mapStyle, setMapStyle]       = useState<MapStyle>("satellite");
  const [searchQuery, setSearchQuery] = useState("");

  // Map canvas
  const [zoom, setZoom]   = useState(1);
  const [panX, setPanX]   = useState(0);
  const [panY, setPanY]   = useState(0);
  const [selectedStation, setSelectedStation] = useState<string | null>(null);
  const [activeLayers, setActiveLayers] = useState<Set<LayerId>>(
    new Set(["satellite", "stations", "wind"])
  );

  // Timeline
  const [timelineProgress, setTimelineProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // UI
  const [layerPanelOpen, setLayerPanelOpen] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Radar tab
  const [radarFrame, setRadarFrame]   = useState(RADAR_FRAMES.length - 1);
  const [radarPlaying, setRadarPlaying] = useState(false);

  const mapRef    = useRef<HTMLDivElement>(null);
  const isPanning = useRef(false);
  const panStart  = useRef({ x: 0, y: 0 });

  useEffect(() => setMounted(true), []);

  // Deep-link from alerts page
  useEffect(() => {
    const alertId = searchParams.get("alertId");
    if (alertId) {
      const target = ALERT_MARKERS.find((a) => a.id === alertId);
      if (target) { setPanX(target.x * -10); setPanY(target.y * -10); setZoom(1.5); }
    }
  }, [searchParams]);

  // Timeline playback
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPlaying) {
      interval = setInterval(() => {
        setTimelineProgress((p) => { if (p >= 100) { setIsPlaying(false); return 100; } return p + 0.4; });
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Radar playback
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (radarPlaying) {
      interval = setInterval(() => setRadarFrame((f) => (f + 1) % RADAR_FRAMES.length), 400);
    }
    return () => clearInterval(interval);
  }, [radarPlaying]);

  const clustered      = useMemo(() => (activeLayers.has("stations") ? clusterStations(STATIONS, zoom) : []), [activeLayers, zoom]);
  const visibleAlerts  = useMemo(() => (activeLayers.has("stations") ? ALERT_MARKERS : []), [activeLayers]);
  const selectedStationData = selectedStation ? STATIONS.find((s) => s.id === selectedStation) ?? null : null;

  const isDark = mounted && resolvedTheme === "dark";

  const zoomIn    = () => setZoom((z) => Math.min(z + 0.25, 2.5));
  const zoomOut   = () => setZoom((z) => Math.max(z - 0.25, 0.8));
  const resetView = () => { setZoom(1); setPanX(0); setPanY(0); };

  const handleLocate = useCallback(() => {
    const c = STATIONS.find((s) => s.status === "critical") || STATIONS[0];
    setPanX(-(c.x - 50) * 8); setPanY(-(c.y - 50) * 8); setZoom(1.8);
    setSelectedStation(c.id);
    toast.info(`Located: ${c.name}`, { description: `Status: ${c.status} · ${c.temp}°C` });
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    isPanning.current = true;
    panStart.current  = { x: e.clientX - panX, y: e.clientY - panY };
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning.current) return;
    setPanX(e.clientX - panStart.current.x);
    setPanY(e.clientY - panStart.current.y);
  };
  const handleMouseUp = () => { isPanning.current = false; };
  const handleWheel   = (e: React.WheelEvent) => {
    e.preventDefault();
    setZoom((z) => Math.max(0.8, Math.min(2.5, z + (e.deltaY > 0 ? -0.1 : 0.1))));
  };

  // Map canvas background (only the canvas itself stays environment-styled)
  const mapBg = {
    satellite: isDark ? "bg-[#060d1a]" : "bg-[#0d1b2e]",
    standard:  isDark ? "bg-[#0c1222]" : "bg-[#d4e2f0]",
    terrain:   isDark ? "bg-[#0d1a12]" : "bg-[#cde0cc]",
    minimal:   isDark ? "bg-[#111118]" : "bg-[#f0f0f5]",
  }[mapStyle];

  const currentLayer = WEATHER_LAYERS.find((l) => l.id === activeLayer)!;

  const renderTabContent = () => {
    switch (activeTab) {
      case "forecast":   return <ForecastTab />;
      case "radar":      return <RadarTab frame={radarFrame} setFrame={setRadarFrame} playing={radarPlaying} setPlaying={setRadarPlaying} />;
      case "severe":     return <SevereTab />;
      case "historical": return <HistoricalTab />;
      case "climate":    return <ClimateTab />;
      case "models":     return <ModelsTab />;
      default:           return null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-background text-foreground overflow-hidden">

      {/* ═══════ TOP NAVIGATION BAR ═══════ */}
      <div className="flex-shrink-0 bg-card/90 backdrop-blur-xl border-b border-border z-30">

        {/* Brand + Search row */}
        <div className="flex items-center gap-4 px-4 py-2.5 border-b border-border/50">
          {/* Brand */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center shadow-md shadow-primary/25">
              <Globe className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <span className="text-sm font-bold text-foreground tracking-tight">WeatherXpert</span>
              <span className="text-xs text-primary ml-1 hidden sm:inline">Map</span>
            </div>
          </div>

          <div className="w-px h-5 bg-border hidden sm:block" />

          {/* Search */}
          <div className="flex-1 max-w-md relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search location, station, region…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-secondary/50 border border-border rounded-xl text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all"
            />
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2 ml-auto">
            <a
              href="https://weatherex.ai/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs hover:bg-primary/15 transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              WeatherEx AI
            </a>
            <button
              onClick={() => toast.info("Refreshing data…")}
              className="p-2 rounded-lg bg-secondary/50 border border-border hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
              title="Refresh"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => toast.info("Exporting…")}
              className="p-2 rounded-lg bg-secondary/50 border border-border hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
              title="Export"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Main Tab Navigation */}
        <div className="flex items-center gap-0.5 px-4 overflow-x-auto scrollbar-none">
          {MAIN_TABS.map((tab) => {
            const Icon  = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium rounded-t-lg transition-all whitespace-nowrap flex-shrink-0 border-b-2 ${
                  isActive
                    ? "text-primary bg-primary/8 border-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50 border-transparent"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-primary" : ""}`} />
                {tab.label}
                {tab.id === "severe" && (
                  <span className="ml-0.5 w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse inline-block" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ═══════ CONTENT AREA ═══════ */}
      <div className="flex-1 relative overflow-hidden">
        {activeTab === "live-map" ? (
          <>
            {/* ── Weather Layer Pill Selector ── */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-0.5 bg-card/90 backdrop-blur-xl border border-border rounded-2xl px-2 py-1.5 shadow-lg overflow-x-auto max-w-[90vw]">
              {WEATHER_LAYERS.map((layer) => {
                const Icon     = layer.icon;
                const isActive = activeLayer === layer.id;
                return (
                  <button
                    key={layer.id}
                    onClick={() => setActiveLayer(layer.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap flex-shrink-0`}
                    style={
                      isActive
                        ? { backgroundColor: `${layer.color}18`, color: layer.color, boxShadow: `0 0 10px ${layer.color}20` }
                        : { color: "hsl(var(--muted-foreground))" }
                    }
                  >
                    <Icon className="w-3 h-3" />
                    {layer.label}
                  </button>
                );
              })}
            </div>

            {/* ── Layer Panel (Left) ── */}
            <AnimatePresence>
              {layerPanelOpen && (
                <motion.div
                  initial={{ x: -280, opacity: 0 }}
                  animate={{ x: 0,    opacity: 1 }}
                  exit={{   x: -280,  opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="absolute left-3 top-16 z-20 w-64 bg-card/95 backdrop-blur-2xl border border-border rounded-2xl shadow-xl overflow-hidden"
                >
                  <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground flex items-center gap-2">
                      <Layers className="w-3.5 h-3.5 text-primary" />
                      Map Layers
                    </span>
                    <button onClick={() => setLayerPanelOpen(false)} className="p-1 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="p-3 space-y-1 max-h-[60vh] overflow-y-auto">
                    {/* Base Map */}
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2 px-1 pt-1">Base Map</p>
                    <div className="grid grid-cols-2 gap-1.5 mb-3">
                      {(["satellite","standard","terrain","minimal"] as MapStyle[]).map((style) => (
                        <button
                          key={style}
                          onClick={() => setMapStyle(style)}
                          className={`px-3 py-2 rounded-xl text-xs font-medium transition-all capitalize ${
                            mapStyle === style
                              ? "bg-primary/15 text-primary border border-primary/30"
                              : "bg-secondary/50 text-muted-foreground border border-border hover:bg-secondary hover:text-foreground"
                          }`}
                        >
                          {style}
                        </button>
                      ))}
                    </div>

                    {/* Overlays */}
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2 px-1">Overlays</p>
                    {[
                      { id: "stations" as LayerId, label: "Stations & Alerts", icon: MapPin   },
                      { id: "wind"     as LayerId, label: "Wind Vectors",       icon: Wind     },
                      { id: "rain"     as LayerId, label: "Rain Accumulation",  icon: Droplets },
                      { id: "cloud"    as LayerId, label: "Cloud Cover",        icon: Cloud    },
                      { id: "circles"  as LayerId, label: "Coverage Radius",    icon: Crosshair },
                      { id: "blocks"   as LayerId, label: "Block Boundaries",   icon: Grid     },
                    ].map(({ id, label, icon: Icon }) => {
                      const active = activeLayers.has(id);
                      return (
                        <button
                          key={id}
                          onClick={() => setActiveLayers((prev) => {
                            const next = new Set(prev);
                            if (next.has(id)) next.delete(id); else next.add(id);
                            return next;
                          })}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs transition-all mb-0.5 ${
                            active
                              ? "bg-primary/8 text-foreground"
                              : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                          }`}
                        >
                          <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${active ? "bg-primary" : "bg-muted-foreground/30"}`} />
                          <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="flex-1 text-left">{label}</span>
                          <div className={`w-8 h-4 rounded-full transition-all flex items-center px-0.5 ${active ? "bg-primary" : "bg-muted-foreground/20"}`}>
                            <div className={`w-3 h-3 rounded-full bg-white shadow-sm transition-transform ${active ? "translate-x-4" : "translate-x-0"}`} />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {!layerPanelOpen && (
              <button
                onClick={() => setLayerPanelOpen(true)}
                className="absolute left-3 top-16 z-20 p-2.5 bg-card/95 backdrop-blur-xl border border-border rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-all shadow-lg"
                title="Open layers"
              >
                <Layers className="w-4 h-4" />
              </button>
            )}

            {/* ═══════ MAP CANVAS ═══════ */}
            <div
              ref={mapRef}
              className="absolute inset-0 cursor-grab active:cursor-grabbing select-none overflow-hidden"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onWheel={handleWheel}
              onClick={() => { if (!isPanning.current) setSelectedStation(null); }}
            >
              <div
                className="absolute inset-0 transition-transform duration-75 ease-out will-change-transform"
                style={{ transform: `scale(${zoom}) translate(${panX / zoom}px, ${panY / zoom}px)` }}
              >
                {/* Base map */}
                <div className={`absolute inset-0 ${mapBg} transition-colors duration-500`} />

                {/* Subtle grid */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    backgroundImage: `
                      linear-gradient(rgba(128,128,128,0.08) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(128,128,128,0.08) 1px, transparent 1px)
                    `,
                    backgroundSize: "80px 80px",
                  }}
                />

                {/* Weather layer overlay */}
                <div
                  className="absolute inset-0 pointer-events-none transition-all duration-500"
                  style={{
                    background:
                      activeLayer === "temperature"   ? "radial-gradient(ellipse at 45% 35%, rgba(239,68,68,0.15) 0%, rgba(251,146,60,0.1) 40%, transparent 70%), radial-gradient(ellipse at 65% 60%, rgba(59,130,246,0.08) 0%, transparent 50%)" :
                      activeLayer === "precipitation" ? "radial-gradient(ellipse at 35% 55%, rgba(59,130,246,0.18) 0%, rgba(16,185,129,0.1) 50%, transparent 75%)" :
                      activeLayer === "wind"          ? "radial-gradient(ellipse at 50% 40%, rgba(6,182,212,0.12) 0%, transparent 60%)" :
                      activeLayer === "clouds"        ? "radial-gradient(ellipse at 40% 30%, rgba(148,163,184,0.15) 0%, transparent 65%)" :
                      activeLayer === "humidity"      ? "radial-gradient(ellipse at 55% 50%, rgba(139,92,246,0.14) 0%, transparent 65%)" :
                      activeLayer === "pressure"      ? "radial-gradient(ellipse at 45% 45%, rgba(245,158,11,0.12) 0%, transparent 65%)" :
                      activeLayer === "uv"            ? "radial-gradient(ellipse at 42% 38%, rgba(249,115,22,0.14) 0%, transparent 65%)" :
                                                        "radial-gradient(ellipse at 48% 50%, rgba(16,185,129,0.12) 0%, transparent 65%)",
                  }}
                />

                {/* India SVG outline */}
                <svg
                  viewBox="0 0 100 100"
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  preserveAspectRatio="xMidYMid meet"
                >
                  <path
                    d="M35 18 L42 16 L48 18 L52 20 L55 22 L58 20 L62 22 L65 25 L68 28
                       L70 32 L72 35 L70 38 L68 40 L66 42 L65 45 L63 48 L60 50
                       L58 52 L56 55 L55 58 L54 62 L52 65 L50 68 L48 72 L45 75
                       L42 78 L40 80 L38 82 L36 80 L35 78 L34 75 L33 72 L32 68
                       L30 65 L28 62 L26 58 L24 55 L22 52 L20 48 L18 45 L19 42
                       L20 40 L22 38 L24 35 L25 32 L27 28 L30 24 L33 20 Z"
                    fill={isDark ? "rgba(30,41,59,0.55)" : "rgba(148,163,184,0.18)"}
                    stroke={isDark ? "rgba(71,85,105,0.5)" : "rgba(100,116,139,0.4)"}
                    strokeWidth="0.3"
                  />
                  {[["25 40","55 38"],["35 30","60 32"],["40 45","58 48"],["32 55","52 56"]].map(([p1, p2], i) => (
                    <line key={i}
                      x1={p1.split(" ")[0]} y1={p1.split(" ")[1]}
                      x2={p2.split(" ")[0]} y2={p2.split(" ")[1]}
                      stroke={isDark ? "rgba(71,85,105,0.2)" : "rgba(148,163,184,0.25)"}
                      strokeWidth="0.15" strokeDasharray="1.5 1.5" />
                  ))}

                  {/* Wind vectors */}
                  {activeLayers.has("wind") && [
                    { x:30, y:30, angle:225, s:3 }, { x:45, y:25, angle:200, s:2 },
                    { x:55, y:35, angle:240, s:2.5 }, { x:35, y:50, angle:210, s:3.5 },
                    { x:50, y:45, angle:230, s:2 }, { x:60, y:40, angle:250, s:2.5 },
                  ].map((v, i) => {
                    const rad = (v.angle * Math.PI) / 180;
                    const len = v.s * 1.5;
                    return (
                      <g key={i}>
                        <line x1={v.x} y1={v.y} x2={v.x + Math.cos(rad)*len} y2={v.y + Math.sin(rad)*len}
                          stroke="rgba(6,182,212,0.4)" strokeWidth="0.3" />
                        <circle cx={v.x + Math.cos(rad)*len} cy={v.y + Math.sin(rad)*len} r="0.4"
                          fill="rgba(6,182,212,0.55)" />
                      </g>
                    );
                  })}

                  {/* Coverage circles */}
                  {activeLayers.has("circles") && STATIONS.map((s) => (
                    <circle key={s.id} cx={s.x} cy={s.y} r={5}
                      fill={s.status==="critical" ? "rgba(239,68,68,0.07)" : s.status==="warning" ? "rgba(245,158,11,0.07)" : "rgba(16,185,129,0.07)"}
                      stroke={s.status==="critical" ? "rgba(239,68,68,0.25)" : s.status==="warning" ? "rgba(245,158,11,0.25)" : "rgba(16,185,129,0.2)"}
                      strokeWidth="0.2" strokeDasharray="1 0.5" />
                  ))}

                  {/* Block boundaries */}
                  {activeLayers.has("blocks") && (
                    <g>
                      {["M28 38 L38 37 L40 44 L30 45 Z","M38 37 L50 36 L52 44 L40 44 Z",
                        "M50 36 L62 35 L64 42 L52 44 Z","M30 45 L40 44 L42 52 L32 53 Z"].map((d, i) => (
                        <path key={i} d={d} fill="none" stroke="rgba(139,92,246,0.25)" strokeWidth="0.25" strokeDasharray="1 1" />
                      ))}
                    </g>
                  )}
                </svg>

                {/* Rain blobs */}
                {activeLayers.has("rain") && (
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute w-[22%] h-[16%] top-[47%] left-[25%] rounded-full bg-blue-500/[0.1] blur-3xl animate-pulse" />
                    <div className="absolute w-[16%] h-[14%] top-[32%] left-[55%] rounded-full bg-emerald-500/[0.08] blur-2xl" />
                  </div>
                )}

                {/* Cloud blobs */}
                {activeLayers.has("cloud") && (
                  <div className="absolute inset-0 pointer-events-none">
                    <motion.div className="absolute w-[48%] h-[38%] top-[8%] left-[18%] rounded-full blur-[80px]"
                      style={{ backgroundColor: isDark ? "rgba(255,255,255,0.035)" : "rgba(148,163,184,0.12)" }}
                      animate={{ x: [0,8,0], y: [0,-3,0] }}
                      transition={{ duration: 90, repeat: Infinity, ease: "linear" }} />
                    <motion.div className="absolute w-[40%] h-[32%] top-[40%] left-[44%] rounded-full blur-[70px]"
                      style={{ backgroundColor: isDark ? "rgba(255,255,255,0.025)" : "rgba(148,163,184,0.08)" }}
                      animate={{ x: [0,-5,0], y: [0,3,0] }}
                      transition={{ duration: 100, repeat: Infinity, ease: "linear", delay: 30 }} />
                  </div>
                )}

                {/* Station markers */}
                {activeLayers.has("stations") && clustered.map((item) => {
                  if (isCluster(item)) {
                    return (
                      <button
                        key={item.id}
                        className="absolute flex items-center justify-center rounded-full bg-primary/20 border border-primary/40 text-primary text-xs font-bold shadow-lg hover:scale-110 transition-transform cursor-pointer backdrop-blur-sm"
                        style={{
                          left: `${item.x}%`, top: `${item.y}%`,
                          width: `${32 + item.count * 4}px`, height: `${32 + item.count * 4}px`,
                          transform: "translate(-50%, -50%)",
                        }}
                        onClick={(e) => { e.stopPropagation(); setZoom((z) => Math.min(z + 0.5, 2.5)); }}
                      >
                        {item.count}
                      </button>
                    );
                  }

                  const station    = item as StationRecord;
                  const sc         = STATUS_COLORS[station.status];
                  const Icon       = TYPE_ICONS[station.type];
                  const isSelected = selectedStation === station.id;

                  return (
                    <button
                      key={station.id}
                      className="absolute group cursor-pointer"
                      style={{ left: `${station.x}%`, top: `${station.y}%`, transform: "translate(-50%,-50%)" }}
                      onClick={(e) => { e.stopPropagation(); setSelectedStation(isSelected ? null : station.id); }}
                    >
                      <div
                        className={`relative flex items-center justify-center rounded-full ring-2 ${sc.ring} ${isSelected ? "scale-125" : "hover:scale-110"} transition-transform`}
                        style={{ width: 28, height: 28 }}
                      >
                        {station.status !== "offline" && (
                          <div className={`absolute inset-0 rounded-full ${sc.dot} opacity-20 animate-ping`} />
                        )}
                        <div className={`absolute inset-0 rounded-full ${sc.dot} opacity-85 shadow-lg ${sc.glow}`} />
                        <Icon className="relative z-10 w-3 h-3 text-white" />
                      </div>
                      {/* Hover label — uses card bg so it adapts to theme */}
                      <div className="absolute top-full mt-1.5 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-30">
                        <div className="bg-card/95 border border-border backdrop-blur-xl rounded-lg px-2.5 py-1.5 text-[10px] shadow-xl">
                          <div className="font-semibold text-foreground">{station.name}</div>
                          <div className="text-muted-foreground">{station.temp}°C · {station.wind} km/h</div>
                        </div>
                      </div>
                    </button>
                  );
                })}

                {/* Alert markers */}
                {visibleAlerts.map((alert) => (
                  <div key={alert.id} className="absolute pointer-events-none"
                    style={{ left: `${alert.x}%`, top: `${alert.y}%`, transform: "translate(-50%,-50%)" }}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ring-2 shadow-lg ${
                      alert.severity === "critical" ? "bg-red-500/85 ring-red-400/40 shadow-red-500/50" :
                      alert.severity === "high"     ? "bg-orange-500/85 ring-orange-400/40 shadow-orange-500/40" :
                                                      "bg-amber-500/85 ring-amber-400/40 shadow-amber-500/40"
                    }`}>
                      <AlertTriangle className="w-3 h-3 text-white" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Station Popup (Right) ── */}
            <AnimatePresence>
              {selectedStationData && (
                <motion.div
                  initial={{ x: 320, opacity: 0 }}
                  animate={{ x: 0,   opacity: 1 }}
                  exit={{   x: 320,  opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="absolute right-3 top-16 z-20 w-72"
                >
                  <StationPopup station={selectedStationData} onClose={() => setSelectedStation(null)} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Zoom Controls (Right) ── */}
            <div className="absolute right-3 bottom-28 z-20 flex flex-col gap-2">
              {[{ icon: Plus, fn: zoomIn, title: "Zoom in" }, { icon: Minus, fn: zoomOut, title: "Zoom out" }, { icon: Maximize, fn: resetView, title: "Reset" }].map(({ icon: Icon, fn, title }) => (
                <button key={title} onClick={fn} title={title}
                  className="w-9 h-9 rounded-xl bg-card/95 backdrop-blur-xl border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-all shadow-md">
                  <Icon className="w-4 h-4" />
                </button>
              ))}
              <button onClick={handleLocate} title="Locate critical"
                className="w-9 h-9 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary hover:bg-primary/25 transition-all shadow-md">
                <LocateFixed className="w-4 h-4" />
              </button>
            </div>

            {/* ── Weather Legend (Left bottom) ── */}
            <div className="absolute left-3 bottom-28 z-20">
              <div className="bg-card/95 backdrop-blur-xl border border-border rounded-xl px-3 py-2.5 shadow-lg">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: currentLayer.color }} />
                  <span className="text-xs font-medium text-foreground">{currentLayer.label}</span>
                  <span className="text-xs text-muted-foreground">({currentLayer.unit})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-muted-foreground">Low</span>
                  <div className="w-28 h-2 rounded-full" style={{
                    background:
                      activeLayer === "temperature"   ? "linear-gradient(to right, #3b82f6, #22c55e, #f59e0b, #ef4444)" :
                      activeLayer === "precipitation" ? "linear-gradient(to right, #dbeafe, #3b82f6, #1d4ed8)" :
                      activeLayer === "wind"          ? "linear-gradient(to right, #ecfeff, #06b6d4, #0e7490)" :
                      `linear-gradient(to right, transparent, ${currentLayer.color})`,
                  }} />
                  <span className="text-[10px] text-muted-foreground">High</span>
                </div>
              </div>
            </div>

            {/* ── Coordinates bar ── */}
            <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-20">
              <div className="bg-card/80 backdrop-blur-xl border border-border rounded-xl px-3 py-1.5 flex items-center gap-3 text-[10px] text-muted-foreground shadow-md">
                <Navigation className="w-3 h-3" />
                <span>Zoom {zoom.toFixed(1)}x</span>
                <span>·</span>
                <span>20.5°N, 78.9°E</span>
              </div>
            </div>

            {/* ═══════ TIMELINE PLAYER ═══════ */}
            <div className="absolute bottom-0 left-0 right-0 z-20 bg-card/95 backdrop-blur-2xl border-t border-border px-4 py-3">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button onClick={() => { setTimelineProgress(0); setIsPlaying(false); }}
                    className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
                    <SkipBack className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setIsPlaying(!isPlaying)}
                    className="w-8 h-8 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center text-primary hover:bg-primary/25 transition-colors">
                    {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  </button>
                  <button onClick={() => setTimelineProgress(100)}
                    className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
                    <SkipForward className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground flex-shrink-0">
                  <Clock className="w-3 h-3" />
                  <span>-6h</span>
                </div>

                {/* Slider track */}
                <div className="flex-1 relative h-6 flex items-center">
                  <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${timelineProgress}%` }} />
                  </div>
                  <input type="range" min="0" max="100" value={timelineProgress}
                    onChange={(e) => setTimelineProgress(Number(e.target.value))}
                    className="absolute inset-0 w-full opacity-0 cursor-pointer h-full" />
                  <div className="absolute w-4 h-4 rounded-full bg-primary-foreground border-2 border-primary shadow-md shadow-primary/30 pointer-events-none"
                    style={{ left: `calc(${timelineProgress}% - 8px)` }} />
                </div>

                <span className="text-xs text-muted-foreground flex-shrink-0">Now</span>

                <div className="flex-shrink-0 bg-primary/10 border border-primary/20 rounded-lg px-3 py-1">
                  <span className="text-xs font-medium text-primary">
                    {new Date(Date.now() - (1 - timelineProgress / 100) * 6 * 3600000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
              <div className="flex justify-between mt-1.5 px-20">
                {["-6h","-5h","-4h","-3h","-2h","-1h","Now"].map((t) => (
                  <span key={t} className="text-[9px] text-muted-foreground/50">{t}</span>
                ))}
              </div>
            </div>
          </>
        ) : (
          /* ── Non-map tab content ── */
          <div className="h-full overflow-y-auto bg-background">
            {renderTabContent()}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// FORECAST TAB
// ─────────────────────────────────────────────
function ForecastTab() {
  const [horizon, setHorizon] = useState<"24h"|"48h"|"7d"|"15d">("7d");
  const data = FORECAST_DATA.slice(0, horizon==="24h" ? 1 : horizon==="48h" ? 2 : horizon==="7d" ? 7 : 15);

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-base font-semibold text-foreground">Weather Forecast</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Multi-model ensemble forecast with confidence intervals</p>
        </div>
        <div className="flex items-center gap-1 bg-secondary/50 border border-border rounded-xl p-1">
          {(["24h","48h","7d","15d"] as const).map((h) => (
            <button key={h} onClick={() => setHorizon(h)}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
                horizon===h ? "bg-primary/15 text-primary border border-primary/25" : "text-muted-foreground hover:text-foreground"
              }`}>{h}</button>
          ))}
        </div>
      </div>

      {/* Day cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {data.map((d, i) => (
          <div key={i} className={`bg-card border rounded-2xl p-3 text-center hover:border-primary/30 transition-all ${i===0 ? "border-primary/30 bg-primary/5" : "border-border"}`}>
            <div className="text-xs text-muted-foreground mb-2">{d.day}</div>
            <Sun className="w-6 h-6 text-amber-400 mx-auto mb-2" />
            <div className="text-sm font-bold text-foreground">{d.temp_max}°</div>
            <div className="text-xs text-muted-foreground">{d.temp_min}°</div>
            <div className="mt-2 text-[10px] text-primary">{d.precipitation}mm</div>
            <div className="text-[10px] text-muted-foreground">{d.wind}km/h</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Temperature Forecast</h3>
          <div className="h-52">
            {/* Gradients hoisted outside Recharts to prevent duplicate-key warnings */}
            <svg width="0" height="0" className="absolute overflow-hidden" aria-hidden="true">
              <defs>
                <linearGradient id="map-fMaxG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="map-fMinG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
            </svg>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize:"11px", color:"hsl(var(--muted-foreground))" }} />
                <Area type="monotone" dataKey="temp_max" stroke="#ef4444" strokeWidth={2} fill="url(#map-fMaxG)" name="Max °C" dot={false} />
                <Area type="monotone" dataKey="temp_min" stroke="#3b82f6" strokeWidth={2} fill="url(#map-fMinG)" name="Min °C" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Precipitation & Wind</h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize:"11px", color:"hsl(var(--muted-foreground))" }} />
                <Bar dataKey="precipitation" fill="#3b82f6" radius={[4,4,0,0]} name="Rain (mm)" opacity={0.85} />
                <Bar dataKey="wind"          fill="#06b6d4" radius={[4,4,0,0]} name="Wind km/h" opacity={0.85} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// RADAR TAB
// ─────────────────────────────────────────────
function RadarTab({ frame, setFrame, playing, setPlaying }: { frame: number; setFrame: (f: number) => void; playing: boolean; setPlaying: (p: boolean) => void }) {
  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">Precipitation Radar</h2>
          <p className="text-xs text-muted-foreground mt-0.5">12-hour animated Doppler radar composite</p>
        </div>
        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-600 dark:text-emerald-400 text-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Live
        </span>
      </div>

      {/* Radar canvas */}
      <div className="bg-[#060d1a] border border-border rounded-2xl overflow-hidden aspect-video relative">
        <div className="absolute inset-0 flex items-center justify-center">
          {[1,2,3,4].map((r) => (
            <div key={r} className="absolute border border-emerald-500/10 rounded-full"
              style={{ width:`${r*22}%`, height:`${r*22}%` }} />
          ))}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-full h-px bg-emerald-500/10" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="h-full w-px bg-emerald-500/10" />
          </div>
          <motion.div
            className="absolute w-1/2 h-px origin-left"
            style={{ background: "linear-gradient(to right, rgba(16,185,129,0.8), transparent)" }}
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          />
          <div className="absolute w-[28%] h-[22%] rounded-full blur-2xl transition-all duration-500"
            style={{ top:"35%", left:"28%", backgroundColor: `rgba(16,185,129,${(RADAR_FRAMES[frame]?.intensity||50)/300})` }} />
          <div className="absolute w-[20%] h-[16%] rounded-full blur-xl transition-all duration-500"
            style={{ top:"50%", left:"55%", backgroundColor: `rgba(59,130,246,${(RADAR_FRAMES[frame]?.intensity||30)/400})` }} />
          <div className="absolute top-4 right-4 bg-card/80 backdrop-blur-sm border border-border rounded-xl px-3 py-2">
            <div className="text-[10px] text-muted-foreground mb-0.5">Intensity</div>
            <div className="text-sm font-bold text-emerald-500">{RADAR_FRAMES[frame]?.intensity||50} dBZ</div>
          </div>
          <div className="absolute top-4 left-4 bg-card/80 backdrop-blur-sm border border-border rounded-xl px-3 py-2">
            <div className="text-[10px] text-muted-foreground mb-0.5">Time</div>
            <div className="text-sm font-bold text-foreground">{RADAR_FRAMES[frame]?.time}</div>
          </div>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
            <span className="text-[9px] text-slate-400">Low</span>
            <div className="w-32 h-2 rounded-full" style={{ background:"linear-gradient(to right, #dbeafe, #22c55e, #f59e0b, #ef4444, #7c3aed)" }} />
            <span className="text-[9px] text-slate-400">Extreme</span>
          </div>
        </div>
      </div>

      {/* Radar timeline */}
      <div className="bg-card border border-border rounded-2xl p-4">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => setFrame(Math.max(0, frame-1))}
            className="p-1.5 rounded-lg bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-colors">
            <SkipBack className="w-4 h-4" />
          </button>
          <button onClick={() => setPlaying(!playing)}
            className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25 transition-colors">
            {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button onClick={() => setFrame(Math.min(RADAR_FRAMES.length-1, frame+1))}
            className="p-1.5 rounded-lg bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-colors">
            <SkipForward className="w-4 h-4" />
          </button>
          <div className="flex-1 flex items-center gap-1">
            {RADAR_FRAMES.map((_, i) => (
              <button key={i} onClick={() => setFrame(i)}
                className={`flex-1 h-6 rounded transition-all ${i===frame ? "bg-emerald-500" : "bg-secondary hover:bg-secondary/80"}`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// SEVERE TAB
// ─────────────────────────────────────────────
function SevereTab() {
  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">Severe Weather Alerts</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Active warnings, watches, and advisories across India</p>
        </div>
        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-lg text-red-600 dark:text-red-400 text-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          {SEVERE_ALERTS.length} Active
        </span>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {[
          { label:"Extreme", count:1, cls:"red"    },
          { label:"High",    count:2, cls:"orange"  },
          { label:"Medium",  count:2, cls:"amber"   },
          { label:"Low",     count:1, cls:"yellow"  },
        ].map(({ label, count, cls }) => (
          <div key={label} className={`bg-${cls}-500/8 border border-${cls}-500/20 rounded-2xl p-4 text-center`}>
            <div className={`text-2xl font-bold text-${cls}-500`}>{count}</div>
            <div className={`text-xs text-${cls}-600 dark:text-${cls}-400 mt-1`}>{label}</div>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {SEVERE_ALERTS.map((alert) => (
          <div key={alert.id}
            className={`flex items-start gap-4 p-4 rounded-2xl border transition-all hover:shadow-sm cursor-default ${
              alert.color==="red"    ? "bg-red-500/5    border-red-500/15"    :
              alert.color==="orange" ? "bg-orange-500/5 border-orange-500/15" :
              alert.color==="amber"  ? "bg-amber-500/5  border-amber-500/15"  :
                                       "bg-yellow-500/5 border-yellow-500/15"
            }`}
          >
            <div className={`mt-0.5 w-3 h-3 rounded-full flex-shrink-0 shadow-md ${
              alert.color==="red"    ? "bg-red-500"    :
              alert.color==="orange" ? "bg-orange-500" :
              alert.color==="amber"  ? "bg-amber-500"  : "bg-yellow-500"
            }`} />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold text-foreground">{alert.type}</div>
                  <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                    <MapPin className="w-3 h-3" />{alert.region}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    alert.color==="red"    ? "bg-red-500/15 text-red-600 dark:text-red-400"    :
                    alert.color==="orange" ? "bg-orange-500/15 text-orange-600 dark:text-orange-400" :
                    alert.color==="amber"  ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"  :
                                            "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400"
                  }`}>{alert.severity}</div>
                  <div className="text-[10px] text-muted-foreground mt-1">Issued {alert.issued}</div>
                  <div className="text-[10px] text-muted-foreground/60">Expires {alert.expires}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// HISTORICAL TAB
// ─────────────────────────────────────────────
function HistoricalTab() {
  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div>
        <h2 className="text-base font-semibold text-foreground">Historical Analysis</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Monthly climatology and anomaly detection</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Monthly Temperature & Rainfall</h3>
          <div className="h-56">
            {/* Gradients hoisted outside Recharts to prevent duplicate-key warnings */}
            <svg width="0" height="0" className="absolute overflow-hidden" aria-hidden="true">
              <defs>
                <linearGradient id="map-htG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.35}/><stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="map-hrG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
            </svg>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={HISTORICAL_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize:"11px", color:"hsl(var(--muted-foreground))" }} />
                <Area type="monotone" dataKey="avg_temp" stroke="#ef4444" strokeWidth={2} fill="url(#map-htG)" name="Avg Temp °C" dot={false} />
                <Area type="monotone" dataKey="rainfall"  stroke="#3b82f6" strokeWidth={2} fill="url(#map-hrG)" name="Rainfall mm"  dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Seasonal Rainfall Pattern</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={HISTORICAL_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="rainfall" fill="#3b82f6" radius={[4,4,0,0]} name="Rainfall mm" opacity={0.85} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// CLIMATE TAB
// ─────────────────────────────────────────────
function ClimateTab() {
  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div>
        <h2 className="text-base font-semibold text-foreground">Climate Intelligence</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Long-term climate trends and change indicators</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label:"Temp Anomaly",   value:"+1.4°C",  sub:"vs 1980 baseline", color:"#ef4444" },
          { label:"Rainfall Change",value:"-8.2%",   sub:"vs last decade",   color:"#3b82f6" },
          { label:"Extreme Events", value:"+34%",    sub:"10-year trend",    color:"#f59e0b" },
          { label:"Monsoon Shift",  value:"+6 days", sub:"onset delay",      color:"#8b5cf6" },
        ].map(({ label, value, sub, color }) => (
          <div key={label} className="bg-card border border-border rounded-2xl p-4">
            <div className="text-xs text-muted-foreground mb-1">{label}</div>
            <div className="text-xl font-bold" style={{ color }}>{value}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">{sub}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Temperature Anomaly Trend (2015–2024)</h3>
          <div className="h-52">
            {/* Gradient hoisted outside Recharts to prevent duplicate-key warnings */}
            <svg width="0" height="0" className="absolute overflow-hidden" aria-hidden="true">
              <defs>
                <linearGradient id="map-climG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/><stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
            </svg>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={CLIMATE_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="year" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="temp_anomaly" stroke="#ef4444" strokeWidth={2.5} fill="url(#map-climG)" name="Temp Anomaly °C" dot={{ r:3, fill:"#ef4444" }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Extreme Weather Events</h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={CLIMATE_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="year" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="extremes" fill="#f59e0b" radius={[5,5,0,0]} name="Extreme Events" opacity={0.85} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// MODELS TAB
// ─────────────────────────────────────────────
function ModelsTab() {
  const [selectedModel, setSelectedModel] = useState<"IMD"|"Tomorrow.io">("IMD");
  const modelColors: Record<string, string> = {
    IMD:"#6366f1", "Tomorrow.io":"#f59e0b",
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-base font-semibold text-foreground">Weather Model Comparison</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Side-by-side model skill scores and performance metrics</p>
        </div>
        <div className="flex items-center gap-1 bg-secondary/50 border border-border rounded-xl p-1">
          {Object.entries(modelColors).map(([model, color]) => (
            <button key={model} onClick={() => setSelectedModel(model as typeof selectedModel)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedModel===model ? "text-white" : "text-muted-foreground hover:text-foreground"
              }`}
              style={selectedModel===model ? { backgroundColor:`${color}25`, color } : {}}>
              {model}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Object.entries(modelColors).map(([model, color]) => (
          <div key={model} onClick={() => setSelectedModel(model as typeof selectedModel)}
            className={`cursor-pointer border rounded-2xl p-4 transition-all ${
              selectedModel===model ? "bg-card" : "bg-card/50 border-border hover:border-primary/20"
            }`}
            style={selectedModel===model ? { borderColor:color, boxShadow:`0 0 0 1px ${color}25` } : {}}>
            <div className="text-xs font-semibold mb-2" style={{ color }}>{model}</div>
            <div className="text-xl font-bold text-foreground">{model==="IMD"?"85%":"91%"}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">Overall Accuracy</div>
          </div>
        ))}
      </div>

      {/* Horizontal bar chart */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Skill Score Comparison by Metric</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={MODEL_COMPARISON} layout="vertical" barGap={3} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
              <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis dataKey="metric" type="category" stroke="hsl(var(--muted-foreground))" fontSize={9} tickLine={false} axisLine={false} width={110} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize:"11px", color:"hsl(var(--muted-foreground))" }} />
              <Bar dataKey="IMD"             fill="#6366f1" radius={[0,4,4,0]} name="IMD"             opacity={0.85} />
              <Bar dataKey="Tomorrow.io"     fill="#f59e0b" radius={[0,4,4,0]} name="Tomorrow.io"     opacity={0.85} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Metrics table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-5 py-3 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Detailed Metrics — {selectedModel}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="text-left px-5 py-3 text-muted-foreground font-medium">Metric</th>
                <th className="text-right px-5 py-3 text-muted-foreground font-medium">Score</th>
                <th className="text-right px-5 py-3 text-muted-foreground font-medium">vs Best</th>
                <th className="text-left px-5 py-3 text-muted-foreground font-medium">Rating</th>
              </tr>
            </thead>
            <tbody>
              {MODEL_COMPARISON.map((row, i) => {
                const score = row[selectedModel as keyof typeof row] as number;
                const best  = Math.min(row.IMD as number, row["Tomorrow.io"] as number);
                const diff  = ((score - best) / best * 100).toFixed(1);
                return (
                  <tr key={i} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                    <td className="px-5 py-3 text-foreground">{row.metric}</td>
                    <td className="px-5 py-3 text-right font-semibold" style={{ color: modelColors[selectedModel] }}>{score}</td>
                    <td className="px-5 py-3 text-right text-muted-foreground">+{diff}%</td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        Number(diff)<5  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" :
                        Number(diff)<15 ? "bg-amber-500/15  text-amber-600  dark:text-amber-400"  :
                                          "bg-red-500/15    text-red-600    dark:text-red-400"
                      }`}>
                        {Number(diff)<5 ? "Excellent" : Number(diff)<15 ? "Good" : "Fair"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
