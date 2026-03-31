/* ═══════════════════════════════════════════════════
   ALERT LOGIC BUILDER — Shared types & data
   ═══════════════════════════════════════════════════ */

export type VariableCategory = "weather" | "equipment" | "grid" | "provider";

export interface Variable {
  id: string;
  label: string;
  unit: string;
  category: VariableCategory;
  sampleValues: number[];
}

export type OperatorType = "comparison" | "logical" | "arithmetic";

export interface Operator {
  id: string;
  symbol: string;
  label: string;
  type: OperatorType;
}

export type NodeType = "variable" | "operator" | "value" | "group";

export interface RuleNode {
  id: string;
  type: NodeType;
  /** Variable ID if type=variable */
  variableId?: string;
  /** Operator ID if type=operator */
  operatorId?: string;
  /** Numeric value if type=value */
  value?: number;
  /** Display label */
  label: string;
}

export type Severity = "critical" | "high" | "medium" | "low" | "info";

export interface NotificationTarget {
  id: string;
  type: "email" | "sms" | "group";
  value: string;
  label: string;
}

export interface ScheduleWindow {
  days: string[];
  startTime: string;
  endTime: string;
  timezone: string;
}

export interface RuleVersion {
  version: number;
  savedAt: string;
  savedBy: string;
  changeNote: string;
  nodeCount: number;
  nodes: RuleNode[]; // Add nodes for version compare
  severity: Severity;
}

export interface SimulationResult {
  timestamp: string;
  values: Record<string, number>;
  triggered: boolean;
  severity: Severity;
}

export interface AuditLogEntry {
  timestamp: string;
  user: string;
  action: "created" | "modified" | "enabled" | "disabled" | "tested" | "deployed";
  details: string;
  version?: number;
}

export interface RuleTemplate {
  id: string;
  name: string;
  description: string;
  category: "weather" | "equipment" | "grid";
  icon: string;
  nodes: RuleNode[];
  severity: Severity;
  riskScore: number;
}

export interface RuleDependency {
  ruleId: string;
  ruleName: string;
  type: "uses_same_variable" | "conflicts" | "prerequisite";
  severity: "warning" | "error" | "info";
}

// ── Static data ──

export const VARIABLES: Variable[] = [
  { id: "temp", label: "Temperature", unit: "°C", category: "weather", sampleValues: [28, 32, 35, 38, 41, 44, 46, 43, 39, 35, 31, 29] },
  { id: "dew_point", label: "Dew Point", unit: "°C", category: "weather", sampleValues: [22, 24, 25, 26, 27, 28, 29, 28, 26, 24, 23, 22] },
  { id: "wind_speed", label: "Wind Speed", unit: "km/h", category: "weather", sampleValues: [12, 18, 24, 35, 48, 55, 62, 58, 42, 30, 20, 15] },
  { id: "wind_gust", label: "Wind Gust", unit: "km/h", category: "weather", sampleValues: [18, 28, 38, 52, 68, 75, 82, 72, 55, 40, 28, 20] },
  { id: "rainfall", label: "Rainfall", unit: "mm/hr", category: "weather", sampleValues: [0, 0, 2, 8, 25, 50, 80, 65, 30, 10, 2, 0] },
  { id: "humidity", label: "Relative Humidity", unit: "%", category: "weather", sampleValues: [65, 70, 75, 80, 85, 90, 95, 92, 85, 78, 72, 68] },
  { id: "pressure", label: "Atm. Pressure", unit: "hPa", category: "weather", sampleValues: [1013, 1012, 1010, 1008, 1005, 1002, 1000, 1003, 1006, 1009, 1011, 1013] },
  { id: "visibility", label: "Visibility", unit: "km", category: "weather", sampleValues: [10, 8, 5, 3, 1, 0.5, 0.2, 0.8, 2, 5, 8, 10] },
  { id: "solar_irr", label: "Solar Irradiance", unit: "W/m²", category: "equipment", sampleValues: [200, 400, 600, 800, 900, 950, 920, 800, 600, 350, 150, 50] },
  { id: "tfr_oil_temp", label: "Transformer Oil Temp", unit: "°C", category: "equipment", sampleValues: [55, 60, 65, 72, 78, 85, 90, 88, 80, 70, 62, 58] },
  { id: "grid_freq", label: "Grid Frequency", unit: "Hz", category: "grid", sampleValues: [50.02, 50.01, 49.99, 49.97, 49.95, 49.92, 49.90, 49.93, 49.96, 49.98, 50.00, 50.01] },
  { id: "grid_load", label: "Grid Load", unit: "MW", category: "grid", sampleValues: [2200, 2400, 2800, 3200, 3500, 3800, 4000, 3900, 3600, 3100, 2600, 2300] },
  { id: "tomorrow_io_temp", label: "Tomorrow.io Temp Forecast", unit: "°C", category: "provider", sampleValues: [29, 33, 36, 39, 42, 45, 47, 44, 40, 36, 32, 30] },
  { id: "imd_rainfall", label: "IMD Rainfall Forecast", unit: "mm/hr", category: "provider", sampleValues: [0, 0, 5, 15, 35, 60, 90, 70, 35, 12, 3, 0] },
  { id: "tomorrow_io_wind", label: "Tomorrow.io Wind Forecast", unit: "km/h", category: "provider", sampleValues: [10, 15, 22, 32, 45, 52, 60, 55, 40, 28, 18, 12] },
];

