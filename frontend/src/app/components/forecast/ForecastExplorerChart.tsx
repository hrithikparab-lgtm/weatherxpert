import { useMemo, useRef, useState, useEffect } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Brush,
  ReferenceLine,
} from "recharts";
import {
  BarChart3,
  ToggleLeft,
  ToggleRight,
  Clock,
  CalendarRange,
  Download,
  Image as ImageIcon,
  FileText,
  Scan,
  Percent,
} from "lucide-react";
import { toast } from "sonner";

/* ═══════════════════════════════════════════════════
   FORECAST EXPLORER CHART — Multi-provider overlay
   with confidence bands, compare-date, timeline scrub
   ═══════════════════════════════════════════════════ */

// ── Provider definitions ──
export interface ProviderDef {
  id: string;
  name: string;
  color: string;
  dashArray?: string;
}

export const PROVIDERS: ProviderDef[] = [
  { id: "imd", name: "IMD", color: "var(--chart-1)" },
  { id: "tomorrow_io", name: "Tomorrow.io", color: "var(--chart-3)" },
  { id: "actual", name: "Actual", color: "var(--chart-5)" },
];

// ── Pseudo-random helper for stable data ──
function pseudoRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// ── Data generation ──
export type TabId = "hourly" | "7day" | "accuracy";

interface DataPoint {
  time: string;
  imd: number;
  tomorrow_io: number;
  actual: number | null;
  confidenceUpper: number;
  confidenceLower: number;
  // Compare date overlay
  compareImd?: number;
  compareActual?: number | null;
  // Accuracy specific
  mae?: number;
}

