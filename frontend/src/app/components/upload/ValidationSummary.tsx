import { useState } from "react";
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Lightbulb,
  Info,
} from "lucide-react";
import { type ValidationIssue, ERROR_TOOLTIPS } from "./uploadData";

/* ═══════════════════════════════════════════════════
   VALIDATION SUMMARY — Errors/warnings list
   with tooltips, suggestions, collapsible detail
   ═══════════════════════════════════════════════════ */

interface ValidationSummaryProps {
  issues: ValidationIssue[];
  isValidating: boolean;
}

export function ValidationSummary({ issues, isValidating }: ValidationSummaryProps) {
  const [showAll, setShowAll] = useState(false);

  const errors = issues.filter((i) => i.type === "error");
  const warnings = issues.filter((i) => i.type === "warning");
  const hasBlockingErrors = errors.length > 0;
  const displayIssues = showAll ? issues : issues.slice(0, 8);

  if (isValidating) {
    return (
      <div className="rounded-xl border border-primary/20 bg-primary/3 p-5 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-[12px] text-foreground font-medium">Validating data...</p>
        </div>
        <p className="text-[10px] text-muted-foreground">Checking data types, ranges, duplicates, and required fields</p>
      </div>
    );
  }

  return (
    <div className={`rounded-xl border overflow-hidden ${
      hasBlockingErrors
        ? "border-destructive/20 bg-destructive/2"
        : warnings.length > 0
        ? "border-chart-2/20 bg-chart-2/2"
        : "border-chart-3/20 bg-chart-3/2"
    }`}>
      {/* Summary bar */}
      <div className="px-4 py-3 border-b border-border/30 flex items-center gap-3">
        {hasBlockingErrors ? (
          <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-4 h-4 text-destructive" />
          </div>
        ) : warnings.length > 0 ? (
          <div className="w-8 h-8 rounded-lg bg-chart-2/10 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-4 h-4 text-chart-2" />
          </div>
        ) : (
          <div className="w-8 h-8 rounded-lg bg-chart-3/10 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-4 h-4 text-chart-3" />
          </div>
        )}

        <div className="flex-1">
          <p className="text-[12px] text-foreground font-medium">
            {hasBlockingErrors
              ? "Validation failed — fix errors before committing"
              : warnings.length > 0
              ? "Validation passed with warnings"
              : "All validations passed"}
          </p>
          <div className="flex items-center gap-3 mt-0.5">
            {errors.length > 0 && (
              <span className="text-[10px] text-destructive font-medium tabular-nums">
                {errors.length} error{errors.length > 1 ? "s" : ""}
              </span>
            )}
            {warnings.length > 0 && (
              <span className="text-[10px] text-chart-2 font-medium tabular-nums">
                {warnings.length} warning{warnings.length > 1 ? "s" : ""}
              </span>
            )}
            {errors.length === 0 && warnings.length === 0 && (
              <span className="text-[10px] text-chart-3 font-medium">Ready to commit</span>
            )}
          </div>
        </div>

        {issues.length > 0 && (
          <span className="text-[9px] text-muted-foreground/50 tabular-nums px-1.5 py-0.5 rounded bg-secondary">
            {issues.length} total
          </span>
        )}
      </div>

      {/* Issue list */}
      {issues.length > 0 && (
        <div className="divide-y divide-border/10">
          {displayIssues.map((issue, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2.5 px-4 py-2.5 hover:bg-secondary/5 transition-colors"
            >
              {issue.type === "error" ? (
                <AlertCircle className="w-3 h-3 text-destructive flex-shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-3 h-3 text-chart-2 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1 min-w-0">
                <p className={`text-[11px] font-medium ${issue.type === "error" ? "text-destructive" : "text-chart-2"}`}>
                  {issue.message}
                </p>
                <div className="flex items-center gap-2 mt-0.5 text-[9px] text-muted-foreground/50">
                  {issue.row && <span className="tabular-nums">Row {issue.row}</span>}
                  {issue.column && <span className="font-mono">col: {issue.column}</span>}
                </div>
                {issue.suggestion && (
                  <div className="flex items-center gap-1 mt-1">
                    <Lightbulb className="w-2.5 h-2.5 text-chart-2/60" />
                    <p className="text-[9px] text-muted-foreground/50 italic">{issue.suggestion}</p>
                  </div>
                )}
              </div>
            </div>
          ))}

          {issues.length > 8 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="w-full px-4 py-2 text-center text-[10px] text-primary font-medium hover:bg-primary/5 transition-colors flex items-center justify-center gap-1"
            >
              {showAll ? "Show less" : `Show all ${issues.length} issues`}
              <ChevronDown className={`w-3 h-3 transition-transform ${showAll ? "rotate-180" : ""}`} />
            </button>
          )}
        </div>
      )}

      {/* Common error tooltips */}
      {hasBlockingErrors && (
        <div className="px-4 py-2.5 border-t border-border/20 bg-secondary/5">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Info className="w-3 h-3 text-muted-foreground/40" />
            <p className="text-[9px] text-muted-foreground/50 font-semibold uppercase tracking-wider">Common fixes</p>
          </div>
          <div className="space-y-1">
            {errors.some((e) => e.message.includes("Timestamp")) && (
              <p className="text-[9px] text-muted-foreground/40">&bull; {ERROR_TOOLTIPS.timestamp}</p>
            )}
            {errors.some((e) => e.message.includes("number")) && (
              <p className="text-[9px] text-muted-foreground/40">&bull; {ERROR_TOOLTIPS.number}</p>
            )}
            {errors.some((e) => e.message.includes("empty") || e.message.includes("Missing")) && (
              <p className="text-[9px] text-muted-foreground/40">&bull; {ERROR_TOOLTIPS.missing}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
