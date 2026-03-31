import {
  Eye,
  Download,
  Send,
  FileText,
  FileSpreadsheet,
  FileJson,
  Presentation,
  BarChart3,
  Table2,
  Map,
  Type,
  Minus,
  Calendar,
  Clock,
  CheckCircle2,
} from "lucide-react";
import {
  BUILDER_COMPONENTS,
  COMPONENT_TYPE_CONFIG,
  FORMAT_OPTIONS,
  type ExportFormat,
  type ComponentType,
  type ScheduleConfig,
} from "./reportsExportData";

/* ═══════════════════════════════════════════════════
   PREVIEW PANE — Right panel with simulated report
   preview, format selector, export / send buttons
   ═══════════════════════════════════════════════════ */

const TYPE_ICONS: Record<ComponentType, React.ElementType> = {
  kpi: BarChart3, chart: BarChart3, table: Table2,
  map_snapshot: Map, text: Type, divider: Minus,
};

const FORMAT_ICONS: Record<ExportFormat, React.ElementType> = {
  pdf: FileText, xlsx: FileSpreadsheet, csv: FileJson, pptx: Presentation,
};

interface PreviewPaneProps {
  reportName: string;
  activeComponents: string[];
  selectedFormat: ExportFormat;
  onSelectFormat: (f: ExportFormat) => void;
  onDownload: () => void;
  onSendNow: () => void;
  schedule: ScheduleConfig;
  region: string;
  dateRange: string;
  recipientCount: number;
  isSending: boolean;
  isDraft?: boolean; // NEW: Show draft watermark
}

