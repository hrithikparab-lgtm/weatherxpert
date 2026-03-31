import { useState, useMemo } from "react";
import { toast } from "sonner";
import {
  ChevronUp,
  ChevronDown,
  ChevronRight,
  Download,
  FileSpreadsheet,
  FileText,
  Code2,
  X,
  CalendarRange,
  Thermometer,
  Wind,
  Droplets,
  CloudRain,
} from "lucide-react";
import type { TabId } from "./ForecastExplorerChart";

/* ═══════════════════════════════════════════════════
   FORECAST DATA TABLE — Numeric forecast values
   with export, compare-two-date, & mobile accordion
   ═══════════════════════════════════════════════════ */

interface ForecastRow {
  time: string;
  temp: number;
  tempCompare?: number;
  wind: number;
  windCompare?: number;
  humidity: number;
  humidityCompare?: number;
  rainfall: number;
  rainfallCompare?: number;
}

function generateTableData(tab: TabId, compareEnabled: boolean): ForecastRow[] {
  const rows: ForecastRow[] = [];
  const configs: Record<TabId, { count: number; labelFn: (i: number) => string }> = {
    "hourly": {
      count: 24,
      labelFn: (i) => `${String(i).padStart(2, "0")}:00`,
    },
    "7day": {
      count: 7,
      labelFn: (i) => {
        const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        return days[i % 7];
      },
    },
    "accuracy": {
      count: 7,
      labelFn: (i) => {
        const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        return days[(7 - i) % 7];
      },
    }
  };

  const cfg = configs[tab] || configs["hourly"];
  if (!cfg) return [];

  for (let i = 0; i < cfg.count; i++) {
    const t = i / cfg.count;
    const cycle = Math.sin(t * Math.PI * 2);
    const row: ForecastRow = {
      time: cfg.labelFn(i),
      temp: Math.round((30 + cycle * 4 + (Math.random() - 0.5) * 2) * 10) / 10,
      wind: Math.round(12 + Math.random() * 20),
      humidity: Math.round(55 + Math.random() * 35),
      rainfall: Math.round(Math.max(0, Math.random() * 8 - 2) * 10) / 10,
    };
    if (compareEnabled) {
      row.tempCompare = Math.round((row.temp - 1.5 + Math.random() * 1.5) * 10) / 10;
      row.windCompare = Math.round(row.wind + (Math.random() - 0.5) * 6);
      row.humidityCompare = Math.round(row.humidity + (Math.random() - 0.5) * 10);
      row.rainfallCompare = Math.round(Math.max(0, row.rainfall + (Math.random() - 0.5) * 3) * 10) / 10;
    }
    rows.push(row);
  }
  return rows;
}