export const OPERATORS: Operator[] = [
  { id: "gt", symbol: ">", label: "Greater than", type: "comparison" },
  { id: "gte", symbol: "≥", label: "Greater or equal", type: "comparison" },
  { id: "lt", symbol: "<", label: "Less than", type: "comparison" },
  { id: "lte", symbol: "≤", label: "Less or equal", type: "comparison" },
  { id: "eq", symbol: "=", label: "Equal to", type: "comparison" },
  { id: "neq", symbol: "≠", label: "Not equal", type: "comparison" },
  { id: "and", symbol: "AND", label: "Logical AND", type: "logical" },
  { id: "or", symbol: "OR", label: "Logical OR", type: "logical" },
  { id: "add", symbol: "+", label: "Add", type: "arithmetic" },
  { id: "sub", symbol: "−", label: "Subtract", type: "arithmetic" },
  { id: "mul", symbol: "×", label: "Multiply", type: "arithmetic" },
  { id: "div", symbol: "÷", label: "Divide", type: "arithmetic" },
];

export const CATEGORY_COLORS: Record<VariableCategory, { bg: string; text: string; border: string }> = {
  weather: { bg: "bg-blue-500/10", text: "text-blue-600 dark:text-blue-400", border: "border-blue-500/30" },
  equipment: { bg: "bg-amber-500/10", text: "text-amber-600 dark:text-amber-400", border: "border-amber-500/30" },
  grid: { bg: "bg-purple-500/10", text: "text-purple-600 dark:text-purple-400", border: "border-purple-500/30" },
  provider: { bg: "bg-chart-3/10", text: "text-chart-3", border: "border-chart-3/30" },
};

export const OPERATOR_COLORS: Record<OperatorType, { bg: string; text: string; border: string }> = {
  comparison: { bg: "bg-orange-500/10", text: "text-orange-600 dark:text-orange-400", border: "border-orange-500/30" },
  logical: { bg: "bg-red-500/10", text: "text-red-600 dark:text-red-400", border: "border-red-500/30" },
  arithmetic: { bg: "bg-cyan-500/10", text: "text-cyan-600 dark:text-cyan-400", border: "border-cyan-500/30" },
};

export const SEVERITY_OPTIONS: { value: Severity; label: string; color: string }[] = [
  { value: "critical", label: "Critical", color: "bg-red-500" },
  { value: "high", label: "High", color: "bg-orange-500" },
  { value: "medium", label: "Medium", color: "bg-amber-500" },
  { value: "low", label: "Low", color: "bg-blue-500" },
  { value: "info", label: "Info", color: "bg-muted-foreground" },
];

export const SAMPLE_VERSIONS: RuleVersion[] = [
  { 
    version: 3, 
    savedAt: "2026-02-11 12:30", 
    savedBy: "Rajiv Sharma", 
    changeNote: "Added wind gust condition", 
    nodeCount: 7,
    nodes: [
      { id: "n1", type: "variable", variableId: "temp", label: "Temperature" },
      { id: "n2", type: "operator", operatorId: "gt", label: ">" },
      { id: "n3", type: "value", value: 44, label: "44" },
      { id: "n4", type: "operator", operatorId: "and", label: "AND" },
      { id: "n5", type: "variable", variableId: "wind_speed", label: "Wind Speed" },
      { id: "n6", type: "operator", operatorId: "gt", label: ">" },
      { id: "n7", type: "value", value: 55, label: "55" },
    ],
    severity: "critical"
  },
  { 
    version: 2, 
    savedAt: "2026-02-10 16:45", 
    savedBy: "Rajiv Sharma", 
    changeNote: "Changed threshold from 40 to 44°C", 
    nodeCount: 5,
    nodes: [
      { id: "n1", type: "variable", variableId: "temp", label: "Temperature" },
      { id: "n2", type: "operator", operatorId: "gt", label: ">" },
      { id: "n3", type: "value", value: 44, label: "44" },
    ],
    severity: "high"
  },
  { 
    version: 1, 
    savedAt: "2026-02-09 09:15", 
    savedBy: "Priya Mehta", 
    changeNote: "Initial rule creation", 
    nodeCount: 3,
    nodes: [
      { id: "n1", type: "variable", variableId: "temp", label: "Temperature" },
      { id: "n2", type: "operator", operatorId: "gt", label: ">" },
      { id: "n3", type: "value", value: 40, label: "40" },
    ],
    severity: "medium"
  },
];

