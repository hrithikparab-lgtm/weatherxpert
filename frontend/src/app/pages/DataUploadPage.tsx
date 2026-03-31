import { useState, useCallback, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { useRole } from "../components/RoleContext";
import { TemplateDownload } from "../components/upload/TemplateDownload";
import { DropZone } from "../components/upload/DropZone";
import { PreviewTable } from "../components/upload/PreviewTable";
import { ValidationSummary } from "../components/upload/ValidationSummary";
import { UploadHistory } from "../components/upload/UploadHistory";
import {
  generateMockParsedData,
  suggestMapping,
  validateData,
  DISCOMS,
  STATIONS,
  UPLOAD_HISTORY,
  type UploadStage,
  type ColumnMapping,
  type ParsedRow,
  type ValidationIssue,
  type UploadHistoryEntry,
} from "../components/upload/uploadData";
import {
  Upload,
  CheckCircle2,
  X,
  RotateCcw,
  ChevronDown,
  Building2,
  Radio,
  Info,
  Shield,
  Trash2,
  AlertTriangle,
  FileCheck,
  FileDiff,
  History,
  Eye,
  Hash,
  TrendingUp,
  TrendingDown,
  Minus,
  Plus,
  Clock,
} from "lucide-react";

/* ═══════════════════════════════════════════════════
   DATA UPLOAD PAGE — Manual data ingestion
   Templates · Drag-drop · Column mapping · Validation
   Commit/Discard · History · Rollback · Toasts
   Enhanced: Duplicate Detection · Diff Preview · 
   Upload Impact · Rollback · Audit Trail · Checksum Validation
   ═══════════════════════════════════════════════════ */

export function DataUploadPage() {
  const { can } = useRole();

  // Upload state machine
  const [stage, setStage] = useState<UploadStage>("idle");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [acceptedFile, setAcceptedFile] = useState<File | null>(null);

  // Parsed data
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [mappings, setMappings] = useState<ColumnMapping[]>([]);

  // Validation
  const [validationIssues, setValidationIssues] = useState<ValidationIssue[]>([]);
  const [isValidating, setIsValidating] = useState(false);

  // Assignment
  const [selectedDiscom, setSelectedDiscom] = useState(DISCOMS[0]);
  const [selectedStation, setSelectedStation] = useState(STATIONS[DISCOMS[0]][0]);

  // History
  const [history, setHistory] = useState<UploadHistoryEntry[]>(UPLOAD_HISTORY);

  // Mobile
  const [mobileTemplatesOpen, setMobileTemplatesOpen] = useState(false);

  // ── NEW: Enhanced Features ──
  // File checksum (auto-calculated on upload)
  const [fileChecksum, setFileChecksum] = useState<string | null>(null);
  
  // Duplicate file detection
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [duplicateInfo, setDuplicateInfo] = useState<{uploadedAt: string; uploadedBy: string} | null>(null);
  
  // Diff preview mode
  const [showDiffPreview, setShowDiffPreview] = useState(false);
  
  // Upload impact summary
  const [uploadImpact, setUploadImpact] = useState<{added: number; updated: number; deleted: number; unchanged: number} | null>(null);
  
  // Audit trail
  const [auditTrail, setAuditTrail] = useState<Array<{timestamp: string; action: string; user: string; details: string}>>([]);

  const availableStations = useMemo(
    () => STATIONS[selectedDiscom] ?? [],
    [selectedDiscom]
  );

  // ── File accepted → simulate parsing ──
  const handleFileAccepted = useCallback((file: File) => {
    setAcceptedFile(file);
    setStage("uploading");
    setUploadProgress(0);

    // ── NEW: Calculate file checksum (mock) ──
    const mockChecksum = `sha256:${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`.toUpperCase();
    setFileChecksum(mockChecksum);
    
    // ── NEW: Check for duplicates (mock) ──
    const isDuplicateFile = Math.random() > 0.7; // 30% chance of duplicate
    setIsDuplicate(isDuplicateFile);
    if (isDuplicateFile) {
      setDuplicateInfo({
        uploadedAt: "2026-02-14 10:32 AM",
        uploadedBy: "Rajesh Kumar"
      });
      toast.warning("Duplicate file detected", {
        description: "This file was previously uploaded on 2026-02-14"
      });
    } else {
      setDuplicateInfo(null);
    }
    
    // ── NEW: Calculate upload impact (mock) ──
    const added = Math.floor(Math.random() * 50) + 20;
    const updated = Math.floor(Math.random() * 30) + 10;
    const deleted = Math.floor(Math.random() * 5);
    const unchanged = Math.floor(Math.random() * 100) + 50;
    setUploadImpact({ added, updated, deleted, unchanged });
    
    // ── NEW: Add audit trail entry ──
    const newAuditEntry = {
      timestamp: new Date().toLocaleString("en-IN", { hour12: false }),
      action: "File Upload Started",
      user: "Current User",
      details: `Uploading ${file.name} (${(file.size / 1024).toFixed(1)} KB)`
    };
    setAuditTrail(prev => [newAuditEntry, ...prev]);

    // Simulate upload + parse progress
    const timer = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          // Generate mock parsed data
          const { headers: h, rows: r } = generateMockParsedData();
          setHeaders(h);
          setRows(r);
          setMappings(suggestMapping(h));
          setStage("preview");
          
          // ── NEW: Add audit entry for parse success ──
          setAuditTrail(prev => [{
            timestamp: new Date().toLocaleString("en-IN", { hour12: false }),
            action: "File Parsed Successfully",
            user: "System",
            details: `${r.length} rows and ${h.length} columns detected`
          }, ...prev]);
          
          toast.success("File parsed successfully", {
            description: `${r.length} rows and ${h.length} columns detected`,
          });
          return 100;
        }
        return prev + 8 + Math.random() * 12;
      });
    }, 120);
  }, []);

  // ── Update column mapping ──
  const handleUpdateMapping = useCallback((sourceColumn: string, targetField: string | null) => {
    setMappings((prev) =>
      prev.map((m) =>
        m.sourceColumn === sourceColumn ? { ...m, targetField } : m
      )
    );
  }, []);

  // ── Validate ──
  const handleValidate = useCallback(() => {
    setIsValidating(true);
    setStage("validating");

    // Simulate validation delay
    setTimeout(() => {
      const issues = validateData(rows, mappings);
      setValidationIssues(issues);
      setIsValidating(false);

      const errors = issues.filter((i) => i.type === "error").length;
      const warnings = issues.filter((i) => i.type === "warning").length;

      if (errors > 0) {
        toast.error(`Validation failed — ${errors} error${errors > 1 ? "s" : ""} found`, {
          description: "Fix the errors before committing",
        });
      } else if (warnings > 0) {
        toast.warning(`Passed with ${warnings} warning${warnings > 1 ? "s" : ""}`, {
          description: "Data can be committed, but review warnings",
        });
      } else {
        toast.success("All validations passed", {
          description: "Data is ready to commit",
        });
      }
    }, 1500);
  }, [rows, mappings]);

  // ── Commit ──
  const handleCommit = useCallback(() => {
    const errors = validationIssues.filter((i) => i.type === "error").length;
    if (errors > 0) {
      toast.error("Cannot commit — resolve all errors first");
      return;
    }

    setStage("committed");

    const newEntry: UploadHistoryEntry = {
      id: `upl-${Date.now()}`,
      filename: acceptedFile?.name ?? "upload.csv",
      uploadedAt: new Date().toLocaleString("en-IN", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false }),
      uploadedBy: "Current User",
      rows: rows.length,
      station: selectedStation,
      discom: selectedDiscom,
      status: "committed",
      version: 1,
      errors: 0,
      warnings: validationIssues.filter((i) => i.type === "warning").length,
    };

    setHistory((prev) => [newEntry, ...prev]);

    toast.success("Data committed successfully!", {
      description: `${rows.length} rows uploaded to ${selectedStation}`,
      action: {
        label: "Undo",
        onClick: () => {
          setHistory((prev) =>
            prev.map((e) => (e.id === newEntry.id ? { ...e, status: "rolled_back" as const } : e))
          );
          toast.info("Upload rolled back");
        },
      },
      duration: 8000,
    });
  }, [validationIssues, acceptedFile, rows, selectedStation, selectedDiscom]);

  // ── Discard ──
  const handleDiscard = useCallback(() => {
    setStage("idle");
    setAcceptedFile(null);
    setHeaders([]);
    setRows([]);
    setMappings([]);
    setValidationIssues([]);
    setUploadProgress(0);
    toast.info("Upload discarded");
  }, []);

  // ── Clear file ──
  const handleClearFile = useCallback(() => {
    setAcceptedFile(null);
    setStage("idle");
    setHeaders([]);
    setRows([]);
    setMappings([]);
    setValidationIssues([]);
    setUploadProgress(0);
  }, []);

  // ── Rollback history entry ──
  const handleRollback = useCallback((id: string) => {
    setHistory((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status: "rolled_back" as const } : e))
    );
    toast.success("Upload rolled back successfully", {
      description: "Data has been reverted to the previous version",
    });
  }, []);

  // ── DISCOM change resets station ──
  useEffect(() => {
    const stations = STATIONS[selectedDiscom] ?? [];
    if (stations.length > 0 && !stations.includes(selectedStation)) {
      setSelectedStation(stations[0]);
    }
  }, [selectedDiscom]);

  const hasBlockingErrors = validationIssues.filter((i) => i.type === "error").length > 0;
  const isPreviewOrLater = stage === "preview" || stage === "validating" || stage === "committed";

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-[1400px] animate-in fade-in duration-500">

      {/* ═══ PAGE HEADER ═══ */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary/10 ring-1 ring-primary/20 flex items-center justify-center">
            <Upload className="w-4.5 h-4.5 text-primary" />
          </div>
          <div>
            <h1 className="text-foreground">Manual Data Upload</h1>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Upload station observations, forecasts, and verification data
            </p>
          </div>
        </div>

        {/* Stage indicator */}
        <div className="flex items-center gap-1.5">
          {(["idle", "uploading", "preview", "validating", "committed"] as UploadStage[]).map((s, idx) => {
            const labels = ["Upload", "Parse", "Map & Preview", "Validate", "Commit"];
            const isActive = s === stage;
            const isPast = (["idle", "uploading", "preview", "validating", "committed"] as UploadStage[]).indexOf(stage) > idx;
            return (
              <div key={s} className="flex items-center gap-1.5">
                {idx > 0 && <div className={`w-4 h-px ${isPast ? "bg-chart-3" : "bg-border"}`} />}
                <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-[9px] font-medium transition-all ${
                  isActive
                    ? "bg-primary/10 text-primary ring-1 ring-primary/20"
                    : isPast
                    ? "text-chart-3 bg-chart-3/8"
                    : "text-muted-foreground/40 bg-secondary/30"
                }`}>
                  {isPast && <CheckCircle2 className="w-2.5 h-2.5" />}
                  <span className="hidden sm:inline">{labels[idx]}</span>
                  <span className="sm:hidden">{idx + 1}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ═══ COMMITTED SUCCESS STATE ═══ */}
      {stage === "committed" && (
        <div className="rounded-xl border border-chart-3/20 bg-chart-3/3 p-6 text-center animate-in fade-in zoom-in-95 duration-300">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-chart-3/10 flex items-center justify-center mb-3">
            <CheckCircle2 className="w-7 h-7 text-chart-3" />
          </div>
          <h3 className="text-[16px] text-foreground font-medium mb-1">Data Committed Successfully</h3>
          <p className="text-[12px] text-muted-foreground mb-4">
            {rows.length} rows uploaded to <strong>{selectedStation}</strong> ({selectedDiscom})
          </p>
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={handleDiscard}
              className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-[12px] font-medium hover:bg-primary/90 transition-colors shadow-sm"
            >
              <Upload className="w-3.5 h-3.5" />
              Upload Another
            </button>
          </div>
        </div>
      )}

      {/* ═══ MAIN CONTENT (pre-commit) ═══ */}
      {stage !== "committed" && (
        <>
          {/* ── Assignment bar ── */}
          <div className="flex flex-col sm:flex-row gap-3 p-4 rounded-xl border border-border bg-card">
            <div className="flex items-center gap-2 flex-1">
              <Building2 className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
              <div className="flex-1">
                <label className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider block mb-0.5">DISCOM</label>
                <select
                  value={selectedDiscom}
                  onChange={(e) => setSelectedDiscom(e.target.value)}
                  className="w-full bg-secondary/40 border border-border rounded-lg px-2.5 py-1.5 text-[11px] text-foreground font-medium outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                >
                  {DISCOMS.map((d) => (
                    <option key={d} value={d} className="bg-popover">{d}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-1">
              <Radio className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
              <div className="flex-1">
                <label className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider block mb-0.5">Station</label>
                <select
                  value={selectedStation}
                  onChange={(e) => setSelectedStation(e.target.value)}
                  className="w-full bg-secondary/40 border border-border rounded-lg px-2.5 py-1.5 text-[11px] text-foreground font-medium outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                >
                  {availableStations.map((s) => (
                    <option key={s} value={s} className="bg-popover">{s}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-center gap-1.5 sm:self-end">
              <Shield className="w-3 h-3 text-muted-foreground/30" />
              <p className="text-[8px] text-muted-foreground/30">Data will be assigned to selected station</p>
            </div>
          </div>

          {/* ── Two-column layout: templates + upload ── */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {/* LEFT: Templates (desktop) */}
            <div className="hidden lg:block lg:col-span-2">
              <TemplateDownload />
            </div>

            {/* Mobile template toggle */}
            <div className="lg:hidden">
              <button
                onClick={() => setMobileTemplatesOpen(!mobileTemplatesOpen)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-border bg-card text-left"
              >
                <span className="text-[12px] text-foreground font-medium">Download Templates</span>
                <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${mobileTemplatesOpen ? "rotate-180" : ""}`} />
              </button>
              {mobileTemplatesOpen && (
                <div className="mt-2 animate-in slide-in-from-top-1 duration-150">
                  <TemplateDownload collapsed />
                </div>
              )}
            </div>

            {/* RIGHT: Drop zone */}
            <div className="lg:col-span-3">
              <DropZone
                onFileAccepted={handleFileAccepted}
                isUploading={stage === "uploading"}
                uploadProgress={Math.min(uploadProgress, 100)}
                acceptedFile={acceptedFile}
                onClear={handleClearFile}
                isMobile={false}
              />
            </div>
          </div>

          {/* ═══ NEW: Enhanced Upload Intelligence Panels ═══ */}
          {isPreviewOrLater && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {/* 1. File Checksum Validation */}
              {fileChecksum && (
                <div className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Hash className="w-3.5 h-3.5 text-chart-3" />
                    <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">File Checksum</span>
                  </div>
                  <div className="px-2 py-1.5 rounded-md bg-secondary/40 border border-border">
                    <code className="text-[9px] text-foreground font-mono break-all leading-relaxed">
                      {fileChecksum}
                    </code>
                  </div>
                  <div className="flex items-center gap-1.5 mt-2">
                    <CheckCircle2 className="w-3 h-3 text-chart-3" />
                    <span className="text-[9px] text-chart-3 font-medium">Verified</span>
                  </div>
                </div>
              )}

              {/* 2. Duplicate File Detection */}
              {isDuplicate && duplicateInfo ? (
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Duplicate Detected</span>
                  </div>
                  <p className="text-[11px] text-foreground font-medium mb-1">
                    File previously uploaded
                  </p>
                  <div className="space-y-1">
                    <p className="text-[9px] text-muted-foreground">
                      <span className="font-semibold">Date:</span> {duplicateInfo.uploadedAt}
                    </p>
                    <p className="text-[9px] text-muted-foreground">
                      <span className="font-semibold">By:</span> {duplicateInfo.uploadedBy}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FileCheck className="w-3.5 h-3.5 text-chart-3" />
                    <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Duplicate Check</span>
                  </div>
                  <p className="text-[11px] text-chart-3 font-medium mb-1">
                    No duplicates found
                  </p>
                  <p className="text-[9px] text-muted-foreground">
                    This is a unique upload
                  </p>
                </div>
              )}

              {/* 3. Upload Impact Summary */}
              {uploadImpact && (
                <div className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <FileDiff className="w-3.5 h-3.5 text-primary" />
                    <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Upload Impact</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-1.5">
                      <Plus className="w-3 h-3 text-chart-3" />
                      <span className="text-[10px] text-muted-foreground">Added:</span>
                      <span className="text-[11px] text-chart-3 font-semibold tabular-nums">{uploadImpact.added}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <TrendingUp className="w-3 h-3 text-chart-1" />
                      <span className="text-[10px] text-muted-foreground">Updated:</span>
                      <span className="text-[11px] text-chart-1 font-semibold tabular-nums">{uploadImpact.updated}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Minus className="w-3 h-3 text-destructive" />
                      <span className="text-[10px] text-muted-foreground">Deleted:</span>
                      <span className="text-[11px] text-destructive font-semibold tabular-nums">{uploadImpact.deleted}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Minus className="w-3 h-3 text-muted-foreground/50" />
                      <span className="text-[10px] text-muted-foreground">Unchanged:</span>
                      <span className="text-[11px] text-muted-foreground font-semibold tabular-nums">{uploadImpact.unchanged}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ═══ NEW: Diff Preview Mode & Audit Trail ═══ */}
          {isPreviewOrLater && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Diff Preview Mode */}
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border/60 bg-secondary/10">
                  <div className="flex items-center gap-2">
                    <FileDiff className="w-4 h-4 text-primary" />
                    <h3 className="text-[12px] text-foreground font-medium">Diff Preview (Before vs After)</h3>
                  </div>
                  <button
                    onClick={() => setShowDiffPreview(!showDiffPreview)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20 text-[10px] font-medium hover:bg-primary/20 transition-colors"
                  >
                    <Eye className="w-3 h-3" />
                    {showDiffPreview ? "Hide" : "Show"} Diff
                  </button>
                </div>
                {showDiffPreview ? (
                  <div className="p-4 space-y-2 max-h-[280px] overflow-y-auto">
                    {/* Mock diff data */}
                    {[
                      { row: 5, field: "temperature", before: "32.5", after: "33.2", type: "update" as const },
                      { row: 12, field: "humidity", before: "78", after: "75", type: "update" as const },
                      { row: 18, field: "wind_speed", before: null, after: "14.2", type: "add" as const },
                      { row: 24, field: "pressure", before: "1013", after: null, type: "delete" as const },
                      { row: 31, field: "rainfall", before: "0.0", after: "2.5", type: "update" as const },
                    ].map((diff, idx) => (
                      <div key={idx} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/30 border border-border/40">
                        <span className="text-[9px] text-muted-foreground font-mono tabular-nums">Row {diff.row}</span>
                        <span className="text-[9px] text-muted-foreground font-medium">{diff.field}:</span>
                        {diff.type === "update" && (
                          <>
                            <span className="text-[9px] text-destructive line-through font-mono">{diff.before}</span>
                            <span className="text-[9px] text-muted-foreground">→</span>
                            <span className="text-[9px] text-chart-3 font-mono font-semibold">{diff.after}</span>
                          </>
                        )}
                        {diff.type === "add" && (
                          <span className="text-[9px] text-chart-3 font-mono font-semibold">+{diff.after}</span>
                        )}
                        {diff.type === "delete" && (
                          <span className="text-[9px] text-destructive line-through font-mono">−{diff.before}</span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <Eye className="w-6 h-6 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-[11px] text-muted-foreground/60">Click "Show Diff" to preview changes</p>
                  </div>
                )}
              </div>

              {/* Upload Audit Trail */}
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border/60 bg-secondary/10">
                  <div className="flex items-center gap-2">
                    <History className="w-4 h-4 text-primary" />
                    <h3 className="text-[12px] text-foreground font-medium">Upload Audit Trail</h3>
                  </div>
                  <span className="text-[9px] text-muted-foreground font-medium px-2 py-0.5 rounded bg-secondary tabular-nums">
                    {auditTrail.length} events
                  </span>
                </div>
                <div className="p-4 space-y-2 max-h-[280px] overflow-y-auto">
                  {auditTrail.length > 0 ? (
                    auditTrail.map((entry, idx) => (
                      <div key={idx} className="flex gap-2.5 px-3 py-2 rounded-lg bg-secondary/20 border border-border/30">
                        <div className="flex-shrink-0 pt-0.5">
                          <Clock className="w-3 h-3 text-muted-foreground/50" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[10px] text-foreground font-medium">{entry.action}</span>
                            <span className="text-[8px] text-muted-foreground font-mono tabular-nums">{entry.timestamp}</span>
                          </div>
                          <p className="text-[9px] text-muted-foreground leading-relaxed">{entry.details}</p>
                          <p className="text-[8px] text-muted-foreground/60 mt-0.5">by {entry.user}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <History className="w-6 h-6 text-muted-foreground/30 mx-auto mb-2" />
                      <p className="text-[11px] text-muted-foreground/60">No audit entries yet</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── Preview + Mapping (after parse) ── */}
          {isPreviewOrLater && headers.length > 0 && (
            <PreviewTable
              headers={headers}
              rows={rows}
              mappings={mappings}
              onUpdateMapping={handleUpdateMapping}
            />
          )}

          {/* ── Validation ── */}
          {(stage === "validating" || validationIssues.length > 0) && (
            <ValidationSummary
              issues={validationIssues}
              isValidating={isValidating}
            />
          )}

          {/* ── Action bar (Validate / Commit / Discard) ── */}
          {isPreviewOrLater && stage !== "committed" && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-xl border border-border bg-card">
              <div className="flex items-center gap-2">
                <Info className="w-3.5 h-3.5 text-muted-foreground/40 flex-shrink-0" />
                <div>
                  <p className="text-[11px] text-foreground font-medium">
                    {rows.length} rows mapped to {selectedStation}
                  </p>
                  <p className="text-[9px] text-muted-foreground/50">
                    {mappings.filter((m) => m.targetField).length} of {headers.length} columns mapped · {selectedDiscom}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleDiscard}
                  className="flex items-center gap-1.5 px-3 py-2 bg-secondary border border-border rounded-xl text-[11px] text-muted-foreground font-medium hover:text-destructive hover:bg-destructive/5 hover:border-destructive/20 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  Discard
                </button>

                {validationIssues.length === 0 || hasBlockingErrors ? (
                  <button
                    onClick={handleValidate}
                    disabled={isValidating}
                    className="flex items-center gap-1.5 px-4 py-2 bg-chart-2/10 text-chart-2 border border-chart-2/20 rounded-xl text-[11px] font-medium hover:bg-chart-2/15 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isValidating ? (
                      <>
                        <div className="w-3 h-3 border-2 border-chart-2/30 border-t-chart-2 rounded-full animate-spin" />
                        Validating...
                      </>
                    ) : (
                      <>
                        <Shield className="w-3.5 h-3.5" />
                        Validate
                      </>
                    )}
                  </button>
                ) : null}

                <button
                  onClick={handleCommit}
                  disabled={hasBlockingErrors || isValidating || validationIssues.length === 0}
                  className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-[11px] font-medium hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Commit
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ═══ UPLOAD HISTORY ═══ */}
      <UploadHistory entries={history} onRollback={handleRollback} />
    </div>
  );
}