import { useState } from "react";
import {
  Plus,
  X,
  FlaskConical,
  Code2,
  CheckCircle2,
  Trash2,
  Info,
} from "lucide-react";
import { type CustomMetric } from "./accuracyData";

/* ═══════════════════════════════════════════════════
   CUSTOM METRIC BUILDER — Create user-defined metrics
   Formula input · Validation · Saved metrics list
   ═══════════════════════════════════════════════════ */

interface CustomMetricBuilderProps {
  metrics: CustomMetric[];
  onAdd: (m: Omit<CustomMetric, "id">) => void;
  onRemove: (id: string) => void;
}

const FORMULA_TEMPLATES = [
  { label: "Weighted MAE", formula: "0.6 * MAE + 0.4 * RMSE", unit: "°C" },
  { label: "Skill Score", formula: "1 - (MAE / Climatology_MAE)", unit: "" },
  { label: "Bias Ratio", formula: "MBE / MAE * 100", unit: "%" },
];

export function CustomMetricBuilder({ metrics, onAdd, onRemove }: CustomMetricBuilderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [formula, setFormula] = useState("");
  const [unit, setUnit] = useState("");

  const handleAdd = () => {
    if (!name || !formula) return;
    onAdd({ name, formula, unit });
    setName("");
    setFormula("");
    setUnit("");
    setIsOpen(false);
  };

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/60 bg-secondary/10">
        <div className="flex items-center gap-2">
          <FlaskConical className="w-3.5 h-3.5 text-chart-3" />
          <h4 className="text-[12px] text-foreground font-medium">Custom Metrics</h4>
          <span className="text-[9px] text-muted-foreground font-medium px-1.5 py-0.5 rounded bg-secondary tabular-nums">
            {metrics.length}
          </span>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium transition-colors ${
            isOpen ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary hover:bg-primary/15"
          }`}
        >
          {isOpen ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
          {isOpen ? "Cancel" : "Create"}
        </button>
      </div>

      {isOpen && (
        <div className="px-4 py-3 border-b border-border/40 bg-secondary/5 space-y-2.5 animate-in slide-in-from-top-1 duration-150">
          {/* Templates */}
          <div>
            <label className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider mb-1 block">Quick Templates</label>
            <div className="flex flex-wrap gap-1">
              {FORMULA_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.label}
                  onClick={() => { setName(tpl.label); setFormula(tpl.formula); setUnit(tpl.unit); }}
                  className="px-2 py-1 bg-secondary/50 border border-border rounded text-[9px] text-muted-foreground font-medium hover:text-foreground hover:bg-secondary transition-colors"
                >
                  {tpl.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <label className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider mb-1 block">Metric Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Weighted MAE"
                className="w-full px-3 py-1.5 bg-secondary/50 border border-border rounded-lg text-[11px] text-foreground outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/40"
              />
            </div>
            <div>
              <label className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider mb-1 block">Unit</label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="°C, %, etc."
                className="w-full px-3 py-1.5 bg-secondary/50 border border-border rounded-lg text-[11px] text-foreground outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/40"
              />
            </div>
          </div>

          <div>
            <label className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider mb-1 block">Formula</label>
            <div className="relative">
              <Code2 className="w-3 h-3 text-muted-foreground absolute left-2.5 top-2" />
              <textarea
                value={formula}
                onChange={(e) => setFormula(e.target.value)}
                placeholder="e.g. 0.6 * MAE + 0.4 * RMSE"
                rows={2}
                className="w-full pl-7 pr-3 py-1.5 bg-secondary/50 border border-border rounded-lg text-[11px] text-foreground font-mono outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/40 resize-none"
              />
            </div>
            <div className="flex items-center gap-1 mt-1">
              <Info className="w-2.5 h-2.5 text-muted-foreground/40" />
              <p className="text-[8px] text-muted-foreground/40">
                Available variables: MAE, RMSE, MBE, Bias, Correlation, Climatology_MAE
              </p>
            </div>
          </div>

          <button
            onClick={handleAdd}
            disabled={!name || !formula}
            className="w-full py-1.5 bg-primary text-primary-foreground rounded-lg text-[11px] font-medium hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
          >
            Save Custom Metric
          </button>
        </div>
      )}

      {/* Saved metrics */}
      <div className="max-h-[200px] overflow-y-auto">
        {metrics.length === 0 ? (
          <div className="px-4 py-5 text-center">
            <FlaskConical className="w-5 h-5 text-muted-foreground/20 mx-auto mb-1.5" />
            <p className="text-[10px] text-muted-foreground/50">No custom metrics defined</p>
          </div>
        ) : (
          <div className="divide-y divide-border/20">
            {metrics.map((m) => (
              <div key={m.id} className="flex items-start gap-2.5 px-4 py-2.5 hover:bg-secondary/10 transition-colors group">
                <CheckCircle2 className="w-3 h-3 text-chart-3 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-foreground font-medium">
                    {m.name}
                    {m.unit && <span className="text-muted-foreground/50 ml-1">({m.unit})</span>}
                  </p>
                  <p className="text-[9px] text-muted-foreground/60 font-mono mt-0.5 truncate">{m.formula}</p>
                </div>
                <button
                  onClick={() => onRemove(m.id)}
                  className="p-1 rounded text-muted-foreground/30 hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
