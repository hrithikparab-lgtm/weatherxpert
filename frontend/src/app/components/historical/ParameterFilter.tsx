import { useState } from "react";
import {
  Check,
  Search,
  ChevronDown,
  SlidersHorizontal,
  X,
  Thermometer,
  Droplets,
  Wind,
  CloudRain,
  Gauge,
  Sun,
  Eye,
} from "lucide-react";
import {
  PARAMETERS,
  QUALITY_CONFIG,
  type ParameterId,
  type QualityFlag,
} from "./historicalData";

/* ═══════════════════════════════════════════════════
   PARAMETER FILTER — Left panel parameter selector
   + quality flag filters + station selector
   ═══════════════════════════════════════════════════ */

const PARAM_ICONS: Record<ParameterId, React.ElementType> = {
  temp: Thermometer,
  humidity: Droplets,
  wind_speed: Wind,
  rainfall: CloudRain,
  pressure: Gauge,
  solar_irr: Sun,
  dew_point: Droplets,
  visibility: Eye,
};

interface ParameterFilterProps {
  selectedParams: Set<ParameterId>;
  onToggleParam: (id: ParameterId) => void;
  qualityFilters: Set<QualityFlag>;
  onToggleQuality: (q: QualityFlag) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
}

export function ParameterFilter({
  selectedParams,
  onToggleParam,
  qualityFilters,
  onToggleQuality,
  onSelectAll,
  onClearAll,
}: ParameterFilterProps) {
  const [search, setSearch] = useState("");
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["primary", "secondary", "quality"])
  );

  const toggleSection = (s: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      next.has(s) ? next.delete(s) : next.add(s);
      return next;
    });
  };

  const q = search.toLowerCase();
  const filtered = q
    ? PARAMETERS.filter((p) => p.label.toLowerCase().includes(q) || p.unit.toLowerCase().includes(q))
    : PARAMETERS;

  const primaryParams = filtered.filter((p) => p.category === "primary");
  const secondaryParams = filtered.filter((p) => p.category === "secondary");

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-3 pt-3 pb-2 space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider flex items-center gap-1.5">
            <SlidersHorizontal className="w-3 h-3" />
            Parameters
          </h4>
          <span className="text-[9px] text-primary font-semibold tabular-nums px-1.5 py-0.5 rounded bg-primary/10">
            {selectedParams.size}/{PARAMETERS.length}
          </span>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-3 h-3 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search parameters..."
            className="w-full pl-7 pr-3 py-1.5 bg-secondary/50 border border-border rounded-lg text-[11px] text-foreground font-medium outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/50"
          />
        </div>

        {/* Quick actions */}
        <div className="flex gap-1">
          <button onClick={onSelectAll} className="text-[10px] text-primary hover:text-primary/80 font-medium transition-colors">
            Select All
          </button>
          <span className="text-muted-foreground/30">·</span>
          <button onClick={onClearAll} className="text-[10px] text-muted-foreground hover:text-foreground font-medium transition-colors">
            Clear
          </button>
        </div>
      </div>

      {/* Parameter groups */}
      <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1">
        {/* Primary */}
        {primaryParams.length > 0 && (
          <div>
            <button
              onClick={() => toggleSection("primary")}
              className="w-full flex items-center gap-1.5 px-1.5 py-1.5 text-left rounded-md hover:bg-secondary/40 transition-colors"
            >
              <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform ${expandedSections.has("primary") ? "" : "-rotate-90"}`} />
              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider flex-1">Primary</span>
            </button>
            {expandedSections.has("primary") && (
              <div className="space-y-0.5 mt-0.5 animate-in slide-in-from-top-1 duration-150">
                {primaryParams.map((p) => {
                  const Icon = PARAM_ICONS[p.id];
                  const isActive = selectedParams.has(p.id);
                  return (
                    <button
                      key={p.id}
                      onClick={() => onToggleParam(p.id)}
                      className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg text-left transition-all group ${
                        isActive
                          ? "bg-primary/8 border border-primary/15"
                          : "border border-transparent hover:bg-secondary/50"
                      }`}
                    >
                      <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 ${
                        isActive ? "bg-primary/15" : "bg-secondary/60"
                      }`}>
                        <Icon className={`w-3 h-3 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-[11px] font-medium ${isActive ? "text-foreground" : "text-muted-foreground"}`}>{p.label}</p>
                      </div>
                      <span className="text-[9px] text-muted-foreground/50 font-mono">{p.unit}</span>
                      {isActive && <Check className="w-3 h-3 text-primary flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Secondary */}
        {secondaryParams.length > 0 && (
          <div>
            <button
              onClick={() => toggleSection("secondary")}
              className="w-full flex items-center gap-1.5 px-1.5 py-1.5 text-left rounded-md hover:bg-secondary/40 transition-colors"
            >
              <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform ${expandedSections.has("secondary") ? "" : "-rotate-90"}`} />
              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider flex-1">Secondary</span>
            </button>
            {expandedSections.has("secondary") && (
              <div className="space-y-0.5 mt-0.5 animate-in slide-in-from-top-1 duration-150">
                {secondaryParams.map((p) => {
                  const Icon = PARAM_ICONS[p.id];
                  const isActive = selectedParams.has(p.id);
                  return (
                    <button
                      key={p.id}
                      onClick={() => onToggleParam(p.id)}
                      className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg text-left transition-all group ${
                        isActive
                          ? "bg-primary/8 border border-primary/15"
                          : "border border-transparent hover:bg-secondary/50"
                      }`}
                    >
                      <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 ${
                        isActive ? "bg-primary/15" : "bg-secondary/60"
                      }`}>
                        <Icon className={`w-3 h-3 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-[11px] font-medium ${isActive ? "text-foreground" : "text-muted-foreground"}`}>{p.label}</p>
                      </div>
                      <span className="text-[9px] text-muted-foreground/50 font-mono">{p.unit}</span>
                      {isActive && <Check className="w-3 h-3 text-primary flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Quality Filters */}
        <div className="border-t border-border/50 pt-2 mt-2">
          <button
            onClick={() => toggleSection("quality")}
            className="w-full flex items-center gap-1.5 px-1.5 py-1.5 text-left rounded-md hover:bg-secondary/40 transition-colors"
          >
            <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform ${expandedSections.has("quality") ? "" : "-rotate-90"}`} />
            <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider flex-1">Quality Flags</span>
          </button>
          {expandedSections.has("quality") && (
            <div className="space-y-0.5 mt-0.5 animate-in slide-in-from-top-1 duration-150">
              {(Object.entries(QUALITY_CONFIG) as [QualityFlag, typeof QUALITY_CONFIG["good"]][]).map(([flag, conf]) => {
                const isActive = qualityFilters.has(flag);
                return (
                  <button
                    key={flag}
                    onClick={() => onToggleQuality(flag)}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left transition-all ${
                      isActive
                        ? "bg-primary/8 border border-primary/15"
                        : "border border-transparent hover:bg-secondary/50"
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${conf.bgColor} ring-2 ring-current ${conf.color} flex-shrink-0`} />
                    <span className={`text-[11px] font-medium flex-1 ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                      {conf.label}
                    </span>
                    {isActive && <Check className="w-3 h-3 text-primary flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Mobile Filter Drawer ── */
interface MobileFilterDrawerProps {
  open: boolean;
  onClose: () => void;
  selectedParams: Set<ParameterId>;
  onToggleParam: (id: ParameterId) => void;
  qualityFilters: Set<QualityFlag>;
  onToggleQuality: (q: QualityFlag) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
}

export function MobileFilterDrawer({
  open, onClose, selectedParams, onToggleParam,
  qualityFilters, onToggleQuality, onSelectAll, onClearAll,
}: MobileFilterDrawerProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute bottom-0 left-0 right-0 bg-card border-t border-border rounded-t-2xl shadow-xl max-h-[70vh] flex flex-col animate-in slide-in-from-bottom duration-300">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-primary" />
            <h3 className="text-[14px] text-foreground font-medium">Filters & Parameters</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <ParameterFilter
            selectedParams={selectedParams}
            onToggleParam={onToggleParam}
            qualityFilters={qualityFilters}
            onToggleQuality={onToggleQuality}
            onSelectAll={onSelectAll}
            onClearAll={onClearAll}
          />
        </div>
      </div>
    </div>
  );
}
