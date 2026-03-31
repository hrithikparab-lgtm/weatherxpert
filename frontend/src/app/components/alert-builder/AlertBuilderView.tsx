import { useState, useCallback, useMemo } from "react";
import {
  Save,
  ShieldCheck,
  Lock,
  ChevronDown,
  ChevronRight,
  Settings2,
  Layers,
  FlaskConical,
  History,
  X,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Info,
  Gauge,
  LineChart,
  GitCompare,
  ClipboardList,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { RuleToolbox } from "./RuleToolbox";
import { RuleCanvas } from "./RuleCanvas";
import { RuleConfig } from "./RuleConfig";
import { SimulationPanel } from "./SimulationPanel";
import { VersionHistory } from "./VersionHistory";
import {
  type RuleNode,
  type Variable,
  type Operator,
  type Severity,
  type NotificationTarget,
  type ScheduleWindow,
  type RuleVersion,
  type RuleTemplate,
  type RuleDependency,
  type AuditLogEntry,
  VARIABLES,
  OPERATORS,
  SAMPLE_VERSIONS,
  RULE_TEMPLATES,
  SAMPLE_DEPENDENCIES,
  SAMPLE_AUDIT_LOG,
} from "./builderTypes";

/* ═══════════════════════════════════════════════════
   ALERT BUILDER VIEW — Visual equation-based alert
   builder. Left toolbox · Center canvas · Right config
   Form-first with visual blocks
   ═══════════════════════════════════════════════════ */

interface AlertBuilderViewProps {
  canEdit: boolean;
  canConfigure: boolean;
}

// Initial sample nodes for demo
const INITIAL_NODES: RuleNode[] = [
  { id: "n1", type: "variable", variableId: "temp", label: "Temperature" },
  { id: "n2", type: "operator", operatorId: "gt", label: ">" },
  { id: "n3", type: "value", value: 44, label: "44" },
  { id: "n4", type: "operator", operatorId: "and", label: "AND" },
  { id: "n5", type: "variable", variableId: "wind_speed", label: "Wind Speed" },
  { id: "n6", type: "operator", operatorId: "gt", label: ">" },
  { id: "n7", type: "value", value: 55, label: "55" },
];

const INITIAL_NOTIFICATIONS: NotificationTarget[] = [
  { id: "nt1", type: "email", value: "ops-critical@tatapower.com", label: "ops-critical@tatapower.com" },
  { id: "nt2", type: "sms", value: "+91 98765 43210", label: "+91 98765 43210" },
  { id: "nt3", type: "group", value: "Mumbai Ops Team", label: "Mumbai Ops Team" },
];

type RightTab = "config" | "simulation" | "versions" | "dependencies" | "audit";

export function AlertBuilderView({ canEdit, canConfigure }: AlertBuilderViewProps) {
  // Rule state
  const [nodes, setNodes] = useState<RuleNode[]>(INITIAL_NODES);
  const [ruleName, setRuleName] = useState("Heat Wave + High Wind Alert");
  const [ruleDescription, setRuleDescription] = useState("Triggers when temperature exceeds 44°C AND wind speed exceeds 55 km/h. Applies to all thermal plants.");
  const [severity, setSeverity] = useState<Severity>("critical");
  const [notifications, setNotifications] = useState<NotificationTarget[]>(INITIAL_NOTIFICATIONS);
  const [schedule, setSchedule] = useState<ScheduleWindow>({
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    startTime: "00:00",
    endTime: "23:59",
    timezone: "Asia/Kolkata",
  });
  const [versions, setVersions] = useState<RuleVersion[]>(SAMPLE_VERSIONS);
  const [ruleEnabled, setRuleEnabled] = useState(true);
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>(SAMPLE_AUDIT_LOG);
  const [dependencies, setDependencies] = useState<RuleDependency[]>(SAMPLE_DEPENDENCIES);

  // UI state
  const [rightTab, setRightTab] = useState<RightTab>("config");
  const [toolboxOpen, setToolboxOpen] = useState(true);
  const [saveNote, setSaveNote] = useState("");
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [mobileToolboxOpen, setMobileToolboxOpen] = useState(false);
  const [mobileRightOpen, setMobileRightOpen] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showRiskMeter, setShowRiskMeter] = useState(true);
  const [compareVersion, setCompareVersion] = useState<number | null>(null);

  // Validation
  const validationErrors = useMemo(() => {
    const errors: string[] = [];
    if (nodes.length === 0) return errors;

    const hasVar = nodes.some((n) => n.type === "variable");
    const hasOp = nodes.some((n) => n.type === "operator");
    const hasVal = nodes.some((n) => n.type === "value");

    if (!hasVar) errors.push("Rule needs at least one variable");
    if (!hasOp) errors.push("Rule needs at least one operator");
    if (!hasVal) errors.push("Rule needs at least one comparison value");

    // Check parentheses balance
    const opens = nodes.filter((n) => n.type === "group" && n.label === "(").length;
    const closes = nodes.filter((n) => n.type === "group" && n.label === ")").length;
    if (opens !== closes) errors.push("Parentheses are not balanced");

    // Check consecutive operators
    for (let i = 1; i < nodes.length; i++) {
      if (nodes[i].type === "operator" && nodes[i - 1].type === "operator") {
        errors.push("Cannot have consecutive operators");
        break;
      }
    }

    return errors;
  }, [nodes]);

  // Risk Score calculation
  const riskScore = useMemo(() => {
    let score = 50; // Base score
    
    // Add points based on severity
    const severityPoints = { critical: 40, high: 30, medium: 20, low: 10, info: 5 };
    score += severityPoints[severity];
    
    // Add points for complexity
    score += Math.min(nodes.length * 2, 20);
    
    // Reduce for validation errors
    const errors = validationErrors.length;
    score -= errors * 10;
    
    return Math.max(0, Math.min(100, score));
  }, [severity, nodes, validationErrors]);

  // Dependency validation
  const dependencyIssues = useMemo(() => {
    return dependencies.filter(d => d.severity === "error" || d.severity === "warning");
  }, [dependencies]);

  // Handlers
  const addVariable = useCallback((v: Variable) => {
    const node: RuleNode = {
      id: `node-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      type: "variable",
      variableId: v.id,
      label: v.label,
    };
    setNodes((prev) => [...prev, node]);
  }, []);

  const addOperator = useCallback((o: Operator) => {
    const node: RuleNode = {
      id: `node-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      type: "operator",
      operatorId: o.id,
      label: o.symbol,
    };
    setNodes((prev) => [...prev, node]);
  }, []);

  const addValue = useCallback(() => {
    const node: RuleNode = {
      id: `node-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      type: "value",
      value: 0,
      label: "0",
    };
    setNodes((prev) => [...prev, node]);
  }, []);

  const handleSave = () => {
    const newVersion: RuleVersion = {
      version: versions.length > 0 ? versions[0].version + 1 : 1,
      savedAt: new Date().toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
      savedBy: "Current User",
      changeNote: saveNote || "Updated rule",
      nodeCount: nodes.length,
    };
    setVersions([newVersion, ...versions]);
    setSaveNote("");
    setShowSaveDialog(false);
  };

  const handleRollback = (version: number) => {
    // In production: restore nodes from version snapshot
    // For demo: just show the action
    const v = versions.find((x) => x.version === version);
    if (v) {
      setVersions([
        {
          version: versions[0].version + 1,
          savedAt: new Date().toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }),
          savedBy: "Current User",
          changeNote: `Rolled back to v${version}`,
          nodeCount: v.nodeCount,
        },
        ...versions,
      ]);
    }
  };

  // Read-only guard for non-admins
  if (!canConfigure) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mb-4">
          <Lock className="w-7 h-7 text-muted-foreground" />
        </div>
        <h3 className="text-[15px] text-foreground mb-1">Access Restricted</h3>
        <p className="text-[13px] text-muted-foreground max-w-sm">
          Alert rule configuration requires Admin or Super Admin permissions.
          Contact your administrator to request access.
        </p>
      </div>
    );
  }

  const RIGHT_TABS: { id: RightTab; label: string; icon: React.ElementType }[] = [
    { id: "config", label: "Config", icon: Settings2 },
    { id: "simulation", label: "Test", icon: FlaskConical },
    { id: "versions", label: "Versions", icon: History },
    { id: "dependencies", label: "Dependencies", icon: GitCompare },
    { id: "audit", label: "Audit", icon: ClipboardList },
  ];

  return (
    <div className="space-y-4">
      {/* ── Top Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-border bg-card">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-primary/10 ring-1 ring-primary/20 flex items-center justify-center flex-shrink-0">
            <Layers className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-[15px] text-foreground font-medium truncate">{ruleName || "Untitled Rule"}</h3>
              <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold uppercase ${
                ruleEnabled ? "bg-chart-3/10 text-chart-3" : "bg-secondary text-muted-foreground"
              }`}>
                {ruleEnabled ? "Active" : "Disabled"}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground truncate">{ruleDescription || "No description"}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Enable toggle */}
          <button
            onClick={() => setRuleEnabled(!ruleEnabled)}
            className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${
              ruleEnabled ? "bg-chart-3" : "bg-muted"
            }`}
          >
            <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
              ruleEnabled ? "left-5.5" : "left-0.5"
            }`} />
          </button>

          {/* Save */}
          {canEdit && (
            <button
              onClick={() => setShowSaveDialog(true)}
              disabled={validationErrors.length > 0 && nodes.length > 0}
              className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-[12px] font-medium hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Save className="w-3.5 h-3.5" />
              Save Rule
            </button>
          )}
        </div>
      </div>

      {/* Mobile toolbox/right toggles */}
      <div className="flex lg:hidden gap-2">
        <button
          onClick={() => { setMobileToolboxOpen(true); setMobileRightOpen(false); }}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-secondary border border-border rounded-xl text-[12px] text-foreground font-medium"
        >
          <Layers className="w-3.5 h-3.5" />
          Toolbox
        </button>
        <button
          onClick={() => { setMobileRightOpen(true); setMobileToolboxOpen(false); }}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-secondary border border-border rounded-xl text-[12px] text-foreground font-medium"
        >
          <Settings2 className="w-3.5 h-3.5" />
          Config & Test
        </button>
      </div>

      {/* ── 3-Column Layout ── */}
      <div className="flex gap-4 items-start">
        {/* LEFT: Toolbox (desktop) */}
        <div className={`hidden lg:block w-[260px] flex-shrink-0 rounded-xl border border-border bg-card overflow-hidden transition-all duration-200 ${
          toolboxOpen ? "max-h-[800px]" : "max-h-[44px]"
        }`}>
          <button
            onClick={() => setToolboxOpen(!toolboxOpen)}
            className="w-full flex items-center justify-between px-3 py-2.5 border-b border-border/50 hover:bg-secondary/30 transition-colors"
          >
            <span className="text-[11px] text-foreground font-semibold uppercase tracking-wider">Toolbox</span>
            <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${toolboxOpen ? "" : "-rotate-90"}`} />
          </button>
          {toolboxOpen && (
            <div className="max-h-[700px] overflow-y-auto">
              <RuleToolbox
                onAddVariable={addVariable}
                onAddOperator={addOperator}
                onAddValue={addValue}
              />
            </div>
          )}
        </div>

        {/* CENTER: Canvas */}
        <div className="flex-1 min-w-0 rounded-xl border border-border bg-card p-4 space-y-4">
          <RuleCanvas
            nodes={nodes}
            onUpdate={setNodes}
            validationErrors={validationErrors}
          />

          {/* Validation status */}
          {nodes.length > 0 && validationErrors.length === 0 && (
            <div className="flex items-center gap-1.5 text-[11px] text-chart-3 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              Rule is valid and ready to save
            </div>
          )}
        </div>

        {/* RIGHT: Config / Simulation / Versions (desktop) */}
        <div className="hidden lg:block w-[300px] flex-shrink-0 rounded-xl border border-border bg-card overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-border">
            {RIGHT_TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setRightTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-1 px-2 py-2.5 text-[11px] font-medium transition-all ${
                    rightTab === tab.id
                      ? "text-primary border-b-2 border-primary bg-primary/5"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div className="p-4 max-h-[700px] overflow-y-auto">
            {rightTab === "config" && (
              <RuleConfig
                ruleName={ruleName}
                onNameChange={setRuleName}
                ruleDescription={ruleDescription}
                onDescriptionChange={setRuleDescription}
                severity={severity}
                onSeverityChange={setSeverity}
                notifications={notifications}
                onNotificationsChange={setNotifications}
                schedule={schedule}
                onScheduleChange={setSchedule}
              />
            )}
            {rightTab === "simulation" && (
              <SimulationPanel nodes={nodes} severity={severity} />
            )}
            {rightTab === "versions" && (
              <VersionHistory
                versions={versions}
                onRollback={handleRollback}
                canEdit={canEdit}
              />
            )}
            {rightTab === "dependencies" && (
              <div className="space-y-4">
                <h4 className="text-[13px] text-foreground font-medium">Dependencies</h4>
                <div className="space-y-2">
                  {dependencies.map(d => (
                    <div key={d.id} className={`flex items-center gap-2 ${d.severity === "error" ? "text-red-500" : d.severity === "warning" ? "text-yellow-500" : "text-muted-foreground"}`}>
                      <Info className="w-3.5 h-3.5" />
                      {d.description}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {rightTab === "audit" && (
              <div className="space-y-4">
                <h4 className="text-[13px] text-foreground font-medium">Audit Log</h4>
                <div className="space-y-2">
                  {auditLog.map(log => (
                    <div key={log.id} className="flex items-center gap-2 text-muted-foreground">
                      <FileText className="w-3.5 h-3.5" />
                      {log.message} — {log.timestamp}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile Toolbox Drawer ── */}
      {mobileToolboxOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileToolboxOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-card border-t border-border rounded-t-2xl shadow-xl max-h-[70vh] flex flex-col animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h3 className="text-[14px] text-foreground font-medium">Toolbox</h3>
              <button onClick={() => setMobileToolboxOpen(false)} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <RuleToolbox
                onAddVariable={(v) => { addVariable(v); }}
                onAddOperator={(o) => { addOperator(o); }}
                onAddValue={() => { addValue(); }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Mobile Config/Test Drawer ── */}
      {mobileRightOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileRightOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-card border-t border-border rounded-t-2xl shadow-xl max-h-[80vh] flex flex-col animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="flex gap-1">
                {RIGHT_TABS.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setRightTab(tab.id)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                        rightTab === tab.id
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground"
                      }`}
                    >
                      <Icon className="w-3 h-3" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
              <button onClick={() => setMobileRightOpen(false)} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {rightTab === "config" && (
                <RuleConfig
                  ruleName={ruleName}
                  onNameChange={setRuleName}
                  ruleDescription={ruleDescription}
                  onDescriptionChange={setRuleDescription}
                  severity={severity}
                  onSeverityChange={setSeverity}
                  notifications={notifications}
                  onNotificationsChange={setNotifications}
                  schedule={schedule}
                  onScheduleChange={setSchedule}
                />
              )}
              {rightTab === "simulation" && (
                <SimulationPanel nodes={nodes} severity={severity} />
              )}
              {rightTab === "versions" && (
                <VersionHistory
                  versions={versions}
                  onRollback={handleRollback}
                  canEdit={canEdit}
                />
              )}
              {rightTab === "dependencies" && (
                <div className="space-y-4">
                  <h4 className="text-[13px] text-foreground font-medium">Dependencies</h4>
                  <div className="space-y-2">
                    {dependencies.map(d => (
                      <div key={d.id} className={`flex items-center gap-2 ${d.severity === "error" ? "text-red-500" : d.severity === "warning" ? "text-yellow-500" : "text-muted-foreground"}`}>
                        <Info className="w-3.5 h-3.5" />
                        {d.description}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {rightTab === "audit" && (
                <div className="space-y-4">
                  <h4 className="text-[13px] text-foreground font-medium">Audit Log</h4>
                  <div className="space-y-2">
                    {auditLog.map(log => (
                      <div key={log.id} className="flex items-center gap-2 text-muted-foreground">
                        <FileText className="w-3.5 h-3.5" />
                        {log.message} — {log.timestamp}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Save Dialog ── */}
      {showSaveDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowSaveDialog(false)} />
          <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-sm p-5 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary/10 ring-1 ring-primary/20 flex items-center justify-center">
                <Save className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h3 className="text-[14px] text-foreground font-medium">Save Rule Version</h3>
                <p className="text-[11px] text-muted-foreground">
                  v{versions.length > 0 ? versions[0].version + 1 : 1} · {nodes.length} nodes
                </p>
              </div>
            </div>
            <textarea
              value={saveNote}
              onChange={(e) => setSaveNote(e.target.value)}
              placeholder="Change note (e.g. 'Added wind condition')..."
              rows={3}
              className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-lg text-[12px] text-foreground outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/50 resize-none"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowSaveDialog(false)}
                className="flex-1 py-2 bg-secondary border border-border rounded-lg text-[12px] text-foreground font-medium hover:bg-secondary/80 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg text-[12px] font-medium hover:bg-primary/90 transition-colors shadow-sm"
              >
                Save v{versions.length > 0 ? versions[0].version + 1 : 1}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}