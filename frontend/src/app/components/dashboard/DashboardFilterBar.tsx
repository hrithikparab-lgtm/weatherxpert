import { useState, useCallback } from "react";
import { toast } from "sonner";
import {
  MapPin,
  Calendar,
  Clock,
  ChevronDown,
  SlidersHorizontal,
  RefreshCw,
  X,
  Navigation,
} from "lucide-react";

/* ═══════════════════════════════════════════════════
   DASHBOARD FILTER BAR — Sticky, collapsible on mobile
   ═══════════════════════════════════════════════════ */

const STATES = ["Maharashtra", "Delhi", "Gujarat", "Rajasthan", "Tamil Nadu", "Jharkhand"];
const DISCOMS = ["Mumbai Distribution", "Delhi Distribution", "Ajmer DISCOM", "MSEDCL"];
const TIME_RANGES = ["Last 6h", "Last 12h", "Last 24h", "Custom"];
const PROVIDERS = ["IMD", "Tomorrow.io"];

interface FilterState {
  state: string;
  discom: string;
  date: string;
  timeRange: string;
  provider: string;
  lat: string;
  lon: string;
}

interface DashboardFilterBarProps {
  onFilterChange?: (filters: FilterState) => void;
}

export function DashboardFilterBar({ onFilterChange }: DashboardFilterBarProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    state: "Maharashtra",
    discom: "Mumbai Distribution",
    date: new Date().toISOString().slice(0, 10),
    timeRange: "Last 24h",
    provider: "IMD",
    lat: "18.9388",
    lon: "72.8354",
  });

  const updateFilter = useCallback(
    (key: keyof FilterState, value: string) => {
      setFilters((prev) => {
        const next = { ...prev, [key]: value };
        onFilterChange?.(next);
        return next;
      });
    },
    [onFilterChange]
  );

  const dateDisplay = new Date(filters.date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const SelectChip = ({
    label,
    value,
    options,
    onChange,
    icon: Icon,
  }: {
    label: string;
    value: string;
    options: string[];
    onChange: (v: string) => void;
    icon?: React.ElementType;
  }) => (
    <div className="flex items-center gap-1.5 bg-secondary/50 border border-border rounded-lg px-2.5 py-1.5 min-w-max">
      {Icon && <Icon className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />}
      <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold hidden xl:inline">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent text-[12px] text-foreground font-medium border-none outline-none cursor-pointer appearance-none pr-4"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='none' viewBox='0 0 24 24' stroke='%2394A3B8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 0 center",
        }}
      >
        {options.map((o) => (
          <option key={o} value={o} className="bg-popover text-foreground">
            {o}
          </option>
        ))}
      </select>
    </div>
  );

  /* ── Desktop Row ── */
  const FilterControls = ({ className = "" }: { className?: string }) => (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <SelectChip
        label="State"
        value={filters.state}
        options={STATES}
        onChange={(v) => updateFilter("state", v)}
        icon={MapPin}
      />
      <SelectChip
        label="DISCOM"
        value={filters.discom}
        options={DISCOMS}
        onChange={(v) => updateFilter("discom", v)}
      />

      {/* Date */}
      <div className="flex items-center gap-1.5 bg-secondary/50 border border-border rounded-lg px-2.5 py-1.5 min-w-max">
        <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
        <input
          type="date"
          value={filters.date}
          onChange={(e) => updateFilter("date", e.target.value)}
          className="bg-transparent text-[12px] text-foreground font-medium border-none outline-none cursor-pointer w-[110px]"
        />
      </div>

      {/* Time Range */}
      <div className="flex items-center gap-0.5 bg-secondary/50 border border-border rounded-lg p-0.5 min-w-max">
        {TIME_RANGES.map((t) => (
          <button
            key={t}
            onClick={() => updateFilter("timeRange", t)}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all duration-150 ${
              filters.timeRange === t
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <SelectChip
        label="Provider"
        value={filters.provider}
        options={PROVIDERS}
        onChange={(v) => updateFilter("provider", v)}
      />

      {/* Lat/Lon */}
      <div className="flex items-center gap-1.5 bg-secondary/50 border border-border rounded-lg px-2.5 py-1.5 min-w-max">
        <Navigation className="w-3.5 h-3.5 text-muted-foreground" />
        <input
          type="text"
          value={filters.lat}
          onChange={(e) => updateFilter("lat", e.target.value)}
          className="bg-transparent text-[12px] text-foreground font-medium border-none outline-none w-[60px] tabular-nums"
          placeholder="Lat"
        />
        <span className="text-[11px] text-muted-foreground">,</span>
        <input
          type="text"
          value={filters.lon}
          onChange={(e) => updateFilter("lon", e.target.value)}
          className="bg-transparent text-[12px] text-foreground font-medium border-none outline-none w-[60px] tabular-nums"
          placeholder="Lon"
        />
      </div>
    </div>
  );

  return (
    <>
      {/* ── Desktop Filter Bar ── */}
      <div className="sticky top-0 z-30 hidden lg:flex items-center justify-between gap-3 bg-background/95 backdrop-blur-md border-b border-border px-6 py-2.5 transition-colors duration-300">
        <FilterControls />
        <button 
          onClick={() => toast.success("Dashboard refreshed", { description: "Latest weather data loaded from IMD." })}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-[12px] font-medium hover:bg-primary/90 transition-colors shadow-sm flex-shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {/* ── Mobile Toggle ── */}
      <div className="lg:hidden sticky top-0 z-30 flex items-center justify-between gap-3 bg-background/95 backdrop-blur-md border-b border-border px-4 py-2.5">
        <div className="flex items-center gap-2 text-[13px] text-foreground font-medium">
          <MapPin className="w-4 h-4 text-primary" />
          {filters.discom}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-muted-foreground">{dateDisplay}</span>
          <button
            onClick={() => setDrawerOpen(true)}
            className="p-2 rounded-lg bg-secondary border border-border text-muted-foreground hover:text-foreground transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Mobile Drawer ── */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="absolute top-0 left-0 right-0 bg-card border-b border-border shadow-xl p-4 space-y-4 animate-in slide-in-from-top duration-300">
            <div className="flex items-center justify-between">
              <h3 className="text-[15px] text-foreground font-medium">Filters</h3>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <FilterControls className="flex-col items-stretch" />
            <button
              onClick={() => setDrawerOpen(false)}
              className="w-full py-2.5 bg-primary text-primary-foreground rounded-xl text-[13px] font-medium"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </>
  );
}
