import { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
  Tooltip,
  BarChart,
  Bar,
  Line,
  ComposedChart,
} from "recharts";
import {
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  BarChart3,
  TrendingUp,
  Calendar,
} from "lucide-react";
import {
  type RuleNode,
  type SimulationResult,
  type Severity,
  VARIABLES,
  OPERATORS,
} from "./builderTypes";
import { toast } from "sonner";

/* ═══════════════════════════════════════════════════
   SIMULATION PANEL — Run rule against historical data
   Shows trigger timeline + results table
   + 30-day historical test simulation
   ═══════════════════════════════════════════════════ */

interface SimulationPanelProps {
  nodes: RuleNode[];
  severity: Severity;
}

// Hours for simulation
const HOURS = Array.from({ length: 12 }, (_, i) => {
  const h = 6 + i * 2;
  return `${String(h).padStart(2, "0")}:00`;
});

const SEVERITY_COLORS: Record<Severity, string> = {
  critical: "#EF4444",
  high: "#F97316",
  medium: "#F59E0B",
  low: "#3B82F6",
  info: "#94A3B8",
};

function simulateRule(nodes: RuleNode[], severity: Severity): SimulationResult[] {
  // Find variables used in the rule
  const varIds = nodes.filter((n) => n.type === "variable").map((n) => n.variableId!);
  const uniqueVarIds = [...new Set(varIds)];

  // Find comparison threshold (simplified: first value node)
  const valueNode = nodes.find((n) => n.type === "value");
  const threshold = valueNode?.value ?? 40;

  // Find operator
  const compNode = nodes.find((n) => n.type === "operator" && ["gt", "gte", "lt", "lte", "eq", "neq"].includes(n.operatorId!));
  const compOp = compNode?.operatorId ?? "gt";

  const results: SimulationResult[] = [];

  for (let i = 0; i < 12; i++) {
    const values: Record<string, number> = {};
    for (const vid of uniqueVarIds) {
      const v = VARIABLES.find((x) => x.id === vid);
      if (v) values[vid] = v.sampleValues[i];
    }

    // Simple evaluation: check first variable against threshold
    const primaryVar = uniqueVarIds[0];
    const primaryValue = primaryVar ? values[primaryVar] : 0;

    let triggered = false;
    switch (compOp) {
      case "gt": triggered = primaryValue > threshold; break;
      case "gte": triggered = primaryValue >= threshold; break;
      case "lt": triggered = primaryValue < threshold; break;
      case "lte": triggered = primaryValue <= threshold; break;
      case "eq": triggered = primaryValue === threshold; break;
      case "neq": triggered = primaryValue !== threshold; break;
    }

    // If there's an AND with a second variable, check that too
    const hasAnd = nodes.some((n) => n.type === "operator" && n.operatorId === "and");
    if (hasAnd && uniqueVarIds.length >= 2) {
      const secondComp = nodes.filter((n) => n.type === "operator" && ["gt", "gte", "lt", "lte"].includes(n.operatorId!));
      const secondValue = nodes.filter((n) => n.type === "value");
      if (secondComp.length >= 2 && secondValue.length >= 2) {
        const sv = values[uniqueVarIds[1]] ?? 0;
        const thresh2 = secondValue[1]?.value ?? 50;
        const op2 = secondComp[1]?.operatorId ?? "gt";
        let t2 = false;
        switch (op2) {
          case "gt": t2 = sv > thresh2; break;
          case "gte": t2 = sv >= thresh2; break;
          case "lt": t2 = sv < thresh2; break;
          case "lte": t2 = sv <= thresh2; break;
        }
        triggered = triggered && t2;
      }
    }

    results.push({
      timestamp: HOURS[i],
      values,
      triggered,
      severity: triggered ? severity : "info",
    });
  }

  return results;
}