// ── Diff badge ──
function DiffBadge({ current, compare }: { current: number; compare?: number }) {
  if (compare === undefined) return null;
  const diff = Math.round((current - compare) * 10) / 10;
  if (diff === 0) return null;
  const isUp = diff > 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-[9px] font-semibold px-1 py-0 rounded ${
        isUp ? "text-destructive bg-destructive/10" : "text-chart-3 bg-chart-3/10"
      }`}
    >
      {isUp ? "+" : ""}
      {diff}
    </span>
  );
}

// ── Export Menu ──
function ExportMenu({ onClose }: { onClose: () => void }) {
  const exports = [
    {
      icon: FileText,
      label: "Export CSV",
      desc: "Comma-separated values",
      action: () => {
        const blob = new Blob(["time,temp,wind,humidity,rainfall\n"], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "forecast-data.csv";
        a.click();
        URL.revokeObjectURL(url);
        onClose();
      },
    },
    {
      icon: FileSpreadsheet,
      label: "Export Excel",
      desc: "XLSX spreadsheet format",
      action: () => {
        toast.success("Excel export started", { description: "Your file will download shortly." });
        onClose();
      },
    },
    {
      icon: Code2,
      label: "API Endpoint",
      desc: "Copy JSON API URL",
      action: () => {
        navigator.clipboard?.writeText("https://api.weatherxpert.tatapower.com/v2/forecast?format=json");
        toast.success("API Endpoint Copied", { description: "URL copied to clipboard" });
        onClose();
      },
    },
  ];

  return (
    <div className="absolute right-0 top-full mt-1 w-56 bg-popover border border-border rounded-xl shadow-xl z-20 py-1 animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="px-3 py-2 border-b border-border/60">
        <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">
          Export Options
        </p>
      </div>
      {exports.map((ex) => (
        <button
          key={ex.label}
          onClick={ex.action}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-secondary/60 transition-colors"
        >
          <ex.icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <div>
            <p className="text-[12px] text-foreground font-medium">{ex.label}</p>
            <p className="text-[10px] text-muted-foreground">{ex.desc}</p>
          </div>
        </button>
      ))}
    </div>
  );
}

// ── Mobile Accordion Row ──
function AccordionRow({ row, compareEnabled }: { row: ForecastRow; compareEnabled: boolean }) {
  const [open, setOpen] = useState(false);
  const metrics = [
    { label: "Temperature", value: `${row.temp}°C`, compare: row.tempCompare ? `${row.tempCompare}°C` : undefined, icon: Thermometer, color: "text-chart-5" },
    { label: "Wind Speed", value: `${row.wind} km/h`, compare: row.windCompare ? `${row.windCompare} km/h` : undefined, icon: Wind, color: "text-chart-3" },
    { label: "Humidity", value: `${row.humidity}%`, compare: row.humidityCompare ? `${row.humidityCompare}%` : undefined, icon: Droplets, color: "text-chart-1" },
    { label: "Rainfall", value: `${row.rainfall} mm`, compare: row.rainfallCompare ? `${row.rainfallCompare} mm` : undefined, icon: CloudRain, color: "text-chart-4" },
  ];

  return (
    <div className="border-b border-border/40 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-secondary/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-[13px] text-foreground font-medium tabular-nums">{row.time}</span>
          <span className="text-[12px] text-muted-foreground">{row.temp}°C</span>
        </div>
        <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${open ? "rotate-90" : ""}`} />
      </button>
      {open && (
        <div className="px-4 pb-3 grid grid-cols-2 gap-2 animate-in slide-in-from-top-1 duration-200">
          {metrics.map((m) => (
            <div key={m.label} className="flex items-center gap-2 bg-secondary/30 rounded-lg px-3 py-2">
              <m.icon className={`w-3.5 h-3.5 ${m.color}`} />
              <div>
                <p className="text-[10px] text-muted-foreground">{m.label}</p>
                <p className="text-[12px] text-foreground font-medium tabular-nums">{m.value}</p>
                {compareEnabled && m.compare && (
                  <p className="text-[10px] text-muted-foreground/70 tabular-nums">vs {m.compare}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main Table Component ──
interface ForecastDataTableProps {
  activeTab: TabId;
  compareEnabled: boolean;
  compareDate: string;
}

type SortKey = "time" | "temp" | "wind" | "humidity" | "rainfall";

export function ForecastDataTable({ activeTab, compareEnabled, compareDate }: ForecastDataTableProps) {
  const [showExport, setShowExport] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("time");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const data = useMemo(() => generateTableData(activeTab, compareEnabled), [activeTab, compareEnabled]);

  const sorted = useMemo(() => {
    return [...data].sort((a, b) => {
      if (sortKey === "time") {
        return sortDir === "asc" ? 0 : -1; // keep original order
      }
      const av = a[sortKey];
      const bv = b[sortKey];
      return sortDir === "asc" ? av - bv : bv - av;
    });
  }, [data, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const SortBtn = ({ label, field }: { label: string; field: SortKey }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-0.5 text-[10px] text-muted-foreground font-semibold uppercase tracking-wider hover:text-foreground transition-colors whitespace-nowrap"
    >
      {label}
      {sortKey === field &&
        (sortDir === "asc" ? <ChevronUp className="w-2.5 h-2.5 text-primary" /> : <ChevronDown className="w-2.5 h-2.5 text-primary" />)}
    </button>
  );

  return (
    <div className="rounded-xl border border-border bg-card transition-colors duration-200 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div>
          <h3 className="text-[14px] text-foreground font-medium">Forecast Data</h3>
          <p className="text-[11px] text-muted-foreground">
            {data.length} time slots{compareEnabled ? ` · vs ${compareDate}` : ""}
          </p>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowExport(!showExport)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-secondary border border-border rounded-lg text-[11px] text-foreground font-medium hover:bg-secondary/80 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-muted-foreground" />
            Export
          </button>
          {showExport && <ExportMenu onClose={() => setShowExport(false)} />}
        </div>
      </div>

      {compareEnabled && (
        <div className="mx-4 mb-2 flex items-center gap-1.5 px-2.5 py-1.5 bg-chart-2/5 border border-chart-2/15 rounded-lg text-[11px] text-chart-2">
          <CalendarRange className="w-3.5 h-3.5" />
          Comparing with {compareDate}
        </div>
      )}

      {/* Desktop Table */}
      <div className="hidden md:block overflow-y-auto flex-1 max-h-[600px]">
        <table className="w-full">
          <thead className="sticky top-0 z-10">
            <tr className="bg-secondary/50 border-y border-border/60">
              <th className="px-4 py-2 text-left"><SortBtn label="Time" field="time" /></th>
              <th className="px-2 py-2 text-right"><SortBtn label="Temp °C" field="temp" /></th>
              <th className="px-2 py-2 text-right"><SortBtn label="Wind km/h" field="wind" /></th>
              <th className="px-2 py-2 text-right"><SortBtn label="Hum %" field="humidity" /></th>
              <th className="px-2 py-2 text-right pr-4"><SortBtn label="Rain mm" field="rainfall" /></th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, idx) => (
              <tr
                key={row.time + idx}
                className="border-b border-border/30 hover:bg-secondary/20 transition-colors"
              >
                <td className="px-4 py-2 text-[12px] text-foreground font-medium tabular-nums">
                  {row.time}
                </td>
                <td className="px-2 py-2 text-right">
                  <span className="text-[12px] text-foreground tabular-nums">{row.temp}</span>
                  {compareEnabled && (
                    <span className="ml-1.5">
                      <DiffBadge current={row.temp} compare={row.tempCompare} />
                    </span>
                  )}
                </td>
                <td className="px-2 py-2 text-right">
                  <span className="text-[12px] text-muted-foreground tabular-nums">{row.wind}</span>
                  {compareEnabled && (
                    <span className="ml-1.5">
                      <DiffBadge current={row.wind} compare={row.windCompare} />
                    </span>
                  )}
                </td>
                <td className="px-2 py-2 text-right">
                  <span className="text-[12px] text-muted-foreground tabular-nums">{row.humidity}</span>
                  {compareEnabled && (
                    <span className="ml-1.5">
                      <DiffBadge current={row.humidity} compare={row.humidityCompare} />
                    </span>
                  )}
                </td>
                <td className="px-2 py-2 text-right pr-4">
                  <span className="text-[12px] text-muted-foreground tabular-nums">{row.rainfall}</span>
                  {compareEnabled && (
                    <span className="ml-1.5">
                      <DiffBadge current={row.rainfall} compare={row.rainfallCompare} />
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Accordion */}
      <div className="md:hidden flex-1 overflow-y-auto max-h-[400px]">
        {sorted.map((row, idx) => (
          <AccordionRow key={row.time + idx} row={row} compareEnabled={compareEnabled} />
        ))}
      </div>
    </div>
  );
}
