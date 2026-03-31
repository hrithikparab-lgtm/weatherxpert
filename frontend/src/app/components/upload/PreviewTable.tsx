import { useState } from "react";
import {
  ArrowRight,
  Check,
  X,
  AlertTriangle,
  Info,
  ChevronDown,
  Columns3,
  Link2,
} from "lucide-react";
import {
  SYSTEM_FIELDS,
  type ColumnMapping,
  type ParsedRow,
  type SystemField,
} from "./uploadData";

/* ═══════════════════════════════════════════════════
   PREVIEW TABLE — Parsed data preview with
   interactive column mapping UI
   ═══════════════════════════════════════════════════ */

interface PreviewTableProps {
  headers: string[];
  rows: ParsedRow[];
  mappings: ColumnMapping[];
  onUpdateMapping: (sourceColumn: string, targetField: string | null) => void;
}

export function PreviewTable({ headers, rows, mappings, onUpdateMapping }: PreviewTableProps) {
  const [showMapping, setShowMapping] = useState(true);
  const previewRows = rows.slice(0, 10);
  const mappedCount = mappings.filter((m) => m.targetField !== null).length;
  const requiredMissing = SYSTEM_FIELDS
    .filter((f) => f.required)
    .filter((f) => !mappings.some((m) => m.targetField === f.id));

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/60 bg-secondary/10">
        <div className="flex items-center gap-2">
          <Columns3 className="w-3.5 h-3.5 text-primary" />
          <h4 className="text-[12px] text-foreground font-medium">Data Preview & Column Mapping</h4>
          <span className="text-[9px] text-muted-foreground font-medium tabular-nums px-1.5 py-0.5 rounded bg-secondary">
            {rows.length} rows · {headers.length} cols
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded tabular-nums ${
            mappedCount === headers.length
              ? "bg-chart-3/10 text-chart-3"
              : mappedCount > 0
              ? "bg-chart-2/10 text-chart-2"
              : "bg-destructive/10 text-destructive"
          }`}>
            <Link2 className="w-2.5 h-2.5 inline mr-0.5" />
            {mappedCount}/{headers.length} mapped
          </span>
          <button
            onClick={() => setShowMapping(!showMapping)}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium transition-colors ${
              showMapping ? "bg-primary/10 text-primary" : "bg-secondary/50 text-muted-foreground"
            }`}
          >
            <Link2 className="w-3 h-3" />
            Mapping
            <ChevronDown className={`w-2.5 h-2.5 transition-transform ${showMapping ? "rotate-180" : ""}`} />
          </button>
        </div>
      </div>

      {/* Column mapping UI */}
      {showMapping && (
        <div className="px-4 py-3 border-b border-border/40 bg-secondary/5 space-y-2 animate-in slide-in-from-top-1 duration-150">
          {requiredMissing.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-destructive/5 border border-destructive/10">
              <AlertTriangle className="w-3 h-3 text-destructive flex-shrink-0" />
              <p className="text-[10px] text-destructive font-medium">
                Required field missing: {requiredMissing.map((f) => f.label).join(", ")}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {mappings.map((mapping) => {
              const targetField = mapping.targetField
                ? SYSTEM_FIELDS.find((f) => f.id === mapping.targetField)
                : null;
              const isMapped = mapping.targetField !== null;

              return (
                <div
                  key={mapping.sourceColumn}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                    isMapped
                      ? "bg-chart-3/3 border-chart-3/15"
                      : "bg-secondary/20 border-border/40"
                  }`}
                >
                  {/* Source column */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-muted-foreground/50 uppercase tracking-wider font-semibold">Source</p>
                    <p className="text-[11px] text-foreground font-medium font-mono truncate">{mapping.sourceColumn}</p>
                  </div>

                  <ArrowRight className={`w-3 h-3 flex-shrink-0 ${isMapped ? "text-chart-3" : "text-muted-foreground/20"}`} />

                  {/* Target field selector */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-muted-foreground/50 uppercase tracking-wider font-semibold">Target</p>
                    <select
                      value={mapping.targetField ?? ""}
                      onChange={(e) => onUpdateMapping(mapping.sourceColumn, e.target.value || null)}
                      className={`w-full bg-transparent text-[11px] font-medium border-none outline-none cursor-pointer truncate ${
                        isMapped ? "text-chart-3" : "text-muted-foreground"
                      }`}
                    >
                      <option value="" className="bg-popover text-muted-foreground">— Skip —</option>
                      {SYSTEM_FIELDS.map((field) => {
                        const alreadyMapped = mappings.some(
                          (m) => m.targetField === field.id && m.sourceColumn !== mapping.sourceColumn
                        );
                        return (
                          <option
                            key={field.id}
                            value={field.id}
                            disabled={alreadyMapped}
                            className="bg-popover text-foreground"
                          >
                            {field.label}{field.required ? " *" : ""}{alreadyMapped ? " (used)" : ""}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {isMapped ? (
                    <Check className="w-3 h-3 text-chart-3 flex-shrink-0" />
                  ) : (
                    <X className="w-3 h-3 text-muted-foreground/20 flex-shrink-0" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Tooltip */}
          <div className="flex items-center gap-1.5 pt-1">
            <Info className="w-2.5 h-2.5 text-muted-foreground/40" />
            <p className="text-[8px] text-muted-foreground/40">
              Fields marked with * are required. Auto-mapping is applied based on column name matching.
              Each target field can only be mapped once.
            </p>
          </div>
        </div>
      )}

      {/* Data preview table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[500px]">
          <thead>
            <tr className="bg-secondary/20 border-b border-border/40">
              <th className="w-10 px-3 py-2 text-center text-[8px] text-muted-foreground font-semibold uppercase tracking-wider">#</th>
              {headers.map((h) => {
                const mapping = mappings.find((m) => m.sourceColumn === h);
                const isMapped = mapping?.targetField !== null;
                return (
                  <th key={h} className="text-left px-3 py-2">
                    <div className="flex items-center gap-1">
                      <span className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider">{h}</span>
                      {isMapped && (
                        <span className="text-[7px] text-chart-3 font-semibold px-1 py-0.5 rounded bg-chart-3/8">
                          {SYSTEM_FIELDS.find((f) => f.id === mapping?.targetField)?.label}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {previewRows.map((row, idx) => (
              <tr key={idx} className="border-b border-border/10 hover:bg-secondary/10 transition-colors">
                <td className="px-3 py-2 text-center text-[9px] text-muted-foreground/40 tabular-nums">{idx + 1}</td>
                {headers.map((h) => {
                  const val = row[h];
                  const isEmpty = val === null || val === "" || val === undefined;
                  return (
                    <td key={h} className="px-3 py-2">
                      {isEmpty ? (
                        <span className="text-[10px] text-destructive/60 italic">null</span>
                      ) : (
                        <span className="text-[10px] text-foreground tabular-nums font-mono">{String(val)}</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      {rows.length > 10 && (
        <div className="px-4 py-2 border-t border-border/30 bg-secondary/5 text-center">
          <p className="text-[9px] text-muted-foreground/50 tabular-nums">
            Showing first 10 of {rows.length} rows
          </p>
        </div>
      )}
    </div>
  );
}
