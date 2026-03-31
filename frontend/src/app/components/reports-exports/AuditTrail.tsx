import { useState } from "react";
import {
  History,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronDown,
  Search,
  Send,
  Calendar,
  RefreshCw,
  Mail,
  FileText,
  FileSpreadsheet,
  FileJson,
  Presentation,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  type AuditEntry,
  type ExportFormat,
} from "./reportsExportData";

/* ═══════════════════════════════════════════════════
   AUDIT TRAIL — Sent report history with status,
   recipients, re-send option, search, email open tracking
   ═══════════════════════════════════════════════════ */

const STATUS_CONFIG: Record<AuditEntry["status"], { label: string; icon: React.ElementType; color: string; bg: string }> = {
  delivered: { label: "Delivered", icon: CheckCircle2, color: "text-chart-3",          bg: "bg-chart-3/10" },
  failed:    { label: "Failed",   icon: XCircle,      color: "text-destructive",      bg: "bg-destructive/10" },
  pending:   { label: "Pending",  icon: Clock,        color: "text-chart-2",          bg: "bg-chart-2/10" },
};

const FORMAT_ICONS: Record<ExportFormat, React.ElementType> = {
  pdf: FileText, xlsx: FileSpreadsheet, csv: FileJson, pptx: Presentation,
};

interface AuditTrailProps {
  entries: AuditEntry[];
  onResend: (id: string) => void;
}

