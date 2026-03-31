import { useState } from "react";
import {
  Download,
  FileText,
  FileSpreadsheet,
  FileJson,
  Code2,
  Copy,
  CheckCircle2,
  HardDrive,
  ChevronDown,
  X,
  BarChart3,
} from "lucide-react";
import {
  estimateExportSize,
  buildApiRequest,
  type ParameterId,
  type Resolution,
  PARAMETERS,
} from "./historicalData";

/* ═══════════════════════════════════════════════════
   EXPORT PANEL — Bulk export, API builder,
   file size estimate
   ═══════════════════════════════════════════════════ */

type ExportFormat = "csv" | "xlsx" | "json";

interface ExportPanelProps {
  open: boolean;
  onClose: () => void;
  rowCount: number;
  selectedParams: Set<ParameterId>;
  resolution: Resolution;
  days: number;
  provider: string;
}

const FORMAT_META: { id: ExportFormat; label: string; icon: React.ElementType; desc: string }[] = [
  { id: "csv", label: "CSV", icon: FileText, desc: "Comma-separated values" },
  { id: "xlsx", label: "Excel", icon: FileSpreadsheet, desc: "Microsoft Excel format" },
  { id: "json", label: "JSON", icon: FileJson, desc: "Structured JSON" },
];

export function ExportPanel({
  open,
  onClose,
  rowCount,
  selectedParams,
  resolution,
  days,
  provider,
}: ExportPanelProps) {
  const [format, setFormat] = useState<ExportFormat>("csv");
  const [includeQuality, setIncludeQuality] = useState(true);
  const [includeForecast, setIncludeForecast] = useState(true);
  const [showApi, setShowApi] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!open) return null;

  const sizeEstimate = estimateExportSize(rowCount * (includeForecast ? 2 : 1), format);

  const startDate = new Date(Date.now() - days * 86400000).toISOString().split("T")[0];
  const endDate = new Date().toISOString().split("T")[0];

  const apiRequest = buildApiRequest(
    [...selectedParams],
    resolution,
    startDate,
    endDate,
    provider,
    format
  );

  const copyToClipboard = () => {
    navigator.clipboard.writeText(apiRequest).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-card z-10 rounded-t-2xl">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 ring-1 ring-primary/20 flex items-center justify-center">
              <Download className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="text-[15px] text-foreground font-medium">Export Data</h3>
              <p className="text-[11px] text-muted-foreground">
                {rowCount.toLocaleString()} rows · {selectedParams.size} parameters
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Format selector */}
          <div className="space-y-2">
            <h4 className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">Format</h4>
            <div className="grid grid-cols-3 gap-2">
              {FORMAT_META.map((f) => {
                const Icon = f.icon;
                const isActive = format === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => setFormat(f.id)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${
                      isActive
                        ? "bg-primary/8 border-primary/20 ring-1 ring-primary/15"
                        : "bg-secondary/30 border-border hover:bg-secondary/60"
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                    <span className={`text-[11px] font-medium ${isActive ? "text-foreground" : "text-muted-foreground"}`}>{f.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Options */}
          <div className="space-y-2">
            <h4 className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">Options</h4>
            <label className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-secondary/30 border border-border/40 cursor-pointer hover:bg-secondary/50 transition-colors">
              <input
                type="checkbox"
                checked={includeForecast}
                onChange={(e) => setIncludeForecast(e.target.checked)}
                className="w-3.5 h-3.5 rounded accent-primary cursor-pointer"
              />
              <div className="flex-1">
                <p className="text-[11px] text-foreground font-medium">Include forecast data</p>
                <p className="text-[9px] text-muted-foreground/60">Adds forecast column and diff % per row</p>
              </div>
            </label>
            <label className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-secondary/30 border border-border/40 cursor-pointer hover:bg-secondary/50 transition-colors">
              <input
                type="checkbox"
                checked={includeQuality}
                onChange={(e) => setIncludeQuality(e.target.checked)}
                className="w-3.5 h-3.5 rounded accent-primary cursor-pointer"
              />
              <div className="flex-1">
                <p className="text-[11px] text-foreground font-medium">Include quality flags</p>
                <p className="text-[9px] text-muted-foreground/60">Appends data quality status per row</p>
              </div>
            </label>
          </div>

          {/* File size estimate */}
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-secondary/40 border border-border/40">
            <HardDrive className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <div className="flex-1">
              <p className="text-[11px] text-foreground font-medium">Estimated file size</p>
              <p className="text-[10px] text-muted-foreground/60">
                {rowCount.toLocaleString()} rows × {selectedParams.size} params in .{format}
              </p>
            </div>
            <span className="text-[15px] text-foreground font-medium tabular-nums">{sizeEstimate}</span>
          </div>

          {/* Download CTA */}
          <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary text-primary-foreground rounded-xl text-[13px] font-medium hover:bg-primary/90 transition-colors shadow-sm">
            <Download className="w-4 h-4" />
            Export as {format.toUpperCase()} ({sizeEstimate})
          </button>

          {/* API Request Builder */}
          <div className="border-t border-border/50 pt-4">
            <button
              onClick={() => setShowApi(!showApi)}
              className="w-full flex items-center gap-2 text-left"
            >
              <Code2 className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-[11px] text-muted-foreground font-medium flex-1">API Request Builder</span>
              <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform ${showApi ? "rotate-180" : ""}`} />
            </button>

            {showApi && (
              <div className="mt-3 space-y-2 animate-in slide-in-from-top-1 duration-150">
                <div className="relative">
                  <pre className="p-3 rounded-lg bg-secondary/50 border border-border text-[10px] text-foreground font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed">
                    {apiRequest}
                  </pre>
                  <button
                    onClick={copyToClipboard}
                    className="absolute top-2 right-2 p-1.5 rounded-md bg-card border border-border text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {copied ? (
                      <CheckCircle2 className="w-3 h-3 text-chart-3" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>
                <p className="text-[9px] text-muted-foreground/50 italic">
                  Replace &lt;YOUR_API_KEY&gt; with a valid token. Data returns in {format.toUpperCase()} format.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
