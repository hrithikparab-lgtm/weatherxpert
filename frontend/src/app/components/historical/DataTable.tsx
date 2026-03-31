import { useState, useMemo } from "react";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  AlertTriangle,
  CheckCircle2,
  Info,
  BarChart3,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  PARAMETERS,
  QUALITY_CONFIG,
  type TimeSeriesRow,
  type ParameterId,
  type QualityFlag,
} from "./historicalData";

/* ═══════════════════════════════════════════════════
   DATA TABLE — Time series with forecast vs actual,
   diff %, quality flags, missing timestamp notes
   Sortable, paginated, row selection for chart
   ═══════════════════════════════════════════════════ */

type SortKey = "timestamp" | "actual" | "forecast" | "diffPercent" | "quality";
type SortDir = "asc" | "desc";

interface DataTableProps {
  rows: TimeSeriesRow[];
  selectedRows: Set<string>;
  onToggleRow: (id: string) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onChartSelection: () => void;
  chartParam: ParameterId;
}

const PAGE_SIZE = 25;

export function DataTable({
  rows,
  selectedRows,
  onToggleRow,
  onSelectAll,
  onClearSelection,
  onChartSelection,
  chartParam,
}: DataTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("timestamp");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(0);

  // Sort
  const sorted = useMemo(() => {
    const arr = [...rows];
    arr.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "timestamp":
          cmp = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
          break;
        case "actual":
          cmp = (a.actual ?? -Infinity) - (b.actual ?? -Infinity);
          break;
        case "forecast":
          cmp = a.forecast - b.forecast;
          break;
        case "diffPercent":
          cmp = (a.diffPercent ?? -Infinity) - (b.diffPercent ?? -Infinity);
          break;
        case "quality": {
          const qOrder: Record<QualityFlag, number> = { good: 0, interpolated: 1, suspect: 2, missing: 3 };
          cmp = qOrder[a.quality] - qOrder[b.quality];
          break;
        }
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [rows, sortKey, sortDir]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paginated = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("desc"); }
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ArrowUpDown className="w-2.5 h-2.5 text-muted-foreground/30" />;
    return sortDir === "asc"
      ? <ArrowUp className="w-2.5 h-2.5 text-primary" />
      : <ArrowDown className="w-2.5 h-2.5 text-primary" />;
  };

  // Quality stats
  const missingCount = rows.filter((r) => r.quality === "missing").length;
  const suspectCount = rows.filter((r) => r.quality === "suspect").length;

  const paramConf = PARAMETERS.find((p) => p.id === chartParam);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Table header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 py-3 border-b border-border/60 bg-secondary/10 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <h4 className="text-[12px] text-foreground font-medium truncate">
            {paramConf?.label ?? "All Parameters"} Time Series
          </h4>
          <span className="text-[9px] text-muted-foreground font-medium tabular-nums px-1.5 py-0.5 rounded bg-secondary">
            {rows.length.toLocaleString()} rows
          </span>
          {missingCount > 0 && (
            <span className="text-[9px] text-destructive font-medium tabular-nums px-1.5 py-0.5 rounded bg-destructive/10 flex items-center gap-0.5">
              <AlertTriangle className="w-2.5 h-2.5" />
              {missingCount} missing
            </span>
          )}
          {suspectCount > 0 && (
            <span className="text-[9px] text-chart-4 font-medium tabular-nums px-1.5 py-0.5 rounded bg-chart-4/10 flex items-center gap-0.5">
              <Info className="w-2.5 h-2.5" />
              {suspectCount} suspect
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {selectedRows.size > 0 && (
            <>
              <span className="text-[10px] text-primary font-medium tabular-nums">
                {selectedRows.size} selected
              </span>
              <button
                onClick={onChartSelection}
                className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-md text-[10px] font-medium hover:bg-primary/20 transition-colors"
              >
                <BarChart3 className="w-3 h-3" />
                Chart
              </button>
              <button
                onClick={onClearSelection}
                className="text-[10px] text-muted-foreground hover:text-foreground font-medium transition-colors"
              >
                Clear
              </button>
            </>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="bg-secondary/30 border-b border-border/40">
              <th className="w-8 px-2 py-2">
                <input
                  type="checkbox"
                  checked={selectedRows.size === rows.length && rows.length > 0}
                  onChange={() => selectedRows.size === rows.length ? onClearSelection() : onSelectAll()}
                  className="w-3 h-3 rounded accent-primary cursor-pointer"
                />
              </th>
              <th className="text-left px-3 py-2">
                <button onClick={() => toggleSort("timestamp")} className="flex items-center gap-1 text-[9px] text-muted-foreground font-semibold uppercase tracking-wider hover:text-foreground transition-colors">
                  Timestamp (IST)
                  <SortIcon col="timestamp" />
                </button>
              </th>
              <th className="text-left px-3 py-2 text-[9px] text-muted-foreground font-semibold uppercase tracking-wider">
                Parameter
              </th>
              <th className="text-right px-3 py-2">
                <button onClick={() => toggleSort("actual")} className="flex items-center gap-1 justify-end text-[9px] text-muted-foreground font-semibold uppercase tracking-wider hover:text-foreground transition-colors ml-auto">
                  Actual
                  <SortIcon col="actual" />
                </button>
              </th>
              <th className="text-right px-3 py-2">
                <button onClick={() => toggleSort("forecast")} className="flex items-center gap-1 justify-end text-[9px] text-muted-foreground font-semibold uppercase tracking-wider hover:text-foreground transition-colors ml-auto">
                  Forecast
                  <SortIcon col="forecast" />
                </button>
              </th>
              <th className="text-right px-3 py-2">
                <button onClick={() => toggleSort("diffPercent")} className="flex items-center gap-1 justify-end text-[9px] text-muted-foreground font-semibold uppercase tracking-wider hover:text-foreground transition-colors ml-auto">
                  Diff %
                  <SortIcon col="diffPercent" />
                </button>
              </th>
              <th className="text-center px-3 py-2">
                <button onClick={() => toggleSort("quality")} className="flex items-center gap-1 justify-center text-[9px] text-muted-foreground font-semibold uppercase tracking-wider hover:text-foreground transition-colors mx-auto">
                  Quality
                  <SortIcon col="quality" />
                </button>
              </th>
              <th className="text-left px-3 py-2 text-[9px] text-muted-foreground font-semibold uppercase tracking-wider">
                Notes
              </th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((row) => {
              const isSelected = selectedRows.has(row.id);
              const qConf = QUALITY_CONFIG[row.quality];
              const paramUnit = PARAMETERS.find((p) => p.id === row.parameter)?.unit ?? "";
              const paramLabel = PARAMETERS.find((p) => p.id === row.parameter)?.label ?? row.parameter;

              return (
                <tr
                  key={row.id}
                  className={`border-b border-border/15 transition-colors ${
                    row.quality === "missing"
                      ? "bg-destructive/3"
                      : row.quality === "suspect"
                      ? "bg-chart-4/3"
                      : isSelected
                      ? "bg-primary/5"
                      : "hover:bg-secondary/20"
                  }`}
                >
                  <td className="w-8 px-2 py-2">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleRow(row.id)}
                      className="w-3 h-3 rounded accent-primary cursor-pointer"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <span className="text-[11px] text-foreground tabular-nums font-mono">{row.timestampIST}</span>
                  </td>
                  <td className="px-3 py-2">
                    <span className="text-[11px] text-muted-foreground font-medium">{paramLabel}</span>
                  </td>
                  <td className="text-right px-3 py-2">
                    {row.actual !== null ? (
                      <span className="text-[11px] text-foreground tabular-nums font-mono">
                        {row.actual.toFixed(1)} <span className="text-muted-foreground/50">{paramUnit}</span>
                      </span>
                    ) : (
                      <span className="text-[10px] text-destructive italic">— missing —</span>
                    )}
                  </td>
                  <td className="text-right px-3 py-2">
                    <span className="text-[11px] text-muted-foreground tabular-nums font-mono">
                      {row.forecast.toFixed(1)} <span className="text-muted-foreground/30">{paramUnit}</span>
                    </span>
                  </td>
                  <td className="text-right px-3 py-2">
                    {row.diffPercent !== null ? (
                      <span className={`text-[11px] tabular-nums font-mono font-medium ${
                        Math.abs(row.diffPercent) > 15
                          ? "text-destructive"
                          : Math.abs(row.diffPercent) > 8
                          ? "text-chart-2"
                          : "text-chart-3"
                      }`}>
                        {row.diffPercent > 0 ? "+" : ""}{row.diffPercent.toFixed(1)}%
                      </span>
                    ) : (
                      <span className="text-[10px] text-muted-foreground/30">—</span>
                    )}
                  </td>
                  <td className="text-center px-3 py-2">
                    <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[8px] font-semibold uppercase ${qConf.bgColor} ${qConf.color}`}>
                      {row.quality === "good" && <CheckCircle2 className="w-2 h-2" />}
                      {row.quality === "missing" && <AlertTriangle className="w-2 h-2" />}
                      {row.quality === "suspect" && <Info className="w-2 h-2" />}
                      {qConf.label}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    {row.notes ? (
                      <span className="text-[9px] text-muted-foreground/70 italic max-w-[120px] truncate block">{row.notes}</span>
                    ) : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-4 py-2.5 border-t border-border/40 bg-secondary/10">
        <div className="text-[10px] text-muted-foreground tabular-nums">
          Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, sorted.length)} of {sorted.length.toLocaleString()}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            let pageNum: number;
            if (totalPages <= 5) pageNum = i;
            else if (page < 3) pageNum = i;
            else if (page > totalPages - 3) pageNum = totalPages - 5 + i;
            else pageNum = page - 2 + i;

            return (
              <button
                key={pageNum}
                onClick={() => setPage(pageNum)}
                className={`w-7 h-7 rounded-md text-[10px] font-medium transition-colors ${
                  page === pageNum
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                {pageNum + 1}
              </button>
            );
          })}
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
