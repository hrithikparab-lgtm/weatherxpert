import {
  ClipboardList,
  CalendarDays,
  ShieldCheck,
  Target,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
  Send,
  Download,
} from "lucide-react";
import {
  REPORT_TEMPLATES,
  AUDIT_TRAIL,
  type ReportTemplate,
} from "./reportsExportData";

/* ═══════════════════════════════════════════════════
   MOBILE REPORT LIST — Simplified mobile view
   with report list, last-run status, quick actions
   ═══════════════════════════════════════════════════ */

const TEMPLATE_ICONS: Record<string, React.ElementType> = {
  "clipboard-list": ClipboardList,
  "calendar-days": CalendarDays,
  "shield-check": ShieldCheck,
  "target": Target,
};

const STATUS_STYLES: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  success: { label: "Success", icon: CheckCircle2, color: "text-chart-3", bg: "bg-chart-3/10" },
  failed:  { label: "Failed",  icon: XCircle,      color: "text-destructive", bg: "bg-destructive/10" },
  pending: { label: "Pending", icon: Clock,        color: "text-chart-2", bg: "bg-chart-2/10" },
};

interface MobileReportListProps {
  onSelectTemplate: (id: string) => void;
  onDownloadReport: (id: string) => void;
  onSendReport: (id: string) => void;
}

export function MobileReportList({ onSelectTemplate, onDownloadReport, onSendReport }: MobileReportListProps) {
  const recentAudit = AUDIT_TRAIL.slice(0, 5);

  return (
    <div className="space-y-4">
      {/* Report templates */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border/60 bg-secondary/10">
          <h4 className="text-[12px] text-foreground font-medium">Report Templates</h4>
          <p className="text-[9px] text-muted-foreground mt-0.5">Tap to configure and send</p>
        </div>
        <div className="divide-y divide-border/15">
          {REPORT_TEMPLATES.map((tpl) => {
            const Icon = TEMPLATE_ICONS[tpl.icon] || ClipboardList;
            const statusConf = tpl.lastStatus ? STATUS_STYLES[tpl.lastStatus] : null;
            const StatusIcon = statusConf?.icon;

            return (
              <div
                key={tpl.id}
                onClick={() => onSelectTemplate(tpl.id)}
                role="button"
                tabIndex={0}
                className="w-full flex items-center gap-3 px-4 py-3 text-left active:bg-secondary/20 transition-colors cursor-pointer hover:bg-secondary/5"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    onSelectTemplate(tpl.id);
                  }
                }}
              >
                <div className="w-10 h-10 rounded-xl bg-secondary/50 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] text-foreground font-medium truncate">{tpl.name}</p>
                  <p className="text-[10px] text-muted-foreground/60 mt-0.5 truncate">{tpl.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[8px] text-muted-foreground/40 capitalize">{tpl.frequency}</span>
                    {tpl.lastRun && statusConf && StatusIcon && (
                      <span className={`flex items-center gap-0.5 text-[8px] font-medium ${statusConf.color}`}>
                        <StatusIcon className="w-2.5 h-2.5" />
                        {statusConf.label} · {tpl.lastRun.split(" ")[0]}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={(e) => { e.stopPropagation(); onDownloadReport(tpl.id); }}
                    className="p-2 rounded-lg bg-secondary/30 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onSendReport(tpl.id); }}
                    className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/15 transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent activity */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border/60 bg-secondary/10">
          <h4 className="text-[12px] text-foreground font-medium">Recent Activity</h4>
        </div>
        <div className="divide-y divide-border/15">
          {recentAudit.map((entry) => {
            const statusConf = STATUS_STYLES[entry.status] || STATUS_STYLES.pending;
            const StatusIcon = statusConf.icon;
            return (
              <div key={entry.id} className="flex items-center gap-3 px-4 py-2.5">
                <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 ${statusConf.bg}`}>
                  <StatusIcon className={`w-3 h-3 ${statusConf.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-foreground font-medium truncate">{entry.reportName}</p>
                  <p className="text-[8px] text-muted-foreground/50 tabular-nums">{entry.sentAt} · {entry.triggeredBy}</p>
                </div>
                <span className="text-[9px] text-muted-foreground/40 tabular-nums flex-shrink-0">{entry.fileSize}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
