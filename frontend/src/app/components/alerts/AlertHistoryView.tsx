import { useState, useMemo, useCallback } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import {
  Search,
  Calendar,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  FileSpreadsheet,
  Map,
  Eye,
  CheckCircle2,
  X,
  Filter,
  MapPin,
  SlidersHorizontal,
  Clock,
  CloudLightning,
  Wind,
  Thermometer,
  Zap,
  CloudFog,
  Droplets,
  Waves,
  Wrench,
  CalendarRange,
  SquareCheckBig,
  Square,
  TrendingUp,
  Activity,
  Tag,
  FileBarChart,
} from "lucide-react";
import {
  SEVERITY_CONFIG,
  TYPE_LABELS,
  DISCOMS,
  BLOCKS,
  type Severity,
  type AlertType,
} from "./alertsData";
import { HISTORY_RECORDS, type HistoryRecord } from "./alertHistoryData";
import { toast } from "sonner";

/* ═══════════════════════════════════════════════════
   ALERT HISTORY VIEW — Table-first interface
   7 days + custom range · Sparklines · Bulk actions ·
   Pagination · CSV/Excel export · Empty guidance
   ═══════════════════════════════════════════════════ */

const TYPE_ICONS: Record<AlertType, React.ElementType> = {
  storm: CloudLightning,
  wind: Wind,
  heat: Thermometer,
  lightning: Zap,
  fog: CloudFog,
  flood: Waves,
  humidity: Droplets,
  equipment: Wrench,
};

type SortKey = "severity" | "time" | "duration" | "type" | "status";
type RangePreset = "24h" | "3d" | "7d" | "custom";

const RANGE_PRESETS: { id: RangePreset; label: string }[] = [
  { id: "24h", label: "24 Hours" },
  { id: "3d", label: "3 Days" },
  { id: "7d", label: "7 Days" },
  { id: "custom", label: "Custom" },
];

const PAGE_SIZE = 15;