export function PreviewPane({
  reportName, activeComponents, selectedFormat, onSelectFormat,
  onDownload, onSendNow, schedule, region, dateRange, recipientCount, isSending,
  isDraft = true, // NEW: Default to draft mode
}: PreviewPaneProps) {
  const comps = activeComponents
    .map((id) => BUILDER_COMPONENTS.find((c) => c.id === id))
    .filter(Boolean) as typeof BUILDER_COMPONENTS;

  const formatInfo = FORMAT_OPTIONS.find((f) => f.id === selectedFormat)!;

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border/60 bg-secondary/10 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Eye className="w-3.5 h-3.5 text-primary" />
          <h4 className="text-[12px] text-foreground font-medium">Preview & Export</h4>
          {isDraft && (
            <span className="text-[8px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-chart-2/10 text-chart-2">
              Draft
            </span>
          )}
        </div>
      </div>

      {/* Preview area - WITH DRAFT WATERMARK */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 relative">
        {/* Draft watermark overlay */}
        {isDraft && (
          <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
            <div 
              className="text-[64px] font-bold text-chart-2/8 rotate-[-35deg] select-none tracking-wider"
              style={{ textShadow: '0 0 40px rgba(0,0,0,0.1)' }}
            >
              DRAFT
            </div>
          </div>
        )}

        {/* Report header preview */}
        <div className="rounded-lg border border-border/30 bg-secondary/5 p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 bg-primary/10 rounded flex items-center justify-center">
              <FileText className="w-3 h-3 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-foreground font-medium truncate">
                {reportName || "Untitled Report"}
              </p>
              <p className="text-[8px] text-muted-foreground/50">WeatherXpert · TATA Power</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-[8px] text-muted-foreground/40">
            <span className="flex items-center gap-0.5"><Calendar className="w-2.5 h-2.5" />{dateRange}</span>
            <span>{region}</span>
            <span className="flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" />Generated: 11 Feb 2026</span>
          </div>
        </div>

        {/* Component preview blocks */}
        {comps.length === 0 ? (
          <div className="py-8 text-center">
            <Eye className="w-8 h-8 text-muted-foreground/10 mx-auto mb-2" />
            <p className="text-[11px] text-muted-foreground/40">Add components to see preview</p>
          </div>
        ) : (
          comps.map((comp) => {
            const typeConf = COMPONENT_TYPE_CONFIG[comp.type];
            const TypeIcon = TYPE_ICONS[comp.type];
            return (
              <div
                key={comp.id}
                className="rounded-lg border border-border/20 bg-secondary/3 overflow-hidden"
              >
                <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary/10 border-b border-border/10">
                  <TypeIcon className={`w-2.5 h-2.5 ${typeConf.color}`} />
                  <span className="text-[9px] text-foreground font-medium">{comp.label}</span>
                </div>
                <div className="px-3 py-3">
                  {/* Simulated content blocks */}
                  {comp.type === "kpi" && (
                    <div className="grid grid-cols-3 gap-2">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="rounded bg-secondary/20 p-2 text-center">
                          <div className="w-10 h-2 bg-secondary rounded mx-auto mb-1" />
                          <div className="w-8 h-4 bg-primary/10 rounded mx-auto" />
                        </div>
                      ))}
                    </div>
                  )}
                  {comp.type === "chart" && (
                    <div className="flex items-end gap-0.5 h-12 px-1">
                      {Array.from({ length: 12 }).map((_, i) => (
                        <div
                          key={i}
                          className="flex-1 bg-primary/15 rounded-t"
                          style={{ height: `${20 + Math.sin(i * 0.8) * 40 + Math.random() * 20}%` }}
                        />
                      ))}
                    </div>
                  )}
                  {comp.type === "table" && (
                    <div className="space-y-1">
                      <div className="flex gap-2">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="flex-1 h-2 bg-secondary rounded" />
                        ))}
                      </div>
                      {[1, 2, 3].map((r) => (
                        <div key={r} className="flex gap-2">
                          {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="flex-1 h-2 bg-secondary/40 rounded" />
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                  {comp.type === "map_snapshot" && (
                    <div className="h-16 bg-secondary/10 rounded border border-border/10 flex items-center justify-center">
                      <Map className="w-5 h-5 text-muted-foreground/15" />
                    </div>
                  )}
                  {comp.type === "text" && (
                    <div className="space-y-1">
                      <div className="w-full h-2 bg-secondary/30 rounded" />
                      <div className="w-3/4 h-2 bg-secondary/30 rounded" />
                      <div className="w-5/6 h-2 bg-secondary/20 rounded" />
                    </div>
                  )}
                  {comp.type === "divider" && (
                    <div className="border-t border-border/30 my-1" />
                  )}
                </div>
              </div>
            );
          })
        )}

        {/* Schedule info */}
        {schedule.enabled && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/5 border border-primary/10">
            <Clock className="w-3 h-3 text-primary" />
            <p className="text-[9px] text-primary font-medium">
              Scheduled {schedule.frequency} at {schedule.time} IST
            </p>
          </div>
        )}
      </div>

      {/* Export controls */}
      <div className="p-3 border-t border-border/40 flex-shrink-0 space-y-2">
        {/* Format selector */}
        <div className="grid grid-cols-4 gap-1">
          {FORMAT_OPTIONS.map((fmt) => {
            const FmtIcon = FORMAT_ICONS[fmt.id];
            return (
              <button
                key={fmt.id}
                onClick={() => onSelectFormat(fmt.id)}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg text-[8px] font-medium transition-all ${
                  selectedFormat === fmt.id
                    ? "bg-primary/10 text-primary ring-1 ring-primary/20"
                    : "bg-secondary/30 text-muted-foreground hover:text-foreground"
                }`}
              >
                <FmtIcon className="w-3.5 h-3.5" />
                <span className="uppercase">{fmt.ext}</span>
              </button>
            );
          })}
        </div>

        <p className="text-[8px] text-muted-foreground/40 text-center tabular-nums">
          Estimated size: {formatInfo.size}
        </p>

        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            onClick={onDownload}
            disabled={activeComponents.length === 0}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-secondary border border-border rounded-xl text-[11px] text-foreground font-medium hover:bg-secondary/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Download className="w-3.5 h-3.5" />
            Download
          </button>
          <button
            onClick={onSendNow}
            disabled={activeComponents.length === 0 || recipientCount === 0 || isSending}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-primary text-primary-foreground rounded-xl text-[11px] font-medium hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isSending ? (
              <>
                <div className="w-3 h-3 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                Send Now
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}