export function AuditTrail({ entries, onResend }: AuditTrailProps) {
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(true);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const filtered = search
    ? entries.filter(
        (e) =>
          e.reportName.toLowerCase().includes(search.toLowerCase()) ||
          e.sentTo.some((r) => r.includes(search.toLowerCase()))
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
          <h4 className="text-[12px] text-foreground font-medium">Report Audit Trail</h4>
          <span className="text-[9px] text-muted-foreground font-medium tabular-nums px-1.5 py-0.5 rounded bg-secondary">
            {entries.length} reports
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
                placeholder="Search by report name or recipient..."
                className="w-full pl-7 pr-3 py-1.5 bg-secondary/30 border border-border/40 rounded-lg text-[11px] text-foreground outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/40"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="bg-secondary/20 border-b border-border/40">
                  <th className="text-left px-4 py-2 text-[9px] text-muted-foreground font-semibold uppercase tracking-wider">Report</th>
                  <th className="text-left px-3 py-2 text-[9px] text-muted-foreground font-semibold uppercase tracking-wider">Trigger</th>
                  <th className="text-left px-3 py-2 text-[9px] text-muted-foreground font-semibold uppercase tracking-wider">Sent At</th>
                  <th className="text-left px-3 py-2 text-[9px] text-muted-foreground font-semibold uppercase tracking-wider">Status</th>
                  <th className="text-left px-3 py-2 text-[9px] text-muted-foreground font-semibold uppercase tracking-wider">Format</th>
                  <th className="text-right px-3 py-2 text-[9px] text-muted-foreground font-semibold uppercase tracking-wider">Size</th>
                  <th className="text-right px-3 py-2 text-[9px] text-muted-foreground font-semibold uppercase tracking-wider">Duration</th>
                  <th className="w-10 px-3 py-2" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((entry) => {
                  const statusConf = STATUS_CONFIG[entry.status];
                  const StatusIcon = statusConf.icon;
                  const FormatIcon = FORMAT_ICONS[entry.format];
                  const isExpanded = expandedRow === entry.id;

                  const rows = [
                    <tr
                      key={entry.id}
                      className={`border-b border-border/10 transition-colors cursor-pointer ${
                        isExpanded ? "bg-primary/3" : "hover:bg-secondary/10"
                      }`}
                      onClick={() => setExpandedRow(isExpanded ? null : entry.id)}
                    >
                      <td className="px-4 py-2.5">
                        <p className="text-[11px] text-foreground font-medium truncate max-w-[180px]">{entry.reportName}</p>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className={`inline-flex items-center gap-0.5 text-[9px] font-medium px-1.5 py-0.5 rounded ${
                          entry.triggeredBy === "schedule"
                            ? "bg-primary/8 text-primary"
                            : "bg-secondary text-muted-foreground"
                        }`}>
                          {entry.triggeredBy === "schedule" ? <Clock className="w-2 h-2" /> : <Send className="w-2 h-2" />}
                          {entry.triggeredBy}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="text-[10px] text-foreground tabular-nums">{entry.sentAt}</span>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className={`inline-flex items-center gap-0.5 text-[9px] font-semibold px-1.5 py-0.5 rounded ${statusConf.bg} ${statusConf.color}`}>
                          <StatusIcon className="w-2.5 h-2.5" />
                          {statusConf.label}
                        </span>
                        {/* Email open tracking indicator */}
                        {entry.status === "delivered" && entry.emailTracking && (
                          <div className="mt-0.5">
                            <span className={`inline-flex items-center gap-0.5 text-[8px] px-1.5 py-0.5 rounded ${
                              entry.emailTracking.opens > 0 
                                ? "bg-primary/10 text-primary" 
                                : "bg-secondary text-muted-foreground"
                            }`}>
                              {entry.emailTracking.opens > 0 ? (
                                <Eye className="w-2 h-2" />
                              ) : (
                                <EyeOff className="w-2 h-2" />
                              )}
                              {entry.emailTracking.opens > 0 
                                ? `${entry.emailTracking.opens} open${entry.emailTracking.opens > 1 ? "s" : ""}` 
                                : "Not opened"}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="inline-flex items-center gap-0.5 text-[9px] text-muted-foreground">
                          <FormatIcon className="w-2.5 h-2.5" />
                          {entry.format.toUpperCase()}
                        </span>
                      </td>
                      <td className="text-right px-3 py-2.5">
                        <span className="text-[10px] text-foreground tabular-nums">{entry.fileSize}</span>
                      </td>
                      <td className="text-right px-3 py-2.5">
                        <span className="text-[10px] text-muted-foreground tabular-nums">{entry.duration}</span>
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        {entry.status === "failed" && (
                          <button
                            onClick={(e) => { e.stopPropagation(); onResend(entry.id); }}
                            className="p-1 rounded text-destructive hover:bg-destructive/10 transition-colors"
                            title="Retry sending"
                          >
                            <RefreshCw className="w-3 h-3" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ];

                  if (isExpanded) {
                    rows.push(
                      <tr key={`${entry.id}-detail`} className="bg-secondary/5">
                        <td colSpan={8} className="px-4 py-3">
                          <div className="flex flex-wrap gap-4 animate-in slide-in-from-top-1 duration-150">
                            <div>
                              <p className="text-[8px] text-muted-foreground/50 uppercase tracking-wider font-semibold mb-0.5">Recipients</p>
                              <div className="space-y-0.5">
                                {entry.emailTracking ? (
                                  entry.emailTracking.recipients.map((r) => (
                                    <div key={r.email} className="flex items-center gap-1.5">
                                      <Mail className="w-2 h-2 text-muted-foreground/30" />
                                      <span className="text-[9px] text-foreground font-mono">{r.email}</span>
                                      {r.opened ? (
                                        <span className="inline-flex items-center gap-0.5 text-[7px] px-1 py-0.5 rounded bg-chart-3/10 text-chart-3">
                                          <Eye className="w-2 h-2" />
                                          {r.openedAt && <span className="tabular-nums">{r.openedAt.split(" ")[1]}</span>}
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center gap-0.5 text-[7px] px-1 py-0.5 rounded bg-secondary text-muted-foreground">
                                          <EyeOff className="w-2 h-2" />
                                        </span>
                                      )}
                                    </div>
                                  ))
                                ) : (
                                  entry.sentTo.map((r) => (
                                    <div key={r} className="flex items-center gap-1">
                                      <Mail className="w-2 h-2 text-muted-foreground/30" />
                                      <span className="text-[9px] text-foreground font-mono">{r}</span>
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>
                            {entry.errorMessage && (
                              <div>
                                <p className="text-[8px] text-muted-foreground/50 uppercase tracking-wider font-semibold mb-0.5">Error</p>
                                <p className="text-[9px] text-destructive">{entry.errorMessage}</p>
                              </div>
                            )}
                            {entry.emailTracking && entry.emailTracking.lastOpened && (
                              <div>
                                <p className="text-[8px] text-muted-foreground/50 uppercase tracking-wider font-semibold mb-0.5">Last Opened</p>
                                <p className="text-[9px] text-foreground tabular-nums">{entry.emailTracking.lastOpened}</p>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  }

                  return rows;
                })}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <div className="px-4 py-6 text-center">
              <History className="w-6 h-6 text-muted-foreground/15 mx-auto mb-2" />
              <p className="text-[11px] text-muted-foreground/40">No matching audit entries</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}