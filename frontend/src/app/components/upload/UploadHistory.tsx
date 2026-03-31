import { useState } from "react";
import {
  History,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  ChevronDown,
  FileText,
  Search,
} from "lucide-react";
import { type UploadHistoryEntry } from "./uploadData";

/* ═══════════════════════════════════════════════════
   UPLOAD HISTORY — Version history of uploads
   with rollback option, status badges, search
   ═══════════════════════════════════════════════════ */

interface UploadHistoryProps {
  entries: UploadHistoryEntry[];
  onRollback: (id: string) => void;
}

const STATUS_CONFIG: Record<UploadHistoryEntry["status"], { label: string; icon: React.ElementType; color: string; bg: string }> = {
  committed:   { label: "Committed",   icon: CheckCircle2, color: "text-chart-3",          bg: "bg-chart-3/10" },
  rolled_back: { label: "Rolled Back", icon: RotateCcw,    color: "text-muted-foreground", bg: "bg-secondary" },
  pending:     { label: "Pending",     icon: Clock,        color: "text-chart-2",          bg: "bg-chart-2/10" },
};

export function UploadHistory({ entries, onRollback }: UploadHistoryProps) {
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(true);

  const filtered = search
    ? entries.filter(
        (e) =>
          e.filename.toLowerCase().includes(search.toLowerCase()) ||
          e.station.toLowerCase().includes(search.toLowerCase()) ||
          e.discom.toLowerCase().includes(search.toLowerCase())
      )
    : entries;

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 border-b border-border/60 bg-secondary/10 text-left"
      >
        <div className="flex items-center gap-2">
          <History className="w-3.5 h-3.5 text-chart-4" />
          <h4 className="text-[12px] text-foreground font-medium">Upload History</h4>
          <span className="text-[9px] text-muted-foreground font-medium tabular-nums px-1.5 py-0.5 rounded bg-secondary">
            {entries.length} uploads
          </span>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${expanded ? "" : "-rotate-90"}`} />
      </button>

      {expanded && (
        <>
          {/* Search */}
          <div className="px-4 py-2 border-b border-border/30">
            <div className="relative">
              <Search className="w-3 h-3 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by file, station, or DISCOM..."
                className="w-full pl-7 pr-3 py-1.5 bg-secondary/30 border border-border/40 rounded-lg text-[11px] text-foreground outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/40"
              />
            </div>
          </div>

          {/* Entries */}
          <div className="max-h-[360px] overflow-y-auto divide-y divide-border/15">
            {filtered.length === 0 ? (
              <div className="px-4 py-6 text-center">
                <History className="w-6 h-6 text-muted-foreground/20 mx-auto mb-2" />
                <p className="text-[11px] text-muted-foreground/50">No uploads match your search</p>
              </div>
            ) : (
              filtered.map((entry) => {
                const statusConf = STATUS_CONFIG[entry.status];
                const StatusIcon = statusConf.icon;

                return (
                  <div
                    key={entry.id}
                    className={`px-4 py-3 hover:bg-secondary/10 transition-colors ${
                      entry.status === "rolled_back" ? "opacity-60" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-secondary/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="text-[11px] text-foreground font-medium truncate">{entry.filename}</p>
                          <span className={`inline-flex items-center gap-0.5 text-[8px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded ${statusConf.bg} ${statusConf.color}`}>
                            <StatusIcon className="w-2 h-2" />
                            {statusConf.label}
                          </span>
                          <span className="text-[8px] text-muted-foreground/40 font-mono">v{entry.version}</span>
                        </div>

                        <div className="flex items-center gap-2 mt-0.5 text-[9px] text-muted-foreground/50 flex-wrap">
                          <span>{entry.station}</span>
                          <span>·</span>
                          <span>{entry.discom}</span>
                          <span>·</span>
                          <span className="tabular-nums">{entry.rows.toLocaleString()} rows</span>
                        </div>

                        <div className="flex items-center gap-2 mt-0.5 text-[9px] text-muted-foreground/40">
                          <span>{entry.uploadedBy}</span>
                          <span>·</span>
                          <span className="tabular-nums">{entry.uploadedAt}</span>
                          {entry.errors > 0 && (
                            <span className="text-destructive tabular-nums">{entry.errors} errors</span>
                          )}
                          {entry.warnings > 0 && (
                            <span className="text-chart-2 tabular-nums">{entry.warnings} warnings</span>
                          )}
                        </div>
                      </div>

                      {/* Rollback button */}
                      {entry.status === "committed" && (
                        <button
                          onClick={() => onRollback(entry.id)}
                          className="flex items-center gap-1 px-2 py-1 bg-secondary/40 border border-border/40 rounded-lg text-[9px] text-muted-foreground font-medium hover:text-destructive hover:bg-destructive/5 hover:border-destructive/20 transition-colors flex-shrink-0"
                          title="Rollback this upload"
                        >
                          <RotateCcw className="w-2.5 h-2.5" />
                          Rollback
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
}