// Prebuilt Templates
export const RULE_TEMPLATES: RuleTemplate[] = [
  {
    id: "high_wind",
    name: "High Wind Advisory",
    description: "Triggers when sustained wind speed exceeds 55 km/h for turbine curtailment",
    category: "weather",
    icon: "💨",
    riskScore: 75,
    severity: "high",
    nodes: [
      { id: "t1", type: "variable", variableId: "wind_speed", label: "Wind Speed" },
      { id: "t2", type: "operator", operatorId: "gt", label: ">" },
      { id: "t3", type: "value", value: 55, label: "55" },
    ],
  },
  {
    id: "heavy_rain",
    name: "Heavy Rainfall Alert",
    description: "Triggers when rainfall exceeds 50mm/hr indicating flood risk",
    category: "weather",
    icon: "🌧️",
    riskScore: 85,
    severity: "critical",
    nodes: [
      { id: "t1", type: "variable", variableId: "rainfall", label: "Rainfall" },
      { id: "t2", type: "operator", operatorId: "gt", label: ">" },
      { id: "t3", type: "value", value: 50, label: "50" },
    ],
  },
  {
    id: "temp_spike",
    name: "Temperature Spike Warning",
    description: "Triggers when temperature exceeds 44°C affecting transformer cooling",
    category: "weather",
    icon: "🌡️",
    riskScore: 80,
    severity: "high",
    nodes: [
      { id: "t1", type: "variable", variableId: "temp", label: "Temperature" },
      { id: "t2", type: "operator", operatorId: "gt", label: ">" },
      { id: "t3", type: "value", value: 44, label: "44" },
    ],
  },
  {
    id: "transformer_overheat",
    name: "Transformer Overheating",
    description: "Triggers when transformer oil temperature exceeds safe limits",
    category: "equipment",
    icon: "⚡",
    riskScore: 90,
    severity: "critical",
    nodes: [
      { id: "t1", type: "variable", variableId: "tfr_oil_temp", label: "Transformer Oil Temp" },
      { id: "t2", type: "operator", operatorId: "gt", label: ">" },
      { id: "t3", type: "value", value: 85, label: "85" },
    ],
  },
];

// Sample audit log
export const SAMPLE_AUDIT_LOG: AuditLogEntry[] = [
  { timestamp: "2026-02-11 12:30", user: "Rajiv Sharma", action: "modified", details: "Added wind gust condition to rule logic", version: 3 },
  { timestamp: "2026-02-11 11:45", user: "Rajiv Sharma", action: "tested", details: "Ran simulation on last 30 days - 12 triggers detected" },
  { timestamp: "2026-02-10 16:45", user: "Rajiv Sharma", action: "modified", details: "Updated temperature threshold from 40°C to 44°C", version: 2 },
  { timestamp: "2026-02-10 16:30", user: "Rajiv Sharma", action: "enabled", details: "Rule enabled for production monitoring" },
  { timestamp: "2026-02-10 09:20", user: "Priya Mehta", action: "tested", details: "Validation test passed with 8 triggers in test period" },
  { timestamp: "2026-02-09 09:15", user: "Priya Mehta", action: "created", details: "Initial rule created with temperature threshold", version: 1 },
];

// Sample dependencies
export const SAMPLE_DEPENDENCIES: RuleDependency[] = [
  { ruleId: "rule-002", ruleName: "Extreme Heat Warning", type: "uses_same_variable", severity: "info" },
  { ruleId: "rule-005", ruleName: "Grid Overload Alert", type: "conflicts", severity: "warning" },
  { ruleId: "rule-008", ruleName: "Weather Station Online Check", type: "prerequisite", severity: "error" },
];