// ── Sparkline mini component ──
function MiniSparkline({ data, severity }: { data: number[]; severity: Severity }) {
  const color = severity === "critical"
    ? "#EF4444"
    : severity === "high"
    ? "#F97316"
    : severity === "medium"
    ? "#F59E0B"
    : severity === "low"
    ? "#3B82F6"
    : "#94A3B8";

  const chartData = data.map((v, i) => ({ i, v }));

  return (
    <div className="w-16 h-5" style={{ minHeight: 20 }}>
      <ResponsiveContainer width="100%" height="100%" minHeight={20}>
        <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <Area
            type="monotone"
            dataKey="v"
            stroke={color}
            strokeWidth={1.5}
            fill={color}
            fillOpacity={0.12}
            isAnimationActive={false}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Export menu ──
function ExportDropdown({ onClose, selectedCount }: { onClose: () => void; selectedCount: number }) {
  const doExport = (type: string) => {
    const blob = new Blob(
      [type === "csv" ? "id,severity,type,time,description\n" : "{}"],
      { type: type === "csv" ? "text/csv" : "application/json" }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `alert-history.${type === "csv" ? "csv" : "xlsx"}`;
    a.click();
    URL.revokeObjectURL(url);
    onClose();
  };

  return (
    <div className="absolute right-0 top-full mt-1 w-52 bg-popover border border-border rounded-xl shadow-xl z-20 py-1 animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="px-3 py-2 border-b border-border/60">
        <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">
          Export {selectedCount > 0 ? `(${selectedCount} selected)` : "All"}
        </p>
      </div>
      {[
        { icon: FileText, label: "Export CSV", desc: "Comma-separated values", type: "csv" },
        { icon: FileSpreadsheet, label: "Export Excel", desc: "XLSX spreadsheet", type: "xlsx" },
      ].map((ex) => (
        <button
          key={ex.type}
          onClick={() => doExport(ex.type)}
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

// ── Detail modal ──
function AlertDetailModal({ record, onClose }: { record: HistoryRecord; onClose: () => void }) {
  const sev = SEVERITY_CONFIG[record.severity];
  const Icon = TYPE_ICONS[record.type];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg ${sev.bg} ring-1 ${sev.ring} flex items-center justify-center`}>
              <Icon className={`w-4 h-4 ${sev.text}`} />
            </div>
            <div>
              <h3 className="text-[14px] text-foreground font-medium">{record.id}</h3>
              <p className="text-[11px] text-muted-foreground">{TYPE_LABELS[record.type]} · {sev.label}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-5 py-4 space-y-3 max-h-[60vh] overflow-y-auto">
          <h4 className="text-[14px] text-foreground font-medium">{record.title}</h4>
          <p className="text-[12px] text-muted-foreground leading-relaxed">{record.description}</p>

          <div className="grid grid-cols-2 gap-3 pt-2">
            {[
              { label: "Location", value: record.location },
              { label: "DISCOM", value: record.discom },
              { label: "Block", value: record.block },
              { label: "Source", value: record.source },
              { label: "Issued (UTC)", value: record.issuedAtUTC },
              { label: "Issued (Local)", value: record.issuedAtLocal },
              { label: "Resolved", value: record.resolvedAt || "Still active" },
              { label: "Acknowledged By", value: record.acknowledgedBy || "—" },
              { label: "Duration", value: formatDuration(record.durationMin) },
              { label: "Status", value: record.status.charAt(0).toUpperCase() + record.status.slice(1) },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">{item.label}</p>
                <p className="text-[12px] text-foreground font-medium mt-0.5">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-1">Intensity Timeline</p>
            <div className="h-10 w-full" style={{ minHeight: 40 }}>
              <ResponsiveContainer width="100%" height="100%" minHeight={40}>
                <AreaChart data={record.sparkline.map((v, i) => ({ i, v }))} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <Area
                    type="monotone"
                    dataKey="v"
                    stroke={sev.dot.replace("bg-", "").includes("red") ? "#EF4444" : sev.dot.includes("orange") ? "#F97316" : sev.dot.includes("amber") ? "#F59E0B" : sev.dot.includes("blue") ? "#3B82F6" : "#94A3B8"}
                    strokeWidth={1.5}
                    fill={sev.dot.replace("bg-", "").includes("red") ? "#EF4444" : sev.dot.includes("orange") ? "#F97316" : sev.dot.includes("amber") ? "#F59E0B" : sev.dot.includes("blue") ? "#3B82F6" : "#94A3B8"}
                    fillOpacity={0.1}
                    isAnimationActive={false}
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 px-5 py-3 border-t border-border">
          <button onClick={onClose} className="flex-1 py-2 bg-secondary border border-border rounded-lg text-[12px] text-foreground font-medium hover:bg-secondary/80 transition-colors">
            Close
          </button>
          <button className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-[12px] font-medium hover:bg-primary/90 transition-colors shadow-sm">
            <Map className="w-3.5 h-3.5" />
            Replay on Map
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Empty state ──
function HistoryEmptyState({ onExtendRange }: { onExtendRange: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mb-4">
        <CalendarRange className="w-7 h-7 text-muted-foreground" />
      </div>
      <h3 className="text-[15px] text-foreground mb-1">No alerts in this period</h3>
      <p className="text-[13px] text-muted-foreground max-w-sm mb-4">
        There are no historical alerts matching your filters for the selected date range.
        Try extending the range or adjusting your filters.
      </p>
      <button
        onClick={onExtendRange}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-[13px] font-medium hover:bg-primary/90 transition-colors shadow-sm"
      >
        Extend to 7 Days
      </button>
    </div>
  );
}

// ── Main Component ──
interface AlertHistoryViewProps {
  canEdit: boolean;
  canExport: boolean;
}

export function AlertHistoryView({ canEdit, canExport }: AlertHistoryViewProps) {
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [rangePreset, setRangePreset] = useState<RangePreset>("7d");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [filterSeverity, setFilterSeverity] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [filterDiscom, setFilterDiscom] = useState("all");
  const [filterBlock, setFilterBlock] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterRootCause, setFilterRootCause] = useState("all");
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Sort
  const [sortKey, setSortKey] = useState<SortKey>("time");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  // Pagination
  const [page, setPage] = useState(0);

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Detail modal
  const [detailRecord, setDetailRecord] = useState<HistoryRecord | null>(null);

  // Export menu
  const [showExport, setShowExport] = useState(false);

  // Filtered data
  const filtered = useMemo(() => {
    let result = [...HISTORY_RECORDS];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.location.toLowerCase().includes(q) ||
          r.id.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q)
      );
    }

    if (filterSeverity !== "all") result = result.filter((r) => r.severity === filterSeverity);
    if (filterType !== "all") result = result.filter((r) => r.type === filterType);
    if (filterDiscom !== "all") result = result.filter((r) => r.discom === filterDiscom);
    if (filterBlock !== "all") result = result.filter((r) => r.block === filterBlock);
    if (filterStatus !== "all") result = result.filter((r) => r.status === filterStatus);
    if (filterRootCause !== "all") result = result.filter((r) => r.rootCause === filterRootCause);

    // Sort
    result.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "severity":
          cmp = SEVERITY_CONFIG[a.severity].priority - SEVERITY_CONFIG[b.severity].priority;
          break;
        case "time":
          cmp = new Date(a.issuedAtUTC.replace(" UTC", "Z")).getTime() - new Date(b.issuedAtUTC.replace(" UTC", "Z")).getTime();
          break;
        case "duration":
          cmp = a.durationMin - b.durationMin;
          break;
        case "type":
          cmp = a.type.localeCompare(b.type);
          break;
        case "status":
          cmp = a.status.localeCompare(b.status);
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return result;
  }, [searchQuery, filterSeverity, filterType, filterDiscom, filterBlock, filterStatus, filterRootCause, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const handleSort = useCallback((key: SortKey) => {
    setSortKey((prev) => {
      if (prev === key) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        return key;
      }
      setSortDir(key === "time" ? "desc" : "asc");
      return key;
    });
    setPage(0);
  }, []);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selectedIds.size === paged.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paged.map((r) => r.id)));
    }
  }, [paged, selectedIds.size]);

  const clearFilters = () => {
    setSearchQuery("");
    setFilterSeverity("all");
    setFilterType("all");
    setFilterDiscom("all");
    setFilterBlock("all");
    setFilterStatus("all");
    setFilterRootCause("all");
    setPage(0);
  };

  const hasFilters = filterSeverity !== "all" || filterType !== "all" || filterDiscom !== "all" || filterBlock !== "all" || filterStatus !== "all" || filterRootCause !== "all" || searchQuery.trim() !== "";

  const SortHeader = ({ label, field, className = "" }: { label: string; field: SortKey; className?: string }) => (
    <button
      onClick={() => handleSort(field)}
      className={`flex items-center gap-0.5 text-[10px] text-muted-foreground font-semibold uppercase tracking-wider hover:text-foreground transition-colors whitespace-nowrap ${className}`}
    >
      {label}
      {sortKey === field && (
        sortDir === "asc" ? <ChevronUp className="w-2.5 h-2.5 text-primary" /> : <ChevronDown className="w-2.5 h-2.5 text-primary" />
      )}
    </button>
  );

  // Analytics calculations
  const analytics = useMemo(() => {
    const resolvedAlerts = HISTORY_RECORDS.filter(r => r.status === "resolved");
    const avgResolutionTime = resolvedAlerts.length > 0
      ? Math.round(resolvedAlerts.reduce((sum, r) => sum + r.durationMin, 0) / resolvedAlerts.length)
      : 0;

    // Heatmap data: 7 days x 24 hours
    const heatmapData: { day: string; hour: number; count: number }[] = [];
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    for (let d = 0; d < 7; d++) {
      for (let h = 0; h < 24; h++) {
        const count = HISTORY_RECORDS.filter(r => r.dayOfWeek === d && r.hourOfDay === h).length;
        heatmapData.push({ day: days[d], hour: h, count });
      }
    }

    // Resolution trend: last 7 days
    const trendData: { day: string; resolved: number; total: number }[] = [];
    const now = new Date("2026-02-11T14:00:00Z");
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 86400000);
      const dayStr = date.toLocaleDateString("en-US", { weekday: "short" });
      const dayRecords = HISTORY_RECORDS.filter(r => {
        const recordDate = new Date(r.issuedAtUTC.replace(" UTC", "Z"));
        return recordDate.toDateString() === date.toDateString();
      });
      const resolvedCount = dayRecords.filter(r => r.status === "resolved").length;
      trendData.push({ day: dayStr, resolved: resolvedCount, total: dayRecords.length });
    }

    return { avgResolutionTime, heatmapData, trendData };
  }, []);

  // Bulk export with summary
  const handleBulkExport = useCallback(() => {
    const exportData = selectedIds.size > 0
      ? filtered.filter(r => selectedIds.has(r.id))
      : filtered;

    const summary = [
      "# WeatherXpert Alert History Export",
      `## Generated: ${new Date().toLocaleString()}`,
      `## Total Records: ${exportData.length}`,
      `## Average Resolution Time: ${formatDuration(analytics.avgResolutionTime)}`,
      `## Severity Breakdown:`,
      ...Object.keys(SEVERITY_CONFIG).map(s => {
        const count = exportData.filter(r => r.severity === s).length;
        return `##   ${SEVERITY_CONFIG[s as Severity].label}: ${count}`;
      }),
      "",
      "# Alert Records",
      "ID,Severity,Type,Status,Location,Issued (UTC),Duration (min),Root Cause",
      ...exportData.map(r => 
        `${r.id},${r.severity},${r.type},${r.status},${r.location},${r.issuedAtUTC},${r.durationMin},${r.rootCause || "unknown"}`
      ),
    ].join("\n");

    const blob = new Blob([summary], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `alert_history_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success("Export complete", {
      description: `Exported ${exportData.length} records with summary header`,
    });
    setShowExport(false);
  }, [selectedIds, filtered, analytics]);

  return (
    <div className="space-y-4">
      {/* ── Filter Bar ── */}
      {/* Desktop */}
      <div className="hidden md:flex flex-col gap-3 rounded-xl border border-border bg-card p-4 transition-colors duration-200">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }}
              placeholder="Search alerts by ID, title, or location..."
              className="w-full pl-8 pr-3 py-2 bg-secondary/50 border border-border rounded-lg text-[12px] text-foreground font-medium outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/50"
            />
          </div>

          {/* Range presets */}
          <div className="flex items-center gap-0.5 bg-secondary/50 border border-border rounded-lg p-0.5">
            {RANGE_PRESETS.map((rp) => (
              <button
                key={rp.id}
                onClick={() => setRangePreset(rp.id)}
                className={`px-3 py-1.5 rounded-md text-[11px] font-medium transition-all whitespace-nowrap ${
                  rangePreset === rp.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {rp.label}
              </button>
            ))}
          </div>

          {/* Custom dates */}
          {rangePreset === "custom" && (
            <div className="flex items-center gap-1.5 bg-secondary/50 border border-border rounded-lg px-2.5 py-1.5">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="bg-transparent text-[12px] text-foreground font-medium border-none outline-none cursor-pointer w-[105px]" />
              <span className="text-[11px] text-muted-foreground">→</span>
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="bg-transparent text-[12px] text-foreground font-medium border-none outline-none cursor-pointer w-[105px]" />
            </div>
          )}

          {/* Advanced toggle */}
          <button
            onClick={() => setAdvancedOpen(!advancedOpen)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium border transition-all ${
              advancedOpen || hasFilters
                ? "bg-primary/10 border-primary/20 text-primary"
                : "bg-secondary/50 border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filters
            {hasFilters && (
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            )}
          </button>

          {/* Export */}
          {canExport && (
            <div className="relative">
              <button
                onClick={() => setShowExport(!showExport)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary border border-border rounded-lg text-[11px] text-foreground font-medium hover:bg-secondary/80 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-muted-foreground" />
                Export
              </button>
              {showExport && <ExportDropdown onClose={() => setShowExport(false)} selectedCount={selectedIds.size} />}
            </div>
          )}
        </div>

        {/* Advanced filters row */}
        {advancedOpen && (
          <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-border/60 animate-in slide-in-from-top-1 duration-200">
            <FilterSelect label="Severity" value={filterSeverity} onChange={(v) => { setFilterSeverity(v); setPage(0); }}
              options={[{ value: "all", label: "All Severity" }, ...Object.keys(SEVERITY_CONFIG).map((s) => ({ value: s, label: SEVERITY_CONFIG[s as Severity].label }))]}
            />
            <FilterSelect label="Type" value={filterType} onChange={(v) => { setFilterType(v); setPage(0); }}
              options={[{ value: "all", label: "All Types" }, ...Object.keys(TYPE_LABELS).map((t) => ({ value: t, label: TYPE_LABELS[t as AlertType] }))]}
            />
            <FilterSelect label="DISCOM" value={filterDiscom} onChange={(v) => { setFilterDiscom(v); setPage(0); }}
              options={[{ value: "all", label: "All DISCOMs" }, ...DISCOMS.map((d) => ({ value: d, label: d }))]}
            />
            <FilterSelect label="Block" value={filterBlock} onChange={(v) => { setFilterBlock(v); setPage(0); }}
              options={[{ value: "all", label: "All Blocks" }, ...BLOCKS.map((b) => ({ value: b, label: b }))]}
            />
            <FilterSelect label="Status" value={filterStatus} onChange={(v) => { setFilterStatus(v); setPage(0); }}
              options={[
                { value: "all", label: "All Status" },
                { value: "resolved", label: "Resolved" },
                { value: "acknowledged", label: "Acknowledged" },
                { value: "escalated", label: "Escalated" },
              ]}
            />
            <FilterSelect label="Root Cause" value={filterRootCause} onChange={(v) => { setFilterRootCause(v); setPage(0); }}
              options={[
                { value: "all", label: "All Root Causes" },
                { value: "equipment_failure", label: "Equipment Failure" },
                { value: "weather_conditions", label: "Weather Conditions" },
                { value: "human_error", label: "Human Error" },
                { value: "unknown", label: "Unknown" },
              ]}
            />
            {hasFilters && (
              <button onClick={clearFilters} className="text-[11px] text-primary hover:text-primary/80 font-medium transition-colors px-2">
                Clear all
              </button>
            )}
          </div>
        )}
      </div>

      {/* Mobile filter row */}
      <div className="md:hidden flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }}
            placeholder="Search history..."
            className="w-full pl-9 pr-3 py-2.5 bg-secondary/50 border border-border rounded-xl text-[13px] text-foreground font-medium outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/50"
          />
        </div>
        <button onClick={() => setMobileFilterOpen(true)} className="p-2.5 rounded-xl bg-secondary border border-border text-muted-foreground">
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Mobile filter drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileFilterOpen(false)} />
          <div className="absolute top-0 left-0 right-0 bg-card border-b border-border shadow-xl p-4 space-y-3 animate-in slide-in-from-top duration-300">
            <div className="flex items-center justify-between">
              <h3 className="text-[15px] text-foreground font-medium">History Filters</h3>
              <button onClick={() => setMobileFilterOpen(false)} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground"><X className="w-4 h-4" /></button>
            </div>
            {/* Range */}
            <div className="flex gap-1.5 flex-wrap">
              {RANGE_PRESETS.map((rp) => (
                <button key={rp.id} onClick={() => setRangePreset(rp.id)}
                  className={`px-3 py-1.5 rounded-lg text-[12px] font-medium border transition-all ${
                    rangePreset === rp.id ? "bg-primary text-primary-foreground border-primary shadow-sm" : "bg-secondary border-border text-muted-foreground"
                  }`}
                >{rp.label}</button>
              ))}
            </div>
            <div className="space-y-2">
              <MobileFilterSelect label="Severity" value={filterSeverity} onChange={setFilterSeverity}
                options={[{ value: "all", label: "All Severity" }, ...Object.keys(SEVERITY_CONFIG).map((s) => ({ value: s, label: SEVERITY_CONFIG[s as Severity].label }))]}
              />
              <MobileFilterSelect label="Type" value={filterType} onChange={setFilterType}
                options={[{ value: "all", label: "All Types" }, ...Object.keys(TYPE_LABELS).map((t) => ({ value: t, label: TYPE_LABELS[t as AlertType] }))]}
              />
              <MobileFilterSelect label="Status" value={filterStatus} onChange={setFilterStatus}
                options={[{ value: "all", label: "All Status" }, { value: "resolved", label: "Resolved" }, { value: "acknowledged", label: "Acknowledged" }, { value: "escalated", label: "Escalated" }]}
              />
              <MobileFilterSelect label="DISCOM" value={filterDiscom} onChange={setFilterDiscom}
                options={[{ value: "all", label: "All DISCOMs" }, ...DISCOMS.map((d) => ({ value: d, label: d }))]}
              />
            </div>
            <button onClick={() => setMobileFilterOpen(false)} className="w-full py-2.5 bg-primary text-primary-foreground rounded-xl text-[13px] font-medium">
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* ── Bulk Actions Bar ── */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 px-4 py-2.5 bg-primary/5 border border-primary/15 rounded-xl animate-in slide-in-from-top-1 duration-200">
          <span className="text-[12px] text-primary font-medium tabular-nums">
            {selectedIds.size} selected
          </span>
          <div className="h-4 w-px bg-primary/20" />
          {canEdit && (
            <button
              onClick={() => setSelectedIds(new Set())}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium text-chart-3 bg-chart-3/8 hover:bg-chart-3/15 transition-colors"
            >
              <CheckCircle2 className="w-3 h-3" />
              Bulk Acknowledge
            </button>
          )}
          {canExport && (
            <button className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium text-primary bg-primary/8 hover:bg-primary/15 transition-colors">
              <Download className="w-3 h-3" />
              Export Selected
            </button>
          )}
          <div className="flex-1" />
          <button onClick={() => setSelectedIds(new Set())} className="text-[11px] text-muted-foreground hover:text-foreground font-medium transition-colors">
            Clear
          </button>
        </div>
      )}

      {/* ── Filter summary ── */}
      {hasFilters && (
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <Filter className="w-3 h-3" />
          Showing {filtered.length} of {HISTORY_RECORDS.length} records
          <button onClick={clearFilters} className="text-primary hover:text-primary/80 font-medium transition-colors">
            Clear filters
          </button>
        </div>
      )}

      {/* ── Table or Empty ── */}
      {filtered.length === 0 ? (
        <HistoryEmptyState onExtendRange={() => { setRangePreset("7d"); clearFilters(); }} />
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block rounded-xl border border-border bg-card overflow-hidden transition-colors duration-200">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px]">
                <thead>
                  <tr className="bg-secondary/30 border-b border-border/60">
                    <th className="w-10 px-3 py-2.5">
                      <button onClick={toggleSelectAll} className="text-muted-foreground hover:text-foreground transition-colors">
                        {selectedIds.size === paged.length && paged.length > 0
                          ? <SquareCheckBig className="w-3.5 h-3.5 text-primary" />
                          : <Square className="w-3.5 h-3.5" />
                        }
                      </button>
                    </th>
                    <th className="px-2 py-2.5 text-left"><SortHeader label="Type" field="type" /></th>
                    <th className="px-2 py-2.5 text-left"><SortHeader label="Severity" field="severity" /></th>
                    <th className="px-2 py-2.5 text-left"><SortHeader label="Time (UTC / Local)" field="time" /></th>
                    <th className="px-2 py-2.5 text-left">
                      <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Description</span>
                    </th>
                    <th className="px-2 py-2.5 text-left">
                      <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Area</span>
                    </th>
                    <th className="px-2 py-2.5 text-left">
                      <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Ack By</span>
                    </th>
                    <th className="px-2 py-2.5 text-left"><SortHeader label="Status" field="status" /></th>
                    <th className="px-2 py-2.5 text-right"><SortHeader label="Duration" field="duration" className="justify-end" /></th>
                    <th className="px-2 py-2.5 text-center">
                      <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Trend</span>
                    </th>
                    <th className="px-3 py-2.5 text-right">
                      <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((record) => {
                    const sev = SEVERITY_CONFIG[record.severity];
                    const Icon = TYPE_ICONS[record.type];
                    const isSelected = selectedIds.has(record.id);
                    return (
                      <tr
                        key={record.id}
                        className={`border-b border-border/30 transition-colors ${
                          isSelected ? "bg-primary/5" : "hover:bg-secondary/20"
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="w-10 px-3 py-2">
                          <button onClick={() => toggleSelect(record.id)} className="text-muted-foreground hover:text-foreground transition-colors">
                            {isSelected
                              ? <SquareCheckBig className="w-3.5 h-3.5 text-primary" />
                              : <Square className="w-3.5 h-3.5" />
                            }
                          </button>
                        </td>
                        {/* Type */}
                        <td className="px-2 py-2">
                          <div className="flex items-center gap-1.5">
                            <div className={`w-6 h-6 rounded-md ${sev.bg} flex items-center justify-center`}>
                              <Icon className={`w-3 h-3 ${sev.text}`} />
                            </div>
                            <span className="text-[11px] text-foreground font-medium">{TYPE_LABELS[record.type]}</span>
                          </div>
                        </td>
                        {/* Severity */}
                        <td className="px-2 py-2">
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider ${sev.badge}`}>
                            {sev.label}
                          </span>
                        </td>
                        {/* Time */}
                        <td className="px-2 py-2">
                          <p className="text-[11px] text-foreground font-medium tabular-nums leading-tight">{record.issuedAtLocal}</p>
                          <p className="text-[9px] text-muted-foreground/60 tabular-nums">{record.issuedAtUTC}</p>
                        </td>
                        {/* Description */}
                        <td className="px-2 py-2 max-w-[200px]">
                          <p className="text-[11px] text-foreground font-medium truncate">{record.title}</p>
                        </td>
                        {/* Area */}
                        <td className="px-2 py-2">
                          <p className="text-[11px] text-muted-foreground truncate max-w-[120px]">{record.location}</p>
                        </td>
                        {/* Ack by */}
                        <td className="px-2 py-2">
                          {record.acknowledgedBy ? (
                            <div className="flex items-center gap-1">
                              <div className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center text-[7px] text-primary font-semibold flex-shrink-0">
                                {record.acknowledgedBy.split(" ").map((n) => n[0]).join("")}
                              </div>
                              <span className="text-[11px] text-muted-foreground truncate">{record.acknowledgedBy.split(" ")[0]}</span>
                            </div>
                          ) : (
                            <span className="text-[11px] text-muted-foreground/40">—</span>
                          )}
                        </td>
                        {/* Status */}
                        <td className="px-2 py-2">
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold uppercase ${
                            record.status === "resolved"
                              ? "bg-chart-3/10 text-chart-3"
                              : record.status === "acknowledged"
                              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                              : "bg-purple-500/10 text-purple-600 dark:text-purple-400"
                          }`}>
                            {record.status}
                          </span>
                        </td>
                        {/* Duration */}
                        <td className="px-2 py-2 text-right">
                          <span className="text-[11px] text-muted-foreground font-medium tabular-nums">
                            {formatDuration(record.durationMin)}
                          </span>
                        </td>
                        {/* Sparkline */}
                        <td className="px-2 py-2">
                          <div className="flex justify-center">
                            <MiniSparkline data={record.sparkline} severity={record.severity} />
                          </div>
                        </td>
                        {/* Actions */}
                        <td className="px-3 py-2 text-right">
                          <div className="flex items-center justify-end gap-0.5">
                            <button
                              onClick={() => setDetailRecord(record)}
                              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            {canExport && (
                              <button className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors" title="Export Event">
                                <Download className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors" title="Replay on Map">
                              <Map className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-2">
            {paged.map((record) => {
              const sev = SEVERITY_CONFIG[record.severity];
              const Icon = TYPE_ICONS[record.type];
              return (
                <div
                  key={record.id}
                  onClick={() => setDetailRecord(record)}
                  className="rounded-xl border border-border bg-card p-3.5 active:bg-secondary/30 transition-colors cursor-pointer"
                >
                  <div className="flex items-start gap-2.5">
                    <div className={`w-8 h-8 rounded-lg ${sev.bg} ring-1 ${sev.ring} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-3.5 h-3.5 ${sev.text}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold uppercase ${sev.badge}`}>
                          {sev.label}
                        </span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold uppercase ${
                          record.status === "resolved" ? "bg-chart-3/10 text-chart-3" : record.status === "acknowledged" ? "bg-amber-500/10 text-amber-600" : "bg-purple-500/10 text-purple-600"
                        }`}>{record.status}</span>
                        <span className="text-[10px] text-muted-foreground/50 tabular-nums">{record.id}</span>
                      </div>
                      <h4 className="text-[12px] text-foreground font-medium truncate">{record.title}</h4>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-0.5"><MapPin className="w-2.5 h-2.5" />{record.location}</span>
                        <span className="flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" />{formatDuration(record.durationMin)}</span>
                      </div>
                    </div>
                    <MiniSparkline data={record.sparkline} severity={record.severity} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Pagination ── */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-muted-foreground tabular-nums">
              {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} of {filtered.length} records
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="p-1.5 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const pageNum = totalPages <= 5 ? i : Math.max(0, Math.min(page - 2, totalPages - 5)) + i;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-7 h-7 rounded-lg text-[11px] font-medium transition-all tabular-nums ${
                      page === pageNum
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "border border-border bg-card text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {pageNum + 1}
                  </button>
                );
              })}
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="p-1.5 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── Detail Modal ── */}
      {detailRecord && <AlertDetailModal record={detailRecord} onClose={() => setDetailRecord(null)} />}
    </div>
  );
}

/* ─── Helpers ─── */

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="flex items-center gap-1.5 bg-secondary/50 border border-border rounded-lg px-2.5 py-1.5">
      <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold hidden xl:inline">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="bg-transparent text-[12px] text-foreground font-medium border-none outline-none cursor-pointer">
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-popover text-foreground">{o.label}</option>
        ))}
      </select>
    </div>
  );
}

function MobileFilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="flex items-center gap-2 bg-secondary/50 border border-border rounded-lg px-3 py-2">
      <span className="text-[11px] text-muted-foreground font-medium min-w-[60px]">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="flex-1 bg-transparent text-[13px] text-foreground font-medium border-none outline-none cursor-pointer">
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-popover text-foreground">{o.label}</option>
        ))}
      </select>
      <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
    </div>
  );
}