export function SimulationPanel({ nodes, severity }: SimulationPanelProps) {
  const [results, setResults] = useState<SimulationResult[] | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const hasVariables = nodes.some((n) => n.type === "variable");
  const hasOperator = nodes.some((n) => n.type === "operator");
  const hasValue = nodes.some((n) => n.type === "value");
  const canSimulate = hasVariables && hasOperator && hasValue;

  const runSimulation = () => {
    setIsRunning(true);
    // Simulate async
    setTimeout(() => {
      const r = simulateRule(nodes, severity);
      setResults(r);
      setIsRunning(false);
    }, 600);
  };

  // Chart data
  const chartData = useMemo(() => {
    if (!results) return [];
    const varIds = nodes.filter((n) => n.type === "variable").map((n) => n.variableId!);
    const uniqueVarIds = [...new Set(varIds)];
    const primaryVarId = uniqueVarIds[0];

    return results.map((r) => ({
      time: r.timestamp,
      value: primaryVarId ? r.values[primaryVarId] : 0,
      triggered: r.triggered ? 1 : 0,
    }));
  }, [results, nodes]);

  const triggerCount = results?.filter((r) => r.triggered).length ?? 0;
  const totalPoints = results?.length ?? 0;

  // Primary variable info
  const primaryVarId = nodes.find((n) => n.type === "variable")?.variableId;
  const primaryVar = primaryVarId ? VARIABLES.find((v) => v.id === primaryVarId) : null;
  const thresholdValue = nodes.find((n) => n.type === "value")?.value;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider flex items-center gap-1.5">
          <BarChart3 className="w-3 h-3" />
          Simulation
        </h4>
        <button
          onClick={runSimulation}
          disabled={!canSimulate || isRunning}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-chart-3 text-white rounded-lg text-[11px] font-medium hover:bg-chart-3/90 transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isRunning ? (
            <>
              <Clock className="w-3.5 h-3.5 animate-spin" />
              Running...
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5" />
              Simulate
            </>
          )}
        </button>
      </div>

      {!canSimulate && !results && (
        <div className="px-3 py-4 rounded-xl border border-dashed border-border/60 bg-secondary/10 text-center">
          <p className="text-[11px] text-muted-foreground/60">
            Add at least one variable, one operator, and one value to your rule to enable simulation.
          </p>
        </div>
      )}

      {/* Results */}
      {results && (
        <div className="space-y-3 animate-in fade-in duration-300">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-border bg-card p-2.5 text-center">
              <p className="text-[10px] text-muted-foreground">Data Points</p>
              <p className="text-[18px] text-foreground tabular-nums">{totalPoints}</p>
            </div>
            <div className={`rounded-lg border p-2.5 text-center ${
              triggerCount > 0 ? "border-destructive/20 bg-destructive/5" : "border-chart-3/20 bg-chart-3/5"
            }`}>
              <p className="text-[10px] text-muted-foreground">Triggers</p>
              <p className={`text-[18px] tabular-nums ${triggerCount > 0 ? "text-destructive" : "text-chart-3"}`}>
                {triggerCount}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card p-2.5 text-center">
              <p className="text-[10px] text-muted-foreground">Hit Rate</p>
              <p className="text-[18px] text-foreground tabular-nums">
                {totalPoints > 0 ? Math.round((triggerCount / totalPoints) * 100) : 0}%
              </p>
            </div>
          </div>

          {/* Chart */}
          {primaryVar && (
            <div className="rounded-xl border border-border bg-card p-3">
              <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-2">
                {primaryVar.label} ({primaryVar.unit}) — 12-hour sample
              </p>
              <div className="w-full" style={{ height: 128, minHeight: 128 }}>
                <ResponsiveContainer width="100%" height={128} minHeight={128}>
                  <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" opacity={0.4} />
                    <XAxis dataKey="time" tick={{ fontSize: 9, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 9, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        background: "var(--popover)",
                        border: "1px solid var(--border)",
                        borderRadius: 8,
                        fontSize: 11,
                        color: "var(--foreground)",
                      }}
                    />
                    {thresholdValue != null && (
                      <ReferenceLine
                        y={thresholdValue}
                        stroke={SEVERITY_COLORS[severity]}
                        strokeDasharray="6 3"
                        strokeWidth={1.5}
                        label={{
                          value: `Threshold: ${thresholdValue}`,
                          position: "insideTopRight",
                          fill: SEVERITY_COLORS[severity],
                          fontSize: 9,
                        }}
                      />
                    )}
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="var(--chart-1)"
                      strokeWidth={2}
                      fill="var(--chart-1)"
                      fillOpacity={0.1}
                      dot={(props: any) => {
                        const { cx, cy, payload } = props;
                        if (payload.triggered) {
                          return (
                            <circle
                              key={`dot-${cx}-${cy}`}
                              cx={cx}
                              cy={cy}
                              r={4}
                              fill={SEVERITY_COLORS[severity]}
                              stroke="var(--card)"
                              strokeWidth={2}
                            />
                          );
                        }
                        return <circle key={`dot-${cx}-${cy}`} cx={cx} cy={cy} r={0} />;
                      }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Results table */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="overflow-x-auto max-h-[200px] overflow-y-auto">
              <table className="w-full">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-secondary/50 border-b border-border/60">
                    <th className="px-3 py-1.5 text-[9px] text-muted-foreground font-semibold uppercase tracking-wider text-left">Time</th>
                    {primaryVar && (
                      <th className="px-3 py-1.5 text-[9px] text-muted-foreground font-semibold uppercase tracking-wider text-right">
                        {primaryVar.label}
                      </th>
                    )}
                    <th className="px-3 py-1.5 text-[9px] text-muted-foreground font-semibold uppercase tracking-wider text-center">Result</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r) => (
                    <tr key={r.timestamp} className={`border-b border-border/20 ${r.triggered ? "bg-destructive/5" : ""}`}>
                      <td className="px-3 py-1.5 text-[11px] text-foreground tabular-nums font-mono">{r.timestamp}</td>
                      {primaryVar && (
                        <td className="px-3 py-1.5 text-[11px] text-foreground tabular-nums font-mono text-right">
                          {r.values[primaryVar.id]?.toFixed(1)} {primaryVar.unit}
                        </td>
                      )}
                      <td className="px-3 py-1.5 text-center">
                        {r.triggered ? (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-destructive/10 text-destructive text-[9px] font-semibold uppercase">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            Triggered
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-chart-3/10 text-chart-3 text-[9px] font-semibold uppercase">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            OK
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}