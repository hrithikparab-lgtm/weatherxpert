import { useState } from "react";
import {
  X,
  GripHorizontal,
  AlertCircle,
  Pencil,
  Plus,
  Parentheses,
} from "lucide-react";
import {
  type RuleNode,
  type Variable,
  type Operator,
  VARIABLES,
  OPERATORS,
  CATEGORY_COLORS,
  OPERATOR_COLORS,
} from "./builderTypes";

/* ═══════════════════════════════════════════════════
   RULE CANVAS — Visual equation builder
   Nodes are displayed inline, editable, removable
   ═══════════════════════════════════════════════════ */

interface RuleCanvasProps {
  nodes: RuleNode[];
  onUpdate: (nodes: RuleNode[]) => void;
  validationErrors: string[];
}

export function RuleCanvas({ nodes, onUpdate, validationErrors }: RuleCanvasProps) {
  const [editingNode, setEditingNode] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const removeNode = (id: string) => {
    onUpdate(nodes.filter((n) => n.id !== id));
  };

  const updateNodeValue = (id: string, val: number) => {
    onUpdate(
      nodes.map((n) =>
        n.id === id ? { ...n, value: val, label: String(val) } : n
      )
    );
    setEditingNode(null);
  };

  const addGroupMarker = (type: "open" | "close") => {
    const node: RuleNode = {
      id: `grp-${Date.now()}-${type}`,
      type: "group",
      label: type === "open" ? "(" : ")",
    };
    onUpdate([...nodes, node]);
  };

  const getNodeStyle = (node: RuleNode) => {
    if (node.type === "variable") {
      const v = VARIABLES.find((x) => x.id === node.variableId);
      if (v) {
        const colors = CATEGORY_COLORS[v.category];
        return { bg: colors.bg, text: colors.text, border: colors.border };
      }
    }
    if (node.type === "operator") {
      const o = OPERATORS.find((x) => x.id === node.operatorId);
      if (o) {
        const colors = OPERATOR_COLORS[o.type];
        return { bg: colors.bg, text: colors.text, border: colors.border };
      }
    }
    if (node.type === "value") {
      return { bg: "bg-secondary", text: "text-foreground", border: "border-border" };
    }
    if (node.type === "group") {
      return { bg: "bg-muted/50", text: "text-muted-foreground", border: "border-border/50" };
    }
    return { bg: "bg-secondary", text: "text-foreground", border: "border-border" };
  };

  const equationString = nodes
    .map((n) => {
      if (n.type === "variable") {
        const v = VARIABLES.find((x) => x.id === n.variableId);
        return v ? v.label : n.label;
      }
      if (n.type === "operator") {
        const o = OPERATORS.find((x) => x.id === n.operatorId);
        return o ? o.symbol : n.label;
      }
      return n.label;
    })
    .join(" ");

  return (
    <div className="space-y-3">
      {/* Equation label */}
      <div className="flex items-center justify-between">
        <h4 className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">
          Rule Equation
        </h4>
        <div className="flex items-center gap-1">
          <button
            onClick={() => addGroupMarker("open")}
            title="Add opening parenthesis"
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <span className="text-[13px] font-mono font-semibold">(</span>
          </button>
          <button
            onClick={() => addGroupMarker("close")}
            title="Add closing parenthesis"
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <span className="text-[13px] font-mono font-semibold">)</span>
          </button>
          {nodes.length > 0 && (
            <button
              onClick={() => onUpdate([])}
              className="ml-1 text-[10px] text-destructive hover:text-destructive/80 font-medium transition-colors"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Canvas */}
      <div
        className={`min-h-[120px] rounded-xl border-2 border-dashed p-4 transition-all duration-200 ${
          nodes.length === 0
            ? "border-border/60 bg-secondary/20"
            : validationErrors.length > 0
            ? "border-destructive/30 bg-destructive/5"
            : "border-primary/20 bg-primary/5 dark:bg-primary/5"
        }`}
      >
        {nodes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-6 text-center">
            <Parentheses className="w-8 h-8 text-muted-foreground/30 mb-2" />
            <p className="text-[13px] text-muted-foreground/60 mb-1">
              Build your alert rule
            </p>
            <p className="text-[11px] text-muted-foreground/40 max-w-sm">
              Click variables and operators from the toolbox to compose your equation.
              Example: <span className="font-mono text-primary/60">Temperature &gt; 44 AND Wind Speed &gt; 55</span>
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-1.5">
            {nodes.map((node, idx) => {
              const style = getNodeStyle(node);
              const isEditing = editingNode === node.id && node.type === "value";

              return (
                <div
                  key={node.id}
                  className={`group relative flex items-center gap-1 px-2.5 py-1.5 rounded-lg border ${style.border} ${style.bg} transition-all hover:ring-1 hover:ring-primary/30`}
                >
                  {/* Drag handle (visual only) */}
                  {node.type !== "group" && (
                    <GripHorizontal className="w-3 h-3 text-muted-foreground/30 group-hover:text-muted-foreground/60 flex-shrink-0 cursor-grab" />
                  )}

                  {/* Content */}
                  {isEditing ? (
                    <input
                      type="number"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={() => {
                        const v = parseFloat(editValue);
                        if (!isNaN(v)) updateNodeValue(node.id, v);
                        else setEditingNode(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          const v = parseFloat(editValue);
                          if (!isNaN(v)) updateNodeValue(node.id, v);
                          else setEditingNode(null);
                        }
                        if (e.key === "Escape") setEditingNode(null);
                      }}
                      autoFocus
                      className="w-16 bg-transparent text-[12px] text-foreground font-mono font-semibold border-none outline-none"
                    />
                  ) : (
                    <span
                      className={`text-[12px] font-medium ${style.text} ${
                        node.type === "group" ? "text-[16px] font-mono font-semibold px-1" : ""
                      } ${node.type === "operator" ? "font-mono font-semibold" : ""}`}
                    >
                      {node.type === "variable"
                        ? VARIABLES.find((v) => v.id === node.variableId)?.label || node.label
                        : node.type === "operator"
                        ? OPERATORS.find((o) => o.id === node.operatorId)?.symbol || node.label
                        : node.label}
                    </span>
                  )}

                  {/* Unit for variables */}
                  {node.type === "variable" && (
                    <span className="text-[9px] text-muted-foreground/50 font-mono ml-0.5">
                      {VARIABLES.find((v) => v.id === node.variableId)?.unit}
                    </span>
                  )}

                  {/* Edit button for values */}
                  {node.type === "value" && !isEditing && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingNode(node.id);
                        setEditValue(String(node.value ?? ""));
                      }}
                      className="p-0.5 rounded text-muted-foreground/40 hover:text-primary transition-colors"
                    >
                      <Pencil className="w-2.5 h-2.5" />
                    </button>
                  )}

                  {/* Remove */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeNode(node.id);
                    }}
                    className="p-0.5 rounded text-muted-foreground/30 hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </div>
              );
            })}

            {/* Add more hint */}
            <div className="flex items-center gap-1 px-2 py-1.5 rounded-lg border border-dashed border-border/40 text-muted-foreground/40">
              <Plus className="w-3 h-3" />
              <span className="text-[10px]">Add from toolbox</span>
            </div>
          </div>
        )}
      </div>

      {/* Equation preview */}
      {nodes.length > 0 && (
        <div className="px-3 py-2 rounded-lg bg-secondary/30 border border-border/40">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider">
              Preview
            </span>
          </div>
          <p className="text-[12px] font-mono text-foreground/80 break-all leading-relaxed">
            {equationString || "—"}
          </p>
        </div>
      )}

      {/* Validation errors */}
      {validationErrors.length > 0 && (
        <div className="space-y-1">
          {validationErrors.map((err, i) => (
            <div key={i} className="flex items-center gap-1.5 text-[11px] text-destructive">
              <AlertCircle className="w-3 h-3 flex-shrink-0" />
              {err}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
