import { useState } from "react";
import {
  Calendar,
  ChevronDown,
  Clock,
  RefreshCw,
} from "lucide-react";
import {
  DATE_PRESETS,
  RESOLUTIONS,
  PROVIDERS,
  type Resolution,
} from "./historicalData";

/* ═══════════════════════════════════════════════════
   DATE RANGE BAR — Predefined ranges, custom picker,
   resolution selector, provider selector
   ═══════════════════════════════════════════════════ */

interface DateRangeBarProps {
  activeDays: number;
  onDaysChange: (d: number) => void;
  resolution: Resolution;
  onResolutionChange: (r: Resolution) => void;
  provider: string;
  onProviderChange: (p: string) => void;
  customStart: string;
  customEnd: string;
  onCustomStartChange: (d: string) => void;
  onCustomEndChange: (d: string) => void;
  onRefresh: () => void;
}

export function DateRangeBar({
  activeDays,
  onDaysChange,
  resolution,
  onResolutionChange,
  provider,
  onProviderChange,
  customStart,
  customEnd,
  onCustomStartChange,
  onCustomEndChange,
  onRefresh,
}: DateRangeBarProps) {
  const [showCustom, setShowCustom] = useState(false);

  return (
    <div className="flex flex-col gap-3 p-4 rounded-xl border border-border bg-card">
      {/* Row 1: Presets + Custom + Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        {/* Presets */}
        <div className="flex items-center gap-1 bg-secondary/50 p-0.5 rounded-lg border border-border overflow-x-auto no-scrollbar">
          {DATE_PRESETS.map((preset) => (
            <button
              key={preset.days}
              onClick={() => { onDaysChange(preset.days); setShowCustom(false); }}
              className={`px-2.5 py-1.5 rounded-md text-[11px] font-medium whitespace-nowrap transition-all ${
                activeDays === preset.days && !showCustom
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              {preset.label}
            </button>
          ))}
          <button
            onClick={() => setShowCustom(!showCustom)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[11px] font-medium whitespace-nowrap transition-all ${
              showCustom
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            <Calendar className="w-3 h-3" />
            Custom
          </button>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {/* Resolution */}
          <div className="flex items-center gap-1 bg-secondary/50 p-0.5 rounded-lg border border-border">
            {RESOLUTIONS.map((r) => (
              <button
                key={r.id}
                onClick={() => onResolutionChange(r.id)}
                className={`px-2 py-1.5 rounded-md text-[11px] font-medium whitespace-nowrap transition-all ${
                  resolution === r.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
                title={r.label}
              >
                {r.shortLabel}
              </button>
            ))}
          </div>

          {/* Provider */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-secondary/50 border border-border rounded-lg">
            <span className="text-[9px] text-muted-foreground uppercase font-semibold tracking-wider">SRC</span>
            <select
              value={provider}
              onChange={(e) => onProviderChange(e.target.value)}
              className="bg-transparent text-[11px] text-foreground font-medium border-none outline-none cursor-pointer"
            >
              {PROVIDERS.map((p) => (
                <option key={p} value={p} className="bg-popover text-foreground">{p}</option>
              ))}
            </select>
          </div>

          {/* Refresh */}
          <button
            onClick={onRefresh}
            className="p-2 bg-secondary/50 border border-border rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            title="Refresh data"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Row 2: Custom date range (conditional) */}
      {showCustom && (
        <div className="flex items-center gap-2 animate-in slide-in-from-top-1 duration-150">
          <div className="flex items-center gap-1.5 bg-secondary/50 border border-border rounded-lg px-2.5 py-1.5">
            <Clock className="w-3 h-3 text-muted-foreground" />
            <input
              type="date"
              value={customStart}
              onChange={(e) => onCustomStartChange(e.target.value)}
              className="bg-transparent text-[11px] text-foreground font-medium border-none outline-none cursor-pointer"
            />
          </div>
          <span className="text-[11px] text-muted-foreground">to</span>
          <div className="flex items-center gap-1.5 bg-secondary/50 border border-border rounded-lg px-2.5 py-1.5">
            <Clock className="w-3 h-3 text-muted-foreground" />
            <input
              type="date"
              value={customEnd}
              onChange={(e) => onCustomEndChange(e.target.value)}
              className="bg-transparent text-[11px] text-foreground font-medium border-none outline-none cursor-pointer"
            />
          </div>
          <button
            onClick={() => { onDaysChange(-1); /* -1 = custom mode */ }}
            className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-[11px] font-medium hover:bg-primary/90 transition-colors shadow-sm"
          >
            Apply
          </button>
        </div>
      )}
    </div>
  );
}
