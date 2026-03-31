import { useState, useCallback } from "react";
import {
  Calendar,
  ChevronDown,
  SlidersHorizontal,
  RefreshCw,
  X,
  Sun,
  Wind,
  Layers,
  Radio,
} from "lucide-react";

/* ═══════════════════════════════════════════════════
   RENEWABLES FILTER BAR — Advanced analytics filters
   Date range, Forecast horizon, Site/Plant, Provider,
   Wind height selector · Mobile drawer collapse
   ═══════════════════════════════════════════════════ */

const FORECAST_HORIZONS = ["Intra-day", "Day-ahead", "Week-ahead", "Month-ahead"];

const SOLAR_SITES = [
  "Charanka Solar Park — Gujarat",
  "Bhadla Solar Park — Rajasthan",
  "Kamuthi Solar — Tamil Nadu",
  "All Solar Sites",
];

const WIND_SITES = [
  "Muppandal Wind Farm — TN",
  "Jaisalmer Wind Park — Rajasthan",
  "Kutch Wind Farm — Gujarat",
  "All Wind Sites",
];

const PROVIDERS = ["IMD", "Tomorrow.io"];
const WIND_HEIGHTS = ["10m", "50m", "80m", "100m", "120m", "150m"];

interface RenewablesFilterBarProps {
  isSolar: boolean;
  selectedHeight: string;
  onHeightChange: (h: string) => void;
  onFilterChange?: (filters: any) => void;
}

export function RenewablesFilterBar({
  isSolar,
  selectedHeight,
  onHeightChange,
  onFilterChange,
}: RenewablesFilterBarProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [dateFrom, setDateFrom] = useState(
    new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10)
  );
  const [dateTo, setDateTo] = useState(new Date().toISOString().slice(0, 10));
  const [horizon, setHorizon] = useState("Day-ahead");
  const [site, setSite] = useState(isSolar ? SOLAR_SITES[0] : WIND_SITES[0]);
  const [provider, setProvider] = useState("IMD");

  const sites = isSolar ? SOLAR_SITES : WIND_SITES;

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

  const FilterControls = ({ className = "" }: { className?: string }) => (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {/* Date range */}
      <div className="flex items-center gap-1.5 bg-secondary/50 border border-border rounded-lg px-2.5 py-1.5 min-w-max">
        <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="bg-transparent text-[12px] text-foreground font-medium border-none outline-none cursor-pointer w-[105px]"
        />
        <span className="text-[11px] text-muted-foreground">→</span>
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="bg-transparent text-[12px] text-foreground font-medium border-none outline-none cursor-pointer w-[105px]"
        />
      </div>

      {/* Forecast Horizon */}
      <div className="flex items-center gap-0.5 bg-secondary/50 border border-border rounded-lg p-0.5 min-w-max">
        {FORECAST_HORIZONS.map((h) => (
          <button
            key={h}
            onClick={() => setHorizon(h)}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all duration-150 ${
              horizon === h
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {h}
          </button>
        ))}
      </div>

      {/* Site / Plant */}
      <SelectChip
        label="Site"
        value={site}
        options={sites}
        onChange={setSite}
        icon={isSolar ? Sun : Wind}
      />

      {/* Provider */}
      <SelectChip
        label="Provider"
        value={provider}
        options={PROVIDERS}
        onChange={setProvider}
        icon={Radio}
      />

      {/* Wind Height — only for Wind utility */}
      {!isSolar && (
        <div className="flex items-center gap-1.5 bg-secondary/50 border border-border rounded-lg px-2.5 py-1.5 min-w-max">
          <Layers className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold hidden xl:inline">
            Height
          </span>
          <div className="flex items-center gap-0.5">
            {WIND_HEIGHTS.map((h) => (
              <button
                key={h}
                onClick={() => onHeightChange(h)}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all duration-150 ${
                  selectedHeight === h
                    ? "bg-chart-3 text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                {h}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <div className="sticky top-0 z-30 hidden lg:flex items-center justify-between gap-3 bg-background/95 backdrop-blur-md border-b border-border px-6 py-2.5 transition-colors duration-300">
        <FilterControls />
        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-[12px] font-medium hover:bg-primary/90 transition-colors shadow-sm flex-shrink-0">
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {/* Mobile Toggle */}
      <div className="lg:hidden sticky top-0 z-30 flex items-center justify-between gap-3 bg-background/95 backdrop-blur-md border-b border-border px-4 py-2.5">
        <div className="flex items-center gap-2 text-[13px] text-foreground font-medium">
          {isSolar ? (
            <Sun className="w-4 h-4 text-chart-2" />
          ) : (
            <Wind className="w-4 h-4 text-chart-3" />
          )}
          {site.split("—")[0].trim()}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-muted-foreground">{horizon}</span>
          <button
            onClick={() => setDrawerOpen(true)}
            className="p-2 rounded-lg bg-secondary border border-border text-muted-foreground hover:text-foreground transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
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
