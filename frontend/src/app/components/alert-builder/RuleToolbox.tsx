import { useState } from "react";
import {
  Cloud,
  Cpu,
  Network,
  Satellite,
  ChevronDown,
  GripVertical,
  Search,
} from "lucide-react";
import {
  VARIABLES,
  OPERATORS,
  CATEGORY_COLORS,
  OPERATOR_COLORS,
  type Variable,
  type Operator,
  type VariableCategory,
  type OperatorType,
} from "./builderTypes";

/* ═══════════════════════════════════════════════════
   RULE TOOLBOX — Left panel with variables & operators
   Click to add to canvas
   ═══════════════════════════════════════════════════ */

const CATEGORY_META: Record<VariableCategory, { icon: React.ElementType; label: string }> = {
  weather: { icon: Cloud, label: "Weather Variables" },
  equipment: { icon: Cpu, label: "Equipment Sensors" },
  grid: { icon: Network, label: "Grid Parameters" },
  provider: { icon: Satellite, label: "Provider Forecasts" },
};

const OPERATOR_META: Record<OperatorType, string> = {
  comparison: "Comparison",
  logical: "Logical",
  arithmetic: "Arithmetic",
};

interface RuleToolboxProps {
  onAddVariable: (v: Variable) => void;
  onAddOperator: (o: Operator) => void;
  onAddValue: () => void;
}

export function RuleToolbox({ onAddVariable, onAddOperator, onAddValue }: RuleToolboxProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set(["weather", "comparison"]));

  const toggleCat = (cat: string) => {
    setExpandedCats((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const q = searchQuery.toLowerCase();
  const filteredVars = q ? VARIABLES.filter((v) => v.label.toLowerCase().includes(q) || v.unit.toLowerCase().includes(q)) : VARIABLES;
  const filteredOps = q ? OPERATORS.filter((o) => o.label.toLowerCase().includes(q) || o.symbol.toLowerCase().includes(q)) : OPERATORS;

  const categories: VariableCategory[] = ["weather", "equipment", "grid", "provider"];
  const operatorTypes: OperatorType[] = ["comparison", "logical", "arithmetic"];

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="px-3 pt-3 pb-2">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search variables..."
            className="w-full pl-8 pr-3 py-2 bg-secondary/50 border border-border rounded-lg text-[12px] text-foreground font-medium outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/50"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1">
        {/* Variables by category */}
        {categories.map((cat) => {
          const meta = CATEGORY_META[cat];
          const colors = CATEGORY_COLORS[cat];
          const Icon = meta.icon;
          const vars = filteredVars.filter((v) => v.category === cat);
          if (vars.length === 0 && q) return null;
          const isExpanded = expandedCats.has(cat);
          return (
            <div key={cat}>
              <button
                onClick={() => toggleCat(cat)}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-secondary/50 transition-colors"
              >
                <Icon className={`w-3.5 h-3.5 ${colors.text}`} />
                <span className="text-[11px] text-foreground font-medium flex-1 text-left">{meta.label}</span>
                <span className="text-[9px] text-muted-foreground tabular-nums">{vars.length}</span>
                <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`} />
              </button>
              {isExpanded && (
                <div className="ml-1 space-y-0.5 mt-0.5 animate-in slide-in-from-top-1 duration-150">
                  {vars.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => onAddVariable(v)}
                      className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg border ${colors.border} ${colors.bg} hover:ring-1 hover:ring-primary/30 transition-all text-left group`}
                    >
                      <GripVertical className="w-3 h-3 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className={`text-[11px] font-medium ${colors.text}`}>{v.label}</span>
                      </div>
                      <span className="text-[9px] text-muted-foreground/60 font-mono">{v.unit}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Divider */}
        <div className="border-t border-border/60 my-2" />

        {/* Operators by type */}
        {operatorTypes.map((ot) => {
          const colors = OPERATOR_COLORS[ot];
          const ops = filteredOps.filter((o) => o.type === ot);
          if (ops.length === 0 && q) return null;
          const isExpanded = expandedCats.has(ot);
          return (
            <div key={ot}>
              <button
                onClick={() => toggleCat(ot)}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-secondary/50 transition-colors"
              >
                <span className={`w-5 h-5 rounded text-[10px] font-mono font-semibold flex items-center justify-center ${colors.bg} ${colors.text}`}>
                  {ot === "comparison" ? ">" : ot === "logical" ? "&" : "+"}
                </span>
                <span className="text-[11px] text-foreground font-medium flex-1 text-left">{OPERATOR_META[ot]}</span>
                <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`} />
              </button>
              {isExpanded && (
                <div className="ml-1 flex flex-wrap gap-1 mt-0.5 animate-in slide-in-from-top-1 duration-150">
                  {ops.map((o) => (
                    <button
                      key={o.id}
                      onClick={() => onAddOperator(o)}
                      title={o.label}
                      className={`px-2.5 py-1 rounded-lg border ${colors.border} ${colors.bg} hover:ring-1 hover:ring-primary/30 transition-all`}
                    >
                      <span className={`text-[12px] font-mono font-semibold ${colors.text}`}>{o.symbol}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Divider */}
        <div className="border-t border-border/60 my-2" />

        {/* Numeric value */}
        <button
          onClick={onAddValue}
          className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg border border-dashed border-border hover:border-primary/40 hover:bg-primary/5 transition-all"
        >
          <span className="w-5 h-5 rounded bg-secondary flex items-center justify-center text-[11px] text-muted-foreground font-mono font-semibold">#</span>
          <span className="text-[11px] text-muted-foreground font-medium">Add Numeric Value</span>
        </button>
      </div>
    </div>
  );
}