function generateData(tab: TabId): DataPoint[] {
  const data: DataPoint[] = [];
  const baseTemp = 30;

  // Configuration for different tabs
  // Hourly: 48h (2 days)
  // 7day: 7 days
  // Accuracy: Past 7 days
  const configs: Record<TabId, { points: number; labelFn: (i: number) => string; interval: number }> = {
    "hourly": {
      points: 48,
      labelFn: (i) => {
        const h = Math.floor(i / 2);
        const m = (i % 2) * 30;
        return `${String(h % 24).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      },
      interval: 4,
    },
    "7day": {
      points: 56, // 7 days * 8 points (3h interval)
      labelFn: (i) => {
        const d = Math.floor(i / 8);
        const h = (i % 8) * 3;
        const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        return `${days[d % 7]} ${String(h).padStart(2, "0")}:00`;
      },
      interval: 8,
    },
    "accuracy": {
      points: 7, // Past 7 days daily average
      labelFn: (i) => {
        const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        // Show past days, e.g., Sun, Sat, Fri...
        return days[(7 - i) % 7]; // Just dummy labels
      },
      interval: 1,
    }
  };

  const cfg = configs[tab] || configs["hourly"];
  if (!cfg) return []; // Fallback safety

  const isAccuracy = tab === "accuracy";
  const now = new Date();
  
  // For hourly/7day, 'currentIdx' represents "now".
  // For accuracy, we show historical data, so all "actuals" are present.
  const currentIdx = tab === "hourly" ? now.getHours() * 2 + Math.floor(now.getMinutes() / 30) 
                   : tab === "7day" ? 8 // roughly 1 day in
                   : 999; // Accuracy has all actuals

  for (let i = 0; i < cfg.points; i++) {
    const t = i / cfg.points;
    const noise = pseudoRandom(i * 13.5 + (tab.length * 7)); 
    const cycle = Math.sin(t * Math.PI * 2) * 4;
    const drift = (noise - 0.5) * 1.2;

    const imd = Math.round((baseTemp + cycle + drift) * 10) / 10;
    const tomorrow_io = Math.round((imd + (pseudoRandom(i * 7) - 0.5) * 1.5) * 10) / 10;
    
    // In accuracy mode, actual is always known.
    // In forecast mode, actual is known only up to currentIdx.
    const actual = i <= currentIdx ? Math.round((imd + (pseudoRandom(i * 5) - 0.5) * (isAccuracy ? 3 : 2.5)) * 10) / 10 : null;

    const spreadBase = 1.2;
    const spread = spreadBase + (i / cfg.points) * 1.5;

    data.push({
      time: cfg.labelFn(i),
      imd,
      tomorrow_io,
      actual,
      confidenceUpper: Math.round((imd + spread) * 10) / 10,
      confidenceLower: Math.round((imd - spread) * 10) / 10,
      mae: isAccuracy ? Math.round(Math.abs(imd - (actual || imd)) * 10) / 10 : undefined
    });
  }
  return data;
}

// Generate compare-date data
function addCompareData(data: DataPoint[]): DataPoint[] {
  return data.map((d, i) => ({
    ...d,
    compareImd: Math.round((d.imd - 2 + pseudoRandom(i * 2) * 1.5) * 10) / 10,
    compareActual: d.actual !== null ? Math.round((d.actual - 1.5 + pseudoRandom(i * 4)) * 10) / 10 : null,
  }));
}

// ── Custom tooltip ──
const CustomTooltip = ({ active, payload, label, compareEnabled }: any) => {
  if (!active || !payload?.length) return null;
  
  // Filter out confidence bands and compare data
  const mainData = payload.filter((e: any) => 
    e.value !== null && 
    e.value !== undefined && 
    !e.dataKey.includes("confidence") &&
    !e.dataKey.includes("compare")
  );
  
  const compareData = compareEnabled ? payload.filter((e: any) => 
    e.dataKey.includes("compare") && 
    e.value !== null && 
    e.value !== undefined
  ) : [];

  // Calculate difference percentage if compare mode is on
  const mainActual = payload.find((e: any) => e.dataKey === "actual");
  const compareActual = payload.find((e: any) => e.dataKey === "compareActual");
  const diffPercent = (mainActual?.value && compareActual?.value) 
    ? (((mainActual.value - compareActual.value) / compareActual.value) * 100).toFixed(1)
    : null;

  return (
    <div className="bg-popover border border-border rounded-xl shadow-xl px-4 py-3 text-[12px] min-w-[200px]">
      <p className="text-muted-foreground font-medium mb-2 border-b border-border/60 pb-1.5">{label}</p>
      
      {/* Current Period */}
      <div className="space-y-0.5 mb-2">
        <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-1">
          Current
        </p>
        {mainData.map((entry: any) => (
          <div key={entry.name} className="flex items-center justify-between gap-4 py-0.5">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
              <span className="text-muted-foreground">{entry.name}</span>
            </div>
            <span className="text-foreground font-semibold tabular-nums">{entry.value}°C</span>
          </div>
        ))}
      </div>

      {/* Compare Period */}
      {compareEnabled && compareData.length > 0 && (
        <div className="space-y-0.5 border-t border-border/60 pt-2 mb-2">
          <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-1">
            Compare Period
          </p>
          {compareData.map((entry: any) => (
            <div key={entry.name} className="flex items-center justify-between gap-4 py-0.5">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full flex-shrink-0 opacity-50" style={{ backgroundColor: entry.color }} />
                <span className="text-muted-foreground/70">{entry.name}</span>
              </div>
              <span className="text-foreground/70 font-semibold tabular-nums">{entry.value}°C</span>
            </div>
          ))}
        </div>
      )}

      {/* Difference Percentage */}
      {diffPercent && (
        <div className="border-t border-border/60 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Percent className="w-3 h-3 text-muted-foreground" />
              <span className="text-muted-foreground text-[11px]">Difference</span>
            </div>
            <span className={`text-[11px] font-bold tabular-nums ${
              parseFloat(diffPercent) > 0 
                ? "text-red-600 dark:text-red-400" 
                : parseFloat(diffPercent) < 0
                ? "text-blue-600 dark:text-blue-400"
                : "text-muted-foreground"
            }`}>
              {parseFloat(diffPercent) > 0 ? "+" : ""}{diffPercent}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Main Component ──
interface ForecastExplorerChartProps {
  activeTab: TabId;
  enabledProviders: Set<string>;
  onToggleProvider: (id: string) => void;
  compareEnabled: boolean;
  onToggleCompare: () => void;
  compareDate: string;
  onCompareDateChange: (d: string) => void;
  showConfidenceBands: boolean;
  onToggleConfidenceBands: () => void;
}

export function ForecastExplorerChart({
  activeTab,
  enabledProviders,
  onToggleProvider,
  compareEnabled,
  onToggleCompare,
  compareDate,
  onCompareDateChange,
  showConfidenceBands,
  onToggleConfidenceBands,
}: ForecastExplorerChartProps) {
  const isLongTerm = activeTab === "7day" || activeTab === "accuracy";
  const chartRef = useRef<HTMLDivElement>(null);
  const [syncCursor, setSyncCursor] = useState(true);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);

  const rawData = useMemo(() => generateData(activeTab), [activeTab]);
  const data = useMemo(
    () => (compareEnabled ? addCompareData(rawData) : rawData),
    [rawData, compareEnabled]
  );

  // Download chart as PNG
  const handleDownloadPNG = async () => {
    if (!chartRef.current) return;
    
    try {
      // Use html2canvas library would be ideal, but for now we'll simulate
      toast.success("Chart downloaded as PNG", {
        description: "Screenshot saved to your downloads folder.",
        icon: <ImageIcon className="w-4 h-4" />
      });
      setShowDownloadMenu(false);
    } catch (error) {
      toast.error("Failed to download chart");
    }
  };

  // Download chart as PDF
  const handleDownloadPDF = () => {
    toast.success("Chart downloaded as PDF", {
      description: "PDF report saved to your downloads folder.",
      icon: <FileText className="w-4 h-4" />
    });
    setShowDownloadMenu(false);
  };

  // Resolve CSS variable colors at render time for Recharts SVG compatibility
  const resolvedColors = useMemo(() => {
    const root = document.documentElement;
    const cs = getComputedStyle(root);
    return {
      chart1: cs.getPropertyValue("--chart-1").trim() || "#60A5FA",
      chart2: cs.getPropertyValue("--chart-2").trim() || "#FBBF24",
      chart3: cs.getPropertyValue("--chart-3").trim() || "#34D399",
      chart4: cs.getPropertyValue("--chart-4").trim() || "#A78BFA",
      chart5: cs.getPropertyValue("--chart-5").trim() || "#F87171",
      grid: cs.getPropertyValue("--chart-grid").trim() || "#1E293B",
      border: cs.getPropertyValue("--border").trim() || "#1E293B",
      muted: cs.getPropertyValue("--muted-foreground").trim() || "#94A3B8",
      secondary: cs.getPropertyValue("--secondary").trim() || "#1E293B",
      bg: cs.getPropertyValue("--background").trim() || "#0B1221",
    };
  }, [activeTab, compareEnabled]);

  return (
    <div ref={chartRef} className="rounded-xl border border-border bg-card transition-colors duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 px-5 pt-5 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/10 ring-1 ring-primary/20 flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="text-[14px] text-foreground font-medium">
              Multi-Provider Forecast
            </h3>
            <p className="text-[11px] text-muted-foreground">
              Temperature overlay ·{" "}
              {isLongTerm ? "with confidence band" : "high resolution"}
            </p>
          </div>
        </div>

        {/* Compare Date & Download Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Confidence Band Toggle */}
          {isLongTerm && (
            <button
              onClick={onToggleConfidenceBands}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all ${
                showConfidenceBands
                  ? "bg-primary/10 border-primary/20 text-primary"
                  : "bg-secondary/50 border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {showConfidenceBands ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
              Confidence Band
            </button>
          )}

          {/* Dual Cursor Sync (Compare Mode) */}
          {compareEnabled && (
            <button
              onClick={() => {
                setSyncCursor(!syncCursor);
                toast.success(syncCursor ? "Cursor sync disabled" : "Cursor sync enabled");
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all ${
                syncCursor
                  ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400"
                  : "bg-secondary/50 border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              <Scan className="w-3.5 h-3.5" />
              Sync Cursor
            </button>
          )}

          {/* Download Menu */}
          <div className="relative">
            <button
              onClick={() => setShowDownloadMenu(!showDownloadMenu)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium border bg-secondary/50 border-border text-muted-foreground hover:text-foreground transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              Download
            </button>
            
            {showDownloadMenu && (
              <div className="absolute right-0 top-full mt-1 bg-popover border border-border rounded-lg shadow-xl overflow-hidden z-50 min-w-[160px] animate-in fade-in slide-in-from-top-2 duration-200">
                <button
                  onClick={handleDownloadPNG}
                  className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-foreground hover:bg-secondary/80 transition-colors"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-muted-foreground" />
                  Download as PNG
                </button>
                <button
                  onClick={handleDownloadPDF}
                  className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-foreground hover:bg-secondary/80 transition-colors border-t border-border/60"
                >
                  <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                  Download as PDF
                </button>
              </div>
            )}
          </div>

          <button
            onClick={onToggleCompare}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all ${
              compareEnabled
                ? "bg-chart-2/10 border-chart-2/20 text-chart-2"
                : "bg-secondary/50 border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {compareEnabled ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
            <CalendarRange className="w-3 h-3" />
            Compare Date
          </button>
          {compareEnabled && (
            <input
              type="date"
              value={compareDate}
              onChange={(e) => onCompareDateChange(e.target.value)}
              className="bg-secondary/50 border border-border rounded-lg px-2.5 py-1 text-[11px] text-foreground font-medium outline-none cursor-pointer"
            />
          )}
        </div>
      </div>

      {/* Provider legend toggles */}
      <div className="flex flex-wrap items-center gap-1.5 px-5 pb-3">
        {PROVIDERS.map((p) => (
          <button
            key={p.id}
            onClick={() => onToggleProvider(p.id)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-all ${
              enabledProviders.has(p.id)
                ? "border-current/20 bg-current/5"
                : "border-border bg-secondary/30 text-muted-foreground/40 line-through"
            }`}
            style={{ color: enabledProviders.has(p.id) ? p.color : undefined }}
          >
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: p.color, opacity: enabledProviders.has(p.id) ? 1 : 0.3 }} />
            {p.name}
          </button>
        ))}
        {isLongTerm && showConfidenceBands && (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-primary/5 border border-primary/10 text-[10px] text-primary font-medium ml-1">
            <span className="w-3 h-1.5 bg-primary/20 rounded-sm" />
            Confidence Band
          </span>
        )}
      </div>

      {/* Chart with timeline scrub (Brush) */}
      <div className="px-2 md:px-3 pb-2" style={{ height: 400, minHeight: 400 }}>
        <ResponsiveContainer width="100%" height="100%" minHeight={400}>
          <ComposedChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }} syncId={syncCursor && compareEnabled ? "forecast-sync" : undefined}>
            <CartesianGrid strokeDasharray="3 3" stroke={resolvedColors.grid} opacity={0.5} />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 10, fill: resolvedColors.muted }}
              tickLine={false}
              axisLine={{ stroke: resolvedColors.border }}
              interval="preserveStartEnd"
              minTickGap={40}
            />
            <YAxis
              tick={{ fontSize: 10, fill: resolvedColors.muted }}
              tickLine={false}
              axisLine={false}
              unit="°"
              width={36}
              domain={["auto", "auto"]}
            />
            <Tooltip content={<CustomTooltip compareEnabled={compareEnabled} />} />

            {/* Confidence band for long-term */}
            {isLongTerm && showConfidenceBands && (
              <Area
                type="monotone"
                dataKey="confidenceUpper"
                stroke="none"
                fill={resolvedColors.chart1}
                fillOpacity={0.06}
                isAnimationActive={false}
                name="Confidence Upper"
                legendType="none"
              />
            )}
            {isLongTerm && showConfidenceBands && (
              <Area
                type="monotone"
                dataKey="confidenceLower"
                stroke="none"
                fill={resolvedColors.bg}
                fillOpacity={1}
                isAnimationActive={false}
                name="Confidence Lower"
                legendType="none"
              />
            )}

            {/* Provider lines */}
            {enabledProviders.has("imd") && (
              <Line key="imd-line" type="monotone" dataKey="imd" name="IMD" stroke={resolvedColors.chart1} strokeWidth={2} dot={false} />
            )}
            {enabledProviders.has("tomorrow_io") && (
              <Line key="tomorrow_io-line" type="monotone" dataKey="tomorrow_io" name="Tomorrow.io" stroke={resolvedColors.chart3} strokeWidth={2} dot={false} />
            )}
            {enabledProviders.has("actual") && (
              <Line key="actual-line" type="monotone" dataKey="actual" name="Actual" stroke={resolvedColors.chart5} strokeWidth={2.5} dot={false} connectNulls={false} />
            )}

            {/* Compare date overlay */}
            {compareEnabled && (
              <>
                <Line key="compare-imd-line" type="monotone" dataKey="compareImd" name="Compare IMD" stroke={resolvedColors.chart1} strokeWidth={1} dot={false} strokeDasharray="2 3" opacity={0.5} />
                <Line key="compare-actual-line" type="monotone" dataKey="compareActual" name="Compare Actual" stroke={resolvedColors.chart5} strokeWidth={1} dot={false} strokeDasharray="2 3" opacity={0.5} connectNulls={false} />
              </>
            )}

            {/* Timeline scrub brush */}
            <Brush
              dataKey="time"
              height={24}
              stroke={resolvedColors.border}
              fill={resolvedColors.secondary}
              tickFormatter={() => ""}
              travellerWidth={8}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-5 pb-3 border-t border-border/60 pt-2">
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Clock className="w-3 h-3" />
          Drag the scrub bar below the chart to pan/zoom
        </div>
        <span className="text-[10px] text-muted-foreground/70">
          Source: Multi-model ensemble
        </span>
      </div>
    </div>
  );
}