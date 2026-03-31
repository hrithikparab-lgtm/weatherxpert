import { useState, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { useRole } from "../components/RoleContext";
import { TemplateList } from "../components/reports-exports/TemplateList";
import { BuilderPanel } from "../components/reports-exports/BuilderPanel";
import { PreviewPane } from "../components/reports-exports/PreviewPane";
import { AuditTrail } from "../components/reports-exports/AuditTrail";
import { MobileReportList } from "../components/reports-exports/MobileReportList";
import {
  REPORT_TEMPLATES,
  AUDIT_TRAIL,
  type ReportFilter,
  type ScheduleConfig,
  type ExportFormat,
  type AuditEntry,
} from "../components/reports-exports/reportsExportData";
import {
  FileBarChart,
  Monitor,
  Smartphone,
  AlertTriangle,
  X,
  RefreshCw,
} from "lucide-react";

/* ═══════════════════════════════════════════════════
   REPORT BUILDER PAGE — Three-column layout
   Left: templates · Center: builder · Right: preview
   Bottom: audit trail · Mobile: simplified list
   NEW: Scheduled job failure alert, clone template,
   role-based filtering, draft watermark
   ═══════════════════════════════════════════════════ */

export function ReportBuilderPage() {
  const { can, user } = useRole();

  const canSchedule = user.role === "superadmin" || user.role === "admin";

  // Template selection
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>("tpl-daily-ops");

  // Builder state
  const [reportName, setReportName] = useState("Daily Operations Summary");
  const [activeComponents, setActiveComponents] = useState<string[]>([
    "kpi-weather-summary", "chart-temp-24h", "table-alerts-today", "kpi-station-uptime",
  ]);
  const [filters, setFilters] = useState<ReportFilter>({
    dateRange: "Last 24 hours",
    region: "All Regions",
    stations: ["All Stations"],
    providers: ["All Providers"],
  });
  const [recipients, setRecipients] = useState<string[]>([
    "operations@tatapower.com", "rajesh.k@tatapower.com",
  ]);
  const [schedule, setSchedule] = useState<ScheduleConfig>({
    frequency: "daily",
    time: "06:00",
    dayOfWeek: 1,
    dayOfMonth: 1,
    timezone: "Asia/Kolkata",
    enabled: true,
  });
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>("pdf");
  const [isSending, setIsSending] = useState(false);

  // Audit trail
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>(AUDIT_TRAIL);

  // NEW: Failure alert dismissal
  const [dismissedFailures, setDismissedFailures] = useState<Set<string>>(new Set());

  // NEW: Check for failed scheduled reports
  const failedScheduledReports = useMemo(() => {
    return REPORT_TEMPLATES.filter((tpl) => tpl.lastStatus === "failed" && !dismissedFailures.has(tpl.id));
  }, [dismissedFailures]);

  const handleDismissFailure = useCallback((id: string) => {
    setDismissedFailures((prev) => new Set(prev).add(id));
  }, []);

  const handleRetryFailed = useCallback((id: string) => {
    toast.success(`Retrying failed report...`, {
      description: `Attempting to resend ${REPORT_TEMPLATES.find((t) => t.id === id)?.name}`,
    });
    handleDismissFailure(id);
  }, [handleDismissFailure]);

  // ── Select template → load defaults ──
  const handleSelectTemplate = useCallback((id: string) => {
    const tpl = REPORT_TEMPLATES.find((t) => t.id === id);
    if (!tpl) return;
    setSelectedTemplate(id);
    setReportName(tpl.name);
    setActiveComponents([...tpl.defaultComponents]);
    setSchedule((prev) => ({ ...prev, frequency: tpl.frequency }));
    toast.info(`Loaded template: ${tpl.name}`);
  }, []);

  // ── Create new (blank) ──
  const handleCreateNew = useCallback(() => {
    setSelectedTemplate(null);
    setReportName("");
    setActiveComponents([]);
    setRecipients([]);
    setSchedule((prev) => ({ ...prev, enabled: false }));
    toast.info("Starting blank report");
  }, []);

  // NEW: Clone template
  const handleCloneTemplate = useCallback((id: string) => {
    const tpl = REPORT_TEMPLATES.find((t) => t.id === id);
    if (!tpl) return;
    setSelectedTemplate(null); // Deselect to indicate it's a new copy
    setReportName(`${tpl.name} (Copy)`);
    setActiveComponents([...tpl.defaultComponents]);
    setSchedule((prev) => ({ ...prev, frequency: tpl.frequency, enabled: false }));
    toast.success(`Cloned template: ${tpl.name}`, {
      description: "Customize and save as a new report",
    });
  }, []);

  // ── Component management ──
  const handleAddComponent = useCallback((id: string) => {
    setActiveComponents((prev) => {
      if (prev.includes(id)) return prev;
      return [...prev, id];
    });
  }, []);

  const handleRemoveComponent = useCallback((id: string) => {
    setActiveComponents((prev) => prev.filter((c) => c !== id));
  }, []);

  const handleReorderComponent = useCallback((id: string, dir: "up" | "down") => {
    setActiveComponents((prev) => {
      const idx = prev.indexOf(id);
      if (idx === -1) return prev;
      const next = [...prev];
      const target = dir === "up" ? idx - 1 : idx + 1;
      if (target < 0 || target >= next.length) return prev;
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  }, []);

  // ── Download ──
  const handleDownload = useCallback(() => {
    toast.success(`Report downloaded as ${selectedFormat.toUpperCase()}`, {
      description: `${reportName || "Untitled Report"} · ${activeComponents.length} sections`,
    });
  }, [selectedFormat, reportName, activeComponents.length]);

  // ── Send now ──
  const handleSendNow = useCallback(() => {
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);

      const newEntry: AuditEntry = {
        id: `aud-${Date.now()}`,
        reportName: reportName || "Untitled Report",
        templateId: selectedTemplate || "custom",
        triggeredBy: "manual",
        sentTo: [...recipients],
        sentAt: new Date().toLocaleString("en-IN", {
          year: "numeric", month: "2-digit", day: "2-digit",
          hour: "2-digit", minute: "2-digit", hour12: false,
        }),
        status: "delivered",
        format: selectedFormat,
        fileSize: `${(1.5 + Math.random() * 3).toFixed(1)} MB`,
        duration: `${Math.round(5 + Math.random() * 20)}s`,
      };

      setAuditEntries((prev) => [newEntry, ...prev]);

      toast.success("Report sent successfully!", {
        description: `Delivered to ${recipients.length} recipient${recipients.length > 1 ? "s" : ""}`,
      });
    }, 2000);
  }, [reportName, selectedTemplate, recipients, selectedFormat]);

  // ── Resend failed ──
  const handleResend = useCallback((id: string) => {
    setAuditEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status: "delivered" as const, errorMessage: undefined } : e))
    );
    toast.success("Report re-sent successfully");
  }, []);

  // ── Mobile handlers ──
  const handleMobileDownload = useCallback((id: string) => {
    const tpl = REPORT_TEMPLATES.find((t) => t.id === id);
    toast.success(`Downloading ${tpl?.name || "report"}...`);
  }, []);

  const handleMobileSend = useCallback((id: string) => {
    const tpl = REPORT_TEMPLATES.find((t) => t.id === id);
    toast.success(`Sending ${tpl?.name || "report"}...`);
  }, []);

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-[1600px] animate-in fade-in duration-500">

      {/* ═══ PAGE HEADER ═══ */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary/10 ring-1 ring-primary/20 flex items-center justify-center">
            <FileBarChart className="w-4.5 h-4.5 text-primary" />
          </div>
          <div>
            <h1 className="text-foreground">Reports & Exports</h1>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Build, schedule, and distribute automated reports
            </p>
          </div>
        </div>

        {/* Desktop / Mobile indicator */}
        <div className="hidden lg:flex items-center gap-1.5">
          <div className="flex items-center gap-1 px-2 py-1 bg-primary/8 text-primary rounded-lg text-[9px] font-medium">
            <Monitor className="w-3 h-3" />
            Builder Mode
          </div>
        </div>
        <div className="lg:hidden flex items-center gap-1.5">
          <div className="flex items-center gap-1 px-2 py-1 bg-secondary text-muted-foreground rounded-lg text-[9px] font-medium">
            <Smartphone className="w-3 h-3" />
            List View
          </div>
        </div>
      </div>

      {/* ═══ NEW: SCHEDULED JOB FAILURE ALERT ═══ */}
      {failedScheduledReports.length > 0 && (
        <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
          {failedScheduledReports.map((tpl) => (
            <div
              key={tpl.id}
              className="flex items-start gap-3 px-4 py-3 rounded-xl bg-destructive/5 border border-destructive/20"
            >
              <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-[12px] text-foreground font-medium">
                  Scheduled Report Failed: {tpl.name}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Last run: {tpl.lastRun} · Check audit trail for details and retry delivery
                </p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => handleRetryFailed(tpl.id)}
                  className="p-1.5 rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive transition-colors"
                  title="Retry failed report"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDismissFailure(tpl.id)}
                  className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                  title="Dismiss alert"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ═══ MOBILE VIEW ═══ */}
      <div className="lg:hidden">
        <MobileReportList
          onSelectTemplate={handleSelectTemplate}
          onDownloadReport={handleMobileDownload}
          onSendReport={handleMobileSend}
        />
      </div>

      {/* ═══ DESKTOP 3-COLUMN BUILDER ═══ */}
      <div className="hidden lg:grid lg:grid-cols-12 gap-4" style={{ minHeight: "520px" }}>
        {/* LEFT: Template list — 3 cols */}
        <div className="col-span-3">
          <TemplateList
            selectedTemplate={selectedTemplate}
            onSelectTemplate={handleSelectTemplate}
            onCreateNew={handleCreateNew}
            userRole={user.role}
            onCloneTemplate={handleCloneTemplate}
          />
        </div>

        {/* CENTER: Builder panel — 5 cols */}
        <div className="col-span-5">
          <BuilderPanel
            activeComponents={activeComponents}
            onAddComponent={handleAddComponent}
            onRemoveComponent={handleRemoveComponent}
            onReorderComponent={handleReorderComponent}
            filters={filters}
            onUpdateFilters={setFilters}
            recipients={recipients}
            onUpdateRecipients={setRecipients}
            schedule={schedule}
            onUpdateSchedule={setSchedule}
            canSchedule={canSchedule}
            reportName={reportName}
            onUpdateName={setReportName}
          />
        </div>

        {/* RIGHT: Preview pane — 4 cols */}
        <div className="col-span-4">
          <PreviewPane
            reportName={reportName}
            activeComponents={activeComponents}
            selectedFormat={selectedFormat}
            onSelectFormat={setSelectedFormat}
            onDownload={handleDownload}
            onSendNow={handleSendNow}
            schedule={schedule}
            region={filters.region}
            dateRange={filters.dateRange}
            recipientCount={recipients.length}
            isSending={isSending}
            isDraft={!selectedTemplate || activeComponents.length === 0}
          />
        </div>
      </div>

      {/* ═══ AUDIT TRAIL ═══ */}
      <AuditTrail entries={auditEntries} onResend={handleResend} />
    </div>
  );
}