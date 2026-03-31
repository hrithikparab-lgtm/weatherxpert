import {
  History,
  RotateCcw,
  Clock,
  User,
  FileText,
} from "lucide-react";
import { type RuleVersion, SAMPLE_VERSIONS } from "./builderTypes";

/* ═══════════════════════════════════════════════════
   VERSION HISTORY — Save history + rollback
   ═══════════════════════════════════════════════════ */

interface VersionHistoryProps {
  versions: RuleVersion[];
  onRollback: (version: number) => void;
  canEdit: boolean;
}

export function VersionHistory({ versions, onRollback, canEdit }: VersionHistoryProps) {
  return (
    <div className="space-y-3">
      <h4 className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider flex items-center gap-1.5">
        <History className="w-3 h-3" />
        Version History
      </h4>

      <div className="space-y-1.5">
        {versions.map((v, i) => (
          <div
            key={v.version}
            className={`rounded-lg border p-3 transition-all ${
              i === 0
                ? "border-primary/20 bg-primary/5"
                : "border-border bg-card hover:bg-secondary/20"
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className={`text-[11px] font-semibold tabular-nums ${
                  i === 0 ? "text-primary" : "text-foreground"
                }`}>
                  v{v.version}
                </span>
                {i === 0 && (
                  <span className="text-[9px] text-primary font-semibold uppercase px-1.5 py-0.5 rounded bg-primary/10">
                    Current
                  </span>
                )}
              </div>
              {i > 0 && canEdit && (
                <button
                  onClick={() => onRollback(v.version)}
                  className="flex items-center gap-1 text-[10px] text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  Rollback
                </button>
              )}
            </div>
            <p className="text-[11px] text-foreground font-medium mb-1">{v.changeNote}</p>
            <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-0.5">
                <User className="w-2.5 h-2.5" />
                {v.savedBy}
              </span>
              <span className="flex items-center gap-0.5">
                <Clock className="w-2.5 h-2.5" />
                {v.savedAt}
              </span>
              <span className="flex items-center gap-0.5">
                <FileText className="w-2.5 h-2.5" />
                {v.nodeCount} nodes
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
