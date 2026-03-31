import {
  Download,
  FileText,
  FileSpreadsheet,
  FileJson,
  Info,
} from "lucide-react";
import { TEMPLATES, type TemplateInfo, type FileFormat } from "./uploadData";

/* ═══════════════════════════════════════════════════
   TEMPLATE DOWNLOAD — Sample templates with column
   preview and format badges
   ═══════════════════════════════════════════════════ */

const FORMAT_ICONS: Record<FileFormat, React.ElementType> = {
  csv: FileText,
  xlsx: FileSpreadsheet,
  json: FileJson,
};

const FORMAT_COLORS: Record<FileFormat, string> = {
  csv: "text-chart-3",
  xlsx: "text-chart-1",
  json: "text-chart-2",
};

interface TemplateDownloadProps {
  collapsed?: boolean;
}

export function TemplateDownload({ collapsed }: TemplateDownloadProps) {
  const handleDownload = (tpl: TemplateInfo) => {
    // Simulate CSV download
    const header = tpl.columns.join(",");
    const sampleRow = tpl.columns.map((_, i) => (i === 0 ? "2026-02-10 12:00" : `sample_${i}`)).join(",");
    const content = `${header}\n${sampleRow}\n`;
    const blob = new Blob([content], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${tpl.name.toLowerCase().replace(/\s+/g, "_")}_template.${tpl.format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border/60 bg-secondary/10">
        <div className="flex items-center gap-2">
          <Download className="w-3.5 h-3.5 text-primary" />
          <h4 className="text-[12px] text-foreground font-medium">Download Templates</h4>
        </div>
        <p className="text-[9px] text-muted-foreground mt-0.5">
          Use these templates to structure your data before uploading
        </p>
      </div>

      <div className={`divide-y divide-border/20 ${collapsed ? "max-h-[200px] overflow-y-auto" : ""}`}>
        {TEMPLATES.map((tpl) => {
          const FormatIcon = FORMAT_ICONS[tpl.format];
          return (
            <div
              key={tpl.id}
              className="flex items-center gap-3 px-4 py-3 hover:bg-secondary/10 transition-colors group"
            >
              <div className={`w-9 h-9 rounded-lg bg-secondary/50 flex items-center justify-center flex-shrink-0 ${FORMAT_COLORS[tpl.format]}`}>
                <FormatIcon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-[12px] text-foreground font-medium truncate">{tpl.name}</p>
                  <span className="text-[8px] text-muted-foreground/50 uppercase font-semibold tracking-wider px-1 py-0.5 rounded bg-secondary">.{tpl.format}</span>
                </div>
                <p className="text-[9px] text-muted-foreground/60 mt-0.5 truncate">{tpl.description}</p>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-[8px] text-muted-foreground/40 font-mono truncate">
                    {tpl.columns.slice(0, 4).join(", ")}{tpl.columns.length > 4 ? ` +${tpl.columns.length - 4}` : ""}
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleDownload(tpl)}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-secondary/50 border border-border rounded-lg text-[10px] text-foreground font-medium hover:bg-secondary transition-colors opacity-70 group-hover:opacity-100"
              >
                <Download className="w-3 h-3" />
                {tpl.sizeHint}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
